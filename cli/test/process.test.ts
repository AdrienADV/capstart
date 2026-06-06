import assert from "node:assert/strict";
import test from "node:test";
import { runCommand } from "../src/core/process.js";

test("does not print successful command output", async () => {
  const output: string[] = [];
  const originalLog = console.log;
  console.log = (...values: unknown[]) => {
    output.push(values.map(String).join(" "));
  };

  try {
    await runCommand(
      process.execPath,
      ["-e", 'console.log("hidden command output")'],
      process.cwd(),
    );
  } finally {
    console.log = originalLog;
  }

  assert.deepEqual(output, []);
});

test("returns only the last useful lines when a command fails", async () => {
  const script = [
    "for (let index = 1; index <= 20; index += 1) {",
    "  console.error(`line ${index}`);",
    "}",
    "process.exit(1);",
  ].join("\n");

  await assert.rejects(
    runCommand(process.execPath, ["-e", script], process.cwd()),
    (error: Error) => {
      assert.doesNotMatch(error.message, /line 1\n/);
      assert.match(error.message, /line 9/);
      assert.match(error.message, /line 20/);
      return true;
    },
  );
});

test("removes terminal control sequences from command errors", async () => {
  await assert.rejects(
    runCommand(
      process.execPath,
      ["-e", 'console.error("\\u001b[31mclean error\\u001b[0m"); process.exit(1)'],
      process.cwd(),
    ),
    (error: Error) => {
      assert.match(error.message, /clean error/);
      assert.doesNotMatch(error.message, /\u001b/);
      return true;
    },
  );
});
