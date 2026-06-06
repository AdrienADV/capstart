export type FrameworkId = "nextjs" | "tanstack-start";
export type Platform = "ios" | "android";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

export interface PackageJson {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export interface ProjectContext {
  root: string;
  packageJsonPath: string;
  packageJson: PackageJson;
  packageManager: PackageManager;
}

export interface Diagnostic {
  level: "warning" | "error";
  message: string;
}

export interface ConfigureResult {
  disclaimers: Disclaimer[];
}

export interface Disclaimer {
  details: string[];
  title: string;
}

export interface FrameworkAdapter {
  id: FrameworkId;
  label: string;
  webDir: string;
  detect(project: ProjectContext): boolean;
  validate(project: ProjectContext): Promise<Diagnostic[]>;
  configure(project: ProjectContext, dryRun: boolean): Promise<ConfigureResult>;
}

export interface InitOptions {
  appId?: string;
  appName?: string;
  directory: string;
  dryRun: boolean;
  framework?: FrameworkId;
  yes: boolean;
  platforms: Platform[];
  skipBuild: boolean;
  skipInstall: boolean;
  skipNative: boolean;
}
