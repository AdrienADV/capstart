import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  findConfigFile,
  findExportedObject,
  loadSourceFile,
  setObjectProperty,
} from "../core/ast.js";
import {
  hasDependency,
  savePackageJson,
} from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";

const configNames = [
  "nuxt.config.ts",
  "nuxt.config.mts",
  "nuxt.config.mjs",
  "nuxt.config.js",
  "nuxt.config.cjs",
];

export const nuxtAdapter: FrameworkAdapter = {
  id: "nuxt",
  label: "Nuxt",

  detect(project) {
    return hasDependency(project, "nuxt");
  },

  resolveWebDir() {
    return ".output/public";
  },

  async validate(project) {
    const diagnostics = [];
    if (!project.packageJson.scripts?.build) {
      diagnostics.push({
        level: "error" as const,
        message: 'Missing a "build" script in package.json.',
      });
    }

    const configPath = await findConfigFile(project.root, configNames);
    if (configPath) {
      const sourceFile = loadSourceFile(configPath);
      if (!findExportedObject(sourceFile, ["defineNuxtConfig"])) {
        diagnostics.push({
          level: "error" as const,
          message:
            "The existing Nuxt config is too dynamic to update safely. Export a defineNuxtConfig() object before running Capstart.",
        });
      }
    }

    return diagnostics;
  },

  async configure(project, dryRun) {
    const disclaimers = [
      {
        title: "Nuxt server features do not run inside the Capacitor app.",
        details: [
          "Move server routes, server middleware, and Nitro handlers to a deployed backend.",
          "Runtime SSR, hybrid rendering, and server route rules are disabled by the client-only build.",
          "Configure the mobile app to call an HTTPS API URL that is reachable from the device.",
          'Do not use "localhost" for the backend URL: on a phone or emulator, it points to the device itself.',
        ],
      },
    ];
    const configPath = await findConfigFile(project.root, configNames);

    if (!configPath) {
      if (!dryRun) {
        await writeFile(
          path.join(project.root, "nuxt.config.ts"),
          [
            "export default defineNuxtConfig({",
            "  ssr: false,",
            "});",
            "",
          ].join("\n"),
        );
      }
    } else {
      const sourceFile = loadSourceFile(configPath);
      const config = findExportedObject(sourceFile, ["defineNuxtConfig"]);
      if (!config) {
        throw new Error("Could not safely update the existing Nuxt config.");
      }

      setObjectProperty(config, "ssr", "false");
      if (!dryRun) {
        await sourceFile.save();
      }
    }

    project.packageJson.scripts ??= {};
    project.packageJson.scripts.build = "nuxt generate";
    await savePackageJson(project, dryRun);

    return { disclaimers };
  },
};
