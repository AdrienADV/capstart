import { writeFile } from "node:fs/promises";
import path from "node:path";
import {
  findConfigFile,
  findExportedObject,
  getOrCreateNestedObject,
  loadSourceFile,
  setObjectProperty,
} from "../core/ast.js";
import { hasDependency } from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";

const configNames = [
  "next.config.ts",
  "next.config.mts",
  "next.config.mjs",
  "next.config.js",
  "next.config.cjs",
];

export const nextjsAdapter: FrameworkAdapter = {
  id: "nextjs",
  label: "Next.js",
  webDir: "out",

  detect(project) {
    return hasDependency(project, "next");
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
      if (!findExportedObject(sourceFile)) {
        diagnostics.push({
          level: "error" as const,
          message:
            "The existing Next.js config is too dynamic to update safely. Export a config object before running Capstart.",
        });
      }
    }

    return diagnostics;
  },

  async configure(project, dryRun) {
    const changes: string[] = [];
    const warnings = [
      "Next.js Server Actions, API routes, middleware, ISR, and request-time rendering must remain on a remote server.",
    ];
    const configPath = await findConfigFile(project.root, configNames);

    if (!configPath) {
      const newConfigPath = path.join(project.root, "next.config.mjs");
      if (!dryRun) {
        await writeFile(
          newConfigPath,
          [
            "/** @type {import('next').NextConfig} */",
            "const nextConfig = {",
            '  output: "export",',
            "  trailingSlash: true,",
            "  images: {",
            "    unoptimized: true,",
            "  },",
            "};",
            "",
            "export default nextConfig;",
            "",
          ].join("\n"),
        );
      }
      changes.push("Created next.config.mjs with static export enabled");
      return { changes, warnings };
    }

    const sourceFile = loadSourceFile(configPath);
    const config = findExportedObject(sourceFile);
    if (!config) {
      throw new Error("Could not safely update the existing Next.js config.");
    }

    setObjectProperty(config, "output", '"export"');
    setObjectProperty(config, "trailingSlash", "true");
    const images = getOrCreateNestedObject(config, "images");
    setObjectProperty(images, "unoptimized", "true");

    if (!dryRun) {
      await sourceFile.save();
    }
    changes.push(`Updated ${path.basename(configPath)} for static export`);

    return { changes, warnings };
  },
};
