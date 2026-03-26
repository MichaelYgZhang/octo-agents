"""
反馈管理器 - 实现Agent自我学习和参数调整

修复版本：解决NaN%显示问题
"""
import json
import os
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta


class FeedbackManager:
    """反馈管理器 - 管理复盘报告并驱动Agent学习"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.reports_file = os.path.join(data_dir, "review_reports.json")
        self.feedback_file = os.path.join(data_dir, "feedback_history.json")
        self.agent_config_file = os.path.join(data_dir, "agent_config.json")

    def load_latest_feedback(self, agent_name: str) -> Optional[Dict]:
        """加载指定Agent的最新反馈"""
        if not os.path.exists(self.reports_file):
            return None

        with open(self.reports_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        reports = data.get("reports", [])

        # 查找最新的包含该agent反馈的报告
        for report in reversed(reports):
            agent_feedbacks = report.get("agent_feedback", [])
            for feedback in agent_feedbacks:
                if feedback.get("agent") == agent_name:
                    return {
                        "agent": agent_name,
                        "score_change": feedback.get("score_change", 0),
                        "suggestion": feedback.get("suggestion", ""),
                        "date": report.get("generated_at", ""),
                        "report_id": report.get("id", "")
                    }

        return None

    def get_agent_adjustments(self, agent_name: str) -> Dict[str, Any]:
        """
        获取Agent需要调整的参数

        Returns:
            Dict包含：
            - parameter_adjustments: 参数调整建议
            - weight_changes: 权重变化
            - new_thresholds: 新阈值
        """
        feedback = self.load_latest_feedback(agent_name)

        if not feedback:
            return {
                "parameter_adjustments": {},
                "weight_changes": {},
                "new_thresholds": {},
                "has_feedback": False
            }

        score_change = feedback.get("score_change", 0)
        suggestion = feedback.get("suggestion", "")

        adjustments = {
            "parameter_adjustments": {},
            "weight_changes": {},
            "new_thresholds": {},
            "has_feedback": True,
            "feedback_score_change": score_change,
            "feedback_suggestion": suggestion
        }

        # 根据Agent类型和反馈生成具体调整
        if agent_name == "量化分析师" or agent_name == "quant_analyst":
            adjustments = self._adjust_quant_analyst(score_change, suggestion, adjustments)
        elif agent_name == "基本面分析师" or agent_name == "fundamental_analyst":
            adjustments = self._adjust_fundamental_analyst(score_change, suggestion, adjustments)
        elif agent_name == "新闻分析师" or agent_name == "news_analyst":
            adjustments = self._adjust_news_analyst(score_change, suggestion, adjustments)
        elif agent_name == "风险分析师" or agent_name == "risk_analyst":
            adjustments = self._adjust_risk_analyst(score_change, suggestion, adjustments)

        return adjustments

    def _adjust_quant_analyst(self, score_change: float, suggestion: str, adjustments: Dict) -> Dict:
        """调整量化分析师参数"""
        if "成交量" in suggestion or "量价" in suggestion:
            adjustments["new_thresholds"]["volume_alert_multiplier"] = 2.0

        if score_change < -3:
            adjustments["parameter_adjustments"]["rsi_oversold"] = 25
            adjustments["parameter_adjustments"]["rsi_overbought"] = 75

        if "技术指标" in suggestion:
            adjustments["weight_changes"]["ma_weight"] = 1.2

        return adjustments

    def _adjust_fundamental_analyst(self, score_change: float, suggestion: str, adjustments: Dict) -> Dict:
        """调整基本面分析师参数"""
        if "财报" in suggestion or "财务报告" in suggestion:
            adjustments["new_thresholds"]["earnings_calendar_alert_days"] = 3

        if "估值" in suggestion:
            adjustments["weight_changes"]["valuation_weight"] = 1.1

        if score_change > 3:
            adjustments["parameter_adjustments"]["maintain_current"] = True

        return adjustments

    def _adjust_news_analyst(self, score_change: float, suggestion: str, adjustments: Dict) -> Dict:
        """调整新闻分析师参数"""
        if "更新频率" in suggestion or "实时" in suggestion:
            adjustments["new_thresholds"]["news_update_interval_hours"] = 1

        if "情感分析" in suggestion:
            adjustments["parameter_adjustments"]["sentiment_model_sensitivity"] = 1.2

        if "突发" in suggestion or "事件" in suggestion:
            adjustments["new_thresholds"]["breaking_news_priority"] = True
            adjustments["parameter_adjustments"]["event_driven_weight"] = 1.5

        return adjustments

    def _adjust_risk_analyst(self, score_change: float, suggestion: str, adjustments: Dict) -> Dict:
        """调整风险分析师参数"""
        if "系统性风险" in suggestion or "大盘" in suggestion:
            adjustments["weight_changes"]["market_risk_weight"] = 1.15

        if "波动率" in suggestion or "波动" in suggestion:
            adjustments["new_thresholds"]["volatility_alert_threshold"] = 0.05

        if score_change < -2:
            adjustments["parameter_adjustments"]["risk_sensitivity"] = "high"

        return adjustments

    def get_learning_summary(self, days: int = 7) -> Dict[str, Any]:
        """
        获取最近N天的学习总结（修复NaN问题）

        Args:
            days: 统计天数

        Returns:
            学习总结数据
        """
        if not os.path.exists(self.reports_file):
            return {
                "error": "No reports available",
                "agent_performance": {},
                "period_days": days,
                "total_reports": 0
            }

        with open(self.reports_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        reports = data.get("reports", [])

        # 简化日期比较，避免时区问题
        cutoff_date_str = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

        recent_reports = [
            r for r in reports
            if r.get("generated_at", "").split("T")[0] >= cutoff_date_str
        ]

        if not recent_reports:
            return {
                "error": f"No reports in the last {days} days",
                "agent_performance": {},
                "period_days": days,
                "total_reports": 0
            }

        # 统计各Agent的平均改进
        agent_improvements = {}
        for report in recent_reports:
            for feedback in report.get("agent_feedback", []):
                agent = feedback.get("agent")
                score_change = feedback.get("score_change", 0)

                if agent not in agent_improvements:
                    agent_improvements[agent] = []
                agent_improvements[agent].append(score_change)

        summary = {
            "period_days": days,
            "total_reports": len(recent_reports),
            "agent_performance": {}
        }

        for agent, changes in agent_improvements.items():
            # 使用简单的平均值计算，避免statistics模块的复杂性
            avg_change = sum(changes) / len(changes) if changes else 0
            positive_changes = len([c for c in changes if c > 0])

            summary["agent_performance"][agent] = {
                "avg_score_change": round(avg_change, 2),
                "total_feedbacks": len(changes),
                "positive_count": positive_changes,
                "improvement_rate": round(positive_changes / len(changes) * 100, 1) if changes else 0
            }

        return summary

    def save_agent_config(self, agent_name: str, config: Dict[str, Any]):
        """保存Agent配置到文件"""
        if os.path.exists(self.agent_config_file):
            with open(self.agent_config_file, 'r', encoding='utf-8') as f:
                all_configs = json.load(f)
        else:
            all_configs = {}

        all_configs[agent_name] = {
            "config": config,
            "updated_at": datetime.now().isoformat()
        }

        with open(self.agent_config_file, 'w', encoding='utf-8') as f:
            json.dump(all_configs, f, ensure_ascii=False, indent=2)

    def load_agent_config(self, agent_name: str) -> Optional[Dict[str, Any]]:
        """加载Agent配置"""
        if not os.path.exists(self.agent_config_file):
            return None

        with open(self.agent_config_file, 'r', encoding='utf-8') as f:
            all_configs = json.load(f)

        return all_configs.get(agent_name)


def main():
    """测试反馈管理器"""
    manager = FeedbackManager()

    # 测试获取量化分析师的反馈
    print("=== 量化分析师反馈 ===")
    feedback = manager.load_latest_feedback("量化分析师")
    if feedback:
        print(json.dumps(feedback, ensure_ascii=False, indent=2))
    else:
        print("暂无反馈")

    print("\n=== 参数调整建议 ===")
    adjustments = manager.get_agent_adjustments("量化分析师")
    print(json.dumps(adjustments, ensure_ascii=False, indent=2))

    print("\n=== 7天学习总结 ===")
    summary = manager.get_learning_summary(7)
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
