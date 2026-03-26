// 预测白盒页面组件
const PredictionPage = {
    components: {
        'radar-chart': RadarChart,
        'agent-flow-chart': AgentFlowChart
    },
    template: `
        <div v-if="currentStock" class="card">
            <h2 style="color: #667eea; margin-bottom: 25px;">🎯 AI预测模型白盒化展示</h2>

            <!-- 预测结果 -->
            <div class="prediction-section">
                <h3 style="color: #667eea; margin-bottom: 15px;">预测结论</h3>
                <div style="font-size: 32px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0;">
                    预测价格: ¥{{ predictPrice.toFixed(2) }}
                </div>
                <p style="text-align: center; font-size: 18px;">
                    预测涨跌幅:
                    <span :style="{color: priceChangeColor, fontWeight: 'bold'}">
                        {{ priceChangePercent }}%
                    </span>
                </p>
            </div>

            <!-- 自我反馈Agent流程图 -->
            <div class="white-box">
                <h4>🔄 自我反馈Agent流程</h4>
                <agent-flow-chart></agent-flow-chart>
                <p style="text-align: center; margin-top: 15px; color: #6b7280; font-size: 13px;">
                    数据驱动 → 多维分析 → 智能决策 → 反馈学习 → 持续优化
                </p>
            </div>

            <!-- 多维度评分雷达图 -->
            <div class="white-box">
                <h4>📊 多维度评分雷达图</h4>
                <radar-chart :scores="currentStock"></radar-chart>
                <div style="text-align: center; margin-top: 15px;">
                    <span style="color: #6b7280; font-size: 14px;">
                        综合得分: <strong style="color: #667eea; font-size: 20px;">{{ currentStock.overall_score?.toFixed(1) || 0 }}</strong> / 100
                    </span>
                </div>
            </div>

            <!-- 产品动态 -->
            <div class="white-box" v-if="currentStock.news?.details?.product_updates">
                <h4>🚀 最近产品动态</h4>
                <div v-for="(update, idx) in currentStock.news.details.product_updates" :key="idx"
                     style="padding: 15px; background: #f9fafb; border-radius: 6px; margin-bottom: 10px; border-left: 4px solid #667eea;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold; color: #1f2937;">{{ update.title }}</span>
                        <span class="accuracy-badge"
                              :class="update.impact === 'positive' ? 'accuracy-high' : 'accuracy-medium'">
                            {{ update.impact === 'positive' ? '积极' : '中性' }}
                        </span>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">{{ update.summary }}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                        <span style="color: #9ca3af; font-size: 12px;">{{ update.date }}</span>
                        <a v-if="update.source && update.source.url"
                           :href="update.source.url"
                           target="_blank"
                           style="color: #667eea; font-size: 12px; text-decoration: none;">
                            📎 {{ update.source.name }}
                        </a>
                    </div>
                </div>

                <!-- 数据来源汇总 -->
                <div v-if="currentStock.news.details.data_sources" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <h5 style="color: #667eea; font-size: 13px; margin-bottom: 10px;">📡 产品动态数据来源：</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <a v-for="(source, idx) in currentStock.news.details.data_sources" :key="idx"
                           :href="source.url"
                           target="_blank"
                           style="display: inline-block; padding: 6px 12px; background: #f3f4f6; border-radius: 15px; font-size: 12px; color: #667eea; text-decoration: none;">
                            {{ source.type === '官网' ? '🏢' : '📱' }} {{ source.name }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- 预测依据 -->
            <div class="white-box">
                <h4>📐 预测依据与权重</h4>

                <div class="prediction-factor">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">技术分析 (MA/RSI/趋势)</span>
                        <span style="color: #667eea; font-weight: bold;">权重: 25%</span>
                    </div>
                    <div style="margin-top: 10px; color: #6b7280; font-size: 14px;">
                        <div>• 信号类型: {{ currentStock.quant?.details?.signal || 'N/A' }}</div>
                        <div>• MA5趋势: {{ currentStock.quant?.details?.trend || 'N/A' }}</div>
                        <div>• RSI值: {{ currentStock.quant?.details?.rsi?.toFixed(2) || 'N/A' }}</div>
                        <div v-if="currentStock.quant?.details?.volume_analysis">
                            • 成交量趋势: {{ currentStock.quant.details.volume_analysis.volume_trend }}
                        </div>
                        <div>• 评分: {{ currentStock.quant?.score?.toFixed(1) || 0 }}/100</div>
                    </div>
                </div>

                <div class="prediction-factor">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">基本面分析</span>
                        <span style="color: #667eea; font-weight: bold;">权重: 30%</span>
                    </div>
                    <div style="margin-top: 10px; color: #6b7280; font-size: 14px;">
                        <div>• 估值水平: {{ currentStock.fundamental?.details?.valuation || 'N/A' }}</div>
                        <div>• 成长性: {{ currentStock.fundamental?.details?.growth || 'N/A' }}</div>
                        <div v-if="currentStock.fundamental?.details?.pe_ratio">
                            • 市盈率(PE): {{ currentStock.fundamental.details.pe_ratio.toFixed(2) }}
                        </div>
                        <div v-if="currentStock.fundamental?.details?.pb_ratio">
                            • 市净率(PB): {{ currentStock.fundamental.details.pb_ratio.toFixed(2) }}
                        </div>
                        <div>• 评分: {{ currentStock.fundamental?.score?.toFixed(1) || 0 }}/100</div>
                    </div>
                </div>

                <div class="prediction-factor">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">舆情分析</span>
                        <span style="color: #667eea; font-weight: bold;">权重: 25%</span>
                    </div>
                    <div style="margin-top: 10px; color: #6b7280; font-size: 14px;">
                        <div>• 评分: {{ currentStock.news?.score?.toFixed(1) || 0 }}/100</div>
                        <div>• 置信度: {{ ((currentStock.news?.confidence || 0) * 100).toFixed(0) }}%</div>
                        <div v-if="currentStock.news?.details?.industry_trend">
                            • 行业趋势: {{ currentStock.news.details.industry_trend }}
                        </div>
                    </div>
                </div>

                <div class="prediction-factor">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: bold;">风险分析</span>
                        <span style="color: #667eea; font-weight: bold;">权重: 20%</span>
                    </div>
                    <div style="margin-top: 10px; color: #6b7280; font-size: 14px;">
                        <div>• 风险等级: {{ currentStock.risk?.details?.risk_level || 'N/A' }}</div>
                        <div>• 波动性: {{ currentStock.risk?.details?.volatility || 'N/A' }}</div>
                    </div>
                </div>
            </div>

            <!-- 战略深度分析 -->
            <div class="white-box" v-if="currentStock.fundamental?.details?.strategic_analysis">
                <h4>🎯 战略深度分析</h4>

                <!-- 中国国情背景 -->
                <div class="strategic-section" v-if="strategic.china_context">
                    <h5>{{ strategic.china_context.title }}</h5>
                    <ul>
                        <li v-for="(point, idx) in strategic.china_context.points" :key="idx">{{ point }}</li>
                    </ul>
                </div>

                <!-- 技术实力分析 -->
                <div class="strategic-section" v-if="strategic.tech_strength">
                    <h5>{{ strategic.tech_strength.title }} (评分: {{ strategic.tech_strength.score }})</h5>
                    <ul>
                        <li v-for="(detail, idx) in strategic.tech_strength.details" :key="idx">{{ detail }}</li>
                    </ul>
                </div>

                <!-- 管理层风格 -->
                <div class="strategic-section" v-if="strategic.leadership_style">
                    <h5>{{ strategic.leadership_style.title }}</h5>
                    <ul>
                        <li v-for="(char, idx) in strategic.leadership_style.characteristics" :key="idx">{{ char }}</li>
                    </ul>
                </div>

                <!-- 未来方向 -->
                <div class="strategic-section" v-if="strategic.future_direction">
                    <h5>{{ strategic.future_direction.title }}</h5>
                    <div v-for="(dir, idx) in strategic.future_direction.directions" :key="idx"
                         style="padding: 10px; background: #f9fafb; border-radius: 6px; margin-bottom: 8px; border-left: 3px solid #667eea;">
                        {{ dir }}
                    </div>
                </div>

                <!-- 股价预测依据 -->
                <div class="strategic-section" v-if="strategic.price_prediction">
                    <h5>{{ strategic.price_prediction.title }}</h5>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0;">
                        <div><strong>短期：</strong>{{ strategic.price_prediction.short_term }}</div>
                        <div><strong>中期：</strong>{{ strategic.price_prediction.mid_term }}</div>
                        <div style="grid-column: span 2;"><strong>长期：</strong>{{ strategic.price_prediction.long_term }}</div>
                    </div>
                    <div style="margin-top: 10px;">
                        <strong>风险因素：</strong>
                        <span v-for="(risk, idx) in strategic.price_prediction.risks" :key="idx"
                              style="display: inline-block; padding: 4px 8px; background: #fee2e2; color: #991b1b; border-radius: 4px; margin: 4px; font-size: 12px;">
                            {{ risk }}
                        </span>
                    </div>
                </div>
            </div>

            <!-- 国际战争影响分析 -->
            <div class="white-box" v-if="currentStock.risk?.details?.war_impact">
                <h4>🌍 国际战争影响分析</h4>

                <div style="text-align: center; margin: 20px 0;">
                    <div style="font-size: 24px; font-weight: bold; color: #667eea;">
                        整体影响等级：{{ warImpact.overall_impact }}
                    </div>
                    <div style="margin-top: 10px; color: #6b7280;">
                        分析置信度：{{ ((warImpact.confidence || 0) * 100).toFixed(0) }}%
                    </div>
                </div>

                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 15px 0;">
                    <strong>业务敞口：</strong>{{ warImpact.business_exposure }}
                </div>

                <div style="margin: 15px 0;" v-if="warImpact.key_risks">
                    <h5 style="color: #667eea; margin-bottom: 10px;">关键风险领域</h5>
                    <div v-for="(risk, idx) in warImpact.key_risks" :key="idx"
                         style="background: #fff; padding: 15px; border-radius: 8px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>{{ risk.area }}</strong>
                            <span :class="getRiskBadgeClass(risk.impact)" class="accuracy-badge">{{ risk.impact }}</span>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">{{ risk.description }}</p>
                    </div>
                </div>

                <div style="background: #d1fae5; padding: 15px; border-radius: 8px; margin: 15px 0; color: #065f46;">
                    <strong>风险缓解：</strong>{{ warImpact.mitigation }}
                </div>

                <div v-if="warImpact.data_sources" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                    <h5 style="color: #667eea; font-size: 13px; margin-bottom: 10px;">📡 战争影响数据来源：</h5>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        <a v-for="(source, idx) in warImpact.data_sources" :key="idx"
                           :href="source.url" target="_blank"
                           style="display: inline-block; padding: 6px 12px; background: #f3f4f6; border-radius: 15px; font-size: 12px; color: #667eea; text-decoration: none;">
                            📰 {{ source.name }}
                        </a>
                    </div>
                </div>
            </div>

            <!-- AI分析引擎信息 -->
            <div class="white-box">
                <h4>🤖 AI分析引擎信息</h4>

                <div v-for="agent in agents" :key="agent.name"
                     style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <div>
                            <strong style="font-size: 16px;">{{ agent.icon }} {{ agent.name }}</strong>
                            <div style="font-size: 12px; color: #9ca3af; margin-top: 4px;">
                                Agent: {{ agent.data.agent_name }} | 时间: {{ formatTime(agent.data.timestamp) }}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div style="font-size: 20px; font-weight: bold; color: #667eea;">
                                {{ agent.data.score?.toFixed(1) || 0 }}/100
                            </div>
                            <div style="font-size: 12px; color: #6b7280;">
                                置信度: {{ ((agent.data.confidence || 0) * 100).toFixed(0) }}%
                            </div>
                        </div>
                    </div>

                    <div class="confidence-bar">
                        <div class="confidence-fill" :style="{width: ((agent.data.confidence || 0) * 100) + '%'}"></div>
                    </div>

                    <div style="margin-top: 10px; font-size: 14px; color: #6b7280;">
                        {{ agent.data.summary }}
                    </div>
                </div>
            </div>

            <!-- 评分计算规则 -->
            <div class="white-box">
                <h4>📐 评分计算规则</h4>

                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <h5 style="color: #667eea; margin-bottom: 15px;">综合评分公式</h5>
                    <div style="font-family: 'Courier New', monospace; background: #1f2937; color: #10b981; padding: 15px; border-radius: 6px; font-size: 14px;">
                        总分 = 基本面 × 30% + 量化分析 × 25% + 新闻舆情 × 25% + 风险控制 × 20%
                    </div>
                </div>

                <div style="margin: 15px 0;">
                    <h5 style="color: #667eea; margin-bottom: 10px;">各维度权重说明</h5>

                    <div class="metric-row">
                        <span class="metric-label">💼 基本面分析</span>
                        <span style="color: #667eea; font-weight: bold;">30%</span>
                    </div>
                    <div style="padding: 10px; background: #f0f9ff; border-radius: 6px; margin-bottom: 10px; font-size: 13px; color: #6b7280;">
                        包含：估值水平、成长性、ROE、PE/PB比率、行业地位等
                    </div>

                    <div class="metric-row">
                        <span class="metric-label">📊 量化分析</span>
                        <span style="color: #667eea; font-weight: bold;">25%</span>
                    </div>
                    <div style="padding: 10px; background: #f0f9ff; border-radius: 6px; margin-bottom: 10px; font-size: 13px; color: #6b7280;">
                        包含：技术指标(MA/RSI)、趋势分析、成交量分析、价格动量等
                    </div>

                    <div class="metric-row">
                        <span class="metric-label">📰 新闻舆情</span>
                        <span style="color: #667eea; font-weight: bold;">25%</span>
                    </div>
                    <div style="padding: 10px; background: #f0f9ff; border-radius: 6px; margin-bottom: 10px; font-size: 13px; color: #6b7280;">
                        包含：新闻情感分析、行业趋势、市场情绪、产品动态等
                    </div>

                    <div class="metric-row">
                        <span class="metric-label">⚠️ 风险控制</span>
                        <span style="color: #667eea; font-weight: bold;">20%</span>
                    </div>
                    <div style="padding: 10px; background: #f0f9ff; border-radius: 6px; margin-bottom: 10px; font-size: 13px; color: #6b7280;">
                        包含：波动性评估、地缘政治风险、市场风险、流动性风险等
                    </div>
                </div>

                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin-top: 15px;">
                    <h5 style="color: #92400e; margin-bottom: 10px;">💡 推荐逻辑</h5>
                    <div style="font-size: 14px; color: #78350f;">
                        <div>• 总分 ≥ 70：买入建议</div>
                        <div>• 40 ≤ 总分 < 70：持有建议</div>
                        <div>• 总分 < 40：卖出建议</div>
                    </div>
                </div>
            </div>

            <!-- 总体预测置信度 -->
            <div class="white-box">
                <h4>🎯 总体预测置信度</h4>
                <div style="text-align: center; font-size: 28px; font-weight: bold; color: #667eea; margin: 20px 0;">
                    {{ (overallConfidence * 100).toFixed(1) }}/100
                </div>
                <div style="background: #f9fafb; border-radius: 8px; padding: 15px; color: #6b7280; font-size: 13px;">
                    综合技术分析、基本面、舆情和风险四维度加权计算得出
                </div>
            </div>
        </div>
        <div v-else class="card">
            <p style="text-align: center; color: #909399;">请选择一支股票查看预测信息</p>
        </div>
    `,
    computed: {
        currentStock() {
            return Store.getCurrentStock();
        },
        predictPrice() {
            return Utils.predictPrice(this.currentStock);
        },
        latestPrice() {
            return Utils.getLatestPrice(this.currentStock) || 0;
        },
        priceChangePercent() {
            if (!this.latestPrice || !this.predictPrice) return '0.00';
            const change = ((this.predictPrice - this.latestPrice) / this.latestPrice * 100);
            return (change >= 0 ? '+' : '') + change.toFixed(2);
        },
        priceChangeColor() {
            if (!this.latestPrice || !this.predictPrice) return '#67c23a';
            return this.predictPrice > this.latestPrice ? '#f56c6c' : '#67c23a';
        },
        overallConfidence() {
            return Utils.getOverallConfidence(this.currentStock);
        },
        strategic() {
            return this.currentStock?.fundamental?.details?.strategic_analysis || {};
        },
        warImpact() {
            return this.currentStock?.risk?.details?.war_impact || {};
        },
        agents() {
            if (!this.currentStock) return [];
            return [
                { name: '量化分析师', icon: '📊', data: this.currentStock.quant || {} },
                { name: '基本面分析师', icon: '💼', data: this.currentStock.fundamental || {} },
                { name: '新闻分析师', icon: '📰', data: this.currentStock.news || {} },
                { name: '风险分析师', icon: '⚠️', data: this.currentStock.risk || {} }
            ];
        }
    },
    methods: {
        formatTime(timestamp) {
            if (!timestamp) return 'N/A';
            return new Date(timestamp).toLocaleString('zh-CN');
        },
        getRiskBadgeClass(impact) {
            const map = {
                '低风险': 'accuracy-high',
                '中等风险': 'accuracy-medium',
                '高风险': 'accuracy-low'
            };
            return map[impact] || 'accuracy-medium';
        }
    }
};
