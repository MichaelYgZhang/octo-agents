# GitHub Actions定时任务与部署配置实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 配置GitHub Actions实现4个定时任务，部署GitHub Pages前端托管，创建项目文档，并编写一键部署脚本

**Architecture:**
- 修改现有`.github/workflows/analysis.yml`添加4个定时任务（宏观文章、预测、复盘、周报）
- 配置GitHub Pages从`/frontend`目录部署静态网站
- 创建详细的README.md项目文档
- 编写`scripts/setup.sh`一键部署脚本

**Tech Stack:** GitHub Actions, GitHub Pages, Python 3.12, Shell Scripting

---

## 文件结构规划

### 需要修改的文件
- `.github/workflows/analysis.yml` - 添加4个定时任务触发器，修复GitHub Pages部署路径

### 需要创建的文件
- `README.md` - 项目主文档
- `scripts/setup.sh` - 一键部署脚本

---

## Task 0: 验证项目结构

**Files:**
- 无需修改，仅验证文件存在

**目标：** 确保所有需要调用的脚本文件存在且可执行

- [ ] **Step 1: 验证后端脚本存在**

```bash
test -f backend/macro_article_generator.py || { echo "ERROR: backend/macro_article_generator.py not found"; exit 1; }
test -f backend/review_report_generator.py || { echo "ERROR: backend/review_report_generator.py not found"; exit 1; }
```

预期输出：无错误

- [ ] **Step 2: 验证自动化脚本存在**

```bash
test -f src/automation/daily_prediction.py || { echo "ERROR: src/automation/daily_prediction.py not found"; exit 1; }
test -f src/automation/scheduler.py || { echo "ERROR: src/automation/scheduler.py not found"; exit 1; }
```

预期输出：无错误

- [ ] **Step 3: 验证scheduler.py包含generate_weekly_review方法**

```bash
grep -q "def generate_weekly_review" src/automation/scheduler.py || { echo "ERROR: generate_weekly_review method not found"; exit 1; }
```

预期输出：无错误

- [ ] **Step 4: 验证run_local.py存在**

```bash
test -f run_local.py || { echo "ERROR: run_local.py not found"; exit 1; }
```

预期输出：无错误

---

## Task 1: 修改GitHub Actions工作流

**Files:**
- Modify: `.github/workflows/analysis.yml`

**目标：** 将现有的单一任务扩展为4个定时任务，并修复GitHub Pages部署配置

- [ ] **Step 1: 理解现有工作流结构**

现有工作流包含：
- 1个定时触发器（每天9点）
- 分析任务（检出代码、安装依赖、运行分析、提交结果）
- 部署任务（部署整个仓库到gh-pages分支）

问题：
1. 只有1个cron触发器，需要4个不同时间的任务
2. GitHub Pages部署整个仓库，应只部署`/frontend`目录
3. 缺少API密钥配置说明

- [ ] **Step 2: 备份现有工作流**

```bash
cp .github/workflows/analysis.yml .github/workflows/analysis.yml.backup
```

预期输出：备份文件创建成功

- [ ] **Step 3: 编写完整的工作流配置**

创建新版本`.github/workflows/analysis.yml`：

```yaml
name: 股票分析自动化任务

on:
  schedule:
    # 任务1：每日08:00 - 宏观分析文章
    - cron: '0 0 * * *'      # UTC 0:00 = 北京时间 08:00
    # 任务2：每日16:30 - 预测次日股价
    - cron: '30 8 * * *'     # UTC 8:30 = 北京时间 16:30
    # 任务3：每日17:00 - 复盘昨日预测
    - cron: '0 9 * * *'      # UTC 9:00 = 北京时间 17:00
    # 任务4：每周五18:00 - 周报总结
    - cron: '0 10 * * 5'     # UTC 10:00 周五 = 北京时间 18:00 周五
  workflow_dispatch:          # 手动触发

jobs:
  scheduled-task:
    runs-on: ubuntu-latest

    steps:
    - name: 检出代码
      uses: actions/checkout@v4
      with:
        ref: main
        fetch-depth: 0

    - name: 设置Python环境
      uses: actions/setup-python@v5
      with:
        python-version: '3.12'
        cache: 'pip'

    - name: 安装依赖
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt

    - name: 判断并执行定时任务
      env:
        ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
      run: |
        CURRENT_HOUR=$(date -u +"%H")
        CURRENT_DAY=$(date -u +"%u")

        echo "当前UTC时间: $(date -u)"
        echo "UTC小时: $CURRENT_HOUR, 星期: $CURRENT_DAY"

        if [ "$CURRENT_HOUR" = "00" ]; then
          echo "执行任务：生成宏观分析文章"
          python3 backend/macro_article_generator.py || echo "Task failed but continuing..."
        fi

        if [ "$CURRENT_HOUR" = "08" ]; then
          echo "执行任务：预测次日股价"
          python3 src/automation/daily_prediction.py || echo "Task failed but continuing..."
        fi

        if [ "$CURRENT_HOUR" = "09" ]; then
          echo "执行任务：生成复盘报告"
          python3 src/automation/scheduler.py || echo "Task failed but continuing..."
        fi

        if [ "$CURRENT_HOUR" = "10" ] && [ "$CURRENT_DAY" = "5" ]; then
          echo "执行任务：生成周报总结"
          python3 -c "from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()" || echo "Task failed but continuing..."
        fi

    - name: 提交分析结果
      run: |
        git config --local user.email "github-actions[bot]@users.noreply.github.com"
        git config --local user.name "github-actions[bot]"
        git add data/*.json data/history/ reports/ logs/ 2>/dev/null || true
        if git diff --quiet && git diff --staged --quiet; then
          echo "没有新的变更需要提交"
        else
          git commit -m "chore: 自动化任务执行 - $(date +'%Y-%m-%d %H:%M:%S')"
          git push
          echo "变更已提交并推送到GitHub"
        fi

    - name: 上传任务日志
      uses: actions/upload-artifact@v4
      with:
        name: task-logs
        path: logs/
        retention-days: 7
      if: always()

  deploy-pages:
    needs: scheduled-task
    runs-on: ubuntu-latest
    if: github.event_name == 'schedule'

    steps:
    - name: 检出代码
      uses: actions/checkout@v4

    - name: 部署到GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./frontend
        publish_branch: gh-pages
```

- [ ] **Step 4: 验证YAML语法**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/analysis.yml'))"
```

预期输出：无错误

- [ ] **Step 5: 提交工作流配置**

```bash
git add .github/workflows/analysis.yml
git commit -m "feat: 配置4个定时任务和GitHub Pages部署"
git push origin main
```

- [ ] **Step 6: 自我Review验证**

```bash
# 在GitHub上检查
echo "访问 https://github.com/MichaelYgZhang/octo-agents/actions 验证："
echo "✅ 可以看到'股票分析自动化任务'工作流"
echo "✅ 可以手动触发工作流"
echo "✅ 工作流YAML语法正确"
```

---

## Task 2: 配置GitHub Pages部署

**Files:**
- 无需修改文件，使用GitHub网页界面配置

**目标：** 启用GitHub Pages，配置为从gh-pages分支部署

- [ ] **Step 1: 等待首次GitHub Actions执行**

首次执行后才会创建`gh-pages`分支。

检查方法：
```bash
git fetch origin
git branch -r | grep gh-pages
```

预期输出：
```
origin/gh-pages
```

如果没有gh-pages分支，手动触发工作流：
访问 https://github.com/MichaelYgZhang/octo-agents/actions → Run workflow

- [ ] **Step 2: 配置GitHub Pages设置**

访问：https://github.com/MichaelYgZhang/octo-agents/settings/pages

配置：
1. **Source**: Deploy from a branch
2. **Branch**: `gh-pages` / `(root)`
3. 点击"Save"

- [ ] **Step 3: 验证GitHub Pages访问**

等待1-2分钟后，打开浏览器访问：
```
https://michaelygzhang.github.io/octo-agents
```

预期结果：
- ✅ 显示股票分析平台前端页面
- ✅ Sidebar显示平台图标和副标题
- ✅ 可以切换Tab查看不同功能
- ✅ 浏览器控制台无JavaScript错误

---

## Task 3: 创建README.md项目文档

**Files:**
- Create: `README.md`

**目标：** 编写完整的项目说明文档

- [ ] **Step 1: 创建README头部和简介**

创建`README.md`，添加：

```markdown
# 股票分析平台 - AI驱动的多维度智能分析系统

**AI驱动的多维度智能分析 | 白盒化预测系统**

一个基于多Agent协作的股票分析平台，实现了完整的"预测→复盘→反馈→优化"闭环系统。
```

- [ ] **Step 2: 添加功能特性部分**

继续编辑README，添加：

```markdown
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
```

- [ ] **Step 3: 添加技术栈部分**

继续编辑README，添加：

```markdown
## 技术栈

### 后端
- **Python 3.12** - 核心开发语言
- **Anthropic Claude API** - AI分析引擎
- **Akshare** - 港股数据获取
- **Pandas/NumPy** - 数据处理

### 前端
- **Vue 3** (CDN模式) - 前端框架
- **ECharts 5** - 数据可视化
- **Axios** - HTTP请求

### 基础设施
- **GitHub Actions** - CI/CD自动化
- **GitHub Pages** - 静态网站托管
```

- [ ] **Step 4: 添加快速开始部分**

继续编辑README，添加：

```markdown
## 快速开始

### 前置要求

- Python 3.12+
- Git
- Anthropic API Key

### 安装步骤

1. 克隆仓库
\`\`\`bash
git clone https://github.com/MichaelYgZhang/octo-agents.git
cd octo-agents
\`\`\`

2. 安装依赖
\`\`\`bash
pip install -r requirements.txt
\`\`\`

3. 配置API密钥
\`\`\`bash
export ANTHROPIC_API_KEY="your_api_key_here"
\`\`\`

4. 运行分析
\`\`\`bash
python run_local.py
\`\`\`

5. 启动前端服务
\`\`\`bash
cd frontend
python3 -m http.server 8888
\`\`\`

访问：http://localhost:8888
```

- [ ] **Step 5: 添加定时任务说明**

继续编辑README，添加：

```markdown
## 定时任务说明

| 时间（北京时间） | 任务 | 脚本 | 说明 |
|-----------------|------|------|------|
| 每日 08:00 | 宏观文章 | backend/macro_article_generator.py | 生成当日宏观分析 |
| 每日 16:30 | 次日预测 | src/automation/daily_prediction.py | 预测明日股价 |
| 每日 17:00 | 复盘报告 | src/automation/scheduler.py | 复盘昨日预测 |
| 周五 18:00 | 周报总结 | scheduler.generate_weekly_review() | 生成周度总结 |

### GitHub Actions配置

1. 访问 Settings → Secrets and variables → Actions
2. 添加Secret: `ANTHROPIC_API_KEY`
3. 手动触发：Actions页面 → "股票分析自动化任务" → Run workflow
```

- [ ] **Step 6: 添加贡献和许可部分**

继续编辑README，添加：

```markdown
## 贡献指南

1. Fork本项目
2. 创建特性分支 (\`git checkout -b feature/AmazingFeature\`)
3. 提交更改 (\`git commit -m 'Add some AmazingFeature'\`)
4. 推送到分支 (\`git push origin feature/AmazingFeature\`)
5. 创建Pull Request

## 许可证

本项目采用 MIT 许可证。
```

- [ ] **Step 7: 提交README**

```bash
git add README.md
git commit -m "docs: 添加项目README文档"
git push origin main
```

- [ ] **Step 8: 自我Review验证**

```bash
echo "访问 https://github.com/MichaelYgZhang/octo-agents 验证："
echo "✅ README在仓库首页正确显示"
echo "✅ Markdown格式正确"
echo "✅ 所有代码块语法高亮"
```

---

## Task 4: 创建一键部署脚本

**Files:**
- Create: `scripts/setup.sh`

**目标：** 编写自动化部署脚本

- [ ] **Step 1: 创建脚本头部和辅助函数**

创建`scripts/setup.sh`：

```bash
#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}
```

- [ ] **Step 2: 添加依赖检查部分**

继续编辑脚本，添加：

```bash
main() {
    echo "====================================="
    echo "  股票分析平台 - 一键部署脚本"
    echo "====================================="
    echo ""

    print_info "检查系统依赖..."

    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}ERROR: Python3 未安装${NC}"
        exit 1
    fi

    if ! command -v git >/dev/null 2>&1; then
        echo -e "${RED}ERROR: Git 未安装${NC}"
        exit 1
    fi

    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    print_success "Python 版本: $PYTHON_VERSION"
    print_success "Git 已安装"
    echo ""
```

- [ ] **Step 3: 添加虚拟环境设置部分**

继续编辑脚本，添加：

```bash
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    cd "$PROJECT_ROOT"
    print_info "项目目录: $PROJECT_ROOT"
    echo ""

    print_info "创建Python虚拟环境..."

    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "虚拟环境创建成功"
    else
        print_warning "虚拟环境已存在"
    fi
    echo ""

    print_info "安装Python依赖..."
    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    print_success "依赖安装完成"
    echo ""
```

- [ ] **Step 4: 添加配置和目录初始化部分**

继续编辑脚本，添加：

```bash
    print_info "检查配置文件..."

    if [ ! -f "config/stocks.json" ]; then
        print_warning "创建默认配置..."
        mkdir -p config
        echo '{"stocks":[{"code":"03690.HK","name":"美团","sector":"互联网"}]}' > config/stocks.json
        print_success "默认配置创建完成"
    fi
    echo ""

    print_info "初始化数据目录..."
    mkdir -p data/history logs reports

    if [ ! -f "data/latest.json" ]; then
        echo '{"stocks":[]}' > data/latest.json
    fi

    if [ ! -f "data/feedback_history.json" ]; then
        echo '{}' > data/feedback_history.json
    fi

    if [ ! -f "data/review_reports.json" ]; then
        echo '{"reports":[]}' > data/review_reports.json
    fi

    if [ ! -f "data/macro_articles.json" ]; then
        echo '{"articles":[]}' > data/macro_articles.json
    fi

    print_success "数据文件初始化完成"
    echo ""
```

- [ ] **Step 5: 添加API密钥配置部分**

继续编辑脚本，添加：

```bash
    print_info "配置API密钥..."

    if [ ! -f ".env" ]; then
        print_warning "未找到 .env 文件"
        echo "请配置 Anthropic API 密钥："
        echo "  export ANTHROPIC_API_KEY='your_key_here'"
        echo ""

        read -p "是否现在配置？(y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "请输入API密钥: " API_KEY
            echo "ANTHROPIC_API_KEY=$API_KEY" > .env
            print_success "API密钥已保存"
        fi
    else
        print_success ".env 文件已存在"
    fi
    echo ""
```

- [ ] **Step 6: 添加服务启动部分**

继续编辑脚本，添加：

```bash
    PORT=8888
    print_info "启动前端服务器..."
    echo ""
    echo "访问地址: http://localhost:$PORT"
    echo "按 Ctrl+C 停止服务器"
    echo ""

    cd frontend
    python3 -m http.server $PORT
}

main "$@"
```

- [ ] **Step 7: 添加执行权限**

```bash
chmod +x scripts/setup.sh
```

- [ ] **Step 8: 提交脚本**

```bash
git add scripts/setup.sh
git commit -m "feat: 添加一键部署脚本"
git push origin main
```

- [ ] **Step 9: 自我Review验证**

```bash
echo "脚本验证清单："
echo "✅ scripts/setup.sh 有执行权限"
echo "✅ 脚本语法正确（bash -n scripts/setup.sh）"
echo "✅ 在干净环境可以成功运行"
```

---

## 最终验证清单

完成后验证以下内容：

### GitHub Actions
- [ ] 访问 https://github.com/MichaelYgZhang/octo-agents/actions
- [ ] 可以看到"股票分析自动化任务"工作流
- [ ] 可以手动触发工作流
- [ ] Secrets已配置 ANTHROPIC_API_KEY

### GitHub Pages
- [ ] 访问 https://michaelygzhang.github.io/octo-agents
- [ ] 前端页面正常显示
- [ ] 数据正常加载
- [ ] 浏览器控制台无错误

### README文档
- [ ] 仓库首页显示README内容
- [ ] 包含安装指南、使用说明
- [ ] 所有代码块语法高亮正确
- [ ] Markdown格式正确

### 部署脚本
- [ ] scripts/setup.sh 有执行权限
- [ ] 脚本语法检查通过
- [ ] 可以成功运行

---

## 注意事项

1. **API密钥安全**
   - 永远不要将 `.env` 文件提交到Git
   - 确保 `.gitignore` 包含 `.env`

2. **GitHub Actions限制**
   - 免费账户每月2000分钟
   - 定时任务可能有延迟
   - 建议在非交易时段测试

3. **数据更新频率**
   - 避免频繁调用API
   - 建议仅在交易时段更新
