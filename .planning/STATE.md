# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-31)

**Core value:** The site continues to work exactly as it does today on a modern, maintainable dependency stack.
**Current focus:** Phase 1 — Pre-Flight

## Current Position

Phase: 1 of 4 (Pre-Flight)
Plan: 0 of TBD in current phase
Status: Ready to plan
Last activity: 2026-03-31 — Roadmap created

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: —
- Total execution time: 0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: —
- Trend: —

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [Init]: Upgrade directly to Angular 19 (not incremental milestone targets)
- [Init]: Update ALL dependencies (not just Angular) to avoid version conflicts

### Pending Todos

None yet.

### Blockers/Concerns

- [Pre-flight]: Node 10 must be upgraded before ANY `ng update` command — Angular CLI 17+ will not run on Node 10
- [Phase 2]: Enable `aot: true` in `angular.json` while still on Angular 8 and fix any AOT errors before starting step-through
- [Phase 2]: Angular Material MDC migration at v14→v15 changes CSS class names — all three pages need visual verification at that step
- [Phase 3]: esbuild builder changes output path to `dist/evergreen/browser/` — `firebase.json` must be updated or deployment silently 404s

## Session Continuity

Last session: 2026-03-31
Stopped at: Roadmap created, STATE.md initialized — ready to plan Phase 1
Resume file: None
