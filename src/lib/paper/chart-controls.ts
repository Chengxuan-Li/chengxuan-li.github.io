import { csvFormatRows } from 'd3-dsv';
import { defaults, renderChart, dataTable, tableRows, type ChartData, type ChartKind } from './charts';

function save(blob:Blob,name:string){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);}
for(const figure of document.querySelectorAll<HTMLElement>('[data-chart]')){
  const kind=figure.dataset.chart as ChartKind;
  const data=JSON.parse(figure.querySelector('[data-chart-data]')!.textContent!) as ChartData;
  const canvas=figure.querySelector<HTMLElement>('.chart-canvas')!;
  const readout=figure.querySelector<HTMLElement>('.chart-readout')!;
  let options=defaults();
  const announce=(text:string)=>{readout.textContent=text;};
  const arm=()=>{const first=canvas.querySelector('[data-point]');first?.setAttribute('tabindex','0');};
  const draw=()=>{canvas.innerHTML=renderChart(kind,data,options);figure.querySelector('.table-scroll')!.innerHTML=dataTable(kind,data,options);arm();announce('View updated. Hover, tap, or focus a mark to inspect its values.');};
  const describe=(event:Event)=>{const target=(event.target as Element).closest('[data-point]');if(target)announce(target.getAttribute('data-info')!);};
  canvas.addEventListener('pointerover',describe);canvas.addEventListener('click',describe);canvas.addEventListener('focusin',describe);
  canvas.addEventListener('keydown',(event)=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const marks=Array.from(canvas.querySelectorAll<SVGElement>('[data-point]'));
    const current=marks.indexOf(event.target as SVGElement);if(current<0)return;
    event.preventDefault();const delta=['ArrowLeft','ArrowUp'].includes(event.key)?-1:1;
    const next=event.key==='Home'?0:event.key==='End'?marks.length-1:(current+delta+marks.length)%marks.length;
    marks[current].setAttribute('tabindex','-1');marks[next].setAttribute('tabindex','0');marks[next].focus();
  });
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
    const dialog=document.createElement('dialog');dialog.className='paper-figure-dialog';
    const close=document.createElement('button');close.textContent='Close expanded figure';
    const scroll=document.createElement('div');scroll.className='expanded-chart';
    scroll.innerHTML=canvas.innerHTML;scroll.querySelectorAll('[data-point]').forEach(el=>el.removeAttribute('tabindex'));
    dialog.append(close,scroll);document.body.append(dialog);close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
  });
  figure.querySelectorAll<HTMLElement>('[data-export]').forEach(button=>button.addEventListener('click',async()=>{
    const format=button.dataset.export,stem=`shadingzip-${kind}`;
    try{
      if(format==='csv'){const {headers,rows}=tableRows(kind,data,options);save(new Blob([csvFormatRows([headers, ...rows.map(r=>r.map(String))])],{type:'text/csv;charset=utf-8'}),`${stem}.csv`);}
      else{
        const source=canvas.querySelector('svg')!;
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
  window.addEventListener('beforeprint',()=>{canvas.innerHTML=renderChart(kind,data);});
  window.addEventListener('afterprint',()=>{canvas.innerHTML=renderChart(kind,data,options);arm();});
  arm();figure.dataset.ready='';
}
