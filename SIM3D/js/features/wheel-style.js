'use strict';
/* ---------- estilo de ruedas: A (banda ranurada) / B (rueda invertida + O-ring liso) ---------- */
S.wm='A';
const WM_INFO={A:'A: ruedas laterales pequeñas, rueda central mayor y banda plana con ranura y relieves.',B:'B: arquitectura invertida (laterales mayores, canal central) con un O-ring liso sin ranuras.'};
function setWheelMode(m){ S.wm=m; INT.forEach(b=>{ b.modeHide=!!b.o.mode&&b.o.mode!==m; });
  document.querySelectorAll('[data-wm]').forEach(x=>x.classList.toggle('on',x.dataset.wm===m)); $('wm-info').textContent=WM_INFO[m]; applyAppearance(); }
document.querySelectorAll('[data-wm]').forEach(x=>x.onclick=()=>setWheelMode(x.dataset.wm));
setWheelMode('A');
