'use strict';
/* ---------- ejes tipo TikZ ---------- */
const triad=document.getElementById('triad');
function drawTriad(){ triadTo(triad,camera); }
function triadTo(el,cam){
  const m=cam.matrixWorld, right=new THREE.Vector3().setFromMatrixColumn(m,0), up=new THREE.Vector3().setFromMatrixColumn(m,1), fw=new THREE.Vector3().setFromMatrixColumn(m,2);
  const ax=[new THREE.Vector3(0,0,-1),new THREE.Vector3(-1,0,0),new THREE.Vector3(0,1,0)], names=['x','y','z'];   // símbolo: X al frente, Y a la derecha, Z arriba
  const items=ax.map((v,i)=>({i,x:v.dot(right)*34,y:-v.dot(up)*34,d:v.dot(fw)})).sort((a,b)=>a.d-b.d);
  let h='';
  items.forEach(o=>{
    const L=Math.hypot(o.x,o.y)||1, ux=o.x/L, uy=o.y/L, px=-uy, py=ux;
    const ex=o.x,ey=o.y, a=`${ex},${ey} ${ex-ux*7+px*3},${ey-uy*7+py*3} ${ex-ux*7-px*3},${ey-uy*7-py*3}`;
    const cc=['#d12b2b','#1f9d3a','#1f4fd1'][o.i];
    h+=`<g opacity="${o.d>0?1:0.55}" style="color:${cc}"><line x1="0" y1="0" x2="${ex-ux*5}" y2="${ey-uy*5}" style="stroke:${cc};stroke-width:2.2"/><path d="M${a}Z" style="fill:${cc}"/>`+
       `<text x="${ex+ux*10-4}" y="${ey+uy*10+5}" style="fill:${cc};font-weight:700">${names[o.i].toUpperCase()}</text></g>`;
  });
  el.innerHTML=h;
}

