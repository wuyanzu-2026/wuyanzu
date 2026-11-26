const DeliveryGuard = {
  defaults() {
    return { lower: '5', stop: '10', multiplier: '2', days: '7', tgMultiplier: '2', channels: ['游戏', '客服建联'] };
  },
  validate(config) {
    if (!DeliveryPolicy.positive(config.lower) || !DeliveryPolicy.positive(config.stop) || Number(config.stop) <= Number(config.lower))
      return '暂停次数必须大于降频次数，且两项必须为正整数。';
    if (!DeliveryPolicy.positive(config.days)) return '冷却天数必须为正整数。';
    if (![config.multiplier, config.tgMultiplier].every(v => String(v).trim() && Number.isFinite(Number(v)) && Number(v) >= 1))
      return '降频倍数必须大于或等于 1。';
    if (!config.channels.length || config.channels.some(v => !['游戏', '客服建联'].includes(v))) return '请选择至少一个现有渠道。';
    return '';
  },
  state() { return { misses: 0, until: 0, lastShown: null, material: 0 }; },
  status(record, settings, kind, tg, now) {
    if (record.until && now >= record.until) {
      record.misses = 0; record.until = 0; record.lastShown = null;
    }
    if (record.until > now) return { cooling: true, factor: 1 };
    return { cooling: false, factor: Math.max(
      settings.channels.includes(kind) && record.misses >= Number(settings.lower) ? Number(settings.multiplier) : 1,
      kind === '客服建联' && !tg ? Number(settings.tgMultiplier) : 1) };
  },
  result(record, settings, kind, clicked, now) {
    if (clicked) { record.misses = 0; record.until = 0; record.lastShown = null; return; }
    record.misses++;
    if (settings.channels.includes(kind) && record.misses >= Number(settings.lower)) record.material = (record.material + 1) % 3;
    if (settings.channels.includes(kind) && record.misses >= Number(settings.stop))
      record.until = now + Number(settings.days) * 86400000;
  },
  preview(config, runtime, settings, context, size = 12, random = Math.random) {
    return Array.from({ length: size }, () => {
      const state = runtime.delivery, records = runtime.records;
      const get = code => records[code] ||= this.state();
      const status = code => this.status(get(code), settings, context.kinds[code], context.tg, context.now);
      let skipped = '';
      while (config.introEnabled && state.introIndex < config.intro.length
        && status(config.intro[state.introIndex].code).cooling) {
        skipped += config.intro[state.introIndex].code + '冷却，跳过；';
        state.introIndex++; state.introCount = 0;
      }
      const ticket = DeliveryPolicy.begin(config, state, random());
      const original = ticket.code;
      let shown = original, note = skipped;
      if (original !== 'TopOn广告') {
        const originalStatus = status(original);
        if (originalStatus.cooling) {
          const candidates = config.mode === 'fixed' ? config.sequence
            : config.mode === 'random' ? config.candidates
            : Object.keys(config.shares).filter(code => Number(config.shares[code]) > 0);
          const eligible = candidates.filter(code => !status(code).cooling);
          if (config.mode === 'percent' && eligible.length) {
            const sum = eligible.reduce((value, code) => value + Number(config.shares[code]), 0);
            let target = random() * sum;
            shown = eligible.at(-1);
            for (const code of eligible) {
              target -= Number(config.shares[code]);
              if (target < 0) { shown = code; break; }
            }
          } else if (config.mode === 'fixed') {
            shown = 'TopOn广告';
            for (let offset = 1; offset <= config.sequence.length; offset++) {
              const code = config.sequence[(state.sequenceIndex + offset) % config.sequence.length];
              if (!status(code).cooling) { shown = code; break; }
            }
          } else shown = eligible.length ? eligible[Math.floor(random() * eligible.length)] : 'TopOn广告';
          note += original + '冷却 → ' + shown + '；';
        }
        if (shown !== 'TopOn广告') {
          const record = get(shown), current = status(shown);
          const base = ticket.intro ? 1 : Number(config.interval);
          if (current.factor > 1 && record.lastShown !== null
            && state.displayed + 1 - record.lastShown < Math.ceil(base * current.factor)) {
            shown = 'TopOn广告'; note += '降频补位；';
          } else if (context.unavailable) {
            shown = 'TopOn广告'; note += '素材不可用；';
          }
        }
      }
      DeliveryPolicy.confirm(config, state, ticket, shown);
      if (!ticket.intro && original !== shown && original !== 'TopOn广告' && status(original).cooling && config.mode === 'fixed')
        state.sequenceIndex++;
      if (shown !== 'TopOn广告') {
        const record = get(shown), current = status(shown);
        record.lastShown = state.displayed;
        note += current.factor > 1 ? '间隔×' + current.factor + '，素材' + (record.material + 1) + '；' : '';
        this.result(record, settings, context.kinds[shown], false, context.now);
        note += '未点击累计' + record.misses;
      }
      return { number: state.displayed, code: shown, detail: note + ' · ' + ticket.detail, intro: ticket.intro };
    });
  }
};
