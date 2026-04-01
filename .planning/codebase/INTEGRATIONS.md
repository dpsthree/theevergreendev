# External Integrations

**Analysis Date:** 2026-03-31

## APIs & External Services

**Firebase:**
- Firebase Hosting - Static site hosting for the Angular SPA
  - SDK/Client: `firebase` (>= 5.5.7 <7), `@angular/fire` (^5.2.1)
  - CLI: `firebase-tools` (^6.10.0)
  - Project ID: `the-evergreen-dev` (configured in `.firebaserc`)
  - Hosting target: `evergreen` mapped to `the-evergreen-dev` site
  - Config: `firebase.json`

**Note:** While `@angular/fire` is installed (which supports Firestore, Auth, Storage, etc.), the current codebase only uses Firebase Hosting. No Firestore, Authentication, Cloud Functions, or other Firebase services are configured or imported in application code (`client/src/app/app.module.ts` has no AngularFire module imports).

## Data Storage

**Databases:**
- None in use. No Firestore/Realtime Database configuration detected.

**File Storage:**
- Static assets only (`client/src/assets/`)
- No Firebase Storage or external file storage configured.

**Caching:**
- None

## Authentication & Identity

**Auth Provider:**
- None. No authentication system is implemented.

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- None (client-side only application)

## CI/CD & Deployment

**CI Pipeline:**
- Travis CI (`.travis.yml`)
  - Runs on: `master` branch only
  - Node version: 10
  - Steps: `npm run build` (installs deps and builds Angular prod bundle)
  - Caches: npm

**Deployment:**
- Firebase Hosting via Travis CI
  - Provider: `firebase` (Travis deploy provider)
  - Auth: `$FIREBASE_TOKEN` environment variable (secure, stored in Travis CI)
  - Target project: `the-evergreen-dev`

**Manual Deployment (alternative):**
- `ng deploy` via `@angular/fire:deploy` builder (configured in `client/angular.json` architect.deploy)

**Hosting Configuration (`firebase.json`):**
- Public directory: `client/dist/evergreen`
- SPA rewrite: all routes -> `/index.html`
- Ignores: `firebase.json`, dotfiles, `node_modules`

## Environment Configuration

**Required env vars:**
- `FIREBASE_TOKEN` - Firebase CI authentication token (Travis CI only, not needed for local dev)

**Environment files:**
- `client/src/environments/environment.ts` - Development (production: false)
- `client/src/environments/environment.prod.ts` - Production (production: true)
- No secrets or API keys in environment files currently

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-03-31*
