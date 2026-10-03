const THEMES=[
 {id:"classic",name:"Classic Run",desc:"晴朗城市、標準三軌與快速節奏。",icon:"🚆",art:"art-classic"},
 {id:"neon",name:"Neon Night",desc:"霓虹夜城，速度逐步提升。",icon:"🌃",art:"art-neon"},
 {id:"sunset",name:"Sunset Rush",desc:"夕陽海岸與更密集的障礙。",icon:"🌇",art:"art-sunset"},
 {id:"frost",name:"Frost Line",desc:"冰藍地鐵線，適合挑戰高分。",icon:"❄️",art:"art-frost"}
];

const DEFAULT_KEYS={left:"ArrowLeft",right:"ArrowRight",jump:"ArrowUp",slide:"ArrowDown",pause:"Escape"};
const DEFAULT_PAD={left:"axis-left",right:"axis-right",jump:"button-0",slide:"button-1",pause:"button-9"};

const state={
 keys:{...DEFAULT_KEYS,...JSON.parse(localStorage.getItem("sw_keys")||"{}")},
 pad:{...DEFAULT_PAD,...JSON.parse(localStorage.getItem("sw_pad")||"{}")}
};

const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];

function go(page){$$(".page").forEach(x=>x.classList.remove("active"));$(`#page-${page}`)?.classList.add("active");history.replaceState(null,"","#"+page);}
function initNav(){
 $$("[data-page]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.page)));
 $("#mobileMenu").addEventListener("click",()=>$(".topbar").classList.toggle("menu-open"));
 const p=location.hash.replace("#","")||"home";go(["home","games","settings","about"].includes(p)?p:"home");
}
function renderGames(){
 $("#gameGrid").innerHTML=THEMES.map(t=>`<article class="game-card"><div class="game-art ${t.art}"><div class="game-icon">${t.icon}</div></div><div class="game-card-body"><h3>${t.name}</h3><p>${t.desc}</p><button class="primary" data-theme="${t.id}">PLAY</button></div></article>`).join("");
 $$("#gameGrid button").forEach(b=>b.onclick=()=>location.href=`game.html?theme=${encodeURIComponent(b.dataset.theme)}`);
}
function labelKey(k){return k===" "?"SPACE":k.length===1?k.toUpperCase():k.replace("Arrow","").replace("Escape","ESC").toUpperCase()}
function renderKeys(){
 const names={left:"向左",right:"向右",jump:"跳躍",slide:"滑行",pause:"暫停"};
 $("#keyBindings").innerHTML=Object.keys(names).map(k=>`<div class="bind-row"><span class="bind-action">${names[k]}</span><button class="bind-key" data-bind="${k}">${labelKey(state.keys[k])}</button></div>`).join("");
 $$("#keyBindings .bind-key").forEach(b=>b.onclick=()=>captureKey(b.dataset.bind,b));
}
function captureKey(action,btn){
 btn.classList.add("waiting");btn.textContent="按任意鍵…";
 const handler=e=>{e.preventDefault();state.keys[action]=e.key;localStorage.setItem("sw_keys",JSON.stringify(state.keys));window.removeEventListener("keydown",handler);renderKeys();};
 window.addEventListener("keydown",handler,{once:true});
}
function renderPad(){
 const names={left:"左移",right:"右移",jump:"跳躍",slide:"滑行",pause:"暫停"};
 $("#padBindings").innerHTML=Object.keys(names).map(k=>`<div class="bind-row"><span>${names[k]}</span><span class="muted">${state.pad[k]}</span></div>`).join("");
}
function resetKeys(){state.keys={...DEFAULT_KEYS};state.pad={...DEFAULT_PAD};localStorage.setItem("sw_keys",JSON.stringify(state.keys));localStorage.setItem("sw_pad",JSON.stringify(state.pad));renderKeys();renderPad();}
$("#resetKeys")?.addEventListener("click",resetKeys);

let lastPadId="";
function pollPad(){
 const pads=navigator.getGamepads?.()||[];
 const p=[...pads].find(Boolean);
 if(p){
   lastPadId=p.id;
   $("#globalPad").textContent="🎮 "+p.id.slice(0,45);
   $("#padInfo").textContent=`已連接：${p.id}`;
 }else{
   $("#globalPad").textContent="🎮 未偵測到控制器";
   $("#padInfo").textContent="等待控制器連接……";
 }
 requestAnimationFrame(pollPad);
}
initNav();renderGames();renderKeys();renderPad();pollPad();
