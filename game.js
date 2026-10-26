(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const speedEl = document.getElementById('speed');
  const startScreen = document.getElementById('startScreen');
  const crashScreen = document.getElementById('crashScreen');
  const finalScore = document.getElementById('finalScore');
  const toast = document.getElementById('toast');
  const W = 960, H = 540;
  canvas.width = W; canvas.height = H;
  let running = false, crashed = false, last = 0, speed = 0, score = 0, distance = 0, spawnTimer = 0, roadOffset = 0, toastTimer = 0;
  const keys = new Set();
  const bike = { x: W / 2, y: 430, lean: 0 };
  let traffic = [];
  const lanes = [W*.39, W*.50, W*.61];
  const vehicleTypes = [
    {name:'CAR', w:49,h:78,color:'#e9e8df',points:20}, {name:'BUS',w:67,h:115,color:'#1e76a7',points:20},
    {name:'TRUCK',w:62,h:105,color:'#d49a2e',points:20}, {name:'CNG',w:42,h:63,color:'#0c9a62',points:10},
    {name:'BIKE',w:28,h:64,color:'#db3b37',points:5}, {name:'CYCLE',w:25,h:61,color:'#d4d8cf',points:5},
    {name:'RICKSHAW',w:45,h:67,color:'#e94d9c',points:10}
  ];
  function rounded(x,y,w,h,r,fill,stroke){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.stroke()}}
  function drawBackground(){
    const sky=ctx.createLinearGradient(0,0,0,230);sky.addColorStop(0,'#78b9db');sky.addColorStop(1,'#d9e6d4');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Distant Dhaka skyline
    ctx.fillStyle='#8ca69a';for(let i=0;i<18;i++){let x=i*58-((distance*.12)%58),h=45+(i*31%78);ctx.fillRect(x,185-h,35,h);ctx.fillStyle='#c5d2c8';for(let j=0;j<3;j++)ctx.fillRect(x+6+j*9,190-h,4,8);ctx.fillStyle='#8ca69a'}
    // trees and roadside buildings
    for(let side=0;side<2;side++){let x=side?W*.77:0;ctx.fillStyle='#3c7650';for(let i=0;i<10;i++){let yy=((i*75+roadOffset*1.5)%650)-90;let xx=side?x+Math.sin(i*2)*20:xxSafe(i);ctx.fillRect(xx,yy,7,40);ctx.beginPath();ctx.arc(xx+3,yy,18,0,Math.PI*2);ctx.fill();}}
    function xxSafe(i){return 20+Math.cos(i*2)*22}
    // road perspective
    ctx.fillStyle='#777f7d';ctx.beginPath();ctx.moveTo(W*.33,185);ctx.lineTo(W*.67,185);ctx.lineTo(W*.97,H);ctx.lineTo(W*.03,H);ctx.closePath();ctx.fill();
    ctx.fillStyle='#525a59';ctx.beginPath();ctx.moveTo(W*.365,185);ctx.lineTo(W*.635,185);ctx.lineTo(W*.88,H);ctx.lineTo(W*.12,H);ctx.closePath();ctx.fill();
    // road shoulders
    ctx.strokeStyle='#e6dfc6';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(W*.33,185);ctx.lineTo(W*.03,H);ctx.moveTo(W*.67,185);ctx.lineTo(W*.97,H);ctx.stroke();
    // lane dividers with perspective
    for(let lane=1;lane<=2;lane++){for(let i=0;i<9;i++){let z=(i/9+(roadOffset/120)%1)%1;let y=185+z*z*355;let half= (y-185)*.42;let x=lane===1?W/2-half/3:W/2+half/3;ctx.strokeStyle='#f5f3df';ctx.lineWidth=1+z*3;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+7+z*22);ctx.stroke();}}
    // Bangladesh flag sign and road signs
    rounded(40,105,94,52,5,'#f1eee0','#718e7b');ctx.fillStyle='#0a7946';ctx.fillRect(48,113,78,36);ctx.fillStyle='#e72e43';ctx.beginPath();ctx.arc(87,131,10,0,Math.PI*2);ctx.fill();
    rounded(755,120,150,48,5,'#f5f0d9','#7d9588');ctx.fillStyle='#176c49';ctx.font='bold 18px Hind Siliguri, sans-serif';ctx.fillText('ঢাকা শহর',773,151);
    // roadside bus stop
    ctx.fillStyle='#c3c9b7';ctx.fillRect(160,200,4,45);rounded(139,185,48,23,3,'#d7e1d3');ctx.fillStyle='#0b6444';ctx.font='10px sans-serif';ctx.fillText('BUS',151,200);
  }
  function roadX(y, lane){const t=Math.max(0,Math.min(1,(y-185)/355));const center=W/2;const spread=170+t*285;return center+(lane-1)*spread*.64}
  function drawVehicle(v){
    const scale=.32+((v.y-170)/370)*.82;const w=v.type.w*scale,h=v.type.h*scale,x=v.x-w/2,y=v.y-h/2;
    ctx.save();ctx.translate(x+w/2,y+h/2);ctx.scale(scale,scale);ctx.translate(-v.type.w/2,-v.type.h/2);
    if(v.type.name==='BIKE'||v.type.name==='CYCLE'){
      ctx.strokeStyle='#1d2422';ctx.lineWidth=4;ctx.beginPath();ctx.arc(v.type.w/2,10,8,0,Math.PI*2);ctx.arc(v.type.w/2,v.type.h-9,8,0,Math.PI*2);ctx.stroke();ctx.strokeStyle=v.type.color;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(v.type.w/2,10);ctx.lineTo(5,v.type.h*.55);ctx.lineTo(v.type.w/2,v.type.h-9);ctx.lineTo(v.type.w-5,v.type.h*.5);ctx.closePath();ctx.stroke();ctx.fillStyle='#111';ctx.beginPath();ctx.arc(v.type.w/2,v.type.h*.42,6,0,Math.PI*2);ctx.fill();
    }else{
      rounded(2,1,v.type.w-4,v.type.h-2,7,v.type.color,'#222a26');
      if(v.type.name==='CNG'||v.type.name==='RICKSHAW'){ctx.fillStyle='#a5dfce';ctx.fillRect(7,9,v.type.w-14,19);ctx.fillStyle='#151d19';ctx.fillRect(4,v.type.h-13,8,11);ctx.fillRect(v.type.w-12,v.type.h-13,8,11);if(v.type.name==='RICKSHAW'){ctx.strokeStyle='#f7e7a3';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,7);ctx.lineTo(v.type.w-4,7);ctx.stroke();}}
      else{ctx.fillStyle='#a7cbd2';ctx.fillRect(7,10,v.type.w-14,v.type.h*.22);ctx.fillStyle='#293b3b';ctx.fillRect(7,v.type.h*.38,v.type.w-14,v.type.h*.18);ctx.fillStyle='#f8d97a';ctx.fillRect(5,v.type.h-12,7,5);ctx.fillRect(v.type.w-12,v.type.h-12,7,5);if(v.type.name==='BUS'){ctx.fillStyle='#e5f1f1';ctx.font='bold 9px sans-serif';ctx.fillText('ঢাকা',13,v.type.h*.34)}}
      ctx.fillStyle='#1b211f';ctx.fillRect(0,14,5,16);ctx.fillRect(v.type.w-5,14,5,16);ctx.fillRect(0,v.type.h-22,5,16);ctx.fillRect(v.type.w-5,v.type.h-22,5,16);
    }
    ctx.restore();
  }
  function drawBike(){
    ctx.save();ctx.translate(bike.x,bike.y);ctx.rotate(bike.lean*.08);
    // shadow
    ctx.fillStyle='#1118';ctx.beginPath();ctx.ellipse(0,17,30,48,0,0,Math.PI*2);ctx.fill();
    // wheels
    rounded(-10,-44,20,27,8,'#101514','#4b5551');rounded(-11,25,22,24,8,'#101514','#4b5551');
    // bike body
    ctx.fillStyle='#d62b31';ctx.beginPath();ctx.moveTo(-16,-21);ctx.lineTo(-11,-36);ctx.quadraticCurveTo(0,-44,11,-36);ctx.lineTo(16,-17);ctx.lineTo(11,22);ctx.lineTo(-11,22);ctx.closePath();ctx.fill();
    ctx.fillStyle='#202b29';ctx.beginPath();ctx.ellipse(0,-12,12,21,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#e9f2e8';ctx.beginPath();ctx.ellipse(0,-36,7,5,0,0,Math.PI*2);ctx.fill();
    // rider and helmet
    ctx.fillStyle='#111b19';ctx.beginPath();ctx.ellipse(0,-4,13,20,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222e2c';ctx.beginPath();ctx.arc(0,-26,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#b6d5d2';ctx.fillRect(-8,-28,16,5);ctx.fillStyle='#e9c5a4';ctx.fillRect(-3,-18,6,5);
    ctx.strokeStyle='#0b1210';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-14,-19);ctx.lineTo(-22,-29);ctx.moveTo(14,-19);ctx.lineTo(22,-29);ctx.stroke();
    ctx.restore();
  }
  function draw(){ctx.clearRect(0,0,W,H);drawBackground();traffic.sort((a,b)=>a.y-b.y).forEach(drawVehicle);drawBike();
    // subtle vignette
    const g=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,620);g.addColorStop(0,'#0000');g.addColorStop(1,'#07110c55');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  }
  function spawn(){const lane=Math.floor(Math.random()*3);const type=vehicleTypes[Math.floor(Math.random()*vehicleTypes.length)];traffic.push({lane,x:roadX(175,lane)+(Math.random()-.5)*12,y:170,type,passed:false,vy:.7+Math.random()*.7});}
  function showToast(text){toast.textContent=text;toast.classList.add('show');toastTimer=0.85}
  function endGame(){running=false;crashed=true;speed=0;speedEl.textContent='0';finalScore.textContent=score;crashScreen.classList.remove('hidden')}
  function start(){running=true;crashed=false;speed=45;score=0;distance=0;roadOffset=0;spawnTimer=0;traffic=[];bike.x=W/2;bike.lean=0;scoreEl.textContent='0000';speedEl.textContent='45';startScreen.classList.add('hidden');crashScreen.classList.add('hidden');toast.classList.remove('show');last=performance.now();requestAnimationFrame(loop)}
  function loop(now){if(!running)return;const dt=Math.min((now-last)/1000,.04);last=now;distance+=speed*dt*.65;roadOffset=(roadOffset+speed*dt*1.5)%120;speed+=(keys.has('ArrowUp')||keys.has('w')?34:keys.has('ArrowDown')||keys.has('s')?-48:-7)*dt;speed=Math.max(0,Math.min(180,speed));
    const steer=(keys.has('ArrowRight')||keys.has('d')?1:0)-(keys.has('ArrowLeft')||keys.has('a')?1:0);bike.x+=steer*350*dt*(.5+speed/100);bike.lean=steer;bike.x=Math.max(180,Math.min(780,bike.x));
    spawnTimer+=dt;if(spawnTimer>Math.max(.42,1.1-speed/250)){spawnTimer=0;spawn()}
    for(let i=traffic.length-1;i>=0;i--){const v=traffic[i];v.y+=(1.3+speed*.75)*v.vy*dt*5;v.x=roadX(v.y,v.lane);if(v.y>bike.y-30&&v.y<bike.y+45){const nearX=Math.abs(v.x-bike.x);const vw=v.type.w*(.32+(v.y-170)/370*.82);if(nearX<(vw/2+15)){endGame();draw();return}}
      if(!v.passed&&v.y>bike.y+40){v.passed=true;const bonus=v.type.points;score+=bonus;scoreEl.textContent=String(score).padStart(4,'0');showToast('+'+bonus+' OVERTAKE!')}
      if(v.y>H+130)traffic.splice(i,1);
    }
    if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)toast.classList.remove('show')}
    speedEl.textContent=String(Math.round(speed));draw();requestAnimationFrame(loop)
  }
  document.getElementById('startBtn').addEventListener('click',start);document.getElementById('restartBtn').addEventListener('click',start);
  window.addEventListener('keydown',e=>{const k=e.key.length===1?e.key.toLowerCase():e.key;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();keys.add(k);if(k==='r'&&crashed)start();if((k==='Enter'||k===' ')&&!running&&!crashed)start()});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
  function bindHold(id,key){const el=document.getElementById(id);const down=e=>{e.preventDefault();keys.add(key)};const up=e=>{e.preventDefault();keys.delete(key)};el.addEventListener('pointerdown',down);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);el.addEventListener('pointerleave',up)}
  bindHold('leftBtn','ArrowLeft');bindHold('rightBtn','ArrowRight');bindHold('gasBtn','ArrowUp');bindHold('brakeBtn','ArrowDown');
  // attract screen animation
  function idle(){if(!running){roadOffset=(roadOffset+.5)%120;distance+=.4;draw()}requestAnimationFrame(idle)}idle();
})();
