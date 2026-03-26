"""
自动化调度系统 - 每日收盘后自动生成复盘报告并驱动Agent学习

简化版本，不依赖外部库
"""
import os
import sys
import json
from datetime import datetime, timedelta
from pathlib import Path

# 添加项目根目录到sys.path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from backend.review_report_generator import ReviewReportGenerator
from src.feedback.feedback_manager import FeedbackManager


class AutomatedScheduler:
    """自动化调度系统"""

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # 自动检测数据目录
            data_dir = project_root / "data"

        self.data_dir = str(data_dir)
        self.review_generator = ReviewReportGenerator(self.data_dir)
        self.feedback_manager = FeedbackManager(self.data_dir)
        self.log_file = os.path.join(self.data_dir, "automation.log")

    def log(self, message: str):
        """记录日志"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        print(log_entry)

        try:
            with open(self.log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry + "\n")
        except:
            pass

    def generate_daily_review(self):
        """
        生成每日复盘报告

        港股收盘时间：16:00
        执行时间：17:00（收盘后1小时）
        """
        self.log("=" * 60)
        self.log("开始生成每日复盘报告...")

        try:
            # 获取所有股票代码
            stock_codes = self._get_all_stock_codes()

            if not stock_codes:
                self.log("⚠ 没有找到股票数据")
                return

            generated_count = 0
            for stock_code in stock_codes:
                try:
                    # 生成每日报告
                    report = self.review_generator.generate_report(stock_code, "daily")

                    if "error" not in report:
                        self.log(f"✓ {stock_code} 复盘报告已生成")
                        generated_count += 1

                        # 应用反馈到Agent
                        self._apply_feedback_to_agents(stock_code)
                    else:
                        self.log(f"⚠ {stock_code}: {report.get('error')}")

                except Exception as e:
                    self.log(f"✗ {stock_code} 生成失败: {str(e)}")

            self.log(f"完成！共生成 {generated_count} 份复盘报告")
            self.log("=" * 60)

        except Exception as e:
            self.log(f"✗ 生成复盘报告失败: {str(e)}")
            import traceback
            self.log(traceback.format_exc())

    def generate_weekly_review(self):
        """
        生成每周复盘报告

        执行时间：每周五 18:00
        """
        self.log("=" * 60)
        self.log("开始生成每周复盘报告...")

        try:
            stock_codes = self._get_all_stock_codes()

            for stock_code in stock_codes:
                report = self.review_generator.generate_report(stock_code, "weekly")
                if "error" not in report:
                    self.log(f"✓ {stock_code} 周报已生成")

            self.log("周报生成完成！")
            self.log("=" * 60)

        except Exception as e:
            self.log(f"✗ 生成周报失败: {str(e)}")

    def _get_all_stock_codes(self) -> list:
        """获取所有股票代码"""
        feedback_file = os.path.join(self.data_dir, "feedback_history.json")

        if not os.path.exists(feedback_file):
            self.log(f"文件不存在: {feedback_file}")
            return []

        with open(feedback_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        codes = list(data.keys())
        self.log(f"找到 {len(codes)} 支股票: {', '.join(codes)}")
        return codes

    def _apply_feedback_to_agents(self, stock_code: str):
        """
        应用反馈到Agent系统

        Args:
            stock_code: 股票代码
        """
        self.log(f"  → 应用反馈到Agent系统...")

        try:
            # 加载最新的复盘报告
            reports_file = os.path.join(self.data_dir, "review_reports.json")

            if not os.path.exists(reports_file):
                self.log(f"  ⚠ 复盘报告文件不存在")
                return

            with open(reports_file, 'r', encoding='utf-8') as f:
                data = json.load(f)

            reports = data.get("reports", [])
            stock_reports = [r for r in reports if r.get("stock_code") == stock_code]

            if not stock_reports:
                self.log(f"  ⚠ 未找到该股票的复盘报告")
                return

            latest_report = stock_reports[-1]

            # 提取Agent反馈
            agent_feedbacks = latest_report.get("agent_feedback", [])

            if not agent_feedbacks:
                self.log(f"  ⚠ 未找到Agent反馈")
                return

            # 保存反馈配置
            for feedback in agent_feedbacks:
                agent_name = feedback.get("agent")

                if not agent_name:
                    continue

                suggestion = feedback.get("suggestion", "")

                config = {
                    "last_feedback": feedback,
                    "feedback_date": latest_report.get("generated_at"),
                    "applied": True,
                    "applied_at": datetime.now().isoformat()
                }

                self.feedback_manager.save_agent_config(agent_name, config)
                self.log(f"    ✓ {agent_name} 反馈已应用: {suggestion[:50]}...")

            self.log(f"  → Agent反馈应用完成")

        except Exception as e:
            self.log(f"  ✗ 应用反馈失败: {str(e)}")
            import traceback
            self.log(traceback.format_exc())

    def print_learning_summary(self):
        """打印学习总结"""
        try:
            summary = self.feedback_manager.get_learning_summary(7)

            if "error" in summary:
                self.log(summary["error"])
                return

            self.log("=" * 60)
            self.log("最近7天Agent学习总结：")

            for agent, performance in summary.get("agent_performance", {}).items():
                avg_change = performance.get("avg_score_change", 0)
                improvement_rate = performance.get("improvement_rate", 0)

                status = "↑" if avg_change > 0 else "↓"
                self.log(f"  {agent}: {status} {abs(avg_change):.2f} | 改进率: {improvement_rate}%")

            self.log("=" * 60)
        except Exception as e:
            self.log(f"打印学习总结失败: {str(e)}")

    def run_once(self):
        """立即执行一次复盘报告生成"""
        self.generate_daily_review()
        self.print_learning_summary()


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="股票分析平台自动化调度系统")
    parser.add_argument(
        "--data-dir",
        default=None,
        help="数据目录路径（自动检测）"
    )

    args = parser.parse_args()

    scheduler = AutomatedScheduler(args.data_dir)
    scheduler.run_once()


if __name__ == "__main__":
    main()
