'use strict';
/* ---------- UI ---------- */
const $=id=>document.getElementById(id);
const THEME_KEY = 'fiunva-theme';
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}
function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersDark = matchMedia('(prefers-color-scheme:dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  S.dark = document.documentElement.dataset.theme === 'dark';
  $('t-dark').checked = S.dark;
}
function setSpin(v){S.spin=v;$('spin').classList.toggle('on',v);}
$('t-dark').onchange=e=>{S.dark=e.target.checked;applyAppearance();applyTheme(S.dark ? 'dark' : 'light');};
$('t-trans').onchange=e=>{S.trans=e.target.checked;applyAppearance();};
$('t-anat').onchange=e=>{S.anat=e.target.checked;$('anat-opts').classList.toggle('show',S.anat);applyAppearance();updateCut();};
document.querySelectorAll('#axis-btns button').forEach(b=>b.onclick=()=>{
  S.axis=+b.dataset.ax;document.querySelectorAll('#axis-btns button').forEach(x=>x.classList.toggle('on',x===b));updateCut();});
$('cut').oninput=e=>{S.cut=e.target.value/1000;updateCut();};
$('flip').onclick=()=>{S.flip=!S.flip;updateCut();};
$('spin').onclick=()=>setSpin(!S.spin);
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>{const v=VIEWS[b.dataset.v];setSpin(false);
  setView(new THREE.Vector3(...v[0]),v[1]?new THREE.Vector3(...v[1]):null);});
const lg=$('legend');
const entries=bodies.slice(0,NMAIN).map((b,k)=>({name:NAMES[k]||('Cuerpo '+(k+1)),sw:k,set:v=>{b.visible=v;}}));
entries.push({name:'Pantalla OLED 1.3″',sw:3,set:v=>{oledOn=v;bodies.forEach(b=>{if(b.o.group==='oled')b.visible=v;});}});
entries.push({name:'Bandas elásticas',sw:4,set:v=>{bodies.forEach(b=>{if(b.o.group==='band')b.visible=v;});}});
[...new Set(DATA2.map(d=>d.cat))].forEach((c,i)=>entries.push({name:c,sw:(i+5)%8,set:v=>{INT.forEach(b=>{if(b.o.cat===c)b.visible=v;});}}));
window.addEventListener('storage', (e) => {
  if (e.key === THEME_KEY && e.newValue) {
    const theme = e.newValue;
    applyTheme(theme);
    S.dark = theme === 'dark';
    $('t-dark').checked = S.dark;
    applyAppearance();
  }
});
initTheme();
