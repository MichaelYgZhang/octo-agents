"""
更新预测记录的实际价格 - 每日收盘后更新昨日预测的实际收盘价
"""
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
import json

# 添加项目根目录到sys.path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from src.data_sources.stock_data import StockDataProvider
from src.utils.logger import get_logger


logger = get_logger("update_actual_prices")


def update_actual_prices():
    """
    更新昨日预测的实际收盘价

    最佳执行时间：收盘后（16:30）
    - 港股收盘时间：16:00
    - 数据源更新完成：约16:15-16:30
    - 此时更新昨日预测的实际价格，数据完整且准确
    """
    logger.info("=" * 60)
    logger.info("开始更新预测实际价格...")
    logger.info(f"执行时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info("=" * 60)

    feedback_file = project_root / "data" / "feedback_history.json"

    if not feedback_file.exists():
        logger.warning("预测历史文件不存在")
        return

    # 加载现有数据
    with open(feedback_file, 'r', encoding='utf-8') as f:
        feedback_data = json.load(f)

    # 获取昨日日期
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")
    logger.info(f"正在更新 {yesterday} 的实际价格")

    # 初始化数据提供者
    stock_provider = StockDataProvider()

    updated_count = 0

    # 遍历每支股票
    for stock_code, predictions in feedback_data.items():
        # 找到昨日未验证的预测
        yesterday_predictions = [
            p for p in predictions
            if p.get("date") == yesterday and not p.get("validated")
        ]

        if not yesterday_predictions:
            logger.info(f"  {stock_code}: 无需更新的预测")
            continue

        try:
            # 获取最近2天的股价数据（包括昨日）
            stock_history = stock_provider.fetch_stock_history(stock_code, days=2)

            if not stock_history or len(stock_history) < 1:
                logger.warning(f"  {stock_code}: 无法获取股价数据")
                continue

            # 获取昨日收盘价
            # stock_history[0] 是最新的
            yesterday_close = None
            for record in stock_history:
                # 假设数据有date字段，否则使用最新的收盘价
                if "date" in record and record["date"] == yesterday:
                    yesterday_close = record.get("close")
                    break

            # 如果没有找到匹配日期的记录，使用最新的收盘价
            if yesterday_close is None and stock_history:
                yesterday_close = stock_history[0].get("close")

            if yesterday_close is None:
                logger.warning(f"  {stock_code}: 无法确定昨日收盘价")
                continue

            # 更新昨日预测的实际价格
            for prediction in yesterday_predictions:
                prediction["actual_price"] = yesterday_close
                prediction["validated"] = True

                # 计算误差
                predicted = prediction.get("predicted_price", 0)
                if predicted and yesterday_close:
                    error_pct = abs(predicted - yesterday_close) / yesterday_close * 100
                    prediction["error_percentage"] = error_pct

                    logger.info(f"  {stock_code}: 预测={predicted:.2f}, "
                              f"实际={yesterday_close:.2f}, 误差={error_pct:.2f}%")

            updated_count += 1

        except Exception as e:
            logger.error(f"  {stock_code}: 更新失败 - {str(e)}")
            continue

    # 保存更新后的数据
    if updated_count > 0:
        with open(feedback_file, 'w', encoding='utf-8') as f:
            json.dump(feedback_data, f, indent=2, ensure_ascii=False)

        logger.info(f"✅ 成功更新 {updated_count} 支股票的实际价格")
    else:
        logger.info("没有需要更新的预测记录")

    logger.info("=" * 60)
    logger.info("实际价格更新完成")
    logger.info("=" * 60)


def main():
    """主函数"""
    update_actual_prices()


if __name__ == "__main__":
    main()
