import { csvFormatRows } from 'd3-dsv';
import { defaults, renderChart, dataTable, tableRows, type ChartData, type ChartKind } from './charts';
import { attachChartInspection } from './chart-inspection';
import { createFigureDialog } from './figure-dialog';

function save(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
for(const figure of document.querySelectorAll<HTMLElement>('[data-chart]')){
  const kind=figure.dataset.chart as ChartKind;
  const data=JSON.parse(figure.querySelector('[data-chart-data]')!.textContent!) as ChartData;
  const canvas=figure.querySelector<HTMLElement>('.chart-canvas')!;
  const status=figure.querySelector<HTMLElement>('[data-chart-status]')!;
  const tooltip=figure.querySelector<HTMLElement>('.chart-tooltip')!;
  let options=defaults();
  const announce=(text:string)=>{status.textContent=text;};
  const inspection=attachChartInspection(canvas,tooltip,announce);
  const draw=()=>{inspection.hide();canvas.innerHTML=renderChart(kind,data,options);figure.querySelector('.table-scroll')!.innerHTML=dataTable(kind,data,options);inspection.arm();announce('View updated. Hover, tap, or focus a mark to inspect its values.');};
  figure.querySelector('.chart-controls')!.addEventListener('change',()=>{
    options.latitude=figure.querySelector<HTMLSelectElement>('[data-latitude]')!.value;
    options.families=Array.from(figure.querySelectorAll<HTMLInputElement>('[data-family]:checked')).map(el=>el.value);
    options.baseline=figure.querySelector<HTMLInputElement>('[data-baseline]')?.checked??true;
    options.band=figure.querySelector<HTMLSelectElement>('[data-band]')?.value??'all';
    options.caseId=figure.querySelector<HTMLSelectElement>('[data-case]')?.value??'all';draw();
  });
  figure.querySelector('[data-reset]')!.addEventListener('click',()=>{
    options=defaults();figure.querySelectorAll('select').forEach(el=>el.value='all');figure.querySelectorAll<HTMLInputElement>('input[type=checkbox]').forEach(el=>el.checked=true);draw();
  });
  figure.querySelector('[data-expand]')!.addEventListener('click',()=>{
    inspection.hide();
    const dialog=createFigureDialog();
    const scroll=document.createElement('div');scroll.className='expanded-chart';
    scroll.innerHTML=canvas.innerHTML;
    const expandedTooltip=document.createElement('div');expandedTooltip.className='chart-tooltip paper-tooltip';expandedTooltip.id=`${figure.id}-expanded-tooltip`;expandedTooltip.role='tooltip';expandedTooltip.hidden=true;
    const expandedStatus=document.createElement('p');expandedStatus.className='visually-hidden';expandedStatus.setAttribute('role','status');
    dialog.append(scroll,expandedTooltip,expandedStatus);
    const expandedInspection=attachChartInspection(scroll,expandedTooltip,text=>{expandedStatus.textContent=text;});
    dialog.addEventListener('close',()=>expandedInspection.destroy());dialog.showModal();
  });
  figure.querySelectorAll<HTMLElement>('[data-export]').forEach(button=>button.addEventListener('click',async()=>{
    const format=button.dataset.export,stem=`shadingzip-${kind}`;
    try{
      if(format==='csv'){const {headers,rows}=tableRows(kind,data,options);save(new Blob([csvFormatRows([headers, ...rows.map(r=>r.map(String))])],{type:'text/csv;charset=utf-8'}),`${stem}.csv`);}
      else{
        const original=canvas.querySelector('svg')!;
        const source=original.cloneNode(true) as SVGSVGElement;
        source.querySelectorAll('.is-active').forEach(mark=>mark.classList.remove('is-active'));
        source.querySelectorAll('[aria-describedby]').forEach(mark=>mark.removeAttribute('aria-describedby'));
        for(const token of ['--chart-ink','--chart-axis','--chart-grid','--chart-surface','--chart-focus'])source.style.setProperty(token,getComputedStyle(original).getPropertyValue(token));
        const blob=new Blob([new XMLSerializer().serializeToString(source)],{type:'image/svg+xml;charset=utf-8'});
        if(format==='svg')save(blob,`${stem}.svg`);
        else{
          const url=URL.createObjectURL(blob);
          try{const img=new Image();img.src=url;await img.decode();const c=document.createElement('canvas');c.width=source.viewBox.baseVal.width*2;c.height=source.viewBox.baseVal.height*2;c.getContext('2d')!.drawImage(img,0,0,c.width,c.height);
            const png=await new Promise<Blob>((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(new Error('PNG encoding failed')),'image/png'));save(png,`${stem}.png`);
          }finally{URL.revokeObjectURL(url);}
        }
      }
      announce(`${format?.toUpperCase()} download prepared.`);
    }catch{announce('The download could not be prepared. You can use the original CSV links or print the paper.');}
  }));
  // Print the manuscript configuration even after interactive exploration.
  window.addEventListener('beforeprint',()=>{inspection.hide();canvas.innerHTML=renderChart(kind,data);});
  window.addEventListener('afterprint',()=>{canvas.innerHTML=renderChart(kind,data,options);inspection.arm();});
  figure.dataset.ready='';
}
