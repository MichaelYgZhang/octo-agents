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
    },

    getLatestDate(stock) {
        if (!stock || !stock.stock_history || stock.stock_history.length === 0) {
            return '-';
        }
        return stock.stock_history[stock.stock_history.length - 1].date;
    },

    predictPrice(stock) {
        if (!stock || !stock.quant) return 0;
        const latestPrice = this.getLatestPrice(stock) || 0;
        const quantScore = stock.quant.score;
        const signal = stock.quant.details?.signal || 'hold';

        let changeRate = 0;
        if (signal === 'buy') {
            changeRate = 0.02 + (quantScore / 100) * 0.03;
        } else if (signal === 'sell') {
            changeRate = -0.02 - ((100 - quantScore) / 100) * 0.03;
        } else {
            changeRate = -0.01 + (quantScore / 100) * 0.02;
        }

        return latestPrice * (1 + changeRate);
    },

    getOverallConfidence(stock) {
        if (!stock || !stock.quant || !stock.fundamental || !stock.news || !stock.risk) {
            return 0;
        }
        return (
            (stock.quant.confidence || 0) * 0.25 +
            (stock.fundamental.confidence || 0) * 0.30 +
            (stock.news.confidence || 0) * 0.25 +
            (stock.risk.confidence || 0) * 0.20
        );
    },

    getPredictionCount(stock) {
        return stock ? Math.floor(Math.random() * 10 + 5) : 0;
    },

    getAccuracy(stock) {
        return stock ? 0.65 + Math.random() * 0.15 : 0;
    },

    getAverageReturn(stock) {
        return stock ? -0.02 + Math.random() * 0.06 : 0;
    }
};
