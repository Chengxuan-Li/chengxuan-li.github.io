# CV content handoff — Chengxuan Li

**Date:** 2026-09-04

**Purpose:** Generate or tailor CVs, résumés, bios, and application materials from the public factual content in this repository.

## Start here

Use this repository as a factual source, not as permission to embellish. Re-read the current files before every
assignment because the owner updates them frequently. Ask for the target role, audience, requested length, and output
format before deciding what to emphasize.

The current structured records are more authoritative than older narrative extractions. Preserve exact names,
dates, authorship order, publication status, venues, award wording, URLs, and quantitative claims. You may condense,
reorder, and tailor supported material, but never invent an accomplishment, metric, responsibility, credential,
method, affiliation, or outcome. If a useful fact is missing or ambiguous, omit it and identify the gap.

## Source precedence

Use sources in this order:

1. The owner's latest explicit instruction for the current assignment.
2. Current public records in `src/site.config.ts` and the non-template files under `src/content/`.
3. `references/extracted/cv-2026-09.md` and `references/extracted/user-supplied-2026-09.md` for provenance and
   additional context that does not conflict with current records.
4. The public website only as a rendered check. Its pages are derived from the structured records above.

Do not use:

- `fixtures/content/`; every record there is synthetic.
- `src/content/projects/placeholder-grid-flexibility/` or
  `src/content/projects/placeholder-ubem-fidelity/`; both explicitly contain placeholder material.
- Files under `references/archive/`; they are private source documents and are intentionally excluded from the
  repository.
- A plausible value inferred from a neighboring record, filename, convention, or external profile.

## Current content map

This is a routing guide, not a replacement for reading the records.

| Material | Authoritative files | How to use it |
| --- | --- | --- |
| Public identity, positioning, website, email, GitHub, LinkedIn | `src/site.config.ts` | Use only non-null values. The public role is “PhD Researcher”; the bios and education record establish current PhD-candidate status. |
| Biography options | `src/content/bios/*.yaml` except `_template.yaml` | Four owner-supplied lengths are available. Adapt them to the requested context without adding facts. |
| Education | `src/content/education/*.yaml` except `_template.yaml` | Three records: current Cornell PhD and two Architectural Association degrees. Preserve degree names and dates exactly. |
| Research and professional experience | `src/content/experiences/*.yaml` except `_template.yaml` | Four records covering Cornell research, Grid Innovations, EnergyAtlas.io, and Urban Systems Design MEP Engineers. Use summaries and bullets as the supported responsibility pool. |
| Technical skills | `src/content/skills/*.yaml` except `_template.yaml` | Eight ordered categories. Select skills relevant to the target rather than treating every item as required. |
| Publications and submitted abstracts | `src/content/publications/*.yaml` except `_template.yaml` | Nine records. Preserve authorship order, title, type, status, venue, date, DOI, links, and notes exactly as recorded. |
| Presentations | `src/content/talks/*.yaml` except `_template.yaml` | Three records with exact event, date, type, location when known, and available links. |
| Awards and funding | `src/content/awards/*.yaml` except `_template.yaml` | Six records. Preserve the recorded organization, placement, role, amount, date, and qualification. |
| Public media coverage | `src/content/news/*.yaml` except `_template.yaml` | Three external articles related to EnergyAtlas.io. Treat them as media coverage, not awards or authored publications. |
| Published project detail | `src/content/projects/energyatlas/index.md` | Supporting detail for the EnergyAtlas.io role. Keep claims consistent with the experience record. |
| Unpublished project detail | `src/content/projects/inverse-calibration/index.md` | The content is not currently published. Default to the corresponding Cornell experience and publication records; use this project record only when the owner explicitly requests it. |

Snapshot on 2026-09-04: 4 bios, 3 education records, 4 experience records, 8 skill groups, 9 publication
records, 3 presentations, 6 awards/funding records, and 3 media-coverage records. Recount from disk rather than
assuming these numbers remain current.

## Publication-status rules

The publication collection currently contains:

- Four records marked `published`.
- One conference paper, ShadingZip, marked `accepted`; its record currently has no DOI or public link.
- Four records with `type: abstract` and `status: submitted`; their venue is intentionally unknown and their private
  abstract links are intentionally absent.

Do not collapse these categories. Never describe submitted abstracts as accepted, forthcoming, presented, or
published. Never supply a venue, DOI, URL, issue, page range, or presentation status unless it appears in the current
record or the owner explicitly provides it. For an academic CV, place the four submitted records in a clearly labeled
section such as “Submitted abstracts,” separate from published and accepted work.

When formatting citations:

- Preserve author order and highlight Chengxuan Li only as a formatting choice.
- Prefer the bare DOI and official paper URL already recorded; do not search for or guess missing identifiers unless
  the owner asks for verification.
- Preserve notes that distinguish online publication from later print issue information.
- Do not infer project relationships from shared terminology; most `project_ids` remain intentionally unset.

## Tailoring guidance

Default to a research-oriented academic CV unless the assignment specifies another purpose. For research scientist,
PhD internship, engineering, or software roles, reorder and condense rather than rewriting the factual record:

- Academic/research: foreground education, research appointments, publications by status, presentations, awards and
  funding, then selected technical skills.
- Energy and power systems: emphasize Grid Innovations, smart-meter/AMI/SCADA analysis, distribution-system modeling,
  demand response, electrification, DER integration, and relevant publications.
- Machine learning/scientific computing: emphasize inverse modeling, physics-informed or physics-supervised learning,
  surrogate learning, system identification, time-series analysis, uncertainty analysis, and model calibration.
- Software/geospatial: emphasize EnergyAtlas.io, C#/.NET, Python, API and simulation-engine architecture, data
  pipelines, geospatial processing, LiDAR, solar and shading analysis, SQL, and DuckDB.

Keep ongoing roles in present tense and completed roles in past tense. A concise résumé may merge overlapping bullets,
but it must not merge distinct appointments in a way that changes their dates, organizations, or scope. Do not convert
research plans or abstract methods into completed results. Do not recast dataset sizes, award amounts, software
performance statements, or media coverage as personal impact metrics; use a recorded quantity only in its supported
context.

## Known gaps: ask or omit

The current public records do not establish:

- A completed PhD, dissertation title, expected graduation date, GPA, or formal committee designation.
- A phone number, street address, ORCID, or Google Scholar URL.
- A public CV PDF.
- Citation counts, journal impact factors, h-index, or other bibliometrics.
- Teaching, mentoring, service, professional-membership, language, or reference sections.
- A venue or public link for the four submitted abstracts.
- A DOI or public paper link for ShadingZip.
- Project associations for most publications, awards, and talks.

Do not fill these gaps from inference. Ask the owner when the target document requires one of them.

## Delivery checklist

Before delivering a generated CV or résumé:

1. Re-read every source record used; do not rely on this handoff's snapshot counts.
2. Confirm all dates, current/past tense, degree status, publication categories, author order, awards, URLs, and amounts.
3. Check that every claim can be traced to a current record, an extracted reference, or the owner's instruction.
4. Remove unsupported superlatives, impact claims, metrics, and technologies.
5. Identify omitted information or unresolved choices for the owner instead of guessing.
6. State which source files informed the draft so later updates are easy to audit.

## Short instruction for a new CV-writing task

> Read `docs/handoff/20260904_cv_content_handoff.md` first. Use the current files it identifies as the factual source
> for generating or tailoring Chengxuan Li's CV, résumé, bio, or application materials. Re-read those files before
> drafting, consult `references/extracted/` only where the handoff directs you, and ask or omit rather than infer any
> missing fact.
