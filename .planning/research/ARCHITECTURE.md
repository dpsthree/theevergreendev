# Architecture Patterns: Angular 8 to 19 Migration

**Domain:** Angular SPA — dependency modernization
**Researched:** 2026-03-31
**Project:** theevergreendev

---

## Overview of What Is Changing

This project uses Angular 8 architecture: NgModule-based bootstrap, View Engine compiler,
Webpack build system, and feature modules with `loadChildren` lazy loading. Angular 19 has
changed all four of these areas. The changes divide into two categories:

- **REQUIRED** — The app will not build or run correctly without this change.
- **OPTIONAL** — The app continues to work without this change, but the change is recommended
  for long-term maintainability or unlocks other improvements.

---

## Change 1: View Engine to Ivy Compiler

**Status: REQUIRED (handled automatically by `ng update`)**
**Introduced: Angular 9**

Angular 8 uses View Engine. Angular 9 made Ivy the default. View Engine was fully removed in
Angular 13.

### What changes

The compiler and runtime are replaced. No View Engine code exists in Angular 13+. There is
nothing to manually do — the Ivy runtime ships inside `@angular/core` and `@angular/compiler`.
The Angular compatibility compiler (`ngcc`) handled transitional library compatibility through
Angular 12; it no longer exists in Angular 13+.

### Impact on this project

Nil. The app has no custom decorators, no View Engine-specific `enableIvy: false` opt-out, and
no View Engine-specific library workarounds. The migration is transparent.

### Confidence: HIGH — official Angular documentation

---

## Change 2: Build System — Webpack to esbuild/Vite (Application Builder)

**Status: REQUIRED for Angular 19; handled by `ng update` migration prompt**
**Introduced: Angular 17 (default for new projects); Angular 19 drops the Webpack builder**

### The builder change

Angular 8 `angular.json` uses:
```json
"builder": "@angular-devkit/build-angular:browser"
```

Angular 19 uses:
```json
"builder": "@angular-devkit/build-angular:application"
```

The `application` builder uses esbuild + Vite instead of Webpack. It is faster, produces smaller
bundles, and enables SSR by default (though SSR is not used in this project).

### Specific `angular.json` property changes

| Old Property | New Property | Notes |
|---|---|---|
| `main` | `browser` | Entry point reference rename |
| `polyfills` (string) | `polyfills` (array) | Must become an array: `["zone.js"]` |
| `outputPath` (string) | `outputPath` (object with `base` + `browser` keys) | Default output is now `dist/<name>/browser/` |
| `buildOptimizer` | Remove entirely | Covered by `optimization` |
| `vendorChunk` | Remove entirely | Not needed |
| `commonChunk` | Remove entirely | Not needed |
| `resourcesOutputPath` | Remove entirely | Automatically set to `media/` |
| `deployUrl` | Remove entirely | Unsupported; use `<base href>` instead |

### Impact on Firebase deployment

The default output path shifts from `dist/evergreen/` to `dist/evergreen/browser/`. The
`firebase.json` `public` setting points to `client/dist/evergreen`. After migration, this must be
updated to `client/dist/evergreen/browser` or the `outputPath` in `angular.json` must be
overridden to preserve the old path.

**This is the most operationally critical change in the entire migration.** If it is missed,
`firebase deploy` will serve a blank page because it is pointing at the wrong directory.

### SCSS import syntax change

Webpack allowed `~` prefix in SCSS imports (e.g., `@import '~@angular/material/...'`). esbuild
does not support this syntax. All `~`-prefixed SCSS `@import` statements must be removed. The
automated migration handles this, but custom SCSS files should be reviewed.

### Confidence: HIGH — angular.dev official migration guide

---

## Change 3: `polyfills.ts` Handling

**Status: REQUIRED (structural change to angular.json)**
**Introduced: Angular 17**

Angular 8 uses a `polyfills.ts` file that is referenced by `angular.json` as a single string:
```json
"polyfills": "src/polyfills.ts"
```

In Angular 17+, the `polyfills` field in `angular.json` is an array of package names:
```json
"polyfills": ["zone.js"]
```

The `polyfills.ts` file itself becomes unnecessary and should be deleted (or left in place — it
will simply be ignored). The `ng update` migration handles this conversion automatically.

### Impact on this project

Low risk. The existing `client/src/polyfills.ts` likely only contains `import 'zone.js'` and
browser compatibility imports. The array form `["zone.js"]` is the direct equivalent.

### Confidence: HIGH — angular.dev documentation

---

## Change 4: `standalone: false` Required on NgModule Components

**Status: REQUIRED when staying on NgModules**
**Introduced: Angular 19**

Angular 19 changed the default value of the `standalone` decorator option from `false` to
`true`. Every component, directive, and pipe that belongs to an NgModule must now explicitly
declare `standalone: false` or it will be treated as standalone (and therefore fail when listed
in an NgModule's `declarations` array).

### What `ng update` does automatically

When running `ng update @angular/core@19`, an automated migration adds `standalone: false` to
all existing NgModule-registered declarations. This happens without requiring the developer to
run any extra commands.

### Impact on this project

All five components (`AppComponent`, `BioComponent`, `PostsComponent`, `SpeakingComponent`) and
all modules (`AppModule`, `BioModule`, `PostsModule`, `SpeakingModule`, `MatDepsModule`) will
have `standalone: false` added by the migration. After `ng update`, the app compiles and runs
identically with the NgModule structure fully intact.

### Confidence: HIGH — official Angular blog and migration docs

---

## Change 5: NgModules to Standalone Architecture

**Status: OPTIONAL (but strongly recommended)**
**Tooling: `ng generate @angular/core:standalone` schematic (3-pass process)**

Angular 19 defaults to standalone components. NgModules continue to work indefinitely but are
considered legacy. This migration is not required, but it reduces boilerplate and aligns with
the current Angular idiom.

### Three-step migration process

```
# Step 1 — Convert all components/directives/pipes to standalone
ng generate @angular/core:standalone

# Step 2 — Remove now-empty NgModule classes
ng generate @angular/core:standalone

# Step 3 — Switch bootstrap from bootstrapModule to bootstrapApplication
ng generate @angular/core:standalone
```

Each step is run separately. Build and smoke-test the app between each step.

### What the migration does to this project

**Step 1** converts all five components:
- Removes them from their NgModule `declarations` arrays
- Adds an `imports` array directly to each component's `@Component` decorator
- Each component imports the specific Material modules it uses directly

**Step 2** removes the now-empty module files:
- `bio.module.ts`, `bio-routing.module.ts` are deleted
- `posts.module.ts`, `posts-routing.module.ts` are deleted
- `speaking.module.ts`, `speaking-routing.module.ts` are deleted
- `app.module.ts` is deleted
- `mat-deps.module.ts` is deleted (its purpose is absorbed into per-component imports)

**Step 3** changes `main.ts`:
```typescript
// Before
platformBrowserDynamic().bootstrapModule(AppModule)

// After
bootstrapApplication(AppComponent, appConfig)
```

Where `appConfig` contains `provideRouter(routes)` and `provideAnimationsAsync()` migrated from
`AppModule` imports.

### Impact on lazy loading

The `loadChildren` pattern using module files is replaced by two options:
- `loadComponent` — loads a single standalone component directly (preferred for simple routes)
- `loadChildren` with a routes array — loads a standalone routes configuration file

For this project, each feature has exactly one component, so the routes become:
```typescript
// Before
{ path: 'bio', loadChildren: () => import('./bio/bio.module').then(m => m.BioModule) }

// After
{ path: 'bio', loadComponent: () => import('./bio/bio.component').then(m => m.BioComponent) }
```

Lazy loading is fully preserved. The bundle splitting behavior is identical. The feature
modules disappear but code splitting at the route boundary is maintained.

### Confidence: HIGH — angular.dev standalone migration guide and official schematic

---

## Change 6: Angular Material Theming

**Status: REQUIRED for the `~` path prefix; OPTIONAL for M3 theming migration**

### Required: Remove `~` prefix from SCSS imports

Angular 8 configured the Material theme in `angular.json` styles:
```json
"styles": [
  "node_modules/@angular/material/prebuilt-themes/indigo-pink.css",
  "src/styles.scss"
]
```

If any custom SCSS files use `~@angular/material/...` import syntax (Webpack tilde prefix),
those must be changed to `@angular/material/...` (no tilde). The esbuild migration handles this
automatically, but manual SCSS should be spot-checked.

The prebuilt theme path `@angular/material/prebuilt-themes/indigo-pink.css` remains valid
through Angular Material 19. The indigo-pink prebuilt theme continues to ship.

### Optional: Material Design 3 (M3) migration

Angular Material 17+ introduced Material Design 3 theming via the `mat.theme()` mixin. M2
prebuilt themes continue to ship and work. This project uses the `indigo-pink.css` prebuilt
which is M2. The M3 migration is fully optional and out of scope for this dependency upgrade.

### Confidence: MEDIUM — prebuilt theme persistence confirmed via GitHub source inspection;
M3 migration details from official angular-material.dev docs

---

## Change 7: Build Tool Chain Files

**Status: REQUIRED (configuration files)**

### Files to delete or replace

| File | Action | Reason |
|---|---|---|
| `tslint.json` | Delete | TSLint is unsupported; replace with ESLint |
| `e2e/protractor.conf.js` | Delete | Protractor was officially removed in Angular 15 |
| `browserslist` | Update or delete | Differential loading (ES5/ES2015) is removed in Angular 13 |
| `karma.conf.js` | Update | Karma test builder changes; webpack config plugins removed |

### Files to add

| File | Action | Reason |
|---|---|---|
| `.eslintrc.json` | Add | Replaces TSLint; `ng add @angular-eslint/schematics` handles this |

### Confidence: HIGH — Angular deprecation release notes and angular-eslint project docs

---

## Architecture Comparison: Before and After

### Current Architecture (Angular 8)

```
Browser
  └── main.ts  →  platformBrowserDynamic().bootstrapModule(AppModule)
        └── AppModule (NgModule)
              ├── declares: AppComponent
              ├── imports: BrowserAnimationsModule, RouterModule, MatDepsModule
              └── routes: [
                    { path: 'bio',      loadChildren: () => BioModule }
                    { path: 'speaking', loadChildren: () => SpeakingModule }
                    { path: 'posts',    loadChildren: () => PostsModule }
                  ]

BioModule (NgModule, lazy)
  └── declares: BioComponent
  └── imports: CommonModule, MatDepsModule, RouterModule

MatDepsModule (barrel NgModule)
  └── re-exports: MatToolbarModule, MatCardModule, MatGridListModule, ...
```

### Target Architecture (Angular 19, NgModules kept)

Structurally identical to above, with:
- `standalone: false` on all components (added by `ng update`)
- `angular.json` builder changed from `browser` to `application`
- `polyfills` changed to array format
- `~` tilde removed from any SCSS imports
- TSLint replaced by ESLint
- Protractor e2e config removed

### Target Architecture (Angular 19, Standalone — recommended)

```
Browser
  └── main.ts  →  bootstrapApplication(AppComponent, appConfig)
        └── AppComponent (standalone: true)
              └── appConfig: { providers: [provideRouter(routes), provideAnimationsAsync()] }

routes: [
  { path: 'bio',      loadComponent: () => BioComponent }
  { path: 'speaking', loadComponent: () => SpeakingComponent }
  { path: 'posts',    loadComponent: () => PostsComponent }
]

BioComponent (standalone: true)
  └── imports: [MatCardModule, MatGridListModule, ...]   ← no longer via MatDepsModule

(MatDepsModule deleted — no longer needed)
```

---

## Suggested Order of Changes

The following sequence minimizes risk by ensuring the app is in a working state after each
phase. Changes are ordered by "must happen before" dependencies.

### Phase Order

```
1. Build system migration (angular.json + builder)
   Required before: everything else
   Why: ng update @angular/core transitions the build system. App must build before
        any further changes are made.

2. Compiler + runtime upgrade (View Engine → Ivy)
   Happens as part of: ng update (automatic)
   No manual work required.

3. standalone: false annotation
   Happens as part of: ng update (automatic)
   Required before: any optional standalone migration.

4. TSLint → ESLint
   Can happen any time after: step 1
   Why: TSLint and Protractor are not blockers for runtime behavior, but the project
        should not carry dead tooling config.

5. Firebase output path fix
   Required immediately after: step 1
   Why: The output directory changes. Firebase deploy will silently fail if not updated.

6. Smoke test: all three pages render, Firebase deploy succeeds
   Gate before: any optional architecture changes.

--- OPTIONAL BELOW THIS LINE ---

7. Standalone migration (schematics, 3 passes)
   Can happen any time after: step 6 passes
   Order: convert components → remove modules → switch bootstrap
   Smoke test after each pass.

8. loadChildren → loadComponent conversion
   Happens as part of: standalone migration step 3 (or can be done manually)

9. control flow syntax migration (*ngIf/*ngFor → @if/@for)
   Can happen any time after: step 6 passes
   Automated: ng generate @angular/core:control-flow

10. Additional optional modernizations (inject(), signal inputs, etc.)
    All optional; out of scope for this dependency upgrade milestone.
```

### Why this order

- Steps 1–5 are the minimum viable upgrade: the app builds with Angular 19, deploys to
  Firebase, and all pages work.
- Steps 6–10 are layered improvements that can be done incrementally or deferred. None of
  them affect runtime correctness of the current feature set.
- The Firebase output path fix (step 5) is listed separately from the build migration because
  it requires a manual `firebase.json` edit and is easy to overlook.

---

## Lazy Loading: Specific Impact Analysis

The existing `loadChildren` pattern in `app-routing.module.ts` continues to work through
Angular 19 without any changes IF the app stays on NgModules. No action required.

If the optional standalone migration is performed:

1. `loadChildren` pointing at module files breaks (the module files are deleted in step 2 of
   the standalone migration).
2. The schematic converts these to `loadComponent` automatically during step 3.
3. Route-level code splitting is preserved. Bundle size behavior is equivalent or better
   (standalone components enable better tree-shaking).

The three lazy routes (`/bio`, `/speaking`, `/posts`) each load a single component. This is
the simplest possible case for `loadComponent`. The migration is low-risk.

---

## Confidence Assessment

| Change | Confidence | Source |
|---|---|---|
| View Engine removed (Angular 13) | HIGH | angular.io official docs |
| `application` builder in angular.json | HIGH | angular.dev/tools/cli/build-system-migration |
| `polyfills` array format | HIGH | angular.dev official docs |
| Output path change to `/browser` subfolder | HIGH | angular.dev migration guide |
| `standalone: false` required in Angular 19 | HIGH | Angular blog, ng-update migration |
| Standalone schematic 3-pass process | HIGH | angular.dev/reference/migrations/standalone |
| `loadComponent` for standalone lazy routes | HIGH | angular.dev lazy-loaded routes migration |
| Material prebuilt theme path unchanged | MEDIUM | GitHub source inspection (not official changelog) |
| TSLint removed (Angular 12+) | HIGH | Angular deprecation release notes |
| Protractor removed (Angular 15) | HIGH | Angular 15 release notes |

---

## Sources

- [Angular Build System Migration Guide](https://angular.dev/tools/cli/build-system-migration) — official
- [Angular Standalone Migration Schematic](https://angular.dev/reference/migrations/standalone) — official
- [Angular Migrations Overview](https://angular.dev/reference/migrations) — official
- [Angular Lazy-loaded Routes Migration](https://angular.dev/reference/migrations/route-lazy-loading) — official
- [bootstrapApplication API](https://angular.dev/api/platform-browser/bootstrapApplication) — official
- [Angular Compiler Options](https://angular.dev/reference/configs/angular-compiler-options) — official
- [Angular Material Theming Guide](https://material.angular.dev/guide/theming) — official
- [The future is standalone — Angular Blog](https://blog.angular.dev/the-future-is-standalone-475d7edbc706)
- [Angular 19 Standalone Default — InfoWorld](https://www.infoworld.com/article/3504682/angular-19-to-make-standalone-the-default-for-components.html)
- [Angular 19 + esbuild — Medium](https://medium.com/@emailnaval/angular-19-esbuild-a-new-era-of-blazing-fast-builds-a79f6c0dbbcc)
- [Evolution of Lazy Loading in Angular 19 — Medium](https://medium.com/@neelendra1destiny/evolution-of-lazy-loading-in-angular-19-with-standalone-components-fadd3b34603f)

---

*Research date: 2026-03-31*
