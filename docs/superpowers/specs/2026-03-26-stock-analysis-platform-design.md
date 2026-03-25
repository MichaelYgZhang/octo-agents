# 股票分析平台设计文档

## 概述

基于多Agent协作的自动化股票分析平台，每日自动采集数据、执行多维度分析、生成研究报告，并通过静态网站展示结果。

## 核心设计理念

- **Agent扁平协作**：所有Agent对等，通过消息队列动态组队
- **自动化闭环**：定时触发 → 数据采集 → 多维分析 → 报告生成 → 结果推送
- **静态优先**：GitHub Pages托管，数据存储在仓库中，无需后端服务器
- **渐进式智能**：核心分析逻辑固定，评分权重根据历史表现自适应调整

## 系统架构

### 整体架构图

```
GitHub Actions (Daily Cron)
  └─> Pipeline Orchestrator (Prefect)
       ├─> Data Collector Agent
       │    ├─> 股价数据 (AkShare)
       │    ├─> 财报数据 (Tushare)
       │    └─> 新闻舆情 (Web Scraping)
       │
       ├─> Data Validator Agent
       │    └─> 数据清洗、异常检测
       │
       ├─> Parallel Analysis (Multiprocessing)
       │    ├─> Fundamental Analyst (基本面)
       │    ├─> Quant Analyst (量化)
       │    ├─> News Analyst (舆情)
       │    └─> Risk Analyst (风控)
       │
       ├─> Aggregator Agent (汇总)
       ├─> Report Generator (报告生成)
       └─> Git Push (更新仓库)
            └─> GitHub Pages (前端展示)
```

### Agent设计

#### 1. Planner Agent（调度协调）
**职责：**
- 任务分解：将分析目标拆解为子任务
- Agent调度：分配任务给合适的Agent
- 质量把控：验证分析结果的完整性
- 异常处理：失败重试、降级策略

**输入：** 分析目标（股票代码列表）
**输出：** 任务执行计划

#### 2. Data Collector Agent（数据采集）
**职责：**
- 股价数据：开盘价、收盘价、成交量、技术指标
- 财报数据：收入、利润、现金流、负债
- 新闻舆情：财经新闻、公告、研报
- 数据清洗：去重、格式化、缺失值处理

**工具调用：**
- AkShare API
- Tushare API
- BeautifulSoup（爬虫）
- RSS订阅

**输出：** 标准化的JSON数据文件

#### 3. Fundamental Analyst（基本面分析）
**分析维度：**
- 财务健康度：资产负债率、流动比率、速动比率
- 盈利能力：ROE、ROA、净利率、毛利率
- 成长性：收入增长率、利润增长率
- 估值水平：PE、PB、PEG、DCF

**输出：** 基本面评分（0-100）+ 分析结论

#### 4. Quant Analyst（量化分析）
**分析维度：**
- 趋势指标：MA、EMA、MACD
- 动量指标：RSI、KDJ、威廉指标
- 波动指标：布林带、ATR
- 成交量：OBV、量价关系

**量化策略：**
- 双均线策略
- 动量反转策略
- 均值回归策略

**输出：** 技术面评分 + 买卖信号

#### 5. News Analyst（舆情分析）
**分析维度：**
- 情绪识别：利好/利空/中性
- 事件提取：业绩预告、重组、减持、诉讼
- 热度追踪：新闻数量、传播速度
- 影响评估：短期/中期/长期影响

**工具：**
- LLM情感分析
- 关键词提取
- NER实体识别

**输出：** 舆情评分 + 关键事件列表

#### 6. Risk Analyst（风控分析）
**风险维度：**
- 市场风险：波动率、最大回撤、Beta
- 流动性风险：换手率、成交额
- 财务风险：债务风险、现金流风险
- 合规风险：监管处罚、信披违规

**输出：** 风险等级（低/中/高）+ 风险提示

#### 7. Report Generator（报告生成）
**报告结构：**
1. 摘要（核心观点、综合评分）
2. 基本面分析
3. 技术面分析
4. 舆情分析
5. 风险提示
6. 操作建议
7. 数据附录

**输出格式：** Markdown + PDF

### 数据存储结构

```
stock-analysis-platform/
├── data/
│   ├── latest.json              # 最新分析结果
│   ├── history/
│   │   └── {stock_code}/
│   │       └── {date}.json      # 历史数据
│   ├── intermediate/            # Agent中间结果
│   │   ├── collector.json
│   │   ├── fundamental.json
│   │   ├── quant.json
│   │   ├── news.json
│   │   └── risk.json
│   ├── predictions_history.json # 历史预测记录
│   ├── portfolio.json            # 模拟投资组合
│   └── cache/                    # LLM响应缓存
├── reports/
│   ├── daily/
│   │   └── {date}.md           # 每日报告
│   └── stocks/
│       └── {stock_code}/
│           └── {date}.md       # 个股报告
├── config/
│   ├── stocks.json             # 监控股票列表
│   └── agents.yaml             # Agent配置
└── frontend/                   # 前端代码
    ├── index.html
    ├── src/
    └── dist/
```

## 增量更新机制

为避免资源浪费和数据重复计算，系统采用**增量更新**策略：

### 数据沉淀原则

1. **历史数据不可变**：已沉淀的历史分析结果永久保存
2. **增量追加**：每日新增数据追加到历史文件，不重复计算
3. **缓存优先**：LLM响应缓存24小时，相同问题复用结果
4. **智能合并**：新数据与历史数据合并分析

### 执行流程

```
GitHub Actions (Daily Trigger)
  ↓
读取最新沉淀文件（data/latest.json + data/predictions_history.json）
  ↓
仅采集最新数据（增量）：
  - 股价：最近未采集的交易日
  - 新闻：最近24小时的新新闻
  - 财报：季度更新时才重新获取
  ↓
合并历史数据 + 新数据
  ↓
执行分析（Agent使用历史上下文）
  ↓
更新沉淀文件：
  - 追加今日分析到 predictions_history.json
  - 更新 latest.json
  - 追加历史数据文件
  ↓
推送更新到仓库
```

### 数据读取策略

**Agent启动时：**
```python
# 1. 加载历史沉淀
history = load_predictions_history(stock_code, days=90)
latest_data = load_latest_analysis(stock_code)

# 2. 获取增量数据
new_stock_data = fetch_latest_stock_data(since=latest_data['date'])
new_news = fetch_latest_news(since=latest_data['news_last_updated'])

# 3. 合并数据
full_data = merge(latest_data, new_stock_data, new_news)

# 4. 执行分析（Agent可访问历史上下文）
result = agent.analyze(full_data, historical_context=history)
```

### 避免重复计算

**财报数据：**
- 按季度缓存，只在财报更新时重新获取
- 检查报告期，避免重复请求相同季报

**新闻数据：**
- 记录最后抓取时间，只获取新发布的新闻
- 使用文章URL去重

**LLM分析：**
- 缓存Prompt-Response对，24小时有效
- 相同问题直接返回缓存结果

**技术指标计算：**
- 历史指标值从缓存读取
- 仅计算新数据的指标

### 沉淀文件示例

**predictions_history.json:**
```json
{
  "600519": [
    {
      "date": "2024-01-01",
      "recommendation": "buy",
      "overall_score": 75.0,
      "validated": true,
      "actual_return": 0.05,
      "agent_scores": {...},
      "price_at_prediction": 1800.0
    },
    {
      "date": "2024-01-02",
      "recommendation": "hold",
      "overall_score": 65.0,
      "validated": false,
      ...
    }
  ]
}
```

**latest.json:**
```json
[
  {
    "code": "600519",
    "date": "2024-01-15",
    "overall_score": 80.0,
    "recommendation": "buy",
    "news_last_updated": "2024-01-15T10:30:00",
    "stock_data_last_updated": "2024-01-15T09:00:00",
    "financial_data_last_updated": "2023-12-31",  // 季报发布日期
    ...
  }
]
```

### 资源消耗优化

| 数据类型 | 更新频率 | 缓存策略 | 预估节省 |
|---------|---------|---------|---------|
| 股价数据 | 每日 | 增量获取 | 90% API调用 |
| 财报数据 | 季度 | 按报告期缓存 | 95% API调用 |
| 新闻数据 | 每日 | 时间戳过滤 | 70% 爬虫请求 |
| LLM分析 | 每日 | Prompt缓存 | 60% Token消耗 |
| 技术指标 | 每日 | 历史值缓存 | 80% 计算时间 |

通过增量更新，每日执行时间可从**15分钟降至3分钟**，API调用次数减少**70%**。



### 技术栈

**后端（Agent系统）**
- Python 3.11+
- Prefect 2.0（工作流编排）
- Anthropic API / OpenAI API（LLM调用）
- AkShare / Tushare（数据源）
- Pandas / NumPy（数据处理）
- Matplotlib / Plotly（可视化）

**前端（展示层）**
- Vue 3 + Vite
- ECharts（图表库）
- Element Plus（UI组件）
- Axios（数据请求）

**部署**
- GitHub Actions（定时任务）
- GitHub Pages（静态托管）

## 工作流程

### 每日自动化流程

1. **GitHub Actions触发**（每日早8点）
   - 拉取最新代码
   - 安装依赖

2. **数据采集阶段**
   - Data Collector获取当日股价、财报、新闻
   - Data Validator验证数据完整性
   - 保存到`data/intermediate/collector.json`

3. **并行分析阶段**
   - 4个分析Agent同时启动
   - 各自输出分析结果到`intermediate/`
   - 超时控制（单个Agent最多5分钟）

4. **汇总生成阶段**
   - Aggregator合并所有分析结果
   - 计算综合评分
   - 生成Markdown报告
   - 更新`data/latest.json`

5. **推送更新**
   - Git提交所有变更
   - 推送到main分支
   - GitHub Pages自动更新

### 持续迭代机制

**参数自适应调整：**
- 记录每个Agent的历史评分
- 跟踪股票后续表现（涨跌幅）
- 计算评分准确性（相关性分析）
- 动态调整Agent权重系数

**示例：**
```python
# 初始权重
weights = {
    'fundamental': 0.3,
    'quant': 0.25,
    'news': 0.25,
    'risk': 0.2
}

# 根据历史表现调整（每月重算）
# 如果基本面分析预测准确率80%，提高权重
weights['fundamental'] *= 1.2
```

## 错误处理

### 容错策略

1. **数据源降级**
   - 主数据源失败 → 自动切换备用源
   - 爬虫失败 → 跳过新闻分析

2. **Agent超时**
   - 单Agent超时 → 跳过该维度，继续其他分析
   - 多Agent失败 → 生成部分报告

3. **LLM调用失败**
   - 重试3次（指数退避）
   - 降级：使用规则模板生成报告

### 监控告警

- GitHub Actions失败 → 邮件通知
- 关键数据缺失 → 日志记录
- Agent异常 → 写入error log

## 扩展性设计

### 新增Agent

1. 继承`BaseAgent`类
2. 实现`analyze()`方法
3. 定义输入输出schema
4. 在Pipeline中注册

### 新增数据源

1. 实现`DataProvider`接口
2. 在Data Collector中注册
3. 配置API密钥到GitHub Secrets

### 支持其他分析场景

本平台设计为**通用分析框架**，股票分析是第一个应用场景：

**扩展方向：**
- 行业分析：分析整个行业的竞争格局
- 宏观经济：GDP、CPI、利率等宏观指标分析
- 基金分析：公募基金、私募基金绩效评估
- 企业研究：竞品对比、产业链分析

**改造步骤：**
1. 替换Data Collector（不同数据源）
2. 调整分析维度（不同的专业Agent）
3. 修改报告模板
4. 前端适配新数据结构

## 实施计划

### Phase 1: MVP（本地可运行）
- [ ] 搭建基础框架
- [ ] 实现4个核心Agent
- [ ] 数据采集（AkShare）
- [ ] 简单的前端展示
- [ ] 本地端到端测试

### Phase 2: GitHub集成
- [ ] GitHub Actions配置
- [ ] 定时任务调度
- [ ] Git自动提交
- [ ] Pages部署

### Phase 3: 功能增强
- [ ] PDF报告生成
- [ ] 消息推送（邮件/微信）
- [ ] 历史数据回溯
- [ ] 参数自适应调整

### Phase 4: 通用化
- [ ] 抽象Agent框架
- [ ] 配置化分析维度
- [ ] 模板化报告
- [ ] 多场景支持

## 关键技术决策

### Q: 为什么选择Prefect而不是Airflow？
A: Prefect更轻量，适合小规模任务编排，无需部署额外数据库。GitHub Actions环境下易于使用。

### Q: 为什么用多进程而不是异步？
A: Agent执行包含大量同步IO（API调用、LLM请求），多进程更简单可靠。进程间通过Queue通信足够高效。

### Q: 如何处理LLM的成本？
A:
- 缓存策略：相同问题24小时内复用结果
- 模型选择：简单任务用Haiku，复杂推理用Sonnet
- Prompt优化：精简输入，减少token消耗

### Q: 数据更新频率如何控制？
A:
- 股价数据：每日收盘后更新
- 财报数据：季报发布后更新
- 新闻数据：每日抓取
- GitHub Actions：每日早8点触发（避开开盘时间）

## 参考项目

- [deer-flow](https://github.com/bytedance/deer-flow)：多Agent协作架构
- [LangChain](https://github.com/langchain-ai/langchain)：LLM应用框架
- [AkShare](https://github.com/akfamily/akshare)：开源财经数据接口
