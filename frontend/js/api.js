// API模块 - 数据获取与竞态条件保护
const API = {
    currentRequestId: 0,

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

            if (!Array.isArray(response.data)) {
                throw new Error('Invalid data format: expected array');
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
    }
};
