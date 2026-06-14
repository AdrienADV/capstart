export type FrameworkId =
  | "nextjs"
  | "nuxt"
  | "react-vite"
  | "svelte"
  | "sveltekit"
  | "tanstack-start"
  | "vue";
export type Platform = "ios" | "android";
export type PackageManager = "npm" | "pnpm" | "yarn" | "bun";
export type SetupProfile = "minimal" | "recommended";

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
  detect(project: ProjectContext): boolean;
  validate(project: ProjectContext): Promise<Diagnostic[]>;
  configure(project: ProjectContext, dryRun: boolean): Promise<ConfigureResult>;
  resolveWebDir(project: ProjectContext): Promise<string> | string;
}

export interface InitOptions {
  appId?: string;
  appName?: string;
  directory: string;
  dryRun: boolean;
  framework?: FrameworkId;
  interactive?: boolean;
  yes: boolean;
  platforms: Platform[];
  safeArea?: boolean;
  setup?: SetupProfile;
  skipBuild: boolean;
  skipInstall: boolean;
  skipNative: boolean;
}
