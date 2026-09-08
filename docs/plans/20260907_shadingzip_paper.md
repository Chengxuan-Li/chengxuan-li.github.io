# ShadingZip interactive paper

Approved 7 September 2026. Reproduce the supplied five-page manuscript at
`/projects/shading-zip/`, with Chinese project metadata and English paper fallback.

- Preserve all prose, four figures, four tables (including Algorithms 1–2), Equation 1,
  and five references. Use the existing workflow.png for Figure 1.
- Reproduce cap-300, never silently substitute the later cap-400 experiment.
- Add MDX support and an optional paper layout; retain all existing project behavior.
- Use build-rendered KaTeX HTML/MathML, semantic algorithms/tables, D3 SVG figures,
  local dependencies, stable references, accessible controls, and print fallbacks.
- Interactions: method/latitude inspection, series highlighting, exact values, reset,
  data tables, CSV/SVG/PNG downloads, enlarged figures, citation previews/backlinks.
- Validate source numbers, row identities, bins, means and scoring semantics; inspect
  mobile/desktop, light/dark, keyboard, no-JavaScript and print behavior.

Design: existing Geist text and theme tokens (light #f7f6f2, ink #17191c, accent
#0e5a70; dark #121416, ink #e6e3dc, accent #7cc4d6). Reading column approximately
70 characters, left contents rail, wider figure panels. Chart palettes preserve the
manuscript. Navigation and numbering express document structure, not decoration.

No commits, deployment, attribution additions, destructive Git actions, or Superpowers.
