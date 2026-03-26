# 股票分析平台 - AI驱动的多维度智能分析系统

**AI驱动的多维度智能分析 | 白盒化预测系统**

一个基于多Agent协作的股票分析平台，实现了完整的"预测→复盘→反馈→优化"闭环系统。

## 核心特性

### 多Agent协作系统
- **量化分析师** - 技术指标分析、趋势判断、价格动量计算
- **基本面分析师** - 财务数据评估、估值模型、行业地位分析
- **新闻分析师** - 新闻情感分析、产品动态追踪、市场情绪判断
- **风险分析师** - 风险评估、地缘政治影响、波动性分析

### 自我驱动的反馈闭环
- 每日自动生成预测
- 收盘后自动复盘验证
- Agent根据反馈自动调整参数
- 持续优化预测准确率

### 白盒化预测系统
- 完整展示分析过程
- 可视化Agent决策流程
- 透明的评分计算规则
- 详细的数据来源追踪

## 技术栈

### 后端
- **Python 3.12** - 核心开发语言
- **DeepSeek API** - AI分析引擎
- **Akshare** - 港股数据获取
- **Pandas/NumPy** - 数据处理

### 前端
- **Vue 3** (CDN模式) - 前端框架
- **ECharts 5** - 数据可视化
- **Axios** - HTTP请求

### 基础设施
- **GitHub Actions** - CI/CD自动化
- **GitHub Pages** - 静态网站托管

## 快速开始

### 前置要求

- Python 3.12+
- Git
- DeepSeek API Key

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/MichaelYgZhang/octo-agents.git
cd octo-agents
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. 配置API密钥
```bash
export DEEPSEEK_API_KEY="your_api_key_here"
```

4. 运行分析
```bash
python run_local.py
```

5. 启动前端服务
```bash
cd frontend
python3 -m http.server 8888
```

访问：http://localhost:8888

## 定时任务说明

| 时间（北京时间） | 任务 | 脚本 | 说明 |
|-----------------|------|------|------|
| 每日 08:00 | 宏观文章 | backend/macro_article_generator.py | 生成当日宏观分析 |
| 每日 16:30 | 次日预测 | src/automation/daily_prediction.py | 预测明日股价 |
| 每日 17:00 | 复盘报告 | src/automation/scheduler.py | 复盘昨日预测 |
| 周五 18:00 | 周报总结 | scheduler.generate_weekly_review() | 生成周度总结 |

### GitHub Actions配置

1. 访问 Settings → Secrets and variables → Actions
2. 添加Secret: `DEEPSEEK_API_KEY`
3. 手动触发：Actions页面 → "股票分析自动化任务" → Run workflow

## 贡献指南

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证。
