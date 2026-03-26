---
title: 页面重构设计文档
created: 2026-03-26
status: approved
---

# 股票分析平台页面重构设计

## 目标

将现有的单页面应用（1358行的index.html）重构为多页面应用架构，提升代码可维护性和可扩展性。

## 核心原则

- **数据与页面分离** - JavaScript逻辑独立于HTML
- **组件化架构** - 可复用的UI组件
- **按需加载** - 页面片段动态加载，提升性能
- **状态共享** - 多页面共享选中状态
- **安全性优先** - 使用安全的DOM操作，避免XSS风险

## 文件结构

```
frontend/
├── index.html              # 主入口页面（侧边栏 + 内容容器）
├── css/
│   └── style.css          # 所有样式（从index.html提取）
└── js/
    ├── app.js             # 主应用：初始化、路由、状态管理
    ├── store.js           # 状态管理：选中股票、数据缓存（Vue.reactive）
    ├── api.js             # API：数据获取、请求取消
    ├── utils.js           # 工具函数：格式化、校验
    └── components/
        ├── sidebar.js     # 侧边栏导航
        ├── analysis-page.js     # 实时分析页面组件
        ├── prediction-page.js   # 预测白盒页面组件
        ├── history-page.js      # 历史预测页面组件
        ├── price-chart.js       # 股价图表组件
        ├── radar-chart.js       # 雷达图组件
        └── stock-card.js        # 股票信息卡片组件

总计：11个文件，每个文件100-300行
注意：不使用HTML页面片段，完全基于Vue组件路由
```

## 架构设计

### 1. 主页面（index.html）

```html
<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="app">
        <!-- 侧边栏导航 -->
        <div class="sidebar">...</div>

        <!-- 内容区域（Vue动态渲染） -->
        <div class="content" id="page-content">
            <component :is="currentPage"></component>
        </div>
    </div>

    <!-- 依赖库 -->
    <script src="vue-cdn"></script>
    <script src="echarts-cdn"></script>
    <script src="axios-cdn"></script>

    <!-- 应用代码 -->
    <script src="js/store.js"></script>
    <script src="js/api.js"></script>
    <script src="js/utils.js"></script>
    <script src="js/components/sidebar.js"></script>
    <script src="js/components/charts.js"></script>
    <script src="js/app.js"></script>
</body>
</html>
```

### 2. 状态管理（store.js）

使用Vue 3的reactive API，无需手动事件通知：

```javascript
// 创建响应式状态
const Store = Vue.reactive({
    stocks: [],
    selectedStock: null,
    stockHistory: {},
    currentPage: 'analysis',
    loading: false,
    error: null,

    // Actions - 直接修改，Vue自动触发更新
    setSelectedStock(code) {
        this.selectedStock = code;
        // 持久化到localStorage
        localStorage.setItem('selectedStock', code);
    },

    setCurrentPage(page) {
        this.currentPage = page;
        localStorage.setItem('currentPage', page);
        // 更新URL hash
        window.location.hash = page;
    },

    getCurrentStock() {
        return this.stocks.find(s => s.code === this.selectedStock);
    },

    // 初始化时从localStorage恢复
    init() {
        this.selectedStock = localStorage.getItem('selectedStock') || null;
        this.currentPage = localStorage.getItem('currentPage') || 'analysis';
        // 恢复URL hash
        if (window.location.hash) {
            this.currentPage = window.location.hash.slice(1);
        }
    }
});
```

### 3. Vue应用与路由（app.js）

实现hash-based路由，支持浏览器历史记录和深度链接：

```javascript
// 页面组件（稍后定义）
const AnalysisPage = { /* ... */ };
const PredictionPage = { /* ... */ };
const HistoryPage = { /* ... */ };

// 主应用
const app = new Vue({
    el: '#app',
    data: Store,  // 直接使用响应式Store
    components: {
        'analysis': AnalysisPage,
        'prediction': PredictionPage,
        'history': HistoryPage
    },
    computed: {
        currentPageComponent() {
            return this.currentPage;
        }
    }
});

// 浏览器历史记录支持
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'analysis';
    Store.setCurrentPage(page);
});

// 页面加载时恢复状态
Store.init();

// 如果URL没有hash，设置默认值
if (!window.location.hash) {
    window.location.hash = Store.currentPage;
} else {
    // 触发hashchange以同步状态
    window.dispatchEvent(new Event('hashchange'));
}
```

### 4. 组件化设计

**API层（api.js）：**
```javascript
const API = {
    currentRequestId: 0,  // 防止竞态条件

    async fetchAllStocks() {
        Store.loading = true;
        Store.error = null;

        const requestId = ++this.currentRequestId;

        try {
            const response = await axios.get('../data/latest.json');

            // 确保这是最新的请求
            if (requestId !== this.currentRequestId) {
                return;
            }

            Store.stocks = response.data;

            // 初始化历史数据缓存
            for (const stock of response.data) {
                Store.stockHistory[stock.code] = stock.stock_history || [];
            }

            // 如果没有选中的股票，默认选择第一个
            if (!Store.selectedStock && Store.stocks.length > 0) {
                Store.setSelectedStock(Store.stocks[0].code);
            }

        } catch (error) {
            Store.error = error.message;
            console.error('Failed to fetch stocks:', error);
        } finally {
            Store.loading = false;
        }
    },

    async fetchStockData(code) {
        // 实现单个股票数据获取
        // 带请求取消功能
    }
};
```

**工具函数（utils.js）：**
```javascript
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
    }
};
```

**侧边栏组件（sidebar.js）：**
```javascript
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

            <!-- 股票选择器 -->
            <div class="stock-selector">
                <select v-model="selectedStock" @change="onStockChange">
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
        },
        onStockChange() {
            // 股票变化时可以触发额外的操作
            // 比如重新加载数据
        }
    }
};

Vue.component('sidebar', Sidebar);
```

**图表组件（price-chart.js）：**
```javascript
// 股价图表组件 - 正确的生命周期管理
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
        return {
            chart: null
        };
    },
    mounted() {
        // 初始化图表
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();

        // 监听窗口大小变化
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        // 清理资源
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
                title: {
                    text: '股价走势',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis'
                },
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
                    lineStyle: { color: '#667eea' }
                }],
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '18%'
                }
            });
        },
        handleResize() {
            this.chart?.resize();
        }
    },
    watch: {
        // 数据变化时自动更新图表
        data() {
            this.updateChart();
        }
    }
};

// 注册为全局组件
Vue.component('price-chart', PriceChart);
```

**雷达图组件（radar-chart.js）：**
```javascript
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
                title: {
                    text: '多维度评分',
                    left: 'center'
                },
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
                        areaStyle: {
                            color: 'rgba(102, 126, 234, 0.3)'
                        }
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

### 5. 页面组件示例

**实时分析页面组件（analysis-page.js）：**
```javascript
const AnalysisPage = {
    template: `
        <div class="page-analysis">
            <!-- 加载状态 -->
            <div v-if="loading" class="loading">
                <p>正在加载数据...</p>
            </div>

            <!-- 错误状态 -->
            <div v-else-if="error" class="error">
                <p>加载失败: {{ error }}</p>
                <button @click="retry">重试</button>
            </div>

            <!-- 空状态 -->
            <div v-else-if="!stock" class="empty">
                <p>请选择一只股票</p>
            </div>

            <!-- 正常状态 -->
            <div v-else class="content">
                <h2>{{ stock.name }} ({{ stock.code }})</h2>

                <!-- 最新股价 -->
                <div class="latest-price">
                    <span>最新股价: </span>
                    <span :class="priceClass">
                        {{ formatPrice(latestPrice) }}
                    </span>
                    <span style="color: #909399; margin-left: 10px;">
                        ({{ latestDate }})
                    </span>
                </div>

                <!-- 综合评分 -->
                <div class="score">{{ stock.overall_score?.toFixed(1) || 'N/A' }}</div>

                <!-- 建议和风险 -->
                <div class="recommendation-section">
                    <span :class="['recommendation', stock.recommendation]">
                        {{ recommendationText }}
                    </span>
                    <span style="color: #909399;">风险: {{ stock.risk_level || 'N/A' }}</span>
                </div>

                <!-- 股价图表 -->
                <price-chart
                    v-if="stockHistory.length > 0"
                    :stock-code="stock.code"
                    :data="stockHistory">
                </price-chart>

                <!-- 详细指标 -->
                <div class="metrics">
                    <div class="metric-card">
                        <h4>技术分析</h4>
                        <div class="metric-row">
                            <span>评分:</span>
                            <span>{{ stock.quant?.score?.toFixed(1) || 'N/A' }}</span>
                        </div>
                        <div class="metric-row">
                            <span>交易信号:</span>
                            <span>{{ stock.quant?.details?.signal || 'N/A' }}</span>
                        </div>
                    </div>

                    <div class="metric-card">
                        <h4>基本面分析</h4>
                        <div class="metric-row">
                            <span>评分:</span>
                            <span>{{ stock.fundamental?.score?.toFixed(1) || 'N/A' }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    computed: {
        loading() {
            return Store.loading;
        },
        error() {
            return Store.error;
        },
        stock() {
            return Store.getCurrentStock();
        },
        stockHistory() {
            if (!this.stock) return [];
            return Store.stockHistory[this.stock.code] || [];
        },
        latestPrice() {
            return Utils.getLatestPrice(this.stock);
        },
        latestDate() {
            if (!this.stock?.stock_history?.length) return '-';
            return this.stock.stock_history[this.stock.stock_history.length - 1].date;
        },
        priceClass() {
            const change = Utils.getPriceChange(this.stock);
            if (change > 0) return 'price-up';
            if (change < 0) return 'price-down';
            return '';
        },
        recommendationText() {
            const map = { buy: '买入', hold: '持有', sell: '卖出' };
            return map[this.stock?.recommendation] || 'N/A';
        }
    },
    methods: {
        formatPrice(price) {
            return Utils.formatPrice(price);
        },
        retry() {
            API.fetchAllStocks();
        }
    }
};
```

## 数据流

```
应用启动 → API.fetchAllStocks()
         → Store.stocks更新（Vue响应式）
         → 所有组件自动更新
         → 用户操作（选择股票/切换页面）
         → Store方法调用
         → 自动持久化 + URL更新
         → Vue自动重新渲染
```

**完整初始化流程：**

1. **页面加载**
   - index.html加载所有JS文件
   - app.js执行，创建Vue实例
   - Store.init()从localStorage恢复状态

2. **数据获取**
   - API.fetchAllStocks()被调用
   - Store.loading = true（显示加载状态）
   - 数据返回后更新Store.stocks
   - Store.loading = false

3. **路由处理**
   - hashchange事件监听
   - Store.currentPage更新
   - Vue动态渲染对应组件

4. **状态持久化**
   - selectedStock/currentPage保存到localStorage
   - URL hash同步更新
   - 浏览器历史记录可用

## 状态共享

三个页面共享状态：
- **选中的股票** - `Store.state.selectedStock`
- **股票数据** - `Store.state.stocks`
- **历史数据** - `Store.state.stockHistory`
- **当前页面** - `Store.state.currentPage`

切换页面时：
1. Vue自动响应状态变化
2. 渲染对应的页面组件
3. 组件从Store读取数据
4. 无需手动DOM操作

## 样式分离

从index.html提取所有`<style>`标签内容到`css/style.css`：
- 约800行CSS代码
- 包含所有组件样式
- 页面特定样式使用`.page-analysis`等类名隔离

## 实施步骤

1. **创建文件结构** - 建立目录和文件
2. **提取CSS** - 将样式分离到`css/style.css`
3. **创建Store** - 实现状态管理`js/store.js`
4. **创建工具函数** - `js/utils.js`和`js/api.js`
5. **创建组件** - 侧边栏、图表组件
6. **拆分页面组件** - 将三个Tab内容转换为Vue组件
7. **重构主应用** - 整合Vue路由和状态管理
8. **测试验证** - 确保功能完整

## 优势

1. **可维护性** - 每个文件职责单一，100-300行
2. **可扩展性** - 新增页面只需添加组件和注册
3. **性能** - Vue响应式更新，无需手动DOM操作
4. **安全性** - 使用Vue模板，自动转义，防止XSS
5. **开发体验** - 组件化开发，代码复用性高

## 安全考虑

### 1. XSS防护

**使用Vue模板语法自动转义：**
```javascript
// ✅ 安全 - Vue自动转义HTML
template: `<div>{{ stock.name }}</div>`

// ❌ 危险 - 不要使用v-html（除非绝对必要）
template: `<div v-html="stock.name"></div>`
```

**如果必须渲染HTML，使用DOMPurify：**
```javascript
import DOMPurify from 'dompurify';

const SafeHtml = {
    props: ['html'],
    template: '<div v-html="sanitizedHtml"></div>',
    computed: {
        sanitizedHtml() {
            return DOMPurify.sanitize(this.html);
        }
    }
};
```

### 2. 数据验证

**API数据验证：**
```javascript
// api.js
function validateStockData(data) {
    if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
    }

    for (const stock of data) {
        if (!stock.code || !stock.name) {
            throw new Error('Missing required fields: code, name');
        }
        // 更多验证...
    }

    return true;
}

async fetchAllStocks() {
    const response = await axios.get('../data/latest.json');
    if (validateStockData(response.data)) {
        Store.stocks = response.data;
    }
}
```

**组件Prop验证：**
```javascript
const StockCard = {
    props: {
        stock: {
            type: Object,
            required: true,
            validator(value) {
                return value.code && value.name && typeof value.overall_score === 'number';
            }
        }
    }
};
```

### 3. 错误边界

**Vue错误捕获：**
```javascript
// app.js
const app = new Vue({
    // ...
    errorCaptured(err, vm, info) {
        console.error('Vue error:', err, info);
        Store.error = err.message;
        // 阻止错误继续传播
        return false;
    }
});

// 全局错误处理
window.onerror = function(msg, url, line, col, error) {
    console.error('Global error:', msg, url, line);
    Store.error = msg;
    return false;
};
```

### 4. 敏感信息保护

**不在客户端存储敏感信息：**
```javascript
// ❌ 不要存储API密钥
localStorage.setItem('apiKey', 'secret-key');

// ✅ 可以存储用户偏好
localStorage.setItem('selectedStock', '03690.HK');
```

## 测试策略

### 单元测试

**测试工具函数：**
```javascript
// tests/utils.test.js
describe('Utils', () => {
    test('formatVolume formats large numbers correctly', () => {
        expect(Utils.formatVolume(150000000)).toBe('1.50亿');
        expect(Utils.formatVolume(15000)).toBe('1.50万');
    });

    test('getLatestPrice handles empty data', () => {
        expect(Utils.getLatestPrice(null)).toBe(null);
        expect(Utils.getLatestPrice({})).toBe(null);
    });
});
```

### 组件测试

**测试页面组件：**
```javascript
// tests/analysis-page.test.js
import { mount } from '@vue/test-utils';

describe('AnalysisPage', () => {
    test('shows loading state', () => {
        Store.loading = true;
        const wrapper = mount(AnalysisPage);
        expect(wrapper.find('.loading').exists()).toBe(true);
    });

    test('shows error state', () => {
        Store.error = 'Network error';
        const wrapper = mount(AnalysisPage);
        expect(wrapper.find('.error').text()).toContain('Network error');
    });
});
```

### 集成测试

**测试完整流程：**
```javascript
describe('Stock Selection Flow', () => {
    test('selecting stock updates all pages', async () => {
        // 1. 加载数据
        await API.fetchAllStocks();

        // 2. 选择股票
        Store.setSelectedStock('03690.HK');

        // 3. 验证状态
        expect(Store.selectedStock).toBe('03690.HK');
        expect(localStorage.getItem('selectedStock')).toBe('03690.HK');

        // 4. 切换页面
        Store.setCurrentPage('prediction');
        expect(window.location.hash).toBe('#prediction');
    });
});
```

## 性能优化

### 1. 懒加载组件

```javascript
// 仅在需要时加载组件
const PredictionPage = () => import('./components/prediction-page.js');
```

### 2. 防抖和节流

```javascript
// 对频繁操作进行防抖
import { debounce } from 'lodash';

const Sidebar = {
    methods: {
        onStockChange: debounce(function() {
            // 防抖处理
        }, 300)
    }
};
```

### 3. 虚拟滚动

对于大量数据列表，使用虚拟滚动：
```javascript
import { VirtualList } from 'vue-virtual-scroll-list';

Vue.component('stock-list', {
    components: { VirtualList },
    template: `
        <virtual-list :size="50" :remain="10">
            <div v-for="stock in stocks" :key="stock.code">
                {{ stock.name }}
            </div>
        </virtual-list>
    `
});
```
