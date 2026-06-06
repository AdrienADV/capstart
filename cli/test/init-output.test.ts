import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { initCommand } from "../src/commands/init.js";

test("prints a concise final flow with the disclaimer last", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-output-test-"));
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "example-app",
        dependencies: { next: "^16.0.0" },
        scripts: { build: "next build" },
      },
      null,
      2,
    )}\n`,
  );

  const output: string[] = [];
  const originalLog = console.log;
  console.log = (...values: unknown[]) => {
    output.push(values.map(String).join(" "));
  };

  try {
    await initCommand({
      directory: root,
      dryRun: false,
      framework: "nextjs",
      platforms: ["ios", "android"],
      skipBuild: true,
      skipInstall: true,
      skipNative: true,
      yes: false,
    });
  } finally {
    console.log = originalLog;
  }

  const text = stripAnsi(output.join("\n"));
  assert.doesNotMatch(text, /Package manager/);
  assert.doesNotMatch(text, /Configuration/);
  assert.doesNotMatch(text, /Inspecting/);
  assert.match(text, /Ready\n✓ Your base Capacitor setup is ready\./);
  assert.match(
    text,
    /Scripts added\n  npm run cap:sync\n    Build the web app and sync the native projects\./,
  );
  assert.match(
    text,
    /npm run cap:ios\n    Build, sync, and open the iOS project in Xcode\./,
  );
  assert.match(
    text,
    /npm run cap:android\n    Build, sync, and open the Android project in Android Studio\./,
  );
  assert.match(text, /Next steps/);
  assert.match(
    text,
    /https:\/\/capstart\.dev\/docs\/installation\/#3-add-recommended-capacitor-base-plugins/,
  );
  assert.doesNotMatch(text, /Added Capacitor scripts/);
  assert.ok(
    text
      .trim()
      .replace(/\s+/g, " ")
      .endsWith(
      'Do not use "localhost" for the backend URL: on a phone or emulator, it points to the device itself.',
    ),
  );
});

function stripAnsi(value: string): string {
  return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "");
}
