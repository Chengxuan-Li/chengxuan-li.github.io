/** Export the paper-aligned drawing data, with identities and full numeric precision preserved. */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { csvParse, csvFormat } from 'd3-dsv';

const root = path.resolve('references/shadingzip/plot_data');
const output = path.resolve('public/data/shadingzip');
await mkdir(output, { recursive: true });
const sources: Record<string, string> = {};
async function read(name: string) {
  const source = await readFile(path.join(root, name), 'utf8');
  sources[name] = createHash('sha256').update(source).digest('hex');
  return csvParse(source);
}
const numeric = (row: Record<string, string>, key: string) => {
  const n = Number(row[key]);
  if (!row[key] || !Number.isFinite(n)) throw new Error(`Invalid ${key}: ${row[key]}`);
  return n;
};
const color = (r: Record<string, string>) => `rgb(${['red','green','blue'].map(k => Math.round(numeric(r,k)*255)).join(',')})`;
const tradeoff = (await read('cap300_tradeoff_points.csv')).map(r => ({
  latitude: numeric(r,'latitude'), id: r.cell_hash, family: r.family, m: numeric(r,'n_exploratory_periods'),
  ratio: numeric(r,'ratio'), cost: numeric(r,'cost_ratio_mean'), error: numeric(r,'wmape'),
  numerator: numeric(r,'error_numerator'), denominator: numeric(r,'true_signal'), color: r.color,
  selected: r.selected === 'True',
}));
const baselineRows = await read('extended_random_baseline_points.csv');
const baseline = baselineRows.map(r => ({
  latitude: numeric(r,'latitude'), cost: numeric(r,'actual_cost_ratio_mean'), error: numeric(r,'wmape_mean'),
  low: numeric(r,'wmape_ci95_low'), high: numeric(r,'wmape_ci95_high'),
}));
const rose = (await read('cap300_rose_bars.csv'))
  .filter(r => r.method === 'F1 m=3 r=20%' && r.metric === 'surface_sensor_wmape')
  .map(r => ({ latitude: numeric(r,'latitude'), direction: numeric(r,'center_deg'),
    band: numeric(r,'error_band'), label: r.band_label, count: numeric(r,'count'), total: numeric(r,'bin_total'),
    proportion: numeric(r,'proportion'), bottom: numeric(r,'bottom'), color: color(r) }));
const matrix = (await read('cap300_heatmap_cells.csv')).map(r => ({
  row: numeric(r,'row'), column: numeric(r,'column'), latitude: r.row_label, name: r.column_label,
  caseId: r.case_id, error: numeric(r,'wmape'), label: r.annotation, color: color(r),
  textColor: r.text_color, maximum: r.highlight_max === 'True',
}));
const palette = (await read('Spectral_r_rgba.csv')).map(color);
await writeFile(path.join(output, 'palette.json'), JSON.stringify(palette) + '\n');
if (tradeoff.length !== 245 || baseline.length !== 55 || rose.length !== 720 || matrix.length !== 66) {
  throw new Error(`Unexpected plot cardinality: ${[tradeoff.length,baseline.length,rose.length,matrix.length]}`);
}
for (const [name, data] of Object.entries({tradeoff, baseline, rose, matrix})) {
  await writeFile(path.join(output, `${name}.json`), JSON.stringify(data) + '\n');
  await writeFile(path.join(output, `${name}.csv`), csvFormat(data as any[]) + '\n');
}
await writeFile(path.join(output, 'provenance.json'), JSON.stringify({
  experiment: 'cap300', manuscript: '0815Submission_ShadingZip_SelectiveComputation (2).pdf',
  sourceCommit: 'e73a3bfb38ebe06ee44d28452105c9229cf539db', sources,
  semantics: 'Selective curves pool sensor-wise absolute error; random baseline scores building-total profiles. Matrix margins are arithmetic means. Rose bins count facade surfaces equally.',
}, null, 2) + '\n');
console.log('ShadingZip: exported 245 curve points, 55 baseline points, 720 rose bars, 66 matrix cells.');
