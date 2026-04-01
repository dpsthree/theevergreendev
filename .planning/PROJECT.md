# The Evergreen Dev — Dependency Modernization

## What This Is

A personal developer website (theevergreendev) with bio, speaking engagements, and blog posts sections. Built as an Angular SPA deployed to Firebase Hosting. The immediate goal is to modernize all dependencies from Angular 8 to Angular 19 (latest stable) without changing existing functionality.

## Core Value

The site continues to work exactly as it does today — same pages, same content, same behavior — on a modern, maintainable dependency stack.

## Requirements

### Validated

<!-- Inferred from existing codebase -->

- ✓ Bio page with personal information — existing
- ✓ Speaking page with engagement tiles and upcoming events — existing
- ✓ Blog posts page with post cards — existing
- ✓ Side-navigation layout with toolbar — existing
- ✓ Lazy-loaded feature modules (bio, speaking, posts) — existing
- ✓ Angular Material UI components (cards, grid lists, toolbar, sidenav) — existing
- ✓ Firebase Hosting deployment with SPA routing — existing
- ✓ Google Analytics integration — existing
- ✓ SCSS styling with Angular Material indigo-pink theme — existing

### Active

- [ ] Upgrade Angular from 8 to 19 (latest stable)
- [ ] Upgrade all @angular/* packages to matching versions
- [ ] Upgrade Angular Material and CDK to latest
- [ ] Upgrade TypeScript to Angular 19-compatible version
- [ ] Upgrade RxJS to latest compatible version
- [ ] Upgrade zone.js to latest compatible version
- [ ] Upgrade Firebase and @angular/fire to latest
- [ ] Upgrade build tooling (Angular CLI, builders)
- [ ] Replace deprecated TSLint with ESLint
- [ ] Update Node.js requirement to current LTS
- [ ] All existing pages render correctly after upgrade
- [ ] Firebase deployment continues to work

### Out of Scope

- New features or pages — this is a dependency-only upgrade
- Visual redesign — preserve current look and feel
- Backend/API changes — site has no backend
- Test coverage improvements — tests are currently disabled
- Content changes — all hardcoded content stays as-is

## Context

- **Current state:** Angular 8.2.7, TypeScript 3.5.3, Node 10, Firebase SDK <7
- **Architecture:** Simple SPA with 3 lazy-loaded feature modules, no state management, no HTTP calls, all content hardcoded in components
- **Deployment:** Firebase Hosting via `@angular/fire` deploy builder
- **Testing:** Karma/Jasmine configured but tests skipped per git history
- **Key risk:** Angular 8→19 spans 11 major versions with significant breaking changes (NgModules→standalone, View Engine→Ivy, build system changes)

## Constraints

- **Functionality**: All three pages (bio, speaking, posts) must render identically after upgrade
- **Deployment**: Must continue deploying to Firebase Hosting
- **Content**: No changes to hardcoded data in components

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Upgrade to latest Angular 19 (not incremental) | User preference; clean target | — Pending |
| Update all dependencies (not just Angular) | Full modernization; avoid version conflicts | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after initialization*
