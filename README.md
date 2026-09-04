# chengxuan-li.github.io

Source of the personal research and engineering site published at <https://chengxuan-li.github.io/>.
The site is a static [Astro](https://astro.build) build: one structured content model rendered as five views —
Home (curated synthesis), Projects (technical case studies), Publications, CV (complete record), and News
(activity stream).

## Development

Requires Node 24 (see `.nvmrc`; Node ≥ 22.18 works).

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run dev` | Start the dev server at <http://localhost:4321/>. |
| `npm run dev:fixtures` | Dev server using the synthetic layout fixtures in `fixtures/content/` (see below). |
| `npm run check` | Type-check `.astro`/`.ts` files. |
| `npm test` | Run the unit tests (schemas, validation, queries, formatting, build checks). |
| `npm run build` | Production build to `dist/` (content cache cleared first), then post-build route/link checks. |
| `npm run build:fixtures` | Same build against the fixtures. |
| `npm run preview` | Serve `dist/` locally. |
| `npm run validate` | `check` + `test` + `build` — run this before publishing. |
| `npm run brand-assets` | Regenerate the social-preview image, PNG icons, and fixture images from `src/site.config.ts`. |

## Deployment

Pushes to `main` run `.github/workflows/deploy-pages.yml`, which installs dependencies, runs `npm run check`,
`npm test`, and `npm run build`, uploads `dist/` as the Pages artifact, and deploys it with the official
`actions/deploy-pages` action. The workflow can also be started manually from the Actions tab.

Two one-time repository settings:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. **Settings → Environments → `github-pages` → Deployment branches**: allow `main`. GitHub creates this
   environment automatically and seeds it with whatever branch was default at the time, so a deploy from
   `main` is rejected with *"Branch main is not allowed to deploy to github-pages due to environment
   protection rules"* until `main` is added (or the restriction removed).

The site is a *user* site, so it is served from the domain root; never configure a `base` path.

After a deployment, check `https://chengxuan-li.github.io/`, `/projects/`, `/publications/`, `/cv/`,
`/news/`, and one `/projects/<slug>/` directly by URL.

## Content model

All published facts live in `src/content/` and are validated at build time (schemas in
`src/lib/content/schemas.ts`, cross-reference rules in `src/lib/content/validate.ts`, a raw-source date check in
`src/lib/content/rawdates.ts`). A broken reference, malformed or impossible date, invalid URL, duplicate
ordering value, or a DOI reused by two papers fails the build with a message naming the record.

```text
src/content/
├── projects/<slug>/index.md   Markdown case study + frontmatter; images sit next to index.md
├── publications/<id>.yaml
├── news/<YYYY-MM-DD>-<slug>.yaml
├── experiences/<id>.yaml      type: research | professional | teaching | service
├── education/<id>.yaml
├── talks/<id>.yaml
├── awards/<id>.yaml
└── skills/<id>.yaml           one category per file
```

- The file or folder name is the record's id: lowercase words joined by single hyphens. Ids come from the
  path alone (`src/lib/content/entry-id.ts`), so a `slug:` field inside a record does **not** rename it.
- **Unknown fields are rejected.** Every record schema is strict, so a mistyped key fails the build naming
  the file and the key (`organizaton`, `links: watch`, …) instead of being silently dropped.
- Every collection folder holds a `_template.*` file (or `_template/` folder) documenting every field.
  Files and folders starting with `_` are ignored by the build.
- Relationships are declared one way: publications, news items, talks, awards, and experiences list the
  `project_ids` they belong to; projects list `related_project_ids`. Reverse lookups (a project's papers,
  talks, activity) are generated.
- Site-wide facts (name, role, affiliation, profile links, CV PDF path, meta description) live in
  `src/site.config.ts`. A `null` profile link or `cvPdf` simply omits that link or button.

Link fields differ by record type — these are the only accepted keys:

| Record | Link fields |
| --- | --- |
| Publication | `links:` map with `paper`, `preprint`, `code`, `slides`, `poster`; plus a bare `doi:` (a DOI is rendered as a link but does not make the title clickable) |
| Talk | `links:` map with `slides`, `video`, `event`, `abstract` |
| Award | a single top-level `url:` |
| Project | `links:` list of `{ label, url, kind }`, `kind` ∈ `code`, `demo`, `paper`, `docs`, `data`, `other`; optional `videos:` list with external HTTPS YouTube, Vimeo, or direct `.mp4` URLs |
| News item | `links:` list of `{ label, url }` |
| Experience, education | a single optional `url:` |

Talk `type` accepts `invited`, `conference`, `seminar`, `webinar`, `poster`, `workshop`, `panel`, `other`.
Publication `type` accepts `journal`, `conference`, `workshop`, `preprint`, `thesis`, `report`, `abstract`,
`other`. An optional top-level `abstract` field stores full abstract text for future use; the site does not
currently render that text.
- Typography: Geist Sans (text) and Geist Mono (labels, dates, navigation), self-hosted from the
  `@fontsource-variable/geist*` packages (SIL Open Font License). Only the Latin subsets are fetched, from
  the site's own origin; no external font requests are made.
- Colour theme: the site follows the browser's `prefers-color-scheme` by default. The sun/moon button in
  the header overrides it and stores the choice in `localStorage` (`theme`); choosing the theme the browser
  already uses clears the override. Logic in `src/lib/theme.ts`, wiring in `SiteHeader.astro`, and a
  pre-paint inline script in `BaseLayout.astro`.

### Add or edit a project

1. Copy `src/content/projects/_template/index.md` to `src/content/projects/<slug>/index.md`.
2. Fill the frontmatter (`title`, `summary`, `status`, `start_date`, `end_date`, `types`, `topics`, …). Set
   `featured: true` and a unique `home_order` to show it on the home page (about four projects fit).
   Set `published: false` to keep the project and its assets in the repository while hiding its cards,
   cross-links, and generated route; remove the field or set it to `true` to publish it again.
3. Write the case study body: Problem, System / Method, My Contribution, Technical Details, Results.
   Put every project image (thumbnail, hero, inline figure, or video poster) next to `index.md`; reference
   inline figures as `![alt](./figure.png)` and use `hero_image`/`hero_alt` for the header figure. Images are
   optimized at build time. Videos stay external: use the optional strict `videos` list with HTTPS
   YouTube, Vimeo, or direct `.mp4` URLs, required visible and accessible titles, and optional captions/posters.
   Direct MP4 records may set `autoplay: true` for muted, viewport-aware looping and `fit: cover` for a
   centered crop inside the 16:9 player; both options are rejected for hosted embeds.
4. Run `npm run build`; the page appears at `/projects/<slug>/` and in the Projects index and CV.

### How `/news/` is assembled

`/news/` is a **view**, not a collection to maintain by hand. `src/lib/content/activity.ts` builds one
reverse-chronological stream from the records that already exist:

| Source | Enters the stream | Date used |
| --- | --- | --- |
| Publications | Yes, unless `status: in-preparation` | `date`, else `year`+`month`, else `year` |
| Awards | Yes | `date` |
| Talks | Yes | `date` |
| Manual news items | Yes | `date` |
| Projects | **No** — write a manual news item for a milestone worth announcing | — |
| Education, experience | **No** — same; add a manual news item if you want one | — |

So a paper, award, or talk is written **once**, in its own collection, and its title, date, and links stay
consistent everywhere. Never copy such a record into `src/content/news/`.

An entry's **title becomes a link** when its record offers a destination — a publication's or talk's first
entry under `links` (tried in a fixed order: `paper`, `preprint`, `code`, `slides`, `poster` for papers;
`slides`, `video`, `event`, `abstract` for talks), an award's `url`, or a manual item's first link. A
publication with only a `doi` and no `links` keeps a plain-text title; its DOI is still listed beneath.

The home page "Latest" section shows the four newest stream entries; a manual news item with
`featured: false` is kept off it. A project page's "Activity" section lists only awards and manual news
related to that project, because its publications and talks already appear under Outputs.

### Add a news item (irregular events only)

1. Copy `src/content/news/_template.yaml` to `src/content/news/<YYYY-MM-DD>-<slug>.yaml`, for a software
   release, media coverage, a project or education milestone, or anything else that is not a publication,
   award, or talk.
2. Set `title`, `date` (`YYYY-MM-DD`, or `YYYY-MM` when only the month is known), `type`, an optional
   `summary`, and the ids of related projects, publications, talks, or awards. Unknown ids fail the build.
3. The item appears on `/news/` under its year and, unless `featured: false`, among the four newest items
   on the home page and on the related project pages.

### Update CV data

- Education, experience, talks, awards, and skills each have a folder with a `_template.yaml`.
  Experience `type` selects the CV section; `cv_order` pins a position, otherwise current roles sort first.
- Publications: one YAML file per paper, listed in full on `/publications/` and on the CV. `status` and
  `venue` must reflect the real state (`venue: null` until known). Set `featured: true` + `home_order` for
  the home page selection. Add `date` when the exact publication day is known; it positions the paper in
  the news stream.
- `researchInterests` in `src/site.config.ts` fills the one-line interests section; leave it `null` to omit.
- PDF CV: copy an approved public PDF to `public/cv/` and set `cvPdf: '/cv/<file>.pdf'` in
  `src/site.config.ts`. Never link files from `references/archive/`.

## Repository layout

```text
.github/workflows/deploy-pages.yml   build + deploy to GitHub Pages
docs/specs/                          the original implementation brief
docs/plans/                          the implementation plan and its deviation log
docs/handoff/                        current-state handoff for a new maintainer or agent
references/                          source documents and their tracked extractions
fixtures/content/                    synthetic records for layout checks (never real facts)
scripts/                             check-dist, brand-assets, with-fixtures (Node .mts)
src/site.config.ts                   verified site-wide facts and toggles
src/content.config.ts                collection definitions (loaders + schemas)
src/content/                         the published content (see above)
src/lib/content/                     schemas, validation, queries, formatting, the activity stream
src/lib/theme.ts                     light/dark toggle logic
src/components/ src/layouts/ src/pages/ src/styles/
tests/                               Vitest unit tests mirroring src/lib
```

`src/lib/content/` is where the model lives: `schemas.ts` (field shapes) → `validate.ts` (cross-record
rules) → `queries.ts` / `activity.ts` (selection and ordering) → `load.ts` (the single entry point pages
call). Components never read collections directly.

## Reference material

`references/` is the tracked knowledge base that grounds every fact on the site — see
[`references/README.md`](references/README.md).

- `references/archive/` holds raw source documents (CV exports, manuscripts, bios). **It is ignored by Git
  on purpose** (only `.gitkeep` is tracked) so unpublished documents never reach the public repository.
- `references/extracted/` holds tracked, structured extractions (Markdown with YAML frontmatter, one per
  source record, indexed in `extracted/index.md`) with provenance and ambiguity notes.
- Facts move `archive → extracted → src/content`. Extraction is not publication; nothing goes into
  `src/content/` without a supporting extraction, existing repository content, or an explicit instruction.

## Validating before publishing

```bash
npm run validate
```

This type-checks, runs the unit tests, builds the site (schema, cross-reference, and raw-date validation run
inside the build), and checks `dist/` for missing routes, broken internal links, missing canonical URLs, and
any repository-name path prefix. For visual checks, run `npm run dev:fixtures` to see every layout populated
with clearly synthetic fixture data at mobile and desktop widths.

If a build ever reports that a cached record's source file no longer exists, the content cache is stale:
`npm run build` already clears it, and `npm run dev -- --force` does the same for the dev server.
