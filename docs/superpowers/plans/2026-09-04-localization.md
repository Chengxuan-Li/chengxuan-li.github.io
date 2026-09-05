# English/Chinese Localization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish locale-aware English and Simplified Chinese static pages from single-source records with optional field-level English fallback.

**Architecture:** Normalize translatable content into paired `{ en, zh? }` values, resolve those values at rendering boundaries, and render shared page views at unprefixed English and `/zh/` Chinese routes. Keep project metadata single-source while loading optional `index.zh.md` bodies separately.

**Tech Stack:** Astro 7, TypeScript 6, Zod through `astro/zod`, Vitest, YAML content collections, static GitHub Pages output.

**Spec:** `docs/superpowers/specs/2026-09-04-localization-design.md`

## Global Constraints

- Existing English URLs and English rendered copy remain backward-compatible.
- Chinese documents declare `lang="zh-CN"`; the application locale remains `zh`.
- English text is required; Chinese text is optional and falls back field by field.
- Unknown YAML fields and blank translations continue to fail schema validation.
- Internal links retain the current locale; external URLs never change.
- Do not add a client-side-only language state or automatic browser-language redirect.
- `npm run validate` is the release gate.

---

### Task 1: Locale primitives and content schema

**Files:**
- Create: `src/lib/i18n.ts`
- Modify: `src/lib/content/schemas.ts`
- Modify: `src/lib/content/queries.ts`
- Test: `tests/i18n.test.ts`
- Test: `tests/schemas.test.ts`
- Modify: `tests/helpers/fixtures.ts`

**Interfaces:**
- Produces: `Locale`, `LocalizedText`, `getText(value, locale)`, `textLang(value, locale)`, `localizedPath(path, locale)`, `otherLocale(locale)`, `t(locale, key)`.
- Produces: `localizedTextSchema`, accepting a string or strict `{ en, zh? }` object and outputting `LocalizedText`.

- [ ] **Step 1: Write failing locale and schema tests**

Cover English selection, Chinese selection, Chinese fallback, source-language reporting, `/zh/` prefix addition/removal, query/hash preservation, shorthand normalization, paired input, blank Chinese rejection, unknown key rejection, and per-item list normalization.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npx vitest run tests/i18n.test.ts tests/schemas.test.ts`

Expected: FAIL because the locale module and localized schema do not exist.

- [ ] **Step 3: Implement locale primitives and normalize schema fields**

Add strict locale helpers and convert every human-facing schema field to `localizedTextSchema`, including link labels and array items. Keep identifiers, dates, URLs, enums, authors, and technologies invariant. Update query title tie-breakers to compare `getText(value, 'en')`.

- [ ] **Step 4: Update typed fixture builders and run focused tests**

Represent fixture text with a helper returning `{ en: value }`. Run the same Vitest command and expect PASS.

### Task 2: Locale-aware formatting and activity

**Files:**
- Modify: `src/lib/content/format.ts`
- Modify: `src/lib/content/activity.ts`
- Test: `tests/format.test.ts`
- Test: `tests/activity.test.ts`

**Interfaces:**
- Produces: locale parameters on `formatFlexDate`, `formatDateRange`, `formatDayMonth`, and `formatMonthYear`.
- Produces: locale parameters on `buildActivityStream`, `selectLatestActivity`, and `getProjectActivity`.

- [ ] **Step 1: Add failing Chinese formatting and localized activity tests**

Assert `2026-09-03` becomes `2026年9月3日`, month precision becomes `2026年9月`, ongoing ranges use `至今`, translated activity fields are selected, fallback fields remain English, and related-project hrefs use `/zh/projects/<id>/`.

- [ ] **Step 2: Run focused tests and verify failure**

Run: `npx vitest run tests/format.test.ts tests/activity.test.ts`

Expected: FAIL because formatting and activity functions ignore locale.

- [ ] **Step 3: Implement locale-aware formatting and derived activity**

Resolve content with `getText`, source labels with `t`, and internal paths with `localizedPath`. Preserve English defaults so existing callers and tests remain valid.

- [ ] **Step 4: Run focused tests**

Run the same Vitest command and expect PASS.

### Task 3: Locale-aware shared components and layout metadata

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/SiteHeader.astro`
- Modify: `src/components/SiteFooter.astro`
- Modify: every content-rendering component under `src/components/`
- Modify: `src/styles/global.css`
- Modify: `src/site.config.ts`
- Test: `tests/i18n.test.ts`

**Interfaces:**
- Consumes: Task 1 locale helpers and Task 2 formatters.
- Produces: optional `locale: Locale` component props defaulting to `en`.
- Produces: document `lang`, canonical/alternate metadata, localized internal links, and a no-JavaScript language switch.

- [ ] **Step 1: Add assertions for localized site configuration and alternate URLs**

Assert direct Chinese translations resolve and missing values report English as their source language.

- [ ] **Step 2: Update components to resolve rendered text and paths**

Pass locale through nested components, localize labels and dates, and add `lang="en"` where Chinese mode uses fallback content. Translate fixed navigation, section, action, status, media-fallback, and accessibility strings.

- [ ] **Step 3: Update layout metadata and header controls**

Set the HTML language, self-canonical, `hreflang` alternates, localized skip link, and route-preserving language link. Group language and theme controls without changing theme behavior.

- [ ] **Step 4: Add CJK system typography and responsive control styles**

Use the system stack `"PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif` under `:lang(zh-CN)` and keep the control group usable below 40em.

- [ ] **Step 5: Run type-check and locale tests**

Run: `npm run check && npx vitest run tests/i18n.test.ts tests/theme.test.ts`

Expected: PASS.

### Task 4: Shared page views and Chinese static routes

**Files:**
- Create: `src/views/HomePage.astro`
- Create: `src/views/ProjectsPage.astro`
- Create: `src/views/PublicationsPage.astro`
- Create: `src/views/CvPage.astro`
- Create: `src/views/NewsPage.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/projects/index.astro`
- Modify: `src/pages/publications.astro`
- Modify: `src/pages/cv.astro`
- Modify: `src/pages/news.astro`
- Create: matching route wrappers under `src/pages/zh/`
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: locale-aware layout/components.
- Produces: one shared view per page and static English/Chinese route wrappers.

- [ ] **Step 1: Extract existing pages into locale-parameterized views**

Move data loading and markup without changing English behavior. Resolve site configuration and fixed copy through locale helpers.

- [ ] **Step 2: Replace English pages with thin `locale="en"` wrappers**

Each wrapper imports and renders exactly one shared view.

- [ ] **Step 3: Add Chinese `locale="zh"` wrappers and Astro locale configuration**

Create `/zh/`, `/zh/projects/`, `/zh/publications/`, `/zh/cv/`, and `/zh/news/`; configure English as the unprefixed default locale.

- [ ] **Step 4: Type-check the route family**

Run: `npm run check`

Expected: PASS with no duplicated component-prop or collection types.

### Task 5: Optional Chinese project narratives

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/lib/content/entry-id.ts`
- Create: `src/views/ProjectPage.astro`
- Modify: `src/pages/projects/[slug].astro`
- Create: `src/pages/zh/projects/[slug].astro`
- Modify: `src/content/projects/_template/index.md`
- Create: `src/content/projects/_template/index.zh.md`
- Test: `tests/entry-id.test.ts`

**Interfaces:**
- Produces: `projectTranslations` content collection keyed by project folder id.
- Produces: optional Chinese `CollectionEntry<'projectTranslations'>` passed to `ProjectPage`.

- [ ] **Step 1: Add failing translation-entry ID tests**

Assert `project/index.zh.md` maps to `project` while malformed or non-Chinese paths do not masquerade as translation IDs.

- [ ] **Step 2: Add the translation collection and ignore translations in the project collection**

Load English `index.md` records separately from optional `index.zh.md` bodies. Keep translation frontmatter strict and empty.

- [ ] **Step 3: Extract the project view and add both route generators**

English always renders the project entry. Chinese renders the matching translation entry when available, otherwise the English entry in a `lang="en"` prose container. Metadata and relation sections resolve field by field.

- [ ] **Step 4: Document the authoring convention in templates**

Show paired metadata fields in `index.md` and explain that `index.zh.md` is optional and body-only.

- [ ] **Step 5: Run entry, schema, and type tests**

Run: `npx vitest run tests/entry-id.test.ts tests/schemas.test.ts && npm run check`

Expected: PASS.

### Task 6: Static-output validation and content documentation

**Files:**
- Modify: `scripts/check-dist.mts`
- Modify: `tests/check-dist.test.ts`
- Modify: collection `_template.yaml` files under `src/content/`
- Modify: `README.md`

**Interfaces:**
- Consumes: both static route families and metadata output.
- Produces: build checks for locale routes, `lang`, canonical, and alternate links.

- [ ] **Step 1: Add failing static-output tests**

Create fixture output for both locales and assert missing localized routes, wrong document languages, wrong canonicals, and absent `en`/`zh-CN` alternates are reported.

- [ ] **Step 2: Extend the output checker**

Require all five Chinese static routes and every `/zh/projects/<id>/` route. Validate English and Chinese `lang` attributes plus canonical and alternate metadata for all indexable pages.

- [ ] **Step 3: Update authoring templates and README**

Document English shorthand, paired values, field-level fallback, optional Chinese project bodies, route behavior, and validation commands.

- [ ] **Step 4: Run unit tests**

Run: `npm test`

Expected: PASS.

### Task 7: Full verification

**Files:**
- Verify only; fix files from earlier tasks if evidence exposes a defect.

**Interfaces:**
- Consumes: the completed localization subsystem.
- Produces: release-ready static output.

- [ ] **Step 1: Run the full release gate**

Run: `npm run validate`

Expected: Astro check passes, all Vitest tests pass, production build succeeds, and `check-dist` reports both locale route families with no broken references.

- [ ] **Step 2: Inspect representative generated HTML**

Check `/`, `/zh/`, one English project, and its Chinese counterpart for correct `lang`, canonical, alternates, localized internal links, theme control, language control, and English fallback markup.

- [ ] **Step 3: Review the final diff**

Run: `git diff --check` and `git status --short`.

Expected: no whitespace errors and only localization-related files changed.

