import path from "node:path";
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

  await run(project, installCommand(project.packageManager, runtimePackages, false));

  await run(
    project,
    installCommand(project.packageManager, ["@capacitor/cli"], true),
  );
}

export async function buildProject(project: ProjectContext): Promise<void> {
  await run(project, runScriptCommand(project.packageManager, "build"));
}

export async function addNativePlatforms(
  project: ProjectContext,
  platforms: Platform[],
): Promise<void> {
  for (const platform of platforms) {
    if (await pathExists(path.join(project.root, platform))) {
      continue;
    }

    await run(project, capacitorCommand(project.packageManager, ["add", platform]));
  }
}

export async function syncNativeProjects(project: ProjectContext): Promise<void> {
  await run(project, capacitorCommand(project.packageManager, ["sync"]));
}

async function run(
  project: ProjectContext,
  [command, args]: [string, string[]],
): Promise<void> {
  await runCommand(command, args, project.root);
}
