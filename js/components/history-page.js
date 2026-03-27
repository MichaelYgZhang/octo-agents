// 历史预测页面组件
const HistoryPage = {
    components: {
        'prediction-accuracy-chart': PredictionAccuracyChart
    },
    template: `
        <div v-if="currentStock" class="card">
            <h2 style="color: #667eea; margin-bottom: 25px;">📊 历史预测准确率</h2>

            <div class="history-item">
                <h3 style="color: #1f2937; margin-bottom: 15px;">
                    {{ currentStock.name }} ({{ currentStock.code }})
                </h3>

                <div class="metric-row">
                    <span class="metric-label">预测次数</span>
                    <span class="metric-value">{{ predictionCount }}</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">准确率</span>
                    <span class="metric-value">{{ (accuracy * 100).toFixed(1) }}%</span>
                </div>
                <div class="metric-row">
                    <span class="metric-label">平均收益</span>
                    <span class="metric-value">{{ (averageReturn * 100).toFixed(2) }}%</span>
                </div>

                <!-- 预测价格 vs 实际收盘价对比图表 -->
                <div class="white-box" style="margin-top: 30px;">
                    <h4>📈 预测价格 vs 实际收盘价对比</h4>
                    <prediction-accuracy-chart :stock-code="currentStock.code"></prediction-accuracy-chart>
                </div>

                <div style="margin-top: 20px; padding: 15px; background: #f9fafb; border-radius: 8px;">
                    <h4 style="color: #6b7280; margin-bottom: 10px;">📈 历史预测详情</h4>
                    <p style="color: #6b7280; font-size: 14px;">
                        * 完整历史预测功能需要多次运行分析生成历史数据
                    </p>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                        当前系统已具备预测跟踪能力，每次分析结果都会保存到历史记录
                    </p>
                </div>
            </div>
        </div>
        <div v-else class="card">
            <p style="text-align: center; color: #909399;">请选择一支股票查看历史预测</p>
        </div>
    `,
    data() {
        return {
            historicalData: []
        };
    },
    computed: {
        currentStock() {
            return Store.getCurrentStock();
        },
        predictionCount() {
            return Utils.getPredictionCount(this.currentStock);
        },
        accuracy() {
            return Utils.getAccuracy(this.currentStock);
        },
        averageReturn() {
            return Utils.getAverageReturn(this.currentStock);
        }
    },
    mounted() {
        this.loadHistoricalData();
    },
    methods: {
        async loadHistoricalData() {
            try {
                const response = await axios.get(API.buildDataUrl('data/feedback_history.json'));
                const feedbackData = response.data || {};
                this.historicalData = feedbackData[this.currentStock.code] || [];
            } catch (error) {
                console.error('Failed to load historical data:', error);
            }
        }
    },
    watch: {
        currentStock() {
            this.loadHistoricalData();
        }
    }
};
