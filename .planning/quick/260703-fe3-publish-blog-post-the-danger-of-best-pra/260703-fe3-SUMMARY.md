---
quick_id: 260703-fe3
title: Publish "The Danger of Best Practices" blog post
date: 2026-07-03
status: complete
---

# Quick Task 260703-fe3: Summary

## What was done

Adapted the author's own Valiantys article into a local blog post on
theevergreendev, stripped of corporate/marketing framing and rewritten in the
site's first-person personal-essay voice.

## Changes

- **New post:** `client/src/assets/blog/danger-of-best-practices.md`
  - Reworked from the source article rather than copied — same argument and the
    same BLS business-failure statistics, expressed freshly to match the voice of
    the existing posts (e.g. `finishing-is-an-empathy-problem.md`).
  - Removed: the "Head of AI, Valiantys" byline, company references, marketing
    CTAs, and the corporate "So What?" / "AI Is a Tool, Not an Oracle" header
    styling. Kept the Project Vend hook, the best-practices-vs-common-practice
    argument, the average-answer mechanics of LLMs, and the tool-not-oracle close.
  - Body only; title/date/summary live in the manifest per the site convention.

- **Manifest:** `client/src/assets/blog/posts.json`
  - Added a `local` entry (slug `danger-of-best-practices`, dated 2026-07-03) as
    the newest post. Sorts to the top of the list via the existing date sort.

## Verification

- `posts.json` re-parses as valid JSON with the new entry present.
- Markdown file exists at the slug path expected by `BlogService.loadMarkdown`.

## Notes

The source is the author's own writing, so the adaptation is a straightforward
republish-in-my-own-voice rather than derivative use of a third party's text.
