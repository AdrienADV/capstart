# Capstart

Capstart is a web-first ecosystem for building polished mobile apps with **CapacitorJS**.

It combines:
- a **production-oriented boilerplate** you can start from,
- and a **documentation website** that explains patterns, components, and integration choices.

## Project Intent

Capstart follows one core principle:

- Keep product UI and routing in the web layer.
- Add native surfaces only when they materially improve mobile UX.

In practice, Capstart focuses on production-ready patterns for:

- navigation bars and tab bars,
- transitions,
- social login and authentication bridges,
- in-app purchases and subscriptions,
- advanced iOS surfaces (Live Activities, widgets).

## Repository Structure

This repository currently contains two main packages:

```txt
capstart/
├── capstart-boilerplate/   # Starter app (Capacitor + React) for real projects
└── capstart-website/       # Documentation website and component guides
```

## Package Overview

### `capstart-boilerplate`

A starter project intended to bootstrap a Capacitor app quickly with an opinionated web stack and native-ready setup.

What it includes (high level):
- Capacitor project scaffolding with `android/` and `ios/` native folders,
- React + TypeScript app structure,
- routing, UI components, and app pages,
- baseline configuration to start building and shipping mobile features.

Useful paths:
- `capstart-boilerplate/src/`
- `capstart-boilerplate/android/`
- `capstart-boilerplate/ios/`
- `capstart-boilerplate/capacitor.config.ts`
- `capstart-boilerplate/README.md`

### `capstart-website`

The official docs site for Capstart components and patterns.

Stack:
- React 19 + TypeScript 6
- TanStack Router + TanStack Start
- Fumadocs (MDX docs)
- Tailwind CSS 4
- Vite 8
- Cloudflare Workers (Wrangler)

Useful paths:
- `capstart-website/content/docs/`
- `capstart-website/src/routes/`
- `capstart-website/public/`
- `capstart-website/package.json`

## Quick Start

### 1) Run the documentation site

```bash
cd capstart-website
bun install
bun run dev
```

Dev server default: `http://localhost:3000`

### 2) Explore the boilerplate

```bash
cd capstart-boilerplate
npm install
npm run dev
```

Then follow `capstart-boilerplate/README.md` for native sync/build steps.

## Common Commands

### Website

```bash
cd capstart-website
bun run dev
bun run build
bun run start
bun run lint
bun run types:check
bun run deploy
```

### Boilerplate

```bash
cd capstart-boilerplate
npm run dev
npm run build
npm run lint
```

## Contribution Guidelines

1. If you change guides/content, edit files in `capstart-website/content/docs/*.mdx`.
2. If you add new docs pages, update `capstart-website/content/docs/meta.json`.
3. If you improve starter experience, update files in `capstart-boilerplate/` and keep its README in sync.
4. Run relevant checks before opening a PR.
5. Keep each PR focused and explain intent + impact clearly.

## Deployment

The documentation site deployment target is **Cloudflare Workers**:

```bash
cd capstart-website
bun run deploy
```

## Links

- Public docs repository: https://github.com/AdrienADV/capstart-docs
- CapacitorJS: https://capacitorjs.com
- Fumadocs: https://fumadocs.vercel.app
