import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  findConfigFile,
  findExportedObject,
  getOrCreateNestedObject,
  loadSourceFile,
  setObjectProperty,
} from "../core/ast.js";
import { savePackageJson } from "../core/project.js";
import {
  capacitorScriptPrefix,
  packageScriptPrefix,
} from "../core/process.js";
import type {
  Platform,
  ProjectContext,
  SetupProfile,
} from "../core/types.js";

const configNames = [
  "capacitor.config.ts",
  "capacitor.config.mts",
  "capacitor.config.js",
  "capacitor.config.mjs",
  "capacitor.config.json",
];

interface ConfigureCapacitorOptions {
  appId: string;
  appName: string;
  dryRun: boolean;
  platforms: Platform[];
  safeArea: boolean;
  setup: SetupProfile;
  webDir: string;
}

export async function configureCapacitor(
  project: ProjectContext,
  options: ConfigureCapacitorOptions,
): Promise<void> {
  const configPath = await findConfigFile(project.root, configNames);

  if (!configPath) {
    if (!options.dryRun) {
      await writeFile(
        path.join(project.root, "capacitor.config.ts"),
        createCapacitorConfig(options),
      );
    }
  } else if (configPath.endsWith(".json")) {
    const config = JSON.parse(await readFile(configPath, "utf8")) as Record<
      string,
      unknown
    >;
    config.webDir = options.webDir;
    if (options.setup === "recommended") {
      applyRecommendedJsonConfig(config);
    }
    if (options.safeArea) {
      applySafeAreaJsonConfig(config);
    }
    if (!options.dryRun) {
      await writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    }
  } else {
    const sourceFile = loadSourceFile(configPath);
    const config = findExportedObject(sourceFile);
    if (!config) {
      throw new Error(
        `Cannot safely update the existing ${path.basename(configPath)}.`,
      );
    }
    setObjectProperty(config, "webDir", JSON.stringify(options.webDir));
    if (options.setup === "recommended") {
      applyRecommendedSourceConfig(sourceFile, config);
    }
    if (options.safeArea) {
      applySafeAreaSourceConfig(config);
    }
    if (!options.dryRun) {
      await sourceFile.save();
    }
  }

  project.packageJson.scripts ??= {};
  const run = packageScriptPrefix(project.packageManager);
  const cap = capacitorScriptPrefix(project.packageManager);
  project.packageJson.scripts["cap:sync"] = `${run} build && ${cap} sync`;

  for (const platform of options.platforms) {
    project.packageJson.scripts[`cap:${platform}`] =
      `${run} cap:sync && ${cap} open ${platform}`;
  }

  await savePackageJson(project, options.dryRun);
}

function createCapacitorConfig(options: ConfigureCapacitorOptions): string {
  const lines = ['import type { CapacitorConfig } from "@capacitor/cli";'];

  if (options.setup === "recommended") {
    lines.push(
      'import { KeyboardResize, KeyboardStyle } from "@capacitor/keyboard";',
    );
  }

  lines.push(
    "",
    "const config: CapacitorConfig = {",
    `  appId: ${JSON.stringify(options.appId)},`,
    `  appName: ${JSON.stringify(options.appName)},`,
    `  webDir: ${JSON.stringify(options.webDir)},`,
  );

  if (options.setup === "recommended" || options.safeArea) {
    lines.push("  plugins: {");
    if (options.safeArea) {
      lines.push(
        "    SystemBars: {",
        '      insetsHandling: "css",',
        "    },",
      );
    }
    if (options.setup === "recommended") {
      lines.push(
        "    Keyboard: {",
        "      resize: KeyboardResize.Native,",
        "      style: KeyboardStyle.Default,",
        "      resizeOnFullScreen: true,",
        "    },",
        "    SplashScreen: {",
        "      launchAutoHide: true,",
        "      launchShowDuration: 500,",
        "      launchFadeOutDuration: 200,",
        '      backgroundColor: "#ffffff",',
        "      showSpinner: false,",
        "    },",
      );
    }
    lines.push("  },");
  }

  lines.push("};", "", "export default config;", "");
  return lines.join("\n");
}

function applyRecommendedSourceConfig(
  sourceFile: ReturnType<typeof loadSourceFile>,
  config: NonNullable<ReturnType<typeof findExportedObject>>,
): void {
  const useEnumImports = sourceFile.getExportAssignments().length > 0;
  if (useEnumImports) {
    addNamedImports(sourceFile, "@capacitor/keyboard", [
      "KeyboardResize",
      "KeyboardStyle",
    ]);
  }

  const plugins = getOrCreateNestedObject(config, "plugins");
  const keyboard = getOrCreateNestedObject(plugins, "Keyboard");
  setObjectProperty(
    keyboard,
    "resize",
    useEnumImports ? "KeyboardResize.Native" : JSON.stringify("native"),
  );
  setObjectProperty(
    keyboard,
    "style",
    useEnumImports ? "KeyboardStyle.Default" : JSON.stringify("DEFAULT"),
  );
  setObjectProperty(keyboard, "resizeOnFullScreen", "true");

  const splashScreen = getOrCreateNestedObject(plugins, "SplashScreen");
  setObjectProperty(splashScreen, "launchAutoHide", "true");
  setObjectProperty(splashScreen, "launchShowDuration", "500");
  setObjectProperty(splashScreen, "launchFadeOutDuration", "200");
  setObjectProperty(splashScreen, "backgroundColor", JSON.stringify("#ffffff"));
  setObjectProperty(splashScreen, "showSpinner", "false");
}

function addNamedImports(
  sourceFile: ReturnType<typeof loadSourceFile>,
  moduleSpecifier: string,
  names: string[],
): void {
  const existingNames = new Set(
    sourceFile
      .getImportDeclarations()
      .filter(
        (declaration) =>
          declaration.getModuleSpecifierValue() === moduleSpecifier,
      )
      .flatMap((declaration) =>
        declaration
          .getNamedImports()
          .filter((namedImport) => !namedImport.getAliasNode())
          .map((namedImport) => namedImport.getName()),
      ),
  );
  const missingNames = names.filter((name) => !existingNames.has(name));
  if (missingNames.length > 0) {
    sourceFile.addImportDeclaration({
      moduleSpecifier,
      namedImports: missingNames,
    });
  }
}

function applyRecommendedJsonConfig(config: Record<string, unknown>): void {
  const plugins = getOrCreateRecord(config, "plugins");
  Object.assign(getOrCreateRecord(plugins, "Keyboard"), {
    resize: "native",
    style: "DEFAULT",
    resizeOnFullScreen: true,
  });
  Object.assign(getOrCreateRecord(plugins, "SplashScreen"), {
    launchAutoHide: true,
    launchShowDuration: 500,
    launchFadeOutDuration: 200,
    backgroundColor: "#ffffff",
    showSpinner: false,
  });
}

function applySafeAreaSourceConfig(
  config: NonNullable<ReturnType<typeof findExportedObject>>,
): void {
  const plugins = getOrCreateNestedObject(config, "plugins");
  const systemBars = getOrCreateNestedObject(plugins, "SystemBars");
  setObjectProperty(systemBars, "insetsHandling", JSON.stringify("css"));
}

function applySafeAreaJsonConfig(config: Record<string, unknown>): void {
  const plugins = getOrCreateRecord(config, "plugins");
  Object.assign(getOrCreateRecord(plugins, "SystemBars"), {
    insetsHandling: "css",
  });
}

function getOrCreateRecord(
  object: Record<string, unknown>,
  name: string,
): Record<string, unknown> {
  const value = object[name];
  if (value === undefined) {
    const created = {};
    object[name] = created;
    return created;
  }
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error(`Cannot safely merge the "${name}" configuration property.`);
}
