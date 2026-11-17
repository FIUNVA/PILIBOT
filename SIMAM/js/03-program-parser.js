function parse(t){const L=t.split('\n').map(s=>s.replace(/#.*/,'').trim().toUpperCase()).filter(Boolean);let i=0;const blk=()=>{const o=[];while(i<L.length){const l=L[i++].split(/\s+/);if(l[0]=='END')return o;if(l[0]=='REPEAT'){const c=Math.min(50,+l[1]||1),b=blk();for(let k=0;k<c;k++)o.push(...b)}else o.push({op:l[0],a:+l[1]||0,p:+l[2]||0})}return o};return blk()}
function next(){pc++;ins=prog[pc];if(!ins){running=false;mode='FIN';return}
K={t:0,beta:0,nb:0,corr:false,stab:0,td:0,ov:0,best:999,tb:0,tc:0};const m=meas();
if(ins.op.startsWith('TURN')){K.goal=ins.op=='TURN_YAW'?wrap(ins.a):wrap(m+ins.a);K.start=m;const e=wrap(K.goal-m);K.s0=ins.op=='TURN_YAW_D'?(Math.sign(ins.a)||1):(Math.sign(e)||1);K.best=ins.op=='TURN_YAW_D'?Math.abs(ins.a):Math.abs(e)}
else if(ins.op=='FWD'||ins.op=='BACK')K.ref=m;else if(ins.op=='STOP'){running=false;mode='FIN'}}
function done(ok=true){if(ins&&ins.op.startsWith('TURN'))results.push({i:pc+1,op:ins.op+' '+ins.a,t:K.t/1e3,ess:Math.abs(wrap(K.goal-R.th)),ov:Math.max(0,K.ov),nb:K.nb,ok,g:cell(R.x,R.y)});next();return[0,0]}
const fail=()=>{done(false);running=false;mode='ERROR';return[0,0]};
function ctl(){if(!ins){mode='REPOSO';return[0,0]}const m=meas(),o=ins;K.t+=10;
if(K.t>15000&&o.op.startsWith('TURN'))return fail();
if(o.op.startsWith('TURN')){let e=wrap(K.goal-m);if(o.op=='TURN_YAW_D'){K.acc=(K.acc||0)+wrap(m-(K.lm===undefined?K.start:K.lm));K.lm=m;e=o.a-K.acc}const a=Math.abs(e),sg=Math.sign(e)||1,um=o.p||V.umax,Z=Math.max(1,Math.min(V.zd,Math.abs(wrap(K.goal-K.start)))),uf=V.umin+K.beta,uc=()=>Math.round(uf+(V.uc-uf)*Math.min(a/V.eref,1));let u=0;
if(K.corr){K.tc+=10;mode='CORRECCIÓN';if(a<=V.eps){K.stab+=10;if(K.stab>=V.stab)return done()}else{K.stab=0;if(sg!=K.csg)return done();u=uc()}if(K.tc>800)return done()}
else if(a<=V.eps){mode='CONVERGENCIA';K.stab+=10;if(K.stab>=V.stab)return done()}
else{K.stab=0;if(sg!=K.s0){K.corr=true;K.tc=0;K.csg=sg;mode='CORRECCIÓN';u=uc()}
else if(a>=Z){mode='CRUCERO';u=um}
else{mode='DESACELERACIÓN';u=uf+(um-uf)*a/Z;K.td+=10;if(K.td>5000)return fail();
if(V.antis){if(a<K.best-.5){K.best=a;K.tb=K.t}else if(K.t-K.tb>=600){K.beta=Math.min(K.beta+2,6);K.tb=K.t;K.nb++}}}}
return u?[sg*u,-sg*u]:[0,0]}
if(o.op=='FWD'||o.op=='BACK'){mode=o.op=='FWD'?'AVANCE':'REVERSA';if(K.t>=o.a)return done();const p=(o.op=='FWD'?1:-1)*(o.p||30),e=wrap(m-K.ref),a=Math.abs(e);let c=0;if(a>V.eps)c=Math.sign(e)*Math.max(1,Math.min(V.cmax,V.kp*a));return[p-c,p+c]}
mode=o.op=='WAIT'?'ESPERA':'REPOSO';if(o.op!='WAIT'||K.t>=o.a)return done();return[0,0]}
