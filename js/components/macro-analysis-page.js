// 宏观影响分析页面组件
const MacroAnalysisPage = {
    template: `
        <div class="card">
            <h2 style="color: #667eea; margin-bottom: 25px;">🌍 宏观环境与股票市场分析</h2>

            <!-- 文章列表 -->
            <div v-if="articles.length > 0">
                <div v-for="(article, index) in sortedArticles" :key="article.id"
                     class="white-box" style="margin-bottom: 20px; cursor: pointer; transition: all 0.3s;"
                     @click="toggleArticle(article.id)"
                     @mouseenter="highlightArticle($event)"
                     @mouseleave="unhighlightArticle($event)">

                    <!-- 文章头部 -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div>
                            <h4 style="color: #1f2937; font-size: 18px; margin: 0;">{{ article.title }}</h4>
                            <div style="font-size: 12px; color: #9ca3af; margin-top: 5px;">
                                📅 {{ article.date }} | 🏷️ {{ article.category }} | 👁️ 阅读量: {{ article.views || 0 }}
                            </div>
                        </div>
                        <span class="accuracy-badge" :class="getCategoryBadgeClass(article.category)">
                            {{ article.category }}
                        </span>
                    </div>

                    <!-- 摘要 -->
                    <div style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
                        {{ article.summary }}
                    </div>

                    <!-- 展开内容 -->
                    <div v-if="expandedArticle === article.id" style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb;">

                        <!-- 金字塔结构：核心结论 -->
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h5 style="color: white; margin-bottom: 10px;">🎯 核心结论</h5>
                            <div style="font-size: 16px; line-height: 1.8;">{{ article.pyramid.conclusion }}</div>
                        </div>

                        <!-- 金字塔结构：关键论点 -->
                        <div style="margin-bottom: 20px;">
                            <h5 style="color: #667eea; margin-bottom: 15px;">💡 关键论点</h5>
                            <div v-for="(arg, idx) in article.pyramid.arguments" :key="idx"
                                 style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                                <div style="font-weight: bold; color: #1f2937; margin-bottom: 8px;">{{ arg.title }}</div>
                                <div style="color: #6b7280; font-size: 14px; line-height: 1.6;">{{ arg.content }}</div>
                            </div>
                        </div>

                        <!-- 金字塔结构：支撑数据 -->
                        <div style="margin-bottom: 20px;">
                            <h5 style="color: #667eea; margin-bottom: 15px;">📊 支撑数据</h5>
                            <div v-for="(data, idx) in article.pyramid.data" :key="idx"
                                 style="background: #f0f9ff; padding: 12px; border-radius: 6px; margin-bottom: 8px; font-size: 14px; color: #374151;">
                                <span style="color: #667eea; font-weight: bold;">•</span> {{ data }}
                            </div>
                        </div>

                        <!-- 影响分析 -->
                        <div style="margin-bottom: 20px;">
                            <h5 style="color: #667eea; margin-bottom: 15px;">📈 对股票市场的影响</h5>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 12px; color: #065f46;">正面影响板块</div>
                                    <div style="font-size: 16px; font-weight: bold; color: #065f46; margin-top: 5px;">
                                        {{ article.impact.positive.join(', ') }}
                                    </div>
                                </div>
                                <div style="background: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 12px; color: #991b1b;">负面影响板块</div>
                                    <div style="font-size: 16px; font-weight: bold; color: #991b1b; margin-top: 5px;">
                                        {{ article.impact.negative.join(', ') }}
                                    </div>
                                </div>
                                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; text-align: center;">
                                    <div style="font-size: 12px; color: #92400e;">中性影响板块</div>
                                    <div style="font-size: 16px; font-weight: bold; color: #92400e; margin-top: 5px;">
                                        {{ article.impact.neutral.join(', ') }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 投资建议 -->
                        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h5 style="color: #92400e; margin-bottom: 15px;">💡 投资建议</h5>
                            <ul style="list-style: none; padding: 0;">
                                <li v-for="(rec, idx) in article.recommendations" :key="idx"
                                    style="padding: 8px 0; color: #78350f; font-size: 14px; border-bottom: 1px solid #fde68a;">
                                    <span style="color: #92400e; margin-right: 8px;">→</span>{{ rec }}
                                </li>
                            </ul>
                        </div>

                        <!-- 参考资料 -->
                        <div>
                            <h5 style="color: #667eea; margin-bottom: 10px;">📚 参考资料</h5>
                            <div v-for="(ref, idx) in article.references" :key="idx"
                                 style="font-size: 13px; color: #6b7280; padding: 5px 0;">
                                <a :href="ref.url" target="_blank" style="color: #667eea; text-decoration: none;">
                                    📎 {{ ref.title }}
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else style="text-align: center; padding: 40px; color: #909399;">
                <p>暂无文章数据</p>
            </div>
        </div>
    `,
    data() {
        return {
            expandedArticle: null,
            articles: []
        };
    },
    computed: {
        sortedArticles() {
            return [...this.articles].sort((a, b) => new Date(b.date) - new Date(a.date));
        }
    },
    mounted() {
        this.loadArticles();
    },
    methods: {
        async loadArticles() {
            try {
                const response = await axios.get('../data/macro_articles.json');
                this.articles = response.data.articles || [];
            } catch (error) {
                console.error('Failed to load articles:', error);
                // 如果加载失败，显示示例数据
                this.articles = this.getDefaultArticles();
            }
        },

        getDefaultArticles() {
            return [
                {
                    id: 'article_001',
                    title: '美联储加息对港股市场的影响分析',
                    date: '2026-03-26',
                    category: '经济',
                    views: 1250,
                    summary: '美联储持续加息政策对港股市场产生深远影响，本文从资金流向、估值水平和投资者情绪三个维度进行深入分析。',
                    pyramid: {
                        conclusion: '美联储加息将导致港股短期承压，但中长期来看，优质标的仍具投资价值，建议关注防守型板块。',
                        arguments: [
                            {
                                title: '资金成本上升，流动性收紧',
                                content: '加息直接导致港元资金成本上升，外资流出压力增大，市场流动性收紧，股价面临下行压力。'
                            },
                            {
                                title: '估值中枢下移',
                                content: '无风险利率上升导致股票估值中枢下移，成长股受影响更大，价值股相对抗跌。'
                            },
                            {
                                title: '投资者情绪谨慎',
                                content: '加息周期中，投资者风险偏好下降，更倾向于防守型策略，资金流向红利股和公用事业。'
                            }
                        ],
                        data: [
                            '香港金管局跟随加息，基础利率上调至5.75%',
                            '港股通南向资金近一月净流出127亿港元',
                            '恒生指数PE从10.5倍降至9.8倍',
                            '公用事业板块逆势上涨3.2%'
                        ]
                    },
                    impact: {
                        positive: ['公用事业', '银行', '保险'],
                        negative: ['科技', '地产', '消费'],
                        neutral: ['医疗', '教育', '基建']
                    },
                    recommendations: [
                        '增持高股息、低估值蓝筹股',
                        '关注公用事业和金融板块防御性机会',
                        '回避高估值成长股',
                        '保持适度仓位，控制风险敞口'
                    ],
                    references: [
                        { title: '美联储FOMC会议纪要', url: 'https://www.federalreserve.gov/' },
                        { title: '香港金管局货币政策报告', url: 'https://www.hkma.gov.hk/' }
                    ]
                }
            ];
        },

        toggleArticle(id) {
            this.expandedArticle = this.expandedArticle === id ? null : id;
        },

        highlightArticle(event) {
            event.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
            event.currentTarget.style.transform = 'translateY(-2px)';
        },

        unhighlightArticle(event) {
            event.currentTarget.style.boxShadow = 'none';
            event.currentTarget.style.transform = 'translateY(0)';
        },

        getCategoryBadgeClass(category) {
            const map = {
                '经济': 'accuracy-high',
                '政治': 'accuracy-medium',
                '战争': 'accuracy-low'
            };
            return map[category] || 'accuracy-medium';
        }
    }
};
