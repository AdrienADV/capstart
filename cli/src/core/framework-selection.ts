import {
  cancel,
  confirm,
  isCancel,
  select,
} from "@clack/prompts";
import { getAdapter, getAdapters } from "../adapters/index.js";
import type { FrameworkAdapter, FrameworkId } from "./types.js";

export interface FrameworkPrompts {
  confirmDetected(adapter: FrameworkAdapter): Promise<boolean>;
  selectFramework(adapters: FrameworkAdapter[]): Promise<FrameworkId>;
}

export const terminalFrameworkPrompts: FrameworkPrompts = {
  async confirmDetected(adapter) {
    const answer = await confirm({
      message: `Use the detected framework ${adapter.label}?`,
      initialValue: true,
    });
    return unwrapPrompt(answer);
  },

  async selectFramework(adapters) {
    const answer = await select({
      message: "Which framework should Capstart configure?",
      options: adapters.map((adapter) => ({
        value: adapter.id,
        label: adapter.label,
      })),
    });
    return unwrapPrompt(answer);
  },
};

export async function chooseAdapter(options: {
  acceptDetected: boolean;
  detected: FrameworkAdapter[];
  interactive: boolean;
  prompts?: FrameworkPrompts;
  requested?: FrameworkId;
}): Promise<FrameworkAdapter> {
  if (options.requested) {
    return getAdapter(options.requested);
  }

  if (options.detected.length === 1 && options.acceptDetected) {
    return options.detected[0];
  }

  if (!options.interactive) {
    if (options.detected.length === 1) {
      throw new Error(
        `Detected ${options.detected[0].label}, but confirmation requires an interactive terminal. Pass --yes to accept it or --framework to choose explicitly.`,
      );
    }

    throw new Error(
      "Framework selection requires an interactive terminal. Pass --framework nextjs, --framework nuxt, --framework tanstack-start, or --framework vue.",
    );
  }

  const prompts = options.prompts ?? terminalFrameworkPrompts;
  if (
    options.detected.length === 1 &&
    (await prompts.confirmDetected(options.detected[0]))
  ) {
    return options.detected[0];
  }

  return getAdapter(await prompts.selectFramework(getAdapters()));
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Capstart initialization cancelled.");
    throw new Error("Initialization cancelled.");
  }
  return value;
}
