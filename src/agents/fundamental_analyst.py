from typing import Dict, Any
from datetime import datetime
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class FundamentalAnalyst(BaseAgent):
    """Fundamental analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="fundamental_analyst", timeout=timeout)
        self.logger = get_logger("fundamental_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Perform fundamental analysis"""
        financial = data.get("financial_data", {})
        profile = data.get("company_profile", {})

        score = 60.0
        details = {
            "valuation": "fair",
            "growth": "moderate",
        }

        # Add financial indicators
        if financial:
            pe_ratio = financial.get("pe_ratio", 0)
            pb_ratio = financial.get("pb_ratio", 0)
            roe = financial.get("roe", 0)
            gross_margin = financial.get("gross_margin", 0)
            net_margin = financial.get("net_margin", 0)
            debt_ratio = financial.get("debt_ratio", 0)

            details.update({
                "pe_ratio": pe_ratio,
                "pb_ratio": pb_ratio,
                "roe": f"{(roe * 100):.2f}%" if roe else "N/A",
                "gross_margin": f"{(gross_margin * 100):.2f}%" if gross_margin else "N/A",
                "net_margin": f"{(net_margin * 100):.2f}%" if net_margin else "N/A",
                "debt_ratio": f"{(debt_ratio * 100):.2f}%" if debt_ratio else "N/A",
            })

            # Adjust score based on fundamentals
            if pe_ratio and pe_ratio < 25:
                score += 5
            if roe and roe > 0.15:
                score += 10
            if net_margin and net_margin > 0.10:
                score += 5

        # Add company profile
        if profile:
            details.update({
                "industry": profile.get("industry", "N/A"),
                "employees": profile.get("employees", "N/A"),
                "main_business": profile.get("main_business", "N/A"),
            })

        return AgentResult(
            agent_name=self.name,
            score=score,
            confidence=0.6,
            summary="Fundamental analysis completed",
            details=details,
            timestamp=datetime.now().isoformat(),
        )
