#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { initCommand } from "./commands/init.js";
import { logger } from "./core/logger.js";
import type { FrameworkId, Platform } from "./core/types.js";

const program = new Command();

program
  .name("capstart")
  .description("Add Capacitor to an existing web application.")
  .version("0.1.0");

program
  .command("init")
  .description("Configure an existing application for Capacitor.")
  .argument("[directory]", "project directory", ".")
  .option(
    "-f, --framework <framework>",
    "framework adapter: nextjs or tanstack-start",
    parseFramework,
  )
  .option("--app-id <id>", "native application id, for example com.example.app")
  .option("--app-name <name>", "native application name")
  .option(
    "--platforms <platforms>",
    "comma-separated native platforms",
    parsePlatforms,
    ["ios", "android"],
  )
  .option("--skip-install", "do not install Capacitor packages")
  .option("--skip-build", "do not build the web application")
  .option("--skip-native", "do not add or synchronize native projects")
  .option("--dry-run", "show configuration changes without writing files")
  .option("-y, --yes", "accept the automatically detected framework")
  .action(async (directory, commandOptions) => {
    await initCommand({
      appId: commandOptions.appId,
      appName: commandOptions.appName,
      directory,
      dryRun: commandOptions.dryRun ?? false,
      framework: commandOptions.framework,
      platforms: commandOptions.platforms,
      skipBuild: commandOptions.skipBuild ?? false,
      skipInstall: commandOptions.skipInstall ?? false,
      skipNative: commandOptions.skipNative ?? false,
      yes: commandOptions.yes ?? false,
    });
  });

program.parseAsync().catch((error: unknown) => {
  logger.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});

function parseFramework(value: string): FrameworkId {
  if (value === "nextjs" || value === "tanstack-start") {
    return value;
  }
  throw new InvalidArgumentError(
    'Framework must be "nextjs" or "tanstack-start".',
  );
}

function parsePlatforms(value: string): Platform[] {
  const platforms = value
    .split(",")
    .map((platform) => platform.trim())
    .filter(Boolean);

  if (
    platforms.length === 0 ||
    platforms.some((platform) => platform !== "ios" && platform !== "android")
  ) {
    throw new InvalidArgumentError(
      'Platforms must contain "ios", "android", or both.',
    );
  }

  return [...new Set(platforms)] as Platform[];
}
