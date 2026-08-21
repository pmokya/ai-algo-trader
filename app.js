const START_CAPITAL=100000;
let running=false, points=[{t:"09:15",v:START_CAPITAL}], peak=START_CAPITAL, maxDD=0, timer=null;
const signals=[{s:"RELIANCE",sig:"BUY",c:87,p:"₹1,482"},{s:"TCS",sig:"BUY",c:79,p:"₹3,421"},{s:"INFY",sig:"SELL",c:91,p:"₹1,612"},{s:"HDFCBANK",sig:"HOLD",c:64,p:"₹1,845"}];
const $=id=>document.getElementById(id);
const money=n=>"₹"+Math.round(n).toLocaleString("en-IN");
function log(x){$("log").textContent=new Date().toLocaleTimeString()+" — "+x+"\n"+$("log").textContent}
function renderSignals(){$("signals").innerHTML=signals.map(x=>`<div class="signal"><div><div class="symbol">${x.s}</div><div class="confidence">${x.c}% confidence</div></div><div class="sig ${x.sig.toLowerCase()}">${x.sig}</div><div class="price">${x.p}</div></div>`).join("")}
function current(){return points[points.length-1].v}
function draw(){
 const c=$("chart"),r=c.getBoundingClientRect(),d=devicePixelRatio||1;c.width=r.width*d;c.height=r.height*d;const ctx=c.getContext("2d");ctx.scale(d,d);
 const w=r.width,h=r.height,p={l:42,r:10,t:14,b:28};ctx.clearRect(0,0,w,h);
 const vals=points.map(x=>x.v), lo=Math.min(...vals,START_CAPITAL),hi=Math.max(...vals,START_CAPITAL),pad=Math.max(100,(hi-lo)*.18),min=lo-pad,max=hi+pad;
 const X=i=>p.l+(w-p.l-p.r)*(points.length<2?0:i/(points.length-1)),Y=v=>p.t+(h-p.t-p.b)*(1-(v-min)/(max-min));
 ctx.strokeStyle="#1a2a3e";ctx.lineWidth=1;for(let i=0;i<4;i++){let y=p.t+i*(h-p.t-p.b)/3;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke()}
 ctx.fillStyle="#8091a7";ctx.font="10px -apple-system";ctx.fillText(money(max),3,p.t+3);ctx.fillText(money(min),3,h-p.b);
 ctx.setLineDash([6,5]);ctx.strokeStyle="#7d8b9b";ctx.beginPath();ctx.moveTo(p.l,Y(START_CAPITAL));ctx.lineTo(w-p.r,Y(START_CAPITAL));ctx.stroke();ctx.setLineDash([]);
 ctx.strokeStyle="#6ee7b7";ctx.lineWidth=2.5;ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(X(i),Y(q.v)):ctx.moveTo(X(i),Y(q.v)));ctx.stroke();
 const q=points[points.length-1];ctx.fillStyle="#6ee7b7";ctx.beginPath();ctx.arc(X(points.length-1),Y(q.v),4,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#8091a7";ctx.fillText(points[0].t,p.l,h-8);ctx.fillText(q.t,w-42,h-8);
}
function render(){
 const v=current(),pnl=v-START_CAPITAL,pct=pnl/START_CAPITAL*100;
 $("capital").textContent=money(START_CAPITAL);$("current").textContent=money(v);$("pnl").textContent=(pnl>=0?"+":"")+money(pnl);
 $("pnl").style.color=pnl>=0?"#6ee7b7":"#ff7b8b";$("pnlPct").textContent=(pct>=0?"+":"")+pct.toFixed(2)+"%";
 $("pct2").textContent=(pct>=0?"+":"")+pct.toFixed(2)+"%";$("peak").textContent=money(peak);$("drawdown").textContent=money(maxDD);
 $("engine").textContent=running?"RUNNING":"STOPPED";$("engine").style.color=running?"#6ee7b7":"#ff7b8b";draw();
}
function tick(){
 if(!running)return;
 const last=current(), move=(Math.random()-.47)*220, v=Math.max(0,last+move), now=new Date(), t=now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",second:"2-digit"});
 points.push({t,v});peak=Math.max(peak,v);maxDD=Math.max(maxDD,peak-v);if(points.length>90)points.shift();render();
}
$("start").onclick=()=>{if(running)return;running=true;log("Paper portfolio tracking started at "+money(START_CAPITAL));render();timer=setInterval(tick,2000)}
$("stop").onclick=()=>{running=false;clearInterval(timer);log("Paper portfolio tracking stopped");render()}
$("emergency").onclick=()=>{running=false;clearInterval(timer);log("EMERGENCY STOP — paper strategy stopped");render()}
$("reset").onclick=()=>{running=false;clearInterval(timer);points=[{t:"09:15",v:START_CAPITAL}];peak=START_CAPITAL;maxDD=0;log("Paper trading day reset");render()}
window.addEventListener("resize",draw);renderSignals();render();
