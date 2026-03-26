// 状态管理模块 - 使用Vue 3 Composition API
// 注意：这个文件必须在Vue加载后执行

// 使用Vue的reactive创建真正的响应式Store
const Store = Vue.reactive({
    stocks: [],
    selectedStock: null,
    stockHistory: {},
    currentPage: 'analysis',
    loading: false,
    error: null,
    mobileMenuOpen: false, // 移动端菜单状态

    setSelectedStock(code) {
        this.selectedStock = code;
        localStorage.setItem('selectedStock', code);
    },

    setCurrentPage(page) {
        this.currentPage = page;
        localStorage.setItem('currentPage', page);
        window.location.hash = page;
        // 移动端选择页面后自动关闭菜单
        if (window.innerWidth <= 768) {
            this.mobileMenuOpen = false;
        }
    },

    getCurrentStock() {
        return this.stocks.find(s => s.code === this.selectedStock);
    },

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    },

    closeMobileMenu() {
        this.mobileMenuOpen = false;
    },

    init() {
        this.selectedStock = localStorage.getItem('selectedStock') || null;
        this.currentPage = localStorage.getItem('currentPage') || 'analysis';

        if (window.location.hash) {
            this.currentPage = window.location.hash.slice(1);
        }
    }
});
