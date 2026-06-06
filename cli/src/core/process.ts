import { spawn } from "node:child_process";
import type { PackageManager } from "./types.js";

export async function runCommand(
  command: string,
  args: string[],
  cwd: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      shell: process.platform === "win32",
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command failed with exit code ${code ?? "unknown"}: ${command} ${args.join(" ")}`,
        ),
      );
    });
  });
}

export async function commandExists(
  command: string,
  args: string[] = ["--version"],
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, args, {
      shell: process.platform === "win32",
      stdio: "ignore",
    });

    child.on("error", () => resolve(false));
    child.on("exit", (code) => resolve(code === 0));
  });
}

export function installCommand(
  packageManager: PackageManager,
  packages: string[],
  dev: boolean,
): [string, string[]] {
  const devFlag = dev ? ["-D"] : [];

  switch (packageManager) {
    case "bun":
      return ["bun", ["add", ...devFlag, ...packages]];
    case "pnpm":
      return ["pnpm", ["add", ...devFlag, ...packages]];
    case "yarn":
      return ["yarn", ["add", ...devFlag, ...packages]];
    case "npm":
      return ["npm", ["install", ...(dev ? ["--save-dev"] : []), ...packages]];
  }
}

export function runScriptCommand(
  packageManager: PackageManager,
  script: string,
): [string, string[]] {
  switch (packageManager) {
    case "yarn":
      return ["yarn", [script]];
    case "bun":
      return ["bun", ["run", script]];
    case "pnpm":
      return ["pnpm", ["run", script]];
    case "npm":
      return ["npm", ["run", script]];
  }
}

export function capacitorCommand(
  packageManager: PackageManager,
  args: string[],
): [string, string[]] {
  switch (packageManager) {
    case "bun":
      return ["bunx", ["cap", ...args]];
    case "pnpm":
      return ["pnpm", ["exec", "cap", ...args]];
    case "yarn":
      return ["yarn", ["cap", ...args]];
    case "npm":
      return ["npm", ["exec", "cap", "--", ...args]];
  }
}

export function packageScriptPrefix(packageManager: PackageManager): string {
  switch (packageManager) {
    case "yarn":
      return "yarn";
    case "bun":
      return "bun run";
    case "pnpm":
      return "pnpm run";
    case "npm":
      return "npm run";
  }
}

export function capacitorScriptPrefix(packageManager: PackageManager): string {
  switch (packageManager) {
    case "bun":
      return "bunx cap";
    case "pnpm":
      return "pnpm exec cap";
    case "yarn":
      return "yarn cap";
    case "npm":
      return "npm exec cap --";
  }
}
