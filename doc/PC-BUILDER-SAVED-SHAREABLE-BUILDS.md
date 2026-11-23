# Saved and Shareable PC Builds (M10.5)

Development-only persistence and sharing for the AppKitX PC Builder.

- Preview: `/pc-builder` during `astro dev` only.
- Domain: `src/lib/pc-builder/saved-builds/`.
- UI: `src/dev/pc-builder/PcBuilder.astro`.
- No backend, account, cloud sync, live pricing, scraping or analytics.

The MVP stores builds in this browser and encodes share links in the URL
fragment. It does **not** provide account-based cloud storage or permanent
public hosting.

## 1. Saved-build schema

Schema version: `1`.

```ts
interface SavedBuild {
  schemaVersion: 1;
  id: string; // stable local id, e.g. a UUID
  name: string; // user-defined, 1–80 characters, trimmed
  source: "manual" | "guided";
  createdAt: string; // canonical ISO 8601 UTC
  updatedAt: string; // canonical ISO 8601 UTC, never before createdAt
  selections: SavedBuildSelection[];
  questionnaire?: SavedBuildQuestionnaire; // guided builds only
}

interface SavedBuildSelection {
  category: ComponentCategory;
  componentIds: string[]; // only non-empty categories are stored
}

interface SavedBuildQuestionnaire {
  useCase: UseCase;
  resolution: TargetResolution;
  performancePriority: PerformancePriority;
  budget: number;
  currency: string;
}
```

Supported categories: CPU, GPU, motherboard, RAM, cooler, storage, PSU, case
and case fans. Per-category limits mirror the builder: one each for CPU, GPU,
motherboard, cooler, PSU and case; up to 8 RAM selections, 12 storage devices
and 16 case fans.

The schema stores only stable component ids and reconstruction data. It never
stores catalogue records, hardware specifications, compatibility verdicts,
power calculations, recommendation scores or private browser state.

### Storage envelope

The whole library is one versioned envelope under
`appkitx.pc-builder.saved-builds.v1`:

```json
{ "schemaVersion": 1, "builds": [] }
```

Limits:

| Limit                  |         Value |
| ---------------------- | ------------: |
| Saved builds           |            30 |
| Build name             | 80 characters |
| One serialized build   |         16 KB |
| Whole serialized store |        256 KB |
| Decoded share JSON     |          6 KB |
| Encoded share payload  |          8 KB |

When a limit is reached, the operation fails and the existing store is left
unchanged. Nothing is silently deleted to make room.

## 2. Serialization and validation

`serialize.ts` writes a fixed field order and canonical category order, so
identical builds serialize deterministically. Unknown fields are never copied
through.

Every serialized object is treated as untrusted:

- JSON parse failures are reported, never evaluated.
- Schema version, ids, names, timestamps, categories and quantities are
  checked at runtime.
- Build ids and component ids must match strict patterns.
- Timestamps must be canonical UTC ISO strings in a reasonable year range.
- `updatedAt` cannot precede `createdAt`.
- Duplicate categories or component ids are rejected.
- Single-slot categories reject more than one id.
- Manual builds cannot carry guided questionnaire metadata.
- Unknown fields are dropped and a canonical object is returned.

Component ids are validated structurally by the schema and resolved against
the current catalogue separately. Display names and specifications are never
trusted from storage or a share payload.

## 3. Local persistence architecture

```
KeyValueStorage (adapter)
        ↑
SavedBuildRepository (pure operations + validation + limits)
        ↑
PcBuilder.astro (rendering and dialogs)
```

- `storage.ts` defines a small synchronous key/value interface.
- `createBrowserStorage()` probes `localStorage` and returns `null` when site
  storage is unavailable (private mode, sandboxed frame, disabled storage).
- `createMemoryStorage()` is used by unit tests.
- `repository.ts` reads, validates, mutates and writes one envelope per
  operation. A failed validation, size check or write leaves the previous
  value untouched.
- `repository.ts` accepts injectable `now()` and `createId()` functions so
  tests are deterministic.

Repository operations:

- `list` — sorted by `updatedAt` descending, then `createdAt`, then id.
- `get`
- `create`
- `update` — preserves `createdAt`, advances `updatedAt`.
- `rename` — updates only the name and `updatedAt`.
- `duplicate` — new id, `" (copy)"` suffix, new timestamps.
- `remove`
- `reset` — explicit recovery for unreadable storage.

Error codes cover unavailable storage, read/write failures, quota exhaustion,
corrupt data, unsupported versions, the build limit, missing builds, invalid
names/builds and oversized payloads.

Corrupt storage is never overwritten automatically. `list()` reports
`corrupt: true`; writes return `corrupt-store` until the user explicitly resets
the library from the Saved builds panel.

## 4. Saved-build management UI

The development preview includes a Saved builds section in both Guided and
Manual modes:

- Empty state.
- Name, manual/guided source and creation/modification timestamps.
- Concise component summary resolved from the current catalogue.
- Warnings for unavailable or non-production components.
- Load, Share, Rename, Duplicate and Delete actions.
- Save as new, Update saved build and Share current build.
- Active-build status and a "Modified since the last save" indicator.

Saving a manual build captures the existing `BuildState`. Saving a guided
recommendation captures the final recommended selection plus compact
questionnaire provenance; the transient recommendation result is not stored.
Saving from Manual mode makes the new entry active, including when the build
originated from a transferred guided recommendation. A guided recommendation
saved from Guided mode is added to the library without becoming the active
manual build.

The builder enforces the same per-category limits as the schema (8 RAM kits,
12 storage devices, 16 case fans). The add action and picker disable new
selections at the limit and explain why, so a valid manual selection can
always be saved or shared. Clearing a manual build asks for confirmation when
it would discard unsaved changes.

Loading a saved build:

1. Resolves ids against the current catalogue.
2. Rebuilds a `BuildState` using the existing `selectComponent` rules.
3. Reruns `evaluateBuild` and the power estimator through normal rendering.
4. Leaves unresolved ids out of the state and reports them.
5. Switches to Manual mode.

If the manual builder already contains a different build, loading asks for
confirmation. Cancelling leaves the current state untouched.

Deleting a saved build requires confirmation. Duplicating and renaming do not
overwrite a different build. The update action only targets the explicitly
active saved build. Rename, duplicate and delete re-render the library, so the
UI restores keyboard focus to the renamed or duplicate card or to the next
surviving card (or the Saved builds heading) instead of dropping focus to the
document body.

## 5. Share payload and link format

A share payload is a compact, versioned object:

```ts
interface ShareBuildPayload {
  schemaVersion: 1;
  name: string;
  source: "manual" | "guided";
  selections: SavedBuildSelection[];
  questionnaire?: SavedBuildQuestionnaire;
  createdAt?: string;
}
```

The encoded JSON uses short keys:

```json
{
  "v": 1,
  "n": "Build name",
  "s": "manual",
  "c": [
    ["cpu", ["cpu-id"]],
    ["gpu", ["gpu-id"]]
  ],
  "q": {
    "u": "gaming",
    "r": "1440p",
    "p": "balanced",
    "b": 1200,
    "cur": "UNIT"
  },
  "t": "2026-10-31T10:00:00.000Z"
}
```

`q` and `t` are optional. The payload contains no catalogue records,
specifications, compatibility results, power values, account data,
credentials or private storage data.

### Encoding

1. Canonicalise selections in category order.
2. Serialize deterministic JSON.
3. Encode UTF-8 bytes as unpadded URL-safe base64.
4. Place the result in the URL fragment.

No compression dependency is used. The payload is far below the strict size
limit, and the pure encoder/decoder is auditable and environment-independent.

Link format:

```
/pc-builder#build=<encoded-payload>
```

The fragment is never sent to the server. The generated link is independent
of local storage and can be opened in another browser context.

### Decoding

The decoder rejects:

- Empty payloads.
- Payloads over 8 KB encoded or 6 KB decoded JSON.
- Characters outside the URL-safe base64 alphabet.
- Invalid padding/truncation and non-zero trailing bits.
- Invalid UTF-8.
- Invalid JSON.
- Missing or unsupported schema versions.
- Malformed selections, unknown categories, invalid component ids, invalid
  names and manual payloads carrying guided metadata.

It never uses `eval`, dynamic code execution or unsafe deserialization.

## 6. Read-only shared view

Opening a valid `#build=` link hides the builder chrome and shows a read-only
view:

- Build name, source, payload timestamp and component count.
- Guided questionnaire provenance when present.
- Components and key specifications from the **current** catalogue.
- Availability labels and explicit unavailable-reference warnings.
- Compatibility status, counts, findings and Unknown checks.
- Power estimate, recommended PSU and selected PSU capacity.
- Catalogue and sharing limitations.

The shared build does not modify the local manual build. Actions are explicit:

- **Import into manual builder** — confirm if a different manual build exists.
- **Save a copy locally** — creates a new saved build without changing the
  current manual selection.
- **Return to builder** — clears the share fragment and restores the normal
  builder view.

An invalid or unresolvable payload shows an error view with a Return action
instead of partially importing anything.

## 7. Import validation

Import is treated as untrusted input:

1. Decode the fragment.
2. Validate the schema version and payload structure.
3. Resolve every component id against the current catalogue.
4. Detect missing ids and category mismatches.
5. Exclude unresolved ids from `BuildState` and report them explicitly.
6. Rebuild the state with the existing selection functions.
7. Rerun `evaluateBuild`.
8. Rerun the existing power estimator.
9. Render the current compatibility status and warnings.

Import rules:

- Serialized compatibility and power values are never trusted.
- Missing components are never replaced with unrelated alternatives.
- A partial build can be imported only with explicit warnings; unresolved ids
  remain visible in the review view.
- A payload where nothing resolves is rejected.
- Importing over a different manual build requires confirmation.
- Cancelling leaves the existing manual build untouched.

## 8. Schema versioning and migrations

Current format: version `1`.

`migration.ts` centralises version handling and provides an explicit migration
table for future versions. Because no earlier format ever existed, no
historical migration is fabricated. Builds or stores with version `0` or a
negative version are rejected; versions newer than the supported version are
rejected with an `unsupported-version` issue.

To add a future version:

1. Increment `SAVED_BUILD_SCHEMA_VERSION`.
2. Add a migration function keyed by the version being migrated from.
3. Add round-trip tests for old and new payloads.
4. Update the share codec version mapping and documentation.

Future storage versions are surfaced to the user as unreadable data and are
never silently overwritten.

## 9. Catalogue resolution

- Stable component ids are the only references.
- Names are always read from the current catalogue, so display renames work
  without breaking saved builds.
- Discontinued and end-of-life records still resolve when present and are
  labelled with their availability.
- Removed ids are reported as missing; they are not guessed or remapped.
- A changed specification is picked up automatically because compatibility is
  recalculated from the current record.
- A category mismatch is treated as an unresolved reference.
- If a stable id itself changes in the future, an explicit documented
  migration is required. Name matching is never used.

## 10. Compatibility and power recalculation

Saved and shared builds never store authoritative compatibility or power
results.

On restore/open:

- `evaluateBuild` is the only compatibility authority.
- Confirmed incompatibilities remain visible; the builder does not hide them.
- Unknown checks remain Unknown and are listed.
- Power comes from the existing estimator with its documented assumptions and
  headroom policy.
- Price data does not exist; no quote or market estimate is implied.

## 11. Privacy and data limitations

- Builds are stored only in this browser's `localStorage`.
- No account, email, analytics, advertising or affiliate data is collected.
- Share payloads contain only the build name, source, component ids, optional
  questionnaire provenance and timestamp.
- Anyone with a share link can read the payload in the URL fragment.
- Browser storage can be cleared by the user or the browser at any time.
- No live prices, stock, regional availability, benchmark or FPS data exists.
- The catalogue remains a curated subset of the market.

## 12. Development-only sharing and future cloud sync

The PC Builder is mounted only by `src/integrations/pc-builder-dev-preview.ts`
during `astro dev`. Share links therefore work only where that preview is
available. They are not public URLs and are not permanently hosted.

No public route, navigation entry, sitemap entry, indexability change,
Cloudflare/Wrangler configuration, CSP/HSTS/security header, analytics or
affiliate integration was added for this milestone.

A future cloud-sync milestone could:

- Replace the `KeyValueStorage` adapter with an authenticated repository.
- Add server-side payload validation and per-account limits.
- Add explicit share revocation/expiry and privacy controls.
- Keep component ids and recomputation rules unchanged.

None of those capabilities exist in this MVP.

## 13. Tests

- `tests/pc-builder-saved-builds.test.ts` — schema, deterministic
  serialization, migration, repository persistence/limits/failures,
  catalogue resolution, renamed ids, changed specifications, discontinued and
  missing components, multi-slot reconstruction and revalidation.
- `tests/pc-builder-share-codec.test.ts` — round trips, deterministic
  URL-safe encoding, fragment links, malformed/truncated/oversized payloads,
  invalid JSON/UTF-8, unsupported versions, invalid structures and storage-free
  decoding.
- `e2e-pc-builder/saved-builds.spec.ts` — empty state, manual and guided saves,
  persistence, load confirmation, rename/duplicate/delete, update, clipboard
  sharing, read-only shared view, import confirmation, local copy without
  prior storage, malformed links, responsive layouts and keyboard use.
- `e2e-pc-builder/product-validation.spec.ts` — the full save/share/restore
  journey, focus restoration, corrupt/quota/unavailable storage recovery,
  missing and discontinued references, browser back/forward and the
  cross-browser runs.

## 14. Production isolation

Verified after the production build:

- Zero PC Builder artifacts in `dist`.
- Zero PC Builder sitemap references.
- Existing CSP inline hash count unchanged.
- No public route or production configuration changes.
