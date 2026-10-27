import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const canvas=document.querySelector('#scene');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x8bc8e8);
scene.fog=new THREE.Fog(0x8bc8e8,45,180);
const camera=new THREE.PerspectiveCamera(62,innerWidth/innerHeight,.1,350);
camera.position.set(0,5.2,10.5);
const hemi=new THREE.HemisphereLight(0xd8f1ff,0x40523b,2.0);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1d1,3.1);sun.position.set(-8,16,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun);

const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const asphalt=mat(0x303b40), laneMat=mat(0xf4e8c4), grass=mat(0x4f8d48), sidewalk=mat(0xb9b6a8), concrete=mat(0x9b9b91), glass= new THREE.MeshStandardMaterial({color:0x7ecbe4,metalness:.25,roughness:.22}), black=mat(0x10151a,.45), tire=mat(0x080b0d,.9), chrome=mat(0xb8c7cd,.25,.8), red=mat(0xe52638,.35), white=mat(0xf3f5ee,.35), yellow=mat(0xf5b72b,.4), green=mat(0x006a4e,.4), blue=mat(0x1262a2,.4);
function box(parent,w,h,d,material,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
function cylinder(parent,r1,r2,h,material,x,y,z,rotX=0){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,16),material);m.position.set(x,y,z);m.rotation.x=rotX;m.castShadow=true;parent.add(m);return m}
function wheel(parent,x,y,z,r=.36){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);const t=new THREE.Mesh(new THREE.TorusGeometry(r*.78,r*.22,10,24),tire);t.rotation.y=Math.PI/2;g.add(t);const hub=cylinder(g,r*.22,r*.22,r*.18,chrome,0,0,0,Math.PI/2);const spokes=new THREE.Mesh(new THREE.TorusGeometry(r*.48,.018,5,16),chrome);spokes.rotation.y=Math.PI/2;g.add(spokes);return g}
function makeBike(color=0xe52638){
 const g=new THREE.Group();const paint=mat(color,.28,.25), dark=mat(0x121b20,.5), rubber=mat(0x08090a);
 wheel(g,0,.42,.9,.4);wheel(g,0,.42,-.85,.4);
 // frame / engine
 cylinder(g,.09,.09,1.12,chrome,0,.72,.05,Math.PI/2);
 box(g,.38,.35,.48,dark,0,.73,-.05);
 // sporty fuel tank
 const tank=box(g,.48,.43,.68,paint,0,1.13,.05);tank.rotation.x=-.12;
 box(g,.39,.15,.72,dark,0,.97,-.48);
 // tail + seat
 const tail=box(g,.38,.22,.48,paint,0,1.13,-.62);tail.rotation.x=-.16;
 box(g,.36,.12,.52,black,0,1.29,-.37);
 // front fairing and headlight
 const nose=box(g,.44,.47,.32,paint,0,1.23,.65);nose.rotation.x=-.16;
 box(g,.25,.12,.035,mat(0xfff4c6,.2),0,1.28,.82);
 // forks
 cylinder(g,.045,.045,.85,chrome,0,.75,.62,-.15);
 // handlebar
 cylinder(g,.035,.035,.78,black,0,1.48,.45,Math.PI/2);
 cylinder(g,.08,.08,.15,black,-.39,1.48,.45,Math.PI/2);cylinder(g,.08,.08,.15,black,.39,1.48,.45,Math.PI/2);
 // mirrors
 cylinder(g,.018,.018,.3,chrome,-.27,1.65,.39,-.45);cylinder(g,.018,.018,.3,chrome,.27,1.65,.39,-.45);
 const m1=new THREE.Mesh(new THREE.SphereGeometry(.09,12,8),black);m1.scale.set(1,.55,.5);m1.position.set(-.28,1.78,.28);g.add(m1);const m2=m1.clone();m2.position.x=.28;g.add(m2);
 // rider torso/head/helmet
 const jacket=mat(0x1a2732,.8);
 const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.22,.48,4,8),jacket);torso.position.set(0,1.65,-.2);torso.rotation.x=-.25;g.add(torso);
 const helmet=new THREE.Mesh(new THREE.SphereGeometry(.19,16,12),mat(0x111820,.25,.3));helmet.position.set(0,2.04,.02);g.add(helmet);
 const visor=box(g,.23,.09,.12,glass,0,2.04,.17);
 // arms
 const armGeo=new THREE.CapsuleGeometry(.07,.43,3,6);
 for(const s of [-1,1]){const a=new THREE.Mesh(armGeo,jacket);a.position.set(s*.24,1.54,.24);a.rotation.x=-.65;a.rotation.z=s*.35;g.add(a)}
 // rear lamp
 box(g,.2,.08,.035,red,0,1.18,-.91);
 g.userData.wheels=[];g.traverse(o=>{if(o.geometry&&o.geometry.type==='TorusGeometry')g.userData.wheels.push(o)});
 return g;
}

const world=new THREE.Group();scene.add(world);
const road=box(world,15,.18,260,asphalt,0,-.12,-80);
const leftWalk=box(world,1,.18,260,sidewalk,-8,-.11,-80),rightWalk=box(world,1,.18,260,sidewalk,8,-.11,-80);
box(world,50,.12,260,grass,0,-.28,-80);
for(const x of [-4.5,0,4.5]){for(let z=35;z>-210;z-=10)box(world,.13,.025,4.5,laneMat,x,.0,z-3)}
// road barriers / sidewalks
for(const x of [-7.5,7.5]){for(let z=30;z>-210;z-=7){box(world,.18,.5,4,concrete,x,.2,z);}}
const roadside=[];
function tree(x,z){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);cylinder(g,.13,.18,1.7,mat(0x75513a),0,.8,0);const leaves=new THREE.Mesh(new THREE.SphereGeometry(.8,10,8),mat([0x267447,0x34864b,0x20653e][Math.floor(Math.random()*3)]));leaves.position.y=2;leaves.scale.set(1.1,1.15,1);leaves.castShadow=true;g.add(leaves);roadside.push(g)}
function building(x,z){const h=5+Math.random()*12,w=3+Math.random()*4;const g=new THREE.Group();g.position.set(x,h/2,z);world.add(g);box(g,w,h,3,mat([0xd5c4a3,0xb7c7ca,0xe0d6c5,0x9baeb5][Math.floor(Math.random()*4)]),0,0,0);for(let y=-h/2+1;y<h/2-.4;y+=1.25){for(let xx=-w/2+.5;xx<w/2-.2;xx+=.85)box(g,.35,.5,.035,glass,xx,y,1.52)}roadside.push(g)}
for(let z=28;z>-200;z-=13){tree(-10-Math.random()*2,z);tree(10+Math.random()*2,z-5);if(z%26<1){building(-15,z-3);building(15,z-9)}}
// Bengali-ish roadside signs
function sign(x,z,label){const g=new THREE.Group();g.position.set(x,0,z);world.add(g);cylinder(g,.08,.08,3,chrome,0,1.5,0);box(g,2.4,.8,.12,green,0,2.8,0);const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#006a4e';ctx.fillRect(0,0,512,128);ctx.fillStyle='white';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText(label,256,78);const tex=new THREE.CanvasTexture(c);const panel=new THREE.Mesh(new THREE.PlaneGeometry(2.3,.7),new THREE.MeshBasicMaterial({map:tex}));panel.position.set(0,2.8,.071);g.add(panel)}
sign(-6,-25,'ঢাকা  ↑');sign(6,-70,'চট্টগ্রাম →');

let bike=makeBike(0xe52638);bike.position.set(0,0,3);scene.add(bike);
let selectedBike='sport';
const bikeColors={sport:0xe52638,street:0x1262d8,neon:0x12c9a1};
let traffic=[],running=false,paused=false,over=false,score=0,speed=0,baseSpeed=28,playerX=0,lane=1,lastTime=0,spawnClock=0,distance=0,toastTimer=0,boosting=false;
const lanes=[-4.2,0,4.2];
function vehicle(type){
 const g=new THREE.Group();let bodyMat, w=1.45,h=1.2,d=2.5;
 if(type==='bus'){bodyMat=mat(0x1765a5,.45);w=2.1;h=2.3;d=5.4}
 if(type==='truck'){bodyMat=mat(0xd99b2b,.5);w=1.8;h=1.6;d=3.9}
 if(type==='car'){bodyMat=mat([0xe8e8e0,0x263747,0x9c2431,0x2e7358][Math.floor(Math.random()*4)],.35);w=1.55;h=.85;d=2.7}
 if(type==='cng'){bodyMat=mat(0x087b51,.55);w=1.35;h=1.35;d=2}
 if(type==='bike'){bodyMat=mat(0x20252a,.35);w=.65;h=.9;d=1.7}
 if(type==='cycle'){bodyMat=mat(0x252b2e,.6);w=.6;h=.9;d=1.7}
 if(type==='rickshaw'){bodyMat=mat(0x008d61,.45);w=1.15;h=1.65;d=1.8}
 if(type==='bike'||type==='cycle'){const wh1=new THREE.Mesh(new THREE.TorusGeometry(.28,.07,8,14),tire);wh1.rotation.y=Math.PI/2;wh1.position.set(0,.3,d*.32);g.add(wh1);const wh2=wh1.clone();wh2.position.z=-d*.32;g.add(wh2);cylinder(g,.05,.05,d*.65,chrome,0,.55,0,Math.PI/2)}
 else{
  box(g,w,h,d,bodyMat,0,h/2+.1,0);
  if(type==='bus'){box(g,w*.85,h*.4,d*.75,glass,0,h*.7,-.1);for(let z=-d*.32;z<d*.35;z+=.8)box(g,.04,h*.35,.05,white,-w*.48,h*.68,z)}
  else if(type==='truck'){box(g,w*.8,h*.55,d*.55,mat(0x246c9b),0,h+.2,-.45);box(g,w*.9,.18,.16,white,0,h*.3,d*.52)}
  else {box(g,w*.78,h*.4,d*.42,glass,0,h*.82,-.05)}
  for(const s of [-1,1])for(const z of [-d*.32,d*.32]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.23,.23,.15,14),tire);wh.rotation.z=Math.PI/2;wh.position.set(s*(w/2),.28,z);g.add(wh)}
  for(const s of [-1,1]){box(g,.22,.14,.06,mat(0xfff2c7),s*w*.32,.48,h*0+d*.51);box(g,.2,.14,.06,red,s*w*.32,.48,-d*.51)}
  if(type==='rickshaw'){box(g,w*.9,.18,.75,mat(0xf1c52d),0,h+.1,0);box(g,.1,.9,.1,green,-w*.4,h+.45,0);box(g,.1,.9,.1,red,w*.4,h+.45,0)}
 }
 g.userData={type,width:w,depth:d,passed:false};return g
}
const types=['car','car','bus','truck','cng','bike','cycle','rickshaw'];
function spawnTraffic(){const type=types[Math.floor(Math.random()*types.length)];const v=vehicle(type);let li=Math.floor(Math.random()*3);v.position.set(lanes[li],0,-115);v.userData.lane=li;v.userData.speed=type==='bus'?13+Math.random()*5:15+Math.random()*12;scene.add(v);traffic.push(v)}
function showToast(text){const el=document.querySelector('#toast');el.textContent=text;el.classList.add('show');toastTimer=.9}
function updateHud(){document.querySelector('#score').textContent=String(Math.floor(score)).padStart(6,'0');document.querySelector('#speed').textContent=Math.round(speed*2.4);document.querySelector('#gear').textContent=Math.min(6,1+Math.floor(speed/12));document.querySelector('#speedbar').style.width=Math.min(100,speed/48*100)+'%'}
function reset(){traffic.forEach(v=>scene.remove(v));traffic=[];score=0;speed=0;baseSpeed=28;playerX=0;lane=1;bike.position.set(0,0,3);bike.rotation.set(0,0,0);spawnClock=0;distance=0;over=false;paused=false;running=true;document.querySelector('#start').classList.add('hidden');document.querySelector('#gameover').classList.add('hidden');document.querySelector('#pauseOverlay').classList.add('hidden');lastTime=performance.now()}
function crash(){if(over)return;over=true;running=false;document.querySelector('#finalScore').textContent=Math.floor(score);let best=Math.max(Number(localStorage.getItem('bbrBest')||0),Math.floor(score));localStorage.setItem('bbrBest',best);document.querySelector('#bestScore').textContent=best;document.querySelector('#gameover').classList.remove('hidden')}
function steer(dir){if(!running||paused)return;lane=Math.max(0,Math.min(2,lane+dir));playerX=lanes[lane]}
function pressControl(id,down,fn){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);down(fn)});el.addEventListener('pointerup',e=>{e.preventDefault();down(null)});el.addEventListener('pointercancel',()=>down(null))}
// Pointer controls work on touch and mouse without double-triggering.
for(const [id,dir] of [['left',-1],['right',1]]){const el=document.getElementById(id);el.addEventListener('pointerdown',e=>{e.preventDefault();steer(dir)})}
document.querySelector('#boost').addEventListener('pointerdown',e=>{e.preventDefault();boosting=true});['pointerup','pointercancel','pointerleave'].forEach(ev=>document.querySelector('#boost').addEventListener(ev,()=>boosting=false));
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' '].includes(e.key))e.preventDefault();if(e.repeat)return;if(e.key==='ArrowLeft'||e.key.toLowerCase()==='a')steer(-1);if(e.key==='ArrowRight'||e.key.toLowerCase()==='d')steer(1);if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')boosting=true;if(e.key.toLowerCase()==='r'&&over)reset();if(e.key==='Escape'&&running)togglePause()});
window.addEventListener('keyup',e=>{if(e.key==='ArrowUp'||e.key.toLowerCase()==='w')boosting=false});
function togglePause(){if(!running&&!paused)return;paused=!paused;running=!paused;document.querySelector('#pauseOverlay').classList.toggle('hidden',!paused);if(running)lastTime=performance.now()}
document.querySelector('#pause').onclick=togglePause;document.querySelector('#resume').onclick=togglePause;document.querySelector('#startBtn').onclick=reset;document.querySelector('#restart').onclick=reset;
document.querySelectorAll('.bike-option').forEach(b=>b.onclick=()=>{selectedBike=b.dataset.bike;document.querySelectorAll('.bike-option').forEach(x=>x.classList.toggle('active',x===b));const oldPos=bike.position.clone();scene.remove(bike);bike=makeBike(bikeColors[selectedBike]);bike.position.copy(oldPos);scene.add(bike);});
document.querySelector('#fullscreen').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen()}catch{}};
function update(dt){
 if(!running||paused)return;
 speed=THREE.MathUtils.damp(speed,boosting?46:31,boosting?1.7:1.0,dt);
 distance+=speed*dt;score+=speed*dt*.13;
 // Road markings and roadside scenery loop toward player
 for(const o of world.children){if(o.position.z>22)o.position.z-=260}
 for(const o of roadside){if(o.position.z>35)o.position.z-=260}
 spawnClock+=dt;if(spawnClock>(Math.max(.55,1.35-speed/70))){spawnTraffic();spawnClock=0}
 bike.position.x=THREE.MathUtils.damp(bike.position.x,playerX,8,dt);bike.rotation.z=THREE.MathUtils.damp(bike.rotation.z,(playerX-bike.position.x)*-.08,8,dt);bike.position.y=Math.sin(performance.now()*.012)*.018;
 bike.rotation.y=THREE.MathUtils.damp(bike.rotation.y,(playerX-bike.position.x)*.04,5,dt);
 camera.position.x=THREE.MathUtils.damp(camera.position.x,bike.position.x*.35,2.5,dt);camera.lookAt(bike.position.x*.25,1,-9);
 for(let i=traffic.length-1;i>=0;i--){const v=traffic[i];v.position.z+= (speed*.55-v.userData.speed)*dt; if(v.position.z>12){scene.remove(v);traffic.splice(i,1);continue}
  const dz=Math.abs(v.position.z-bike.position.z),dx=Math.abs(v.position.x-bike.position.x);
  if(dz<1.65&&dx<(v.userData.width*.48+.42)){crash();return}
  if(!v.userData.passed&&v.position.z>bike.position.z+1.7){v.userData.passed=true;const pts=v.userData.type==='bus'||v.userData.type==='truck'?20:(v.userData.type==='car'||v.userData.type==='cng'?10:5);score+=pts;showToast('+'+pts+' OVERTAKE')}
 }
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)document.querySelector('#toast').classList.remove('show')}
 updateHud();
}
function animate(t){requestAnimationFrame(animate);const dt=Math.min(.04,Math.max(0,(t-lastTime)/1000));lastTime=t;update(dt);renderer.render(scene,camera)}
requestAnimationFrame(animate);
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<600?68:62;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.8));renderer.setSize(innerWidth,innerHeight)}
addEventListener('resize',resize);
document.querySelector('#loading').style.opacity='0';setTimeout(()=>document.querySelector('#loading')?.remove(),350);
