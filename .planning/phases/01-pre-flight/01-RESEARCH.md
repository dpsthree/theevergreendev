# Phase 1: Pre-Flight - Research

**Researched:** 2026-03-31
**Domain:** Angular 8 environment hardening — Node upgrade, ESLint migration, Protractor removal, AOT baseline
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ENV-01 | Node.js upgraded from 10 to 18.19.1+ (or 20/22 LTS) | Node 22.22.1 already installed locally; only `.travis.yml` needs updating from `10` to `22`. npm lockfile (v6 format) must be deleted and regenerated. |
| ENV-02 | TypeScript upgraded from ~3.5.3 to >=5.5.0 <5.9.0 | TypeScript cannot be upgraded in isolation on Angular 8 — Angular 8 requires TypeScript ~3.4 or ~3.5. ENV-02 is satisfied during the Phase 2 step-through, NOT in Phase 1. Phase 1 must leave TypeScript at ~3.5.3. |
| ENV-03 | tslib upgraded from ^1.10.0 to ^2.x | Like ENV-02, tslib v2 requires Angular 10+. Must stay at ^1.10.0 in Phase 1. Upgraded at the 9→10 step in Phase 2. |
| ENV-04 | @types/node upgraded to match new Node runtime | @types/node can be upgraded independently of Angular. Upgrading from ~8.9.4 to ^22 is safe once Node 22 is installed. This CAN be done in Phase 1. |
| BLD-02 | TSLint and Codelyzer removed, replaced with ESLint (@angular-eslint) | `ng add @angular-eslint/schematics` works on Angular 8. The schematic replaces the lint architect target in angular.json, creates .eslintrc.json, and removes tslint.json. Angular-eslint 12.x is the last version supporting Angular 8. |
| BLD-03 | Protractor and e2e config removed | The `e2e/` directory is already absent from the repo. The `e2e` architect target still exists in `angular.json` and must be deleted. The `protractor` devDependency must be removed from `package.json`. |

</phase_requirements>

---

## Project Constraints (from CLAUDE.md)

- **Functionality:** All three pages (bio, speaking, posts) must render identically after upgrade
- **Deployment:** Must continue deploying to Firebase Hosting
- **Content:** No changes to hardcoded data in components
- **GSD Workflow:** All file changes must go through GSD commands (`/gsd:execute-phase`)

---

## Summary

Phase 1 prepares the environment so Phase 2 (the Angular step-through) can start without hitting avoidable blockers. The work falls into five concrete areas: (1) updating `.travis.yml` to Node 22 and regenerating the lockfile, (2) upgrading `@types/node` to match the Node 22 runtime, (3) migrating the lint config from TSLint/Codelyzer to `@angular-eslint`, (4) removing the dead Protractor architect target from `angular.json`, and (5) enabling AOT on Angular 8 and fixing any resulting template errors so the 8→9 step does not surface surprises.

Two requirements listed in Phase 1 (ENV-02 TypeScript and ENV-03 tslib) cannot be satisfied on Angular 8 and are correctly deferred to Phase 2. The REQUIREMENTS.md traceability table assigns them to Phase 1, but they are technically gated by the Angular core version — this research flags them as "Phase 1 documents intent; Phase 2 executes."

The most important discovery from code inspection: the `e2e/` directory is already gone, but the `e2e` architect target still lives in `angular.json`. This is a dead reference to a non-existent builder that will cause `ng update` schematics to emit warnings. Removing it is a one-block JSON deletion.

The AOT pre-flight (enabling `"aot": true` in the base build options and fixing template errors on Angular 8) is technically a Phase 2 preparation step, not one of the six listed Phase 1 requirements. However, the research strongly recommends including it in Phase 1 since it is easier to fix template errors on a known-good Angular 8 than mid-upgrade. The speaking component's untyped `tiles` and `comingSoon` arrays with inconsistent shapes (`hasThumbnail` on one item, `svg` on some items) are the specific AOT risk.

**Primary recommendation:** Execute Phase 1 in this order — (1) update `.travis.yml`, delete lockfile; (2) remove Protractor target from `angular.json` + `protractor` from `package.json`; (3) run `ng add @angular-eslint/schematics` to migrate lint; (4) upgrade `@types/node` to ^22; (5) enable AOT on Angular 8 baseline and run `ng build` to confirm no template errors; (6) confirm `ng build` succeeds — this is the Phase 1 gate.

---

## Standard Stack

### Core (Phase 1 changes only)

| Package | Action | Version | Notes |
|---------|--------|---------|-------|
| `@angular-eslint/schematics` | Add | 12.x | Last version supporting Angular 8; installs all `@angular-eslint/*` packages |
| `@angular-eslint/eslint-plugin` | Added by schematic | 12.x | Angular-specific lint rules replacing codelyzer |
| `@angular-eslint/eslint-plugin-template` | Added by schematic | 12.x | Template lint rules |
| `@angular-eslint/builder` | Added by schematic | 12.x | Builder replacing `@angular-devkit/build-angular:tslint` |
| `eslint` | Added by schematic | ^7.x | ESLint 7 is the peer for `@angular-eslint@12` |
| `@types/node` | Upgrade | ^22.0.0 | Was ~8.9.4; upgrade now that Node 22 is local runtime |
| `tslint` | Remove | ~5.15.0 | Replaced by eslint |
| `codelyzer` | Remove | ^5.0.0 | Replaced by @angular-eslint/eslint-plugin |
| `protractor` | Remove | ~5.4.0 | No e2e tests exist; dead dependency |

### Packages to Leave Unchanged in Phase 1

| Package | Current Version | Why It Stays |
|---------|----------------|--------------|
| TypeScript | ~3.5.3 | Angular 8 requires ~3.4 or ~3.5; cannot upgrade until Angular version advances |
| tslib | ^1.10.0 | Angular requires tslib ^2.0.0 only starting at Angular 10 |
| All `@angular/*` | ~8.2.x | Phase 2 handles these |
| zone.js | ~0.9.1 | Phase 2 handles this |
| RxJS | ~6.4.0 | Phase 2 handles this |

### Angular-ESLint Version for Angular 8

`@angular-eslint` aligns its major version number with the Angular major version it supports. Angular 8 is not supported past `@angular-eslint@12` (which added support down to Angular 12 as the minimum officially, but the schematic will run against Angular 8). In practice, for Angular 8, the correct install command is:

```bash
cd client && npx ng add @angular-eslint/schematics@12
```

**Important:** Do NOT install `@angular-eslint@19` — that version requires Angular 14+. Install `@angular-eslint@12` which has much looser peer dependency enforcement and will install on Angular 8 without errors.

**Verification (run before writing plan):**
```bash
npm view @angular-eslint/schematics@12 version   # should resolve 12.x.x
npm view @angular-eslint/schematics@12 peerDependencies
```

---

## Architecture Patterns

### What Phase 1 Changes in angular.json

**Before (relevant sections):**
```json
{
  "architect": {
    "build": {
      "options": {
        "aot": false,
        ...
      }
    },
    "lint": {
      "builder": "@angular-devkit/build-angular:tslint",
      "options": {
        "tsConfig": ["tsconfig.app.json", "tsconfig.spec.json", "e2e/tsconfig.json"],
        "exclude": ["**/node_modules/**"]
      }
    },
    "e2e": {
      "builder": "@angular-devkit/build-angular:protractor",
      "options": {
        "protractorConfig": "e2e/protractor.conf.js",
        "devServerTarget": "evergreen:serve"
      }
    }
  }
}
```

**After:**
```json
{
  "architect": {
    "build": {
      "options": {
        "aot": true,
        ...
      }
    },
    "lint": {
      "builder": "@angular-eslint/builder:lint",
      "options": {
        "lintFilePatterns": ["src/**/*.ts", "src/**/*.html"]
      }
    }
    // "e2e" key deleted entirely
  }
}
```

### TSLint Migration Pattern

`ng add @angular-eslint/schematics` (the schematic approach) handles:
- Generates `.eslintrc.json` from `tslint.json` rules
- Updates `angular.json` lint target to use `@angular-eslint/builder:lint`
- Optionally removes `tslint.json`

The schematic translates codelyzer rules to their `@angular-eslint` equivalents. For this project the key rules from `tslint.json` that map to ESLint equivalents:

| TSLint Rule | ESLint Equivalent |
|-------------|------------------|
| `component-class-suffix` | `@angular-eslint/component-class-suffix` |
| `component-selector` | `@angular-eslint/component-selector` |
| `directive-selector` | `@angular-eslint/directive-selector` |
| `no-conflicting-lifecycle` | `@angular-eslint/no-conflicting-lifecycle` |
| `use-lifecycle-interface` | `@angular-eslint/use-lifecycle-interface` |
| `no-input-rename` | `@angular-eslint/no-input-rename` |
| `no-output-rename` | `@angular-eslint/no-output-rename` |

The `quotemark`, `max-line-length`, `trailing-comma`, and other generic TSLint rules map to standard ESLint equivalents.

### AOT Template Risk: Speaking Component

Code inspection found the speaking component has two arrays — `tiles` and `comingSoon` — typed implicitly as `any[]`. The template accesses these fields without guards:

```html
<!-- comingSoon has inconsistent shapes: some have thumbnail, some have svg -->
<a *ngIf="tile.thumbnail" target="_blank" [href]="tile.url">
<a *ngIf="tile.svg" target="_blank" [href]="tile.url">
```

One `tiles` entry has a `hasThumbnail` field that no other entry has. When AOT strict template checking runs, it will attempt to type-narrow these accesses. With implicit `any[]` typing, the compiler may not flag errors — but **strict templates** (`"strictTemplates": true`) would.

**Phase 1 action:** Enable `"aot": true` in base options and run `ng build`. If it passes, the template is AOT-safe. If it fails with NG-prefixed errors on the speaking component, add a `Tile` interface with all optional fields. Do NOT enable `strictTemplates` in Phase 1 — that is a Phase 4 concern.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Converting TSLint rules to ESLint | Custom rule mapping | `ng add @angular-eslint/schematics` | Schematic handles ~80 rule translations automatically; manual mapping will miss nuances and is error-prone |
| Removing Protractor references | Grep-and-delete | Targeted `angular.json` edit + `npm uninstall` | The `e2e/` directory is already gone; only 1 JSON block and 1 package entry remain |
| Verifying AOT compatibility | Manual template audit | `ng build` with `aot: true` | The compiler is the ground truth; manual audit will miss what the compiler catches and flag what it allows |

---

## Common Pitfalls

### Pitfall A: Installing the Wrong @angular-eslint Version
**What goes wrong:** Installing `@angular-eslint/schematics@19` (the current latest) fails on Angular 8 with peer dependency conflicts because it requires Angular 14+.
**Why it happens:** `npm install @angular-eslint/schematics` without a version tag pulls the current major (19 as of March 2026).
**How to avoid:** Use `ng add @angular-eslint/schematics@12` explicitly. The `ng add` command with a version constraint installs the correct peer-compatible set.
**Warning signs:** `npm ERR! ERESOLVE unable to resolve dependency tree` referencing `@angular/core@~8.x.x` conflict.

### Pitfall B: Leaving `e2e/tsconfig.json` Reference in Lint Config
**What goes wrong:** After removing the `e2e` architect target, if the lint `tsConfig` array still references `e2e/tsconfig.json`, `ng lint` will fail with "file not found."
**Why it happens:** The TSLint lint config in `angular.json` explicitly lists `e2e/tsconfig.json` in its `tsConfig` array. The `@angular-eslint` schematic generates a fresh config without this reference, but if manually editing instead of using the schematic, this is easy to leave in.
**How to avoid:** Use the schematic. If editing manually, verify the lint `tsConfig` array does not reference any path that no longer exists.
**Warning signs:** `ng lint` error: `tsconfig file 'e2e/tsconfig.json' not found`.

### Pitfall C: npm Lockfile v1/v2 Mismatch
**What goes wrong:** The current `package-lock.json` was generated by npm v6 (Node 10). Node 22 ships npm v10, which uses lockfile format v3. Running `npm ci` after switching to Node 22 fails because the lockfile format is incompatible.
**Why it happens:** `npm ci` requires the lockfile to match the installed npm version's expected format.
**How to avoid:** Delete `client/package-lock.json` before the first `npm install` on Node 22. Regenerate fresh with `npm install`.
**Warning signs:** `npm ci` fails with "Cannot read property 'resolved'" or "Invalid lockfile format" error.

### Pitfall D: AOT Build Fails on Speaking Component Optional Fields
**What goes wrong:** The `comingSoon` array has items with `thumbnail` sometimes, `svg` sometimes, and neither sometimes. With `aot: true`, the template accesses `tile.svg` which does not exist on most array items. With implicit `any[]` typing, this may silently produce `undefined` at runtime rather than a compile error.
**Why it happens:** Angular 8's AOT compiler does not enforce strict template types by default (only with `fullTemplateTypeCheck: true` in tsconfig). The risk is that the template accesses fields that may or may not exist on the data objects.
**How to avoid:** Run `ng build` after enabling `aot: true`. If the build passes, the risk is contained. Add typed interfaces if template errors surface.
**Warning signs:** Build output contains `NG` error codes like `NG2003` or `NG8001`.

### Pitfall E: Travis CI Deploys Still Break After Local Node Upgrade
**What goes wrong:** Local Node is 22 but `.travis.yml` still specifies `node_js: 10`. After the Phase 2 Angular upgrade, Travis CI will fail on every push because Angular CLI 17+ cannot run on Node 10.
**Why it happens:** CI configuration is separate from local runtime.
**How to avoid:** Update `.travis.yml` to `node_js: 22` in Phase 1, in the same commit that documents the Node upgrade. Also remove `skip_cleanup: true` (deprecated Travis dpl v1 syntax).
**Warning signs:** Travis CI build log shows "Found bindings for the following environments: node v10" then fails.

---

## Current State Inventory (Confirmed by Code Inspection)

| Item | Current State | Phase 1 Action |
|------|--------------|----------------|
| Node.js (local) | 22.22.1 already installed | None for local; update `.travis.yml` |
| Node.js in CI | `.travis.yml` says `node_js: 10` | Change to `22` |
| `package-lock.json` format | v1 (npm 6, Node 10) | Delete and regenerate with `npm install` |
| `e2e/` directory | Already deleted from repo | None |
| `e2e` architect target in `angular.json` | Present (lines 111-126) | Delete the JSON block |
| `tslint.json` | Present at `client/tslint.json` | Remove after ESLint migration |
| `codelyzer` devDependency | Present in `client/package.json` | Remove |
| `protractor` devDependency | Present in `client/package.json` | Remove |
| `lint` architect target | Uses `@angular-devkit/build-angular:tslint` | Replace via `ng add @angular-eslint/schematics@12` |
| `aot` in build options | `false` in base options, `true` in production | Change base options to `true` |
| TypeScript version | ~3.5.3 | Do NOT change in Phase 1 |
| tslib version | ^1.10.0 | Do NOT change in Phase 1 |
| `@types/node` version | ~8.9.4 | Upgrade to ^22.0.0 |
| `loadChildren` syntax | Already using `import()` syntax | No action needed |
| SCSS tilde imports | None found in any `.scss` file | No action needed |
| `hammerjs` import in `main.ts` | Present (`import 'hammerjs'`) | NOT Phase 1 — remove in Phase 2 at the 8→9 step |

---

## Code Examples

### TSLint to ESLint Migration (via schematic)

```bash
# Run from client/ directory where angular.json lives
cd client
npx ng add @angular-eslint/schematics@12
```

The schematic prompts: "Would you like to remove your tslint.json?" — answer YES.

After the schematic runs, verify:
```bash
ng lint   # should run without "builder not found" error
```

### Removing the e2e Architect Target (manual JSON edit)

In `client/angular.json`, delete the entire `"e2e"` key from the `"architect"` object. The block to remove is:

```json
"e2e": {
  "builder": "@angular-devkit/build-angular:protractor",
  "options": {
    "protractorConfig": "e2e/protractor.conf.js",
    "devServerTarget": "evergreen:serve"
  },
  "configurations": {
    "production": {
      "devServerTarget": "evergreen:serve:production"
    }
  }
}
```

Also remove `"e2e/tsconfig.json"` from the lint `tsConfig` array if it remains there.

### Updating Travis CI

In `.travis.yml`, change:
```yaml
node_js:
  - 10
```
to:
```yaml
node_js:
  - 22
```
And remove `skip_cleanup: true` from the `deploy` section (deprecated dpl v1 syntax, causes warnings in current Travis CI).

### Enabling AOT Baseline

In `client/angular.json`, change the base `build.options` section:
```json
"options": {
  "aot": false,   // BEFORE
  ...
}
```
to:
```json
"options": {
  "aot": true,    // AFTER
  ...
}
```

Then run `ng build` to confirm no AOT errors exist on Angular 8 before Phase 2 begins.

### Upgrading @types/node

```bash
cd client
npm install --save-dev @types/node@^22.0.0
```

---

## Order of Operations

The tasks within Phase 1 have a specific safe ordering:

1. **Update `.travis.yml`** — CI change; no local impact; safe to do first
2. **Delete `client/package-lock.json`** — must happen before `npm install` on Node 22 to avoid lockfile conflict
3. **Remove `protractor` from `package.json` + delete `e2e` architect target from `angular.json`** — these are coupled; remove both together
4. **Run `ng add @angular-eslint/schematics@12`** — this runs `ng update` internally and will parse `angular.json`; do this after the `e2e` target is gone to avoid warnings
5. **Upgrade `@types/node` to ^22** — independent; can happen any time after lockfile is regenerated
6. **Enable `aot: true` in `angular.json` base options** — after lint migration is complete
7. **Run `ng build`** — baseline confirmation; must be the final step

---

## Environment Availability

| Dependency | Required By | Available | Version | Notes |
|------------|------------|-----------|---------|-------|
| Node.js | All ng commands | Yes | 22.22.1 | Already at target version |
| npm | Package management | Yes | 10.9.4 | Compatible with lockfile v3 |
| Angular CLI 8 | `ng add`, `ng build` | Installed in `client/node_modules` | ~8.3.5 | Will be used for Phase 1; no global CLI needed |
| @angular-eslint v12 | BLD-02 | Available on npm | 12.x | Must pin to @12, not latest |

**Missing dependencies:** None. All dependencies for Phase 1 are available locally or installable.

---

## Open Questions

1. **Travis CI vs GitHub Actions decision**
   - What we know: `.travis.yml` uses deprecated dpl v1 syntax (`skip_cleanup: true`). Travis CI is no longer the community default for Angular projects.
   - What's unclear: Does the developer want to migrate to GitHub Actions, or just update `.travis.yml`?
   - Recommendation: Updating `.travis.yml` to Node 22 is 1 line and unblocks CI. Full GitHub Actions migration is low-risk but out of scope for Phase 1 unless explicitly requested.

2. **@angular-eslint v12 peer dependency enforcement**
   - What we know: `@angular-eslint@12` officially supports Angular 12+. Angular 8 is below its stated minimum.
   - What's unclear: Whether `ng add @angular-eslint/schematics@12` will refuse to install on Angular 8 due to peer dep enforcement, or if it will proceed with a warning.
   - Recommendation: Use `--legacy-peer-deps` flag if `ng add` refuses: `npx ng add @angular-eslint/schematics@12 --legacy-peer-deps`. If that fails, the ESLint migration can be done manually (create `.eslintrc.json` by hand, update `angular.json` lint target manually, uninstall tslint/codelyzer). Manual migration is well-documented and not complex for this small project.

3. **AOT template errors in speaking component**
   - What we know: `comingSoon` has items with inconsistent shapes (`svg` vs `thumbnail` vs neither). Template uses `*ngIf="tile.thumbnail"` and `*ngIf="tile.svg"` on items typed as implicit `any`.
   - What's unclear: Whether Angular 8's AOT compiler (without `fullTemplateTypeCheck: true`) will flag missing optional properties or silently allow `any` access.
   - Recommendation: Run `ng build` with `aot: true` and observe. If it passes, no interface is needed for Phase 1. If it fails, add a `SpeakingTile` interface with all fields optional.

---

## Sources

### Primary (HIGH confidence)
- Code inspection of `client/angular.json` — confirmed exact state of `aot`, lint, and e2e targets
- Code inspection of `client/package.json` — confirmed versions of tslint, codelyzer, protractor, @types/node
- Code inspection of `client/src/app/speaking/speaking.component.ts` — confirmed untyped tile arrays
- Code inspection of `client/src/app/app-routing.module.ts` — confirmed `import()` syntax already in use
- `node --version` → 22.22.1 confirmed
- `.travis.yml` inspection — confirmed `node_js: 10` and deprecated `skip_cleanup: true`
- PITFALLS.md Pitfall 2 (Node), Pitfall 3 (AOT), Pitfall 10 (TSLint), Pitfall 14 (lockfile), Pitfall 15 (Protractor), Pitfall 16 (Travis CI) — all sourced from angular.dev and official Angular blog
- SUMMARY.md Phase 1 section — confirms scope and rationale

### Secondary (MEDIUM confidence)
- [angular-eslint migration from TSLint](https://github.com/angular-eslint/angular-eslint/blob/main/docs/MIGRATING_FROM_TSLINT.md) — confirms `ng add` schematic approach and rule mapping
- SUMMARY.md "Target Stack" table — @angular-eslint 19.x for the final stack; 12.x confirmed as compatible with Angular 8 intermediate step

---

## Metadata

**Confidence breakdown:**
- Node/CI update: HIGH — direct code inspection confirms current state; straightforward changes
- ESLint migration: HIGH — schematic approach is standard; only uncertainty is peer dep behavior on Angular 8
- Protractor removal: HIGH — e2e directory already gone; only JSON edit and package uninstall remain
- AOT baseline: HIGH — confirmed current `aot: false` in base options; risk from speaking component is LOW due to implicit `any` typing
- ENV-02/ENV-03 scope clarification: HIGH — TypeScript/tslib version constraints on Angular 8 are well-documented

**Research date:** 2026-03-31
**Valid until:** 2026-05-01 (stable tooling, low churn risk)
