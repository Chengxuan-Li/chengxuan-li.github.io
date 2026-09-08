import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { csvParse } from 'd3-dsv';
import { createHash } from 'node:crypto';
import katex from 'katex';
import tradeoff from '../public/data/shadingzip/tradeoff.json';
import baseline from '../public/data/shadingzip/baseline.json';
import rose from '../public/data/shadingzip/rose.json';
import matrix from '../public/data/shadingzip/matrix.json';
import provenance from '../public/data/shadingzip/provenance.json';
import { cases, selection, reconstruction, wmape } from '../src/lib/paper/shadingzip';
import { renderChart, defaults, tableRows } from '../src/lib/paper/charts';
import { findFragmentIssues } from '../src/lib/paper/references';

describe('ShadingZip paper data fidelity',()=>{
  it('preserves original source hashes and exact cap-300 curve values',()=>{
    for(const [file,sha] of Object.entries(provenance.sources)) expect(createHash('sha256').update(readFileSync(`references/shadingzip/plot_data/${file}`)).digest('hex')).toBe(sha);
    const source=csvParse(readFileSync('references/shadingzip/plot_data/cap300_tradeoff_points.csv','utf8'));
    expect(tradeoff).toHaveLength(245);expect(baseline).toHaveLength(55);
    const selected=tradeoff.filter(p=>p.selected);expect(selected).toHaveLength(5);
    expect((100*selected.reduce((s,p)=>s+p.cost,0)/5).toFixed(1)).toBe('32.6');
    expect(new Set(tradeoff.map(p=>`${p.latitude}:${p.id}`)).size).toBe(245);
    for(const row of source){const p=tradeoff.find(p=>p.latitude===Number(row.latitude)&&p.id===row.cell_hash)!;expect(p.cost).toBe(Number(row.cost_ratio_mean));expect(p.error).toBe(Number(row.wmape));expect(p.error).toBeCloseTo(p.numerator/p.denominator,13);}
    for(const lat of [0,15,30,45,60]){expect(tradeoff.filter(p=>p.latitude===lat)).toHaveLength(49);expect(baseline.filter(p=>p.latitude===lat)).toHaveLength(11);}
  });
  it('preserves counts, proportions, band boundaries and non-lit band from the supplied rose',()=>{
    expect(rose).toHaveLength(720);
    const source=csvParse(readFileSync('references/shadingzip/plot_data/cap300_rose_bars.csv','utf8')).filter(r=>r.method==='F1 m=3 r=20%'&&r.metric==='surface_sensor_wmape');
    rose.forEach((r,i)=>{expect(r.count).toBe(Number(source[i].count));expect(r.bottom).toBe(Number(source[i].bottom));expect(r.proportion).toBe(Number(source[i].proportion));});
    for(const lat of [0,15,30,45,60]) for(let dir=0;dir<360;dir+=15){
      const bins=rose.filter(r=>r.latitude===lat&&r.direction===dir);expect(bins).toHaveLength(6);
      expect(bins.reduce((a,r)=>a+r.count,0)).toBe(bins[0].total);
      expect(bins.reduce((a,r)=>a+r.proportion,0)).toBeCloseTo(bins[0].total?1:0,13);
      for(const r of bins) if(r.total)expect(r.proportion).toBeCloseTo(r.count/r.total,13);
    }
    expect(rose.some(r=>r.band===5&&r.count>0)).toBe(true);
  });
  it('reproduces paper matrix margins and its reported 49/50 result',()=>{
    const core=matrix.filter(c=>c.row<5&&c.column<10);expect(core).toHaveLength(50);expect(matrix).toHaveLength(66);
    expect(core.filter(c=>c.error<.05)).toHaveLength(49);
    expect(Math.max(...core.map(c=>c.error))).toBeCloseTo(.05518599071903305,14);
    expect(matrix.find(c=>c.row===5&&c.column===10)!.error).toBeCloseTo(.025649139580836776,14);
    for(let row=0;row<5;row++)expect(matrix.find(c=>c.row===row&&c.column===10)!.error).toBeCloseTo(core.filter(c=>c.row===row).reduce((sum,c)=>sum+c.error,0)/10,13);
    for(let col=0;col<10;col++)expect(matrix.find(c=>c.row===5&&c.column===col)!.error).toBeCloseTo(core.filter(c=>c.column===col).reduce((sum,c)=>sum+c.error,0)/5,13);
  });
  it('preserves the selected geometry counts in Table 4',()=>{
    expect(cases.reduce((sum,r)=>sum+Number(r[3]),0)).toBe(65949);
    expect(cases.reduce((sum,r)=>sum+Number(r[4]),0)).toBe(2691);
    expect(cases.reduce((sum,r)=>sum+Number(r[5]),0)).toBe(1157088);
  });
  it('renders every algorithm line and Equation 1 without unsupported math',()=>{
    for(const tex of [...selection,...reconstruction].map(r=>r.tex).concat(wmape))expect(()=>katex.renderToString(tex,{throwOnError:true})).not.toThrow();
  });
  it('filters actual data without changing the retained values or rose normalization',()=>{
    const opts={...defaults(),latitude:'30',families:['SF'],baseline:false};
    const table=tableRows('tradeoff',{tradeoff,baseline},opts);expect(table.rows).toHaveLength(21);
    expect(table.rows.every(r=>r[0]===30&&r[1]==='SF')).toBe(true);
    expect(renderChart('tradeoff',{tradeoff,baseline},opts)).not.toContain('data-info="0°');
    expect(tableRows('rose',{rose},{...defaults(),band:'5'}).rows).toEqual(tableRows('rose',{rose}).rows);
    for(const kind of ['tradeoff','rose','matrix'] as const)expect(renderChart(kind,{tradeoff,baseline,rose,matrix})).not.toMatch(/NaN|Infinity/);
  });
});
describe('paper cross-references',()=>{
  it('checks missing and duplicate targets, including escaped fragments',()=>{
    expect(findFragmentIssues('<h2 id="eq-1"></h2><a href="#eq-1">1</a>')).toEqual([]);
    expect(findFragmentIssues('<h2 id="a"></h2><p id="a"></p><a href="#missing">x</a>')).toEqual(['duplicate id a','missing fragment #missing']);
    expect(findFragmentIssues('<div id="x y"></div><a href="#x%20y">x</a>')).toEqual([]);
  });
});
