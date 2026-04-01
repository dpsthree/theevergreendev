# Research Summary

**Project:** theevergreendev
**Domain:** Angular SPA — major version upgrade (8 to 19, 11 major versions)
**Researched:** 2026-03-31
**Confidence:** HIGH (core upgrade path) / MEDIUM (Material MDC visual details, AngularFire deploy builder specifics)

---

## Executive Summary

theevergreendev is a small personal Angular site (1 root component, 4 feature components, zero services, zero active tests) that is 11 major Angular versions behind. The upgrade is entirely a dependency and tooling modernization — no new features, no new pages, no state management changes. The application itself is simple; the upgrade path is long.

The recommended approach is a disciplined step-through of every major version from 8 to 19, committing after each step and verifying the build passes before advancing. Attempting to jump versions is the single most common failure mode for large Angular gaps and produces cascading, hard-to-triage errors. The Angular CLI enforces one-major-version steps, and each intermediate version runs schematics that are prerequisites for the next. The total number of automated schematic steps makes this more of a coordination problem than a coding problem — the code surface is small, the process is long.

The highest-risk moments are: (1) Angular 9, where AOT enforcement and the `aot: false` flag in this project's config will surface latent template errors; (2) Angular 15, where the Angular Material MDC migration changes component CSS class names and DOM structure, requiring visual verification of all pages; and (3) the build system switch to esbuild (Angular 17/18), where the output directory path changes and will silently break Firebase Hosting if not updated in `firebase.json`. All three risks have known mitigations and are well-documented.

---

## Target Stack

The minimum target is Angular 19.2.x with matching peer dependencies. All versions below were confirmed via the official Angular version compatibility table and npm registry.

| Package | Target Version | Confidence | Notes |
|---------|---------------|------------|-------|
| Angular (all `@angular/*`) | 19.2.x | HIGH | Latest Angular 19 LTS patch; Angular 20 adds no benefit here |
| Angular CLI | 19.2.x | HIGH | Must match Angular core major version |
| TypeScript | ~5.7.x | HIGH | Within Angular 19.2 range (`>=5.5.0 <5.9.0`); avoid 5.8 (Angular 20 floor only) |
| Node.js | 22.x | HIGH | Maintenance LTS; must be upgraded from EOL Node 10 before any ng update step |
| RxJS | ^7.8.0 | HIGH | Forced by `@angular/fire@19` peer dep; staying on RxJS 6 is not viable |
| zone.js | ~0.15.x | HIGH | Required by Angular 19 CD; zoneless migration is out of scope |
| @angular/material + @angular/cdk | 19.2.x | HIGH | Must match Angular core exactly |
| @angular/fire | 19.0.x | HIGH | AngularFire major version aligns with Angular core |
| firebase (JS SDK) | ^11.2.0 | HIGH | Bundled as direct dep of @angular/fire@19; modular API only |
| firebase-tools | ^13.0.0 | MEDIUM | Optional peer dep for `@angular/fire:deploy` builder |
| @angular/build (application builder) | 19.2.x | HIGH | Replaces deprecated webpack browser builder |
| @angular-eslint/schematics | 19.x | HIGH | Replaces abandoned TSLint + Codelyzer |
| eslint | ^9.x | HIGH | ESLint 8 is EOL |
| tslib | ^2.3.0 | HIGH | Angular 13+ requires tslib 2; current project has ^1.10.0 |
| @types/node | ^20 or ^22 | HIGH | Current @types/node@~8 is severely outdated |

**Packages to remove:** `hammerjs`, `tslint`, `codelyzer`, `protractor`, `@types/node` (v8)

---

## Migration Scope

### Table Stakes (all 12 required — app does not build or deploy without these)

| ID | Change | Complexity |
|----|--------|-----------|
| TS-1 | Upgrade Node.js from 10 to 22 | Low — runtime upgrade only |
| TS-2 | Upgrade TypeScript from 3.5.3 to ~5.7.x | Low-Medium — type errors may surface |
| TS-3 | Upgrade all `@angular/*` packages from 8 to 19 (step-through) | High — 11 version steps, schematics handle most |
| TS-4 | Add `standalone: false` to all 4 NgModule components | Low — automated by `ng update @angular/core@19` schematic |
| TS-5 | Remove `hammerjs` import from `main.ts` | Low — delete one line and one package |
| TS-6 | Upgrade `@angular/material` + `@angular/cdk` to 19.x | High — MDC migration at v15 changes CSS classes and DOM |
| TS-7 | Upgrade `@angular/fire` to 19.x (deploy builder only) | Medium — API breaking changes but deploy-builder-only usage minimizes impact |
| TS-8 | Upgrade RxJS from 6.4.0 to ^7.8.0 | Low-Medium — project barely uses RxJS directly |
| TS-9 | Upgrade zone.js from 0.9.1 to ~0.15.x | Low — version bump only |
| TS-10 | Remove deprecated `angular.json` build options | Low — schematics handle most; manual audit needed |
| TS-11 | Remove Protractor e2e config and package | Low — no real tests exist; remove `e2e/` dir and architect target |
| TS-12 | Replace TSLint with `@angular-eslint` | Low-Medium — automated schematic handles conversion |

### Recommended (blockers for a clean production deployment)

| ID | Change | Complexity |
|----|--------|-----------|
| REC-1 | Migrate to esbuild application builder | Low — automated schematic |
| REC-2 | Update `firebase.json` public path to `dist/evergreen/browser/` | Low — one line change, but easy to miss |
| REC-3 | Verify `indigo-pink.css` prebuilt theme path after Material upgrade | Low — visual check |
| REC-4 | Upgrade `tslib` to ^2.3.0 | Low — version bump |
| REC-5 | Upgrade `@types/node` to ^20 or ^22 | Low — version bump |

### Optional Modernization (out of scope for this migration milestone)

| ID | Change | Notes |
|----|--------|-------|
| OPT-1 | Migrate NgModules to standalone components | Strongly recommended as a follow-on milestone |
| OPT-2 | `loadChildren` → `loadComponent` | Follows OPT-1 |
| OPT-3 | Adopt Angular Signals | No reactive state exists; not applicable |
| OPT-4 | Enable TypeScript strict mode | Desirable follow-on; separating from upgrade reduces triage complexity |
| OPT-5 | Replace GA Universal Analytics with GA4 | UA was sunset July 2023 — analytics are not collecting data now |

**Anti-features (explicitly do not do during this migration):**
- Do not attempt standalone component migration during the same pass as the version upgrade
- Do not attempt a direct jump from Angular 8 to 19 in one `ng update` command
- Do not enable TypeScript strict mode mid-upgrade
- Do not add new pages or visual changes

---

## Architecture Changes

### Required Changes

| Change | Status | How |
|--------|--------|-----|
| Add `standalone: false` to all NgModule components | Required (Angular 19) | Automated by `ng update @angular/core@19` schematic |
| Switch `angular.json` builder from `browser` to `application` | Required (Angular 19; webpack builder removed in v20, deprecated in v19) | Automated: `ng update @angular/cli --name use-application-builder` |
| Change `polyfills` in `angular.json` from string to array (`["zone.js"]`) | Required (Angular 17+) | Automated by `ng update` |
| Remove deprecated `angular.json` options (`vendorChunk`, `buildOptimizer`, `namedChunks`, `aot`, `extractCss`) | Required | Automated by step-through schematics |
| Remove `~` tilde prefix from any SCSS imports | Required for esbuild | Automated by migration schematic; verify manually |
| Update `firebase.json` public path from `dist/evergreen/` to `dist/evergreen/browser/` | Required for Firebase Hosting | Manual one-line edit |
| Replace `tslint.json` + `codelyzer` with `.eslintrc.json` + `@angular-eslint` | Required (TSLint builder removed Angular 13+) | `ng add @angular-eslint/schematics` |
| Remove `e2e/protractor.conf.js` and e2e architect target from `angular.json` | Required (Protractor builder removed Angular 15+) | Manual deletion |
| Update Firebase initialization from `AngularFireModule.initializeApp()` to `provideFirebaseApp()` | Required for `@angular/fire` v7+ | Manual; low impact (deploy-builder-only usage) |

### Optional Changes (post-migration)

| Change | Value | Tooling |
|--------|-------|---------|
| Migrate NgModules to standalone components | Eliminates 9 module files; aligns with Angular idiom | `ng generate @angular/core:standalone` (3-pass) |
| `loadChildren` (module) → `loadComponent` (standalone) | Simplifies route config; reduces file count | Part of standalone migration step 3 |
| Replace `*ngIf`/`*ngFor` with `@if`/`@for` control flow | Improved performance and readability | `ng generate @angular/core:control-flow` |

**Architecture before and after (NgModules kept — required minimum):**
The NgModule structure is structurally identical after upgrade. The only visible changes are: `standalone: false` on decorators, updated builder references in `angular.json`, and removal of tooling config files (`tslint.json`, `e2e/`). All 5 component files and all module files remain.

**Architecture after optional standalone migration (recommended follow-on):**
All 9 module files (`*.module.ts`) are deleted. `bootstrapApplication()` replaces `platformBrowserDynamic().bootstrapModule()`. Each component imports its own Material modules. `MatDepsModule` is eliminated. `loadChildren` → `loadComponent` for all 3 lazy routes.

---

## Key Risks

### Risk 1: Skipping Angular Major Versions (CRITICAL)
**What breaks:** Accumulated breaking changes from multiple versions fire simultaneously; automated schematics for intermediate versions never run; cryptic multi-source failures with no clear origin.
**Prevention:** Upgrade one major version at a time (8→9→10→...→19). Run `ng update @angular/core@N @angular/cli@N` at each step. Commit after every successful step. Never use `--force` to bypass schematic failures.

### Risk 2: Node 10 Not Upgraded Before Starting (CRITICAL)
**What breaks:** Angular CLI 17+ will not execute on Node 10. esbuild (Angular 17+) requires Node 18. CI/CD (Travis CI) breaks on every post-upgrade commit.
**Prevention:** Upgrade Node to 22.x before running any `ng update`. Update `.travis.yml` to `node_js: "20"` (or migrate to GitHub Actions). Delete and regenerate `package-lock.json` (npm v6 lockfile is incompatible with npm v7+).

### Risk 3: AOT Enforcement at Angular 9 Breaks Templates (CRITICAL for 8→9 step)
**What breaks:** The project has `"aot": false` in `angular.json`. Angular 9 makes AOT the default. Ivy's template type-checker is stricter than View Engine and will reject patterns that previously compiled silently.
**Prevention:** Enable `"aot": true` in `angular.json` while still on Angular 8, fix any resulting template errors, then proceed to Angular 9. Add TypeScript interfaces for the speaking component's tile data (noted in CONCERNS.md as untyped).

### Risk 4: Angular Material MDC Migration Breaks Visual Appearance (14→15 step)
**What breaks:** Angular Material v15 replaced all components with MDC-based implementations. CSS class names changed from `mat-` to `mat-mdc-` prefix. DOM structure changed for many components. Any global SCSS targeting `mat-` classes silently stops applying.
**Prevention:** Run `ng update @angular/material@15` schematic; manually verify visual output of all 3 pages (bio, speaking, posts). Check all SCSS for `mat-` class references. Since the project uses a prebuilt theme (`indigo-pink.css`), custom mixin API changes are avoided — but spacing and sizing will shift.

### Risk 5: Firebase Output Path Change Silently Breaks Deployment (17→18 step)
**What breaks:** The esbuild application builder changes the default output from `dist/evergreen/` to `dist/evergreen/browser/`. Firebase Hosting reads `firebase.json` to find the `public` directory. If not updated, `firebase deploy` succeeds but serves a 404 (pointing at an empty or missing directory).
**Prevention:** Immediately after enabling the application builder (REC-1), update `firebase.json` `public` setting to the new path. Verify with a test deploy before considering the step complete.

### Additional Moderate Risks
- **AngularFire deploy builder config** (12→13 step): `angular.json` deploy target may need `"version": 2` and `"buildTarget"` keys for Angular 17+ compatibility. Verify `ng deploy` works after every AngularFire major version bump.
- **`--prod` flag removed** (Angular 14): Replace `ng build --prod` with `ng build --configuration production` in all `package.json` scripts at the Angular 12 step when the deprecation warning first appears.
- **SCSS tilde imports** (17→18 step): esbuild does not support `~package-name` import syntax. Automated migration handles most cases; manual audit of custom SCSS is required.
- **TSLint builder removed** (Angular 13+): The `@angular-devkit/build-angular:tslint` builder reference in `angular.json` will cause `ng update` schematics to fail if not replaced. Migrate to `@angular-eslint` at the 11→12 step, not after 13.

---

## Recommended Approach

### Phase Structure

The migration naturally divides into three phases based on hard dependencies, risk concentration, and natural verification checkpoints.

---

### Phase 1: Environment and Pre-Flight (before any `ng update`)

**Rationale:** Multiple pitfalls are triggered by starting the Angular upgrade before the environment is ready. Node 10 blocks Angular CLI 17+. The npm v6 lockfile format conflicts with npm v7+. Travis CI will fail on post-upgrade commits if not updated simultaneously. The `aot: false` flag in `angular.json` will cause AOT errors at the Angular 9 step that are easier to fix while still on Angular 8.

**Delivers:**
- Node 22 installed locally and in CI
- `.travis.yml` updated to Node 20+ (or GitHub Actions migration started)
- `package-lock.json` deleted and ready to regenerate
- `"aot": false` changed to `"aot": true` in `angular.json`; any AOT compilation errors fixed on Angular 8
- TypeScript interfaces added for speaking tile data (untyped inline arrays noted in CONCERNS.md)
- Audit of `app-routing.module.ts` confirms `loadChildren` already uses `import()` syntax (not legacy string form)
- Audit of all SCSS for `~` tilde imports

**Avoids:** Pitfall 2 (Node not upgraded), Pitfall 3 (AOT surprise at v9), Pitfall 4 (loadChildren string syntax), Pitfall 14 (lockfile incompatibility), Pitfall 16 (Travis CI broken)

**Research flag:** Standard patterns — no deeper research needed.

---

### Phase 2: Step-Through Version Upgrade (Angular 8 → 19)

**Rationale:** The core migration must proceed one major version at a time. Angular's own CLI enforces this. Each version's schematics are prerequisite transformations for the next. The version steps cluster into logical sub-groups based on which breaking changes arrive when.

**Delivers:** A working Angular 19 application with all table stakes (TS-1 through TS-12) complete.

**Sub-phases within the step-through:**

**2a. Angular 8→12 (Ivy, AOT enforcement, IE11 removal, entryComponents removal)**
- Steps: 8→9, 9→10, 10→11, 11→12
- Key actions at 9: Ivy becomes default (transparent); remove HammerJS (Material 9 schematic); bump tslib to ^2.0.0
- Key actions at 11→12: Migrate TSLint to `@angular-eslint` (before the builder is removed at 13); remove Protractor e2e config
- Commit and `ng build` after each step

**2b. Angular 12→15 (prod flag, AngularFire v7, RxJS 7, MDC material migration)**
- Steps: 12→13, 13→14, 14→15
- Key actions at 12→13: Replace `ng build --prod` with `--configuration production`; upgrade AngularFire to v7 and verify `ng deploy`
- Key actions at 13→14: Audit RxJS `subscribe()` calls for deprecated positional-argument form
- Key actions at 14→15: Run Angular Material MDC migration schematic; visual regression check of all 3 pages; verify SCSS

**2c. Angular 15→19 (esbuild, standalone default, build system migration)**
- Steps: 15→16, 16→17, 17→18, 18→19
- Key actions at 16→17: Audit SCSS for tilde imports before esbuild migration
- Key actions at 17→18: Run application builder migration schematic; update `firebase.json` public path immediately
- Key actions at 18→19: Verify `ng update @angular/core@19` schematic added `standalone: false` to all 4 components; grep all `@Component` decorators to confirm

**Avoids:** Pitfall 1 (version skipping), Pitfall 5 (--prod removal), Pitfall 6 (MDC CSS breakage), Pitfall 7 (AngularFire API), Pitfall 8 (tilde imports + output path), Pitfall 9 (standalone default), Pitfall 10 (TSLint builder removed), Pitfall 12 (RxJS subscribe syntax)

**Research flag:** Standard patterns — Angular's Update Guide (update.angular.io) covers each step. No deeper research needed.

---

### Phase 3: Post-Upgrade Validation and Recommended Cleanups

**Rationale:** After the step-through completes, a small set of recommended changes (REC-1 through REC-5) must be applied before the upgrade can be considered production-ready. Some of these (REC-2, firebase.json) are critical for deployment to work at all. The build system migration (REC-1) is technically automated by the step-through but warrants explicit verification.

**Delivers:**
- esbuild application builder confirmed active (REC-1)
- `firebase.json` pointing at `dist/evergreen/browser/` (REC-2)
- `indigo-pink.css` prebuilt theme path verified and loading (REC-3)
- `tslib` upgraded to ^2.3.0 (REC-4)
- `@types/node` upgraded to ^20 (REC-5)
- Full smoke test: all 3 pages render, `ng deploy` succeeds, Firebase Hosting serves the site

**Avoids:** Pitfall 8 (firebase.json output path oversight)

**Research flag:** Standard patterns — no deeper research needed.

---

### Phase 4: Optional Modernization (separate milestone, not part of this upgrade)

**Rationale:** Standalone component migration, `loadComponent` routing, control-flow syntax, and GA4 analytics are all improvements that should happen after the upgrade is stable and deployed. Mixing them with the version step-through doubles the surface area of change and makes regression triage impossible.

**Recommended priority order if pursued:**
1. OPT-5: GA4 analytics update (Universal Analytics is not collecting data; this is a live bug)
2. OPT-1 + OPT-2: Standalone migration + `loadComponent` routing (biggest long-term debt reduction)
3. OPT-4: TypeScript strict mode (surfaces latent type issues; manageable for a small codebase)
4. OPT-3: Signals (not applicable; no reactive state exists)

**Research flag:** OPT-1 standalone migration has well-documented schematics; standard patterns. OPT-5 (GA4) requires looking up the current measurement ID setup; simple.

---

### Phase Ordering Rationale

- Phase 1 must precede Phase 2 because Node 10 will block Angular CLI 17+ and AOT errors at v9 are easier to fix on Angular 8
- Phase 2 must be sequential (one version at a time) because schematics are cumulative
- Phase 3 must follow Phase 2 because it validates the completed upgrade and fixes deployment
- Phase 4 is deliberately deferred to keep the upgrade surface minimal and regression-traceable
- The Firebase output path fix (REC-2) is the single easiest step to forget and the one with the most silent impact — it is called out explicitly in Phase 3 rather than folded into Phase 2

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against official Angular compatibility table and npm registry |
| Features (migration scope) | HIGH | Table stakes and recommended steps sourced from Angular Update Guide and official docs |
| Architecture changes | HIGH | Build system migration, standalone default, and builder changes documented on angular.dev |
| Pitfalls | HIGH | Core pitfalls (version skipping, Node, AOT, MDC) documented from official sources and community case studies |
| Angular Material MDC visual impact | MEDIUM | MDC migration details sourced from v15 docs (JS-rendered) and community case study; exact visual deltas depend on custom CSS |
| AngularFire deploy builder config | MEDIUM | Deploy builder docs are MEDIUM confidence; exact `angular.json` format for v7+ inferred from docs rather than a direct version-specific config example |

**Overall confidence: HIGH**

### Gaps to Address

- **Angular Material visual regression scope:** The exact visual delta from MDC is unknown until it is seen. Build in time for visual review of all 3 pages at the 14→15 step. The site has no screenshot baseline — consider capturing one on Angular 8 before starting.
- **Travis CI vs. GitHub Actions decision:** PITFALLS.md recommends migrating to GitHub Actions (Travis CI uses deprecated features). This decision should be made in Phase 1. If staying on Travis, the Node version update is a one-line change. If migrating to GitHub Actions, it is a small additional task but eliminates a second fragile dependency.
- **Google Analytics UA sunset (OPT-5):** UA property `UA-142772288-1` stopped collecting data in July 2023. This is a current live issue independent of the Angular upgrade. It is low-effort to fix but needs a GA4 property and measurement ID created first.
- **`loadChildren` syntax audit:** FEATURES.md notes the project "already uses dynamic `import()` syntax" for lazy routes, but Pitfall 4 recommends manually confirming this before the 8→9 step. Low risk but worth a quick grep.

---

## Sources

### Primary (HIGH confidence)
- [angular.dev/reference/versions](https://angular.dev/reference/versions) — Angular/TypeScript/Node version compatibility table
- [angular.dev/tools/cli/build-system-migration](https://angular.dev/tools/cli/build-system-migration) — esbuild application builder migration
- [angular.dev/reference/migrations/standalone](https://angular.dev/reference/migrations/standalone) — standalone component schematic
- [angular.dev/reference/migrations](https://angular.dev/reference/migrations) — all automated migrations index
- [update.angular.io (Angular Update Guide)](https://update.angular.io/) — interactive step-through guide
- [@angular/fire 19.0.0 npm registry](https://registry.npmjs.org/@angular/fire/19.0.0) — peer deps and direct deps
- [@angular/fire 19.0.0 GitHub release](https://github.com/angular/angularfire/releases/tag/19.0.0)
- [angular-eslint migration from TSLint](https://github.com/angular-eslint/angular-eslint/blob/main/docs/MIGRATING_FROM_TSLINT.md)
- [AngularFire v7 upgrade guide](https://github.com/angular/angularfire/blob/main/docs/version-7-upgrade.md)
- [RxJS 6→7 breaking changes](https://rxjs.dev/deprecations/breaking-changes)
- [Protractor deprecation announcement](https://blog.angular.dev/protractor-deprecation-update-august-2023-2beac7402ce0)
- [The future is standalone — Angular Blog](https://blog.angular.dev/the-future-is-standalone-475d7edbc706)

### Secondary (MEDIUM confidence)
- [Angular Material MDC migration guide (v15 docs)](https://v15.material.angular.dev/guide/mdc-migration) — JS-rendered; content confirmed via community sources
- [Angular Material 15 real-world migration — trungvose.com](https://trungvose.com/experience/angular-material-15-migration/) — MDC visual impact
- [Angular 19 standalone migration guide — markaicode.com](https://markaicode.com/angular-19-migration-guide/)
- [Evolution of lazy loading in Angular 19 — Medium](https://medium.com/@neelendra1destiny/evolution-of-lazy-loading-in-angular-19-with-standalone-components-fadd3b34603f)
- [Angular upgrade guide 13→19 case study — rightanglesol.com](https://www.rightanglesol.com/angular-upgrade-guide-13-to-19/)

---

*Research completed: 2026-03-31*
*Ready for roadmap: yes*
