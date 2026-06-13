import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
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
      interactive: false,
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

test("prints recommended setup guidance when requested", async () => {
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
      interactive: false,
      platforms: ["ios"],
      setup: "recommended",
      skipBuild: true,
      skipInstall: true,
      skipNative: true,
      yes: false,
    });
  } finally {
    console.log = originalLog;
  }

  const text = stripAnsi(output.join("\n"));
  assert.match(text, /Your recommended Capacitor setup is ready\./);
  assert.match(text, /Review native configuration and production setup:/);
  assert.doesNotMatch(text, /Review recommended plugins/);
});

test("configures a Nuxt project with safe area from end to end", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-output-test-"));
  const cssPath = path.join(root, "app/assets/css/main.css");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "example-app",
        dependencies: { nuxt: "^4.0.0" },
        scripts: { build: "nuxt build" },
      },
      null,
      2,
    )}\n`,
  );

  const originalLog = console.log;
  console.log = () => {};
  try {
    await initCommand({
      directory: root,
      dryRun: false,
      framework: "nuxt",
      interactive: false,
      platforms: ["ios"],
      safeArea: true,
      skipBuild: true,
      skipInstall: true,
      skipNative: true,
      yes: false,
    });
  } finally {
    console.log = originalLog;
  }

  const nuxtConfig = await readFile(path.join(root, "nuxt.config.ts"), "utf8");
  const capacitorConfig = await readFile(
    path.join(root, "capacitor.config.ts"),
    "utf8",
  );
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(nuxtConfig, /ssr: false/);
  assert.match(nuxtConfig, /viewport-fit=cover/);
  assert.match(capacitorConfig, /webDir: "\.output\/public"/);
  assert.equal(packageJson.scripts.build, "nuxt generate");
  assert.equal(
    packageJson.scripts["cap:sync"],
    "npm run build && npm exec cap -- sync",
  );
});

test("configures a Vue project with safe area from end to end", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-output-test-"));
  const cssPath = path.join(root, "src/assets/main.css");
  const indexPath = path.join(root, "index.html");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    indexPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "example-app",
        dependencies: { vue: "^3.5.0" },
        devDependencies: { vite: "^7.0.0" },
        scripts: { build: "vite build" },
      },
      null,
      2,
    )}\n`,
  );

  const originalLog = console.log;
  console.log = () => {};
  try {
    await initCommand({
      directory: root,
      dryRun: false,
      framework: "vue",
      interactive: false,
      platforms: ["ios"],
      safeArea: true,
      skipBuild: true,
      skipInstall: true,
      skipNative: true,
      yes: false,
    });
  } finally {
    console.log = originalLog;
  }

  const capacitorConfig = await readFile(
    path.join(root, "capacitor.config.ts"),
    "utf8",
  );
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(await readFile(indexPath, "utf8"), /viewport-fit=cover/);
  assert.match(capacitorConfig, /webDir: "dist"/);
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(
    packageJson.scripts["cap:sync"],
    "npm run build && npm exec cap -- sync",
  );
});

test("configures a React Vite project with safe area from end to end", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-output-test-"));
  const cssPath = path.join(root, "src/index.css");
  const indexPath = path.join(root, "index.html");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    indexPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "example-app",
        dependencies: {
          react: "^19.0.0",
          "react-dom": "^19.0.0",
        },
        devDependencies: { vite: "^8.0.0" },
        scripts: { build: "vite build" },
      },
      null,
      2,
    )}\n`,
  );

  const originalLog = console.log;
  console.log = () => {};
  try {
    await initCommand({
      directory: root,
      dryRun: false,
      framework: "react-vite",
      interactive: false,
      platforms: ["ios"],
      safeArea: true,
      skipBuild: true,
      skipInstall: true,
      skipNative: true,
      yes: false,
    });
  } finally {
    console.log = originalLog;
  }

  const capacitorConfig = await readFile(
    path.join(root, "capacitor.config.ts"),
    "utf8",
  );
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(await readFile(indexPath, "utf8"), /viewport-fit=cover/);
  assert.match(capacitorConfig, /webDir: "dist"/);
  assert.equal(packageJson.scripts.build, "vite build");
  assert.equal(
    packageJson.scripts["cap:sync"],
    "npm run build && npm exec cap -- sync",
  );
});

function stripAnsi(value: string): string {
  return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, "");
}
