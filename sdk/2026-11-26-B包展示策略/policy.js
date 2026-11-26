const DeliveryPolicy = {
  positive(value) {
    return /^\d+$/.test(String(value)) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
  },
  units(value) {
    const number = Number(value);
    return String(value).trim() && Number.isFinite(number) && number >= 0 && number <= 100
      && Math.abs(number * 100 - Math.round(number * 100)) < 0.000001 ? Math.round(number * 100) : null;
  },
  validate(config, links) {
    if (config.introEnabled) {
      if (!config.intro.length) return { message: '请至少添加一条前段展示配置。', target: 'intro-settings' };
      for (let i = 0; i < config.intro.length; i++) {
        const row = config.intro[i];
        if (!links.includes(row.code)) return { message: '前段第 ' + (i + 1) + ' 行：请选择关联 B 包。', target: 'intro-settings', row: i };
        if (!this.positive(row.count)) return { message: '前段第 ' + (i + 1) + ' 行：连续次数必须是正整数。', target: 'intro-settings', row: i };
      }
    }
    if (!this.positive(config.interval)) return { message: '后续间隔必须填写正整数。', target: 'interval' };
    if (config.mode === 'random' && (!config.candidates.length || config.candidates.some(code => !links.includes(code))))
      return { message: '请勾选至少一个关联 B 包。', target: 'mode-body' };
    if (config.mode === 'percent') {
      const values = links.map(code => this.units(config.shares[code]));
      if (values.some(value => value === null)) return { message: '概率须为 0%–100%，最多两位小数。', target: 'mode-body' };
      if (values.reduce((sum, value) => sum + value, 0) !== 10000) return { message: '概率合计必须为 100%。', target: 'mode-body' };
    }
    if (config.mode === 'fixed' && (!config.sequence.length || config.sequence.some(code => !links.includes(code))))
      return { message: '请添加非空的关联 B 包展示顺序。', target: 'mode-body' };
    if (!['random', 'percent', 'fixed'].includes(config.mode)) return { message: '请选择后续分配方式。', target: 'mode-options' };
    return null;
  },
  initial() {
    return { introIndex: 0, introCount: 0, afterPosition: 0, sequenceIndex: 0, displayed: 0 };
  },
  begin(config, state, draw = Math.random()) {
    const ticket = { finished: false, code: 'TopOn广告', intro: false };
    if (config.introEnabled && state.introIndex < config.intro.length) {
      ticket.intro = true;
      ticket.code = config.intro[state.introIndex].code;
      ticket.detail = '前段第 ' + (state.introIndex + 1) + ' 行 · ' + (state.introCount + 1) + '/' + config.intro[state.introIndex].count;
      return ticket;
    }
    const interval = Number(config.interval);
    ticket.detail = '后段间隔 ' + (state.afterPosition + 1) + '/' + interval;
    if (state.afterPosition + 1 !== interval) return ticket;
    if (config.mode === 'random') ticket.code = config.candidates[Math.min(config.candidates.length - 1, Math.floor(draw * config.candidates.length))];
    if (config.mode === 'fixed') ticket.code = config.sequence[state.sequenceIndex % config.sequence.length];
    if (config.mode === 'percent') {
      const target = draw * 10000;
      let cumulative = 0;
      for (const [code, value] of Object.entries(config.shares)) {
        cumulative += this.units(value);
        if (target < cumulative) { ticket.code = code; break; }
      }
    }
    return ticket;
  },
  confirm(config, state, ticket, shown) {
    if (ticket.finished) return false;
    ticket.finished = true;
    if (!shown) return false;
    state.displayed++;
    if (ticket.intro) {
      if (shown === ticket.code) {
        state.introCount++;
        if (state.introCount >= Number(config.intro[state.introIndex].count)) {
          state.introIndex++;
          state.introCount = 0;
        }
      }
    } else {
      state.afterPosition = (state.afterPosition + 1) % Number(config.interval);
      if (ticket.code !== 'TopOn广告' && shown === ticket.code && config.mode === 'fixed') state.sequenceIndex++;
    }
    return true;
  },
  preview(config, state, unavailable, size = 12, random = Math.random) {
    return Array.from({ length: size }, () => {
      const ticket = this.begin(config, state, random());
      const shown = unavailable ? 'TopOn广告' : ticket.code;
      this.confirm(config, state, ticket, shown);
      return { number: state.displayed, code: shown, detail: ticket.detail
        + (shown !== ticket.code ? ' · 素材回退' : ''), intro: ticket.intro };
    });
  }
};

