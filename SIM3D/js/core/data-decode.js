'use strict';
/* ---------- datos ---------- */
function dec(b64,T){const s=atob(b64),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new T(u.buffer);}
const NAMES=['Placa inferior (fondo)','Panel lateral der. (interior)','Panel lateral der. (exterior)','Panel lateral izq. (interior)','Panel lateral izq. (exterior)','Tapa de pantalla (acrílico)','Tapa frontal','Tapa posterior'];

const PAL={
 light:{bg:0xfbfdff, ink:0x0b1f3a,
   face:[0xd3deee,0xc4d3e8,0xdbe4f1,0xc9d4e3,0xd8e1ee,0xcdd9ea,0xc1cfe2,0xd0dbeb],
   edge:[0x1d4ed8,0x0284c7,0x4f46e5,0x0e7490,0x334155,0x1e3a8a,0x6366f1,0x475569],
   axisCol:[0x2563eb,0x0891b2,0x4f46e5], hatch:0x1e3a8a, fillCap:0xe8eef8},
 dark:{bg:0x060b14, ink:0xa9c7f5,
   face:[0x17263f,0x1c2d4a,0x13213a,0x223350,0x1a2a45,0x15243d,0x203049,0x182842],
   edge:[0x60a5fa,0x38bdf8,0x818cf8,0x22d3ee,0x94a3b8,0x93c5fd,0xa5b4fc,0xcbd5e1],
   axisCol:[0x60a5fa,0x22d3ee,0x818cf8], hatch:0x7fb2ff, fillCap:0x0b1628}
};

