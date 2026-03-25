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

### 问题原因
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
