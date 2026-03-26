"""
价格预测工具
根据Agent评分预测股价
"""


def predict_price(analysis_result: dict, current_price: float) -> float:
    """
    根据分析结果预测股价

    Args:
        analysis_result: Agent分析结果
        current_price: 当前股价

    Returns:
        预测股价
    """
    if not analysis_result or not current_price:
        return current_price

    # 获取综合评分
    overall_score = analysis_result.get("overall_score", 50)

    # 计算预期变化率
    # 评分越高，预测涨幅越大
    # 评分范围：0-100
    # 变化率范围：-10% ~ +10%

    # 将评分映射到变化率
    # score = 0 → change_rate = -10%
    # score = 50 → change_rate = 0%
    # score = 100 → change_rate = +10%

    change_rate = (overall_score - 50) / 50 * 0.10  # -10% ~ +10%

    # 预测价格
    predicted_price = current_price * (1 + change_rate)

    return predicted_price


def predict_trend(analysis_result: dict) -> str:
    """
    预测股价趋势

    Args:
        analysis_result: Agent分析结果

    Returns:
        趋势描述：'strong_up', 'up', 'neutral', 'down', 'strong_down'
    """
    overall_score = analysis_result.get("overall_score", 50)

    if overall_score >= 75:
        return "strong_up"
    elif overall_score >= 60:
        return "up"
    elif overall_score >= 40:
        return "neutral"
    elif overall_score >= 25:
        return "down"
    else:
        return "strong_down"


def calculate_confidence(analysis_result: dict) -> float:
    """
    计算预测置信度

    Args:
        analysis_result: Agent分析结果

    Returns:
        置信度：0.0 ~ 1.0
    """
    # 获取各Agent的置信度
    quant_conf = analysis_result.get("quant", {}).get("confidence", 0.5)
    fundamental_conf = analysis_result.get("fundamental", {}).get("confidence", 0.5)
    news_conf = analysis_result.get("news", {}).get("confidence", 0.5)
    risk_conf = analysis_result.get("risk", {}).get("confidence", 0.5)

    # 加权平均
    confidence = (
        quant_conf * 0.25 +
        fundamental_conf * 0.30 +
        news_conf * 0.25 +
        risk_conf * 0.20
    )

    return confidence
