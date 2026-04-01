# Requirements: The Evergreen Dev — Dependency Modernization

**Defined:** 2026-03-31
**Core Value:** The site continues to work exactly as it does today on a modern, maintainable dependency stack.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Environment

- [ ] **ENV-01**: Node.js upgraded from 10 to 18.19.1+ (or 20/22 LTS)
- [ ] **ENV-02**: TypeScript upgraded from ~3.5.3 to >=5.5.0 <5.9.0
- [ ] **ENV-03**: tslib upgraded from ^1.10.0 to ^2.x
- [ ] **ENV-04**: @types/node upgraded to match new Node runtime (^18 or ^20)

### Angular Core

- [ ] **ANG-01**: All @angular/* packages upgraded from 8.x to 19.x via stepwise major version upgrades
- [ ] **ANG-02**: @angular-devkit/build-angular upgraded to 19.x
- [ ] **ANG-03**: Angular CLI upgraded to 19.x
- [ ] **ANG-04**: `standalone: false` added to all 4 NgModule components (AppComponent, BioComponent, SpeakingComponent, PostsComponent)
- [ ] **ANG-05**: zone.js upgraded from ~0.9.1 to ~0.15.x
- [ ] **ANG-06**: RxJS upgraded from ~6.4.0 to ^7.4.0
- [ ] **ANG-07**: Deprecated angular.json build options removed (extractCss, vendorChunk, buildOptimizer, namedChunks, aot flag)

### Angular Material

- [ ] **MAT-01**: @angular/material upgraded from ^8.2.0 to 19.x
- [ ] **MAT-02**: @angular/cdk upgraded from ~8.2.0 to 19.x
- [ ] **MAT-03**: Material prebuilt theme import path verified and working
- [ ] **MAT-04**: hammerjs removed from package.json and main.ts import

### Firebase & Deployment

- [ ] **FIR-01**: @angular/fire upgraded from ^5.2.1 to 19.x
- [ ] **FIR-02**: Firebase SDK upgraded to compatible version
- [ ] **FIR-03**: firebase-tools upgraded to latest
- [ ] **FIR-04**: firebase.json updated with correct build output path after esbuild migration
- [ ] **FIR-05**: Firebase Hosting deployment verified working

### Build System

- [ ] **BLD-01**: Build migrated from webpack browser builder to esbuild application builder
- [ ] **BLD-02**: TSLint and Codelyzer removed, replaced with ESLint (@angular-eslint)
- [ ] **BLD-03**: Protractor and e2e config removed
- [ ] **BLD-04**: Application builds successfully with `ng build`

### Modernization

- [ ] **MOD-01**: All NgModule components converted to standalone components
- [ ] **MOD-02**: MatDepsModule barrel eliminated — each component imports Material modules directly
- [ ] **MOD-03**: App bootstrapped with `bootstrapApplication()` instead of `platformBrowserDynamic().bootstrapModule()`
- [ ] **MOD-04**: Lazy routes use `loadComponent` instead of `loadChildren` with NgModules
- [ ] **MOD-05**: TypeScript strict mode enabled in tsconfig.json
- [ ] **MOD-06**: All type errors from strict mode resolved

### Verification

- [ ] **VER-01**: Bio page renders correctly after upgrade
- [ ] **VER-02**: Speaking page renders correctly after upgrade
- [ ] **VER-03**: Posts page renders correctly after upgrade
- [ ] **VER-04**: Navigation between all pages works correctly
- [ ] **VER-05**: Lazy loading of feature modules still functions

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Analytics

- **ANAL-01**: Replace Universal Analytics (UA-142772288-1) with GA4 measurement ID
- **ANAL-02**: Verify analytics events tracking after migration

### Signals

- **SIG-01**: Adopt Angular Signals API for component state (if reactive state is added)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New pages or features | Dependency upgrade only |
| Visual redesign | Preserve current look and feel |
| Backend/API changes | Site has no backend |
| Test coverage improvements | Tests currently disabled; separate effort |
| Content changes | All hardcoded content stays as-is |
| AngularFire modular SDK API migration | Only deploy builder is used, not SDK features |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ENV-01 | — | Pending |
| ENV-02 | — | Pending |
| ENV-03 | — | Pending |
| ENV-04 | — | Pending |
| ANG-01 | — | Pending |
| ANG-02 | — | Pending |
| ANG-03 | — | Pending |
| ANG-04 | — | Pending |
| ANG-05 | — | Pending |
| ANG-06 | — | Pending |
| ANG-07 | — | Pending |
| MAT-01 | — | Pending |
| MAT-02 | — | Pending |
| MAT-03 | — | Pending |
| MAT-04 | — | Pending |
| FIR-01 | — | Pending |
| FIR-02 | — | Pending |
| FIR-03 | — | Pending |
| FIR-04 | — | Pending |
| FIR-05 | — | Pending |
| BLD-01 | — | Pending |
| BLD-02 | — | Pending |
| BLD-03 | — | Pending |
| BLD-04 | — | Pending |
| MOD-01 | — | Pending |
| MOD-02 | — | Pending |
| MOD-03 | — | Pending |
| MOD-04 | — | Pending |
| MOD-05 | — | Pending |
| MOD-06 | — | Pending |
| VER-01 | — | Pending |
| VER-02 | — | Pending |
| VER-03 | — | Pending |
| VER-04 | — | Pending |
| VER-05 | — | Pending |

**Coverage:**
- v1 requirements: 35 total
- Mapped to phases: 0
- Unmapped: 35

---
*Requirements defined: 2026-03-31*
*Last updated: 2026-03-31 after initial definition*
