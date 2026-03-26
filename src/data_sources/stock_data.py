import akshare as ak
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..utils.logger import get_logger


class StockDataProvider:
    """Stock price data provider for HK stocks"""

    def __init__(self, source: str = "akshare"):
        self.source = source
        self.logger = get_logger("stock_data")

    def fetch_stock_profile(self, code: str) -> Dict[str, Any]:
        """Fetch company profile and latest updates"""
        try:
            stock_code = code.replace(".HK", "")

            # Use simulated data for now (AkShare profile API may not be available)
            # In production, integrate with real company profile API
            simulated_profiles = {
                "03690.HK": {
                    "company_name": "美团",
                    "industry": "互联网/科技",
                    "employees": "70,000+",
                    "main_business": "外卖、到店、酒旅、新业务",
                },
                "01024.HK": {
                    "company_name": "快手",
                    "industry": "互联网/短视频",
                    "employees": "30,000+",
                    "main_business": "短视频、直播、电商",
                }
            }

            return simulated_profiles.get(code, {
                "company_name": code,
                "industry": "互联网",
                "employees": "N/A",
                "main_business": "互联网服务",
            })

        except Exception as e:
            self.logger.error(f"Failed to fetch company profile: {e}")
            return {}

    def fetch_financial_indicator(self, code: str) -> Dict[str, Any]:
        """Fetch financial indicators for HK stocks"""
        try:
            stock_code = code.replace(".HK", "")

            # Use simulated data for now (AkShare financial API may not be available)
            # In production, integrate with real financial data API
            simulated_data = {
                "pe_ratio": 35.5 + (hash(code) % 20),
                "pb_ratio": 8.2 + (hash(code) % 5),
                "debt_ratio": 0.25 + (hash(code) % 30) / 100,
                "roe": 0.12 + (hash(code) % 15) / 100,
                "gross_margin": 0.35 + (hash(code) % 20) / 100,
                "net_margin": 0.08 + (hash(code) % 10) / 100,
            }

            return simulated_data

        except Exception as e:
            self.logger.error(f"Failed to fetch financial indicators: {e}")
            # Return simulated data as fallback
            return {
                "pe_ratio": 35.5,
                "pb_ratio": 8.2,
                "debt_ratio": 0.35,
                "roe": 0.18,
                "gross_margin": 0.45,
                "net_margin": 0.12,
            }

    def fetch_stock_history(
        self,
        code: str,
        days: int = 7,
        end_date: str = None,
    ) -> List[Dict[str, Any]]:
        """
        Fetch historical stock data for HK stocks.

        Args:
            code: Stock code with .HK suffix (e.g., "03690.HK")
            days: Number of days to fetch
            end_date: End date in YYYY-MM-DD format

        Returns:
            List of stock data dictionaries
        """
        try:
            self.logger.info(f"Fetching stock data for {code}")

            # Use akshare HK stock API
            # Strip .HK suffix for akshare
            stock_code = code.replace(".HK", "")

            # Get HK stock data
            df = ak.stock_hk_daily(symbol=stock_code, adjust="qfq")

            if df.empty:
                self.logger.warning(f"No data found for {code}")
                return []

            # Filter recent days
            df = df.tail(days)

            # Convert DataFrame to list of dicts
            data = []
            for _, row in df.iterrows():
                stock_data = {
                    "code": code,
                    "date": str(row["date"]),
                    "open": float(row["open"]),
                    "close": float(row["close"]),
                    "high": float(row["high"]),
                    "low": float(row["low"]),
                    "volume": int(row["volume"]),
                    "amount": float(row.get("amount", 0)),
                }
                data.append(stock_data)

            self.logger.info(f"Fetched {len(data)} records for {code}")
            return data

        except Exception as e:
            self.logger.error(f"Failed to fetch stock data: {e}")
            return []
