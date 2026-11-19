# AI 外呼竞品与任务控制方式对比（可复制版）

> 用途：三类任务控制方式（工作流 / 状态机 / Agent）在外呼场景的产品调研与实测。
> 场景基准：订单 F-2088，上海→杭州，家具 1.2 吨，司机报价 ¥780，线路均价 ¥890。

---

## 一、竞品清单

门槛图例：
- 🟢 自助注册，有免费额度或试用，个人可跑通
- 🟡 需企业认证 / 申请试用（要联系销售或提交资质）
- 🔴 仅 Demo / 商务洽谈，不开放注册

### A 工作流型：流程由画布 / 编排决定

| 产品 | 官网 | 门槛 | 体验重点 |
|---|---|---|---|
| Twilio Studio | https://www.twilio.com/studio | 🟢 需信用卡 | 拖拽 Flow，看节点跳转如何写死 |
| Amazon Connect | https://aws.amazon.com/connect | 🟢 AWS 账号 | Contact Flow 画布 + Lambda 分支 |
| n8n | https://n8n.io | 🟢 开源可自部署 | 节点式编排，接 HTTP / 大模型都能连 |
| Make | https://www.make.com | 🟢 免费层 | 可视化自动化，理解“编排器”心智 |
| 腾讯云 HiFlow | https://hiflow.tencent.com | 🟢 有免费额度 | 国内低代码编排，连企业微信 / 表格 |
| 阿里云云工作流 FnF | https://www.aliyun.com/product/fnf | 🟡 需开通 | 国内托管工作流，有可视化执行图 |
| 阿里云云呼叫中心 | https://www.aliyun.com/product/ccc | 🟡 企业实名 + 号码 | 国内最典型的外呼流程编排 |
| 腾讯云云呼叫中心 | https://cloud.tencent.com/product/ccc | 🟡 企业认证 | 外呼任务 + 流程配置 |
| 火山引擎智能外呼 | https://www.volcengine.com | 🟡 企业认证 | 字节系外呼，流程 + 大模型混编 |
| 容联七陌 | https://www.7moor.com | 🟡 企业试用 | 呼叫中心 + 机器人流程 |
| 天润融通 | https://www.ti-net.com.cn | 🟡 企业试用 | 大型呼叫中心流程配置 |
| 合力亿捷 | https://www.hollycrm.com | 🟡 企业试用 | 客服 + 外呼一体化流程 |
| 智齿科技 | https://www.sobot.com | 🟡 企业试用 | 智能客服流程编排，外呼可演示 |

### B 状态机型：转移表 + 放行条件决定

| 产品 | 官网 | 门槛 | 体验重点 |
|---|---|---|---|
| Microsoft Copilot Studio | https://www.microsoft.com/microsoft-copilot/microsoft-copilot-studio | 🟢 免费试用 | Topic 触发短语 + 会话状态，最接近分层状态图 |
| Google Dialogflow CX | https://cloud.google.com/dialogflow | 🟢 有试用额度 | Flow + Page + 状态处理器，最标准的状态机式对话 |
| Amazon Lex | https://aws.amazon.com/lex | 🟢 AWS 账号 | Intent / Slot / Fulfillment 本质就是状态迁移 |
| Rasa | https://rasa.com | 🟢 开源本地跑 | stories / rules 就是写死的转移，能看代码 |
| Botpress | https://botpress.com | 🟢 免费层 | 流程 + 知识库混合，适合对照 |
| Voiceflow | https://www.voiceflow.com | 🟢 免费层 | 对话流程设计器，拖拽即见状态与跳转 |
| Stately Studio | https://stately.ai | 🟢 浏览器即用 | 纯状态机画图 + 仿真，配合 XState 看转移表 |
| 阿里云对话机器人 | https://www.aliyun.com/product/beebot | 🟡 企业开通 | 多轮对话的意图 - 槽位 - 状态 |
| 腾讯云 TBP | https://cloud.tencent.com/product/tbp | 🟡 企业开通 | 银行 / 政务常用的任务式对话 |
| 百度智能客服 | https://cloud.baidu.com | 🟡 企业认证 | 任务式多轮对话配置 |

### C Agent 型：模型运行时决定

**境外（自助注册为主）**

| 产品 | 官网 | 门槛 | 体验重点 |
|---|---|---|---|
| Retell AI | https://www.retellai.com | 🟢 送试用额度 | 语音 agent + function calling，最接近 demo 的 C 卡 |
| Vapi | https://vapi.ai | 🟢 送试用额度 | 工具调用、打断、日志都很透明 |
| Bland AI | https://www.bland.ai | 🟢 自助 | 电话 agent，主打可编程通话 |
| ElevenLabs Agents | https://elevenlabs.io/agents | 🟢 免费额度 | 端到端语音 + 工具，延迟体感最直接 |
| Synthflow | https://synthflow.ai | 🟢 试用 | 无代码搭语音 agent，模板多 |
| Lindy | https://www.lindy.ai | 🟢 免费额度 | 偏工作流式的 agent，适合看边界 |

**国内**

| 产品 | 官网 | 门槛 | 体验重点 |
|---|---|---|---|
| 阿里云百炼 | https://bailian.console.aliyun.com | 🟢 实名 + 免费额度 | 实时语音 + 智能体编排，国内最接近 S2S 体验 |
| 扣子 Coze | https://www.coze.cn | 🟢 免费 | 插件 / 工作流 / 智能体三种模式可直接对比 |
| 腾讯云智能体开发平台 ADP | https://cloud.tencent.com/product/adp | 🟢 可试用 | 知识库 + 工作流 + Agent 混编 |
| 火山引擎方舟 | https://www.volcengine.com/product/ark | 🟢 可开通 | 豆包模型 + 智能体，语音链路需另配 |
| Dify | https://dify.ai | 🟢 开源可自部署 | 工作流与 Agent 两种模式并存，适合做对照实验 |
| 讯飞开放平台 | https://www.xfyun.cn | 🟢 免费额度 | ASR / TTS / 大模型全套，适合自己拼链路 |
| 京东言犀 | https://yanxi.jd.com | 🟡 企业 | 电商场景外呼与数字人 |
| 硅基智能 | https://www.guiji.ai | 🟡 企业 | 数字人 + 外呼，话术工程化程度高 |
| 云蝠智能 | https://www.yunfuai.com | 🟡 企业 | 国内外呼机器人，偏中小客户 |
| 一知智能 | https://www.yizhi.ai | 🟡 企业 | 消费品牌外呼场景 |

### D 企业级：仅 Demo / 商务洽谈

| 产品 | 官网 | 类型 |
|---|---|---|
| Sierra | https://sierra.ai | Agent 客服 |
| Parloa | https://www.parloa.com | 语音 Agent |
| Decagon | https://www.decagon.ai | Agent 客服 |
| PolyAI | https://poly.ai | 语音 Agent |
| Cognigy | https://www.cognigy.com | 对话编排（已被 NiCE 收购） |
| Genesys | https://www.genesys.com | 全渠道联络中心 |
| Five9 | https://www.five9.com | 云呼叫中心 |
| NiCE CXone | https://www.nice.com | 联络中心 + 自动化 |
| Talkdesk | https://www.talkdesk.com | 云联络中心 |
| ASAPP | https://www.asapp.com | 企业客服 AI |
| Ada | https://www.ada.cx | 客服 Agent |
| Intercom Fin | https://www.intercom.com/fin | 客服 Agent |
| Cresta | https://cresta.com | 坐席辅助 |
| 华为云 AICC | https://www.huaweicloud.com | 智能客服 / 外呼 |

### 建议先跑的 10 个（都能自助注册）

1. Microsoft Copilot Studio —— 看状态图
2. Google Dialogflow CX —— 看 Flow / Page 状态机
3. Voiceflow —— 看拖拽式对话流程
4. Twilio Studio —— 看节点编排的“死板”
5. Retell AI —— 看语音 Agent 的工具调用
6. Vapi —— 看打断与延迟
7. ElevenLabs Agents —— 看端到端语音体感
8. 阿里云百炼 —— 国内语音 + 智能体
9. 扣子 Coze —— 免费对照三种模式
10. Dify —— 开源，可本地改代码验证边界

### 门槛提醒

- 境外平台注册多需信用卡验证（通常预扣 $1–10），没有外币卡会卡住。
- 国内平台基本要实名（个人身份证即可开通的大部分是模型平台，外呼号码另需企业资质）。
- 标 🔴 的不要花时间注册，直接看官网 Demo 视频或约演示。
- 所有“免费额度”以官网当期政策为准，可能随时调整。

---

## 二、体验方法

核心原则：**同一场景、同一套事件、同一张评分表**，否则跑三个平台只会得到三份不可比的印象。

### 2.1 统一场景

订单 F-2088，上海→杭州，家具 1.2 吨（2.4 方 / 木架 / 需装卸 / 不拼车），司机报价 ¥780，线路均价 ¥890，目标：说服用户接受加价至 ¥860 并在 APP 完成操作。

### 2.2 六事件测试集

| # | 事件 | 你说什么 | 观察什么 |
|---|---|---|---|
| 1 | 正常成单 | 确认用车 → 接受加价 → 说已在 APP 点完 | 能否走到成功收尾并推送司机 |
| 2 | 连续拒绝加价 | 连说 3 次“太贵了，不加” | 第 4 次是否还能继续谈；何时走兜底 |
| 3 | 中途插问 | “拼车会不会把我家具磕坏？” | 答完是回原环节，还是直接跳下一步 |
| 4 | 抱怨投诉 | “你们上次就迟到，我要投诉” | 固定话术收尾，还是带上下文转人工 |
| 5 | 沉默 / 打断 | 沉默 5 秒；或在它说话时插话 | 重述次数上限；打断处理是否自然 |
| 6 | 要求转人工 | “给我转人工” | 是否携带订单号、议价轮次、投诉标签 |

### 2.3 建议体验顺序（一天可跑完）

1. Microsoft Copilot Studio —— 最快看到状态与转移
2. Twilio Studio 或 阿里云云呼叫中心 —— 看到节点图的“死板”
3. Retell AI 或 阿里云百炼 —— 看到自由度与不可预测性

---

## 三、对比指标

| # | 指标 | 怎么测 | 工作流 | 状态机 | Agent |
|---|---|---|---|---|---|
| 1 | 谁决定下一步 | 看配置界面：节点连线 / 转移表 / prompt | 编排者 | 转移表 | 模型 |
| 2 | 未预定义输入覆盖率 | 提 10 个没写进流程的问题，看答上几个 | 低 | 中 | 高 |
| 3 | 输出一致性 | 同一句话问 10 次，看是否同样回答 | 高 | 高 | 低（有方差） |
| 4 | 可审计性 | 看日志能否回放“为什么走这一步” | 节点级 | 状态级 | 需额外埋点 |
| 5 | 改造成本 | 加一个“用户问运费谁出”要改几处 | 加节点 + 连线 | 加转移 + 话术 | 改 prompt |
| 6 | 冷启动速度 | 从注册到跑通 6 事件的时间 | 慢 | 中 | 快 |
| 7 | 工具调用能力 | 能否查订单、改价、发短信 | 节点内置 | 动作绑定 | function calling |
| 8 | 首包延迟 / 打断 | 掐表；说到一半打断它 | 低延迟易做 | 低延迟易做 | S2S 更低，但打断更难 |
| 9 | 异常兜底 | 沉默 / 辱骂 / 超时的默认行为 | 预设 | 预设 | 需护栏 |
| 10 | 合规与风控 | 话术审核、禁语、录音、授权边界 | 强 | 强 | 弱，需外挂 |
| 11 | 成本结构 | 按分钟 / 按坐席 / 按 token | 分钟 | 分钟 / 坐席 | token + 语音 |
| 12 | 转人工质量 | 是否带上下文、是否知道在聊什么 | 仅标记 | 带状态 | 带摘要 |

### 权重建议

- 外呼量大、话术要过合规审核：第 1、4、10 项权重最高。
- 长尾咨询多、要处理没预想到的问题：第 2、7、12 项权重最高。

---

## 四、评分表模板（1–5 分）

| # | 指标 | 权重 | 工作流 | 状态机 | Agent | 备注 |
|---|---|---|---|---|---|---|
| 1 | 谁决定下一步 | | | | | |
| 2 | 未预定义输入覆盖率 | | | | | |
| 3 | 输出一致性 | | | | | |
| 4 | 可审计性 | | | | | |
| 5 | 改造成本 | | | | | |
| 6 | 冷启动速度 | | | | | |
| 7 | 工具调用能力 | | | | | |
| 8 | 首包延迟 / 打断 | | | | | |
| 9 | 异常兜底 | | | | | |
| 10 | 合规与风控 | | | | | |
| 11 | 成本结构 | | | | | |
| 12 | 转人工质量 | | | | | |
| — | **加权总分** | | | | | |

---

## 五、结论

- 工作流、状态机胜在稳定与可审计，适合话术强合规、路径可穷举的场景。
- Agent 胜在覆盖长尾与冷启动快，但一致性、可审计、合规需要额外工程投入。
- 真实外呼几乎没有纯 Agent：常见形态是「工作流 / 状态机兜底 + Agent 处理开放表达」的混合。
