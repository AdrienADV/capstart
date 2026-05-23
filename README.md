# Capstart

Capstart is a web-first toolkit and documentation project for building polished mobile apps with **CapacitorJS**.

It helps web teams ship native-feeling iOS/Android experiences without abandoning their existing React/web workflow.

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

This repository currently contains:

```txt
capstart/
└── capstart-website/   # Documentation website and component guides
```

## Main Package: `capstart-website`

The `capstart-website` package is the official docs site.

### Stack

- React 19 + TypeScript 6
- TanStack Router + TanStack Start
- Fumadocs (MDX docs)
- Tailwind CSS 4
- Vite 8
- Cloudflare Workers (Wrangler)

### Key Paths

- `capstart-website/content/docs/`: MDX guides
- `capstart-website/src/routes/`: file-based app routes
- `capstart-website/public/`: static assets
- `capstart-website/package.json`: scripts and dependencies

## Quick Start

From the repository root:

```bash
cd capstart-website
bun install
bun run dev
```

Dev server default: `http://localhost:3000`

## Common Commands

```bash
cd capstart-website
bun run dev          # Start dev server
bun run build        # Production build + TS check
bun run start        # Preview built app
bun run lint         # Biome checks
bun run types:check  # MDX + TypeScript checks
bun run deploy       # Deploy to Cloudflare Workers
```

## Contribution Guidelines

1. Add or update docs in `capstart-website/content/docs/*.mdx`.
2. Update docs navigation in `capstart-website/content/docs/meta.json` when needed.
3. Run checks before opening a PR.
4. Keep changes focused and include clear PR context.

## Deployment

The canonical deployment target is **Cloudflare Workers**.

Use:

```bash
cd capstart-website
bun run deploy
```

## Links

- Public docs repository: https://github.com/AdrienADV/capstart-docs
- CapacitorJS: https://capacitorjs.com
- Fumadocs: https://fumadocs.vercel.app

