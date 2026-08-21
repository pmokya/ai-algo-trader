const signals=[
 {s:"RELIANCE",sig:"BUY",c:87,p:"₹1,482"},
 {s:"TCS",sig:"BUY",c:79,p:"₹3,421"},
 {s:"INFY",sig:"SELL",c:91,p:"₹1,612"},
 {s:"HDFCBANK",sig:"HOLD",c:64,p:"₹1,845"}
];
let running=false, tradeCount=0, pnl=0, pos=[];
const $=id=>document.getElementById(id);
function renderSignals(){
 $("signals").innerHTML=signals.map(x=>`<div class="signal"><div><div class="symbol">${x.s}</div><div class="confidence">${x.c}% confidence</div></div><div class="sig ${x.sig.toLowerCase()}">${x.sig}</div><div class="price">${x.p}</div></div>`).join("");
}
function renderPositions(){
 if(!pos.length){$("positionsList").className="empty";$("positionsList").textContent="No open positions";return}
 $("positionsList").className="";
 $("positionsList").innerHTML=pos.map(x=>`<div class="position"><div><b>${x.s}</b><div class="muted">Qty ${x.q} · Entry ₹${x.e}</div></div><div class="profit">+₹${x.p}</div></div>`).join("");
}
function log(msg){$("log").textContent=new Date().toLocaleTimeString()+" — "+msg+"\n"+$("log").textContent}
function setEngine(on){running=on;$("engine").textContent=on?"RUNNING":"STOPPED";$("engine").style.color=on?"#6ee7b7":"#ff7b8b";log(on?"Paper trading engine started":"Paper trading engine stopped")}
$("start").onclick=()=>setEngine(true);
$("stop").onclick=()=>setEngine(false);
$("emergency").onclick=()=>{setEngine(false);pos=[];renderPositions();log("EMERGENCY STOP — all paper positions closed")};
renderSignals();renderPositions();$("engine").style.color="#ff7b8b";
