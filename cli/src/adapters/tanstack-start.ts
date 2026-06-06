import { Node, SyntaxKind } from "ts-morph";
import {
  findConfigFile,
  getOrCreateNestedObject,
  loadSourceFile,
  setObjectProperty,
} from "../core/ast.js";
import { hasDependency } from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";

const configNames = [
  "vite.config.ts",
  "vite.config.mts",
  "vite.config.mjs",
  "vite.config.js",
];

export const tanstackStartAdapter: FrameworkAdapter = {
  id: "tanstack-start",
  label: "TanStack Start",
  webDir: "dist/client",

  detect(project) {
    return hasDependency(project, "@tanstack/react-start");
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
    if (!configPath) {
      diagnostics.push({
        level: "error" as const,
        message: "Could not find a Vite configuration file.",
      });
      return diagnostics;
    }

    const call = findTanstackStartCall(configPath);
    if (!call) {
      diagnostics.push({
        level: "error" as const,
        message:
          "Could not find tanstackStart() in the Vite configuration file.",
      });
    }

    return diagnostics;
  },

  async configure(project, dryRun) {
    const configPath = await findConfigFile(project.root, configNames);
    if (!configPath) {
      throw new Error("Could not find a Vite configuration file.");
    }

    const sourceFile = loadSourceFile(configPath);
    const call = sourceFile
      .getDescendantsOfKind(SyntaxKind.CallExpression)
      .find(
        (candidate) => candidate.getExpression().getText() === "tanstackStart",
      );

    if (!call) {
      throw new Error("Could not find tanstackStart() in the Vite config.");
    }

    let options = call.getArguments()[0];
    if (!options) {
      call.addArgument("{}");
      options = call.getArguments()[0];
    }
    if (!Node.isObjectLiteralExpression(options)) {
      throw new Error(
        "Cannot safely update tanstackStart() because its options are not an object literal.",
      );
    }

    const spa = getOrCreateNestedObject(options, "spa");
    setObjectProperty(spa, "enabled", "true");
    const prerender = getOrCreateNestedObject(spa, "prerender");
    setObjectProperty(prerender, "outputPath", '"/index.html"');

    if (!dryRun) {
      await sourceFile.save();
    }

    return {
      disclaimers: [
        {
          title:
            "TanStack Start server features do not run inside the Capacitor app.",
          details: [
            "Move server functions and server routes to a deployed backend.",
            "Configure the mobile app to call an HTTPS API URL that is reachable from the device.",
            'Do not use "localhost" for the backend URL: on a phone or emulator, it points to the device itself.',
          ],
        },
      ],
    };
  },
};

function findTanstackStartCall(configPath: string) {
  return loadSourceFile(configPath)
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .find((candidate) => candidate.getExpression().getText() === "tanstackStart");
}
