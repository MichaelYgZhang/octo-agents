# 股票分析平台页面重构实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将1358行单页面应用重构为模块化的Vue组件架构

**Architecture:** 基于Vue 3响应式系统的SPA，使用hash-based路由，组件化开发，状态集中管理

**Tech Stack:** Vue 3 (CDN), ECharts 5 (CDN), Axios (CDN), localStorage for persistence

---

## File Structure

```
frontend/
├── index.html (重构)              # 主入口页面
├── css/
│   └── style.css (新建)           # 提取的样式
└── js/
    ├── store.js (新建)            # 状态管理
    ├── api.js (新建)              # 数据获取
    ├── utils.js (新建)            # 工具函数
    └── components/
        ├── sidebar.js (新建)            # 侧边栏组件
        ├── analysis-page.js (新建)      # 实时分析页
        ├── prediction-page.js (新建)    # 预测白盒页
        ├── history-page.js (新建)       # 历史预测页
        ├── price-chart.js (新建)        # 股价图表
        ├── radar-chart.js (新建)        # 雷达图
        └── stock-card.js (新建)         # 股票卡片
```

---

## Task 1: 创建文件结构

**Files:**
- Create: `frontend/css/style.css`
- Create: `frontend/js/store.js`
- Create: `frontend/js/api.js`
- Create: `frontend/js/utils.js`
- Create: `frontend/js/components/` directory

- [ ] **Step 1: 创建目录结构**

```bash
mkdir -p frontend/css
mkdir -p frontend/js/components
touch frontend/css/style.css
touch frontend/js/store.js
touch frontend/js/api.js
touch frontend/js/utils.js
```

- [ ] **Step 2: 验证目录创建**

Run: `ls -la frontend/ frontend/css/ frontend/js/ frontend/js/components/`
Expected: 所有目录和文件都存在

- [ ] **Step 3: Commit**

```bash
git add frontend/
git commit -m "chore: create file structure for refactor"
```

---

## Task 2: 提取CSS样式

**Files:**
- Create: `frontend/css/style.css`
- Read: `frontend/index.html` (extract styles)

- [ ] **Step 1: 提取所有样式到独立文件**

从`frontend/index.html`的`<style>`标签中提取所有CSS（约800行），保存到`frontend/css/style.css`。

**关键提取规则：**
1. 保留所有样式规则
2. 添加页面命名空间前缀（如`.page-analysis`）用于隔离
3. 确保侧边栏样式独立（`.sidebar`）

- [ ] **Step 2: 验证CSS文件**

Run: `wc -l frontend/css/style.css`
Expected: 约800行

- [ ] **Step 3: Commit**

```bash
git add frontend/css/style.css
git commit -m "refactor: extract CSS to separate file"
```

---

## Task 3: 创建状态管理模块

**Files:**
- Create: `frontend/js/store.js`

- [ ] **Step 1: 实现Store模块**

```javascript
// frontend/js/store.js
const Store = Vue.reactive({
    stocks: [],
    selectedStock: null,
    stockHistory: {},
    currentPage: 'analysis',
    loading: false,
    error: null,

    setSelectedStock(code) {
        this.selectedStock = code;
        localStorage.setItem('selectedStock', code);
    },

    setCurrentPage(page) {
        this.currentPage = page;
        localStorage.setItem('currentPage', page);
        window.location.hash = page;
    },

    getCurrentStock() {
        return this.stocks.find(s => s.code === this.selectedStock);
    },

    init() {
        this.selectedStock = localStorage.getItem('selectedStock') || null;
        this.currentPage = localStorage.getItem('currentPage') || 'analysis';

        if (window.location.hash) {
            this.currentPage = window.location.hash.slice(1);
        }
    }
});
```

- [ ] **Step 2: 验证Store语法**

Run: 在浏览器控制台中验证`Store`对象存在且具有响应式属性

- [ ] **Step 3: Commit**

```bash
git add frontend/js/store.js
git commit -m "feat: create reactive store module"
```

---

## Task 4: 创建API模块

**Files:**
- Create: `frontend/js/api.js`

- [ ] **Step 1: 实现API模块**

```javascript
// frontend/js/api.js
const API = {
    currentRequestId: 0,

    async fetchAllStocks() {
        Store.loading = true;
        Store.error = null;

        const requestId = ++this.currentRequestId;

        try {
            const response = await axios.get('../data/latest.json');

            if (requestId !== this.currentRequestId) {
                return;
            }

            if (!Array.isArray(response.data)) {
                throw new Error('Invalid data format: expected array');
            }

            Store.stocks = response.data;

            for (const stock of response.data) {
                Store.stockHistory[stock.code] = stock.stock_history || [];
            }

            if (!Store.selectedStock && Store.stocks.length > 0) {
                Store.setSelectedStock(Store.stocks[0].code);
            }

        } catch (error) {
            Store.error = error.message;
            console.error('Failed to fetch stocks:', error);
        } finally {
            Store.loading = false;
        }
    }
};
```

- [ ] **Step 2: 验证API模块**

Run: 在浏览器控制台测试`API.fetchAllStocks()`，确认数据加载正确

- [ ] **Step 3: Commit**

```bash
git add frontend/js/api.js
git commit -m "feat: create API module with race condition protection"
```

---

## Task 5: 创建工具函数模块

**Files:**
- Create: `frontend/js/utils.js`

- [ ] **Step 1: 实现工具函数**

```javascript
// frontend/js/utils.js
const Utils = {
    formatVolume(volume) {
        if (!volume) return 'N/A';
        if (volume >= 100000000) {
            return (volume / 100000000).toFixed(2) + '亿';
        } else if (volume >= 10000) {
            return (volume / 10000).toFixed(2) + '万';
        }
        return volume.toString();
    },

    formatPrice(price) {
        return price ? `¥${price.toFixed(2)}` : 'N/A';
    },

    getLatestPrice(stock) {
        if (!stock || !stock.stock_history || stock.stock_history.length === 0) {
            return null;
        }
        return stock.stock_history[stock.stock_history.length - 1].close;
    },

    getPriceChange(stock) {
        if (!stock || !stock.stock_history || stock.stock_history.length < 2) {
            return 0;
        }
        const history = stock.stock_history;
        const current = history[history.length - 1].close;
        const previous = history[history.length - 2].close;
        return ((current - previous) / previous * 100);
    },

    getRecommendationText(rec) {
        const map = { buy: '买入', hold: '持有', sell: '卖出' };
        return map[rec] || 'N/A';
    }
};
```

- [ ] **Step 2: 验证工具函数**

Run: 在浏览器控制台测试`Utils.formatVolume(150000000)`返回`'1.50亿'`

- [ ] **Step 3: Commit**

```bash
git add frontend/js/utils.js
git commit -m "feat: create utility functions module"
```

---

## Task 6: 创建图表组件

**Files:**
- Create: `frontend/js/components/price-chart.js`
- Create: `frontend/js/components/radar-chart.js`

- [ ] **Step 1: 创建股价图表组件**

```javascript
// frontend/js/components/price-chart.js
const PriceChart = {
    template: '<div ref="chart" style="height: 450px;"></div>',
    props: {
        stockCode: String,
        data: {
            type: Array,
            required: true,
            validator(value) {
                return Array.isArray(value) && value.length > 0;
            }
        }
    },
    data() {
        return { chart: null };
    },
    mounted() {
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    },
    methods: {
        updateChart() {
            if (!this.chart || !this.data || this.data.length === 0) return;

            const dates = this.data.map(d => d.date);
            const prices = this.data.map(d => d.close);

            this.chart.setOption({
                title: { text: '股价走势', left: 'center' },
                tooltip: { trigger: 'axis' },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: { rotate: 45 }
                },
                yAxis: {
                    type: 'value',
                    name: '股价',
                    scale: true
                },
                series: [{
                    type: 'line',
                    data: prices,
                    smooth: true,
                    lineStyle: { color: '#667eea', width: 3 }
                }],
                grid: { left: '10%', right: '10%', bottom: '18%' }
            });
        },
        handleResize() {
            this.chart?.resize();
        }
    },
    watch: {
        data() {
            this.updateChart();
        }
    }
};

Vue.component('price-chart', PriceChart);
```

- [ ] **Step 2: 创建雷达图组件**

```javascript
// frontend/js/components/radar-chart.js
const RadarChart = {
    template: '<div ref="chart" style="height: 400px;"></div>',
    props: {
        scores: {
            type: Object,
            required: true,
            validator(value) {
                return value.quant !== undefined &&
                       value.fundamental !== undefined &&
                       value.news !== undefined &&
                       value.risk !== undefined;
            }
        }
    },
    data() {
        return { chart: null };
    },
    mounted() {
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        this.chart?.dispose();
    },
    methods: {
        updateChart() {
            if (!this.chart || !this.scores) return;

            this.chart.setOption({
                title: { text: '多维度评分', left: 'center' },
                radar: {
                    indicator: [
                        { name: '技术分析', max: 100 },
                        { name: '基本面', max: 100 },
                        { name: '舆情', max: 100 },
                        { name: '风险控制', max: 100 }
                    ]
                },
                series: [{
                    type: 'radar',
                    data: [{
                        value: [
                            this.scores.quant,
                            this.scores.fundamental,
                            this.scores.news,
                            100 - this.scores.risk
                        ],
                        areaStyle: { color: 'rgba(102, 126, 234, 0.3)' }
                    }]
                }]
            });
        },
        handleResize() {
            this.chart?.resize();
        }
    },
    watch: {
        scores: {
            handler() {
                this.updateChart();
            },
            deep: true
        }
    }
};

Vue.component('radar-chart', RadarChart);
```

- [ ] **Step 3: Commit**

```bash
git add frontend/js/components/
git commit -m "feat: create chart components with proper lifecycle"
```

---

## Task 7: 创建侧边栏组件

**Files:**
- Create: `frontend/js/components/sidebar.js`

- [ ] **Step 1: 实现侧边栏组件**

```javascript
// frontend/js/components/sidebar.js
const Sidebar = {
    template: `
        <div class="sidebar">
            <div class="logo">
                <h1>股票分析平台</h1>
            </div>
            <div class="nav-items">
                <div class="nav-item"
                     v-for="item in navItems"
                     :key="item.id"
                     :class="{active: currentPage === item.id}"
                     @click="navigate(item.id)">
                    {{ item.icon }} {{ item.label }}
                </div>
            </div>

            <div class="stock-selector">
                <select v-model="selectedStock">
                    <option v-for="stock in stocks" :key="stock.code" :value="stock.code">
                        {{ stock.name }} ({{ stock.code }})
                    </option>
                </select>
            </div>
        </div>
    `,
    data() {
        return {
            navItems: [
                { id: 'analysis', icon: '📈', label: '实时分析' },
                { id: 'prediction', icon: '🎯', label: '预测白盒' },
                { id: 'history', icon: '📊', label: '历史预测' }
            ]
        };
    },
    computed: {
        stocks() {
            return Store.stocks;
        },
        currentPage() {
            return Store.currentPage;
        },
        selectedStock: {
            get() {
                return Store.selectedStock;
            },
            set(value) {
                Store.setSelectedStock(value);
            }
        }
    },
    methods: {
        navigate(page) {
            Store.setCurrentPage(page);
        }
    }
};

Vue.component('sidebar', Sidebar);
```

- [ ] **Step 2: Commit**

```bash
git add frontend/js/components/sidebar.js
git commit -m "feat: create sidebar component with navigation and stock selector"
```

---

## Task 8: 创建页面组件（实时分析页）

**Files:**
- Create: `frontend/js/components/analysis-page.js`

- [ ] **Step 1: 实现实时分析页面组件**

从`frontend/index.html`的实时分析Tab内容（约400行）提取并重构。

**关键要点：**
1. 使用Vue computed属性获取Store数据
2. 使用`v-if`处理加载/错误/空状态
3. 使用可选链操作符`?.`防止null错误
4. 使用`<price-chart>`组件替代手动图表渲染
5. 调用Utils方法格式化数据

- [ ] **Step 2: 验证组件功能**

在浏览器中测试：
- 页面正常显示
- 图表正常渲染
- 空值处理正确

- [ ] **Step 3: Commit**

```bash
git add frontend/js/components/analysis-page.js
git commit -m "feat: create analysis page component with error handling"
```

---

## Task 9: 创建页面组件（预测白盒页）

**Files:**
- Create: `frontend/js/components/prediction-page.js`

- [ ] **Step 1: 实现预测白盒页面组件**

从`frontend/index.html`的预测白盒Tab内容（约600行）提取并重构。

**关键要点：**
1. 包含战略分析、产品动态、国际战争影响等模块
2. 使用`<radar-chart>`组件显示多维度评分
3. 所有嵌套属性访问都要有空值检查
4. 数据来源透明化展示

- [ ] **Step 2: Commit**

```bash
git add frontend/js/components/prediction-page.js
git commit -m "feat: create prediction page component with radar chart"
```

---

## Task 10: 创建页面组件（历史预测页）

**Files:**
- Create: `frontend/js/components/history-page.js`

- [ ] **Step 1: 实现历史预测页面组件**

从`frontend/index.html`的历史预测Tab内容（约200行）提取并重构。

**关键要点：**
1. 显示历史预测准确率
2. 使用图表展示历史数据
3. Mock数据提示用户未来功能

- [ ] **Step 2: Commit**

```bash
git add frontend/js/components/history-page.js
git commit -m "feat: create history page component"
```

---

## Task 11: 重构主应用文件

**Files:**
- Modify: `frontend/index.html`

- [ ] **Step 1: 重构HTML结构**

将`frontend/index.html`替换为新的模块化结构：

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>股票分析平台</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app">
        <sidebar></sidebar>
        <div class="content">
            <component :is="currentPage"></component>
        </div>
    </div>

    <!-- CDN Dependencies -->
    <script src="https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>

    <!-- Application Code -->
    <script src="js/store.js"></script>
    <script src="js/api.js"></script>
    <script src="js/utils.js"></script>
    <script src="js/components/price-chart.js"></script>
    <script src="js/components/radar-chart.js"></script>
    <script src="js/components/sidebar.js"></script>
    <script src="js/components/analysis-page.js"></script>
    <script src="js/components/prediction-page.js"></script>
    <script src="js/components/history-page.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 2: 创建app.js主应用文件**

```javascript
// frontend/js/app.js
const app = new Vue({
    el: '#app',
    data: Store,
    components: {
        'analysis': AnalysisPage,
        'prediction': PredictionPage,
        'history': HistoryPage
    }
});

// Browser history support
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'analysis';
    Store.setCurrentPage(page);
});

// Initialize
Store.init();

if (!window.location.hash) {
    window.location.hash = Store.currentPage;
} else {
    window.dispatchEvent(new Event('hashchange'));
}

// Load data
API.fetchAllStocks();
```

- [ ] **Step 3: 验证应用功能**

Run: `curl http://localhost:8080/frontend/`
Expected: HTML返回200

在浏览器中测试：
1. 页面正常加载
2. 侧边栏显示正确
3. 页面切换正常
4. 股票选择器工作
5. 图表正常渲染

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/js/app.js
git commit -m "refactor: complete main app restructure with Vue components"
```

---

## Task 12: 清理和测试

**Files:**
- Test: 所有功能

- [ ] **Step 1: 功能测试清单**

在浏览器中验证：
- [ ] 实时分析页正常显示
- [ ] 预测白盒页正常显示
- [ ] 历史预测页正常显示
- [ ] 股价图表正常渲染
- [ ] 雷达图正常渲染
- [ ] 页面切换流畅
- [ ] 股票选择器工作
- [ ] 浏览器历史记录可用
- [ ] 刷新后状态保持
- [ ] 无JavaScript错误

- [ ] **Step 2: 性能验证**

检查：
- 文件大小合理（每个文件<300行）
- 浏览器控制台无错误
- Network标签显示所有资源加载成功

- [ ] **Step 3: 最终commit**

```bash
git add -A
git commit -m "refactor: complete page restructure

- Extract CSS to separate file
- Create Store, API, Utils modules
- Create Vue components for sidebar, charts, pages
- Implement hash-based routing with browser history
- Add localStorage persistence
- Fix all null pointer issues
- Reduce main file from 1358 lines to ~50 lines

Fixes: Page maintainability and code organization"
```

---

## Verification Commands

```bash
# Check file structure
find frontend -type f | sort

# Verify file sizes
wc -l frontend/index.html
wc -l frontend/css/style.css
wc -l frontend/js/*.js
wc -l frontend/js/components/*.js

# Test in browser
open http://localhost:8080/frontend/

# Verify no console errors
# Check Network tab for all resources
# Test page navigation and stock selection
```

---

## Success Criteria

- [ ] 所有文件创建完成
- [ ] 主HTML文件从1358行减少到<50行
- [ ] 每个JS文件<300行
- [ ] 所有页面功能正常
- [ ] 无JavaScript错误
- [ ] 浏览器历史记录可用
- [ ] 刷新后状态保持
- [ ] 代码可维护性大幅提升
