import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  Node,
  type ObjectLiteralExpression,
  type SourceFile,
  SyntaxKind,
  VariableDeclarationKind,
} from "ts-morph";
import {
  findConfigFile,
  findExportedObject,
  getOrCreateNestedObject,
  loadSourceFile,
  setObjectProperty,
} from "../core/ast.js";
import {
  hasDependency,
  pathExists,
  savePackageJson,
} from "../core/project.js";
import type {
  Diagnostic,
  FrameworkAdapter,
  ProjectContext,
} from "../core/types.js";
import {
  getStringProperty,
  validateViteProject,
} from "./vite-config.js";

const viteConfigNames = [
  "vite.config.ts",
  "vite.config.mts",
  "vite.config.mjs",
  "vite.config.js",
];
const svelteConfigNames = [
  "svelte.config.ts",
  "svelte.config.mts",
  "svelte.config.mjs",
  "svelte.config.js",
];
const rootLayoutNames = [
  "src/routes/+layout.ts",
  "src/routes/+layout.js",
];
const staticAdapterPackage = "@sveltejs/adapter-static";

interface ActiveConfig {
  config?: ObjectLiteralExpression;
  kind: "svelte-config" | "vite";
  sourceFile: SourceFile;
  target?: ObjectLiteralExpression;
}

export const svelteKitAdapter: FrameworkAdapter = {
  id: "sveltekit",
  label: "SvelteKit",

  detect(project) {
    return hasDependency(project, "@sveltejs/kit");
  },

  async resolveWebDir(project) {
    const active = await findActiveConfig(project);
    return resolveStaticOutputDir(active);
  },

  async validate(project) {
    const diagnostics: Diagnostic[] = [...validateViteProject(project)];

    try {
      const active = await findActiveConfig(project);
      validateActiveConfig(active);
      resolveStaticOutputDir(active);
    } catch (error) {
      diagnostics.push({
        level: "error",
        message: error instanceof Error ? error.message : String(error),
      });
    }

    const rootLayoutPath = await findConfigFile(project.root, rootLayoutNames);
    if (rootLayoutPath) {
      const sourceFile = loadSourceFile(rootLayoutPath);
      const ssr = sourceFile.getVariableDeclaration("ssr");
      if (ssr && !ssr.getVariableStatement()?.isExported()) {
        diagnostics.push({
          level: "error",
          message:
            'Cannot safely update the root SvelteKit layout because "ssr" is not exported.',
        });
      }
    }

    const serverFiles = await findServerRouteFiles(project.root);
    if (serverFiles.length > 0) {
      diagnostics.push({
        level: "warning",
        message: `Detected SvelteKit server route files that will not run inside the Capacitor app: ${serverFiles.slice(0, 3).join(", ")}${serverFiles.length > 3 ? ", ..." : ""}`,
      });
    }

    return diagnostics;
  },

  async configure(project, dryRun) {
    const active = await findActiveConfig(project);
    const target = getEditableTarget(active);

    configureStaticAdapter(active.sourceFile, target);
    await configureRootLayout(project, dryRun);
    configureAdapterDependency(project);

    if (!dryRun) {
      await active.sourceFile.save();
    }
    await savePackageJson(project, dryRun);

    return {
      disclaimers: [
        {
          title:
            "SvelteKit server features do not run inside the Capacitor app.",
          details: [
            "Move +page.server, +layout.server, +server, form actions, and remote functions to a deployed backend.",
            "Runtime SSR is disabled and the mobile build is served through a client-rendered SPA fallback.",
            "Configure the mobile app to call an HTTPS API URL that is reachable from the device.",
            'Do not use "localhost" for the backend URL: on a phone or emulator, it points to the device itself.',
          ],
        },
      ],
    };
  },
};

async function findActiveConfig(project: ProjectContext): Promise<ActiveConfig> {
  const viteConfigPath = await findConfigFile(project.root, viteConfigNames);
  if (!viteConfigPath) {
    throw new Error("Could not find a SvelteKit Vite configuration file.");
  }

  const viteSourceFile = loadSourceFile(viteConfigPath);
  const svelteKitCall = findSvelteKitCall(viteSourceFile);
  if (!svelteKitCall) {
    throw new Error(
      "Could not find sveltekit() in the Vite configuration file.",
    );
  }

  const argument = svelteKitCall.getArguments()[0];
  if (argument) {
    if (!Node.isObjectLiteralExpression(argument)) {
      throw new Error(
        "Cannot safely update sveltekit() because its configuration is not an object literal.",
      );
    }
    return {
      config: argument,
      kind: "vite",
      sourceFile: viteSourceFile,
      target: argument,
    };
  }

  const svelteConfigPath = await findConfigFile(project.root, svelteConfigNames);
  if (svelteConfigPath) {
    const sourceFile = loadSourceFile(svelteConfigPath);
    const config = findExportedObject(sourceFile);
    if (!config) {
      throw new Error(
        "The existing SvelteKit config is too dynamic to update safely. Export a config object before running Capstart.",
      );
    }
    return {
      config,
      kind: "svelte-config",
      sourceFile,
      target: getOptionalObjectProperty(config, "kit"),
    };
  }

  return {
    kind: "vite",
    sourceFile: viteSourceFile,
  };
}

function findSvelteKitCall(sourceFile: SourceFile) {
  const names = new Set(
    sourceFile
      .getImportDeclarations()
      .filter(
        (declaration) =>
          declaration.getModuleSpecifierValue() === "@sveltejs/kit/vite",
      )
      .flatMap((declaration) =>
        declaration
          .getNamedImports()
          .filter((namedImport) => namedImport.getName() === "sveltekit")
          .map(
            (namedImport) =>
              namedImport.getAliasNode()?.getText() ?? namedImport.getName(),
          ),
      ),
  );

  return sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((call) => names.has(call.getExpression().getText()));
}

function getEditableTarget(active: ActiveConfig): ObjectLiteralExpression {
  if (active.kind === "svelte-config") {
    if (!active.config) {
      throw new Error("Could not find the SvelteKit configuration object.");
    }
    return getOrCreateNestedObject(active.config, "kit");
  }

  if (active.target) {
    return active.target;
  }

  const call = findSvelteKitCall(active.sourceFile);
  if (!call) {
    throw new Error("Could not find sveltekit() in the Vite config.");
  }
  call.addArgument("{}");
  const argument = call.getArguments()[0];
  if (!Node.isObjectLiteralExpression(argument)) {
    throw new Error("Could not create the SvelteKit configuration object.");
  }
  return argument;
}

function validateActiveConfig(active: ActiveConfig): void {
  const adapterImports = getAdapterImports(active.sourceFile);
  if (adapterImports.length > 1) {
    throw new Error(
      "The SvelteKit config imports multiple adapters and is too dynamic to update safely.",
    );
  }
  if (adapterImports[0] && !adapterImports[0].getDefaultImport()) {
    throw new Error(
      "The configured SvelteKit adapter does not use a default import.",
    );
  }

  if (active.kind === "svelte-config" && active.config && !active.target) {
    const kitProperty = active.config.getProperty("kit");
    if (kitProperty) {
      throw new Error(
        'Cannot safely merge the SvelteKit "kit" configuration property.',
      );
    }
  }

  const target = active.target;
  const adapterProperty = target?.getProperty("adapter");
  if (!adapterProperty) {
    return;
  }
  if (!Node.isPropertyAssignment(adapterProperty)) {
    throw new Error(
      'Cannot safely update the SvelteKit "adapter" configuration property.',
    );
  }

  const adapterCall = adapterProperty.getInitializer();
  if (!Node.isCallExpression(adapterCall)) {
    throw new Error(
      'Cannot safely update the SvelteKit "adapter" configuration property.',
    );
  }

  const adapterImport = adapterImports[0];
  if (
    !adapterImport ||
    adapterCall.getExpression().getText() !==
      adapterImport.getDefaultImport()?.getText()
  ) {
    throw new Error(
      "The configured SvelteKit adapter is too dynamic to replace safely.",
    );
  }

  if (adapterImport.getModuleSpecifierValue() === staticAdapterPackage) {
    const options = adapterCall.getArguments()[0];
    if (options && !Node.isObjectLiteralExpression(options)) {
      throw new Error(
        "Cannot safely update adapter-static because its options are not an object literal.",
      );
    }
  }
}

function configureStaticAdapter(
  sourceFile: SourceFile,
  target: ObjectLiteralExpression,
): void {
  const adapterImports = getAdapterImports(sourceFile);
  if (adapterImports.length > 1) {
    throw new Error(
      "The SvelteKit config imports multiple adapters and is too dynamic to update safely.",
    );
  }

  const existingImport = adapterImports[0];
  const wasStatic =
    existingImport?.getModuleSpecifierValue() === staticAdapterPackage;
  const removeAutoComments =
    existingImport?.getModuleSpecifierValue() === "@sveltejs/adapter-auto";
  let adapterName = existingImport?.getDefaultImport()?.getText();

  if (existingImport) {
    if (!adapterName) {
      throw new Error(
        "The configured SvelteKit adapter does not use a default import.",
      );
    }
    existingImport.setModuleSpecifier(staticAdapterPackage);
  } else {
    adapterName = chooseAdapterName(sourceFile);
    sourceFile.addImportDeclaration({
      defaultImport: adapterName,
      moduleSpecifier: staticAdapterPackage,
    });
  }

  if (!adapterName) {
    throw new Error("Could not configure the SvelteKit static adapter.");
  }

  const adapterProperty = target.getProperty("adapter");
  if (!adapterProperty || !wasStatic) {
    setObjectProperty(
      target,
      "adapter",
      `${adapterName}({ fallback: "index.html" })`,
    );
    if (removeAutoComments) {
      removeAdapterAutoComments(sourceFile, target);
    }
    return;
  }

  if (!Node.isPropertyAssignment(adapterProperty)) {
    throw new Error(
      'Cannot safely update the SvelteKit "adapter" configuration property.',
    );
  }
  const adapterCall = adapterProperty.getInitializer();
  if (!Node.isCallExpression(adapterCall)) {
    throw new Error(
      'Cannot safely update the SvelteKit "adapter" configuration property.',
    );
  }
  adapterCall.getExpression().replaceWithText(adapterName);

  let options = adapterCall.getArguments()[0];
  if (!options) {
    adapterCall.addArgument("{}");
    options = adapterCall.getArguments()[0];
  }
  if (!Node.isObjectLiteralExpression(options)) {
    throw new Error(
      "Cannot safely update adapter-static because its options are not an object literal.",
    );
  }
  setObjectProperty(options, "fallback", '"index.html"');
}

function removeAdapterAutoComments(
  sourceFile: SourceFile,
  target: ObjectLiteralExpression,
): void {
  const adapterProperty = target.getProperty("adapter");
  if (!adapterProperty) {
    return;
  }

  const staleComments = adapterProperty
    .getLeadingCommentRanges()
    .filter((comment) => {
      const text = comment.getText();
      return (
        text.includes("adapter-auto only supports") ||
        text.includes("If your environment is not supported") ||
        text.includes("See https://svelte.dev/docs/kit/adapters")
      );
    });
  const text = sourceFile.getFullText();
  const lineRanges = staleComments.map((comment) => {
    const start = text.lastIndexOf("\n", comment.getPos() - 1) + 1;
    const newline = text.indexOf("\n", comment.getEnd());
    return [start, newline === -1 ? comment.getEnd() : newline + 1] as [
      number,
      number,
    ];
  });

  for (const range of lineRanges.reverse()) {
    sourceFile.replaceText(range, "");
  }
}

function chooseAdapterName(sourceFile: SourceFile): string {
  const identifiers = new Set(
    sourceFile
      .getDescendantsOfKind(SyntaxKind.Identifier)
      .map((identifier) => identifier.getText()),
  );
  return identifiers.has("adapter") ? "staticAdapter" : "adapter";
}

function getAdapterImports(sourceFile: SourceFile) {
  return sourceFile.getImportDeclarations().filter((declaration) => {
    const specifier = declaration.getModuleSpecifierValue();
    return specifier.startsWith("@sveltejs/adapter-");
  });
}

function resolveStaticOutputDir(active: ActiveConfig): string {
  const adapterImport = getAdapterImports(active.sourceFile)[0];
  if (
    !active.target ||
    adapterImport?.getModuleSpecifierValue() !== staticAdapterPackage
  ) {
    return "build";
  }

  const adapterProperty = active.target.getProperty("adapter");
  if (!Node.isPropertyAssignment(adapterProperty)) {
    return "build";
  }
  const adapterCall = adapterProperty.getInitializer();
  if (!Node.isCallExpression(adapterCall)) {
    return "build";
  }
  const options = adapterCall.getArguments()[0];
  if (!options) {
    return "build";
  }
  if (!Node.isObjectLiteralExpression(options)) {
    throw new Error(
      "Cannot resolve the SvelteKit output directory because adapter-static options are dynamic.",
    );
  }

  const pages = readOptionalStringProperty(options, "pages") ?? "build";
  const assets = readOptionalStringProperty(options, "assets") ?? pages;
  if (pages !== assets) {
    throw new Error(
      "Capacitor requires SvelteKit adapter-static pages and assets to use the same output directory.",
    );
  }
  return pages;
}

function readOptionalStringProperty(
  object: ObjectLiteralExpression,
  name: string,
): string | undefined {
  if (!object.getProperty(name)) {
    return undefined;
  }
  const value = getStringProperty(object, name);
  if (value === undefined) {
    throw new Error(
      `Cannot resolve the SvelteKit output directory because adapter-static "${name}" is dynamic.`,
    );
  }
  return value;
}

function getOptionalObjectProperty(
  object: ObjectLiteralExpression,
  name: string,
): ObjectLiteralExpression | undefined {
  const property = object.getProperty(name);
  if (!Node.isPropertyAssignment(property)) {
    return undefined;
  }
  const initializer = property.getInitializer();
  return Node.isObjectLiteralExpression(initializer) ? initializer : undefined;
}

async function configureRootLayout(
  project: ProjectContext,
  dryRun: boolean,
): Promise<void> {
  const rootLayoutPath = await findConfigFile(project.root, rootLayoutNames);
  if (!rootLayoutPath) {
    const routesDir = path.join(project.root, "src/routes");
    const extension = (await pathExists(path.join(project.root, "tsconfig.json")))
      ? "ts"
      : "js";
    if (!dryRun) {
      await mkdir(routesDir, { recursive: true });
      await writeFile(
        path.join(routesDir, `+layout.${extension}`),
        "export const ssr = false;\n",
      );
    }
    return;
  }

  const sourceFile = loadSourceFile(rootLayoutPath);
  const ssr = sourceFile.getVariableDeclaration("ssr");
  if (ssr) {
    if (!ssr.getVariableStatement()?.isExported()) {
      throw new Error(
        'Cannot safely update the root SvelteKit layout because "ssr" is not exported.',
      );
    }
    ssr.setInitializer("false");
  } else {
    sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name: "ssr", initializer: "false" }],
      isExported: true,
    });
  }

  if (!dryRun) {
    await sourceFile.save();
  }
}

function configureAdapterDependency(project: ProjectContext): void {
  const existingVersion =
    project.packageJson.devDependencies?.[staticAdapterPackage] ??
    project.packageJson.dependencies?.[staticAdapterPackage];

  for (const group of [
    project.packageJson.dependencies,
    project.packageJson.devDependencies,
  ]) {
    if (!group) {
      continue;
    }
    for (const dependency of Object.keys(group)) {
      if (dependency.startsWith("@sveltejs/adapter-")) {
        delete group[dependency];
      }
    }
  }

  project.packageJson.devDependencies ??= {};
  project.packageJson.devDependencies[staticAdapterPackage] =
    existingVersion ?? "^3.0.0";
}

async function findServerRouteFiles(root: string): Promise<string[]> {
  const routesRoot = path.join(root, "src/routes");
  if (!(await pathExists(routesRoot))) {
    return [];
  }

  const found: string[] = [];
  await walk(routesRoot, "");
  return found.sort();

  async function walk(directory: string, relative: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const relativePath = path.join(relative, entry.name);
      const absolutePath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath, relativePath);
      } else if (
        /^\+(?:page|layout)\.server\.(?:js|ts)$/.test(entry.name) ||
        /^\+server\.(?:js|ts)$/.test(entry.name)
      ) {
        found.push(path.join("src/routes", relativePath));
      }
    }
  }
}
