// 侧边栏组件
const Sidebar = {
    template: `
        <div class="sidebar">
            <div class="logo">
                <h1>股票分析平台</h1>
            </div>
            <div class="nav-items">
                <div class="nav-item"
                     v-for="item in navItems"
                     :key="item.id"
                     :class="{active: currentPage === item.id}"
                     @click="navigate(item.id)">
                    {{ item.icon }} {{ item.label }}
                </div>
            </div>

            <div class="stock-selector">
                <select v-model="selectedStock">
                    <option v-for="stock in stocks" :key="stock.code" :value="stock.code">
                        {{ stock.name }} ({{ stock.code }})
                    </option>
                </select>
            </div>
        </div>
    `,
    data() {
        return {
            navItems: [
                { id: 'analysis', icon: '📈', label: '实时分析' },
                { id: 'prediction', icon: '🎯', label: '预测白盒' },
                { id: 'history', icon: '📊', label: '历史预测' }
            ]
        };
    },
    computed: {
        stocks() {
            return Store.stocks;
        },
        currentPage() {
            return Store.currentPage;
        },
        selectedStock: {
            get() {
                return Store.selectedStock;
            },
            set(value) {
                Store.setSelectedStock(value);
            }
        }
    },
    methods: {
        navigate(page) {
            Store.setCurrentPage(page);
        }
    }
};

Vue.component('sidebar', Sidebar);
