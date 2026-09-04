# chengxuan-li.github.io

Source of the personal research and engineering site published at <https://chengxuan-li.github.io/>.
The site is a static [Astro](https://astro.build) build: one structured content model rendered as four views —
Home (curated synthesis), Projects (technical case studies), CV (complete record), and News (activity stream).

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

One-time repository setting: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
The site is a *user* site, so it is served from the domain root; never configure a `base` path.

After a deployment, check `https://chengxuan-li.github.io/`, `/projects/`, `/cv/`, `/news/`, and one
`/projects/<slug>/` directly by URL.

## Content model

All published facts live in `src/content/` and are validated at build time (schemas in
`src/lib/content/schemas.ts`, cross-reference rules in `src/lib/content/validate.ts`, a raw-source date check in
`src/lib/content/rawdates.ts`). A broken reference, malformed or impossible date, invalid URL, or duplicate
ordering value fails the build with a message naming the record.

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

- The file or folder name is the record's id: lowercase words joined by single hyphens.
- Every collection folder holds a `_template.*` file (or `_template/` folder) documenting every field.
  Files and folders starting with `_` are ignored by the build.
- Relationships are declared one way: publications, news items, talks, awards, and experiences list the
  `project_ids` they belong to; projects list `related_project_ids`. Reverse lookups (a project's papers,
  talks, activity) are generated.
- Site-wide facts (name, role, affiliation, profile links, CV PDF path, meta description) live in
  `src/site.config.ts`. A `null` profile link or `cvPdf` simply omits that link or button.
- Colour theme: the site follows the browser's `prefers-color-scheme` by default. The sun/moon button in
  the header overrides it and stores the choice in `localStorage` (`theme`); choosing the theme the browser
  already uses clears the override. Logic in `src/lib/theme.ts`, wiring in `SiteHeader.astro`, and a
  pre-paint inline script in `BaseLayout.astro`.

### Add or edit a project

1. Copy `src/content/projects/_template/index.md` to `src/content/projects/<slug>/index.md`.
2. Fill the frontmatter (`title`, `summary`, `status`, `start_date`, `end_date`, `types`, `topics`, …). Set
   `featured: true` and a unique `home_order` to show it on the home page (about four projects fit).
3. Write the case study body: Problem, System / Method, My Contribution, Technical Details, Results.
   Put figures next to `index.md` and reference them as `![alt](./figure.png)`; add `hero_image`/`hero_alt`
   for the header figure. Images are optimized at build time.
4. Run `npm run build`; the page appears at `/projects/<slug>/` and in the Projects index and CV.

### Add a news item

1. Copy `src/content/news/_template.yaml` to `src/content/news/<YYYY-MM-DD>-<slug>.yaml`.
2. Set `title`, `date` (`YYYY-MM-DD`, or `YYYY-MM` when only the month is known), `type`, an optional
   `summary`, and the ids of related projects, publications, talks, or awards. Unknown ids fail the build.
3. The item appears on `/news/` under its year and, unless `featured: false`, among the four newest items
   on the home page and on the related project pages.

### Update CV data

- Education, experience, talks, awards, and skills each have a folder with a `_template.yaml`.
  Experience `type` selects the CV section; `cv_order` pins a position, otherwise current roles sort first.
- Publications: one YAML file per paper. `status` and `venue` must reflect the real state (`venue: null`
  until known). Set `featured: true` + `home_order` for the home page selection.
- `researchInterests` in `src/site.config.ts` fills the one-line interests section; leave it `null` to omit.
- PDF CV: copy an approved public PDF to `public/cv/` and set `cvPdf: '/cv/<file>.pdf'` in
  `src/site.config.ts`. Never link files from `references/archive/`.

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
