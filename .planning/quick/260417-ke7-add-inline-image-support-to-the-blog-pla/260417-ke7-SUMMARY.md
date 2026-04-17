---
phase: 260417-ke7
plan: 01
status: complete-user-merged
subsystem: blog/posts
tags: [markdown, images, responsive, marked]
key-files:
  modified:
    - client/src/app/posts/markdown.ts
    - client/src/app/posts/post-detail.component.scss
    - client/src/assets/blog/effecting-change-as-consultants.md
  created:
    - client/src/assets/blog/media/effecting-change-as-consultants/.gitkeep
    - client/src/assets/blog/media/effecting-change-as-consultants/test-image.png
decisions:
  - "Used marked.use({ renderer: { image() } }) extension API — correct for marked v18 (single-object destructured argument)"
  - "PNG generated via Node.js built-in zlib (no ImageMagick on PATH, no new deps); 600x300 solid #2e7d32 square"
  - "Image line inserted between second paragraph and first hr in the post body — keeps leading content intact"
metrics:
  completed-date: "2026-04-17"
  tasks-completed: 2
  tasks-total: 3
  checkpoint-pending: Task 3 (human-verify)
---

# Phase 260417-ke7 Plan 01: Add Inline Image Support to Blog — Summary

**One-liner:** Custom `marked` v18 image renderer that rewrites `media/{slug}/file.ext` to `assets/blog/media/{slug}/file.ext`, with responsive `img` styling inside `.post-body`.

## Author Convention

In any local post markdown file, reference images using:

```markdown
![alt text](media/{post-slug}/filename.ext)
```

The file must be stored at `client/src/assets/blog/media/{post-slug}/filename.ext`. The Angular asset pipeline (`"assets": ["src/assets"]` in `angular.json`) serves it verbatim at `/assets/blog/media/{post-slug}/filename.ext`. No `angular.json` changes required.

Absolute URLs (`http://`, `https://`, `//`, `/`, `data:`) are passed through untouched.

## File Change Footprint

| File | Change |
|------|--------|
| `client/src/app/posts/markdown.ts` | Added `marked.use()` with custom image renderer; comment documents author convention |
| `client/src/app/posts/post-detail.component.scss` | Added `.post-body img { display:block; max-width:100%; height:auto; margin:var(--space-md) 0; border-radius:var(--radius-sm); }` |
| `client/src/assets/blog/media/effecting-change-as-consultants/.gitkeep` | Created — tracks directory in git |
| `client/src/assets/blog/media/effecting-change-as-consultants/test-image.png` | Created — 600x300 solid #2e7d32 PNG (1213 bytes) |
| `client/src/assets/blog/effecting-change-as-consultants.md` | Added `![Test image verifying inline image support](media/effecting-change-as-consultants/test-image.png)` after second paragraph |

No other files were modified. No Angular, Material, RxJS, or toolchain versions changed.

## Commits

| Hash | Description |
|------|-------------|
| `69a950a` | feat(260417-ke7-01): add image path resolution to markdown renderer and responsive img styling |
| `c39c78a` | feat(260417-ke7-01): add test image asset and wire it into effecting-change-as-consultants post |

## Deviations from Plan

**1. [Rule 3 - Blocking] Installed node_modules in worktree before tsc check**
- **Found during:** Task 1 verification
- **Issue:** Worktree `client/` had no `node_modules/` (the main repo's modules were not available via the worktree path), so `tsc --noEmit` could not resolve any module types.
- **Fix:** Ran `npm install` in the worktree's `client/` directory. This is a one-time setup cost; the install is not committed.
- **Impact:** None on deliverables. `tsc --noEmit` exited 0 after install.

**2. PNG generation approach: Node zlib (plan fallback option c)**
- ImageMagick's `magick` command was not available; the Windows system `convert.exe` is not ImageMagick.
- Generated a 600x300 RGB PNG using Node.js built-in `zlib.deflateSync` with no external dependencies.
- PNG signature verified byte-for-byte (`89 50 4E 47 0D 0A 1A 0A`). File is 1213 bytes.
- Visually the image is a solid green rectangle (#2e7d32). No text annotation (zlib approach; text rendering requires an external library).

## Checkpoint Pending

**Task 3 (human-verify, gate=blocking)** has not been run. The human reviewer must:

1. `cd client && npm start`
2. Open `http://localhost:4200/posts/effecting-change-as-consultants`
3. Confirm test image renders near top of post body, no horizontal overflow
4. Confirm DevTools Network shows `200 OK` for `/assets/blog/media/effecting-change-as-consultants/test-image.png`
5. Open `http://localhost:4200/posts/ai-tooling-has-layers` — confirm no regression

## Known Stubs

None. The test image is a real PNG (valid byte sequence, browser-decodable). The markdown reference uses the exact documented convention and will resolve correctly through the custom renderer.

## Follow-up Hooks for Future Image Work

- **Hero images:** Add an optional `hero` field to `posts.json` entries; render above the title in `post-detail.component.html`.
- **Captions:** Wrap `<img>` in `<figure>` + `<figcaption>` in the renderer when `title` is present.
- **Lightbox:** Wire a click handler on `.post-body img` to open a full-screen overlay.
- **Lazy loading:** Add `loading="lazy"` to the `<img>` tag in the renderer.
- **Build-time optimization:** Use `@angular/build` image optimization or a pre-build step (sharp) to emit WebP variants.
