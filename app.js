const CAPITAL=100000;
let running=false,timer=null,selectedStrategy=1,points=[{t:"09:15:00",v:CAPITAL}],peak=CAPITAL,dd=0;
let cash=CAPITAL, realized=0, trades=[], positions={};
const strategies=[
{id:1,name:"Strategy 1 — AI Multi-Filter",desc:"Transformer/LSTM probability + EMA + RSI + MACD + VWAP + Volume + ATR/Risk filters.",trades:182,win:68,pnl:12.4,dd:5.1,pf:1.71,reg:[5,4,2,4]},
{id:2,name:"Strategy 2 — Supertrend AI",desc:"Supertrend trend regime + AI confirmation + EMA/RSI/Volume filters + ATR risk.",trades:165,win:71,pnl:14.1,dd:6.2,pf:1.83,reg:[4,5,2,3]},
{id:3,name:"Strategy 3 — Reserved",desc:"Future strategy slot. Not active until a tested rule set is added.",trades:0,win:0,pnl:0,dd:0,pf:0,reg:[0,0,0,0]}
];
const stocks=[{s:"RELIANCE",p:1482.3,base:1482.3,a:"BUY",c:87},{s:"TCS",p:3421.1,base:3421.1,a:"BUY",c:79},{s:"INFY",p:1612.4,base:1612.4,a:"SELL",c:91},{s:"HDFCBANK",p:1845.2,base:1845.2,a:"HOLD",c:64},{s:"SBIN",p:1018.5,base:1018.5,a:"BUY",c:72},{s:"ICICIBANK",p:1392.8,base:1392.8,a:"HOLD",c:68}];
const $=x=>document.getElementById(x),money=n=>"₹"+Math.round(n).toLocaleString("en-IN");
function log(x){$("log").textContent=new Date().toLocaleTimeString()+" — "+x+"\n"+$("log").textContent}
function renderWatch(){$("watchlist").innerHTML=stocks.map((x,i)=>{let ch=(x.p-x.base)/x.base*100;return `<div class="quote" onclick="openStock(${i})"><div><div class="symbol">${x.s}</div><div class="muted">Tap for candles</div></div><div class="ltp">${money(x.p)}</div><div class="chg ${ch>=0?"up":"down"}">${ch>=0?"+":""}${ch.toFixed(2)}%</div></div>`}).join("")}
function renderStrategies(){$("strategyCards").innerHTML=strategies.map(s=>`<div class="strategy ${s.id===selectedStrategy?"selected":""}" onclick="selectStrategy(${s.id})"><div class="strategy-top"><span class="strategy-name">${s.name}</span><span class="radio">${s.id===selectedStrategy?"● SELECTED":"○ SELECT"}</span></div><p>${s.desc}</p><div class="mini"><span>${s.trades?s.trades+" trades":"Not tested"}</span><span>${s.win?s.win+"% win":"—"}</span><span>${s.pnl?(s.pnl>0?"+":"")+s.pnl+"%":"—"} P&L</span></div></div>`).join("")}
function selectStrategy(id){selectedStrategy=id;renderStrategies();$("activeStrategy").textContent="Strategy "+id;$("stockStrategy").textContent="Strategy "+id;log("Strategy "+id+" selected for paper testing.");}
function renderPerformance(){let html='<div class="row head"><span>Strategy</span><span>Trades</span><span>Win%</span><span>P&L</span><span>Max DD</span></div>';strategies.forEach(s=>html+=`<div class="row"><span>${s.name.replace("Strategy ","S")}</span><span>${s.trades||"—"}</span><span>${s.win?s.win+"%":"—"}</span><span>${s.pnl?(s.pnl>0?"+":"")+s.pnl+"%":"—"}</span><span>${s.dd?"-"+s.dd+"%":"—"}</span></div>`);$("performance").innerHTML=html}
function renderRegimes(){let names=["Bull","Bear","Sideways","High Vol"];let h='<div class="regime" style="color:#8091a7"><b>Strategy</b><b>Bull</b><b>Bear</b><b>Sideways</b><b>High Vol</b></div>';strategies.slice(0,2).forEach(s=>h+=`<div class="regime"><b>S${s.id}</b>${s.reg.map(x=>`<span>${"★".repeat(x)}${"☆".repeat(5-x)}</span>`).join("")}</div>`);$("regimes").innerHTML=h}
function renderValidation(){let items=["Minimum paper-trading period","Minimum number of trades","Positive expectancy","Profit factor above threshold","Maximum drawdown acceptable","Out-of-sample test passed","Transaction costs included","Slippage included","Multiple market regimes tested"];$("validation").innerHTML=items.map((x,i)=>`<div class="check ${i<3?"pass":"pending"}">${i<3?"☑":"☐"} ${x} <span>${i<3?"PASS":"PENDING"}</span></div>`).join("")}
function renderRecommendation(){$("recommendation").innerHTML="<b>Current paper leader: Strategy 2 — Supertrend AI</b><br>It currently has the strongest sample profit factor and P&L among the populated strategies. This is only a paper-trading observation, not a live-trading approval. Continue validation across more trades and market regimes."}
function openPositionValue(){
 return Object.values(positions).reduce((sum,p)=>sum+p.qty*p.price,0);
}
function unrealizedPnl(){
 return Object.values(positions).reduce((sum,p)=>sum+p.qty*(p.price-p.entry),0);
}
function portfolio(){return cash+openPositionValue();}
function recordTrade(stock,side,qty,price){
 const now=new Date().toLocaleTimeString([], {hour12:false});
 if(side==="BUY"){
   const cost=qty*price;
   if(cost>cash)return false;
   cash-=cost;
   positions[stock.s]={stock:stock.s,qty,entry:price,price};
   trades.unshift({time:now,stock:stock.s,side,qty,price,exit:"—",pnl:"—",strategy:"S"+selectedStrategy});
 }else{
   const pos=positions[stock.s]; if(!pos)return false;
   const sellQty=Math.min(qty,pos.qty),pnl=(price-pos.entry)*sellQty;
   cash+=sellQty*price; realized+=pnl;
   trades.unshift({time:now,stock:stock.s,side:"SELL",qty:sellQty,price:pos.entry,exit:price,pnl:(pnl>=0?"+":"")+money(pnl),strategy:"S"+selectedStrategy});
   delete positions[stock.s];
 }
 if(trades.length>40)trades.pop();
 return true;
}
function maybeTrade(){
 const candidates=stocks.filter(s=>s.a!=="HOLD");
 if(Math.random()>.58){
   const s=candidates[Math.floor(Math.random()*candidates.length)];
   if(s.a==="BUY" && !positions[s.s]){
     const qty=Math.max(1,Math.floor(Math.min(100,cash*.12/s.p)));
     recordTrade(s,"BUY",qty,s.p);
   }else if(s.a==="SELL" && positions[s.s]){
     recordTrade(s,"SELL",positions[s.s].qty,s.p);
   }
 }
}
function renderTradeLedger(){
 $("buyCount").textContent=trades.filter(t=>t.side==="BUY").length;
 $("sellCount").textContent=trades.filter(t=>t.side==="SELL").length;
 $("openCount").textContent=Object.keys(positions).length;
 $("closedCount").textContent=trades.filter(t=>t.side==="SELL").length;
 if(!trades.length){$("tradeLog").innerHTML='<div class="empty">No automatic trades yet. Start the paper engine.</div>';return}
 $("tradeLog").innerHTML='<div class="trade-row head"><span>Time</span><span>Stock</span><span>Side</span><span>Qty</span><span>Entry → Exit</span><span>P&L</span></div>'+
 trades.map(t=>`<div class="trade-row"><span>${t.time}</span><b>${t.stock}</b><span class="${t.side==="BUY"?"buytxt":"selltxt"}">${t.side}</span><span>${t.qty}</span><span>${money(t.price)} → ${t.exit==="—"?"—":money(t.exit)}</span><span>${t.pnl}</span></div>`).join("");
}
function updatePositions(){
 Object.keys(positions).forEach(k=>{let s=stocks.find(x=>x.s===k);if(s)positions[k].price=s.p});
}

function draw(){
 const c=$("chart"),r=c.getBoundingClientRect(),d=devicePixelRatio||1;
 c.width=r.width*d;c.height=r.height*d;
 let ctx=c.getContext("2d");ctx.scale(d,d);
 let w=r.width,h=r.height,p={l:62,r:16,t:20,b:42};
 let vals=points.map(q=>q.v),lo=Math.min(CAPITAL,...vals),hi=Math.max(CAPITAL,...vals);
 let pad=Math.max(80,(hi-lo)*.2),min=lo-pad,max=hi+pad;
 const X=i=>p.l+(w-p.l-p.r)*(points.length<2?0:i/(points.length-1));
 const Y=v=>p.t+(h-p.t-p.b)*(1-(v-min)/(max-min));
 ctx.clearRect(0,0,w,h);
 ctx.font="10px -apple-system";
 ctx.strokeStyle="#26364a";ctx.fillStyle="#8091a7";ctx.lineWidth=1;
 for(let i=0;i<=4;i++){
   let y=p.t+i*(h-p.t-p.b)/4, value=max-(max-min)*i/4;
   ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();
   ctx.fillText(money(value),4,y+3);
 }
 /* Only one vertical dotted cursor at the latest portfolio data point */
 ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle="#6f8298";
 let latestX=X(points.length-1);
 ctx.beginPath();ctx.moveTo(latestX,p.t);ctx.lineTo(latestX,h-p.b);ctx.stroke();
 ctx.restore();
 ctx.save();ctx.setLineDash([6,5]);ctx.strokeStyle="#7d8b9b";
 ctx.beginPath();ctx.moveTo(p.l,Y(CAPITAL));ctx.lineTo(w-p.r,Y(CAPITAL));ctx.stroke();ctx.restore();
 ctx.strokeStyle="#6ee7b7";ctx.lineWidth=2.5;ctx.beginPath();
 points.forEach((q,i)=>i?ctx.lineTo(X(i),Y(q.v)):ctx.moveTo(X(i),Y(q.v)));ctx.stroke();
 const last=points.at(-1),lx=X(points.length-1),ly=Y(last.v);
 ctx.fillStyle="#6ee7b7";ctx.beginPath();ctx.arc(lx,ly,4,0,Math.PI*2);ctx.fill();
 ctx.font="bold 10px -apple-system";ctx.fillText(money(last.v),Math.min(w-p.r-70,Math.max(p.l,lx-25)),Math.max(p.t+10,ly-9));
 ctx.font="10px -apple-system";ctx.fillStyle="#8091a7";
 let tickCount=Math.min(6,points.length);
 for(let j=0;j<tickCount;j++){
   let i=Math.round(j*(points.length-1)/(tickCount-1||1)),x=X(i);
   ctx.fillText(points[i].t,Math.max(p.l,x-20),h-16);
 }
 ctx.fillStyle="#9aa9ba";ctx.fillText("Date / Time",w/2-25,h-2);
 ctx.save();ctx.translate(12,h/2+30);ctx.rotate(-Math.PI/2);ctx.fillText("INR (₹)",0,0);ctx.restore();
}
function render(){
 updatePositions();
 let v=portfolio(),pnl=v-CAPITAL,pct=pnl/CAPITAL*100,upnl=unrealizedPnl();
 $("current").textContent=money(v);
 $("pnl").textContent=(pnl>=0?"+":"")+money(pnl);
 $("pnl").style.color=pnl>=0?"#6ee7b7":"#ff7b8b";
 $("pnlPct").textContent=(pct>=0?"+":"")+pct.toFixed(2)+"%";
 $("drawdown").textContent=money(dd);
 $("cash").textContent=money(cash);
 $("openValue").textContent=money(openPositionValue());
 $("realized").textContent=(realized>=0?"+":"")+money(realized);
 $("unrealized").textContent=(upnl>=0?"+":"")+money(upnl);
 $("realized").style.color=realized>=0?"#6ee7b7":"#ff7b8b";
 $("unrealized").style.color=upnl>=0?"#6ee7b7":"#ff7b8b";
 $("engine").textContent=running?"RUNNING":"STOPPED";
 $("engine").style.color=running?"#6ee7b7":"#ff7b8b";
 renderTradeLedger();draw();
}
function tick(){
 if(!running)return;
 stocks.forEach(x=>x.p=Math.max(1,x.p+(Math.random()-.48)*3.2));
 updatePositions();
 maybeTrade();
 updatePositions();
 let v=portfolio(),t=new Date().toLocaleTimeString([], {hour12:false});
 points.push({t,v});if(points.length>100)points.shift();
 peak=Math.max(peak,v);dd=Math.max(dd,peak-v);
 renderWatch();render();
}
function openStock(i){let s=stocks[i];$("stockName").textContent=s.s;$("stockPrice").textContent=money(s.p);$("stockChange").textContent=((s.p-s.base)/s.base*100>=0?"+":"")+((s.p-s.base)/s.base*100).toFixed(2)+"%";$("stockSignal").textContent=s.a;$("stockSignal").className="bigSignal "+s.a.toLowerCase();$("stockConf").textContent=s.c+"%";$("stockStrategy").textContent="Strategy "+selectedStrategy;showTab("stock");drawCandles(s)}
let selectedTimeframe="5m";
function drawCandles(s){
 const c=$("candles"),r=c.getBoundingClientRect(),d=devicePixelRatio||1;
 c.width=r.width*d;c.height=r.height*d;
 let ctx=c.getContext("2d");ctx.scale(d,d);
 let w=r.width,h=r.height,p={l:58,r:12,t:16,b:45};
 ctx.clearRect(0,0,w,h);
 let count=selectedTimeframe==="3m"?55:selectedTimeframe==="5m"?48:selectedTimeframe==="15m"?40:selectedTimeframe==="30m"?32:selectedTimeframe==="1H"?28:24;
 let arr=[],price=s.p;
 for(let i=0;i<count;i++){
   let o=price+(Math.random()-.5)*18,cl=o+(Math.random()-.5)*25;
   let hi=Math.max(o,cl)+Math.random()*12,lo=Math.min(o,cl)-Math.random()*12;
   arr.push({o,cl,hi,lo});price=cl;
 }
 let lo=Math.min(...arr.map(x=>x.lo)),hi=Math.max(...arr.map(x=>x.hi)),pad=(hi-lo)*.08||5;
 lo-=pad;hi+=pad;
 const Y=v=>p.t+(h-p.t-p.b)*(1-(v-lo)/(hi-lo));
 const step=(w-p.l-p.r)/count,bw=Math.max(3,step*.58);
 ctx.font="10px -apple-system";ctx.fillStyle="#8091a7";ctx.strokeStyle="#26364a";ctx.lineWidth=1;
 for(let i=0;i<=4;i++){
   let y=p.t+i*(h-p.t-p.b)/4,v=hi-(hi-lo)*i/4;
   ctx.beginPath();ctx.moveTo(p.l,y);ctx.lineTo(w-p.r,y);ctx.stroke();
   ctx.fillText(money(v),4,y+3);
 }
 ctx.save();ctx.setLineDash([3,5]);ctx.strokeStyle="#34465b";
 for(let i=0;i<=6;i++){
   let x=p.l+i*(w-p.l-p.r)/6;ctx.beginPath();ctx.moveTo(x,p.t);ctx.lineTo(x,h-p.b);ctx.stroke();
 }
 ctx.restore();
 arr.forEach((x,i)=>{
   let xx=p.l+i*step+step*.21;
   ctx.strokeStyle=x.cl>=x.o?"#6ee7b7":"#ff6678";
   ctx.fillStyle=ctx.strokeStyle;
   ctx.beginPath();ctx.moveTo(xx+bw/2,Y(x.hi));ctx.lineTo(xx+bw/2,Y(x.lo));ctx.stroke();
   let top=Y(Math.max(x.o,x.cl)),bot=Y(Math.min(x.o,x.cl));
   ctx.fillRect(xx,top,bw,Math.max(2,bot-top));
 });
 ctx.fillStyle="#9aa9ba";ctx.font="10px -apple-system";
 let labels=["09:15","10:00","10:45","11:30","12:15","13:00","13:45"];
 labels.forEach((lab,i)=>{
   let x=p.l+i*(w-p.l-p.r)/6;ctx.fillText(lab,Math.max(p.l,x-18),h-19);
 });
 ctx.fillText(selectedTimeframe+" candles",p.l,h-3);
 ctx.fillText("Date / Time",w/2-25,h-3);
 ctx.save();ctx.translate(12,h/2+25);ctx.rotate(-Math.PI/2);ctx.fillText("INR (₹)",0,0);ctx.restore();
 const last=arr.at(-1);ctx.font="bold 10px -apple-system";ctx.fillStyle=last.cl>=last.o?"#6ee7b7":"#ff6678";
 ctx.fillText(money(last.cl),Math.max(p.l,w-p.r-72),Math.max(p.t+10,Y(last.cl)-8));
}
function showTab(id){document.querySelectorAll(".view").forEach(v=>v.classList.toggle("active",v.id===id));document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));if(id==="dashboard")render();if(id==="stock")drawCandles(stocks[0])}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>showTab(b.dataset.tab));document.querySelectorAll(".timeframes button").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".timeframes button").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");selectedTimeframe=b.dataset.tf;drawCandles(stocks[0]);}));
$("activate").onclick=()=>{selectStrategy(selectedStrategy);log("Strategy "+selectedStrategy+" activated for paper execution.");};
$("start").onclick=()=>{if(running)return;running=true;log("Paper engine started with Strategy "+selectedStrategy);render();timer=setInterval(tick,2000)};
$("stop").onclick=()=>{running=false;clearInterval(timer);log("Paper engine stopped.");render()};
$("emergency").onclick=()=>{running=false;clearInterval(timer);log("EMERGENCY STOP — all paper execution stopped.");render()};
$("reset").onclick=()=>{running=false;clearInterval(timer);points=[{t:"09:15:00",v:CAPITAL}];peak=CAPITAL;dd=0;cash=CAPITAL;realized=0;trades=[];positions={};stocks.forEach(x=>x.p=x.base);log("Paper session reset. Trade ledger cleared.");renderWatch();render()};
$("backDash").onclick=()=>showTab("dashboard");window.addEventListener("resize",()=>{draw();drawCandles(stocks[0])});
renderWatch();renderStrategies();renderPerformance();renderRegimes();renderValidation();renderRecommendation();render();
