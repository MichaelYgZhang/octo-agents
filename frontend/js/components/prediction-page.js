// 预测白盒页面组件
const PredictionPage = {
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
        }
    }
};
