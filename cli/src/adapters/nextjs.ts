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

  detect(project) {
    return hasDependency(project, "next");
  },

  resolveWebDir() {
    return "out";
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
    const disclaimers = [
      {
        title:
          "Next.js request-time features do not run inside the Capacitor app.",
        details: [
          "Replace request-time Server Components and Server Actions with client-side calls to API endpoints.",
          "Deploy those APIs, API routes, middleware, ISR, and other request-time logic on a remote backend.",
          "Configure the mobile app with an HTTPS API base URL that is reachable from the device.",
          'Do not use "localhost" for the backend URL: on a phone or emulator, it points to the device itself.',
        ],
      },
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
      return { disclaimers };
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

    return { disclaimers };
  },
};
