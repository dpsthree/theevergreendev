# Angular 8→19 Migration Pitfalls

**Domain:** Angular major-version upgrade (8 → 19, 11 major versions)
**Project:** theevergreendev — personal SPA with Angular Material, AngularFire deploy
**Researched:** 2026-03-31

---

## Critical Pitfalls

Mistakes that cause build failures, runtime breakage, or require significant rework.

---

### Pitfall 1: Skipping Versions Instead of Stepping Through Them

**What goes wrong:** Attempting `ng update @angular/core@19` directly from Angular 8 fails or produces a partially migrated codebase. The `ng update` tooling enforces one-major-version steps for good reason — each version runs its own migration schematics that transform code, configuration, and templates. Skipping versions means those schematics never run, leaving deprecated APIs, removed syntax, and stale configuration in place that cause cryptic failures at the final version.

**Why it happens:** The desire to "just get to 19" is natural, but Angular's own CLI blocks same-command multi-version jumps. Developers then try workarounds (installing packages manually, `--force`) that bypass schematic migrations.

**Consequences:** Accumulated breaking changes from 11 versions fire simultaneously. Template compiler errors, missing providers, unknown builder errors, and runtime failures all appear at once with no clear signal of which version introduced each problem.

**Prevention:**
- Upgrade one major version at a time: 8 → 9 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19
- At each step: `ng update @angular/core@N @angular/cli@N` and let schematics run
- Build and verify the app runs before moving to the next version
- Commit after each successful version upgrade — provides rollback points and a clear history of what each step changed

**Warning signs:**
- `ng update` reports "Cannot update past one major version at a time"
- Temptation to use `--force` or `--allow-dirty` to get past update blockers

**Phase:** First phase of the upgrade milestone. Establish the step-through discipline before writing a single line of code.

---

### Pitfall 2: Node.js Version Is Not Upgraded Before Starting

**What goes wrong:** Angular 17+ requires Node.js 18.13+. Angular 18 and 19 require Node.js 18.19.1+, 20.11.1+, or 22.0.0+. The project currently pins Node 10 in `.travis.yml`. Running `ng update` or `npm install` for Angular 17+ on Node 10, 12, or 14 produces confusing esbuild compilation failures, not a clear Node version error.

**Why it happens:** Node version is treated as an afterthought, separate from the Angular version upgrade. But Angular CLI 17+ will not work at all on old Node.

**Consequences:** `ng update` itself may fail to execute. esbuild (used from Angular 17+) requires Node 18 and produces cryptic "Failed to bundle" errors on older runtimes. CI/CD (Travis CI) will fail on every commit if not updated simultaneously.

**Prevention:**
- Upgrade Node to 20 LTS before starting any Angular version steps
- Update `.travis.yml` to specify `node_js: "20"` (or migrate CI entirely to GitHub Actions at this point — Travis is already using deprecated features)
- Verify local Node version with `node --version` before running any `ng update`

**Warning signs:**
- Any `ng update` command fails with unexpected errors before even attempting the Angular upgrade
- esbuild errors that don't mention Angular versions
- `npm install` resolves but `ng build` fails immediately

**Phase:** Pre-upgrade environment setup. Must happen before version 8 → 9 step.

---

### Pitfall 3: Angular 9 Ivy Enforces AOT Strict Template Checking — Existing Templates May Fail

**What goes wrong:** The project currently has `"aot": false` in `angular.json`. Angular 9 makes Ivy and AOT compilation the default for both development and production builds. Ivy's template type-checker is significantly stricter than View Engine — it validates property bindings against TypeScript types, catches undefined template variables, and rejects patterns View Engine silently ignored.

**Why it happens:** The codebase was developed under Angular 8's JIT mode (`aot: false`), so template errors that AOT would have caught were never surfaced.

**Consequences:** The build breaks on `ng update @angular/core@9` with template type errors that were previously invisible. The migration schematic cannot fix these automatically — each requires manual inspection. The speaking component (158 lines of inline data with inconsistent object shapes, noted in CONCERNS.md) is especially likely to surface type errors.

**Prevention:**
- Before the 8 → 9 step, change `"aot": false` to `"aot": true` in `angular.json` and fix any AOT errors while still on Angular 8
- Enable `"strictTemplates": true` in `tsconfig.json` once on Angular 9 to surface remaining issues early
- The CONCERNS.md note about missing TypeScript interfaces on speaking tile data is directly relevant here — add an interface for the tile shape before enabling strict templates

**Warning signs:**
- Template errors that only appear in production builds (the current `aot: false` dev / `aot: true` prod split)
- `NG` error codes in build output after upgrading to Angular 9
- Build succeeds with `--configuration=development` but fails with `--configuration=production`

**Phase:** The 8 → 9 step. The AOT issue must be resolved as the gating requirement for this step.

---

### Pitfall 4: The `loadChildren` String Syntax Was Removed

**What goes wrong:** Angular 8 deprecated string-based lazy loading syntax. Angular 9 fully removed it. The `app-routing.module.ts` currently uses `loadChildren` with dynamic import syntax (the Angular 8 way was modernized as part of Angular 8's own deprecation cycle), but this must be verified. If any route still uses the old string form (`loadChildren: './path/module#ClassName'`), the build will fail hard on Angular 9.

**Why it happens:** Angular 8 supported both the string form (deprecated) and the import() form (new). Teams that hadn't yet migrated string syntax get a hard break at Angular 9.

**Consequences:** Router configuration fails to compile. Lazy-loaded routes are completely broken.

**Prevention:**
- Before starting upgrades, audit `app-routing.module.ts` and any child routing modules for string-form `loadChildren`
- All routes must use: `loadChildren: () => import('./path/module').then(m => m.ModuleName)`
- The Angular 8 migration schematic should have handled this, but verify manually

**Warning signs:**
- `DeprecatedLoadChildren` TypeScript type errors
- `NgModuleFactoryLoader` not found errors
- Router fails to navigate to any lazy route at runtime

**Phase:** Pre-upgrade audit, resolved at 8 → 9 step.

---

### Pitfall 5: The `--prod` Build Flag Is Removed in Angular 14

**What goes wrong:** The root `package.json` build script runs `ng build --prod`. This flag was deprecated in Angular 12 and fully removed in Angular 14. After reaching Angular 14, every build fails with `Unknown argument: prod`.

**Why it happens:** The build script is hardcoded at the root level and is not automatically updated by `ng update` schematics.

**Consequences:** The entire build pipeline breaks silently. CI/CD produces "Unknown argument" errors. No production builds are possible.

**Prevention:**
- At the Angular 12 step: replace `ng build --prod` with `ng build --configuration production` in `package.json` (root) and `client/package.json`
- Do this at Angular 12, not 14, to avoid the hard failure

**Warning signs:**
- Angular 12 prints a deprecation warning: "Option 'prod' is deprecated" in build output
- Any build script containing `--prod` after Angular 12 is a time bomb

**Phase:** The 12 → 13 step (or earlier at 12 as soon as the warning appears).

---

### Pitfall 6: Angular Material's MDC Component Migration Breaks Visual Appearance

**What goes wrong:** Angular Material v15 replaced all components with MDC-based implementations. CSS class names changed entirely: `mat-button` became `mat-mdc-button`, `mat-form-field-flex` became `mat-mdc-text-field-wrapper`, and so on across all components. The migration schematic handles module/import changes but leaves `// TODO (mdc-migration)` comments in SCSS that require manual fixes. Spacing, density, shadows, and animations all change to Material Design 3 specifications.

**Why it happens:** The MDC migration is a full component reimplementation, not a rename. Global SCSS selectors targeting internal Material class names break completely because the DOM structure changed, not just the class names.

**Consequences:** The site's visual appearance changes. Components may render with different sizing, spacing, or missing styles. Any SCSS that targets `mat-` prefixed classes (global styles or component styles using `::ng-deep`) silently stops applying.

**Prevention:**
- At the Angular 14 → 15 step, run `ng update @angular/material@15` which executes the MDC migration schematic
- Search all SCSS files for `mat-` class references and update to `mat-mdc-` equivalents
- The project uses `MatCardModule`, `MatToolbarModule`, `MatSidenavModule`, `MatListModule`, `MatIconModule`, `MatButtonModule`, `MatGridListModule` — verify the visual output of each after migration
- The `indigo-pink` Material theme changes its SCSS API at v15; verify the theme still imports and applies correctly

**Warning signs:**
- `// TODO (mdc-migration)` comments in SCSS after running the Angular 15 schematic
- Visual regressions — components look different (different padding, font size, border radius)
- Console errors about deprecated `@import` paths in Angular Material SCSS

**Phase:** The 14 → 15 step. Plan for manual visual verification of all three pages after this step.

---

### Pitfall 7: AngularFire's Module API Was Completely Replaced

**What goes wrong:** `@angular/fire` v5 (currently in the project) uses `AngularFireModule.initializeApp(config)` and module-based imports like `AngularFirestoreModule`. AngularFire v7 replaced this with a function-based API: `provideFirebaseApp(() => initializeApp(config))`, `provideFirestore()`, etc. The old API was moved to a compatibility layer at `@angular/fire/compat/*`, which itself was removed in later versions. Additionally, the Firebase JS SDK jumped from v6 to v9 (modular API) — a completely different import structure.

**Why it happens:** This project uses `@angular/fire` only for its deploy builder (`@angular/fire:deploy`), not for runtime Firebase SDK features. But the package still needs to be upgraded, and the deploy builder configuration in `angular.json` changes across versions.

**Consequences:** After Angular 12+, `@angular/fire` v5 is incompatible (Ivy-only as of v7). The deploy builder target in `angular.json` may reference an old builder format that no longer exists, breaking `ng deploy`. Firebase SDK v6 (currently `>= 5.5.7 <7`) is incompatible with modern AngularFire.

**Prevention:**
- Upgrade `@angular/fire` alongside Angular, following major version alignment (AngularFire 18 for Angular 18, etc.)
- Since this project only uses AngularFire for deployment (not Firestore/Auth at runtime), the runtime API migration is low-risk, but the `angular.json` deploy architect target must be verified after each AngularFire upgrade
- Verify `ng deploy` works after the AngularFire upgrade step
- Firebase JS SDK must jump from v6 to v9 modular API simultaneously with AngularFire v7+; even though it's not directly used in app code here, it is a transitive requirement

**Warning signs:**
- `Error: Cannot find module '@angular/fire/...'` at build time
- `ng deploy` fails with "builder not found" errors after AngularFire upgrade
- `AngularFireModule` import errors after Angular 12+

**Phase:** Aligned with the Angular 12 step (AngularFire v7 requires Angular 12+). Verify deploy after every AngularFire major version bump.

---

### Pitfall 8: Build System Change (webpack → esbuild) Breaks SCSS Tilde Imports

**What goes wrong:** Angular 17 introduced the esbuild-based `application` builder. Angular 18 made it the default and runs an automated migration. The esbuild builder does not support webpack's tilde (`~`) path resolution in SCSS `@import` statements. Any SCSS containing `@import '~some-package/...'` silently breaks or throws a hard error.

**Why it happens:** webpack had a special resolver that interpreted `~package-name` as a `node_modules` path. esbuild uses standard CSS/SCSS module resolution and does not recognize the `~` prefix.

**Consequences:** SCSS compilation fails or produces missing styles at runtime. The Angular Material theme import (if using tilde syntax) breaks entirely.

**Prevention:**
- Before or at the Angular 17 → 18 step, search all `.scss` files for `~` in import statements
- Remove all tildes: `@import '~@angular/material/...'` becomes `@import '@angular/material/...'`
- Run `ng update @angular/cli@18` which includes an automated migration for this, but verify manually afterward
- Also check `angular.json` `styles` array entries for tilde-prefixed paths

**Warning signs:**
- SCSS compilation errors referencing "cannot resolve" after switching to the application builder
- Theme not applying at runtime but no explicit error
- Missing icons, fonts, or component styles after the esbuild migration

**Phase:** The 17 → 18 step (when esbuild becomes default), but audit at the 16 → 17 step when esbuild first becomes available.

---

### Pitfall 9: Angular 19 Changes the `standalone` Default, Breaking NgModule Declarations

**What goes wrong:** Angular 19 changes the default value of the `standalone` property in component, directive, and pipe decorators from `false` to `true`. Any component that does not explicitly set `standalone: false` is now treated as standalone — and standalone components cannot be declared in NgModules. The entire existing app uses NgModules (`AppModule`, `BioModule`, `SpeakingModule`, `PostsModule`, `MatDepsModule`).

**Why it happens:** `ng update @angular/core@19` runs a schematic that should add `standalone: false` to all existing NgModule-declared components, but the schematic has a known edge case: it does not update components that have no `imports` array if they were previously marked `standalone: true` explicitly. If any component was incorrectly set up in a previous step, this can be missed.

**Consequences:** Build error on every component: "Component is standalone, and cannot be declared in an NgModule." The entire application fails to compile.

**Prevention:**
- Run `ng update @angular/core@19 @angular/cli@19` and let the schematic add `standalone: false` to existing components
- After the schematic runs, grep all `@Component`, `@Directive`, and `@Pipe` decorators in `app/` to confirm `standalone: false` is present on every one still declared in an NgModule
- This project does not need to migrate to standalone components as part of this upgrade — keeping NgModules is valid and supported

**Warning signs:**
- Build errors "Component AppComponent is standalone, and cannot be declared in an NgModule" after Angular 19 update
- Any component missing a `standalone` property after the Angular 19 migration schematic runs

**Phase:** The 18 → 19 step. Verify schematic output explicitly.

---

### Pitfall 10: TSLint Is Silently Non-Functional After Angular 13

**What goes wrong:** TSLint and Codelyzer were removed from Angular CLI scaffolding in Angular 12. The Angular CLI's TSLint builder (`@angular-devkit/build-angular:tslint`) was removed in Angular 13. The `ng lint` command stops working entirely. The `tslint.json` file and `codelyzer` package become inert.

**Why it happens:** The project still has `tslint.json`, `codelyzer` in dependencies, and a lint architect target in `angular.json` using the now-removed builder. The files sit there but `ng lint` throws "builder not found."

**Consequences:** Linting is silently disabled. Code quality checks disappear from CI. More importantly, the `angular.json` lint target references a non-existent builder, which can cause `ng update` schematics to fail because they parse the full `angular.json` structure.

**Prevention:**
- At the Angular 11 → 12 step: add `@angular-eslint/schematics` and run `ng add @angular-eslint/schematics` to migrate lint configuration
- The schematic handles: removing `tslint.json`, creating `.eslintrc.json`, updating `angular.json` lint target to use `@angular-eslint/builder:lint`
- Remove `tslint` and `codelyzer` from `package.json` after the migration

**Warning signs:**
- `ng lint` fails with "builder '@angular-devkit/build-angular:tslint' not found" on Angular 13+
- `ng update` schematics fail partway through with JSON parse errors on `angular.json`

**Phase:** The 11 → 12 step. Do this migration before Angular 13 removes the builder and potentially breaks schematic execution.

---

## Moderate Pitfalls

These cause friction and require effort but are recoverable without rework.

---

### Pitfall 11: HammerJS Must Be Removed or Explicitly Retained

**What goes wrong:** `hammerjs ^2.0.8` is currently in the project's dependencies (STACK.md). Angular Material removed its HammerJS dependency in v9. If the project no longer uses any HammerJS touch gestures, the package can be removed. If left in place, it causes an unused import warning at Angular 9+ and HammerJS itself is unmaintained (the repository has not had meaningful commits in years, noted in the GitHub issue tracker).

**Prevention:**
- At the 8 → 9 step, run the Angular Material 9 migration schematic — it detects HammerJS usage and either adds `HammerModule` to `AppModule` imports (if gesture events are found in templates) or removes the import
- If no gesture events are used, remove `hammerjs` from `package.json` entirely
- Verify no template uses `(swipe)`, `(pan)`, `(rotate)`, `(pinch)` events before removing

**Phase:** 8 → 9 step.

---

### Pitfall 12: RxJS subscribe() Positional Callbacks Are Deprecated in RxJS 7

**What goes wrong:** RxJS 7 (required for Angular 14+) deprecated the positional-argument form of `subscribe()`: `observable.subscribe(nextFn, errorFn, completeFn)`. The correct form is the observer-object syntax: `observable.subscribe({ next: nextFn, error: errorFn, complete: completeFn })`. Also, `source$.toPromise()` was deprecated in favor of `lastValueFrom(source$)` or `firstValueFrom(source$)`.

**Why it matters for this project:** The project uses RxJS 6.4.0 (STACK.md). The positional callback form is common in Angular 8-era code. Though this project's codebase is small (~600 lines), any RxJS usage in components or services needs to be checked.

**Prevention:**
- At the Angular 13 → 14 step (where RxJS 7 is required), search all `.ts` files for `.subscribe(` patterns with multiple positional arguments
- Use the observer-object form for all new subscribe calls
- `rxjs-tslint-rules` or ESLint rules can flag the deprecated form

**Phase:** 13 → 14 step.

---

### Pitfall 13: Angular Material Theming SCSS API Changed Multiple Times

**What goes wrong:** The Angular Material theming SCSS API changed significantly across the 8→19 span:
- v8: `@import '~@angular/material/theming'; @include mat-core(); $theme: mat-light-theme(...)`
- v13+: `@use '@angular/material' as mat; @include mat.core(); $theme: mat.define-light-theme(...)`
- v17+: M3 theming with `mat.theme()` and CSS custom property tokens

Each change requires updating `styles.scss` to use the new mixin API. Using old mixin names produces SCSS compilation errors.

**Prevention:**
- After each Angular Material major version bump, check whether SCSS theme imports still compile
- The `indigo-pink` prebuilt theme (`@angular/material/prebuilt-themes/indigo-pink.css`) is the most stable path — using a prebuilt theme avoids custom mixin API changes entirely
- If the project just imports the prebuilt theme (which is the typical simple setup), this pitfall is mostly avoided

**Warning signs:**
- SCSS compilation errors referencing `mat-core`, `mat-light-theme`, or `mat-dark-theme` as undefined mixins
- `@angular/material/theming` import failing

**Phase:** Material upgrade steps, particularly 12 → 13 (`@use` syntax) and 14 → 15 (MDC).

---

### Pitfall 14: package-lock.json From Node 10 Is Incompatible With npm 7+

**What goes wrong:** The current `package-lock.json` was generated by npm on Node 10 (npm v6). npm v7+ (shipped with Node 16+) uses lockfile format v2/v3, which is incompatible with v1 lockfiles in terms of peer dependency handling. Running `npm install` on Node 20 with a v1 lockfile regenerates the lockfile, which can pull in different transitive dependency versions than were originally locked.

**Prevention:**
- Delete `package-lock.json` and regenerate it fresh after upgrading Node and updating `package.json` to target Angular N+1
- Do not attempt to preserve the Angular 8 lockfile across a Node version boundary
- Use `npm install` (not `npm ci`) for the initial setup after each major Angular step to allow dependency resolution

**Warning signs:**
- `npm ci` failures due to "lockfile out of sync"
- Unexpected transitive dependency versions after `npm install` on the new Node version

**Phase:** Pre-upgrade environment setup (before 8 → 9 step).

---

## Minor Pitfalls

Short to fix, easy to overlook.

---

### Pitfall 15: Protractor e2e Target in `angular.json` Blocks Schematics

**What goes wrong:** The `angular.json` has an `e2e` architect target using `@angular-devkit/build-angular:protractor`. Protractor was removed in Angular 15. The presence of this target does not prevent building, but it can cause `ng update` schematics to emit warnings, and the target itself becomes a dead reference after Angular 15.

**Prevention:**
- Remove the `e2e` target from `angular.json` and the entire `e2e/` directory at the Angular 12 step (when Protractor was first officially deprecated)
- Since the project has no real e2e tests (CONCERNS.md confirms only stub files exist), there is nothing to migrate

**Phase:** 11 → 12 step. Remove the dead target before the builder is fully gone at Angular 15.

---

### Pitfall 16: Travis CI Will Not Receive the Deployment After Node Upgrade

**What goes wrong:** `.travis.yml` uses `node_js: 10` and the deprecated `skip_cleanup: true` dpl v1 syntax. After upgrading to Angular 17+, CI deployments to Firebase Hosting will fail because Node 10 cannot run Angular CLI 17. Additionally, `skip_cleanup` produces warnings in current Travis CI.

**Prevention:**
- Update `.travis.yml` to `node_js: "20"` and remove `skip_cleanup: true`
- Or migrate to GitHub Actions entirely — GitHub Actions is now the community standard for Angular CI/CD and Firebase deploy has first-class Actions support

**Phase:** Pre-upgrade environment setup.

---

### Pitfall 17: `tslib` Version Must Be Bumped With TypeScript

**What goes wrong:** The project uses `tslib ^1.10.0`. Angular 10+ requires `tslib ^2.0.0`. These are incompatible — `^1.x` will never resolve to v2. The TypeScript runtime helpers change API between v1 and v2.

**Prevention:**
- At the 9 → 10 step, update `tslib` to `^2.0.0` in `package.json`
- `ng update @angular/core@10` schematic should handle this, but verify `package.json` afterward

**Phase:** 9 → 10 step.

---

## Phase-Specific Warning Map

| Phase / Step | Pitfall to Watch | Mitigation |
|---|---|---|
| Pre-upgrade setup | Node 10 incompatibility (Pitfall 2) | Upgrade Node to 20 LTS first |
| Pre-upgrade setup | package-lock.json v1 format (Pitfall 14) | Delete lockfile and regenerate |
| Pre-upgrade setup | Travis CI broken (Pitfall 16) | Update Node in CI or switch to GitHub Actions |
| 8 → 9 | AOT strict templates reveal existing errors (Pitfall 3) | Enable AOT on Angular 8 first; add TS interfaces to tile data |
| 8 → 9 | loadChildren string syntax removed (Pitfall 4) | Audit routing before upgrade |
| 8 → 9 | HammerJS cleanup (Pitfall 11) | Run Material 9 schematic, remove if unused |
| 8 → 9 | tslib v1 incompatible (Pitfall 17) | Bump to tslib ^2.0.0 |
| 11 → 12 | TSLint builder removed at Angular 13 (Pitfall 10) | Migrate to angular-eslint at this step |
| 11 → 12 | Protractor dead target (Pitfall 15) | Remove e2e architect target |
| 12 → 13 | `--prod` flag removed at Angular 14 (Pitfall 5) | Replace with `--configuration production` |
| 12 → 13 | AngularFire module API replaced (Pitfall 7) | Upgrade AngularFire to v7 (requires Angular 12); verify ng deploy |
| 13 → 14 | RxJS 7 subscribe syntax deprecated (Pitfall 12) | Audit subscribe() calls in all .ts files |
| 14 → 15 | Angular Material MDC breaks visual appearance (Pitfall 6) | Visual regression check all three pages |
| 14 → 15 | Material theming SCSS API changed (Pitfall 13) | Test SCSS compilation; prefer prebuilt theme |
| 16 → 17 | esbuild tilde imports in SCSS (Pitfall 8) | Audit SCSS for ~imports before enabling application builder |
| 17 → 18 | Build system migration changes output paths (Pitfall 8) | Verify firebase.json public path after migration |
| 18 → 19 | standalone: true becomes default (Pitfall 9) | Verify ng update schematic adds standalone: false to all NgModule components |
| Any step | Version skipping temptation (Pitfall 1) | Commit after each step; never skip a major version |

---

## Sources

- Angular Update Guide: https://angular.dev/update-guide
- Angular Version Compatibility Table: https://angular.dev/reference/versions
- Angular 19 Migration Guide (Markaicode): https://markaicode.com/angular-19-migration-guide/
- Angular Standalone Default Change (Angular Blog): https://blog.angular.dev/the-future-is-standalone-475d7edbc706
- Angular Material MDC Migration Guide: https://v17.material.angular.dev/guide/mdc-migration
- Halodoc MDC Migration Case Study: https://blogs.halodoc.io/mdc-migration-angular/
- AngularFire v7 Upgrade Guide: https://github.com/angular/angularfire/blob/main/docs/version-7-upgrade.md
- Angular Build System Migration (esbuild): https://angular.dev/tools/cli/build-system-migration
- RxJS 6-to-7 Change Summary: https://rxjs.dev/6-to-7-change-summary
- Angular Ivy Guide (Angular 9 AOT): https://dev.to/this-is-angular/a-look-at-major-features-in-the-angular-ivy-version-9-release-4dn7
- Protractor Deprecation: https://blog.angular.dev/protractor-deprecation-update-august-2023-2beac7402ce0
- Angular 15 Migration Real-World (Trung Vo): https://trungvose.com/experience/angular-material-15-migration/
- Angular Migration 13-to-19 Case Study: https://www.rightanglesol.com/angular-upgrade-guide-13-to-19/
- Angular Breaking Changes (DeepWiki): https://deepwiki.com/angular/angular/6.3-breaking-changes-and-version-updates
