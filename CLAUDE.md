<!-- GSD:project-start source:PROJECT.md -->
## Project

**The Evergreen Dev — Dependency Modernization**

A personal developer website (theevergreendev) with bio, speaking engagements, and blog posts sections. Built as an Angular SPA deployed to Firebase Hosting. The immediate goal is to modernize all dependencies from Angular 8 to Angular 19 (latest stable) without changing existing functionality.

**Core Value:** The site continues to work exactly as it does today — same pages, same content, same behavior — on a modern, maintainable dependency stack.

### Constraints

- **Functionality**: All three pages (bio, speaking, posts) must render identically after upgrade
- **Deployment**: Must continue deploying to Firebase Hosting
- **Content**: No changes to hardcoded data in components
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript ~3.5.3 - All application code (`client/src/`)
- SCSS - Component styles (configured in `client/angular.json` schematics)
- HTML - Angular templates (`client/src/**/*.component.html`)
## Runtime
- Node.js 10 (specified in `.travis.yml`)
- npm
- Lockfile: `package-lock.json` present at root level
## Frameworks
- Angular ~8.2.7 - SPA framework (`client/package.json`)
- Angular Material ^8.2.0 - UI component library (`client/src/app/mat-deps/mat-deps.module.ts`)
- Angular CDK ~8.2.0 - Component Dev Kit (Material dependency)
- Angular Router ~8.2.7 - Client-side routing (`client/src/app/app-routing.module.ts`)
- Angular Animations ~8.2.7 - Animation support (`client/src/app/app.module.ts`)
- RxJS ~6.4.0 - Reactive programming library
- Karma ~4.1.0 - Test runner (`client/angular.json` karma builder)
- Jasmine ~3.4.0 - Test framework
- Protractor ~5.4.0 - E2E testing (`e2e/`)
- Angular CLI ~8.3.5 - Build tooling and dev server
- @angular-devkit/build-angular ~0.803.5 - Webpack-based Angular builder
- TSLint ~5.15.0 - Linting (deprecated in favor of ESLint)
- Codelyzer ^5.0.0 - Angular-specific TSLint rules
- Prettier ^1.18.2 - Code formatting (root `package.json`)
## Key Dependencies
- Firebase >= 5.5.7 <7 - Backend services SDK (`client/package.json`)
- @angular/fire ^5.2.1 - Official Angular Firebase library; also provides deploy builder (`client/angular.json` deploy architect)
- firebase-tools ^6.10.0 - Firebase CLI for deployment (devDependency)
- zone.js ~0.9.1 - Angular change detection
- tslib ^1.10.0 - TypeScript runtime helpers
- hammerjs ^2.0.8 - Touch gesture support for Angular Material
## Configuration
- Environment files at `client/src/environments/environment.ts` (dev) and `client/src/environments/environment.prod.ts` (prod)
- File replacement configured in `client/angular.json` for production builds
- Currently environment files contain only `production: boolean` flag -- no Firebase config present
- `client/angular.json` - Angular workspace configuration
- `client/tsconfig.json` - Base TypeScript config (target: es2015, module: esnext)
- `client/tsconfig.app.json` - App-specific TS config
- `client/tsconfig.spec.json` - Test-specific TS config
- Component prefix: `evg` (configured in `client/angular.json`)
- `npm run build` -> `cd client && npm run build-prod` -> `npm install && ng build --prod`
- `npm test` -> `cd client && npm test` -> `ng test`
## Angular Material Modules in Use
- MatToolbarModule
- MatSidenavModule
- MatListModule
- MatIconModule
- MatButtonModule
- MatCardModule
- MatGridListModule
## Platform Requirements
- Node.js 10+
- npm
- Angular CLI (`ng` commands)
- Firebase Hosting (static SPA)
- Output: `client/dist/evergreen/`
- SPA routing via Firebase rewrites (all paths -> `/index.html`)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Naming Patterns
- Components: `kebab-case.component.ts` (e.g., `client/src/app/bio/bio.component.ts`)
- Modules: `kebab-case.module.ts` (e.g., `client/src/app/bio/bio.module.ts`)
- Routing modules: `kebab-case-routing.module.ts` (e.g., `client/src/app/bio/bio-routing.module.ts`)
- Templates: `kebab-case.component.html`
- Styles: `kebab-case.component.scss`
- Class names use PascalCase with `Component` suffix: `BioComponent`, `PostsComponent`, `SpeakingComponent`
- Enforced by tslint rule `component-class-suffix: true` in `client/tslint.json`
- Component selectors use `evg-` prefix with kebab-case: `evg-root`, `evg-bio`, `evg-posts`, `evg-speaking`
- Directive selectors use `evg` prefix with camelCase
- Enforced by tslint rules `component-selector` and `directive-selector` in `client/tslint.json`
- Class names use PascalCase with `Module` suffix: `BioModule`, `MatDepsModule`
- camelCase for all instance properties and local variables
- Interfaces use PascalCase without `I` prefix (tslint `interface-name: false`): e.g., `Post` in `client/src/app/posts/posts.component.ts`
## Code Style
- Prettier v1.18.2 configured at root level (`package.json`)
- EditorConfig at `client/.editorconfig`:
- TSLint v5.15.0 with Codelyzer v5.0.0 (`client/tslint.json`)
- Extends `tslint:recommended`
- Key rules:
- Target: ES2015 (`client/tsconfig.json`)
- Module: ESNext
- Strict mode: NOT enabled
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)
## Import Organization
- Relative paths used throughout (no path aliases configured)
- Example from `client/src/app/bio/bio.module.ts`:
## Angular-Specific Patterns
- Each feature has its own NgModule with lazy loading via dynamic `import()` syntax
- Root module: `client/src/app/app.module.ts` -- imports `BrowserModule`, `AppRoutingModule`, `BrowserAnimationsModule`, `MatDepsModule`
- Feature modules import `CommonModule` (not `BrowserModule`), their own routing module, and `MatDepsModule`
- Lazy loading configured in `client/src/app/app-routing.module.ts`:
- `MatDepsModule` at `client/src/app/mat-deps/mat-deps.module.ts` acts as the shared Angular Material barrel module
- Re-exports Material modules: Toolbar, Sidenav, List, Icon, Button, Card, GridList
- Imported by every feature module
- Components use external templates and styles (not inline):
- Style preprocessor: SCSS (configured in `client/angular.json` schematics)
- Each feature has a dedicated `*-routing.module.ts` that uses `RouterModule.forChild(routes)`
- Root routing uses `RouterModule.forRoot(routes)` with redirect from `''` to `'bio'`
- Feature routes define a single default route (`path: ''`) pointing to the feature component
- Static data is hardcoded as constants in component files (no services or API calls observed)
- Example: `posts` array in `client/src/app/posts/posts.component.ts`, `tiles` array in `client/src/app/speaking/speaking.component.ts`
- Interfaces defined locally in the same file as the component that uses them
- Heavy use of Angular Material components (`mat-card`, `mat-toolbar`, `mat-drawer`, `mat-nav-list`, `mat-grid-list`)
- `*ngFor` used for list rendering
- `routerLink` directive for navigation
- `[href]` binding with `target="_blank"` for external links
## Where to Add New Code
- Add the import and export to `client/src/app/mat-deps/mat-deps.module.ts`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- Angular 8 SPA deployed as static files to Firebase Hosting
- Lazy-loaded feature modules via Angular Router for code splitting
- No backend services -- all content is hardcoded in component files
- Angular Material provides the UI component library
- Side-navigation layout with router outlet for page content
## Layers
- Purpose: Application bootstrap, top-level layout (toolbar + side drawer + router outlet)
- Location: `client/src/app/`
- Contains: `app.module.ts`, `app.component.ts`, `app.component.html`, `app-routing.module.ts`
- Depends on: Angular Material (via `MatDepsModule`), Angular Router, BrowserAnimationsModule
- Used by: Browser entry point (`client/src/main.ts`)
- Purpose: Each represents a page/section of the site, lazy-loaded on navigation
- Location: `client/src/app/bio/`, `client/src/app/posts/`, `client/src/app/speaking/`
- Contains: One component + one routing module + one NgModule per feature
- Depends on: Angular Material (via `MatDepsModule`), Angular Common
- Used by: App router via `loadChildren` dynamic imports
- Purpose: Centralizes Angular Material module imports/exports so feature modules do not each import individual Material modules
- Location: `client/src/app/mat-deps/mat-deps.module.ts`
- Contains: Re-exports of MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule, MatCardModule, MatGridListModule
- Depends on: `@angular/material` packages
- Used by: AppModule, BioModule, PostsModule, SpeakingModule
## Data Flow
- No state management library (no NgRx, no services, no HTTP calls)
- All data is hardcoded as constants or class properties within components
- Posts data: inline `Post[]` array in `client/src/app/posts/posts.component.ts`
- Speaking data: inline `tiles[]` and `comingSoon[]` arrays in `client/src/app/speaking/speaking.component.ts`
- Bio data: static HTML in `client/src/app/bio/bio.component.html`
## Key Abstractions
- Purpose: Encapsulate each page as an independently loadable unit
- Examples: `client/src/app/bio/bio.module.ts`, `client/src/app/posts/posts.module.ts`, `client/src/app/speaking/speaking.module.ts`
- Pattern: Each feature has exactly three files: `{name}.module.ts`, `{name}-routing.module.ts`, `{name}.component.ts` (plus template and styles)
- Purpose: Single import for all Angular Material dependencies
- Example: `client/src/app/mat-deps/mat-deps.module.ts`
- Pattern: Imports nothing from Material, only re-exports the modules needed across the app
## Entry Points
- Location: `client/src/main.ts`
- Triggers: Browser page load
- Responsibilities: Bootstraps `AppModule` via `platformBrowserDynamic()`, enables prod mode when `environment.production` is true
- Location: `client/src/index.html`
- Triggers: Initial HTTP request
- Responsibilities: Loads Google Analytics (UA-142772288-1), Google Fonts (Roboto, Material Icons), bootstraps `<evg-root>` element
- Location: Root `package.json` script `build` runs `cd client && npm run build-prod`
- Build output: `client/dist/evergreen/` (served by Firebase Hosting)
## Error Handling
- Bootstrap error: `catch(err => console.error(err))` in `client/src/main.ts`
- No HTTP calls, so no HTTP error handling exists
- No global error handler or error boundary components
## Cross-Cutting Concerns
## Routing Map
| Path | Module | Component | Load Strategy |
|------|--------|-----------|---------------|
| `''` | -- | -- | Redirects to `/bio` |
| `bio` | `BioModule` | `BioComponent` | Lazy |
| `speaking` | `SpeakingModule` | `SpeakingComponent` | Lazy |
| `posts` | `PostsModule` | `PostsComponent` | Lazy |
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
