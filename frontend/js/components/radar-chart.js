// 雷达图组件 - 多维度评分展示
const RadarChart = {
    template: '<div ref="chart" style="height: 400px;"></div>',
    props: {
        scores: {
            type: Object,
            required: true,
            validator(value) {
                return value.quant !== undefined &&
                       value.fundamental !== undefined &&
                       value.news !== undefined &&
                       value.risk !== undefined;
            }
        }
    },
    data() {
        return { chart: null };
    },
    mounted() {
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
        this.chart?.dispose();
    },
    methods: {
        updateChart() {
            if (!this.chart || !this.scores) return;

            this.chart.setOption({
                title: { text: '多维度评分', left: 'center' },
                radar: {
                    indicator: [
                        { name: '技术分析', max: 100 },
                        { name: '基本面', max: 100 },
                        { name: '舆情', max: 100 },
                        { name: '风险控制', max: 100 }
                    ]
                },
                series: [{
                    type: 'radar',
                    data: [{
                        value: [
                            this.scores.quant,
                            this.scores.fundamental,
                            this.scores.news,
                            100 - this.scores.risk
                        ],
                        areaStyle: { color: 'rgba(102, 126, 234, 0.3)' }
                    }]
                }]
            });
        },
        handleResize() {
            this.chart?.resize();
        }
    },
    watch: {
        scores: {
            handler() {
                this.updateChart();
            },
            deep: true
        }
    }
};

Vue.component('radar-chart', RadarChart);
