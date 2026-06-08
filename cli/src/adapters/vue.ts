import { Node, type ObjectLiteralExpression } from "ts-morph";
import {
  findConfigFile,
  findExportedObject,
  loadSourceFile,
} from "../core/ast.js";
import { hasDependency } from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";

const viteConfigNames = [
  "vite.config.ts",
  "vite.config.mts",
  "vite.config.mjs",
  "vite.config.js",
  "vite.config.cjs",
];
const vueCliConfigNames = [
  "vue.config.ts",
  "vue.config.mts",
  "vue.config.mjs",
  "vue.config.js",
  "vue.config.cjs",
];

export const vueAdapter: FrameworkAdapter = {
  id: "vue",
  label: "Vue",

  detect(project) {
    return (
      hasDependency(project, "vue") &&
      !hasDependency(project, "nuxt") &&
      (hasDependency(project, "vite") ||
        hasDependency(project, "@vue/cli-service"))
    );
  },

  async resolveWebDir(project) {
    const viteConfigPath = await findConfigFile(project.root, viteConfigNames);
    if (viteConfigPath) {
      const config = findExportedObject(loadSourceFile(viteConfigPath), [
        "defineConfig",
      ]);
      const build = config ? getObjectProperty(config, "build") : undefined;
      const outDir = build ? getStringProperty(build, "outDir") : undefined;
      if (outDir) {
        return outDir;
      }
    }

    const vueCliConfigPath = await findConfigFile(
      project.root,
      vueCliConfigNames,
    );
    if (vueCliConfigPath) {
      const config = findExportedObject(loadSourceFile(vueCliConfigPath), [
        "defineConfig",
      ]);
      const outputDir = config
        ? getStringProperty(config, "outputDir")
        : undefined;
      if (outputDir) {
        return outputDir;
      }
    }

    return "dist";
  },

  async validate(project) {
    if (!project.packageJson.scripts?.build) {
      return [
        {
          level: "error" as const,
          message: 'Missing a "build" script in package.json.',
        },
      ];
    }
    return [];
  },

  async configure() {
    return { disclaimers: [] };
  },
};

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

function getStringProperty(
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
