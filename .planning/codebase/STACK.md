# Technology Stack

**Analysis Date:** 2026-03-31

## Languages

**Primary:**
- TypeScript ~3.5.3 - All application code (`client/src/`)
- SCSS - Component styles (configured in `client/angular.json` schematics)

**Secondary:**
- HTML - Angular templates (`client/src/**/*.component.html`)

## Runtime

**Environment:**
- Node.js 10 (specified in `.travis.yml`)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` present at root level

## Frameworks

**Core:**
- Angular ~8.2.7 - SPA framework (`client/package.json`)
- Angular Material ^8.2.0 - UI component library (`client/src/app/mat-deps/mat-deps.module.ts`)
- Angular CDK ~8.2.0 - Component Dev Kit (Material dependency)
- Angular Router ~8.2.7 - Client-side routing (`client/src/app/app-routing.module.ts`)
- Angular Animations ~8.2.7 - Animation support (`client/src/app/app.module.ts`)
- RxJS ~6.4.0 - Reactive programming library

**Testing:**
- Karma ~4.1.0 - Test runner (`client/angular.json` karma builder)
- Jasmine ~3.4.0 - Test framework
- Protractor ~5.4.0 - E2E testing (`e2e/`)

**Build/Dev:**
- Angular CLI ~8.3.5 - Build tooling and dev server
- @angular-devkit/build-angular ~0.803.5 - Webpack-based Angular builder
- TSLint ~5.15.0 - Linting (deprecated in favor of ESLint)
- Codelyzer ^5.0.0 - Angular-specific TSLint rules
- Prettier ^1.18.2 - Code formatting (root `package.json`)

## Key Dependencies

**Critical:**
- Firebase >= 5.5.7 <7 - Backend services SDK (`client/package.json`)
- @angular/fire ^5.2.1 - Official Angular Firebase library; also provides deploy builder (`client/angular.json` deploy architect)
- firebase-tools ^6.10.0 - Firebase CLI for deployment (devDependency)

**Infrastructure:**
- zone.js ~0.9.1 - Angular change detection
- tslib ^1.10.0 - TypeScript runtime helpers
- hammerjs ^2.0.8 - Touch gesture support for Angular Material

## Configuration

**Environment:**
- Environment files at `client/src/environments/environment.ts` (dev) and `client/src/environments/environment.prod.ts` (prod)
- File replacement configured in `client/angular.json` for production builds
- Currently environment files contain only `production: boolean` flag -- no Firebase config present

**Build:**
- `client/angular.json` - Angular workspace configuration
- `client/tsconfig.json` - Base TypeScript config (target: es2015, module: esnext)
- `client/tsconfig.app.json` - App-specific TS config
- `client/tsconfig.spec.json` - Test-specific TS config
- Component prefix: `evg` (configured in `client/angular.json`)

**Build Scripts (root `package.json`):**
- `npm run build` -> `cd client && npm run build-prod` -> `npm install && ng build --prod`
- `npm test` -> `cd client && npm test` -> `ng test`

## Angular Material Modules in Use

Centralized in `client/src/app/mat-deps/mat-deps.module.ts`:
- MatToolbarModule
- MatSidenavModule
- MatListModule
- MatIconModule
- MatButtonModule
- MatCardModule
- MatGridListModule

## Platform Requirements

**Development:**
- Node.js 10+
- npm
- Angular CLI (`ng` commands)

**Production:**
- Firebase Hosting (static SPA)
- Output: `client/dist/evergreen/`
- SPA routing via Firebase rewrites (all paths -> `/index.html`)

---

*Stack analysis: 2026-03-31*
