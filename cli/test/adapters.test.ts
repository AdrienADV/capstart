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

  await nextjsAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");

  assert.match(config, /output: "export"/);
  assert.match(config, /trailingSlash: true/);
  assert.match(config, /unoptimized: true/);
  assert.match(config, /reactStrictMode: true/);
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

  await tanstackStartAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");

  assert.match(config, /spa: \{/);
  assert.match(config, /enabled: true/);
  assert.match(config, /outputPath: "\/index\.html"/);
  assert.match(config, /prerender: \{ enabled: true \}/);
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
    webDir: "out",
  });

  const config = await readFile(path.join(root, "capacitor.config.ts"), "utf8");
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.match(config, /appId: "com\.example\.app"/);
  assert.match(config, /webDir: "out"/);
  assert.equal(
    packageJson.scripts["cap:sync"],
    "npm run build && npm exec cap -- sync",
  );
  assert.equal(
    packageJson.scripts["cap:ios"],
    "npm run cap:sync && npm exec cap -- open ios",
  );
});

async function createProject(packageJson: Record<string, unknown>) {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-test-"));
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify({ name: "example-app", ...packageJson }, null, 2)}\n`,
  );
  return root;
}
