// 股价图表组件
const PriceChart = {
    template: '<div ref="chart" style="height: 450px;"></div>',
    props: {
        stockCode: String,
        data: {
            type: Array,
            required: true
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
            if (!this.chart || !this.data || this.data.length === 0) return;
            this.chart.setOption({
                title: { text: '股价走势', left: 'center' },
                tooltip: { trigger: 'axis' },
                xAxis: { type: 'category', data: this.data.map(d => d.date), axisLabel: { rotate: 45 } },
                yAxis: { type: 'value', name: '股价', scale: true },
                series: [{ type: 'line', data: this.data.map(d => d.close), smooth: true, lineStyle: { color: '#667eea', width: 3 } }],
                grid: { left: '10%', right: '10%', bottom: '18%' }
            });
        },
        handleResize() { this.chart?.resize(); }
    },
    watch: { data() { this.updateChart(); } }
};
