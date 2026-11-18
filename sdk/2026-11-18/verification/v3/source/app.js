"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
const e = escapeHtml;
const clone = value => JSON.parse(JSON.stringify(value));
const fmt = value => Number(value).toLocaleString("en-US");
const ratio = app => app.installed ? `${(app.tg / app.installed * 100).toFixed(1)}%` : "—";
const nonempty = values => values.filter(value => value.trim().length > 0);
const marker = id => `<button type="button" class="rule-marker" data-rule-id="${id}" aria-label="查看规则 ${id}">${id}</button>`;

const icons = {
  dashboard:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21h8M12 17v4"/>',
  apps:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  package:'<path d="M5 7h14l2 13H3L5 7ZM8 7V5a4 4 0 0 1 8 0v2M9 10v7m6-7v7"/>',
  device:'<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M7 21h10M12 17v4"/>',
  chat:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 2 1.5-5A8 8 0 1 1 21 11Z"/><path d="M7 11h2m2 0h2m2 0h2"/>',
  money:'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 4 16 4 16 0V5M4 11v6c0 4 16 4 16 0v-6"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 22v-4a8 8 0 0 1 16 0v4"/>',
  lock:'<rect x="5" y="10" width="14" height="12" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v3"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>'
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.apps}</svg>`;

const initialApps = [
  {id:14,name:"问卷 Demo",package:"com.demo.survey",logo:"问",installed:0,tg:0,active:0,impressions:0,clicks:0,paid:"—",contacts:0,status:"enabled",placements:"拉活 + 建联",frequency:"每 2 次插 1 次我们的",appId:"DEMO-SURVEY",topon:"",adjust:"",auth:"",payKey:"",firstPayKey:"",registerKey:"",installKey:"",contactKey:"",store:"",frequencyRows:[[0,2],[0,2],[0,2],[0,2]]},
  {id:13,name:"计步 Demo",package:"com.demo.steplite",logo:"步",installed:1154,tg:702,active:4,impressions:115,clicks:23,paid:"—",contacts:1,status:"enabled",placements:"客服建联",frequency:"先出 1 次，之后每 2 次插 1 次",appId:"DEMO-STEP",topon:"DEMO-TOPON",adjust:"",auth:"",payKey:"",firstPayKey:"",registerKey:"",installKey:"",contactKey:"",store:"",frequencyRows:[[1,2],[1,2],[1,2],[1,2]]},
  {id:12,name:"阅读 Demo",package:"com.demo.reader",logo:"阅",installed:4,tg:3,active:1,impressions:408,clicks:61,paid:"—",contacts:3,status:"enabled",placements:"客服建联",frequency:"先出 1 次，之后每 2 次插 1 次",appId:"DEMO-READER",topon:"",adjust:"",auth:"",payKey:"",firstPayKey:"",registerKey:"",installKey:"",contactKey:"",store:"",frequencyRows:[[1,2],[1,2],[1,2],[1,2]]},
  {id:4,name:"工具 Demo",package:"com.demo.toolbox",logo:"工",installed:3,tg:0,active:3,impressions:50,clicks:12,paid:"$5.60",contacts:1,status:"disabled",placements:"拉活 + 建联",frequency:"每 5 次插 1 次我们的",appId:"DEMO-TOOLS",topon:"",adjust:"",auth:"",payKey:"",firstPayKey:"",registerKey:"",installKey:"",contactKey:"",store:"",frequencyRows:[[0,5],[0,0],[0,0],[0,0]]}
];

const countryCatalog = [
  ["IN","印度"],["AE","阿联酋"],["BD","孟加拉国"],["PK","巴基斯坦"],
  ["ID","印度尼西亚"],["PH","菲律宾"],["VN","越南"],["TH","泰国"],
  ["MY","马来西亚"],["SA","沙特阿拉伯"],["BR","巴西"],["MX","墨西哥"],
  ["US","美国"],["GB","英国"],["DE","德国"],["JP","日本"]
];
const countryName = code => countryCatalog.find(([id])=>id===code)?.[1] || code;
const countryText = pkg => pkg.countries.length ? pkg.countries.map(code=>countryName(code)+" ("+code+")").join("、") : "全球";
const countryTags = pkg => pkg.countries.length ? pkg.countries.map(code=>'<span class="tag muted">'+e(countryName(code))+' <small>'+code+'</small></span>').join('') : '<span class="tag green">全球</span>';

const initialPackages = [
  {id:22,name:"客服建联 · 演示 A",type:"cs",apps:[13,12],identifier:"",status:"enabled",countries:["AE"],live:"",csType:"other",tgUrls:["tg://resolve?domain=demo_contact_a","https://t.me/demo_contact_b"],otherUrls:["https://example.com/service/a","自定义地址示例"],impressions:11,clicks:1,contacts:0,materials:[{id:221,kind:"Banner广告",price:"0.9",enabled:true}]},
  {id:21,name:"客服建联 · 演示 B",type:"cs",apps:[13,12,14],identifier:"",status:"enabled",countries:["IN","BD"],live:"",csType:"bot",tgUrls:["https://t.me/demo_support_bot"],otherUrls:["https://example.com/support/01","https://example.com/support/02","https://example.com/support/03"],impressions:292,clicks:30,contacts:2,materials:[{id:211,kind:"开屏广告",price:"2.1",enabled:true},{id:212,kind:"激励视频",price:"1",enabled:true},{id:213,kind:"插屏广告",price:"1",enabled:true},{id:214,kind:"Banner广告",price:"1",enabled:true}]},
  {id:8,name:"应用拉活 · 演示",type:"live",apps:[4,14],identifier:"game",status:"enabled",countries:[],live:"demo-app://home",csType:"bot",tgUrls:[],otherUrls:[],impressions:28,clicks:51,contacts:0,materials:[{id:81,kind:"开屏广告",price:"1",enabled:true},{id:82,kind:"Banner广告",price:"1",enabled:true}]}
];

const ruleDefinitions = [
  {id:"R-001",category:"统计与口径",title:"App 独立 TG 统计",trigger:"白包 APP 列表",text:"每个 App 独立展示已安装 TG 人数、未安装 TG 人数、TG 安装占比。两类人数之和等于白包安装用户总数；不按 App 内账号注册统计。"},
  {id:"R-002",title:"最近一次打开的状态",trigger:"Android SDK 打开 App 检测",text:"只检测 Telegram 是否安装，不判断登录。按最近一次打开 App 的检测结果更新归组，沿用现有安装用户去重。历史未上报或无法判断均归入未安装。",extra:"占比＝已安装 TG 人数 ÷ 安装用户总数；无安装用户时显示“—”。"},
  {id:"R-003",category:"B 包统一配置",title:"跳转归属于 B 包",trigger:"B包管理 → 编辑 → 国家与跳转",text:"白包展示自身数据、TG 统计及原有设置。跳转地址按 B 包配置，同一 B 包下所有素材、所有关联白包共用；不同 B 包独立维护。按 B 包投放类型展示应用拉活或客服建联配置。"},
  {id:"R-004",title:"应用拉活：唯一地址",trigger:"应用拉活素材点击",text:"仅 1 个地址输入框，可留空。无需选择 TG 机器人 / 其他，也不按 TG 安装状态分流。有地址则固定返回这一条。"},
  {id:"R-005",title:"客服建联：两种地址类型",trigger:"客服建联地址配置",text:"TG 机器人：已安装组最多 1 条，未安装组可多条。其他：两组均可多条。两组均允许为空，已安装与未安装独立维护。"},
  {id:"R-006",title:"切换类型时清空",trigger:"其他 → TG 机器人",text:"立即清除当前编辑态全部已安装 TG 地址，只保留 1 个空输入框；未安装组内容保留。保存后生效，取消不会修改已保存配置。",extra:"TG 机器人 → 其他保留当前输入内容，并允许继续添加已安装 TG 地址。"},
  {id:"R-007",category:"分配与异常",title:"每次点击重新随机",trigger:"点击素材 → 请求客服分配",text:"后台从对应 TG 分组返回 1 条地址。1 条固定返回，多条重新随机，允许连续返回相同地址；不按用户或本次会话固定分配。"},
  {id:"R-008",title:"无地址时静默结束",trigger:"对应地址未配置 / 未拿到地址",text:"App 不提示、不跳转，点击无反应。不跨分组兜底，不使用旧素材地址，也不上报 app_click_wa。检测不确定时按未安装组分配。"},
  {id:"R-009",title:"不限制地址格式",trigger:"填写地址与保存",text:"地址使用普通文本输入，不校验协议或 URL 格式。所有分组都允许留空，不因地址为空阻止保存。原型中的链接仅作为演示文本，不真实打开。"},
  {id:"R-010",category:"素材与事件",title:"素材继承 B 包配置",trigger:"B包管理 → 广告素材 / 素材编辑",text:"素材不再填写独立跳转 URL 和国家。地址按所属 B 包统一分配，国家范围从 B 包继承且不可覆盖；查看统一配置直接进入所属 B 包。素材内容、广告位、出价及状态保持原有逻辑。"},
  {id:"R-011",title:"Adjust 点击事件",trigger:"未安装 TG + 客服建联 + 发起跳转",text:"拿到地址并发起跳转时上报 <code>app_click_wa</code>，不等待打开成功。每次符合条件的跳转触发一次。已安装 TG、应用拉活、无地址不触发。",extra:"事件 Key 在 App 内配置，后台不增加字段；该事件不等于成功建联。"},
  {id:"R-012",title:"保存、取消与权限",trigger:"B 包编辑弹窗",text:"保存提交当前 B 包配置；取消或关闭舍弃本次编辑。保存后的国家范围由全部下属素材继承。沿用现有权限，不新增角色；演示数据只保留在当前页面。"},
  {id:"R-013",category:"国家范围",title:"B 包国家多选",trigger:"B 包编辑 → 投放国家",text:"支持同时选择多个国家；一个国家都不选表示全球，允许保存。同一 B 包下所有素材使用同一国家范围，不再配置素材级国家。保存后同步继承；取消则不改变原范围。"},
  {id:"R-014",category:"白包自身数据",title:"白包数据独立查看",trigger:"白包 APP → 白包数据",text:"列表保持每个白包一行，去掉展示和点击，保留累计安装、今日日活与 TG 分布。点击白包数据，查看当前白包自身的新安装与每日活跃，不混入关联 B 包的广告数据。"},
  {id:"R-015",title:"每日新安装与日活跃",trigger:"白包数据 → 按日明细",text:"新安装沿用当前白包的 SDK 安装身份及去重口径，按新增日期计入。日活跃按自然日对当前白包的活跃安装用户去重，同一天多次打开只计一次，不同日期分别统计。",extra:"区间新安装等于所选日期内每日新安装之和。日活逐日展示，不显示日均值，不跨日累加为活跃总人数。"},
  {id:"R-016",title:"日期查询及状态",trigger:"白包数据 → 日期范围查询",text:"起止日期都计入，平台时区沿用印度时间 UTC+5:30。日期必填且开始不得晚于结束，校验失败保留输入。查询中禁用重复提交，失败可重试；无记录与真实零值分别展示。",extra:"日期筛选只影响当前白包明细，不回放或改动列表 TG 最新状态。页脚失败开关仅为原型审阅辅助，不属于正式后台字段。"}
];


const dailyDemoDates=Array.from({length:14},(_,index)=>new Date(Date.UTC(2026,10,5+index)).toISOString().slice(0,10));
const dailyDemoMetrics={
  14:{installs:Array(14).fill(0),active:Array(14).fill(0)},
  13:{installs:[20,16,11,22,8,13,9,7,12,4,6,3,1,2],active:[48,42,37,53,29,31,24,37,40,36,31,22,9,4]},
  12:{installs:[0,0,0,0,0,0,0,0,1,0,1,0,0,0],active:[0,1,1,0,2,1,1,0,2,1,2,1,0,1]},
  4:{installs:[0,0,0,1,0,0,0,0,0,0,0,1,0,0],active:[0,1,0,1,0,1,1,0,1,1,2,2,1,3]}
};
const appDailyRecords=Object.fromEntries(initialApps.map(app=>[app.id,dailyDemoDates.map((date,index)=>({date,installs:dailyDemoMetrics[app.id].installs[index],active:dailyDemoMetrics[app.id].active[index]}))]));
const defaultDataRange={from:'2026-11-11',to:'2026-11-18'};
const selectDailyRows=(id,from,to)=>(appDailyRecords[id]||[]).filter(row=>row.date>=from&&row.date<=to).slice().reverse();

const state = {apps:clone(initialApps),packages:clone(initialPackages),page:"apps",modal:null,draft:null,packageDraft:null,editTab:"base",packageTab:"config",returnTo:null,selectedRule:null,filter:{status:"",keyword:""},packageFilter:{type:"",keyword:""},sim:{packageId:21,appId:13,tg:"no",fail:false,count:0,loading:false,result:null},switchNotice:false,countryOpen:false,countryQuery:"",appData:null};
let appDataTimer;
let toastTimer;
let simulationTimer;
let focusedBeforeModal;

function renderNav(){
  const items = [["dashboard","数据概览",null],["apps","白包 APP","apps"],["package","B包管理","packages"],["device","设备管理",null],["chat","Telegram 机器人",null],["money","经营收益",null],["user","账户管理",null],["lock","角色管理",null]];
  $("#main-nav").innerHTML=items.map(([glyph,label,page])=>`<button type="button" ${page?`data-action="navigate" data-page="${page}"`:"disabled"} class="${state.page===page?"active":""}" ${state.page===page?'aria-current="page"':""} title="${page?label:"原有功能，本次原型不涉及"}">${icon(glyph)}${label}</button>`).join("");
  $("#breadcrumb-text").textContent=state.page==="apps"?"白包 APP":"B包管理";
}

function renderPage(){
  renderNav();
  $("#page-content").innerHTML=state.page==="apps"?appsPage():packagesPage();
}

function appsPage(){
  const list=state.apps.filter(app=>(!state.filter.status||app.status===state.filter.status)&&(!state.filter.keyword||`${app.name} ${app.package}`.toLowerCase().includes(state.filter.keyword.toLowerCase())));
  return `<div class="page-title-row"><div class="page-title"><h2>白包 APP</h2><span class="count-badge">${state.apps.length} 个应用</span></div><button type="button" class="button primary" disabled title="原有功能，本次不涉及">${icon("plus")}新增白包 APP</button></div>
  <p class="page-description">查看白包自身安装、每日活跃及 TG 分布。跳转地址与国家统一在 B 包配置。 ${marker("R-014")}</p>
  <form class="filter-bar" id="app-filter"><div class="filter-field"><label for="app-status">状态</label><select id="app-status" name="status"><option value="">全部状态</option><option value="enabled" ${state.filter.status==="enabled"?"selected":""}>启用</option><option value="disabled" ${state.filter.status==="disabled"?"selected":""}>停用</option></select></div><div class="filter-field wide"><label for="app-keyword">关键词</label><input id="app-keyword" name="keyword" value="${e(state.filter.keyword)}" placeholder="搜索 APP 名称 / 包名"></div><button type="submit" class="button primary">${icon("search")}搜索</button><button type="button" class="button ghost" data-action="clear-filter">重置</button><span class="filter-count">共 ${list.length} 个结果 · 演示数据</span></form>
  <div class="notice stats-note" data-rule-anchor="R-002"><span class="info-symbol">i</span><span><strong>TG 统计口径</strong>　按最近一次打开 App 的检测结果归组；历史未上报及无法判断均计入未安装。安装占比 = 已安装 TG 人数 ÷ 白包安装用户总数。 ${marker("R-002")}</span></div>
  <div class="table-card" data-rule-anchor="R-001"><div class="table-scroll"><table class="data-table app-table" aria-label="白包 App 与 TG 安装统计"><colgroup><col class="col-id"><col class="col-logo"><col class="col-app"><col class="col-installed"><col class="col-tg"><col class="col-no-tg"><col class="col-rate"><col class="col-placement"><col class="col-active"><col class="col-paid"><col class="col-contact"><col class="col-frequency"><col class="col-status"><col class="col-actions"></colgroup><thead><tr><th>ID</th><th>LOGO</th><th>APP 名称 / 包名</th><th>安装用户 ${marker("R-001")}</th><th class="tg-col">已安装 TG</th><th class="tg-col">未安装 TG</th><th class="tg-col">TG 安装占比</th><th>关联投放</th><th>今日日活</th><th>付费</th><th>建联</th><th>怎么出广告</th><th>状态</th><th class="sticky-action">操作</th></tr></thead><tbody>${list.map(app=>`<tr data-app-id="${app.id}"><td>${app.id}</td><td><span class="table-avatar">${e(app.logo)}</span></td><td><div class="app-name">${e(app.name)}</div><div class="app-package">${e(app.package)}</div></td><td><span class="number">${fmt(app.installed)}</span></td><td class="tg-col"><span class="number green">${fmt(app.tg)}</span></td><td class="tg-col"><span class="number">${fmt(app.installed-app.tg)}</span></td><td class="tg-col"><span class="number blue">${ratio(app)}</span><div class="rate-line"><span style="width:${app.installed?app.tg/app.installed*100:0}%"></span></div></td><td><span class="tag ${app.placements.includes("拉活")?"purple":"blue"}">${app.placements}</span></td><td>${app.active}</td><td>${app.paid}</td><td>${app.contacts}</td><td><div>${app.frequency}</div><div class="tiny-text">开屏 / Banner / 插屏 / 激励</div></td><td>${app.status==="enabled"?'<span class="status">启用</span>':'<span class="tag muted">停用</span>'}</td><td class="sticky-action"><div class="row-actions"><button class="link-button" type="button" data-action="edit-app" data-id="${app.id}">编辑</button><button class="link-button" type="button" data-action="app-data" data-id="${app.id}">白包数据</button><button class="link-button danger" type="button" disabled title="本次原型不演示删除应用">删除</button></div></td></tr>`).join("")||'<tr><td colspan="14" class="empty-row">未找到匹配的 App，请调整筛选条件。</td></tr>'}</tbody></table></div><div class="table-footer"><span>共 ${list.length} 条</span><div class="pagination"><span>10 条 / 页</span><button disabled aria-label="上一页">‹</button><button class="current" aria-label="第 1 页" aria-current="page">1</button><button disabled aria-label="下一页">›</button></div></div></div>
  <div class="horizontal-hint"><span class="legend-inline"><i class="new-dot"></i>蓝色列为本次新增指标</span><span>表格可横向滚动，操作列固定</span></div><p class="secondary-note">统计仅展示当前累计分布。每位用户在同一 App 下仅计入一个 TG 分组；零安装用户的占比显示“—”。</p>`;
}

function packagesPage(){
  const list=state.packages.filter(pkg=>(!state.packageFilter.type||pkg.type===state.packageFilter.type)&&(!state.packageFilter.keyword||pkg.name.includes(state.packageFilter.keyword)));
  return '<div class="page-title-row"><div class="page-title"><h2>B包管理</h2><span class="count-badge">'+state.packages.length+' 条投放</span></div><button class="button primary" disabled title="原有功能，本次不涉及">'+icon("plus")+'新增投放</button></div><p class="page-description">按 B 包维护投放国家及跳转地址，下属所有素材统一继承。</p>'+
  '<form id="package-filter" class="filter-bar"><div class="filter-field"><label for="pkg-type">投放类型</label><select id="pkg-type" name="type"><option value="">全部类型</option><option value="cs" '+(state.packageFilter.type==="cs"?'selected':'')+'>客服建联</option><option value="live" '+(state.packageFilter.type==="live"?'selected':'')+'>应用拉活</option></select></div><div class="filter-field wide"><label for="pkg-keyword">名称</label><input id="pkg-keyword" name="keyword" value="'+e(state.packageFilter.keyword)+'" placeholder="搜索投放名称"></div><button class="button primary" type="submit">'+icon("search")+'搜索</button><button class="button ghost" type="button" data-action="clear-package-filter">重置</button></form>'+
  '<div class="notice stats-note" data-rule-anchor="R-010"><span class="info-symbol">i</span><span><strong>地址与国家统一在 B 包配置</strong>　点击“编辑”维护；素材不再单独配置跳转地址或国家。同一 B 包关联不同白包时共用配置。 '+marker("R-010")+'</span></div>'+
  '<div class="table-card"><div class="table-scroll"><table class="data-table package-table" aria-label="B包投放列表"><thead><tr><th>ID</th><th>名称</th><th>类型</th><th>国家范围</th><th>关联应用</th><th>投放标识</th><th>展示</th><th>点击</th><th>建联</th><th>广告素材</th><th>投放状态</th><th class="sticky-action">操作</th></tr></thead><tbody>'+list.map(pkg=>'<tr data-package-id="'+pkg.id+'"><td>'+pkg.id+'</td><td><div class="app-name">'+e(pkg.name)+'</div><div class="tiny-text">地址由当前 B 包统一维护</div></td><td><span class="tag '+(pkg.type==="live"?'purple':'blue')+'">'+(pkg.type==="live"?'应用拉活':'客服建联')+'</span></td><td><div class="country-tags">'+countryTags(pkg)+'</div></td><td><div class="scope-label">'+pkg.apps.map(id=>'<span class="tag muted">'+e(state.apps.find(a=>a.id===id).name)+'</span>').join('')+'</div></td><td><span class="tiny-text">'+e(pkg.identifier||'默认（未填写）')+'</span></td><td>'+pkg.impressions+'</td><td>'+pkg.clicks+'</td><td>'+pkg.contacts+'</td><td>'+pkg.materials.length+' 条素材</td><td>'+(pkg.status==='enabled'?'<span class="status">投放中</span>':'<span class="tag muted">停用</span>')+'</td><td class="sticky-action"><div class="row-actions"><button class="link-button" data-action="edit-package" data-id="'+pkg.id+'">编辑</button><button class="link-button" data-action="materials" data-id="'+pkg.id+'">广告素材</button><button class="link-button danger" disabled title="本次不演示删除投放">删除</button></div></td></tr>').join('')+
  (list.length?'':'<tr><td class="empty-row" colspan="12">未找到匹配投放</td></tr>')+'</tbody></table></div><div class="table-footer"><span>共 '+list.length+' 条</span><div class="pagination"><span>10 条 / 页</span><button disabled aria-label="上一页">‹</button><button class="current">1</button><button disabled aria-label="下一页">›</button></div></div></div><p class="secondary-note">国家可多选，未选国家表示全球；B 包保存后，下属素材同步继承该范围。白包 App 保留独立 TG 统计。</p>';
}

function showToast(message){clearTimeout(toastTimer);$("#toast").textContent=message;$("#toast").classList.add("visible");toastTimer=setTimeout(()=>$("#toast").classList.remove("visible"),2600);}

function openEdit(id,tab="base"){
  focusedBeforeModal=document.activeElement;
  if(!state.draft||state.draft.id!==Number(id))state.draft=clone(state.apps.find(app=>app.id===Number(id)));
  state.modal={type:"app",appId:Number(id)};state.editTab=tab;state.returnTo=null;renderModal();
}

function openPackage(id,tab="config",returnTo=null){
  focusedBeforeModal=document.activeElement;
  if(!state.packageDraft||state.packageDraft.id!==Number(id)){
    state.packageDraft=clone(state.packages.find(pkg=>pkg.id===Number(id)));
    state.switchNotice=false;state.countryOpen=false;state.countryQuery="";
  }
  if(state.packageDraft.csType==="bot"&&!state.packageDraft.tgUrls.length)state.packageDraft.tgUrls=[""];
  state.modal={type:"package",packageId:Number(id)};state.packageTab=tab;state.returnTo=returnTo;renderModal();
}

function modalShell(title,subtitle,body,footer,tabs="",className=""){
  return `<div class="modal-backdrop"><section class="modal ${className}" role="dialog" aria-modal="false" aria-labelledby="modal-title" tabindex="-1"><header class="modal-header"><div><div class="modal-title"><h2 id="modal-title">${title}</h2><span class="tag muted">演示</span></div><p class="modal-subtitle">${subtitle}</p></div><button class="icon-button" type="button" data-action="close-modal" aria-label="关闭此对话框">×</button></header>${tabs}<div class="modal-body">${body}</div><footer class="modal-footer">${footer}</footer></section></div>`;
}

function addressGroup(group,title,caption,single){
  const values=state.packageDraft[group];
  return `<section class="address-group" data-address-group="${group}"><div class="group-heading"><h4><i class="group-dot ${group==="tgUrls"?"green":""}"></i>${title}</h4><span class="group-limit">${single?"最多 1 条":"可配置多条"}</span></div><p class="group-caption">${caption}</p><div class="address-list">${values.map((value,index)=>`<div class="address-row"><span class="address-index">${String(index+1).padStart(2,"0")}</span><input type="text" class="address-input" data-address="${group}" data-index="${index}" aria-label="${title}地址 ${index+1}" value="${e(value)}" placeholder="填写跳转地址，可留空" autocomplete="off">${single?"":`<button class="icon-button remove-address" data-action="remove-address" data-group="${group}" data-index="${index}" type="button" aria-label="删除${title}地址 ${index+1}">×</button>`}</div>`).join("")||'<div class="empty-address">尚未配置地址</div>'}</div>${single?'<p class="input-help">已配置时固定返回这一条；留空则不跳转。</p>':`<button type="button" class="add-address" data-action="add-address" data-group="${group}">＋ 添加地址</button>`}</section>`;
}

function countrySummary(){
  return state.packageDraft.countries.length ? state.packageDraft.countries.map(code=>'<span class="country-chip">'+e(countryName(code))+' <small>'+code+'</small><button type="button" data-action="remove-country" data-country="'+code+'" aria-label="移除'+e(countryName(code))+'">×</button></span>').join('') : '<span class="tag green">全球</span><span class="tiny-text">未选择国家，面向全球投放</span>';
}

function countryOptions(){
  const query=state.countryQuery.toLowerCase();
  const choices=countryCatalog.filter(([code,name])=>(code+' '+name).toLowerCase().includes(query));
  return choices.map(([code,name])=>'<label class="country-option"><input type="checkbox" data-country="'+code+'" '+(state.packageDraft.countries.includes(code)?'checked':'')+'><span>'+e(name)+'</span><small>'+code+'</small></label>').join('') || '<p class="input-help">未找到匹配的演示国家</p>';
}

function countryForm(){
  return '<section class="form-section" data-rule-anchor="R-013"><div class="section-heading"><span class="section-num">01</span><h3>投放国家</h3>'+marker('R-013')+'</div><p class="section-caption">支持多选，未选即全球；当前 B 包下所有素材统一继承，不再单独选国家。</p><div class="country-selection"><div class="country-selected" data-country-summary>'+countrySummary()+'</div><button type="button" class="button small" data-action="toggle-countries" aria-expanded="'+state.countryOpen+'">'+(state.countryOpen?'收起选择':'选择国家')+'</button></div><div class="country-picker" '+(state.countryOpen?'':'hidden')+'><div class="country-picker-toolbar"><input id="country-search" type="text" value="'+e(state.countryQuery)+'" placeholder="搜索国家名称或代码" aria-label="搜索国家"><button type="button" class="text-button" data-action="clear-countries">清空选择（全球）</button></div><div class="country-options">'+countryOptions()+'</div><p class="input-help">国家选项为原型演示范围，支持搜索、多选及清空。</p></div></section>';
}

function refreshCountries(){
  $('[data-country-summary]').innerHTML=countrySummary();
  $('.country-options').innerHTML=countryOptions();
}

function jumpForm(){
  const pkg=state.packageDraft;
  const intro='<section class="form-section" data-rule-anchor="R-003"><div class="section-heading"><span class="section-num">B 包</span><h3>国家与统一跳转</h3>'+marker('R-003')+'</div><p class="section-caption">当前 B 包下所有素材、所有关联白包共用；不同 B 包独立配置。</p></section>';
  let address;
  if(pkg.type==='live'){
    address='<section class="form-section" data-rule-anchor="R-004"><div class="section-heading"><span class="section-num">02</span><h3>应用拉活跳转</h3>'+marker('R-004')+'</div><p class="section-caption">仅 1 个跳转地址，不区分 TG 安装状态，不设置客服地址类型。</p><label for="live-address" class="address-label">跳转地址 <span class="optional">选填</span></label><input class="address-input" id="live-address" type="text" data-package-field="live" value="'+e(pkg.live)+'" placeholder="填写应用拉活的唯一跳转地址" autocomplete="off"></section>';
  }else{
    address='<section class="form-section" data-rule-anchor="R-005"><div class="section-heading"><span class="section-num">02</span><h3>客服建联跳转</h3>'+marker('R-005')+'</div><p class="section-caption">根据 TG 安装状态分组分配地址，每次点击素材时重新请求。</p><div class="type-row" data-rule-anchor="R-006"><span class="type-caption">地址类型</span><label class="radio-pill"><input type="radio" name="cs-type" value="bot" '+(pkg.csType==='bot'?'checked':'')+'>TG 机器人</label><label class="radio-pill"><input type="radio" name="cs-type" value="other" '+(pkg.csType==='other'?'checked':'')+'>其他</label>'+marker('R-006')+'</div><p class="type-help">切换为“TG 机器人”将清空已安装 TG 的全部地址，仅保留 1 个空输入框。</p>'+
    (state.switchNotice?'<div class="notice warning switch-notice" role="status"><span class="info-symbol">!</span><span>已清空“已安装 TG”地址；“未安装 TG”地址保持不变。保存后生效。</span></div>':'')+
    '<div class="address-groups">'+addressGroup('tgUrls','已安装 TG',pkg.csType==='bot'?'机器人地址仅 1 条，固定返回。':'单条固定，多条随机返回 1 条。',pkg.csType==='bot')+addressGroup('otherUrls','未安装 TG','单条固定，多条随机返回 1 条。',false)+'</div><p class="config-tip" data-rule-anchor="R-007">'+marker('R-007')+'<span>多条地址在<strong>每次点击请求时重新随机</strong>；允许连续两次分配相同地址。</span></p></section>';
  }
  return intro+countryForm()+address+'<p class="config-tip" data-rule-anchor="R-009">'+marker('R-009')+'<span>不限制地址格式，所有地址均可留空。空白输入不作为可分配地址。</span></p><section class="form-section" data-rule-anchor="R-008"><div class="notice neutral"><span class="info-symbol">i</span><span><strong>未配置地址时</strong>　App 不提示、不跳转；不跨组、不使用原素材地址兜底。 '+marker('R-008')+'</span></div><p class="config-tip" data-rule-anchor="R-011">'+marker('R-011')+'<span>'+(pkg.type==='live'?'本 B 包为应用拉活，不触发 app_click_wa。':'仅未安装 TG 的客服建联跳转触发 <strong>app_click_wa</strong>，在拿到地址并发起跳转时上报。')+'事件 Key 在 App 内配置。</span></p></section>';
}

function packageBaseForm(){
  const pkg=state.packageDraft;
  return '<div class="form-grid"><div class="field full"><label for="package-name"><span class="required">*</span>投放名称</label><input id="package-name" data-package-field="name" value="'+e(pkg.name)+'"></div><div class="field"><label for="package-type">投放类型</label><select id="package-type" data-package-field="type"><option value="cs" '+(pkg.type==='cs'?'selected':'')+'>客服建联</option><option value="live" '+(pkg.type==='live'?'selected':'')+'>应用拉活</option></select></div><div class="field"><label for="package-status">状态</label><select id="package-status" data-package-field="status"><option value="enabled" '+(pkg.status==='enabled'?'selected':'')+'>启用</option><option value="disabled" '+(pkg.status==='disabled'?'selected':'')+'>停用</option></select></div><div class="field full"><label for="package-identifier">投放标识</label><input id="package-identifier" data-package-field="identifier" value="'+e(pkg.identifier)+'" placeholder="选填；留空进入默认池"><p class="input-help">沿用原有规则：区分大小写，保存时去除首尾空格。</p></div><fieldset class="field full associated-apps"><legend>关联应用</legend><div class="associated-options">'+state.apps.map(app=>'<label><input type="checkbox" data-associated-app="'+app.id+'" '+(pkg.apps.includes(app.id)?'checked':'')+'>'+e(app.name)+'</label>').join('')+'</div><p class="input-help">同一 B 包关联的所有白包共用其跳转与国家配置。</p></fieldset></div><div id="package-error" class="field-error" role="alert"></div>';
}

function field(label,key,placeholder="",disabled=false){
  return `<div class="field"><label for="field-${key}">${label}</label><input id="field-${key}" data-field="${key}" type="text" value="${e(state.draft[key]||"")}" placeholder="${e(placeholder)}" ${disabled?"disabled":""}></div>`;
}

function baseForm(){return `<div class="form-grid">${field('<span class="required">*</span>APP 名称',"name","请输入 APP 名称")}${field('<span class="required">*</span>包名',"package","请输入包名")}${field("AppId","appId","",true)}<div class="field"><label for="field-status">状态</label><select id="field-status" data-field="status"><option value="enabled" ${state.draft.status==="enabled"?"selected":""}>启用</option><option value="disabled" ${state.draft.status==="disabled"?"selected":""}>停用</option></select></div>${field("商店地址","store","沿用原有商店地址配置")}<div class="field"><label>Logo</label><span class="table-avatar">${e(state.draft.logo)}</span><p class="input-help">沿用现有 Logo，本次不调整。</p></div></div><div id="base-error" class="field-error" role="alert"></div>`;}

function originalForm(){
  return `<div class="notice neutral"><span class="info-symbol">i</span><span>以下为原有广告与事件配置；本次不增加 app_click_wa 事件 Key，点击事件由 App 内配置。</span></div><h3 class="existing-subheading">原有渠道与事件配置</h3><div class="form-grid">${field("TopOn 应用 ID","topon","可留空")}${field("AdjustToken","adjust","请输入 AdjustToken")}${field("Adjust 鉴权 Token","auth","留空则不带鉴权")}${field("付费事件 Key","payKey","请输入 PayEventKey")}${field("首充事件 Key","firstPayKey","请输入 FirstPayEventKey")}${field("注册事件 Key","registerKey","请输入 RegisterEventKey")}${field("安装事件 Key","installKey","请输入安装事件 Key")}${field("建联事件 Key","contactKey","留空则不回传")}</div><h3 class="existing-subheading">四个位置怎么出广告</h3><p class="section-caption">新用户先出几次我们的，看完后再按间隔插。保持既有广告配置逻辑。</p><table class="existing-ad-table"><thead><tr><th>广告位置</th><th>新用户先出几次</th><th>之后每隔几次插一次</th></tr></thead><tbody>${["开屏","Banner","插屏","激励"].map((name,i)=>`<tr><td>${name}</td><td><input type="number" min="0" step="1" aria-label="${name}新用户先出几次" data-frequency="${i}" data-part="0" value="${state.draft.frequencyRows[i][0]}"></td><td><input type="number" min="0" step="1" aria-label="${name}之后间隔" data-frequency="${i}" data-part="1" value="${state.draft.frequencyRows[i][1]}"></td></tr>`).join("")}</tbody></table><p class="input-help">两个都填 0：该位置一直出谷歌广告；间隔填 1：之后一直出我们的广告。</p>`;
}


function openAppData(id){
  clearTimeout(appDataTimer);focusedBeforeModal=document.activeElement;
  const appId=Number(id);
  state.appData={appId,from:defaultDataRange.from,to:defaultDataRange.to,appliedFrom:defaultDataRange.from,appliedTo:defaultDataRange.to,status:'ready',rows:selectDailyRows(appId,defaultDataRange.from,defaultDataRange.to),validation:'',invalidFields:[],failNext:false,request:0};
  state.modal={type:'app-data',appId};renderModal();
}

function closeAppData(){
  clearTimeout(appDataTimer);state.modal=null;state.appData=null;renderModal();
  if(focusedBeforeModal?.isConnected)focusedBeforeModal.focus({preventScroll:true});
}

function validCalendarDate(value){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
  const timestamp=Date.parse(value+'T00:00:00Z');
  return Number.isFinite(timestamp)&&new Date(timestamp).toISOString().slice(0,10)===value;
}

function queryAppData(){
  const data=state.appData;
  if(!data||data.status==='loading')return;
  data.invalidFields=[];data.validation='';
  if(!validCalendarDate(data.from)||!validCalendarDate(data.to)){
    if(!validCalendarDate(data.from))data.invalidFields.push('from');
    if(!validCalendarDate(data.to))data.invalidFields.push('to');
    data.validation='请选择有效的开始日期和结束日期。';renderModal(true);return;
  }
  if(data.from>data.to){
    data.invalidFields=['from','to'];data.validation='开始日期不能晚于结束日期，请调整后查询。';renderModal(true);return;
  }
  const request={id:++data.request,appId:data.appId,from:data.from,to:data.to,fail:data.failNext};
  data.failNext=false;data.status='loading';renderModal(true);clearTimeout(appDataTimer);
  appDataTimer=setTimeout(()=>{
    if(state.modal?.type!=='app-data'||!state.appData||state.appData.appId!==request.appId||state.appData.request!==request.id)return;
    const current=state.appData;
    if(request.fail){current.status='failed';}
    else{current.appliedFrom=request.from;current.appliedTo=request.to;current.rows=selectDailyRows(request.appId,request.from,request.to);current.status='ready';}
    renderModal(true);
  },450);
}

function appDataDialog(){
  const data=state.appData,app=state.apps.find(a=>a.id===data.appId),loading=data.status==='loading',failed=data.status==='failed';
  const ready=data.status==='ready',hasRecords=ready&&data.rows.length>0;
  const view=loading?'loading':failed?'failed':hasRecords?'ready':'empty';
  const total=hasRecords?data.rows.reduce((sum,row)=>sum+row.installs,0):null;
  const range=loading||failed?{from:data.from,to:data.to}:{from:data.appliedFrom,to:data.appliedTo};
  const dirty=ready&&(data.from!==data.appliedFrom||data.to!==data.appliedTo);
  let tableBody;
  if(loading)tableBody='<tr><td colspan="3" class="daily-empty"><span class="request-dot"></span>正在查询白包数据…</td></tr>';
  else if(failed)tableBody='<tr><td colspan="3" class="daily-empty"><strong>查询失败，请重试</strong><p>未获取到本次数据，不使用广告数据替代。</p><button type="button" class="button small" data-action="retry-app-data">重试查询</button></td></tr>';
  else if(!data.rows.length)tableBody='<tr><td colspan="3" class="daily-empty"><strong>暂无数据</strong><p>所选日期范围暂无统计记录，请调整日期后查询。</p></td></tr>';
  else tableBody=data.rows.map(row=>'<tr data-daily-date="'+row.date+'"><td>'+row.date+'</td><td data-daily-installs="'+row.installs+'">'+fmt(row.installs)+'</td><td data-daily-active="'+row.active+'">'+fmt(row.active)+'</td></tr>').join('');
  const body='<section class="white-app-data" data-query-status="'+view+'"><div class="notice" data-rule-anchor="R-014"><span class="info-symbol">i</span><span><strong>当前白包自身数据</strong>　仅统计 '+e(app.name)+' 的安装与活跃，独立于关联 B 包的广告数据。 '+marker('R-014')+'</span></div>'+
  '<form id="app-data-filter" class="daily-date-form" data-rule-anchor="R-016" novalidate><div class="daily-date-field"><label for="data-from">开始日期</label><input id="data-from" type="date" data-data-field="from" value="'+e(data.from)+'" required aria-invalid="'+data.invalidFields.includes('from')+'" '+(loading?'disabled':'')+'></div><span class="daily-range-separator">至</span><div class="daily-date-field"><label for="data-to">结束日期</label><input id="data-to" type="date" data-data-field="to" value="'+e(data.to)+'" required aria-invalid="'+data.invalidFields.includes('to')+'" '+(loading?'disabled':'')+'></div><button class="button primary" type="submit" '+(loading?'disabled':'')+'>'+(loading?'查询中…':'查询')+'</button><button class="button ghost" type="button" data-action="reset-app-data" '+(loading?'disabled':'')+'>重置</button>'+marker('R-016')+'</form>'+
  '<div class="field-error daily-validation" id="data-validation" role="alert">'+e(data.validation)+'</div><div class="daily-meta"><span>平台时间：印度时间 UTC+5:30 · 起止日期均包含</span><span class="daily-dirty" data-date-dirty '+(dirty?'':'hidden')+'>日期已修改，点击查询更新</span></div>'+
  '<section class="daily-results" data-rule-anchor="R-015"><div class="daily-summary"><div><span class="daily-stat-label">区间新增安装</span><div class="daily-total"><strong data-daily-total>'+(total===null?'—':fmt(total))+'</strong>'+(total===null?'':'<span>人</span>')+'</div></div><div class="daily-range-caption"><strong>'+e(range.from)+' 至 '+e(range.to)+'</strong><span>'+(loading?'正在查询…':failed?'本次查询失败':hasRecords?'共 '+data.rows.length+' 个有记录日期':'所选范围暂无记录')+'</span></div></div>'+
  '<div class="daily-table-heading"><h3>按日明细 '+marker('R-015')+'</h3><span>新安装与日活跃均按当前白包核算</span></div><div class="table-card"><div class="table-scroll"><table class="data-table daily-table" aria-label="白包每日新安装与日活跃" aria-busy="'+loading+'"><thead><tr><th scope="col">日期</th><th scope="col">新安装人数</th><th scope="col">日活跃人数</th></tr></thead><tbody>'+tableBody+'</tbody></table></div></div><p class="input-help">日活跃按自然日去重，同一用户当天多次打开仅计 1 人；不同日期分别统计。TG 分布仍按列表的最新检测结果展示。</p></section><p class="daily-demo-note">演示数据覆盖 2026-11-05 至 2026-11-18；其他日期用于查看暂无记录状态。</p></section>';
  const footer='<label class="data-demo-control"><span class="demo-control-label">审阅辅助</span><input type="checkbox" id="data-fail-next" '+(data.failNext?'checked':'')+' '+(loading?'disabled':'')+'>演示：下次查询失败</label><button class="button" type="button" data-action="close-app-data">关闭</button>';
  return modalShell('白包数据 · '+e(app.name),e(app.package)+' <span class="tiny-text"> / 当前白包自身 · 按日查看</span>',body,footer,'','white-data-modal');
}

function renderModal(restoreFocus=false){
  const root=$('#modal-root');
  const previousScroll=$('.modal-body')?.scrollTop||0;
  if(!state.modal){root.innerHTML='';return;}
  // Keep the close controls stable while an asynchronous data query refreshes.
  if(restoreFocus&&state.modal.type==='app-data'&&$('.white-app-data',root)){
    const template=document.createElement('template');
    template.innerHTML=appDataDialog();
    const nextBody=$('.modal-body',template.content);
    const currentBody=$('.modal-body',root);
    currentBody.replaceChildren(...nextBody.childNodes);
    currentBody.scrollTop=previousScroll;
    const failToggle=$('#data-fail-next',root);
    failToggle.checked=state.appData.failNext;
    failToggle.disabled=state.appData.status==='loading';
    if(state.selectedRule)$$('[data-rule-id="'+state.selectedRule+'"]',root).forEach(node=>node.classList.add('selected'));
    return;
  }
  if(state.modal.type==='app'){
    const app=state.draft;
    const tabs='<div class="modal-tabs" role="tablist" aria-label="App 设置分类">'+[['base','基础信息'],['original','广告与事件']].map(([key,label])=>'<button type="button" role="tab" aria-selected="'+(state.editTab===key)+'" class="'+(state.editTab===key?'active':'')+'" data-action="edit-tab" data-tab="'+key+'">'+label+'</button>').join('')+'</div>';
    root.innerHTML=modalShell('编辑白包 APP',e(app.name)+' <span class="tiny-text"> / '+e(app.package)+'</span>',state.editTab==='base'?baseForm():originalForm(),'<span class="footer-note">仅修改白包原有设置</span><div class="footer-buttons"><button type="button" class="button ghost" data-action="cancel-edit">取消</button><button type="button" class="button primary" data-action="save-app">保存配置</button></div>',tabs);
  }else if(state.modal.type==='app-data'){
    root.innerHTML=appDataDialog();
  }else if(state.modal.type==='package'){
    const pkg=state.packageDraft;
    const tabs='<div class="modal-tabs" role="tablist" aria-label="B 包设置分类">'+[['base','投放设置'],['config','国家与跳转']].map(([key,label])=>'<button type="button" role="tab" aria-selected="'+(state.packageTab===key)+'" class="'+(state.packageTab===key?'active':'')+'" data-action="package-tab" data-tab="'+key+'">'+label+'</button>').join('')+'</div>';
    const footer='<span class="footer-note" data-rule-anchor="R-012">'+marker('R-012')+'仅修改当前 B 包；保存后生效</span><div class="footer-buttons"><button type="button" class="button ghost" data-action="cancel-package">取消</button><button type="button" class="button primary" data-action="save-package">保存 B 包</button></div>';
    root.innerHTML=modalShell('编辑 B 包',e(pkg.name)+' <span class="tag '+(pkg.type==='live'?'purple':'blue')+'">'+(pkg.type==='live'?'应用拉活':'客服建联')+'</span> <span class="tiny-text">#'+pkg.id+' · 所有下属素材共用</span>',state.packageTab==='base'?packageBaseForm():jumpForm(),footer,tabs);
  }else if(state.modal.type==='materials'){
    const pkg=state.packages.find(p=>p.id===state.modal.packageId);
    const body='<div class="notice" data-rule-anchor="R-010"><span class="info-symbol">i</span><span><strong>跳转与国家：继承所属 B 包</strong>　'+(pkg.type==='live'?'应用拉活固定使用 B 包的唯一地址。':'客服建联根据 TG 安装状态，从本 B 包的对应组分配地址。')+' 素材不再单独维护国家。 '+marker('R-010')+'</span></div><div class="material-source"><span>所属 B 包：<strong>'+e(pkg.name)+'</strong></span><button class="button small" type="button" data-action="source-config">查看 B 包配置 ↗</button><button class="button small primary" type="button" data-action="new-material" style="margin-left:auto">＋ 新增广告</button></div><div class="inherited-country"><span>统一投放国家</span><div class="country-tags">'+countryTags(pkg)+'</div><span class="tiny-text">继承自 B 包</span></div><div class="table-card"><div class="table-scroll"><table class="data-table material-table" aria-label="广告素材列表"><thead><tr><th>广告类型</th><th>素材</th><th>跳转方式</th><th>国家（继承 B 包）</th><th>出价金额</th><th>状态</th><th>操作</th></tr></thead><tbody>'+pkg.materials.map(material=>'<tr><td>'+material.kind+'</td><td><div class="mini-creative '+(material.kind==='激励视频'?'video':'')+' '+(material.kind==='开屏广告'?'portrait':'')+'">'+(material.kind==='激励视频'?'▶':'DEMO')+'</div></td><td><span class="tag blue">B 包统一分配</span><div class="config-source">所属 B 包 #'+pkg.id+'</div></td><td><div class="country-tags">'+countryTags(pkg)+'</div><div class="tiny-text">继承，不可单独修改</div></td><td>¥'+e(material.price)+'</td><td>'+(material.enabled?'<span class="status">启用</span>':'<span class="tag muted">停用</span>')+'</td><td><button class="link-button" data-action="edit-material" data-id="'+material.id+'">编辑</button></td></tr>').join('')+'</tbody></table></div></div><p class="secondary-note">修改统一地址或国家请进入所属 B 包。素材仍维护内容、广告位、出价和状态。</p>';
    root.innerHTML=modalShell('广告信息 · '+e(pkg.name),'投放 #'+pkg.id+' · '+(pkg.type==='live'?'应用拉活':'客服建联')+' · '+pkg.apps.length+' 个关联白包',body,'<span class="footer-note">当前 B 包下所有素材共用国家及跳转规则</span><button class="button" data-action="close-modal">关闭</button>','','material-modal');
  }else if(state.modal.type==='material-edit'){
    const material=state.modal.material;
    const pkg=state.packages.find(p=>p.id===state.modal.packageId);
    const body='<div class="form-grid"><div class="field"><label for="material-kind">广告类型</label><select id="material-kind" data-material-field="kind">'+['开屏广告','Banner广告','插屏广告','激励视频'].map(kind=>'<option '+(material.kind===kind?'selected':'')+'>'+kind+'</option>').join('')+'</select></div><div class="field"><label for="material-state">状态</label><select id="material-state" data-material-field="enabled"><option value="true" '+(material.enabled?'selected':'')+'>启用</option><option value="false" '+(!material.enabled?'selected':'')+'>停用</option></select></div><div class="field full"><label for="material-file">素材</label><input id="material-file" class="file-input" type="file" accept="image/*,video/*"><div class="material-preview"><strong>DEMO · '+material.kind+'</strong><span>了解更多 ↗</span></div><p class="input-help" id="material-file-hint">演示素材，仅用于表达原有素材配置位置。</p></div><div class="field"><label for="material-price">出价金额</label><input id="material-price" type="number" min="0" step="any" data-material-field="price" value="'+e(material.price)+'"></div><div class="field"><label>投放国家</label><div class="country-tags inherited-readonly">'+countryTags(pkg)+'</div><p class="input-help">继承 B 包，素材不单独配置</p></div><div class="field full" data-rule-anchor="R-010"><label>跳转方式 '+marker('R-010')+'</label><div class="notice"><span class="info-symbol">i</span><span>B 包统一分配。跳转地址与国家均由所属 B 包“'+e(pkg.name)+'”维护，当前素材不可覆盖。</span></div></div></div>';
    root.innerHTML=modalShell(state.modal.isNew?'新增广告素材':'编辑广告素材','素材归属 B 包 #'+pkg.id+'，统一继承地址及国家。',body,'<span class="footer-note">只更新演示素材数据</span><div class="footer-buttons"><button class="button ghost" data-action="cancel-material">取消</button><button class="button primary" data-action="save-material">保存素材</button></div>');
  }
  if(restoreFocus){$('.modal-body').scrollTop=previousScroll;}else{$('.modal')?.focus({preventScroll:true});}
  if(state.selectedRule)$$('[data-rule-id="'+state.selectedRule+'"]').forEach(node=>node.classList.add('selected'));
}

function closeEdit(){
  const returnTo=state.returnTo;
  state.draft=null;state.switchNotice=false;state.returnTo=null;
  state.modal=returnTo?{...returnTo}:null;
  renderModal();
  if(!returnTo&&focusedBeforeModal?.isConnected)focusedBeforeModal.focus({preventScroll:true});
}

function saveApp(){
  if(!state.draft.name.trim()||!state.draft.package.trim()){
    state.editTab='base';renderModal();$('#base-error').textContent='APP 名称和包名为原有必填项，请填写后保存。';return;
  }
  const app=clone(state.draft);
  state.apps[state.apps.findIndex(a=>a.id===app.id)]=app;
  closeEdit();renderPage();renderSimulation();showToast('已保存 '+app.name+' 的原有设置（演示）');
}

function closePackage(){
  const back=state.returnTo;
  state.packageDraft=null;state.returnTo=null;state.switchNotice=false;state.countryOpen=false;state.countryQuery='';
  state.modal=back?clone(back):null;renderModal();
  if(!back&&focusedBeforeModal?.isConnected)focusedBeforeModal.focus({preventScroll:true});
}

function savePackage(){
  if(!state.packageDraft.name.trim()||!state.packageDraft.apps.length){
    state.packageTab='base';renderModal();$('#package-error').textContent='请填写投放名称并至少关联一个白包 App。';return;
  }
  const pkg=clone(state.packageDraft);
  pkg.identifier=pkg.identifier.trim();pkg.tgUrls=nonempty(pkg.tgUrls);pkg.otherUrls=nonempty(pkg.otherUrls);
  if(pkg.csType==='bot')pkg.tgUrls=pkg.tgUrls.slice(0,1);
  state.packages[state.packages.findIndex(p=>p.id===pkg.id)]=pkg;
  closePackage();renderPage();normalizeSimApp();renderSimulation();showToast('已保存 B 包配置；下属素材同步继承国家与跳转规则（演示）');
}

function renderRules(){
  $("#rules-panel").innerHTML=ruleDefinitions.map(rule=>`${rule.category?`<div class="rule-category">${rule.category}</div>`:""}<article class="rule-card ${state.selectedRule===rule.id?"selected":""}" id="rule-${rule.id}" data-rule-target="${rule.id}" tabindex="0" role="button" aria-label="定位 ${rule.id} ${rule.title}"><div class="rule-card-header"><span class="rule-code">${rule.id}</span><h3>${rule.title}</h3></div><p class="rule-trigger">${rule.trigger}</p><p>${rule.text}</p>${rule.extra?`<p>${rule.extra}</p>`:""}</article>`).join("");
}

function setReviewTab(tab){
  const simulation=tab==="simulation";
  $("#rules-tab").setAttribute("aria-selected",String(!simulation));$("#simulation-tab").setAttribute("aria-selected",String(simulation));
  $("#rules-panel").hidden=simulation;$("#simulation-panel").hidden=!simulation;
  if(simulation)renderSimulation();
}

function selectRule(id,fromCard=false){
  state.selectedRule=id;
  if(fromCard){
    if(['R-001','R-002'].includes(id)){state.modal=null;state.page='apps';renderPage();renderModal();}
    else if(['R-014','R-015','R-016'].includes(id)){
      if(state.modal?.type!=='app-data'){state.page='apps';renderPage();openAppData(13);}
    }
    else if(id==='R-010'){
      if(!['materials','material-edit'].includes(state.modal?.type)){state.page='packages';renderPage();state.modal={type:'materials',packageId:21};renderModal();}
    }else{
      let packageId=state.packageDraft?.id||21;
      const current=state.packageDraft||state.packages.find(p=>p.id===packageId);
      if(id==='R-004'&&current.type!=='live')packageId=8;
      if(['R-005','R-006','R-007'].includes(id)&&current.type!=='cs')packageId=21;
      if(state.modal?.type!=='package'||state.packageTab!=='config'||state.modal.packageId!==packageId){
        state.page='packages';renderPage();openPackage(packageId,'config',state.modal?.type==='materials'?clone(state.modal):null);
      }
    }
  }
  setReviewTab('rules');
  $$('.selected-target').forEach(node=>node.classList.remove('selected-target'));
  $$('.rule-card.selected,.rule-marker.selected').forEach(node=>node.classList.remove('selected'));
  const card=$('#rule-'+id);card.classList.add('selected');
  $$('[data-rule-id="'+id+'"]').forEach(node=>node.classList.add('selected'));
  if(fromCard){const target=$('.modal [data-rule-anchor="'+id+'"]')||$('.product-stage [data-rule-anchor="'+id+'"]');if(target){target.classList.add('selected-target');target.scrollIntoView({behavior:'smooth',block:'nearest',inline:'nearest'});const focusable=$('input,button,select',target);(focusable||target).focus?.({preventScroll:true});}}
  else card.scrollIntoView({behavior:'smooth',block:'nearest'});
}

function normalizeSimApp(){
  const pkg=state.packages.find(p=>p.id===Number(state.sim.packageId));
  if(!pkg.apps.includes(Number(state.sim.appId)))state.sim.appId=pkg.apps[0];
}

function renderSimulation(){
  normalizeSimApp();
  const sim=state.sim,pkg=state.packages.find(p=>p.id===Number(sim.packageId));
  const pool=pkg.type==='live'?(pkg.live.trim()?[pkg.live]:[]):nonempty(sim.tg==='yes'?pkg.tgUrls:pkg.otherUrls);
  const result=sim.result;
  $('#simulation-panel').innerHTML='<div class="simulation-head"><h3>Android SDK 分流演示</h3><p>按所选 B 包的<strong>已保存配置</strong>模拟点击。同一 B 包的不同来源白包使用同一组地址。不实际跳转或上报。</p></div><div class="simulation-form"><label for="sim-package">素材所属 B 包</label><select id="sim-package" data-sim-field="packageId">'+state.packages.map(p=>'<option value="'+p.id+'" '+(p.id===Number(sim.packageId)?'selected':'')+'>'+e(p.name)+'</option>').join('')+'</select><label for="sim-app">来源白包 App</label><select id="sim-app" data-sim-field="appId">'+pkg.apps.map(id=>{const app=state.apps.find(a=>a.id===id);return '<option value="'+id+'" '+(id===Number(sim.appId)?'selected':'')+'>'+e(app.name)+'</option>';}).join('')+'</select><label for="sim-tg">最近一次检测结果</label><select id="sim-tg" data-sim-field="tg"><option value="no" '+(sim.tg==='no'?'selected':'')+'>未安装 TG</option><option value="yes" '+(sim.tg==='yes'?'selected':'')+'>已安装 TG</option><option value="unknown" '+(sim.tg==='unknown'?'selected':'')+'>无法确定（按未安装）</option><option value="unreported" '+(sim.tg==='unreported'?'selected':'')+'>历史未上报（按未安装）</option></select><label class="checkbox-label"><input type="checkbox" id="sim-fail" '+(sim.fail?'checked':'')+'>模拟分配请求失败</label><div class="sim-config">投放类型：<strong>'+(pkg.type==='live'?'应用拉活':'客服建联')+'</strong><br>国家范围：'+e(countryText(pkg))+'<br>'+(pkg.type==='live'?'不区分 TG 状态 · 唯一地址':'客服地址类型：'+(pkg.csType==='bot'?'TG 机器人':'其他')+'<br>当前分组：'+(sim.tg==='yes'?'已安装 TG':'未安装 TG'))+'<br>可分配地址：<strong>'+pool.length+' 条</strong>'+(pool.length>1?' · 每次点击重新随机':pool.length===1?' · 固定返回':' · App 静默结束')+'</div><button class="button primary" type="button" data-action="simulate" '+(sim.loading?'disabled':'')+'>'+(sim.loading?'<span class="request-dot"></span>正在请求分配…':'模拟点击素材')+'</button></div>'+
  (result?'<section class="sim-result" aria-live="polite"><span class="result-label">REVIEW LOG · 第 '+result.count+' 次请求</span><h4>'+(result.address?'已拿到地址，模拟发起跳转':result.failed?'分配失败，静默结束':'无可分配地址，静默结束')+'</h4><dl><dt>地址配置来源</dt><dd>B 包 #'+result.packageId+' · '+e(result.packageName)+'</dd><dt>分配地址</dt><dd data-sim-address>'+(result.address?e(result.address):'<span class="sim-silent">无 · 不跳转</span>')+'</dd><dt>Adjust 事件</dt><dd>'+(result.event?'<code>app_click_wa</code><br>发起跳转时上报 · Key 在 App 内':'不上报 app_click_wa')+'</dd><dt>App 端表现</dt><dd>'+(result.address?'仅演示发起跳转，不等待目标打开结果':'不提示、不跳转，点击无反应')+'</dd></dl></section>':'')+'<div class="sim-log">以上为审阅日志，不是 App 弹窗。国家范围用于素材投放，本演示不扩展国家匹配逻辑。配置修改请先保存。</div><button class="text-button" style="margin-top:9px;font-size:11px" data-action="sim-edit">编辑当前 B 包配置 ↗</button>';
}

function simulate(){
  if(state.sim.loading)return;
  const request=clone(state.sim),pkg=clone(state.packages.find(p=>p.id===Number(state.sim.packageId)));
  state.sim.loading=true;state.sim.result=null;renderSimulation();clearTimeout(simulationTimer);
  simulationTimer=setTimeout(()=>{
    const pool=pkg.type==='live'?(pkg.live.trim()?[pkg.live]:[]):nonempty(request.tg==='yes'?pkg.tgUrls:pkg.otherUrls);
    const address=!request.fail&&pool.length?pool[Math.floor(Math.random()*pool.length)]:null;
    state.sim.count+=1;state.sim.result={count:state.sim.count,address,failed:request.fail,event:!!address&&pkg.type==='cs'&&request.tg!=='yes',packageId:pkg.id,packageName:pkg.name};
    state.sim.loading=false;renderSimulation();
  },450);
}

function openMaterials(id){focusedBeforeModal=document.activeElement;state.modal={type:"materials",packageId:Number(id)};renderModal();}

document.addEventListener("click",event=>{
  const rule=event.target.closest("[data-rule-id]");if(rule){selectRule(rule.dataset.ruleId);return;}
  const card=event.target.closest("[data-rule-target]");if(card){selectRule(card.dataset.ruleTarget,true);return;}
  const button=event.target.closest("[data-action]");if(!button||button.disabled)return;
  const action=button.dataset.action;
  if(action==="navigate"){state.page=button.dataset.page;state.modal=null;renderModal();renderPage();}
  else if(action==="clear-filter"){state.filter={status:"",keyword:""};renderPage();}
  else if(action==="clear-package-filter"){state.packageFilter={type:"",keyword:""};renderPage();}
  else if(action==="app-data")openAppData(button.dataset.id);
  else if(action==="close-app-data")closeAppData();
  else if(action==="retry-app-data")queryAppData();
  else if(action==="reset-app-data"){state.appData.from=defaultDataRange.from;state.appData.to=defaultDataRange.to;queryAppData();}
  else if(action==="edit-app")openEdit(button.dataset.id);
  else if(action==="edit-package")openPackage(button.dataset.id);
  else if(action==="package-tab"){state.packageTab=button.dataset.tab;renderModal();}
  else if(action==="save-package")savePackage();
  else if(action==="cancel-package")closePackage();
  else if(action==="toggle-countries"){state.countryOpen=!state.countryOpen;renderModal(true);}
  else if(action==="clear-countries"){state.packageDraft.countries=[];refreshCountries();}
  else if(action==="remove-country"){state.packageDraft.countries=state.packageDraft.countries.filter(code=>code!==button.dataset.country);refreshCountries();}
  else if(action==="edit-tab"){state.editTab=button.dataset.tab;renderModal();}
  else if(action==="save-app")saveApp();
  else if(action==="cancel-edit")closeEdit();
  else if(action==="close-modal"){
    if(state.modal?.type==="app-data")closeAppData();
    else if(state.modal?.type==="app")closeEdit();
    else if(state.modal?.type==="package")closePackage();
    else if(state.modal?.type==="material-edit"){state.modal={type:"materials",packageId:state.modal.packageId};renderModal();}
    else{state.modal=null;renderModal();if(focusedBeforeModal?.isConnected)focusedBeforeModal.focus({preventScroll:true});}
  }
  else if(action==="add-address"){const group=button.dataset.group;state.packageDraft[group].push("");renderModal(true);const inputs=$$(`[data-address="${group}"]`);inputs.at(-1)?.focus();}
  else if(action==="remove-address"){state.packageDraft[button.dataset.group].splice(Number(button.dataset.index),1);renderModal(true);}
  else if(action==="materials")openMaterials(button.dataset.id);
  else if(action==="source-config"){const back=clone(state.modal);openPackage(state.modal.packageId,"config",back);}
  else if(action==="edit-material"||action==="new-material"){
    const pkg=state.packages.find(p=>p.id===state.modal.packageId);
    state.modal={type:"material-edit",packageId:pkg.id,isNew:action==="new-material",material:action==="new-material"?{id:Date.now(),kind:"Banner广告",price:"1",enabled:true}:clone(pkg.materials.find(m=>m.id===Number(button.dataset.id)))};renderModal();
  }
  else if(action==="cancel-material"){state.modal={type:"materials",packageId:state.modal.packageId};renderModal();}
  else if(action==="save-material"){
    const pkg=state.packages.find(p=>p.id===state.modal.packageId);
    const priceInput=$("#material-price");
    if(!priceInput.checkValidity()){priceInput.reportValidity();return;}
    if(state.modal.isNew)pkg.materials.push(clone(state.modal.material));else pkg.materials[pkg.materials.findIndex(m=>m.id===state.modal.material.id)]=clone(state.modal.material);
    state.modal={type:"materials",packageId:pkg.id};renderModal();renderPage();showToast("素材已保存，地址与国家由所属 B 包统一维护（演示）");
  }
  else if(action==="simulate")simulate();
  else if(action==="sim-edit")openPackage(state.sim.packageId);
});

document.addEventListener("input",event=>{
  const target=event.target;
  if(target.dataset.dataField&&state.appData){state.appData[target.dataset.dataField]=target.value;const dirty=$("[data-date-dirty]");if(dirty)dirty.hidden=state.appData.from===state.appData.appliedFrom&&state.appData.to===state.appData.appliedTo;}
  if(target.dataset.field&&state.draft)state.draft[target.dataset.field]=target.value;
  if(target.dataset.address&&state.packageDraft)state.packageDraft[target.dataset.address][Number(target.dataset.index)]=target.value;
  if(target.dataset.packageField&&state.packageDraft)state.packageDraft[target.dataset.packageField]=target.value;
  if(target.id==="country-search"){state.countryQuery=target.value;$(".country-options").innerHTML=countryOptions();}
  if(target.dataset.frequency&&state.draft)state.draft.frequencyRows[Number(target.dataset.frequency)][Number(target.dataset.part)]=Number(target.value);
  if(target.dataset.materialField&&state.modal?.material)state.modal.material[target.dataset.materialField]=target.dataset.materialField==="enabled"?target.value==="true":target.value;
});

document.addEventListener("change",event=>{
  const target=event.target;
if(target.name==="cs-type"){
    if(state.packageDraft.csType!==target.value){
      state.packageDraft.csType=target.value;state.switchNotice=target.value==='bot';
      if(target.value==='bot')state.packageDraft.tgUrls=[''];
      renderModal(true);
    }
  }
  if(target.dataset.packageField&&state.packageDraft)state.packageDraft[target.dataset.packageField]=target.value;
  if(target.matches('input[type="checkbox"][data-country]')){
    const code=target.dataset.country;
    state.packageDraft.countries=target.checked?[...new Set([...state.packageDraft.countries,code])]:state.packageDraft.countries.filter(id=>id!==code);
    refreshCountries();
  }
  if(target.dataset.associatedApp){
    const id=Number(target.dataset.associatedApp);
    state.packageDraft.apps=target.checked?[...new Set([...state.packageDraft.apps,id])]:state.packageDraft.apps.filter(appId=>appId!==id);
  }

  if(target.dataset.field&&state.draft)state.draft[target.dataset.field]=target.value;
  if(target.dataset.materialField&&state.modal?.material)state.modal.material[target.dataset.materialField]=target.dataset.materialField==="enabled"?target.value==="true":target.value;
  if(target.dataset.simField||target.id==="sim-fail"){
    if(target.id==="sim-fail")state.sim.fail=target.checked;else state.sim[target.dataset.simField]=target.value;
    clearTimeout(simulationTimer);state.sim.loading=false;state.sim.result=null;renderSimulation();
  }
  if(target.id==="data-fail-next"&&state.appData)state.appData.failNext=target.checked;
  if(target.dataset.dataField&&state.appData)state.appData[target.dataset.dataField]=target.value;
  if(target.id==="material-file"&&target.files?.length)$("#material-file-hint").textContent=`已选择：${target.files[0].name}（本地演示，不上传）`;
});

document.addEventListener("submit",event=>{
  if(event.target.id==="app-data-filter"){event.preventDefault();queryAppData();}
  if(event.target.id==="app-filter"){event.preventDefault();const form=new FormData(event.target);state.filter={status:form.get("status"),keyword:String(form.get("keyword")).trim()};renderPage();}
  if(event.target.id==="package-filter"){event.preventDefault();const form=new FormData(event.target);state.packageFilter={type:form.get("type"),keyword:String(form.get("keyword")).trim()};renderPage();}
});

document.addEventListener("keydown",event=>{
  const card=event.target.closest("[data-rule-target]");
  if(card&&(event.key==="Enter"||event.key===" ")){event.preventDefault();selectRule(card.dataset.ruleTarget,true);}
  if(event.key==="Escape"&&state.modal){event.preventDefault();if(state.modal.type==="app-data")closeAppData();else if(state.modal.type==="app")closeEdit();else if(state.modal.type==="package")closePackage();else if(state.modal.type==="material-edit"){state.modal={type:"materials",packageId:state.modal.packageId};renderModal();}else{state.modal=null;renderModal();}}
  if(event.target.getAttribute("role")==="tab"&&(event.key==="ArrowLeft"||event.key==="ArrowRight")){
    const tabs=$$('[role="tab"]',event.target.closest('[role="tablist"]'));const index=tabs.indexOf(event.target);event.preventDefault();const next=tabs[(index+(event.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length];next.click();next.focus();
  }
});

$("#rules-tab").addEventListener("click",()=>setReviewTab("rules"));
$("#simulation-tab").addEventListener("click",()=>setReviewTab("simulation"));
$("#reset-demo").addEventListener("click",()=>{
  clearTimeout(simulationTimer);clearTimeout(appDataTimer);state.appData=null;state.apps=clone(initialApps);state.packages=clone(initialPackages);state.page="apps";state.modal=null;state.draft=null;state.packageDraft=null;state.returnTo=null;state.switchNotice=false;state.countryOpen=false;state.countryQuery="";state.selectedRule=null;state.filter={status:"",keyword:""};state.packageFilter={type:"",keyword:""};state.sim={packageId:21,appId:13,tg:"no",fail:false,count:0,loading:false,result:null};renderPage();renderModal();renderRules();renderSimulation();showToast("演示数据已重置");
});

renderPage();renderRules();renderSimulation();
