# AppKitX

Global platform for free online calculators, developer utilities, and everyday tools.

## Design

The visual system and UI requirements are defined in [AppKitX-Design.md](./AppKitX-Design.md). All UI work follows that specification.

## Status

Homepage, navigation, and footer implemented to the AppKitX Design System v1.0 (teal "Precision" theme). Tools shipped: the [percentage calculator](/percentage-calculator) and the [discount calculator](/discount-calculator), both built on the reusable `ToolLayout` template with cross-linked related tools. Global search (⌘K / Ctrl+K palette, hero search, nav trigger) searches a typed tool registry. Next: more calculators on the same template.

## Commands

- `npm run dev` — start the dev server
- `npm run build` — production build to `dist/`
- `npm run check` — Astro and TypeScript checks
- `npm test` — Vitest unit tests
- `npm run test:e2e` — Playwright smoke tests (run `npm run build` first; the suite starts its own `astro preview` on port 4399 and never attaches to a dev server on 4321)
- `npm run format` / `npm run format:check` — Prettier

Line endings: the repository stores and checks out LF on every platform (`* text=auto eol=lf` in `.gitattributes`). If `format:check` reports CRLF files after a fresh Windows checkout, run `npx prettier --write .` once — it rewrites the working files to LF without changing any committed content.

## Deployment (Cloudflare Pages)

The site is a static Astro build with no server-side runtime, API endpoints, or environment variables.

| Setting                | Value                                                  |
| ---------------------- | ------------------------------------------------------ |
| Framework preset       | Astro                                                  |
| Root directory         | repository root                                        |
| Build command          | `npm run build`                                        |
| Build output directory | `dist`                                                 |
| Production branch      | `main`                                                 |
| Node.js                | 22.22.0 or newer (`NODE_VERSION` environment variable) |
| Environment variables  | none required                                          |

Validate a Cloudflare Pages **preview deployment** before connecting the production domain.

The intended production domain is `appkitx.com` (canonical), with `www.appkitx.com` redirecting to it. Domain binding and DNS setup are manual Cloudflare steps and are not configured by this repository.

Security headers ship via `public/_headers` (content-type sniffing, referrer policy, framing, permissions policy, and immutable caching for hashed assets). HSTS is enabled at the Cloudflare zone level (SSL/TLS → Edge Certificates) once the domain is connected. A Content Security Policy is not set yet — the app uses small inline module scripts, so a strict CSP needs a hash-based pipeline first.
