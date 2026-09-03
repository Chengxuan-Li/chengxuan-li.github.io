# References

This directory is the tracked knowledge base that grounds every fact published on the site.
Nothing in it is served by the website.

## Layout

| Path | Tracked? | Purpose |
| --- | --- | --- |
| `archive/` | **No** (git-ignored, only `.gitkeep` is tracked) | Raw source documents: CV exports (`.pdf`, `.docx`), manuscripts, bios, award letters, project write-ups, slides. Drop files here as-is. |
| `extracted/` | Yes | Structured, machine-readable extractions of the archive: one Markdown file with YAML frontmatter per source record, plus `index.md`. |

`archive/` is ignored so that unpublished documents never reach the public repository. Do not weaken the
`.gitignore` rule without deciding deliberately that a document may become public.

## Extraction workflow (for maintainers and coding agents)

1. Place the new or updated source file(s) in `archive/`.
2. Extract the content with a document-aware tool (PDF/DOCX text extraction, not screenshots or guesses).
3. Write or update one record in `extracted/` named `<topic>-<YYYY-MM>.md` (for example `cv-2026-09.md`,
   `bio-2026-09.md`, `project-energyatlas-2026-09.md`). Use this frontmatter:

   ```md
   ---
   id: cv-2026-09
   source_files:
     - Chengxuan_Li_CV_2026.pdf
   source_types:
     - pdf
   extraction_scope:
     - education
     - experience
     - publications
   status: extracted        # extracted | reviewed | superseded
   extracted_on: 2026-09-03
   ---
   ```

   The body holds the extracted facts grouped by heading (Education, Experience, Publications, …). Mark each
   fact as **explicit** (verbatim in the source) or **inferred/normalized** (for example a date converted to
   `YYYY-MM`). End with an `# Extraction notes` section listing ambiguities, conflicts between sources, and
   anything left unresolved.
4. Add the record to `extracted/index.md`.
5. Promote reviewed facts into `src/content/` (see the root `README.md`). Wording may be tightened for the web;
   meaning may not change. Facts may exist in `extracted/` without appearing on the site.

## Rules

- Never publish a fact that is not supported by an extraction, existing repository content, or an explicit
  instruction from the site owner.
- When two sources conflict, record the conflict in the extraction notes, prefer the newer clearly authoritative
  source only when that authority is evident, and otherwise leave the value out of `src/content/` until resolved.
- Never import, copy, or link files from `archive/` as web assets. Public files (for example an approved CV PDF)
  are copied deliberately into `public/`.
