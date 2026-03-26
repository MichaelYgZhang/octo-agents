from pydantic import BaseModel, Field
from typing import Optional, List


class StockData(BaseModel):
    """Stock price data"""
    code: str
    name: str
    date: str
    open: float
    close: float
    high: float
    low: float
    volume: int
    amount: float

    @property
    def change_pct(self) -> float:
        """Calculate daily change percentage"""
        if self.open == 0:
            return 0.0
        return round(((self.close - self.open) / self.open) * 100, 2)


class FinancialData(BaseModel):
    """Financial statement data"""
    code: str
    report_date: str
    revenue: Optional[float] = None
    net_profit: Optional[float] = None
    total_assets: Optional[float] = None
    total_liabilities: Optional[float] = None
    cash_flow: Optional[float] = None
    roe: Optional[float] = None
    roa: Optional[float] = None
    pe_ratio: Optional[float] = None
    pb_ratio: Optional[float] = None
    debt_ratio: Optional[float] = None


class NewsItem(BaseModel):
    """News item with sentiment"""
    title: str
    content: str
    source: str
    publish_date: str
    sentiment: str = "neutral"
    score: float = 0.5
    impact: Optional[str] = None
    entities: List[str] = Field(default_factory=list)


class AgentResult(BaseModel):
    """Agent analysis result"""
    agent_name: str
    score: float = Field(ge=0, le=100)
    confidence: float = Field(ge=0, le=1)
    summary: str
    details: dict = Field(default_factory=dict)
    timestamp: str


class AnalysisResult(BaseModel):
    """Complete analysis result for a stock"""
    code: str
    name: str
    date: str
    fundamental: Optional[AgentResult] = None
    quant: Optional[AgentResult] = None
    news: Optional[AgentResult] = None
    risk: Optional[AgentResult] = None
    overall_score: float = 0.0
    recommendation: str = "hold"
    risk_level: str = "medium"
