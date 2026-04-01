# Coding Conventions

**Analysis Date:** 2026-03-31

## Naming Patterns

**Files:**
- Components: `kebab-case.component.ts` (e.g., `client/src/app/bio/bio.component.ts`)
- Modules: `kebab-case.module.ts` (e.g., `client/src/app/bio/bio.module.ts`)
- Routing modules: `kebab-case-routing.module.ts` (e.g., `client/src/app/bio/bio-routing.module.ts`)
- Templates: `kebab-case.component.html`
- Styles: `kebab-case.component.scss`

**Components:**
- Class names use PascalCase with `Component` suffix: `BioComponent`, `PostsComponent`, `SpeakingComponent`
- Enforced by tslint rule `component-class-suffix: true` in `client/tslint.json`

**Selectors:**
- Component selectors use `evg-` prefix with kebab-case: `evg-root`, `evg-bio`, `evg-posts`, `evg-speaking`
- Directive selectors use `evg` prefix with camelCase
- Enforced by tslint rules `component-selector` and `directive-selector` in `client/tslint.json`

**Modules:**
- Class names use PascalCase with `Module` suffix: `BioModule`, `MatDepsModule`

**Variables/Properties:**
- camelCase for all instance properties and local variables
- Interfaces use PascalCase without `I` prefix (tslint `interface-name: false`): e.g., `Post` in `client/src/app/posts/posts.component.ts`

## Code Style

**Formatting:**
- Prettier v1.18.2 configured at root level (`package.json`)
- EditorConfig at `client/.editorconfig`:
  - UTF-8 charset
  - 2-space indentation
  - Spaces (not tabs)
  - Final newline inserted
  - Trailing whitespace trimmed

**Linting:**
- TSLint v5.15.0 with Codelyzer v5.0.0 (`client/tslint.json`)
- Extends `tslint:recommended`
- Key rules:
  - Single quotes enforced (`quotemark: single`)
  - Max line length: 140 characters
  - No trailing commas
  - No console except `log`, `warn`, `error`
  - No non-null assertions
  - Member ordering: static fields, instance fields, static methods, instance methods
  - Arrow parens not enforced
  - Object literal keys quoted only as-needed

**TypeScript:**
- Target: ES2015 (`client/tsconfig.json`)
- Module: ESNext
- Strict mode: NOT enabled
- Decorators enabled (`experimentalDecorators`, `emitDecoratorMetadata`)

## Import Organization

**Order (observed pattern):**
1. Angular framework imports (`@angular/core`, `@angular/common`)
2. Third-party imports
3. Local/relative imports (routing modules, components, shared modules)

**Path Style:**
- Relative paths used throughout (no path aliases configured)
- Example from `client/src/app/bio/bio.module.ts`:
  ```typescript
  import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { BioRoutingModule } from './bio-routing.module';
  import { BioComponent } from './bio.component';
  import { MatDepsModule } from '../mat-deps/mat-deps.module';
  ```

**Note:** TSLint `ordered-imports: false` -- import ordering is not enforced by the linter.

## Angular-Specific Patterns

**Module Pattern:**
- Each feature has its own NgModule with lazy loading via dynamic `import()` syntax
- Root module: `client/src/app/app.module.ts` -- imports `BrowserModule`, `AppRoutingModule`, `BrowserAnimationsModule`, `MatDepsModule`
- Feature modules import `CommonModule` (not `BrowserModule`), their own routing module, and `MatDepsModule`
- Lazy loading configured in `client/src/app/app-routing.module.ts`:
  ```typescript
  loadChildren: () => import('./bio/bio.module').then(mod => mod.BioModule)
  ```

**Shared Module:**
- `MatDepsModule` at `client/src/app/mat-deps/mat-deps.module.ts` acts as the shared Angular Material barrel module
- Re-exports Material modules: Toolbar, Sidenav, List, Icon, Button, Card, GridList
- Imported by every feature module

**Component Structure:**
- Components use external templates and styles (not inline):
  ```typescript
  @Component({
    selector: 'evg-bio',
    templateUrl: './bio.component.html',
    styleUrls: ['./bio.component.scss']
  })
  ```
- Style preprocessor: SCSS (configured in `client/angular.json` schematics)

**Routing:**
- Each feature has a dedicated `*-routing.module.ts` that uses `RouterModule.forChild(routes)`
- Root routing uses `RouterModule.forRoot(routes)` with redirect from `''` to `'bio'`
- Feature routes define a single default route (`path: ''`) pointing to the feature component

**Data Pattern:**
- Static data is hardcoded as constants in component files (no services or API calls observed)
- Example: `posts` array in `client/src/app/posts/posts.component.ts`, `tiles` array in `client/src/app/speaking/speaking.component.ts`
- Interfaces defined locally in the same file as the component that uses them

**Templates:**
- Heavy use of Angular Material components (`mat-card`, `mat-toolbar`, `mat-drawer`, `mat-nav-list`, `mat-grid-list`)
- `*ngFor` used for list rendering
- `routerLink` directive for navigation
- `[href]` binding with `target="_blank"` for external links

## Where to Add New Code

**New feature module:**
1. Create directory: `client/src/app/{feature-name}/`
2. Add files: `{feature-name}.component.ts`, `.html`, `.scss`, `{feature-name}.module.ts`, `{feature-name}-routing.module.ts`
3. Use `evg-` prefix for component selector
4. Import `CommonModule` and `MatDepsModule` in the feature module
5. Add lazy route in `client/src/app/app-routing.module.ts`
6. Add navigation link in `client/src/app/app.component.html`

**New Angular Material dependency:**
- Add the import and export to `client/src/app/mat-deps/mat-deps.module.ts`

---

*Convention analysis: 2026-03-31*
