import { hasDependency } from "../core/project.js";
import type { FrameworkAdapter } from "../core/types.js";
import {
  resolveViteWebDir,
  validateViteProject,
} from "./vite-config.js";

export const reactViteAdapter: FrameworkAdapter = {
  id: "react-vite",
  label: "React + Vite",

  detect(project) {
    return (
      hasDependency(project, "react") &&
      hasDependency(project, "react-dom") &&
      hasDependency(project, "vite") &&
      !hasDependency(project, "next") &&
      !hasDependency(project, "@react-router/dev") &&
      !hasDependency(project, "@remix-run/dev") &&
      !hasDependency(project, "@tanstack/react-start")
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
