import path from "node:path";
import { logger } from "../core/logger.js";
import { pathExists } from "../core/project.js";
import {
  capacitorCommand,
  installCommand,
  runCommand,
  runScriptCommand,
} from "../core/process.js";
import type { Platform, ProjectContext } from "../core/types.js";

export async function installCapacitor(
  project: ProjectContext,
  platforms: Platform[],
): Promise<void> {
  const runtimePackages = [
    "@capacitor/core",
    ...platforms.map((platform) => `@capacitor/${platform}`),
  ];

  logger.info(`Installing ${runtimePackages.join(", ")}`);
  await run(project, installCommand(project.packageManager, runtimePackages, false));

  logger.info("Installing @capacitor/cli");
  await run(
    project,
    installCommand(project.packageManager, ["@capacitor/cli"], true),
  );
}

export async function buildProject(project: ProjectContext): Promise<void> {
  logger.info("Building the web application");
  await run(project, runScriptCommand(project.packageManager, "build"));
}

export async function addNativePlatforms(
  project: ProjectContext,
  platforms: Platform[],
): Promise<void> {
  for (const platform of platforms) {
    if (await pathExists(path.join(project.root, platform))) {
      logger.info(`${platform} platform already exists`);
      continue;
    }

    logger.info(`Adding ${platform} platform`);
    await run(project, capacitorCommand(project.packageManager, ["add", platform]));
  }

  logger.info("Synchronizing native projects");
  await run(project, capacitorCommand(project.packageManager, ["sync"]));
}

async function run(
  project: ProjectContext,
  [command, args]: [string, string[]],
): Promise<void> {
  await runCommand(command, args, project.root);
}
