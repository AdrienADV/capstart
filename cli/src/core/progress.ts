import { spinner } from "@clack/prompts";

export interface Progress {
  message(message: string): void;
  start(message: string): void;
  stop(message: string): void;
}

const silentProgress: Progress = {
  message() {},
  start() {},
  stop() {},
};

export function createProgress(interactive: boolean): Progress {
  return interactive ? spinner() : silentProgress;
}
