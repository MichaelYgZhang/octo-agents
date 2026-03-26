#!/bin/bash
# 诊断脚本 - 检查股票数据加载情况

cd /Users/michael/claude/octo-agents/.worktrees/stock-analysis

echo "=== 1. 检查数据文件是否存在 ==="
if [ -f "data/latest.json" ]; then
    echo "✅ data/latest.json 存在"
    echo "文件大小: $(ls -lh data/latest.json | awk '{print $5}')"
    echo "股票数量: $(jq 'length' data/latest.json 2>/dev/null || echo "无法解析JSON")"
else
    echo "❌ data/latest.json 不存在"
    exit 1
fi

echo ""
echo "=== 2. 检查数据内容示例 ==="
jq '.[0] | {code, name, date}' data/latest.json 2>/dev/null || echo "无法读取JSON内容"

echo ""
echo "=== 3. 检查HTTP服务器是否运行 ==="
if lsof -i :8080 > /dev/null 2>&1; then
    echo "✅ 端口8080有服务运行"
    lsof -i :8080 | grep LISTEN
else
    echo "⚠️  端口8080没有服务运行"
    echo "请运行: bash open_dashboard.sh"
fi

echo ""
echo "=== 4. 测试API端点 ==="
if command -v curl > /dev/null; then
    echo "尝试获取数据..."
    curl -s http://localhost:8080/data/latest.json | jq 'length' 2>/dev/null && echo "✅ 数据可通过HTTP访问" || echo "❌ HTTP访问失败"
else
    echo "curl未安装，跳过HTTP测试"
fi

echo ""
echo "=== 诊断完成 ==="
