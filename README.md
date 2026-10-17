# AppKitX

Global platform for free online calculators, developer utilities, and everyday tools.

## Design

The visual system and UI requirements are defined in [AppKitX-Design.md](./AppKitX-Design.md). All UI work follows that specification.

## Status

Astro scaffold with the centralized design-token layer, base navigation chrome, and the homepage skeleton.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run check` — Astro and TypeScript checks
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright smoke tests (run `npm run build` first; the suite serves `astro preview`)
- `npm run format` / `npm run format:check` — Prettier
