// 状态管理模块 - 使用Vue 3响应式系统
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
