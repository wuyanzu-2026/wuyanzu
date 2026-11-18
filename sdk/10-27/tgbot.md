# Telegram 客服机器人 · 后端开发交接

版本：V1.4（按 `客服广告建联需求文档.md`）  
日期：2026-10-27  
负责人：**后端 / 服务端（独立 Bot 服务）**  
口径：只看本目录。不要按 `2026-10-26-客服广告建联` 或独立机器人文档开发。  
【本次更新】把后端提出的 6 条实现分叉钉死。用户侧文案仍按 Telegram `language_code` 自动切换。

---

## 0. V1.4 钉死（按此实现，不要再分叉）

| # | 主题 | 钉死结果 |
|---|---|---|
| 1 | 占用的 click_id 还调不调 connect | **不调。** 后来的 Telegram 用户仍可分号接待，本地标非归因，禁止 `start`/`connect`。中台占用校验只作并发兜底。 |
| 2 | 成功和重复的 HTTP | **都走 HTTP 200 + body。** `attributed` / `duplicate` 不走 409。HTTP 4xx 只表示验签或时间窗失败，不重试。 |
| 3 | 粘性回访的计数和 connected | **未关闭的粘性回访不加 `today_assigned`/`open_chats`，不清 `connected`。** 只有新分配才 +1。连续 `/start` 只更新入口 `click_id`，客服号不变。 |
| 4 | B7 告警 | **第 3 步分到离班号也要告警管理员。** 不只在第 5 步放宽上限时告警。 |
| 5 | 库挂了读不到兜底号 | **库失败直接回「客服正在接入」并告警。** 不要读号池。兜底号只在库正常、号池放宽时使用。 |
| 6 | 超级管理员配置入口 | **部署配置拆成管理员和超级管理员两份白名单。** `/cs_admins` 只给超级管理员。 |

---

## 1. 你负责什么

做一个 **可多实例部署的 Telegram 机器人服务**。一个国家一个 Bot Token、一个号池。

广告只跳到国家机器人。用户点 Start 后，由 **机器人自己分真实客服号**。用户点「立即联系」后，机器人把建联报给中台。中台负责找回白包 / GAID 并 S2S Adjust。

| 做 | 不做 |
|---|---|
| 解析 `/start <click_id>` | 不读 GAID，不打 Adjust |
| 号池、分号、粘性、上限、兜底 | 不在中台建号池表 |
| 「立即联系」callback 按钮，发出客服链接 | 不做机器人内坐席工作台 |
| 调中台 `/v1/cs/start`、`/v1/cs/connect` | 不做 WhatsApp |
| 管理员命令管号 | 不做独立 Web 管号后台 |
| 失败重试、管理员告警 | 不给客服推「新用户来了」 |
| 用户侧文案按 Telegram 语言自动切换 | 不把 `language_code` 传中台 / Adjust |
| 一个国家一个实例 | 不把 `click_id` 暴露给用户 |

其他端配合，不在本次机器人代码里做：

- **SDK**：生成 `click_id`，打开 `t.me/bot?start=click_id`
- **中台服务**：click 入库、start/connect、pending、去重、S2S
- **运营**：BotFather 建各国机器人，素材填 `https://t.me/<bot>`
- **Adjust**：白包建联 Event Token

---

## 2. 主链路

```text
用户点客服广告
  → SDK 打开 t.me/<国家bot>?start=<click_id>
  → 用户点 Start
  → 机器人读 language_code，2 秒内分号，展示对应语言的「立即联系」
  → 用户点「立即联系」
  → 机器人同时：发 https://t.me/<客服号> + POST /v1/cs/connect
  → 中台按 click_id 找白包和 GAID，去重后 S2S 白包 Adjust
```

建联口径：**用户点「立即联系」，且机器人已发出该客服链接。**

不算建联：点广告、打开 Telegram、分到号、给客服发第一句。

---

## 3. 用户流程

1. 收到 `/start <click_id>`。
   - 合法 `click_id` 且本地尚未被其他 `telegram_user_id` 占用 → 归因会话，本用户占用该 `click_id`
   - 合法但已被其他 `telegram_user_id` 占用 → 可分号接待，本地标非归因，**禁止调 start/connect**
   - 空 / 非法 / 超长 → 自然客服：可分号，**禁止调 start/connect**
2. 2 秒内给出分配结果。
3. 「立即联系」必须是 **callback 按钮**，不能是 url 按钮。
4. 用户点按钮：若本会话允许上报，先异步报中台，**同时**发 `https://t.me/<cs_account>`。中台失败也不能卡住用户。
5. 同一按钮连点：只第一次报中台，之后只补发同一链接。
6. 用户说打不开 / 没反应 / link：再发一次同一链接，不换号，不重复报。
7. 同一 Telegram 用户连续多次 `/start`：以最后一次合法且未被他人占用的 `click_id` 更新入口；已被占用的当非归因，不覆盖已占用关系。客服号仍走粘性，不反复换号。**不清 `connected`。**

用户文案不要出现 click_id、GAID、上报、归因。底稿：

- 正在为你分配客服…
- 已为你分配专属客服。请点击下方按钮开始咨询。
- 请点击打开客服对话：
- 客服正在接入，请稍后再试。
- 原客服暂不可用，正在为你更换。

按钮文案也要随语言切换，不要写死中文「立即联系」。

### 3.1 用户语言

以 Telegram `from.language_code` 为准，不按机器人实例国家，也不按广告设备 IP。

1. 每次 Start、点按钮、发消息都重新读 `language_code`。
2. 全量小写后按前缀匹配：
   - `zh-hant` / `zh-tw` / `zh-hk` → 繁中
   - 其余 `zh*` → 简中
   - `id` → 印尼语
   - `vi` → 越南语
   - `th` → 泰语
   - `ms` → 马来语
   - `en*` 及其他未覆盖、空值 → 英文
3. 未识别语言不要拒绝 Start，也不要改分号，只用英文文案。
4. 用户改了 Telegram 语言，下一句就换。不必先存「用户语言」才能分号。
5. 管理员命令、号池告警保持中文。
6. 不要把 `language_code` 放进 start/connect 请求。

V1 内置：en（默认）、zh、zh-Hant、id、vi、th、ms。运营可后补文案，匹配规则不变。

英文底稿：

- Assigning a customer service agent…
- A dedicated agent has been assigned. Tap the button below to start.
- Tap to open the chat:
- All agents are busy. Please try again later.
- Your previous agent is unavailable. Assigning a new one.
- 按钮：Contact now

用户侧示意：

```text
/start
------------------------------
已为你分配专属客服。
请点击下方按钮开始咨询。

        [ 立即联系 ]
------------------------------
（点击后）
请点击打开客服对话：
https://t.me/cs_sg_02
```

V1 不预填来源文本到客服对话框。

---

## 4. 分号算法

按顺序，不许跳步。自然客服、非归因会话也走同一套分号，只是后续不调中台。

**库不可用时不要进入本算法。** 直接按用户语言回「客服正在接入」，告警管理员，允许用户再次 Start。兜底号在库里，库挂了读不到，禁止在库失败时「用兜底号」。

1. **粘性**：该 `telegram_user_id` 7 天内原号仍启用 → 回原号。忽略在班和上限。
   - 会话未关闭：不 `+today_assigned`，不 `+open_chats`，不清 `connected`，不调 connect。
   - 会话已 `/cs_close` 但粘性仍有效：不 `+today_assigned`，`open_chats +1`（重新占坑），仍不清 `connected`，不调 connect。
   - 连续 `/start` 只更新入口 `click_id`，客服号不变。
2. **过滤**：`enabled=true` 且 `today_assigned < daily_cap` 且 `open_chats < concurrent_cap`
3. **在班优先**：过滤结果有在班号，只在在班里选；全离班则在离班里选，不要把用户挂起。**只要本步最终分到离班号，就告警管理员**（在班全满，或当前没有在班号，都要告）。这是 B7，不要漏。
4. **排序**：`today_assigned` 升序 → `open_chats` 升序 → `last_assigned_at` 升序（空最前）
5. **放宽**：没人则先放开同时接待上限，再放开当日上限，再用兜底号。每放宽一层告警管理员。兜底号只在这一步、且库正常时使用。
6. **还没有**：按用户语言回复「客服正在接入」等价文案，pending，告警。允许用户再次 Start。

只有 **新分配** 才 `today_assigned +1` 且 `open_chats +1`，`connected` 从 false 开始。粘性回访不是新分配。

并发用条件更新，避免超发当日上限。  
广告点击未 Start，**不得**占用 `today_assigned`。  
原号被停用后再 Start，走新客规则，不沿用停用号。  
`open_chats` 在 `/cs_close @username <tg_user_id>` 或粘性 7 天到期时减 1。

---

## 5. 管理员命令

仅白名单 Telegram 用户。普通用户发命令不回号池、不泄露名单。  
用户名统一存不含 `@` 的 Telegram username，大小写不敏感。  
加号尽量 `getChat` 校验；失败允许入库，标记「未校验」。  
新号默认启用、离班。默认上限 40/30。  
停用号、删除号、更换兜底号要二次确认。  
当日上限按实例时区零点清零，默认 `Asia/Singapore`。

部署配置必须拆两份，不能只有一份管理员名单：

| 配置项 | 谁 | 权限 |
|---|---|---|
| `cs_admins` | 号池管理员 | 下表除 `/cs_admins` 外的命令 |
| `cs_super_admins` | 超级管理员 | 号池命令 + `/cs_admins` |

超级管理员自动具备号池管理员权限，不必再抄进 `cs_admins`。  
V1 不提供在机器人里增删管理员；改名单走部署配置。  
`cs_super_admins` 为空则 `/cs_admins` 无人可执行，部署时必须配。

| 命令 | 作用 | 示例 |
|---|---|---|
| `/cs_add @username 40 30` | 新增。参数为当日上限、同时接待上限 | `/cs_add @cs_sg_02 40 30` |
| `/cs_on @username` | 在班 | `/cs_on @cs_sg_02` |
| `/cs_off @username` | 离班 | `/cs_off @cs_sg_02` |
| `/cs_enable @username` | 启用 | `/cs_enable @cs_sg_02` |
| `/cs_disable @username` | 停用，需确认。熟客下次重分 | `/cs_disable @cs_sg_02` |
| `/cs_cap @username 40 30` | 改上限 | `/cs_cap @cs_sg_02 50 30` |
| `/cs_fallback @username` | 设兜底号，需确认。一实例只能一个 | `/cs_fallback @cs_sg_backup` |
| `/cs_list` | 号池状态 | `/cs_list` |
| `/cs_close @username <tg_user_id>` | 关闭会话，`open_chats-1` | `/cs_close @cs_sg_02 123456789` |
| `/cs_admins` | 查看管理员和超级管理员名单，仅超级管理员 | `/cs_admins` |

号池为空时，`/cs_list` 提示先 `/cs_add`。此时普通用户 Start 走「客服稍后接入」并告警。

---

## 6. 本地库

机器人独立库。不要把号池写进中台。至少三张表：

### 6.1 客服号

| 字段 | 类型 | 必填 | 默认 | 规则 |
|---|---|---|---|---|
| cs_account | string | 是 | 无 | Telegram username，实例内唯一 |
| daily_cap | int | 是 | 40 | 1～999 |
| concurrent_cap | int | 是 | 30 | 1～999 |
| today_assigned | int | 是 | 0 | 按实例时区零点清零 |
| open_chats | int | 是 | 0 | 已分配未关闭的会话数 |
| online | bool | 是 | false | 在班 / 离班 |
| enabled | bool | 是 | true | 启用 / 停用 |
| is_fallback | bool | 是 | false | 同一实例只能一个兜底号 |
| verified | bool | 是 | 视校验结果 | 未校验也可用于分配 |
| last_assigned_at | datetime | 否 | 空 | 并列时挑最久没分到的 |

### 6.2 粘性

`telegram_user_id → cs_account`，有效期 7 天。原号停用后失效。

### 6.3 会话

至少包含：`click_id`、占用者 `telegram_user_id`、已分配客服号、是否已建联、上报状态、是否归因会话。

`click_id` 本地只允许第一个 Start 的 Telegram 用户占用。后来的人仍可分号接待，**按自然客服处理：禁止调 start/connect**。中台「被其他 telegram_user_id 占用则 attributed=false」只作并发兜底，机器人不要依赖这次调用来完成 B9。

Webhook 重复推送按 `update_id` 幂等。服务重启后会话状态以数据库为准。聊天正文默认不落库。

---

## 7. 上报中台

密钥、中台域名只放服务端。禁止上传 GAID、广告 ID、白包 app_id、聊天内容、手机号。

签名：

```text
X-Cs-Timestamp: unix 秒，与服务器差 ≤ 300
X-Cs-Sign: hex(hmac_sha256(secret, timestamp + "." + raw_body))
Content-Type: application/json
```

### 7.1 POST /v1/cs/start（可选，第一期可先本地记）

Start 成功分配后，且本会话是归因会话时，调用一次，只记漏斗，不打 Adjust。不要和 connect 混用。  
自然客服、占用 click_id 的后来者，都不要调。

| 字段 | 必填 | 规则 |
|---|---|---|
| click_id | 是 | 16～24，`A-Za-z0-9_-` |
| telegram_user_id | 是 | 数字字符串 |
| telegram_username | 否 | 可空 |
| event | 是 | 固定 `start` |
| start_time | 是 | unix 秒 |

### 7.2 POST /v1/cs/connect 🔴

触发：用户点「立即联系」且本会话是归因会话、有合法 `click_id`、本地尚未 `connected`。  
以下情况 **禁止调用**：自然客服、占用 click_id 的后来者、粘性回访且本地已 `connected`。

| 字段 | 必填 | 规则 |
|---|---|---|
| click_id | 是 | 与 Start 收到的一致 |
| telegram_user_id | 是 | 数字字符串 |
| telegram_username | 否 | 可空 |
| cs_account | 是 | 不含 `@` |
| connect_time | 是 | unix 秒，按钮点击时间 |
| event | 是 | 固定 `connect` |

中台按现网 web-ad 约定返回：**业务结果一律 HTTP 200 + body `code`**。机器人不要把 409 写成必须分支。

```json
{ "code": 200, "data": { "attributed": true, "duplicate": false } }
```

| 返回 | 机器人怎么做 |
|---|---|
| HTTP 200 + `data.attributed=true` | 本地标 `connected`。用户只看到客服链接 |
| HTTP 200 + `data.attributed=false` | 仍接待，本地记未归因，不重试 |
| HTTP 200 + `data.duplicate=true` | 当已建联，本地标 `connected`，不重复报 |
| HTTP 409（若中台误返回） | 与 `duplicate=true` 相同，不当失败重试 |
| HTTP 5xx / 超时 | 用户仍收到链接；本地 `report_failed`，重试 |
| HTTP 4xx（验签或时间窗） | 不要盲重试，直接告警管理员 |

重试：超时 3 秒视为失败。间隔 5s / 30s / 5min，共 3 次。以 `click_id` 本地唯一键保证业务只成功发出一次。不要对用户说「已上报 / 归因成功」。

---

## 8. 部署要求

- 一个国家一个机器人实例，各用自己的 Bot Token 和号池。不要写成单例全局号池。
- 配置项：Bot Token、`cs_admins`、`cs_super_admins`、中台域名、HMAC secret、实例时区、语言包（可后补文案，不要按实例锁死用户语言）。
- 用 Webhook 收消息。
- Start 2 秒内回分配结果。
- 机器人库失败 → **直接回「客服正在接入」并告警**。不要尝试读号池或兜底号。兜底号只在库正常、走到第 5 步放宽时使用。

运营提供：各国 bot username + Token。部署时再给中台域名、HMAC secret、管理员和超级管理员 Telegram user id。

---

## 9. 你这边必须过的验收

| 编号 | 场景 | 期望 |
|---|---|---|
| B2 | Start 后点立即联系 | 2 秒内分号；发出客服链接；调一次 connect |
| B3 | 同一 click_id 再点立即联系 | 可再发链接；不再调 connect |
| B4 | 同一 Telegram 用户 7 天内再来 | 仍是原客服号；未关闭则 today_assigned/open_chats 不增加；不清 connected；不再调 connect |
| B5 | 原号停用后再 Start | 分到其他启用号；按新分配 +1 |
| B6 | 两在班号已分配不同 | 新客给已分配更少的 |
| B7 | 在班全满、有离班号 | 分给离班号，**管理员告警** |
| B8 | 无 start / 非法 start | 可分号，不调 connect |
| B9 | 第二个 Telegram 用户用已占用 click_id | 可接待，**不调 start/connect** |
| B10 | 中台 5xx | 用户仍收到链接；机器人重试 |
| B11 | 广告点击但未 Start | 该号 `today_assigned` 不增加 |
| B13 | 非管理员 `/cs_list` | 看不到号池 |
| B17 | Telegram 语言为 id / zh / 空 | 印尼语出印尼语；简中出中文；无 language_code 出英文。新加坡机器人也按用户语言，不按实例锁中文 |
| B18 | 机器人库不可用 | 回复「客服正在接入」，告警；不读号池、不用兜底号 |
| B19 | 普通管理员 `/cs_admins` | 无权限。超级管理员能看到两份名单 |

能力上限必须写进验收：机器人能确认「用户愿意打开被分配的客服号」；**不能**确认「用户已经给该客服发了第一句话」。

---

## 10. 联调依赖

后端可先按本文把 Bot 服务做起来。联调需要中台同期给出：

1. `POST /v1/cs/start`
2. `POST /v1/cs/connect`（HTTP 200 + body，不要 409）
3. HMAC secret、中台域名
4. SDK 能打开 `t.me/bot?start=click_id`

详细规则以 `客服广告建联需求文档.md` 第 8 节为准。占用 click_id、粘性计数、B7 告警、库失败、管理员名单以本文第 0 节为准。
