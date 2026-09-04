---
id: user-supplied-2026-09
source_files: []
source_types:
  - direct
extraction_scope:
  - talks
  - publications
  - awards
extraction_method: >-
  Records typed directly into src/content/ by the site owner between 2026-09-03 and 2026-09-04, with no
  document in references/archive/ behind them. Captured here so every published fact has a provenance
  trail. Externally checkable values were verified where noted; the rest rest on the owner's own knowledge.
status: extracted
extracted_on: 2026-09-04
---

Legend as in [`cv-2026-09.md`](cv-2026-09.md): **explicit** = as supplied; **normalized** = reformatted to
the schema without changing meaning; **verified** = checked against an external source; **removed** = not
published, with the reason given.

# Talks

Neither talk appears in `cv-content-ref.docx`; both were supplied directly.

## `talks/ibpsa-usa-educational.yaml`

- Title "How Cities Can Plan the Energy Transition Using Urban Building Energy Models", event
  "IBPSA-USA Educational Webinar" (explicit).
- Date supplied as `Feb 2026`, **normalized** to `2026-02`.
- Type supplied as `Webinar`, **normalized** to `webinar`; the value did not exist in `TALK_TYPES` and was
  added to the schema rather than forcing the talk into a different category.
- Links: a recording under the key `watch:`, **normalized** to `video:` — `watch` is not an accepted key
  and was being silently discarded before schemas were made strict. An `event:` link was added later.

## `talks/ibpsa-usa-simulation-showcase.yaml`

- Title "Urban Decarbonization Strategies", event "IBPSA USA Simulation Showcase Webinar Series 2026"
  (explicit). Date supplied as `Jan 2026`, **normalized** to `2026-01`. Type normalized as above.
- `links.event` supplied later.

# Publications

## `publications/understanding-urban-building-energy-consumption-2025.yaml`

Not in the CV document. The record first arrived carrying the DOI (`10.1080/19401493.2025.2536261`), paper
URL, and volume/page note of `bottom-up-ubem-electrification-jbps-2025.yaml`, plus a duplicate `home_order`.

- A Crossref search for the title returned no match, so those three fields were **removed** rather than
  published pointing at a different paper, and the record was flagged for review.
- The site owner then supplied the correct values: venue "CAAD Futures 2025", DOI `10.25442/hku.29349755`,
  author order `Hang Xu, Chengxuan Li, Patrick Kastner, Timur Dogan`, `featured: false`.
- Build-time validation now rejects a DOI used by two publications, so this class of copy cannot recur.

## Other publications

- `paper` links for the SimBuild 2026 and Building Simulation 2025 papers (publications.ibpsa.org) were
  supplied directly (explicit).
- ShadingZip: co-author name completed to "Zihan Jimmy Wang" and `month` added (explicit). Still `accepted`,
  with no DOI or link.
- Publication dates for three papers were **verified** through the Crossref REST API on 2026-09-03; see
  [`cv-2026-09.md`](cv-2026-09.md).

# Awards

The six awards come from the CV document ([`cv-2026-09.md`](cv-2026-09.md)). The site owner later supplied,
directly:

- `url` for the Bentley Systems, IBPSA-USA Simulation Showcase, Nemetschek, and NYSP2I Competition awards.
- Holcim: date corrected from `2025-11` to `2025-10` and the description "Full sponsorship for the One Young
  World Summit 2025" added.
- NYSP2I Research Grant: description extended to "$4,000 research grant, Co-PI with Prof. Timur Dogan".
- Nemetschek: the awarding organization is recorded as "Nemetschek", inferred from the award name; the
  supplied URL points at TUM's Nemetschek Innovation Award announcement.

# Extraction notes

- Two award records briefly lost their `organization` field (one to the typo `organizaton`), which broke the
  build once strict key checking was in place; both were repaired from the previous committed version.
- Nothing here supersedes `cv-2026-09.md`; where both describe the same record, the direct supply is newer.
