import {
  cancel,
  isCancel,
  text,
} from "@clack/prompts";

export interface AppConfigPrompts {
  enterAppId(defaultValue: string): Promise<string>;
  enterAppName(defaultValue: string): Promise<string>;
}

export const terminalAppConfigPrompts: AppConfigPrompts = {
  async enterAppId(defaultValue) {
    const answer = await text({
      message: "Native app id",
      placeholder: "com.example.app",
      initialValue: defaultValue,
    });
    return unwrapPrompt(answer).trim();
  },

  async enterAppName(defaultValue) {
    const answer = await text({
      message: "Native app name",
      placeholder: "My App",
      initialValue: defaultValue,
    });
    return unwrapPrompt(answer).trim();
  },
};

export async function chooseAppId(options: {
  defaultValue: string;
  interactive: boolean;
  prompts?: AppConfigPrompts;
  requested?: string;
}): Promise<string> {
  if (options.requested) {
    return options.requested;
  }

  if (!options.interactive) {
    return options.defaultValue;
  }

  const value = await (options.prompts ?? terminalAppConfigPrompts).enterAppId(
    options.defaultValue,
  );
  return value || options.defaultValue;
}

export async function chooseAppName(options: {
  defaultValue: string;
  interactive: boolean;
  prompts?: AppConfigPrompts;
  requested?: string;
}): Promise<string> {
  if (options.requested) {
    return options.requested;
  }

  if (!options.interactive) {
    return options.defaultValue;
  }

  const value = await (options.prompts ?? terminalAppConfigPrompts).enterAppName(
    options.defaultValue,
  );
  return value || options.defaultValue;
}

function unwrapPrompt<T>(value: T | symbol): T {
  if (isCancel(value)) {
    cancel("Capstart app creation cancelled.");
    throw new Error("App creation cancelled.");
  }
  return value;
}
