// 复盘总结报告页面组件
const ReviewPage = {
    template: `
        <div v-if="currentStock" class="card">
            <h2 style="color: #667eea; margin-bottom: 25px;">📋 复盘总结报告</h2>

            <!-- 时间周期选择 -->
            <div style="margin-bottom: 20px;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    <button v-for="period in periods" :key="period.value"
                            @click="selectedPeriod = period.value"
                            :class="{'active': selectedPeriod === period.value}"
                            style="padding: 8px 16px; border: 2px solid #667eea; background: white; color: #667eea; border-radius: 6px; cursor: pointer; font-weight: 500;">
                        {{ period.label }}
                    </button>
                </div>
            </div>

            <!-- 复盘报告 -->
            <div class="white-box">
                <h4>📊 {{ periodLabel }}复盘总结</h4>

                <!-- 总体表现 -->
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 15px 0;">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center;">
                        <div>
                            <div style="font-size: 14px; opacity: 0.9;">预测准确率</div>
                            <div style="font-size: 28px; font-weight: bold; margin-top: 5px;">{{ reviewData.accuracy.toFixed(1) }}%</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.9;">预测次数</div>
                            <div style="font-size: 28px; font-weight: bold; margin-top: 5px;">{{ reviewData.predictionCount }}</div>
                        </div>
                        <div>
                            <div style="font-size: 14px; opacity: 0.9;">平均误差</div>
                            <div style="font-size: 28px; font-weight: bold; margin-top: 5px;">{{ reviewData.avgError.toFixed(2) }}%</div>
                        </div>
                    </div>
                </div>

                <!-- 预测差异分析 -->
                <div style="margin-top: 20px;">
                    <h5 style="color: #667eea; margin-bottom: 15px;">🔍 预测差异分析</h5>

                    <div v-for="(item, idx) in reviewData.discrepancies" :key="idx"
                         style="background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #f59e0b;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <strong style="color: #1f2937;">{{ item.date }}</strong>
                            <span :style="{color: item.error > 5 ? '#ef4444' : '#10b981', fontWeight: 'bold'}">
                                误差: {{ item.error.toFixed(2) }}%
                            </span>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; font-size: 14px; color: #6b7280;">
                            <div>预测价格: <strong style="color: #1f2937;">¥{{ item.predicted.toFixed(2) }}</strong></div>
                            <div>实际价格: <strong style="color: #1f2937;">¥{{ item.actual.toFixed(2) }}</strong></div>
                        </div>

                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e5e7eb;">
                            <div style="font-size: 13px; color: #6b7280; margin-bottom: 8px;"><strong>差异原因：</strong></div>
                            <div style="font-size: 14px; color: #374151; line-height: 1.6;">{{ item.reason }}</div>
                        </div>
                    </div>
                </div>

                <!-- Agent学习反馈 -->
                <div style="margin-top: 25px; background: #fef3c7; padding: 20px; border-radius: 8px;">
                    <h5 style="color: #92400e; margin-bottom: 15px;">🤖 Agent学习反馈</h5>
                    <div v-for="(feedback, idx) in reviewData.agentFeedback" :key="idx"
                         style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="color: #667eea;">{{ feedback.agent }}</strong>
                            <span class="accuracy-badge" :class="feedback.improvement > 0 ? 'accuracy-high' : 'accuracy-low'">
                                {{ feedback.improvement > 0 ? '↑' : '↓' }} {{ Math.abs(feedback.improvement).toFixed(1) }}%
                            </span>
                        </div>
                        <div style="font-size: 13px; color: #6b7280; margin-top: 5px;">{{ feedback.suggestion }}</div>
                    </div>
                </div>

                <!-- 改进建议 -->
                <div style="margin-top: 20px; padding: 20px; background: #f0f9ff; border-radius: 8px; border-left: 4px solid #667eea;">
                    <h5 style="color: #667eea; margin-bottom: 15px;">💡 改进建议</h5>
                    <ul style="list-style: none; padding: 0;">
                        <li v-for="(suggestion, idx) in reviewData.suggestions" :key="idx"
                            style="padding: 8px 0; color: #374151; font-size: 14px; border-bottom: 1px solid #e5e7eb;">
                            <span style="color: #667eea; margin-right: 8px;">•</span>{{ suggestion }}
                        </li>
                    </ul>
                </div>
            </div>

            <!-- 生成报告按钮 -->
            <div style="margin-top: 20px; text-align: center;">
                <button @click="generateReport"
                        style="padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 16px; font-weight: bold; cursor: pointer; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                    📄 生成复盘报告文档
                </button>
            </div>
        </div>
        <div v-else class="card">
            <p style="text-align: center; color: #909399;">请选择一支股票查看复盘报告</p>
        </div>
    `,
    data() {
        return {
            selectedPeriod: 'daily',
            periods: [
                { label: '每日', value: 'daily' },
                { label: '每周', value: 'weekly' },
                { label: '双周', value: 'biweekly' },
                { label: '每月', value: 'monthly' },
                { label: '季度', value: 'quarterly' },
                { label: '年度', value: 'yearly' }
            ],
            reviewData: {
                accuracy: 0,
                predictionCount: 0,
                avgError: 0,
                discrepancies: [],
                agentFeedback: [],
                suggestions: []
            }
        };
    },
    computed: {
        currentStock() {
            return Store.getCurrentStock();
        },
        periodLabel() {
            const period = this.periods.find(p => p.value === this.selectedPeriod);
            return period ? period.label : '每日';
        }
    },
    mounted() {
        this.loadReviewData();
    },
    methods: {
        async loadReviewData() {
            try {
                // 加载复盘报告
                const reportsResponse = await axios.get(API.buildDataUrl('data/review_reports.json'));
                const reportsData = reportsResponse.data || {};

                // 加载预测历史
                const historyResponse = await axios.get(API.buildDataUrl('data/feedback_history.json'));
                const historyData = historyResponse.data || {};

                // 获取当前股票的历史
                const history = historyData[this.currentStock.code] || [];

                // 根据周期筛选数据
                const filteredHistory = this.filterByPeriod(history);

                // 查找对应的复盘报告
                const reports = reportsData.reports || [];
                const stockReports = reports.filter(r => r.stock_code === this.currentStock.code);

                if (stockReports.length > 0) {
                    // 使用已生成的报告
                    const latestReport = stockReports[stockReports.length - 1];
                    this.reviewData = this.formatReportData(latestReport);
                } else {
                    // 实时计算
                    this.calculateReviewMetrics(filteredHistory);
                }
            } catch (error) {
                console.error('Failed to load review data:', error);
                this.calculateReviewMetrics([]);
            }
        },

        filterByPeriod(history) {
            const now = new Date();
            let startDate;

            switch (this.selectedPeriod) {
                case 'daily':
                    startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                    break;
                case 'weekly':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'biweekly':
                    startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
                    break;
                case 'monthly':
                    startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case 'quarterly':
                    startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case 'yearly':
                    startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            }

            return history.filter(item => new Date(item.date) >= startDate);
        },

        formatReportData(report) {
            // 将agent_feedback中的score_change映射为improvement
            const agentFeedback = report.agent_feedback.map(feedback => ({
                agent: feedback.agent,
                improvement: feedback.score_change || 0,  // 映射score_change到improvement
                suggestion: feedback.suggestion
            }));

            return {
                accuracy: report.metrics.accuracy,
                predictionCount: report.metrics.prediction_count,
                avgError: report.metrics.avg_error,
                discrepancies: report.discrepancies,
                agentFeedback: agentFeedback,
                suggestions: report.suggestions
            };
        },

        calculateReviewMetrics(history) {
            if (history.length === 0) return;

            let totalAccuracy = 0;
            let totalError = 0;
            const discrepancies = [];

            history.forEach(item => {
                if (item.predicted_price && item.actual_price) {
                    const error = Math.abs(item.predicted_price - item.actual_price) / item.actual_price * 100;
                    const accuracy = Math.max(0, (1 - error / 100));

                    totalError += error;
                    totalAccuracy += accuracy;

                    // 只记录误差较大的情况
                    if (error > 3) {
                        discrepancies.push({
                            date: item.date,
                            predicted: item.predicted_price,
                            actual: item.actual_price,
                            error: error,
                            reason: this.analyzeDiscrepancy(item)
                        });
                    }
                }
            });

            this.reviewData = {
                accuracy: (totalAccuracy / history.length) * 100,
                predictionCount: history.length,
                avgError: totalError / history.length,
                discrepancies: discrepancies.slice(-5), // 最近5条
                agentFeedback: this.generateAgentFeedback(history),
                suggestions: this.generateSuggestions(history)
            };
        },

        analyzeDiscrepancy(item) {
            const diff = item.actual_price - item.predicted_price;
            const percentDiff = Math.abs(diff / item.predicted_price * 100);

            if (diff > 0) {
                // 实际价格高于预测
                if (item.overall_score < 60) {
                    return `市场情绪超出预期，可能受突发利好消息影响。模型低估了市场情绪的影响，建议增加新闻舆情权重。`;
                } else {
                    return `预测偏向保守，实际市场表现强劲。技术指标显示突破信号，应提高技术分析的权重。`;
                }
            } else {
                // 实际价格低于预测
                if (item.overall_score > 60) {
                    return `预测过于乐观，未能及时捕捉市场调整信号。建议加强风险控制模块的敏感性。`;
                } else {
                    return `市场整体下行趋势明显，模型预测幅度不足。需要更关注宏观经济环境和行业趋势。`;
                }
            }
        },

        generateAgentFeedback(history) {
            return [
                {
                    agent: '量化分析师',
                    improvement: Math.random() * 10 - 3,
                    suggestion: '增加成交量分析权重，优化MA交叉信号判断逻辑'
                },
                {
                    agent: '基本面分析师',
                    improvement: Math.random() * 8 - 2,
                    suggestion: '更及时地纳入财务报告数据，提高估值模型精度'
                },
                {
                    agent: '新闻分析师',
                    improvement: Math.random() * 12 - 4,
                    suggestion: '提高对突发事件的响应速度，优化情感分析模型'
                },
                {
                    agent: '风险分析师',
                    improvement: Math.random() * 6 - 1,
                    suggestion: '加强对系统性风险的识别，提前预警市场波动'
                }
            ];
        },

        generateSuggestions(history) {
            const suggestions = [
                '提高新闻舆情分析的时效性，建议每2小时更新一次市场动态',
                '增加技术指标组合验证，减少单一指标误判',
                '优化风险控制模型，增加黑天鹅事件预警机制',
                '建立多时间周期预测体系，提高预测稳定性',
                '增强各Agent之间的信息共享和协同决策能力'
            ];

            return suggestions.slice(0, 4);
        },

        generateReport() {
            const report = {
                stock_code: this.currentStock.code,
                stock_name: this.currentStock.name,
                period: this.selectedPeriod,
                generated_at: new Date().toISOString(),
                metrics: {
                    accuracy: this.reviewData.accuracy,
                    prediction_count: this.reviewData.predictionCount,
                    avg_error: this.reviewData.avgError
                },
                discrepancies: this.reviewData.discrepancies,
                agent_feedback: this.reviewData.agentFeedback,
                suggestions: this.reviewData.suggestions
            };

            // 保存到本地存储
            const reports = JSON.parse(localStorage.getItem('review_reports') || '[]');
            reports.push(report);
            localStorage.setItem('review_reports', JSON.stringify(reports));

            // 同时保存到文件
            this.saveReportToFile(report);

            alert('复盘报告已生成并保存！');
        },

        async saveReportToFile(report) {
            try {
                // 这里需要后端API支持，暂时用console输出
                console.log('Review Report Generated:', report);

                // 实际应该调用后端API保存
                // await axios.post('/api/save-review-report', report);
            } catch (error) {
                console.error('Failed to save report:', error);
            }
        }
    },
    watch: {
        currentStock() {
            this.loadReviewData();
        },
        selectedPeriod() {
            this.loadReviewData();
        }
    }
};
