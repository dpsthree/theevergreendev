# Feature Landscape: Angular 8→19 Migration

**Domain:** Angular SPA dependency upgrade (theevergreendev)
**Researched:** 2026-03-31
**Confidence:** HIGH (core Angular migration) / MEDIUM (Angular Material MDC details, AngularFire version specifics)

---

## This Project's Context

The application is a small personal site with:
- 1 root NgModule (`AppModule`) declaring 1 component (`AppComponent`)
- 4 feature NgModules (bio, speaking, posts), each declaring 1 component
- 1 shared barrel module (`MatDepsModule`) re-exporting 7 Angular Material modules
- No services, no HTTP, no state management, no forms, no tests active
- `@angular/fire:deploy` builder for Firebase Hosting deployment
- `hammerjs` imported in `main.ts`
- `loadChildren` already uses dynamic `import()` syntax (no legacy string syntax)
- Build uses `@angular-devkit/build-angular:browser` (old Webpack builder)
- TSLint + Codelyzer linting (`@angular-devkit/build-angular:tslint` builder)
- Protractor E2E configured but effectively unused
- Prebuilt theme: `@angular/material/prebuilt-themes/indigo-pink.css`

---

## TABLE STAKES

Features/steps that must be done for the upgrade to produce a working application.
Missing any of these = the app does not build or does not run.

### TS-1: Node.js Upgrade
**What:** Upgrade from Node 10 to Node 18.19.1+ (or 20.11.1+, or 22.x)
**Why required:** Angular 19 requires `^18.19.1 || ^20.11.1 || ^22.0.0`. Node 10 is not supported by any Angular version past ~12 and is end-of-life.
**Complexity:** Low — runtime upgrade only, no code changes
**Dependencies:** Must happen before running any `ng update` commands
**Source:** [Angular version compatibility table](https://angular.dev/reference/versions) — HIGH confidence

---

### TS-2: TypeScript Upgrade
**What:** Upgrade from TypeScript ~3.5.3 to TypeScript ≥5.5.0 <5.9.0
**Why required:** Angular 19 requires TypeScript 5.5+. TS 3.5 is incompatible with Angular 9 and above. The compiler will refuse to compile.
**Complexity:** Low-Medium — TypeScript version itself upgrades cleanly; any strict-mode type errors exposed require fixes
**Dependencies:** Node upgrade (TS-1) must precede this
**Notes:** The project has no strict mode today. Angular 12+ defaulted new projects to strict mode, but existing projects are not forced. Type errors from stricter inference may appear in component files if Angular's template checking tightens.
**Source:** [Angular version compatibility table](https://angular.dev/reference/versions) — HIGH confidence

---

### TS-3: Angular Core + CLI upgrade (all @angular/* packages)
**What:** Upgrade all `@angular/*` packages from 8.x to 19.x, including `@angular/core`, `@angular/cli`, `@angular-devkit/build-angular`, `@angular/compiler-cli`, etc.
**Why required:** This is the primary goal. The packages are tightly version-coupled; mixing versions causes compilation failure.
**Complexity:** High (across 11 major versions, but automated schematics handle most breaking changes)
**How:** Run `ng update @angular/core @angular/cli` — the CLI runs automated migration schematics at each major version step
**Dependencies:** TS-1, TS-2 must be done first; should be done incrementally through major versions
**Breaking changes automated by schematics:**
- Angular 9: View Engine → Ivy opt-in (tsconfig changes)
- Angular 10: Removed `Renderer`, `TestBed.get` (replaced by `TestBed.inject`)
- Angular 12: Removed View Engine entirely; deprecated `extractCss`, `vendorChunk`, `buildOptimizer`, `namedChunks` flags in angular.json
- Angular 13: Removed IE11 support; `entryComponents` arrays removed
- Angular 15: `ModuleWithProviders` generic required; ngcc removed
- Angular 19: `standalone: true` becomes the default (see TS-4)
**Source:** [Angular Update Guide](https://update.angular.io/) — HIGH confidence; [ng update schematics](https://angular.dev/reference/migrations) — HIGH confidence

---

### TS-4: Add `standalone: false` to All NgModule Components
**What:** Angular 19 flips the default of `standalone` to `true`. All components without an explicit decorator flag will be treated as standalone, which breaks NgModule `declarations` arrays.
**Why required:** `AppComponent`, `BioComponent`, `SpeakingComponent`, `PostsComponent` are all declared in NgModule `declarations`. Without `standalone: false`, Angular 19 will treat them as standalone components and the NgModule declarations will throw a compile error.
**Complexity:** Low — 4 component files need one property added to their `@Component` decorator
**How:** The `ng update @angular/core@19` schematic automatically adds `standalone: false` to all components in `declarations` arrays. Verify it ran correctly.
**Affected files:**
- `client/src/app/app.component.ts`
- `client/src/app/bio/bio.component.ts`
- `client/src/app/speaking/speaking.component.ts`
- `client/src/app/posts/posts.component.ts`
**Dependencies:** TS-3
**Source:** [The future is standalone — Angular Blog](https://blog.angular.dev/the-future-is-standalone-475d7edbc706) — HIGH confidence; [Angular 19 Standalone updates](https://www.angulartraining.com/daily-newsletter/angular-19-standalone-updates/) — MEDIUM confidence

---

### TS-5: Remove `hammerjs` Import
**What:** Remove `import 'hammerjs'` from `client/src/main.ts` and remove `hammerjs` from `package.json`
**Why required:** Angular Material dropped its hard dependency on HammerJS after v9. In newer Angular/Material versions, importing hammerjs without also importing `HammerModule` causes warnings or errors. More critically, hammerjs is not maintained and will block clean installs on modern Node.
**Complexity:** Low — delete one import line and one package entry
**Notes:** The Material components this project uses (toolbar, sidenav, list, icon, button, card, grid-list) do not require gesture support. Safe to remove entirely.
**Dependencies:** None
**Source:** [Angular HammerJS deprecation PR](https://github.com/angular/angular/pull/60257) — HIGH confidence; Angular 9 Material release notes — HIGH confidence

---

### TS-6: Angular Material Upgrade to v19
**What:** Upgrade `@angular/material` and `@angular/cdk` from 8.x to 19.x
**Why required:** Material version must match Angular core version. Mismatched versions fail to compile.
**Complexity:** High — Angular Material v15 switched all components to MDC-based implementations, changing CSS class names and DOM structure. The migration schematic (`ng generate @angular/material:mdc-migration`) handles templates but manual CSS fixes are often needed.
**Key breaking change — MDC switch (v15):**
- All component CSS host classes changed from `mat-` prefix to `mat-mdc-` prefix
- DOM structure of several components changed (mat-button, mat-card, mat-form-field, etc.)
- This project uses: `MatToolbarModule`, `MatSidenavModule`, `MatListModule`, `MatIconModule`, `MatButtonModule`, `MatCardModule`, `MatGridListModule`
- None of these require form-field or complex input handling — the impact is likely visual (spacing/sizing deltas) rather than functional breakage
**Key breaking change — prebuilt theme (v15+):**
- `indigo-pink.css` prebuilt theme path still exists for compatibility but the theming system moved to Material 3 in v17+
- In Angular Material 19, system token prefix changed from `--sys` to `--mat-sys`
- The project imports `@angular/material/prebuilt-themes/indigo-pink.css` directly in `angular.json` — this import path should still resolve but the visual output may shift slightly due to MDC component sizing changes
**How:** Run `ng update @angular/material @angular/cdk` at each major version step; run `ng generate @angular/material:mdc-migration` after upgrading to v15
**Dependencies:** TS-3 (Angular core must match)
**Source:** [Angular Material MDC Migration Guide](https://v15.material.angular.dev/guide/mdc-migration) — MEDIUM confidence (actual content behind JS render); [Angular Material 15 real-world migration](https://trungvose.com/experience/angular-material-15-migration/) — MEDIUM confidence

---

### TS-7: Angular/Fire Upgrade to v19
**What:** Upgrade `@angular/fire` from v5.2.1 to v19.x and `firebase` SDK from <7 to v10+
**Why required:** `@angular/fire` v5 is incompatible with Angular 19. The `@angular/fire:deploy` builder in `angular.json` will not function. NPM peer dependency resolution will fail.
**Complexity:** High — `@angular/fire` v7+ introduced breaking API changes to Firebase initialization. v5 used `AngularFireModule.initializeApp(config)` in NgModule imports; v7+ uses `provideFirebaseApp()` functional providers.
**What this project uses:** Only the deploy builder (`@angular/fire:deploy` in `angular.json`). No AngularFirestore, no Auth, no Firestore, no Realtime Database. The Firebase SDK itself is not imported in any application code.
**Impact assessment:** Because the project only uses `@angular/fire` for the deploy builder (not for any SDK features in application code), the breaking API changes to AngularFireModule are irrelevant. The deploy builder configuration may need updating in `angular.json`.
**Deploy builder notes:** The `@angular/fire:deploy` builder continues to exist in modern versions. The `angular.json` deploy target may need `"version": 2` and a `"buildTarget"` option added for Angular 17+ compatibility.
**Dependencies:** TS-3, TS-5 (hammerjs removal)
**Source:** [AngularFire v7 upgrade guide](https://github.com/angular/angularfire/blob/main/docs/version-7-upgrade.md) — HIGH confidence; [AngularFire deploy docs](https://github.com/angular/angularfire/blob/main/docs/deploy/getting-started.md) — MEDIUM confidence

---

### TS-8: RxJS Upgrade to v7
**What:** Upgrade `rxjs` from ~6.4.0 to ^7.4.0
**Why required:** Angular 14+ requires RxJS ^7.4.0. RxJS 6.x is not compatible with Angular 14+.
**Complexity:** Low-Medium for this project — the project has no services, no HTTP, no complex reactive patterns. RxJS is used only indirectly through Angular Router and Material. However, if any component code uses deprecated RxJS 6 operators, those must change.
**Deprecated operator changes (RxJS 6→7):**
- `combineLatest` as import → use `combineLatestWith` pipe operator
- `merge`, `zip`, `concat`, `race` static → replaced by `...With` pipe variants
- `finalize` execution order reversed
**Dependencies:** TS-3
**Source:** [RxJS 6→7 breaking changes](https://rxjs.dev/deprecations/breaking-changes) — HIGH confidence

---

### TS-9: zone.js Upgrade
**What:** Upgrade `zone.js` from ~0.9.1 to a version compatible with Angular 19 (~0.15.x)
**Why required:** zone.js version is tightly coupled to Angular version. Angular 19 requires zone.js 0.14+ (the exact version is dictated by Angular's own peer dependencies). Mismatched versions cause runtime errors in change detection.
**Complexity:** Low — package version bump only, no code changes needed
**Dependencies:** TS-3
**Source:** Angular peer dependency declarations — HIGH confidence (inferred from Angular version compatibility)

---

### TS-10: Build Config Cleanup for Removed angular.json Options
**What:** Remove deprecated build options from `angular.json` that were removed across Angular 12–17
**Why required:** `ng update` schematics handle most of this automatically, but the current `angular.json` contains options that Angular 17+ will reject:
- `extractCss: true` — removed in Angular 12 (CSS is always extracted)
- `vendorChunk: false` — removed in Angular 17
- `buildOptimizer: true` — removed in Angular 17 (always enabled)
- `namedChunks: false` — removed in Angular 17
- `aot: false` / `aot: true` — AOT is always on from Angular 12; flag has no effect
**Complexity:** Low — the `ng update` schematics for each version should handle this automatically; manual cleanup may be needed if schematics miss anything
**Dependencies:** TS-3
**Source:** [Build system migration docs](https://angular.dev/tools/cli/build-system-migration) — HIGH confidence; Angular 12 changelog — HIGH confidence

---

### TS-11: Remove/Replace Protractor E2E Config
**What:** Remove Protractor from `package.json` and from `angular.json` (`e2e` architect target) or replace it with a supported tool
**Why required:** Protractor is deprecated and unmaintained. Angular CLI removed it as a default in v12. It will not install cleanly on modern Node. The `@angular-devkit/build-angular:protractor` builder was removed from `@angular-devkit/build-angular` in v17.
**Complexity:** Low — since tests are out of scope and Protractor is already effectively unused, simply remove the package and the `e2e` section from `angular.json`
**Dependencies:** TS-3
**Source:** [Protractor deprecation announcement](https://blog.angular.dev/protractor-deprecation-update-august-2023-2beac7402ce0) — HIGH confidence

---

### TS-12: Replace TSLint with ESLint
**What:** Remove `tslint`, `codelyzer` and the `@angular-devkit/build-angular:tslint` lint builder. Install `@angular-eslint/schematics` and configure ESLint.
**Why required:** TSLint is officially dead (deprecated by Palantir in 2019). The `@angular-devkit/build-angular:tslint` builder was removed in Angular 17. Without replacing it, the `ng lint` target in `angular.json` will reference a nonexistent builder and the build will error.
**Complexity:** Low-Medium — automated migration exists; `npx ng add @angular-eslint/schematics` runs a schematic that converts `tslint.json` to `.eslintrc.json` and updates `angular.json`
**Dependencies:** TS-3
**Source:** [angular-eslint migration guide](https://github.com/angular-eslint/angular-eslint/blob/main/docs/MIGRATING_FROM_TSLINT.md) — HIGH confidence

---

## RECOMMENDED

Steps that are not strictly required to make the app build and run, but that are strongly recommended for maintainability and to avoid accumulating technical debt immediately after the upgrade.

### REC-1: Migrate to the Application Builder (esbuild)
**What:** Change the `build` target in `angular.json` from `@angular-devkit/build-angular:browser` to `@angular-devkit/build-angular:application`. Update associated config keys: `main` → `browser`, `polyfills` from string to array.
**Why recommended:** The `browser` builder is officially deprecated as of Angular 17. Angular 18 `ng update` actively prompts for this migration. Using the deprecated builder means missing esbuild performance gains (67%+ faster builds) and will become a blocker in Angular 20.
**Complexity:** Low — automated schematic: `ng update @angular/cli --name use-application-builder`
**Key changes in angular.json:**
- `"builder": "@angular-devkit/build-angular:browser"` → `"builder": "@angular-devkit/build-angular:application"`
- `"main": "src/main.ts"` → `"browser": "src/main.ts"`
- `"polyfills": "src/polyfills.ts"` → `"polyfills": ["zone.js"]`
- Output path shifts from `dist/evergreen/` to `dist/evergreen/browser/` — Firebase Hosting config must be updated to match
**Dependencies:** TS-3 and TS-10 (clean angular.json first)
**Source:** [Build system migration guide](https://angular.dev/tools/cli/build-system-migration) — HIGH confidence

---

### REC-2: Update Firebase Hosting Output Path
**What:** Update `firebase.json` and `.firebaserc` to point to the new build output path if the application builder migration (REC-1) is done
**Why recommended:** The application builder changes the default output from `dist/evergreen/` to `dist/evergreen/browser/`. Firebase Hosting will serve a 404 for everything if pointed at the old path.
**Complexity:** Low — one-line change in `firebase.json`
**Dependencies:** REC-1
**Source:** [Build system migration docs output path section](https://angular.dev/tools/cli/build-system-migration) — HIGH confidence

---

### REC-3: Update Angular Material Prebuilt Theme Import
**What:** Verify the `indigo-pink.css` prebuilt theme import path resolves correctly after the upgrade and update the path in `angular.json` if it changed
**Why recommended:** The import path for prebuilt themes changed across versions. In Angular Material 19, M3-based themes are the default. `indigo-pink.css` still exists as an M2 compatibility theme, but visually there will be sizing and spacing differences due to MDC components. A brief visual regression check is warranted.
**Complexity:** Low
**Dependencies:** TS-6
**Source:** [Angular Material theming M3 migration](https://angular-ui.com/courses/angular-material-theming/updating-18) — MEDIUM confidence

---

### REC-4: Upgrade tslib
**What:** Upgrade `tslib` from ^1.10.0 to ^2.x
**Why recommended:** Angular 13+ requires `tslib ^2.3.0`. The `ng update` schematic should handle this, but verifying the upgrade happened is worthwhile. Using tslib 1.x with TypeScript 5.x is unsupported.
**Complexity:** Low — package version bump
**Dependencies:** TS-2
**Source:** Angular 13 release notes — HIGH confidence

---

### REC-5: Update @types/node
**What:** Upgrade `@types/node` from ~8.9.4 to a version compatible with the new Node runtime (^18 or ^20)
**Why recommended:** Type definitions for Node 8 are severely outdated and will conflict with modern TypeScript and Angular tooling that uses Node APIs internally.
**Complexity:** Low
**Dependencies:** TS-1, TS-2
**Source:** Standard TypeScript ecosystem practice — HIGH confidence

---

## OPTIONAL MODERNIZATION

Nice-to-have improvements that make the codebase more aligned with Angular 19 best practices, but are explicitly out of scope for a functionality-preserving dependency upgrade.

### OPT-1: Migrate to Standalone Components
**What:** Remove NgModules, convert all 4 components + `MatDepsModule` pattern to standalone components using `imports: []` in `@Component` decorators. Bootstrap with `bootstrapApplication()` instead of `platformBrowserDynamic().bootstrapModule()`.
**Value:** Aligns with Angular's stated direction; eliminates boilerplate; simplifies the file structure (removes all `*.module.ts` files)
**Complexity:** Medium — automated schematic: `ng generate @angular/core:standalone --convertAll`
**Risk for this project:** Low. The app has no complex module dependencies. The MatDepsModule barrel becomes unnecessary — each component imports the Material modules it needs directly.
**Current state:** NgModules remain fully supported in Angular 19 with `standalone: false`. Not urgent.
**Source:** [Standalone migration guide](https://angular.dev/reference/migrations/standalone) — HIGH confidence

---

### OPT-2: Migrate Lazy Routes to Standalone Route Pattern
**What:** Use `loadComponent` instead of `loadChildren` in `app-routing.module.ts` (or standalone routing config), pointing directly to standalone components rather than modules
**Value:** Eliminates the per-feature routing module files; more concise route config
**Complexity:** Low (once OPT-1 is done) / Medium (if done before OPT-1)
**Dependencies:** OPT-1 recommended first
**Source:** Angular routing docs — HIGH confidence

---

### OPT-3: Adopt Signals for Reactive State
**What:** If any local reactive state exists in components (none currently), replace with Angular Signals API introduced in Angular 16
**Value:** Modern reactive primitive; better performance through granular change detection
**Complexity:** N/A — this project has zero reactive state. Components only render hardcoded arrays. No change warranted.
**Source:** Angular Signals docs — HIGH confidence

---

### OPT-4: Enable TypeScript Strict Mode
**What:** Add `"strict": true` to `tsconfig.json`
**Value:** Catches type errors early; aligns with Angular 12+ new project defaults
**Complexity:** Low-Medium — will surface type errors in component property declarations and template bindings that must be fixed before the build passes
**Risk:** Discovering latent type errors is desirable, but adds scope to what is otherwise a mechanical upgrade
**Source:** Angular strict mode guide — HIGH confidence

---

### OPT-5: Replace Google Analytics Universal Analytics (UA) with GA4
**What:** Update `index.html` from the legacy `UA-142772288-1` gtag.js snippet to a GA4 measurement ID
**Value:** Universal Analytics was sunset by Google in July 2023. The UA property no longer collects data.
**Complexity:** Low — gtag.js snippet update in `index.html`
**Note:** This is outside Angular migration scope but is a real breakage that exists now regardless of the Angular version.
**Source:** Google Analytics deprecation — HIGH confidence

---

## Feature Dependencies

```
TS-1 (Node upgrade)
  └── TS-2 (TypeScript upgrade)
        └── TS-3 (Angular core/cli upgrade)
              ├── TS-4 (standalone: false on components)
              ├── TS-5 (remove hammerjs) — can be done independently
              ├── TS-6 (Angular Material upgrade)
              ├── TS-7 (angular/fire upgrade)
              ├── TS-8 (RxJS upgrade)
              ├── TS-9 (zone.js upgrade)
              ├── TS-10 (angular.json cleanup)
              ├── TS-11 (remove Protractor)
              └── TS-12 (TSLint → ESLint)
                    └── REC-1 (application builder migration)
                          └── REC-2 (Firebase output path update)

REC-3 depends on TS-6
REC-4, REC-5 depend on TS-2

OPT-1 requires all table stakes complete; OPT-2 requires OPT-1
```

---

## Anti-Features

Steps to explicitly NOT do during this migration.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Migrate to standalone components during the same pass as the version upgrade | Doubles the surface area of change; makes it impossible to bisect regressions | Keep NgModules; add `standalone: false`; do OPT-1 as a separate milestone if desired |
| Attempt a direct ng update from 8 to 19 in one step | `ng update` does not support skipping major versions; schematics run per-major-version and depend on each other | Upgrade one or two major versions at a time, verifying the build at each step |
| Enable TypeScript strict mode as part of the upgrade | TypeErrors surfaced mid-upgrade will mix with migration issues; hard to triage | Do it as a separate follow-on task (OPT-4) |
| Migrate AngularFire to modular SDK API during the upgrade | No application code uses AngularFire SDK features; only the deploy builder is used | Leave AngularFire at its compat layer if needed; the deploy builder works regardless |
| Add new pages or visual changes | Out of scope per PROJECT.md; any visual change becomes a regression | Keep all component templates and styles as-is |

---

## MVP Recommendation

The minimum set that produces a working Angular 19 application deployed to Firebase:

**Must complete (table stakes, all 12):**
TS-1 through TS-12 in dependency order

**Complete immediately after (recommended, blockers for production):**
REC-1 (application builder) + REC-2 (Firebase output path)
REC-3 (theme path verification) + REC-4 (tslib) + REC-5 (@types/node)

**Defer indefinitely (optional modernization):**
OPT-1 through OPT-5 — none required for the site to work

---

## Sources

- [Angular version compatibility table](https://angular.dev/reference/versions) — HIGH confidence
- [Angular Update Guide (interactive)](https://update.angular.io/) — HIGH confidence
- [Angular build system migration](https://angular.dev/tools/cli/build-system-migration) — HIGH confidence
- [The future is standalone — Angular Blog](https://blog.angular.dev/the-future-is-standalone-475d7edbc706) — HIGH confidence
- [Standalone migration reference](https://angular.dev/reference/migrations/standalone) — HIGH confidence
- [AngularFire v7 upgrade guide](https://github.com/angular/angularfire/blob/main/docs/version-7-upgrade.md) — HIGH confidence
- [AngularFire deploy getting started](https://github.com/angular/angularfire/blob/main/docs/deploy/getting-started.md) — MEDIUM confidence
- [angular-eslint migration from TSLint](https://github.com/angular-eslint/angular-eslint/blob/main/docs/MIGRATING_FROM_TSLINT.md) — HIGH confidence
- [Angular Material MDC migration (v15 docs)](https://v15.material.angular.dev/guide/mdc-migration) — MEDIUM confidence (content JS-rendered)
- [Angular Material 15 real-world migration](https://trungvose.com/experience/angular-material-15-migration/) — MEDIUM confidence
- [RxJS 6→7 breaking changes](https://rxjs.dev/deprecations/breaking-changes) — HIGH confidence
- [Angular 19 standalone migration guide — markaicode.com](https://markaicode.com/angular-19-migration-guide/) — MEDIUM confidence
- [Protractor deprecation — Angular Blog](https://blog.angular.dev/protractor-deprecation-update-august-2023-2beac7402ce0) — HIGH confidence
