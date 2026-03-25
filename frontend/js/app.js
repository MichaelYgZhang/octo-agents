// 主应用文件 - 路由和初始化
const app = new Vue({
    el: '#app',
    data: Store,
    components: {
        'analysis': AnalysisPage,
        'prediction': PredictionPage,
        'history': HistoryPage
    }
});

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
