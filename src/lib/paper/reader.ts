import { csvFormatRows } from 'd3-dsv';
const paper=document.querySelector<HTMLElement>('.paper-reader');
if(paper){
  paper.dataset.ready='';
  const status=paper.querySelector<HTMLElement>('.paper-status')!;
  paper.querySelector('[data-print]')?.addEventListener('click',()=>window.print());
  paper.querySelector('[data-copy-citation]')?.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(paper.querySelector('.bibtex')!.textContent!);status.textContent='BibTeX copied.';}catch{status.textContent='Select and copy the BibTeX shown below.';}
  });
  const preview=paper.querySelector<HTMLElement>('.reference-preview')!;
  let active:HTMLAnchorElement|undefined;
  const hide=()=>{preview.hidden=true;active?.removeAttribute('aria-describedby');};
  paper.querySelectorAll<HTMLAnchorElement>('a.paper-ref').forEach(link=>{
    const target=document.getElementById(link.hash.slice(1));if(!target)return;
    const show=()=>{
      active=link;preview.textContent=(target.querySelector('figcaption,h3')?.textContent??target.textContent??'').trim().slice(0,550);
      const r=link.getBoundingClientRect();preview.hidden=false;preview.style.left=`${Math.max(12,Math.min(r.left,window.innerWidth- Math.min(420,window.innerWidth-24)-12))}px`;
      preview.style.top=`${Math.max(8,Math.min(r.bottom+8,window.innerHeight-preview.offsetHeight-12))}px`;link.setAttribute('aria-describedby',preview.id);
    };
    link.addEventListener('mouseenter',show);link.addEventListener('focus',show);link.addEventListener('mouseleave',hide);link.addEventListener('blur',hide);
    link.addEventListener('click',()=>{
      hide();paper.querySelectorAll('.return-reference').forEach(el=>el.remove());
      const back=document.createElement('a');back.className='return-reference';back.textContent='Return to reference';back.href=`#${link.id}`;
      back.addEventListener('click',()=>{setTimeout(()=>link.focus(),0);back.remove();});target.insertAdjacentElement('afterend',back);
      target.setAttribute('tabindex','-1');setTimeout(()=>target.focus({preventScroll:true}),0);
    });
  });
  window.addEventListener('scroll',hide,{passive:true});document.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  const sections=paper.querySelectorAll<HTMLElement>('.paper-content h2[id]');
  const toc=paper.querySelectorAll<HTMLAnchorElement>('.paper-toc nav a');
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;toc.forEach(a=>{if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}},{rootMargin:'-5% 0px -65% 0px'});sections.forEach(s=>observer.observe(s));
  const contents=paper.querySelector<HTMLDetailsElement>('.paper-toc details')!;const narrow=matchMedia('(max-width: 60rem)');
  const setContents=()=>{contents.open=!narrow.matches;};setContents();narrow.addEventListener('change',setContents);
  paper.querySelectorAll<HTMLAnchorElement>('[data-enlarge-image]').forEach(link=>link.addEventListener('click',event=>{
    event.preventDefault();const dialog=document.createElement('dialog');dialog.className='paper-figure-dialog';const img=new Image();img.src=link.href;img.alt=link.querySelector('img')?.alt??'';
    const close=document.createElement('button');close.textContent='Close expanded figure';close.onclick=()=>dialog.close();dialog.append(close,img);document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove());dialog.showModal();
  }));
  paper.querySelectorAll<HTMLTableElement>('[data-sortable]').forEach(table=>{
    const originalRows=Array.from(table.tBodies[0].rows);
    let currentRows=originalRows;
    window.addEventListener('beforeprint',()=>{currentRows=Array.from(table.tBodies[0].rows);originalRows.forEach(r=>table.tBodies[0].append(r));});
    window.addEventListener('afterprint',()=>{currentRows.forEach(r=>table.tBodies[0].append(r));});
    table.querySelectorAll<HTMLTableCellElement>('thead th').forEach((th,index)=>{
      const button=document.createElement('button');button.type='button';button.textContent=th.textContent;button.setAttribute('aria-label',`Sort by ${th.textContent}`);th.replaceChildren(button);
      button.onclick=()=>{const ascending=th.getAttribute('aria-sort')!=='ascending';table.querySelectorAll('th').forEach(h=>h.removeAttribute('aria-sort'));th.setAttribute('aria-sort',ascending?'ascending':'descending');
        const rows=Array.from(table.tBodies[0].rows);rows.sort((a,b)=>{const x=a.cells[index].textContent!.replaceAll(',','').trim(),y=b.cells[index].textContent!.replaceAll(',','').trim();const result=x!==''&&y!==''&&Number.isFinite(Number(x))&&Number.isFinite(Number(y))?Number(x)-Number(y):x.localeCompare(y);return ascending?result:-result;});rows.forEach(r=>table.tBodies[0].append(r));};
    });
  });
  paper.querySelectorAll<HTMLElement>('[data-table-csv]').forEach(button=>button.addEventListener('click',()=>{
    const table=document.getElementById(button.dataset.tableCsv!) as HTMLTableElement;
    const rows=Array.from(table.rows).map(row=>Array.from(row.cells).flatMap(c=>[c.textContent!.trim(),...Array(c.colSpan-1).fill('')]));
    const url=URL.createObjectURL(new Blob([csvFormatRows(rows)],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`shadingzip-${table.id}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }));
}
