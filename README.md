# AppKitX

Global platform for free online calculators, developer utilities, and everyday tools.

## Design

The visual system and UI requirements are defined in [AppKitX-Design.md](./AppKitX-Design.md). All UI work follows that specification.

## Status

Homepage, navigation, and footer implemented to the AppKitX Design System v1.0 (teal "Precision" theme). Next: the first calculator tool.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run check` — Astro and TypeScript checks
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright smoke tests (run `npm run build` first; the suite starts its own `astro preview` on port 4399 and never attaches to a dev server on 4321)
- `npm run format` / `npm run format:check` — Prettier
