function step(h){T+=.005;n++;if(n%2==0)cu=running?ctl():[0,0];plant(cu[0],cu[1],.005);
if(ins&&K.goal!==undefined)K.ov=Math.max(K.ov,-K.s0*wrap(K.goal-R.th));
if(!h&&n%4==0){const t=ins&&K.goal!==undefined?K.goal:ins&&K.ref!==undefined?K.ref:R.th,e=wrap(t-R.th);hist.push({t:T,th:R.th,m:R.th+R.bias,g:R.th+e,e,l:cu[0],r:cu[1],md:mode});if(hist.length>3000)hist.splice(0,1000);if(n%8==0){trail.push([R.x,R.y]);if(trail.length>2500)trail.shift()}}}
$('#run').onclick=()=>{prog=parse($('#src').value);pc=-1;results=[];running=true;paused=false;$('#pau').textContent='Pausa';next()};
$('#pau').onclick=()=>{paused=!paused;$('#pau').textContent=paused?'Continuar':'Pausa'};
$('#rst').onclick=()=>{reset();results=[]};$('#kick').onclick=()=>R.th+=25;
const MCOL={'CRUCERO':'#1a4b9b','DESACELERACIÓN':'#2a7a3c','CONVERGENCIA':'#b7791f','CORRECCIÓN':'#b0262b','ERROR':'#7a1fa2','AVANCE':'#0e7490','REVERSA':'#c2410c','ESPERA':'#6b7280'},SM=Object.keys(MCOL);
function stat(){$('#sm').innerHTML='<span class=nb>Modo del supervisor (el color es el sombreado de la Figura 2):</span>'+SM.map(s=>`<span class='${s==mode?'a':''}' style='--c:${MCOL[s]}'><i></i>${s}</span>`).join('');
const g=G[cell(R.x,R.y)];$('#kv').innerHTML=`<div><i>t</i> = <b>${T.toFixed(2)}</b> s</div><div><i>θ</i> = <b>${wrap(R.th).toFixed(1)}</b>°</div><div><i>β</i> = <b>${K.beta||0}</b> %</div><div><i>u</i><sub>L</sub> = <b>${cu[0].toFixed(0)}</b> %</div><div><i>u</i><sub>R</sub> = <b>${cu[1].toFixed(0)}</b> %</div><div>suelo: <b>${g.n}</b></div><div>banda muerta: <b>${(g.d+.4*V.alpha).toFixed(1)}</b> %</div>`;
$('#rt tbody').innerHTML=results.slice(-8).map(r=>`<tr><td>${r.i}</td><td>${r.op}</td><td>${r.t.toFixed(2)}</td><td>${r.ess.toFixed(2)}</td><td>${r.ov.toFixed(1)}</td><td>${r.nb*2}</td><td style="color:var(--${r.ok?'ok':'bad'})">${r.ok?'completada':'ERROR'}</td></tr>`).join('')}
function eq(){const uf=V.umin,Kz=(V.umax-uf)/V.zd,pm=V.zd*uf/(V.umax-uf),tc=1/(Kz*V.kw),t1=tc*Math.log(V.zd/V.eps),t2=tc*Math.log(V.umax/(uf+Kz*V.eps)),sab=Kz*V.kw*.01;
$('#eq').innerHTML=`<p><i>K</i><sub>zona</sub> = (<i>u</i><sub>max</sub> − <i>u</i><sub>f</sub>)/<i>Z</i> = <b>${Kz.toFixed(3)}</b> %/°</p><p>|<i>e</i>|<sub>pm</sub> = <i>Z u</i><sub>f</sub>/(<i>u</i><sub>max</sub> − <i>u</i><sub>f</sub>) = <b>${pm.toFixed(1)}</b>°</p><p><i>τ</i><sub>cola</sub> = 1/(<i>K</i><sub>zona</sub><i>K</i><sub>ω</sub>) = <b>${tc.toFixed(2)}</b> s</p><p><i>t</i><sub>desac</sub> ≈ <i>τ</i><sub>cola</sub> ln(<i>Z</i>/<i>ε</i>) = <b>${t1.toFixed(2)}</b> s (modelo exponencial del reporte)</p><p><i>t</i><sub>desac</sub> = <i>τ</i><sub>cola</sub> ln[<i>u</i><sub>max</sub>/(<i>u</i><sub>f</sub> + <i>K</i><sub>zona</sub><i>ε</i>)] = <b>${t2.toFixed(2)}</b> s (con la ley afín exacta)</p><p><i>K</i><sub>zona</sub><i>K</i><sub>ω</sub><i>T</i><sub>s</sub> = <b>${sab.toFixed(4)}</b> &lt; 2 ${sab<2?'✓ estable':'✗'}</p><p class=note style="background:none;border:0">Con suelo en el PWM la ley es afín, no proporcional pura: el error no decae como e<sup>−t/τ</sup> y el tiempo real de desaceleración es menor que el exponencial.</p>`}
setInterval(()=>{try{eq2()}catch(e){}},300);
function drawW(){const c=cw,S=getComputedStyle(document.documentElement),fg=S.getPropertyValue('--fg'),ac=S.getPropertyValue('--ac'),ln=S.getPropertyValue('--ln'),bad=S.getPropertyValue('--bad');c.clearRect(0,0,800,500);
for(let j=0;j<AR.r;j++)for(let i=0;i<AR.c;i++){c.fillStyle=gc(G[grid[j*AR.c+i]].h);c.fillRect(i*CP,j*CP,CP,CP)}
c.strokeStyle=ln;c.lineWidth=.6;c.beginPath();for(let i=0;i<=AR.c;i++){c.moveTo(i*CP,0);c.lineTo(i*CP,HP)}for(let j=0;j<=AR.r;j++){c.moveTo(0,j*CP);c.lineTo(WP,j*CP)}c.stroke();
const ps=V.psi*d2r,dx=Math.sin(ps),dy=-Math.cos(ps);
if(V.alpha>0){const sp=300/(1+V.alpha/3);c.strokeStyle=ac;c.globalAlpha=.35;c.lineWidth=1;c.beginPath();for(let k=-30;k<=30;k++){const cx=400+dx*k*sp,cy=250+dy*k*sp;c.moveTo(cx-dy*1000,cy+dx*1000);c.lineTo(cx+dy*1000,cy-dx*1000)}c.stroke();c.globalAlpha=1}
c.fillStyle=fg;c.strokeStyle=fg;c.lineWidth=2;c.font='italic 15px "STIX Two Text",serif';
c.strokeStyle=ac;c.lineWidth=2;c.beginPath();trail.forEach(([x,y],i)=>i?c.lineTo(x*500,y*500):c.moveTo(x*500,y*500));c.stroke();
const px=R.x*500,py=R.y*500;c.save();c.translate(px,py);
const gl=ins&&(K.goal!==undefined?K.goal:K.ref);if(gl!==undefined){c.save();c.rotate(gl*d2r);c.setLineDash([6,5]);c.strokeStyle=bad;c.lineWidth=1.5;c.beginPath();c.moveTo(0,0);c.lineTo(0,-110);c.stroke();c.restore()}
c.rotate(R.th*d2r);c.strokeStyle=ac;c.lineWidth=1;c.beginPath();c.moveTo(0,0);c.lineTo(Math.sin((R.bias)*d2r)*80,-80);c.stroke();
c.fillStyle=fg;[[-16.5,Math.abs(R.wl)],[13,Math.abs(R.wr)]].forEach(([x,w])=>{c.globalAlpha=.4+Math.min(.6,w/40);c.fillRect(x,-8,3.5,16)});c.globalAlpha=1;
c.fillStyle=S.getPropertyValue('--bg');c.strokeStyle=fg;c.lineWidth=1.8;c.beginPath();c.rect(-13,-15,26,30);c.fill();c.stroke();c.beginPath();c.moveTo(0,-12);c.lineTo(5,-4);c.lineTo(-5,-4);c.closePath();c.fillStyle=bad;c.fill();c.restore()}
