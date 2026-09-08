# Selective-computing figure and data handoff

Prepared 7 September 2026; revised to reference the supplied paper after relocation to `C:/github/shadingzip-exports/plot-handoff-2026-09-07`. This is a standalone specification for redrawing saved experimental results in any language or plotting library. No repository access, simulation, model fitting, or access to the paper's implementation is required. Read the bundled paper for the scientific method and this guide for the exact saved-data reductions and drawing rules.

## Reference paper and relationship to this handoff

**Li, Chengxuan; Wang, Zihan Jimmy; and Dogan, Timur. _ShadingZip: Within-Building Selective Computation of Shading Profiles for Urban Building Energy Models_. Supplied manuscript, 5 pages.** Environmental Systems Lab, College of Architecture, Art and Planning, Cornell University. [Read the bundled PDF](0815Submission_ShadingZip_SelectiveComputation%20%282%29.pdf). The PDF metadata records creation on 15 August 2026; no publication venue, DOI, or explicit publication date is shown in the manuscript. Cite this supplied version without inferring publication status from its filename.

Page references below use the PDF's one-based page order. Figure, table and equation numbers refer to the paper, not this guide.

| Paper reference | What it establishes | Corresponding handoff material |
|---|---|---|
| Methodology, Figure 1 and Table 1, p. 2 | Within-building selective computation; MF/SF/MF+SF; exploratory periods and representative-ratio sweep | Guide §3; saved cell identities and sample manifests |
| Table 2 / Algorithm 1, p. 2 | K-means, real-sensor representatives, unique representative selection and nearest-representative assignment | Method context for the saved experimental results; no clustering needs to be rerun to redraw figures |
| Table 3 / Algorithm 2, p. 3 | Retain own exploratory observations; copy representatives for other periods | Guide §4, hybrid reconstruction and cost definition |
| Equation (1), p. 3 | Weighted sensor-wise absolute error; sensor area, period length, solar altitude and normal-direction factor; unlit-sensor exclusion | Guide §4; `error_numerator`, `true_signal`, `surface_sensor_wmape` |
| Evaluation description and Table 4, p. 3 | Deterministic 10% sample capped at 300 buildings per case; 2,691 selected buildings, 1,157,088 sensors, ten cases and five latitudes | **`archive/cap300` is the paper-aligned study.** Table 4 sensor counts describe the selected case geometries, not the full 98.6-million-row upstream bundle |
| Figure 2, Results, p. 4 | Five-latitude cost–accuracy comparison with extended random baseline visible in the plotted panel | `archive/cap300/combined/aggregate-lit-sensor-wmape.parquet` plus `archive/baseline_extended/combined/all-case-summary-extended.parquet`; guide §7 |
| Figure 3, Results, p. 4 | Standalone facade-orientation roses for SF, m=3, r=0.20 | Paper-aligned cap-300 `surface-diagnostics.parquet`, metric `surface_sensor_wmape`; guide §5 |
| Figure 4, Results, p. 4 | Case–latitude WMAPE matrix for the same operating point | Paper-aligned cap-300 `case-lit-sensor-wmape.parquet`; guide §6 |
| Discussion, p. 5 | Random downsampling estimates aggregate building profiles, while ShadingZip retains sensor and surface outputs | Guide §7, “Random baseline semantics,” including the exact saved scoring distinction |

**For paper reproduction, use cap-300 for all three plotted results.** The original handoff request also asked for the latest standalone artifacts, so the newer cap-400 rose/matrix generation is retained and identified in §1. Those are a different sample and must not be labeled as the paper's Figures 3 and 4. The combined rose + matrix is a separate presentation of the Figure 3/4 concepts, using cap-300 with only 0°, 30°, 60° rose panels; it is not a separately numbered figure in the supplied paper. Embedded paper figures have some different typography/tick formatting from the archived standalone exports; use the PDF as the visual reference when matching the manuscript's exact presentation.

The paper reports 32.6% relative ray-tracing cost and 2.6% mean WMAPE for SF, m=3, r=0.20, with 49 of 50 case–latitude combinations below 5% (Results, p. 4). These are rounded manuscript summaries, not replacement coordinates for plotting. In the cap-300 matrix the unweighted mean of the 50 cells is 0.025649139580836776; guide §6 explains that display mean separately from the signal-pooled curve values. Equation (1) calls the temporal factor period length; the saved scoring normalizes day counts by their annual sum. That common normalization cancels in WMAPE, but it matters when comparing saved numerator/denominator magnitudes. Where the paper summarizes aggregation in prose, use guide §4 and §7 for the precise operation order implemented in the archived data.


## 1. Which versions are included?

“Latest” means the most recently modified existing artifact of each requested type in the repository's results directories, as found at export. It does not mean every figure uses the same experiment. Timestamps in `source_manifest.csv` are UTC and retain the source provenance. Temporary test folders were excluded from the artifact selection; some were inaccessible. The search covered repository plot outputs, not arbitrary folders elsewhere on the computer.

The source prefix is `C:/github/ShadingZip/outputs/selective/`. Package paths below are relative to this document. Each figure stem has PNG, PDF and SVG versions. SVGs also provide exact original paths, typography, colors and positions when pixel-level styling matters.

| Requested item | Latest source under the source prefix | Date, local source time | Matching raw analysis data in package |
|---|---|---|---|
| Standalone wind rose, SF m=3 r=20%, WMAPE | `all-cases-10pct-cap400-sequential-20260812/orientation-backfill/combined/facade-orientation-error-rose-f1-m-3-r-20-wmape.*` | 12 Aug 2026, 22:43 | `archive/cap400/orientation-backfill/combined/surface-diagnostics.parquet` |
| Error grid matrix | `all-cases-10pct-cap400-sequential-20260812/combined/case-latitude-wmape-heatmap-sf-m3-r20.*` | 12 Aug 2026, 22:43 | `archive/cap400/combined/case-lit-sensor-wmape.parquet` |
| Cost–accuracy tradeoff, extended random baseline | `random-sensor-baseline-direct-costs-25repeats-cap300-20260813/combined/pareto-all-latitudes-wmape-with-extended-random-baseline.*` | 13 Aug 2026, 11:33 | `archive/cap300/combined/aggregate-lit-sensor-wmape.parquet` AND `archive/baseline_extended/combined/all-case-summary-extended.parquet` |
| Combined wind rose + error grid | `all-cases-10pct-cap300-sequential-20260810/combined/facade-orientation-and-case-latitude-wmape-sf-m3-r20.*` | 15 Aug 2026, 11:59 | `archive/cap300/orientation-backfill/combined/surface-diagnostics.parquet` AND `archive/cap300/combined/case-lit-sensor-wmape.parquet` |

The standalone rose is a family of four operating points, not a unique file: F2 m=0 r=5%, F3 m=1 r=10%, F1 m=3 r=20%, and F1 m=3 r=35%. The last written member is F1 m=3 r=35% WMAPE. All four are included, with both WMAPE (`-wmape`) and weighted WAPE (no suffix) variants. The 20% member is emphasized above because it matches the operating point of the matrix/composite. Cap-300 companion roses, matrix and baseline-free tradeoffs are included too. Do not substitute cap-400 components into the existing cap-300 composite and call it the same figure.

Run aliases, full source names and source Git revision are in `provenance.json`. `archive/cap300` and `archive/cap400` preserve the complete respective run folders. `archive/baseline_matched` preserves the earlier 25-repeat baseline at costs matched to SF m=3; `archive/baseline_extended` adds direct random fractions of 1%, 2%, 5%, 10%. The extended summary already joins the two baseline ranges: do not concatenate either range onto it again.

## 2. Package layout and portability

- `archive/`: byte-identical originals, all plots, Parquet tables, checkpoints, sample manifests, run status, logs and ancillary results from these four runs. Unrelated ancillary plots in these full archives are not part of the four requested plot specifications.
- `csv/`: UTF-8, comma-delimited, gzip-compressed CSV counterparts of combined analysis tables, combined surface diagnostics and baseline per-building repeat results. Decompress with any gzip reader. First row is column names. Booleans are `True`/`False`; empty fields mean missing; arrays such as `periods` are JSON arrays in a quoted CSV field; numeric fractions are not percentages. Floating-point values use 17 significant digits. No row-index column is added.
- `plot_data/`: small, uncompressed CSV tables with final bars, matrix cells, curve points, annotations and colors. These are convenient drawing inputs and independent checks against reductions from the raw analysis tables.
- `source_manifest.csv`: every copied original's absolute source path, relative package path, original UTC modification time, byte size and SHA-256 hash. Copies were hash-compared with their sources.
- `data_dictionary.json`: exact CSV row counts, column types and null counts; the conceptual meaning of relevant fields is below.
- `validation.json`: numerical checks and expected matrix range/order/counts.
- `source_reference/`: optional original implementation snapshots for audit. They are not needed to interpret this guide or redraw from CSV.
- `build_package.py`: export provenance; depends on the original repository paths and is not a portable regeneration program.
- `redraw_from_csv.py`: standalone drawing example using only packaged CSV data and ordinary plotting dependencies; run from any working directory.

“Raw analysis data” here means the saved experimental measurements and sufficient statistics underlying the figures, before plotting bins and formatting. Building checkpoints and surface rows are preserved. The upstream simulation ground truth is at `C:/shadingzip-data/portable-raw/portable-raw`: 98,596,285 sensors over 10 cases × 5 latitudes. That entire bundle is not duplicated in this handoff. It is unnecessary for figure regeneration and is necessary only to repeat the underlying experimental evaluation. This package does not claim to reproduce simulation or clustering from scratch. No simulations were rerun.

## 3. Experimental identities and field meanings

There are ten New York urban cases evaluated at latitudes 0, 15, 30, 45 and 60 degrees. Cap names describe maximum sampled buildings per case, not sensor counts. The study targets a 10% building sample with a cap; cap-400 extends the retained cap-300 sample. Exact selected IDs, counts, selection seeds and sampling history are in each `archive/cap*/cases/<case_id>/sample-manifest.json`. Do not assume every case reaches its cap. All-case results pool these sampled buildings, not all 98.6 million sensors.

F1 means shading features (SF); F2 metadata features (MF); F3 metadata plus shading (MF+SF). `n_exploratory_periods` is m. `ratio` is requested representative fraction r, not actual total raytracing cost. `scope=S2` means representatives are selected within buildings; `algorithm=kmeans` identifies the saved clustering method. `cell_hash` identifies a complete experimental cell; preserve it when grouping. `method` is the literal string such as `F1 m=3 r=20%`.

Active tradeoff families are MF with m=0 and SF/MF+SF with m=1,2,3. For each, r is one of 0.01,0.02,0.05,0.10,0.20,0.35,0.50: 49 cells per latitude. Exploratory periods are zero-based: [] for m=0; [9] for m=1; [0,9] for m=2; [0,4,9] for m=3. The saved study has P=19 periods × 24 hours. For other input datasets derive P from profile length/24; never assume 19 universally. A full-exploration m=P hybrid cell is degenerate and is not a scientific tradeoff point.

`case_id` is the urban case. `scenario_id` is, for example, `lat30`; `latitude` is degrees. `building` is a composite tile key and within-tile building ID. Prefix it with case for global joins. `surface` is the true surface group within the building, not a sensor-unique surface ID. `is_roof` selects roofs versus facades. `azimuth_deg` is clockwise from north; only facade azimuth is used in these roses. Roof normals can be nearly vertical and roof azimuth is not suitable for this grouping. `n_sensors` is the number of sensors; `n_representatives` is actual K. `periods` is the exploration list. `segment=all` includes roofs and facades in matrix/tradeoff scores.

The surface table has one row per (case, latitude, method, building, surface). `surface_signal` is the weighted true signal summed over sensors and times. `surface_error_numerator` sums absolute errors AFTER sensors are combined by time within the surface. `surface_wape` is that numerator / surface_signal. `surface_sensor_error_numerator` sums absolute errors BEFORE combining sensors, excluding sensors with entirely zero original sunlit profiles. `surface_sensor_wmape` is that numerator / surface_signal. With zero signal, the ratio is missing, not zero.

For `building-lit-sensor-wmape`, `case-lit-sensor-wmape` and `aggregate-lit-sensor-wmape`, `error_numerator` and `true_signal` are additive sufficient statistics for lit-sensor errors; `wmape=error_numerator/true_signal`. A row labeled `level=building` in these specially named tables retains sensor-wise absolute errors; it is not the metric obtained by aggregating sensors before taking absolute values. Unsuffixed `aggregate-results` and `case-results` contain the latter WAPE metric by level and are not interchangeable.

## 4. Exact scoring and aggregation

Let f(i,p,h) be true sunlit fraction and fhat the saved hybrid reconstruction. A hybrid preserves each sensor's own exploratory periods and copies its representative on hidden periods. The geometric weight is max(0,sin solar altitude) × max(0,normal dot solar direction). Multiply by sensor area in square metres and the period's fraction of annual days to obtain q(i,p,h). For this study, periods 0–17 cover 20 days each and period 18 covers 5; divide day counts by 365. No weather, DNI, irradiance, SVF or HVF enters this weight. Profiles are period-major: flat index=24p+h, sunlit fractions on the k/6 grid.

Define T=qf and H=qfhat. A lit sensor has sum(f)>0 over its whole true profile; this is the implementation's exact test, not a mean-sunlit threshold or weighted-signal threshold. Its error contribution is sum over p,h of abs(H−T). For a building, E is the sum of these contributions over lit sensors, D=sum(T) over lit sensors. Buildings with D=0 are removed from the special lit-sensor tables. WMAPE=E/D. Ratios are dimensionless, plotted as percentages; numerator and denominator carry identical area-weighted units and are not energy measurements.

To obtain a case row, group building rows by case, latitude and full cell identity, sum E and D, then divide. Case cost is the unweighted arithmetic mean of retained building `cost_ratio`. To obtain an all-case curve point, sum case E and D then divide; cost is the arithmetic mean of case costs. Thus the plotted cost is not the globally sensor-weighted cost. Do not average WMAPEs or weight the existing costs by sensor count when recreating the saved figure.

Per-building hybrid cost is m/P+(K/N)(1−m/P), with all 24 hours explored in the saved study. r can differ from actual K/N because of integer rounding and a representative per scope. The theoretical vertical line is m/19, not the first measured cost. Use the saved measured costs for plotting.

For legacy surface WAPE, the numerator instead is sum over time of abs(sum over surface sensors of H−T); sensor error cancellation is allowed. For surface WMAPE it is sum over lit sensors and time of abs(H−T). Both share the surface signal denominator. Keep the suffix and error label aligned.

## 5. Standalone orientation roses

Use cap-400 surface diagnostics for the newest standalone figures, or cap-300 for the composite's exact components. Filter to the requested literal `method`, five latitudes, and `is_roof=False`. Reject duplicate identity rows. Do not area-weight, signal-weight, or building-weight the counts: each facade surface is one vote, pooled across cases.

For every row compute b=floor(((azimuth_deg+7.5) modulo 360)/15). There are 24 bins, centered at b×15 degrees; north wraps across 352.5–7.5 degrees. Classify finite errors into [0,.05), [.05,.10), [.10,.15), [.15,.20), [.20,infinity). Exact thresholds go into the higher band. All nonfinite errors, including NaN and infinity, enter band 5, labeled `not lit`. This label describes the expected zero-signal case; it is not an instruction to silently discard arbitrary invalid records.

For each latitude and orientation bin count all six bands; divide each count by the total in that same orientation bin. Empty bins have six zero heights. Stack from lowest error at the center to `not lit` at the outer edge. Each nonempty direction therefore reaches 100%. Radius represents a proportion, not wind speed or frequency of surfaces in the overall population. These are facade-orientation error roses, despite the informal “wind rose” name.

Draw centered polar bars of width 15 degrees, theta=0 at north, clockwise increasing, white edges 0.35 pt. Radial limits [0,1], percent ticks, compass ticks N/NE/E/SE/S/SW/W/NW at 45-degree steps; grid opacity .3. The five panels run left to right 0°,15°,30°,45°,60°. Nominal canvas is 8 × 2.8 inches with automatic constrained layout. Title: `Facade surface lit-sensor WMAPE by orientation — SF, m=3, r=20%` for the selected method. Legacy WAPE replaces the metric text. Legend below in band order, title `surface lit-sensor WMAPE`.

Colors are RdYlGn_r sampled at [.05,.275,.5,.725,.95], then gray RGBA(.55,.55,.55,1). Exact RGBA is included per bar in `<cap>_rose_bars.csv`. The bar table includes `count`, `bin_total`, `proportion`, `bottom`, center angle and metric: height=proportion, inner radius=bottom. For screen coordinates with downward y, a vertex at radius r and azimuth theta is (cx+r sin(theta), cy−r cos(theta)). Draw annular sectors between bottom and bottom+height. Do not interpret the proportions as sector area fractions.

## 6. Error grid matrix

Read the case WMAPE table; keep F1, m=3, r≈.20 (tolerance equivalent to abs(r−.20) ≤ 1e−8+1e−5×.20), S2, segment all, level building. Require one row per case/latitude and all ten cases × five latitudes. It should select exactly 50 rows.

Pivot to case rows and latitude columns. Sort cases ascending by their unweighted arithmetic mean WMAPE over the five latitudes. Then transpose: displayed rows are 0,15,30,45,60 degrees and displayed columns are the ordered ten cases. Append a rightmost column averaging across cases at each latitude, labeled `Latitude mean`. Append a bottom row averaging across latitudes for each case, labeled `Case mean`. Bottom-right is the arithmetic mean of the 50 core cells. These display margins are unweighted means of ratios, unlike the pooled all-case curve. Do not take the all-case curve point as a heatmap margin.

`<cap>_heatmap_cells.csv` supplies all 66 displayed cells in exact row/column positions, case labels, fraction values, annotations, text colors, RGBA and maximum-cell flag. `validation.json` supplies core min, overall mean, max and case order.

Color is reversed Spectral with a piecewise linear normalization centered on the unweighted mean c of the 50 core cells: u=.5(v−min)/(c−min) for v≤c; u=.5+.5(v−c)/(max−c) otherwise. Only the 50 core cells determine min/center/max. Use the supplied 256-entry Spectral_r table (index=min(floor(256u),255), clipped to [0,255]) or directly use each cell's RGBA. If min=center=max in another dataset, use a linear scale padded on each side by max(abs(min)×1e−6,1e−12).

Annotate 100v to one decimal place with percent sign. Exact labels are exported to avoid rounding-library differences. Luminance=.2126R+.7152G+.0722B; text is white below .48, black otherwise. Outline the largest CORE cell in #2166AC at 2.2 pt. If tied, choose the first in row-major display order. Draw white 2.2-pt separators before the final row and column. Row zero is at the top. Case labels appear above, rotated 35 degrees, left aligned; top axis title `Urban case / morphology`; left label `Latitude`. Colorbar label `Building-aggregated\nlit-sensor WMAPE`, formatted as percent.

Standalone nominal size is 8 × 2.8 inches. Equal x/y data units are scaled with image aspect .4 (a cell is .4 times as high as wide). Colorbar fraction .025 of parent width, pad .055, shrink .48. Title `SF, m=3, r=20% across cases and latitudes`. Automatic layout and tight export determine final image bounding box.

## 7. Cost–accuracy tradeoff

Latest plot uses cap-300 aggregate lit-sensor results plus the extended baseline summary. Baseline-free cap-400 and cap-300 figures also exist in the archives. `<cap>_tradeoff_points.csv` provides selected active positive finite points and styling; `extended_random_baseline_points.csv` provides 55 baseline points (11 per latitude).

Use five side-by-side panels ordered 0,15,30,45,60 degrees, shared log x and log y. In each latitude keep segment all, level building, scope S2; active features are F2 with m=0 or F1/F3 with m>0. Exclude nonfinite or nonpositive x/y; do not invent positive epsilon points for zero error. Group lines by m, feature family, scope and algorithm, then sort within each group by `cost_ratio_mean`, not r. X=cost_ratio_mean; Y=wmape. There is no Pareto-front selection: all active curve points are connected.

Colors for m=0,1,2,3 are #4C78A8, #F58518, #54A24B, #B279A2. MF/SF use solid lines and hollow circles; MF+SF uses dashed lines and hollow squares. Width .9 pt, marker size 3.2 pt; colored strokes and markers. Legend labels `m=0, MF`, `m=1, SF`, etc. Draw dotted vertical lines at 1/19,2/19,3/19 with corresponding colors, width 1 pt, opacity .85. Mark SF m=3 r=.20 with a purple star (area 62 pt²) and dark .65-pt edge, above the line.

Overlay baseline sorted by `actual_cost_ratio_mean`: x=that field, y=wmape_mean, dark gray RGB(.12,.12,.12), dashed, filled diamond markers 3 pt, line 1.2 pt. The saved combined overlay does NOT draw the confidence interval band, although confidence limits are in the input and affect the upper y limit. The separate random-baseline-only plots in the archive do show confidence intervals and are distinct artifacts.

Set shared x limits to [min(.01,min_positive_x/1.1),max(.50,max_x×1.1)]. Include theoretical-floor x positions when determining this extent. Set shared y limits to [min_positive_curve_y/1.1,max(.30,1.1×max_baseline_ci95_high)]. For exact compatibility with the original, the extent scan also sees the dotted floor artists' y coordinates 0 and 1; include positive 1 in the y-min candidate list. Without baseline, use .30 as upper y limit. X major ticks at .01,.05,.10,.50, but label only the first three (1%,5%,10%). Y ticks are logarithmic decades formatted as percent. Both major/minor grid opacity .25. Do not convert x or y to percent before applying limits stated as fractions.

Nominal canvas 8 × 3.7 inches. Margins left .095,right .995,top .86,bottom .39; horizontal panel spacing .06. Shared x label `Relative raytracing cost` at normalized y=.255, shared y label `Building-aggregated\nlit-sensor WMAPE` at x=.018. Title `Cost–accuracy tradeoff with random baseline under different latitudes` at y=.975. Legend centered below, four columns at (.5,.035), no frame. Include method families, theoretical-minimum labels, selected-point label and random-downsampling label.

### Random baseline semantics

This is a building-total profile estimator. Within each building and repeat, select uniform sensor prefixes from one seeded random permutation, K=ceil(target fraction×N), bounded [1,N]. Estimate its weighted total profile by (N/K) times the sum of sampled weighted profiles. Building error numerator is sum over time of abs(estimated building total−true building total); denominator is total true signal. This allows sensor cancellation within the building, whereas the selective curves use lit-sensor absolute errors before building aggregation. The comparison is preserved exactly as saved; the shared WMAPE label does not erase that scoring difference.

Per repeat, pool E,D and sampled/total counts across cases and buildings. Error=pooled E/pooled D; actual cost=pooled sampled count/pooled N. Across 25 repeats take arithmetic means of errors and actual costs. Sample standard deviation uses n−1. 95% limits are mean ± t(.975,24)×SD/sqrt(25). These are confidence intervals for the repeat mean, not 95% prediction intervals or case dispersion. `ratio` in the matched-cost baseline identifies the SF representative ratio used to obtain the target; it is not itself the sampling fraction. `target_cost_ratio_mean`, `actual_cost_ratio_mean`, and `cost_basis` disambiguate these. The direct fraction baseline supplies four additional points per latitude; the matched study supplies seven. Use the saved repeats to reproduce the summaries without re-running random selection.

## 8. Combined rose + matrix

Use CAP-300, F1 m=3 r=20%, surface_sensor_wmape. Show only the rose panels 0°,30°,60° but use all five latitudes in the heatmap. All binning, counting, normalization, case ordering and annotations are unchanged. Nominal canvas 16 × 4.6 inches, one row with column-width ratios 1:1:1:2; first three axes polar and last rectangular. Heatmap image aspect is .6 here. Suppress separate component supertitles. Shared title `Facade orientation and case–latitude lit-sensor WMAPE — SF, m=3, r=20%`. Rose legend anchor (.3,.02) in figure coordinates, below the roses. Require all ten cases. Colorbar follows the matrix specification.

## 9. Typography, validation and acceptance

Original exports use PNG at 300 dpi plus PDF and SVG, tight bounding box. Nominal canvas dimensions are therefore not necessarily PNG dimensions/300. Font is the plotting environment's sans-serif default; archived SVG paths preserve original glyph outlines. Shared font sizes: title 12 pt regular; panel titles and axis labels 9.5 pt; ticks 8 pt; legends 7.5 pt. Rose compass/radial labels have a white 3-pt halo of opacity .92 above bars. No legend frames.

For cross-language validation, first match numbers and plot structure, then typography. Compare fractions at relative tolerance 1e−12 with absolute tolerance 1e−14; counts and identity keys must match exactly. Verify 24 directions × six bands × five latitudes per standalone method/metric; occupied bin sums=1; exact bin-edge behavior; 50 core and 16 mean cells; 49 curve points per latitude; 11 extended baseline points per latitude. Verify ratios from sufficient statistics, not from rounded figure annotations. Check color normalization uses the core arithmetic mean, cost uses actual values, the composite uses cap-300 and nonfinite rose values remain visible.

The standalone CSV redraw script exercises all four requested figure types without importing repository code. It is an implementation example; the language-neutral specifications above and exported numeric tables are the regeneration contract. Visual alignment and font metrics may differ across packages while all scientific content remains identical. The original PNG/PDF/SVG files are the visual reference, and the manifest is the provenance reference.
