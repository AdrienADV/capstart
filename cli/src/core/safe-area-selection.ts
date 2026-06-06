import {
  cancel,
  confirm,
  isCancel,
} from "@clack/prompts";

export interface SafeAreaPrompts {
  confirmSafeArea(): Promise<boolean>;
}

export const terminalSafeAreaPrompts: SafeAreaPrompts = {
  async confirmSafeArea() {
    const answer = await confirm({
      message:
        "Add safe area padding? (avoids clock and system UI overlaps)",
      initialValue: true,
    });
    return unwrapPrompt(answer);
  },
};

export async function chooseSafeArea(options: {
  interactive: boolean;
  prompts?: SafeAreaPrompts;
  requested?: boolean;
}): Promise<boolean> {
  if (options.requested !== undefined) {
    return options.requested;
  }

  if (!options.interactive) {
    return false;
  }

  return (options.prompts ?? terminalSafeAreaPrompts).confirmSafeArea();
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Capstart initialization cancelled.");
    throw new Error("Initialization cancelled.");
  }
  return value;
}
