# Architecture

**Analysis Date:** 2026-03-31

## Pattern Overview

**Overall:** Single-Page Application (SPA) with lazy-loaded feature modules

**Key Characteristics:**
- Angular 8 SPA deployed as static files to Firebase Hosting
- Lazy-loaded feature modules via Angular Router for code splitting
- No backend services -- all content is hardcoded in component files
- Angular Material provides the UI component library
- Side-navigation layout with router outlet for page content

## Layers

**Shell Layer (App Module):**
- Purpose: Application bootstrap, top-level layout (toolbar + side drawer + router outlet)
- Location: `client/src/app/`
- Contains: `app.module.ts`, `app.component.ts`, `app.component.html`, `app-routing.module.ts`
- Depends on: Angular Material (via `MatDepsModule`), Angular Router, BrowserAnimationsModule
- Used by: Browser entry point (`client/src/main.ts`)

**Feature Modules:**
- Purpose: Each represents a page/section of the site, lazy-loaded on navigation
- Location: `client/src/app/bio/`, `client/src/app/posts/`, `client/src/app/speaking/`
- Contains: One component + one routing module + one NgModule per feature
- Depends on: Angular Material (via `MatDepsModule`), Angular Common
- Used by: App router via `loadChildren` dynamic imports

**Shared Module (MatDepsModule):**
- Purpose: Centralizes Angular Material module imports/exports so feature modules do not each import individual Material modules
- Location: `client/src/app/mat-deps/mat-deps.module.ts`
- Contains: Re-exports of MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule, MatGridListModule
- Depends on: `@angular/material` packages
- Used by: AppModule, BioModule, PostsModule, SpeakingModule

## Data Flow

**Navigation Flow:**

1. User clicks a nav item in the side drawer (`client/src/app/app.component.html`)
2. Angular Router matches the route defined in `client/src/app/app-routing.module.ts`
3. Router lazy-loads the corresponding feature module (bio, speaking, or posts)
4. Feature module's routing module maps `''` path to its single component
5. Component renders inside `<router-outlet>` in the main content area

**Default Route:** `''` redirects to `'bio'` (defined in `client/src/app/app-routing.module.ts`)

**State Management:**
- No state management library (no NgRx, no services, no HTTP calls)
- All data is hardcoded as constants or class properties within components
- Posts data: inline `Post[]` array in `client/src/app/posts/posts.component.ts`
- Speaking data: inline `tiles[]` and `comingSoon[]` arrays in `client/src/app/speaking/speaking.component.ts`
- Bio data: static HTML in `client/src/app/bio/bio.component.html`

## Key Abstractions

**Feature Module Pattern:**
- Purpose: Encapsulate each page as an independently loadable unit
- Examples: `client/src/app/bio/bio.module.ts`, `client/src/app/posts/posts.module.ts`, `client/src/app/speaking/speaking.module.ts`
- Pattern: Each feature has exactly three files: `{name}.module.ts`, `{name}-routing.module.ts`, `{name}.component.ts` (plus template and styles)

**MatDepsModule (Barrel Module):**
- Purpose: Single import for all Angular Material dependencies
- Example: `client/src/app/mat-deps/mat-deps.module.ts`
- Pattern: Imports nothing from Material, only re-exports the modules needed across the app

## Entry Points

**Browser Entry:**
- Location: `client/src/main.ts`
- Triggers: Browser page load
- Responsibilities: Bootstraps `AppModule` via `platformBrowserDynamic()`, enables prod mode when `environment.production` is true

**HTML Shell:**
- Location: `client/src/index.html`
- Triggers: Initial HTTP request
- Responsibilities: Loads Google Analytics (UA-142772288-1), Google Fonts (Roboto, Material Icons), bootstraps `<evg-root>` element

**Build Entry:**
- Location: Root `package.json` script `build` runs `cd client && npm run build-prod`
- Build output: `client/dist/evergreen/` (served by Firebase Hosting)

## Error Handling

**Strategy:** Minimal -- no custom error handling

**Patterns:**
- Bootstrap error: `catch(err => console.error(err))` in `client/src/main.ts`
- No HTTP calls, so no HTTP error handling exists
- No global error handler or error boundary components

## Cross-Cutting Concerns

**Logging:** None (only `console.error` in bootstrap)
**Validation:** None (no forms or user input)
**Authentication:** None
**Analytics:** Google Analytics via gtag.js embedded in `client/src/index.html`
**Styling:** SCSS with Angular Material prebuilt theme (indigo-pink), configured in `client/angular.json`

## Routing Map

| Path | Module | Component | Load Strategy |
|------|--------|-----------|---------------|
| `''` | -- | -- | Redirects to `/bio` |
| `bio` | `BioModule` | `BioComponent` | Lazy |
| `speaking` | `SpeakingModule` | `SpeakingComponent` | Lazy |
| `posts` | `PostsModule` | `PostsComponent` | Lazy |

---

*Architecture analysis: 2026-03-31*
