const CAPITAL=100000;
let running=false,timer=null,points=[{t:"09:15:00",v:CAPITAL}],peak=CAPITAL,dd=0;
const stocks=[
 {s:"RELIANCE",p:1482.30,base:1482.30,a:"BUY",c:87},
 {s:"TCS",p:3421.10,base:3421.10,a:"BUY",c:79},
 {s:"INFY",p:1612.40,base:1612.40,a:"SELL",c:91},
 {s:"HDFCBANK",p:1845.20,base:1845.20,a:"HOLD",c:64},
 {s:"SBIN",p:1018.50,base:1018.50,a:"BUY",c:72},
 {s:"ICICIBANK",p:1392.80,base:1392.80,a:"HOLD",c:68}
];
const $=x=>document.getElementById(x), money=n=>"₹"+Math.round(n).toLocaleString("en-IN");
function log(x){$("log").textContent=new Date().toLocaleTimeString()+" — "+x+"\n"+$("log").textContent}
function renderWatch(){
 $("watchlist").innerHTML=stocks.map(x=>{let ch=(x.p-x.base)/x.base*100;return `<div class="quote"><div><div class="symbol">${x.s}</div><div class="muted">NSE · demo feed</div></div><div class="ltp">${money(x.p)}</div><div class="chg ${ch>=0?"up":"down"}">${ch>=0?"+":""}${ch.toFixed(2)}%</div></div>`}).join("")
}
function renderSignals(){
 $("signals").innerHTML=stocks.slice(0,4).map(x=>`<div class="signal"><div><b>${x.s}</b><div class="muted">${x.c}% confidence</div></div><div class="sig ${x.a.toLowerCase()}">${x.a}</div></div>`).join("")
}
function portfolio(){return points.at(-1).v}
function draw(){
 const c=$("chart"),r=c.getBoundingClientRect(),d=devicePixelRatio||1;c.width=r.width*d;c.height=r.height*d;let ctx=c.getContext("2d");ctx.scale(d,d);
 const w=r.width,h=r.height,p={l:44,r:10,t:12,b:26},vals=points.map(q=>q.v),lo=Math.min(CAPITAL,...vals),hi=Math.max(CAPITAL,...vals),pad=Math.max(80,(hi-lo)*.2),min=lo-pad,max=hi+pad;
 const X=i=>p.l+(w-p.l-p.r)*(points.length<2?0:i/(points.length-1)),Y=v=>p.t+(h-p.t-p.b)*(1-(v-min)/(max-min));
 ctx.clearRect(0,0,w,h);ctx.strokeStyle="#1a2a3e";ctx.lineWidth=1;
 for(let i=0;i<4;i++){let y=p.t+i*(h-p.t-p.b)/3;ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke()}
 ctx.setLineDash([6,5]);ctx.strokeStyle="#7d8b9b";ctx.beginPath();ctx.moveTo(p.l,Y(CAPITAL));ctx.lineTo(w-p.r,Y(CAPITAL));ctx.stroke();ctx.setLineDash([]);
 ctx.strokeStyle="#6ee7b7";ctx.lineWidth=2.5;ctx.beginPath();points.forEach((q,i)=>i?ctx.lineTo(X(i),Y(q.v)):ctx.moveTo(X(i),Y(q.v)));ctx.stroke();
 ctx.fillStyle="#6ee7b7";ctx.beginPath();ctx.arc(X(points.length-1),Y(points.at(-1).v),4,0,Math.PI*2);ctx.fill();
 ctx.fillStyle="#8091a7";ctx.font="10px -apple-system";ctx.fillText(money(max),3,p.t+3);ctx.fillText(money(min),3,h-p.b);ctx.fillText(points[0].t,p.l,h-7);ctx.fillText(points.at(-1).t,w-55,h-7);
}
function render(){
 let v=portfolio(),pnl=v-CAPITAL,pct=pnl/CAPITAL*100;
 $("current").textContent=money(v);$("pnl").textContent=(pnl>=0?"+":"")+money(pnl);$("pnl").style.color=pnl>=0?"#6ee7b7":"#ff7b8b";$("pnlPct").textContent=(pct>=0?"+":"")+pct.toFixed(2)+"%";$("drawdown").textContent=money(dd);
 $("engine").textContent=running?"RUNNING":"STOPPED";$("engine").style.color=running?"#6ee7b7":"#ff7b8b";$("lastUpdate").textContent=points.at(-1).t;draw();
}
function tick(){
 if(!running)return;
 stocks.forEach(x=>{x.p=Math.max(1,x.p+(Math.random()-.48)*3.2)});
 const v=Math.max(0,portfolio()+(Math.random()-.47)*180);let now=new Date(),t=now.toLocaleTimeString([], {hour12:false});
 points.push({t,v});if(points.length>100)points.shift();peak=Math.max(peak,v);dd=Math.max(dd,peak-v);renderWatch();render();$("feedStatus").textContent="SIMULATED";
}
$("start").onclick=()=>{if(running)return;running=true;log("Paper engine started. Simulated market ticks enabled.");render();timer=setInterval(tick,2000)}
$("stop").onclick=()=>{running=false;clearInterval(timer);log("Paper engine stopped.");render()}
$("emergency").onclick=()=>{running=false;clearInterval(timer);log("EMERGENCY STOP — paper engine stopped.");render()}
$("reset").onclick=()=>{running=false;clearInterval(timer);points=[{t:"09:15:00",v:CAPITAL}];peak=CAPITAL;dd=0;stocks.forEach(x=>x.p=x.base);log("Paper session reset.");renderWatch();render()}
window.addEventListener("resize",draw);renderWatch();renderSignals();render();
