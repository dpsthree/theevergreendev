# Testing Patterns

**Analysis Date:** 2026-03-31

## Test Framework

**Unit Test Runner:**
- Karma v4.1.0
- Config: `client/karma.conf.js`
- Browser: ChromeHeadless (single run mode)
- Framework: Jasmine v3.4.0

**Assertion Library:**
- Jasmine (built-in matchers)

**E2E Test Runner:**
- Protractor v5.4.0
- Config: `e2e/protractor.conf.js`
- Browser: Chrome (direct connect)
- Framework: Jasmine

**Test Bootstrap:**
- `client/src/test.ts` initializes Angular test environment and discovers `*.spec.ts` files via webpack context

**Run Commands:**
```bash
cd client && npm test          # Run unit tests (Karma + Jasmine)
cd client && npm run e2e       # Run e2e tests (Protractor)
cd client && npm run lint      # Run TSLint
npm test                       # Proxies to client test (from root)
```

## Test File Organization

**Location:** Co-located with source files (Angular CLI convention)
- Unit tests: `client/src/app/**/*.spec.ts`
- E2E tests: `e2e/src/**/*.e2e-spec.ts`
- Page objects: `e2e/src/*.po.ts`

**TypeScript Config:**
- Spec files excluded from app build: `client/tsconfig.app.json` excludes `src/**/*.spec.ts`
- Spec files included in test build: `client/tsconfig.spec.json` includes `src/**/*.spec.ts`

## Coverage

**Configuration:**
- Istanbul reporter configured in `client/karma.conf.js`
- Output directory: `client/coverage/evergreen/`
- Reports: HTML, lcovonly, text-summary

**View Coverage:**
```bash
# After running tests, open:
# client/coverage/evergreen/index.html
```

## Current State

**ALL TESTS HAVE BEEN REMOVED.**

The codebase has zero test files:
- 0 unit test files (`*.spec.ts`)
- 0 e2e test files (`*.e2e-spec.ts`)

**Git History:**
- Commit `f591ed2` ("remove unused tests") deleted all 5 test files:
  - `client/src/app/app.component.spec.ts` (35 lines)
  - `client/src/app/bio/bio.component.spec.ts` (25 lines)
  - `client/src/app/posts/posts.component.spec.ts` (25 lines)
  - `client/src/app/speaking/speaking.component.spec.ts` (25 lines)
  - `e2e/src/app.e2e-spec.ts` (23 lines)
- Commit `8d0f68c` ("skip testing for now") removed the test step from `.travis.yml`

**Test Infrastructure Status:**
- All test configuration files still exist and are intact:
  - `client/karma.conf.js` -- Karma config present
  - `client/tsconfig.spec.json` -- Test TypeScript config present
  - `client/src/test.ts` -- Test bootstrap present
  - `e2e/protractor.conf.js` -- Protractor config present
  - `e2e/src/app.po.ts` -- Page object for e2e still present
- Running `npm test` would succeed (no spec files to fail) but execute zero tests

**What Is Not Tested:**
- `AppComponent` at `client/src/app/app.component.ts` -- root shell with navigation
- `BioComponent` at `client/src/app/bio/bio.component.ts` -- bio page
- `PostsComponent` at `client/src/app/posts/posts.component.ts` -- blog post list
- `SpeakingComponent` at `client/src/app/speaking/speaking.component.ts` -- speaking engagement grid
- All routing configuration in `client/src/app/app-routing.module.ts`
- All feature routing modules (`bio-routing.module.ts`, `posts-routing.module.ts`, `speaking-routing.module.ts`)

## Mocking

**No test mocking patterns exist** since all tests were removed. The deleted tests were Angular CLI defaults using `TestBed.configureTestingModule`.

## Restoring Tests

To add tests back, follow the Angular CLI pattern:

**Unit test file pattern:**
```typescript
// client/src/app/{feature}/{feature}.component.spec.ts
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureComponent } from './feature.component';

describe('FeatureComponent', () => {
  let component: FeatureComponent;
  let fixture: ComponentFixture<FeatureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FeatureComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

**E2E test file pattern:**
```typescript
// e2e/src/app.e2e-spec.ts
import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should display title', () => {
    page.navigateTo();
    expect(page.getTitleText()).toEqual('Expected Title');
  });
});
```

**Important:** Feature module tests will need to import `MatDepsModule` and `RouterTestingModule` in `TestBed` configuration since all components depend on Angular Material and routing.

---

*Testing analysis: 2026-03-31*
