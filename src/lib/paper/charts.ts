import { scaleLog } from 'd3-scale';
import { arc, line, symbol, symbolStar } from 'd3-shape';

export interface TradePoint { latitude: number; id: string; family: string; m: number; ratio: number; cost: number; error: number; numerator: number; denominator: number; color: string; selected: boolean }
export interface BaselinePoint { latitude: number; cost: number; error: number; low: number; high: number }
export interface RoseBar { latitude: number; direction: number; band: number; label: string; count: number; total: number; proportion: number; bottom: number; color: string }
export interface MatrixCell { row: number; column: number; latitude: string; name: string; caseId: string; error: number; label: string; color: string; textColor: string; maximum: boolean }
export type ChartKind = 'tradeoff' | 'rose' | 'matrix';
export interface ChartData { tradeoff?: TradePoint[]; baseline?: BaselinePoint[]; rose?: RoseBar[]; matrix?: MatrixCell[]; palette?: string[] }
export interface ChartOptions { latitude: string; families: string[]; baseline: boolean; band: string; caseId: string }
export const defaults = (): ChartOptions => ({latitude:'all',families:['MF','SF','MF+SF'],baseline:true,band:'all',caseId:'all'});
export const escape = (s: unknown) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const percent = (n: number, digits=2) => `${(100*n).toFixed(digits)}%`;
const text = (x:number,y:number,s:string,extra='') => `<text x="${x}" y="${y}" ${extra}>${escape(s)}</text>`;
const mark = (info:string) => `data-point tabindex="-1" role="img" aria-label="${escape(info)}" data-info="${escape(info)}"`;
function svg(width:number,height:number,body:string,label:string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="group" aria-label="${escape(label)}"><style>text{font:12px Arial,sans-serif;fill:#24282d} [data-point]:focus{outline:none;stroke:#005fcc;stroke-width:3px} .axis{stroke:#8d949b;stroke-width:1} .grid{stroke:#d9dde1;stroke-width:.65} .panel-label{font-weight:700;font-size:15px}</style><rect width="100%" height="100%" fill="white"/>${body}</svg>`;
}
export function tradeoffChart(points:TradePoint[], baseline:BaselinePoint[], opts:ChartOptions):string {
  const lats=opts.latitude==='all'?[0,15,30,45,60]:[Number(opts.latitude)];
  const pw=lats.length===1?540:246, width=pw*lats.length+60, height=430;
  const ymin=Math.min(...points.map(p=>p.error))/1.1;
  const ymax=Math.max(.3,...baseline.map(p=>p.high*1.1));
  const xmax=Math.max(.5,...points.map(p=>p.cost*1.1),...baseline.map(p=>p.cost*1.1));
  const x=scaleLog().domain([.009,xmax]).range([0,pw-30]);
  const y=scaleLog().domain([ymin,ymax]).range([266,0]);
  let body=text(width/2,408,'Relative ray-tracing cost (log scale)','text-anchor="middle"');
  body+=text(17,184,'Building-aggregated lit-sensor WMAPE','text-anchor="middle" transform="rotate(-90 17 184)"');
  for (const [i,lat] of lats.entries()) {
    const left=60+i*pw,top=44;
    body+=`<g transform="translate(${left},${top})">`+text((pw-30)/2,-17,`${lat}° latitude`,'text-anchor="middle" class="panel-label"');
    for (const v of [.001,.01,.1,1].filter(v=>v>=ymin&&v<=ymax)) body+=`<path class="grid" d="M0 ${y(v)}H${pw-30}"/>`+(i===0?text(-8,y(v)+4,percent(v, v<.01?1:0),'text-anchor="end"'):'');
    for (const v of [.01,.05,.1,.5].filter(v=>v<=xmax)) body+=`<path class="grid" d="M${x(v)} 0V266"/>`+text(x(v),288,percent(v,0),'text-anchor="middle"');
    body+=`<path class="axis" fill="none" d="M0 0V266H${pw-30}"/>`;
    for (const [j,c] of ['#F58518','#54A24B','#B279A2'].entries()) body+=`<path d="M${x((j+1)/19)} 0V266" stroke="${c}" stroke-dasharray="2 4" opacity=".65"/>`;
    const rows=points.filter(p=>p.latitude===lat&&opts.families.includes(p.family));
    const keys=[...new Set(rows.map(p=>`${p.family}:${p.m}`))];
    for(const key of keys){
      const series=rows.filter(p=>`${p.family}:${p.m}`===key).sort((a,b)=>a.cost-b.cost);
      const first=series[0];
      const path=line<TradePoint>().x(p=>x(p.cost)).y(p=>y(p.error))(series);
      body+=`<path d="${path}" fill="none" stroke="${first.color}" stroke-width="1.5" ${first.family==='MF+SF'?'stroke-dasharray="5 3"':''}/>`;
      for(const p of series){
        const info=`${lat}° · ${p.family}, m=${p.m}, r=${percent(p.ratio,0)} · cost ${percent(p.cost,4)} · WMAPE ${percent(p.error,4)}`;
        const attrs=mark(info);
        if(p.selected) body+=`<path d="${symbol(symbolStar).size(135)()}" transform="translate(${x(p.cost)},${y(p.error)})" fill="${p.color}" stroke="#332146" ${attrs}><title>${escape(info)}</title></path>`;
        else if(p.family==='MF+SF') body+=`<rect x="${x(p.cost)-3}" y="${y(p.error)-3}" width="6" height="6" fill="white" stroke="${p.color}" ${attrs}><title>${escape(info)}</title></rect>`;
        else body+=`<circle cx="${x(p.cost)}" cy="${y(p.error)}" r="3.2" fill="white" stroke="${p.color}" ${attrs}><title>${escape(info)}</title></circle>`;
      }
    }
    if(opts.baseline){
      const series=baseline.filter(p=>p.latitude===lat).sort((a,b)=>a.cost-b.cost);
      body+=`<path d="${line<BaselinePoint>().x(p=>x(p.cost)).y(p=>y(p.error))(series)}" fill="none" stroke="#303030" stroke-width="1.6" stroke-dasharray="6 4"/>`;
      for(const p of series){const info=`${lat}° · random baseline · actual cost ${percent(p.cost,4)} · WMAPE ${percent(p.error,4)} · 95% CI of repeat mean ${percent(p.low,4)}–${percent(p.high,4)} (25 repeats)`;
        body+=`<path d="M0 -4L4 0L0 4L-4 0Z" transform="translate(${x(p.cost)},${y(p.error)})" fill="#303030" ${mark(info)}><title>${escape(info)}</title></path>`;
      }
    }
    body+='</g>';
  }
  const legend=[['#4C78A8','m=0 · MF'],['#F58518','m=1'],['#54A24B','m=2'],['#B279A2','m=3']];
  for(const [i,[c,label]] of legend.entries())body+=`<circle cx="${60+i*115}" cy="355" r="4" fill="${c}"/>`+text(70+i*115,359,label);
  body+=text(60,382,'○ MF / SF     □ MF+SF     ★ SF, m=3, r=20%     ◆ Random baseline');
  return svg(width,height,body,'Figure 2. Cost–accuracy tradeoff by latitude.');
}
export function roseChart(rows:RoseBar[],opts:ChartOptions):string {
  const lats=opts.latitude==='all'?[0,15,30,45,60]:[Number(opts.latitude)], pw=240, width=pw*lats.length,height=358;
  let body='';
  for(const [i,lat] of lats.entries()){
    const cx=i*pw+120,cy=149,R=88;
    body+=text(cx,23,`${lat}° latitude`,'text-anchor="middle" class="panel-label"');
    for(const row of rows.filter(r=>r.latitude===lat)){
      if(!row.proportion)continue;
      const angle=row.direction*Math.PI/180,half=13.5/2*Math.PI/180;
      const path=arc()({innerRadius:row.bottom*R,outerRadius:(row.bottom+row.proportion)*R,startAngle:angle-half,endAngle:angle+half});
      const info=`${lat}° · ${row.direction}° from north · ${row.label} · ${row.count} / ${row.total} facade surfaces (${percent(row.proportion,2)})`;
      body+=`<path transform="translate(${cx},${cy})" d="${path}" fill="${row.color}" opacity="${opts.band==='all'||Number(opts.band)===row.band?1:.15}" stroke="white" stroke-width=".45" ${mark(info)}><title>${escape(info)}</title></path>`;
    }
    for(const f of [.25,.5,.75,1])body+=`<circle cx="${cx}" cy="${cy}" r="${R*f}" fill="none" stroke="#65707c" stroke-opacity=".35"/>`+text(cx+3,cy-R*f+4,`${f*100}%`,'style="font-size:9px;paint-order:stroke;stroke:white;stroke-width:3px;stroke-linejoin:round"');
    for(const [j,dir] of ['N','NE','E','SE','S','SW','W','NW'].entries()){
      const a=j*Math.PI/4;
      body+=text(cx+(R+17)*Math.sin(a),cy-(R+17)*Math.cos(a)+4,dir,'text-anchor="middle"');
    }
  }
  const bands=rows.filter(r=>r.latitude===0&&r.direction===0);
  for(const [i,b] of bands.entries()){
    const col=i%3,row=Math.floor(i/3), start=width===240?10:(width-570)/2, gap=width===240?77:190;
    body+=`<rect x="${start+col*gap}" y="${287+row*25}" width="12" height="12" fill="${b.color}"/>`+text(start+col*gap+17,298+row*25,b.label);
  }
  return svg(width,height,body,'Figure 3. Facade error proportions by orientation, SF, m=3, r=20%.');
}
export function matrixChart(cells:MatrixCell[],opts:ChartOptions,palette?:string[]):string {
  const cw=91,ch=49,left=99,top=124,width=1150,height=493;
  let body=text(565,23,'Urban case / morphology','text-anchor="middle" class="panel-label"');
  for(const cell of cells){
    const x=left+cell.column*cw,y=top+cell.row*ch;
    const highlight=(opts.latitude==='all'||cell.latitude===opts.latitude||cell.row===5)&&(opts.caseId==='all'||cell.caseId===opts.caseId||cell.column===10);
    const info=`${cell.latitude}${cell.row<5?'° latitude':''} · ${cell.name} · WMAPE ${percent(cell.error,6)}${cell.row===5||cell.column===10?' · arithmetic display mean':''}`;
    body+=`<g opacity="${highlight?1:.2}" ${mark(info)}><title>${escape(info)}</title><rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="${cell.color}" stroke="${cell.maximum?'#2166AC':'white'}" stroke-width="${cell.maximum?3:1}"/>${text(x+cw/2,y+ch/2+5,cell.label,`text-anchor="middle" style="fill:${cell.textColor};font-size:15px"`)}</g>`;
    if(cell.row===0)body+=text(x+10,top-14,cell.name,`transform="rotate(-35 ${x+10} ${top-14})"`);
    if(cell.column===0)body+=text(left-10,y+ch/2+4,`${cell.latitude}${cell.row<5?'°':''}`,'text-anchor="end"');
  }
  body+=`<path d="M${left+10*cw} ${top}V${top+6*ch}M${left} ${top+5*ch}H${left+11*cw}" stroke="white" stroke-width="4"/>`;
  body+=text(565,449,'Building-aggregated lit-sensor WMAPE · SF, m=3, r=20%','text-anchor="middle"');
  const core=cells.filter(c=>c.row<5&&c.column<10).sort((a,b)=>a.error-b.error);
  const colors=palette??[core[0].color,cells.find(c=>c.row===5&&c.column===10)!.color,core.at(-1)!.color];
  for(const [i,c]of colors.entries())body+=`<rect x="${395+i*350/colors.length}" y="464" width="${350/colors.length+.1}" height="10" fill="${c}"/>`;
  body+=text(570,488,cells.find(c=>c.row===5&&c.column===10)!.label,'text-anchor="middle"');
  body+=text(380,475,core[0].label,'text-anchor="end"')+text(760,475,core.at(-1)!.label);
  return svg(width,height,body,'Figure 4. Case–latitude error matrix with arithmetic means.');
}
export function renderChart(kind:ChartKind,data:ChartData,opts=defaults()):string {
  return kind==='tradeoff'?tradeoffChart(data.tradeoff!,data.baseline!,opts):kind==='rose'?roseChart(data.rose!,opts):matrixChart(data.matrix!,opts,data.palette);
}
export function tableRows(kind:ChartKind,data:ChartData,opts=defaults()): {headers:string[]; rows:(string|number)[][]} {
  const lat=(n:number)=>opts.latitude==='all'||n===Number(opts.latitude);
  if(kind==='tradeoff') return {headers:['Latitude (°)','Method','Exploratory periods','Representative ratio','Actual relative cost','WMAPE','95% CI lower','95% CI upper'],rows:[
    ...data.tradeoff!.filter(p=>lat(p.latitude)&&opts.families.includes(p.family)).map(p=>[p.latitude,p.family,p.m,p.ratio,p.cost,p.error,'','']),
    ...(opts.baseline?data.baseline!.filter(p=>lat(p.latitude)).map(p=>[p.latitude,'Random baseline','','',p.cost,p.error,p.low,p.high]):[])]};
  if(kind==='rose')return {headers:['Latitude (°)','Direction (°)','Error band','Surface count','Bin total','Proportion'],rows:data.rose!.filter(r=>lat(r.latitude)).map(r=>[r.latitude,r.direction,r.label,r.count,r.total,r.proportion])};
  return {headers:['Latitude / mean','Case / mean','WMAPE'],rows:data.matrix!.map(c=>[c.latitude,c.name,c.error])};
}
export function dataTable(kind:ChartKind,data:ChartData,opts=defaults()):string {
  const {headers,rows}=tableRows(kind,data,opts);
  return `<table><caption>Figure data. Ratios are fractions; multiply by 100 for percentages.</caption><thead><tr>${headers.map(h=>`<th scope="col">${escape(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${escape(v)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
