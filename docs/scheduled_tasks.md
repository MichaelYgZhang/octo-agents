# 定时任务配置清单

## 📋 定时任务总览

目前系统共配置 **3个定时任务**：

### 1. 每日复盘报告生成 ⏰

**触发时间：** 每日北京时间 17:00
**触发条件：** 港股收盘后1小时（港股收盘时间：16:00）
**执行内容：**
- 分析当日预测准确率
- 对比实际收盘价与预测价格
- 生成预测差异分析
- 生成Agent反馈建议
- 应用反馈到Agent系统
- 保存复盘报告到 `data/review_reports.json`

**Cron配置：**
```bash
0 17 * * * cd /path/to/stock-analysis && python3 src/automation/scheduler.py >> logs/cron.log 2>&1
```

**输出文件：**
- `data/review_reports.json` - 复盘报告数据
- `data/agent_config.json` - Agent配置调整记录
- `data/automation.log` - 自动化执行日志

---

### 2. 每周复盘总结生成 ⏰

**触发时间：** 每周五北京时间 18:00
**触发条件：** 每周五收盘后2小时
**执行内容：**
- 汇总本周预测表现
- 生成周度准确率统计
- 分析本周改进趋势
- 制定下周优化计划
- 保存周报到 `data/review_reports.json`

**Cron配置：**
```bash
0 18 * * 5 cd /path/to/stock-analysis && python3 -c "from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()" >> logs/cron.log 2>&1
```

**输出文件：**
- `data/review_reports.json` - 包含周报数据
- 周报类型标记：`period: "weekly"`

---

### 3. 宏观分析文章生成 ⏰

**触发时间：** 每日北京时间 08:00
**触发条件：** 开盘前1.5小时（港股开盘时间：09:30）
**执行内容：**
- 自动生成经济/政治/战争影响分析文章
- 轮换文章主题（经济→政治→战争→经济...）
- 采用金字塔原理结构撰写
- 分析对股票市场的影响
- 提供投资建议
- 保存文章到 `data/macro_articles.json`

**Cron配置：**
```bash
0 8 * * * cd /path/to/stock-analysis && python3 backend/macro_article_generator.py >> logs/cron.log 2>&1
```

**输出文件：**
- `data/macro_articles.json` - 宏观分析文章库
- 保留最近30篇文章

---

## 📅 定时任务时间表

| 任务名称 | 北京时间 | 频率 | 说明 |
|---------|---------|------|------|
| **复盘报告生成** | 17:00 | 每日 | 收盘后1小时，分析当日预测 |
| **周报总结生成** | 18:00 | 每周五 | 收盘后2小时，汇总本周表现 |
| **宏观文章生成** | 08:00 | 每日 | 开盘前，提供市场分析 |

---

## 🔧 配置方法

### 方法1: Linux Cron Job（推荐）

```bash
# 1. 编辑crontab
crontab -e

# 2. 添加以下3个任务
# 每日08:00 - 宏观分析文章
0 8 * * * cd /Users/michael/claude/octo-agents/.worktrees/stock-analysis && python3 backend/macro_article_generator.py >> logs/cron.log 2>&1

# 每日17:00 - 复盘报告
0 17 * * * cd /Users/michael/claude/octo-agents/.worktrees/stock-analysis && python3 src/automation/scheduler.py >> logs/cron.log 2>&1

# 每周五18:00 - 周报总结
0 18 * * 5 cd /Users/michael/claude/octo-agents/.worktrees/stock-analysis && python3 -c "from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()" >> logs/cron.log 2>&1

# 3. 保存并退出

# 4. 查看已配置的任务
crontab -l
```

### 方法2: Mac Launchd

```bash
# 创建3个plist文件，分别对应3个定时任务

# 1. 宏观分析文章（每日08:00）
cat > ~/Library/LaunchAgents/com.stock.macro.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.stock.macro</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/michael/claude/octo-agents/.worktrees/stock-analysis/backend/macro_article_generator.py</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>8</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/stock-macro.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/stock-macro-error.log</string>
</dict>
</plist>
EOF

# 2. 复盘报告（每日17:00）
cat > ~/Library/LaunchAgents/com.stock.review.plist << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.stock.review</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/bin/python3</string>
        <string>/Users/michael/claude/octo-agents/.worktrees/stock-analysis/src/automation/scheduler.py</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>17</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
    <key>StandardOutPath</key>
    <string>/tmp/stock-review.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/stock-review-error.log</string>
</dict>
</plist>
EOF

# 3. 加载所有服务
launchctl load ~/Library/LaunchAgents/com.stock.macro.plist
launchctl load ~/Library/LaunchAgents/com.stock.review.plist

# 查看已加载的服务
launchctl list | grep stock
```

### 方法3: Systemd Service (Linux服务器)

```bash
# 1. 创建服务文件
sudo nano /etc/systemd/system/stock-macro.service

[Unit]
Description=Stock Macro Article Generator
After=network.target

[Service]
Type=oneshot
ExecStart=/usr/bin/python3 /path/to/stock-analysis/backend/macro_article_generator.py
WorkingDirectory=/path/to/stock-analysis
User=your_username

[Install]
WantedBy=multi-user.target

# 2. 创建定时器
sudo nano /etc/systemd/system/stock-macro.timer

[Unit]
Description=Run macro article generator daily at 08:00

[Timer]
OnCalendar=*-*-* 08:00:00
Persistent=true

[Install]
WantedBy=timers.target

# 3. 启用服务
sudo systemctl enable stock-macro.timer
sudo systemctl start stock-macro.timer

# 同样方式创建复盘报告和周报的服务
```

---

## ✅ 验证定时任务

### 查看当前配置
```bash
# Linux/Mac - Crontab
crontab -l

# Mac - Launchd
launchctl list | grep stock

# Linux - Systemd
systemctl list-timers | grep stock
```

### 查看执行日志
```bash
# 查看最新日志
tail -50 logs/cron.log

# 实时监控日志
tail -f logs/cron.log

# 查看特定日期的日志
grep "2026-03-26" logs/cron.log
```

### 手动触发测试
```bash
# 测试复盘报告生成
python3 src/automation/scheduler.py

# 测试宏观文章生成
python3 backend/macro_article_generator.py

# 测试周报生成
python3 -c "from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()"
```

---

## 📊 任务执行时间轴

```
00:00 ──────────────────────────────────────── 24:00

08:00 🌅 宏观分析文章生成
      ↓ 开盘前提供市场分析

09:30 🔔 港股开盘

16:00 🔔 港股收盘

17:00 📊 复盘报告生成
      ↓ 分析当日预测准确率
      ↓ 应用反馈到Agent

18:00 📈 周报总结（仅周五）
      ↓ 汇总本周表现
```

---

## 🎯 任务依赖关系

```
每日08:00: 宏观文章生成 (独立)
    ↓
每日09:30: 开盘交易 (外部)
    ↓
每日16:00: 收盘 (外部)
    ↓
每日17:00: 复盘报告生成 (依赖当日交易数据)
    ↓
每周五18:00: 周报总结 (依赖本周复盘数据)
```

---

## 📝 注意事项

1. **时区设置**
   - 所有时间均为北京时间（UTC+8）
   - 港股交易时间：09:30-16:00
   - 定时任务应在非交易时间执行

2. **任务顺序**
   - 宏观文章：开盘前生成（08:00）
   - 复盘报告：收盘后生成（17:00）
   - 周报总结：周末生成（周五18:00）

3. **日志管理**
   - 定期清理旧日志（建议保留30天）
   - 监控任务执行状态
   - 异常时发送告警

4. **数据备份**
   - 定期备份 `data/` 目录
   - 保留历史复盘报告
   - 备份Agent配置调整记录

---

## 🚀 一键配置脚本

```bash
#!/bin/bash
# setup_cron.sh - 一键配置所有定时任务

PROJECT_DIR="/Users/michael/claude/octo-agents/.worktrees/stock-analysis"

# 创建日志目录
mkdir -p $PROJECT_DIR/logs

# 添加定时任务
(crontab -l 2>/dev/null; echo "
# 股票分析平台定时任务

# 每日08:00 - 宏观分析文章
0 8 * * * cd $PROJECT_DIR && python3 backend/macro_article_generator.py >> logs/cron.log 2>&1

# 每日17:00 - 复盘报告
0 17 * * * cd $PROJECT_DIR && python3 src/automation/scheduler.py >> logs/cron.log 2>&1

# 每周五18:00 - 周报总结
0 18 * * 5 cd $PROJECT_DIR && python3 -c \"from src.automation.scheduler import AutomatedScheduler; s = AutomatedScheduler(); s.generate_weekly_review()\" >> logs/cron.log 2>&1
") | crontab -

echo "✅ 定时任务配置完成！"
echo "已配置3个定时任务："
echo "  - 每日08:00 宏观分析文章生成"
echo "  - 每日17:00 复盘报告生成"
echo "  - 每周五18:00 周报总结生成"
echo ""
echo "查看配置：crontab -l"
```

---

## 总结

✅ **3个定时任务** 已配置完成：
1. **每日08:00** - 宏观分析文章生成
2. **每日17:00** - 复盘报告生成
3. **每周五18:00** - 周报总结生成

所有任务均为北京时间，与港股交易时间完美配合！🎯
