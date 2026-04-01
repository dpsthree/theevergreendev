# Project Structure

**Analysis Date:** 2026-03-31

## Directory Layout

```
theevergreendev/
├── client/                     # Angular application (all source code lives here)
│   ├── src/
│   │   ├── app/
│   │   │   ├── bio/            # Bio feature module (default landing page)
│   │   │   ├── mat-deps/       # Shared Angular Material re-export module
│   │   │   ├── posts/          # Blog posts feature module
│   │   │   ├── speaking/       # Speaking engagements feature module
│   │   │   ├── app.module.ts           # Root NgModule
│   │   │   ├── app-routing.module.ts   # Root routing with lazy-load config
│   │   │   ├── app.component.ts        # Shell component (toolbar + drawer)
│   │   │   ├── app.component.html      # Shell template
│   │   │   └── app.component.scss      # Shell styles (grid layout)
│   │   ├── assets/             # Static images (photos, logos, icons)
│   │   ├── environments/       # Environment config (dev/prod flags)
│   │   ├── index.html          # HTML entry point (analytics, fonts)
│   │   ├── main.ts             # Angular bootstrap entry point
│   │   ├── polyfills.ts        # Browser polyfills
│   │   ├── styles.scss         # Global styles
│   │   ├── test.ts             # Karma test entry point
│   │   └── favicon.ico
│   ├── angular.json            # Angular CLI workspace config
│   ├── package.json            # Client dependencies (Angular 8, Material)
│   ├── tsconfig.json           # Base TypeScript config
│   ├── tsconfig.app.json       # App-specific TS config
│   ├── tsconfig.spec.json      # Test-specific TS config
│   ├── tslint.json             # TSLint rules
│   ├── karma.conf.js           # Karma test runner config
│   └── browserslist            # Supported browsers
├── e2e/                        # End-to-end tests (Protractor)
│   ├── src/
│   │   └── app.po.ts           # Page object for e2e
│   ├── protractor.conf.js      # Protractor config
│   └── tsconfig.json           # E2E TypeScript config
├── .planning/                  # GSD planning documents
│   └── codebase/               # Codebase analysis documents
├── package.json                # Root package.json (build/test scripts, prettier)
├── package-lock.json           # Root lockfile
├── firebase.json               # Firebase Hosting config (serves client/dist/evergreen)
├── .firebaserc                 # Firebase project alias (the-evergreen-dev)
├── .travis.yml                 # Travis CI config (build + deploy to Firebase)
├── .gitignore                  # Git ignore rules
└── README.md                   # Project readme
```

## Directory Purposes

**`client/src/app/`:**
- Purpose: All Angular application code
- Contains: Root module, routing, shell component, and feature module directories
- Key files: `app.module.ts`, `app-routing.module.ts`, `app.component.ts`

**`client/src/app/bio/`:**
- Purpose: Bio/about page feature module
- Contains: Component (static HTML bio card), module, routing module
- Key files: `bio.component.html` (content), `bio.module.ts` (lazy-loaded module)

**`client/src/app/posts/`:**
- Purpose: Blog posts listing feature module
- Contains: Component with hardcoded post data, module, routing module
- Key files: `posts.component.ts` (contains `Post` interface and data array)

**`client/src/app/speaking/`:**
- Purpose: Speaking engagements listing feature module
- Contains: Component with hardcoded talk data (upcoming + past), module, routing module
- Key files: `speaking.component.ts` (contains `tiles[]` and `comingSoon[]` data)

**`client/src/app/mat-deps/`:**
- Purpose: Centralized Angular Material module re-exports
- Contains: Single module file that re-exports all needed Material modules
- Key files: `mat-deps.module.ts`

**`client/src/assets/`:**
- Purpose: Static image assets (speaker photos, conference logos)
- Contains: `.svg`, `.png`, `.jpg` files
- Key files: `spears.jpg` (bio photo), conference/event logos

**`client/src/environments/`:**
- Purpose: Build-time environment configuration
- Contains: `environment.ts` (dev), `environment.prod.ts` (production)
- Key files: Only contain `production: boolean` flag

**`e2e/`:**
- Purpose: Protractor end-to-end test scaffolding
- Contains: Page objects and config (appears to be scaffolded but not actively used)
- Key files: `protractor.conf.js`, `src/app.po.ts`

## Key File Locations

**Entry Points:**
- `client/src/main.ts`: Angular bootstrap (platformBrowserDynamic)
- `client/src/index.html`: HTML shell with analytics and font loading
- `client/src/app/app.module.ts`: Root NgModule that bootstraps AppComponent

**Configuration:**
- `client/angular.json`: Angular CLI config (build targets, styles, assets, budgets)
- `client/package.json`: Angular dependencies and npm scripts
- `package.json`: Root scripts (`build` and `test` delegate to `client/`)
- `firebase.json`: Firebase Hosting config (rewrites all routes to index.html for SPA)
- `.firebaserc`: Firebase project alias mapping
- `.travis.yml`: CI/CD pipeline (build + deploy to Firebase)
- `client/tsconfig.json`: Base TypeScript config
- `client/tslint.json`: Linting rules

**Core Logic:**
- `client/src/app/app-routing.module.ts`: All route definitions with lazy loading
- `client/src/app/app.component.html`: Shell layout (toolbar, side drawer, nav links, router outlet)
- `client/src/app/mat-deps/mat-deps.module.ts`: Angular Material barrel module

**Content Files (hardcoded data):**
- `client/src/app/posts/posts.component.ts`: Blog post URLs and titles
- `client/src/app/speaking/speaking.component.ts`: Speaking engagement data (titles, URLs, thumbnails)
- `client/src/app/bio/bio.component.html`: Bio text and photo

**Styling:**
- `client/src/styles.scss`: Global styles (body reset, font-family)
- `client/src/app/app.component.scss`: Shell layout (CSS Grid for toolbar + content)
- Angular Material prebuilt theme: `indigo-pink.css` (configured in `client/angular.json`)

## Naming Conventions

**Files:**
- Feature files: `{feature-name}.component.ts`, `{feature-name}.module.ts`, `{feature-name}-routing.module.ts`
- Styles: `{feature-name}.component.scss` (component-scoped SCSS)
- Templates: `{feature-name}.component.html` (external templates)

**Directories:**
- Feature directories: lowercase kebab-case matching feature name (`bio/`, `posts/`, `speaking/`)
- Shared modules: descriptive kebab-case (`mat-deps/`)

**Component Selectors:**
- Prefix: `evg-` (configured in `client/angular.json` as `"prefix": "evg"`)
- Examples: `evg-root`, `evg-bio`, `evg-posts`, `evg-speaking`

## Where to Add New Code

**New Feature/Page:**
1. Create directory: `client/src/app/{feature-name}/`
2. Create files following the pattern:
   - `{feature-name}.component.ts` (with `evg-` selector prefix)
   - `{feature-name}.component.html`
   - `{feature-name}.component.scss`
   - `{feature-name}.module.ts` (import CommonModule, routing module, MatDepsModule)
   - `{feature-name}-routing.module.ts` (use `RouterModule.forChild`)
3. Add lazy route in `client/src/app/app-routing.module.ts` using `loadChildren` dynamic import
4. Add navigation link in `client/src/app/app.component.html` inside `<mat-nav-list>`

**New Angular Material Component:**
- Add the Material module import to `client/src/app/mat-deps/mat-deps.module.ts` exports array

**New Static Asset:**
- Place in `client/src/assets/`
- Reference via `assets/filename.ext` in templates

**New Shared Service or Utility:**
- No existing pattern for services (none exist yet)
- Recommended: Create `client/src/app/shared/` directory for services, interfaces, utilities

## Special Directories

**`client/dist/evergreen/`:**
- Purpose: Build output served by Firebase Hosting
- Generated: Yes (by `ng build --prod`)
- Committed: No (in `.gitignore`)

**`node_modules/` (root and client):**
- Purpose: npm dependencies
- Generated: Yes
- Committed: No (in `.gitignore`)

**`.planning/codebase/`:**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by GSD tooling)
- Committed: Yes

---

*Structure analysis: 2026-03-31*
