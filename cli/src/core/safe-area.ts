import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Node, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import {
  findConfigFile,
  findExportedObject,
  getOrCreateNestedObject,
  loadSourceFile,
  setObjectProperty,
} from "./ast.js";
import { pathExists } from "./project.js";
import type {
  FrameworkId,
  ProjectContext,
} from "./types.js";

const safeAreaMarker = "/* Capstart safe area insets */";
const safeAreaCss = [
  safeAreaMarker,
  "html {",
  "  padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));",
  "  padding-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));",
  "}",
  "",
].join("\n");

const globalCssCandidates: Record<FrameworkId, string[]> = {
  nextjs: [
    "src/app/globals.css",
    "app/globals.css",
    "src/styles/globals.css",
    "styles/globals.css",
    "src/index.css",
    "src/app.css",
  ],
  nuxt: [
    "app/assets/css/main.css",
    "app/assets/css/app.css",
    "app/assets/css/global.css",
    "app/assets/css/tailwind.css",
    "assets/css/main.css",
    "assets/css/app.css",
    "assets/css/global.css",
    "assets/css/tailwind.css",
  ],
  "react-vite": [
    "src/index.css",
    "src/app.css",
    "src/styles.css",
    "src/globals.css",
    "src/styles/globals.css",
  ],
  svelte: [
    "src/app.css",
    "src/style.css",
    "src/styles.css",
    "src/index.css",
    "src/global.css",
    "src/styles/globals.css",
  ],
  sveltekit: [
    "src/app.css",
    "src/routes/layout.css",
    "src/styles.css",
    "src/global.css",
    "src/styles/globals.css",
  ],
  "tanstack-start": [
    "src/styles.css",
    "src/index.css",
    "src/app.css",
    "src/globals.css",
    "src/styles/globals.css",
  ],
  vue: [
    "src/assets/main.css",
    "src/assets/base.css",
    "src/style.css",
    "src/styles.css",
    "src/index.css",
    "src/app.css",
  ],
};

export async function configureSafeArea(
  project: ProjectContext,
  framework: FrameworkId,
  dryRun: boolean,
): Promise<{ cssPath: string }> {
  const cssPath = await findConfigFile(
    project.root,
    globalCssCandidates[framework],
  );
  if (!cssPath) {
    throw new Error(
      "Could not find a global CSS file for safe area padding. Add it manually or run Capstart with --no-safe-area.",
    );
  }

  const viewportTarget = await findViewportTarget(project.root, framework);
  if (!viewportTarget) {
    throw new Error(
      "Could not find where to add viewport-fit=cover. Add it manually or run Capstart with --no-safe-area.",
    );
  }

  if (!dryRun) {
    await addSafeAreaCss(cssPath);
    await viewportTarget.configure();
  }

  return { cssPath };
}

async function addSafeAreaCss(cssPath: string): Promise<void> {
  const css = await readFile(cssPath, "utf8");
  if (
    css.includes(safeAreaMarker) ||
    (css.includes("--safe-area-inset-top") &&
      css.includes("--safe-area-inset-bottom"))
  ) {
    return;
  }

  await writeFile(
    cssPath,
    `${css.trimEnd()}\n\n${safeAreaCss}`,
  );
}

async function findViewportTarget(
  root: string,
  framework: FrameworkId,
): Promise<{ configure(): Promise<void> } | undefined> {
  if (framework === "nuxt") {
    return nuxtViewportTarget(root);
  }

  if (framework === "tanstack-start") {
    const rootRoutePath = await findConfigFile(root, [
      "src/routes/__root.tsx",
      "src/routes/__root.ts",
    ]);
    return rootRoutePath ? sourceViewportTarget(rootRoutePath) : undefined;
  }

  if (
    framework === "react-vite" ||
    framework === "svelte" ||
    framework === "vue"
  ) {
    const indexPath = await findConfigFile(root, [
      "index.html",
      "public/index.html",
    ]);
    return indexPath ? markupViewportTarget(indexPath) : undefined;
  }

  if (framework === "sveltekit") {
    const appTemplatePath = await findConfigFile(root, ["src/app.html"]);
    return appTemplatePath ? markupViewportTarget(appTemplatePath) : undefined;
  }

  const layoutPath = await findConfigFile(root, [
    "src/app/layout.tsx",
    "app/layout.tsx",
    "src/app/layout.ts",
    "app/layout.ts",
  ]);
  if (layoutPath) {
    return nextLayoutViewportTarget(layoutPath);
  }

  const documentPath = await findConfigFile(root, [
    "src/pages/_document.tsx",
    "pages/_document.tsx",
    "src/pages/_document.ts",
    "pages/_document.ts",
  ]);
  if (documentPath) {
    return markupViewportTarget(documentPath);
  }

  const indexPath = path.join(root, "index.html");
  if (await pathExists(indexPath)) {
    return markupViewportTarget(indexPath);
  }

  return undefined;
}

function nuxtViewportTarget(root: string): { configure(): Promise<void> } {
  return {
    async configure() {
      const configPath = await findConfigFile(root, [
        "nuxt.config.ts",
        "nuxt.config.mts",
        "nuxt.config.mjs",
        "nuxt.config.js",
        "nuxt.config.cjs",
      ]);
      if (!configPath) {
        throw new Error("Could not find the Nuxt configuration file.");
      }

      const sourceFile = loadSourceFile(configPath);
      const config = findExportedObject(sourceFile, ["defineNuxtConfig"]);
      if (!config) {
        throw new Error(
          "Could not safely update the existing Nuxt configuration file.",
        );
      }

      const app = getOrCreateNestedObject(config, "app");
      const head = getOrCreateNestedObject(app, "head");
      const metaProperty = head.getProperty("meta");
      if (!metaProperty) {
        head.addPropertyAssignment({
          name: "meta",
          initializer:
            '[{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }]',
        });
        await sourceFile.save();
        return;
      }

      if (!Node.isPropertyAssignment(metaProperty)) {
        throw new Error('Cannot safely update the Nuxt "app.head.meta" property.');
      }
      const meta = metaProperty.getInitializer();
      if (!Node.isArrayLiteralExpression(meta)) {
        throw new Error('Cannot safely update the Nuxt "app.head.meta" property.');
      }

      const viewport = meta.getElements().find((element) => {
        if (!Node.isObjectLiteralExpression(element)) {
          return false;
        }
        const name = element.getProperty("name");
        if (!Node.isPropertyAssignment(name)) {
          return false;
        }
        const initializer = name.getInitializer();
        return (
          Node.isStringLiteral(initializer) &&
          initializer.getLiteralValue() === "viewport"
        );
      });

      if (!viewport || !Node.isObjectLiteralExpression(viewport)) {
        meta.addElement(
          '{ name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" }',
        );
        await sourceFile.save();
        return;
      }

      const content = viewport.getProperty("content");
      if (!content) {
        setObjectProperty(
          viewport,
          "content",
          '"width=device-width, initial-scale=1, viewport-fit=cover"',
        );
        await sourceFile.save();
        return;
      }
      if (!Node.isPropertyAssignment(content)) {
        throw new Error(
          'Cannot safely update the Nuxt viewport "content" property.',
        );
      }
      const initializer = content.getInitializer();
      if (!Node.isStringLiteral(initializer)) {
        throw new Error(
          'Cannot safely update the Nuxt viewport "content" property.',
        );
      }

      const value = initializer.getLiteralValue();
      if (!value.includes("viewport-fit=cover")) {
        initializer.setLiteralValue(`${value}, viewport-fit=cover`);
        await sourceFile.save();
      }
    },
  };
}

function sourceViewportTarget(
  sourcePath: string,
): { configure(): Promise<void> } | undefined {
  const sourceFile = loadSourceFile(sourcePath);
  const viewportContent = sourceFile
    .getDescendantsOfKind(SyntaxKind.PropertyAssignment)
    .find((property) => {
      if (property.getName() !== "content") {
        return false;
      }
      const parent = property.getParent();
      if (!Node.isObjectLiteralExpression(parent)) {
        return false;
      }
      const nameProperty = parent.getProperty("name");
      if (!Node.isPropertyAssignment(nameProperty)) {
        return false;
      }
      return nameProperty.getInitializer()?.getText().replaceAll(/['"]/g, "") ===
        "viewport";
    });

  if (!viewportContent) {
    return undefined;
  }
  const initializer = viewportContent.getInitializer();
  if (!Node.isStringLiteral(initializer)) {
    return undefined;
  }

  return {
    async configure() {
      const value = initializer.getLiteralValue();
      if (!value.includes("viewport-fit=cover")) {
        initializer.setLiteralValue(`${value}, viewport-fit=cover`);
        await sourceFile.save();
      }
    },
  };
}

function nextLayoutViewportTarget(
  layoutPath: string,
): { configure(): Promise<void> } | undefined {
  const sourceFile = loadSourceFile(layoutPath);
  if (sourceFile.getFunction("generateViewport")) {
    return undefined;
  }

  const viewport = sourceFile.getVariableDeclaration("viewport");
  if (viewport) {
    const initializer = viewport.getInitializer();
    if (!Node.isObjectLiteralExpression(initializer)) {
      return undefined;
    }
    return {
      async configure() {
        setObjectProperty(initializer, "viewportFit", '"cover"');
        await sourceFile.save();
      },
    };
  }

  return {
    async configure() {
      sourceFile.addVariableStatement({
        declarationKind: VariableDeclarationKind.Const,
        declarations: [
          {
            name: "viewport",
            initializer: '{ viewportFit: "cover" }',
          },
        ],
        isExported: true,
      });
      await sourceFile.save();
    },
  };
}

function markupViewportTarget(
  markupPath: string,
): { configure(): Promise<void> } {
  return {
    async configure() {
      const markup = await readFile(markupPath, "utf8");
      if (markup.includes("viewport-fit=cover")) {
        return;
      }

      const updated = markup.replace(
        /(<meta\s+[^>]*name=["']viewport["'][^>]*content=["'])([^"']*)(["'][^>]*>)/i,
        "$1$2, viewport-fit=cover$3",
      );
      if (updated === markup) {
        throw new Error(`Could not safely update ${path.basename(markupPath)}.`);
      }
      await writeFile(markupPath, updated);
    },
  };
}
