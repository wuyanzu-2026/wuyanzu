(function(root){
  'use strict';
  const hour=3600000, minute=60000;
  const at=(s)=>Date.parse(s);
  const defaults={name:'现金超级送 · 第一期',start:at('2026-11-24T00:00:00+05:30'),end:at('2026-11-30T23:59:00+05:30'),launch:at('2026-11-24T00:00:00+05:30'),initial:3888,target:5000,registration:300,taskAmount:200,taskCap:3,helpHours:24,claimHours:72,popupMinutes:60,tasks:['P12:task_success','P30:task_success']};
  const clone=(x)=>JSON.parse(JSON.stringify(x));
  function create(){return {now:at('2026-11-24T10:00:00+05:30'),config:clone(defaults),cycle:1,packet:null,archives:[],friends:[],orders:[],events:[],lastPopup:null,seq:0,activeFriend:null};}
  function status(s,p=s.packet){
    if(!p)return 'unopened';
    if(p.payout?.status==='paid')return 'paid';
    if(p.payout)return p.payout.status==='error'?'review':'pending';
    if(p.progress>=p.config.target)return s.now>=p.claimEnd?'claimExpired':'ready';
    return s.now>=p.helpEnd?'expired':'progress';
  }
  function result(ok,message,extra={}){return {ok,message,...extra};}
  function log(s,type,message,extra={}){s.events.unshift({id:'EV-'+(++s.seq),at:s.now,type,message,cycle:s.cycle,...extra});}
  function admitted(s){return s.now>=s.config.start&&s.now<s.config.end;}
  function open(s){
    if(s.packet)return result(false,'本期已经开过红包，不能重新开包。');
    if(!admitted(s))return result(false,'本期暂未开放新红包。');
    const cfg=clone(s.config);s.packet={id:'PK-'+s.cycle+'-'+(++s.seq),cycle:s.cycle,openedAt:s.now,helpEnd:s.now+cfg.helpHours*hour,claimEnd:s.now+(cfg.helpHours+cfg.claimHours)*hour,config:cfg,progress:cfg.initial,helps:[],payout:null};
    log(s,'open','开红包，初始进度已登记');return result(true,'红包已开启，邀请新好友继续攒现金。');
  }
  function friend(s,kind='new'){
    const id='F'+String(++s.seq).padStart(3,'0');
    const f={id,name:'好友 '+id,registered:kind!=='new',registeredAt:kind==='old'?s.config.launch-hour:kind==='previous'?s.config.launch+minute:s.now,sponsor:kind==='other'?'B':'A',cycle:kind==='previous'?s.cycle-1:s.cycle,kind,registrationUsed:false,taskCount:0};
    s.friends.push(f);s.activeFriend=id;return f;
  }
  const active=(s)=>s.friends.find(f=>f.id===s.activeFriend);
  function eligible(s,f=active(s),cycle=s.cycle){
    if(!f||!f.registered)return result(false,'注册 Kama 后自动计入注册助力。');
    if(f.registeredAt<s.config.launch)return result(false,'该账号在功能上线前注册，不能贡献助力。');
    if(f.sponsor!=='A')return result(false,'该账号由其他人邀请注册，不能为当前发起人助力。');
    if(f.cycle!==cycle)return result(false,'新一期需要邀请新的好友，之前周期的好友不能继续助力。');
    return result(true,'符合本期新好友资格');
  }
  function canHelp(s,f=active(s),p=s.packet){
    const e=eligible(s,f,p?.cycle??s.cycle);if(!e.ok)return e;
    if(!p)return result(false,'发起人尚未开启红包。');
    const st=status(s,p);
    if(st!=='progress')return result(false,st==='expired'?'该红包已失效。':st==='claimExpired'?'该红包领取已过期。':st==='paid'?'该红包已领取。':'该红包已达标，无需助力。');
    return result(true,'可以助力');
  }
  function credit(s,f,kind,configured,ref,p=s.packet){
    const amount=Math.min(configured,p.config.target-p.progress);
    if(amount<=0)return result(false,'红包已达标，无需助力。');
    p.progress+=amount;
    p.helps.unshift({id:'HP-'+(++s.seq),friend:f.id,name:f.name,kind,amount,configured,at:s.now,ref});
    if(p.progress===p.config.target)p.reachedAt=s.now;
    log(s,kind,kind==='registration'?'注册助力已自动计入':'任务助力已计入',{friend:f.id,amount,ref,cycle:p.cycle});
    return result(true,kind==='registration'?'注册成功，助力已自动计入。':'任务成功，助力已计入。',{amount});
  }
  function register(s){
    const f=active(s)||friend(s);
    if(f.registered)return result(false,'该账号已注册，无需重复注册。');
    f.registered=true;f.registeredAt=s.now;f.cycle=s.cycle;f.sponsor='A';
    log(s,'register','好友通过邀请链接注册成功',{friend:f.id});
    const e=canHelp(s,f);if(!e.ok)return result(true,'注册成功。'+e.message,{amount:0});
    if(f.registrationUsed)return result(false,'注册助力已记录，不会重复计入。');
    f.registrationUsed=true;return credit(s,f,'registration',s.packet.config.registration,'REG-'+f.id);
  }
  function submit(s,task){
    const f=active(s),e=canHelp(s,f);if(!e.ok)return e;
    if(f.taskCount>=s.packet.config.taskCap)return result(false,'本期任务助力次数已用完。');
    if(!s.packet.config.tasks.includes(task))return result(false,'该任务不在本期指定任务范围内。');
    if(s.orders.some(o=>o.friend===f.id&&o.cycle===s.cycle&&o.status==='pending'))return result(false,'已有任务等待确认，请先查看确认结果。');
    const order={id:'TASKORDER-'+(++s.seq),task,friend:f.id,cycle:s.cycle,packet:s.packet.id,submittedAt:s.now,status:'pending'};
    s.orders.push(order);log(s,'submit','任务已提交，等待合作产品确认',{friend:f.id,ref:order.id});return result(true,'已提交，等待成功回传；此时不会增加助力。',{order});
  }
  function callback(s,id,success=true){
    const o=s.orders.find(x=>x.id===id);if(!o)return result(false,'未找到任务提交记录。');
    if(o.status!=='pending')return result(false,'该完成记录已处理，重复回传不重复计次。');
    o.callbackAt=s.now;
    if(!success){o.status='rejected';log(s,'task-failed','任务未通过，不计入助力',{ref:id});return result(false,'任务未通过，本笔不计入助力。');}
    o.status='confirmed';
    const f=s.friends.find(x=>x.id===o.friend);
    const p=[s.packet,...s.archives].find(x=>x&&x.id===o.packet&&x.cycle===o.cycle);
    if(!p){o.reason='未找到原周期红包，不能计入当前周期';return result(false,o.reason);}
    const e=canHelp(s,f,p);
    if(!e.ok){o.reason=e.message;log(s,'not-counted',e.message,{ref:id});return result(false,e.message+' 此回传不计助力。');}
    if(f.taskCount>=p.config.taskCap){o.reason='次数已满';return result(false,'本期任务助力次数已用完。');}
    f.taskCount++;o.counted=true;const r=credit(s,f,'task',p.config.taskAmount,id,p);o.amount=r.amount;return r;
  }
  function claim(s){
    if(status(s)!=='ready')return result(false,s.packet?.payout?'已有领取单，请查询原单结果，不重复发奖。':'当前红包不可领取。');
    s.packet.payout={id:'PAY-'+(++s.seq),amount:s.packet.config.target,requestedAt:s.now,status:'pending'};log(s,'claim','已申请领取，等待钱包确认',{ref:s.packet.payout.id});return result(true,'领取申请已提交，等待个人钱包确认。');
  }
  function settle(s,success=true,packetId=s.packet?.id){
    const packet=[s.packet,...s.archives].find(x=>x&&x.id===packetId);
    const p=packet?.payout;if(!p)return result(false,'暂无领取单，请先申请领取。');
    if(p.status==='paid')return result(false,'该领取单已到账，不重复发奖。');
    p.status=success?'paid':'error';if(success){p.paidAt=s.now;p.walletId='WL-'+p.id;}
    log(s,success?'paid':'wallet-review',success?'个人钱包已确认到账':'钱包超时，保留原单待核对',{ref:p.id,cycle:packet.cycle});return result(success,success?'已到账个人钱包。':'钱包暂未确认，正在核对原领取单。');
  }
  function popup(s){
    const st=status(s);if(['paid','expired','claimExpired'].includes(st))return false;
    if(!s.packet&&!admitted(s))return false;
    const interval=(s.packet?.config.popupMinutes??s.config.popupMinutes)*minute;
    if(s.lastPopup!==null&&s.now-s.lastPopup<interval)return false;
    s.lastPopup=s.now;return true;
  }
  function advance(s,h){s.now+=h*hour;return status(s);}
  function nextCycle(s){
    if(s.packet)s.archives.push(clone(s.packet));
    s.cycle++;s.packet=null;s.lastPopup=null;s.config.name='现金超级送 · 第'+s.cycle+'期';s.config.start=s.now;s.config.end=s.now+7*24*hour;
    log(s,'cycle','开启新一期活动，需邀请新好友');return result(true,'已切换新一期。之前好友不会重新取得助力资格。');
  }
  function validate(c){
    if(!c.name?.trim())return '请输入活动名称。';
    if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start>=c.end)return '活动开始时间必须早于结束时间。';
    if(!Number.isSafeInteger(c.initial)||c.initial<0||!Number.isSafeInteger(c.target)||c.target<=c.initial)return '初始金额应不小于 0，且低于目标金额；金额最多两位小数。';
    if(![c.registration,c.taskAmount].every(x=>Number.isSafeInteger(x)&&x>0))return '两类助力金额必须大于 0，且最多两位小数。';
    if(![c.taskCap,c.helpHours,c.claimHours,c.popupMinutes].every(x=>Number.isSafeInteger(x)&&x>0))return '次数、小时数和弹窗间隔必须是正整数。';
    if(!c.tasks?.length)return '请至少指定一个有效推广任务。';
    return '';
  }
  const api={create,defaults,clone,status,open,friend,active,eligible,canHelp,register,submit,callback,claim,settle,popup,advance,nextCycle,validate,admitted,hour,minute};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.CashEngine=api;
})(typeof window!=='undefined'?window:globalThis);
