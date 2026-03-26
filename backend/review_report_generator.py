#!/usr/bin/env python3
"""
复盘总结报告生成器
用于分析预测差异并生成改进建议
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
import statistics


class ReviewReportGenerator:
    """复盘报告生成器"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.feedback_file = os.path.join(data_dir, "feedback_history.json")
        self.reports_file = os.path.join(data_dir, "review_reports.json")

    def load_data(self) -> Dict:
        """加载预测历史数据"""
        with open(self.feedback_file, 'r', encoding='utf-8') as f:
            return json.load(f)

    def generate_report(self, stock_code: str, period: str = "daily") -> Dict:
        """
        生成复盘报告

        Args:
            stock_code: 股票代码
            period: 时间周期 (daily/weekly/biweekly/monthly/quarterly/yearly)
        """
        data = self.load_data()

        if stock_code not in data:
            return {"error": f"No data found for {stock_code}"}

        history = data[stock_code]

        # 根据周期筛选数据
        filtered = self._filter_by_period(history, period)

        if not filtered:
            return {"error": f"No data in the selected period for {stock_code}"}

        # 计算指标
        metrics = self._calculate_metrics(filtered)

        # 分析差异
        discrepancies = self._analyze_discrepancies(filtered)

        # 生成Agent反馈
        agent_feedback = self._generate_agent_feedback(filtered)

        # 生成改进建议
        suggestions = self._generate_suggestions(discrepancies, metrics)

        # 构建报告
        report = {
            "id": f"review_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "stock_code": stock_code,
            "period": period,
            "generated_at": datetime.now().isoformat(),
            "date_range": {
                "start": filtered[0]["date"],
                "end": filtered[-1]["date"]
            },
            "metrics": metrics,
            "discrepancies": discrepancies,
            "agent_feedback": agent_feedback,
            "suggestions": suggestions,
            "action_items": self._generate_action_items(suggestions)
        }

        # 保存报告
        self._save_report(report)

        return report

    def _filter_by_period(self, history: List[Dict], period: str) -> List[Dict]:
        """根据时间周期筛选数据"""
        now = datetime.now()
        period_days = {
            "daily": 1,
            "weekly": 7,
            "biweekly": 14,
            "monthly": 30,
            "quarterly": 90,
            "yearly": 365
        }

        days = period_days.get(period, 7)
        start_date = now - timedelta(days=days)

        return [
            item for item in history
            if datetime.fromisoformat(item["date"]) >= start_date
        ]

    def _calculate_metrics(self, history: List[Dict]) -> Dict:
        """计算复盘指标"""
        accuracies = []
        errors = []
        correct_direction = 0

        for item in history:
            if not (item.get("predicted_price") and item.get("actual_price")):
                continue

            predicted = item["predicted_price"]
            actual = item["actual_price"]

            error = abs(predicted - actual) / actual * 100
            errors.append(error)

            accuracy = max(0, (1 - error / 100))
            accuracies.append(accuracy)

            # 判断方向是否正确
            if item.get("recommendation") == "buy" and actual > predicted:
                correct_direction += 1
            elif item.get("recommendation") == "sell" and actual < predicted:
                correct_direction += 1
            elif item.get("recommendation") == "hold":
                correct_direction += 1

        return {
            "accuracy": statistics.mean(accuracies) * 100 if accuracies else 0,
            "prediction_count": len(history),
            "avg_error": statistics.mean(errors) if errors else 0,
            "correct_direction": correct_direction,
            "total_predictions": len(accuracies)
        }

    def _analyze_discrepancies(self, history: List[Dict]) -> List[Dict]:
        """分析预测差异"""
        discrepancies = []

        for item in history:
            if not (item.get("predicted_price") and item.get("actual_price")):
                continue

            predicted = item["predicted_price"]
            actual = item["actual_price"]
            error = abs(predicted - actual) / actual * 100

            # 只记录误差超过3%的情况
            if error > 3:
                reason = self._generate_discrepancy_reason(item)
                discrepancies.append({
                    "date": item["date"],
                    "predicted": predicted,
                    "actual": actual,
                    "error": error,
                    "reason": reason
                })

        return discrepancies

    def _generate_discrepancy_reason(self, item: Dict) -> str:
        """生成差异原因分析"""
        predicted = item["predicted_price"]
        actual = item["actual_price"]
        diff = actual - predicted

        reasons = []

        if diff > 0:
            # 实际价格高于预测
            if item.get("overall_score", 0) < 60:
                reasons.append("市场情绪超出预期，可能受突发利好消息影响")
            else:
                reasons.append("预测偏向保守，实际市场表现强劲")

            if diff / predicted > 0.05:
                reasons.append("建议增加新闻舆情权重，提高对突发事件响应")
        else:
            # 实际价格低于预测
            if item.get("overall_score", 0) > 60:
                reasons.append("预测过于乐观，未能及时捕捉市场调整信号")
            else:
                reasons.append("市场整体下行趋势明显，模型预测幅度不足")

            reasons.append("建议加强风险控制模块的敏感性")

        return "。".join(reasons) + "。"

    def _generate_agent_feedback(self, history: List[Dict]) -> List[Dict]:
        """生成Agent反馈"""
        # 简化版本，实际应该基于历史表现计算
        return [
            {
                "agent": "量化分析师",
                "score_change": round(statistics.uniform(-3, 5), 1),
                "suggestion": "增加成交量分析权重，优化MA交叉信号判断逻辑"
            },
            {
                "agent": "基本面分析师",
                "score_change": round(statistics.uniform(-2, 4), 1),
                "suggestion": "更及时地纳入财务报告数据，提高估值模型精度"
            },
            {
                "agent": "新闻分析师",
                "score_change": round(statistics.uniform(-5, 6), 1),
                "suggestion": "提高对突发事件的响应速度，优化情感分析模型"
            },
            {
                "agent": "风险分析师",
                "score_change": round(statistics.uniform(-2, 3), 1),
                "suggestion": "加强对系统性风险的识别，提前预警市场波动"
            }
        ]

    def _generate_suggestions(self, discrepancies: List[Dict], metrics: Dict) -> List[str]:
        """生成改进建议"""
        suggestions = []

        if metrics["avg_error"] > 5:
            suggestions.append("预测误差较大，建议优化模型参数，提高预测精度")

        if metrics["accuracy"] < 90:
            suggestions.append("准确率偏低，建议增加更多维度的分析指标")

        if discrepancies:
            suggestions.append("建立财报日历系统，提前预警重要事件")
            suggestions.append("增加大盘走势权重，提高系统性风险识别能力")

        suggestions.append("优化各Agent之间的信息共享和协同决策能力")

        return suggestions[:5]  # 最多5条建议

    def _generate_action_items(self, suggestions: List[str]) -> List[str]:
        """生成行动项"""
        # 简化版本，实际应该将建议转化为具体行动
        return [
            "更新数据源配置",
            "调整模型参数",
            "优化预测逻辑",
            "实施改进方案"
        ][:len(suggestions)]

    def _save_report(self, report: Dict):
        """保存报告"""
        if os.path.exists(self.reports_file):
            with open(self.reports_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {"reports": [], "summary": {}}

        data["reports"].append(report)

        # 更新汇总信息
        total = len(data["reports"])
        avg_accuracy = statistics.mean([r["metrics"]["accuracy"] for r in data["reports"]])

        data["summary"] = {
            "total_reports": total,
            "avg_accuracy": avg_accuracy,
            "last_updated": datetime.now().isoformat()
        }

        with open(self.reports_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def get_period_summary(self, stock_code: str, period: str = "weekly") -> Dict:
        """获取周期汇总"""
        report = self.generate_report(stock_code, period)

        if "error" in report:
            return report

        # 添加更详细的汇总分析
        summary = {
            **report,
            "insights": self._generate_insights(report),
            "next_actions": self._plan_next_actions(report)
        }

        return summary

    def _generate_insights(self, report: Dict) -> List[str]:
        """生成洞察"""
        insights = []

        accuracy = report["metrics"]["accuracy"]
        if accuracy > 95:
            insights.append("预测准确率优秀，模型表现稳定")
        elif accuracy > 90:
            insights.append("预测准确率良好，有提升空间")
        else:
            insights.append("预测准确率需要改进，建议重新评估模型")

        return insights

    def _plan_next_actions(self, report: Dict) -> List[str]:
        """规划下一步行动"""
        actions = []

        for suggestion in report["suggestions"][:3]:
            actions.append(f"本周内: {suggestion}")

        actions.append("下周: 验证改进效果，调整优化策略")

        return actions


def main():
    """主函数"""
    generator = ReviewReportGenerator()

    # 为美团生成周报
    print("生成美团周报...")
    report = generator.generate_report("03690.HK", "weekly")
    print(json.dumps(report, ensure_ascii=False, indent=2))

    print("\n" + "="*50 + "\n")

    # 为网易生成周报
    print("生成网易周报...")
    report = generator.generate_report("01024.HK", "weekly")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
