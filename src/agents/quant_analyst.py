from typing import Dict, Any
from datetime import datetime
import pandas as pd
import numpy as np
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class QuantAnalyst(BaseAgent):
    """Quantitative analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="quant_analyst", timeout=timeout)
        self.logger = get_logger("quant_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Perform quantitative analysis"""
        stock_history = data.get("stock_history", [])

        if len(stock_history) < 5:
            return AgentResult(
                agent_name=self.name,
                score=50.0,
                confidence=0.0,
                summary="Insufficient data for quantitative analysis",
                details={},
                timestamp=datetime.now().isoformat(),
            )

        # Convert to DataFrame
        df = pd.DataFrame(stock_history)

        # Calculate indicators
        indicators = self.calculate_indicators(df)

        # Generate trading signal
        signal = self.generate_signal(indicators)

        # Calculate score
        score = self.calculate_score(indicators, signal)

        return AgentResult(
            agent_name=self.name,
            score=score,
            confidence=0.7,
            summary=f"Quantitative analysis: {signal}",
            details={
                "signal": signal,
                "ma5": float(indicators.get("ma5", 0)),
                "rsi": float(indicators.get("rsi", 50)),
                "trend": indicators.get("trend", "neutral"),
            },
            timestamp=datetime.now().isoformat(),
        )

    def calculate_indicators(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate technical indicators"""
        indicators = {}

        # Moving Averages
        indicators["ma5"] = df["close"].rolling(window=5).mean().iloc[-1]
        indicators["ma10"] = df["close"].rolling(window=10).mean().iloc[-1] if len(df) >= 10 else df["close"].mean()

        # RSI (simplified)
        if len(df) >= 14:
            delta = df["close"].diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
            rs = gain / loss
            indicators["rsi"] = float(100 - (100 / (1 + rs.iloc[-1])))
        else:
            indicators["rsi"] = 50.0

        # Trend
        indicators["trend"] = "up" if indicators["ma5"] > df["close"].iloc[-2] else "down"

        return indicators

    def generate_signal(self, indicators: Dict[str, Any]) -> str:
        """Generate trading signal"""
        rsi = indicators.get("rsi", 50)

        if rsi < 30:
            return "buy"
        elif rsi > 70:
            return "sell"
        elif indicators.get("trend") == "up":
            return "buy"
        else:
            return "hold"

    def calculate_score(self, indicators: Dict[str, Any], signal: str) -> float:
        """Calculate overall score"""
        base_score = 50.0

        if signal == "buy":
            base_score += 25
        elif signal == "sell":
            base_score -= 25

        rsi = indicators.get("rsi", 50)
        if 40 <= rsi <= 60:
            base_score += 10

        return max(0, min(100, base_score))
