import path from "node:path";
import { detectAdapters } from "../adapters/index.js";
import { configureCapacitor } from "../capacitor/configure.js";
import {
  addNativePlatforms,
  buildProject,
  installCapacitor,
  syncNativeProjects,
} from "../capacitor/install.js";
import { chooseAdapter } from "../core/framework-selection.js";
import { offerGithubStar } from "../core/github-star.js";
import { logger } from "../core/logger.js";
import { createProgress } from "../core/progress.js";
import {
  createDefaultAppId,
  getProjectName,
  loadProject,
} from "../core/project.js";
import { configureSafeArea } from "../core/safe-area.js";
import { chooseSafeArea } from "../core/safe-area-selection.js";
import { chooseSetup } from "../core/setup-selection.js";
import type {
  ConfigureResult,
  Disclaimer,
  FrameworkAdapter,
  InitOptions,
  SetupProfile,
} from "../core/types.js";

export async function initCommand(options: InitOptions): Promise<void> {
  const project = await loadProject(options.directory);
  const interactive =
    options.interactive ?? Boolean(process.stdin.isTTY && process.stdout.isTTY);

  logger.heading("Capstart");
  const detected = detectAdapters(project);
  logDetection(detected);

  const adapter = await chooseAdapter({
    acceptDetected: options.yes,
    detected,
    interactive,
    requested: options.framework,
  });
  const setup = await chooseSetup({
    interactive,
    requested: options.setup,
  });
  const safeArea = await chooseSafeArea({
    interactive,
    requested: options.safeArea,
  });
  const webDir = await adapter.resolveWebDir(project);

  if (!detected.includes(adapter)) {
    logger.warning(`${adapter.label} was selected but was not automatically detected.`);
  }

  const diagnostics = await adapter.validate(project);
  for (const warning of diagnostics.filter((item) => item.level === "warning")) {
    logger.warning(warning.message);
  }

  const errors = diagnostics.filter((item) => item.level === "error");
  if (errors.length > 0) {
    throw new Error(errors.map((error) => error.message).join("\n"));
  }
  const safeAreaResult = safeArea
    ? await configureSafeArea(project, adapter.id, true)
    : undefined;

  const appId = options.appId ?? createDefaultAppId(project);
  const appName = options.appName ?? getProjectName(project);
  validateAppId(appId);

  if (options.dryRun) {
    const frameworkResult = await adapter.configure(project, true);
    await configureCapacitor(project, {
      appId,
      appName,
      dryRun: true,
      platforms: options.platforms,
      safeArea,
      setup,
      webDir,
    });
    logger.heading("Planned changes");
    logger.info(`Configure ${adapter.label} for Capacitor`);
    logger.info(`Configure Capacitor with webDir "${webDir}"`);
    if (setup === "recommended") {
      logger.info("Install recommended Capacitor base plugins");
      logger.info("Configure recommended Capacitor plugin defaults");
    }
    if (safeAreaResult) {
      logger.info(
        `Add top and bottom safe area padding to ${path.relative(project.root, safeAreaResult.cssPath)}`,
      );
    }
    logger.success("Dry run complete. No files were changed.");
    printFinalGuidance(frameworkResult.disclaimers);
    return;
  }

  const frameworkResult = await runSetup({
    adapter,
    appId,
    appName,
    interactive,
    options,
    project,
    safeArea,
    setup,
    webDir,
  });

  logger.heading("Ready");
  logger.success(
    setup === "recommended"
      ? "Your recommended Capacitor setup is ready."
      : "Your base Capacitor setup is ready.",
  );

  logger.heading("Scripts added");
  logger.command(
    `${project.packageManager} run cap:sync`,
    "Build the web app and sync the native projects.",
  );
  if (options.platforms.includes("ios")) {
    logger.command(
      `${project.packageManager} run cap:ios`,
      "Build, sync, and open the iOS project in Xcode.",
    );
  }
  if (options.platforms.includes("android")) {
    logger.command(
      `${project.packageManager} run cap:android`,
      "Build, sync, and open the Android project in Android Studio.",
    );
  }

  logger.heading("Next steps");
  logger.info(
    setup === "recommended"
      ? "Review native configuration and production setup:"
      : "Review recommended plugins, native configuration, and production setup:",
  );
  logger.link(
    "https://capstart.dev/docs/installation/#3-add-recommended-capacitor-base-plugins",
  );

  await offerGithubStar({
    cwd: project.root,
    interactive,
  });

  printFinalGuidance(frameworkResult.disclaimers);
}

async function runSetup(context: {
  adapter: FrameworkAdapter;
  appId: string;
  appName: string;
  interactive: boolean;
  options: InitOptions;
  project: Awaited<ReturnType<typeof loadProject>>;
  safeArea: boolean;
  setup: SetupProfile;
  webDir: string;
}): Promise<ConfigureResult> {
  const {
    adapter,
    appId,
    appName,
    interactive,
    options,
    project,
    safeArea,
    setup,
    webDir,
  } = context;
  const progress = createProgress(interactive);

  const frameworkResult = await runStep(
    progress,
    `Configure ${adapter.label}`,
    () => adapter.configure(project, false),
  );

  await runStep(progress, "Configure Capacitor", () =>
    configureCapacitor(project, {
      appId,
      appName,
      dryRun: false,
      platforms: options.platforms,
      safeArea,
      setup,
      webDir,
    }),
  );

  if (safeArea) {
    await runStep(progress, "Configure safe area insets", () =>
      configureSafeArea(project, adapter.id, false),
    );
  }

  if (!options.skipInstall) {
    await runStep(progress, `Install Capacitor packages (${setup})`, () =>
      installCapacitor(project, options.platforms, setup),
    );
  }
  if (!options.skipBuild) {
    await runStep(progress, "Build the web app", () => buildProject(project));
  }
  if (!options.skipNative) {
    await runStep(
      progress,
      `Prepare ${formatPlatforms(options.platforms)} projects`,
      () => addNativePlatforms(project, options.platforms),
    );
    await runStep(progress, "Synchronize native projects", () =>
      syncNativeProjects(project),
    );
  }

  return frameworkResult;
}

async function runStep<T>(
  progress: ReturnType<typeof createProgress>,
  label: string,
  action: () => Promise<T>,
): Promise<T> {
  progress.start(label);
  try {
    const result = await action();
    progress.stop(label);
    return result;
  } catch (error) {
    progress.stop(`${label} failed`);
    throw error;
  }
}

function formatPlatforms(platforms: InitOptions["platforms"]): string {
  return platforms
    .map((platform) => (platform === "ios" ? "iOS" : "Android"))
    .join(" and ");
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

function printFinalGuidance(disclaimers: Disclaimer[]): void {
  if (disclaimers.length === 0) {
    return;
  }

  logger.heading("Important");
  for (const disclaimer of disclaimers) {
    logger.warning(disclaimer.title);
    for (const detail of disclaimer.details) {
      logger.detail(detail);
    }
  }
}
