# CapStart

CapStart is a mobile-first React + Vite boilerplate with Capacitor ready for iOS and Android.

It includes:
- React 19 + TypeScript + React Router
- Tailwind CSS v4 + shadcn primitives
- Capacitor 8 setup (`android/`, `ios/`, safe-area CSS, mobile dev script)
- Starter app screens designed to be replaced quickly

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Run On Mobile (local network)

```bash
npm run dev:mobile
```

This command starts Vite with a network URL and exposes `CAP_SERVER_URL` for Capacitor live reload.

## Project Structure

- `src/pages`: app screens
- `src/layouts/tab-layout.tsx`: bottom-tabs shell
- `src/components/ui`: reusable UI primitives
- `scripts/dev-mobile.mjs`: helper for mobile local-network dev
- `capacitor.config.ts`: Capacitor app and plugin config

## What To Customize First

1. Rename app metadata in `capacitor.config.ts` (`appId`, `appName`).
2. Replace placeholder auth flow in `src/pages/auth/login.tsx`.
3. Replace onboarding content in `src/pages/app/home.tsx`.
4. Wire real data/services in `src/pages/app/home/details.tsx`.

## Planned Init Flags (Not Implemented Yet)

If you expose an init command from your landing, these are the intended options:

- `--all`: enable the full curated Capacitor plugin pack
- `--with-supabase`: install Supabase + generate a basic auth scaffold

Target usage once implemented:

```bash
npx degit adrienvillermois/capstart my-app \
  && cd my-app \
  && npm install \
  && npm run init -- --all --with-supabase
```
