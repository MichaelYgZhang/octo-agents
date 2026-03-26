#!/bin/bash
# setup_cron.sh - 一键配置股票分析平台所有定时任务
#
# 使用方法：
#   chmod +x setup_cron.sh
#   ./setup_cron.sh

set -e

# 项目根目录（自动检测）
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=================================="
echo "股票分析平台 - 定时任务配置工具"
echo "=================================="
echo ""
echo "项目目录: $PROJECT_DIR"
echo ""

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误：未找到python3，请先安装Python 3"
    exit 1
fi

echo "✅ Python环境: $(python3 --version)"
echo ""

# 创建日志目录
mkdir -p "$PROJECT_DIR/logs"
echo "✅ 日志目录已创建: $PROJECT_DIR/logs"
echo ""

# 检查必要的文件
required_files=(
    "src/automation/scheduler.py"
    "backend/macro_article_generator.py"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$PROJECT_DIR/$file" ]; then
        echo "❌ 错误：找不到文件 $file"
        exit 1
    fi
done

echo "✅ 所有必要文件检查通过"
echo ""

# 显示将要配置的任务
echo "📋 将配置以下3个定时任务："
echo ""
echo "  1️⃣  每日 08:00 - 宏观分析文章生成"
echo "      触发时间：北京时间每日08:00"
echo "      执行内容：自动生成经济/政治/战争分析文章"
echo ""
echo "  2️⃣  每日 17:00 - 复盘报告生成"
echo "      触发时间：北京时间每日17:00（港股收盘后1小时）"
echo "      执行内容：分析当日预测，生成Agent反馈"
echo ""
echo "  3️⃣  每周五 18:00 - 周报总结生成"
echo "      触发时间：北京时间每周五18:00"
echo "      执行内容：汇总本周表现，制定优化计划"
echo ""

# 确认配置
read -p "是否继续配置定时任务？ (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消配置"
    exit 0
fi

echo ""
echo "⚙️  正在配置定时任务..."

# 备份现有的crontab
if crontab -l &> /dev/null; then
    crontab -l > "$PROJECT_DIR/logs/crontab_backup_$(date +%Y%m%d_%H%M%S).txt"
    echo "✅ 已备份现有crontab"
fi

# 添加新的定时任务（移除旧的股票分析任务）
(crontab -l 2>/dev/null | grep -v "stock-analysis" | grep -v "macro_article_generator" | grep -v "scheduler.py"; echo "
# 股票分析平台定时任务 - 配置于 $(date '+%Y-%m-%d %H:%M:%S')

# 每日08:00 - 宏观分析文章生成
0 8 * * * cd $PROJECT_DIR && /usr/bin/python3 backend/macro_article_generator.py >> logs/cron.log 2>&1

# 每日17:00 - 复盘报告生成（港股收盘后1小时）
0 17 * * * cd $PROJECT_DIR && /usr/bin/python3 src/automation/scheduler.py >> logs/cron.log 2>&1

# 每周五18:00 - 周报总结生成
0 18 * * 5 cd $PROJECT_DIR && /usr/bin/python3 -c \"from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()\" >> logs/cron.log 2>&1
") | crontab -

echo ""
echo "✅ 定时任务配置完成！"
echo ""
echo "📊 当前配置的定时任务："
echo ""
crontab -l | grep -A 1 "股票分析平台"
echo ""

# 创建启动说明
cat << 'EOF'
📝 快速使用指南：

1. 查看定时任务：
   crontab -l

2. 查看执行日志：
   tail -f logs/cron.log

3. 手动触发任务：
   # 复盘报告
   python3 src/automation/scheduler.py

   # 宏观文章
   python3 backend/macro_article_generator.py

   # 周报总结
   python3 -c "from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()"

4. 查看生成的数据：
   # 复盘报告
   cat data/review_reports.json | jq '.reports[-1]'

   # 宏观文章
   cat data/macro_articles.json | jq '.articles[-1]'

   # Agent配置
   cat data/agent_config.json | jq

5. 监控任务执行：
   # 实时查看日志
   tail -f logs/cron.log

   # 查看最近10次执行
   tail -100 logs/cron.log | grep "开始生成"

EOF

echo ""
echo "🎉 配置成功！所有定时任务将在指定时间自动执行"
echo ""
echo "⚠️  注意事项："
echo "  - 确保系统时区设置为北京时间（UTC+8）"
echo "  - 定时任务将在后台自动执行，无需手动干预"
echo "  - 建议定期检查 logs/cron.log 确认任务正常执行"
echo ""
