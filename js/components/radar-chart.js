// 雷达图组件
const RadarChart = {
    template: '<div ref="chart" style="height: 400px;"></div>',
    props: {
        scores: { type: Object, required: true }
    },
    data() { return { chart: null }; },
    mounted() {
        this.chart = echarts.init(this.$refs.chart);
        this.updateChart();
        window.addEventListener('resize', () => this.chart?.resize());
    },
    beforeUnmount() { this.chart?.dispose(); },
    methods: {
        updateChart() {
            if (!this.chart || !this.scores) return;

            // 从嵌套对象中提取score值
            const quantScore = this.scores.quant?.score || 0;
            const fundamentalScore = this.scores.fundamental?.score || 0;
            const newsScore = this.scores.news?.score || 0;
            const riskScore = this.scores.risk?.score || 0;

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
                        value: [quantScore, fundamentalScore, newsScore, 100 - riskScore],
                        areaStyle: { color: 'rgba(102, 126, 234, 0.3)' }
                    }]
                }]
            });
        }
    },
    watch: {
        scores: {
            handler() { this.updateChart(); },
            deep: true
        }
    }
};
