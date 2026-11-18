"use strict";

// v4.2 review-only simulation. No production requests or real jumps.
const compatibilityDemo={client:'new',vintage:'historical',empty:false,count:0,result:null,clicked:false};
const historicalDemoAddresses=Object.freeze(Object.fromEntries(initialPackages.map(pkg=>[pkg.id,'https://legacy.example.com/material/'+pkg.materials[0].id])));
Object.assign(ruleDefinitions.find(r=>r.id==='R-003'),{extra:'以上为新版统一分配。旧版的历史素材原地址保留、新素材兼容字段生成，见 R-021 至 R-024。'});
Object.assign(ruleDefinitions.find(r=>r.id==='R-007'),{title:'新版每次点击重新随机',trigger:'新版 SDK 点击素材 → 请求分配',extra:'旧版新素材改在每次素材下发时随机；复用已下发素材点击不重新取值，见 R-022。'});
Object.assign(ruleDefinitions.find(r=>r.id==='R-008'),{trigger:'新版对应地址未配置 / 未拿到地址',extra:'旧版历史素材直接返回其原地址，不作为新版空配置兜底。旧版新素材无兼容地址也继续下发，字段为空，点击不跳转。'});
Object.assign(ruleDefinitions.find(r=>r.id==='R-010'),{extra:'不恢复素材级国家或地址编辑。保留历史地址数据与旧接口字段仅用于旧版历史素材读取，见 R-021。'});
Object.assign(ruleDefinitions.find(r=>r.id==='R-011'),{trigger:'新版：未安装 TG + 客服建联 + 发起跳转',extra:'Key 在 App 内配置。旧版兼容不补报新版事件，后台不伪造；点击和跳转均不等于成功建联。'});
ruleDefinitions.push(
  {id:'R-021',category:'旧版 SDK 兼容',title:'历史素材原地址保留',trigger:'旧版 + 升级前已有素材',text:'继续通过原接口字段返回该素材原跳转地址。原数据不清空、不覆盖，不提供编辑入口；B 包变更不能重写此值。',extra:'新版对新旧素材均走 B 包统一分配，不回退此历史地址。'},
  {id:'R-022',title:'旧版新素材下发取地址',trigger:'旧版 + 升级后新建素材',text:'新素材继续投放旧版。客服建联两种地址类型均从 B 包“已安装 TG”组取值；应用拉活取唯一地址。单条固定，多条每次下发随机一条，允许相同。',extra:'随机时机是下发素材，不承诺旧版每次点击重新随机，不恢复独立地址输入。'},
  {id:'R-023',title:'旧版无地址仍下发',trigger:'旧版新素材对应兼容地址为空',text:'素材继续下发，原跳转字段返回旧接口兼容的空值；点击不跳转，不从未安装组或其他素材兜底。',extra:'必须实测真实旧版空值处理；此原型只模拟目标表现。'},
  {id:'R-024',title:'v2 与原接口隔离',trigger:'新版调用 v2；旧版继续原接口',text:'新版通过 v2 获取 B 包配置并在点击时请求统一分配；旧版原接口继续返回素材字段，不改原字段结构。v2 失败或无地址不回退原接口。',extra:'素材历史归属按发布边界记录。TG 未上报不用于路由；旧版取已安装组不改变统计归类，不伪造检测或 app_click_wa。'}
);

const packagesBeforeCompatibility=packagesPage;
packagesPage=function(){return packagesBeforeCompatibility()+'<section class="notice compatibility-notice" data-rule-anchor="R-021"><span class="info-symbol">i</span><div><strong>v4.2 · v2 / 原接口隔离</strong><p>新版走 v2，在点击时按 B 包分配；旧版走原接口，历史素材原地址保留，新素材下发时生成兼容字段。</p><div class="compatibility-markers">'+['R-021','R-022','R-023','R-024'].map(id=>'<span data-rule-anchor="'+id+'">'+marker(id)+'</span>').join('')+'<button class="button small" type="button" data-action="compatibility-review">查看兼容演示</button></div></div></section>';};

const renderSimulationBeforeCompatibility=renderSimulation;
function compatibilityClientControl(){return '<div class="simulation-form compatibility-client"><label for="sim-client">客户端能力（审阅模拟）</label><select id="sim-client"><option value="new" '+(compatibilityDemo.client==='new'?'selected':'')+'>新版 SDK · v2 接口 · 点击分配</option><option value="old" '+(compatibilityDemo.client==='old'?'selected':'')+'>旧版 SDK · 原接口 · 素材字段</option></select></div>';}
renderSimulation=function(){
  if(compatibilityDemo.client==='new'){
    renderSimulationBeforeCompatibility();
    const head=$('#simulation-panel .simulation-head');
    head.insertAdjacentHTML('afterend',compatibilityClientControl());
    head.querySelector('h3').textContent='新版 SDK · v2 接口演示';
    head.querySelector('p').textContent='通过 v2 获取 B 包新配置，点击时请求后台返回一条地址。v2 失败或无地址不回退原接口；仅模拟，不真实请求。';
    const resultList=$('#simulation-panel .sim-result dl');
    if(resultList)resultList.insertAdjacentHTML('afterbegin','<dt>接口通道</dt><dd data-api-channel>v2 · B 包统一分配</dd>');
    $('#simulation-panel').insertAdjacentHTML('beforeend','<p class="compatibility-note">新版对历史及新素材均使用 B 包配置；无地址不回退历史素材 URL。切换上方客户端能力，可审阅旧版兼容分支。</p>');
    return;
  }
  normalizeSimApp();
  const pkg=state.packages.find(p=>p.id===Number(state.sim.packageId));
  const legacy=compatibilityDemo.vintage==='historical';
  const pool=legacy?[historicalDemoAddresses[pkg.id]]:compatibilityDemo.empty?[]:pkg.type==='live'?(pkg.live.trim()?[pkg.live]:[]):nonempty(pkg.tgUrls);
  const result=compatibilityDemo.result;
  $('#simulation-panel').innerHTML='<div class="simulation-head"><h3>旧版 SDK · 原接口演示</h3><p>原接口字段结构保持兼容，后台下发素材原跳转字段。与 v2 处理逻辑隔离；仅审阅，不真实请求、跳转或上报。</p></div>'+compatibilityClientControl()+
    '<div class="simulation-form"><label for="sim-package">素材所属 B 包</label><select id="sim-package" data-sim-field="packageId">'+state.packages.map(p=>'<option value="'+p.id+'" '+(p.id===pkg.id?'selected':'')+'>'+e(p.name)+' · '+(p.type==='live'?'应用拉活':p.csType==='bot'?'TG 机器人':'其他')+'</option>').join('')+'</select><label for="compat-vintage">素材归属（审阅模拟）</label><select id="compat-vintage"><option value="historical" '+(legacy?'selected':'')+'>升级前已有素材</option><option value="new" '+(!legacy?'selected':'')+'>升级后新建素材</option></select>'+
    (!legacy?'<label class="checkbox-label"><input id="compat-empty" type="checkbox" '+(compatibilityDemo.empty?'checked':'')+'>审阅辅助：模拟对应 B 包地址为空</label>':'')+
    '<div class="sim-config">地址来源：<strong>'+(legacy?'历史素材原跳转地址':pkg.type==='live'?'B 包唯一跳转地址':'B 包“已安装 TG”地址组')+'</strong><br>可返回地址：'+pool.length+' 条<br>'+(legacy?'原数据只读保留，不随 B 包修改':pool.length>1?'每次下发素材随机返回一条':pool.length===1?'固定返回唯一地址':'素材仍下发，原字段返回空值')+'<br>国家：'+e(countryText(pkg))+'（仍继承 B 包）</div><button class="button primary" data-action="compat-deliver" type="button">模拟后台下发素材</button><button class="button" data-action="compat-click" type="button" '+(!result?'disabled':'')+'>模拟点击已下发素材</button></div>'+
    (result?'<section class="sim-result" aria-live="polite"><span class="result-label">第 '+result.count+' 次素材下发 · 审阅日志</span><h4>素材已下发'+(result.address?'，字段有地址':'，原跳转字段为空')+'</h4><dl><dt>接口通道</dt><dd data-api-channel>原接口 · 素材跳转字段</dd><dt>客户端 / 素材</dt><dd>旧版 SDK / '+(result.legacy?'升级前已有':'升级后新建')+'</dd><dt>字段地址来源</dt><dd>'+e(result.source)+'</dd><dt>原跳转地址字段</dt><dd data-compat-address>'+(result.address?e(result.address):'空值 · 不跳转')+'</dd><dt>点击表现</dt><dd data-compat-click>'+(compatibilityDemo.clicked?(result.address?'使用本次已下发地址模拟跳转，不重新随机':'不跳转，素材仍正常下发'):'等待模拟点击')+'</dd><dt>新增 Adjust 事件</dt><dd>不补报 app_click_wa，不伪造 TG 检测</dd></dl></section>':'')+
    '<p class="compatibility-note">旧版新素材使用已安装组只是兼容取址规则，不改变用户 TG 统计归类。缓存或重复点击不触发重新下发；空值需真实旧版安装包联调。</p><button class="text-button" data-action="sim-edit" type="button">编辑当前 B 包配置 ↗</button>';
};

function deliverCompatibility(){
  const pkg=state.packages.find(p=>p.id===Number(state.sim.packageId));
  const legacy=compatibilityDemo.vintage==='historical';
  const pool=legacy?[historicalDemoAddresses[pkg.id]]:compatibilityDemo.empty?[]:pkg.type==='live'?(pkg.live.trim()?[pkg.live]:[]):nonempty(pkg.tgUrls);
  compatibilityDemo.count++;
  compatibilityDemo.clicked=false;
  compatibilityDemo.result={count:compatibilityDemo.count,legacy,address:pool.length?pool[Math.floor(Math.random()*pool.length)]:'',source:legacy?'历史素材原地址（只读）':pkg.type==='live'?'B 包 #'+pkg.id+' 唯一地址':'B 包 #'+pkg.id+' 已安装 TG 组（'+(pkg.csType==='bot'?'TG 机器人':'其他')+'）'};
  renderSimulation();
}

const selectRuleBeforeCompatibility=selectRule;
selectRule=function(id,fromCard=false){
  if(!['R-021','R-022','R-023','R-024'].includes(id))return selectRuleBeforeCompatibility(id,fromCard);
  state.selectedRule=id;
  if(fromCard){state.modal=null;state.page='packages';renderPage();renderModal();}
  setReviewTab('rules');
  $$('.selected-target,.rule-card.selected,.rule-marker.selected').forEach(node=>node.classList.remove('selected-target','selected'));
  $('#rule-'+id).classList.add('selected');
  $$('[data-rule-id="'+id+'"]').forEach(n=>n.classList.add('selected'));
  if(fromCard){const target=$('.product-stage [data-rule-anchor="'+id+'"]');target?.classList.add('selected-target');target?.scrollIntoView({behavior:'smooth',block:'nearest'});}
  else $('#rule-'+id).scrollIntoView({behavior:'smooth',block:'nearest'});
};
document.addEventListener('click',event=>{
  const action=event.target.closest('[data-action]')?.dataset.action;
  if(action==='compatibility-review'){document.body.classList.remove('expanded-prototype');$('#expand-prototype').textContent='放大原型';$('#expand-prototype').setAttribute('aria-pressed','false');compatibilityDemo.client='old';setReviewTab('simulation');}
  if(action==='compat-deliver')deliverCompatibility();
  if(action==='compat-click'&&compatibilityDemo.result){compatibilityDemo.clicked=true;renderSimulation();}
});
document.addEventListener('change',event=>{
  const id=event.target.id;
  if(!['sim-client','compat-vintage','compat-empty','sim-package'].includes(id))return;
  clearTimeout(simulationTimer);state.sim.loading=false;state.sim.result=null;
  if(id==='sim-client')compatibilityDemo.client=event.target.value;
  if(id==='compat-vintage')compatibilityDemo.vintage=event.target.value;
  if(id==='compat-empty')compatibilityDemo.empty=event.target.checked;
  compatibilityDemo.result=null;compatibilityDemo.clicked=false;
  renderSimulation();
});
$('#reset-demo').addEventListener('click',()=>{Object.assign(compatibilityDemo,{client:'new',vintage:'historical',empty:false,count:0,result:null,clicked:false});renderSimulation();});
$('.version').textContent='v4.2';
$('#rules-tab').innerHTML='规则标注 <span>'+ruleDefinitions.length+'</span>';
$('.review-actions').insertAdjacentHTML('beforeend','<a class="plan-link" href="./prd.html" target="_blank" rel="noopener">开发 PRD ↗</a>');
renderPage();renderRules();renderSimulation();
