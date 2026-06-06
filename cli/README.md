# Capstart CLI

Add Capacitor to an existing Next.js or TanStack Start application.

```bash
npx capstart init ..
```

Capstart detects the framework and package manager, configures a static or SPA
build, installs Capacitor, adds native projects, builds the web application, and
runs `cap sync`.

The detected framework is always shown and must be confirmed before Capstart
changes the project:

```text
• Inspecting . for a supported framework
✓ Detected Next.js
? Use the detected framework Next.js? Yes
```

If the detection is refused, Capstart lets you choose between Next.js and
TanStack Start.

## Supported frameworks

- Next.js projects that can use static export
- TanStack Start projects that can use SPA mode

Server-only features must remain hosted remotely and be called from the mobile
application over HTTP.

## Usage

```bash
npx capstart init [directory] [options]
```

Examples:

```bash
npx capstart init .
npx capstart init ../my-app --app-id com.example.myapp
npx capstart init . --platforms ios
npx capstart init . --framework tanstack-start --dry-run
npx capstart init . --yes
```

Useful options:

```text
--framework <nextjs|tanstack-start>
--app-id <id>
--app-name <name>
--platforms <ios,android>
--skip-install
--skip-build
--skip-native
--dry-run
--yes
```

Use `--yes` to accept a single automatically detected framework in CI or other
non-interactive environments. Use `--framework` to bypass detection
confirmation and select an adapter explicitly.

After a successful interactive initialization, Capstart detects whether GitHub
CLI is installed and optionally proposes starring
[AdrienADV/capstart](https://github.com/AdrienADV/capstart). The repository is
only starred after explicit confirmation, and this step never runs in CI.

The final output includes:

- the scripts added to `package.json` and a short explanation of each one;
- recommended Capacitor packages and production guidance at
  [capstart.dev/docs/installation](https://capstart.dev/docs/installation);
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
  https://capstart.dev/docs/installation

Important
! Next.js server features require a remote server.
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
npm install
npm run typecheck
npm test
npm run build
node dist/cli.js --help
```
