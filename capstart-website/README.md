# Capstart

> The most complete component library for [CapacitorJS](https://capacitorjs.com) — production-ready components that feel native on iOS, Android, and the web.

Capstart is a curated catalog of UI patterns and components built for hybrid native apps. It follows a **web-first philosophy**: keep your web framework in charge of routing and content, and reach for native surfaces only where they genuinely improve the mobile experience.

## What's inside

| Category | Components |
|----------|-----------|
| **Getting Started** | Introduction, opinionated Vite + Capacitor setup |
| **Components** | Page transitions, native navigation bars & tab bars |
| **Auth & Monetization** | Social login (Google, Apple, Facebook…), Supabase Auth, in-app purchases, RevenueCat |
| **Advanced Surfaces** | iOS Live Activities, WidgetKit, bottom sheets |

All components integrate with the official Capacitor plugin ecosystem and are framework-agnostic (React, Vue, Angular, Svelte, Solid, vanilla JS).

## Tech stack

| | |
|--|--|
| Framework | React 19 + TypeScript 6 |
| Router | TanStack Router + TanStack Start |
| Documentation | Fumadocs (MDX, source-driven) |
| Styling | Tailwind CSS 4 (Vite plugin) |
| Build tool | Vite 8 |
| Package manager | Bun |
| Linter / Formatter | Biome |
| Deployment | Cloudflare Workers |

## Getting started

```bash
bun install
bun run dev        # dev server on http://localhost:3000
```

## Public repository

The public source repository is:

```text
https://github.com/AdrienADV/capstart-docs
```

## Available scripts

| Script | Description |
|--------|-------------|
| `bun run dev` | Start the Vite development server |
| `bun run build` | Production build + TypeScript check |
| `bun run start` | Preview the production build locally |
| `bun run preview` | Build then run with Wrangler (Workers emulation) |
| `bun run deploy` | Build and deploy to Cloudflare Workers |
| `bun run lint` | Run Biome checks |
| `bun run format` | Format code with Biome |
| `bun run types:check` | Type-check MDX + TypeScript |

## Project structure

```
capstart-docs/
├── content/docs/        # MDX documentation pages
├── public/              # Static assets (videos, logos)
├── src/
│   ├── components/      # Shared React components
│   ├── lib/             # Utilities (source loader, layout config, cn)
│   └── routes/          # TanStack file-based routes
├── source.config.ts     # Fumadocs MDX configuration
├── vite.config.ts       # Vite + plugins configuration
└── wrangler.jsonc       # Cloudflare Workers configuration
```

## Adding documentation

Create a new `.mdx` file under `content/docs/` and add its slug to `content/docs/meta.json` in the appropriate section. The page is automatically picked up by Fumadocs.

## Deployment

The production deployment target for this repo is **Cloudflare Workers**, using Wrangler:

```bash
bun run deploy
```

Make sure you are authenticated with `wrangler login` before your first deploy, or provide `CLOUDFLARE_API_TOKEN` in CI.

Vercel is not part of the current deployment path. Do not use Vercel deployment status as the source of truth for this repo; use Wrangler/Cloudflare Workers instead.

## Related

- [CapacitorJS](https://capacitorjs.com) — the cross-platform native runtime
- [Capgo](https://capgo.app) — push live updates to your Capacitor app without waiting for App Store review
- [Fumadocs](https://fumadocs.vercel.app) — the documentation framework powering this site
