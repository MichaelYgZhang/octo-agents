// 股价图表组件 - 正确的生命周期管理
const PriceChart = {
    template: '<div ref="chart" style="height: 450px;"></div>',
    props: {
        stockCode: String,
        data: {
            type: Array,
            required: true,
            validator(value) {
                return Array.isArray(value) && value.length > 0;
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
        if (this.chart) {
            this.chart.dispose();
            this.chart = null;
        }
    },
    methods: {
        updateChart() {
            if (!this.chart || !this.data || this.data.length === 0) return;

            const dates = this.data.map(d => d.date);
            const prices = this.data.map(d => d.close);

            this.chart.setOption({
                title: { text: '股价走势', left: 'center' },
                tooltip: { trigger: 'axis' },
                xAxis: {
                    type: 'category',
                    data: dates,
                    axisLabel: { rotate: 45 }
                },
                yAxis: {
                    type: 'value',
                    name: '股价',
                    scale: true
                },
                series: [{
                    type: 'line',
                    data: prices,
                    smooth: true,
                    lineStyle: { color: '#667eea', width: 3 }
                }],
                grid: { left: '10%', right: '10%', bottom: '18%' }
            });
        },
        handleResize() {
            this.chart?.resize();
        }
    },
    watch: {
        data() {
            this.updateChart();
        }
    }
};

Vue.component('price-chart', PriceChart);
