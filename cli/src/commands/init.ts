import path from "node:path";
import { detectAdapters } from "../adapters/index.js";
import { configureCapacitor } from "../capacitor/configure.js";
import {
  addNativePlatforms,
  buildProject,
  installCapacitor,
} from "../capacitor/install.js";
import { chooseAdapter } from "../core/framework-selection.js";
import { offerGithubStar } from "../core/github-star.js";
import { logger } from "../core/logger.js";
import {
  createDefaultAppId,
  getProjectName,
  loadProject,
} from "../core/project.js";
import type { InitOptions } from "../core/types.js";

export async function initCommand(options: InitOptions): Promise<void> {
  const project = await loadProject(options.directory);

  logger.heading("Capstart");
  logger.info(
    `Inspecting ${path.relative(process.cwd(), project.root) || "."} for a supported framework`,
  );
  const detected = detectAdapters(project);
  logDetection(detected);

  const adapter = await chooseAdapter({
    acceptDetected: options.yes,
    detected,
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
    requested: options.framework,
  });

  if (!detected.includes(adapter)) {
    logger.warning(`${adapter.label} was selected but was not automatically detected.`);
  }
  logger.success(`Using ${adapter.label}`);
  logger.info(`Package manager: ${project.packageManager}`);

  const diagnostics = await adapter.validate(project);
  for (const warning of diagnostics.filter((item) => item.level === "warning")) {
    logger.warning(warning.message);
  }

  const errors = diagnostics.filter((item) => item.level === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join("\n"));
  }

  const appId = options.appId ?? createDefaultAppId(project);
  const appName = options.appName ?? getProjectName(project);
  validateAppId(appId);

  const frameworkResult = await adapter.configure(project, options.dryRun);
  const capacitorChanges = await configureCapacitor(project, {
    appId,
    appName,
    dryRun: options.dryRun,
    platforms: options.platforms,
    webDir: adapter.webDir,
  });

  for (const change of [...frameworkResult.changes, ...capacitorChanges]) {
    logger.success(options.dryRun ? `[dry-run] ${change}` : change);
  }
  for (const warning of frameworkResult.warnings) {
    logger.warning(warning);
  }

  if (options.dryRun) {
    logger.success("Dry run complete. No files were changed.");
    return;
  }

  if (!options.skipInstall) {
    await installCapacitor(project, options.platforms);
  }

  if (!options.skipBuild) {
    await buildProject(project);
  }

  if (!options.skipNative) {
    await addNativePlatforms(project, options.platforms);
  }

  logger.heading("Ready");
  logger.success(`Capacitor is configured with webDir "${adapter.webDir}".`);
  if (options.platforms.includes("ios")) {
    logger.info(`Run ${project.packageManager} run cap:ios to open Xcode.`);
  }
  if (options.platforms.includes("android")) {
    logger.info(`Run ${project.packageManager} run cap:android to open Android Studio.`);
  }

  await offerGithubStar({
    cwd: project.root,
    interactive: Boolean(process.stdin.isTTY && process.stdout.isTTY),
  });
}

function logDetection(detected: ReturnType<typeof detectAdapters>): void {
  if (detected.length === 0) {
    logger.warning("No supported framework was automatically detected.");
    return;
  }

  if (detected.length === 1) {
    logger.success(`Detected ${detected[0].label}`);
    return;
  }

  logger.warning(
    `Detected multiple frameworks: ${detected.map((adapter) => adapter.label).join(", ")}`,
  );
}

function validateAppId(appId: string): void {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(appId)) {
    throw new Error(
      `Invalid app id "${appId}". Use reverse-domain notation, for example com.example.app.`,
    );
  }
}
