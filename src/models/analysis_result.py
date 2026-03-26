from typing import List, Dict, Any
from datetime import datetime
from pathlib import Path


class AnalysisReport:
    """Generate analysis report"""

    def __init__(self, results: List[Dict[str, Any]]):
        self.results = results

    def generate_markdown(self) -> str:
        """Generate Markdown report"""
        date_str = datetime.now().strftime("%Y年%m月%d日")

        sections = [
            f"# 股票分析日报 - {date_str}\n",
            "## 概览\n",
            self._generate_overview(),
            "\n---\n",
        ]

        for result in self.results:
            sections.append(f"\n## {result.get('code')} - {self._get_stock_name(result.get('code'))}\n")
            sections.append(self._generate_stock_section(result))
            sections.append("\n---\n")

        sections.append("\n*报告由AI Agent自动生成*\n")

        return "".join(sections)

    def _generate_overview(self) -> str:
        """Generate overview section"""
        lines = ["| 股票代码 | 综合评分 | 建议操作 | 风险等级 |", "|---------|---------|---------|---------|"]

        for result in self.results:
            lines.append(
                f"| {result.get('code')} | {result.get('overall_score', 0):.1f} | "
                f"{result.get('recommendation', 'hold')} | {result.get('risk_level', 'medium')} |"
            )

        return "\n".join(lines)

    def _generate_stock_section(self, result: Dict[str, Any]) -> str:
        """Generate section for individual stock"""
        sections = [
            f"**综合评分:** {result.get('overall_score', 0):.1f}/100",
            f"**建议操作:** {self._translate_recommendation(result.get('recommendation', 'hold'))}",
            f"**风险等级:** {result.get('risk_level', 'medium')}\n",
            "### 基本面分析\n",
            self._format_analysis(result.get("fundamental", {})),
            "\n### 技术分析\n",
            self._format_analysis(result.get("quant", {})),
            "\n### 舆情分析\n",
            self._format_analysis(result.get("news", {})),
            "\n### 风险提示\n",
            self._format_analysis(result.get("risk", {})),
        ]

        return "\n".join(sections)

    def _format_analysis(self, analysis: Dict[str, Any]) -> str:
        """Format analysis result"""
        score = analysis.get("score", 50)
        confidence = analysis.get("confidence", 0)
        summary = analysis.get("summary", "无分析结果")

        text = f"- **评分:** {score:.1f}/100 (置信度: {confidence:.0%})\n"
        text += f"- **结论:** {summary}\n"

        details = analysis.get("details", {})
        if details:
            text += "\n**详细信息:**\n"
            for key, value in details.items():
                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                text += f"- {key}: {value}\n"

        return text

    def _translate_recommendation(self, rec: str) -> str:
        """Translate recommendation to Chinese"""
        mapping = {"buy": "买入", "hold": "持有", "sell": "卖出"}
        return mapping.get(rec, rec)

    def _get_stock_name(self, code: str) -> str:
        """Get stock name from config"""
        from ..config import config

        stocks = config.get_monitored_stocks()
        for stock in stocks:
            if stock["code"] == code:
                return stock["name"]
        return "未知"
