#!/bin/bash
cd /Users/michael/claude/octo-agents/.worktrees/stock-analysis
echo "启动HTTP服务器..."
echo "访问地址: http://localhost:8080/frontend/"
echo "按 Ctrl+C 停止服务器"
python3 -m http.server 8080
