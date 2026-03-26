// 自我反馈Agent流程图组件
const AgentFlowChart = {
    template: `
        <div ref="chart" style="width: 100%; height: 500px;"></div>
    `,
    mounted() {
        this.initChart();
    },
    methods: {
        initChart() {
            const chart = echarts.init(this.$refs.chart);

            const nodes = [
                // 数据层（蓝色）
                { name: '数据采集', x: 300, y: 50, category: 0, symbolSize: 60, itemStyle: { color: '#3b82f6' } },

                // 分析层（绿色）
                { name: '量化分析师', x: 100, y: 150, category: 1, symbolSize: 50, itemStyle: { color: '#10b981' } },
                { name: '基本面分析师', x: 250, y: 150, category: 1, symbolSize: 50, itemStyle: { color: '#10b981' } },
                { name: '新闻分析师', x: 400, y: 150, category: 1, symbolSize: 50, itemStyle: { color: '#10b981' } },
                { name: '风险分析师', x: 550, y: 150, category: 1, symbolSize: 50, itemStyle: { color: '#10b981' } },

                // 决策层（黄色）
                { name: '综合决策', x: 300, y: 280, category: 2, symbolSize: 55, itemStyle: { color: '#f59e0b' } },
                { name: '预测输出', x: 300, y: 380, category: 2, symbolSize: 55, itemStyle: { color: '#f59e0b' } },

                // 反馈层（红色）
                { name: '反馈学习', x: 100, y: 380, category: 3, symbolSize: 50, itemStyle: { color: '#ef4444' } },
                { name: '持续迭代', x: 100, y: 250, category: 3, symbolSize: 50, itemStyle: { color: '#ef4444' } }
            ];

            const links = [
                // 数据采集 → 分析层
                { source: '数据采集', target: '量化分析师' },
                { source: '数据采集', target: '基本面分析师' },
                { source: '数据采集', target: '新闻分析师' },
                { source: '数据采集', target: '风险分析师' },

                // 分析层 → 综合决策
                { source: '量化分析师', target: '综合决策' },
                { source: '基本面分析师', target: '综合决策' },
                { source: '新闻分析师', target: '综合决策' },
                { source: '风险分析师', target: '综合决策' },

                // 综合决策 → 预测输出
                { source: '综合决策', target: '预测输出' },

                // 预测输出 → 反馈学习
                { source: '预测输出', target: '反馈学习' },

                // 反馈学习 → 持续迭代
                { source: '反馈学习', target: '持续迭代' },

                // 持续迭代 → 数据采集（闭环）
                { source: '持续迭代', target: '数据采集', lineStyle: { color: '#ef4444', width: 3, type: 'dashed' } }
            ];

            const categories = [
                { name: '数据层' },
                { name: '分析层' },
                { name: '决策层' },
                { name: '反馈层' }
            ];

            const option = {
                title: {
                    text: '自我反馈Agent流程',
                    left: 'center',
                    top: 10,
                    textStyle: {
                        color: '#667eea',
                        fontSize: 18,
                        fontWeight: 'bold'
                    }
                },
                tooltip: {
                    formatter: function(params) {
                        if (params.dataType === 'edge') {
                            return params.data.source + ' → ' + params.data.target;
                        }
                        return params.name;
                    }
                },
                legend: [{
                    data: categories.map(c => c.name),
                    orient: 'horizontal',
                    top: 40,
                    left: 'center',
                    textStyle: {
                        color: '#6b7280'
                    }
                }],
                series: [{
                    type: 'graph',
                    layout: 'none',
                    symbolSize: 50,
                    roam: true,
                    label: {
                        show: true,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    edgeSymbol: ['circle', 'arrow'],
                    edgeSymbolSize: [4, 10],
                    data: nodes,
                    links: links,
                    categories: categories,
                    lineStyle: {
                        color: 'source',
                        curveness: 0.1
                    },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: {
                            width: 4
                        }
                    }
                }]
            };

            chart.setOption(option);

            // 响应式调整
            window.addEventListener('resize', () => {
                chart.resize();
            });
        }
    }
};
