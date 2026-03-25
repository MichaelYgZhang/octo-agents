// 工具函数模块
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
