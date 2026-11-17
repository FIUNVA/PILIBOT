'use strict';
/* ---------- árbol de cuerpos por subsistemas ---------- */
const NICE=n=>n.replace(/^"/,'').replace('Electrónica (PCB1)','PCB 1 · control').replace('Electrónica (PCB2)','PCB 2 · potencia y BMS').replace(/^Baterías LiPo 802040.*/,'Baterías LiPo 802040 (×2)').replace('Pantalla OLED 1.3″','Pantalla OLED 1.3″ y herrajes');
const SUBS=[
 ['Estructura','Chasis, paneles, tapas y bandas',/^(Placa inferior|Panel|Tapa|Bandas elásticas)/],
 ['Fijaciones','Separadores y tornillería',/^(Separadores hex|Tornillos|Tuercas)/],
 ['Propulsión','Motores, bases y placa de motores',/^(Placa de motores|Bases de motor|Motores)/],
 ['Rodadura','Ruedas, bandas y rodamientos',/^(Ruedas|Eje de la rueda|Balero|Banda de goma|O-ring)/],
 ['Energía','Celdas y aislamiento',/^(Bater|Separador de pol)/],
 ['Electrónica','Control, potencia y pantalla',/^(Electrónica|PCB|Pantalla OLED)/]];
const tree=SUBS.map(s=>({name:s[0],sub:s[1],re:s[2],items:[]})), other={name:'Otros',sub:'',re:null,items:[]};
entries.forEach(e=>{ const g=tree.find(g=>g.re.test(NICE(e.name)))||other, nm=NICE(e.name); let it=g.items.find(i=>i.name===nm);
  if(!it){ it={name:nm,sw:e.sw,sets:[],on:true}; g.items.push(it); } it.sets.push(e.set); });
if(other.items.length) tree.push(other);
const ldom=[]; let lgOpen=null;
const setItem=(it,v)=>{ it.on=v; it.sets.forEach(f=>f(v)); };
function lgRefresh(){ ldom.forEach(d=>{ const n=d.g.items.filter(i=>i.on).length, N=d.g.items.length;
  d.m.checked=n===N; d.m.indeterminate=n>0&&n<N; d.c.textContent=n+'/'+N; d.hd.classList.toggle('off',n===0);
  d.g.items.forEach((i,k)=>{ d.ch[k].checked=i.on; }); }); }
function lgAll(v){ tree.forEach(g=>g.items.forEach(i=>setItem(i,v))); lgRefresh(); applyAppearance(); }
const tb=document.createElement('div'); tb.className='lg-tb';
[['Todo',()=>lgAll(true)],['Nada',()=>lgAll(false)],['Desplegar',()=>{const o=ldom.some(d=>!d.open);ldom.forEach(d=>d.setOpen(o));tb.lastChild.textContent=o?'Plegar':'Desplegar';}]].forEach(([n,f])=>{const b=document.createElement('button'); b.type='button'; b.textContent=n; b.onclick=f; tb.appendChild(b);});
lg.appendChild(tb);
tree.forEach(g=>{
  const box=document.createElement('div'); box.className='lg-g';
  const hd=document.createElement('div'); hd.className='lg-h';
  hd.innerHTML='<button type="button" class="lg-chev" aria-label="Desplegar">▸</button><input type="checkbox" class="lg-m" checked><span class="lg-n"><b>'+g.name+'</b><small>'+g.sub+'</small></span><em class="lg-c"></em><button type="button" class="lg-solo" title="Mostrar solo este subsistema">◎</button>';
  const bd=document.createElement('div'); bd.className='lg-b'; bd.hidden=true;
  const ch=g.items.map(it=>{ const l=document.createElement('label'); l.innerHTML='<input type="checkbox" checked><i data-sw="'+it.sw+'"></i><span>'+it.name+'</span>';
    const inp=l.querySelector('input'); inp.onchange=()=>{ setItem(it,inp.checked); lgRefresh(); applyAppearance(); }; bd.appendChild(l); return inp; });
  const d={g,hd,m:hd.querySelector('.lg-m'),c:hd.querySelector('.lg-c'),ch,open:false,setOpen:o=>{d.open=o; bd.hidden=!o; hd.querySelector('.lg-chev').textContent=o?'▾':'▸';}};
  hd.querySelector('.lg-chev').onclick=()=>d.setOpen(!d.open);
  hd.querySelector('.lg-n').onclick=()=>d.setOpen(!d.open);
  d.m.onchange=()=>{ g.items.forEach(i=>setItem(i,d.m.checked)); lgRefresh(); applyAppearance(); };
  hd.querySelector('.lg-solo').onclick=()=>{ tree.forEach(o=>o.items.forEach(i=>setItem(i,o===g))); lgRefresh(); applyAppearance(); };
  box.appendChild(hd); box.appendChild(bd); lg.appendChild(box); ldom.push(d);
});
lgRefresh();
// dimensiones totales
const f=v=>v.toFixed(2);
const tex=`L_x\\times L_y\\times L_z = ${f(size.x)}\\times${f(size.z)}\\times${f(size.y)}\\ \\mathrm{mm}`;
try{ if(window.katex) katex.render(tex,$('dims'),{throwOnError:false}); else throw 0; }
catch(_){ $('dims').textContent=`Lx × Ly × Lz = ${f(size.x)} × ${f(size.z)} × ${f(size.y)} mm`; }

