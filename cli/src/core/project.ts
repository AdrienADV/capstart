import { access, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type {
  PackageJson,
  PackageManager,
  ProjectContext,
} from "./types.js";

const lockfiles: Array<[string, PackageManager]> = [
  ["bun.lock", "bun"],
  ["bun.lockb", "bun"],
  ["pnpm-lock.yaml", "pnpm"],
  ["yarn.lock", "yarn"],
  ["package-lock.json", "npm"],
];

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadProject(directory: string): Promise<ProjectContext> {
  const root = path.resolve(directory);
  const packageJsonPath = path.join(root, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    throw new Error(`No package.json found in ${root}`);
  }

  const packageJson = JSON.parse(
    await readFile(packageJsonPath, "utf8"),
  ) as PackageJson;

  return {
    root,
    packageJsonPath,
    packageJson,
    packageManager: await detectPackageManager(root, packageJson),
  };
}

export async function savePackageJson(
  project: ProjectContext,
  dryRun: boolean,
): Promise<void> {
  if (dryRun) {
    return;
  }

  await writeFile(
    project.packageJsonPath,
    `${JSON.stringify(project.packageJson, null, 2)}\n`,
  );
}

export function hasDependency(
  project: ProjectContext,
  dependency: string,
): boolean {
  return Boolean(
    project.packageJson.dependencies?.[dependency] ??
      project.packageJson.devDependencies?.[dependency],
  );
}

export function getProjectName(project: ProjectContext): string {
  const rawName = project.packageJson.name ?? path.basename(project.root);
  return rawName.replace(/^@[^/]+\//, "");
}

export function createDefaultAppId(project: ProjectContext): string {
  const slug = getProjectName(project)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^[^a-z]+/, "");

  return `com.capstart.${slug || "app"}`;
}

async function detectPackageManager(
  root: string,
  packageJson: PackageJson,
): Promise<PackageManager> {
  for (const [lockfile, packageManager] of lockfiles) {
    if (await pathExists(path.join(root, lockfile))) {
      return packageManager;
    }
  }

  if (typeof packageJson.packageManager === "string") {
    const packageManager = packageJson.packageManager.split("@")[0];
    if (
      packageManager === "npm" ||
      packageManager === "pnpm" ||
      packageManager === "yarn" ||
      packageManager === "bun"
    ) {
      return packageManager;
    }
  }

  return "npm";
}
