"use strict";

// Independent robot assignment records; never infer these from SDK clicks.
// IDs, identities and slot associations here are synthetic review fixtures.
const robotAssignmentDemo=[];
for(const packageId of [21,22]){
  dailyDemoDates.forEach((date,index)=>{
    const entries=index===3?[]:[['DEMO-TG-A','opening'],['DEMO-TG-A','opening'],['DEMO-TG-B','banner'],['DEMO-TG-C','rewarded']];
    if(index===dailyDemoDates.length-1)entries.push(['DEMO-TG-B','interstitial']);
    entries.forEach(([tgId,slot],n)=>robotAssignmentDemo.push({id:'DEMO-'+packageId+'-'+date+'-'+n,packageId,date,tgId,slot,success:true}));
    robotAssignmentDemo.push({id:'DEMO-FAILED-'+packageId+'-'+date,packageId,date,tgId:'DEMO-TG-D',slot:'opening',success:false});
  });
}
function robotAssignmentsForDay(packageId,date,slots=[]){
  return robotAssignmentDemo.filter(row=>row.packageId===packageId&&row.date===date&&row.success&&(!slots.length||slots.includes(row.slot)));
}
function robotAssignmentCounts(packageId,date,slots=[]){
  const rows=robotAssignmentsForDay(packageId,date,slots);
  return {times:rows.length,people:new Set(rows.map(row=>row.tgId)).size};
}
ruleDefinitions.push({id:'R-025',category:'机器人实际分配',title:'机器人分配次数与人数',trigger:'客服建联 B 包 → 广告数据',text:'只统计 TG 机器人为 TG 用户实际成功分配客服。次数按成功记录累计；人数按同 B 包、同自然日、同 TG ID 去重，跨天分别统计。',extra:'SDK 获取地址、点击、跳转和 app_click_wa 不计入。其他类型显示“—（不适用）”，机器人当天无成功分配为 0/0；应用拉活不新增此列。'});
const adDialogBeforeRobotStatistics=adDataDialog;
adDataDialog=function(){
  const original=adDialogBeforeRobotStatistics();
  const data=adsReportState.current;
  const pkg=state.packages.find(p=>p.id===data.packageId);
  if(pkg.type!=='cs')return original;
  const template=document.createElement('template');template.innerHTML=original;
  const table=$('.ad-daily-table',template.content);
  const heading=$('thead tr',table).children[4];
  heading.insertAdjacentHTML('beforebegin','<th scope="col" class="combined-report-heading" data-rule-anchor="R-025">机器人分配次数/分配人数 '+marker('R-025')+'</th>');
  const applicable=pkg.csType==='bot';
  const slots=data.appliedSlots||[];
  $$('[data-ad-date]',table).forEach(tr=>{
    const count=robotAssignmentCounts(pkg.id,tr.dataset.adDate,slots);
    const text=applicable?'<span data-robot-times>'+count.times+'</span><span class="report-value-divider" aria-hidden="true">/</span><span data-robot-people>'+count.people+'</span>':'<span>—（不适用）</span>';
    $('[data-ad-contact-pair]',tr).insertAdjacentHTML('beforebegin','<td class="combined-report-value robot-assignment-value" data-robot-pair title="'+(applicable?'实际成功分配次数 / 同 B 包同日 TG ID 去重人数':'其他地址类型不适用机器人分配统计')+'">'+text+'</td>');
  });
  $$('td[colspan]',table).forEach(td=>td.colSpan=7);
  table.closest('.table-card').insertAdjacentHTML('afterend','<p class="input-help robot-statistics-note">机器人分配只计机器人实际成功分配客服；人数按同 B 包、同一天、同 TG ID 去重。其他类型为“—（不适用）”。此指标与 SDK 取址、点击、建联分别统计。'+marker('R-025')+'</p>');
  if(applicable&&data.status==='ready'&&data.rows.length){
    const date=data.rows[0].date;
    const records=robotAssignmentDemo.filter(row=>row.packageId===pkg.id&&row.date===date&&(!slots.length||slots.includes(row.slot)));
    const counts=robotAssignmentCounts(pkg.id,date,slots);
    const audit='<details class="contact-audit robot-assignment-audit"><summary>审阅辅助：'+date+' 机器人分配成功与 TG ID 去重记录</summary><p class="input-help">独立演示记录，未连接真实机器人。源记录的 B 包、TG ID 及原广告位关联需开发联调核对。</p><div class="table-scroll"><table class="data-table" aria-label="机器人分配演示记录"><thead><tr><th>演示 TG ID</th><th>分配结果</th><th>次数计入</th><th>人数口径</th></tr></thead><tbody>'+records.map(row=>'<tr><td>'+e(row.tgId)+'</td><td>'+(row.success?'成功分配客服':'分配失败')+'</td><td>'+(row.success?'1':'0')+'</td><td>'+(row.success?'同 B 包同日相同 TG ID 仅 1 人':'不计入')+'</td></tr>').join('')+'</tbody></table></div><p class="input-help">'+counts.times+' 次实际成功分配 → '+counts.people+' 个去重 TG ID。失败不计入；相同 TG ID 跨天分别统计，查询区间不改变单日口径。</p></details>';
    $('.ad-data-report',template.content).insertAdjacentHTML('beforeend',audit);
  }
  return template.innerHTML;
};
const selectRuleBeforeRobotStatistics=selectRule;
selectRule=function(id,fromCard=false){
  if(id!=='R-025')return selectRuleBeforeRobotStatistics(id,fromCard);
  if(fromCard&&state.modal?.type!=='ad-data'){state.page='packages';renderPage();openAdData(21);}
  if(fromCard&&state.packages.find(p=>p.id===adsReportState.current?.packageId)?.type!=='cs')openAdData(21);
  state.selectedRule=id;setReviewTab('rules');
  $$('.selected-target,.rule-card.selected,.rule-marker.selected').forEach(n=>n.classList.remove('selected-target','selected'));
  $('#rule-'+id).classList.add('selected');
  $$('[data-rule-id="'+id+'"]').forEach(n=>n.classList.add('selected'));
  if(fromCard){const target=$('.modal [data-rule-anchor="'+id+'"]');target?.classList.add('selected-target');target?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});}
  else $('#rule-'+id).scrollIntoView({behavior:'smooth',block:'nearest'});
};
$('.version').textContent='v4.3';
$('#rules-tab').innerHTML='规则标注 <span>'+ruleDefinitions.length+'</span>';
renderRules();
