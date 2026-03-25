from typing import Dict, Any, List
from .base import BaseAgent
from ..data_sources.stock_data import StockDataProvider
from ..utils.logger import get_logger


class DataCollector(BaseAgent):
    """Data collection agent"""

    def __init__(self, timeout: int = 600):
        super().__init__(name="data_collector", timeout=timeout)
        self.stock_provider = StockDataProvider()
        self.logger = get_logger("data_collector")

    def analyze(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Collect data (not a standard agent)"""
        return {}

    def collect(self, stock_codes: List[str], days: int = 7) -> Dict[str, Any]:
        """Collect data for multiple stocks"""
        results = {}

        for code in stock_codes:
            self.logger.info(f"Collecting data for {code}")

            stock_history = self.stock_provider.fetch_stock_history(code, days=days)
            company_profile = self.stock_provider.fetch_stock_profile(code)
            financial_indicators = self.stock_provider.fetch_financial_indicator(code)

            # Calculate volume statistics
            volume_stats = {}
            if stock_history:
                volumes = [h["volume"] for h in stock_history]
                amounts = [h["amount"] for h in stock_history]
                volume_stats = {
                    "avg_volume": sum(volumes) / len(volumes) if volumes else 0,
                    "max_volume": max(volumes) if volumes else 0,
                    "min_volume": min(volumes) if volumes else 0,
                    "avg_amount": sum(amounts) / len(amounts) if amounts else 0,
                    "total_amount": sum(amounts),
                }

            if stock_history:
                results[code] = {
                    "code": code,
                    "stock_history": stock_history,
                    "financial_data": financial_indicators,
                    "company_profile": company_profile,
                    "volume_stats": volume_stats,
                    "news_items": [],
                }

        return results
