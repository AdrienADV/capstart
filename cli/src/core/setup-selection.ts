import {
  cancel,
  isCancel,
  select,
} from "@clack/prompts";
import type { SetupProfile } from "./types.js";

export interface SetupPrompts {
  selectSetup(): Promise<SetupProfile>;
}

export const terminalSetupPrompts: SetupPrompts = {
  async selectSetup() {
    const answer = await select({
      message: "Which Capacitor setup should Capstart install?",
      initialValue: "recommended",
      options: [
        {
          value: "minimal",
          label: "Minimal",
          hint: "Capacitor core and selected native platforms",
        },
        {
          value: "recommended",
          label: "Recommended",
          hint: "Minimal plus common mobile behavior plugins",
        },
      ],
    });
    return unwrapPrompt(answer) as SetupProfile;
  },
};

export async function chooseSetup(options: {
  interactive: boolean;
  prompts?: SetupPrompts;
  requested?: SetupProfile;
}): Promise<SetupProfile> {
  if (options.requested) {
    return options.requested;
  }

  if (!options.interactive) {
    return "minimal";
  }

  return (options.prompts ?? terminalSetupPrompts).selectSetup();
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Capstart initialization cancelled.");
    throw new Error("Initialization cancelled.");
  }
  return value;
}
