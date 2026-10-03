const canvas=document.getElementById("gameCanvas"),ctx=canvas.getContext("2d");
const scoreEl=document.getElementById("score"),bestEl=document.getElementById("best"),multEl=document.getElementById("multiplier");
const params=new URLSearchParams(location.search),themeId=params.get("theme")||"classic";
const themes={
 classic:{sky:["#48c6ef","#2563eb"],ground:"#243447",accent:"#22d3ee",speed:7,spawn:900},
 neon:{sky:["#30106b","#090014"],ground:"#111827",accent:"#f472b6",speed:7.6,spawn:820},
 sunset:{sky:["#fb923c","#9f1239"],ground:"#3f2930",accent:"#facc15",speed:8,spawn:760},
 frost:{sky:["#67e8f9","#3730a3"],ground:"#18253e",accent:"#a5f3fc",speed:8.4,spawn:720}
};
const theme=themes[themeId]||themes.classic;
let W=innerWidth,H=innerHeight,dpr=Math.min(devicePixelRatio||1,2);
function resize(){W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;canvas.style.width=W+"px";canvas.style.height=H+"px";ctx.setTransform(dpr,0,0,dpr,0,0)}addEventListener("resize",resize);resize();

const defaults={left:"ArrowLeft",right:"ArrowRight",jump:"ArrowUp",slide:"ArrowDown",pause:"Escape"};
const keys={...defaults,...JSON.parse(localStorage.getItem("sw_keys")||"{}")};
const actionByKey=()=>({[keys.left]:"left",[keys.right]:"right",[keys.jump]:"jump",[keys.slide]:"slide",[keys.pause]:"pause"});
let lane=1,targetLane=1,jump=0,slide=0,score=0,best=Number(localStorage.getItem("sw_best_"+themeId)||0);
let speed=theme.speed,objects=[],particles=[],coins=[],running=true,paused=false,dead=false,last=performance.now(),spawnTimer=0,coinTimer=0,shake=0,combo=0,comboTimer=0;
bestEl.textContent=best;

function roadX(l){return W*(.5+(l-1)*.23)}
function act(a){
 if(dead)return;
 if(a==="left")targetLane=Math.max(0,targetLane-1);
 if(a==="right")targetLane=Math.min(2,targetLane+1);
 if(a==="jump"&&jump<=0&&slide<=0)jump=1;
 if(a==="slide"&&jump<=0)slide=.55;
 if(a==="pause")togglePause();
}
addEventListener("keydown",e=>{const a=actionByKey()[e.key];if(a){e.preventDefault();act(a)}if(e.key.toLowerCase()==="r"&&dead)restart()});
document.getElementById("pauseBtn").onclick=togglePause;
document.getElementById("resumeBtn").onclick=togglePause;
document.getElementById("restartBtn").onclick=restart;
document.getElementById("againBtn").onclick=restart;
document.getElementById("backBtn").onclick=()=>location.href="index.html#games";
document.getElementById("gameBackBtn").onclick=()=>location.href="index.html#games";
document.querySelectorAll("[data-touch]").forEach(b=>{b.addEventListener("pointerdown",e=>{e.preventDefault();act(b.dataset.touch)})});

let prevButtons=[];
function pollGamepad(){
 const p=[...(navigator.getGamepads?.()||[])].find(Boolean);
 if(p){
   const x=p.axes[0]||0;
   if(x<-.65 && !pollGamepad.l)act("left");
   if(x>.65 && !pollGamepad.r)act("right");
   pollGamepad.l=x<-.65;pollGamepad.r=x>.65;
   const now=p.buttons.map(b=>b.pressed);
   if(now[0]&&!prevButtons[0])act("jump");
   if(now[1]&&!prevButtons[1])act("slide");
   if(now[9]&&!prevButtons[9])act("pause");
   prevButtons=now;
 }
 requestAnimationFrame(pollGamepad);
}pollGamepad();

function togglePause(){if(dead)return;paused=!paused;document.getElementById("pauseOverlay").classList.toggle("hidden",!paused)}
function spawn(){
 const lane=Math.floor(Math.random()*3),kind=Math.random()<.55?"low":(Math.random()<.5?"high":"train");
 objects.push({lane,y:-80,kind,passed:false});
}
function spawnCoin(){
 const lane=Math.floor(Math.random()*3);coins.push({lane,y:-30,taken:false,spin:0});
}
function collide(o){
 const px=roadX(lane),oy=H*.76-jump*120;
 const ox=roadX(o.lane),oy2=o.y;
 if(Math.abs(px-ox)>55)return false;
 if(Math.abs(oy-oy2)>80)return false;
 if(o.kind==="low"&&jump>.15)return false;
 if(o.kind==="high"&&slide>0)return false;
 return true;
}
function addScore(n){score+=n;scoreEl.textContent=Math.floor(score);if(score>best){best=Math.floor(score);bestEl.textContent=best}}
function gameOver(){dead=true;running=false;const nb=best>=Math.floor(score)&&Math.floor(score)>Number(localStorage.getItem("sw_best_"+themeId)||0);localStorage.setItem("sw_best_"+themeId,best);document.getElementById("finalScore").textContent=Math.floor(score);document.getElementById("newBest").classList.toggle("hidden",!nb);document.getElementById("gameOver").classList.remove("hidden");beep(90,.18,"sawtooth")}
function restart(){objects=[];coins=[];particles=[];score=0;lane=1;targetLane=1;jump=0;slide=0;speed=theme.speed;dead=false;running=true;paused=false;spawnTimer=0;coinTimer=0;document.getElementById("gameOver").classList.add("hidden");document.getElementById("pauseOverlay").classList.add("hidden");scoreEl.textContent="0";multEl.textContent="1";last=performance.now();countdown()}
function countdown(){const el=document.getElementById("countdown");el.classList.remove("hidden");let n=3;el.textContent=n;const t=setInterval(()=>{n--;if(n===0){clearInterval(t);el.classList.add("hidden")}else el.textContent=n},500)}
function beep(freq,dur,type="sine"){try{const A=beep.ac||(beep.ac=new AudioContext()),o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,A.currentTime);g.gain.exponentialRampToValueAtTime(.001,A.currentTime+dur);o.connect(g).connect(A.destination);o.start();o.stop(A.currentTime+dur)}catch{}}

function drawBackground(){
 const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,theme.sky[0]);g.addColorStop(1,theme.sky[1]);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.25;for(let i=0;i<18;i++){const x=(i*97+score*0.4)%W;const h=70+(i%5)*35;ctx.fillStyle="#fff";ctx.fillRect(x,H*.45-h,50,h)}ctx.globalAlpha=1;
 const horizon=H*.48;ctx.fillStyle="#111827";ctx.fillRect(0,horizon,W,H-horizon);
 for(let l=0;l<3;l++){const x=roadX(l);ctx.strokeStyle="#8ea2b8";ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(x-40,H);ctx.lineTo(x-12,horizon);ctx.stroke();ctx.beginPath();ctx.moveTo(x+40,H);ctx.lineTo(x+12,horizon);ctx.stroke()}
 ctx.strokeStyle="#dbeafe55";ctx.lineWidth=3;const offset=(score*8)%55;for(let y=horizon+offset;y<H;y+=55){const p=(y-horizon)/(H-horizon);ctx.beginPath();ctx.moveTo(W*.2+p*W*.3,y);ctx.lineTo(W*.8-p*W*.3,y);ctx.stroke()}
}
function drawPlayer(){
 const x=roadX(lane)+(roadX(targetLane)-roadX(lane))*0.18,y=H*.76-jump*120;
 ctx.save();ctx.translate(x,y);
 ctx.globalAlpha=.25;ctx.beginPath();ctx.ellipse(0,12,35,10,0,0,Math.PI*2);ctx.fillStyle="#000";ctx.fill();ctx.globalAlpha=1;
 if(slide>0){ctx.fillStyle=theme.accent;ctx.fillRect(-38,-18,76,30);ctx.fillStyle="#fff";ctx.fillRect(-25,-12,15,10)}
 else{ctx.fillStyle=theme.accent;ctx.fillRect(-25,-55,50,55);ctx.beginPath();ctx.arc(0,-72,18,0,Math.PI*2);ctx.fillStyle="#f6c99a";ctx.fill();ctx.fillStyle="#101827";ctx.fillRect(-19,-86,38,9)}
 ctx.restore()
}
function drawObjects(){
 objects.forEach(o=>{const x=roadX(o.lane),y=o.y;ctx.save();ctx.translate(x,y);if(o.kind==="low"){ctx.fillStyle="#ef4444";ctx.fillRect(-38,-30,76,30);ctx.fillStyle="#fee2e2";ctx.fillRect(-25,-25,50,6)}else if(o.kind==="high"){ctx.fillStyle="#f59e0b";ctx.fillRect(-48,-95,96,22);ctx.fillStyle="#78350f";ctx.fillRect(-40,-73,12,73);ctx.fillRect(28,-73,12,73)}else{ctx.fillStyle="#64748b";ctx.fillRect(-42,-105,84,105);ctx.fillStyle="#22d3ee";ctx.fillRect(-30,-78,60,25);ctx.fillStyle="#0f172a";ctx.fillRect(-20,-43,40,18)}ctx.restore()});
 coins.forEach(c=>{const x=roadX(c.lane),y=c.y;c.spin+=.15;ctx.save();ctx.translate(x,y);ctx.scale(Math.max(.2,Math.abs(Math.cos(c.spin))),1);ctx.fillStyle="#facc15";ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.restore()})
}
function loop(now){
 const dt=Math.min(.032,(now-last)/1000);last=now;
 if(running&&!paused){
   score+=dt*4;speed+=dt*.015;spawnTimer+=dt*1000;coinTimer+=dt*1000;
   if(spawnTimer>Math.max(360,theme.spawn-score*.25)){spawnTimer=0;spawn()}
   if(coinTimer>600){coinTimer=0;spawnCoin()}
   jump=Math.max(0,jump-dt*1.7);slide=Math.max(0,slide-dt);
   objects.forEach(o=>o.y+=speed*dt*60);coins.forEach(c=>c.y+=speed*dt*60);
   objects=objects.filter(o=>o.y<H+140);coins=coins.filter(c=>c.y<H+60&&!c.taken);
   objects.forEach(o=>{if(!o.passed&&o.y>H*.78){o.passed=true;combo++;comboTimer=1.5;addScore(10+combo*2);beep(520+combo*12,.04)}})
   if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0)combo=0}multEl.textContent=Math.min(9,1+Math.floor(combo/4));
   objects.forEach(o=>{if(o.y>H*.68&&o.y<H*.83&&collide(o))gameOver()});
   coins.forEach(c=>{if(!c.taken&&Math.abs(roadX(lane)-roadX(c.lane))<50&&Math.abs(c.y-(H*.76-jump*120))<70){c.taken=true;addScore(50);beep(880,.06,"triangle")}})
 }
 drawBackground();drawObjects();drawPlayer();
 requestAnimationFrame(loop)
}
countdown();requestAnimationFrame(loop);
