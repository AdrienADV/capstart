# CapStart

CapStart is a starter boilerplate to ship mobile apps fast with **React + Capacitor + Supabase + shadcn/ui**.

It includes:
- React + Vite + TypeScript
- Capacitor setup for iOS and Android
- Supabase auth wiring (login, session, protected routes)
- Tailwind CSS v4 + shadcn/ui components
- Mobile-first layout with safe-area handling

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

4. Start the web app:

```bash
bun run dev
```

## Mobile Development

This project already contains `ios/` and `android/` native projects.

### Open native projects

```bash
bunx cap open ios
bunx cap open android
```

### Build and sync web assets to native

Use this before native release/testing with bundled assets:

```bash
bun run sync
```

## Available Scripts

- `bun run dev` - start Vite dev server
- `bun run build` - build web assets into `dist/`
- `bun run typecheck` - run the TypeScript compiler without emitting files
- `bun run sync` - build web assets and sync them to native projects
- `bun run preview` - preview production build
- `bun run lint` - run ESLint

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
├── android/               # Native Android project
├── ios/                   # Native iOS project
├── capacitor.config.ts    # Capacitor app configuration
└── .env.example           # Required environment variables
```

## Authentication Flow

- `AuthProvider` reads Supabase session and tracks auth state.
- `GuestRoute` redirects logged-in users away from `/login`.
- `ProtectedRoute` restricts `/app/*` routes to authenticated users.

## Important Config to Update

Before shipping your app, update:

- `capacitor.config.ts`
  - `appId` (currently `com.example.app`)
  - `appName`
- Supabase project URL and key in `.env`
- App icons/splash screens in native projects (`ios/` and `android/`)

## Notes

- This boilerplate is mobile-first but can be developed in the browser.
- Safe-area CSS variables are already configured for notch/status-bar devices.
