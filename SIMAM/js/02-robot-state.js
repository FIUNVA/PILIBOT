const S0={x:.8,y:.5,th:0},reset=()=>{collided=false;R={x:S0.x,y:S0.y,th:S0.th,wl:0,wr:0,bias:0};trail=[];hist=[];running=false;ins=null;mode='REPOSO';cu=[0,0];T=0};reset();
const cell=(x,y)=>gOv>=0?gOv:grid[Math.min(AR.r-1,Math.max(0,y/(AR.mm/1000)|0))*AR.c+Math.min(AR.c-1,Math.max(0,x/(AR.mm/1000)|0))];
const meas=()=>R.th+R.bias+rnd(V.noise*1.7);
function plant(ul,ur,dt){let ld=0;for(const b of blocks){const dx=b.x-R.x,dy=b.y-R.y,dd=Math.hypot(dx,dy),r=.058;if(dd<r&&dd>1e-4){ld+=b.mu*b.m;const p=r-dd;b.x=Math.min(WP/500-.02,Math.max(.02,b.x+dx/dd*p));b.y=Math.min(HP/500-.02,Math.max(.02,b.y+dy/dd*p))}}const g=G[cell(R.x,R.y)],dead=g.d+.4*(V.alpha+(g.a||0))+100*ld,a=(V.alpha+(g.a||0))*d2r,A=V.asym/200+PT.da,o=u=>Math.abs(u)<dead?0:u,tau=V.tau*PT.tau;
R.wl+=(o(ul)*(1-A)-R.wl)*dt/tau;R.wr+=(o(ur)*(1+A)-R.wr)*dt/tau;
const rel=(R.th-V.psi)*d2r,w=V.kw*PT.kw*g.k*(R.wl-R.wr)/2-60*Math.sin(a)*g.s*Math.sin(rel),v=.006*g.k*(R.wl+R.wr)/2/(1+4*ld),sl=.2*Math.sin(a)*g.s,th=R.th*d2r,ps=V.psi*d2r;
R.th+=w*dt;R.bias+=V.drift/60*dt;R.x+=(v*Math.sin(th)+sl*Math.sin(ps))*dt;R.y+=(-v*Math.cos(th)-sl*Math.cos(ps))*dt;if(!collided&&wallHit())crash()}
