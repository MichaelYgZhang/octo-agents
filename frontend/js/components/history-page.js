// 历史预测页面组件
const HistoryPage = {
    template: `
<div class="page-history" v-if="stock">
    <h2 style="color: #667eea; margin-bottom: 25px;">📊 历史预测准确率</h2>
    <p>历史预测页面内容 - 正在重构中...</p>
    <p>当前股票: {{ stock.name }} ({{ stock.code }})</p>
</div>
<div v-else class="loading">
    <p>请选择一只股票</p>
</div>
    `,
    computed: {
        stock() {
            return Store.getCurrentStock();
        }
    }
};
