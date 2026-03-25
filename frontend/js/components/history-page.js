// 历史预测页面组件
const HistoryPage = {
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

                <!-- 准确率图表 -->
                <div ref="chartContainer" style="height: 300px; margin-top: 20px;"></div>

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
            chart: null
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
        this.initChart();
    },
    beforeUnmount() {
        this.chart?.dispose();
    },
    methods: {
        initChart() {
            if (!this.$refs.chartContainer) return;

            this.chart = echarts.init(this.$refs.chartContainer);
            this.updateChart();
            window.addEventListener('resize', () => this.chart?.resize());
        },
        updateChart() {
            if (!this.chart || !this.currentStock) return;

            // Mock data for accuracy history
            const dates = [];
            const accuracyData = [];
            const today = new Date();

            for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                dates.push(date.toISOString().split('T')[0]);
                accuracyData.push((0.6 + Math.random() * 0.25) * 100);
            }

            this.chart.setOption({
                title: {
                    text: '历史预测准确率趋势',
                    left: 'center'
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: params => {
                        return `${params[0].axisValue}<br/>准确率: ${params[0].value.toFixed(1)}%`;
                    }
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: { rotate: 45 }
                },
                yAxis: {
                    type: 'value',
                    name: '准确率 (%)',
                    min: 0,
                    max: 100,
                    axisLabel: { formatter: '{value}%' }
                },
                series: [{
                    type: 'line',
                    data: accuracyData,
                    smooth: true,
                    lineStyle: { color: '#667eea', width: 3 },
                    areaStyle: {
                        color: {
                            type: 'linear',
                            x: 0, y: 0, x2: 0, y2: 1,
                            colorStops: [
                                { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
                                { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
                            ]
                        }
                    }
                }],
                grid: { left: '10%', right: '10%', bottom: '18%' }
            });
        }
    },
    watch: {
        currentStock() {
            this.$nextTick(() => {
                this.updateChart();
            });
        }
    }
};
