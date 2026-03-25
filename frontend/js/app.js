// 主应用文件 - 使用Vue 3 API
const app = Vue.createApp({
    data() {
        return Store;
    },
    computed: {
        currentPageComponent() {
            return this.currentPage;
        }
    }
});

// 注册组件
app.component('sidebar', Sidebar);
app.component('price-chart', PriceChart);
app.component('radar-chart', RadarChart);
app.component('analysis', AnalysisPage);
app.component('prediction', PredictionPage);
app.component('history', HistoryPage);

// 挂载应用
app.mount('#app');

// 浏览器历史记录支持
window.addEventListener('hashchange', () => {
    const page = window.location.hash.slice(1) || 'analysis';
    Store.setCurrentPage(page);
});

// 初始化
Store.init();

if (!window.location.hash) {
    window.location.hash = Store.currentPage;
} else {
    window.dispatchEvent(new Event('hashchange'));
}

// 加载数据
API.fetchAllStocks();
