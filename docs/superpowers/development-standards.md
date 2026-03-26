---
name: development-standards
description: 开发标准和自我Review要求，确保每次改动符合预期
type: feedback
---

# 开发标准和自我Review要求

## 核心要求

**每次调整之后都要自我Review，确认改动是否符合预期，并最后给出结论。**

## 自我Review清单

### 1. 代码改动Review

**前端改动：**
- ✅ HTML标签是否完全闭合？（使用工具验证）
- ✅ Vue.js语法是否正确？
- ✅ CSS样式是否有语法错误？
- ✅ JavaScript逻辑是否有错误？
- ✅ 数据绑定是否正确？

**后端改动：**
- ✅ Python语法是否正确？
- ✅ 导入路径是否正确？
- ✅ 数据结构是否符合预期？
- ✅ API调用是否正确？

**数据库/文件改动：**
- ✅ 数据格式是否正确？
- ✅ 文件路径是否正确？
- ✅ 权限是否正确？

### 2. 功能验证

**页面功能：**
- ✅ 页面是否能正常访问？（curl测试）
- ✅ 数据是否能正常加载？
- ✅ 交互功能是否正常？
- ✅ 是否有JavaScript错误？（浏览器控制台）

**API功能：**
- ✅ API是否能正常返回数据？
- ✅ 数据结构是否符合预期？
- ✅ 错误处理是否完善？

### 3. 结构验证

**HTML结构：**
```bash
# 验证div标签是否平衡
python3 << 'PYEOF'
with open('frontend/index.html', 'r') as f:
    lines = f.readlines()

total_open = sum(l.count('<div') for l in lines)
total_close = sum(l.count('</div>') for l in lines)

depth = 0
for i, line in enumerate(lines, 1):
    open_divs = line.count('<div')
    close_divs = line.count('</div>')
    depth += open_divs - close_divs
    if depth < 0:
        print(f"❌ 第{i}行: 标签不平衡")

if depth == 0:
    print(f"✅ 标签完全平衡")
PYEOF
```

**数据结构：**
```bash
# 验证JSON数据结构
python3 -c "
import json
with open('data/latest.json', 'r') as f:
    data = json.load(f)
    print(f'✅ 数据结构正确，共{len(data)}条记录')
"
```

### 4. 提交前检查

**必须验证：**
- ✅ 代码是否能正常运行？
- ✅ 页面是否能正常访问？
- ✅ 功能是否符合预期？
- ✅ 是否有明显的bug？

**提交信息要求：**
```
feat/fix: 简短描述

**问题：**
描述发现的问题

**修复：**
描述修复的内容

**验证：**
列出验证步骤和结果

**原因：**
说明问题产生的原因

**自我Review：**
✅ 验证项1
✅ 验证项2
...
```

## 本次修复案例

### 问题发现
用户反馈：页面挂了

### 问题诊断
1. 使用curl测试页面可访问性 → 200 OK
2. 检查HTML标签平衡 → 发现3个多余的</div>
3. 定位问题位置 → 预测白盒Tab和历史预测Tab

### 修复过程
1. 删除预测白盒Tab结束部分的2个多余</div>
2. 删除页面底部的1个多余</div>
3. 验证修复 → 标签完全平衡

### 自我Review
✅ HTML结构验证通过（193个<div> = 193个</div>）
✅ 页面可正常访问
✅ 数据加载正常
✅ 功能符合预期

### 结论
**修复成功，页面恢复正常。**

## 教训和改进

### 问题案例记录

#### 案例1：HTML标签未闭合导致页面崩溃
**日期：** 2026-03-26
**问题：** 添加战略分析模块时，手动复制粘贴HTML代码，没有仔细检查标签闭合，导致多了3个`</div>`标签。

**错误表现：**
- 页面完全空白
- 浏览器控制台报错：`Uncaught TypeError: Cannot read properties of undefined (reading 'quant')`

**根本原因：**
1. HTML标签不平衡（196个`</div>` vs 193个`<div>`）
2. Vue模板中访问`currentStock.quant`时，`currentStock`为`undefined`

**修复过程：**
1. 删除3个多余的`</div>`标签
2. 验证标签平衡：193 = 193
3. 问题仍然存在！

**深层原因分析：**
- Vue模板中使用了嵌套的`v-if`判断
- `v-else-if="activeTab === 'analysis'"`块内有`<div v-if="currentStock">`
- 当`loading`变为`false`时，外层div立即渲染
- 但此时`currentStock`可能为`undefined`（数据还未加载完成）
- Vue在编译模板时会评估`:class`等绑定表达式，即使`v-if`为`false`
- 导致访问`currentStock.quant`时出错

**正确修复：**
将`currentStock`的判断移到外层：
```html
<!-- 错误写法 -->
<div v-else-if="activeTab === 'analysis'" class="card">
    <div v-if="currentStock">
        <!-- 内容 -->
    </div>
</div>

<!-- 正确写法 -->
<div v-else-if="activeTab === 'analysis' && currentStock" class="card">
    <!-- 内容 -->
</div>
```

**预防措施：**
1. **每次修改HTML后立即验证标签平衡**
2. **使用编辑器的标签高亮功能**
3. **在浏览器中测试页面是否正常显示**
4. **提交前运行自动化验证脚本**
5. **Vue模板中避免嵌套的`v-if`访问可能为`undefined`的对象**
6. **在外层就做好空值判断，不要依赖内层`v-if`**
7. **所有对`currentStock`的访问都应该在确保其存在的条件下进行**

**自动化检测：**
- 创建了验证脚本，检测HTML标签平衡
- 检测Vue应用结构完整性
- 检测数据加载和绑定
- 但无法检测运行时JavaScript错误（需要浏览器实际测试）

**教训：**
- 自动化检查通过 ≠ 页面正常工作
- 必须在浏览器中实际测试页面渲染
- Vue模板的条件判断要谨慎设计
- 避免在模板中访问可能为`undefined`的对象属性

#### 案例2：Vue模板空值保护不足导致运行时错误
**日期：** 2026-03-26
**问题：** 虽然在Vue模板外层添加了`&& currentStock`判断，但某些方法在接收参数时没有空值检查，导致运行时错误。

**错误表现：**
- 浏览器控制台报错：`Uncaught TypeError: Cannot read properties of undefined (reading 'quant')`
- 指向`getOverallConfidence`函数

**根本原因：**
1. Vue模板外层有`v-else-if="activeTab === 'prediction' && currentStock"`判断
2. 但模板内的表达式`{{ (getOverallConfidence(currentStock) * 100).toFixed(0) }}`可能被提前评估
3. `getOverallConfidence`函数没有空值检查
4. 当`currentStock`为`undefined`时访问`stock.quant`出错

**修复方案：**
为所有接收`stock`参数的函数添加空值检查：
```javascript
getOverallConfidence(stock) {
    if (!stock || !stock.quant || !stock.fundamental || !stock.news || !stock.risk) {
        return 0;
    }
    return (
        stock.quant.confidence * 0.25 +
        stock.fundamental.confidence * 0.30 +
        stock.news.confidence * 0.25 +
        stock.risk.confidence * 0.20
    );
}
```

**预防措施：**
1. **所有JavaScript函数都要添加参数空值检查**
2. **不能完全依赖Vue模板的v-if判断**
3. **防御式编程：假设参数可能为null/undefined**
4. **在函数开始就返回默认值，避免深层访问时报错**
5. **测试时传入undefined/null参数验证函数健壮性**

**最佳实践：**
```javascript
// 好的做法：多层空值检查
function getOverallConfidence(stock) {
    if (!stock) return 0;  // 第一层：检查对象本身
    if (!stock.quant || !stock.fundamental || !stock.news || !stock.risk) {
        return 0;  // 第二层：检查嵌套属性
    }
    // 安全访问
    return stock.quant.confidence * 0.25 + ...;
}

// 坏的做法：直接访问
function getOverallConfidence(stock) {
    return stock.quant.confidence * 0.25 + ...;  // 可能崩溃
}
```

**验证清单：**
- ✅ 所有接收参数的函数都有空值检查
- ✅ 访问嵌套属性前先检查父对象
- ✅ 为空值情况提供合理的默认返回值
- ✅ 在浏览器中实际测试页面，检查控制台无错误

#### 案例3：浏览器缓存导致Vue模板语法直接显示
**日期：** 2026-03-26
**问题：** 修复代码后，浏览器仍然显示原始的Vue模板语法`{{ currentStock.name }}`。

**错误表现：**
- 页面显示：`({{ currentStock.quant.score.toFixed(1) }}/100)`
- Vue模板语法没有被渲染

**根本原因：**
1. 浏览器缓存了旧版本的HTML文件
2. 强制刷新页面后问题解决

**解决方法：**
1. 清除浏览器缓存：`Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 强制刷新页面：`Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)
3. 如果仍不work，重启HTTP服务器

**预防措施：**
- 开发时禁用浏览器缓存
- 每次修改后强制刷新页面
- 使用无痕模式测试（不会缓存）

### 问题原因（原版）
在添加战略分析模块时，手动复制粘贴HTML代码，没有仔细检查标签闭合，导致多了3个</div>标签。

### 预防措施
1. **每次修改HTML后立即验证标签平衡**
2. **使用编辑器的标签高亮功能**
3. **在浏览器中测试页面是否正常显示**
4. **提交前运行自动化验证脚本**

### 标准流程

**添加新功能时：**
1. 编写代码
2. **立即验证**（不要等最后）
3. 测试功能
4. 提交代码
5. **自我Review并记录结论**

**修复bug时：**
1. 定位问题
2. 修复代码
3. **验证修复**
4. 测试相关功能
5. 提交代码
6. **自我Review并记录结论**

## 工具和脚本

### HTML验证脚本
```bash
# 保存为 validate_html.py
with open('frontend/index.html', 'r') as f:
    lines = f.readlines()

depth = 0
errors = []
for i, line in enumerate(lines, 1):
    open_divs = line.count('<div')
    close_divs = line.count('</div>')
    depth += open_divs - close_divs
    if depth < 0:
        errors.append((i, line.strip()[:50]))

if errors:
    print("❌ 发现标签错误:")
    for line_num, content in errors:
        print(f"  第{line_num}行: {content}")
else:
    print(f"✅ HTML结构正确，最终深度: {depth}")
```

### 快速测试命令
```bash
# 测试页面访问
curl -I http://localhost:8080/frontend/

# 检查数据
python3 -c "import json; print(json.load(open('data/latest.json'))[0]['code'])"

# 运行分析
python3 run_local.py
```

## 记录和文档

**每次改动后记录：**
1. 改动内容
2. 改动原因
3. 验证步骤
4. **最终结论**（是否符合预期）

**使用commit message记录：**
- 问题：描述发现的问题
- 修复：描述修复的内容
- 验证：列出验证步骤和结果
- 原因：说明问题产生的原因
- 自我Review：列出所有验证项

## 总结

**核心原则：**
1. 每次改动立即验证
2. 使用工具自动化验证
3. 记录验证结果
4. **给出明确结论**

**成功标准：**
- ✅ 代码运行正常
- ✅ 页面显示正常
- ✅ 功能符合预期
- ✅ 无明显bug
- ✅ **自我Review完成**
