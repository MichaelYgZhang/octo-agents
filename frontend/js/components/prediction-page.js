// 预测白盒页面组件 - 简化版
const PredictionPage = {
    template: `
<div class="page-prediction" v-if="stock">
    <h2 style="color: #667eea; margin-bottom: 25px;">🎯 AI预测模型白盒化展示</h2>
    <p>预测白盒页面内容 - 正在重构中...</p>
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
