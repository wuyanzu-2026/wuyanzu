"use strict";

// Fields verified against the existing test backend. This layer restores
// unchanged fields and clearly marks unchanged workflows for developer review.
const reportSlotOptions=[['opening','开屏广告'],['banner','横幅广告'],['interstitial','插屏广告'],['rewarded','激励视频广告']];
function initializePreservedFields(){
  for(const collection of [initialPackages,state.packages])collection.forEach(pkg=>{
    pkg.bundle??=pkg.type==='live'?'com.demo.reengagement':'';
    pkg.store??='';pkg.created??=pkg.id===8?'2026-10-28 12:39:07':'2026-11-04 11:24:49';pkg.logoUrl??='';
    pkg.installCount??=pkg.type==='live'?1:null;pkg.paidDisplay??=pkg.type==='live'?'¥5.60':'—';
  });
}
initializePreservedFields();
function frequencyDescription(pair){
  const [first,interval]=pair;
  if(first===0&&interval===0)return '一直出谷歌广告';
  const lead=first?'新用户先看 '+first+' 次我们的；':'';
  return lead+(interval===1?'之后一直出我们的':interval?'之后每 '+interval+' 次插 1 次我们的':'之后不再插入我们的');
}
function logoMarkup(record,letter='—'){
  return record.logoUrl?'<img class="existing-logo" src="'+e(record.logoUrl)+'" alt="Logo">':'<span class="table-avatar">'+e(letter)+'</span>';
}
function referenceNote(){return '<p class="reference-note"><span class="tag muted">对照现有后台</span> 原字段完整保留；仅 TG / 报表指标、统一地址和国家按本次需求调整。 <a href="./字段对照与开发交接.md" target="_blank" rel="noopener">查看字段逐项对照 ↗</a></p>';}
function preservedButton(button){
  button.disabled=false;button.dataset.action='preserved-workflow';button.title='保留原有功能及生产逻辑；本次只交互演示变更部分';
  button.classList.add('preserved-workflow');
}
const appsPageBeforeFidelity=appsPage;
appsPage=function(){
  const template=document.createElement('template');template.innerHTML=appsPageBeforeFidelity();
  const table=$('.app-table',template.content),headers=['ID','LOGO','APP名称','包名','关联投放','怎么出广告','安装用户 '+marker('R-001'),'已安装 TG','未安装 TG','TG 安装占比','今日日活','付费','建联','状态','操作'];
  $('colgroup',table).remove();table.classList.add('reference-app-table');
  $('thead',table).innerHTML='<tr>'+headers.map((label,index)=>'<th class="'+([7,8,9].includes(index)?'tg-col ':'')+(index===14?'sticky-action':'')+'">'+label+'</th>').join('')+'</tr>';
  const rows=$$('tbody tr[data-app-id]',table);
  rows.forEach(row=>{
    const app=state.apps.find(a=>a.id===Number(row.dataset.appId));
    const actions=$('.row-actions',row).innerHTML;
    const linkedTypes=new Set(state.packages.filter(p=>p.apps.includes(app.id)).map(p=>p.type));
    app.placements=linkedTypes.size===2?'拉活+建联':linkedTypes.has('cs')?'客服建联':linkedTypes.has('live')?'应用拉活':'—';
    row.innerHTML='<td>'+app.id+'</td><td>'+logoMarkup(app,app.logo)+'</td><td class="app-name">'+e(app.name)+'</td><td class="app-package">'+e(app.package)+'</td><td><span class="tag blue">'+e(app.placements)+'</span></td><td><div class="frequency-cell">'+['开屏','Banner','插屏','激励'].map((name,index)=>'<div><span>'+name+'：</span>'+frequencyDescription(app.frequencyRows[index])+'</div>').join('')+'</div></td><td class="number">'+fmt(app.installed)+'</td><td class="tg-col number green">'+fmt(app.tg)+'</td><td class="tg-col number">'+fmt(app.installed-app.tg)+'</td><td class="tg-col number blue">'+ratio(app)+'</td><td>'+app.active+'</td><td>'+app.paid+'</td><td>'+app.contacts+'</td><td>'+(app.status==='enabled'?'<span class="status">启用</span>':'<span class="tag muted">禁用</span>')+'</td><td class="sticky-action"><div class="row-actions">'+actions+'</div></td>';
    $$('button:disabled',row).forEach(preservedButton);
  });
  const empty=$('.empty-row',table);if(empty)empty.colSpan=15;
  $$('button:disabled',template.content).filter(b=>!b.closest('.pagination')).forEach(preservedButton);
  $('.page-description',template.content).insertAdjacentHTML('afterend',referenceNote());
  return template.innerHTML;
};
const packagesPageBeforeFidelity=packagesPage;
packagesPage=function(){
  const template=document.createElement('template');template.innerHTML=packagesPageBeforeFidelity();
  const form=$('#package-filter',template.content);
  $('#pkg-keyword',template.content).placeholder='搜索名称或包名';
  const application='<div class="filter-field"><label for="pkg-app">应用</label><select id="pkg-app" name="app"><option value="">全部</option>'+state.apps.map(app=>'<option value="'+app.id+'" '+(String(state.packageFilter.app||'')===String(app.id)?'selected':'')+'>'+e(app.name)+'</option>').join('')+'</select></div>';
  form.insertAdjacentHTML('afterbegin',application);
  $('button[type="submit"]',form).insertAdjacentHTML('beforebegin','<div class="filter-field"><label for="pkg-state">状态</label><select id="pkg-state" name="status"><option value="">全部</option><option value="enabled" '+(state.packageFilter.status==='enabled'?'selected':'')+'>启用</option><option value="disabled" '+(state.packageFilter.status==='disabled'?'selected':'')+'>禁用</option></select></div>');
  const table=$('.package-table',template.content);table.classList.add('reference-package-table');
  const headers=['ID','应用','LOGO','名称/包名','投放标识','安装','展示','点击','建联','付费','广告素材','类型','投放状态','创建时间','国家范围','操作'];
  $('thead',table).innerHTML='<tr>'+headers.map((label,index)=>'<th class="'+(index===15?'sticky-action':'')+'">'+label+'</th>').join('')+'</tr>';
  $$('tbody tr[data-package-id]',table).forEach(row=>{
    const pkg=state.packages.find(p=>p.id===Number(row.dataset.packageId));
    if((state.packageFilter.app&&!pkg.apps.includes(Number(state.packageFilter.app)))||(state.packageFilter.status&&pkg.status!==state.packageFilter.status)){row.remove();return;}
    const actions=$('.row-actions',row).innerHTML;
    row.innerHTML='<td>'+pkg.id+'</td><td><div class="scope-label">'+pkg.apps.map(id=>'<span class="tag muted">'+e(state.apps.find(a=>a.id===id)?.name||id)+'</span>').join('')+'</div></td><td>'+logoMarkup(pkg)+'</td><td><div class="app-name">'+e(pkg.type==='live'?pkg.bundle:pkg.name)+'</div><span class="tiny-text">'+e(pkg.type==='live'?pkg.name:'客服建联 #'+pkg.id)+'</span></td><td>'+e(pkg.identifier||'默认（未填写）')+'</td><td>'+(pkg.installCount??'—')+'</td><td>'+pkg.impressions+'</td><td>'+pkg.clicks+'</td><td>'+pkg.contacts+'</td><td>'+pkg.paidDisplay+'</td><td><div class="existing-material-summary">'+pkg.materials.map(m=>'<div>'+e(m.kind)+' <span>¥'+e(m.price)+'</span></div>').join('')+'</div></td><td><span class="tag '+(pkg.type==='cs'?'blue':'purple')+'">'+(pkg.type==='cs'?'客服建联':'应用拉活')+'</span></td><td>'+(pkg.status==='enabled'?'<span class="status">投放中</span>':'<span class="tag muted">禁用</span>')+'</td><td>'+pkg.created+'</td><td><div class="country-tags">'+countryTags(pkg)+'</div></td><td class="sticky-action"><div class="row-actions">'+actions+'</div></td>';
    $$('button:disabled',row).forEach(preservedButton);
    const actionsNode=$('.row-actions',row);[...actionsNode.children].sort((a,b)=>['编辑','广告数据','广告素材','删除'].indexOf(a.textContent)-['编辑','广告数据','广告素材','删除'].indexOf(b.textContent)).forEach(button=>actionsNode.append(button));
  });
  const count=$$('tbody tr[data-package-id]',table).length;
  if(!count)$('tbody',table).innerHTML='<tr><td class="empty-row" colspan="16">未找到匹配投放</td></tr>';
  $('.table-footer>span',template.content).textContent='共 '+count+' 条';
  $$('button:disabled',template.content).filter(b=>!b.closest('.pagination')).forEach(preservedButton);
  $('.page-description',template.content).insertAdjacentHTML('afterend',referenceNote());
  return template.innerHTML;
};
function logoField(kind){
  const record=kind==='app'?state.draft:state.packageDraft;
  return '<div class="field full"><label for="'+kind+'-logo-file">Logo</label><div class="existing-upload">'+logoMarkup(record,record.logo||'—')+'<input id="'+kind+'-logo-file" type="file" accept="image/*" data-preserved-upload="'+kind+'"><span class="tiny-text">'+e(record.logoFileName||'上传Logo（本地演示，不上传后台）')+'</span>'+(record.logoUrl?'<button class="button small ghost" data-action="clear-preserved-logo" data-owner="'+kind+'">删除Logo</button>':'')+'</div></div>';
}
const baseFormBeforeFidelity=baseForm;
baseForm=function(){
  const template=document.createElement('template');template.innerHTML=baseFormBeforeFidelity();
  const old=$$('.field',template.content).find(n=>$('label',n)?.textContent==='Logo');if(old)old.remove();
  $('.form-grid',template.content).insertAdjacentHTML('beforeend',logoField('app'));
  return template.innerHTML;
};
const originalFormBeforeFidelity=originalForm;
originalForm=function(){
  const sequence=Array.from({length:13},(_,i)=>{const n=i+1,[first,interval]=state.draft.frequencyRows[0];const own=n<=first||(interval>0&&(n-first)%interval===0);return '<span class="'+(own?'own':'google')+'">'+n+(own?'我们的':'谷歌')+'</span>';}).join('');
  return originalFormBeforeFidelity()+'<section class="preserved-frequency-help"><h3>原有广告频次说明（保留）</h3><p>每个位置可先连续展示若干次我们的广告，再按间隔插入；卸载重装重新开始。我们的广告展示失败时，本次回退谷歌广告。</p><p>0 表示不用该项；两个均为 0 时始终展示谷歌广告；间隔为 1 时之后始终展示我们的广告。</p><p>用开屏举例（假设都成功展示）：</p><div class="frequency-sequence">'+sequence+'</div></section>';
};
const packageBaseBeforeFidelity=packageBaseForm;
packageBaseForm=function(){
  const template=document.createElement('template');template.innerHTML=packageBaseBeforeFidelity();
  const grid=$('.form-grid',template.content),pkg=state.packageDraft;
  if(pkg.type==='live'){
    $('#package-name',template.content).closest('.field').remove();
    grid.insertAdjacentHTML('afterbegin','<div class="field"><label for="package-bundle">包名</label><input id="package-bundle" data-package-field="bundle" value="'+e(pkg.bundle||'')+'" placeholder="请输入包名"></div><div class="field"><label for="package-store">商店地址</label><input id="package-store" data-package-field="store" value="'+e(pkg.store||'')+'" placeholder="请输入商店地址"><p class="input-help">原有字段保留，统一跳转地址在“国家与跳转”维护。</p></div>');
  }
  grid.insertAdjacentHTML('afterbegin',logoField('package'));
  return template.innerHTML;
};
const adDialogBeforeFidelity=adDataDialog;
function reportChart(rows,pkg){
  if(!rows.length)return '<section class="legacy-chart"><h3>趋势曲线</h3><p class="input-help">所选范围暂无趋势记录。</p></section>';
  const data=rows.slice().reverse(),series=pkg.type==='cs'?[['display','展示','#779eff'],['click','点击','#5ec5da'],['total','建联人数','#ba91ee']]:[['install','安装','#70c7a0'],['display','展示','#779eff'],['click','点击','#5ec5da'],['paidAmount','付费金额 (USD)','#e1bd72']];
  const value=(row,key)=>key==='display'?row.display.times:key==='click'?row.click.times:Number(row[key]||0);
  const countMax=Math.max(4,...data.flatMap(row=>series.filter(s=>s[0]!=='paidAmount').map(([key])=>value(row,key))));
  const top=Math.ceil(countMax/4)*4,moneyMax=Math.max(1,...data.map(r=>r.paidAmount||0));
  const left=43,right=680,bottom=175,upper=20,x=i=>data.length===1?(left+right)/2:left+i*(right-left)/(data.length-1);
  let svg='<svg viewBox="0 0 735 210" role="img" aria-label="原有广告趋势曲线，数据随日期和广告位查询"><title>广告趋势曲线</title>';
  for(let i=0;i<=4;i++){const y=bottom-i*(bottom-upper)/4;svg+='<line x1="'+left+'" y1="'+y+'" x2="'+right+'" y2="'+y+'" stroke="#3b485d" stroke-dasharray="3 4"/><text x="34" y="'+(y+4)+'" text-anchor="end">'+(top*i/4)+'</text>';if(pkg.type==='live')svg+='<text x="690" y="'+(y+4)+'">$'+(moneyMax*i/4).toFixed(2)+'</text>';}
  series.forEach(([key,label,color])=>{
    const max=key==='paidAmount'?moneyMax:top;
    const points=data.map((row,i)=>x(i)+','+(bottom-value(row,key)/max*(bottom-upper))).join(' ');
    svg+='<g data-chart-line="'+key+'"><polyline points="'+points+'" fill="none" stroke="'+color+'" stroke-width="2"/>'+data.map((row,i)=>'<circle cx="'+x(i)+'" cy="'+(bottom-value(row,key)/max*(bottom-upper))+'" r="2.6" fill="'+color+'"><title>'+row.date+' '+label+' '+value(row,key)+'</title></circle>').join('')+'</g>';
  });
  data.forEach((row,i)=>{if(i===0||i===data.length-1||i%Math.max(1,Math.ceil(data.length/5))===0)svg+='<text x="'+x(i)+'" y="198" text-anchor="middle">'+row.date.slice(5)+'</text>';});
  svg+='</svg>';
  return '<section class="legacy-chart"><h3>趋势曲线 <span class="tag muted">原有区域保留</span></h3><div class="legacy-chart-legend">'+series.map(([key,label,color])=>'<label><input type="checkbox" checked data-legacy-line="'+key+'"><i style="background:'+color+'"></i>'+label+'</label>').join('')+'</div>'+svg+'<p class="input-help">悬停点位可读数；次数 / 人数使用左轴，应用拉活的付费金额使用右侧 USD 轴。既有图表和生产计算沿用原实现。</p></section>';
}
adDataDialog=function(){
  const template=document.createElement('template');template.innerHTML=adDialogBeforeFidelity();
  const data=adsReportState.current,pkg=state.packages.find(p=>p.id===data.packageId),live=pkg.type==='live';
  $('#ad-data-filter button[type="submit"]',template.content).textContent=data.status==='loading'?'更新中…':'更新';
  const scope='<section class="legacy-report-controls"><label for="event-package">事件关联 B 包</label><select id="event-package">'+state.packages.map(p=>'<option value="'+p.id+'" '+(p.id===pkg.id?'selected':'')+'>'+e(p.type==='live'?p.bundle:p.name)+' · '+(p.type==='cs'?'客服建联':'应用拉活')+' #'+p.id+'</option>').join('')+'</select><fieldset><legend>关联展示广告位 <small>可多选筛选数据；不选按全部</small></legend><div>'+reportSlotOptions.map(([id,name])=>'<label><input type="checkbox" data-report-slot="'+id+'" '+((data.slots||[]).includes(id)?'checked':'')+' '+(data.status==='loading'?'disabled':'')+'>'+name+'</label>').join('')+'</div></fieldset><div class="legacy-granularity"><span>统计粒度</span>'+['时','日','周','月'].map(name=>'<button type="button" class="button small '+(name==='日'?'primary':'ghost')+'" '+(name==='日'?'data-action="daily-granularity"':'data-action="preserved-granularity"')+'>'+name+'</button>').join('')+'<span class="tiny-text">本次新增口径按日；其他既有粒度及逻辑保留</span></div></section>';
  $('.ad-data-report>.notice',template.content).insertAdjacentHTML('afterend',scope);
  const table=$('.ad-daily-table',template.content);
  table.classList.add(live?'live-ad-table':'cs-ad-table');
  table.closest('.table-card').insertAdjacentHTML('afterend','<p class="input-help">完整字段已保留；表格可左右滚动查看。原字段保留项：广告位、'+(live?'安装、付费金额、付费人数（总/老/新）、':'')+'白包活跃人数、人均展示次数。新增项：展示人数、点击人数及建联总/新/老。</p>');
  $('thead',table).innerHTML='<tr><th rowspan="2">日期</th><th rowspan="2">广告位</th>'+(live?'<th rowspan="2">安装</th>':'')+'<th colspan="2">展示</th><th colspan="2">点击</th><th colspan="3">建联人数</th>'+(live?'<th rowspan="2">付费金额</th><th rowspan="2">付费人数<br>总 / 老 / 新</th>':'')+'<th rowspan="2">白包活跃人数</th><th rowspan="2">人均展示次数</th></tr><tr><th>次数</th><th>人数</th><th>次数</th><th>人数</th><th>总</th><th>新</th><th>老</th></tr>';
  const applied=data.appliedSlots||reportSlotOptions.map(s=>s[0]);
  const slotLabel=!applied.length||applied.length===4?'全部广告位':reportSlotOptions.filter(([id])=>applied.includes(id)).map(s=>s[1]).join(' / ');
  $$('[data-ad-date]',table).forEach(tr=>{
    const row=data.rows.find(r=>r.date===tr.dataset.adDate);
    $('td:first-child',tr).insertAdjacentHTML('afterend','<td>'+slotLabel+'</td>'+(live?'<td data-legacy-install>'+row.install+'</td>':''));
    tr.insertAdjacentHTML('beforeend',(live?'<td data-legacy-paid>$'+Number(row.paidAmount).toFixed(2)+'</td><td data-legacy-payers>'+row.payers+'</td>':'')+'<td data-legacy-active>'+row.whiteActive+'</td><td data-legacy-average>'+(row.whiteActive?(row.display.times/row.whiteActive).toFixed(2):'—')+'</td>');
  });
  $$('td[colspan]',table).forEach(td=>td.colSpan=live?14:11);
  $('.ad-data-report',template.content).insertAdjacentHTML('beforeend',reportChart(data.status==='ready'?data.rows:[],pkg)+(live?'<p class="input-help">付费人数（总 / 老 / 新）按原有首次付费行为和统计周期口径保留，不套用建联安装日期分类。</p>':''));
  if(!live&&data.status==='ready'&&data.rows.length){
    const date=data.rows[0].date,all=reportEvents.filter(row=>row.packageId===pkg.id&&row.date===date&&row.kind==='contact'&&(!applied.length||applied.includes(row.slot)));
    const users=new Map();for(const event of all){const old=users.get(event.userId);if(old)old.times++;else users.set(event.userId,{...event,times:1});}
    const audit='<details class="contact-audit"><summary>审阅辅助：'+date+' 建联新老及去重演示记录</summary><p class="input-help">以下为演示计算说明，不要求生产新增用户明细功能。</p><div class="table-scroll"><table class="data-table"><thead><tr><th>演示用户</th><th>白包安装日期</th><th>建联日期</th><th>首次建联日期</th><th>当天建联事件次数</th><th>去重后分类</th></tr></thead><tbody>'+[...users.values()].map((user,index)=>{const first=reportEvents.filter(r=>r.kind==='contact'&&r.packageId===pkg.id&&r.userId===user.userId).map(r=>r.date).sort()[0];return '<tr><td>用户 '+String(index+1).padStart(2,'0')+'</td><td>'+user.installed+'</td><td>'+date+'</td><td>'+first+'</td><td>'+user.times+'</td><td>'+(user.installed===date?'新 · 1 人':'老 · 1 人')+'</td></tr>';}).join('')+'</tbody></table></div><p class="input-help">'+all.length+' 次建联事件 → '+users.size+' 名去重用户。历史安装用户当天首次建联仍为老，昨日安装的用户今天再次建联也为老。</p></details>';
    $('.ad-data-report',template.content).insertAdjacentHTML('beforeend',audit);
  }
  return template.innerHTML;
};
const aggregateBeforeFidelity=aggregateAdDay;
aggregateAdDay=function(packageId,date,slots){
  const row=aggregateBeforeFidelity(packageId,date,slots),pkg=state.packages.find(p=>p.id===Number(packageId));
  row.install=0;row.paidAmount=0;row.payers='0 / 0 / 0';
  row.whiteActive=pkg.apps.reduce((sum,id)=>sum+(appDailyRecords[id]?.find(r=>r.date===date)?.active||0),0);
  return row;
};
const renderBeforeFidelity=renderModal;
renderModal=function(preserve=false){
  renderBeforeFidelity(preserve);
  if(!state.modal)return;
  if(state.modal.type==='app'){
    const save=$('[data-action="save-app"]');if(save)save.textContent='保存';
  }
  if(state.modal.type==='package'){
    const save=$('[data-action="save-package"]');if(save)save.textContent='确定';
  }
  if(state.modal.type==='materials'){
    $$('.material-table tbody tr').forEach(row=>{const cell=$('td:last-child',row);if(cell&&!$('[data-action="preserved-workflow"]',cell))cell.insertAdjacentHTML('beforeend',' <button class="link-button danger" data-action="preserved-workflow" title="删除流程为原有功能，本次不调整">删除</button>');});
  }
  if(state.modal.type==='material-edit'){
    const file=$('#material-file');
    if(file&&!$('[data-action="preserved-remove-asset"]'))file.insertAdjacentHTML('afterend','<button class="button small ghost" style="margin-top:8px" data-action="preserved-remove-asset">删除素材</button>');
    const save=$('[data-action="save-material"]');if(save)save.textContent='确定';
    const kind=$('label[for="material-kind"]'),asset=$('label[for="material-file"]');if(kind)kind.innerHTML='<span class="required">*</span>广告类型';if(asset)asset.innerHTML='<span class="required">*</span>素材';
  }
};
document.addEventListener('submit',event=>{
  if(event.target.id==='package-filter'){
    const form=new FormData(event.target);state.packageFilter.app=String(form.get('app')||'');state.packageFilter.status=String(form.get('status')||'');renderPage();
  }
});
document.addEventListener('click',event=>{
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  if(button.dataset.action==='preserved-workflow')showToast('该入口为原有功能，生产逻辑保留；本原型只展开本次变更流程。');
  if(button.dataset.action==='preserved-granularity')showToast('原有时 / 周 / 月功能保留；本次新增指标和新老分类按日演示，不要求删除其他粒度。');
  if(button.dataset.action==='preserved-remove-asset'){const file=$('#material-file');if(file)file.value='';const hint=$('#material-file-hint');if(hint)hint.textContent='已清空本次选择的演示文件；生产素材删除与必填校验沿用原逻辑。';}
  if(button.dataset.action==='clear-preserved-logo'){const record=button.dataset.owner==='app'?state.draft:state.packageDraft;record.logoUrl='';record.logoFileName='';renderModal(true);}
});
document.addEventListener('change',event=>{
  const target=event.target;
  if(target.dataset.preservedUpload&&target.files?.length){const data=target.dataset.preservedUpload==='app'?state.draft:state.packageDraft;data.logoFileName=target.files[0].name;data.logoUrl=URL.createObjectURL(target.files[0]);renderModal(true);}
  if(target.id==='event-package')openAdData(target.value);
  if(target.id==='package-type')renderModal(true);
  if(target.dataset.reportSlot){const data=adsReportState.current;const current=data.slots||[];data.slots=target.checked?[...new Set([...current,target.dataset.reportSlot])]:current.filter(id=>id!==target.dataset.reportSlot);const hint=$('[data-ad-dirty]');if(hint)hint.hidden=false;}
  if(target.dataset.legacyLine){const line=$('[data-chart-line="'+target.dataset.legacyLine+'"]');if(line)line.style.display=target.checked?'':'none';}
});
const existingPlanLink=$('.plan-link');existingPlanLink.insertAdjacentHTML('beforebegin','<a class="plan-link" href="./字段对照与开发交接.md" target="_blank" rel="noopener">字段对照 ↗</a>');
const expandReview=document.createElement('button');expandReview.type='button';expandReview.className='text-button';expandReview.id='expand-prototype';expandReview.textContent='放大原型';expandReview.setAttribute('aria-pressed','false');
$('.review-actions').prepend(expandReview);
expandReview.addEventListener('click',()=>{const expanded=document.body.classList.toggle('expanded-prototype');expandReview.textContent=expanded?'显示规则':'放大原型';expandReview.setAttribute('aria-pressed',String(expanded));});
document.addEventListener('click',event=>{if(event.target.closest('[data-rule-id],[data-rule-target]')){document.body.classList.remove('expanded-prototype');expandReview.textContent='放大原型';expandReview.setAttribute('aria-pressed','false');}},true);
renderPage();
