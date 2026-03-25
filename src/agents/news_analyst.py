from typing import Dict, Any
from datetime import datetime
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class NewsAnalyst(BaseAgent):
    """News sentiment analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="news_analyst", timeout=timeout)
        self.logger = get_logger("news_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Analyze news sentiment"""
        news_items = data.get("news_items", [])

        if not news_items:
            return AgentResult(
                agent_name=self.name,
                score=50.0,
                confidence=0.0,
                summary="No news data available",
                details={},
                timestamp=datetime.now().isoformat(),
            )

        return AgentResult(
            agent_name=self.name,
            score=55.0,
            confidence=0.5,
            summary="News sentiment neutral",
            details={"news_count": len(news_items)},
            timestamp=datetime.now().isoformat(),
        )
