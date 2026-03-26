"""
每日预测生成器 - 收盘后预测明日股价
"""
import os
import sys
from datetime import datetime
from pathlib import Path

# 添加项目根目录到sys.path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.pipeline import run_analysis
from src.utils.logger import get_logger


logger = get_logger("daily_prediction")


def generate_daily_prediction():
    """
    生成每日股价预测

    最佳执行时间：收盘后30分钟（16:30）
    - 港股收盘时间：16:00
    - 数据源更新完成：约16:15-16:30
    - 此时运行预测，数据完整且准确
    """
    logger.info("=" * 60)
    logger.info("开始生成每日股价预测...")
    logger.info(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    try:
        # 运行分析流程
        results = run_analysis()

        if results:
            logger.info(f"✅ 预测生成成功！共分析 {len(results)} 支股票")

            # 输出预测摘要
            for result in results:
                code = result.get("code")
                name = result.get("name")
                score = result.get("overall_score", 0)
                recommendation = result.get("recommendation", "hold")

                logger.info(f"  {code} {name}:")
                logger.info(f"    综合评分: {score:.1f}")
                logger.info(f"    推荐操作: {recommendation}")

            # 保存预测记录到feedback_history.json
            _save_prediction_record(results)

        else:
            logger.warning("⚠️  未生成任何预测结果")

        logger.info("=" * 60)
        logger.info("预测生成完成！")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"✗ 预测生成失败: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())


def _save_prediction_record(results):
    """保存预测记录到feedback_history.json"""
    import json

    feedback_file = project_root / "data" / "feedback_history.json"

    # 加载现有数据
    if feedback_file.exists():
        with open(feedback_file, 'r', encoding='utf-8') as f:
            feedback_data = json.load(f)
    else:
        feedback_data = {}

    # 更新预测记录
    for result in results:
        code = result.get("code")
        if not code:
            continue

        if code not in feedback_data:
            feedback_data[code] = []

        # 计算预测价格
        from src.utils.price_predictor import predict_price
        latest_price = result.get("stock_history", [{}])[-1].get("close", 0)
        predicted_price = predict_price(result, latest_price)

        # 添加预测记录
        prediction_record = {
            "date": result.get("date"),
            "predicted_price": round(predicted_price, 2),
            "recommendation": result.get("recommendation"),
            "overall_score": result.get("overall_score"),
            "quant_score": result.get("quant", {}).get("score", 0),
            "fundamental_score": result.get("fundamental", {}).get("score", 0),
            "news_score": result.get("news", {}).get("score", 0),
            "risk_score": result.get("risk", {}).get("score", 0),
            "actual_price": None,  # 次日收盘后填充
            "validated": False
        }

        # 避免重复记录同一天的预测
        existing_dates = [r["date"] for r in feedback_data[code]]
        if prediction_record["date"] not in existing_dates:
            feedback_data[code].append(prediction_record)
            logger.info(f"  ✓ {code} 预测记录已保存")

    # 保存到文件
    with open(feedback_file, 'w', encoding='utf-8') as f:
        json.dump(feedback_data, f, indent=2, ensure_ascii=False)

    logger.info(f"预测记录已保存到: {feedback_file}")


def main():
    """主函数"""
    generate_daily_prediction()


if __name__ == "__main__":
    main()
