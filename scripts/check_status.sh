#!/bin/bash
# check_status.sh - 检查股票分析平台定时任务状态

PROJECT_DIR="/Users/michael/claude/octo-agents/.worktrees/stock-analysis"

echo "=================================="
echo "股票分析平台 - 系统状态检查"
echo "=================================="
echo ""

# 1. 检查定时任务配置
echo "📋 定时任务配置："
echo ""
if crontab -l 2>/dev/null | grep -q "stock-analysis"; then
    echo "✅ 已配置定时任务："
    crontab -l | grep -A 1 "股票分析平台"
    echo ""
else
    echo "❌ 未配置定时任务"
    echo "   请运行: ./scripts/setup_cron.sh"
    echo ""
fi

# 2. 检查最近的执行日志
echo "📊 最近执行记录："
echo ""
if [ -f "$PROJECT_DIR/logs/cron.log" ]; then
    tail -20 "$PROJECT_DIR/logs/cron.log"
    echo ""
else
    echo "⚠️  暂无执行日志"
    echo ""
fi

# 3. 检查数据文件
echo "📁 数据文件状态："
echo ""

files=(
    "data/review_reports.json:复盘报告"
    "data/macro_articles.json:宏观文章"
    "data/feedback_history.json:预测历史"
    "data/agent_config.json:Agent配置"
)

for item in "${files[@]}"; do
    IFS=':' read -r file desc <<< "$item"
    filepath="$PROJECT_DIR/$file"
    
    if [ -f "$filepath" ]; then
        size=$(du -h "$filepath" | cut -f1)
        modified=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M" "$filepath")
        echo "✅ $desc"
        echo "   文件: $file"
        echo "   大小: $size"
        echo "   更新: $modified"
        echo ""
    else
        echo "⚠️  $desc (未找到)"
        echo "   文件: $file"
        echo ""
    fi
done

# 4. 检查Python环境
echo "🐍 Python环境："
echo ""
python3 --version
echo ""

# 5. 快速测试
echo "🧪 快速功能测试："
echo ""

# 测试复盘生成
if [ -f "$PROJECT_DIR/src/automation/scheduler.py" ]; then
    echo "✅ 复盘报告生成器可用"
else
    echo "❌ 复盘报告生成器不可用"
fi

# 测试宏观文章生成
if [ -f "$PROJECT_DIR/backend/macro_article_generator.py" ]; then
    echo "✅ 宏观文章生成器可用"
else
    echo "❌ 宏观文章生成器不可用"
fi

# 测试反馈管理器
if [ -f "$PROJECT_DIR/src/feedback/feedback_manager.py" ]; then
    echo "✅ 反馈管理器可用"
else
    echo "❌ 反馈管理器不可用"
fi

echo ""
echo "=================================="
echo "检查完成！"
echo "=================================="
