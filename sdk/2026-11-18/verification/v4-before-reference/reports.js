"use strict";

// v4 report fixtures contain repeated SDK identities so people and event counts
// are derived independently. No backend requests or external event delivery.
const tgDailyInstalled={14:Array(14).fill(0),13:[12,10,7,14,4,8,5,4,8,2,3,2,1,1],12:[0,0,0,0,0,0,0,0,1,0,0,0,0,0],4:[0,0,0,0,0,0,0,0,0,0,0,0,0,0]};
for(const app of initialApps){appDailyRecords[app.id].forEach((row,index)=>{row.tg=tgDailyInstalled[app.id][index];row.noTg=row.installs-row.tg;});}
const reportEvents=[];
for(const pkg of initialPackages){
  dailyDemoDates.forEach((date,index)=>{
    if(index===3)return; // A date with genuine zero events still has a daily record.
    const prefix=pkg.id+'-';
    const previousDate=new Date(Date.parse(date+'T00:00:00Z')-86400000).toISOString().slice(0,10);
    let users=[{id:prefix+'returning',installed:'2026-11-01'},{id:prefix+'new-'+date,installed:date},{id:prefix+'late-first-'+date,installed:'2026-11-01'}];
    // Yesterday's new user returns today and is an old installation today.
    if(index>0)users.push({id:prefix+'new-'+previousDate,installed:previousDate});
    if(pkg.type==='live')users=Array.from({length:Math.min(3,dailyDemoMetrics[4].active[index])},(_,n)=>({id:prefix+'existing-'+n,installed:'2026-11-01'}));
    users.forEach((user,userIndex)=>{
      const appId=pkg.apps.find(id=>initialApps.find(app=>app.id===id)?.installed>0)||pkg.apps[0];
      const append=(kind,times)=>{for(let n=0;n<times;n++)reportEvents.push({packageId:pkg.id,date,userId:user.id,appId,installed:user.installed,kind,slot:['opening','banner','interstitial','rewarded'][(userIndex+index)%4]});};
      append('impression',2+(index+userIndex)%3);
      if(userIndex<3)append('click',userIndex===0?2:1);
      if(pkg.type==='cs'&&userIndex<3)append('contact',userIndex===0?3:1);
      if(pkg.type==='cs'&&userIndex===3)append('contact',2);
    });
  });
}
function aggregateAdDay(packageId,date,slots=[]){
  const events=reportEvents.filter(row=>row.packageId===packageId&&row.date===date&&(!slots.length||slots.includes(row.slot)));
  const counts=kind=>{const matching=events.filter(row=>row.kind===kind);return{times:matching.length,people:new Set(matching.map(row=>row.userId)).size};};
  const contacts=new Map(events.filter(row=>row.kind==='contact').map(row=>[row.userId,row]));
  const fresh=[...contacts.values()].filter(row=>row.installed===date).length;
  return{date,display:counts('impression'),click:counts('click'),total:contacts.size,fresh,old:contacts.size-fresh};
}
function adRows(id,from,to,slots=[]){return dailyDemoDates.filter(date=>date>=from&&date<=to).map(date=>aggregateAdDay(Number(id),date,slots)).reverse();}
const adsReportState={current:null,timer:null,sequence:0};
function openAdData(id){
  clearTimeout(adsReportState.timer);focusedBeforeModal=document.activeElement;
  adsReportState.current={packageId:Number(id),...defaultDataRange,appliedFrom:defaultDataRange.from,appliedTo:defaultDataRange.to,status:'ready',rows:adRows(id,defaultDataRange.from,defaultDataRange.to),validation:'',failNext:false,slots:['opening','banner','interstitial','rewarded'],appliedSlots:['opening','banner','interstitial','rewarded']};
  state.modal={type:'ad-data',packageId:Number(id)};renderModal();
}
function closeAdData(){clearTimeout(adsReportState.timer);adsReportState.sequence++;adsReportState.current=null;state.modal=null;renderModal();if(focusedBeforeModal?.isConnected)focusedBeforeModal.focus({preventScroll:true});}
function queryAdData(){
  const data=adsReportState.current;if(!data||data.status==='loading')return;
  data.validation='';
  if(!validCalendarDate(data.from)||!validCalendarDate(data.to))data.validation='请选择有效的开始日期和结束日期。';
  else if(data.from>data.to)data.validation='开始日期不能晚于结束日期。';
  if(data.validation){renderModal(true);return;}
  const request={...data,sequence:++adsReportState.sequence};data.status='loading';data.failNext=false;renderModal(true);
  clearTimeout(adsReportState.timer);
  adsReportState.timer=setTimeout(()=>{
    if(state.modal?.type!=='ad-data'||adsReportState.current!==data||request.sequence!==adsReportState.sequence)return;
    if(request.failNext)data.status='failed';
    else{data.rows=adRows(data.packageId,request.from,request.to,request.slots);data.appliedSlots=[...request.slots];data.appliedFrom=request.from;data.appliedTo=request.to;data.status='ready';}
    renderModal(true);
  },450);
}
function adDataDialog(){
  const data=adsReportState.current,pkg=state.packages.find(p=>p.id===data.packageId),loading=data.status==='loading',failed=data.status==='failed';
  const status=loading?'loading':failed?'failed':data.rows.length?'ready':'empty';
  let rows;
  if(loading)rows='<tr><td colspan="8" class="daily-empty"><span class="request-dot"></span>正在查询广告数据…</td></tr>';
  else if(failed)rows='<tr><td colspan="8" class="daily-empty"><strong>查询失败，请重试</strong><p>未获取到数据，不使用上次结果替代。</p><button class="button small" data-action="retry-ad-data">重试查询</button></td></tr>';
  else if(!data.rows.length)rows='<tr><td colspan="8" class="daily-empty"><strong>暂无数据</strong><p>所选范围暂无统计记录，请调整日期。</p></td></tr>';
  else rows=data.rows.map(row=>'<tr data-ad-date="'+row.date+'"><td>'+row.date+'</td><td data-ad-impressions>'+row.display.times+'</td><td data-ad-viewers>'+row.display.people+'</td><td data-ad-clicks>'+row.click.times+'</td><td data-ad-clickers>'+row.click.people+'</td>'+['total','fresh','old'].map(key=>'<td data-ad-'+key+'>'+(pkg.type==='cs'?row[key]:'<span title="应用拉活不适用建联指标">—</span>')+'</td>').join('')+'</tr>').join('');
  const dirty=data.status==='ready'&&(data.from!==data.appliedFrom||data.to!==data.appliedTo);
  const body='<section class="ad-data-report" data-query-status="'+status+'"><div class="notice" data-rule-anchor="R-018"><span class="info-symbol">i</span><span><strong>当前 B 包广告数据</strong>　汇总其全部素材和关联白包归属于本 B 包的数据。次数与人数分别统计。 '+marker('R-018')+'</span></div>'+
  '<form id="ad-data-filter" class="daily-date-form" data-rule-anchor="R-020" novalidate><div class="daily-date-field"><label for="ad-from">开始日期</label><input id="ad-from" type="date" data-ad-field="from" value="'+e(data.from)+'" '+(loading?'disabled':'')+' required></div><span class="daily-range-separator">至</span><div class="daily-date-field"><label for="ad-to">结束日期</label><input id="ad-to" type="date" data-ad-field="to" value="'+e(data.to)+'" '+(loading?'disabled':'')+' required></div><button class="button primary" type="submit" '+(loading?'disabled':'')+'>'+(loading?'查询中…':'查询')+'</button><button class="button ghost" type="button" data-action="reset-ad-data" '+(loading?'disabled':'')+'>重置</button>'+marker('R-020')+'</form><p class="field-error" role="alert" id="ad-validation">'+e(data.validation)+'</p><div class="daily-meta"><span>平台时间：印度时间 UTC+5:30 · 起止日期均包含</span><span data-ad-dirty '+(dirty?'':'hidden')+'>日期已修改，点击查询更新</span></div>'+
  '<div class="report-scope"><span class="tag '+(pkg.type==='cs'?'blue':'purple')+'">'+(pkg.type==='cs'?'客服建联':'应用拉活')+'</span><span>已查询：'+e(data.appliedFrom)+' 至 '+e(data.appliedTo)+'</span><span>'+((loading||failed)?'—':data.rows.length+' 个有记录日期')+'</span></div>'+
  '<section data-rule-anchor="R-019"><div class="daily-table-heading"><h3>按日广告数据 '+marker('R-019')+'</h3><span>建联新老按来源白包安装日期区分</span></div><div class="table-card"><div class="table-scroll"><table class="data-table ad-daily-table" aria-label="B包按日广告数据" aria-busy="'+loading+'"><thead><tr><th rowspan="2" scope="col">日期</th><th colspan="2" scope="colgroup">展示</th><th colspan="2" scope="colgroup">点击</th><th colspan="3" scope="colgroup">建联人数</th></tr><tr><th scope="col">次数</th><th scope="col">人数</th><th scope="col">次数</th><th scope="col">人数</th><th scope="col">总</th><th scope="col">新</th><th scope="col">老</th></tr></thead><tbody>'+rows+'</tbody></table></div></div><p class="input-help">同一 B 包同一天按用户去重；当天安装并建联为新，此前安装并在当天建联为老（包括当天首次建联）。总人数 = 新 + 老。不把每日人数累加当作跨日去重人数。</p>'+(pkg.type==='live'?'<p class="notice neutral" style="margin-top:12px">应用拉活的建联指标不适用，显示“—”；展示、点击正常统计。</p>':'')+'</section><p class="daily-demo-note">演示数据覆盖 2026-11-05 至 2026-11-18，含重复事件和零值日期；不连接真实 SDK 或后台。</p></section>';
  const footer='<label class="data-demo-control"><span class="demo-control-label">审阅辅助</span><input id="ad-fail-next" type="checkbox" '+(data.failNext?'checked':'')+' '+(loading?'disabled':'')+'>演示：下次查询失败</label><button class="button" data-action="close-ad-data">关闭</button>';
  return modalShell('广告数据 · '+e(pkg.name),'B 包 #'+pkg.id+' · '+(pkg.type==='cs'?'客服建联':'应用拉活')+' · 全部素材',body,footer,'','ad-data-modal');
}

const renderModalV3=renderModal;
renderModal=function(restoreFocus=false){
  if(state.modal?.type!=='ad-data'){renderModalV3(restoreFocus);return;}
  const root=$('#modal-root');
  if(restoreFocus&&$('.ad-data-report',root)){
    const template=document.createElement('template');template.innerHTML=adDataDialog();
    const body=$('.modal-body',root),top=body.scrollTop;body.replaceChildren(...$('.modal-body',template.content).childNodes);body.scrollTop=top;
    $('#ad-fail-next').checked=adsReportState.current.failNext;$('#ad-fail-next').disabled=adsReportState.current.status==='loading';
  }else{root.innerHTML=adDataDialog();$('.modal').focus({preventScroll:true});}
};
const originalAppDialog=appDataDialog;
appDataDialog=function(){
  const template=document.createElement('template');template.innerHTML=originalAppDialog();
  const table=$('.daily-table',template.content);table.classList.add('tg-daily-table');
  table.setAttribute('aria-label','白包每日新安装、日活跃与新增用户TG分布');
  $('thead tr',table).insertAdjacentHTML('beforeend','<th scope="col" class="tg-col">已安装 TG</th><th scope="col" class="tg-col">未安装 TG</th><th scope="col" class="tg-col">TG 安装占比</th>');
  $$('[data-daily-date]',table).forEach(tr=>{
    const row=state.appData.rows.find(r=>r.date===tr.dataset.dailyDate);
    tr.insertAdjacentHTML('beforeend','<td class="tg-col" data-cohort-tg>'+row.tg+'</td><td class="tg-col" data-cohort-no-tg>'+row.noTg+'</td><td class="tg-col" data-cohort-rate>'+(row.installs?(row.tg/row.installs*100).toFixed(1)+'%':'—')+'</td>');
  });
  $$('td[colspan]',table).forEach(td=>td.colSpan=6);
  const note=document.createElement('div');note.className='notice neutral cohort-note';note.dataset.ruleAnchor='R-017';
  note.innerHTML='<span class="info-symbol">i</span><span><strong>TG 统计范围：该行当天新增安装用户</strong>　已安装 + 未安装 = 当天新安装；占比以当天新安装为分母。检测结果取最近一次打开 App，零新增占比显示“—”。 '+marker('R-017')+'</span>';
  $('.daily-results',template.content).prepend(note);
  table.closest('.table-card').insertAdjacentHTML('afterend','<p class="input-help">六项字段完整展示；窄视口可左右滚动查看 TG 安装占比。统计分母为该行新安装人数。</p>');
  return template.innerHTML;
};
const packagesPageV3=packagesPage;
packagesPage=function(){
  const template=document.createElement('template');template.innerHTML=packagesPageV3();
  $$('[data-package-id]',template.content).forEach(row=>{
    const id=row.dataset.packageId;
    $('.row-actions',row).insertAdjacentHTML('afterbegin','<button class="link-button" data-action="ad-data" data-id="'+id+'">广告数据</button>');
  });
  return template.innerHTML;
};
ruleDefinitions.push(
  {id:'R-017',category:'新增用户 TG 分布',title:'每日新增安装用户 TG',trigger:'白包数据 → 每日 TG 指标',text:'统计该白包当天新增安装用户，已安装 + 未安装 = 当天新增安装。占比为已安装人数 ÷ 当天新安装人数，零新增显示“—”。状态按最近一次打开 App 检测，未上报或无法判断归入未安装；后续检测可更新对应安装日期的分布。'},
  {id:'R-018',category:'B 包广告数据',title:'展示与点击：次数和人数',trigger:'B包管理 → 广告数据',text:'当前 B 包全部素材按平台自然日统计：次数累计事件，人数对当日用户去重。同一用户重复展示或点击只增加次数，不重复增加人数；不同 B 包独立统计。'},
  {id:'R-019',title:'建联总 / 新 / 老',trigger:'B 包按日建联人数',text:'以来源白包安装日期区分：当天安装当天建联为新，此前安装当天建联为老；当天首次建联也可能是老。同一 B 包、同一天、同一用户建联只计一次。总 = 新 + 老，查询区间不改变分类。',extra:'实际建联才计入，点击、跳转及 app_click_wa 不等同于建联。应用拉活的建联指标显示“—（不适用）”。'},
  {id:'R-020',title:'B 包按日查询与状态',trigger:'广告数据 → 日期范围',text:'支持日期范围并按天展示，平台时区印度 UTC+5:30，首尾均包含；日期必填且开始不能晚于结束。加载中防止重复查询，失败可重试；有记录零值与无记录分别展示。不累加每日人数作为跨日去重人数。'}
);
const selectRuleV3=selectRule;
selectRule=function(id,fromCard=false){
  if(!fromCard||!['R-017','R-018','R-019','R-020'].includes(id)){selectRuleV3(id,fromCard);return;}
  if(id==='R-017'){if(state.modal?.type!=='app-data'){state.page='apps';renderPage();openAppData(13);}}
  else if(state.modal?.type!=='ad-data'){state.page='packages';renderPage();openAdData(21);}
  state.selectedRule=id;setReviewTab('rules');
  $$('.selected-target,.rule-card.selected,.rule-marker.selected').forEach(n=>n.classList.remove('selected-target','selected'));
  $('#rule-'+id).classList.add('selected');$$('[data-rule-id="'+id+'"]').forEach(n=>n.classList.add('selected'));
  const target=$('.modal [data-rule-anchor="'+id+'"]');target.classList.add('selected-target');target.scrollIntoView({block:'nearest',behavior:'smooth'});
};
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==='ad-data')openAdData(button.dataset.id);
  else if(action==='close-ad-data')closeAdData();
  else if(action==='retry-ad-data')queryAdData();
  else if(action==='reset-ad-data'){Object.assign(adsReportState.current,defaultDataRange);queryAdData();}
});
document.addEventListener('input',event=>{
  if(event.target.dataset.adField&&adsReportState.current){adsReportState.current[event.target.dataset.adField]=event.target.value;const node=$('[data-ad-dirty]');if(node)node.hidden=false;}
});
document.addEventListener('change',event=>{
  if(event.target.id==='ad-fail-next'&&adsReportState.current)adsReportState.current.failNext=event.target.checked;
  if(event.target.dataset.adField&&adsReportState.current)adsReportState.current[event.target.dataset.adField]=event.target.value;
});
document.addEventListener('submit',event=>{if(event.target.id==='ad-data-filter'){event.preventDefault();queryAdData();}});
$('#reset-demo').addEventListener('click',()=>{clearTimeout(adsReportState.timer);adsReportState.current=null;adsReportState.sequence++;});
$('.version').textContent='v4';$('#rules-tab').innerHTML='规则标注 <span>20</span>';
renderPage();renderRules();
