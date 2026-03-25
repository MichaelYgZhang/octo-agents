import pytest
from src.models.schemas import StockData, FinancialData, NewsItem


def test_stock_data_schema():
    stock = StockData(
        code="03690.HK",
        name="美团",
        date="2024-01-01",
        open=1800.0,
        close=1820.0,
        high=1830.0,
        low=1795.0,
        volume=1234567,
        amount=2234567890.0,
    )
    assert stock.code == "03690.HK"
    assert stock.change_pct == pytest.approx(1.11, rel=0.01)


def test_financial_data_schema():
    financial = FinancialData(
        code="03690.HK",
        report_date="2023-12-31",
        revenue=150.5,
        net_profit=70.2,
        roe=0.31,
        pe_ratio=35.2,
        pb_ratio=10.5,
    )
    assert financial.revenue == 150.5
    assert financial.roe == 0.31


def test_news_item_schema():
    news = NewsItem(
        title="美团发布新业务",
        content="美团推出新服务",
        source="新浪财经",
        publish_date="2024-01-15",
        sentiment="positive",
        score=0.85,
    )
    assert news.sentiment == "positive"
