const AD_TYPES = [
  { value: "open", label: "开屏广告" },
  { value: "banner", label: "Banner广告" },
  { value: "rewarded", label: "激励视频" },
];
const PERM_GROUPS = [
  { module: "dashboard", label: "数据概览", children: [] },
  { module: "app", label: "白包APP", children: [
    { key: "app:list", label: "查看列表" },
    { key: "app:detail", label: "查看数据详情" },
    { key: "app:save", label: "新增/编辑APP" },
  ]},
  { module: "package", label: "B包管理", children: [
    { key: "package:list", label: "查看列表" },
    { key: "package:detail", label: "查看数据详情" },
    { key: "package:save", label: "新增/编辑B包" },
  ]},
  { module: "material", label: "广告物料", children: [
    { key: "material:list", label: "查看物料列表" },
    { key: "material:save", label: "编辑物料" },
    { key: "material:delete", label: "删除物料" },
  ]},
  { module: "device", label: "设备管理", children: [
    { key: "device:list", label: "查看列表" },
    { key: "device:detail", label: "查看详情" },
  ]},
  { module: "account", label: "账户管理", children: [
    { key: "account:list", label: "查看列表" },
    { key: "account:save", label: "新增/编辑管理员" },
    { key: "account:delete", label: "删除管理员" },
  ]},
  { module: "role", label: "角色管理", children: [
    { key: "role:list", label: "查看列表" },
    { key: "role:save", label: "新增/编辑角色" },
  ]},
];
function svgThumb(color, text) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="88" height="88"><rect width="88" height="88" rx="10" fill="${color}"/><text x="44" y="48" text-anchor="middle" fill="white" font-size="14" font-family="Segoe UI">${text}</text></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}
const THUMBS = {
  open: svgThumb("#3b82f6", "开屏"),
  banner: svgThumb("#22c55e", "Banner"),
  rewarded: svgThumb("#a78bfa", "激励"),
  empty: svgThumb("#475569", "上传"),
  ludo: svgThumb("#f97316", "Ludo"),
  a2: svgThumb("#3b82f6", "A2"),
  a1: svgThumb("#22c55e", "A1"),
  b1: svgThumb("#64748b", "B1"),
  b2: svgThumb("#0ea5e9", "B2"),
  cs: svgThumb("#8b5cf6", "CS"),
};

const state = {
  loggedIn: true,
  page: "package",
  username: "admin",
  dash: { gran: "day", from: "2026-10-20", to: "2026-10-26", metrics: { install: true, dau: true, show: true, click: true, pay: true, connect: true } },
  apps: [
    { id: 5, name: "Ludo Rush Party", pkg: "com.ludorushparty.game", appId: "app_ludo", logo: THUMBS.ludo, type: "b", n: { open: 0, banner: 0, rewarded: 0 }, state: "启用", install: 1280, dau: 86, show: 0, click: 0, pay: 0, connect: 0, adjust: "abc123", registerKey: "reg_ludo", payKey: "pay_ludo", firstPayKey: "first_ludo", installKey: "install_ludo", connectKey: "connect_ludo", store: "https://play.google.com/store/apps/details?id=com.ludorushparty.game" },
    { id: 4, name: "A2test", pkg: "com.a22.ad.test.a", appId: "app_a2", logo: THUMBS.a2, type: "cs", n: { open: 3, banner: 1, rewarded: 0 }, state: "启用", install: 312, dau: 41, show: 38, click: 22, pay: 0.13, connect: 5, adjust: "adj_a2", registerKey: "reg_a2", payKey: "pay_a2", firstPayKey: "first_a2", installKey: "install_a2", connectKey: "connect_a2", store: "https://play.google.com/store/apps/details?id=com.a22.ad.test.a" },
    { id: 1, name: "A1test", pkg: "com.a11.ad.test.a", appId: "app_a1", logo: THUMBS.a1, type: "b", n: { open: 5, banner: 5, rewarded: 5 }, state: "启用", install: 540, dau: 73, show: 39, click: 20, pay: 10.06, connect: 0, adjust: "adj_a1", registerKey: "reg_a1", payKey: "pay_a1", firstPayKey: "first_a1", installKey: "install_a1", connectKey: "connect_a1", store: "https://play.google.com/store/apps/details?id=com.a11.ad.test.a" },
  ],
  packages: [
    { id: 3, type: "cs", name: "客服-东南亚", logo: THUMBS.cs, apps: [4], install: 0, show: 18, click: 9, pay: 0, connect: 5, state: "启用", store: "", countries: [], mccs: [], created: "2026-10-21 11:20:00" },
    { id: 2, type: "b", name: "com.demo2b.app.b2", logo: THUMBS.b2, apps: [4], install: 4, show: 20, click: 13, pay: 0.07, connect: 0, state: "启用", store: "https://play.google.com/store/apps/details?id=com.demo2b.app.b2", countries: ["SG", "CN"], mccs: ["525", "460", "461"], created: "2026-10-18 09:12:00" },
    { id: 1, type: "b", name: "com.demo2b.app.b1", logo: THUMBS.b1, apps: [4, 1], install: 7, show: 43, click: 21, pay: 0.06, connect: 0, state: "启用", store: "https://play.google.com/store/apps/details?id=com.demo2b.app.b1", countries: ["SG", "CN"], mccs: ["525", "460"], created: "2026-10-12 16:08:00" },
  ],
  materials: [
    { id: 11, packageId: 3, adType: "open", source: THUMBS.open, jump: "https://t.me/sg_cs_bot", bid: 0.9, countries: ["SG"], mccs: ["525"], state: "启用", show: 8, click: 3, connect: 1 },
    { id: 12, packageId: 3, adType: "banner", source: THUMBS.banner, jump: "https://t.me/sg_cs_bot", bid: 1.3, countries: ["SG"], mccs: ["525"], state: "启用", show: 10, click: 6, connect: 4 },
    { id: 13, packageId: 3, adType: "rewarded", source: THUMBS.rewarded, jump: "https://t.me/vn_cs_bot", bid: 0.9, countries: ["VN"], mccs: ["452"], state: "启用", show: 0, click: 0, connect: 0 },
    { id: 14, packageId: 3, adType: "open", source: THUMBS.open, jump: "https://t.me/cn_cs_bot", bid: 1.0, countries: ["CN"], mccs: ["460", "461"], state: "启用", show: 0, click: 0, connect: 0 },
    { id: 21, packageId: 2, adType: "open", source: THUMBS.open, jump: "https://app.adjust.com/b2?label=open", bid: 1.5, countries: [], mccs: [], state: "启用", show: 8, click: 4, connect: 0 },
    { id: 22, packageId: 2, adType: "banner", source: THUMBS.banner, jump: "https://app.adjust.com/b2?label=banner", bid: 1, countries: [], mccs: [], state: "启用", show: 7, click: 5, connect: 0 },
    { id: 23, packageId: 2, adType: "rewarded", source: THUMBS.rewarded, jump: "https://app.adjust.com/b2?label=rewarded", bid: 0.6, countries: [], mccs: [], state: "启用", show: 5, click: 4, connect: 0 },
  ],
  devices: [
    { id: 1, gaid: "8f3a21c0-demo-0001", appId: 4, brand: "Samsung", model: "SM-A546B", os: "14", ip: "118.189.12.21", country: "SG", mcc: "525", test: true, usb: false, sim: true, cpu: "arm64-v8a", resolution: "1080x2340", language: "en-SG", created: "2026-10-24 08:21:11", apps: ["WhatsApp", "Telegram", "Chrome"] },
    { id: 2, gaid: "8f3a21c0-demo-0002", appId: 1, brand: "Xiaomi", model: "2201116SG", os: "13", ip: "120.36.88.10", country: "CN", mcc: "460", test: false, usb: true, sim: true, cpu: "arm64-v8a", resolution: "1080x2400", language: "zh-CN", created: "2026-10-23 19:04:02", apps: ["WeChat", "Chrome", "TikTok"] },
    { id: 3, gaid: "8f3a21c0-demo-0003", appId: 5, brand: "OPPO", model: "CPH2459", os: "14", ip: "103.28.44.9", country: "ID", mcc: "510", test: false, usb: false, sim: false, cpu: "armeabi-v7a", resolution: "720x1600", language: "id-ID", created: "2026-10-22 13:40:55", apps: ["WhatsApp", "Facebook"] },
  ],
  currentAccountId: 1,
  accounts: [
    { id: 1, username: "admin", name: "超级管理员", roleId: 1, status: 1, created: "2026-07-01 10:00:00", scope: "all", packageIds: [] },
    { id: 2, username: "ops01", name: "运营小王", roleId: 2, status: 1, created: "2026-09-12 15:22:00", scope: "all", packageIds: [] },
    { id: 3, username: "b2ops", name: "B2运营", roleId: 2, status: 1, created: "2026-10-27 10:00:00", scope: "pkg", packageIds: [2] },
  ],
  roles: [
    { id: 1, name: "超级管理员", perms: "dashboard,app,package,material,device,account,role", created: "2026-07-01 10:00:00" },
    { id: 2, name: "运营", perms: "dashboard,app:list,app:detail,package:list,package:detail,package:save,material:list,material:save,device:list,device:detail", created: "2026-09-12 15:00:00" },
  ],
  appQuery: { state: "", kw: "", current: 1, size: 10 },
  pkgQuery: { appId: "", type: "", kw: "", state: "", current: 1, size: 10 },
  deviceQuery: { appId: "", brand: "", gaid: "", test: "", from: "", to: "", current: 1, size: 10 },
  accountQuery: { username: "", roleId: "", current: 1, size: 10 },
};
const titles = { dashboard: "数据概览", app: "白包APP", package: "B包管理", device: "设备管理", account: "账户管理", role: "角色管理" };
function $(id) { return document.getElementById(id); }
function adLabel(v) { return (AD_TYPES.find((x) => x.value === v) || {}).label || v; }
function typeLabel(v) { return v === "cs" ? "客服建联" : "应用拉活"; }
function pkgTypeLabel(v) { return v === "cs" ? "客服建联" : "应用拉活"; }
function appMix(app) {
  const pkgs = scopedPackageList().filter((p) => p.apps.includes(app.id) && p.state === "启用");
  const hasB = pkgs.some((p) => p.type === "b");
  const hasCs = pkgs.some((p) => p.type === "cs");
  if (hasB && hasCs) return { text: "拉活+建联", cls: "info" };
  if (hasCs) return { text: "客服建联", cls: "info" };
  if (hasB) return { text: "应用拉活", cls: "ok" };
  return { text: "未关联", cls: "mute" };
}
function countryText(codes) {
  if (!(codes || []).length) return "-";
  return (codes || []).map((c) => {
    const item = COUNTRIES.find((x) => x.code === c);
    return `<span class="tag">${item ? item.name + "(" + c + ")" : c}</span>`;
  }).join("");
}
function mccText(codes) {
  if (!(codes || []).length) return "-";
  return (codes || []).map((c) => {
    const item = MCCS.find((x) => x.mcc === c);
    return `<span class="tag">${item ? item.label : c}</span>`;
  }).join("");
}
function freqText(n) { return `开屏 ${n.open} / Banner ${n.banner} / 激励 ${n.rewarded}`; }
function nextId(list) { return Math.max(0, ...list.map((x) => x.id)) + 1; }
function appById(id) { return state.apps.find((a) => a.id === id); }
function pkgById(id) { return state.packages.find((p) => p.id === id); }
function roleById(id) { return state.roles.find((r) => r.id === id); }
function currentAccount() {
  return state.accounts.find((a) => a.id === state.currentAccountId) || state.accounts.find((a) => a.username === state.username);
}
function currentRole() { return roleById(currentAccount()?.roleId); }
function permSet() {
  return new Set((currentRole()?.perms || "").split(",").map((x) => x.trim()).filter(Boolean));
}
function hasPerm(key) {
  const set = permSet();
  if (set.has(key)) return true;
  const mod = String(key).split(":")[0];
  return set.has(mod);
}
function canSeePage(page) {
  const map = { dashboard: "dashboard", app: "app:list", package: "package:list", device: "device:list", account: "account:list", role: "role:list" };
  return hasPerm(map[page] || page);
}
function isAllScope() {
  const acc = currentAccount();
  if (!acc) return true;
  if (roleById(acc.roleId)?.name === "超级管理员") return true;
  return acc.scope !== "pkg";
}
function accPackageIds() { return currentAccount()?.packageIds || []; }
function canAccessPackage(id) { return isAllScope() || accPackageIds().includes(Number(id)); }
function scopedPackageList() {
  if (isAllScope()) return state.packages.slice();
  const ids = new Set(accPackageIds());
  return state.packages.filter((p) => ids.has(p.id));
}
function scopedAppList() {
  const ids = new Set(scopedPackageList().flatMap((p) => p.apps));
  return state.apps.filter((a) => ids.has(a.id));
}
function appScopedStats(app) {
  const pkgs = scopedPackageList().filter((p) => p.apps.includes(app.id));
  return {
    show: pkgs.reduce((s, p) => s + (p.show || 0), 0),
    click: pkgs.reduce((s, p) => s + (p.click || 0), 0),
    pay: pkgs.filter((p) => p.type === "b").reduce((s, p) => s + (p.pay || 0), 0),
    connect: pkgs.filter((p) => p.type === "cs").reduce((s, p) => s + (p.connect || 0), 0),
    install: pkgs.filter((p) => p.type === "b").reduce((s, p) => s + (p.install || 0), 0),
  };
}
function scopeLabel(acc) {
  if (!acc || acc.scope !== "pkg") return "全部投放";
  const names = (acc.packageIds || []).map((id) => pkgById(id)?.name || ("#" + id));
  return names.length ? names.join("、") : "未授权";
}
function firstVisiblePage() {
  return ["dashboard", "app", "package", "device", "account", "role"].find(canSeePage) || "dashboard";
}
function money(v) { return v > 0 ? "$" + Number(v).toFixed(2) : "-"; }
function num(v) { return Number(v || 0).toLocaleString(); }
function pct(a, b) { return b ? ((a / b) * 100).toFixed(1) + "%" : "0%"; }
function tag(id) { return `<button type="button" class="rule-tag" data-rule-id="${id}">${id}</button>`; }
function pageOf(list, current, size) {
  const start = (current - 1) * size;
  return { total: list.length, rows: list.slice(start, start + size) };
}
function pager(total, current, size, id) {
  const pages = Math.max(1, Math.ceil(total / size));
  return `<div class="pagination">共 ${total} 条
    <select data-page-size="${id}">${[10,20,50].map((n) => `<option value="${n}" ${Number(size)===n?"selected":""}>${n}条/页</option>`).join("")}</select>
    <button class="btn btn-small" data-page-to="${id}" data-to="${Math.max(1, current - 1)}">上一页</button>
    <span>${current} / ${pages}</span>
    <button class="btn btn-small" data-page-to="${id}" data-to="${Math.min(pages, current + 1)}">下一页</button>
  </div>`;
}
function searchableChecks(name, options, selected, valueKey, labelFn, filterId) {
  const sel = selected || [];
  const boxes = options.map((o) => `<label data-q="${(labelFn(o) + " " + o[valueKey]).toLowerCase()}"><input type="checkbox" name="${name}" value="${o[valueKey]}" ${sel.includes(o[valueKey]) ? "checked" : ""}>${labelFn(o)}</label>`).join("");
  return `<input class="filter-input" data-filter-box="${filterId}" placeholder="搜索后勾选"><div class="multi searchable" id="${filterId}">${boxes}</div><div class="hint">已选 ${sel.length} 项，可搜索勾选。${tag("R-022")}</div>`;
}
function bindSearchable(root) {
  root.querySelectorAll("[data-filter-box]").forEach((input) => {
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      root.querySelectorAll("#" + input.dataset.filterBox + " label").forEach((lab) => {
        lab.style.display = !q || lab.dataset.q.includes(q) ? "" : "none";
      });
    });
  });
}
function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.className = "toast show ok";
  setTimeout(() => { el.className = "toast"; }, 1800);
}
function closeOverlay() { $("overlay").className = "overlay"; $("overlay").innerHTML = ""; }
function openOverlay(html, wide, xl) {
  const el = $("overlay");
  el.className = "overlay show";
  el.innerHTML = `<div class="dialog${wide ? " wide" : ""}${xl ? " xl" : ""}">${html}</div>`;
}
function bindRuleClicks(root) {
  root.querySelectorAll("[data-rule-id]").forEach((el) => {
    el.addEventListener("click", (e) => { e.stopPropagation(); selectRule(el.getAttribute("data-rule-id"), "left"); });
  });
}
function selectRule(id, from) {
  document.querySelectorAll(".rule-card").forEach((c) => c.classList.toggle("active", c.getAttribute("data-rule-target") === id));
  document.querySelectorAll(".rule-tag").forEach((t) => t.classList.toggle("active", t.getAttribute("data-rule-id") === id));
  document.querySelectorAll(".hl").forEach((n) => n.classList.remove("hl"));
  const left = document.querySelector(`[data-rule-id="${id}"]`);
  if (left) left.closest("[data-rule-id], .field, .stat-card, .hint, tr, .section-card, .page-header")?.classList.add("hl");
  const right = document.getElementById("rule-" + id);
  if (from === "left" && right) right.scrollIntoView({ behavior: "smooth", block: "nearest" });
  if (from === "right" && left) left.scrollIntoView({ behavior: "smooth", block: "nearest" });
}
function checks(name, options, selected, valueKey, labelFn) {
  return options.map((o) => `<label><input type="checkbox" name="${name}" value="${o[valueKey]}" ${(selected || []).includes(o[valueKey]) ? "checked" : ""}>${labelFn(o)}</label>`).join("");
}
function deliveryStatus(pkg) {
  const apps = pkg.apps.map(appById).filter(Boolean);
  if (!apps.length) return { label: "未投放", cls: "warn" };
  if (pkg.state !== "启用") return { label: "已停用", cls: "mute" };
  const live = apps.filter((a) => a.state === "启用");
  if (!live.length) return { label: "未投放", cls: "warn" };
  if (live.length < apps.length) return { label: "部分投放", cls: "warn" };
  return { label: "投放中", cls: "ok" };
}
function copyText(text) {
  navigator.clipboard.writeText(text).then(() => toast("已复制")).catch(() => toast("已复制"));
}

function render() {
  const admin = $("adminShell");
  if (!state.loggedIn) {
    admin.style.display = "none";
    $("headerTitle").textContent = "登录";
    $("pageRoot").innerHTML = renderLogin();
    bindLogin();
    return;
  }
  admin.style.display = "";
  if (!canSeePage(state.page)) state.page = firstVisiblePage();
  document.querySelectorAll(".menu-item").forEach((m) => {
    const ok = canSeePage(m.dataset.page);
    m.style.display = ok ? "" : "none";
    m.classList.toggle("active", m.dataset.page === state.page);
  });
  $("headerTitle").textContent = titles[state.page];
  const acc = currentAccount();
  $("userToggle").textContent = (acc ? acc.username : state.username) + " ▾";
  const av = document.querySelector("#userMenu .avatar"); if (av) av.textContent = (acc?.username || "a").slice(0, 1);
  const chip = $("scopeChip"); if (chip) chip.textContent = acc ? (isAllScope() ? "全部投放" : ("指定投放 · " + scopeLabel(acc))) : "";
  const root = $("pageRoot");
  if (state.page === "dashboard") root.innerHTML = renderDashboard();
  if (state.page === "app") root.innerHTML = renderApps();
  if (state.page === "package") root.innerHTML = renderPackages();
  if (state.page === "device") root.innerHTML = renderDevices();
  if (state.page === "account") root.innerHTML = renderAccounts();
  if (state.page === "role") root.innerHTML = renderRoles();
  bindPageEvents(root);
  bindRuleClicks(root);
}
function renderLogin() {
  return `<div class="login-wrap"><div class="login-card">
    <div class="logo-mark" style="margin:0 auto 8px">A</div>
    <h2>AdControl</h2><p class="hint">管理后台</p>
    <label class="field">用户名<input id="loginUser" value="admin"></label>
    <label class="field">密码<input id="loginPwd" type="password" value="admin"></label>
    <div class="err" id="loginErr"></div>
    <button class="btn btn-primary" id="loginBtn">登录</button>
    <p class="hint" style="margin-top:12px;text-align:left">体验账号 ${tag("R-026")}<br>超管 <code>admin</code> 看全部投放<br>B2子账户 <code>b2ops</code> 只看 com.demo2b.app.b2<br>密码任意非空即可</p>
  </div></div>`;
}
function bindLogin() {
  $("loginBtn").onclick = () => {
    const u = $("loginUser").value.trim();
    const p = $("loginPwd").value;
    if (!u) return $("loginErr").textContent = "请输入用户名";
    if (!p) return $("loginErr").textContent = "请输入密码";
    const acc = state.accounts.find((a) => a.username === u);
    if (!acc) return $("loginErr").textContent = "用户名或密码错误";
    if (acc.status !== 1) return $("loginErr").textContent = "账户已停用";
    state.loggedIn = true;
    state.username = acc.username;
    state.currentAccountId = acc.id;
    state.page = firstVisiblePage();
    toast(isAllScope() ? "登录成功" : "登录成功，已按授权投放过滤数据");
    render();
  };
}
function dashSeries() {
  return [
    { key: "install", color: "#a855f7", pts: [18, 22, 19, 31, 28, 35, 33] },
    { key: "dau", color: "#3b82f6", pts: [40, 42, 38, 51, 49, 58, 55] },
    { key: "show", color: "#22c55e", pts: [12, 16, 14, 21, 18, 24, 22] },
    { key: "click", color: "#06b6d4", pts: [6, 8, 7, 11, 9, 14, 12] },
    { key: "pay", color: "#eab308", pts: [1, 2, 1, 3, 2, 4, 3] },
    { key: "connect", color: "#f97316", pts: [1, 2, 2, 3, 2, 4, 3] },
  ];
}
function csSeries() {
  return [
    { key: "show", color: "#22c55e", pts: [2, 3, 4, 6, 8, 7, 5] },
    { key: "click", color: "#06b6d4", pts: [1, 1, 2, 3, 4, 3, 2] },
    { key: "connect", color: "#f97316", pts: [0, 1, 1, 2, 3, 2, 1] },
  ];
}
function bSeries() {
  return [
    { key: "install", color: "#3b82f6", pts: [8, 9, 7, 12, 10, 14, 11] },
    { key: "show", color: "#22c55e", pts: [12, 16, 14, 21, 18, 24, 22] },
    { key: "click", color: "#06b6d4", pts: [6, 8, 7, 11, 9, 14, 12] },
    { key: "pay", color: "#eab308", pts: [1, 2, 1, 3, 2, 4, 3] },
  ];
}
function chartSvg(series, active) {
  const list = series || dashSeries();
  const flags = active || state.dash.metrics;
  const w = 760, h = 220, pad = 28;
  const vis = list.filter((item) => flags[item.key]);
  const max = Math.max(1, ...vis.flatMap((item) => item.pts));
  const path = (pts) => pts.map((v, i) => {
    const x = pad + i * ((w - pad * 2) / 6);
    const y = h - pad - (v / max) * (h - pad * 2);
    return (i ? "L" : "M") + x + " " + y;
  }).join(" ");
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${vis.map((item) => `<path d="${path(item.pts)}" fill="none" stroke="${item.color}" stroke-width="2.5"/>`).join("")}</svg>`;
}
function renderDashboard() {
  const apps = scopedAppList();
  const pkgs = scopedPackageList();
  const totalApps = apps.length;
  const activeApps = apps.filter((a) => a.state === "启用").length;
  const installs = apps.reduce((s, a) => s + appScopedStats(a).install, 0);
  const dau = apps.reduce((s, a) => s + a.dau, 0);
  const bPkgs = pkgs.filter((p) => p.type === "b" && p.state === "启用").length;
  const show = pkgs.reduce((s, p) => s + (p.show || 0), 0);
  const click = pkgs.reduce((s, p) => s + (p.click || 0), 0);
  const pay = pkgs.filter((p) => p.type === "b").reduce((s, p) => s + p.pay, 0);
  const csPkgs = pkgs.filter((p) => p.type === "cs");
  const csShow = csPkgs.reduce((sum, p) => sum + (p.show || 0), 0);
  const csClick = csPkgs.reduce((sum, p) => sum + (p.click || 0), 0);
  const csConnect = csPkgs.reduce((sum, p) => sum + (p.connect || 0), 0);
  const cards = [
    ["总应用数", totalApps], ["应用在架数", activeApps], ["总安装用户数", num(installs)], ["今日日活", num(dau)],
    ["当前在架B包", bPkgs], ["自有广告展示", show, "R-014"], ["自有广告点击", click], ["B包付费", pay.toFixed(2)],
  ];
  const metricBtns = [["install","安装","#a855f7"],["dau","日活","#3b82f6"],["show","展示","#22c55e"],["click","点击","#06b6d4"],["pay","付费","#eab308"],["connect","建联","#f97316"]]
    .map(([k,n,c]) => `<button class="metric-chip ${state.dash.metrics[k] ? "active" : ""}" data-metric="${k}"><span style="background:${c};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px"></span>${n}</button>`).join("");
  return `<div class="stat-grid eight">${cards.map((c) => `<div class="stat-card" ${c[2] ? `data-rule-id="${c[2]}"` : ""}><div class="label">${c[0]}${c[2] ? tag(c[2]) : ""}</div><div class="value">${c[1]}</div></div>`).join("")}</div>
    <div class="section-card" data-rule-id="R-023" style="margin-bottom:16px">
      <div class="section-title">客服建联 ${tag("R-023")}</div>
      <div class="kpi-mini">
        <div class="stat-card"><div class="label">展示</div><div class="value">${num(csShow)}</div></div>
        <div class="stat-card"><div class="label">点击</div><div class="value">${num(csClick)}</div><div class="sub">点击率 ${pct(csClick, csShow)}</div></div>
        <div class="stat-card"><div class="label">建联</div><div class="value">${num(csConnect)}</div><div class="sub">建联率 ${pct(csConnect, csClick)}</div></div>
      </div>
    </div>
    <div class="card trend-card"><div class="trend-head"><h4 style="margin:0">全局多指标趋势分析</h4>
      <div class="trend-controls"><input type="date" id="dashFrom" value="${state.dash.from}"><span class="hint">至</span><input type="date" id="dashTo" value="${state.dash.to}">
        <div class="gran-group">${["hour","day","week","month"].map((g) => `<button class="gran-btn ${state.dash.gran===g?"active":""}" data-gran="${g}">${{hour:"时",day:"日",week:"周",month:"月"}[g]}</button>`).join("")}</div>
      </div></div>
      <div class="metric-toggles">${metricBtns}</div>${chartSvg()}
      <p class="hint">同一白包可同时出应用拉活和客服建联。展示/点击含全部自有广告。付费只统计应用拉活。建联只统计客服建联，口径是机器人「立即联系」，不是点广告。指定投放账户只汇总授权投放。${tag("R-004")}${tag("R-014")}${tag("R-023")}${tag("R-026")}</p>
    </div>`;
}
function filteredApps() {
  return scopedAppList().filter((a) => {
    if (state.appQuery.state && a.state !== state.appQuery.state) return false;
    if (state.appQuery.kw && !(a.name + a.pkg).toLowerCase().includes(state.appQuery.kw.toLowerCase())) return false;
    return true;
  });
}
function renderApps() {
  const { total, rows } = pageOf(filteredApps(), state.appQuery.current, state.appQuery.size);
  const body = rows.map((a) => {
    const mix = appMix(a);
    const st = appScopedStats(a);
    return `<tr>
    <td>${a.id}</td><td><img class="thumb" src="${a.logo}" alt=""></td><td>${a.name}</td><td>${a.pkg}</td>
    <td><span class="tag ${mix.cls}">${mix.text}</span></td>
    <td class="freq">${freqText(a.n)}</td><td class="num">${num(st.install)}</td><td class="num">${num(a.dau)}</td>
    <td class="num">${num(st.show)}</td><td class="num">${num(st.click)}</td><td class="num">${money(st.pay)}</td>
    <td class="num">${num(st.connect)}</td>
    <td><span class="tag ${a.state === "启用" ? "ok" : "mute"}">${a.state}</span></td>
    <td><div class="btn-row">${hasPerm("app:save") && isAllScope() ? `<button class="btn btn-small" data-edit-app="${a.id}">编辑</button>` : ""}<button class="btn btn-small btn-primary" data-app-data="${a.id}">广告数据</button></div></td>
  </tr>`;
  }).join("");
  return `<div class="page-header"><h3>白包APP ${tag("R-004")}${tag("R-017")}${tag("R-026")}</h3>${hasPerm("app:save") && isAllScope() ? `<button class="btn btn-primary" id="addApp">新增白包APP</button>` : ""}</div>
    <div class="search-bar"><label class="field">状态<select id="appState"><option value="">全部</option><option value="启用">启用</option><option value="禁用">禁用</option></select></label>
      <label class="field">关键词<input id="appKw" placeholder="搜索APP名称/包名" value="${state.appQuery.kw}"></label>
      <button class="btn btn-primary" id="appSearch">搜索</button></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>Logo</th><th>APP名称</th><th>包名</th><th>关联投放 ${tag("R-004")}</th><th>频次 N ${tag("R-002")}</th><th>安装用户</th><th>日活</th><th>展示</th><th>点击</th><th>付费</th><th>建联 ${tag("R-023")}</th><th>状态</th><th>操作</th></tr></thead><tbody>${body}</tbody></table></div>
    ${pager(total, state.appQuery.current, state.appQuery.size, "app")}
    <p class="hint" data-rule-id="R-005">白包不再选自有广告类型。客服素材在「B包管理」配，白包只配 N 和 Adjust。同一白包可同时关联应用拉活和客服建联。${tag("R-004")}${tag("R-005")}${tag("R-025")}</p>`;
}
function filteredPackages() {
  return scopedPackageList().filter((p) => {
    if (state.pkgQuery.type && p.type !== state.pkgQuery.type) return false;
    if (state.pkgQuery.state && p.state !== state.pkgQuery.state) return false;
    if (state.pkgQuery.appId && !p.apps.includes(Number(state.pkgQuery.appId))) return false;
    if (state.pkgQuery.kw && !p.name.toLowerCase().includes(state.pkgQuery.kw.toLowerCase())) return false;
    return true;
  });
}
function renderPackages() {
  const { total, rows } = pageOf(filteredPackages(), state.pkgQuery.current, state.pkgQuery.size);
  const typeFilter = state.pkgQuery.type;
  const showInstallPay = typeFilter !== "cs";
  const showConnect = typeFilter !== "b";
  const body = rows.map((p) => {
    const st = deliveryStatus(p);
    const ads = state.materials.filter((m) => m.packageId === p.id);
    const adText = ads.length ? ads.map((m) => adLabel(m.adType)).join(" / ") : "未配置";
    return `<tr>
      <td>${p.id}</td><td><span class="tag ${p.type === "cs" ? "info" : "ok"}">${pkgTypeLabel(p.type)}</span></td>
      <td>${p.apps.map((id) => { const a = appById(id); return a ? `<span class="tag">${a.name}</span>` : ""; }).join("")}</td>
      <td><img class="thumb" src="${p.logo || THUMBS.empty}" alt=""></td><td>${p.name}</td>
      ${showInstallPay ? `<td class="num">${p.type === "cs" ? "-" : p.install}</td>` : ""}
      <td class="num">${p.show}</td><td class="num">${p.click}</td>
      ${showInstallPay ? `<td class="num">${p.type === "cs" ? "-" : money(p.pay)}</td>` : ""}
      ${showConnect ? `<td class="num">${p.type === "cs" ? num(p.connect || 0) : "-"}</td>` : ""}
      <td>${adText}</td><td><span class="tag ${st.cls}">${st.label}</span></td><td>${p.state}</td><td>${p.created}</td>
      <td><div class="btn-row">${hasPerm("package:save") ? `<button class="btn btn-small" data-edit-pkg="${p.id}">编辑</button>` : ""}<button class="btn btn-small btn-primary" data-pkg-data="${p.id}">广告数据</button><button class="btn btn-small btn-primary" data-ads-pkg="${p.id}">广告素材</button></div></td>
    </tr>`;
  }).join("");
  return `<div class="page-header"><h3>B包管理 ${tag("R-004")}${tag("R-005")}${tag("R-026")}</h3>${hasPerm("package:save") && isAllScope() ? `<button class="btn btn-primary" id="addPkg">新增投放</button>` : ""}</div>
    <div class="search-bar"><label class="field">应用<select id="pkgApp"><option value="">全部</option>${scopedAppList().map((a) => `<option value="${a.id}">${a.name}</option>`).join("")}</select></label>
      <label class="field">投放类型<select id="pkgType"><option value="">全部</option><option value="b">应用拉活</option><option value="cs">客服建联</option></select></label>
      <label class="field">状态<select id="pkgState"><option value="">全部</option><option>启用</option><option>停用</option></select></label>
      <label class="field">名称<input id="pkgKw" placeholder="搜索名称/包名" value="${state.pkgQuery.kw}"></label>
      <button class="btn btn-primary" id="pkgSearch">搜索</button></div>
    <p class="hint">同一白包可同时关联应用拉活和客服建联。筛选「客服建联」后只看展示/点击/建联。素材跳转填国家对应机器人，号池不在本后台。指定投放账户只显示授权投放。${tag("R-004")}${tag("R-023")}${tag("R-024")}${tag("R-026")}</p>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>投放类型</th><th>应用</th><th>Logo</th><th>名称/包名</th>${showInstallPay ? "<th>安装</th>" : ""}<th>展示</th><th>点击</th>${showInstallPay ? "<th>付费</th>" : ""}${showConnect ? `<th>建联 ${tag("R-023")}</th>` : ""}<th>广告素材</th><th>投放状态</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${body}</tbody></table></div>
    ${total ? pager(total, state.pkgQuery.current, state.pkgQuery.size, "pkg") : `<div class="empty">${isAllScope() ? "暂无投放" : "暂无授权投放，请联系管理员"}</div>`}`;
}

function filteredDevices() {
  const appIds = new Set(scopedAppList().map((a) => a.id));
  return state.devices.filter((d) => {
    if (!appIds.has(d.appId)) return false;
    if (state.deviceQuery.appId && d.appId !== Number(state.deviceQuery.appId)) return false;
    if (state.deviceQuery.brand && !d.brand.toLowerCase().includes(state.deviceQuery.brand.toLowerCase())) return false;
    if (state.deviceQuery.gaid && !d.gaid.toLowerCase().includes(state.deviceQuery.gaid.toLowerCase())) return false;
    if (state.deviceQuery.test === "test" && !d.test) return false;
    if (state.deviceQuery.test === "normal" && d.test) return false;
    const day = (d.created || "").slice(0, 10);
    if (state.deviceQuery.from && day < state.deviceQuery.from) return false;
    if (state.deviceQuery.to && day > state.deviceQuery.to) return false;
    return true;
  });
}
function renderDevices() {
  const { total, rows } = pageOf(filteredDevices(), state.deviceQuery.current, state.deviceQuery.size);
  const body = rows.map((d) => `<tr>
    <td>${d.id}</td><td><span class="copy" data-copy="${d.gaid}">${d.gaid}</span></td>
    <td>${appById(d.appId)?.name || "-"}</td><td>${d.brand}</td><td>${d.model}</td><td>${d.os}</td><td>${d.ip}</td><td>${d.created}</td>
    <td>${d.test ? `<span class="tag warn">测试设备</span>` : `<span class="tag mute">正式</span>`}</td>
    <td><div class="btn-row"><button class="btn btn-small" data-device-id="${d.id}">详情</button>
      <button class="btn btn-small ${d.test ? "btn-danger" : ""}" data-toggle-test="${d.id}">${d.test ? "取消测试" : "设为测试"}</button></div></td>
  </tr>`).join("");
  return `<div class="page-header"><h3>设备管理 ${tag("R-010")}${tag("R-019")}</h3></div>
    <p class="hint" data-rule-id="R-010">测试设备忽略国家、MCC、USB 调试和频次，直接展示出价最高的自有广告。</p>
    <div class="search-bar"><label class="field">应用<select id="devApp"><option value="">全部</option>${scopedAppList().map((a) => `<option value="${a.id}">${a.name}</option>`).join("")}</select></label>
      <label class="field">品牌<input id="devBrand" value="${state.deviceQuery.brand}" placeholder="搜索品牌"></label>
      <label class="field">GAID<input id="devGaid" value="${state.deviceQuery.gaid}" placeholder="搜索GAID"></label>
      <label class="field">测试设备<select id="devTest"><option value="">全部</option><option value="test">仅测试</option><option value="normal">非测试</option></select></label>
      <label class="field">开始日期<input id="devFrom" type="date" value="${state.deviceQuery.from}"></label>
      <label class="field">结束日期<input id="devTo" type="date" value="${state.deviceQuery.to}"></label>
      <button class="btn btn-primary" id="devSearch">搜索</button></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>GAID</th><th>应用</th><th>品牌</th><th>型号</th><th>系统版本</th><th>IP</th><th>创建时间</th><th>标记</th><th>操作</th></tr></thead><tbody>${body}</tbody></table></div>
    ${pager(total, state.deviceQuery.current, state.deviceQuery.size, "device")}`;
}
function filteredAccounts() {
  return state.accounts.filter((a) => {
    if (state.accountQuery.username && !a.username.includes(state.accountQuery.username)) return false;
    if (state.accountQuery.roleId && a.roleId !== Number(state.accountQuery.roleId)) return false;
    return true;
  });
}
function renderAccounts() {
  const { total, rows } = pageOf(filteredAccounts(), state.accountQuery.current, state.accountQuery.size);
  const body = rows.map((a) => `<tr>
    <td>${a.id}</td><td>${a.username}</td><td>${a.name}</td><td>${roleById(a.roleId)?.name || "-"}</td>
    <td class="wrap">${scopeLabel(a)}</td>
    <td><span class="tag ${a.status === 1 ? "ok" : "mute"}">${a.status === 1 ? "正常" : "停用"}</span></td>
    <td>${a.created}</td>
    <td><div class="btn-row"><button class="btn btn-small" data-edit-acc="${a.id}">编辑</button>
      <button class="btn btn-small" data-pwd-acc="${a.id}">改密</button>
      ${hasPerm("account:delete") ? `<button class="btn btn-small btn-danger" data-del-acc="${a.id}">删除</button>` : ""}</div></td>
  </tr>`).join("");
  return `<div class="page-header"><h3>账户管理 ${tag("R-020")}${tag("R-026")}</h3>${hasPerm("account:save") ? `<button class="btn btn-primary" id="addAcc">新增管理员</button>` : ""}</div>
    <p class="hint">角色管菜单和操作。数据范围挂在账户上：全部投放，或指定一个或多个 B 包/客服投放。子账户只能看授权投放的相关数据。${tag("R-026")}</p>
    <div class="search-bar"><label class="field">用户名<input id="accName" value="${state.accountQuery.username}" placeholder="搜索用户名"></label>
      <label class="field">角色<select id="accRole"><option value="">全部</option>${state.roles.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}</select></label>
      <button class="btn btn-primary" id="accSearch">搜索</button></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>用户名</th><th>姓名</th><th>角色</th><th>数据范围 ${tag("R-026")}</th><th>状态</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${body}</tbody></table></div>
    ${pager(total, state.accountQuery.current, state.accountQuery.size, "account")}`;
}
function permLabels(perms) {
  const set = new Set(perms.split(",").map((s) => s.trim()).filter(Boolean));
  const labels = [];
  PERM_GROUPS.forEach((g) => {
    if (set.has(g.module)) labels.push(g.label);
    g.children.forEach((c) => { if (set.has(c.key)) labels.push(c.label); });
  });
  return labels.map((l) => `<span class="tag">${l}</span>`).join("");
}
function renderRoles() {
  const body = state.roles.map((r) => `<tr>
    <td>${r.id}</td><td>${r.name}</td><td class="wrap">${permLabels(r.perms)}</td><td>${r.created}</td>
    <td><button class="btn btn-small" data-edit-role="${r.id}">编辑</button></td>
  </tr>`).join("");
  return `<div class="page-header"><h3>角色管理 ${tag("R-013")}${tag("R-020")}</h3><button class="btn btn-primary" id="addRole">新增角色</button></div>
    <div class="table-wrap"><table><thead><tr><th>ID</th><th>角色名称</th><th>权限标识</th><th>创建时间</th><th>操作</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function bindPageEvents(root) {
  const mapSel = [["#appState","appQuery","state"],["#pkgApp","pkgQuery","appId"],["#pkgType","pkgQuery","type"],["#pkgState","pkgQuery","state"],["#devApp","deviceQuery","appId"],["#devTest","deviceQuery","test"],["#accRole","accountQuery","roleId"]];
  mapSel.forEach(([sel, q, k]) => { const el = root.querySelector(sel); if (el) el.value = state[q][k]; });
  root.querySelector("#appSearch")?.addEventListener("click", () => { state.appQuery.state = root.querySelector("#appState").value; state.appQuery.kw = root.querySelector("#appKw").value.trim(); state.appQuery.current = 1; render(); });
  root.querySelector("#pkgSearch")?.addEventListener("click", () => { state.pkgQuery.appId = root.querySelector("#pkgApp").value; state.pkgQuery.type = root.querySelector("#pkgType").value; state.pkgQuery.state = root.querySelector("#pkgState").value; state.pkgQuery.kw = root.querySelector("#pkgKw").value.trim(); state.pkgQuery.current = 1; render(); });
  root.querySelector("#devSearch")?.addEventListener("click", () => { state.deviceQuery.appId = root.querySelector("#devApp").value; state.deviceQuery.brand = root.querySelector("#devBrand").value.trim(); state.deviceQuery.gaid = root.querySelector("#devGaid").value.trim(); state.deviceQuery.test = root.querySelector("#devTest").value; state.deviceQuery.from = root.querySelector("#devFrom").value; state.deviceQuery.to = root.querySelector("#devTo").value; state.deviceQuery.current = 1; render(); });
  root.querySelector("#accSearch")?.addEventListener("click", () => { state.accountQuery.username = root.querySelector("#accName").value.trim(); state.accountQuery.roleId = root.querySelector("#accRole").value; state.accountQuery.current = 1; render(); });
  root.querySelectorAll("[data-page-to]").forEach((b) => b.addEventListener("click", () => { const map = { app: "appQuery", pkg: "pkgQuery", device: "deviceQuery", account: "accountQuery" }; state[map[b.dataset.pageTo]].current = Number(b.dataset.to); render(); }));
  root.querySelectorAll("[data-page-size]").forEach((sel) => sel.addEventListener("change", () => { const map = { app: "appQuery", pkg: "pkgQuery", device: "deviceQuery", account: "accountQuery" }; const q = state[map[sel.dataset.pageSize]]; q.size = Number(sel.value); q.current = 1; render(); }));
  root.querySelectorAll("[data-gran]").forEach((b) => b.addEventListener("click", () => { state.dash.gran = b.dataset.gran; render(); }));
  root.querySelectorAll("[data-metric]").forEach((b) => b.addEventListener("click", () => { state.dash.metrics[b.dataset.metric] = !state.dash.metrics[b.dataset.metric]; render(); }));
  root.querySelector("#dashFrom")?.addEventListener("change", (e) => { state.dash.from = e.target.value; });
  root.querySelector("#dashTo")?.addEventListener("change", (e) => { state.dash.to = e.target.value; });
  root.querySelector("#addApp")?.addEventListener("click", () => openAppDialog());
  root.querySelector("#addPkg")?.addEventListener("click", () => openPkgDialog());
  root.querySelector("#addAcc")?.addEventListener("click", () => openAccountDialog());
  root.querySelector("#addRole")?.addEventListener("click", () => openRoleDialog());
  root.querySelectorAll("[data-edit-app]").forEach((b) => b.addEventListener("click", () => openAppDialog(Number(b.dataset.editApp))));
  root.querySelectorAll("[data-edit-pkg]").forEach((b) => b.addEventListener("click", () => openPkgDialog(Number(b.dataset.editPkg))));
  root.querySelectorAll("[data-ads-pkg]").forEach((b) => b.addEventListener("click", () => openAdsDialog(Number(b.dataset.adsPkg))));
  root.querySelectorAll("[data-app-data]").forEach((b) => b.addEventListener("click", () => openDataDialog(appById(Number(b.dataset.appData)))));
  root.querySelectorAll("[data-pkg-data]").forEach((b) => b.addEventListener("click", () => openDataDialog(null, pkgById(Number(b.dataset.pkgData)))));
  root.querySelectorAll("[data-device-id]").forEach((b) => b.addEventListener("click", () => openDeviceDetail(Number(b.dataset.deviceId))));
  root.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.copy)));
  root.querySelectorAll("[data-toggle-test]").forEach((b) => b.addEventListener("click", () => {
    const d = state.devices.find((x) => x.id === Number(b.dataset.toggleTest));
    const next = !d.test;
    if (!confirm(next ? `标记测试设备（GAID: ${d.gaid}）？测试设备将忽略国家/MCC/调试条件和频次，直接展示自有广告。` : `取消测试设备（GAID: ${d.gaid}）？`)) return;
    d.test = next; toast(next ? "已标记为测试设备" : "已取消测试设备"); render();
  }));
  root.querySelectorAll("[data-edit-acc]").forEach((b) => b.addEventListener("click", () => openAccountDialog(Number(b.dataset.editAcc))));
  root.querySelectorAll("[data-pwd-acc]").forEach((b) => b.addEventListener("click", () => openPwdDialog(Number(b.dataset.pwdAcc))));
  root.querySelectorAll("[data-del-acc]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm("确认删除？")) return;
    state.accounts = state.accounts.filter((a) => a.id !== Number(b.dataset.delAcc));
    toast("删除成功"); render();
  }));
  root.querySelectorAll("[data-edit-role]").forEach((b) => b.addEventListener("click", () => openRoleDialog(Number(b.dataset.editRole))));
}

function openAppDialog(id) {
  if (!isAllScope()) { toast("指定投放账户不能编辑白包全局配置"); return; }
  const app = appById(id) || { id: 0, name: "", pkg: "", type: "b", n: { open: 0, banner: 0, rewarded: 0 }, state: "启用", adjust: "", registerKey: "", payKey: "", firstPayKey: "", installKey: "", connectKey: "", store: "", logo: "", appId: "" };
  let logo = app.logo;
  openOverlay(`
    <div class="dialog-head"><strong>${app.id ? "编辑白包APP" : "新增白包APP"}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><div class="form-grid">
      <label class="field">APP名称<input id="fName" value="${app.name}"></label>
      <label class="field">包名<input id="fPkg" value="${app.pkg}"></label>
      <div class="field"><div class="field-label">Logo</div><div class="upload-box" id="fLogo">${logo ? `<img class="thumb" style="width:72px;height:72px" src="${logo}">` : "上传Logo"}</div></div>
      ${app.id ? `<label class="field">AppId<input value="${app.appId}" disabled></label>` : ""}
      <p class="hint full" data-rule-id="R-004">白包不再选自有广告类型。同一白包可同时关联应用拉活和客服建联，各广告位按出价竞争。${tag("R-004")}${tag("R-008")}</p>
      <div class="freq-row">
        <label class="field">开屏 N<input id="nOpen" type="number" min="0" value="${app.n.open}"></label>
        <label class="field">Banner N<input id="nBanner" type="number" min="0" value="${app.n.banner}"></label>
        <label class="field">激励 N<input id="nRewarded" type="number" min="0" value="${app.n.rewarded}"></label>
      </div>
      <p class="hint full">0=一直 AdMob；1=一直自有；5=每 5 次插 1 次。 ${tag("R-001")}${tag("R-003")}</p>
      <label class="field">AdjustToken ${tag("R-017")}<input id="fAdj" value="${app.adjust}"></label>
      <label class="field">注册事件Key<input id="fReg" value="${app.registerKey}"></label>
      <label class="field">付费事件Key<input id="fPay" value="${app.payKey}"></label>
      <label class="field">首充事件Key<input id="fFirst" value="${app.firstPayKey}"></label>
      <label class="field">B包安装事件Key ${tag("R-021")}<input id="fInstall" value="${app.installKey || ""}"></label>
      <label class="field">建联事件Key ${tag("R-025")}<input id="fConnect" value="${app.connectKey || ""}"></label>
      <label class="field full">商店地址<input id="fStore" value="${app.store || ""}"></label>
      <p class="hint full" id="adjHint">同一白包可同时产生应用拉活付费和客服建联。注册、付费、首充、B包安装、建联 Key 都要保留。号池不在本后台配置。 ${tag("R-017")}${tag("R-025")}</p>
      <label class="field">状态<select id="fState"><option>启用</option><option>禁用</option></select></label>
    </div><div class="err" id="appErr"></div></div>
    <div class="dialog-foot"><button class="btn btn-ghost" id="dlgCancel">取消</button><button class="btn btn-primary" id="dlgSave">确定</button></div>
  `);
  $("fState").value = app.state;
  $("fLogo").onclick = () => { logo = THUMBS.empty; $("fLogo").innerHTML = `<img class="thumb" style="width:72px;height:72px" src="${logo}">`; };
  $("dlgClose").onclick = $("dlgCancel").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  bindRuleClicks($("overlay"));
  $("dlgSave").onclick = () => {
    const name = $("fName").value.trim(); const pkg = $("fPkg").value.trim();
    if (!name) return $("appErr").textContent = "请输入APP名称";
    if (!pkg) return $("appErr").textContent = "请输入包名";
    const payload = { name, pkg, type: app.type || "b", logo: logo || THUMBS.empty, n: { open: Number($("nOpen").value) || 0, banner: Number($("nBanner").value) || 0, rewarded: Number($("nRewarded").value) || 0 }, adjust: $("fAdj").value.trim(), registerKey: $("fReg").value.trim(), payKey: $("fPay").value.trim(), firstPayKey: $("fFirst").value.trim(), installKey: $("fInstall").value.trim(), connectKey: $("fConnect").value.trim(), store: $("fStore").value.trim(), state: $("fState").value };
    if (app.id) Object.assign(app, payload);
    else state.apps.unshift({ id: nextId(state.apps), appId: "app_" + Date.now(), install: 0, dau: 0, show: 0, click: 0, pay: 0, connect: 0, ...payload });
    closeOverlay(); toast("保存成功"); render();
  };
}
function openPkgDialog(id) {
  if (!id && !isAllScope()) { toast("指定投放账户不能新增投放"); return; }
  if (id && !canAccessPackage(id)) { toast("无权限查看该投放"); return; }
  const pkg = pkgById(id) || { id: 0, type: "cs", name: "", apps: [], state: "启用", store: "", countries: [], mccs: [], logo: "" };
  const appChecks = state.apps.map((a) => `<label><input type="checkbox" name="app" value="${a.id}" ${pkg.apps.includes(a.id) ? "checked" : ""}>${a.name}</label>`).join("");
  let logo = pkg.logo;
  openOverlay(`
    <div class="dialog-head"><strong>${pkg.id ? "编辑投放" : "新增投放"}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><div class="form-grid">
      <label class="field full" data-rule-id="R-005"><div class="field-label">投放类型 ${tag("R-005")}</div>
        <select id="pType"><option value="b">应用拉活</option><option value="cs">客服建联</option></select></label>
      <label class="field full">关联白包<div class="multi stack" id="pApps">${appChecks}</div></label>
      <div class="field"><div class="field-label">Logo</div><div class="upload-box" id="pLogo">${logo ? `<img class="thumb" style="width:72px;height:72px" src="${logo}">` : "上传Logo"}</div></div>
      <label class="field full" id="nameField"></label>
      <label class="field full" id="storeField"></label>
      <div class="full" id="targetFields"></div>
      <label class="field">状态<select id="pState"><option>启用</option><option>停用</option></select></label>
    </div><div class="hint" id="pHint"></div><div class="err" id="pkgErr"></div></div>
    <div class="dialog-foot"><button class="btn btn-ghost" id="dlgCancel">取消</button><button class="btn btn-primary" id="dlgSave">确定</button></div>
  `);
  $("pType").value = pkg.type; $("pState").value = pkg.state === "禁用" ? "停用" : pkg.state;
  $("pLogo").onclick = () => { logo = THUMBS.empty; $("pLogo").innerHTML = `<img class="thumb" style="width:72px;height:72px" src="${logo}">`; };
  const syncType = () => {
    const cs = $("pType").value === "cs";
    $("nameField").innerHTML = cs ? `投放名称<input id="pName" placeholder="例如：客服-东南亚" value="${pkg.name}">` : `包名<input id="pName" placeholder="请输入包名" value="${pkg.name}">`;
    $("storeField").style.display = cs ? "none" : "flex";
    $("storeField").innerHTML = cs ? "" : `商店地址<input id="pStore" value="${pkg.store || ""}">`;
    $("targetFields").innerHTML = cs
      ? `<p class="hint">国家和 MCC 配在「广告素材」里。不同国家若机器人不同，拆成多条素材。${tag("R-006")}${tag("R-024")}</p>`
      : `<div class="field full"><div class="field-label">国家</div>${searchableChecks("pc", COUNTRIES, pkg.countries, "code", (c) => c.name + "(" + c.code + ")", "pkgCountries")}</div>
         <div class="field full"><div class="field-label">MCC(地区)</div>${searchableChecks("pm", MCCS, pkg.mccs, "mcc", (m) => m.label, "pkgMccs")}</div>`;
    $("pHint").textContent = "同一白包可同时关联应用拉活和客服建联。各广告位命中后按出价竞争，未命中回退 AdMob。";
    bindRuleClicks($("overlay"));
    bindSearchable($("overlay"));
  };
  syncType(); $("pType").onchange = syncType;
  $("dlgClose").onclick = $("dlgCancel").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  $("dlgSave").onclick = () => {
    const type = $("pType").value; const name = $("pName").value.trim();
    const apps = [...$("overlay").querySelectorAll('input[name="app"]:checked')].map((i) => Number(i.value));
    if (!name) return $("pkgErr").textContent = type === "cs" ? "请输入投放名称" : "请输入包名";
    if (!apps.length) return $("pkgErr").textContent = "请选择关联白包";
    const payload = { type, name, apps, state: $("pState").value, logo: logo || THUMBS.empty, store: type === "cs" ? "" : ($("pStore") ? $("pStore").value.trim() : ""), countries: type === "cs" ? [] : [...$("overlay").querySelectorAll('input[name="pc"]:checked')].map((i) => i.value), mccs: type === "cs" ? [] : [...$("overlay").querySelectorAll('input[name="pm"]:checked')].map((i) => i.value) };
    if (type === "b" && (!payload.countries.length || !payload.mccs.length)) return $("pkgErr").textContent = "请选择国家和 MCC";
    if (pkg.id) Object.assign(pkg, payload);
    else state.packages.unshift({ id: nextId(state.packages), install: 0, show: 0, click: 0, pay: 0, connect: 0, created: "2026-10-26 12:00:00", ...payload });
    closeOverlay(); toast("保存成功"); render();
  };
}

function openAdsDialog(pkgId) {
  if (!canAccessPackage(pkgId)) { toast("无权限查看该投放"); return; }
  const pkg = pkgById(pkgId);
  const list = state.materials.filter((m) => m.packageId === pkgId);
  const cs = pkg.type === "cs";
  const extraHead = cs ? `<th>展示</th><th>点击</th><th>建联 ${tag("R-023")}</th>` : "";
  const extraTail = cs ? `<th>国家 ${tag("R-006")}</th><th>MCC ${tag("R-007")}</th>` : "";
  const rows = list.map((m) => `<tr>
    <td>${adLabel(m.adType)}</td><td><img class="thumb" src="${m.source}" alt=""></td>
    ${cs ? `<td class="num">${num(m.show || 0)}</td><td class="num">${num(m.click || 0)}</td><td class="num">${num(m.connect || 0)}</td>` : ""}
    <td>${m.bid}</td>
    <td><span class="tag ${m.state === "启用" ? "ok" : "mute"}">${m.state}</span></td>
    <td><button class="btn btn-small" data-edit-ad="${m.id}">编辑</button><button class="btn btn-small btn-danger" data-del-ad="${m.id}">删除</button></td>
    <td class="wrap">${m.jump}</td>
    ${cs ? `<td class="wrap tags">${countryText(m.countries)}</td><td class="wrap tags">${mccText(m.mccs)}</td>` : ""}
  </tr>`).join("");
  const csSum = list.reduce((acc, m) => ({ show: acc.show + (m.show || 0), click: acc.click + (m.click || 0), connect: acc.connect + (m.connect || 0) }), { show: 0, click: 0, connect: 0 });
  openOverlay(`
    <div class="dialog-head"><strong>广告素材 - ${pkg.name}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><div class="page-header">
      <div class="hint">${cs ? "客服素材按国家 + MCC 匹配，未命中回退 AdMob。跳转只填 t.me 机器人，建联统计「立即联系」。" : "应用拉活素材沿用 B 包上的国家和 MCC 定向。"} ${tag("R-009")}${cs ? tag("R-023") : ""}</div>
      <button class="btn btn-primary" id="addAd">新增素材</button></div>
      ${cs ? `<div class="kpi-mini">
        <div class="stat-card"><div class="label">展示</div><div class="value">${num(csSum.show)}</div></div>
        <div class="stat-card"><div class="label">点击</div><div class="value">${num(csSum.click)}</div><div class="sub">点击率 ${pct(csSum.click, csSum.show)}</div></div>
        <div class="stat-card"><div class="label">建联</div><div class="value">${num(csSum.connect)}</div><div class="sub">建联率 ${pct(csSum.connect, csSum.click)}</div></div>
      </div>` : ""}
      ${list.length ? `<div class="table-wrap"><table><thead><tr><th>广告类型</th><th>素材</th>${extraHead}<th>出价</th><th>状态</th><th>操作</th><th>跳转URL</th>${extraTail}</tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="empty">暂无素材，该投放对应广告位将回退 AdMob</div>`}
    </div>`, true, cs);
  $("dlgClose").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  $("addAd").onclick = () => openAdForm(pkg);
  bindRuleClicks($("overlay"));
  $("overlay").querySelectorAll("[data-edit-ad]").forEach((b) => b.addEventListener("click", () => openAdForm(pkg, Number(b.dataset.editAd))));
  $("overlay").querySelectorAll("[data-del-ad]").forEach((b) => b.addEventListener("click", () => {
    if (!confirm("确认删除该物料？")) return;
    state.materials = state.materials.filter((m) => m.id !== Number(b.dataset.delAd));
    toast("删除成功"); openAdsDialog(pkg.id);
  }));
}
function openAdForm(pkg, id) {
  const m = state.materials.find((x) => x.id === id) || { id: 0, packageId: pkg.id, adType: "", source: "", jump: "", bid: 0, countries: [], mccs: [], state: "启用" };
  const cs = pkg.type === "cs";
  openOverlay(`
    <div class="dialog-head"><strong>${m.id ? "编辑素材" : "新增素材"} · ${pkgTypeLabel(pkg.type)}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><div class="form-grid">
      <label class="field">广告类型<select id="csType"><option value="">请选择</option>${AD_TYPES.map((t) => `<option value="${t.value}">${t.label}</option>`).join("")}</select></label>
      <label class="field">出价金额<input id="csBid" type="number" min="0" step="0.01" value="${m.bid}"></label>
      <div class="field"><div class="field-label">素材 ${tag("R-012")}</div><div class="upload-box" id="csUpload">${m.source ? `<img class="thumb" style="width:72px;height:72px" src="${m.source}">` : "上传素材"}</div></div>
      <label class="field">状态<select id="csState"><option>启用</option><option>禁用</option></select></label>
      <label class="field full">跳转URL<input id="csJump" placeholder="${cs ? "https://t.me/国家机器人，不要带 start 参数" : "Adjust 或商店跳转"}" value="${m.jump}"></label>
      ${cs ? `<div class="field full" data-rule-id="R-006"><div class="field-label">国家 ${tag("R-006")}</div>${searchableChecks("c", COUNTRIES, m.countries, "code", (c) => c.name + "(" + c.code + ")", "csCountries")}</div>
      <div class="field full" data-rule-id="R-007"><div class="field-label">MCC(地区) ${tag("R-007")}</div>${searchableChecks("mcc", MCCS, m.mccs, "mcc", (x) => x.label, "csMccs")}</div>` : `<p class="hint full">该应用拉活投放的国家和 MCC 在 B 包资料里，不在单条素材上。</p>`}
    </div><p class="hint">${cs ? "跳转必须是 t.me 机器人。客服号由机器人分配，不要填私人号或 WhatsApp。" : ""} ${tag("R-008")}${cs ? tag("R-024") : ""}</p><div class="err" id="csErr"></div></div>
    <div class="dialog-foot"><button class="btn btn-ghost" id="dlgBack">返回列表</button><button class="btn btn-primary" id="dlgSave">保存</button></div>
  `);
  $("csType").value = m.adType; $("csState").value = m.state;
  let source = m.source;
  $("csUpload").onclick = () => { source = THUMBS[$("csType").value || "empty"]; $("csUpload").innerHTML = `<img class="thumb" style="width:72px;height:72px" src="${source}">`; };
  $("dlgClose").onclick = $("dlgBack").onclick = () => openAdsDialog(pkg.id);
  bindRuleClicks($("overlay"));
  bindSearchable($("overlay"));
  $("dlgSave").onclick = () => {
    const adType = $("csType").value; const jump = $("csJump").value.trim(); const bid = Number($("csBid").value);
    const countries = cs ? [...$("overlay").querySelectorAll('input[name="c"]:checked')].map((i) => i.value) : [];
    const mccs = cs ? [...$("overlay").querySelectorAll('input[name="mcc"]:checked')].map((i) => i.value) : [];
    if (!adType) return $("csErr").textContent = "请选择广告类型";
    if (!source) return $("csErr").textContent = "请上传素材";
    if (!jump) return $("csErr").textContent = "请输入跳转URL";
    if (cs) {
      const okBot = /^https:\/\/t\.me\/[A-Za-z0-9_]{5,32}$/i.test(jump);
      if (!okBot) return $("csErr").textContent = "跳转必须是 https://t.me/机器人用户名，不能带 start，也不能填私人号或 WhatsApp";
    }
    if (cs && !countries.length) return $("csErr").textContent = "请选择国家";
    if (cs && !mccs.length) return $("csErr").textContent = "请选择MCC地区";
    if (Number.isNaN(bid) || bid < 0) return $("csErr").textContent = "出价不能小于 0";
    const payload = { packageId: pkg.id, adType, source, jump, bid, countries, mccs, state: $("csState").value };
    if (m.id) Object.assign(m, payload); else state.materials.push({ id: nextId(state.materials), show: 0, click: 0, connect: 0, ...payload });
    toast("保存成功"); openAdsDialog(pkg.id);
  };
}
function dataRows(cs) {
  if (cs) {
    return [
      { date: "2026-10-24", slot: "open", slotLabel: "开屏广告", show: 8, click: 3, connect: 1 },
      { date: "2026-10-25", slot: "banner", slotLabel: "Banner广告", show: 10, click: 6, connect: 4 },
      { date: "2026-10-26", slot: "rewarded", slotLabel: "激励视频", show: 0, click: 0, connect: 0 },
    ];
  }
  return [
    { date: "2026-10-24", slot: "open", slotLabel: "开屏广告", install: 12, dau: 20, show: 8, click: 3, pay: 0.4 },
    { date: "2026-10-25", slot: "banner", slotLabel: "Banner广告", install: 9, dau: 18, show: 11, click: 5, pay: 0.2 },
    { date: "2026-10-26", slot: "rewarded", slotLabel: "激励视频", install: 7, dau: 16, show: 5, click: 2, pay: 0.1 },
  ];
}
function openDataDialog(app, pkg, keepId) {
  if (pkg && !canAccessPackage(pkg.id)) { toast("无权限查看该投放"); return; }
  const targetApp = app || appById((pkg && pkg.apps[0]) || 0);
  const related = pkg && keepId == null && app == null ? [pkg] : scopedPackageList().filter((p) => p.apps.includes((targetApp || {}).id));
  const selected = pkgById(keepId) || pkg || related[0];
  const cs = selected && selected.type === "cs";
  const title = app ? `数据详情 - ${targetApp.name}` : `数据详情 - ${(selected || {}).name}`;
  const metricDefs = cs
    ? [["show","展示","#22c55e"],["click","点击","#06b6d4"],["connect","建联","#f97316"]]
    : [["install","安装","#3b82f6"],["show","展示","#22c55e"],["click","点击","#06b6d4"],["pay","付费","#eab308"]];
  const local = {
    slots: new Set(AD_TYPES.map((t) => t.value)),
    metrics: Object.fromEntries(metricDefs.map(([k]) => [k, true])),
  };
  const allRows = dataRows(cs);
  const sumOf = (rows) => rows.reduce((acc, r) => ({
    show: acc.show + (r.show || 0),
    click: acc.click + (r.click || 0),
    connect: acc.connect + (r.connect || 0),
    install: acc.install + (r.install || 0),
    pay: acc.pay + (r.pay || 0),
  }), { show: 0, click: 0, connect: 0, install: 0, pay: 0 });
  function visibleRows() { return allRows.filter((r) => local.slots.has(r.slot)); }
  function tableHtml() {
    const rows = visibleRows();
    if (!rows.length) return '<div class="empty">当前广告位没有数据</div>';
    const head = cs
      ? `<th>日期</th><th>广告位</th><th>展示</th><th>点击</th><th>建联 ${tag("R-023")}</th>`
      : `<th>日期</th><th>广告位</th><th>安装</th><th>日活</th><th>展示</th><th>点击</th><th>付费</th>`;
    const body = cs
      ? rows.map((r) => `<tr><td>${r.date}</td><td>${r.slotLabel}</td><td class="num">${r.show}</td><td class="num">${r.click}</td><td class="num">${r.connect}</td></tr>`).join("")
      : rows.map((r) => `<tr><td>${r.date}</td><td>${r.slotLabel}</td><td class="num">${r.install}</td><td class="num">${r.dau}</td><td class="num">${r.show}</td><td class="num">${r.click}</td><td class="num">${money(r.pay)}</td></tr>`).join("");
    return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function kpiHtml() {
    const sum = selected ? { show: selected.show || 0, click: selected.click || 0, connect: selected.connect || 0, install: selected.install || 0, pay: selected.pay || 0 } : sumOf(visibleRows());
    if (cs) {
      return `<div class="kpi-mini">
        <div class="stat-card"><div class="label">展示</div><div class="value">${num(sum.show)}</div></div>
        <div class="stat-card"><div class="label">点击</div><div class="value">${num(sum.click)}</div><div class="sub">点击率 ${pct(sum.click, sum.show)}</div></div>
        <div class="stat-card"><div class="label">建联</div><div class="value">${num(sum.connect)}</div><div class="sub">建联率 ${pct(sum.connect, sum.click)}</div></div>
      </div>`;
    }
    return `<div class="kpi-mini four">
      <div class="stat-card"><div class="label">安装</div><div class="value">${num(sum.install)}</div></div>
      <div class="stat-card"><div class="label">展示</div><div class="value">${num(sum.show)}</div></div>
      <div class="stat-card"><div class="label">点击</div><div class="value">${num(sum.click)}</div></div>
      <div class="stat-card"><div class="label">付费</div><div class="value">${money(sum.pay)}</div></div>
    </div>`;
  }
  openOverlay(`
    <div class="dialog-head"><strong>${title}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body">
      <div class="section-card" data-rule-id="R-018">
        <div style="display:flex;gap:16px;align-items:center;margin-bottom:10px"><span class="hint">事件关联投放</span>
          <select id="dataPkg">${related.map((p) => `<option value="${p.id}" ${selected && p.id===selected.id?"selected":""}>${p.name}（${pkgTypeLabel(p.type)}）</option>`).join("")}</select></div>
        <div class="hint">关联展示广告位（可多选筛选数据） ${tag("R-018")}</div>
        <div class="ad-cards">${AD_TYPES.map((t) => `<div class="ad-card selected" data-slot="${t.value}">${t.label}</div>`).join("")}</div>
      </div>
      <div id="dataKpi">${kpiHtml()}</div>
      <div class="filter-row"><div class="gran-group"><button class="gran-btn">时</button><button class="gran-btn active">日</button><button class="gran-btn">周</button><button class="gran-btn">月</button></div>
        <div class="date-row"><input type="date" value="2026-10-20"><span class="hint">至</span><input type="date" value="2026-10-26"><button class="btn btn-primary btn-small" id="dataRefresh">更新</button></div></div>
      <div id="dataTable">${tableHtml()}</div>
      <div class="card trend-card" style="margin-top:12px">
        <div class="trend-head"><h4 style="margin:0">趋势曲线</h4>
          <div class="metric-toggles">${metricDefs.map(([k,n,col]) => `<button class="metric-chip active" data-data-metric="${k}"><span style="background:${col};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:6px"></span>${n}</button>`).join("")}</div>
        </div>
        <div id="dataChart">${chartSvg(cs ? csSeries() : bSeries(), local.metrics)}</div>
      </div>
      <p class="hint">${cs ? "客服建联只统计展示、点击、建联。建联=用户在机器人里点击「立即联系」，不是点广告。" : "应用拉活统计安装、日活、展示、点击、付费。"} ${tag("R-014")}${tag("R-023")}</p>
    </div>`, false, true);
  const paint = () => {
    $("dataKpi").innerHTML = kpiHtml();
    $("dataTable").innerHTML = tableHtml();
    $("dataChart").innerHTML = chartSvg(cs ? csSeries() : bSeries(), local.metrics);
    bindRuleClicks($("overlay"));
  };
  $("dlgClose").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  $("overlay").querySelectorAll(".ad-card").forEach((c) => c.addEventListener("click", () => {
    c.classList.toggle("selected");
    const slot = c.dataset.slot;
    if (c.classList.contains("selected")) local.slots.add(slot); else local.slots.delete(slot);
    paint();
  }));
  $("overlay").querySelectorAll(".gran-btn").forEach((b) => b.addEventListener("click", () => { $("overlay").querySelectorAll(".gran-btn").forEach((x) => x.classList.remove("active")); b.classList.add("active"); }));
  $("overlay").querySelectorAll("[data-data-metric]").forEach((b) => b.addEventListener("click", () => {
    b.classList.toggle("active");
    local.metrics[b.dataset.dataMetric] = b.classList.contains("active");
    paint();
  }));
  $("dataRefresh").onclick = () => { paint(); toast("已按筛选更新"); };
  $("dataPkg")?.addEventListener("change", () => openDataDialog(targetApp, null, Number($("dataPkg").value)));
  bindRuleClicks($("overlay"));
}
function openDeviceDetail(id) {
  const d = state.devices.find((x) => x.id === id);
  const mcc = MCCS.find((m) => m.mcc === d.mcc);
  openOverlay(`
    <div class="dialog-head"><strong>设备详情</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body">
      <div class="section-card" data-rule-id="R-019"><div class="section-title">基本信息 ${tag("R-019")}</div>
        <div class="fields-grid">
          <div class="field-item"><span class="k">GAID</span><span class="copy" data-copy="${d.gaid}">${d.gaid}</span></div>
          <div class="field-item"><span class="k">激活时间</span><span>${d.created}</span></div>
          <div class="field-item"><span class="k">地区</span><span>${mcc ? mcc.label : d.mcc}</span></div>
          <div class="field-item"><span class="k">IP</span><span>${d.ip}</span></div>
          <div class="field-item"><span class="k">调试</span><span class="${d.usb ? "danger" : "ok-text"}">${d.usb ? "USB调试开启" : "正常"}</span></div>
          <div class="field-item"><span class="k">SIM卡</span><span class="${d.sim ? "ok-text" : "danger"}">${d.sim ? "真实SIM" : "无SIM/模拟"}</span></div>
        </div></div>
      <div class="section-card"><div class="section-title">设备硬件</div>
        <div class="fields-grid">
          <div class="field-item"><span class="k">品牌</span><span>${d.brand}</span></div>
          <div class="field-item"><span class="k">型号</span><span>${d.model}</span></div>
          <div class="field-item"><span class="k">系统版本</span><span>Android ${d.os}</span></div>
          <div class="field-item"><span class="k">CPU</span><span>${d.cpu}</span></div>
          <div class="field-item"><span class="k">分辨率</span><span>${d.resolution}</span></div>
          <div class="field-item"><span class="k">语言</span><span>${d.language}</span></div>
        </div></div>
      <div class="section-card"><div class="section-title">已安装应用</div><div class="app-tags">${d.apps.map((a) => `<span class="app-tag">${a}</span>`).join("")}</div></div>
      <p class="hint">${d.test ? "当前为测试设备，忽略国家/MCC/USB/频次。" : "正式设备按国家和 MCC 匹配。"} ${tag("R-010")}</p>
    </div>`, true);
  $("dlgClose").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  $("overlay").querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", () => copyText(b.dataset.copy)));
  bindRuleClicks($("overlay"));
}
function openAccountDialog(id) {
  const acc = state.accounts.find((a) => a.id === id) || { id: 0, username: "", name: "", roleId: 2, status: 1, scope: "pkg", packageIds: [] };
  const pkgChecks = state.packages.map((p) => `<label><input type="checkbox" name="scopePkg" value="${p.id}" ${(acc.packageIds || []).includes(p.id) ? "checked" : ""}>${p.name}（${pkgTypeLabel(p.type)}）</label>`).join("");
  openOverlay(`
    <div class="dialog-head"><strong>${acc.id ? "编辑管理员" : "新增管理员"}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><div class="form-grid">
      <label class="field">用户名<input id="aUser" value="${acc.username}" ${acc.id ? "disabled" : ""}></label>
      <label class="field">密码<input id="aPwd" type="password" placeholder="${acc.id ? "不修改请留空" : "请输入密码"}"></label>
      <label class="field">姓名<input id="aName" value="${acc.name}"></label>
      <label class="field">角色<select id="aRole">${state.roles.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}</select></label>
      <div class="field full" data-rule-id="R-026"><div class="field-label">数据范围 ${tag("R-026")}</div>
        <label class="inline"><input type="radio" name="scopeMode" value="all" ${acc.scope !== "pkg" ? "checked" : ""}>全部投放</label>
        <label class="inline"><input type="radio" name="scopeMode" value="pkg" ${acc.scope === "pkg" ? "checked" : ""}>指定投放</label>
        <div class="multi stack" id="scopePkgs" style="margin-top:8px">${pkgChecks}</div>
        <p class="hint">超级管理员必须全部投放。指定投放后只能看这些 B 包/客服投放及其关联白包、素材、设备、看板。</p>
      </div>
    </div><div class="err" id="accErr"></div></div>
    <div class="dialog-foot"><button class="btn btn-ghost" id="dlgCancel">取消</button><button class="btn btn-primary" id="dlgSave">保存</button></div>
  `, true);
  $("aRole").value = acc.roleId;
  const syncScope = () => {
    const role = roleById(Number($("aRole").value));
    const superAdmin = role?.name === "超级管理员";
    const radios = [...$("overlay").querySelectorAll('input[name="scopeMode"]')];
    radios.forEach((r) => { r.disabled = superAdmin; if (superAdmin) r.checked = r.value === "all"; });
    $("scopePkgs").style.opacity = (!superAdmin && radios.find((r) => r.checked)?.value === "pkg") ? "1" : ".45";
  };
  $("aRole").onchange = syncScope;
  $("overlay").querySelectorAll('input[name="scopeMode"]').forEach((r) => r.addEventListener("change", syncScope));
  syncScope();
  $("dlgClose").onclick = $("dlgCancel").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  bindRuleClicks($("overlay"));
  $("dlgSave").onclick = () => {
    if (!acc.id && !$("aUser").value.trim()) return $("accErr").textContent = "请输入用户名";
    if (!acc.id && !$("aPwd").value) return $("accErr").textContent = "请输入密码";
    if (!$("aRole").value) return $("accErr").textContent = "请选择角色";
    const role = roleById(Number($("aRole").value));
    const superAdmin = role?.name === "超级管理员";
    const scope = superAdmin ? "all" : ($("overlay").querySelector('input[name="scopeMode"]:checked')?.value || "all");
    const packageIds = [...$("overlay").querySelectorAll('input[name="scopePkg"]:checked')].map((i) => Number(i.value));
    if (scope === "pkg" && !packageIds.length) return $("accErr").textContent = "指定投放时请至少选择 1 个投放";
    const payload = { username: $("aUser").value.trim(), name: $("aName").value.trim(), roleId: Number($("aRole").value), scope, packageIds: scope === "pkg" ? packageIds : [] };
    if (acc.id) Object.assign(acc, payload); else state.accounts.push({ id: nextId(state.accounts), status: 1, created: "2026-10-27 12:00:00", ...payload });
    closeOverlay(); toast("保存成功"); render();
  };
}
function openPwdDialog(id) {
  const acc = state.accounts.find((a) => a.id === id);
  openOverlay(`
    <div class="dialog-head"><strong>修改密码 - ${acc.username}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><label class="field">新密码<input id="newPwd" type="password"></label><div class="err" id="pwdErr"></div></div>
    <div class="dialog-foot"><button class="btn btn-ghost" id="dlgCancel">取消</button><button class="btn btn-primary" id="dlgSave">确定</button></div>
  `);
  $("dlgClose").onclick = $("dlgCancel").onclick = closeOverlay;
  $("dlgSave").onclick = () => { if (!$("newPwd").value) return $("pwdErr").textContent = "请输入新密码"; closeOverlay(); toast("密码修改成功"); };
}
function openRoleDialog(id) {
  const role = state.roles.find((r) => r.id === id) || { id: 0, name: "", perms: "" };
  const set = new Set(role.perms.split(",").map((s) => s.trim()).filter(Boolean));
  const groups = PERM_GROUPS.map((g) => {
    const kids = g.children.map((c) => `<label><input type="checkbox" name="perm" value="${c.key}" ${set.has(c.key) || set.has(g.module) ? "checked" : ""} ${set.has(g.module) ? "disabled" : ""}>${c.label}</label>`).join("");
    return `<div class="perm-group"><label><input type="checkbox" name="mod" value="${g.module}" ${set.has(g.module) ? "checked" : ""}><strong>${g.label}</strong></label>
      <div class="perm-children">${kids || `<span class="hint">仅菜单可见性</span>`}</div></div>`;
  }).join("");
  openOverlay(`
    <div class="dialog-head"><strong>${role.id ? "编辑角色" : "新增角色"}</strong><button class="btn btn-ghost btn-small" id="dlgClose">关闭</button></div>
    <div class="dialog-body"><label class="field">角色名称<input id="rName" value="${role.name}"></label>
      <div class="field full"><div class="field-label">权限配置 ${tag("R-013")}</div><div class="perm-editor">${groups}</div></div>
      <div class="err" id="roleErr"></div></div>
    <div class="dialog-foot"><button class="btn btn-ghost" id="dlgCancel">取消</button><button class="btn btn-primary" id="dlgSave">保存</button></div>
  `);
  $("dlgClose").onclick = $("dlgCancel").onclick = closeOverlay;
  $("overlay").onclick = (e) => { if (e.target.id === "overlay") closeOverlay(); };
  bindRuleClicks($("overlay"));
  $("dlgSave").onclick = () => {
    if (!$("rName").value.trim()) return $("roleErr").textContent = "请输入角色名称";
    const mods = [...$("overlay").querySelectorAll('input[name="mod"]:checked')].map((i) => i.value);
    const perms = [...$("overlay").querySelectorAll('input[name="perm"]:checked')].map((i) => i.value);
    const all = [...new Set([...mods, ...perms])].join(",");
    if (role.id) { role.name = $("rName").value.trim(); role.perms = all; }
    else state.roles.push({ id: nextId(state.roles), name: $("rName").value.trim(), perms: all, created: "2026-10-26 12:00:00" });
    closeOverlay(); toast("保存成功"); render();
  };
}
document.querySelectorAll(".menu-item").forEach((m) => { m.addEventListener("click", () => { state.page = m.dataset.page; render(); }); });
document.querySelectorAll(".rule-card").forEach((card) => {
  card.addEventListener("click", () => selectRule(card.getAttribute("data-rule-target"), "right"));
  card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") selectRule(card.getAttribute("data-rule-target"), "right"); });
  card.tabIndex = 0;
});
$("userToggle").onclick = (e) => { e.stopPropagation(); $("userDrop").classList.toggle("show"); };
$("logoutBtn").onclick = () => { state.loggedIn = false; $("userDrop").classList.remove("show"); closeOverlay(); render(); };
$("switchAdmin") && ($("switchAdmin").onclick = (e) => { e.stopPropagation(); const acc = state.accounts.find((a) => a.username === "admin"); state.loggedIn = true; state.username = acc.username; state.currentAccountId = acc.id; state.page = "account"; $("userDrop").classList.remove("show"); toast("已切换为超管"); render(); });
$("switchB2") && ($("switchB2").onclick = (e) => { e.stopPropagation(); const acc = state.accounts.find((a) => a.username === "b2ops"); state.loggedIn = true; state.username = acc.username; state.currentAccountId = acc.id; state.page = "package"; $("userDrop").classList.remove("show"); toast("已切换为 B2 子账户"); render(); });
document.addEventListener("click", () => $("userDrop")?.classList.remove("show"));
render();











