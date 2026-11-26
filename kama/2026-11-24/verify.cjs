const assert=require('node:assert/strict');
const E=require('./engine.js');
let count=0;
function ok(value,msg){assert.ok(value,msg);count++;}
function eq(a,b,msg){assert.equal(a,b,msg);count++;}
function setup(){const s=E.create();E.open(s);E.friend(s);return s;}
function task(s,id='P12:task_success'){const r=E.submit(s,id);ok(r.ok,'可提交任务');return E.callback(s,r.order.id);}
function ready(){const s=setup();E.register(s);for(let i=0;i<3;i++)task(s);E.friend(s);E.register(s);return s;}
{
 const s=setup();eq(s.packet.progress,3888);eq(s.packet.claimEnd-s.packet.openedAt,96*E.hour);ok(!E.open(s).ok,'本期不重开');
 eq(E.register(s).amount,300);eq(s.packet.progress,4188);ok(!E.register(s).ok);eq(s.packet.progress,4188);
 const o=E.submit(s,'P12:task_success');ok(o.ok);eq(s.packet.progress,4188,'提交不增加进度');eq(E.callback(s,o.order.id).amount,200);eq(E.active(s).taskCount,1);ok(!E.callback(s,o.order.id).ok);eq(E.active(s).taskCount,1);
 task(s);task(s);eq(E.active(s).taskCount,3);ok(!E.submit(s,'P12:task_success').ok);eq(s.packet.progress,4788);
 E.friend(s);eq(E.register(s).amount,212,'最后注册助力补差');eq(s.packet.progress,5000);eq(E.status(s),'ready');ok(s.now<s.packet.helpEnd,'提前达标');ok(E.claim(s).ok);eq(E.status(s),'pending');ok(!E.claim(s).ok);E.settle(s,false);eq(E.status(s),'review');const pay=s.packet.payout.id;ok(!E.claim(s).ok);ok(E.settle(s).ok);eq(s.packet.payout.id,pay);eq(E.status(s),'paid');eq(s.packet.payout.amount,5000);ok(!E.settle(s).ok);ok(!E.popup(s));
}
for(const kind of ['old','previous','other']){const s=setup();E.friend(s,kind);ok(!E.eligible(s).ok,kind+'不能助力');ok(!E.submit(s,'P12:task_success').ok);eq(s.packet.progress,3888);}
{
 const s=setup();E.register(s);const o=E.submit(s,'P12:task_success').order;E.advance(s,24);ok(!E.callback(s,o.id).ok);eq(s.packet.progress,4188);eq(E.active(s).taskCount,0);eq(E.status(s),'expired');ok(!E.popup(s));ok(!E.open(s).ok);
}
{
 const s=ready();const cutoff=s.packet.claimEnd;E.advance(s,25);eq(E.status(s),'ready');eq(s.packet.claimEnd,cutoff);s.now=cutoff;eq(E.status(s),'claimExpired');ok(!E.claim(s).ok);ok(!E.popup(s));
}
{
 const s=ready();E.claim(s);s.now=s.packet.claimEnd+E.hour;eq(E.status(s),'pending','已申请单跨截止继续核对');ok(E.settle(s).ok);eq(E.status(s),'paid');
}
{
 const s=E.create();s.config.end=s.now+E.hour;E.open(s);E.advance(s,2);ok(!E.admitted(s));E.friend(s);ok(E.register(s).amount>0,'整体档期结束后个人期限内仍可助力');ok(task(s).ok);eq(E.status(s),'progress');
}
{
 const s=setup();E.register(s);const old=E.active(s).id;E.nextCycle(s);ok(E.open(s).ok);s.activeFriend=old;ok(!E.eligible(s).ok);ok(!E.submit(s,'P12:task_success').ok);E.friend(s);ok(E.register(s).amount>0);ok(task(s).ok);eq(s.archives.length,1);
}
{
 const s=E.create();ok(E.popup(s));ok(!E.popup(s));E.advance(s,1);ok(E.popup(s));E.open(s);s.now=s.packet.helpEnd;ok(!E.popup(s));
}
{
 const s=setup();E.register(s);const oldTarget=s.packet.config.target;s.config.target=9000;eq(s.packet.config.target,oldTarget,'已开红包规则快照');
 ok(!E.submit(s,'TASK-NOT-CONFIGURED').ok);const o=E.submit(s,'P12:task_success').order;ok(!E.callback(s,o.id,false).ok);eq(E.active(s).taskCount,0);eq(s.packet.progress,4188);ok(task(s).ok,'失败后可再次完成同任务');
}
{
 const s=ready();E.friend(s);const r=E.register(s);ok(r.ok,'达标后的分享链接仍可注册');eq(r.amount,0);eq(s.packet.progress,5000);
}
{
 const c=E.clone(E.defaults);eq(E.validate(c),'');for(const [key,value] of [['initial',c.target],['target',-1],['registration',0],['taskCap',1.5],['popupMinutes',0],['tasks',[]],['end',c.start]]){const bad=E.clone(c);bad[key]=value;ok(E.validate(bad),key+'校验');}
}
{
 const s=E.create();s.config.initial=4500;s.config.registration=100;s.config.taskAmount=300;E.open(s);E.friend(s);E.register(s);task(s);eq(task(s).amount,100,'最后任务助力只补差');eq(s.packet.progress,5000);eq(E.active(s).taskCount,2);
}
{
 const s=setup();E.register(s);const oldPacket=s.packet.id,order=E.submit(s,'P12:task_success').order;E.nextCycle(s);E.open(s);ok(E.callback(s,order.id).ok,'原周期个人期限内回传仍归入原红包');eq(s.packet.progress,3888,'不得转入新周期');eq(s.archives.find(p=>p.id===oldPacket).progress,4388);ok(!E.eligible(s).ok,'原好友仍不能贡献新周期');eq(s.events[0].cycle,1,'记录保持原周期归属');
}
{
 const s=ready();E.claim(s);const old=s.packet.id;E.nextCycle(s);E.open(s);ok(E.settle(s,true,old).ok,'已申请原单在新周期开启后仍可到账');eq(E.status(s,s.archives[0]),'paid');eq(s.packet.payout,null);eq(s.events[0].cycle,1);
}
console.log(JSON.stringify({result:'PASS',assertions:count,coverage:['金额封顶','注册一次','同任务多次及上限','重复回传','截止后回传','提前领取及固定截止','钱包超时核对','整体档期与个人期限','新周期资格','分钟弹窗','配置快照','结束链接注册','配置校验']},null,2));
