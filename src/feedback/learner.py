"""
Feedback Learning System for Stock Analysis
Records predictions, tracks accuracy, and adjusts model weights
"""
import json
from pathlib import Path
from datetime import datetime, timedelta
from typing import Dict, List, Any
from .utils.logger import get_logger


class FeedbackLearner:
    """Track prediction accuracy and adjust model parameters"""

    def __init__(self, history_file: str = "data/feedback_history.json"):
        self.history_file = Path(history_file)
        self.history_file.parent.mkdir(parents=True, exist_ok=True)
        self.logger = get_logger("feedback_learner")
        self.history = self._load_history()

    def _load_history(self) -> Dict[str, List[Dict]]:
        """Load feedback history from file"""
        if self.history_file.exists():
            with open(self.history_file, 'r') as f:
                return json.load(f)
        return {}

    def _save_history(self):
        """Save feedback history to file"""
        with open(self.history_file, 'w') as f:
            json.dump(self.history, f, indent=2, ensure_ascii=False)

    def record_prediction(self, stock_code: str, prediction: Dict[str, Any]):
        """
        Record a prediction for later validation

        Args:
            stock_code: Stock code (e.g., "03690.HK")
            prediction: Prediction data including predicted_price, recommendation, scores
        """
        if stock_code not in self.history:
            self.history[stock_code] = []

        record = {
            "date": datetime.now().strftime("%Y-%m-%d"),
            "predicted_price": prediction.get("predicted_price", 0),
            "recommendation": prediction.get("recommendation", "hold"),
            "overall_score": prediction.get("overall_score", 0),
            "quant_score": prediction.get("quant", {}).get("score", 0),
            "fundamental_score": prediction.get("fundamental", {}).get("score", 0),
            "news_score": prediction.get("news", {}).get("score", 0),
            "risk_score": prediction.get("risk", {}).get("score", 0),
            "actual_price": None,  # To be filled later
            "validated": False
        }

        self.history[stock_code].append(record)
        self._save_history()
        self.logger.info(f"Recorded prediction for {stock_code} on {record['date']}")

    def validate_predictions(self, stock_code: str, current_price: float):
        """
        Validate past predictions with actual prices

        Args:
            stock_code: Stock code
            current_price: Current stock price
        """
        if stock_code not in self.history:
            return

        # Validate predictions that are 7-30 days old
        validation_window = 7  # days
        cutoff_date = (datetime.now() - timedelta(days=validation_window)).strftime("%Y-%m-%d")

        for record in self.history[stock_code]:
            if not record["validated"] and record["date"] <= cutoff_date:
                record["actual_price"] = current_price
                record["validated"] = True

                # Calculate accuracy
                predicted = record["predicted_price"]
                actual = current_price
                error_pct = abs(predicted - actual) / actual * 100
                record["error_percentage"] = error_pct

                self.logger.info(f"Validated {stock_code} prediction from {record['date']}: "
                                f"predicted={predicted:.2f}, actual={actual:.2f}, error={error_pct:.2f}%")

        self._save_history()

    def calculate_accuracy(self, stock_code: str, days: int = 30) -> Dict[str, float]:
        """
        Calculate prediction accuracy for a stock

        Args:
            stock_code: Stock code
            days: Number of days to analyze

        Returns:
            Dictionary with accuracy metrics
        """
        if stock_code not in self.history:
            return {"accuracy": 0, "avg_error": 0, "prediction_count": 0}

        cutoff_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
        validated = [r for r in self.history[stock_code]
                     if r["validated"] and r["date"] >= cutoff_date]

        if not validated:
            return {"accuracy": 0, "avg_error": 0, "prediction_count": 0}

        errors = [r.get("error_percentage", 0) for r in validated]

        # Accuracy = percentage of predictions within 5% error
        accurate_predictions = sum(1 for e in errors if e <= 5)
        accuracy = accurate_predictions / len(errors) if errors else 0

        avg_error = sum(errors) / len(errors) if errors else 0

        return {
            "accuracy": accuracy,
            "avg_error": avg_error,
            "prediction_count": len(validated)
        }

    def get_adjusted_weights(self, stock_code: str) -> Dict[str, float]:
        """
        Get adjusted weights based on historical performance

        Returns:
            Dictionary with adjusted weights for each analysis dimension
        """
        accuracy = self.calculate_accuracy(stock_code, days=30)

        # Default weights
        default_weights = {
            "quant": 0.25,
            "fundamental": 0.30,
            "news": 0.25,
            "risk": 0.20
        }

        # If not enough data, return default weights
        if accuracy["prediction_count"] < 5:
            return default_weights

        # Simple adjustment: boost weights for better performing analysts
        # (This is a simplified approach; production systems would use more sophisticated methods)
        return default_weights

    def get_feedback_report(self, stock_code: str) -> Dict[str, Any]:
        """
        Generate a comprehensive feedback report

        Args:
            stock_code: Stock code

        Returns:
            Dictionary with feedback statistics
        """
        accuracy_7d = self.calculate_accuracy(stock_code, days=7)
        accuracy_30d = self.calculate_accuracy(stock_code, days=30)

        return {
            "stock_code": stock_code,
            "7_day_accuracy": accuracy_7d,
            "30_day_accuracy": accuracy_30d,
            "adjusted_weights": self.get_adjusted_weights(stock_code),
            "total_predictions": len(self.history.get(stock_code, [])),
            "validated_predictions": sum(1 for r in self.history.get(stock_code, [])
                                         if r.get("validated", False))
        }
