---
name: stock-analysis-data-sources
description: 股票分析平台的数据来源和资源清单，包含所有API、数据源、技术栈的详细信息和链接
type: reference
---

# 股票分析平台 - 数据来源与资源清单

## 核心数据源

### 1. 股价数据

**主数据源：AkShare API**
- 官网: https://akshare.akfamily.xyz
- GitHub: https://github.com/akfamily/akshare
- 文档: https://akshare.akfamily.xyz/author.html
- 功能: 港股实时行情、历史数据、财务数据
- 数据源: 港交所官方数据
- 延迟: <15分钟
- 可信度: 高
- 使用方法:
  ```python
  import akshare as ak
  df = ak.stock_hk_daily(symbol="03690", adjust="qfq")  # 美团港股
  ```

**补充数据源：港交所官方**
- 官网: https://www.hkex.com.hk/
- 数据查询: https://www.hkex.com.hk/Market-Data/Securities-Prices/Equities?sc_lang=zh-HK
- 特色: 最权威的官方数据源，延迟最低

### 2. 财务数据

**主数据源：港交所披露易**
- 官网: https://www.hkexnews.hk/
- 功能: 上市公司公告、财报、重大事项
- 数据类型: 季报、年报、业绩预告
- 更新频率: 实时
- 可信度: 高

**补充数据源：雪球财经**
- 官网: https://xueqiu.com/
- 功能: 财务指标、估值数据、研报
- API: https://xueqiu.com/statuses/original.json
- 特色: 数据整理完善，便于分析

**财务指标说明：**
- PE (市盈率): 股价/每股收益，反映估值水平
- PB (市净率): 股价/每股净资产，反映资产价值
- ROE (净资产收益率): 净利润/净资产，反映盈利能力
- 毛利率: (营收-成本)/营收，反映产品盈利能力
- 净利率: 净利润/营收，反映整体盈利能力
- 资产负债率: 总负债/总资产，反映财务风险

### 3. 新闻舆情

**美团官方渠道**
- 官网: https://www.meituan.com/
- 投资者关系: https://ir.meituan.com/
- 新闻中心: https://www.meituan.com/news/
- 微信公众号: 美团Meituan
- 功能: 公司动态、产品发布、业绩公告
- 更新频率: 实时
- 可信度: 高（官网权威来源）

**快手官方渠道**
- 官网: https://www.kuaishou.com/
- 投资者关系: https://ir.kuaishou.com/
- 新闻中心: https://www.kuaishou.com/news
- 官方微博: https://weibo.com/kuaishou
- 功能: 公司动态、产品发布、业绩公告
- 更新频率: 实时
- 可信度: 高（官网权威来源）

**国际局势新闻源**
- 新华社国际新闻: http://www.xinhuanet.com/world/
  - 权威官方媒体，国际局势报道
  - 可信度: 高
- 央视新闻: https://news.cctv.com/world/
  - 央视国际新闻频道
  - 可信度: 高
- 人民日报海外版: http://paper.people.com.cn/rmrbhwb/
  - 官方权威媒体
  - 可信度: 高
- 环球网: https://world.huanqiu.com/
  - 国际新闻门户
  - 可信度: 中
- 中国新闻网: https://www.chinanews.com.cn/gj/
  - 官方新闻门户
  - 可信度: 高

**新浪财经**
- 官网: https://finance.sina.com.cn/
- API: https://finance.sina.com.cn/7x24/
- 功能: 实时新闻、市场动态、公司公告
- 更新频率: 实时
- 覆盖: 港股、美股、A股
- 可信度: 中（第三方媒体）

**华尔街日报（英文）**
- 官网: https://www.wsj.com/
- 功能: 全球财经新闻、深度分析
- 特色: 权威性强，国际视野
- 可信度: 高（权威媒体）

**路透社（英文）**
- 官网: https://www.reuters.com/
- 功能: 全球财经新闻、市场数据
- 特色: 实时性强，覆盖面广
- 可信度: 高（权威媒体）

**东方财富网**
- 官网: https://www.eastmoney.com/
- 功能: 财经新闻、研报、数据
- API: http://data.eastmoney.com/
- 可信度: 中（国内财经门户）



## 技术栈资源

### 编程语言与框架

**Python 3.12**
- 官网: https://python.org/
- 文档: https://docs.python.org/3/
- 用途: 后端分析引擎、数据处理

**Vue 3**
- 官网: https://vuejs.org/
- 文档: https://vuejs.org/guide/introduction.html
- GitHub: https://github.com/vuejs/vue
- 用途: 前端交互界面

**ECharts 5**
- 官网: https://echarts.apache.org/
- 文档: https://echarts.apache.org/handbook/zh/
- GitHub: https://github.com/apache/echarts
- 用途: 数据可视化、图表展示

### 数据处理库

**Pandas**
- 官网: https://pandas.pydata.org/
- 文档: https://pandas.pydata.org/docs/
- GitHub: https://github.com/pandas-dev/pandas
- 用途: 数据处理、时间序列分析

**NumPy**
- 官网: https://numpy.org/
- 文档: https://numpy.org/doc/stable/
- GitHub: https://github.com/numpy/numpy
- 用途: 数值计算、矩阵运算

**Pydantic**
- 官网: https://pydantic-docs.helpmanual.io/
- GitHub: https://github.com/pydantic/pydantic
- 用途: 数据验证、模型定义

### AI引擎

**Claude API (Anthropic)**
- 官网: https://www.anthropic.com/
- 文档: https://docs.anthropic.com/claude/docs
- API参考: https://docs.anthropic.com/claude/reference
- 模型: Claude Sonnet 4.6
- 用途: 多维度分析、预测建模、风险评估

**API使用示例：**
```python
from anthropic import Anthropic

client = Anthropic(api_key="your-api-key")
message = client.messages.create(
    model="claude-sonnet-4-6-20250514",
    max_tokens=1024,
    messages=[
        {"role": "user", "content": "分析美团股票"}
    ]
)
```

### 基础设施

**GitHub Actions**
- 文档: https://docs.github.com/en/actions
- 用途: 自动化分析、定时任务
- 配置: `.github/workflows/analysis.yml`

**GitHub Pages**
- 文档: https://pages.github.com/
- 用途: 静态前端部署
- 域名: https://[username].github.io/[repo]/

## API密钥与环境变量

### 必需的API密钥

**DeepSeek API Key**
- 获取地址: https://platform.deepseek.com/
- 环境变量: `DEEPSEEK_API_KEY`
- 配置方法:
  ```bash
  export DEEPSEEK_API_KEY="your-api-key"
  ```

**GitHub Token（可选）**
- 获取地址: https://github.com/settings/tokens
- 用途: GitHub Actions部署
- 权限: `repo`, `workflow`

### 配置文件

**stocks.json**
- 位置: `config/stocks.json`
- 功能: 监控股票列表
- 示例:
  ```json
  {
    "monitored_stocks": [
      {"code": "03690.HK", "name": "美团", "sector": "互联网"},
      {"code": "01024.HK", "name": "快手", "sector": "互联网"}
    ]
  }
  ```

## 数据更新频率

| 数据类型 | 更新频率 | 延迟 | 数据源 |
|---------|---------|------|--------|
| 股价数据 | 实时 | <15分钟 | AkShare/港交所 |
| 财务数据 | 季度 | 1-3天 | 披露易/雪球 |
| 新闻舆情 | 实时 | <5分钟 | 新浪财经 |
| 分析报告 | 每日 | - | 本地生成 |

## 数据质量说明

### 高可信度数据
- 股价数据（港交所官方）
- 财务指标（上市公司财报）
- 技术指标（精确计算）

### 中等可信度数据
- AI分析结论（模型推断）
- 舆情分析（语义理解）
- 预测结果（概率模型）

### 数据验证
- 所有数据来源均标注在页面上
- 用户可追溯每项数据的原始来源
- 定期校验数据准确性

## 扩展资源

### 学习资料

**量化投资**
- 书籍: 《量化投资：以Python为工具》
- 课程: https://www.coursera.org/learn/python-machine-learning

**港股投资**
- 官网: https://www.hkex.com.hk/
- 港股通: https://www.hkex.com.hk/ChinaConnect

**财务分析**
- CFA教材
- 《财务报表分析与股票估值》

### 社区资源

**AkShare社区**
- GitHub Issues: https://github.com/akfamily/akshare/issues
- 文档贡献: https://github.com/akfamily/akshare/blob/master/CONTRIBUTING.md

**量化社区**
- 聚宽: https://www.joinquant.com/
- 米筐: https://www.ricequant.com/

## 更新记录

- 2026-03-26: 初始版本，整理所有数据源和技术栈资源

## 联系方式

- 项目仓库: [GitHub URL]
- 问题反馈: [Issues URL]
- 文档更新: 欢迎提交PR完善资源清单
