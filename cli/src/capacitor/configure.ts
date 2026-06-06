import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  findConfigFile,
  findExportedObject,
  loadSourceFile,
  setObjectProperty,
} from "../core/ast.js";
import { savePackageJson } from "../core/project.js";
import {
  capacitorScriptPrefix,
  packageScriptPrefix,
} from "../core/process.js";
import type { Platform, ProjectContext } from "../core/types.js";

const configNames = [
  "capacitor.config.ts",
  "capacitor.config.mts",
  "capacitor.config.js",
  "capacitor.config.mjs",
  "capacitor.config.json",
];

export async function configureCapacitor(
  project: ProjectContext,
  options: {
    appId: string;
    appName: string;
    dryRun: boolean;
    platforms: Platform[];
    webDir: string;
  },
): Promise<void> {
  const configPath = await findConfigFile(project.root, configNames);

  if (!configPath) {
    if (!options.dryRun) {
      await writeFile(
        path.join(project.root, "capacitor.config.ts"),
        [
          'import type { CapacitorConfig } from "@capacitor/cli";',
          "",
          "const config: CapacitorConfig = {",
          `  appId: ${JSON.stringify(options.appId)},`,
          `  appName: ${JSON.stringify(options.appName)},`,
          `  webDir: ${JSON.stringify(options.webDir)},`,
          "};",
          "",
          "export default config;",
          "",
        ].join("\n"),
      );
    }
  } else if (configPath.endsWith(".json")) {
    const config = JSON.parse(await readFile(configPath, "utf8")) as Record<
      string,
      unknown
    >;
    config.webDir = options.webDir;
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
