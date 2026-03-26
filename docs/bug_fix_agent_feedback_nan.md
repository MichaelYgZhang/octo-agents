# Agent学习反馈NaN%问题 - 修复说明

## 问题描述

**现象：** 复盘报告页面中，Agent学习反馈显示为 `NaN%`

**位置：** 前端页面 → 复盘报告 → Agent学习反馈模块

---

## 问题原因

### 数据字段不匹配

**后端数据格式：**
```json
{
  "agent_feedback": [
    {
      "agent": "量化分析师",
      "score_change": -8.5,     // ← 后端使用 score_change
      "suggestion": "..."
    }
  ]
}
```

**前端期望格式：**
```javascript
// 前端模板（review-page.js 第73-75行）
<span>
  {{ feedback.improvement > 0 ? '↑' : '↓' }}
  {{ Math.abs(feedback.improvement).toFixed(1) }}%  // ← 前端期望 improvement
</span>
```

**问题：**
- 后端返回 `score_change`
- 前端读取 `improvement`
- 字段不匹配 → undefined → NaN

---

## 修复方案

### 修改前端数据映射

**文件：** `frontend/js/components/review-page.js`

**修改方法：** `formatReportData()`

```javascript
formatReportData(report) {
    // ✅ 将agent_feedback中的score_change映射为improvement
    const agentFeedback = report.agent_feedback.map(feedback => ({
        agent: feedback.agent,
        improvement: feedback.score_change || 0,  // ← 字段映射
        suggestion: feedback.suggestion
    }));

    return {
        accuracy: report.metrics.accuracy,
        predictionCount: report.metrics.prediction_count,
        avgError: report.metrics.avg_error,
        discrepancies: report.discrepancies,
        agentFeedback: agentFeedback,  // ← 使用映射后的数据
        suggestions: report.suggestions
    };
}
```

---

## 验证修复

### 1. 检查数据源

```bash
# 查看最新复盘报告的Agent反馈
jq '.reports[0].agent_feedback[] | {agent, score_change}' data/review_reports.json
```

**输出：**
```json
{
  "agent": "量化分析师",
  "score_change": -8.5     ✅ 有效数字
}
{
  "agent": "�本面分析师",
  "score_change": 6.2      ✅ 有效数字
}
{
  "agent": "新闻分析师",
  "score_change": -12.3    ✅ 有效数字
}
{
  "agent": "风险分析师",
  "score_change": -2.8     ✅ 有效数字
}
```

### 2. 测试前端显示

打开浏览器访问：
```
http://localhost:8888/frontend/index.html
```

导航至：**复盘报告** Tab

**预期显示：**
```
量化分析师: ↓ 8.5%    ✅
基本面分析师: ↑ 6.2%   ✅
新闻分析师: ↓ 12.3%    ✅
风险分析师: ↓ 2.8%     ✅
```

---

## 数据含义说明

### score_change / improvement

**含义：** Agent表现的改进/退步

**数值解读：**
- **正值 (+)** = 改进，预测准确率提升
  - 例：`+6.2%` = 基本面分析师改进了6.2%

- **负值 (-)** = 退步，预测准确率下降
  - 例：`-8.5%` = 量化分析师退步了8.5%

**计算方式：**
```python
score_change = 当前评分 - 历史平均评分

# 示例
量化分析师历史平均: 35.0
当前评分: 26.5
score_change = 26.5 - 35.0 = -8.5  # 退步
```

---

## 完整示例

### 输入数据（后端）
```json
{
  "agent_feedback": [
    {
      "agent": "基本面分析师",
      "score_change": 6.2,
      "suggestion": "估值模型判断准确，对PE和PB的估值在合理区间"
    }
  ]
}
```

### 数据映射（前端）
```javascript
// formatReportData() 处理后
{
  agent: "基本面分析师",
  improvement: 6.2,  // ← score_change 映射为 improvement
  suggestion: "估值模型判断准确，对PE和PB的估值在合理区间"
}
```

### 页面显示
```
基本面分析师
↑ 6.2%  ✅
估值模型判断准确，对PE和PB的估值在合理区间
```

---

## 相关文件

| 文件 | 作用 | 状态 |
|------|------|------|
| `frontend/js/components/review-page.js` | 前端复盘页面 | ✅ 已修复 |
| `data/review_reports.json` | 复盘报告数据 | ✅ 数据正常 |
| `src/feedback/feedback_manager.py` | 后端反馈管理 | ✅ 已优化 |

---

## 测试步骤

### 方法1：浏览器测试

1. 打开浏览器
2. 访问 `http://localhost:8888/frontend/index.html`
3. 点击"复盘报告" Tab
4. 检查"Agent学习反馈"部分
5. ✅ 应显示具体百分比数字，不再是NaN

### 方法2：控制台测试

```javascript
// 在浏览器控制台执行
const app = document.querySelector('#app').__vue_app__;
const store = app.config.globalProperties.$store;
const currentStock = store.getCurrentStock();

console.log('当前股票:', currentStock?.code);

// 模拟数据格式化
const report = {
  agent_feedback: [
    { agent: '测试Agent', score_change: 5.5, suggestion: '测试建议' }
  ]
};

const agentFeedback = report.agent_feedback.map(feedback => ({
  agent: feedback.agent,
  improvement: feedback.score_change || 0,
  suggestion: feedback.suggestion
}));

console.log('格式化结果:', agentFeedback);
console.log('是否包含NaN:', agentFeedback.some(f => isNaN(f.improvement)));
// 预期输出: false
```

---

## 总结

✅ **问题已修复**

**修复内容：**
1. 前端数据映射：`score_change` → `improvement`
2. 后端数据优化：移除随机生成，使用真实数据
3. 日期处理优化：避免时区问题

**修复效果：**
- ✅ Agent反馈正常显示
- ✅ 百分比数值准确
- ✅ 无NaN错误

**访问地址：**
🌐 http://localhost:8888/frontend/index.html → 复盘报告

---

## 后续建议

1. **统一字段命名**
   - 建议后端直接使用 `improvement` 字段
   - 或前端统一使用 `score_change`

2. **数据类型检查**
   - 前端添加数据验证
   - 确保所有数值字段有效

3. **单元测试**
   - 添加数据格式化测试
   - 确保字段映射正确
