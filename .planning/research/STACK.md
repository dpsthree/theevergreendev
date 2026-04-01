# Technology Stack — Angular 19 Migration Target

**Project:** theevergreendev (Angular 8 -> 19 upgrade)
**Researched:** 2026-03-31
**Research mode:** Ecosystem / Stack dimension

---

## Current State (what is being replaced)

| Concern | Current | Problem |
|---------|---------|---------|
| Angular | 8.2.7 | 11 major versions behind; View Engine (no Ivy); NgModules only |
| TypeScript | 3.5.3 | Far below Angular 19 minimum (5.5) |
| RxJS | 6.4.0 | Angular 19 supports ^6.5.3 OR ^7.4.0; 6.4.0 falls below the 6.x floor |
| zone.js | 0.9.1 | Current stable is 0.15.x |
| Node.js | 10 | End-of-life; Angular 19 requires >= 18.19.1 |
| @angular/fire | 5.2.1 | Compat-API only; v19 requires modular Firebase SDK |
| Firebase SDK | <7 | @angular/fire 19 bundles firebase ^11.2.0 |
| Build system | Webpack via @angular-devkit/build-angular 0.803.5 | Replaced by esbuild application builder in Angular 17+ |
| Linting | TSLint 5.x + Codelyzer | TSLint is abandoned; ESLint is the current standard |
| HammerJS | 2.0.8 | Deprecated as an Angular dependency since v9; not needed for this site |

---

## Recommended Target Stack

### Core Framework

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| Angular | 19.2.x (latest 19 patch) | HIGH | LTS until May 2026; Angular 20 has already shipped but requires TS 5.8+ and has stricter floors. Targeting the latest 19.2.x patch gives a stable, supported target without chasing Angular 20 mid-migration. |
| Angular CLI | 19.2.x (matches core) | HIGH | CLI major version must match Angular core major version; `ng update` tooling lives here. |
| @angular-devkit/build-angular | Removed — replaced by application builder | HIGH | As of Angular 17, the application builder (`@angular-devkit/build-angular:application`) is the default and uses esbuild + Vite dev server. The old `browser` builder (webpack) is deprecated. |

**Source:** [angular.dev/reference/versions](https://angular.dev/reference/versions), [Angular 19.2 release blog](https://blog.angular.dev/angular-19-2-is-now-available-673ec70aea12)

### Language and Runtime

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| TypeScript | ~5.7.x | HIGH | Angular 19.2 supports `>=5.5.0 <5.9.0`. TypeScript 5.7 is the recommended sweet spot: fully supported by 19.1 and 19.2, stable, and does not require moving to Angular 20. Avoid 5.8 for now — it is the floor for Angular 20 but has no additional benefit in Angular 19. |
| Node.js | 22.x | HIGH | Angular 19.2 requires `^18.19.1 || ^20.11.1 || ^22.0.0`. Node 22 is in Maintenance LTS (solid, receives security patches). Node 24 is Active LTS but Angular 19 did not specifically test against it. Node 22 is the safest conservative choice. Node 10 (current) is end-of-life and blocks the upgrade. |

**Source:** [angular.dev/reference/versions](https://angular.dev/reference/versions), [nodejs.org releases](https://nodejs.org/en/about/previous-releases)

### UI Library

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| @angular/material | 19.2.x | HIGH | Angular Material version must match Angular Core major version exactly. 19.2.x is current. This project uses MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule, MatGridListModule — all still present in v19. |
| @angular/cdk | 19.2.x (same as Material) | HIGH | CDK is a direct peer dependency of Material; versions must be identical. |

**Note:** The indigo-pink prebuilt theme still ships in Angular Material 19. The import path changed from `@angular/material/prebuilt-themes/indigo-pink.css` — confirm the path is unchanged. Material 19 does not require switching to the new Material Design 3 tokens; the classic themes remain available.

**Source:** [material.angular.dev](https://material.angular.dev/guide/getting-started), [Angular Material release notes](https://github.com/angular/components/blob/main/CHANGELOG.md)

### Reactive Programming

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| RxJS | ^7.8.0 | HIGH | Angular 19 accepts `^6.5.3 || ^7.4.0`, but @angular/fire 19.0.0 pins `rxjs: ~7.8.0` as a peer dependency. RxJS 7.8.x is therefore the forced minimum when using AngularFire. RxJS 7 has a smaller bundle due to better tree-shaking and is the de facto standard for new Angular projects. Staying on RxJS 6 is only viable without AngularFire and is not recommended. |

**Source:** [angular.dev/reference/versions](https://angular.dev/reference/versions), [@angular/fire 19.0.0 package metadata](https://registry.npmjs.org/@angular/fire/19.0.0)

### Change Detection Infrastructure

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| zone.js | ~0.15.x | HIGH | zone.js 0.15.1 is current stable. Angular 19 ships with experimental zoneless mode but zone-based CD remains the default and is fully supported. Since this project has no signal usage and zero test coverage, keeping zone.js is the lowest-risk path. No feature work justifies the zoneless migration overhead. |

**Note:** zone.js is no longer accepting new feature patches but receives Angular-related bug fixes. 0.15.x is stable for the lifetime of Angular 19.

**Source:** [zone.js npm](https://www.npmjs.com/package/zone.js), [Angular roadmap](https://angular.dev/roadmap)

### Firebase

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| @angular/fire | 19.0.x | HIGH | The `@angular/fire` major version must match Angular core. v19.0.0 was released January 2025, requires `@angular/core ^19.0.0` and bundles `firebase ^11.2.0`. This is the correct package for an Angular 19 project. |
| firebase (JS SDK) | ^11.2.0 | HIGH | @angular/fire 19.0.0 has a direct dependency on `firebase ^11.2.0`. This is a direct install, not a peer dep — npm will install the correct version automatically when installing AngularFire. Firebase 11 uses the modular (tree-shakable) API only; the compat namespace is gone. |
| firebase-tools | ^13.0.0 | MEDIUM | @angular/fire 19.0.0 lists `firebase-tools ^13.0.0` as an optional peer dependency (used for the deploy builder). The current project uses `firebase-tools ^6.10.0` which is far too old. firebase-tools 13 is the minimum to enable AngularFire deploy integration. |

**Critical migration note:** The existing code uses `@angular/fire ^5.2.1` which exposes a compat API (mirroring the old namespaced Firebase SDK). AngularFire 19 drops the compat layer entirely. For this project (Firebase Hosting deploy only, no Firestore/Auth/RTDB usage), the compat removal has minimal impact — the deploy builder path is configuration, not application code. The `AngularFireModule.initializeApp()` bootstrap call in AppModule will need to be replaced with the new `provideFirebaseApp()` / `initializeApp()` pattern.

**Source:** [@angular/fire releases](https://github.com/angular/angularfire/releases/tag/19.0.0), [npm registry](https://registry.npmjs.org/@angular/fire/19.0.0)

### Build System

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| @angular/build (application builder) | 19.2.x | HIGH | Angular 17+ uses `@angular/build:application` (esbuild-based). It replaces `@angular-devkit/build-angular:browser` (webpack). Builds are 2-5x faster. The old `browser` builder is deprecated and removed in Angular 20. Migration to the application builder is required for Angular 19. Angular provides an automated migration schematic (`ng update` will prompt). |

**Note:** The application builder changes the output directory structure: output goes to `dist/<project-name>/browser/` instead of `dist/<project-name>/`. Firebase Hosting's `public` directory setting in `firebase.json` must be updated accordingly.

**Source:** [angular.dev/tools/cli/build-system-migration](https://angular.dev/tools/cli/build-system-migration)

### Linting

| Technology | Target Version | Confidence | Why |
|------------|---------------|------------|-----|
| @angular-eslint/schematics | 19.x | HIGH | TSLint is abandoned and no longer receives security patches. `@angular-eslint` versions align with Angular major versions, so v19.x is the correct target. It supports ESLint 9 with flat config. The migration schematic (`ng add @angular-eslint/schematics`) handles most of the conversion automatically. |
| eslint | ^9.x | HIGH | ESLint 9 is the current major version. @angular-eslint 19.x targets ESLint 9 with flat config. ESLint 8 reached end-of-life in 2024. |

**Note:** The current project has Codelyzer rules defined in `tslint.json`. These Angular-specific rules map to equivalent `@angular-eslint` rules. The automated migration converts most rules; the remainder can be deleted (this project is dependency-only, not enforcing style discipline).

**Source:** [github.com/angular-eslint/angular-eslint](https://github.com/angular-eslint/angular-eslint), [npm: angular-eslint](https://www.npmjs.com/package/angular-eslint)

---

## Dependencies to Remove

| Package | Reason |
|---------|--------|
| `hammerjs` | Deprecated in Angular Material since v9; Angular Material removed its HammerJS dependency. None of the Material components used by this project (cards, grid lists, toolbar, sidenav, lists, icons, buttons) require gesture support. Remove entirely. |
| `tslint` | Abandoned; replaced by ESLint. |
| `codelyzer` | TSLint-based Angular rules; abandoned; replaced by @angular-eslint. |
| `protractor` | E2E framework removed from Angular CLI defaults in v12; end-of-life. No E2E tests exist in this project. |
| Karma / Jasmine | Tests are explicitly skipped in this project's git history. Can be removed or left inert; no action needed for the upgrade itself. |

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| Angular version | 19.2.x | Angular 20 | Angular 20 is current as of mid-2025, but requires TypeScript 5.8+ and has a higher floor. Migrating to 19 first is simpler and Angular 19 is in LTS. Angular 20 upgrade is a small incremental step after. |
| RxJS | 7.8.x | RxJS 6.5.x | @angular/fire 19 requires RxJS ~7.8.0. Staying on v6 would prevent AngularFire from installing. |
| Build system | esbuild application builder | Keep webpack | The webpack builder is removed in Angular 20 and deprecated in 19. There is no value in keeping it. |
| Node.js | 22 LTS | Node 20 LTS | Both work; Node 22 has a longer remaining support window. Node 24 is Active LTS but Angular 19 was not validated against it. |
| Change detection | zone.js (keep) | Migrate to zoneless | Zoneless is experimental in Angular 19, requires signals, and offers no benefit for this static content site. |
| @angular/fire | 19.0.x | Skip Firebase entirely | The project requires Firebase Hosting deploy; AngularFire's deploy builder is the current deployment mechanism. |

---

## Installation Reference

```bash
# In the client/ directory, after clearing old node_modules

# Core Angular packages (all 19.2.x)
npm install @angular/core@19 @angular/common@19 @angular/compiler@19 \
  @angular/platform-browser@19 @angular/platform-browser-dynamic@19 \
  @angular/router@19 @angular/animations@19 @angular/forms@19

# Angular CLI and build tools
npm install -D @angular/cli@19 @angular/build@19 @angular/compiler-cli@19

# UI
npm install @angular/material@19 @angular/cdk@19

# Reactive
npm install rxjs@^7.8.0

# Change detection
npm install zone.js@~0.15.0

# Firebase
npm install @angular/fire@19 firebase@^11.2.0
npm install -D firebase-tools@^13.0.0

# TypeScript
npm install -D typescript@~5.7.0

# ESLint (replaces TSLint)
npm install -D eslint@^9.0.0
ng add @angular-eslint/schematics@19

# Remove
npm uninstall hammerjs tslint codelyzer protractor
```

---

## Confidence Assessment

| Area | Confidence | Source |
|------|------------|--------|
| Angular 19.2.x version | HIGH | [angular.dev/reference/versions](https://angular.dev/reference/versions) — official compat table |
| TypeScript ~5.7.x | HIGH | Official compat table: `>=5.5.0 <5.9.0` for 19.2.x |
| Node.js 22.x | HIGH | Official compat table: `^22.0.0` listed explicitly |
| RxJS ^7.8.0 | HIGH | AngularFire 19.0.0 package.json peer dep `~7.8.0` via npm registry |
| zone.js ~0.15.x | HIGH | npm package history; no conflicting signals |
| @angular/fire 19.0.x | HIGH | GitHub release + npm registry peerDeps confirmed |
| firebase ^11.2.0 | HIGH | npm registry for @angular/fire@19.0.0 direct dep |
| esbuild application builder | HIGH | [angular.dev build system migration guide](https://angular.dev/tools/cli/build-system-migration) |
| @angular-eslint 19.x | HIGH | npm registry, versions align with Angular major |
| HammerJS removal safety | MEDIUM | Confirmed deprecated; confirmed no gesture-dependent components in use; no official "removed" statement found but unmaintained |
| firebase-tools ^13.0.0 | MEDIUM | Inferred from optional peerDep in @angular/fire 19.0.0 package.json |

---

## Key Sources

- [Angular version compatibility table](https://angular.dev/reference/versions) — official, HIGH confidence
- [@angular/fire 19.0.0 npm registry](https://registry.npmjs.org/@angular/fire/19.0.0) — peerDeps and direct deps confirmed
- [@angular/fire 19.0.0 GitHub release](https://github.com/angular/angularfire/releases/tag/19.0.0) — release context
- [Angular build system migration guide](https://angular.dev/tools/cli/build-system-migration) — esbuild application builder migration
- [Node.js releases page](https://nodejs.org/en/about/previous-releases) — LTS status confirmed
- [angular-eslint npm](https://www.npmjs.com/package/angular-eslint) — version 19.x availability confirmed
- [Angular 19.2 blog post](https://blog.angular.dev/angular-19-2-is-now-available-673ec70aea12) — latest patch context

---

*Research date: 2026-03-31 | Angular 19 is in LTS; Angular 21 is current active release*
