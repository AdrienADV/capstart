import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { nextjsAdapter } from "../src/adapters/nextjs.js";
import { nuxtAdapter } from "../src/adapters/nuxt.js";
import { reactViteAdapter } from "../src/adapters/react-vite.js";
import { svelteAdapter } from "../src/adapters/svelte.js";
import { svelteKitAdapter } from "../src/adapters/sveltekit.js";
import { tanstackStartAdapter } from "../src/adapters/tanstack-start.js";
import { vueAdapter } from "../src/adapters/vue.js";
import { configureCapacitor } from "../src/capacitor/configure.js";
import { loadProject, pathExists } from "../src/core/project.js";

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

test("configures a standard Nuxt project for a client-only static build", async () => {
  const root = await createProject({
    dependencies: { nuxt: "^4.0.0" },
    scripts: { build: "nuxt build" },
  });
  const configPath = path.join(root, "nuxt.config.ts");
  await writeFile(
    configPath,
    [
      "export default defineNuxtConfig({",
      '  modules: ["@nuxtjs/tailwindcss"],',
      "});",
      "",
    ].join("\n"),
  );

  const project = await loadProject(root);
  assert.equal(nuxtAdapter.detect(project), true);
  assert.deepEqual(await nuxtAdapter.validate(project), []);

  const result = await nuxtAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as { scripts: Record<string, string> };

  assert.equal(await nuxtAdapter.resolveWebDir(project), ".output/public");
  assert.match(config, /ssr: false/);
  assert.match(config, /@nuxtjs\/tailwindcss/);
  assert.equal(packageJson.scripts.build, "nuxt generate");
  assert.match(result.disclaimers[0].title, /do not run inside the Capacitor app/);
  assert.match(result.disclaimers[0].details.join(" "), /Nitro handlers/);
});

test("creates a Nuxt config when the project does not have one", async () => {
  const root = await createProject({
    dependencies: { nuxt: "^4.0.0" },
    scripts: { build: "nuxt build" },
  });
  const project = await loadProject(root);

  await nuxtAdapter.configure(project, false);

  assert.match(
    await readFile(path.join(root, "nuxt.config.ts"), "utf8"),
    /ssr: false/,
  );
});

test("configures a standard Vue Vite project without changing it", async () => {
  const root = await createProject({
    dependencies: { vue: "^3.5.0" },
    devDependencies: { vite: "^7.0.0" },
    scripts: { build: "vite build" },
  });
  const packageJsonPath = path.join(root, "package.json");
  const initialPackageJson = await readFile(packageJsonPath, "utf8");
  const project = await loadProject(root);

  assert.equal(vueAdapter.detect(project), true);
  assert.deepEqual(await vueAdapter.validate(project), []);

  const result = await vueAdapter.configure(project, false);

  assert.equal(await vueAdapter.resolveWebDir(project), "dist");
  assert.deepEqual(result.disclaimers, []);
  assert.equal(await readFile(packageJsonPath, "utf8"), initialPackageJson);
});

test("configures a standard React Vite project without changing it", async () => {
  const root = await createProject({
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: { vite: "^8.0.0" },
    scripts: { build: "vite build" },
  });
  const packageJsonPath = path.join(root, "package.json");
  const initialPackageJson = await readFile(packageJsonPath, "utf8");
  const project = await loadProject(root);

  assert.equal(reactViteAdapter.detect(project), true);
  assert.deepEqual(await reactViteAdapter.validate(project), []);

  const result = await reactViteAdapter.configure(project, false);

  assert.equal(await reactViteAdapter.resolveWebDir(project), "dist");
  assert.deepEqual(result.disclaimers, []);
  assert.equal(await readFile(packageJsonPath, "utf8"), initialPackageJson);
});

test("configures a standard Svelte Vite project without changing it", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/vite-plugin-svelte": "^7.0.0",
      svelte: "^5.0.0",
      vite: "^8.0.0",
    },
    scripts: { build: "vite build" },
  });
  const packageJsonPath = path.join(root, "package.json");
  const initialPackageJson = await readFile(packageJsonPath, "utf8");
  const project = await loadProject(root);

  assert.equal(svelteAdapter.detect(project), true);
  assert.deepEqual(await svelteAdapter.validate(project), []);

  const result = await svelteAdapter.configure(project, false);

  assert.equal(await svelteAdapter.resolveWebDir(project), "dist");
  assert.deepEqual(result.disclaimers, []);
  assert.equal(await readFile(packageJsonPath, "utf8"), initialPackageJson);
});

test("configures the current SvelteKit Vite config for a Capacitor SPA", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/adapter-auto": "^7.0.0",
      "@sveltejs/kit": "^2.63.0",
      svelte: "^5.56.0",
      vite: "^8.0.0",
    },
    scripts: { build: "vite build" },
  });
  const configPath = path.join(root, "vite.config.ts");
  await writeFile(
    configPath,
    [
      'import adapter from "@sveltejs/adapter-auto";',
      'import { sveltekit } from "@sveltejs/kit/vite";',
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      "  plugins: [",
      "    sveltekit({",
      "      compilerOptions: { runes: true },",
      "      // adapter-auto only supports some environments.",
      "      // If your environment is not supported, switch out the adapter.",
      "      // See https://svelte.dev/docs/kit/adapters for more information.",
      "      adapter: adapter(),",
      "    }),",
      "  ],",
      "});",
      "",
    ].join("\n"),
  );

  const project = await loadProject(root);
  assert.equal(svelteKitAdapter.detect(project), true);
  assert.equal(svelteAdapter.detect(project), false);
  assert.deepEqual(await svelteKitAdapter.validate(project), []);
  assert.equal(await svelteKitAdapter.resolveWebDir(project), "build");

  const result = await svelteKitAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");
  const rootLayout = await readFile(
    path.join(root, "src/routes/+layout.js"),
    "utf8",
  );
  const packageJson = JSON.parse(
    await readFile(path.join(root, "package.json"), "utf8"),
  ) as {
    devDependencies: Record<string, string>;
  };

  assert.match(config, /@sveltejs\/adapter-static/);
  assert.doesNotMatch(config, /@sveltejs\/adapter-auto/);
  assert.doesNotMatch(config, /adapter-auto only supports/);
  assert.doesNotMatch(config, /If your environment is not supported/);
  assert.match(config, /fallback: "index\.html"/);
  assert.match(config, /compilerOptions: \{ runes: true \}/);
  assert.equal(rootLayout, "export const ssr = false;\n");
  assert.equal(packageJson.devDependencies["@sveltejs/adapter-auto"], undefined);
  assert.equal(
    packageJson.devDependencies["@sveltejs/adapter-static"],
    "^3.0.0",
  );
  assert.match(result.disclaimers[0].details.join(" "), /remote functions/);
});

test("configures a legacy SvelteKit config and preserves static options", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/adapter-static": "^3.0.10",
      "@sveltejs/kit": "^2.0.0",
      svelte: "^5.0.0",
      vite: "^7.0.0",
    },
    scripts: { build: "vite build" },
  });
  await writeFile(
    path.join(root, "vite.config.js"),
    [
      'import { sveltekit } from "@sveltejs/kit/vite";',
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({ plugins: [sveltekit()] });",
      "",
    ].join("\n"),
  );
  const configPath = path.join(root, "svelte.config.js");
  await writeFile(
    configPath,
    [
      'import adapter from "@sveltejs/adapter-static";',
      "",
      "const config = {",
      "  kit: {",
      "    adapter: adapter({",
      '      pages: "build/mobile",',
      '      assets: "build/mobile",',
      "      precompress: true,",
      "    }),",
      "  },",
      "};",
      "",
      "export default config;",
      "",
    ].join("\n"),
  );
  await writeFile(
    path.join(root, "src/routes/+layout.ts"),
    "export const prerender = true;\nexport const ssr = true;\n",
  );

  const project = await loadProject(root);
  assert.deepEqual(await svelteKitAdapter.validate(project), []);
  assert.equal(
    await svelteKitAdapter.resolveWebDir(project),
    "build/mobile",
  );

  await svelteKitAdapter.configure(project, false);
  const config = await readFile(configPath, "utf8");
  const rootLayout = await readFile(
    path.join(root, "src/routes/+layout.ts"),
    "utf8",
  );

  assert.match(config, /pages: "build\/mobile"/);
  assert.match(config, /assets: "build\/mobile"/);
  assert.match(config, /precompress: true/);
  assert.match(config, /fallback: "index\.html"/);
  assert.match(rootLayout, /prerender = true/);
  assert.match(rootLayout, /ssr = false/);
});

test("rejects split SvelteKit adapter-static output directories", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/adapter-static": "^3.0.0",
      "@sveltejs/kit": "^2.0.0",
      svelte: "^5.0.0",
      vite: "^8.0.0",
    },
    scripts: { build: "vite build" },
  });
  await writeFile(
    path.join(root, "vite.config.ts"),
    [
      'import adapter from "@sveltejs/adapter-static";',
      'import { sveltekit } from "@sveltejs/kit/vite";',
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      "  plugins: [sveltekit({",
      '    adapter: adapter({ pages: "pages", assets: "assets" }),',
      "  })],",
      "});",
      "",
    ].join("\n"),
  );

  await assert.rejects(
    async () => svelteKitAdapter.resolveWebDir(await loadProject(root)),
    /pages and assets to use the same output directory/,
  );
});

test("warns when SvelteKit server route files are present", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/adapter-auto": "^7.0.0",
      "@sveltejs/kit": "^2.0.0",
      svelte: "^5.0.0",
      vite: "^8.0.0",
    },
    scripts: { build: "vite build" },
  });
  await writeFile(
    path.join(root, "vite.config.ts"),
    [
      'import adapter from "@sveltejs/adapter-auto";',
      'import { sveltekit } from "@sveltejs/kit/vite";',
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      "  plugins: [sveltekit({ adapter: adapter() })],",
      "});",
      "",
    ].join("\n"),
  );
  await writeFile(
    path.join(root, "src/routes/+page.server.ts"),
    "export const load = () => ({});\n",
  );

  const diagnostics = await svelteKitAdapter.validate(await loadProject(root));

  assert.equal(diagnostics.length, 1);
  assert.equal(diagnostics[0].level, "warning");
  assert.match(diagnostics[0].message, /src\/routes\/\+page\.server\.ts/);
});

test("resolves a custom React Vite output directory", async () => {
  const root = await createProject({
    dependencies: {
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: { vite: "^8.0.0" },
    scripts: { build: "vite build" },
  });
  await writeFile(
    path.join(root, "vite.config.ts"),
    [
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      '  build: { outDir: "build/mobile" },',
      "});",
      "",
    ].join("\n"),
  );

  assert.equal(
    await reactViteAdapter.resolveWebDir(await loadProject(root)),
    "build/mobile",
  );
});

test("resolves custom Vue Vite and Vue CLI output directories", async () => {
  const viteRoot = await createProject({
    dependencies: { vue: "^3.5.0" },
    devDependencies: { vite: "^7.0.0" },
    scripts: { build: "vite build" },
  });
  await writeFile(
    path.join(viteRoot, "vite.config.ts"),
    [
      'import { defineConfig } from "vite";',
      "",
      "export default defineConfig({",
      '  build: { outDir: "build/mobile" },',
      "});",
      "",
    ].join("\n"),
  );

  const vueCliRoot = await createProject({
    dependencies: { vue: "^3.5.0" },
    devDependencies: { "@vue/cli-service": "^5.0.0" },
    scripts: { build: "vue-cli-service build" },
  });
  await writeFile(
    path.join(vueCliRoot, "vue.config.js"),
    'module.exports = { outputDir: "build/vue" };\n',
  );

  assert.equal(
    await vueAdapter.resolveWebDir(await loadProject(viteRoot)),
    "build/mobile",
  );
  assert.equal(
    await vueAdapter.resolveWebDir(await loadProject(vueCliRoot)),
    "build/vue",
  );
});

test("does not detect Nuxt as a standalone Vue project", async () => {
  const root = await createProject({
    dependencies: {
      nuxt: "^4.0.0",
      vue: "^3.5.0",
    },
    devDependencies: { vite: "^7.0.0" },
    scripts: { build: "nuxt build" },
  });

  assert.equal(vueAdapter.detect(await loadProject(root)), false);
});

test("does not detect SvelteKit as standalone Svelte", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/kit": "^2.0.0",
      svelte: "^5.0.0",
      vite: "^8.0.0",
    },
    scripts: { build: "vite build" },
  });

  assert.equal(svelteAdapter.detect(await loadProject(root)), false);
  assert.equal(svelteKitAdapter.detect(await loadProject(root)), true);
});

test("does not detect React frameworks as standalone React Vite projects", async () => {
  const nextRoot = await createProject({
    dependencies: {
      next: "^16.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: { vite: "^8.0.0" },
    scripts: { build: "next build" },
  });
  const tanstackRoot = await createProject({
    dependencies: {
      "@tanstack/react-start": "^1.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: { vite: "^8.0.0" },
    scripts: { build: "vite build" },
  });
  const reactRouterRoot = await createProject({
    dependencies: {
      "@react-router/dev": "^7.0.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: { vite: "^8.0.0" },
    scripts: { build: "react-router build" },
  });

  assert.equal(reactViteAdapter.detect(await loadProject(nextRoot)), false);
  assert.equal(reactViteAdapter.detect(await loadProject(tanstackRoot)), false);
  assert.equal(
    reactViteAdapter.detect(await loadProject(reactRouterRoot)),
    false,
  );
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

test("Nuxt dry-run does not write framework configuration or package scripts", async () => {
  const root = await createProject({
    dependencies: { nuxt: "^4.0.0" },
    scripts: { build: "nuxt build" },
  });
  const configPath = path.join(root, "nuxt.config.ts");
  const packageJsonPath = path.join(root, "package.json");
  const initialConfig = "export default defineNuxtConfig({});\n";
  const initialPackageJson = await readFile(packageJsonPath, "utf8");
  await writeFile(configPath, initialConfig);

  const project = await loadProject(root);
  await nuxtAdapter.configure(project, true);

  assert.equal(await readFile(configPath, "utf8"), initialConfig);
  assert.equal(await readFile(packageJsonPath, "utf8"), initialPackageJson);
});

test("SvelteKit dry-run does not write framework configuration or package dependencies", async () => {
  const root = await createProject({
    devDependencies: {
      "@sveltejs/adapter-auto": "^7.0.0",
      "@sveltejs/kit": "^2.0.0",
      svelte: "^5.0.0",
      vite: "^8.0.0",
    },
    scripts: { build: "vite build" },
  });
  const configPath = path.join(root, "vite.config.ts");
  const packageJsonPath = path.join(root, "package.json");
  const initialConfig = [
    'import adapter from "@sveltejs/adapter-auto";',
    'import { sveltekit } from "@sveltejs/kit/vite";',
    'import { defineConfig } from "vite";',
    "",
    "export default defineConfig({",
    "  plugins: [sveltekit({ adapter: adapter() })],",
    "});",
    "",
  ].join("\n");
  await writeFile(configPath, initialConfig);
  const initialPackageJson = await readFile(packageJsonPath, "utf8");

  await svelteKitAdapter.configure(await loadProject(root), true);

  assert.equal(await readFile(configPath, "utf8"), initialConfig);
  assert.equal(await readFile(packageJsonPath, "utf8"), initialPackageJson);
  assert.equal(
    await pathExists(path.join(root, "src/routes/+layout.js")),
    false,
  );
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
  await mkdir(path.join(root, "src/routes"), { recursive: true });
  await writeFile(
    path.join(root, "package.json"),
    `${JSON.stringify({ name: "example-app", ...packageJson }, null, 2)}\n`,
  );
  return root;
}
