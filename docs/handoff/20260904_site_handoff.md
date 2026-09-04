# Handoff — chengxuan-li.github.io

**Date:** 2026-09-04 · **Branch:** `main` · **Live:** <https://chengxuan-li.github.io/>

You are picking up a finished, deployed personal research site. This document is the fastest path to being
useful: what exists, the rules that are easy to break, and what is genuinely left to do. Read
[`../../README.md`](../../README.md) for day-to-day commands and field reference; read
[`../specs/20260903_personal_website_implementation_spec.md`](../specs/20260903_personal_website_implementation_spec.md)
for the original brief and
[`../plans/20260903_personal_website_implementation_plan.md`](../plans/20260903_personal_website_implementation_plan.md)
for the build log and every deviation from that brief, with reasons.

## What it is

A static Astro 7 site with **no client-side framework and almost no JavaScript** (the only script is the
theme toggle). Five views are generated from one content model: Home, Projects (with per-project case
studies), Publications, CV, News.

Stack: Astro 7.3 · TypeScript 6 · `astro/zod` (Zod 4) · plain CSS with design tokens · Vitest ·
self-hosted Geist Sans/Mono · GitHub Actions → GitHub Pages.

```bash
npm install
npm run dev           # http://localhost:4321/
npm run dev:fixtures  # same, with synthetic records that exercise every layout
npm run validate      # type-check + tests + build + post-build link checks — run before pushing
```

## The five rules that matter

1. **Never invent a fact.** Everything published must trace to `references/extracted/`, existing repository
   content, or an explicit instruction from the site owner. If a value is uncertain, leave it out and say
   so — omission is always preferable to a plausible guess. Verify anything externally checkable (DOI,
   venue, URL) before publishing it; a record once arrived carrying a different paper's DOI.
2. **No AI or agent attribution anywhere.** Not in commit messages, trailers, README, or any repository
   text. Commit as the configured human identity. Use only non-destructive git operations (no force push,
   hard reset, destructive checkout, branch deletion, rebase, clean).
3. **`/news/` is a derived view, not a collection.** `src/lib/content/activity.ts` builds one
   reverse-chronological stream from publications, awards, talks, and hand-written news. Never copy a paper,
   award, or talk into `src/content/news/` — that reintroduces the title/date duplication this model exists
   to prevent. Projects, education, and experience never generate entries; write a manual news item if a
   milestone deserves announcing.
4. **Record ids come from the file path only** (`src/lib/content/entry-id.ts`), never from a `slug:` field.
   This also means a half-written file fails validation with a readable message instead of crashing Astro's
   loader inside `node_modules`.
5. **Schemas are strict.** An unknown or mistyped field fails the build naming the file and the key. Do not
   "fix" such a failure by loosening the schema; fix the record, or add the field deliberately with a test.

## Where things live

`src/lib/content/` is the model, and it flows one way:

```text
schemas.ts     field shapes, date primitives, strict record schemas
   ↓
validate.ts    cross-record rules: dangling ids, duplicate ids/orders, duplicate DOI, date ranges
rawdates.ts    re-reads raw YAML so calendar-invalid dates cannot slip through the parser
   ↓
queries.ts     selection, sorting, grouping, relations
activity.ts    the news/Latest stream
   ↓
load.ts        loadSiteContent() — the single entry point every page calls
```

Components never read collections directly; pages call `loadSiteContent()` and pass data down. Every module
above has a matching file in `tests/`. Site-wide facts and feature toggles are in `src/site.config.ts`
(a `null` profile link or `cvPdf` simply omits that link or button).

## Current content state

| Collection | Count | Notes |
| --- | --- | --- |
| Projects | 4 | 2 real (EnergyAtlas, inverse calibration) + **2 explicit placeholders** |
| Publications | 5 | 4 published, 1 accepted (ShadingZip, no DOI/link yet) |
| Talks | 2 | Both IBPSA-USA webinars |
| Awards | 6 | 4 have a `url` |
| Experiences | 3 | Cornell, EnergyAtlas.io, USD MEP |
| Education | 3 | Cornell PhD, AA M.Arch, AA BA |
| Skills | 5 | Categories from the CV document |
| Manual news | 0 | Correct — the stream is derived; this collection is for irregular events only |

## Open items, most useful first

1. **Replace the two placeholder projects.** `src/content/projects/placeholder-grid-flexibility/` and
   `placeholder-ubem-fidelity/` are titled "Placeholder: …" and say so in the body. They occupy home-page
   slots 3 and 4. Replace with real case studies or delete the folders.
2. **The two real project pages are thin.** Both have Problem / Method / Contribution but their Technical
   Details sections say results are "pending source material", and neither has a hero image or figures.
   Project visuals were a priority in the original brief.
3. **Missing profile links.** `scholar` and `linkedin` are `null` in `src/site.config.ts`, and `cvPdf` is
   `null` so no PDF download button renders. Add a PDF to `public/cv/` and set the path when one exists —
   never link from `references/archive/`.
4. **No publication links to projects.** Every publication has `project_ids: []` because the CV document
   does not say which paper belongs to which project. Filling these in switches on cross-links across the
   site (project Outputs, publication "Project:" chips).
5. **The CV document flags its own sections for revision.** Author comments in `cv-content-ref.docx` read
   "Revisit" (skills), "Check text" / "AI Stuff" (experience), and "Update" (publications) — see
   `references/extracted/cv-2026-09.md`. The owner may want to revise these before promoting more content.
6. **Positioning copy is derived, not authored.** The hero sentence and research-interests line were written
   from the CV's experience bullets. Worth the owner's own words.

## Gotchas learned the hard way

- **Astro's content cache keeps deleted records.** When a collection directory empties, the glob loader
  returns early and stale entries survive. `npm run build` therefore runs `astro build --force`; for the dev
  server use `npm run dev -- --force`. `load.ts` also fails the build if a cached record's source file is
  missing.
- **YAML rolls invalid dates over.** `2026-13-01` silently becomes 2027-01-01 through js-yaml, so
  `rawdates.ts` re-reads the raw text and rejects impossible calendar dates. Do not remove it.
- **The `github-pages` environment blocks `main` by default.** GitHub seeds the environment's allowed
  branches with whatever was default when it was created. Fixed in repository settings, not in the workflow —
  see the README's Deployment section.
- **`fixtures/content/` is synthetic.** Every record there says "Fixture". Never copy it into
  `src/content/`, and never treat it as fact.
- **The owner edits content while work is in progress.** Re-read files before judging them; a file that
  looks empty or wrong may be mid-save. Take on-disk changes as the current state rather than reverting
  them, and fix genuine errors (typos, copied values) rather than working around them.

## Verification before you push

```bash
npm run validate      # type-check, 145 tests, build, route/link/canonical checks
npm run build:fixtures # optional: same build against synthetic records
```

Then check `git log` for accidental attribution, confirm `git ls-files references/archive` lists only
`.gitkeep`, and confirm the working tree is clean. Pushing `main` deploys automatically.
