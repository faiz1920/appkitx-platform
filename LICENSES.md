# Third-Party Assets & Licenses

Registry of third-party assets adopted by the AppKitX design system and platform.
Every asset used in the product must appear here with its source, license, and
verification status before merge.

## Fonts

| Asset                     | Package                                     | Declared license | Verification                                                                                                                                                                           | Status   |
| ------------------------- | ------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Inter (variable)          | `@fontsource-variable/inter` 5.3.0          | OFL-1.1          | Installed package: `license` field and bundled LICENSE file (SIL Open Font License 1.1, Copyright 2016 The Inter Project Authors, https://github.com/rsms/inter)                       | Verified |
| JetBrains Mono (variable) | `@fontsource-variable/jetbrains-mono` 5.3.0 | OFL-1.1          | Installed package: `license` field and bundled LICENSE file (SIL Open Font License 1.1, Copyright 2020 The JetBrains Mono Project Authors, https://github.com/JetBrains/JetBrainsMono) | Verified |

Fonts are self-hosted via Fontsource. No proprietary font files are bundled and no
CDN loading is used.

## Icons

| Asset  | Package                | Declared license | Verification                                                                                                                                                        | Status   |
| ------ | ---------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| Lucide | `lucide-static` 1.59.0 | ISC              | Installed package: `license` field and bundled LICENSE file (ISC License, Copyright (c) 2026 Lucide Icons and Contributors, https://github.com/lucide-icons/lucide) | Verified |

ISC requires retaining the copyright notice and license text in copies. The
bundled LICENSE file in the installed package is retained with the dependency;
this file records the notice for the project.

## Images and illustrations

None. The product uses no stock photography or third-party illustrations.
Tool visuals are live UI or original SVG diagrams.

## Original assets

- AppKitX wordmark and logo mark: original works of the project, all rights reserved.
  The final logo mark is pending design; the wordmark is approved for interim use.

## Policy

- Any new third-party asset (icon set, illustration, font, image, snippet) requires its
  source and license documented in this file before merge.
- An entry is marked Verified only when checked against the installed package (license
  field and/or bundled license file) or another authoritative source. Entries based on
  registry metadata alone remain Declared and must be re-verified at adoption.
- Public accessibility of an asset does not imply a license to use it.
- Uncertain licensing must be flagged for human review rather than assumed cleared.
