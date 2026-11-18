const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const read = name => fs.readFileSync(path.join(root, name), 'utf8').replace(/^\uFEFF/, '');
const esc = str => String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
function inline(s) {
  return esc(s).replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
}
function markdown(source) {
  const lines = source.trim().split(/\r?\n/);
  let out = '', list = null;
  const close = () => { if (list) {out += `</${list}>`;list=null;} };
  for(let i=0;i<lines.length;i++) {
    const l = lines[i].trim();
    if(!l){close();continue;}
    if(l.startsWith('|') && lines[i+1]?.trim().match(/^\|[\s:|-]+\|$/)) {
      close(); const cells = text => text.split('|').slice(1,-1).map(v=>v.trim());
      out += '<div class="table-wrap"><table><thead><tr>'+cells(l).map(v=>'<th scope="col">'+inline(v)+'</th>').join('')+'</tr></thead><tbody>';
      i+=2;
      for(;i<lines.length&&lines[i].trim().startsWith('|');i++) out+='<tr>'+cells(lines[i]).map(v=>'<td>'+inline(v)+'</td>').join('')+'</tr>';
      i--;out+='</tbody></table></div>';continue;
    }
    const h = l.match(/^(#{1,6})\s+(.*)/);
    if(h){close();const n=Math.min(6,Math.max(3,h[1].length));out+=`<h${n}>${inline(h[2])}</h${n}>`;continue;}
    const item=l.match(/^(- |\d+\. )(.*)/);
    if(item){const type=item[1]==='- '?'ul':'ol';if(list!==type){close();list=type;out+=`<${type}>`;}out+='<li>'+inline(item[2])+'</li>';continue;}
    close();out+='<p>'+inline(l)+'</p>';
  }
  close();return out;
}
const sections = [
['overview','01','交付基线与需求范围',`
本文件面向后台前端、服务端、Android SDK 和测试人员，汇总本次已确认需求及 v4.3 原型修订。需求来源为用户逐轮确认、现有测试后台字段核对及同目录 plan.md 和字段对照与开发交接.md。

| 项目 | 约定 |
|---|---|
| 需求名称 | TG 安装统计与 B 包统一跳转分配 |
| 需求版本 / 日期 | v4.3 / 2026-11-18 |
| 当前状态 | 已确认需求的开发交接整理；本文件不新增业务范围 |
| 管理端 / 客户端 | 现有桌面 Web 后台 / Android；不涉及 iOS |
| 平台时区 | 印度时间 UTC+5:30；自然日及日期范围首尾均按此时区处理 |
| 权限 | 沿用现有查看、编辑、新增、删除权限，不新增角色体系 |
| 数据身份 | 沿用现有 SDK 安装用户身份与去重，不以 App 内账号注册作为安装统计条件 |
| 实施基线 | 未明确删除、迁移或修改的字段、接口、权限、校验和生产逻辑继续保留 |

**目标**：白包独立查看安装、日活和 TG 分布；B 包统一维护国家与跳转地址，素材继承；B 包广告数据区分展示/点击次数与人数、机器人成功分配次数与 TG ID 人数，以及建联新老。

| 模块 | 本次交付 |
|---|---|
| 白包 APP 列表与明细 | 列表 TG 三项、今日日活与白包数据入口；按日新增、日活及新增安装用户 TG 分布 |
| B 包编辑 | 国家多选；应用拉活唯一地址；客服建联两种地址类型与两组地址 |
| 素材 | 移除独立国家和跳转配置，继承所属 B 包 |
| Android / 服务端 | 最近一次打开检测 TG、按 B 包分配地址、异常静默和条件事件上报 |
| B 包广告报表 | 展示次数/人数、点击次数/人数、客服建联的机器人分配次数/人数、建联总/新/老，单层表头合并数值 |

不增加全局 TG 汇总、独立 TG 历史趋势图、地址权重、轮询、地址有效性检测及新权限体系。原国家匹配、广告频次、素材选择、出价、安装/付费和真实建联触发条件沿用原系统。
`],
['changes','02','最终变更与字段保留原则',`
**【本次更新 · v4.3】** 客服建联新增机器人分配次数/分配人数；统计实际成功分配客服，人数按同 B 包、同日、同 TG ID 去重。列位置及完整规则见第 07 节。

**【保留 · v4.2】** 明确新版走 v2、旧版走原接口：历史素材保留原地址，新素材下发时生成兼容字段，空地址仍下发。详情见第 08 节。

**【保留 · v4.1】** B 包报表三个指标使用单层表头和斜杠组合数值；B 包广告数据去掉白包活跃人数，各白包日活去对应白包数据查看。人均展示次数及原计算继续保留。

| 位置 | 新增 / 修改 | 明确移除 / 迁移 |
|---|---|---|
| 白包列表 | TG 三项；原日活明确为今日日活；原广告数据入口改白包数据 | 仅移除本列表的展示、点击 |
| 白包编辑 | 其余既有内容保留 | 不配置统一跳转；不新增 app_click_wa Key |
| B 包编辑 | 国家多选、统一跳转配置 | 素材级配置迁入 B 包；不删除原商店地址 |
| 素材新增/编辑 | 只读继承范围、查看所属 B 包配置 | 独立国家、独立跳转 URL 编辑入口；历史地址数据及旧接口字段按兼容规则保留 |
| B 包广告数据 | 展示/点击各次数及人数；建联总/新/老 | 移除白包活跃人数这一展示列，保留底层原计算 |

同一白包可以关联多个 B 包；同一 B 包也可以关联多个白包。**地址与国家属于 B 包，安装、日活和 TG 统计属于白包。** 当前点击的素材所属 B 包决定使用哪套配置。

本次是现有后台的增量修改。原型中只说明而未展开的旧新增/删除流程，以及时、周、月粒度，均不表示生产禁用。不要因页面需横向滚动或原型未展开旧流程而删字段。完整逐字段清单见本文附录。
`],
['white','03','白包 APP：列表与自身数据',`
### 3.1 列表
- 保留状态、关键词、搜索和分页；每个白包一行。APP名称与包名各自独立列。
- 保留 ID、Logo、关联投放、四广告位频次、累计安装、付费、建联、状态及既有操作。
- 删除本列表展示、点击两列；原日活明确显示“今日日活”。
- 新增“已安装 TG”“未安装 TG”“TG 安装占比”，统计当前白包累计安装用户的最新分布。
- 原“广告数据”操作改为“白包数据”，进入当前白包自身明细。

### 3.2 TG 检测与累计口径
| 项目 | 规则 |
|---|---|
| 已安装 TG | Android 手机已安装 Telegram 即可，不判断账号登录 |
| 状态时点 | 用户最近一次打开该 App 时的检测结果；后续打开可更新归组 |
| 未安装 TG | 明确未安装、历史从未上报、无法判断均计入 |
| 去重 | 同一白包沿用现有安装用户身份；重复打开不新增安装人数 |
| 累计恒等式 | 已安装人数 + 未安装人数 = 该白包安装用户总数 |
| 累计占比 | 已安装人数 ÷ 该白包安装用户总数；总数为 0 显示“—” |

### 3.3 白包数据明细
路径：白包 APP → 当前行“白包数据”。标题显示白包名称和包名。不得以关联 B 包的广告或安装转化数据替代白包自身数据。

| 字段 / 控件 | 类型与范围 | 规则 |
|---|---|---|
| 开始日期、结束日期 | 日期，查询必填 | 首尾均包含；开始不得晚于结束；沿用原近期范围，原型演示为 2026-11-11 至 2026-11-18，不硬编码为生产默认日期 |
| 查询、重置 | 操作 | 修改日期后查询；重置恢复默认范围并查询；关闭返回列表 |
| 区间新增安装 | 非负人数 | 所选范围每日新增之和，沿用 SDK 安装身份 |
| 日期 | 平台自然日 | 按天展示，多个日期分别成行 |
| 新安装人数 | 非负整数 | 此白包当天新增的安装用户 |
| 日活跃人数 | 非负整数 | 此白包当天活跃安装用户去重；多次打开计 1 人，跨日分别统计 |
| 已安装 TG | 非负整数 | 该行当天新增安装用户中，最新检测为已安装者 |
| 未安装 TG | 非负整数 | 该行当天新增安装用户中，未安装或未知者 |
| TG 安装占比 | 百分比 / — | 该行已安装 TG ÷ 该行新安装人数；零新增时两组 0，占比 — |

**关键区别**：列表 TG 基于累计安装用户；明细 TG 基于该行当天新安装用户。明细的分母不是日活、不是累计安装。

明细 TG 不是安装当天冻结快照。用户后续打开 App 的检测结果可以更新其所属安装日期的 TG 分布。日期查询不回放历史检测状态，也不更改列表累计统计。

日活只逐日展示，不以日均替代，不把每日人数之和称为跨日活跃总人数。同一用户使用不同白包时，分别进入各白包自身统计。
`],
['config','04','B 包：统一国家与跳转配置',`
### 4.1 入口与归属
沿用 B包管理 → 当前 B 包“编辑”。保留关联应用、Logo、投放类型、投放标识、状态等原字段；客服建联保留投放名称；应用拉活保留包名、商店地址。**商店地址和新增统一跳转地址不是同一个字段，不合并或删掉。**

同一 B 包下所有素材及所有关联白包共用这套配置；不同 B 包独立。白包编辑不维护跳转地址，素材不得覆盖。

### 4.2 配置字段和约束
| 字段 | 数据形式 | 必填 / 校验 | 保存结果 |
|---|---|---|---|
| 国家范围 | 原国家字典多选 | 可空；不缩减原完整国家列表 | 多选国家共同生效；全空为全球 |
| 客服地址类型 | TG 机器人 / 其他 | 仅客服建联适用；原型值不是新建生产默认要求 | 决定两组地址数量限制 |
| 应用拉活跳转地址 | 单个普通文本 | 可空；仅一个输入框；不校验 URL 格式 | 与 TG 状态无关，固定唯一地址 |
| 客服：已安装 TG 地址 | 普通文本地址组 | TG 机器人固定一个可空输入框；其他可增删多条 | 只向已安装 TG 组分配 |
| 客服：未安装 TG 地址 | 普通文本地址组 | 两种类型均可增删多条；允许为空 | 向未安装或未知状态组分配 |

本需求不新增地址协议、域名或格式限制，不要求 http、https 或 TG 专有格式。未确认新的字符长度、地址数量上限或必填条件，不得擅自新增限制；既有字段沿用原校验。

### 4.3 类型矩阵
| 投放类型 | 地址类型 | 已安装 TG | 未安装 TG | 返回方式 |
|---|---|---|---|---|
| 应用拉活 | 不显示选择项 | 与未安装共用唯一地址 | 与已安装共用唯一地址 | 有地址返回这一条 |
| 客服建联 | TG 机器人 | 最多 1 条，界面固定一个空框也可保存 | 多条，可空 | 对应组 1 条固定；多条随机 1 条 |
| 客服建联 | 其他 | 多条，可空 | 多条，可空 | 对应组 1 条固定；多条随机 1 条 |

### 4.4 编辑行为
- “其他”切换为“TG 机器人”：立即清除当前编辑态所有已安装 TG 地址，仅保留 1 个空输入框；未安装组原内容保留。
- “TG 机器人”切换为“其他”：保留当前内容，已安装组恢复允许添加多条。
- 保存成功后生效；取消或关闭舍弃本次编辑，已保存内容不变；保存失败沿用原反馈并保留编辑内容供处理。
- 地址组为空不阻止保存。没有地址不等于停用 B 包，点击处理按无地址规则执行。
- 国家支持多选、移除及清空。保存后全部下属素材同步使用新范围；取消维持原范围。
- 投放类型不适用的其他旧字段按现有逻辑隐藏和保留，不因界面切换擅自删除旧数据；以上 TG 地址类型清空规则是已明确的特例。
`],
['materials','05','素材继承与原功能保留',`
| 项目 | 开发要求 |
|---|---|
| 独立国家 | 从素材新增、编辑移除；展示时只读继承所属 B 包，空范围明确为“全球” |
| 独立跳转 URL | 从素材新增、编辑移除；新版不读取旧 URL；历史值及旧接口字段保留供旧版兼容 |
| 查看统一配置 | 定位该素材所属 B 包，不要求再选来源白包 |
| 其余素材字段 | 广告类型、上传、预览、删除、出价金额、状态、编辑、新增和原校验完整保留 |
| 素材列表信息 | 保留逐广告位素材与出价，不用“几条素材”替代实际信息 |

国家匹配、素材选择、广告展示频次和出价逻辑不变；只改变国家和地址的配置归属。迁移后不能素材级与 B 包级同时生效。旧素材地址不得成为新版空配置兜底；旧版历史素材直接读取原地址属于明确兼容分支。
`],
['sdk','06','Android 检测、分配与事件',`
本节描述新版 v2 链路；旧版原接口兼容见第 08 节。接口路径、请求字段和错误码由开发确定，原型不调用真实服务。

### 6.1 新版 SDK 主流程
1. 用户打开白包 App，Android SDK 检测是否安装 Telegram，更新该安装用户最近状态。
2. 用户点击素材，通过 v2 协议请求后台分配，依据素材所属 B 包读取已保存配置。
3. 应用拉活直接取唯一地址；客服建联按已安装 / 未安装状态进入对应地址组，检测未知按未安装。
4. 对应组无地址则静默结束；只有 1 条固定返回；多条由后台随机返回 1 条。
5. SDK 拿到地址后发起跳转；符合 6.3 条件则在发起跳转时触发 Adjust 事件。

### 6.2 分配与异常
- 每次点击素材并请求客服分配时重新随机，不按用户、会话或上次结果固定；允许连续两次随机到同一地址。
- 客户端不从后台返回的多条地址自行抽选；后台只返回此次分配的一条。
- 应用拉活无地址、客服对应组无地址、未拿到地址或分配请求失败导致无地址：App 不提示、不跳转，用户看到点击无反应，不上报 app_click_wa。
- v2 不跨 TG 分组兜底，不回退原接口，不使用旧素材地址，不因上次成功而在本次未拿到地址时沿用旧分配。
- 是否实际打开目标不作为此点击事件的等待条件；保持现有跳转机制，本次不新增目标可达性检测。

### 6.3 Adjust 条件矩阵
| 投放类型 | TG 状态 | 拿到地址且发起跳转 | app_click_wa |
|---|---|---|---|
| 客服建联 | 未安装 / 未上报 / 无法判断 | 是 | 本次跳转触发 1 次 |
| 客服建联 | 已安装 | 是 | 不触发 |
| 应用拉活 | 任意 | 是 | 不触发 |
| 任意 | 任意 | 否 | 不触发 |

事件名称 **app_click_wa**。对应事件 Key 在 App 内配置，后台不增加输入项。每次符合条件的点击跳转都触发，不按用户全局只报一次，不等待跳转成功。Adjust 投递、已有重试机制沿用当前实现，不在本次另造业务重试规则。

点击事件、地址分配、发起跳转及 app_click_wa 均不等于成功建联；真实建联事件的原触发条件继续保留。
`],
['reports','07','B 包广告数据与统计口径',`
### 7.1 入口与查询
B包管理 → 当前行原“广告数据”，在原详情上扩展，保留 B 包名称、ID、类型和事件关联 B 包选择。统计该 B 包全部素材及关联白包归属于本 B 包的数据，不混入其他 B 包。

保留原广告位多选（不选按全部）、日期范围、更新、重置、时/日/周/月入口、广告位列、人均展示次数和趋势曲线。本次新增指标按日明确；不擅自定义时/周/月的新老规则，也不删除既有粒度。

### 7.2 最终表头与格式
**【保留 · v4.1】** 单层表头，不拆成双层分组表头；每组指标在同一单元格按顺序用斜杠连接。

| 报表 | 按顺序完整表头 |
|---|---|
| 客服建联（7 列） | 日期；广告位；展示次数/展示人数；点击次数/点击人数；机器人分配次数/分配人数；建联总/新/老；人均展示次数 |
| 应用拉活（9 列） | 日期；广告位；安装；展示次数/展示人数；点击次数/点击人数；建联总/新/老；付费金额；付费人数（总/老/新）；人均展示次数 |

| 字段 | 示例 | 零值 / 不适用 |
|---|---|---|
| 展示次数/展示人数 | 12/4 | 0/0 |
| 点击次数/点击人数 | 4/3 | 0/0 |
| 机器人分配次数/分配人数（仅客服建联） | 5/3 | TG 机器人无成功为 0/0；其他类型 —（不适用） |
| 建联总/新/老 | 4/1/3 | 客服有记录零值 0/0/0；应用拉活 —/—/— |

去掉 B 包报表的白包活跃人数展示列；白包自身日活在白包数据查看。**人均展示次数继续保留原计算及底层分母**，不能因隐藏活跃列删除它。安装、付费金额和付费人数（总/老/新）也继续沿用原生产口径；付费新老不得套用本次建联新老规则。

### 7.3 次数与人数
| 指标 | 口径 |
|---|---|
| 展示次数 | 当前 B 包当天符合既有定义的素材展示事件次数 |
| 展示人数 | 上述事件按同一 B 包、同一天、同一 SDK 用户去重 |
| 点击次数 | 当前 B 包当天符合既有定义的素材点击事件次数 |
| 点击人数 | 上述点击按同一 B 包、同一天、同一 SDK 用户去重 |
| 建联总人数 | 当前 B 包当天实际建联去重人数；重复建联只算 1 人 |
| 建联新人数 | 来源白包安装日期 = 日报日期，且当天实际建联 |
| 建联老人数 | 来源白包安装日期早于日报日期，且当天实际建联；包含当天首次建联的旧安装用户 |

同一天建联新老互斥，总人数 = 新人数 + 老人数。展示/点击次数分别不小于对应人数。跨素材和关联白包的数据归属与用户身份沿用原系统，不另建新身份规则。

| 场景 | 分类 |
|---|---|
| 11 月 18 日安装，11 月 18 日实际建联 | 11 月 18 日新用户 |
| 11 月 17 日安装，11 月 18 日首次实际建联 | 11 月 18 日老用户 |
| 11 月 18 日安装当天建联，11 月 19 日再次建联 | 18 日计新，19 日计老 |
| 同一用户同 B 包同一天多次建联 | 当天只计 1 人，按安装日期归类 |

使用平台自然日（UTC+5:30），安装与建联日期统一边界；新老不由首次建联日期或查询开始日期决定。每日人数不能累加为跨日去重人数，本次不增加跨日人数合计。
`],
['states','09','状态、反馈与兼容边界',`
| 场景 | 后台 / App 行为 |
|---|---|
| 查询默认 | 显示当前白包或 B 包身份、既有近期范围与对应数据 |
| 日期为空或倒置 | 明确提示校验，保留输入，不发起查询 |
| 查询加载 | 展示加载状态，禁止重复提交；表格跨度匹配实际列数 |
| 查询成功 | 更新当前对象及日期范围对应数据，原筛选和格式保留 |
| 有记录零值 | 显示 0 / 组合零值，不当作缺失；零新增 TG 占比为 — |
| 没有记录 | 显示暂无记录，保留筛选入口；不伪造逐日 0 |
| 查询失败 | 明确失败反馈，保留日期，可重试；不伪装成功或新零值 |
| 关闭或切换 B 包 | 旧请求不能覆盖新对象页面，白包与 B 包查询互不修改 |
| 编辑保存成功 / 失败 | 沿用原反馈；成功使用新配置；失败保留可处理的编辑内容 |
| 编辑取消或关闭 | 放弃当前未保存更改，包括地址清空、国家修改 |
| 无编辑权限 | 沿用生产权限控制；本次不新增角色或越权入口 |
| App 分配无地址 | 不提示、不跳转、不触发 app_click_wa |

错误文案沿用原后台风格，能说明日期问题、查询失败与重试方向即可；原型页脚“演示：下次查询失败”、分流模拟、规则标记、放大原型和演示记录只用于审阅，不属于正式后台新增业务字段。

本次不新增性能时限或接口 SLA。继续遵循现有安全、权限、请求与兼容基线。Android 对 Telegram 的安装检测需在项目既有支持版本和包可见性环境实测；异常按已确认的未安装兜底，不把检测失败计为已安装。
`],
['delivery','10','开发分工、迁移与联调',`
| 角色 | 实施与联调重点 |
|---|---|
| 后台前端 | 白包列表与明细、B 包国家和地址编辑、素材继承、最终报表格式；保留附录全部既有字段 |
| 服务端 / 数据 | B 包配置与分配；白包用户最新 TG 状态、每日安装与活跃；日报去重及建联分类；沿用已有身份和事件源 |
| Android SDK / App | 打开 App 检测上报；点击请求 B 包地址；发起跳转时条件上报 Adjust；App 内事件 Key |
| 测试 | 对象隔离、日期边界、TG 状态回写、空配置、类型切换、随机返回、事件触发矩阵及字段回归 |

### 9.1 存量配置处理
新版统一地址仅以 B 包配置为准，素材旧 URL 不参与新版兜底；旧版历史素材原地址保留并按兼容分支读取，新素材旧接口字段由 B 包生成。国家仅使用 B 包范围。历史安装用户没有 TG 结果时直接归未安装，无需为了首批报表把历史用户排除。

**技术实施需核对**：同一 B 包已有素材地址或国家不一致时，本文不授权自动选取某一素材、并集合并国家或批量覆盖。发布前应形成按 B 包核对的最终配置清单，按已确认配置规则落地；不要以隐式迁移改动投放范围。新字段接口名、数据库结构、随机算法和发布顺序由开发基于现有工程确定，本文件不伪造接口契约。

### 9.2 交付与真实性
本文需求版本与原型 v4.3 一致。原型全部为演示数据，已做界面回归；并不代表服务端、Android 或 Adjust 的真实链路已实现。开发仍需完成真实检测、分配、事件和统计联调。

原型中的金额、安装或其他示例为 0 不代表取消该指标。原型常用国家选项不是生产国家字典的完整范围。
`]
];
const compatibilityContent=read('plan.md').split('### 5.8 新旧 SDK 与历史素材兼容【本次更新】')[1].split('### 5.10 TG 机器人实际分配客服统计')[0].split('## 6. 原型交付与验证')[0];
sections.splice(sections.findIndex(s=>s[0]==='states'),0,['compatibility','08','旧版兼容与 v2 接口隔离','**【保留 · v4.2】** 新版调用 v2 获取新配置与点击分配；旧版保留原接口返回素材字段。响应和处理逻辑隔离，后台只维护一套 B 包配置。\n\n'+compatibilityContent]);
const robotStatsContent=read('plan.md').split('### 5.10 TG 机器人实际分配客服统计【本次更新 · v4.3】')[1].split('## 6. 原型交付与验证')[0];
const reportSection=sections.find(s=>s[0]==='reports');reportSection[3]+='\n\n### 7.4 机器人实际成功分配统计【本次更新 · v4.3】\n\n'+robotStatsContent;
const plan=read('plan.md');
const acceptance=plan.split('## 7. 验收标准')[1];
if(!acceptance) throw Error('未找到已批准验收标准');
sections.push(['acceptance','11','验收清单','以下保留已批准计划的 44 条验收项。第 9、12 条中的分流演示、左右规则与审阅说明属于原型交付验收，不要求生产后台新增审阅功能；真实 SDK、服务端和 Adjust 链路以其余业务条件完成联调验收。\n\n'+acceptance]);
sections.push(['fields','A','附录：现有后台完整字段对照',read('字段对照与开发交接.md')]);
const screenshots=[['compatibility-v4.2.jpg','v4.2 兼容演示：原接口下发新素材，读取已安装 TG 地址组，重复点击复用已下发地址。'],['robot-report-v4.3.jpg','客服建联机器人报表：成功分配次数/TG ID 按日去重人数，在建联总/新/老前。'],['live-report-v4.1.jpg','应用拉活报表：原安装、付费字段保留。'],['white-data-v4.1.jpg','白包自身数据：按日新安装、日活与当日新增用户 TG 分布。']];
const media=screenshots.map(([name,caption])=>`<figure><img alt="${esc(caption)}" src="data:image/jpeg;base64,${fs.readFileSync(path.join(root,'verification',name)).toString('base64')}" loading="lazy"><figcaption>${esc(caption)}截图为演示，正式开发以本文字段及规则为准。</figcaption></figure>`).join('');
const nav=sections.map(([id,num,title])=>`<a href="#${id}"><span>${num}</span>${esc(title)}</a>`).join('')+'<a href="#screens"><span>B</span>原型参考截图</a>';
const body=sections.map(([id,num,title,content])=>`<section id="${id}" aria-labelledby="title-${id}"><div class="eyebrow">${num} / REQUIREMENTS</div><h2 id="title-${id}">${esc(title)}</h2>${markdown(content)}</section>`).join('');
const html=`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="description" content="TG安装统计与B包统一跳转分配 v4.3 开发交接PRD"><title>开发交接 PRD · TG 安装统计与 B 包统一跳转分配</title>
<style>
:root{color-scheme:light;--ink:#17263c;--muted:#58677b;--line:#dce4ec;--accent:#245ac6;--light:#f3f6fa}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:24px}body{margin:0;background:#eef2f7;color:var(--ink);font:15px/1.85 system-ui,-apple-system,"Segoe UI","Microsoft YaHei",sans-serif}a{color:var(--accent)}.layout{max-width:1540px;margin:auto;display:grid;grid-template-columns:266px minmax(0,1fr);gap:30px;padding:28px 30px 70px}.sidebar{position:sticky;top:28px;align-self:start;max-height:calc(100vh - 56px);overflow:auto;padding:20px 5px 20px 0}.brand{font-size:12px;letter-spacing:2px;color:var(--accent);font-weight:750}.sidebar h2{font-size:19px;margin:5px 0 8px}.sidebar p{color:var(--muted);font-size:12px}.sidebar nav{display:grid;margin-top:24px;gap:5px}.sidebar nav a{display:flex;gap:9px;line-height:1.5;color:#3e5068;font-size:13px;text-decoration:none;border-radius:6px;padding:9px 7px}.sidebar nav a:hover,.sidebar nav a:focus-visible{background:#e1e9f6;color:#184596}.sidebar nav span{flex:0 0 23px;font-size:11px;font-weight:750;color:#6782aa}main{min-width:0}.hero,section{background:#fff;border:1px solid var(--line);border-radius:12px;padding:34px 38px;margin-bottom:20px}.hero{border-top:5px solid var(--accent);padding-top:30px}.eyebrow{font-size:11px;font-weight:750;letter-spacing:1.5px;color:#5074a7}h1{font-size:30px;line-height:1.4;margin:12px 0 14px;letter-spacing:-.5px}h2{font-size:23px;line-height:1.45;margin:8px 0 22px}h3{font-size:18px;margin:28px 0 12px}h4{font-size:16px;margin:24px 0 10px}p{margin:12px 0}li{margin:7px 0;padding-left:3px}ul,ol{padding-left:24px;margin:14px 0}.subtitle{color:var(--muted);max-width:750px}.meta{display:flex;gap:9px;flex-wrap:wrap;margin:22px 0}.tag{font-size:12px;background:#eef3fc;border:1px solid #d7e2f5;border-radius:5px;padding:3px 10px;color:#315993}.callout{border-left:3px solid var(--accent);background:#f4f7fd;padding:12px 17px;font-size:14px;margin-top:22px}.actions{display:flex;gap:10px;flex-wrap:wrap;margin:21px 0 4px}.button,button{appearance:none;border:1px solid #bdcde4;border-radius:6px;background:#fff;color:#2455a1;padding:8px 13px;text-decoration:none;font:inherit;font-size:13px;cursor:pointer}button:hover,.button:hover{background:#eef4fc}.table-wrap{width:100%;overflow:auto;border:1px solid var(--line);border-radius:7px;margin:18px 0 22px}table{width:100%;border-collapse:collapse;font-size:13px;line-height:1.75}th{background:#edf2f8;color:#324d70;text-align:left;font-weight:650}th,td{border-bottom:1px solid var(--line);padding:11px 13px;vertical-align:top;min-width:95px}tr:last-child td{border-bottom:0}tbody tr:nth-child(even){background:#fafbfd}code{padding:2px 5px;background:#edf2f7;border-radius:4px;font:12px/1.6 Consolas,monospace;color:#244e8a;overflow-wrap:anywhere}strong{font-weight:700;color:#163f77}figure{margin:24px 0 32px}figure img{display:block;width:100%;height:auto;border:1px solid #cbd5e2;border-radius:7px}figcaption{font-size:12px;color:var(--muted);padding:10px 2px}.footer{padding:10px 25px;color:var(--muted);font-size:12px;text-align:center}:focus-visible{outline:2px solid #5086df;outline-offset:3px}@media(max-width:1000px){.layout{grid-template-columns:210px minmax(0,1fr);padding:20px;gap:18px}.hero,section{padding:26px 24px}h1{font-size:26px}}@media(max-width:720px){.layout{display:block;padding:12px}.sidebar{position:static;max-height:none;padding:12px}.sidebar nav{grid-template-columns:1fr 1fr;margin-top:10px}.hero,section{padding:22px 17px}.hero h1{font-size:24px}h2{font-size:21px}}@media print{@page{size:A4;margin:15mm}body{background:#fff;font-size:10pt;line-height:1.65}.layout{display:block;padding:0;max-width:none}.sidebar,.actions{display:none}.hero,section{border:0;border-radius:0;padding:0;margin:0 0 22pt;break-before:page}.hero{break-before:auto;border-top:3pt solid #245ac6;padding-top:14pt}h1{font-size:23pt}h2{font-size:17pt}h3,h4{break-after:avoid}p,li{orphans:3;widows:3}.table-wrap{overflow:visible;border-radius:0}table{font-size:9pt}th,td{min-width:0;padding:6pt;overflow-wrap:anywhere}thead{display:table-header-group}tr{break-inside:avoid}figure{break-inside:avoid}a{text-decoration:none}figure img{max-height:230mm;object-fit:contain}.footer{font-size:8pt}.tag{font-size:9pt}}
</style></head><body><div class="layout"><aside class="sidebar"><div class="brand">PRODUCT REQUIREMENTS</div><h2>开发交接文档</h2><p>v4.3 · 2026-11-18<br>按最终确认需求汇总</p><nav aria-label="文档目录">${nav}</nav></aside><main><header class="hero"><div class="eyebrow">ADCONTROL / ANDROID / DATA</div><h1>TG 安装统计与<br>B 包统一跳转分配</h1><p class="subtitle">开发交接 PRD。覆盖后台页面、字段继承、Android 分流、Adjust 条件上报、数据统计及完整验收。</p><div class="meta"><span class="tag">版本 v4.3</span><span class="tag">需求已确认</span><span class="tag">Android + Web 后台</span><span class="tag">2026-11-18</span></div><div class="callout"><strong>实施原则：</strong>以现有测试后台为增量基线。除明确删除或迁移项，原字段及生产逻辑均保留。本文附录完整收录字段对照，不以简化原型代替字段清单。</div><div class="actions"><button type="button" onclick="window.print()">打印 / 另存 PDF</button><a class="button" href="./index.html">查看同目录原型</a><a class="button" href="#acceptance">跳转验收清单</a></div></header>${body}<section id="screens"><div class="eyebrow">B / PROTOTYPE REFERENCE</div><h2>原型参考截图</h2><p>截图已嵌入本 HTML，离线查看无需额外图片文件。交互原型为同目录 index.html；本文为完整可独立阅读的需求文档。</p>${media}</section><footer class="footer">TG 安装统计与 B 包统一跳转分配 · PRD v4.3 · 2026-11-18<br>需求依据：已确认会话、plan.md、字段对照与开发交接.md。演示不代表真实业务链路已接入。</footer></main></div></body></html>`;
const dest=path.join(root,'prd.html');
fs.writeFileSync(dest,html,'utf8');
console.log(JSON.stringify({file:dest,bytes:Buffer.byteLength(html),sections:sections.length+1,acceptanceItems:(acceptance.match(/^\d+\. /gm)||[]).length,embeddedImages:screenshots.length}));
