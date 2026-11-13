/* 本地模拟原型。无网络调用，无存储写入，无生产配置操作。 */
'use strict';
const $ = id => document.getElementById(id);
const slotNames = {open:'开屏广告',banner:'横幅广告',interstitial:'插屏广告',rewarded:'激励视频广告'};
const campaigns = {
  'pay-a': {name:'B 包 A',pkg:'demo.example.b.a',type:'b'},
  connect: {name:'客服 B 包',pkg:'示例客服投放 #202',type:'cs'},
  'pay-b': {name:'B 包 B',pkg:'demo.example.b.b',type:'b'}
};
const events = [];
function add(c,u,t,slot='rewarded',amount=0){events.push({campaign:c,user:u,time:Date.parse(t+'+05:30'),slot,amount});}
// 两类默认报表均为10/5/5；重复行为和历史首次全部保留，用集合实时计算。
for(const c of ['pay-a','connect']){
  for(let i=1;i<=5;i++){
    add(c,'历史用户'+i,'2026-10-28T10:00:00','open',2);
    add(c,'历史用户'+i,'2026-11-09T09:00:00','banner',3);
    add(c,'历史用户'+i,'2026-11-12T09:00:00','open',4);
    add(c,'历史用户'+i,'2026-11-13T09:00:00','rewarded',5);
    add(c,'历史用户'+i,'2026-11-13T10:00:00','banner',3);
    add(c,'本周新用户'+i,'2026-11-13T11:00:00','rewarded',6);
    add(c,'本周新用户'+i,'2026-11-13T11:30:00','interstitial',2);
  }
  add(c,'周内回访用户','2026-11-09T08:00:00','banner',3);
  add(c,'周内回访用户','2026-11-10T08:00:00','rewarded',4);
  add(c,'周内回访用户','2026-11-11T08:00:00','rewarded',2);
}
// 同一用户已在A包付费，在B包仍是首次；包内不跨包查首次。
add('pay-b','历史用户1','2026-11-13T09:00:00','rewarded',7);
add('pay-b','历史用户1','2026-11-13T10:00:00','banner',2);
let campaign = 'pay-a', granularity = 'day', chosenSlots = Object.keys(slotNames);
let requestVersion = 0, rows = [], appliedStart = '2026-11-13', appliedEnd = '2026-11-13';
const offset = 19800000, hour = 3600000, day = hour*24;
// 演示账本的固定截止时间，避免模拟数据跟随真实系统时钟变化。
const demoNow = Date.parse('2026-11-13T18:00:00+05:30');
const fmt = n => n.toLocaleString('en-US');
const iso = t => new Date(t+offset).toISOString();
const dateText = t => iso(t).slice(0,10);
function bucketStart(t,g){
  const d=new Date(t+offset);
  if(g==='hour')d.setUTCMinutes(0,0,0);
  else {d.setUTCHours(0,0,0,0);if(g==='week')d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));if(g==='month')d.setUTCDate(1);}
  return d.getTime()-offset;
}
function bucketNext(t,g){
  if(g==='hour')return t+hour;if(g==='day')return t+day;if(g==='week')return t+7*day;
  const d=new Date(t+offset);d.setUTCMonth(d.getUTCMonth()+1);return d.getTime()-offset;
}
function compute(c,g,start,end,slots,zero=false){
  const history=events.filter(e=>e.campaign===c), first=new Map();
  for(const e of history)first.set(e.user,Math.min(first.get(e.user)??Infinity,e.time));
  const result=[];let loops=0;
  for(let b=bucketStart(start,g);b<end&&loops++<1000;b=bucketNext(b,g)){
    const s=Math.max(b,start),e=Math.min(bucketNext(b,g),end);
    const selected=zero?[]:history.filter(x=>x.time>=s&&x.time<e&&x.time<=demoNow&&slots.includes(x.slot));
    const users=[...new Set(selected.map(x=>x.user))];
    const fresh=users.filter(u=>first.get(u)>=s&&first.get(u)<e).length;
    let label=dateText(b);
    if(g==='hour')label+=' '+iso(b).slice(11,16);
    if(g==='week')label=dateText(s)+' ~ '+dateText(e-1);
    if(g==='month')label=iso(b).slice(0,7);
    // 以下旧指标为场景示例，从事件数推导模拟量，非真实业务算法。
    result.push({start:s,end:e,label,total:users.length,old:users.length-fresh,new:fresh,amount:selected.reduce((a,x)=>a+x.amount,0),show:selected.length*57,click:selected.length*4,install:users.length*2});
  }
  return result;
}
function metricLabel(){return campaigns[campaign].type==='cs'?'建联人数':'付费人数';}
function updateShell(){
  const c=campaigns[campaign];$('detailTitle').textContent='数据详情 - '+c.name;$('packageName').textContent=c.pkg;
  $('campaignType').textContent=c.type==='cs'?'客服建联':'应用拉活';
  $('columnRule').textContent=c.type==='cs'?'建联人数（总/老/新）在原建联位置展示。示例10/5/5。':'新增付费人数（总/老/新）一列，保留付费金额，不显示建联列。';
  $('metricNote').textContent=metricLabel()+'按当前 B 包内用户去重；新老以每行统计周期及首次行为时间判断。';
  const options=c.type==='cs'?[['show','展示'],['click','点击'],['total','建联人数']]:[['install','安装'],['show','展示'],['click','点击'],['amount','付费金额']];
  $('chartMetric').replaceChildren(...options.map(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));
  $('chartMetric').value=c.type==='cs'?'total':'amount';
}
function stateMessage(title,description,retry=false){
  const box=$('status');box.replaceChildren();const h=document.createElement('strong');h.textContent=title;box.append(h,document.createTextNode(description));
  if(retry){const b=document.createElement('button');b.textContent='重试';b.onclick=()=>{$('demoState').value='ready';refresh();};box.append(b);}
  box.hidden=false;$('results').hidden=true;
}
function renderTable(unavailable=false){
  const cs=campaigns[campaign].type==='cs', m=metricLabel();
  const heads=['日期','广告位',...(cs?[]:['安装']),'展示','点击',...(cs?[]:['付费金额']),m+'（总/老/新）'];
  const table=document.createElement('table'),thead=table.createTHead(),header=thead.insertRow();
  heads.forEach((h,i)=>{const th=document.createElement('th');th.textContent=h;if(i>1)th.className='num';if(i===heads.length-1)th.classList.add('person-head');header.append(th);});
  const body=table.createTBody();
  for(const r of rows){
    const row=body.insertRow();const cells=[r.label,chosenSlots.length===4?'全部广告位':chosenSlots.map(s=>slotNames[s]).join('、'),...(cs?[]:[fmt(r.install)]),fmt(r.show),fmt(r.click),...(cs?[]:['$'+r.amount.toFixed(2)]),unavailable?'—':`${fmt(r.total)}/${fmt(r.old)}/${fmt(r.new)}`];
    cells.forEach((v,i)=>{const td=row.insertCell();td.textContent=v;if(i>1)td.className='num';if(i===1)td.className='slots-cell';if(!cs&&i===cells.length-2)td.classList.add('revenue-col');if(i===cells.length-1){td.classList.add('person-col');td.title=unavailable?'人数数据尚未就绪':`总人数 ${r.total} 人 / 老人数 ${r.old} 人 / 新人数 ${r.new} 人。按当前B包、当前周期去重。`;}});
  }
  $('dataTable').replaceChildren(table);
  if(unavailable)$('metricNote').textContent='人数数据尚未就绪。示例：历史首次时间暂不可还原；— 不等于 0。';
}
function renderChart(unavailable=false){
  const key=$('chartMetric').value, label=$('chartMetric').selectedOptions[0]?.textContent||'';
  if(unavailable&&key==='total'){$('chart').innerHTML='<div class="state-message">人数数据尚未就绪</div>';return;}
  const width=780,height=220,left=54,right=22,top=15,bottom=38,chartW=width-left-right,chartH=height-top-bottom;
  const colors={install:'#3b82f6',show:'#06b6d4',click:'#f97316',amount:'#eab308',total:'#a855f7'},color=colors[key]||'#3b82f6';
  const max=Math.max(1,...rows.map(r=>r[key]||0));let svg=`<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}趋势，模拟数据"><title>${label}趋势，模拟数据</title>`;
  for(let i=0;i<=4;i++){const y=top+chartH*i/4;svg+=`<line x1="${left}" y1="${y}" x2="${width-right}" y2="${y}" stroke="#333c4c" stroke-dasharray="4 4"/><text x="${left-8}" y="${y+4}" text-anchor="end" font-size="10" fill="#9ca3af">${Math.round(max*(1-i/4)*10)/10}</text>`;}
  const xAt=i=>left+(rows.length<2?chartW/2:i*chartW/(rows.length-1));
  const points=rows.map((r,i)=>`${xAt(i)},${top+chartH*(1-(r[key]||0)/max)}`).join(' ');
  svg+=`<polyline fill="none" stroke="${color}" stroke-width="2.5" points="${points}"/>`;
  rows.forEach((r,i)=>{const x=xAt(i),y=top+chartH*(1-(r[key]||0)/max);svg+=`<circle cx="${x}" cy="${y}" r="3" fill="${color}"><title>${r.label} · ${label}：${r[key]}</title></circle>`;if(i%Math.max(1,Math.ceil(rows.length/5))===0||i===rows.length-1){let text=granularity==='hour'?r.label.slice(5):r.label;if(text.length>18)text=text.slice(5);svg+=`<text x="${x}" y="${height-11}" text-anchor="middle" font-size="9" fill="#9ca3af">${text}</text>`;}});
  $('chart').innerHTML=svg+'</svg>';
}
async function refresh(){
  const from=$('startDate').value,to=$('endDate').value;
  $('validation').hidden=true;
  let error='';if(!from||!to)error='请选择完整日期范围';else if(from>to)error='开始日期不能晚于结束日期';
  const start=Date.parse(from+'T00:00:00+05:30'),end=Date.parse(to+'T00:00:00+05:30')+day;
  if(!error){let count=0;for(let b=bucketStart(start,granularity);b<end&&count<=1000;b=bucketNext(b,granularity))count++;if(count>1000)error='原型演示最多展示 1,000 个时间桶；这是本地演示限制，不是新增业务限制。';}
  if(error){$('validation').textContent=error;$('validation').hidden=false;return;}
  appliedStart=from;appliedEnd=to;
  const version=++requestVersion;$('update').disabled=true;
  stateMessage('正在加载数据','按当前 B 包与统计周期重新去重…');
  $('queryCaption').textContent=`${from} 至 ${to} · 模拟截止：11-13 18:00`;
  await new Promise(resolve=>setTimeout(resolve,240));
  if(version!==requestVersion)return;
  const state=$('demoState').value;
  if(state==='loading')return;
  $('update').disabled=false;
  if(state==='error'){stateMessage('数据加载失败','请重试，当前筛选条件已保留。',true);return;}
  if(state==='forbidden'){stateMessage('无权查看该投放数据','请关闭详情并联系管理员核对权限。');return;}
  if(state==='empty'){stateMessage('当前条件下暂无可展示数据','请调整日期范围或广告位。');return;}
  rows=compute(campaign,granularity,start,end,chosenSlots,state==='zero');
  $('status').hidden=true;$('results').hidden=false;
  $('metricNote').textContent=metricLabel()+'按当前 B 包内用户去重；新老以每行统计周期及首次行为时间判断。';
  renderTable(state==='unavailable');renderChart(state==='unavailable');
}
function openCampaign(id){campaign=id;$('campaign').value=id;$('demoState').value='ready';$('detailView').hidden=false;$('detailBackdrop').hidden=false;document.body.classList.add('has-detail');updateShell();refresh();}
function closeDetail(){requestVersion++;$('detailView').hidden=true;$('detailBackdrop').hidden=true;document.body.classList.remove('has-detail');}
$('campaign').addEventListener('change',e=>openCampaign(e.target.value));
$('demoState').addEventListener('change',refresh);
$('update').addEventListener('click',refresh);
$('chartMetric').addEventListener('change',()=>renderChart($('demoState').value==='unavailable'));
$('slots').addEventListener('click',e=>{const b=e.target.closest('[data-slot]');if(!b)return;const s=b.dataset.slot;chosenSlots=chosenSlots.includes(s)?chosenSlots.filter(x=>x!==s):[...chosenSlots,s];if(!chosenSlots.length)chosenSlots=Object.keys(slotNames);document.querySelectorAll('[data-slot]').forEach(x=>x.setAttribute('aria-pressed',String(chosenSlots.includes(x.dataset.slot))));refresh();});
$('granularities').addEventListener('click',e=>{const b=e.target.closest('[data-gran]');if(!b)return;granularity=b.dataset.gran;document.querySelectorAll('[data-gran]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.gran===granularity)));refresh();});
$('closeDetail').addEventListener('click',closeDetail);
$('rulesButton').addEventListener('click',()=>{const panel=$('rulesPanel');panel.hidden=!panel.hidden;$('rulesButton').setAttribute('aria-expanded',String(!panel.hidden));$('rulesButton').textContent=panel.hidden?'需求标注':'收起标注';});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('ledgerDialog').open){if(!$('rulesPanel').hidden){$('rulesPanel').hidden=true;$('rulesButton').setAttribute('aria-expanded','false');$('rulesButton').textContent='需求标注';}else closeDetail();}});
$('listView').addEventListener('click',e=>{const b=e.target.closest('[data-open]');if(b)openCampaign(b.dataset.open);});
$('closeLedger').addEventListener('click',()=>$('ledgerDialog').close());
$('ledgerButton').addEventListener('click',()=>{
  const table=document.createElement('table'),head=table.createTHead().insertRow();['B 包','模拟用户','行为时间（印度时间）','广告位','行为'].forEach(t=>{const th=document.createElement('th');th.textContent=t;head.append(th);});
  const body=table.createTBody();events.filter(e=>e.campaign===campaign).sort((a,b)=>a.time-b.time).forEach(e=>{const row=body.insertRow();[campaigns[e.campaign].name,e.user,iso(e.time).slice(0,16).replace('T',' '),slotNames[e.slot],campaigns[campaign].type==='cs'?'有效建联':`有效付费 $${e.amount.toFixed(2)}`].forEach(x=>row.insertCell().textContent=x);});
  $('ledgerTable').replaceChildren(table);$('ledgerDialog').showModal();
});
updateShell();refresh();
