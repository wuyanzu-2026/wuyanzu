(() => {
  const slots = ['开屏', 'Banner', '插屏', '激励'];
  const names = { B1: '星河互动', B2: '海岸游戏', B3: '青禾应用' };
  const modes = { random: '等概率随机', percent: '按概率分配', fixed: '固定顺序' };
  const metrics = [
    ['1,280', '96', '820', '460', '64.1%', '24', '37'],
    ['860', '54', '430', '430', '50.0%', '11', '18']
  ];
  const originalFrequency = [
    [[1, 5], [0, 2], [0, 3], [0, 0]],
    [[0, 2], [0, 1], [1, 4], [0, 2]]
  ];
  const apps = [
    { name: '晴空工具', packageName: 'com.demo.clear.sky', links: ['B1', 'B2', 'B3'] },
    { name: '远航乐园', packageName: 'com.demo.far.sail', links: ['B1', 'B2'] }
  ];
  apps.forEach((app, index) => {
    app.policies = slots.map((_, i) => ({
      introEnabled: true,
      intro: [{ code: 'B1', count: index ? '1' : '2' }, { code: 'B2', count: '1' }],
      interval: '3', mode: ['fixed', 'random', 'percent', 'fixed'][i],
      slotEnabled: true,
      candidates: [...app.links],
      shares: index ? { B1: '60', B2: '40' } : { B1: '70', B2: '30', B3: '0' },
      sequence: index ? ['B1', 'B2'] : ['B2', 'B3'],
      guard: DeliveryGuard.defaults()
    }));
  });
  const $ = id => document.getElementById(id);
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const label = code => code + ' · ' + names[code];
  const mark = id => '<button type="button" class="rule-mark" data-rule="' + id + '">' + id + '</button>';
  const editor = $('editor'), list = $('list'), body = $('mode-body'), introBody = $('intro-body');
  let appIndex = 0, slotIndex = 0, draft, activeRule;
  let previewStates = [], previewRows = [];
  const app = () => apps[appIndex];
  const policy = () => draft[slotIndex];
  const kinds = { B1: '游戏', B2: '客服建联', B3: '游戏' };
  const validate = config => DeliveryPolicy.validate(config, app().links)
    || (DeliveryGuard.validate(config.guard) ? { message: DeliveryGuard.validate(config.guard), target: 'guard-settings' } : null);
  const freshRuntime = () => ({ delivery: DeliveryPolicy.initial(), records: {}, now: Date.now() });

  function summary(config) {
    const intro = config.introEnabled ? config.intro.map(row => row.code + '×' + row.count).join(' → ') : '关闭';
    const allocation = config.mode === 'random' ? config.candidates.join('、')
      : config.mode === 'fixed' ? config.sequence.join(' → ')
      : Object.entries(config.shares).map(([code, value]) => code + ' ' + value + '%').join(' / ');
    return '先：' + intro + '；后：每 ' + config.interval + ' 次，' + modes[config.mode] + ' ' + allocation
      + '；未点击 ' + config.guard.lower + ' 次降频 / ' + config.guard.stop + ' 次暂停';
  }
  function renderList() {
    $('list-total').textContent = '共 ' + apps.length + ' 条';
    $('app-rows').innerHTML = apps.map((item, index) => '<tr><td>' + (101 + index) + '</td><td>'
      + (index === 1 ? '<span class="demo-logo" aria-label="模拟 Logo">远</span>' : '－') + '</td><td>' + item.name
      + '</td><td>' + item.packageName + '</td><td><span class="enabled">' + item.links.join('、') + '</span></td><td class="stat-summary">'
      + '<div class="ad-status-stack">' + item.policies.map((config, i) => {
        const enabled = config.slotEnabled !== false;
        return '<div class="ad-status-line"><i class="slot-mark ' + (enabled ? 'on' : 'off')
          + '" role="img" aria-label="' + slots[i] + (enabled ? '已开启' : '已关闭') + '">' + (enabled ? '✓' : '×')
          + '</i><b>' + slots[i] + '</b></div>';
      }).join('') + '</div></td><td class="strategy-button-cell"><button type="button" data-view-strategy="' + index
      + '" aria-label="查看' + item.name + '展示策略">查看策略</button>'
      + '</td>' + metrics[index].map(value => '<td class="retained-metric">' + value + '</td>').join('')
      + '<td><span class="enabled">启用</span></td><td><div class="row-actions"><button type="button" data-edit="'
      + index + '" aria-label="编辑' + item.name + '">编辑</button><button type="button" disabled>白包数据</button><button type="button" disabled>删除</button></div></td></tr>').join('');
  }
  let strategyTriggerIndex = 0;
  function openStrategy(index) {
    strategyTriggerIndex = index;
    const item = apps[index];
    $('strategy-dialog-title').textContent = item.name + ' · 展示策略';
    $('strategy-detail').innerHTML = item.policies.map((config, i) => {
      const guard = config.guard;
      const allocation = config.mode === 'fixed' ? config.sequence.join(' → ')
        : config.mode === 'random' ? config.candidates.join('、')
        : Object.entries(config.shares).map(([code, value]) => code + ' ' + value + '%').join(' / ');
      return '<section class="strategy-detail-slot"><h3><i class="slot-mark ' + (config.slotEnabled === false ? 'off' : 'on')
        + '" aria-hidden="true">' + (config.slotEnabled === false ? '×' : '✓') + '</i> ' + slots[i]
        + ' <small>' + (config.slotEnabled === false ? '关闭（保留配置）' : '开启') + '</small></h3><dl>'
        + '<dt>新用户先看</dt><dd>' + escape(config.introEnabled ? config.intro.map(row => row.code + ' 连续 ' + row.count + ' 次').join(' → ') : '不安排，直接执行后续策略') + '</dd>'
        + '<dt>后续间隔</dt><dd>每 ' + escape(config.interval) + ' 次广告，出 1 次 B 包，其余由 TopOn广告填充</dd>'
        + '<dt>分配方式</dt><dd>' + escape(modes[config.mode]) + '：' + escape(allocation) + '</dd>'
        + '<dt>未点击处理</dt><dd>' + escape(guard.lower) + ' 次：间隔×' + escape(guard.multiplier) + '，轮换素材；'
        + escape(guard.stop) + ' 次：暂停 ' + escape(guard.days) + ' 天。点击或到期清零恢复。</dd>'
        + '<dt>适用渠道</dt><dd>' + escape(guard.channels.join('、')) + '</dd>'
        + '<dt>TG 链接限制</dt><dd>仅本次客服广告实际跳转 Telegram 且确认未安装 TG 时，间隔×' + escape(guard.tgMultiplier)
        + '；其他链接或已安装 TG 时不应用。与未点击降频取更大倍数，不相乘。配置属于当前白包、当前广告位。</dd>'
        + '<dt>冷却补位</dt><dd>优先其他可用 B 包，没有可用的再展示 TopOn广告。</dd></dl></section>';
    }).join('');
    $('strategy-dialog').showModal();
    $('strategy-dialog').scrollTop = 0;
  }
  function closeStrategy() {
    $('strategy-dialog').close();
    list.querySelector('[data-view-strategy="' + strategyTriggerIndex + '"]')?.focus();
  }
  function clearHighlights() {
    document.querySelectorAll('.rule-highlight, .rule-mark.active').forEach(node => {
      node.classList.remove('rule-highlight', 'active');
    });
    document.querySelectorAll('.rule-card').forEach(node => node.setAttribute('aria-pressed', 'false'));
    activeRule = null;
  }
  function closeEditor(message = '') {
    clearHighlights();
    editor.hidden = true;
    $('editor-scrim').hidden = true;
    list.inert = false;
    $('admin-nav').inert = false;
    $('toast').textContent = message;
    $('toast').hidden = !message;
    renderList();
    list.querySelector('[data-edit="' + appIndex + '"]')?.focus();
  }
  function openEditor(index, focus = true) {
    clearHighlights();
    appIndex = index;
    draft = clone(app().policies);
    previewStates = slots.map(() => freshRuntime());
    previewRows = slots.map(() => []);
    $('toast').hidden = true;
    list.inert = true;
    $('admin-nav').inert = true;
    $('editor-scrim').hidden = false;
    editor.hidden = false;
    $('editor-context').textContent = app().name + ' · 下面的修改只影响当前选中的广告位。';
    const fields = [
      ['APP名称', app().name, '', true], ['Logo'], ['包名', app().packageName, '', true], ['AppId', 'demo-' + (index + 1)],
      ['TopOn应用ID', 'demo-topon', '可留空，同步时按包名自动映射'],
      ['AdjustToken', 'demo-adjust'], ['Adjust鉴权Token', '', '该包的出站 Bearer，留空则不带鉴权'],
      ['付费事件Key', 'demo-pay'], ['首充事件Key', 'demo-first-pay'],
      ['注册事件Key', '', '请输入RegisterEventKey'], ['安装事件Key', '', '白包 Adjust 安装事件 Token'],
      ['建联事件Key', '', '客服建联回传 Adjust 的事件 Token，留空则不回传']
    ];
    $('legacy-fields').innerHTML = fields.map(([name, value, placeholder, required]) => name === 'Logo'
      ? '<div class="legacy-upload"><span>Logo</span><div class="retained-logo">'
        + (index === 1 ? '<span class="demo-logo" aria-label="模拟已上传 Logo">远</span><button type="button" disabled>删除</button>'
          : '<button type="button" disabled>上传Logo</button>') + '</div></div>'
      : '<label><span>' + (required ? '<span class="required-mark" aria-hidden="true">*</span> ' : '') + name
        + '</span><input disabled' + (required ? ' required' : '') + ' value="' + escape(value)
        + '" placeholder="' + escape(placeholder || '') + '"></label>').join('');
    $('baseline-frequency').innerHTML = originalFrequency[index].map(([intro, interval], i) =>
      '<tr><td>' + slots[i] + '</td><td>' + intro + '</td><td>' + interval + '</td></tr>').join('');
    selectSlot(0);
    $('dialog-body').scrollTop = $('strategy').offsetTop - 8;
    if (focus) $('slot-tabs').querySelector('button').focus({ preventScroll: true });
  }
  function selectSlot(index) {
    slotIndex = index;
    $('slot-tabs').innerHTML = slots.map((name, i) => '<button type="button" data-slot="' + i
      + '" aria-pressed="' + (i === slotIndex) + '">' + name + '</button>'
      + '<label class="retained-switch"><input type="checkbox" role="switch" aria-label="' + name + '自有广告开关" checked disabled> 开启</label>')
      .map(row => '<div class="slot-overview-item">' + row + '</div>').join('');
    $('unavailable').checked = false;
    $('tg-target').value = 'telegram';
    renderSettings();
  }
  function options(selected = '') {
    return '<option value="">请选择 B 包</option>' + app().links.map(code => '<option value="' + code + '"'
      + (code === selected ? ' selected' : '') + '>' + label(code) + '</option>').join('');
  }
  function actions(group, index, length) {
    return '<div class="step-actions">' + [['up', '上移'], ['down', '下移'], ['remove', '删除']].map(([action, text]) =>
      '<button type="button" data-group="' + group + '" data-action="' + action + '" data-index="' + index
      + '" aria-label="' + text + (group === 'intro' ? '前段' : '固定顺序') + '第 ' + (index + 1) + ' 行"'
      + ((action === 'up' && index === 0) || (action === 'down' && index === length - 1) ? ' disabled' : '') + '>' + text + '</button>').join('') + '</div>';
  }
  function renderIntro() {
    const config = policy();
    $('intro-enabled').checked = config.introEnabled;
    introBody.hidden = !config.introEnabled;
    introBody.innerHTML = config.intro.map((row, i) => '<div class="custom-rule intro-row" data-intro-row="' + i
      + '"><div class="custom-rule-fields"><span class="sentence-prefix">' + (i === 0 ? '先看' : '再看')
      + '</span><label><span class="sr-only">展示哪个 B 包</span><select data-intro="' + i + '" data-field="code" aria-label="前段第 ' + (i + 1)
      + ' 行 B 包">' + options(row.code) + '</select></label><label class="times-field">连续展示 <input type="number" min="1" step="1" data-intro="'
      + i + '" data-field="count" aria-label="前段第 ' + (i + 1) + ' 行连续次数" value="' + escape(row.count) + '"> 次</label></div>'
      + actions('intro', i, config.intro.length) + '</div>').join('')
      + '<button type="button" id="add-intro">＋ 接着再看一个 B 包</button>';
    $('intro-help').textContent = config.introEnabled
      ? '按从上到下的顺序展示。看完后，自动使用下面的配置。'
      : '不安排新用户优先展示，直接使用下面的配置。';
  }
  function renderMode() {
    const config = policy();
    editor.elements.mode.value = config.mode;
    if (config.mode === 'random') {
      body.innerHTML = '<div class="mode-note"><p>勾选想展示的 B 包，每个被抽中的机会一样。</p>' + mark('R-003')
        + '</div><div class="random-candidates">' + app().links.map(code => '<label><input type="checkbox" data-candidate="' + code + '"'
          + (config.candidates.includes(code) ? ' checked' : '') + '> ' + label(code) + '</label>').join('') + '</div>';
    } else if (config.mode === 'percent') {
      body.innerHTML = '<div class="mode-note"><p>谁的百分比越大，越容易被抽中。填 0% 就不会出；合计须为 100%。不是每 10 次一定按比例出。</p>' + mark('R-004') + '</div>'
        + app().links.map(code => '<div class="percent-row"><span>' + label(code) + '</span><label><input type="number" min="0" max="100" step="0.01" data-share="'
          + code + '" aria-label="' + code + ' 出现概率" value="' + escape(config.shares[code]) + '">%</label></div>').join('')
        + '<div class="total" id="share-total"></div>';
    } else {
      body.innerHTML = '<div class="mode-note"><p>从上到下轮流出。比如 B2 → B3 → B2 → B3，重复下去。</p>' + mark('R-005') + '</div>'
        + config.sequence.map((code, i) => '<div class="fixed-row"><label>第 ' + (i + 1) + ' 项 <select data-sequence="' + i
          + '" aria-label="固定顺序第 ' + (i + 1) + ' 项">' + options(code) + '</select></label>' + actions('sequence', i, config.sequence.length) + '</div>').join('')
        + '<button type="button" id="add-sequence">＋ 添加 B 包</button>';
    }
  }
  function renderSettings() {
    $('interval').value = policy().interval;
    document.querySelectorAll('[data-guard]').forEach(node => node.value = policy().guard[node.dataset.guard]);
    document.querySelectorAll('[data-channel]').forEach(node => node.checked = policy().guard.channels.includes(node.dataset.channel));
    $('guard-package').innerHTML = app().links.map(code => '<option value="' + code + '">' + label(code) + '</option>').join('');
    renderIntro();
    renderMode();
    updatePreview(false);
    $('validation').hidden = true;
  }
  function invalidate() {
    previewStates[slotIndex] = freshRuntime();
    previewRows[slotIndex] = [];
    updatePreview(true);
  }
  function updatePreview(reset = false, advance = false) {
    const config = policy();
    const issue = validate(config);
    $('operator-title').textContent = app().name + ' · ' + slots[slotIndex] + '，用户会这样看到广告';
    $('operator-intro').textContent = config.introEnabled
      ? '刚开始：' + config.intro.map(row => (row.code || '未选 B 包') + ' 连续看 ' + (row.count || '？') + ' 次').join(' → ')
      : '刚开始：不单独安排，直接按下面的方式展示。';
    const interval = Number(config.interval);
    $('operator-example').textContent = DeliveryPolicy.positive(config.interval)
      ? '之后：' + (interval === 1 ? '每次都优先出 B 包。' : '先出 ' + (interval - 1) + ' 次TopOn广告，再出 1 次 B 包，一直重复。')
      : '之后：请填写下方的广告间隔。';
    $('operator-after').textContent = config.mode === 'fixed'
      ? '轮到 B 包时：' + (config.sequence.join(' → ') || '请添加 B 包') + '，按这个顺序循环。'
      : config.mode === 'random' ? '轮到 B 包时：从 ' + (config.candidates.join('、') || '待勾选的 B 包') + ' 中随机抽一个。'
      : '轮到 B 包时：' + app().links.map(code => code + ' 被抽中的概率 ' + (config.shares[code] || '？') + '%').join('；') + '。';
    $('operator-after').textContent += ' 未点击达到阈值时会降频；客服广告本次跳 TG 且未安装时也会降频。冷却的 B 包让给其他可用 B 包。';
    $('run').disabled = Boolean(issue);
    $('continue-preview').disabled = Boolean(issue);
    $('sequence').hidden = Boolean(issue);
    const total = $('share-total');
    if (total) {
      const sum = app().links.reduce((value, code) => value + (DeliveryPolicy.units(config.shares[code]) ?? 0), 0);
      total.textContent = '合计 ' + sum / 100 + '% / 100%';
      total.classList.toggle('bad', sum !== 10000);
    }
    if (issue) {
      $('preview-summary').textContent = '配置完成后可预览：' + issue.message;
      return;
    }
    if (reset) {
      previewStates[slotIndex] = freshRuntime();
      previewRows[slotIndex] = [];
    }
    if (advance || !previewRows[slotIndex].length) previewRows[slotIndex] =
      DeliveryGuard.preview(config, previewStates[slotIndex], config.guard, {
        kinds, targets: { B1: 'other', B2: $('tg-target').value, B3: 'other' },
        tg: $('tg-installed').checked, now: previewStates[slotIndex].now, unavailable: $('unavailable').checked
      });
    const rows = previewRows[slotIndex];
    $('preview-description').textContent = slots[slotIndex] + ' · 第 ' + rows[0].number + '–' + rows.at(-1).number + ' 次成功展示，包含TopOn广告广告';
    $('sequence').classList.add('complete-sequence');
    $('sequence').innerHTML = rows.map(row => '<li class="' + (row.code === 'TopOn广告' ? 'google' : '')
      + '"><small>第 ' + row.number + ' 次</small><b>' + row.code + '</b><small>'
      + (row.intro ? '前段优先' : '后续分配') + '</small><small>' + row.detail + '</small></li>').join('');
    const counts = [...app().links, 'TopOn广告'].map(code => code + ' ' + rows.filter(row => row.code === code).length + ' 次').join(' / ');
    $('preview-summary').textContent = counts + (config.mode !== 'fixed' ? ' · 本次为概率抽样结果' : '');
    renderGuardState();
  }
  function renderGuardState() {
    const runtime = previewStates[slotIndex];
    $('guard-state').innerHTML = app().links.map(code => {
      const record = runtime.records[code] ||= DeliveryGuard.state();
      const target = code === 'B2' ? $('tg-target').value : 'other';
      const status = DeliveryGuard.status(record, policy().guard, kinds[code], $('tg-installed').checked, runtime.now, target);
      return '<div>' + label(code) + ' · ' + kinds[code] + (code === 'B2' ? '（本次跳转' + (target === 'telegram' ? ' Telegram' : '其他链接') + '）' : '') + ' · 未点击 ' + record.misses + ' 次 · '
        + (status.cooling ? '冷却中，剩余 ' + Math.ceil((record.until - runtime.now) / 86400000) + ' 天'
          : status.factor > 1 ? '降频：间隔×' + status.factor : '正常')
        + ' · 素材 ' + (record.material + 1) + '</div>';
    }).join('');
  }
  function showValidation() {
    const error = validate(policy());
    $('validation').textContent = error?.message || '';
    $('validation').hidden = !error;
  }
  function locateRule(id, fromCard) {
    const rule = displayRules.find(item => item.id === id);
    if (fromCard && editor.hidden && !['R-007', 'R-009'].includes(id)) openEditor(appIndex, false);
    clearHighlights();
    activeRule = id;
    const modeInput = !editor.hidden && rule.mode && policy().mode !== rule.mode
      ? editor.querySelector('input[value="' + rule.mode + '"]') : null;
    const left = modeInput?.closest('label') || (editor.hidden ? list.querySelector('[data-rule="' + id + '"]')
      : id === 'R-009' ? $('form-actions') : $(rule.target));
    left?.classList.add('rule-highlight');
    $('card-' + id).setAttribute('aria-pressed', 'true');
    const region = editor.hidden ? list : editor;
    const badge = region.querySelector('[data-rule="' + id + '"]');
    badge?.classList.add('active');
    if (fromCard) {
      left?.scrollIntoView({ block: 'nearest' });
      (modeInput || badge)?.focus({ preventScroll: true });
    } else {
      $('card-' + id).scrollIntoView({ block: 'nearest' });
      $('card-' + id).focus({ preventScroll: true });
    }
  }
  $('rule-cards').innerHTML = displayRules.map(rule => '<button type="button" class="rule-card" id="card-' + rule.id
    + '" data-card="' + rule.id + '" aria-pressed="false">' + ruleMarkup(rule) + '</button>').join('');
  document.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button || button.disabled) return;
    const data = button.dataset;
    if (data.viewStrategy !== undefined) openStrategy(Number(data.viewStrategy));
    if (button.hasAttribute('data-close-strategy')) closeStrategy();
    if (data.edit !== undefined) openEditor(Number(data.edit));
    if (button.hasAttribute('data-back') || button.id === 'nav-app') closeEditor();
    if (data.slot !== undefined) { clearHighlights(); selectSlot(Number(data.slot)); }
    if (data.rule) locateRule(data.rule, false);
    if (data.card) locateRule(data.card, true);
    if (button.id === 'run') updatePreview(true);
    if (button.id === 'continue-preview') updatePreview(false, true);
    if (['simulate-click', 'advance-days', 'change-material'].includes(button.id)) {
      const runtime = previewStates[slotIndex], code = $('guard-package').value || app().links[0];
      const record = runtime.records[code] ||= DeliveryGuard.state();
      if (button.id === 'simulate-click') DeliveryGuard.result(record, policy().guard, kinds[code], true, runtime.now);
      if (button.id === 'advance-days') runtime.now += Number(policy().guard.days) * 86400000;
      if (button.id === 'change-material') record.material = (record.material + 1) % 3;
      renderGuardState();
    }
    if (button.id === 'add-intro') {
      policy().intro.push({ code: '', count: '' });
      renderIntro(); invalidate(); $('add-intro').focus();
    }
    if (button.id === 'add-sequence') {
      policy().sequence.push(''); renderMode(); invalidate(); $('add-sequence').focus();
    }
    if (data.action) {
      const values = policy()[data.group], index = Number(data.index);
      if (data.action === 'remove') values.splice(index, 1);
      else {
        const destination = index + (data.action === 'up' ? -1 : 1);
        [values[index], values[destination]] = [values[destination], values[index]];
      }
      if (data.group === 'intro') renderIntro(); else renderMode();
      invalidate();
      $(data.group === 'intro' ? 'add-intro' : 'add-sequence').focus();
    }
  });
  editor.addEventListener('input', event => {
    const node = event.target, data = node.dataset;
    if (data.guard) policy().guard[data.guard] = node.value;
    else if (data.intro !== undefined && data.field === 'count') policy().intro[Number(data.intro)].count = node.value;
    else if (data.share) policy().shares[data.share] = node.value;
    else if (node.id === 'interval') policy().interval = node.value;
    else return;
    invalidate(); showValidation();
  });
  editor.addEventListener('change', event => {
    const node = event.target, data = node.dataset;
    if (data.channel) policy().guard.channels = ['游戏', '客服建联'].filter(value =>
      value === data.channel ? node.checked : policy().guard.channels.includes(value));
    else if (node.id === 'tg-installed' || node.id === 'tg-target') {
      renderGuardState();
      $('preview-description').textContent += '；条件已变更，点“继续”查看后续结果，或重新模拟。';
      return;
    }
    else if (node.name === 'mode') {
      clearHighlights(); policy().mode = node.value; renderMode();
    } else if (node.id === 'intro-enabled') {
      policy().introEnabled = node.checked; renderIntro();
    } else if (data.intro !== undefined && data.field === 'code') policy().intro[Number(data.intro)].code = node.value;
    else if (data.sequence !== undefined) policy().sequence[Number(data.sequence)] = node.value;
    else if (data.candidate) policy().candidates = app().links.filter(code =>
      code === data.candidate ? node.checked : policy().candidates.includes(code));
    else if (node.id !== 'unavailable') return;
    invalidate(); showValidation();
  });
  editor.addEventListener('submit', event => {
    event.preventDefault();
    const slot = draft.findIndex(config => validate(config));
    if (slot !== -1) {
      selectSlot(slot);
      const error = validate(policy());
      showValidation();
      $('validation').textContent = slots[slot] + ' · ' + error.message;
      const target = error.row !== undefined ? introBody.querySelector('[data-intro-row="' + error.row + '"]') : $(error.target);
      target?.scrollIntoView({ block: 'nearest' });
      (target?.querySelector('select, input, button') || target)?.focus();
      return;
    }
    app().policies = clone(draft);
    closeEditor('已保存 ' + app().name + ' 的两段式展示策略（演示数据）。');
  });
  document.addEventListener('keydown', event => {
    if ($('strategy-dialog').open) return;
    if (event.key === 'Escape' && !editor.hidden) closeEditor();
    if (event.key === 'Tab' && !editor.hidden && !event.target.closest('.annotations')) {
      const controls = [...editor.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled)')].filter(node => node.offsetParent);
      const first = controls[0], last = controls.at(-1);
      if (!event.shiftKey && event.target === last) { event.preventDefault(); first?.focus(); }
      if (event.shiftKey && event.target === first) { event.preventDefault(); last?.focus(); }
    }
  });
  renderList();
})();

