# CapStart

CapStart is a starter boilerplate to ship mobile apps fast with **React + Capacitor + Supabase + shadcn/ui**.

It includes:

- React + Vite + TypeScript
- Capacitor-ready web setup
- Supabase auth wiring (login, session, protected routes)
- Tailwind CSS v4 + shadcn/ui components
- Mobile-first layout with safe-area handling
- Capgo transitions and native plugin examples

## Tech Stack

- React 19
- Vite 8
- TypeScript 6
- Capacitor 8
- Supabase JS v2
- Tailwind CSS v4
- shadcn/ui

## Prerequisites

- Node.js 20+
- Bun
- For iOS development: Xcode (macOS)
- For Android development: Android Studio + Android SDK

## Quick Start

1. Install dependencies:

```bash
bun install
```

2. Create your local env file:

```bash
cp .env.example .env
```

3. Set your Supabase values in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-or-publishable-key
```

4. Generate the Capacitor native projects with your final app identity:

```bash
bunx capstart@latest init . \
  --framework react-vite \
  --setup recommended \
  --safe-area \
  --app-id com.example.myapp \
  --app-name "My App"
```

Use a real reverse-domain app id before this step. Capstart writes it to
`capacitor.config.ts`, generates `ios/` and `android/`, syncs the native plugins,
and adds the `cap:*` scripts to `package.json`.

5. Start the web app:

```bash
bun run dev
```

## Mobile Development

This starter does not commit generated native projects. Run the Capstart CLI once
per app to create `ios/` and `android/` with the correct bundle id and app name.

### Open native projects

```bash
bun run cap:ios
bun run cap:android
```

### Build and sync web assets to native

Use this before native release/testing with bundled assets:

```bash
bun run cap:sync
```

## Available Scripts

- `bun run dev` - start Vite dev server
- `bun run build` - build web assets into `dist/`
- `bun run typecheck` - run the TypeScript compiler without emitting files
- `bun run preview` - preview production build
- `bun run lint` - run ESLint
- `bun run cap:sync` - build web assets and sync native projects, added by Capstart
- `bun run cap:ios` - build, sync, and open Xcode, added by Capstart
- `bun run cap:android` - build, sync, and open Android Studio, added by Capstart

## Project Structure

```text
capstart/
├── src/
│   ├── components/        # UI components (including shadcn/ui)
│   ├── contexts/          # React contexts (auth state)
│   ├── layouts/           # App layouts (tab layout)
│   ├── lib/               # Utilities, Supabase client, route guards
│   ├── pages/             # Screens (auth + app pages)
│   ├── app.tsx            # Root app component
│   ├── main.tsx           # Providers + router bootstrap
│   └── router.tsx         # Route definitions
├── capacitor.config.ts    # Capacitor app configuration updated by Capstart
└── .env.example           # Required environment variables
```

After `bunx capstart@latest init ...`, the generated `ios/` and `android/`
folders become part of your app and should be committed.

## Authentication Flow

- `AuthProvider` reads Supabase session and tracks auth state.
- `GuestRoute` redirects logged-in users away from `/login`.
- `ProtectedRoute` restricts `/app/*` routes to authenticated users.

## Important Config to Update

Before shipping your app, update:

- Pass the final `--app-id` and `--app-name` to `capstart init` before generating
  native projects
- Supabase project URL and key in `.env`
- App icons/splash screens in the generated native projects
- Native signing, version numbers, and store metadata

## Notes

- This boilerplate is mobile-first but can be developed in the browser.
- Safe-area CSS variables are already configured for notch/status-bar devices.
- Changing the app id after native projects are generated requires native project
  changes. Pick the final id before running Capstart whenever possible.
