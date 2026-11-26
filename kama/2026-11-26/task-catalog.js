/* 2026-11-26 只读核对测试后台：推广产品 > 奖励说明。
 * key 是原型选择键，不是后台任务 ID；产品 ID 与事件代码来自已查看页面。
 * 不包含账号、密码、密钥或真实接口。这里只保留离线样例，不实时连接后台。
 */
(function(root){
  root.KAMA_TASK_CATALOG=[
    {productId:12,product:'UMoney',code:'royal',operator:'全局默认',event:'task_success',name:'做任务成功',calculation:'百分比',value:'0.2%',scope:'继承事件',description:'—'},
    {productId:12,product:'UMoney',code:'royal',operator:'全局默认',event:'usdt_task_success',name:'usdt代付任务',calculation:'百分比',value:'0.2%',scope:'继承事件',description:'—'},
    {productId:12,product:'UMoney',code:'royal',operator:'全局默认',event:'first_task_success',name:'新手任务奖励',calculation:'等于',value:'₹10',scope:'继承事件',description:'第一次完成任务上报'},
    {productId:30,product:'RupeeMint12',code:'rupeemint',operator:'全局默认',event:'register',name:'注册',calculation:'等于',value:'₹1',scope:'继承事件',description:'完成注册事件奖励1块'},
    {productId:30,product:'RupeeMint12',code:'rupeemint',operator:'全局默认',event:'active',name:'活跃',calculation:'等于',value:'₹2',scope:'继承事件',description:'保持活跃事件奖励2块'},
    {productId:30,product:'RupeeMint12',code:'rupeemint',operator:'全局默认',event:'withdraw_success',name:'提现成功',calculation:'百分比',value:'10%',scope:'继承事件',description:'完成提现事件奖励 10%'},
    {productId:30,product:'RupeeMint12',code:'rupeemint',operator:'全局默认',event:'task_success',name:'做任务成功',calculation:'等于',value:'₹12',scope:'继承事件',description:'完成一个任务奖励12块'},
    {productId:30,product:'RupeeMint12',code:'rupeemint',operator:'全局默认',event:'first_task_success',name:'新手任务奖励',calculation:'等于',value:'₹18',scope:'继承事件',description:'完成新手任务奖励18块'}
  ].map(function(x){return {...x,key:'P'+x.productId+':'+x.event};});
})(typeof window!=='undefined'?window:globalThis);
