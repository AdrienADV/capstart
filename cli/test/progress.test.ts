import assert from "node:assert/strict";
import test from "node:test";
import { createProgress } from "../src/core/progress.js";

test("uses silent progress outside an interactive terminal", () => {
  const output: string[] = [];
  const originalWrite = process.stdout.write;
  process.stdout.write = ((chunk: string | Uint8Array) => {
    output.push(String(chunk));
    return true;
  }) as typeof process.stdout.write;

  try {
    const progress = createProgress(false);
    progress.start("Configuring Next.js");
    progress.message("Installing Capacitor packages");
    progress.stop("Capacitor setup complete");
  } finally {
    process.stdout.write = originalWrite;
  }

  assert.deepEqual(output, []);
});
