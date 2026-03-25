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
