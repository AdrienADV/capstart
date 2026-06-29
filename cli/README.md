# Capstart CLI

Create a new Capstart boilerplate app, or add Capacitor to an existing Next.js,
Nuxt, React + Vite, Svelte + Vite, SvelteKit, TanStack Start, or Vue
application.

```bash
npx capstart create my-app --app-id com.example.myapp --app-name "My App"
```

```bash
npx capstart init ..
```

`capstart create` scaffolds the Capstart boilerplate from GitHub and applies the
native app id/name to the copied Capacitor, Android, and iOS project files.

`capstart init` detects the framework and package manager, configures a static
or SPA build, installs Capacitor, adds native projects, builds the web
application, and runs `cap sync`.

In an interactive terminal, Capstart also asks which setup to install:

- `minimal`: Capacitor core, CLI, and the selected native platforms;
- `recommended`: the minimal setup plus Keyboard, Network, Device, Splash
  Screen, and Status Bar plugins.

The recommended setup is pre-selected in the interactive prompt. Non-interactive
usage keeps the existing minimal setup unless `--setup recommended` is passed.

Installation, build, and Capacitor command output is hidden by default. Capstart
shows a single setup progress line and only prints a short command summary when
something fails.

Each main installation operation has its own step:

```text
◇ Configure Next.js
◇ Configure Capacitor
◇ Configure safe area insets
◇ Install Capacitor packages (recommended)
◇ Build the web app
◇ Prepare iOS and Android projects
◇ Synchronize native projects
```

The commands executed inside each step remain hidden.

The detected framework is always shown and must be confirmed before Capstart
changes the project:

```text
✓ Detected Next.js
? Use the detected framework Next.js? Yes
```

If the detection is refused, Capstart lets you choose between Next.js, Nuxt,
React + Vite, Svelte + Vite, SvelteKit, TanStack Start, and Vue.

## Supported frameworks

- Next.js projects that can use static export
- Nuxt projects that can use client-only rendering. Capstart switches the build
  script to `nuxt generate` and uses `.output/public`.
- Standalone React projects built with Vite. Capstart keeps the existing static
  build, uses `dist` by default, and detects a literal custom `build.outDir`.
- Svelte + Vite projects. Capstart keeps the existing static build, uses
  `dist` by default, and detects a literal custom `build.outDir`.
- SvelteKit projects that can use SPA mode. Capstart switches the project to
  `@sveltejs/adapter-static`, generates an `index.html` fallback, disables
  runtime SSR, and uses `build` by default. Existing literal `pages` and
  matching `assets` directories are preserved.
- TanStack Start projects that can use SPA mode. Capstart uses `.output/public`
  when the Vite config includes Nitro, and `dist/client` otherwise.
- Standalone Vue projects built with Vite or Vue CLI. Capstart uses `dist` by
  default and detects static custom `build.outDir` or `outputDir` values.

The React + Vite adapter targets client-only standalone Vite apps. React
framework projects such as Next.js, TanStack Start, React Router framework
mode, and Remix require their own build adapters.

Server-only features must remain hosted remotely and be called from the mobile
application over HTTP.

## Usage

Create a new app from the boilerplate:

```bash
npx capstart create [directory] [options]
```

Examples:

```bash
npx capstart create my-app
npx capstart create my-app --app-id com.example.myapp --app-name "My App"
```

Useful options:

```text
--app-id <id>
--app-name <name>
--template <path>
```

Use `--template` only when developing or testing the CLI against a local
boilerplate directory.

Add Capacitor to an existing app:

```bash
npx capstart init [directory] [options]
```

Examples:

```bash
npx capstart init .
npx capstart init ../my-app --app-id com.example.myapp
npx capstart init . --platforms ios
npx capstart init . --setup recommended
npx capstart init . --framework nuxt --dry-run
npx capstart init . --framework react-vite --dry-run
npx capstart init . --framework svelte --dry-run
npx capstart init . --framework sveltekit --dry-run
npx capstart init . --framework tanstack-start --dry-run
npx capstart init . --framework vue --dry-run
npx capstart init . --yes
```

Useful options:

```text
--framework <nextjs|nuxt|react-vite|svelte|sveltekit|tanstack-start|vue>
--app-id <id>
--app-name <name>
--platforms <ios,android>
--setup <minimal|recommended>
--safe-area
--no-safe-area
--skip-install
--skip-build
--skip-native
--dry-run
--yes
```

Use `--yes` to accept a single automatically detected framework in CI or other
non-interactive environments. Use `--framework` to bypass detection
confirmation and select an adapter explicitly.

Use `--setup recommended` to install these baseline runtime plugins:

```text
@capacitor/keyboard
@capacitor/network
@capacitor/device
@capacitor/splash-screen
@capacitor/status-bar
```

The recommended setup also adds baseline `Keyboard` and `SplashScreen` options
to `capacitor.config.ts`. Existing plugin configuration is merged so unrelated
plugins and properties are preserved.

Capstart can also add global top and bottom safe area padding. It uses the
Capacitor 8 System Bars variables with browser fallbacks:

```css
html {
  padding-top: var(--safe-area-inset-top, env(safe-area-inset-top, 0px));
  padding-bottom: var(--safe-area-inset-bottom, env(safe-area-inset-bottom, 0px));
}
```

When selected, Capstart configures `SystemBars.insetsHandling` as `css` and adds
`viewport-fit=cover`. Use `--safe-area` or `--no-safe-area` to bypass the
interactive question. See the
[Capacitor 8 System Bars documentation](https://capacitorjs.com/docs/apis/system-bars)
for the underlying edge-to-edge behavior.

After a successful interactive initialization, Capstart detects whether GitHub
CLI is installed and optionally proposes starring
[AdrienADV/capstart](https://github.com/AdrienADV/capstart). The repository is
only starred after explicit confirmation, and this step never runs in CI.

The final output includes:

- the scripts added to `package.json` and a short explanation of each one;
- recommended Capacitor packages, native configuration, and production guidance at
  [capstart.dev/docs/installation/#3-add-recommended-capacitor-base-plugins](https://capstart.dev/docs/installation/#3-add-recommended-capacitor-base-plugins);
- an `Important` section explaining which framework server features must remain
  remotely hosted.

Example:

```text
Ready
✓ Your base Capacitor setup is ready.

Scripts added
  npm run cap:sync
    Build the web app and sync the native projects.
  npm run cap:ios
    Build, sync, and open the iOS project in Xcode.
  npm run cap:android
    Build, sync, and open the Android project in Android Studio.

Next steps
• Review recommended plugins, native configuration, and production setup:
  https://capstart.dev/docs/installation/#3-add-recommended-capacitor-base-plugins

Important
! Next.js request-time features do not run inside the Capacitor app.
  • Replace request-time Server Components and Server Actions with client-side
    calls to API endpoints.
  • Deploy those APIs, API routes, middleware, ISR, and other request-time logic
    on a remote backend.
  • Configure the mobile app with an HTTPS API base URL that is reachable from
    the device.
  • Do not use "localhost" for the backend URL: on a phone or emulator, it
    points to the device itself.
```

After initialization:

```bash
npm run cap:sync
npm run cap:ios
npm run cap:android
```

The exact package-manager prefix is generated for npm, pnpm, Yarn, or Bun.

## Development

```bash
cd cli
bun install
bun run typecheck
bun test
bun run build
bun dist/cli.js --help
```

## Publishing to npm

The CLI uses Bun for development and publishing. The published package remains
compatible with both `bunx` and `npx`.

```bash
cd cli
bun install
bun publish --dry-run
bun publish
```

`prepublishOnly` automatically runs the typecheck, tests, and build before
publishing.

After publishing:

```bash
bunx capstart@latest --help
npx capstart@latest --help
```
