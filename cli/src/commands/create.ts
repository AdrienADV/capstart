import {
  cp,
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  chooseAppId,
  chooseAppName,
} from "../core/app-config-selection.js";
import { logger } from "../core/logger.js";
import {
  commandExists,
  runCommand,
} from "../core/process.js";

const repositoryUrl = "https://github.com/AdrienADV/capstart.git";
const boilerplateDirectory = "capstart-boilerplate";
const defaultIgnoredTemplateParts = new Set([
  ".env",
  ".git",
  ".DS_Store",
  "dist",
  "node_modules",
]);

export interface CreateOptions {
  appId?: string;
  appName?: string;
  directory: string;
  interactive?: boolean;
  template?: string;
}

export async function createCommand(options: CreateOptions): Promise<void> {
  const targetRoot = path.resolve(options.directory);
  const interactive =
    options.interactive ?? Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const defaultName = createDefaultAppName(targetRoot);
  const appName = await chooseAppName({
    defaultValue: defaultName,
    interactive,
    requested: options.appName,
  });
  const appId = await chooseAppId({
    defaultValue: createDefaultAppId(defaultName),
    interactive,
    requested: options.appId,
  });
  validateAppId(appId);

  logger.heading("Capstart");
  await assertTargetReady(targetRoot);

  const templateRoot = options.template
    ? path.resolve(options.template)
    : await downloadBoilerplateTemplate();

  await copyTemplate(templateRoot, targetRoot);
  await customizeBoilerplate(targetRoot, {
    appId,
    appName,
    packageName: createPackageName(path.basename(targetRoot)),
  });

  logger.heading("Ready");
  logger.success(`Created ${appName} from the Capstart boilerplate.`);
  logger.heading("Next steps");
  logger.command(`cd ${path.relative(process.cwd(), targetRoot) || "."}`, "Open the new app directory.");
  logger.command("bun install", "Install dependencies.");
  logger.command("cp .env.example .env", "Create the local environment file.");
  logger.command("bun run dev", "Start the web app.");
}

async function assertTargetReady(targetRoot: string): Promise<void> {
  try {
    const entries = await readdir(targetRoot);
    if (entries.length > 0) {
      throw new Error(`Directory ${targetRoot} is not empty.`);
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      throw error;
    }
  }

  await mkdir(path.dirname(targetRoot), { recursive: true });
}

async function downloadBoilerplateTemplate(): Promise<string> {
  if (!(await commandExists("git"))) {
    throw new Error(
      "Git is required to create a Capstart app. Install Git, or pass --template to use a local boilerplate directory.",
    );
  }

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "capstart-create-"));
  const checkoutRoot = path.join(tempRoot, "capstart");
  await runCommand("git", [
    "clone",
    "--depth",
    "1",
    "--filter=blob:none",
    "--sparse",
    repositoryUrl,
    checkoutRoot,
  ], process.cwd());
  await runCommand("git", [
    "-C",
    checkoutRoot,
    "sparse-checkout",
    "set",
    boilerplateDirectory,
  ], process.cwd());

  return path.join(checkoutRoot, boilerplateDirectory);
}

async function copyTemplate(sourceRoot: string, targetRoot: string): Promise<void> {
  const resolvedSource = path.resolve(sourceRoot);
  await cp(resolvedSource, targetRoot, {
    recursive: true,
    filter(source) {
      const relativePath = path.relative(resolvedSource, source);
      if (!relativePath) {
        return true;
      }
      return !relativePath
        .split(path.sep)
        .some((part) => defaultIgnoredTemplateParts.has(part));
    },
  });
}

async function customizeBoilerplate(
  root: string,
  options: {
    appId: string;
    appName: string;
    packageName: string;
  },
): Promise<void> {
  await updatePackageJson(root, options.packageName);
  await replaceInFile(path.join(root, "capacitor.config.ts"), (content) =>
    content
      .replace(/appId:\s*['"][^'"]+['"]/, `appId: ${JSON.stringify(options.appId)}`)
      .replace(/appName:\s*['"][^'"]+['"]/, `appName: ${JSON.stringify(options.appName)}`),
  );
  await replaceInFile(path.join(root, "index.html"), (content) =>
    content.replace(/<title>.*<\/title>/, `<title>${escapeHtml(options.appName)}</title>`),
  );

  await updateAndroidProject(root, options);
  await updateIosProject(root, options);
}

async function updatePackageJson(
  root: string,
  packageName: string,
): Promise<void> {
  const packageJsonPath = path.join(root, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8")) as {
    name?: string;
  };
  packageJson.name = packageName;
  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
}

async function updateAndroidProject(
  root: string,
  options: {
    appId: string;
    appName: string;
  },
): Promise<void> {
  await replaceInFile(path.join(root, "android/app/build.gradle"), (content) =>
    content
      .replace(/namespace = "[^"]+"/, `namespace = ${JSON.stringify(options.appId)}`)
      .replace(/applicationId "[^"]+"/, `applicationId ${JSON.stringify(options.appId)}`),
  );
  await replaceInFile(
    path.join(root, "android/app/src/main/res/values/strings.xml"),
    (content) =>
      content
        .replace(
          /<string name="app_name">.*<\/string>/,
          `<string name="app_name">${escapeXml(options.appName)}</string>`,
        )
        .replace(
          /<string name="title_activity_main">.*<\/string>/,
          `<string name="title_activity_main">${escapeXml(options.appName)}</string>`,
        )
        .replace(
          /<string name="package_name">.*<\/string>/,
          `<string name="package_name">${escapeXml(options.appId)}</string>`,
        )
        .replace(
          /<string name="custom_url_scheme">.*<\/string>/,
          `<string name="custom_url_scheme">${escapeXml(options.appId)}</string>`,
        ),
  );

  await updateAndroidMainActivity(root, options.appId);
}

async function updateAndroidMainActivity(
  root: string,
  appId: string,
): Promise<void> {
  const javaRoot = path.join(root, "android/app/src/main/java");
  const oldDirectory = path.join(javaRoot, "com/example/app");
  const oldPath = path.join(oldDirectory, "MainActivity.java");
  const newDirectory = path.join(javaRoot, ...appId.split("."));
  const newPath = path.join(newDirectory, "MainActivity.java");
  const content = (await readFile(oldPath, "utf8")).replace(
    /package\s+[^;]+;/,
    `package ${appId};`,
  );

  await mkdir(newDirectory, { recursive: true });
  await writeFile(newPath, content);
  if (oldPath !== newPath) {
    await rm(oldPath, { force: true });
    if (!newPath.startsWith(`${oldDirectory}${path.sep}`)) {
      await rm(oldDirectory, { recursive: true, force: true });
    }
  }
}

async function updateIosProject(
  root: string,
  options: {
    appId: string;
    appName: string;
  },
): Promise<void> {
  await replaceInFile(
    path.join(root, "ios/App/App.xcodeproj/project.pbxproj"),
    (content) =>
      content.replace(
        /PRODUCT_BUNDLE_IDENTIFIER = [^;]+;/g,
        `PRODUCT_BUNDLE_IDENTIFIER = ${options.appId};`,
      ),
  );
  await replaceInFile(path.join(root, "ios/App/App/Info.plist"), (content) =>
    content.replace(
      /(<key>CFBundleDisplayName<\/key>\s*<string>)[^<]+(<\/string>)/,
      `$1${escapeXml(options.appName)}$2`,
    ),
  );
}

async function replaceInFile(
  filePath: string,
  replace: (content: string) => string,
): Promise<void> {
  const content = await readFile(filePath, "utf8");
  await writeFile(filePath, replace(content));
}

function createDefaultAppName(targetRoot: string): string {
  return path.basename(targetRoot) || "my-app";
}

function createDefaultAppId(appName: string): string {
  const slug = appName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^[^a-z]+/, "");

  return `com.capstart.${slug || "app"}`;
}

function createPackageName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "capstart-app"
  );
}

function validateAppId(appId: string): void {
  if (!/^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/.test(appId)) {
    throw new Error(
      `Invalid app id "${appId}". Use reverse-domain notation, for example com.example.app.`,
    );
  }
}

function escapeHtml(value: string): string {
  return escapeXml(value);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
