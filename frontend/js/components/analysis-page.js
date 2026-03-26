// 实时分析页面组件
const AnalysisPage = {
    template: `
<div class="page-analysis" v-if="stock">
    <h2 style="text-align: center; color: #2c3e50; margin-bottom: 20px;">
        {{ stock.name }} ({{ stock.code }})
    </h2>
    
    <div class="latest-price">
        <span>最新股价: </span>
        <span :class="priceClass">
            ¥{{ latestPrice?.toFixed(2) || 'N/A' }}
        </span>
        <span style="color: #909399; margin-left: 10px;">
            ({{ latestDate }})
        </span>
    </div>
    
    <div class="score">{{ stock.overall_score?.toFixed(1) || 'N/A' }}</div>
    <p style="color: #909399; text-align: center; margin-bottom: 15px;">综合评分 / 100</p>
    
    <div style="text-align: center;">
        <span :class="['recommendation', stock.recommendation]">
            {{ recommendationText }}
        </span>
        <span style="color: #909399; margin-left: 15px;">风险: {{ stock.risk_level || 'N/A' }}</span>
    </div>
    
    <div class="time-selector">
        <button :class="{active: timeRange === 7}" @click="timeRange = 7">最近一周</button>
        <button :class="{active: timeRange === 14}" @click="timeRange = 14">最近两周</button>
        <button :class="{active: timeRange === 30}" @click="timeRange = 30">最近一个月</button>
    </div>
    
    <price-chart
        v-if="stockHistory.length > 0"
        :stock-code="stock.code"
        :data="stockHistory">
    </price-chart>
    
    <div class="grid-2-col">
        <div class="white-box">
            <h4>📊 技术分析</h4>
            <div class="metric-row">
                <span class="metric-label">评分</span>
                <span class="metric-value">{{ stock.quant?.score?.toFixed(1) || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">交易信号</span>
                <span class="metric-value">{{ stock.quant?.details?.signal || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">MA5</span>
                <span class="metric-value">¥{{ stock.quant?.details?.ma5?.toFixed(2) || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">RSI</span>
                <span class="metric-value">{{ stock.quant?.details?.rsi?.toFixed(2) || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">趋势</span>
                <span class="metric-value">{{ stock.quant?.details?.trend || 'N/A' }}</span>
            </div>
        </div>
        
        <div class="white-box">
            <h4>💰 基本面分析</h4>
            <div class="metric-row">
                <span class="metric-label">评分</span>
                <span class="metric-value">{{ stock.fundamental?.score?.toFixed(1) || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">估值</span>
                <span class="metric-value">{{ stock.fundamental?.details?.valuation || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">成长性</span>
                <span class="metric-value">{{ stock.fundamental?.details?.growth || 'N/A' }}</span>
            </div>
            <div class="metric-row">
                <span class="metric-label">置信度</span>
                <span class="metric-value">{{ (stock.fundamental?.confidence * 100)?.toFixed(0) || 'N/A' }}%</span>
            </div>
        </div>
    </div>
</div>
<div v-else class="loading">
    <p>请选择一只股票</p>
</div>
    `,
    data() {
        return {
            timeRange: 7
        };
    },
    computed: {
        stock() {
            return Store.getCurrentStock();
        },
        stockHistory() {
            if (!this.stock) return [];
            const history = Store.stockHistory[this.stock.code] || [];
            return history.slice(-this.timeRange);
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
            return Utils.getRecommendationText(this.stock?.recommendation);
        }
    }
};
