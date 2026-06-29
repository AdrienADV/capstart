#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import packageJson from "../package.json";
*import { createCommand } from "./commands/create.js";
import { initCommand } from "./commands/init.js";
import { logger } from "./core/logger.js";
import type {
  FrameworkId,
  Platform,
  SetupProfile,
} from "./core/types.js";

const program = new Command();

program
  .name("capstart")
  .description("Create Capstart apps or add Capacitor to existing web applications.")
  .version(packageJson.version);

program
  .command("create")
  .description("Create a new app from the Capstart boilerplate.")
  .argument("[directory]", "app directory", "my-app")
  .option("--app-id <id>", "native application id, for example com.example.app")
  .option("--app-name <name>", "native application name")
  .option(
    "--template <path>",
    "local boilerplate template directory",
  )
  .action(async (directory, commandOptions) => {
    await createCommand({
      appId: commandOptions.appId,
      appName: commandOptions.appName,
      directory,
      template: commandOptions.template,
    });
  });

program
  .command("init")
  .description("Configure an existing application for Capacitor.")
  .argument("[directory]", "project directory", ".")
  .option(
    "-f, --framework <framework>",
    "framework adapter: nextjs, nuxt, react-vite, svelte, sveltekit, tanstack-start, or vue",
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
  .option(
    "--setup <setup>",
    "Capacitor setup profile: minimal or recommended",
    parseSetup,
  )
  .option("--safe-area", "add global top and bottom safe area padding")
  .option("--no-safe-area", "do not add global safe area padding")
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
      safeArea: commandOptions.safeArea,
      setup: commandOptions.setup,
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
  if (
    value === "nextjs" ||
    value === "nuxt" ||
    value === "react-vite" ||
    value === "svelte" ||
    value === "sveltekit" ||
    value === "tanstack-start" ||
    value === "vue"
  ) {
    return value;
  }
  throw new InvalidArgumentError(
    'Framework must be "nextjs", "nuxt", "react-vite", "svelte", "sveltekit", "tanstack-start", or "vue".',
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

function parseSetup(value: string): SetupProfile {
  if (value === "minimal" || value === "recommended") {
    return value;
  }
  throw new InvalidArgumentError(
    'Setup must be "minimal" or "recommended".',
  );
}
