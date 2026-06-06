import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { configureCapacitor } from "../src/capacitor/configure.js";
import { configureSafeArea } from "../src/core/safe-area.js";
import { loadProject } from "../src/core/project.js";

test("adds Capacitor 8 safe area variables and viewport fit to TanStack Start", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/styles.css");
  const rootRoutePath = path.join(root, "src/routes/__root.tsx");
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    rootRoutePath,
    [
      "const head = {",
      "  meta: [",
      "    { name: 'viewport', content: 'width=device-width, initial-scale=1' },",
      "  ],",
      "};",
      "",
    ].join("\n"),
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "tanstack-start", false);
  await configureSafeArea(project, "tanstack-start", false);

  const css = await readFile(cssPath, "utf8");
  const rootRoute = await readFile(rootRoutePath, "utf8");

  assert.equal(css.match(/Capstart safe area insets/g)?.length, 1);
  assert.match(
    css,
    /padding-top: var\(--safe-area-inset-top, env\(safe-area-inset-top, 0px\)\)/,
  );
  assert.match(
    css,
    /padding-bottom: var\(--safe-area-inset-bottom, env\(safe-area-inset-bottom, 0px\)\)/,
  );
  assert.match(rootRoute, /viewport-fit=cover/);
});

test("adds viewportFit to a Next.js app layout", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "app/globals.css");
  const layoutPath = path.join(root, "app/layout.tsx");
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    layoutPath,
    "export default function Layout() { return null; }\n",
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "nextjs", false);

  const layout = await readFile(layoutPath, "utf8");
  assert.match(layout, /export const viewport = \{ viewportFit: "cover" \}/);
});

test("adds viewport fit to a Next.js pages document", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/styles/globals.css");
  const documentPath = path.join(root, "src/pages/_document.tsx");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await mkdir(path.dirname(documentPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    documentPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "nextjs", false);

  assert.match(await readFile(documentPath, "utf8"), /viewport-fit=cover/);
});

test("adds SystemBars CSS inset handling to Capacitor config", async () => {
  const root = await createProject();
  const project = await loadProject(root);

  await configureCapacitor(project, {
    appId: "com.example.app",
    appName: "Example",
    dryRun: false,
    platforms: ["ios", "android"],
    safeArea: true,
    setup: "recommended",
    webDir: "dist",
  });

  const config = await readFile(path.join(root, "capacitor.config.ts"), "utf8");
  assert.match(config, /SystemBars: \{/);
  assert.match(config, /insetsHandling: "css"/);
  assert.match(config, /Keyboard: \{/);
});

async function createProject() {
  const root = await mkdtemp(path.join(os.tmpdir(), "capstart-safe-area-test-"));
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify(
      {
        name: "example-app",
        scripts: { build: "vite build" },
      },
      null,
      2,
    )}\n`,
  );
  await Promise.all([
    mkdir(path.join(root, "src/routes"), { recursive: true }),
    mkdir(path.join(root, "app"), { recursive: true }),
  ]);
  return root;
}
