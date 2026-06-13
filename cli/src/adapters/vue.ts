import {
  findConfigFile,
  findExportedObject,
  loadSourceFile,
} from "../core/ast.js";
import { hasDependency } from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";
import {
  findViteOutDir,
  getStringProperty,
  validateViteProject,
} from "./vite-config.js";

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
    if (hasDependency(project, "vite")) {
      const outDir = await findViteOutDir(project);
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
    return validateViteProject(project);
  },

  async configure() {
    return { disclaimers: [] };
  },
};
