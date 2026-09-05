# English/Chinese Localization Design

## Goal

Add a Simplified Chinese version of every public route while preserving the current unprefixed English URLs. Editors keep one structured content record per fact, with English and optional Chinese values adjacent. Missing Chinese values fall back to English at field level.

## Locale and URL policy

- The application locale is `en` or `zh`; Chinese documents declare `lang="zh-CN"`.
- English remains at `/`, `/projects/`, `/publications/`, `/cv/`, `/news/`, and `/projects/<slug>/`.
- Chinese mirrors those routes under `/zh/`.
- A visible language link switches to the equivalent route and works without JavaScript.
- Each indexable page has a self-canonical URL plus `en`, `zh-CN`, and `x-default` alternate links.
- Internal links retain the current locale.

## Content authoring and fallback

Translatable scalar fields accept either the existing English string shorthand or this paired form:

```yaml
title:
  en: Load Profile Inference
  zh: 负荷曲线推断
```

The schema normalizes both forms to `{ en: string, zh?: string }`. English is required and non-empty. Chinese is optional and non-empty when present. In Chinese mode, resolution is `zh ?? en`; in English mode it is always `en`. Arrays whose elements are human-facing text apply the same rule per item.

Dates, IDs, URLs, enum values, DOI values, author names, and other machine/source facts remain single-valued. Site-owned interface text is translated completely in a typed dictionary and never relies on fallback.

Fallback text inside a Chinese document receives `lang="en"` on the closest practical element. Missing translations do not fail a build. The design does not add machine translation or a runtime content service.

## Project narratives

Existing `index.md` files remain the English project records and bodies. A project may add `index.zh.md` in the same directory. It contains only the Chinese Markdown body and is loaded through a separate collection; it is not treated as a second project record. If it is absent, the Chinese project route renders the English body inside a container marked `lang="en"`.

Project metadata stays paired in the frontmatter of `index.md`, so dates, relationships, images, and publishing controls remain single-source. This preserves Astro's normal Markdown rendering and co-located asset behavior for both bodies.

## Runtime boundaries

`src/lib/i18n.ts` owns locale types, text resolution, language attribution, UI strings, and localized URL generation. Content schemas own normalization. Query and relationship code continues to operate on the same records and uses English for deterministic tie-breaking. Display components receive a locale explicitly and resolve only the fields they render.

Shared page-view components own the five page layouts. Thin route files supply either `en` or `zh`, avoiding duplicate page markup. Project route files perform static path generation and pass the appropriate optional Chinese body to one shared project view.

`BaseLayout` owns document language, canonical/alternate metadata, localized skip text, and locale-aware header/footer wiring. The language selector is a normal link styled beside the existing theme control.

## Formatting and typography

Date helpers accept a locale. English output remains unchanged; Chinese uses `YYYY年M月D日`, `YYYY年M月`, and localized ongoing-range text. Status/type labels come from the UI dictionary.

Chinese text uses a system CJK font stack before falling back to the existing sans-serif stack, avoiding a large web-font payload. Latin content continues to use Geist.

## Validation and tests

- Schema tests cover shorthand normalization, paired values, optional Chinese fallback, blank values, unknown locale keys, and localized list items.
- Unit tests cover text/language resolution, route mapping, UI lookup, and Chinese date formatting.
- Activity and query tests cover localized derived entries and locale-preserving project links.
- Static-output tests require both route families and verify document language, canonical URLs, alternate links, and internal references.
- `npm run validate` remains the release gate.

## Migration and compatibility

Existing scalar content remains valid and is interpreted as English-only, so the feature does not require inventing translations. Collection templates document paired authoring. Site-level profile prose receives verified translations only where the English meaning is direct; otherwise it may use the same optional fallback mechanism.

