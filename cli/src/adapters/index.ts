import type {
  FrameworkAdapter,
  FrameworkId,
  ProjectContext,
} from "../core/types.js";
import { nextjsAdapter } from "./nextjs.js";
import { nuxtAdapter } from "./nuxt.js";
import { reactViteAdapter } from "./react-vite.js";
import { tanstackStartAdapter } from "./tanstack-start.js";
import { vueAdapter } from "./vue.js";

const adapters: FrameworkAdapter[] = [
  nextjsAdapter,
  nuxtAdapter,
  reactViteAdapter,
  tanstackStartAdapter,
  vueAdapter,
];

export function getAdapter(id: FrameworkId): FrameworkAdapter {
  const adapter = adapters.find((candidate) => candidate.id === id);
  if (!adapter) {
    throw new Error(`Unsupported framework: ${id}`);
  }
  return adapter;
}

export function getAdapters(): FrameworkAdapter[] {
  return adapters;
}

export function detectAdapters(project: ProjectContext): FrameworkAdapter[] {
  return adapters.filter((adapter) => adapter.detect(project));
}
