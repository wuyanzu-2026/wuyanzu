/* v5 交互原型。所有业务数据仅存于内存，不调用任何远程接口。 */
'use strict';
(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const deep = value => JSON.parse(JSON.stringify(value));
  const num = value => Number(value || 0).toLocaleString('en-US');
  const rate = (a, b) => b ? `${(a / b * 100).toFixed(1)}%` : '—';
  const slots = [{key:'open',name:'开屏'},{key:'banner',name:'Banner'},{key:'interstitial',name:'插屏'},{key:'rewarded',name:'激励'}];
  const scenarioNames = {normal:'正常流程','clone-fail':'克隆失败 · 完整回滚','clone-timeout-success':'克隆超时 · 核查后成功','clone-timeout-fail':'克隆超时 · 核查后失败',restricted:'指定投放账户 · 无创建权限','data-error':'数据加载失败','data-empty':'数据为空'};
  const rules = [
    ['R-001','apps','四个广告位默认开启','新增和已有白包的开屏、Banner、插屏、激励均默认开启，每个广告位独立保存。','业务规则','white'],
    ['R-002','apps','关闭后该位置不展示任何广告','关闭某广告位后，该位自有广告与 Google 广告均不展示；其他广告位不受影响。关闭状态独立于投放次数与间隔。','业务规则','white'],
    ['R-003','apps','关闭不清空次数与间隔','关闭后暂不可编辑该位的次数与间隔，但保留原值；重新开启后恢复原配置。保存时不能将关闭位置的数值重置为零。','保存规则','white'],
    ['R-004','apps','SDK 下次拉取配置时生效','保存仅更新后台配置。点击“模拟 SDK 拉取”读取已保存版本，未保存修改不参与；原型用本地快照表达下次拉取生效。','生效时机','white'],
    ['R-006','apps','注册事件 Key 允许留空','保留现有“注册事件 Key”字段，允许留空保存。移除 B 包注册接收地址区块不影响该原有字段。','字段校验','white'],
    ['R-008','packages','客服建联一键克隆','每次只复制一条投放。复制配置、素材、白包关联及机器人/客服组绑定；新投放默认停用，历史展示、点击、付费、建联均不复制。','核心流程'],
    ['R-009','packages','应用拉活先填写新包名','应用拉活保留包名唯一规则，填写不重复的新包名后才克隆；空值及与停用投放重名均阻止提交。取消不创建副本。','字段校验','clone'],
    ['R-010','packages','名称冲突与长度处理','客服投放依次追加“-副本”“-副本2”…，查重包含停用记录。原名称过长时截短原文，为完整后缀预留空间，总长不超 200 字符。应用拉活不改写真实包名为副本名。','命名规则'],
    ['R-011','packages','完整回滚与未知结果核查','投放、关联与素材完整成功或完整回滚。处理中禁用重复提交；同一次操作重试不另建副本。网络超时显示“结果确认中”，先核查再反馈。可通过顶部演示场景查看失败或超时。','异常处理'],
    ['R-012','packages','沿用现有创建权限','克隆同时要求可访问源投放且拥有创建权限。指定投放账户不可通过克隆绕过新建限制。顶部场景可切换为指定投放账户演示。','权限'],
    ['R-013','groups','独立维护其他客服组','每组维护名称及一个或多个客服地址。保存时校验名称与地址非空，地址采用 HTTP/HTTPS；原型仅保存地址文本，不访问外部站点。','页面与校验','group'],
    ['R-014','groups','服务端随机分配客服地址','用户跳转时从所绑定组内随机选取一个地址，不轮询、不按权重。分配预览仅在本地模拟随机结果，不代表已调用服务端。','分配规则','preview'],
    ['R-015','groups','被引用的组不能直接删除','所有 B 包引用均参与删除校验，包含停用投放与克隆副本。被引用时列出关联投放并提示先解除绑定；无引用时确认后删除。','异常处理'],
    ['R-016','packages','TG 机器人类型使用单选绑定','客服建联且地址类型为 TG 机器人时，“已安装 TG”单选现有机器人，“未安装 TG”单选其他客服组。保存绑定关系，不在 B 包里手填这两类地址。','表单交互','package'],
    ['R-017','packages','已有非机器人地址迁移保留','上线将已有非机器人地址迁移为客服组并保留原 B 包绑定，不丢失地址或要求运营重新填写。原型以“存量迁移”示例组展示迁移结果。国家配置仍在 B 包。','兼容规则','package'],
    ['R-018','bots','复用已有 TG 机器人','机器人仍在现有 Telegram 机器人菜单维护，B 包下拉框直接引用。此页为原有页面示意，本次不新增机器人维护流程。','范围边界'],
    ['R-019','data','广告数据独立页面','从单条 B 包的“广告数据”进入独立页面，显示投放名称和类型。保留时间范围、时/日/周/月、广告位筛选、指标和趋势，并可返回 B 包列表。','页面导航'],
    ['R-020','data','TG 状态按事件历史快照筛选','全部、已安装 TG、未安装 TG可选。取广告事件发生时记录的状态，用户后续安装或卸载 TG不改变历史归类。建联等后续事件沿关联广告/点击快照筛选。','统计口径'],
    ['R-021','data','当日安装对应统计日期','按白包安装日与对应广告事件日比较。不是查询操作当天，也不是整个区间的起始日；先逐事件判断，再做时间聚合。日期统一采用印度时间 UTC+5:30。','统计口径'],
    ['R-022','data','组合筛选与历史未知兼容','TG 与安装维度可组合。缺失值为未知，全部时保留，指定值时仅统计该维度已知且匹配的记录。未知不能归为未安装 TG 或非当日安装；明细、趋势和比率使用相同结果集。','兼容规则'],
    ['R-023','data','点击率按人数计算','点击率＝点击人数÷展示人数，筛选后按相同范围去重并重算，不能将各行点击率直接求平均。分母为零显示“—”。','指标定义'],
    ['R-024','data','建联率按人数计算','建联率＝建联人数÷点击人数，使用同一筛选范围下的人数重新计算。分母为零显示“—”；应用拉活沿用原类型口径，不涉及建联时显示“—”。','指标定义'],
    ['R-025','data','明细、趋势与数据状态','时/日/周/月及广告位影响明细和趋势。展示次数/人数、点击次数/人数、分配次数/人数、建联总/新/老及人均展示保留；汇总人数整体去重，不机械相加。支持加载、空、错误与重试。','页面状态'],
    ['R-026','data','新旧 SDK 与离线补报','新事件保留事件时 TG 状态、白包安装时间和事件时间；跨日离线补报保持原快照。旧 SDK缺字段为未知，只在有可信历史证据时补齐，不能拿首次入库时间代替真实安装时间。','兼容规则'],
    ['R-030','data','按来源白包筛选','默认全部白包，可单选当前绑定或有历史数据的已解绑白包。与日期、TG、安装和广告位共同生效，指标、明细、趋势和转化率统一刷新。全部人数整体去重；来源未知仅保留在全部，解绑不改变历史归属。','筛选规则'],
    ['R-027','packages','副本素材独立，绑定关系复用','克隆会生成独立素材记录，后续修改副本素材不改变原投放。机器人、客服组只复制引用，不重复创建；两条投放绑定同一客服组时仍使用该共享组。','复制边界','materials'],
  ].map(([id,page,title,body,type,modal,note]) => ({id,page,title,body,type,modal,note}));
  const ruleMap = Object.fromEntries(rules.map(r => [r.id,r]));
  const titles = {apps:'白包 APP',packages:'B 包管理',groups:'其他客服组',bots:'Telegram 机器人',data:'广告数据'};
  const templates = slots.map((s,i) => ({id:100+i,slot:s.key,source:`演示素材 / ${s.name}素材`,jump:'https://landing.example.invalid/demo',bid:[0.1,0.2,0.3,0.4][i],enabled:true}));
  function makeInitial(epoch = 1) {
    const adSlots = () => Object.fromEntries(slots.map(s => [s.key,{enabled:true,first:1,interval:2}]));
    return {epoch,page:'apps',scenario:'normal',modal:null,activeRule:null,ruleView:'page',ruleSearch:'',nextId:100,highlightId:null,toast:null,pulled:{},operations:{},pending:{},filters:{apps:{keyword:'',status:''},packages:{keyword:'',type:'',app:'',status:''},groups:{keyword:''}},data:{campaignId:29,form:{from:'2026-11-17',to:'2026-11-19',sourceApp:'all',tg:'all',install:'all',slots:slots.map(s=>s.key)},applied:{from:'2026-11-17',to:'2026-11-19',sourceApp:'all',tg:'all',install:'all',slots:slots.map(s=>s.key)},granularity:'day',status:'ready',error:'',visible:{show:true,click:true,connect:true}},apps:[
      {id:13,appId:'demo_walk_000001',name:'步行日记',packageName:'com.demo.steplite',kind:'客服建联',enabled:true,revision:1,adjustToken:'demo-walk-token',authToken:'',registerKey:'demo_reg_walk',payKey:'demo_pay_walk',firstPayKey:'demo_first_walk',installKey:'demo_install_walk',connectKey:'demo_connect_walk',topOnId:'demo-topon-01',storeUrl:'https://store.example.invalid/walk',slots:adSlots(),installs:1154},
      {id:15,appId:'demo_archive_01',name:'旧版工具箱',packageName:'com.demo.toolbox.legacy',enabled:false,revision:1,slots:adSlots(),installs:0},
      {id:14,appId:'demo_survey_0001',name:'轻问卷 Global',packageName:'com.demo.survey',kind:'拉活＋建联',enabled:true,revision:1,adjustToken:'demo-survey-token',authToken:'',registerKey:'',payKey:'demo_pay_survey',firstPayKey:'demo_first_survey',installKey:'demo_install_survey',connectKey:'demo_connect_survey',topOnId:'demo-topon-02',storeUrl:'https://store.example.invalid/survey',slots:adSlots(),installs:684}
    ],packages:[
      {id:29,type:'cs',name:'星桥客服-AE',packageName:'',appIds:[13,14],category:'support',countries:'阿联酋 AE',addressType:'tg',botId:1,groupId:1,installedUrl:'',uninstalledUrl:'',storeUrl:'',enabled:true,createdAt:'2026-11-18 18:33',materials:deep(templates)},
      {id:28,type:'cs',name:'星桥客服-IN',packageName:'',appIds:[13],category:'support',countries:'印度 IN',addressType:'tg',botId:2,groupId:2,installedUrl:'',uninstalledUrl:'',storeUrl:'',enabled:true,createdAt:'2026-11-18 18:32',materials:deep(templates)},
      {id:8,type:'b',name:'',packageName:'com.demo.puzzle',appIds:[14],category:'game',countries:'全球',addressType:'other',botId:null,groupId:null,installedUrl:'',uninstalledUrl:'',storeUrl:'https://store.example.invalid/puzzle',enabled:true,createdAt:'2026-11-17 12:39',materials:deep(templates)},
      {id:30,type:'cs',name:'星桥客服-AE-副本',packageName:'',appIds:[13,14],category:'support',countries:'阿联酋 AE',addressType:'tg',botId:1,groupId:1,installedUrl:'',uninstalledUrl:'',storeUrl:'',enabled:false,createdAt:'2026-11-18 19:10',materials:deep(templates)},
      {id:31,type:'cs',name:'落地页客服',packageName:'',appIds:[13],category:'',countries:'全球',addressType:'other',botId:null,groupId:null,installedUrl:'https://support.example.invalid/installed',uninstalledUrl:'https://support.example.invalid/web',storeUrl:'',enabled:false,createdAt:'2026-11-17 16:20',materials:deep(templates)}
    ],groups:[
      {id:1,name:'海外客服组-AE',migrated:false,addresses:[{name:'客服 A',url:'https://support.example.invalid/ae/alpha'},{name:'客服 B',url:'https://support.example.invalid/ae/beta'},{name:'客服 C',url:'https://support.example.invalid/ae/gamma'}]},
      {id:2,name:'存量迁移 · 星桥客服-IN',migrated:true,addresses:[{name:'原客服地址',url:'https://support.example.invalid/in/legacy'}]},
      {id:3,name:'备用客服组',migrated:false,addresses:[{name:'备用客服',url:'https://support.example.invalid/reserve'}]}
    ],bots:[{id:1,name:'海外接待机器人',username:'demo_overseas_bot',remark:'AE 客服接待',agents:5,created:'2026-11-09'},{id:2,name:'印度接待机器人',username:'demo_india_bot',remark:'IN 客服接待',agents:3,created:'2026-11-06'}]};
  }
  let baseline = null;
  let state = makeInitial();
  let renderingModal = false;
  let marked = new Set();
  let toastTimer;
  const timers = new Set();
  const eventRows = makeEvents();
  function schedule(fn, ms) {const epoch=state.epoch;const id=setTimeout(()=>{timers.delete(id);if(state.epoch===epoch)fn();},ms);timers.add(id);return id;}
  function makeEvents() {
    const result=[];let id=1;
    for (const campaignId of [29,28,8]) {
      for (const date of ['2026-11-17','2026-11-18','2026-11-19']) {
        for(let i=0;i<24;i++) {
          const installDate=i%5===0?null:['2026-11-19','2026-11-18','2026-11-17','2026-11-10'][i%4];
          if(installDate && date<installDate)continue;
          const user=`demo-${campaignId}-${i}`;
          const tg=date==='2026-11-17'&&i%7===0?null:((i+Math.floor(i/4)+Number(date.slice(-2)))%2===0?'installed':'uninstalled');
          for(const [slotIndex,slot] of slots.entries()) {
            const sourceApp=campaignId===29?(i%11===0?null:i%7===0?15:(i+slotIndex)%3===0?14:13):campaignId===8?14:13;
            const base={sourceApp,campaignId,date,hour:8+(i+slotIndex)%13,slot:slot.key,user,tg,installDate};
            for(let n=0;n<1+i%3;n++)result.push({...base,id:id++,event:'show'});
            if(i%3!==0 && (i+slotIndex)%5!==0) {
              result.push({...base,id:id++,event:'click'});
              if(campaignId!==8 && i%2===0)result.push({...base,id:id++,event:'assign'});
              if(campaignId!==8 && i%4===0)result.push({...base,id:id++,event:'connect',fresh:date===installDate});
            }
          }
          if(campaignId===8 && installDate===date)result.push({id:id++,sourceApp:14,campaignId,date,hour:9,slot:'open',user,tg,installDate,event:'install'});
          if(campaignId===8 && i%8===0)result.push({id:id++,sourceApp:14,campaignId,date,hour:12,slot:'open',user,tg,installDate,event:'pay',amount:1.99});
        }
      }
    }
    return result;
  }
  function mark(id) {if(!rules.some(r=>r.id===id))return '';if((state.modal&&!renderingModal)||marked.has(id))return '';marked.add(id);return `<button type="button" class="rule-mark" data-rule="${id}" aria-label="查看规则 ${id} ${esc(ruleMap[id].title)}">${id}</button>`;}
  const anchor = id => `data-anchor="${id}"`;
  const label = p => p.type==='cs'?p.name:p.packageName;
  const slotName = key => slots.find(s=>s.key===key)?.name||key;
  const appNames = ids => ids.map(id=>state.apps.find(a=>a.id===id)?.name||'白包已移除').join('、');
  const getPackage = id => state.packages.find(p=>p.id===Number(id));
  const groupRefs = id => state.packages.filter(p=>p.groupId===Number(id));
  const allowedCreate = () => state.scenario!=='restricted';
  const actionButton=(text,action,id,extra='')=>`<button type="button" class="btn link" data-action="${action}" data-id="${id}" ${extra}>${text}</button>`;
  const statusTag=enabled=>`<span class="tag ${enabled?'green':'muted'}">${enabled?'启用':'停用'}</span>`;
  const typeTag=type=>`<span class="tag ${type==='cs'?'green':'blue'}">${type==='cs'?'客服建联':'应用拉活'}</span>`;
  function option(value,text,current){return `<option value="${esc(value)}" ${String(value)===String(current)?'selected':''}>${esc(text)}</option>`;}
  function toast(message,type='success') {clearTimeout(toastTimer);$('#toast-root').innerHTML=`<div class="toast ${type}" role="status">${esc(message)}</div>`;toastTimer=setTimeout(()=>{$('#toast-root').innerHTML='';},4500);}
  function filteredPackages() {const f=state.filters.packages;return state.packages.filter(p=>(state.scenario!=='restricted'||[29,8].includes(p.id))&&(!f.keyword||`${label(p)} ${p.packageName}`.toLowerCase().includes(f.keyword.toLowerCase()))&&(!f.type||p.type===f.type)&&(!f.app||p.appIds.includes(Number(f.app)))&&(!f.status||String(p.enabled)===f.status));}
  function sourceApps() {
    const p=getPackage(state.data.campaignId);
    const ids=new Set([...(p?.appIds||[]),...eventRows.filter(e=>e.campaignId===p?.id&&e.sourceApp!=null).map(e=>e.sourceApp)]);
    return state.apps.filter(a=>ids.has(a.id)).map(a=>({...a,unbound:!p.appIds.includes(a.id)}));
  }
  function sourceLabel(value){if(value==='all')return '全部白包';const a=sourceApps().find(a=>String(a.id)===value);return a?a.name+(a.unbound?'（已解绑）':''):'无效白包';}
  function filteredData(form=state.data.applied, ignoreDimensions=false) {
    if(state.scenario==='data-empty')return [];
    return eventRows.filter(e=>e.campaignId===state.data.campaignId&&e.date>=form.from&&e.date<=form.to&&form.slots.includes(e.slot)&&(ignoreDimensions||((form.sourceApp==='all'||String(e.sourceApp)===form.sourceApp)&&(form.tg==='all'||e.tg===form.tg)&&(form.install==='all'||(e.installDate!==null&&(form.install==='today'?e.installDate===e.date:e.installDate<e.date))))));
  }
  function metrics(rows) {
    const by=kind=>rows.filter(e=>e.event===kind);
    const unique=items=>new Set(items.map(e=>e.user)).size;
    const show=by('show'),click=by('click'),connect=by('connect'),assign=by('assign');
    const newUsers=new Set(connect.filter(e=>e.fresh).map(e=>e.user));
    const total=unique(connect);
    return {show:show.length,showUsers:unique(show),click:click.length,clickUsers:unique(click),assign:assign.length,assignUsers:unique(assign),connect:total,connectNew:newUsers.size,connectOld:total-newUsers.size,installs:unique(by('install')),revenue:by('pay').reduce((n,e)=>n+e.amount,0)};
  }
  function packageMetrics(id){return metrics(eventRows.filter(e=>e.campaignId===id));}
  function formatBucket(e,granularity) {
    if(granularity==='hour')return `${String(e.hour).padStart(2,'0')}:00`;
    if(granularity==='month')return e.date.slice(0,7);
    if(granularity==='week'){const d=new Date(`${e.date}T00:00:00Z`);d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));return `${d.toISOString().slice(0,10)} 周`;}return e.date;
  }
  function bucketRows(rows,includeSlot=true) {const m=new Map();for(const e of rows){const bucket=formatBucket(e,state.data.granularity);const key=`${bucket}|${includeSlot?e.slot:''}`;if(!m.has(key))m.set(key,{bucket,slot:e.slot,rows:[]});m.get(key).rows.push(e);}return [...m.values()].sort((a,b)=>a.bucket.localeCompare(b.bucket)||slots.findIndex(s=>s.key===a.slot)-slots.findIndex(s=>s.key===b.slot)).map(g=>({...g,m:metrics(g.rows)}));}
  function listFooter(count){return `<div class="table-footer"><span>共 ${count} 条</span><div class="pagination"><span>20 条 / 页</span><span class="hint-divider">‹</span><span class="page-number">1</span><span class="hint-divider">›</span></div></div>`;}
  function empty(text='暂无数据',detail='调整筛选条件后重试'){return `<div class="empty-state"><span class="empty-icon">▤</span><strong>${esc(text)}</strong><span>${esc(detail)}</span></div>`;}
  function renderApps() {
    const f=state.filters.apps;
    const apps=state.apps.filter(a=>(!f.keyword||`${a.name} ${a.packageName}`.toLowerCase().includes(f.keyword.toLowerCase()))&&(!f.status||String(a.enabled)===f.status));
    return `<div class="page-title-row"><div><h1>白包 APP</h1><p class="page-description">应用配置与广告位控制</p></div><button type="button" class="btn primary" data-action="new-white" ${!allowedCreate()?'disabled title="当前账户无创建权限"':''}>＋ 新增白包 APP</button></div>
      <form class="filters" data-filter-form="apps"><div class="field"><label for="app-status">状态</label><select id="app-status" name="status">${option('','全部',f.status)}${option('true','启用',f.status)}${option('false','停用',f.status)}</select></div><div class="field wide"><label for="app-keyword">关键词</label><input id="app-keyword" name="keyword" value="${esc(f.keyword)}" placeholder="搜索 APP 名称 / 包名"></div><button class="btn primary" type="submit">搜索</button></form>
      <div class="notice compact" ${anchor('R-004')}><span>ⓘ</span><p>四个广告位独立控制。配置保存后，在 SDK 下次拉取时生效。</p>${mark('R-004')}</div>
      <div class="panel"><div class="table-scroll"><table><thead><tr><th>APP 名称 / 包名</th><th>关联投放</th><th ${anchor('R-002')}>广告位开关 ${mark('R-002')}</th><th class="text-right">安装用户</th><th>状态</th><th>操作</th></tr></thead><tbody>${apps.map(a=>`<tr><td><div class="name-cell"><span class="app-tile">${esc(a.name.slice(0,1))}</span><div><strong>${esc(a.name)}</strong><span class="secondary mono">${esc(a.packageName)}</span></div></div></td><td><span class="tag green">${esc(a.kind)}</span></td><td><div class="slot-summary">${slots.map(s=>`<span class="tag ${a.slots[s.key].enabled?'blue':'muted'}">${s.name} · ${a.slots[s.key].enabled?'开':'关'}</span>`).join('')}</div></td><td class="text-right">${num(a.installs)}</td><td>${statusTag(a.enabled)}</td><td>${actionButton('编辑','edit-white',a.id,!allowedCreate()?'disabled title="当前账户不可修改全局白包配置"':'')}</td></tr>`).join('')}</tbody></table></div>${!apps.length?empty('暂无匹配白包'):''}</div>${listFooter(apps.length)}
      <p class="inline-note">关闭广告位将同时停止该位置的自有广告与 Google 广告；原次数、间隔配置仍保留。</p>`;
  }
  function renderPackages() {
    const f=state.filters.packages,pkgs=filteredPackages();
    const ops=Object.values(state.pending);
    return `<div class="page-title-row"><div><h1>B 包管理</h1><p class="page-description">管理应用拉活与客服建联投放</p></div><div class="title-tools" ${anchor('R-012')}>${mark('R-012')}<button type="button" class="btn primary" data-action="new-package" ${!allowedCreate()?'disabled title="指定投放账户不能新建投放"':''}>＋ 新增投放</button></div></div>
    <form class="filters" data-filter-form="packages"><div class="field"><label for="pkg-app">关联白包</label><select id="pkg-app" name="app">${option('','全部',f.app)}${state.apps.map(a=>option(a.id,a.name,f.app)).join('')}</select></div><div class="field"><label for="pkg-type">投放类型</label><select id="pkg-type" name="type">${option('','全部',f.type)}${option('cs','客服建联',f.type)}${option('b','应用拉活',f.type)}</select></div><div class="field wide"><label for="pkg-keyword">名称 / 包名</label><input id="pkg-keyword" name="keyword" value="${esc(f.keyword)}" placeholder="搜索名称或包名"></div><div class="field"><label for="pkg-status">状态</label><select id="pkg-status" name="status">${option('','全部',f.status)}${option('true','启用',f.status)}${option('false','停用',f.status)}</select></div><button class="btn primary" type="submit">搜索</button></form>
    <div class="notice compact" ${anchor('R-008')}><span>⧉</span><p>客服建联直接克隆；应用拉活需填写新包名。副本默认停用，素材独立复制、统计从零开始。</p>${mark('R-008')}${mark('R-009')}</div>
    ${ops.map(op=>`<div class="state-banner" role="status"><span class="spinner"></span>${esc(op.label)} · ${op.phase==='checking'?'结果确认中，正在核查原操作，请勿重复创建':'正在完整复制配置、素材及绑定关系…'}</div>`).join('')}
    <div class="panel" ${anchor('R-010')}><div class="panel-heading"><h3>投放列表 <span class="muted">${pkgs.length}</span></h3><div class="btn-group">${mark('R-010')}${mark('R-011')}${mark('R-027')}</div></div><div class="table-scroll"><table><thead><tr><th>名称 / 包名</th><th>关联白包 / 投放标识</th><th>类型</th><th class="text-right">展示 / 点击 / 建联</th><th>状态</th><th>操作</th></tr></thead><tbody>${pkgs.map(p=>{const m=packageMetrics(p.id),busy=!!state.pending[p.id];return `<tr class="${state.highlightId===p.id?'new-row':''}" data-row-id="${p.id}"><td><strong>${esc(label(p))}</strong><span class="secondary mono">ID ${p.id} <span class="hint-divider">·</span> ${esc(p.createdAt)}</span></td><td><span>${esc(appNames(p.appIds))}</span><span class="secondary">投放标识：${esc(p.category||'默认（未填写）')}</span></td><td>${typeTag(p.type)}</td><td class="text-right nowrap">${num(m.show)} <span class="muted">/</span> ${num(m.click)} <span class="muted">/</span> ${p.type==='cs'?num(m.connect):'—'}</td><td>${statusTag(p.enabled)}</td><td><div class="row-action-stack">${actionButton('编辑','edit-package',p.id)}${actionButton('广告数据','open-data',p.id)}${actionButton('广告素材','materials',p.id)}${actionButton(busy?'处理中…':'克隆','clone',p.id,(!allowedCreate()||busy)?'disabled title="处理中或无创建权限"':'')}</div></td></tr>`;}).join('')}</tbody></table></div>${!pkgs.length?empty('暂无匹配投放'):''}</div>${listFooter(pkgs.length)}
    <p class="inline-note" ${anchor('R-011')}>一次操作仅创建一个副本，不提供批量克隆。失败完整回滚；网络超时先核查结果。</p>`;
  }
  function renderGroups() {
    const f=state.filters.groups;
    const list=state.groups.filter(g=>`${g.name} ${g.addresses.map(a=>a.url).join(' ')}`.toLowerCase().includes(f.keyword.toLowerCase()));
    return `<div class="page-title-row"><div><h1>其他客服组</h1><p class="page-description">统一维护非机器人客服地址，供未安装 TG 的用户跳转</p></div><div class="title-tools" ${anchor('R-013')}>${mark('R-013')}<button class="btn primary" type="button" data-action="new-group" ${!allowedCreate()?'disabled':''}>＋ 新增客服组</button></div></div>
      <div class="summary-strip"><div><strong>${state.groups.length}</strong>客服组</div><div><strong>${state.groups.reduce((n,g)=>n+g.addresses.length,0)}</strong>客服地址</div><div><strong>${state.packages.filter(p=>p.groupId).length}</strong>投放绑定 <small>包含停用投放</small></div></div>
      <form class="filters" data-filter-form="groups"><div class="field wide"><label for="group-search">关键词</label><input id="group-search" name="keyword" value="${esc(f.keyword)}" placeholder="搜索客服组名称 / 地址"></div><button class="btn primary" type="submit">搜索</button></form>
      <div class="notice compact" ${anchor('R-014')}><span>⇄</span><p>服务端从绑定组内随机分配一个地址。TG 机器人仍在现有菜单维护。</p>${mark('R-014')}</div>
      <div class="panel" ${anchor('R-015')}><div class="table-scroll"><table><thead><tr><th>客服组</th><th>地址</th><th class="text-right">绑定 B 包</th><th>操作 ${mark('R-015')}</th></tr></thead><tbody>${list.map(g=>`<tr><td><strong>${esc(g.name)}</strong><span class="secondary">${g.migrated?'<span class="tag amber">存量自动迁移</span>':'手动维护'}</span></td><td><span>${g.addresses.length} 个地址</span><span class="secondary address-preview" title="${esc(g.addresses[0]?.url)}">${esc(g.addresses[0]?.url)}</span></td><td class="text-right">${groupRefs(g.id).length}</td><td><div class="btn-group">${actionButton('编辑','edit-group',g.id,!allowedCreate()?'disabled':'')}${actionButton('分配预览','preview-group',g.id)}${actionButton('删除','delete-group',g.id,!allowedCreate()?'disabled':'')}</div></td></tr>`).join('')}</tbody></table></div>${!list.length?empty('暂无匹配客服组','新增客服组后，可在客服建联投放中绑定'):''}</div>${listFooter(list.length)}`;
  }
  function renderBots() {return `<div class="page-title-row"><div><h1>Telegram 机器人</h1><p class="page-description">复用已有机器人管理，B 包绑定时直接选择</p></div><div class="title-tools" ${anchor('R-018')}>${mark('R-018')}<span class="tag muted">现有菜单示意</span></div></div><div class="notice compact"><span>ⓘ</span><p>本次不新增机器人维护流程。此处的两个演示机器人可在 B 包编辑页下拉选择。</p></div><div class="summary-strip"><div><strong>${state.bots.length}</strong>机器人</div><div><strong>${state.bots.reduce((n,b)=>n+b.agents,0)}</strong>客服绑定</div></div><div class="panel"><div class="table-scroll"><table><thead><tr><th>机器人名称</th><th>用户名</th><th>国家用途备注</th><th>客服数</th><th>接入时间</th><th>操作</th></tr></thead><tbody>${state.bots.map(b=>`<tr><td><div class="name-cell"><span class="robot-circle">↗</span><strong>${esc(b.name)}</strong></div></td><td class="mono">@${esc(b.username)}</td><td>${esc(b.remark)}</td><td>${b.agents}</td><td class="mono">${b.created}</td><td>${actionButton('查看','view-bot',b.id)}</td></tr>`).join('')}</tbody></table></div></div>${listFooter(state.bots.length)}`;}
  function metricCard(title,value,caption,style='',rule=''){return `<div class="metric-card ${style}" ${rule?anchor(rule):''}><div class="metric-label">${title}${rule?mark(rule):''}</div><div class="metric-value">${value}</div><div class="metric-caption">${caption}</div></div>`;}
  function renderData() {
    const p=getPackage(state.data.campaignId)||state.packages[0],d=state.data,f=d.form,rows=filteredData(),m=metrics(rows),isCs=p.type==='cs';
    const hasUnknown=filteredData(d.applied,true).some(e=>e.tg===null||e.installDate===null);
    const unknownSource=filteredData(d.applied,true).some(e=>e.sourceApp==null);
    const pending=JSON.stringify(d.form)!==JSON.stringify(d.applied);
    const ready=d.status==='ready';
    return `<button type="button" class="back-button" data-action="back-packages">← 返回 B 包列表</button><div class="page-title-row" ${anchor('R-019')}><div><h1>广告数据 <span class="muted">/</span> ${esc(label(p))}</h1><p class="page-description">ID ${p.id} <span class="hint-divider">·</span> ${esc(appNames(p.appIds))} <span class="hint-divider">·</span> ${isCs?'客服建联':'应用拉活'}</p></div><div class="title-tools">${mark('R-019')}${typeTag(p.type)}${statusTag(p.enabled)}</div></div>
    <form id="data-form" class="filters data-filters"><div class="field source-app-field delta" ${anchor('R-030')}><label for="data-source-app">来源白包 ${mark('R-030')}</label><select id="data-source-app" name="sourceApp">${option('all','全部白包',f.sourceApp)}${sourceApps().map(a=>option(a.id,`${a.name} · ${a.packageName}${a.unbound?'（已解绑）':''}`,f.sourceApp)).join('')}</select></div><div class="field"><label for="data-from">开始日期</label><input type="date" id="data-from" name="from" value="${f.from}" required></div><div class="field"><label for="data-to">结束日期</label><input type="date" id="data-to" name="to" value="${f.to}" required></div><div class="field" ${anchor('R-020')}><label for="data-tg">TG 安装状态 ${mark('R-020')}</label><select id="data-tg" name="tg">${option('all','全部',f.tg)}${option('installed','已安装 TG',f.tg)}${option('uninstalled','未安装 TG',f.tg)}</select></div><div class="field" ${anchor('R-021')}><label for="data-install">安装维度 ${mark('R-021')}</label><select id="data-install" name="install">${option('all','全部',f.install)}${option('today','当日安装',f.install)}${option('before','非当日安装',f.install)}</select></div><div class="data-filter-actions"><button class="btn primary" type="submit" ${d.status==='loading'?'disabled':''}>${d.status==='loading'?'查询中…':'查询'}</button><button class="btn ghost" type="button" data-action="reset-data">重置</button></div></form>
    <div class="applied-filter-note" aria-live="polite">当前结果：${esc(sourceLabel(d.applied.sourceApp))} · ${esc(d.applied.from)} — ${esc(d.applied.to)} · TG：${{all:'全部',installed:'已安装',uninstalled:'未安装'}[d.applied.tg]} · 安装：${{all:'全部',today:'当日',before:'非当日'}[d.applied.install]} · 广告位：${d.applied.slots.map(slotName).join('、')}${pending?' <strong>条件已修改，点击查询后生效</strong>':''}</div>
    ${unknownSource?'<div class="notice warning compact"><span>ⓘ</span><p>部分历史数据缺少来源白包，按白包筛选仅包含可识别数据；全部白包保留未知来源记录。</p></div>':''}
    ${d.error?`<div class="notice error" role="alert">${esc(d.error)}</div>`:''}
    <div class="btn-group" style="justify-content:space-between"><div class="segmented" aria-label="时间粒度">${[['hour','时'],['day','日'],['week','周'],['month','月']].map(([v,n])=>`<button type="button" data-action="granularity" data-value="${v}" class="${d.granularity===v?'active':''}" aria-pressed="${d.granularity===v}">${n}</button>`).join('')}</div><span class="time-note">平台时间：印度时间 UTC+5:30</span></div>
    <div class="slot-filters"><span class="muted" style="font-size:10px">广告位</span>${slots.map(s=>`<label class="checkbox-label"><input type="checkbox" data-slot-filter="${s.key}" ${f.slots.includes(s.key)?'checked':''}>${s.name}</label>`).join('')}<span class="muted" style="font-size:9px">可多选 · 修改后点击查询</span></div>
    <div style="height:14px"></div>
    ${hasUnknown?`<div class="notice warning compact" ${anchor('R-022')}><span>ⓘ</span><p>部分历史数据缺少维度。全部查询保留未知记录，按具体条件筛选时，仅包含该维度可识别的数据。</p>${mark('R-022')}</div>`:`<div class="inline-note" ${anchor('R-022')}>来源白包、TG 状态、安装维度及日期条件组合生效。${mark('R-022')}</div>`}
    ${!ready?renderDataState():`
      <div class="metric-grid">${metricCard('展示人数',num(m.showUsers),`展示次数 ${num(m.show)}`)}${metricCard('点击人数',num(m.clickUsers),`点击次数 ${num(m.click)}`)}${metricCard(isCs?'建联人数':'安装人数',num(isCs?m.connect:m.installs),isCs?`新 ${m.connectNew} · 老 ${m.connectOld}`:'当前筛选范围内安装','success')}${metricCard('点击率',rate(m.clickUsers,m.showUsers),'点击人数 ÷ 展示人数','accent','R-023')}${metricCard('建联率',isCs?rate(m.connect,m.clickUsers):'—',isCs?'建联人数 ÷ 点击人数':'应用拉活不统计建联','accent','R-024')}${metricCard(isCs?'人均展示次数':'付费金额',isCs?(m.showUsers?(m.show/m.showUsers).toFixed(2):'—'):`¥${m.revenue.toFixed(2)}`,isCs?'展示次数 ÷ 展示人数':'当前筛选范围内付费')}</div>
      <div class="panel" ${anchor('R-025')}><div class="panel-heading"><h3>数据明细 <span class="secondary" style="display:inline">${d.applied.from} — ${d.applied.to}</span></h3>${mark('R-025')}</div>${rows.length?`<div class="table-scroll"><table class="data-table"><thead><tr><th class="sticky">${d.granularity==='hour'?'时段':d.granularity==='week'?'周':d.granularity==='month'?'月份':'日期'}</th><th>广告位</th><th class="number">展示次数 / 人数</th><th class="number">点击次数 / 人数</th><th class="number">${isCs?'分配次数 / 人数':'安装人数'}</th><th class="number">${isCs?'建联总 / 新 / 老':'付费金额'}</th><th class="number">人均展示</th><th class="number">点击率</th><th class="number">建联率</th></tr></thead><tbody>${bucketRows(rows).map(g=>dataTableRow(g,isCs)).join('')}</tbody><tfoot>${dataTableRow({bucket:'汇总（整体去重）',slot:'',m},isCs,true)}</tfoot></table></div>`:empty('当前条件下暂无数据','可调整日期或筛选条件，克隆副本历史统计从零开始')}</div>
      <div class="panel"><div class="panel-heading"><h3>趋势曲线 <span class="secondary" style="display:inline">按${{hour:'小时',day:'日',week:'周',month:'月'}[d.granularity]}聚合</span></h3><div class="chart-legend">${[['show','展示','#70a8ff'],['click','点击','#e8b369'],...(isCs?[['connect','建联人数','#62d3af']]:[])].map(([key,text,color])=>`<button class="legend-button ${!d.visible[key]?'off':''}" type="button" data-action="chart-toggle" data-value="${key}" aria-pressed="${d.visible[key]}"><span class="legend-dot" style="background:${color}"></span>${text}</button>`).join('')}</div></div><div class="chart">${renderChart(rows,isCs)}</div><div class="chart-note">展示、点击按次数；建联按人数。汇总人数在整个筛选范围内去重。</div></div>`}
    <div class="notice compact" ${anchor('R-026')}><span>◷</span><p>筛选使用事件历史快照。旧 SDK 缺失字段归为未知，离线补报不改变原事件状态与安装日期。</p>${mark('R-026')}</div>`;
  }
  function renderDataState(){if(state.data.status==='loading')return '<div class="panel"><div class="loading-state" role="status"><span class="spinner"></span><br>正在按相同条件更新明细、指标和趋势…</div></div>';return '<div class="panel"><div class="error-state" role="alert"><span class="empty-icon">↻</span><strong>数据加载失败</strong><span>筛选条件已保留，请重试。此处为演示错误状态。</span><div class="error-actions"><button class="btn primary" type="button" data-action="retry-data">重试</button></div></div></div>';}
  function dataTableRow(g,isCs,total=false){const m=g.m;return `<tr><td class="sticky nowrap">${esc(g.bucket)}</td><td>${total?'全部已选广告位':esc(slotName(g.slot))}</td><td class="number"><span class="stat-pair"><b>${num(m.show)}</b><span>/ ${num(m.showUsers)}</span></span></td><td class="number"><span class="stat-pair"><b>${num(m.click)}</b><span>/ ${num(m.clickUsers)}</span></span></td><td class="number">${isCs?`${num(m.assign)} / ${num(m.assignUsers)}`:num(m.installs)}</td><td class="number">${isCs?`${m.connect} / ${m.connectNew} / ${m.connectOld}`:`¥${m.revenue.toFixed(2)}`}</td><td class="number">${m.showUsers?(m.show/m.showUsers).toFixed(2):'—'}</td><td class="number rate-value">${rate(m.clickUsers,m.showUsers)}</td><td class="number rate-value">${isCs?rate(m.connect,m.clickUsers):'—'}</td></tr>`;}
  function renderChart(rows,isCs) {
    const buckets=bucketRows(rows,false);
    if(!buckets.length)return '<div class="chart-empty">暂无趋势数据</div>';
    const defs=[['show','#70a8ff'],['click','#e8b369'],...(isCs?[['connect','#62d3af']]:[])].filter(([key])=>state.data.visible[key]);
    if(!defs.length)return '<div class="chart-empty">请至少选择一个趋势指标</div>';
    const w=780,h=210,l=39,r=25,t=15,b=34,pw=w-l-r,ph=h-t-b;
    const max=Math.max(1,...buckets.flatMap(g=>defs.map(([key])=>g.m[key])));
    const scale=Math.max(4,Math.ceil(max/4/10)*10*4);
    const x=i=>l+(buckets.length===1?pw/2:i*pw/(buckets.length-1));
    const y=n=>t+ph-(n/scale)*ph;
    let svg=`<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="当前筛选条件下的展示、点击及建联趋势">`;
    for(let i=0;i<=4;i++){const value=scale*i/4,yy=y(value);svg+=`<line x1="${l}" y1="${yy}" x2="${w-r}" y2="${yy}" stroke="#334156" stroke-dasharray="3 5"/><text x="${l-9}" y="${yy+3}" text-anchor="end" fill="#6c84a5" font-size="9">${num(value)}</text>`;}
    const step=Math.max(1,Math.ceil(buckets.length/8));
    buckets.forEach((g,i)=>{if(i%step===0||i===buckets.length-1){const text=state.data.granularity==='hour'?g.bucket:g.bucket.replace('2026-','').replace(' 周','');svg+=`<text x="${x(i)}" y="${h-10}" text-anchor="middle" fill="#768faf" font-size="9">${esc(text)}</text>`;}});
    for(const [key,color]of defs){svg+=`<polyline fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" points="${buckets.map((g,i)=>`${x(i)},${y(g.m[key])}`).join(' ')}"/>`;for(const [i,g]of buckets.entries())svg+=`<circle cx="${x(i)}" cy="${y(g.m[key])}" r="3" fill="#202935" stroke="${color}" stroke-width="2"><title>${esc(g.bucket)}：${g.m[key]}</title></circle>`;}
    return svg+'</svg>';
  }
  function render() {
    marked=new Set();renderingModal=false;
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.page===(state.page==='data'?'packages':state.page)));
    $('#scope-tag').textContent=state.scenario==='restricted'?'指定投放':'全部投放';
    $('#breadcrumb').innerHTML=state.page==='data'?`<button class="crumb-link" data-action="back-packages">B 包管理</button><span class="crumb-sep">/</span>广告数据`:`<span class="muted">工作台</span><span class="crumb-sep">/</span>${titles[state.page]}`;
    $('#page-content').innerHTML=(baseline?.renderers?.[state.page]||({apps:renderApps,packages:renderPackages,groups:renderGroups,bots:renderBots,data:renderData}[state.page]||renderApps))();
    baseline?.afterRender?.();
    paintModal(false);renderRules();
  }
  function navigate(page,id) {if(baseline?.normalizePage)page=baseline.normalizePage(page);state.modal=null;state.page=page;if(page==='data'){const nextId=Number(id)||29;if(nextId!==state.data.campaignId){state.data.form.sourceApp='all';state.data.applied=deep(state.data.form);}state.data.requestId=(state.data.requestId||0)+1;state.data.campaignId=nextId;state.data.error='';state.data.status=state.scenario==='data-error'?'error':'ready';}const hash=page==='data'?`#data/${state.data.campaignId}`:`#${page}`;if(location.hash!==hash)history.replaceState(null,'',hash);$('#page-content').scrollTop=0;render();}
  function applicableRules() {const extra=baseline?.applicableRules?.();if(extra)return extra;if(state.modal){const name=state.modal.kind;return rules.filter(r=>name==='white'?r.page==='apps':name==='group'||name==='preview'||name==='delete-group'?r.page==='groups':name==='materials'?r.id==='R-027'||r.id==='R-008':name==='package'?r.page==='packages':name==='clone'?['R-009','R-011','R-012'].includes(r.id):r.page===state.page);}return rules.filter(r=>r.page===state.page);}
  function renderRules() {
    const q=state.ruleSearch.trim().toLowerCase();const list=(state.ruleView==='all'?rules:applicableRules()).filter(r=>`${r.id} ${r.title} ${r.body}`.toLowerCase().includes(q));
    $('#rule-count').textContent=`${list.length} / ${rules.length}`;
    $$('[data-rule-view]').forEach(b=>b.classList.toggle('selected',b.dataset.ruleView===state.ruleView));
    $('#rule-list').innerHTML=list.map(r=>`<article id="rule-${r.id}" class="rule-card ${state.activeRule===r.id?'active':''}" data-rule-card="${r.id}" role="button" tabindex="0" aria-label="定位 ${r.id} ${esc(r.title)}"><div class="rule-meta"><span class="rule-id">${r.id}</span><span class="rule-type">${esc(r.type)}</span></div><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p>${r.note?`<p class="rule-note">${esc(r.note)}</p>`:''}</article>`).join('')||'<div class="empty-rule">没有匹配的规则</div>';
  }
  function selectRule(id,fromCard=false) {
    const rule=ruleMap[id];if(!rule||!rules.some(r=>r.id===id))return;
    state.activeRule=id;state.ruleSearch='';$('#rule-search').value='';
    if(fromCard) {
      let target=$(`[data-anchor="${id}"]`,$('#modal-root'))||$(`[data-rule="${id}"]`,$('#modal-root'));
      if(!target) {
        navigate(rule.page,state.data.campaignId);
        if(rule.modal==='white')openWhite(id==='R-001'?null:13);
        else if(rule.modal==='clone')openClone(getPackage(8));
        else if(rule.modal==='package')openPackage(getPackage(28));
        else if(rule.modal==='group')openGroup(state.groups[0]?.id||null);
        else if(rule.modal==='preview')openPreview(state.groups[0]?.id);
        else if(rule.modal==='materials')openMaterials(getPackage(29));
        target=$(`[data-anchor="${id}"]`,$('#modal-root'))||$(`[data-rule="${id}"]`,$('#modal-root'))||$(`[data-anchor="${id}"]`,$('#page-content'))||$(`[data-rule="${id}"]`,$('#page-content'));
      }
      if(target){$$('.rule-highlight').forEach(e=>e.classList.remove('rule-highlight'));const section=target.matches('.rule-mark')?target.closest('[data-anchor]')||target:target;section.classList.add('rule-highlight');section.scrollIntoView({block:'center',behavior:'smooth'});if(!section.hasAttribute('tabindex'))section.setAttribute('tabindex','-1');section.focus({preventScroll:true});schedule(()=>section.classList.remove('rule-highlight'),3000);}
    }
    if(!applicableRules().some(r=>r.id===id))state.ruleView='all';renderRules();
    $(`#rule-${id}`)?.scrollIntoView({block:'nearest',behavior:'smooth'});
  }
  function field(name,title,{type='text',value='',placeholder='',help='',disabled=false,full=false,error='',required=false}={}) {return `<div class="field ${full?'full':''} ${error?'invalid':''}"><label for="field-${name}">${required?'<span class="required">*</span>':''}${title}</label><input id="field-${name}" data-model="${name}" type="${type}" value="${esc(value)}" placeholder="${esc(placeholder)}" ${disabled?'disabled':''} ${type==='number'?`min="0" max="999999" step="${name.endsWith('.bid')?'0.01':'1'}"`:''}>${error?`<div class="field-error">${esc(error)}</div>`:''}${help?`<p class="help">${help}</p>`:''}</div>`;}
  function modalFrame(title,body,footer,{size='',subtitle='',form=''}={}) {return `<div class="modal-backdrop"><section class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="modal-title"><header class="modal-header"><div><h2 id="modal-title">${title}</h2>${subtitle?`<span class="secondary">${subtitle}</span>`:''}</div><button type="button" class="icon-button" data-action="close-modal" aria-label="关闭弹窗" ${state.modal?.saving?'disabled':''}>×</button></header>${form?`<form id="${form}" class="modal-form" style="display:contents" novalidate>`:''}<div class="modal-content">${state.modal?.errors?errorSummary():''}${body}</div><footer class="modal-footer">${footer}</footer>${form?'</form>':''}</section></div>`;}
  function cancelButton(){return `<button class="btn" type="button" data-action="close-modal" ${state.modal?.saving?'disabled':''}>取消</button>`;}
  function submitButton(text='保存'){return `<button class="btn primary" type="submit" ${state.modal?.saving?'disabled':''}>${state.modal?.saving?'<span class="spinner"></span>保存中…':text}</button>`;}
  function errorSummary(){const errors=Object.values(state.modal.errors||{});return errors.length?`<div class="notice error form-error" role="alert">${esc(errors[0])}</div>`:'';}
  function callbackURL(app){return `https://sdk.example.invalid/v1/mmp/register_callback?app_id=${encodeURIComponent(app.appId)}&package={app_name}&gaid={gps_adid}`;}
  function openWhite(id) {
    const a=state.apps.find(a=>a.id===Number(id));state.modal={kind:'white',draft:a?deep(a):{id:0,appId:'',name:'',packageName:'',kind:'客服建联',enabled:true,revision:0,adjustToken:'',authToken:'',registerKey:'',payKey:'',firstPayKey:'',installKey:'',connectKey:'',topOnId:'',storeUrl:'',installs:0,slots:Object.fromEntries(slots.map(s=>[s.key,{enabled:true,first:1,interval:2}]))},errors:{}};render();focusModal();
  }
  function whiteModal() {
    const d=state.modal.draft,errors=state.modal.errors||{},saved=state.apps.find(a=>a.id===d.id),pulled=state.pulled[d.id];
    const body=`<section class="form-section"><div class="section-label" ${anchor('R-001')}><h3>基本信息</h3>${mark('R-001')}</div><div class="form-grid">${field('name','APP 名称',{value:d.name,required:true,error:errors.name})}${field('packageName','包名',{value:d.packageName,required:true,error:errors.packageName})}${field('appId','AppId',{value:d.appId||'首次保存后生成',disabled:true,full:true})}</div></section>
      <section class="form-section"><div class="section-label" ${anchor('R-002')}><h3>广告位独立开关</h3>${mark('R-002')}${mark('R-003')}</div><p class="section-caption">关闭后该位置不展示任何广告。次数与间隔保留，重新开启后继续使用。</p><div ${anchor('R-003')}><table class="ad-config"><thead><tr><th style="width:17%">广告位置</th><th style="width:23%">开关</th><th>新用户先出几次</th><th>之后每隔几次插一次</th></tr></thead><tbody>${slots.map(s=>{const v=d.slots[s.key];return `<tr class="${v.enabled?'':'off-row'}"><td>${s.name}</td><td><div class="switch-label"><button class="switch" type="button" role="switch" aria-label="${s.name}广告位开关" aria-checked="${v.enabled}" data-action="toggle-slot" data-slot="${s.key}"></button><span>${v.enabled?'开启':'关闭'}</span></div></td><td><input type="number" aria-label="${s.name}新用户次数" data-model="slots.${s.key}.first" value="${v.first}" min="0" max="999999" step="1" ${v.enabled?'':'disabled'}></td><td><input type="number" aria-label="${s.name}间隔" data-model="slots.${s.key}.interval" value="${v.interval}" min="0" max="999999" step="1" ${v.enabled?'':'disabled'}></td></tr>`;}).join('')}</tbody></table></div><p class="help">次数与间隔都为 0：该位开启时一直出 Google 广告；关闭时不展示任何广告。</p></section>
      <section class="form-section" ${anchor('R-006')}><div class="section-label"><h3>Adjust 事件配置</h3>${mark('R-006')}</div><div class="form-grid">${field('adjustToken','Adjust Token',{value:d.adjustToken,placeholder:'演示值，不填写真实密钥'})}${field('registerKey','注册事件 Key',{value:d.registerKey,placeholder:'可留空'})}</div>${!d.registerKey?'<div class="notice warning compact" style="margin-top:12px;margin-bottom:0">注册事件 Key 为空，允许保存；无法完成对应的 Adjust 注册事件上报。</div>':''}<details style="margin-top:15px"><summary>其他现有配置</summary><div class="form-grid">${field('authToken','Adjust 鉴权 Token',{type:'password',value:d.authToken,placeholder:'留空则不带出站鉴权'})}${field('topOnId','TopOn 应用 ID',{value:d.topOnId})}${field('payKey','付费事件 Key',{value:d.payKey})}${field('firstPayKey','首充事件 Key',{value:d.firstPayKey})}${field('installKey','安装事件 Key',{value:d.installKey})}${field('connectKey','建联事件 Key',{value:d.connectKey})}${field('storeUrl','商店地址',{value:d.storeUrl,full:true})}</div></details></section>
      <section class="form-section" ${anchor('R-004')}><div class="section-label"><h3>SDK 生效预览</h3>${mark('R-004')}</div><div class="btn-group"><button class="btn small" type="button" data-action="pull-sdk" data-id="${d.id}" ${!saved?'disabled':''}>模拟 SDK 拉取</button><span class="help">仅读取已保存配置，未保存修改不生效</span></div><div class="sdk-summary">后台已保存版本：${saved?`v${saved.revision}`:'未保存'} <span class="hint-divider">·</span> SDK 最近拉取：${pulled?`v${pulled.revision}`:'尚未拉取'}</div>${pulled?`<pre class="sdk-output">${esc(JSON.stringify(pulled.config,null,2))}</pre>`:''}</section>`;
    return modalFrame(d.id?'编辑白包 APP':'新增白包 APP',body,`<span class="footer-help">更改只保存在本地演示中</span>${cancelButton()}${submitButton()}`,{size:'wide',form:'white-form'});
  }
  function openPackage(p) {state.modal={kind:'package',draft:p?deep(p):{id:0,type:'cs',name:'',packageName:'',appIds:[],category:'',countries:'',addressType:'tg',botId:state.bots[0]?.id||null,groupId:state.groups[0]?.id||null,installedUrl:'',uninstalledUrl:'',storeUrl:'',enabled:true,materials:deep(templates)},errors:{}};render();focusModal();}
  function packageModal() {
    const d=state.modal.draft,e=state.modal.errors||{},group=state.groups.find(g=>g.id===d.groupId),bot=state.bots.find(b=>b.id===d.botId);
    const body=`<section class="form-section"><div class="form-grid"><div class="field full"><label><span class="required">*</span>关联白包</label><div class="form-checks">${state.apps.map(a=>`<label class="checkbox-label"><input type="checkbox" data-app-check="${a.id}" ${d.appIds.includes(a.id)?'checked':''}>${esc(a.name)}</label>`).join('')}</div></div><div class="field"><label for="field-type">投放类型</label><select id="field-type" data-model="type">${option('cs','客服建联',d.type)}${option('b','应用拉活',d.type)}</select></div>${field('category','投放标识',{value:d.category,placeholder:'选填，区分大小写',help:'保存时去除首尾空格；留空进入默认素材池'})}${d.type==='cs'?field('name','投放名称',{value:d.name,required:true,error:e.name}):field('packageName','包名',{value:d.packageName,required:true,error:e.packageName})}${field('countries','国家',{value:d.countries,placeholder:'不选表示全球投放',help:'沿用 B 包的国家配置，不迁移到客服组'})}</div></section>
    ${d.type==='cs'?`<section class="form-section" ${anchor('R-016')}><div class="section-label"><h3>客服跳转配置</h3>${mark('R-016')}</div><div class="field" style="margin-bottom:15px"><label for="field-addressType">地址类型</label><select id="field-addressType" data-model="addressType">${option('tg','TG 机器人',d.addressType)}${option('other','其他（沿用原配置）',d.addressType)}</select></div>${d.addressType==='tg'?`<div class="form-grid"><div class="field"><label for="field-botId"><span class="required">*</span>已安装 TG</label><select id="field-botId" data-model="botId" data-value-type="number">${option('','请选择机器人',d.botId)}${state.bots.map(b=>option(b.id,`${b.name} · @${b.username}`,d.botId)).join('')}</select><p class="help">引用现有“Telegram 机器人”菜单</p></div><div class="field"><label for="field-groupId"><span class="required">*</span>未安装 TG</label><select id="field-groupId" data-model="groupId" data-value-type="number">${option('','请选择其他客服组',d.groupId)}${state.groups.map(g=>option(g.id,`${g.name}（${g.addresses.length} 个地址）`,d.groupId)).join('')}</select><p class="help">服务端从组内随机分配一个地址</p></div></div><div class="binding-preview" style="margin-top:14px">已安装 TG → <strong>${esc(bot?.name||'尚未选择')}</strong><br>未安装 TG → <strong>${esc(group?.name||'尚未选择')}</strong> → 随机分配组内客服</div>`:`<div class="form-grid">${field('installedUrl','已安装 TG 地址',{value:d.installedUrl})}${field('uninstalledUrl','未安装 TG 地址',{value:d.uninstalledUrl})}</div><p class="help">其他地址类型保留原有输入方式，本次不另行扩展。</p>`}</section><div class="notice compact" style="margin-top:17px" ${anchor('R-017')}><span>↳</span><p>${group?.migrated?'该投放已保留原地址并绑定自动迁移生成的客服组，无需重新填写。':'存量非机器人地址将自动转为客服组，并保留原投放的绑定。'}</p>${mark('R-017')}</div>`:`<section class="form-section">${field('storeUrl','商店地址',{value:d.storeUrl,full:true})}<p class="help">应用拉活保持真实包名唯一；与客服建联的跳转配置分开处理。</p></section>`}
    <section class="form-section"><div class="switch-label"><span>投放状态</span><button class="switch" type="button" role="switch" aria-label="投放启用状态" aria-checked="${d.enabled}" data-action="toggle-package-enabled"></button><span>${d.enabled?'启用':'停用'}</span></div></section>`;
    return modalFrame(d.id?'编辑投放':'新增投放',body,cancelButton()+submitButton(),{form:'package-form'});
  }
  function openClone(p) {if(!p)return;state.modal={kind:'clone',sourceId:p.id,draft:{packageName:''},errors:{}};render();focusModal();}
  function cloneModal() {const p=getPackage(state.modal.sourceId),d=state.modal.draft,e=state.modal.errors||{};return modalFrame('克隆应用拉活投放',`<div class="notice compact" ${anchor('R-009')}><span>⧉</span><p>源包名需保持唯一。请为副本填写真实的新包名，其余配置和素材将完整复制。</p>${mark('R-009')}</div><div class="reference-row">源投放：<span class="mono">${esc(p?.packageName)}</span></div>${field('packageName','新包名',{value:d.packageName,required:true,error:e.packageName,placeholder:'例如 com.demo.puzzle.new',help:'包含停用投放在内，不能与现有应用拉活包名重复'})}<div class="inline-note">副本默认停用，安装、展示、点击和付费统计从零开始。</div>`,cancelButton()+submitButton('确认克隆'),{size:'narrow',form:'clone-form'});}
  function openGroup(id) {const g=state.groups.find(g=>g.id===Number(id));state.modal={kind:'group',draft:g?deep(g):{id:0,name:'',migrated:false,addresses:[{name:'',url:''}]},errors:{}};render();focusModal();}
  function groupModal() {const d=state.modal.draft,e=state.modal.errors||{};return modalFrame(d.id?'编辑客服组':'新增客服组',`<div ${anchor('R-013')} class="section-label" style="margin-bottom:15px"><h3>客服组信息</h3>${mark('R-013')}</div>${field('name','组名',{value:d.name,required:true,error:e.name,placeholder:'例如 海外客服组-AE'})}${d.migrated?'<p class="help" style="margin-top:8px"><span class="tag amber">存量自动迁移</span> 原地址与 B 包绑定均已保留。</p>':''}<div class="modal-subheading"><h3><span class="required">*</span>客服地址 <span class="optional-tag">至少保留一个</span></h3><button class="btn small" type="button" data-action="add-address">＋ 添加地址</button></div>${d.addresses.map((a,i)=>`<div class="address-row"><input aria-label="客服名称 ${i+1}" placeholder="名称（选填）" data-model="addresses.${i}.name" value="${esc(a.name)}"><input aria-label="客服地址 ${i+1}" placeholder="https://…" data-model="addresses.${i}.url" value="${esc(a.url)}"><button class="remove-address" type="button" data-action="remove-address" data-index="${i}" title="移除地址" aria-label="移除地址 ${i+1}">×</button></div>`).join('')}<p class="help">地址仅作为文本保存在本地演示中；每次跳转由服务端随机选择其中一个。</p>${d.id?`<div class="binding-preview" style="margin-top:17px">当前绑定 ${groupRefs(d.id).length} 条投放。修改组内地址后，绑定同一组的投放统一使用该组配置。</div>`:''}`,cancelButton()+submitButton(),{form:'group-form'});}
  function openPreview(id) {if(!id)return;state.modal={kind:'preview',groupId:Number(id),result:null,trials:0,counts:{}};render();focusModal();}
  function previewModal() {const m=state.modal,g=state.groups.find(g=>g.id===m.groupId);if(!g)return '';return modalFrame('客服组分配预览',`<div class="section-label" ${anchor('R-014')}><h3>${esc(g.name)}</h3>${mark('R-014')}</div><p class="section-caption">模拟一个未安装 TG 的用户进入该组，服务端从组内随机分配一个客服地址。以下随机仅在本地演示，不访问客服地址。</p>${g.addresses.map((a,i)=>`<div class="reference-row"><strong>${esc(a.name||`客服 ${i+1}`)}</strong><span class="secondary mono" style="word-break:break-all">${esc(a.url)}</span></div>`).join('')}<button class="btn primary" type="button" data-action="random-address">模拟随机分配一次</button>${m.result?`<div class="simulation-result" role="status"><span class="secondary">第 ${m.trials} 次模拟分配</span><strong>${esc(m.result.name||'未命名客服')}</strong><div class="mono" style="margin-top:5px">${esc(m.result.url)}</div></div>`:''}<p class="help" style="margin-top:12px">随机可能连续命中同一地址，不保证轮询顺序或短期均匀。</p>`,`<button class="btn" type="button" data-action="close-modal">关闭</button>`,{size:'narrow'});}
  function deleteGroupModal() {const m=state.modal,g=state.groups.find(g=>g.id===m.groupId),refs=groupRefs(m.groupId);return modalFrame(refs.length?'该客服组正在使用':'删除客服组',refs.length?`<div class="notice warning" ${anchor('R-015')}><span>ⓘ</span><p>该组已被 ${refs.length} 条 B 包投放引用，包含停用投放。请先解除全部绑定，再删除。</p>${mark('R-015')}</div>${refs.map(p=>`<div class="reference-row">${esc(label(p))} <span style="float:right">${statusTag(p.enabled)}</span></div>`).join('')}`:`<div ${anchor('R-015')}><p>确认删除“${esc(g?.name)}”？</p><p class="help">该组没有 B 包引用。此操作仅删除本地演示数据。</p>${mark('R-015')}</div>`,refs.length?'<button class="btn primary" type="button" data-action="close-modal">知道了</button>':`${cancelButton()}<button class="btn danger" type="button" data-action="confirm-delete-group">确认删除</button>`,{size:'narrow'});}
  function openMaterials(p) {if(!p)return;state.modal={kind:'materials',packageId:p.id,draft:deep(p.materials),errors:{}};render();focusModal();}
  function materialsModal() {const p=getPackage(state.modal.packageId);return modalFrame(`广告素材 · ${esc(label(p))}`,`<div class="notice compact" ${anchor('R-027')}><span>▧</span><p>素材为当前投放的独立记录。可修改副本素材，再返回原投放检查配置是否保持不变。机器人与客服组引用仍复用原绑定。</p>${mark('R-027')}</div>${state.modal.draft.map((a,i)=>`<section class="material-card"><div class="material-title"><span>${slotName(a.slot)}广告</span><span class="tag muted">素材记录 #${a.id}</span></div><div class="form-grid">${field(`${i}.source`,'素材地址 / 资源',{value:a.source})}${field(`${i}.bid`,'出价',{type:'number',value:a.bid})}${field(`${i}.jump`,'跳转地址',{value:a.jump,full:true})}</div></section>`).join('')}`,cancelButton()+submitButton(),{size:'wide',form:'materials-form'});}
  function botModal() {const b=state.bots.find(b=>b.id===state.modal.botId);return modalFrame('已有机器人信息',`<div class="notice compact">此处为现有菜单示意；本次仅复用已有机器人供 B 包选择。</div><div class="reference-row">机器人名称：${esc(b.name)}</div><div class="reference-row">用户名：@${esc(b.username)}</div><div class="reference-row">客服数：${b.agents}</div><div class="reference-row">用途：${esc(b.remark)}</div>`,'<button class="btn primary" type="button" data-action="close-modal">关闭</button>',{size:'narrow'});}
  function paintModal(preserve=true) {const root=$('#modal-root'),scroll=preserve?$('.modal-content',root)?.scrollTop||0:0;renderingModal=true;for(const node of $$('[data-rule]',root))marked.delete(node.dataset.rule);try{root.innerHTML=state.modal?((baseline?.modals?.[state.modal.kind]||({white:whiteModal,package:packageModal,clone:cloneModal,group:groupModal,preview:previewModal,'delete-group':deleteGroupModal,materials:materialsModal,bot:botModal}[state.modal.kind]))?.()||''):'';baseline?.afterModal?.();}finally{renderingModal=false;}if(preserve&&$('.modal-content',root))$('.modal-content',root).scrollTop=scroll;renderRules();}
  function focusModal() {const root=$('#modal-root');($('input:not(:disabled), select:not(:disabled)',root)||$('.modal-header button',root))?.focus({preventScroll:true});}
  function closeModal(){if(state.modal?.saving)return;if(baseline?.beforeClose?.())return;state.modal=null;render();}
  function setPath(object,path,value){const parts=path.split('.');let current=object;for(let i=0;i<parts.length-1;i++)current=current[parts[i]];current[parts.at(-1)]=value;}
  function saveWhite() {
    const modal=state.modal,d=modal.draft,errors={};if(!d.name.trim())errors.name='请填写 APP 名称';if(!d.packageName.trim())errors.packageName='请填写包名';if(state.apps.some(a=>a.id!==d.id&&a.packageName===d.packageName.trim()))errors.packageName='该白包包名已存在';
    if(slots.some(s=>!Number.isInteger(d.slots[s.key].first)||d.slots[s.key].first<0||!Number.isInteger(d.slots[s.key].interval)||d.slots[s.key].interval<0))errors.slots='次数和间隔必须为非负整数';
    modal.errors=errors;if(Object.keys(errors).length){paintModal();return;}
    if(!allowedCreate()){toast('当前账户不能修改全局白包配置','error');return;}
    modal.saving=true;paintModal();schedule(()=>{const saved=deep(d);saved.name=saved.name.trim();saved.packageName=saved.packageName.trim();saved.revision++;if(!saved.id){saved.id=++state.nextId;saved.appId=`demo_app_${String(saved.id).padStart(7,'0')}`;state.apps.unshift(saved);}else state.apps[state.apps.findIndex(a=>a.id===saved.id)]=saved;state.modal=null;render();toast('白包配置已保存，SDK 下次拉取时生效');},350);
  }
  function savePackage() {
    const m=state.modal,d=m.draft,e={};if(!d.appIds.length)e.appIds='请至少关联一个白包';if(d.type==='cs'&&!d.name.trim())e.name='请填写投放名称';if(d.name.length>200)e.name='投放名称不能超过 200 字符';if(d.type==='b'){if(!d.packageName.trim())e.packageName='请填写包名';else if(state.packages.some(p=>p.id!==d.id&&p.type==='b'&&p.packageName===d.packageName.trim()))e.packageName='应用拉活包名已存在';}if(d.type==='cs'&&d.addressType==='tg'&&(!state.bots.some(b=>b.id===d.botId)||!state.groups.some(g=>g.id===d.groupId)))e.binding='请选择一个机器人和一个其他客服组';m.errors=e;if(Object.keys(e).length){paintModal();return;}
    if(!d.id&&!allowedCreate()){toast('当前账户没有创建投放权限','error');return;}
    m.saving=true;paintModal();schedule(()=>{const saved=deep(d);saved.name=saved.name.trim();saved.category=saved.category.trim();saved.packageName=saved.type==='b'?saved.packageName.trim():'';if(saved.type!=='cs'||saved.addressType!=='tg'){saved.botId=null;saved.groupId=null;}if(!saved.id){saved.id=++state.nextId;saved.createdAt='2026-11-19 14:30';state.packages.unshift(saved);}else state.packages[state.packages.findIndex(p=>p.id===saved.id)]=saved;state.modal=null;render();toast('投放配置已保存');},350);
  }
  function nextCloneName(name){for(let i=1;i<100000;i++){const suffix=`-副本${i===1?'':i}`;const candidate=Array.from(name).slice(0,200-Array.from(suffix).length).join('')+suffix;if(!state.packages.some(p=>p.type==='cs'&&p.name===candidate))return candidate;}throw new Error('无法分配副本名称');}
  function performClone(p,newName='') {
    if(!allowedCreate()){toast('当前账户没有创建投放权限','error');return;}
    if(state.pending[p.id])return;
    const opId=`clone-${p.id}-${++state.nextId}`;const snapshot=deep(p),scenario=state.scenario;
    state.pending[p.id]={opId,sourceId:p.id,label:label(p),phase:'sending'};state.operations[opId]={status:'pending'};state.modal=null;render();
    const finish=success=>{if(!state.pending[p.id]||state.operations[opId].status!=='pending')return;if(success){if(!getPackage(p.id)){delete state.pending[p.id];state.operations[opId].status='failed';render();toast('源投放不存在，未创建副本','error');return;}const copy=deep(snapshot);copy.id=++state.nextId;copy.enabled=false;copy.createdAt='2026-11-19 14:30';if(copy.type==='cs')copy.name=nextCloneName(snapshot.name);else copy.packageName=newName;copy.materials=copy.materials.map(a=>({...a,id:++state.nextId}));state.packages.unshift(copy);state.operations[opId]={status:'success',packageId:copy.id};state.highlightId=copy.id;state.filters.packages={keyword:'',type:'',app:'',status:''};delete state.pending[p.id];render();toast('克隆成功，副本已停用');}else{state.operations[opId]={status:'failed'};delete state.pending[p.id];render();toast('克隆失败，未创建副本，请重试','error');}};
    if(scenario.startsWith('clone-timeout'))schedule(()=>{if(state.pending[p.id]){state.pending[p.id].phase='checking';render();toast('结果确认中，正在核查原操作，请勿重复创建','info');schedule(()=>finish(scenario==='clone-timeout-success'),1400);}},450);else schedule(()=>finish(scenario!=='clone-fail'),650);
  }
  function submitClone(){const m=state.modal,p=getPackage(m.sourceId),value=m.draft.packageName.trim();if(!value){m.errors={packageName:'请填写新包名'};paintModal();return;}if(value.length>200){m.errors={packageName:'包名不能超过 200 字符'};paintModal();return;}if(state.packages.some(q=>q.type==='b'&&q.packageName===value)){m.errors={packageName:'应用拉活包名已存在，请填写不同的新包名'};paintModal();return;}if(!p){toast('源投放不存在，未创建副本','error');return;}performClone(p,value);}
  function saveGroup(){const m=state.modal,d=m.draft,e={};if(!d.name.trim())e.name='请填写组名';if(!d.addresses.length)e.address='每个客服组至少保留一个地址';for(const a of d.addresses){try{const u=new URL(a.url.trim());if(!['http:','https:'].includes(u.protocol))throw new Error();}catch{e.address='请填写有效的 HTTP/HTTPS 客服地址';break;}}m.errors=e;if(Object.keys(e).length){paintModal();return;}if(!allowedCreate()){toast('当前演示账户不可维护客服组','error');return;}m.saving=true;paintModal();schedule(()=>{const copy=deep(d);copy.name=copy.name.trim();copy.addresses=copy.addresses.map(a=>({name:a.name.trim(),url:a.url.trim()}));if(!copy.id){copy.id=++state.nextId;state.groups.unshift(copy);}else state.groups[state.groups.findIndex(g=>g.id===copy.id)]=copy;state.modal=null;render();toast('客服组已保存，B 包绑定关系保持不变');},350);}
  function saveMaterials(){const m=state.modal;if(m.draft.some(a=>!Number.isFinite(Number(a.bid))||Number(a.bid)<0)){m.errors={bid:'出价必须为非负数'};paintModal();return;}const p=getPackage(m.packageId);p.materials=deep(m.draft).map(a=>({...a,bid:Number(a.bid)}));state.modal=null;render();toast('当前投放素材已保存，原投放或其他副本未被修改');}
  function pullSDK(id){const a=state.apps.find(a=>a.id===Number(id));if(!a)return;state.pulled[a.id]={revision:a.revision,config:{app_id:a.appId,...Object.fromEntries(slots.map(s=>[s.key,{enabled:a.slots[s.key].enabled,new_user_count:a.slots[s.key].first,interval:a.slots[s.key].interval}]))}};paintModal();toast(`SDK 已模拟拉取后台 v${a.revision}，未保存修改不参与`);}
  async function copyCallback(id){const a=state.apps.find(a=>a.id===Number(id));if(!a)return;const value=callbackURL(a);let copied=false;try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(value);copied=true;}}catch{}if(!copied){const input=document.createElement('textarea');input.value=value;input.style.cssText='position:fixed;left:-9999px;top:0';document.body.append(input);input.select();try{copied=document.execCommand('copy');}catch{}input.remove();}if(copied)toast('演示接收地址已复制，请勿用于真实投放');else{const root=$('#callback-url');if(root){const range=document.createRange();range.selectNodeContents(root);const selection=getSelection();selection.removeAllRanges();selection.addRange(range);}toast('浏览器限制自动复制，已选中地址，请按 Ctrl+C','info');}}
  function queryData(){const d=state.data;const form=$('#data-form');if(form){const data=new FormData(form);d.form={...d.form,from:String(data.get('from')||''),to:String(data.get('to')||''),sourceApp:String(data.get('sourceApp')||'all'),tg:String(data.get('tg')),install:String(data.get('install'))};}if(!d.form.from||!d.form.to||d.form.from>d.form.to){d.error='请选择有效日期范围，开始日期不能晚于结束日期';render();return;}if(!d.form.slots.length){d.error='请至少选择一个广告位';render();return;}if(d.form.sourceApp!=='all'&&!sourceApps().some(a=>String(a.id)===d.form.sourceApp)){d.error='请选择当前 B 包可访问的来源白包';render();return;}d.error='';d.status='loading';const requested=deep(d.form),requestId=d.requestId=(d.requestId||0)+1,campaignId=d.campaignId;render();schedule(()=>{if(state.data.requestId!==requestId||state.data.campaignId!==campaignId)return;state.data.applied=requested;state.data.status=state.scenario==='data-error'?'error':'ready';render();},350);}
  function resetDemo(){for(const id of timers)clearTimeout(id);timers.clear();clearTimeout(toastTimer);state=makeInitial(state.epoch+1);$('#demo-scenario').value='normal';$('#rule-search').value='';const page=baseline?.reset?.()||'apps';navigate(page);toast('演示数据已重置');}
  function handleAction(action,el) {
    const id=Number(el.dataset.id);
    if(baseline?.actions?.[action]){baseline.actions[action](el);return;}
    switch(action) {
      case 'new-white':if(allowedCreate())openWhite();break;
      case 'edit-white':if(allowedCreate())openWhite(id);break;
      case 'close-modal':closeModal();break;
      case 'toggle-slot':{const s=state.modal.draft.slots[el.dataset.slot];s.enabled=!s.enabled;paintModal();break;}
      case 'toggle-package-enabled':state.modal.draft.enabled=!state.modal.draft.enabled;paintModal();break;
      case 'pull-sdk':pullSDK(id);break;
      case 'copy-callback':copyCallback(id);break;
      case 'new-package':if(allowedCreate())openPackage();break;
      case 'edit-package':openPackage(getPackage(id));break;
      case 'clone':{const p=getPackage(id);if(!p||state.pending[id])return;if(!allowedCreate()){toast('当前账户没有创建投放权限','error');return;}if(p.type==='b')openClone(p);else performClone(p);break;}
      case 'materials':openMaterials(getPackage(id));break;
      case 'open-data':navigate('data',id);break;
      case 'back-packages':navigate('packages');break;
      case 'new-group':if(allowedCreate())openGroup();break;
      case 'edit-group':if(allowedCreate())openGroup(id);break;
      case 'add-address':state.modal.draft.addresses.push({name:'',url:''});paintModal();break;
      case 'remove-address':if(state.modal.draft.addresses.length===1){toast('每个客服组至少保留一个地址','error');return;}state.modal.draft.addresses.splice(Number(el.dataset.index),1);paintModal();break;
      case 'delete-group':state.modal={kind:'delete-group',groupId:id};render();focusModal();break;
      case 'confirm-delete-group':if(!allowedCreate()||groupRefs(state.modal.groupId).length){toast('该组仍被引用，不能删除','error');return;}state.groups=state.groups.filter(g=>g.id!==state.modal.groupId);state.modal=null;render();toast('客服组已删除');break;
      case 'preview-group':openPreview(id);break;
      case 'random-address':{const m=state.modal,g=state.groups.find(g=>g.id===m.groupId);m.result=deep(g.addresses[Math.floor(Math.random()*g.addresses.length)]);m.trials++;paintModal();break;}
      case 'view-bot':state.modal={kind:'bot',botId:id};render();focusModal();break;
      case 'retry-data':queryData();break;
      case 'reset-data':{const d=state.data;d.form={from:'2026-11-17',to:'2026-11-19',sourceApp:'all',tg:'all',install:'all',slots:slots.map(s=>s.key)};render();queryData();break;}
      case 'granularity':state.data.granularity=el.dataset.value;queryData();break;
      case 'chart-toggle':state.data.visible[el.dataset.value]=!state.data.visible[el.dataset.value];render();break;
    }
  }
  document.addEventListener('click',event=>{
    const rule=event.target.closest('[data-rule]');if(rule){event.preventDefault();event.stopPropagation();selectRule(rule.dataset.rule);return;}
    const card=event.target.closest('[data-rule-card]');if(card){selectRule(card.dataset.ruleCard,true);return;}
    const view=event.target.closest('[data-rule-view]');if(view){state.ruleView=view.dataset.ruleView;renderRules();return;}
    const nav=event.target.closest('[data-page]');if(nav){navigate(nav.dataset.page);return;}
    const el=event.target.closest('[data-action]');if(el&&!el.disabled){event.preventDefault();handleAction(el.dataset.action,el);}
  });
  document.addEventListener('input',event=>{const el=event.target;baseline?.onInput?.(event);if(el.dataset.model&&state.modal?.draft){const value=el.type==='number'?Number(el.value):el.value;setPath(state.modal.draft,el.dataset.model,value);}if(el.id==='rule-search'){state.ruleSearch=el.value;renderRules();}});
  document.addEventListener('change',event=>{const el=event.target;if(el.dataset.model&&state.modal?.draft){setPath(state.modal.draft,el.dataset.model,el.dataset.valueType==='number'?(el.value?Number(el.value):null):el.type==='number'?Number(el.value):el.value);if(['type','addressType','botId','groupId'].includes(el.dataset.model))paintModal();}if(el.dataset.appCheck&&state.modal){const id=Number(el.dataset.appCheck),d=state.modal.draft;d.appIds=el.checked?[...d.appIds.filter(x=>x!==id),id]:d.appIds.filter(x=>x!==id);}if(el.dataset.slotFilter){const f=state.data.form,key=el.dataset.slotFilter;f.slots=el.checked?[...new Set([...f.slots,key])]:f.slots.filter(x=>x!==key);}if(el.closest('#data-form')){const data=new FormData($('#data-form'));state.data.form={...state.data.form,from:String(data.get('from')||''),to:String(data.get('to')||''),sourceApp:String(data.get('sourceApp')||'all'),tg:String(data.get('tg')),install:String(data.get('install'))};render();}if(el.dataset.slotFilter)render();if(el.id==='demo-scenario'){state.scenario=el.value;state.modal=null;if(state.page==='data')state.data.status=el.value==='data-error'?'error':'ready';render();toast(`已切换演示场景：${scenarioNames[el.value]}`,'info');}baseline?.onChange?.(event);});
  document.addEventListener('submit',event=>{event.preventDefault();const form=event.target;if(baseline?.onSubmit?.(event))return;if(form.dataset.filterForm){state.filters[form.dataset.filterForm]=Object.fromEntries(new FormData(form));render();return;}if(state.modal?.saving)return;if(form.id==='white-form')saveWhite();else if(form.id==='package-form')savePackage();else if(form.id==='clone-form')submitClone();else if(form.id==='group-form')saveGroup();else if(form.id==='materials-form')saveMaterials();else if(form.id==='data-form')queryData();});
  document.addEventListener('keydown',event=>{if(event.target.closest('[data-rule-card]')&&['Enter',' '].includes(event.key)){event.preventDefault();selectRule(event.target.closest('[data-rule-card]').dataset.ruleCard,true);return;}if(event.key==='Escape'&&state.modal)closeModal();if(event.key==='Tab'&&state.modal&&event.target.closest('.modal')){const focusable=$$('button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href]', $('.modal')).filter(e=>e.getClientRects().length);if(event.shiftKey&&document.activeElement===focusable[0]){event.preventDefault();focusable.at(-1).focus();}else if(!event.shiftKey&&document.activeElement===focusable.at(-1)){event.preventDefault();focusable[0].focus();}}});
  $('#reset-demo').addEventListener('click',resetDemo);
  window.addEventListener('hashchange',()=>{const [page,id]=location.hash.slice(1).split('/');if(baseline?.normalizePage)navigate(baseline.normalizePage(page),id);else if(titles[page])navigate(page,id);});
  if(window.createPrototypeBaseline)baseline=window.createPrototypeBaseline({get state(){return state;}, $, $$, esc, deep, num, rate, slots, rules, ruleMap, titles, mark, anchor, option, field, modalFrame, cancelButton, submitButton, empty, statusTag, typeTag, appNames, getPackage, groupRefs, allowedCreate, filteredPackages, packageMetrics, metrics, bucketRows, renderChart, metricCard, renderData, filteredData, callbackURL, render, paintModal, focusModal, navigate, toast, schedule, openWhite, openPackage, openMaterials, openGroup, selectRule, closeModal});
  const [initialPage,rawInitialId]=location.hash.slice(1).split('/');
  const initialId=(rawInitialId||'').split('?')[0];
  if(!location.hash&&baseline)state.page=baseline.defaultPage||'apps';
  if(titles[initialPage]){state.page=initialPage;if(initialPage==='data')state.data.campaignId=getPackage(initialId)?Number(initialId):29;}
  if(baseline?.normalizePage){state.page=baseline.normalizePage(state.page);if(location.hash&&baseline.normalizePage(initialPage)!==initialPage)history.replaceState(null,'',baseline.defaultHash||'#apps');}
  render();
  /* 仅提供只读快照，便于本地验收确认复制隔离与统计口径。 */
  Object.defineProperty(window,'prototypeSnapshot',{get:()=>deep({apps:state.apps,packages:state.packages,groups:state.groups,pulled:state.pulled,operations:state.operations,page:state.page,data:{...state.data,metrics:metrics(filteredData())}})});
})();
