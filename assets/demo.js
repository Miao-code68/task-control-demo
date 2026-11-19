/* 任务控制方式演示：工作流 / 状态机 / Agent
   场景：系统一呼用户（有报价场景）
   纯原生 JS，无外部依赖。所有时延与工具返回为教学模拟。 */
(function () {
  'use strict';

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const ABORT = { abort: true };
  let runId = 0;
  let runStart = 0;
  let busy = false;

  /* ---------------- 通用 ---------------- */

  function check(id) {
    if (id !== runId) throw ABORT;
  }

  async function wait(ms, id) {
    await sleep(ms);
    check(id);
  }

  function log(panel, msg, kind) {
    const box = document.getElementById(panel + '-log');
    if (!box) return;
    const t = ((performance.now() - runStart) / 1000).toFixed(1) + 's';
    const row = document.createElement('div');
    row.className = kind || 'info';
    const time = document.createElement('span');
    time.className = 't';
    time.textContent = t;
    const text = document.createElement('span');
    text.className = 'm';
    text.textContent = msg;
    row.appendChild(time);
    row.appendChild(text);
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function clearLog(panel) {
    const box = document.getElementById(panel + '-log');
    if (box) box.innerHTML = '';
  }

  function setDot(panel, live) {
    const dot = document.getElementById(panel + '-dot');
    if (dot) dot.classList.toggle('live', !!live);
  }

  function setButtons(disabled) {
    $$('.evt[data-event]').forEach((b) => { b.disabled = disabled; });
  }

  /* ---------------- 工作流 ---------------- */

  const wfState = () => document.getElementById('wf-state');
  const wfEl = (step) => $('.panel[data-panel="wf"] [data-step="' + step + '"]');
  const wfAll = () => $$('.panel[data-panel="wf"] [data-step]');

  function wfReset() {
    clearLog('wf');
    wfAll().forEach((el) => el.classList.remove('active', 'done', 'hit'));
    if (wfState()) wfState().textContent = '未开始';
    setDot('wf', false);
  }

  async function wfStep(step, label, ms, id, msg) {
    const el = wfEl(step);
    wfAll().forEach((n) => n.classList.remove('active'));
    if (el) el.classList.add('active');
    if (wfState()) wfState().textContent = label;
    log('wf', msg, 'step');
    await wait(ms, id);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
  }

  async function wfSide(step, label, ms, id, msg, kind) {
    const el = wfEl(step);
    if (el) el.classList.add('active');
    if (wfState()) wfState().textContent = label;
    log('wf', msg, kind || 'warn');
    await wait(ms, id);
    if (el) { el.classList.remove('active'); el.classList.add('done'); }
  }

  async function runWorkflow(evt, id) {
    wfReset();
    setDot('wf', true);
    log('wf', '工作流实例 CALL-WF-2088 启动', 'step');
    await wait(220, id);

    if (evt === 'normal') {
      await wfStep('open', 'S1 开场白', 520, id, 'S1 开场白：确认是否用车 → 用户确认');
      await wfStep('cargo', 'S2 资料补全', 560, id, 'S2 资料补全：家具 / 1.2 吨 / 2.4 方 / 木架 / 需装卸 / 不拼车 → 完成');
      await wfStep('raise', 'S3 引导加价', 560, id, 'S3 比价：¥780 低于线路均价 12% → 播放加价话术 A（+80 元）→ 用户同意');
      await wfStep('quote', 'S4 引导同意司机报价', 540, id, 'S4 司机报价 ¥860 → 用户同意');
      await wfStep('action', 'S5 强调立刻操作', 520, id, 'S5 引导在 APP 点击「同意报价」→ 已完成');
      await wfStep('keep', 'S6 不要取消订单', 500, id, 'S6 提示取消会影响司机接单与账号信用');
      await wfStep('end', 'S7 结束语', 460, id, 'S7 结束语：寒暄后挂机');
      if (wfState()) wfState().textContent = '流程结束（成单）';
      log('wf', '流程按 7 个节点顺序走完。', 'ok');
      return;
    }

    if (evt === 'refuse') {
      await wfStep('open', 'S1 开场白', 440, id, 'S1 开场白：确认是否用车 → 用户确认');
      await wfStep('cargo', 'S2 资料补全', 480, id, 'S2 资料补全：货物信息核对完成');
      const el = wfEl('raise');
      if (el) el.classList.add('active');
      if (wfState()) wfState().textContent = 'S3 引导加价';
      log('wf', 'S3 播第 1 条预设话术 A（+80 元）→ 用户拒绝', 'step');
      await wait(480, id);
      log('wf', 'S3 节点内切到第 2 条预设话术 B：提示「该线路今日运力紧张」→ 用户再次拒绝', 'warn');
      await wait(480, id);
      if (el) { el.classList.remove('active'); el.classList.add('hit'); }
      log('wf', 'S3 的预设话术已播完 → 按编排连线直接跳 S7，不再尝试其他方案', 'err');
      await wfStep('end', 'S7 结束语', 440, id, 'S7 结束语：寒暄后挂机（未成交）');
      if (wfState()) wfState().textContent = '流程结束（未成交）';
      return;
    }

    if (evt === 'question') {
      await wfStep('open', 'S1 开场白', 440, id, 'S1 开场白：确认是否用车 → 用户确认');
      const cargo = wfEl('cargo');
      if (cargo) cargo.classList.add('active');
      if (wfState()) wfState().textContent = 'S2 资料补全';
      log('wf', 'S2 资料补全：核对货物类型、重量、体积…', 'step');
      await wait(420, id);
      log('wf', '用户插话「为什么比上次贵？」→ 命中旁路「答疑」', 'event');
      await wfSide('faq', '旁路：答疑', 620, id, '答疑：知识库命中「价格构成」→ 播报标准答案（里程 + 装卸 + 等候）');
      log('wf', '回答完毕 → 回到 S2（返回节点在编排时写死）', 'info');
      if (cargo) { cargo.classList.remove('active'); cargo.classList.add('done'); }
      await wfStep('raise', 'S3 引导加价', 460, id, 'S3 加价话术 A → 用户同意');
      await wfStep('quote', 'S4 引导同意司机报价', 460, id, 'S4 司机报价 ¥860 → 用户同意');
      await wfStep('action', 'S5 强调立刻操作', 420, id, 'S5 引导 APP 同意报价 → 完成');
      await wfStep('keep', 'S6 不要取消订单', 400, id, 'S6 提示取消弊端');
      await wfStep('end', 'S7 结束语', 400, id, 'S7 结束语：寒暄后挂机');
      if (wfState()) wfState().textContent = '流程结束（成单）';
      return;
    }

    if (evt === 'complain') {
      await wfStep('open', 'S1 开场白', 420, id, 'S1 开场白：确认是否用车 → 用户确认');
      await wfStep('cargo', 'S2 资料补全', 420, id, 'S2 资料补全：货物信息核对完成');
      const raise = wfEl('raise');
      if (raise) raise.classList.add('active');
      if (wfState()) wfState().textContent = 'S3 引导加价';
      log('wf', 'S3 加价话术 A → 用户：「你们这价格太坑了，我要投诉！」', 'event');
      await wait(420, id);
      log('wf', '命中旁路「抱怨」→ 播放固定安抚话术（不判断投诉等级）', 'warn');
      await wfSide('grumble', '旁路：抱怨', 620, id, '抱怨：固定安抚 1 条，随后回到 S3');
      log('wf', '安抚后回到 S3，继续执行话术 A → 用户仍拒绝', 'warn');
      await wait(420, id);
      if (raise) { raise.classList.remove('active'); raise.classList.add('hit'); }
      log('wf', '继续话术 B → 仍拒绝 → 按预设跳到 S7', 'err');
      await wfStep('end', 'S7 结束语', 400, id, 'S7 结束语：寒暄后挂机（未成交）');
      if (wfState()) wfState().textContent = '流程结束（未成交）';
      return;
    }

    if (evt === 'silence') {
      await wfStep('open', 'S1 开场白', 420, id, 'S1 开场白：确认是否用车');
      const cargo = wfEl('cargo');
      if (cargo) cargo.classList.add('active');
      if (wfState()) wfState().textContent = 'S2 资料补全';
      log('wf', 'S2 资料补全：询问货物信息…', 'step');
      await wait(420, id);
      log('wf', '（客户沉默 5 秒）→ 命中旁路「沉默 / 兜底」', 'event');
      await wfSide('silence', '旁路：沉默 / 兜底', 560, id, '沉默兜底：播报固定唤醒话术「您还在吗？」');
      log('wf', '无响应 → 第 2 次固定唤醒', 'warn');
      await wait(500, id);
      if (cargo) { cargo.classList.remove('active'); cargo.classList.add('hit'); }
      log('wf', '仍无响应 → 按预设执行结束语并挂机', 'err');
      await wfStep('end', 'S7 结束语', 400, id, 'S7 结束语：挂机（未形成有效沟通）');
      if (wfState()) wfState().textContent = '流程结束（未成交）';
      return;
    }
  }

  /* ---------------- 状态机 ---------------- */

  const SM_TABLE = {
    START: [
      '确认用车 → CARGO',
      '沉默 → START（内部）',
      '意图未识别 → START（内部）',
      '投诉/辱骂 → END（道歉收尾）'
    ],
    CARGO: [
      '信息补全 → NEGOTIATE（放行条件：货物 6 项已补全）',
      '用户提问 → CARGO（内部）',
      '沉默 → CARGO（内部）',
      '意图未识别 → CARGO（内部）',
      '投诉/辱骂 → END（道歉收尾）'
    ],
    NEGOTIATE: [
      '同意加价 → END',
      '同意司机报价 → END',
      '拒绝加价 → NEGOTIATE（内部，放行条件：还有议价动作）',
      '不表态 → NEGOTIATE（内部，预期管理）',
      '沉默 → NEGOTIATE（内部）',
      '意图未识别 → NEGOTIATE（内部）',
      '投诉/辱骂 → END（道歉收尾）'
    ],
    END: ['— 终态（挂机后写回访记录）']
  };

  function smSet(state) {
    $$('.sm-wrap .node').forEach((n) => n.classList.remove('active', 'done', 'bad'));
    const node = $(`.sm-wrap .node[data-state="${state}"]`);
    if (node) node.classList.add(state === 'END' ? 'done' : 'active');
    const label = document.getElementById('sm-state');
    if (label) label.textContent = state;
    const allowed = document.getElementById('sm-allowed');
    if (allowed) {
      const items = SM_TABLE[state] || [];
      allowed.innerHTML = '<span class="lbl">当前状态允许的转移</span>';
      items.forEach((txt) => {
        const s = document.createElement('span');
        s.textContent = txt;
        allowed.appendChild(s);
      });
    }
  }

  function smReset() {
    clearLog('sm');
    $$('.sm-wrap .node').forEach((n) => n.classList.remove('active', 'done', 'bad'));
    const label = document.getElementById('sm-state');
    if (label) label.textContent = 'START';
    const allowed = document.getElementById('sm-allowed');
    if (allowed) allowed.innerHTML = '<span class="lbl">当前状态允许的转移</span><span>确认用车 → CARGO</span>';
    setDot('sm', false);
  }

  async function smGo(from, event, to, ms, id, note, kind) {
    const suffix = note ? '  · ' + note : '';
    log('sm', `${from} --${event}--> ${to}${suffix}`, kind || 'step');
    await wait(ms, id);
    smSet(to);
  }

  async function runStateMachine(evt, id) {
    smReset();
    setDot('sm', true);
    log('sm', '状态机启动：START（开场白）', 'info');
    await wait(280, id);

    if (evt === 'normal') {
      await smGo('START', '确认用车', 'CARGO', 520, id, '进入动作：立人设、说明来电目的');
      await smGo('CARGO', '信息补全', 'NEGOTIATE', 620, id, '放行条件：货物 6 项已补全');
      log('sm', '确认明细：家具 / 1.2 吨 / 2.4 方 / 木架 / 需装卸 / 不拼车 —— 6 项齐才放行', 'info');
      await wait(300, id);
      await smGo('NEGOTIATE', '同意加价', 'END', 620, id, 'S4–S6 折叠在议价状态内');
      log('sm', 'S3 引导加价（¥780→¥860，+9%）→ S4 引导同意司机报价 → S5 强调 APP 立刻操作 → S6 提示不要取消', 'info');
      await wait(320, id);
      log('sm', '这 4 步都不改变状态：状态机只认「还在议价 / 结束」，不认「走到第几步」。', 'ok');
      return;
    }

    if (evt === 'refuse') {
      await smGo('START', '确认用车', 'CARGO', 460, id, '');
      await smGo('CARGO', '信息补全', 'NEGOTIATE', 520, id, '放行条件：货物 6 项已补全');
      await smGo('NEGOTIATE', '拒绝加价', 'NEGOTIATE', 560, id, '内部转移；放行条件：还有议价动作');
      log('sm', '话术 A 被拒，仍在 NEGOTIATE，换话术 B', 'warn');
      await wait(380, id);
      log('sm', '检查放行条件：还有议价动作吗？没有', 'warn');
      await wait(420, id);
      log('sm', '条件不满足：自转移被拒绝，走默认兜底（友善结束）', 'err');
      smSet('END');
      log('sm', 'NEGOTIATE --条件不满足--> END（表外兜底）', 'warn');
      return;
    }

    if (evt === 'question') {
      await smGo('START', '确认用车', 'CARGO', 480, id, '');
      await smGo('CARGO', '用户提问', 'CARGO', 560, id, '内部转移；知识库命中→回答后回到当前状态');
      log('sm', '状态保持不变，继续补全资料，不会打断主线。', 'ok');
      await smGo('CARGO', '信息补全', 'NEGOTIATE', 520, id, '放行条件：货物 6 项已补全');
      await smGo('NEGOTIATE', '同意司机报价', 'END', 520, id, '');
      return;
    }

    if (evt === 'complain') {
      await smGo('START', '确认用车', 'CARGO', 440, id, '');
      await smGo('CARGO', '信息补全', 'NEGOTIATE', 500, id, '放行条件：货物 6 项已补全');
      log('sm', '事件「投诉/辱骂」到达：查全局转移', 'event');
      await wait(380, id);
      await smGo('NEGOTIATE', '投诉/辱骂', 'END', 560, id, '全局转移：任意状态 → 友善结束（道歉收尾）', 'warn');
      log('sm', '本次通话直接收尾，议价不再继续。', 'warn');
      return;
    }

    if (evt === 'silence') {
      await smGo('START', '确认用车', 'CARGO', 440, id, '');
      await smGo('CARGO', '沉默', 'CARGO', 560, id, '内部转移；进入动作：唤醒话术');
      log('sm', '状态不变，继续当前任务；连续沉默由状态内兜底动作处理。', 'ok');
      await smGo('CARGO', '信息补全', 'NEGOTIATE', 500, id, '放行条件：货物 6 项已补全');
      await smGo('NEGOTIATE', '同意加价', 'END', 500, id, '');
      return;
    }
  }

  /* ---------------- Agent ---------------- */

  const agState = () => document.getElementById('ag-state');

  const PL_NAMES = {
    order: '订单基础信息',
    im: 'IM 历史聊天记录',
    quote: '司机报价',
    price: '线路基准价',
    risk: '历史投诉标签',
    exp: '实验分组信息',
  };

  function agReset() {
    clearLog('ag');
    $$('#ag-preload .pl').forEach((p) => p.classList.remove('on'));
    $$('#ag-loop .stage').forEach((s) => s.classList.remove('active'));
    $$('#ag-tools .tool').forEach((t) => t.classList.remove('on'));
    if (agState()) agState().textContent = '待命';
    setDot('ag', false);
  }

  async function agStage(stage, label) {
    $$('#ag-loop .stage').forEach((s) => s.classList.remove('active'));
    const el = $(`#ag-loop .stage[data-stage="${stage}"]`);
    if (el) el.classList.add('active');
    if (agState()) agState().textContent = label;
  }

  async function agTool(name, label, ms, id, msg) {
    $$('#ag-tools .tool').forEach((t) => t.classList.remove('on'));
    const el = $(`#ag-tools .tool[data-tool="${name}"]`);
    if (el) el.classList.add('on');
    await agStage('act', '④ 调用：' + label);
    log('ag', 'tool.' + label + ' → ' + msg, 'step');
    await wait(ms, id);
    if (el) el.classList.remove('on');
  }

  async function agThink(msg, id) {
    await agStage('plan', '③ 思考决策');
    log('ag', '模型决策：' + msg, 'model');
    await wait(380, id);
  }

  /* 前置初始化：接通前一次性批量预取（不是对话内的工具调用） */
  async function agPreload(id) {
    if (agState()) agState().textContent = '前置初始化：批量预取';
    log('ag', '【前置初始化】通话接通前，批量预取上下文（非对话内工具调用）', 'info');
    for (const key of ['order', 'im', 'quote', 'price', 'risk', 'exp']) {
      const el = $(`#ag-preload .pl[data-pl="${key}"]`);
      if (el) el.classList.add('on');
      log('ag', '预取 ' + PL_NAMES[key], 'step');
      await wait(170, id);
    }
    log('ag', '预载完成：F-2088 上海→杭州 / 司机报价 ¥780 / 线路均价 ¥890 / 历史投诉 0 次 / 实验分组 B', 'ok');
    log('ag', '通话中原需调「查订单 / 查线路价 / 查司机报价」的三轮查询，已全部前移到初始化阶段', 'info');
    await wait(240, id);
  }

  /* 开场白：固定模板 + 预载数据填充，模型直接出音频（零工具调用） */
  async function agOpen(id) {
    await agStage('tts', '开场白（语音直出）');
    log('ag', '语音输出（S2S 直出）：您好，我是货拉拉助手。看到您发布的上海→杭州订单 F-2088（家具 1.2 吨），想跟您确认一下用车安排。', 'step');
    await wait(560, id);
  }

  /* 通话循环的一轮：语音直入 → 模型理解 → 边界自检 → 思考 → 工具 → 语音直出 */
  async function agRound(o) {
    await agStage('observe', '① 语音直入');
    if (o.user) log('ag', '语音输入（S2S 直入，无前置 ASR）：「' + o.user + '」', 'event');
    else log('ag', '语音输入：连续静默，无音频到达模型', 'event');
    log('ag', '模型理解：意图 = ' + o.intent + '（隐式，无独立 NLU 分类器）', 'event');
    await wait(320, o.id);

    await agStage('verify', '② 意图·边界自检');
    log('ag', '边界自检：' + o.smCheck, 'warn');
    await wait(300, o.id);

    await agThink(o.think, o.id);

    if (o.tools && o.tools.length) {
      for (const t of o.tools) await agTool(t[0], t[1], t[2], o.id, t[3]);
    } else {
      log('ag', '预载数据已足够，本轮零工具调用', 'ok');
      await wait(280, o.id);
    }

    await agStage('tts', '⑤ 语音直出');
    log('ag', '语音输出（模型直出音频）：' + o.tts, 'step');
    await wait(560, o.id);
  }

  /* 结束：结束语 → 挂机 → 会话落日志 */
  async function agClose(msg, id, label) {
    await agStage('tts', '结束语（语音直出）');
    log('ag', '语音输出（S2S 直出）：感谢您的接听，之后有需要随时在 APP 联系客服，祝您生意顺利，再见。', 'step');
    await wait(420, id);
    log('ag', '挂机。会话落日志：全程决策链、工具调用、边界自检已记录，可回放评测。', 'info');
    log('ag', '结果：' + msg, 'ok');
    if (agState()) agState().textContent = label || '任务完成';
  }

  async function runAgent(evt, id) {
    agReset();
    setDot('ag', true);
    log('ag', '任务启动：目标 = 在授权边界内促成订单 F-2088 成单', 'step');
    await wait(220, id);

    /* —— 阶段一：前置初始化（接通前，一次性执行）—— */
    await agPreload(id);

    /* —— 阶段二：通话交互（循环跑 Agent，直到 END）—— */
    await agOpen(id);

    if (evt === 'normal') {
      await agRound({ id,
        user: '行的，我正要找车',
        intent: '确认用车（accept）',
        smCheck: '用户确认用车 → 推进到货物沟通 ✔ 允许',
        think: '预载显示货物信息缺 2 项（需装卸 / 需木架），直接用预载数据补全，无需调工具',
        tts: '好的！帮您确认：家具 1.2 吨、2.4 方，需木架、需装卸、不拼车。当前司机报价 ¥780，您看可以吗？' });
      await agRound({ id,
        user: '780？现在就这点钱，司机愿意拉吗',
        intent: '嫌报价低 / 询价（negotiate）',
        smCheck: '用户进入议价 → 允许调价（司机报价已出）✔',
        think: '预载线路均价 ¥890，¥780 低 12%，司机大概率不接 → 建议 +80 到 ¥860；幅度 9% ≤ 授权上限 +15%',
        tools: [['reprice', '改价', 500, '调价 ¥780 → ¥860（+9%），司机侧已同步']],
        tts: '您的报价低于线路均价 12%，容易流单。已帮您调到 ¥860，今晚就能发车，可以吗？' });
      await agRound({ id,
        user: '行，那就 860，定了',
        intent: '同意报价（agree）',
        smCheck: '用户同意 → 达成结束条件 ✔',
        think: '立即锁价防止司机被别的订单抢走，同时推送 APP 让用户一键确认',
        tools: [['agree', '同意报价', 460, '已锁价 ¥860，订单进入待司机确认'], ['push', '推送APP', 400, 'APP 推送「立即确认」提醒']],
        tts: '已为您锁定 ¥860。请打开 APP 点击「同意报价」完成确认，发货前请尽量不要取消订单哦。' });
      await agClose('完成成单。3 轮对话、3 次工具调用，订单查询类调用全部被预载吸收。', id);
      return;
    }

    if (evt === 'refuse') {
      await agRound({ id,
        user: '加到 860？太贵了，不加',
        intent: '拒绝加价（refuse_raise）',
        smCheck: '拒绝加价 → 停留在议价；同一方案最多重试 1 次 ✔',
        think: '不重复同一套加价话术。换维度：预载显示该线路支持拼车 → 查知识库找替代方案',
        tools: [['kb', '查知识库', 460, '拼车方案：¥620 起，同线路不混装货物，今晚可发车']],
        tts: '理解您的顾虑。如果不介意拼车，有同线路拼车方案：¥620，您的家具单独木架固定，不混装别的货。' });
      await agRound({ id,
        user: '拼车会不会把我家具磕坏了？',
        intent: '顾虑 / 追问（faq）',
        smCheck: '用户提问 → 继续议价，不打断任务 ✔',
        think: '装卸与破损赔付是高频 FAQ，知识库有标准答复，直接引用',
        tools: [['kb', '查知识库', 440, '木架加固 + 装卸全程拍照留证，破损按平台规则赔付']],
        tts: '拼车同样做木架加固、装卸全程拍照留证，万一破损按平台规则赔付，凭证可在 APP 查看。' });
      await agRound({ id,
        user: '行吧，那就拼车',
        intent: '接受方案（agree）',
        smCheck: '用户同意 → 达成结束条件 ✔',
        think: '改单为拼车并锁价，一气呵成',
        tools: [['reprice', '改价', 440, '改为拼车单 ¥620'], ['quote', '查司机报价', 400, '拼车司机报价 ¥640'], ['agree', '同意报价', 420, '已锁价 ¥640']],
        tts: '已为您改为拼车单，司机报价 ¥640，请在 APP 点击确认，今晚发车。' });
      await agClose('被拒后换方案成交；同样的目标，走了和固定加价话术完全不同的路径。', id);
      return;
    }

    if (evt === 'question') {
      await agRound({ id,
        user: '为什么比上次贵了 60 块？',
        intent: '价格质疑（faq_price）',
        smCheck: '用户提问 → 继续当前任务，不结束 ✔',
        think: '预载的 IM 聊天记录里已有上次订单 ¥720 → 差额 = 等候费 ¥60，可直接回答，零工具调用',
        tts: '上次 ¥720 是没有装卸等候费的；这次您备注了需装卸，含 1 小时等候费 ¥60，所以是 ¥780。' });
      log('ag', '↑ 这一轮没有调用任何工具——预取把响应延迟压到最低。', 'info');
      await agRound({ id,
        user: '哦，是这么回事，那行',
        intent: '接受解释（accept）',
        smCheck: '用户接受 → 进入确认报价 ✔',
        think: '异议已消除，趁热推动锁价',
        tools: [['agree', '同意报价', 440, '已锁价 ¥780']],
        tts: '好的，价格保持 ¥780 不变。请打开 APP 点击「同意报价」完成确认。' });
      await agClose('解释清楚并成交，未额外让价；其中一轮零工具调用，体现预取价值。', id);
      return;
    }

    if (evt === 'complain') {
      await agRound({ id,
        user: '你们平台太坑了！我要投诉！',
        intent: '投诉 / 情绪激动（complain）',
        smCheck: '识别到投诉 → 必须转人工，禁止继续推销 ✔',
        think: '预载投诉标签：该用户历史投诉 1 次，升级风险高 → 按授权边界，投诉必须转人工，且不承诺赔付',
        tools: [['human', '转人工', 480, '已转交专线主管，自动附带订单 / 报价 / 对话摘要']],
        tts: '非常抱歉给您带来不好的体验。已为您转接专线主管，他那边能看到全部记录，您不用重复描述。' });
      await agRound({ id,
        user: '行，那我等着',
        intent: '等待转接（wait_human）',
        smCheck: '已转人工：等待接入，不再自动推进',
        think: '补发工单号和进度查询入口，降低二次投诉概率',
        tools: [['sms', '发短信', 400, '发送工单号 + 处理进度查询入口']],
        tts: '稍后您会收到一条短信，包含工单号和进度查询入口，感谢您的理解。' });
      await agClose('预载的投诉标签影响决策：直接转人工并带完整上下文，客户无需重复描述。', id, '已转人工');
      return;
    }

    if (evt === 'silence') {
      await agRound({ id,
        user: '',
        intent: '未识别（静默）',
        smCheck: '静默 → 继续等待，最多重试 2 次 ✔',
        think: '开场白后 5 秒无应答，可能信号差或在忙。换更短的话术重试一次，不重复长话术',
        tts: '喂？您在听吗？' });
      await agRound({ id,
        user: '',
        intent: '仍未识别（连续静默，重试达上限）',
        smCheck: '静默重试已达上限 → 结束通话 ✔',
        think: '不空耗通话时长，换通道触达：短信 + APP 推送，并标记待回访',
        tools: [['sms', '发短信', 440, '发送「订单还用车吗？」+ 客服入口'], ['push', '推送APP', 420, 'APP 弹窗提醒，标记「待回访」']],
        tts: '（无应答，系统挂机）' });
      await agClose('未识别语音，未强行续聊，转入待回访队列，多通道留触点。', id, '待回访');
      return;
    }
  }

  /* ---------------- 调度 ---------------- */

  function resetAll() {
    runId++;
    busy = false;
    setButtons(false);
    wfReset();
    smReset();
    agReset();
  }

  async function runAll(evt) {
    if (busy) return;
    busy = true;
    runId++;
    const id = runId;
    runStart = performance.now();
    setButtons(true);
    wfReset();
    smReset();
    agReset();

    try {
      await Promise.all([
        runWorkflow(evt, id),
        runStateMachine(evt, id),
        runAgent(evt, id)
      ]);
    } catch (e) {
      if (e !== ABORT) console.error(e);
    }

    if (id === runId) {
      setDot('wf', false);
      setDot('sm', false);
      setDot('ag', false);
      busy = false;
      setButtons(false);
    }
  }

  function init() {
    $$('.evt[data-event]').forEach((btn) => {
      btn.addEventListener('click', () => runAll(btn.dataset.event));
    });
    const reset = document.getElementById('resetBtn');
    if (reset) reset.addEventListener('click', resetAll);
    wfReset();
    smReset();
    agReset();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
