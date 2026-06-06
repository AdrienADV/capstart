import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Node, SyntaxKind, VariableDeclarationKind } from "ts-morph";
import { findConfigFile, loadSourceFile, setObjectProperty } from "./ast.js";
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
  "tanstack-start": [
    "src/styles.css",
    "src/index.css",
    "src/app.css",
    "src/globals.css",
    "src/styles/globals.css",
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
  if (framework === "tanstack-start") {
    const rootRoutePath = await findConfigFile(root, [
      "src/routes/__root.tsx",
      "src/routes/__root.ts",
    ]);
    return rootRoutePath ? sourceViewportTarget(rootRoutePath) : undefined;
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
