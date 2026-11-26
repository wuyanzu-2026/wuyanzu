/* 隔离 DOM 验证；jsdom 仅用于验证，不是交付物的运行依赖。 */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const packagePath=process.env.KAMA_DOM_MODULE||'C:/Users/Administrator/.codex/tmp/kama-cash-dom-validation/node_modules/jsdom';
const {JSDOM,VirtualConsole}=require(packagePath);
const errors=[];let checks=0;
const vc=new VirtualConsole();vc.on('jsdomError',e=>errors.push(e.message));vc.on('error',e=>errors.push(String(e)));
const doc=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const dom=new JSDOM(doc,{runScripts:'outside-only',url:'https://kama-prototype.invalid/',pretendToBeVisual:true,virtualConsole:vc});
const w=dom.window,d=w.document;
w.HTMLElement.prototype.scrollIntoView=function(){};
w.confirm=()=>true;
w.addEventListener('error',e=>errors.push(e.error?.stack||e.message));
for(const p of ['task-catalog.js','engine.js','rules.js','app.js'])w.eval(fs.readFileSync(path.join(__dirname,p),'utf8'));
function ok(v,msg){assert.ok(v,msg);checks++;}
function click(q){const el=d.querySelector(q);assert.ok(el,'缺少元素：'+q);assert.ok(!el.disabled,'按钮被禁用：'+q);el.click();checks++;}
function has(text){ok(d.body.textContent.includes(text),'应展示：'+text);}
function change(q,value){const el=d.querySelector(q);assert.ok(el,q);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));checks++;}
const wait=()=>new Promise(resolve=>setTimeout(resolve,390));
async function run(){
 has('现金超级送');ok(d.querySelector('.home-activity'));ok(d.querySelector('.existing-task').disabled);
 ok(d.querySelector('[data-scene="home"]').textContent.includes('首页入口'));ok(d.querySelector('[data-scene="popup"]').textContent.includes('活动弹窗'));ok(!d.querySelector('[role="dialog"]'),'首页入口场景无弹窗');click('[data-scene="popup"]');ok(d.querySelector('.popup-scene [role="dialog"]'),'独立弹窗场景可直接预览');ok(d.querySelector('[data-rule="R-002"]'),'弹窗规则定位存在');click('[data-action="close-modal"]');ok(d.querySelector('[data-scene="home"].active'),'关闭弹窗回首页入口');ok(!d.querySelector('[role="dialog"]'));
 for(const r of w.CASH_RULES){click('[data-rule-target="'+r.id+'"]');ok(d.querySelector('[data-rule="'+r.id+'"]'),'规则目标应存在：'+r.id);ok(d.querySelector('#rule-'+r.id+'.selected'));}
 ok(new Set([...d.querySelectorAll('[id]')].map(x=>x.id)).size===d.querySelectorAll('[id]').length,'无重复 DOM id');
 click('[data-role="sender"]');click('[data-scene="packet"]');click('[data-action="open"]');has('₹38.88');has('还差');
 click('[data-action="share"]');click('[data-action="whatsapp"]');has('WhatsApp 预览');ok(d.querySelector('[role="dialog"]'));click('[data-action="close-share"]');
 click('[data-action="open-helper"]');click('[data-action="register"]');await wait();has('已自动帮好友增加 ₹3.00');
 click('[data-action="tasks"]');
 for(let i=0;i<3;i++){click('[data-action="submit-task"][data-task="P12:task_success"]');await wait();has('等待合作产品确认');click('[data-action="callback-success"]');}
 ok(d.querySelector('[data-action="submit-task"]').disabled,'达到上限后禁用');has('3');
 click('[data-action="callback-repeat"]');has('重复回传不重复计次');
 click('[data-action="new-friend"]');click('[data-action="register"]');await wait();has('₹2.12');
 click('[data-role="sender"]');click('[data-scene="packet"]');has('已攒满，立即领取');
 click('[data-action="claim"]');await wait();has('领取处理中');ok(!d.querySelector('[data-action="claim"]'),'处理中不允许重复领取');
 click('[data-action="wallet-fail"]');has('钱包到账待核对');click('[data-action="wallet-success"]');has('红包已到账');click('[data-action="wallet"]');has('现金超级送奖励');ok(d.querySelector('[data-action="none"]').disabled);
 click('[data-role="admin"]');
 ok(d.querySelectorAll('.task-catalog-row').length===8,'已核对两个产品8条已有规则');
 change('#task-product','12');ok([...d.querySelectorAll('.task-catalog-row')].filter(x=>!x.hidden).length===3,'产品筛选');
 const query=d.querySelector('#task-query');query.value='usdt';query.dispatchEvent(new w.Event('input',{bubbles:true}));ok([...d.querySelectorAll('.task-catalog-row')].filter(x=>!x.hidden).length===1,'任务事件搜索');
 const task=d.querySelector('[name="tasks"][value="P12:usdt_task_success"]');task.checked=true;task.dispatchEvent(new w.Event('change',{bubbles:true}));has('已选择 3 项');
 query.value='not-found';query.dispatchEvent(new w.Event('input',{bubbles:true}));ok(!d.querySelector('#task-catalog-empty').hidden,'搜索无结果反馈');query.value='';query.dispatchEvent(new w.Event('input',{bubbles:true}));change('#task-product','all');ok(task.checked,'筛选不清除选择');
 const form=d.querySelector('#config-form');form.querySelector('[name="initial"]').value='99';form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));has('初始金额应不小于 0');ok(d.querySelector('[name="initial"]').value==='99','校验失败保留输入');
 d.querySelector('[name="initial"]').value='1';d.querySelector('[name="popupMinutes"]').value='15';d.querySelector('#config-form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));has('配置已保存');
 change('#admin-access','readonly');ok(d.querySelector('[name="target"]').matches(':disabled'),'只读配置禁用');ok(d.querySelector('#config-form button[type="submit"]').disabled);
 for(const scene of ['records','rewards','stats']){click('[data-scene="'+scene+'"]');has(scene==='records'?'注册助力':scene==='rewards'?'已到账':'实际到账金额');}
 click('[data-action="new-cycle"]');has('第 2 期');click('[data-action="packet"]');click('[data-action="open"]');
 click('[data-role="helper"]');has('新一期需要邀请新的好友');click('[data-action="new-friend"]');click('[data-action="register"]');await wait();has('已自动帮好友增加');
 click('[data-role="sender"]');click('[data-action="reopen"]');ok(d.querySelector('[role="dialog"]'),'首次触发自动弹窗');click('[data-action="close-modal"]');click('[data-action="reopen"]');ok(!d.querySelector('[role="dialog"]'),'间隔内不弹出');click('[data-action="hour"]');click('[data-action="reopen"]');ok(d.querySelector('[role="dialog"]'),'间隔后再次打开触发');click('[data-action="close-modal"]');
 change('#preset','expired');has('本期红包已失效');click('[data-action="reopen"]');ok(!d.querySelector('[role="dialog"]'),'失效后停止弹窗');
 click('[data-role="helper"]');has('该红包已失效');click('[data-action="new-friend"]');ok(d.querySelector('[data-action="register"]'),'失效链接仍可注册');click('[data-action="register"]');await wait();has('注册成功');
 const prd=new JSDOM(fs.readFileSync(path.join(__dirname,'prd.html'),'utf8'),{runScripts:'outside-only',virtualConsole:vc});
 prd.window.eval(fs.readFileSync(path.join(__dirname,'rules.js'),'utf8'));
 const inline=[...prd.window.document.querySelectorAll('script:not([src])')].at(-1).textContent;prd.window.eval(inline);
 ok(prd.window.document.querySelectorAll('.doc-rule').length===20,'PRD 有完整规则');
 for(const r of w.CASH_RULES){const el=prd.window.document.getElementById(r.id);ok(el&&el.textContent.includes(r.body),'PRD规则一致 '+r.id);}
 for(const html of ['index.html','prd.html']){const h=new JSDOM(fs.readFileSync(path.join(__dirname,html),'utf8'));for(const el of h.window.document.querySelectorAll('script[src],link[href]')){const rel=el.getAttribute('src')||el.getAttribute('href');ok(!/^https?:/.test(rel),'没有远程运行依赖');ok(fs.existsSync(path.join(__dirname,rel)),'本地引用存在 '+rel);}h.window.close();}
 assert.deepEqual(errors,[],'页面脚本无阻塞错误');
 console.log(JSON.stringify({result:'PASS',assertions:checks,domErrors:errors,verification:'隔离 DOM 执行与模拟点击；不代表浏览器视觉验收',flows:['20 条规则双向目标','开包到好友注册','WhatsApp消息预览','同任务3次成功与重复回传','封顶金额','钱包超时与原单到账','配置校验及只读','新周期须新好友','分钟弹窗与结束停止','结束链接注册','PRD规则一致','本地资源完整']},null,2));
 prd.window.close();w.close();
}
run().catch(error=>{console.error(error.stack);w.close();process.exitCode=1;});
