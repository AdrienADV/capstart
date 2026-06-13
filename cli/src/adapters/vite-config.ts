import { Node, type ObjectLiteralExpression } from "ts-morph";
import {
  findConfigFile,
  findExportedObject,
  loadSourceFile,
} from "../core/ast.js";
import type { ProjectContext } from "../core/types.js";

const viteConfigNames = [
  "vite.config.ts",
  "vite.config.mts",
  "vite.config.mjs",
  "vite.config.js",
  "vite.config.cjs",
];

export async function resolveViteWebDir(
  project: ProjectContext,
): Promise<string> {
  return (await findViteOutDir(project)) ?? "dist";
}

export async function findViteOutDir(
  project: ProjectContext,
): Promise<string | undefined> {
  const configPath = await findConfigFile(project.root, viteConfigNames);
  if (!configPath) {
    return undefined;
  }

  const config = findExportedObject(loadSourceFile(configPath), [
    "defineConfig",
  ]);
  const build = config ? getObjectProperty(config, "build") : undefined;
  return build ? getStringProperty(build, "outDir") : undefined;
}

export function validateViteProject(project: ProjectContext) {
  if (!project.packageJson.scripts?.build) {
    return [
      {
        level: "error" as const,
        message: 'Missing a "build" script in package.json.',
      },
    ];
  }
  return [];
}

export function getStringProperty(
  object: ObjectLiteralExpression,
  name: string,
): string | undefined {
  const property = object.getProperty(name);
  if (!Node.isPropertyAssignment(property)) {
    return undefined;
  }
  const initializer = property.getInitializer();
  if (
    Node.isStringLiteral(initializer) ||
    Node.isNoSubstitutionTemplateLiteral(initializer)
  ) {
    return initializer.getLiteralValue();
  }
  return undefined;
}

function getObjectProperty(
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
