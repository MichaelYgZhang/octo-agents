// API模块 - 数据获取与竞态条件保护
const API = {
    currentRequestId: 0,

    // 获取basePath（支持GitHub Pages子路径部署）
    getBasePath() {
        // 检测是否在GitHub Pages子路径下
        if (window.location.pathname.startsWith('/octo-agents')) {
            return '/octo-agents';
        }
        // 本地开发环境
        return '';
    },

    // 构建正确的数据URL
    buildDataUrl(relativePath) {
        const basePath = this.getBasePath();
        return `${basePath}/${relativePath}`;
    },

    async fetchAllStocks() {
        Store.loading = true;
        Store.error = null;

        const requestId = ++this.currentRequestId;

        try {
            const response = await axios.get(this.buildDataUrl('data/latest.json'));

            // 确保这是最新的请求
            if (requestId !== this.currentRequestId) {
                return;
            }

            if (!Array.isArray(response.data)) {
                throw new Error('Invalid data format: expected array');
            }

            // 更新Store（现在是响应式的）
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

    async getLatestData() {
        try {
            const response = await axios.get(this.buildDataUrl('data/latest.json'));
            return response.data || [];
        } catch (error) {
            console.error('Failed to get latest data:', error);
            return [];
        }
    },

    async getHistoryData(stockCode) {
        try {
            const response = await axios.get(this.buildDataUrl(`data/history/${stockCode}/`), {
                // This will fail if there's no directory listing, so we'll need a different approach
            });
            return response.data || [];
        } catch (error) {
            // If directory listing is not available, try loading from feedback history
            try {
                const response = await axios.get(this.buildDataUrl('data/feedback_history.json'));
                const feedbackData = response.data || {};
                return feedbackData[stockCode] || [];
            } catch (e) {
                console.error('Failed to get history data:', e);
                return [];
            }
        }
    }
};
