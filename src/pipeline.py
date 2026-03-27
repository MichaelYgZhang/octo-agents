from datetime import datetime
from typing import List, Dict, Any
import json
from pathlib import Path

from .agents.data_collector import DataCollector
from .agents.quant_analyst import QuantAnalyst
from .agents.fundamental_analyst import FundamentalAnalyst
from .agents.news_analyst import NewsAnalyst
from .agents.risk_analyst import RiskAnalyst
from .models.analysis_result import AnalysisReport
from .config import config
from .utils.logger import get_logger
from .feedback.learner import FeedbackLearner


logger = get_logger("pipeline")


def run_analysis():
    """Main analysis pipeline"""
    logger.info("Starting stock analysis pipeline")

    # Get monitored stocks
    stocks = config.get_monitored_stocks()
    stock_codes = [s["code"] for s in stocks]

    # Step 1: Collect data (30 days for full range support)
    logger.info("Step 1: Collecting data...")
    collector = DataCollector()
    stock_data = collector.collect(stock_codes, days=30)  # 获取30天数据

    # Step 2: Analyze each stock
    logger.info("Step 2: Analyzing stocks...")
    all_results = []

    quant_analyst = QuantAnalyst()
    fundamental_analyst = FundamentalAnalyst()
    news_analyst = NewsAnalyst()
    risk_analyst = RiskAnalyst()

    for stock in stocks:
        code = stock["code"]
        name = stock["name"]
        
        logger.info(f"Analyzing {code} - {name}")
        
        data = stock_data.get(code, {})

        # Run analysis
        quant_result = quant_analyst.analyze(data)
        fundamental_result = fundamental_analyst.analyze(data)
        news_result = news_analyst.analyze(data)
        risk_result = risk_analyst.analyze(data)

        # Calculate overall score (simplified)
        overall_score = (
            fundamental_result.score * 0.30 +
            quant_result.score * 0.25 +
            news_result.score * 0.25 +
            risk_result.score * 0.20
        )

        # Determine recommendation
        if overall_score >= 70:
            recommendation = "buy"
        elif overall_score >= 40:
            recommendation = "hold"
        else:
            recommendation = "sell"

        # Risk level
        risk_level = risk_result.details.get("risk_level", "medium")

        result = {
            "code": code,
            "name": name,
            "date": datetime.now().strftime("%Y-%m-%d"),
            "fundamental": fundamental_result.model_dump(),
            "quant": quant_result.model_dump(),
            "news": news_result.model_dump(),
            "risk": risk_result.model_dump(),
            "overall_score": round(overall_score, 2),
            "recommendation": recommendation,
            "risk_level": risk_level,
            "stock_history": data.get("stock_history", []),  # 添加历史股价数据
        }

        all_results.append(result)

    # Step 3: Save results
    logger.info("Step 3: Saving results...")
    save_results(all_results)

    # Step 4: Generate report
    logger.info("Step 4: Generating report...")
    generate_report(all_results)

    # Step 5: Feedback learning
    logger.info("Step 5: Recording predictions for feedback...")
    from .utils.price_predictor import predict_price
    feedback_learner = FeedbackLearner()
    for result in all_results:
        # Calculate predicted price before recording
        if result.get("stock_history"):
            latest_price = result["stock_history"][-1]["close"]
            predicted_price = predict_price(result, latest_price)
            result["predicted_price"] = round(predicted_price, 2)

        # Record new prediction
        feedback_learner.record_prediction(result["code"], result)

        # Validate old predictions if we have current data
        if result.get("stock_history"):
            current_price = result["stock_history"][-1]["close"]
            feedback_learner.validate_predictions(result["code"], current_price)

    logger.info("Pipeline completed successfully")

    return all_results


def save_results(results: List[Dict[str, Any]]):
    """Save analysis results to files"""
    # Save latest results
    latest_path = Path("data/latest.json")
    latest_path.parent.mkdir(parents=True, exist_ok=True)

    with open(latest_path, "w") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    # Save to history
    date_str = datetime.now().strftime("%Y-%m-%d")
    for result in results:
        code = result["code"]
        history_path = Path(f"data/history/{code}/{date_str}.json")
        history_path.parent.mkdir(parents=True, exist_ok=True)

        with open(history_path, "w") as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

    logger.info(f"Saved results for {len(results)} stocks")


def generate_report(results: List[Dict[str, Any]]):
    """Generate Markdown report"""
    report = AnalysisReport(results)
    report_text = report.generate_markdown()

    # Save report
    date_str = datetime.now().strftime("%Y-%m-%d")
    report_path = Path(f"reports/daily/{date_str}.md")
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, "w") as f:
        f.write(report_text)

    logger.info(f"Generated report: {report_path}")
