// 侧边栏组件
const Sidebar = {
    template: `
        <div>
            <!-- 移动端遮罩层 -->
            <div class="overlay" :class="{ active: mobileMenuOpen }" @click="closeMobileMenu"></div>

            <!-- 移动端菜单按钮 -->
            <button class="mobile-menu-btn" @click="toggleMobileMenu" v-if="!mobileMenuOpen">
                ☰
            </button>

            <div class="sidebar" :class="{ open: mobileMenuOpen }">
                <!-- 移动端关闭按钮 -->
                <button v-if="isMobile"
                        @click="closeMobileMenu"
                        style="position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 18px;">
                    ✕
                </button>

            <div class="logo">
                <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <svg width="50" height="50" viewBox="0 0 50 50" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));">
                        <!-- 背景圆形 -->
                        <circle cx="25" cy="25" r="24" fill="url(#gradient)" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>

                        <!-- 渐变定义 -->
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                                <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                            </linearGradient>
                        </defs>

                        <!-- 股票曲线 -->
                        <path d="M 10 35 L 15 30 L 20 32 L 25 25 L 30 28 L 35 20 L 40 22"
                              stroke="white"
                              stroke-width="2.5"
                              fill="none"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              opacity="0.9"/>

                        <!-- 上涨箭头 -->
                        <path d="M 35 15 L 38 18 L 35 21 M 35 18 L 25 18"
                              stroke="white"
                              stroke-width="2"
                              fill="none"
                              stroke-linecap="round"
                              stroke-linejoin="round"/>

                        <!-- AI芯片符号 -->
                        <circle cx="25" cy="25" r="3" fill="white" opacity="0.95"/>
                        <circle cx="25" cy="15" r="1.5" fill="white" opacity="0.7"/>
                        <circle cx="25" cy="35" r="1.5" fill="white" opacity="0.7"/>
                        <circle cx="15" cy="25" r="1.5" fill="white" opacity="0.7"/>
                        <circle cx="35" cy="25" r="1.5" fill="white" opacity="0.7"/>

                        <!-- 连接线 -->
                        <line x1="25" y1="22" x2="25" y2="17" stroke="white" stroke-width="1" opacity="0.5"/>
                        <line x1="25" y1="28" x2="25" y2="33" stroke="white" stroke-width="1" opacity="0.5"/>
                        <line x1="22" y1="25" x2="17" y2="25" stroke="white" stroke-width="1" opacity="0.5"/>
                        <line x1="28" y1="25" x2="33" y2="25" stroke="white" stroke-width="1" opacity="0.5"/>
                    </svg>
                </div>
                <h1 style="text-align: center;">股票分析平台</h1>
                <p style="font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 5px; line-height: 1.5; text-align: center;">
                    AI驱动的多维度智能分析 | 白盒化预测系统
                </p>
            </div>
            <div class="nav-items">
                <div class="nav-item" v-for="item in navItems" :key="item.id" :class="{active: currentPage === item.id}" @click="navigate(item.id)">
                    {{ item.icon }} {{ item.label }}
                </div>
            </div>
            <div class="stock-selector">
                <select v-model="selectedStock">
                    <option v-for="stock in stocks" :key="stock.code" :value="stock.code">{{ stock.name }} ({{ stock.code }})</option>
                </select>
            </div>
        </div>
        </div>
    `,
    data() {
        return {
            navItems: [
                { id: 'analysis', icon: '📈', label: '实时分析' },
                { id: 'prediction', icon: '🎯', label: '预测白盒' },
                { id: 'history', icon: '📊', label: '历史预测' },
                { id: 'review', icon: '📋', label: '复盘报告' },
                { id: 'macro-analysis', icon: '🌍', label: '宏观分析' }
            ],
            isMobile: window.innerWidth <= 768
        };
    },
    computed: {
        stocks() { return Store.stocks; },
        currentPage() { return Store.currentPage; },
        selectedStock: {
            get() { return Store.selectedStock; },
            set(value) { Store.setSelectedStock(value); }
        },
        mobileMenuOpen() {
            return Store.mobileMenuOpen;
        }
    },
    methods: {
        navigate(page) {
            Store.setCurrentPage(page);
        },
        toggleMobileMenu() {
            Store.toggleMobileMenu();
        },
        closeMobileMenu() {
            Store.closeMobileMenu();
        },
        handleResize() {
            this.isMobile = window.innerWidth <= 768;
            // 在桌面端自动关闭移动菜单
            if (!this.isMobile && this.mobileMenuOpen) {
                Store.closeMobileMenu();
            }
        }
    },
    mounted() {
        window.addEventListener('resize', this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
};
