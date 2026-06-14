import { hasDependency } from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";
import {
  resolveViteWebDir,
  validateViteProject,
} from "./vite-config.js";

export const svelteAdapter: FrameworkAdapter = {
  id: "svelte",
  label: "Svelte + Vite",

  detect(project) {
    return (
      hasDependency(project, "svelte") &&
      hasDependency(project, "vite") &&
      !hasDependency(project, "@sveltejs/kit")
    );
  },

  resolveWebDir: resolveViteWebDir,

  async validate(project) {
    return validateViteProject(project);
  },

  async configure() {
    return { disclaimers: [] };
  },
};
