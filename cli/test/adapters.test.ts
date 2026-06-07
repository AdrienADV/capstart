import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { nextjsAdapter } from "../src/adapters/nextjs.js";
import { tanstackStartAdapter } from "../src/adapters/tanstack-start.js";
import { configureCapacitor } from "../src/capacitor/configure.js";
import { loadProject } from "../src/core/project.js";

test("configures a standard Next.js project", async () => {
  const root = await createProject({
    dependencies: { next: "^16.0.0" },
    scripts: { build: "next build" },
  });
  const configPath = path.join(root, "next.config.ts");
  await writeFile(
    configPath,
    [
      "const nextConfig = {",
      '  reactStrictMode: true,',
      "};",
      "",
      "export default nextConfig;",
      "",
    ].join("\n"),
  );

  const project = await loadProject(root);
  assert.equal(nextjsAdapter.detect(project), true);
  assert.deepEqual(await nextjsAdapter.validate(project), []);

  const result = await nextjsAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");

  assert.equal(await nextjsAdapter.resolveWebDir(project), "out");
  assert.match(config, /output: "export"/);
  assert.match(config, /trailingSlash: true/);
  assert.match(config, /unoptimized: true/);
  assert.match(config, /reactStrictMode: true/);
  assert.match(result.disclaimers[0].title, /do not run inside the Capacitor app/);
  assert.match(result.disclaimers[0].details.join(" "), /reachable from the device/);
});

test("configures TanStack Start SPA mode without removing prerender options", async () => {
  const root = await createProject({
    dependencies: { "@tanstack/react-start": "^1.0.0" },
    scripts: { build: "vite build" },
  });
  const configPath = path.join(root, "vite.config.ts");
  await writeFile(
    configPath,
    [
      'import { tanstackStart } from "@tanstack/react-start/plugin/vite";',
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      "  plugins: [",
      "    tanstackStart({",
      "      prerender: { enabled: true },",
      "    }),",
      "  ],",
      "});",
      "",
    ].join("\n"),
  );

  const project = await loadProject(root);
  assert.equal(tanstackStartAdapter.detect(project), true);
  assert.deepEqual(await tanstackStartAdapter.validate(project), []);

  const result = await tanstackStartAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");

  assert.equal(await tanstackStartAdapter.resolveWebDir(project), "dist/client");
  assert.match(config, /spa: \{/);
  assert.match(config, /enabled: true/);
  assert.match(config, /outputPath: "\/index\.html"/);
  assert.match(config, /prerender: \{ enabled: true \}/);
  assert.match(result.disclaimers[0].title, /do not run inside the Capacitor app/);
  assert.match(result.disclaimers[0].details.join(" "), /reachable from the device/);
});

test("uses the Nitro public output for TanStack Start", async () => {
  const root = await createProject({
    dependencies: {
      "@tanstack/react-start": "^1.0.0",
      nitro: "latest",
    },
    scripts: { build: "vite build" },
  });
  await writeFile(
    path.join(root, "vite.config.ts"),
    [
      'import { tanstackStart } from "@tanstack/react-start/plugin/vite";',
      'import { nitro as nitroPlugin } from "nitro/vite";',
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      "  plugins: [nitroPlugin(), tanstackStart()],",
      "});",
      "",
    ].join("\n"),
  );
  const project = await loadProject(root);

  assert.equal(
    await tanstackStartAdapter.resolveWebDir(project),
    ".output/public",
  );
});

test("dry-run does not write framework configuration", async () => {
  const root = await createProject({
    dependencies: { next: "^16.0.0" },
    scripts: { build: "next build" },
  });
  const configPath = path.join(root, "next.config.mjs");
  const initial = "export default {};\n";
  await writeFile(configPath, initial);

  const project = await loadProject(root);
  await nextjsAdapter.configure(project, true);

  assert.equal(await readFile(configPath, "utf8"), initial);
});

test("creates Capacitor config and package scripts", async () => {
  const root = await createProject({
    dependencies: { next: "^16.0.0" },
    scripts: { build: "next build" },
  });
  const project = await loadProject(root);

  await configureCapacitor(project, {
    appId: "com.example.app",
    appName: "Example",
    dryRun: false,
    platforms: ["ios", "android"],
    safeArea: false,
    setup: "minimal",
    webDir: "out",
  });

  const config = await readFile(path.join(root, "capacitor.config.ts"), "utf8");
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(config, /appId: "com\.example\.app"/);
  assert.match(config, /webDir: "out"/);
  assert.doesNotMatch(config, /KeyboardResize/);
  assert.doesNotMatch(config, /plugins:/);
  assert.equal(
    packageJson.scripts["cap:sync"],
    "npm run build && npm exec cap -- sync",
  );
  assert.equal(
    packageJson.scripts["cap:ios"],
    "npm run cap:sync && npm exec cap -- open ios",
  );
});

test("creates recommended Capacitor plugin configuration", async () => {
  const root = await createProject({
    dependencies: { next: "^16.0.0" },
    scripts: { build: "next build" },
  });
  const project = await loadProject(root);

  await configureCapacitor(project, {
    appId: "com.example.app",
    appName: "Example",
    dryRun: false,
    platforms: ["ios"],
    safeArea: false,
    setup: "recommended",
    webDir: "out",
  });

  const config = await readFile(path.join(root, "capacitor.config.ts"), "utf8");

  assert.match(
    config,
    /import \{ KeyboardResize, KeyboardStyle \} from "@capacitor\/keyboard";/,
  );
  assert.doesNotMatch(config, /@capacitor\/status-bar/);
  assert.match(config, /resize: KeyboardResize\.Native/);
  assert.match(config, /style: KeyboardStyle\.Default/);
  assert.match(config, /launchShowDuration: 500/);
  assert.match(config, /launchFadeOutDuration: 200/);
  assert.doesNotMatch(config, /StatusBar:/);
});

test("merges recommended plugin defaults into an existing Capacitor config", async () => {
  const root = await createProject({
    dependencies: { next: "^16.0.0" },
    scripts: { build: "next build" },
  });
  const configPath = path.join(root, "capacitor.config.ts");
  await writeFile(
    configPath,
    [
      'import type { CapacitorConfig } from "@capacitor/cli";',
      "",
      "const config: CapacitorConfig = {",
      '  webDir: "dist",',
      "  plugins: {",
      "    CustomPlugin: { enabled: true },",
      "    Keyboard: { customSetting: true, resizeOnFullScreen: false },",
      "    StatusBar: { customSetting: true },",
      "  },",
      "};",
      "",
      "export default config;",
      "",
    ].join("\n"),
  );
  const project = await loadProject(root);

  await configureCapacitor(project, {
    appId: "com.example.app",
    appName: "Example",
    dryRun: false,
    platforms: ["ios", "android"],
    safeArea: false,
    setup: "recommended",
    webDir: "out",
  });
  await configureCapacitor(project, {
    appId: "com.example.app",
    appName: "Example",
    dryRun: false,
    platforms: ["ios", "android"],
    safeArea: false,
    setup: "recommended",
    webDir: "out",
  });

  const config = await readFile(configPath, "utf8");

  assert.match(config, /CustomPlugin: \{ enabled: true \}/);
  assert.match(config, /customSetting: true/);
  assert.match(config, /resizeOnFullScreen: true/);
  assert.match(config, /SplashScreen: \{/);
  assert.match(config, /StatusBar: \{ customSetting: true \}/);
  assert.doesNotMatch(config, /@capacitor\/status-bar/);
  assert.equal(
    config.match(/from "@capacitor\/keyboard"/g)?.length,
    1,
  );
});

test("merges serialized recommended defaults into a JSON Capacitor config", async () => {
  const root = await createProject({
    dependencies: { next: "^16.0.0" },
    scripts: { build: "next build" },
  });
  const configPath = path.join(root, "capacitor.config.json");
  await writeFile(
    configPath,
    `${JSON.stringify(
      {
        plugins: {
          CustomPlugin: { enabled: true },
          Keyboard: { customSetting: true },
          StatusBar: { customSetting: true },
        },
        webDir: "dist",
      },
      null,
      2,
    )}\n`,
  );
  const project = await loadProject(root);

  await configureCapacitor(project, {
    appId: "com.example.app",
    appName: "Example",
    dryRun: false,
    platforms: ["android"],
    safeArea: false,
    setup: "recommended",
    webDir: "out",
  });

  const config = JSON.parse(await readFile(configPath, "utf8")) as {
    plugins: Record<string, Record<string, unknown>>;
    webDir: string;
  };

  assert.equal(config.webDir, "out");
  assert.equal(config.plugins.CustomPlugin.enabled, true);
  assert.equal(config.plugins.Keyboard.customSetting, true);
  assert.equal(config.plugins.Keyboard.resize, "native");
  assert.equal(config.plugins.Keyboard.style, "DEFAULT");
  assert.equal(config.plugins.SplashScreen.launchShowDuration, 500);
  assert.equal(config.plugins.StatusBar.customSetting, true);
  assert.equal(config.plugins.StatusBar.style, undefined);
});

async function createProject(packageJson: Record<string, unknown>) {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-test-"));
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify({ name: "example-app", ...packageJson }, null, 2)}\n`,
  );
  return root;
}
