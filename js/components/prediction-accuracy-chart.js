// 预测准确性对比图表组件
const PredictionAccuracyChart = {
    template: `
        <div ref="chart" style="width: 100%; height: 450px;"></div>
    `,
    props: {
        stockCode: String
    },
    data() {
        return {
            historicalData: []
        };
    },
    mounted() {
        this.loadHistoricalData();
    },
    methods: {
        async loadHistoricalData() {
            try {
                // Load feedback history
                const response = await axios.get(API.buildDataUrl('data/feedback_history.json'));
                const feedbackData = response.data || {};

                const stockHistory = feedbackData[this.stockCode];

                if (!stockHistory || stockHistory.length === 0) {
                    console.log('No historical prediction data found for', this.stockCode);
                    this.initChart([], [], []);
                    return;
                }

                // Sort by date
                stockHistory.sort((a, b) => new Date(a.date) - new Date(b.date));

                const dates = [];
                const predictions = [];
                const actuals = [];

                // Filter valid records (both predicted and actual prices must be valid)
                const validRecords = stockHistory.filter(item => {
                    const hasValidPred = item.predicted_price && item.predicted_price !== 0;
                    const hasValidActual = item.actual_price && item.actual_price !== null && item.actual_price !== 0;
                    return hasValidPred && hasValidActual;
                });

                console.log(`Found ${validRecords.length} valid records out of ${stockHistory.length} total`);

                // Take last 7 valid records
                const recentValid = validRecords.slice(-7);

                recentValid.forEach(item => {
                    dates.push(item.date);
                    predictions.push(item.predicted_price);
                    actuals.push(item.actual_price);
                });

                console.log('Loaded prediction data:', { dates, predictions, actuals });
                this.initChart(dates, predictions, actuals);
            } catch (error) {
                console.error('Failed to load historical data:', error);
                this.initChart([], [], []);
            }
        },

        initChart(dates, predictions, actuals) {
            const chart = echarts.init(this.$refs.chart);

            const option = {
                title: {
                    text: '预测价格 vs 实际收盘价对比',
                    left: 'center',
                    textStyle: {
                        color: '#667eea',
                        fontSize: 16,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    formatter: function(params) {
                        let result = params[0].axisValue + '<br/>';
                        params.forEach(item => {
                            const value = item.value ? '¥' + item.value.toFixed(2) : 'N/A';
                            result += item.marker + item.seriesName + ': ' + value + '<br/>';
                        });
                        return result;
                    }
                },
                legend: {
                    data: ['预测价格', '实际收盘价'],
                    top: 30,
                    textStyle: {
                        color: '#6b7280'
                    }
                },
                grid: {
                    left: '10%',
                    right: '10%',
                    bottom: '15%',
                    top: 80
                },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: {
                        rotate: 45,
                        color: '#6b7280'
                    },
                    axisLine: {
                        lineStyle: {
                            color: '#e5e7eb'
                        }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '价格 (HKD)',
                    nameTextStyle: {
                        color: '#6b7280'
                    },
                    axisLabel: {
                        formatter: '¥{value}',
                        color: '#6b7280'
                    },
                    splitLine: {
                        lineStyle: {
                            color: '#f3f4f6'
                        }
                    }
                },
                series: [
                    {
                        name: '预测价格',
                        type: 'line',
                        data: predictions,
                        smooth: true,
                        lineStyle: {
                            color: '#f59e0b',
                            width: 3
                        },
                        itemStyle: {
                            color: '#f59e0b'
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    },
                    {
                        name: '实际收盘价',
                        type: 'line',
                        data: actuals,
                        smooth: true,
                        lineStyle: {
                            color: '#667eea',
                            width: 3
                        },
                        itemStyle: {
                            color: '#667eea'
                        },
                        symbol: 'circle',
                        symbolSize: 6
                    }
                ]
            };

            chart.setOption(option);

            // Responsive
            window.addEventListener('resize', () => {
                chart.resize();
            });
        }
    },
    watch: {
        stockCode() {
            this.loadHistoricalData();
        }
    }
};
