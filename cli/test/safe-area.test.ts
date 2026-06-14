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

test("adds viewport fit to Nuxt app head configuration", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "app/assets/css/main.css");
  const configPath = path.join(root, "nuxt.config.ts");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    configPath,
    [
      "export default defineNuxtConfig({",
      "  app: {",
      "    head: {",
      "      meta: [{ name: 'description', content: 'Example' }],",
      "    },",
      "  },",
      "});",
      "",
    ].join("\n"),
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "nuxt", false);
  await configureSafeArea(project, "nuxt", false);

  const css = await readFile(cssPath, "utf8");
  const config = await readFile(configPath, "utf8");
  assert.equal(css.match(/Capstart safe area insets/g)?.length, 1);
  assert.equal(config.match(/viewport-fit=cover/g)?.length, 1);
  assert.match(config, /name: 'description'/);
});

test("adds safe area CSS and viewport fit to a Vue Vite project", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/assets/main.css");
  const indexPath = path.join(root, "index.html");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    indexPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "vue", false);
  await configureSafeArea(project, "vue", false);

  assert.equal(
    (await readFile(cssPath, "utf8")).match(/Capstart safe area insets/g)
      ?.length,
    1,
  );
  assert.equal(
    (await readFile(indexPath, "utf8")).match(/viewport-fit=cover/g)?.length,
    1,
  );
});

test("adds safe area CSS and viewport fit to a React Vite project", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/index.css");
  const indexPath = path.join(root, "index.html");
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    indexPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "react-vite", false);
  await configureSafeArea(project, "react-vite", false);

  assert.equal(
    (await readFile(cssPath, "utf8")).match(/Capstart safe area insets/g)
      ?.length,
    1,
  );
  assert.equal(
    (await readFile(indexPath, "utf8")).match(/viewport-fit=cover/g)?.length,
    1,
  );
});

test("adds safe area CSS and viewport fit to a Svelte Vite project", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/app.css");
  const indexPath = path.join(root, "index.html");
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    indexPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "svelte", false);
  await configureSafeArea(project, "svelte", false);

  assert.equal(
    (await readFile(cssPath, "utf8")).match(/Capstart safe area insets/g)
      ?.length,
    1,
  );
  assert.equal(
    (await readFile(indexPath, "utf8")).match(/viewport-fit=cover/g)?.length,
    1,
  );
});

test("adds safe area CSS and viewport fit to a SvelteKit project", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/app.css");
  const appTemplatePath = path.join(root, "src/app.html");
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    appTemplatePath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "sveltekit", false);
  await configureSafeArea(project, "sveltekit", false);

  assert.equal(
    (await readFile(cssPath, "utf8")).match(/Capstart safe area insets/g)
      ?.length,
    1,
  );
  assert.equal(
    (await readFile(appTemplatePath, "utf8")).match(/viewport-fit=cover/g)
      ?.length,
    1,
  );
});

test("adds viewport fit to a Vue CLI public index", async () => {
  const root = await createProject();
  const cssPath = path.join(root, "src/assets/main.css");
  const indexPath = path.join(root, "public/index.html");
  await mkdir(path.dirname(cssPath), { recursive: true });
  await mkdir(path.dirname(indexPath), { recursive: true });
  await writeFile(cssPath, "body { margin: 0; }\n");
  await writeFile(
    indexPath,
    '<meta name="viewport" content="width=device-width, initial-scale=1" />\n',
  );
  const project = await loadProject(root);

  await configureSafeArea(project, "vue", false);

  assert.match(await readFile(indexPath, "utf8"), /viewport-fit=cover/);
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
