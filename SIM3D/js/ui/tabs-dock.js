/* ---- reorganización del panel en pestañas con dock inferior ---- */
(function(){
  const fig=document.getElementById('fig'), old=fig.querySelector('aside.panel'); if(!old) return;
  const kids=[...old.children], head=kids.find(e=>e.tagName==='H2'), w=document.createElement('div'); w.className='sec';
  const anat=document.getElementById('anat-opts'); w.appendChild(head); kids.filter(e=>e.classList.contains('row')).forEach(r=>w.appendChild(r)); w.appendChild(anat);
  const all=[w,...kids.filter(e=>e.classList.contains('sec')&&e.id!=='anat-opts')], by={}; all.forEach(s=>{const h=s.querySelector(':scope>h2'); if(h) by[h.textContent.trim()]=s;});
  const TABS=[
   {n:'I',t:'Piezas',d:'Lista de cuerpos, estilo de ruedas y dibujo',m:['Cuerpos','Estilo de ruedas y banda','Editor de dibujo'],fold:[1,2],c:'var(--blue)'},
   {n:'II',t:'Vista',d:'Cámara, apariencia, cortes y vista explosionada',m:['Visualización','Vista','Vista explosionada'],fold:[],c:'var(--blue)'},
   {n:'III',t:'Robot',d:'Interruptor, ojos OLED, LED RGB y motores',m:['Interruptor','Ojos OLED','LED RGB WS2812B','Motores N20 y banda'],fold:[1,2],c:'var(--green)'},
   {n:'IV',t:'Escenario',d:'Superficie plana, desplazamiento y cámara',m:['Escenario'],fold:[],c:'var(--green)'},
   {n:'V',t:'Aerodinámica',d:'Viento, presión Cp, líneas de corriente y fuerzas',m:['Análisis aerodinámico'],fold:[],c:'var(--blue)'},
   {n:'VI',t:'Estructura',d:'Caídas y golpes: esfuerzo, deformación y daño',m:['Análisis estructural'],fold:[],c:'var(--red)'}];
  const panes=document.createElement('div'); panes.className='panes'; const dock=document.createElement('nav'); dock.className='dock'; dock.setAttribute('aria-label','Secciones del panel');
  fig.appendChild(panes);
  const btn=[], pn=[];
  TABS.forEach((T,i)=>{
    const p=document.createElement('section'); p.className='pane'; p.style.setProperty('--tc',T.c); p.id='pane-'+(i+1); p.setAttribute('aria-label',T.t);
    p.innerHTML='<div class="ph"><div class="pt"><i>'+T.n+'</i>'+T.t+'<small>'+T.d+'</small></div><button class="px" aria-label="Cerrar">×</button></div><div class="pb"></div>';
    const pb=p.querySelector('.pb');
    T.m.forEach((name,j)=>{ const s=by[name]; if(!s) return; const h=s.querySelector(':scope>h2'); h.dataset.n=(i+1)+'.'+(j+1); h.tabIndex=0; h.setAttribute('role','button');
      const set=f=>{s.classList.toggle('fold',f); h.setAttribute('aria-expanded',String(!f));}; set(T.fold.includes(j));
      h.onclick=()=>set(!s.classList.contains('fold')); h.onkeydown=e=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault(); h.onclick();} }; pb.appendChild(s); });
    panes.appendChild(p); pn.push(p);
    const b=document.createElement('button'); b.type='button'; b.style.setProperty('--tc',T.c); b.innerHTML='<span class="nm">'+T.n+'</span>'+T.t; b.title=T.d; b.setAttribute('aria-controls',p.id); b.setAttribute('aria-expanded','false');
    b.onclick=()=>toggle(i); dock.appendChild(b); btn.push(b); p.querySelector('.px').onclick=()=>toggle(i);
  });
  const bd=document.createElement('button'); bd.type='button'; bd.style.setProperty('--tc','var(--red)'); bd.innerHTML='<span class="nm">↗</span>Documentación'; bd.title='Abre la documentación en una ventana nueva'; bd.onclick=()=>{ if(window.__openDocs) window.__openDocs(); }; dock.appendChild(bd);
  const sep2=document.createElement('span'); sep2.className='sep'; dock.appendChild(sep2);
  function quick(lab,id,tOn,tOff){ const cb=document.getElementById(id), b=document.createElement('button'); b.type='button'; b.className='q'; b.textContent=lab; b.onclick=()=>cb.click(); dock.appendChild(b);
    return ()=>{ const on=cb.checked; b.setAttribute('aria-pressed',String(on)); b.title=on?tOn:tOff; }; }
  const q1=quick('Oscuro',"t-dark",'Activado: pulsa para volver al fondo claro','Pulsa para usar el fondo oscuro'), q2=quick('Encendido',"t-pwr",'Encendido: pulsa para apagar el robot','Apagado: pulsa para encender el robot');
  let cur=-1; function toggle(i){ const was=cur; cur=(was===i)?-1:i; pn.forEach((p,k)=>p.classList.toggle('open',k===cur)); btn.forEach((b,k)=>{b.classList.toggle('on',k===cur); b.setAttribute('aria-expanded',String(k===cur));}); }
  window.__openTab=function(i){ if(cur!==i) toggle(i); };
  const acts=[null,null,null,'fl-on','ae-on','st-on'];
  function sync(){ acts.forEach((id,k)=>{ if(id){ const c=document.getElementById(id); btn[k].classList.toggle('act',!!(c&&c.checked)); } }); q1(); q2(); }
  document.addEventListener('change',sync,true); setInterval(sync,600); setTimeout(sync,50);
  const fadeSync=()=>dock.classList.toggle('fade',dock.scrollLeft+dock.clientWidth<dock.scrollWidth-4); dock.addEventListener('scroll',fadeSync,{passive:true}); addEventListener('resize',fadeSync); setTimeout(fadeSync,80); setInterval(fadeSync,1500);
  document.addEventListener('keydown',e=>{ const t=e.target, ty=(t.type||'').toLowerCase(); if(e.metaKey||e.ctrlKey||e.altKey) return;
    if(e.key==='Escape'){ if(cur>=0) toggle(cur); return; } if(e.key==='7'&&!(t.tagName==='TEXTAREA'||t.tagName==='SELECT'||(t.tagName==='INPUT'&&/text|number|search|color/.test(ty)))){ bd.click(); return; } if(/^[1-6]$/.test(e.key)&&!(t.tagName==='TEXTAREA'||t.tagName==='SELECT'||(t.tagName==='INPUT'&&/text|number|search|color/.test(ty)))) toggle(+e.key-1); });
  // referencias cruzadas
  function xref(id,html){ const s=document.getElementById(id); if(!s) return; const d=document.createElement('div'); d.className='xref'; d.innerHTML=html; s.querySelector(':scope>h2').after(d); }
  xref('sec-aero','Se combina con <button class="lnk" data-goto="3">IV · Escenario</button>: activa «Superficie plana» y acciona los motores para sumar el viento aparente del avance.');
  xref('sec-struct','La caída y el golpe usan el piso del <button class="lnk" data-goto="3">IV · Escenario</button>; se activa solo al iniciar la prueba.');
  document.addEventListener('click',e=>{ const g=e.target.closest&&e.target.closest('[data-goto]'); if(g){ cur=-1; toggle(+g.dataset.goto); } });
  document.querySelector('header').appendChild(dock); old.remove();
})();
