# AGENTS.md

Repo-specific guidance. Global Nexverra rules (`~/.config/opencode/AGENTS.md`) apply: changes land via `feature/*` branches and PR links only — agents never commit to `main` and never merge PRs. The root commit `8907615` on `main` is a one-time approved bootstrap exception, not a precedent.

## Approved stack — don't substitute without approval

- Astro + TypeScript (strict), static output; interactive tools are vanilla TypeScript in Astro `<script>` tags. No React/Preact/Svelte.
- Tailwind v4 via `@tailwindcss/vite` — CSS-first with `@theme`, no `tailwind.config.js`. Semantic design tokens live once in `src/styles/tokens.css` as CSS custom properties.
- Inter (UI) + JetBrains Mono (numeric/code) self-hosted via Fontsource. Icons are Lucide SVGs from `lucide-static`, inlined with `?raw` imports.

## AppKitX-Design.md is the binding UI spec

- Read it fully before any UI work; it governs color, typography, components, states, and accessibility.
- Semantic color roles only (`--color-accent`, `--color-text-primary`, …) — never primitives or literals in components.
- Tokenization policy: global tokens for anything repeated across components or system-level (control heights, containers, section rhythm, focus geometry); one-off component-internal dimensions may stay local, documented in the component spec.
- Invariants most often broken:
  - One accent: teal `#0f766e` for every interactive element; status colors only for status.
  - Buttons are rectangles (`radius-md`, 8px); pills are chips only.
  - Exactly three functional shadows (`sm`/`md`/`lg`) for layering; never decorative.
  - Focus is a 2px ring + 2px offset everywhere — never removed.
  - The contrast table in the spec is maintained by hand: add a computed ratio before using a new foreground/background pair.
  - 44px minimum targets, skip link first, labels on every input.
- Any new third-party asset gets its source and license recorded in `LICENSES.md` before merge.

## Conventions

- Tool logic: pure functions in standalone modules, Vitest-covered; the Astro `<script>` stays a thin UI wrapper.
- UI changes get runtime proof via a Playwright screenshot of the changed route.
- Playwright e2e serves the production build through `wrangler dev` — run `npm run build` before `npm run test:e2e`.
- Prettier needs `prettier-plugin-astro` for `.astro` files. Windows checkouts may reintroduce CRLF endings; run `npx prettier --write .` if `format:check` flags files that git reports as unchanged.
