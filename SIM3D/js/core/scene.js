'use strict';
/* ---------- escena ---------- */
const canvas=document.getElementById('c'), stage=document.getElementById('fig');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,stencil:true,preserveDrawingBuffer:true});
renderer.localClippingEnabled=true;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
const scene=new THREE.Scene();
const camera=new THREE.OrthographicCamera(-1,1,1,-1,-5000,5000);
camera.up.set(0,1,0);
scene.add(camera);
scene.add(new THREE.AmbientLight(0xffffff,0.62));
const L1=new THREE.DirectionalLight(0xffffff,0.55); L1.position.set(1,0.6,1.4); camera.add(L1);
const L2=new THREE.DirectionalLight(0xbcd2ff,0.30); L2.position.set(-1,-0.4,0.5); camera.add(L2);
[L1,L2].forEach(L=>{const o=new THREE.Object3D();o.position.set(0,0,-1);camera.add(o);L.target=o;});

const pose=new THREE.Group(); scene.add(pose); const root=new THREE.Group(); pose.add(root);
const clipPlane=new THREE.Plane(new THREE.Vector3(-1,0,0),0);
const bbox=new THREE.Box3();

const bodies=[];
function addBody(g,eg,k,o){
  o=o||{};
  const pos=g.attributes.position.array, nor=g.attributes.normal.array;
  const col=new Float32Array(pos.length);
  g.setAttribute('color',new THREE.BufferAttribute(col,3));
  g.computeBoundingBox(); if(!o.acc) bbox.union(g.boundingBox);
  const fm=new THREE.MeshLambertMaterial({side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:1,polygonOffsetUnits:1});
  const em=new THREE.LineBasicMaterial();
  const mesh=new THREE.Mesh(g,fm), lines=new THREE.LineSegments(eg,em);
  mesh.renderOrder=0; lines.renderOrder=0;
  const grp=new THREE.Group(); grp.add(mesh,lines); root.add(grp);

  // stencil para la sección (Anatomy)
  const mkSt=(side,op)=>new THREE.MeshBasicMaterial({side,depthWrite:false,depthTest:false,colorWrite:false,
    stencilWrite:true,stencilFunc:THREE.AlwaysStencilFunc,stencilFail:op,stencilZFail:op,stencilZPass:op,clippingPlanes:[clipPlane]});
  const back=mkSt(THREE.BackSide,THREE.IncrementWrapStencilOp), front=mkSt(THREE.FrontSide,THREE.DecrementWrapStencilOp);
  const sb=new THREE.Mesh(g,back), sf=new THREE.Mesh(g,front);
  sb.renderOrder=sf.renderOrder=10+2*k; sb.visible=sf.visible=false;
  grp.add(sb,sf);

  const capMat=new THREE.ShaderMaterial({
    uniforms:{uFill:{value:new THREE.Color()},uLine:{value:new THREE.Color()},uSp:{value:3.2}},
    vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader:'uniform vec3 uFill,uLine;uniform float uSp;varying vec3 vW;'+
      'void main(){float s=(vW.x+vW.y+vW.z)/uSp;float f=fract(s);float d=min(f,1.-f);'+
      'float l=1.-smoothstep(0.02,0.02+fwidth(s)*1.2,d);gl_FragColor=vec4(mix(uFill,uLine,l*0.9),1.);}',
    side:THREE.DoubleSide,
    stencilWrite:true,stencilRef:0,stencilFunc:THREE.NotEqualStencilFunc,
    stencilFail:THREE.ReplaceStencilOp,stencilZFail:THREE.ReplaceStencilOp,stencilZPass:THREE.ReplaceStencilOp});
  const cap=new THREE.Mesh(new THREE.PlaneGeometry(1,1),capMat);
  cap.renderOrder=10+2*k+1; cap.visible=false; cap.onAfterRender=r=>r.clearStencil();
  scene.add(cap);

  const body={g,mesh,lines,fm,em,grp,sb,sf,cap,capMat,pos,nor,col,k,o,visible:true};
  bodies.push(body); return body;
}
DATA.forEach((d,k)=>{
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(dec(d.p,Float32Array),3));
  g.setAttribute('normal',new THREE.BufferAttribute(dec(d.n,Float32Array),3));
  g.setIndex(new THREE.BufferAttribute(dec(d.i,Uint32Array),1));
  const eg=new THREE.BufferGeometry(); eg.setAttribute('position',new THREE.BufferAttribute(dec(d.e,Float32Array),3));
  addBody(g,eg,k,{acrylic:k===5});
});
const NMAIN=bodies.length;
