# Roadmap: The Evergreen Dev — Dependency Modernization

## Overview

This roadmap takes the site from Angular 8 to a modern, fully standalone Angular 19 stack. The upgrade spans 11 major versions and is structured to minimize risk: environment is hardened first, then the step-through version upgrade runs one major version at a time, then deployment and pages are verified, and finally the codebase is modernized to standalone components. Every phase delivers a verifiable state before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Pre-Flight** - Harden environment and tooling before any Angular upgrade begins *(plans executed 2026-04-09; confirm human checklist in 01-03-SUMMARY)*
- [x] **Phase 2: Core Upgrade** - Step through Angular 8 to 19 one major version at a time *(executed 2026-04-10; see `.planning/phases/02-core-upgrade/02-PROGRESS.md`)*
- [ ] **Phase 3: Deploy and Verify** - Confirm build, deployment, and all pages work on Angular 19
- [ ] **Phase 4: Modernization** - Convert to standalone components and enable strict TypeScript

## Phase Details

### Phase 1: Pre-Flight
**Goal**: The environment and tooling are ready for the Angular step-through upgrade to proceed without hitting avoidable blockers
**Depends on**: Nothing (first phase)
**Requirements**: ENV-01, ENV-02, ENV-03, ENV-04, BLD-02, BLD-03
**Success Criteria** (what must be TRUE):
  1. `node --version` returns 18.x, 20.x, or 22.x LTS; `npm install` completes with a fresh lockfile
  2. ESLint runs without errors; `tslint.json` and `codelyzer` are gone from the project
  3. The `e2e/` directory and Protractor architect target no longer exist in `angular.json`
  4. `ng build` still succeeds on Angular 8 after environment changes (baseline confirmed)
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — CI/environment foundation: update .travis.yml, remove Protractor/TSLint/Codelyzer, upgrade @types/node, regenerate lockfile, document ENV-02/ENV-03 deferral
- [x] 01-02-PLAN.md — ESLint migration: run ng add @angular-eslint/schematics@12, verify ng lint works
- [x] 01-03-PLAN.md — AOT baseline and Phase 1 gate: enable aot: true, confirm ng build succeeds, human checkpoint

### Phase 2: Core Upgrade
**Goal**: All Angular, Material, Firebase, and supporting packages are upgraded from 8.x to 19.x via sequential one-major-version steps with a working build at each step
**Depends on**: Phase 1
**Requirements**: ANG-01, ANG-02, ANG-03, ANG-04, ANG-05, ANG-06, ANG-07, MAT-01, MAT-02, MAT-03, MAT-04, FIR-01, FIR-02
**Success Criteria** (what must be TRUE):
  1. All `@angular/*` packages report version 19.x in `package.json`
  2. `hammerjs` is absent from `package.json` and `main.ts`
  3. All four components (`AppComponent`, `BioComponent`, `SpeakingComponent`, `PostsComponent`) have `standalone: false` in their `@Component` decorator
  4. Angular Material and CDK report 19.x; the `indigo-pink.css` prebuilt theme loads without error
  5. `@angular/fire` and Firebase SDK are at 19.x / compatible versions; no deprecated `AngularFireModule` import errors
**Plans**: TBD

### Phase 3: Deploy and Verify
**Goal**: The upgraded application builds successfully, deploys to Firebase Hosting, and all three pages render and navigate correctly
**Depends on**: Phase 2
**Requirements**: FIR-03, FIR-04, FIR-05, BLD-01, BLD-04, VER-01, VER-02, VER-03, VER-04, VER-05
**Success Criteria** (what must be TRUE):
  1. `ng build` completes without errors using the esbuild application builder
  2. `firebase deploy` succeeds and the live site is reachable at the Firebase Hosting URL
  3. Bio, Speaking, and Posts pages all render their content visually identical to the Angular 8 baseline
  4. Navigation between all three pages works; lazy-loaded routes load without console errors
**Plans**: TBD

### Phase 4: Modernization
**Goal**: The codebase is converted to standalone components with direct Material imports, modern bootstrap, and TypeScript strict mode — all without changing any visible behavior
**Depends on**: Phase 3
**Requirements**: MOD-01, MOD-02, MOD-03, MOD-04, MOD-05, MOD-06
**Success Criteria** (what must be TRUE):
  1. All `*.module.ts` NgModule files are deleted; `ng build` passes with zero NgModule references
  2. `main.ts` uses `bootstrapApplication()` and each component imports only the Material modules it needs directly
  3. All lazy routes use `loadComponent` pointing at standalone components
  4. TypeScript strict mode is enabled in `tsconfig.json` and `ng build` completes with zero type errors
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Pre-Flight | 3/3 | Complete | 2026-04-09 |
| 2. Core Upgrade | — | Complete | 2026-04-10 |
| 3. Deploy and Verify | 0/TBD | Not started | - |
| 4. Modernization | 0/TBD | Not started | - |
