# Stock Analysis Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-agent stock analysis platform that runs daily via GitHub Actions, analyzes stocks using 4 specialized agents, and displays results on a static GitHub Pages site.

**Architecture:** Prefect-orchestrated pipeline with 8 agents (Planner, Data Collector, Data Validator, Fundamental/Quant/News/Risk Analysts, Report Generator) running in GitHub Actions. Agents execute in parallel using multiprocessing.Pool with Queue-based communication. Includes feedback learning system with historical validation, adaptive weight adjustment, and human rule integration. Results stored in repository, rendered by Vue3 static frontend with prediction vs reality visualization.

**Tech Stack:** Python 3.11+, Prefect 2.0, Anthropic API, AkShare/Tushare, Vue3, ECharts, GitHub Actions, GitHub Pages

---

## File Structure

```
stock-analysis-platform/
├── src/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base.py                    # BaseAgent class
│   │   ├── planner.py                 # Orchestrator
│   │   ├── data_collector.py          # Data acquisition
│   │   ├── data_validator.py          # Data validation
│   │   ├── fundamental_analyst.py      # Financial analysis
│   │   ├── quant_analyst.py           # Technical analysis
│   │   ├── news_analyst.py            # Sentiment analysis
│   │   ├── risk_analyst.py            # Risk assessment
│   │   ├── report_generator.py        # Report generation
│   │   └── feedback_learner.py        # Feedback learning & weight adjustment
│   ├── data_sources/
│   │   ├── __init__.py
│   │   ├── stock_data.py              # Stock price API wrapper
│   │   ├── financial_data.py          # Financial statement API
│   │   └── news_scraper.py            # News scraping utilities
│   ├── models/
│   │   ├── __init__.py
│   │   ├── schemas.py                 # Pydantic models
│   │   └── analysis_result.py        # Result data structures
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── llm_client.py              # LLM API wrapper with retry
│   │   ├── cache.py                   # LLM response caching
│   │   ├── logger.py                  # Logging utilities
│   │   └── retry.py                   # Exponential backoff retry
│   ├── feedback/
│   │   ├── __init__.py
│   │   ├── prediction_tracker.py      # Track historical predictions
│   │   ├── accuracy_validator.py      # Validate prediction accuracy
│   │   ├── weight_adjuster.py         # Adaptive weight adjustment
│   │   └── human_rules.py             # Human rule integration
│   ├── pipeline.py                    # Prefect workflow with multiprocessing
│   └── config.py                      # Configuration management
├── tests/
│   ├── agents/
│   │   ├── test_base.py
│   │   ├── test_planner.py
│   │   ├── test_data_collector.py
│   │   ├── test_fundamental_analyst.py
│   │   ├── test_quant_analyst.py
│   │   ├── test_news_analyst.py
│   │   └── test_risk_analyst.py
│   ├── data_sources/
│   │   ├── test_stock_data.py
│   │   ├── test_financial_data.py
│   │   └── test_news_scraper.py
│   ├── conftest.py                    # Pytest fixtures
│   └── test_pipeline.py
├── data/
│   ├── latest.json                    # Most recent analysis
│   ├── history/                       # Historical data by date
│   └── intermediate/                  # Agent intermediate results
│       ├── collector.json
│       ├── fundamental.json
│       ├── quant.json
│       ├── news.json
│       └── risk.json
├── reports/
│   ├── daily/                         # Daily summary reports
│   └── stocks/                        # Individual stock reports
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── App.vue
│   │   ├── main.js
│   │   ├── components/
│   │   │   ├── StockOverview.vue     # Summary dashboard
│   │   │   ├── FundamentalCard.vue   # Fundamental analysis card
│   │   │   ├── QuantChart.vue        # Technical indicators chart
│   │   │   ├── NewsFeed.vue          # News sentiment feed
│   │   │   └── RiskIndicator.vue     # Risk level indicator
│   │   └── utils/
│   │       └── api.js                # Data fetching utilities
│   └── dist/                          # Build output
├── config/
│   ├── stocks.json                    # Monitored stocks list
│   └── agents.yaml                    # Agent configuration
├── .github/
│   └── workflows/
│       └── daily-analysis.yml        # GitHub Actions workflow
├── pyproject.toml                     # Python dependencies
├── requirements.txt
├── README.md
└── run_local.py                       # Local execution script
```

---

## Task 1: Project Setup & Core Models

**Files:**
- Create: `pyproject.toml`
- Create: `requirements.txt`
- Create: `src/models/__init__.py`
- Create: `src/models/schemas.py`
- Create: `src/models/analysis_result.py`
- Create: `config/stocks.json`
- Create: `config/agents.yaml`
- Create: `src/config.py`

- [ ] **Step 1: Create project structure**

```bash
mkdir -p src/agents src/data_sources src/models src/utils
mkdir -p tests/agents tests/data_sources
mkdir -p data/history data/intermediate
mkdir -p reports/daily reports/stocks
mkdir -p frontend/src/components frontend/src/utils
mkdir -p config .github/workflows
```

- [ ] **Step 2: Create pyproject.toml**

```toml
[project]
name = "stock-analysis-platform"
version = "0.1.0"
description = "Multi-agent stock analysis platform"
requires-python = ">=3.11"
dependencies = [
    "prefect>=2.14.0",
    "anthropic>=0.18.0",
    "akshare>=1.12.0",
    "tushare>=1.4.0",
    "pandas>=2.1.0",
    "numpy>=1.26.0",
    "pydantic>=2.5.0",
    "matplotlib>=3.8.0",
    "plotly>=5.18.0",
    "beautifulsoup4>=4.12.0",
    "requests>=2.31.0",
    "PyYAML>=6.0.1",
    "python-dotenv>=1.0.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=7.4.0",
    "pytest-cov>=4.1.0",
    "pytest-asyncio>=0.21.0",
    "black>=23.0.0",
    "ruff>=0.1.0",
]
```

- [ ] **Step 3: Create requirements.txt**

```
prefect>=2.14.0
anthropic>=0.18.0
akshare>=1.12.0
tushare>=1.4.0
pandas>=2.1.0
numpy>=1.26.0
pydantic>=2.5.0
matplotlib>=3.8.0
plotly>=5.18.0
beautifulsoup4>=4.12.0
requests>=2.31.0
PyYAML>=6.0.1
python-dotenv>=1.0.0
pytest>=7.4.0
pytest-cov>=4.1.0
```

- [ ] **Step 4: Write test for schema models**

Create `tests/models/test_schemas.py`:

```python
import pytest
from datetime import date
from src.models.schemas import StockData, FinancialData, NewsItem


def test_stock_data_schema():
    stock = StockData(
        code="600519",
        name="贵州茅台",
        date="2024-01-01",
        open=1800.0,
        close=1820.0,
        high=1830.0,
        low=1795.0,
        volume=1234567,
        amount=2234567890.0,
    )
    assert stock.code == "600519"
    assert stock.change_pct == pytest.approx(1.11, rel=0.01)


def test_financial_data_schema():
    financial = FinancialData(
        code="600519",
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
        title="茅台发布新品",
        content="贵州茅台推出新产品线",
        source="新浪财经",
        publish_date="2024-01-15",
        sentiment="positive",
        score=0.85,
    )
    assert news.sentiment == "positive"
```

- [ ] **Step 5: Run test to verify it fails**

```bash
pytest tests/models/test_schemas.py -v
```

Expected: FAIL with "ModuleNotFoundError: No module named 'src'"

- [ ] **Step 6: Create schema models**

Create `src/models/schemas.py`:

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date


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
    revenue: Optional[float] = None  # 亿元
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
    sentiment: str = "neutral"  # positive, negative, neutral
    score: float = 0.5  # 0-1 confidence
    impact: Optional[str] = None  # short-term, mid-term, long-term
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
```

Create `src/models/__init__.py`:

```python
from .schemas import StockData, FinancialData, NewsItem, AgentResult, AnalysisResult
from .analysis_result import AnalysisReport

__all__ = [
    "StockData",
    "FinancialData",
    "NewsItem",
    "AgentResult",
    "AnalysisResult",
    "AnalysisReport",
]
```

- [ ] **Step 7: Run tests to verify they pass**

```bash
pytest tests/models/test_schemas.py -v
```

Expected: PASS (3 tests)

- [ ] **Step 8: Create configuration files**

Create `config/stocks.json`:

```json
{
  "monitored_stocks": [
    {
      "code": "600519",
      "name": "贵州茅台",
      "sector": "白酒"
    },
    {
      "code": "000858",
      "name": "五粮液",
      "sector": "白酒"
    }
  ],
  "update_frequency": "daily",
  "analysis_time": "08:00"
}
```

Create `config/agents.yaml`:

```yaml
agents:
  planner:
    enabled: true
    timeout: 600

  data_collector:
    enabled: true
    timeout: 300
    sources:
      - akshare
      - tushare
      - web_scraper

  fundamental_analyst:
    enabled: true
    timeout: 300
    weight: 0.30

  quant_analyst:
    enabled: true
    timeout: 300
    weight: 0.25

  news_analyst:
    enabled: true
    timeout: 300
    weight: 0.25

  risk_analyst:
    enabled: true
    timeout: 300
    weight: 0.20

llm:
  provider: "anthropic"
  model: "claude-sonnet-4-6"
  temperature: 0.7
  max_tokens: 4096
  cache_ttl: 86400

data_sources:
  akshare:
    enabled: true

  tushare:
    enabled: true
    token_env: "TUSHARE_TOKEN"

  web_scraper:
    enabled: true
    sources:
      - name: "sina_finance"
        url: "https://finance.sina.com.cn"
        type: "rss"
      - name: "eastmoney"
        url: "https://www.eastmoney.com"
        type: "html"
```

Create `src/config.py`:

```python
import json
import yaml
from pathlib import Path
from typing import Dict, Any


class Config:
    """Configuration manager"""

    def __init__(self, config_dir: str = "config"):
        self.config_dir = Path(config_dir)
        self._stocks_config = None
        self._agents_config = None

    @property
    def stocks(self) -> Dict[str, Any]:
        if self._stocks_config is None:
            with open(self.config_dir / "stocks.json") as f:
                self._stocks_config = json.load(f)
        return self._stocks_config

    @property
    def agents(self) -> Dict[str, Any]:
        if self._agents_config is None:
            with open(self.config_dir / "agents.yaml") as f:
                self._agents_config = yaml.safe_load(f)
        return self._agents_config

    def get_monitored_stocks(self) -> list:
        return self.stocks.get("monitored_stocks", [])

    def get_agent_config(self, agent_name: str) -> Dict[str, Any]:
        return self.agents.get("agents", {}).get(agent_name, {})


config = Config()
```

- [ ] **Step 9: Commit project setup**

```bash
git add .
git commit -m "feat: initialize project structure and core models

- Set up project structure with src/, tests/, data/, reports/
- Add pyproject.toml and requirements.txt
- Create Pydantic schemas for stock data, financials, news
- Add configuration files for stocks and agents
- Implement Config manager class"
```

---

## Task 2: Base Agent Framework

**Files:**
- Create: `src/agents/base.py`
- Create: `src/utils/logger.py`
- Create: `tests/agents/test_base.py`

- [ ] **Step 1: Write test for BaseAgent**

Create `tests/agents/test_base.py`:

```python
import pytest
from src.agents.base import BaseAgent
from src.models.schemas import AgentResult


class DummyAgent(BaseAgent):
    """Test agent implementation"""

    def analyze(self, data: dict) -> AgentResult:
        return AgentResult(
            agent_name=self.name,
            score=75.0,
            confidence=0.8,
            summary="Test analysis complete",
            details={"test_key": "test_value"},
            timestamp="2024-01-01T12:00:00",
        )


def test_agent_initialization():
    agent = DummyAgent(name="test_agent", timeout=60)
    assert agent.name == "test_agent"
    assert agent.timeout == 60


def test_agent_run():
    agent = DummyAgent(name="test_agent")
    result = agent.run({"test": "data"})
    assert isinstance(result, AgentResult)
    assert result.agent_name == "test_agent"
    assert result.score == 75.0
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/agents/test_base.py -v
```

Expected: FAIL with "ModuleNotFoundError: No module named 'src.agents'"

- [ ] **Step 3: Implement BaseAgent**

Create `src/utils/logger.py`:

```python
import logging
import sys
from pathlib import Path


def get_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    """Get configured logger"""
    logger = logging.getLogger(name)
    logger.setLevel(level)

    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger
```

Create `src/agents/base.py`:

```python
from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime
import signal
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class TimeoutException(Exception):
    """Agent execution timeout"""
    pass


def timeout_handler(signum, frame):
    raise TimeoutException("Agent execution timed out")


class BaseAgent(ABC):
    """Base class for all analysis agents"""

    def __init__(self, name: str, timeout: int = 300):
        self.name = name
        self.timeout = timeout
        self.logger = get_logger(f"agent.{name}")

    @abstractmethod
    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """
        Perform analysis on input data.

        Args:
            data: Input data for analysis

        Returns:
            AgentResult with score, confidence, and summary
        """
        pass

    def run(self, data: Dict[str, Any]) -> AgentResult:
        """
        Execute agent with timeout protection.

        Args:
            data: Input data

        Returns:
            AgentResult

        Raises:
            TimeoutException: If execution exceeds timeout
        """
        # Set timeout handler (Unix only)
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(self.timeout)

        try:
            self.logger.info(f"Agent {self.name} starting analysis")
            result = self.analyze(data)
            result.timestamp = datetime.now().isoformat()
            self.logger.info(f"Agent {self.name} completed analysis")
            return result
        except TimeoutException:
            self.logger.error(f"Agent {self.name} timed out after {self.timeout}s")
            raise
        finally:
            signal.alarm(0)  # Cancel alarm

    def validate_input(self, data: Dict[str, Any], required_keys: list) -> bool:
        """Validate that input data contains required keys"""
        missing = [k for k in required_keys if k not in data]
        if missing:
            self.logger.warning(f"Missing required keys: {missing}")
            return False
        return True
```

Create `src/agents/__init__.py`:

```python
from .base import BaseAgent, TimeoutException

__all__ = ["BaseAgent", "TimeoutException"]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/agents/test_base.py -v
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit base agent framework**

```bash
git add src/agents src/utils/logger.py tests/agents/test_base.py
git commit -m "feat: implement BaseAgent framework

- Add abstract BaseAgent class with timeout protection
- Implement logger utility
- Add signal-based timeout handler
- Write tests for agent initialization and execution"
```

---

## Task 3: LLM Client & Utilities

**Files:**
- Create: `src/utils/llm_client.py`
- Create: `src/utils/cache.py`
- Create: `src/utils/__init__.py`
- Create: `tests/utils/test_llm_client.py`

- [ ] **Step 1: Write test for LLM client**

Create `tests/utils/test_llm_client.py`:

```python
import pytest
from unittest.mock import Mock, patch
from src.utils.llm_client import LLMClient


def test_llm_client_initialization():
    client = LLMClient(provider="anthropic", model="claude-sonnet-4-6")
    assert client.provider == "anthropic"
    assert client.model == "claude-sonnet-4-6"


@patch("src.utils.llm_client.Anthropic")
def test_llm_client_call(mock_anthropic):
    mock_client = Mock()
    mock_response = Mock()
    mock_response.content = [Mock(text="Test response")]
    mock_client.messages.create.return_value = mock_response
    mock_anthropic.return_value = mock_client

    client = LLMClient(provider="anthropic", model="claude-sonnet-4-6")
    result = client.generate("Test prompt")

    assert result == "Test response"
    mock_client.messages.create.assert_called_once()
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/utils/test_llm_client.py -v
```

Expected: FAIL with "ModuleNotFoundError"

- [ ] **Step 3: Implement LLM client with caching**

Create `src/utils/cache.py`:

```python
import hashlib
import json
from pathlib import Path
from typing import Optional
import time


class ResponseCache:
    """Simple file-based cache for LLM responses"""

    def __init__(self, cache_dir: str = "data/cache", ttl: int = 86400):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.ttl = ttl  # Time-to-live in seconds

    def _get_cache_key(self, prompt: str) -> str:
        """Generate cache key from prompt"""
        return hashlib.md5(prompt.encode()).hexdigest()

    def get(self, prompt: str) -> Optional[str]:
        """Get cached response if exists and not expired"""
        key = self._get_cache_key(prompt)
        cache_file = self.cache_dir / f"{key}.json"

        if not cache_file.exists():
            return None

        with open(cache_file) as f:
            data = json.load(f)

        # Check if expired
        if time.time() - data["timestamp"] > self.ttl:
            cache_file.unlink()
            return None

        return data["response"]

    def set(self, prompt: str, response: str):
        """Cache a response"""
        key = self._get_cache_key(prompt)
        cache_file = self.cache_dir / f"{key}.json"

        data = {
            "prompt": prompt,
            "response": response,
            "timestamp": time.time()
        }

        with open(cache_file, "w") as f:
            json.dump(data, f, indent=2)
```

Create `src/utils/llm_client.py`:

```python
import os
from typing import Optional, Dict, Any
from anthropic import Anthropic
from .cache import ResponseCache
from .logger import get_logger


class LLMClient:
    """LLM API client with caching"""

    def __init__(
        self,
        provider: str = "anthropic",
        model: str = "claude-sonnet-4-6",
        temperature: float = 0.7,
        max_tokens: int = 4096,
        cache_ttl: int = 86400,
    ):
        self.provider = provider
        self.model = model
        self.temperature = temperature
        self.max_tokens = max_tokens
        self.logger = get_logger("llm_client")

        # Initialize cache
        self.cache = ResponseCache(ttl=cache_ttl)

        # Initialize API client
        if provider == "anthropic":
            api_key = os.getenv("DEEPSEEK_API_KEY")
            if not api_key:
                raise ValueError("DEEPSEEK_API_KEY environment variable not set")
            self.client = Anthropic(api_key=api_key)
        else:
            raise ValueError(f"Unsupported provider: {provider}")

    def generate(
        self,
        prompt: str,
        use_cache: bool = True,
        system: Optional[str] = None,
    ) -> str:
        """
        Generate response from LLM.

        Args:
            prompt: User prompt
            use_cache: Whether to use cached response
            system: System prompt

        Returns:
            Generated text
        """
        # Check cache
        if use_cache:
            cached = self.cache.get(prompt)
            if cached:
                self.logger.info("Using cached LLM response")
                return cached

        # Call API
        self.logger.info(f"Calling {self.provider} API")

        messages = [{"role": "user", "content": prompt}]

        kwargs = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "messages": messages,
        }

        if system:
            kwargs["system"] = system

        response = self.client.messages.create(**kwargs)

        # Extract text
        text = response.content[0].text

        # Cache response
        if use_cache:
            self.cache.set(prompt, text)

        return text

    def analyze_json(
        self,
        prompt: str,
        use_cache: bool = True,
    ) -> Dict[str, Any]:
        """Generate response and parse as JSON"""
        import json

        response = self.generate(prompt, use_cache=use_cache)

        # Extract JSON from response
        try:
            # Try to find JSON in code blocks
            if "```json" in response:
                start = response.index("```json") + 7
                end = response.index("```", start)
                json_str = response[start:end].strip()
            elif "```" in response:
                start = response.index("```") + 3
                end = response.index("```", start)
                json_str = response[start:end].strip()
            else:
                json_str = response

            return json.loads(json_str)
        except (json.JSONDecodeError, ValueError) as e:
            self.logger.error(f"Failed to parse JSON response: {e}")
            return {}
```

Create `src/utils/__init__.py`:

```python
from .llm_client import LLMClient
from .cache import ResponseCache
from .logger import get_logger

__all__ = ["LLMClient", "ResponseCache", "get_logger"]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/utils/test_llm_client.py -v
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit LLM utilities**

```bash
git add src/utils tests/utils
git commit -m "feat: implement LLM client with caching

- Add LLMClient wrapper for Anthropic API
- Implement file-based response cache with TTL
- Add JSON parsing utilities
- Write tests for LLM client"
```

---

## Task 4: Data Sources

**Files:**
- Create: `src/data_sources/stock_data.py`
- Create: `src/data_sources/financial_data.py`
- Create: `tests/data_sources/test_stock_data.py`

- [ ] **Step 1: Write test for stock data fetching**

Create `tests/data_sources/test_stock_data.py`:

```python
import pytest
from unittest.mock import patch, Mock
from src.data_sources.stock_data import StockDataProvider


def test_provider_initialization():
    provider = StockDataProvider(source="akshare")
    assert provider.source == "akshare"


@patch("src.data_sources.stock_data.ak.stock_zh_a_hist")
def test_fetch_stock_data(mock_akshare):
    # Mock akshare response
    import pandas as pd
    mock_data = pd.DataFrame({
        "日期": ["2024-01-01", "2024-01-02"],
        "开盘": [1800.0, 1810.0],
        "收盘": [1820.0, 1815.0],
        "最高": [1830.0, 1825.0],
        "最低": [1795.0, 1800.0],
        "成交量": [1234567, 1345678],
        "成交额": [2234567890.0, 2345678901.0],
    })
    mock_akshare.return_value = mock_data

    provider = StockDataProvider(source="akshare")
    data = provider.fetch_stock_history("600519", days=2)

    assert len(data) == 2
    assert data[0]["code"] == "600519"
    assert data[0]["close"] == 1820.0
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/data_sources/test_stock_data.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement stock data provider**

Create `src/data_sources/stock_data.py`:

```python
import akshare as ak
import pandas as pd
from typing import List, Dict, Any
from datetime import datetime, timedelta
from ..utils.logger import get_logger


class StockDataProvider:
    """Stock price data provider"""

    def __init__(self, source: str = "akshare"):
        self.source = source
        self.logger = get_logger("stock_data")

    def fetch_stock_history(
        self,
        code: str,
        days: int = 30,
        end_date: str = None,
    ) -> List[Dict[str, Any]]:
        """
        Fetch historical stock data.

        Args:
            code: Stock code (e.g., "600519")
            days: Number of days to fetch
            end_date: End date in YYYY-MM-DD format

        Returns:
            List of stock data dictionaries
        """
        if end_date is None:
            end_date = datetime.now().strftime("%Y%m%d")
        else:
            end_date = end_date.replace("-", "")

        start_date = (datetime.now() - timedelta(days=days)).strftime("%Y%m%d")

        try:
            self.logger.info(f"Fetching stock data for {code}")

            df = ak.stock_zh_a_hist(
                symbol=code,
                period="daily",
                start_date=start_date,
                end_date=end_date,
                adjust="qfq",  # Forward adjusted
            )

            # Convert DataFrame to list of dicts
            data = []
            for _, row in df.iterrows():
                stock_data = {
                    "code": code,
                    "date": row["日期"],
                    "open": float(row["开盘"]),
                    "close": float(row["收盘"]),
                    "high": float(row["最高"]),
                    "low": float(row["最低"]),
                    "volume": int(row["成交量"]),
                    "amount": float(row["成交额"]),
                    "change_pct": self._calculate_change(row["开盘"], row["收盘"]),
                }
                data.append(stock_data)

            self.logger.info(f"Fetched {len(data)} records for {code}")
            return data

        except Exception as e:
            self.logger.error(f"Failed to fetch stock data: {e}")
            return []

    def _calculate_change(self, open_price: float, close_price: float) -> float:
        """Calculate daily change percentage"""
        if open_price == 0:
            return 0.0
        return round(((close_price - open_price) / open_price) * 100, 2)

    def fetch_realtime_quote(self, code: str) -> Dict[str, Any]:
        """Fetch real-time stock quote"""
        try:
            df = ak.stock_zh_a_spot_em()
            stock = df[df["代码"] == code].iloc[0]

            return {
                "code": code,
                "name": stock["名称"],
                "price": float(stock["最新价"]),
                "change_pct": float(stock["涨跌幅"]),
                "volume": int(stock["成交量"]),
                "amount": float(stock["成交额"]),
                "time": datetime.now().isoformat(),
            }
        except Exception as e:
            self.logger.error(f"Failed to fetch realtime quote: {e}")
            return {}
```

Create `src/data_sources/__init__.py`:

```python
from .stock_data import StockDataProvider

__all__ = ["StockDataProvider"]
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/data_sources/test_stock_data.py -v
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit data sources**

```bash
git add src/data_sources tests/data_sources
git commit -m "feat: implement stock data provider

- Add StockDataProvider using AkShare
- Support historical data and real-time quotes
- Implement data transformation and error handling
- Write tests for data fetching"
```

---

## Task 5: Fundamental Analyst Agent

**Files:**
- Create: `src/agents/fundamental_analyst.py`
- Create: `tests/agents/test_fundamental_analyst.py`

- [ ] **Step 1: Write test for Fundamental Analyst**

Create `tests/agents/test_fundamental_analyst.py`:

```python
import pytest
from unittest.mock import Mock, patch
from src.agents.fundamental_analyst import FundamentalAnalyst
from src.models.schemas import AgentResult


def test_fundamental_analyst_initialization():
    analyst = FundamentalAnalyst()
    assert analyst.name == "fundamental_analyst"
    assert analyst.timeout == 300


@patch("src.agents.fundamental_analyst.LLMClient")
def test_fundamental_analyst_analyze(mock_llm):
    analyst = FundamentalAnalyst()

    # Mock LLM response
    mock_client = Mock()
    mock_client.analyze_json.return_value = {
        "score": 75,
        "confidence": 0.8,
        "summary": "Strong fundamentals",
        "details": {
            "roe": 0.31,
            "pe_ratio": 35.2,
            "debt_ratio": 0.25,
        },
    }
    mock_llm.return_value = mock_client

    financial_data = {
        "revenue": 150.5,
        "net_profit": 70.2,
        "roe": 0.31,
        "pe_ratio": 35.2,
    }

    result = analyst.analyze(financial_data)

    assert isinstance(result, AgentResult)
    assert result.score == 75.0
    assert result.confidence == 0.8
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/agents/test_fundamental_analyst.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement Fundamental Analyst**

Create `src/agents/fundamental_analyst.py`:

```python
from typing import Dict, Any
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.llm_client import LLMClient
from ..utils.logger import get_logger


class FundamentalAnalyst(BaseAgent):
    """Fundamental analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="fundamental_analyst", timeout=timeout)
        self.llm = LLMClient()
        self.logger = get_logger("fundamental_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """
        Perform fundamental analysis.

        Args:
            data: Dictionary containing financial data
                - revenue: Revenue in billion CNY
                - net_profit: Net profit in billion CNY
                - roe: Return on equity
                - pe_ratio: P/E ratio
                - pb_ratio: P/B ratio
                - debt_ratio: Debt-to-asset ratio

        Returns:
            AgentResult with fundamental score and analysis
        """
        # Validate input
        required_keys = ["revenue", "net_profit", "roe", "pe_ratio"]
        if not self.validate_input(data, required_keys):
            return self._default_result("Insufficient data for fundamental analysis")

        # Construct analysis prompt
        prompt = self._build_prompt(data)

        # Get LLM analysis
        try:
            response = self.llm.analyze_json(prompt)

            return AgentResult(
                agent_name=self.name,
                score=float(response.get("score", 50)),
                confidence=float(response.get("confidence", 0.5)),
                summary=response.get("summary", "Fundamental analysis completed"),
                details=response.get("details", {}),
            )
        except Exception as e:
            self.logger.error(f"LLM analysis failed: {e}")
            return self._default_result("Analysis failed due to error")

    def _build_prompt(self, data: Dict[str, Any]) -> str:
        """Build analysis prompt"""
        return f"""
作为专业的股票基本面分析师，请分析以下财务数据并给出评分。

财务数据:
- 营业收入: {data.get('revenue')} 亿元
- 净利润: {data.get('net_profit')} 亿元
- ROE: {data.get('roe')} ({data.get('roe', 0) * 100:.1f}%)
- P/E比率: {data.get('pe_ratio')}
- P/B比率: {data.get('pb_ratio', 'N/A')}
- 资产负债率: {data.get('debt_ratio', 'N/A')}

请从以下维度进行评估:
1. 盈利能力 (ROE, 净利率)
2. 成长性 (收入增长)
3. 估值水平 (PE, PB)
4. 财务健康度 (负债率, 现金流)

返回JSON格式:
{{
    "score": <0-100的评分>,
    "confidence": <0-1的置信度>,
    "summary": "<一句话总结>",
    "details": {{
        "roe": {data.get('roe')},
        "pe_ratio": {data.get('pe_ratio')},
        "debt_ratio": {data.get('debt_ratio')},
        "profitability_score": "<盈利能力评分>",
        "growth_score": "<成长性评分>",
        "valuation_score": "<估值评分>",
        "financial_health_score": "<财务健康度评分>"
    }}
}}
"""

    def _default_result(self, reason: str) -> AgentResult:
        """Return default result on error"""
        return AgentResult(
            agent_name=self.name,
            score=50.0,
            confidence=0.0,
            summary=reason,
            details={},
        )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/agents/test_fundamental_analyst.py -v
```

Expected: PASS (2 tests)

- [ ] **Step 5: Commit Fundamental Analyst**

```bash
git add src/agents/fundamental_analyst.py tests/agents/test_fundamental_analyst.py
git commit -m "feat: implement Fundamental Analyst agent

- Add fundamental analysis using LLM
- Support ROE, PE, PB, debt ratio analysis
- Generate structured analysis results
- Write tests for agent"
```

---

## Task 6: Quant Analyst Agent

**Files:**
- Create: `src/agents/quant_analyst.py`
- Create: `tests/agents/test_quant_analyst.py`

- [ ] **Step 1: Write test for Quant Analyst**

Create `tests/agents/test_quant_analyst.py`:

```python
import pytest
from src.agents.quant_analyst import QuantAnalyst
from src.models.schemas import AgentResult
import pandas as pd


def test_quant_analyst_initialization():
    analyst = QuantAnalyst()
    assert analyst.name == "quant_analyst"


def test_quant_analyst_calculate_indicators():
    analyst = QuantAnalyst()

    # Create sample price data
    data = pd.DataFrame({
        "close": [1800, 1810, 1820, 1815, 1830, 1840, 1835, 1850]
    })

    indicators = analyst.calculate_indicators(data)

    assert "ma5" in indicators
    assert "rsi" in indicators
    assert "macd" in indicators


def test_quant_analyst_analyze():
    analyst = QuantAnalyst()

    stock_data = [
        {"close": 1800, "high": 1810, "low": 1795, "volume": 1000000},
        {"close": 1810, "high": 1820, "low": 1800, "volume": 1100000},
        {"close": 1820, "high": 1830, "low": 1810, "volume": 1200000},
    ]

    result = analyst.analyze({"stock_history": stock_data})

    assert isinstance(result, AgentResult)
    assert 0 <= result.score <= 100
    assert "signal" in result.details
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/agents/test_quant_analyst.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement Quant Analyst**

Create `src/agents/quant_analyst.py`:

```python
from typing import Dict, Any
import pandas as pd
import numpy as np
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class QuantAnalyst(BaseAgent):
    """Quantitative analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="quant_analyst", timeout=timeout)
        self.logger = get_logger("quant_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """
        Perform quantitative analysis.

        Args:
            data: Dictionary containing stock_history

        Returns:
            AgentResult with quantitative score and signals
        """
        stock_history = data.get("stock_history", [])

        if len(stock_history) < 10:
            return self._default_result("Insufficient data for quantitative analysis")

        # Convert to DataFrame
        df = pd.DataFrame(stock_history)

        # Calculate indicators
        indicators = self.calculate_indicators(df)

        # Generate trading signal
        signal = self.generate_signal(indicators)

        # Calculate score
        score = self.calculate_score(indicators, signal)

        return AgentResult(
            agent_name=self.name,
            score=score,
            confidence=indicators.get("confidence", 0.5),
            summary=f"Quantitative analysis: {signal}",
            details={
                "signal": signal,
                "ma5": indicators.get("ma5"),
                "ma20": indicators.get("ma20"),
                "rsi": indicators.get("rsi"),
                "macd": indicators.get("macd"),
                "trend": indicators.get("trend"),
            },
        )

    def calculate_indicators(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Calculate technical indicators"""
        indicators = {}

        # Moving Averages
        indicators["ma5"] = df["close"].rolling(window=5).mean().iloc[-1]
        indicators["ma20"] = df["close"].rolling(window=20).mean().iloc[-1] if len(df) >= 20 else None

        # RSI
        indicators["rsi"] = self._calculate_rsi(df["close"])

        # MACD
        macd, signal, hist = self._calculate_macd(df["close"])
        indicators["macd"] = macd
        indicators["macd_signal"] = signal
        indicators["macd_hist"] = hist

        # Trend
        indicators["trend"] = "up" if indicators["ma5"] > df["close"].iloc[-2] else "down"

        # Confidence based on data quality
        indicators["confidence"] = min(1.0, len(df) / 60.0)

        return indicators

    def _calculate_rsi(self, prices: pd.Series, period: int = 14) -> float:
        """Calculate RSI indicator"""
        if len(prices) < period:
            return 50.0

        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()

        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))

        return float(rsi.iloc[-1])

    def _calculate_macd(
        self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
    ) -> tuple:
        """Calculate MACD indicator"""
        ema_fast = prices.ewm(span=fast, adjust=False).mean()
        ema_slow = prices.ewm(span=slow, adjust=False).mean()
        macd = ema_fast - ema_slow
        signal_line = macd.ewm(span=signal, adjust=False).mean()
        histogram = macd - signal_line

        return (
            float(macd.iloc[-1]),
            float(signal_line.iloc[-1]),
            float(histogram.iloc[-1]),
        )

    def generate_signal(self, indicators: Dict[str, Any]) -> str:
        """Generate trading signal"""
        signals = []

        # MA signal
        if indicators.get("ma5") and indicators.get("ma20"):
            if indicators["ma5"] > indicators["ma20"]:
                signals.append("bullish_ma")
            else:
                signals.append("bearish_ma")

        # RSI signal
        rsi = indicators.get("rsi", 50)
        if rsi < 30:
            signals.append("oversold")
        elif rsi > 70:
            signals.append("overbought")

        # MACD signal
        if indicators.get("macd_hist", 0) > 0:
            signals.append("bullish_macd")
        else:
            signals.append("bearish_macd")

        # Determine overall signal
        bullish_count = sum(1 for s in signals if "bullish" in s or s == "oversold")

        if bullish_count >= 2:
            return "buy"
        elif bullish_count == 0:
            return "sell"
        else:
            return "hold"

    def calculate_score(self, indicators: Dict[str, Any], signal: str) -> float:
        """Calculate overall score based on indicators"""
        base_score = 50.0

        # Signal contribution
        if signal == "buy":
            base_score += 25
        elif signal == "sell":
            base_score -= 25

        # RSI contribution
        rsi = indicators.get("rsi", 50)
        if 40 <= rsi <= 60:
            base_score += 10  # Neutral RSI is good

        # Trend contribution
        if indicators.get("trend") == "up":
            base_score += 10

        return max(0, min(100, base_score))

    def _default_result(self, reason: str) -> AgentResult:
        return AgentResult(
            agent_name=self.name,
            score=50.0,
            confidence=0.0,
            summary=reason,
            details={},
        )
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/agents/test_quant_analyst.py -v
```

Expected: PASS (3 tests)

- [ ] **Step 5: Commit Quant Analyst**

```bash
git add src/agents/quant_analyst.py tests/agents/test_quant_analyst.py
git commit -m "feat: implement Quant Analyst agent

- Add technical indicators (MA, RSI, MACD)
- Generate buy/sell/hold signals
- Calculate trend and momentum scores
- Write comprehensive tests"
```

---

## Task 7: News Analyst & Risk Analyst Agents

**Files:**
- Create: `src/agents/news_analyst.py`
- Create: `src/agents/risk_analyst.py`
- Create: `tests/agents/test_news_analyst.py`
- Create: `tests/agents/test_risk_analyst.py`

- [ ] **Step 1: Write tests for News Analyst**

Create `tests/agents/test_news_analyst.py`:

```python
import pytest
from unittest.mock import Mock, patch
from src.agents.news_analyst import NewsAnalyst
from src.models.schemas import AgentResult


@patch("src.agents.news_analyst.LLMClient")
def test_news_analyst_analyze(mock_llm):
    analyst = NewsAnalyst()

    mock_client = Mock()
    mock_client.analyze_json.return_value = {
        "score": 70,
        "confidence": 0.75,
        "summary": "Positive sentiment",
        "details": {
            "sentiment": "positive",
            "key_events": ["New product launch"],
        },
    }
    mock_llm.return_value = mock_client

    news_data = {
        "news_items": [
            {"title": "茅台发布新品", "content": "...", "sentiment": "positive"}
        ]
    }

    result = analyst.analyze(news_data)

    assert isinstance(result, AgentResult)
    assert result.score == 70.0
```

- [ ] **Step 2: Implement News Analyst**

Create `src/agents/news_analyst.py`:

```python
from typing import Dict, Any, List
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.llm_client import LLMClient
from ..utils.logger import get_logger


class NewsAnalyst(BaseAgent):
    """News sentiment analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="news_analyst", timeout=timeout)
        self.llm = LLMClient()
        self.logger = get_logger("news_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """
        Analyze news sentiment.

        Args:
            data: Dictionary containing news_items list

        Returns:
            AgentResult with sentiment score and key events
        """
        news_items = data.get("news_items", [])

        if not news_items:
            return self._default_result("No news data available")

        # Build prompt with news summaries
        prompt = self._build_prompt(news_items)

        try:
            response = self.llm.analyze_json(prompt)

            return AgentResult(
                agent_name=self.name,
                score=float(response.get("score", 50)),
                confidence=float(response.get("confidence", 0.5)),
                summary=response.get("summary", "News analysis completed"),
                details=response.get("details", {}),
            )
        except Exception as e:
            self.logger.error(f"News analysis failed: {e}")
            return self._default_result("Analysis failed")

    def _build_prompt(self, news_items: List[Dict[str, Any]]) -> str:
        """Build analysis prompt"""
        news_summary = "\n".join([
            f"- {item.get('title', 'N/A')}: {item.get('content', '')[:100]}"
            for item in news_items[:10]  # Limit to 10 items
        ])

        return f"""
作为专业的股票舆情分析师，请分析以下新闻并评估对股价的影响。

新闻列表:
{news_summary}

请从以下维度评估:
1. 整体情绪 (positive/negative/neutral)
2. 影响程度 (short-term/mid-term/long-term)
3. 关键事件提取
4. 投资者情绪判断

返回JSON格式:
{{
    "score": <0-100评分，50为中性>,
    "confidence": <0-1置信度>,
    "summary": "<一句话总结>",
    "details": {{
        "sentiment": "<整体情绪>",
        "key_events": ["<关键事件1>", "<关键事件2>"],
        "impact_timeline": "<影响时间线>",
        "investor_sentiment": "<投资者情绪>"
    }}
}}
"""

    def _default_result(self, reason: str) -> AgentResult:
        return AgentResult(
            agent_name=self.name,
            score=50.0,
            confidence=0.0,
            summary=reason,
            details={},
        )
```

- [ ] **Step 3: Write tests for Risk Analyst**

Create `tests/agents/test_risk_analyst.py`:

```python
import pytest
from src.agents.risk_analyst import RiskAnalyst
from src.models.schemas import AgentResult


def test_risk_analyst_analyze():
    analyst = RiskAnalyst()

    market_data = {
        "volatility": 0.25,
        "max_drawdown": -0.15,
        "beta": 1.2,
        "liquidity_ratio": 2.5,
    }

    result = analyst.analyze(market_data)

    assert isinstance(result, AgentResult)
    assert result.details["risk_level"] in ["low", "medium", "high"]
```

- [ ] **Step 4: Implement Risk Analyst**

Create `src/agents/risk_analyst.py`:

```python
from typing import Dict, Any
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class RiskAnalyst(BaseAgent):
    """Risk analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="risk_analyst", timeout=timeout)
        self.logger = get_logger("risk_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """
        Perform risk assessment.

        Args:
            data: Dictionary containing risk metrics
                - volatility: Price volatility
                - max_drawdown: Maximum drawdown
                - beta: Beta coefficient
                - liquidity_ratio: Liquidity ratio

        Returns:
            AgentResult with risk level and warnings
        """
        # Calculate risk scores
        market_risk = self._assess_market_risk(data)
        liquidity_risk = self._assess_liquidity_risk(data)
        overall_risk = self._calculate_overall_risk(market_risk, liquidity_risk)

        # Determine risk level
        risk_level = self._determine_risk_level(overall_risk)

        # Generate warnings
        warnings = self._generate_warnings(data, risk_level)

        return AgentResult(
            agent_name=self.name,
            score=100 - overall_risk,  # Invert score (lower risk = higher score)
            confidence=0.8,
            summary=f"Risk level: {risk_level}",
            details={
                "risk_level": risk_level,
                "market_risk_score": market_risk,
                "liquidity_risk_score": liquidity_risk,
                "overall_risk_score": overall_risk,
                "warnings": warnings,
            },
        )

    def _assess_market_risk(self, data: Dict[str, Any]) -> float:
        """Assess market risk (0-100)"""
        volatility = data.get("volatility", 0)
        max_drawdown = abs(data.get("max_drawdown", 0))
        beta = data.get("beta", 1.0)

        # Normalize metrics to 0-100 scale
        vol_score = min(volatility * 200, 100)  # 50% vol = 100
        dd_score = min(max_drawdown * 500, 100)  # 20% drawdown = 100
        beta_score = min(abs(beta - 1.0) * 50, 100)  # Beta deviation

        return (vol_score + dd_score + beta_score) / 3

    def _assess_liquidity_risk(self, data: Dict[str, Any]) -> float:
        """Assess liquidity risk (0-100)"""
        liquidity_ratio = data.get("liquidity_ratio", 2.0)

        # Higher ratio = lower risk
        if liquidity_ratio >= 3.0:
            return 10
        elif liquidity_ratio >= 2.0:
            return 30
        elif liquidity_ratio >= 1.0:
            return 60
        else:
            return 90

    def _calculate_overall_risk(self, market_risk: float, liquidity_risk: float) -> float:
        """Calculate weighted overall risk"""
        # Market risk is more important (70% vs 30%)
        return market_risk * 0.7 + liquidity_risk * 0.3

    def _determine_risk_level(self, overall_risk: float) -> str:
        """Determine risk level category"""
        if overall_risk < 30:
            return "low"
        elif overall_risk < 60:
            return "medium"
        else:
            return "high"

    def _generate_warnings(self, data: Dict[str, Any], risk_level: str) -> list:
        """Generate risk warnings"""
        warnings = []

        if data.get("volatility", 0) > 0.3:
            warnings.append("高波动性风险")

        if abs(data.get("max_drawdown", 0)) > 0.2:
            warnings.append("较大回撤风险")

        if data.get("beta", 1.0) > 1.5:
            warnings.append("高Beta系数，市场敏感度高")

        if data.get("liquidity_ratio", 2.0) < 1.5:
            warnings.append("流动性风险")

        return warnings
```

- [ ] **Step 5: Run all agent tests**

```bash
pytest tests/agents/ -v
```

Expected: PASS (all tests)

- [ ] **Step 6: Commit News and Risk Analysts**

```bash
git add src/agents/news_analyst.py src/agents/risk_analyst.py tests/agents/
git commit -m "feat: implement News and Risk Analyst agents

- Add News Analyst with LLM-based sentiment analysis
- Add Risk Analyst with multi-factor risk assessment
- Support market, liquidity, and overall risk scoring
- Write comprehensive tests for both agents"
```

---

## Task 8: Data Collector Agent

**Files:**
- Create: `src/agents/data_collector.py`
- Create: `tests/agents/test_data_collector.py`

- [ ] **Step 1: Write test for Data Collector**

Create `tests/agents/test_data_collector.py`:

```python
import pytest
from unittest.mock import Mock, patch
from src.agents.data_collector import DataCollector


@patch("src.agents.data_collector.StockDataProvider")
def test_data_collector_collect(mock_provider):
    collector = DataCollector()

    mock_instance = Mock()
    mock_instance.fetch_stock_history.return_value = [
        {"close": 1800, "volume": 1000000}
    ]
    mock_provider.return_value = mock_instance

    result = collector.collect(["600519"])

    assert "600519" in result
    assert len(result["600519"]["stock_history"]) > 0
```

- [ ] **Step 2: Implement Data Collector**

Create `src/agents/data_collector.py`:

```python
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

    def collect(self, stock_codes: List[str]) -> Dict[str, Any]:
        """
        Collect data for multiple stocks.

        Args:
            stock_codes: List of stock codes

        Returns:
            Dictionary with stock data keyed by code
        """
        results = {}

        for code in stock_codes:
            self.logger.info(f"Collecting data for {code}")

            stock_data = self._collect_stock_data(code)

            if stock_data:
                results[code] = stock_data

        return results

    def _collect_stock_data(self, code: str) -> Dict[str, Any]:
        """Collect all data for a single stock"""
        try:
            # Fetch historical data (60 days)
            stock_history = self.stock_provider.fetch_stock_history(code, days=60)

            # Fetch real-time quote
            realtime_quote = self.stock_provider.fetch_realtime_quote(code)

            return {
                "code": code,
                "stock_history": stock_history,
                "realtime_quote": realtime_quote,
                "financial_data": {},  # To be implemented with financial data API
                "news_items": [],  # To be implemented with news scraper
            }
        except Exception as e:
            self.logger.error(f"Failed to collect data for {code}: {e}")
            return {}
```

- [ ] **Step 3: Run tests**

```bash
pytest tests/agents/test_data_collector.py -v
```

Expected: PASS

- [ ] **Step 4: Commit Data Collector**

```bash
git add src/agents/data_collector.py tests/agents/test_data_collector.py
git commit -m "feat: implement Data Collector agent

- Add multi-stock data collection
- Integrate with StockDataProvider
- Support historical and real-time data
- Write tests for data collection"
```

---

## Task 9: Data Validator & Simulated Investment

**Files:**
- Create: `src/agents/data_validator.py`
- Create: `src/feedback/investment_simulator.py`
- Create: `tests/agents/test_data_validator.py`
- Create: `tests/feedback/test_investment_simulator.py`

- [ ] **Step 1: Write test for Data Validator**

Create `tests/agents/test_data_validator.py`:

```python
import pytest
from src.agents.data_validator import DataValidator


def test_validator_initialization():
    validator = DataValidator()
    assert validator.name == "data_validator"


def test_validate_stock_data():
    validator = DataValidator()

    data = {
        "code": "600519",
        "stock_history": [
            {"close": 1800, "volume": 1000000},
            {"close": 1810, "volume": 1100000},
        ],
    }

    result = validator.validate(data)

    assert result["is_valid"] == True
    assert "issues" in result


def test_detect_anomalies():
    validator = DataValidator()

    # Data with anomaly (price jump)
    data = {
        "stock_history": [
            {"close": 1800, "volume": 1000000},
            {"close": 2500, "volume": 1000000},  # Huge jump
        ],
    }

    anomalies = validator.detect_anomalies(data)

    assert len(anomalies) > 0
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/agents/test_data_validator.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement Data Validator**

Create `src/agents/data_validator.py`:

```python
from typing import Dict, Any, List
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class DataValidator(BaseAgent):
    """Validate data quality and detect anomalies"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="data_validator", timeout=timeout)
        self.logger = get_logger("data_validator")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Validate data and return validation result"""
        validation = self.validate(data)

        return AgentResult(
            agent_name=self.name,
            score=100.0 if validation["is_valid"] else 50.0,
            confidence=validation.get("confidence", 0.8),
            summary=validation.get("summary", "Validation complete"),
            details={"issues": validation["issues"]},
        )

    def validate(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate data completeness and quality.

        Args:
            data: Collected data dict

        Returns:
            Validation result with issues list
        """
        issues = []
        confidence = 1.0

        # Check stock history
        stock_history = data.get("stock_history", [])
        if not stock_history:
            issues.append("Missing stock history data")
            confidence *= 0.5

        # Check data freshness
        if stock_history:
            latest_date = stock_history[-1].get("date", "")
            # Would check if date is recent

        # Check for missing values
        for i, record in enumerate(stock_history):
            if not record.get("close"):
                issues.append(f"Missing close price at index {i}")

        # Detect anomalies
        anomalies = self.detect_anomalies(data)
        if anomalies:
            issues.extend(anomalies)
            confidence *= 0.8

        return {
            "is_valid": len(issues) == 0,
            "issues": issues,
            "confidence": confidence,
            "summary": f"Found {len(issues)} issues" if issues else "Data valid",
        }

    def detect_anomalies(self, data: Dict[str, Any]) -> List[str]:
        """
        Detect anomalies in data.

        Returns:
            List of anomaly descriptions
        """
        anomalies = []
        stock_history = data.get("stock_history", [])

        if len(stock_history) < 2:
            return anomalies

        # Price jump detection
        for i in range(1, len(stock_history)):
            prev_close = stock_history[i - 1].get("close", 0)
            curr_close = stock_history[i].get("close", 0)

            if prev_close > 0:
                change_pct = abs(curr_close - prev_close) / prev_close

                # Flag if daily change > 20%
                if change_pct > 0.2:
                    anomalies.append(
                        f"Price jump detected: {change_pct:.1%} change at index {i}"
                    )

        # Volume spike detection
        if len(stock_history) >= 5:
            recent_volumes = [r.get("volume", 0) for r in stock_history[-5:]]
            avg_volume = sum(recent_volumes[:-1]) / len(recent_volumes[:-1])
            latest_volume = recent_volumes[-1]

            if avg_volume > 0 and latest_volume > avg_volume * 3:
                anomalies.append(f"Volume spike: {latest_volume} vs avg {avg_volume:.0f}")

        return anomalies
```

- [ ] **Step 4: Run tests**

```bash
pytest tests/agents/test_data_validator.py -v
```

Expected: PASS (3 tests)

- [ ] **Step 5: Write test for Investment Simulator**

Create `tests/feedback/test_investment_simulator.py`:

```python
import pytest
from src.feedback.investment_simulator import InvestmentSimulator
from datetime import datetime, timedelta


def test_simulate_investment():
    simulator = InvestmentSimulator()

    # Simulate 100 shares bought at 1800
    result = simulator.simulate(
        code="600519",
        buy_date="2024-01-01",
        buy_price=1800.0,
        shares=100,
        current_price=1850.0,
    )

    assert result["investment"] == 180000.0
    assert result["current_value"] == 185000.0
    assert result["profit"] == 5000.0
    assert result["return_pct"] == pytest.approx(2.78, rel=0.01)


def test_track_portfolio():
    simulator = InvestmentSimulator()

    # Track multiple investments
    simulator.add_investment("600519", "2024-01-01", 1800.0, 100)
    simulator.add_investment("000858", "2024-01-02", 150.0, 100)

    portfolio = simulator.get_portfolio()

    assert len(portfolio) == 2
    assert portfolio[0]["code"] == "600519"


def test_calculate_period_returns():
    simulator = InvestmentSimulator()

    # Add investments with known outcomes
    simulator.add_investment("600519", "2024-01-01", 1800.0, 100)
    simulator._update_value("600519", 1850.0)  # +2.78%

    returns = simulator.calculate_period_returns("600519")

    assert "total_return" in returns
    assert returns["total_return"] > 0
```

- [ ] **Step 6: Implement Investment Simulator**

Create `src/feedback/investment_simulator.py`:

```python
from typing import Dict, Any, List
from pathlib import Path
import json
from datetime import datetime
from ..utils.logger import get_logger


class InvestmentSimulator:
    """Simulate investments based on predictions"""

    def __init__(self, portfolio_file: str = "data/portfolio.json"):
        self.portfolio_file = Path(portfolio_file)
        self.portfolio_file.parent.mkdir(parents=True, exist_ok=True)
        self.logger = get_logger("investment_simulator")
        self.portfolio = self._load_portfolio()

    def simulate(
        self,
        code: str,
        buy_date: str,
        buy_price: float,
        shares: int,
        current_price: float,
    ) -> Dict[str, Any]:
        """
        Simulate investment outcome.

        Args:
            code: Stock code
            buy_date: Purchase date
            buy_price: Price at purchase
            shares: Number of shares
            current_price: Current price

        Returns:
            Investment result with profit/loss
        """
        investment = buy_price * shares
        current_value = current_price * shares
        profit = current_value - investment
        return_pct = (profit / investment) * 100 if investment > 0 else 0

        # Determine if prediction was correct
        is_positive = profit > 0

        return {
            "code": code,
            "buy_date": buy_date,
            "buy_price": buy_price,
            "current_price": current_price,
            "shares": shares,
            "investment": investment,
            "current_value": current_value,
            "profit": profit,
            "return_pct": return_pct,
            "is_positive": is_positive,
            "timestamp": datetime.now().isoformat(),
        }

    def add_investment(self, code: str, buy_date: str, buy_price: float, shares: int = 100):
        """
        Add simulated investment to portfolio.

        Args:
            code: Stock code
            buy_date: Purchase date (prediction date)
            buy_price: Price at prediction
            shares: Number of shares (default 100)
        """
        investment_entry = {
            "code": code,
            "buy_date": buy_date,
            "buy_price": buy_price,
            "shares": shares,
            "current_price": buy_price,  # Will be updated
            "status": "open",
            "created_at": datetime.now().isoformat(),
        }

        if code not in self.portfolio:
            self.portfolio[code] = []

        self.portfolio[code].append(investment_entry)
        self._save_portfolio()

        self.logger.info(f"Added investment: {shares} shares of {code} at {buy_price}")

    def update_portfolio(self, price_data: Dict[str, float]):
        """
        Update portfolio with current prices.

        Args:
            price_data: Dict mapping code to current price
        """
        for code, investments in self.portfolio.items():
            if code not in price_data:
                continue

            current_price = price_data[code]

            for inv in investments:
                if inv["status"] == "open":
                    inv["current_price"] = current_price
                    inv["updated_at"] = datetime.now().isoformat()

        self._save_portfolio()
        self.logger.info("Updated portfolio prices")

    def get_portfolio(self) -> List[Dict[str, Any]]:
        """Get all investments"""
        all_investments = []

        for code, investments in self.portfolio.items():
            for inv in investments:
                all_investments.append(inv)

        return all_investments

    def calculate_period_returns(self, code: str, days: int = None) -> Dict[str, Any]:
        """
        Calculate returns for investments over period.

        Args:
            code: Stock code
            days: Number of days (None = all)

        Returns:
            Return metrics
        """
        if code not in self.portfolio:
            return {"total_return": 0, "avg_return": 0, "investment_count": 0}

        investments = self.portfolio[code]

        # Filter by date if specified
        if days:
            from datetime import timedelta
            cutoff = datetime.now() - timedelta(days=days)
            investments = [
                inv for inv in investments
                if datetime.fromisoformat(inv["buy_date"]) >= cutoff
            ]

        if not investments:
            return {"total_return": 0, "avg_return": 0, "investment_count": 0}

        total_investment = 0
        total_value = 0

        for inv in investments:
            investment = inv["buy_price"] * inv["shares"]
            current_value = inv["current_price"] * inv["shares"]

            total_investment += investment
            total_value += current_value

        total_return = total_value - total_investment
        return_pct = (total_return / total_investment * 100) if total_investment > 0 else 0

        return {
            "total_investment": total_investment,
            "current_value": total_value,
            "total_return": total_return,
            "return_pct": return_pct,
            "investment_count": len(investments),
        }

    def close_investment(self, code: str, buy_date: str):
        """Close investment position"""
        if code not in self.portfolio:
            return

        for inv in self.portfolio[code]:
            if inv["buy_date"] == buy_date and inv["status"] == "open":
                inv["status"] = "closed"
                inv["closed_at"] = datetime.now().isoformat()

                # Calculate final return
                investment = inv["buy_price"] * inv["shares"]
                final_value = inv["current_price"] * inv["shares"]
                inv["final_return"] = final_value - investment

        self._save_portfolio()
        self.logger.info(f"Closed investment for {code} bought on {buy_date}")

    def _load_portfolio(self) -> Dict[str, List]:
        """Load portfolio from file"""
        if not self.portfolio_file.exists():
            return {}

        with open(self.portfolio_file) as f:
            return json.load(f)

    def _save_portfolio(self):
        """Save portfolio to file"""
        with open(self.portfolio_file, "w") as f:
            json.dump(self.portfolio, f, indent=2, ensure_ascii=False)

    def _update_value(self, code: str, current_price: float):
        """Internal method to update investment value"""
        if code not in self.portfolio:
            return

        for inv in self.portfolio[code]:
            inv["current_price"] = current_price

        self._save_portfolio()
```

- [ ] **Step 7: Run tests**

```bash
pytest tests/feedback/test_investment_simulator.py -v
```

Expected: PASS (3 tests)

- [ ] **Step 8: Update pipeline to integrate validator and simulator**

Add to `src/pipeline.py` after data collection:

```python
@task
def validate_data(stock_data: Dict[str, Any]) -> Dict[str, Any]:
    """Validate collected data"""
    from .agents.data_validator import DataValidator

    validator = DataValidator()
    validated_data = {}

    for code, data in stock_data.items():
        validation = validator.validate(data)

        if validation["is_valid"]:
            validated_data[code] = data
        else:
            logger.warning(f"Data validation failed for {code}: {validation['issues']}")
            # Still include data but mark as low quality
            data["validation_issues"] = validation["issues"]
            validated_data[code] = data

    return validated_data


@task
def simulate_investments(predictions: List[Dict[str, Any]], current_prices: Dict[str, float]):
    """Simulate investments based on predictions"""
    from .feedback.investment_simulator import InvestmentSimulator

    simulator = InvestmentSimulator()

    for pred in predictions:
        code = pred["code"]
        date = pred["date"]
        recommendation = pred["recommendation"]

        # Only simulate for buy recommendations
        if recommendation == "buy":
            buy_price = pred.get("price_at_prediction", 0)

            if buy_price > 0:
                simulator.add_investment(code, date, buy_price, shares=100)

    # Update portfolio with current prices
    simulator.update_portfolio(current_prices)

    return simulator.get_portfolio()
```

- [ ] **Step 9: Commit Data Validator and Investment Simulator**

```bash
git add src/agents/data_validator.py src/feedback/investment_simulator.py tests/
git commit -m "feat: add Data Validator Agent and Investment Simulator

- Implement Data Validator with anomaly detection
- Add data quality validation checks
- Create Investment Simulator for tracking 100-share investments
- Calculate profit/loss for simulated trades
- Support portfolio management and return tracking
- Integrate with pipeline for automated validation"
```

---

## Task 10: Planner Agent & Pipeline Orchestration

**Files:**
- Create: `src/agents/planner.py`
- Create: `src/pipeline.py`
- Create: `tests/agents/test_planner.py`
- Create: `tests/test_pipeline.py`
- Create: `run_local.py`

- [ ] **Step 1: Write test for Planner**

Create `tests/agents/test_planner.py`:

```python
import pytest
from src.agents.planner import Planner


def test_planner_create_plan():
    planner = Planner()

    stocks = [{"code": "600519", "name": "贵州茅台"}]

    plan = planner.create_plan(stocks)

    assert "tasks" in plan
    assert len(plan["tasks"]) > 0
```

- [ ] **Step 2: Implement Planner**

Create `src/agents/planner.py`:

```python
from typing import Dict, Any, List
from .base import BaseAgent
from ..utils.logger import get_logger


class Planner(BaseAgent):
    """Orchestration planner agent"""

    def __init__(self, timeout: int = 600):
        super().__init__(name="planner", timeout=timeout)
        self.logger = get_logger("planner")

    def create_plan(self, stocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Create execution plan for analysis.

        Args:
            stocks: List of stock configurations

        Returns:
            Execution plan with tasks
        """
        tasks = []

        # Task 1: Data collection
        tasks.append({
            "id": "data_collection",
            "agent": "data_collector",
            "params": {"stock_codes": [s["code"] for s in stocks]},
            "depends_on": [],
        })

        # Task 2: Analysis (depends on data collection)
        for stock in stocks:
            code = stock["code"]

            # Parallel analysis tasks
            for agent in ["fundamental_analyst", "quant_analyst", "news_analyst", "risk_analyst"]:
                tasks.append({
                    "id": f"{agent}_{code}",
                    "agent": agent,
                    "params": {"code": code},
                    "depends_on": ["data_collection"],
                })

        # Task 3: Aggregation
        tasks.append({
            "id": "aggregation",
            "agent": "aggregator",
            "params": {"stocks": stocks},
            "depends_on": [t["id"] for t in tasks if "analyst" in t["id"]],
        })

        return {
            "plan_id": f"plan_{len(stocks)}_stocks",
            "tasks": tasks,
            "created_at": self._get_timestamp(),
        }

    def _get_timestamp(self) -> str:
        from datetime import datetime
        return datetime.now().isoformat()
```

- [ ] **Step 3: Implement Pipeline with Prefect**

Create `src/pipeline.py`:

```python
from prefect import flow, task
from typing import List, Dict, Any
from datetime import datetime
import json
from pathlib import Path

from .agents.planner import Planner
from .agents.data_collector import DataCollector
from .agents.fundamental_analyst import FundamentalAnalyst
from .agents.quant_analyst import QuantAnalyst
from .agents.news_analyst import NewsAnalyst
from .agents.risk_analyst import RiskAnalyst
from .models.schemas import AnalysisResult
from .config import config
from .utils.logger import get_logger


logger = get_logger("pipeline")


@task
def collect_data(stock_codes: List[str]) -> Dict[str, Any]:
    """Data collection task"""
    collector = DataCollector()
    return collector.collect(stock_codes)


@task
def analyze_fundamental(code: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Fundamental analysis task"""
    analyst = FundamentalAnalyst()
    financial_data = data.get("financial_data", {})
    result = analyst.analyze(financial_data)
    return result.model_dump()


@task
def analyze_quant(code: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Quantitative analysis task"""
    analyst = QuantAnalyst()
    result = analyst.analyze({"stock_history": data.get("stock_history", [])})
    return result.model_dump()


@task
def analyze_news(code: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """News analysis task"""
    analyst = NewsAnalyst()
    result = analyst.analyze({"news_items": data.get("news_items", [])})
    return result.model_dump()


@task
def analyze_risk(code: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Risk analysis task"""
    analyst = RiskAnalyst()
    # Extract risk metrics from data
    risk_metrics = _extract_risk_metrics(data)
    result = analyst.analyze(risk_metrics)
    return result.model_dump()


def _extract_risk_metrics(data: Dict[str, Any]) -> Dict[str, Any]:
    """Extract risk metrics from stock data"""
    history = data.get("stock_history", [])
    if not history:
        return {}

    import pandas as pd
    import numpy as np

    df = pd.DataFrame(history)

    # Calculate volatility
    returns = df["close"].pct_change().dropna()
    volatility = returns.std()

    # Calculate max drawdown
    cummax = df["close"].cummax()
    drawdown = (df["close"] - cummax) / cummax
    max_drawdown = drawdown.min()

    # Estimate beta (simplified)
    beta = 1.0  # Would need market data for actual calculation

    return {
        "volatility": float(volatility),
        "max_drawdown": float(max_drawdown),
        "beta": beta,
        "liquidity_ratio": 2.0,  # Default
    }


@task
def aggregate_results(code: str, analyses: Dict[str, Any]) -> Dict[str, Any]:
    """Aggregate analysis results"""
    fundamental = analyses.get("fundamental", {})
    quant = analyses.get("quant", {})
    news = analyses.get("news", {})
    risk = analyses.get("risk", {})

    # Calculate overall score (weighted average)
    weights = {
        "fundamental": 0.30,
        "quant": 0.25,
        "news": 0.25,
        "risk": 0.20,
    }

    overall_score = (
        fundamental.get("score", 50) * weights["fundamental"] +
        quant.get("score", 50) * weights["quant"] +
        news.get("score", 50) * weights["news"] +
        (100 - risk.get("score", 50)) * weights["risk"]  # Invert risk score
    )

    # Determine recommendation
    if overall_score >= 70:
        recommendation = "buy"
    elif overall_score >= 40:
        recommendation = "hold"
    else:
        recommendation = "sell"

    # Determine risk level
    risk_level = risk.get("details", {}).get("risk_level", "medium")

    return {
        "code": code,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "fundamental": fundamental,
        "quant": quant,
        "news": news,
        "risk": risk,
        "overall_score": round(overall_score, 2),
        "recommendation": recommendation,
        "risk_level": risk_level,
    }


@task
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


@task
def generate_report(results: List[Dict[str, Any]]):
    """Generate Markdown report"""
    from .models.analysis_result import AnalysisReport

    report = AnalysisReport(results)
    report_text = report.generate_markdown()

    # Save report
    date_str = datetime.now().strftime("%Y-%m-%d")
    report_path = Path(f"reports/daily/{date_str}.md")
    report_path.parent.mkdir(parents=True, exist_ok=True)

    with open(report_path, "w") as f:
        f.write(report_text)

    logger.info(f"Generated report: {report_path}")


@flow(name="Stock Analysis Pipeline")
def stock_analysis_pipeline():
    """Main analysis pipeline"""
    logger.info("Starting stock analysis pipeline")

    # Get monitored stocks
    stocks = config.get_monitored_stocks()
    stock_codes = [s["code"] for s in stocks]

    # Step 1: Collect data
    stock_data = collect_data(stock_codes)

    # Step 2: Analyze each stock
    all_results = []

    for stock in stocks:
        code = stock["code"]
        data = stock_data.get(code, {})

        # Run analysis tasks in parallel
        fundamental = analyze_fundamental(code, data)
        quant = analyze_quant(code, data)
        news = analyze_news(code, data)
        risk = analyze_risk(code, data)

        # Aggregate results
        analyses = {
            "fundamental": fundamental,
            "quant": quant,
            "news": news,
            "risk": risk,
        }

        result = aggregate_results(code, analyses)
        all_results.append(result)

    # Step 3: Save results
    save_results(all_results)

    # Step 4: Generate report
    generate_report(all_results)

    logger.info("Pipeline completed successfully")

    return all_results
```

- [ ] **Step 4: Create Analysis Report model**

Create `src/models/analysis_result.py`:

```python
from typing import List, Dict, Any
from datetime import datetime


class AnalysisReport:
    """Generate analysis report"""

    def __init__(self, results: List[Dict[str, Any]]):
        self.results = results

    def generate_markdown(self) -> str:
        """Generate Markdown report"""
        date_str = datetime.now().strftime("%Y年%m月%d日")

        sections = [
            f"# 股票分析日报 - {date_str}\n",
            "## 概览\n",
            self._generate_overview(),
            "\n---\n",
        ]

        for result in self.results:
            sections.append(f"\n## {result.get('code')} - {self._get_stock_name(result.get('code'))}\n")
            sections.append(self._generate_stock_section(result))
            sections.append("\n---\n")

        sections.append("\n*报告由AI Agent自动生成*\n")

        return "".join(sections)

    def _generate_overview(self) -> str:
        """Generate overview section"""
        lines = ["| 股票代码 | 综合评分 | 建议操作 | 风险等级 |", "|---------|---------|---------|---------|"]

        for result in self.results:
            lines.append(
                f"| {result.get('code')} | {result.get('overall_score', 0):.1f} | "
                f"{result.get('recommendation', 'hold')} | {result.get('risk_level', 'medium')} |"
            )

        return "\n".join(lines)

    def _generate_stock_section(self, result: Dict[str, Any]) -> str:
        """Generate section for individual stock"""
        sections = [
            f"**综合评分:** {result.get('overall_score', 0):.1f}/100",
            f"**建议操作:** {self._translate_recommendation(result.get('recommendation', 'hold'))}",
            f"**风险等级:** {result.get('risk_level', 'medium')}\n",
            "### 基本面分析\n",
            self._format_analysis(result.get("fundamental", {})),
            "\n### 技术分析\n",
            self._format_analysis(result.get("quant", {})),
            "\n### 舆情分析\n",
            self._format_analysis(result.get("news", {})),
            "\n### 风险提示\n",
            self._format_analysis(result.get("risk", {})),
        ]

        return "\n".join(sections)

    def _format_analysis(self, analysis: Dict[str, Any]) -> str:
        """Format analysis result"""
        score = analysis.get("score", 50)
        confidence = analysis.get("confidence", 0)
        summary = analysis.get("summary", "无分析结果")

        text = f"- **评分:** {score:.1f}/100 (置信度: {confidence:.0%})\n"
        text += f"- **结论:** {summary}\n"

        # Add details if available
        details = analysis.get("details", {})
        if details:
            text += "\n**详细信息:**\n"
            for key, value in details.items():
                if isinstance(value, list):
                    value = ", ".join(str(v) for v in value)
                text += f"- {key}: {value}\n"

        return text

    def _translate_recommendation(self, rec: str) -> str:
        """Translate recommendation to Chinese"""
        mapping = {"buy": "买入", "hold": "持有", "sell": "卖出"}
        return mapping.get(rec, rec)

    def _get_stock_name(self, code: str) -> str:
        """Get stock name from config"""
        from ..config import config

        stocks = config.get_monitored_stocks()
        for stock in stocks:
            if stock["code"] == code:
                return stock["name"]
        return "未知"
```

- [ ] **Step 5: Create local runner script**

Create `run_local.py`:

```python
#!/usr/bin/env python3
"""Run stock analysis pipeline locally"""

from src.pipeline import stock_analysis_pipeline


def main():
    print("Starting stock analysis pipeline...")
    results = stock_analysis_pipeline()
    print(f"\nAnalysis completed for {len(results)} stocks")
    print("Results saved to data/latest.json")
    print("Report saved to reports/daily/")


if __name__ == "__main__":
    main()
```

- [ ] **Step 6: Run tests**

```bash
pytest tests/ -v
```

Expected: PASS

- [ ] **Step 7: Test local execution**

```bash
python run_local.py
```

Expected: Pipeline runs and generates output files

- [ ] **Step 8: Commit pipeline implementation**

```bash
git add src/agents/planner.py src/pipeline.py src/models/analysis_result.py run_local.py tests/
git commit -m "feat: implement analysis pipeline with Prefect

- Add Planner agent for task orchestration
- Create Prefect-based analysis pipeline
- Implement parallel analysis tasks
- Add result aggregation and scoring
- Generate Markdown reports
- Create local runner script
- Write comprehensive tests"
```

---

## Task 11: Feedback Learning System

**Files:**
- Create: `src/feedback/prediction_tracker.py`
- Create: `src/feedback/accuracy_validator.py`
- Create: `src/feedback/weight_adjuster.py`
- Create: `src/feedback/human_rules.py`
- Create: `src/agents/feedback_learner.py`
- Create: `src/utils/retry.py`
- Create: `tests/feedback/test_prediction_tracker.py`
- Create: `tests/feedback/test_accuracy_validator.py`
- Create: `tests/feedback/test_weight_adjuster.py`
- Create: `data/predictions_history.json`

- [ ] **Step 1: Write test for prediction tracker**

Create `tests/feedback/test_prediction_tracker.py`:

```python
import pytest
from src.feedback.prediction_tracker import PredictionTracker


def test_track_prediction():
    tracker = PredictionTracker()

    prediction = {
        "code": "600519",
        "date": "2024-01-15",
        "recommendation": "buy",
        "overall_score": 75.0,
        "price_at_prediction": 1800.0,
    }

    tracker.track(prediction)

    history = tracker.get_history("600519")
    assert len(history) == 1
    assert history[0]["recommendation"] == "buy"


def test_get_performance_metrics():
    tracker = PredictionTracker()

    # Add predictions with known outcomes
    predictions = [
        {"code": "600519", "date": "2024-01-01", "recommendation": "buy", "actual_return": 0.05},
        {"code": "600519", "date": "2024-01-02", "recommendation": "sell", "actual_return": -0.03},
    ]

    for pred in predictions:
        tracker.track(pred)

    metrics = tracker.calculate_performance("600519", days=7)

    assert "accuracy" in metrics
    assert "total_return" in metrics
    assert metrics["prediction_count"] == 2
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pytest tests/feedback/test_prediction_tracker.py -v
```

Expected: FAIL

- [ ] **Step 3: Implement prediction tracker**

Create `src/feedback/prediction_tracker.py`:

```python
import json
from pathlib import Path
from typing import Dict, Any, List
from datetime import datetime, timedelta
from ..utils.logger import get_logger


class PredictionTracker:
    """Track historical predictions and their outcomes"""

    def __init__(self, history_file: str = "data/predictions_history.json"):
        self.history_file = Path(history_file)
        self.history_file.parent.mkdir(parents=True, exist_ok=True)
        self.logger = get_logger("prediction_tracker")

    def track(self, prediction: Dict[str, Any]):
        """
        Save prediction to history.

        Args:
            prediction: Contains code, date, recommendation, scores, price
        """
        # Load existing history
        history = self._load_history()

        # Add prediction
        code = prediction["code"]
        if code not in history:
            history[code] = []

        prediction_entry = {
            "date": prediction["date"],
            "recommendation": prediction.get("recommendation", "hold"),
            "overall_score": prediction.get("overall_score", 50),
            "price_at_prediction": prediction.get("price_at_prediction", 0),
            "actual_return": None,  # To be filled later
            "validated": False,
            "agent_scores": {
                "fundamental": prediction.get("fundamental", {}).get("score", 50),
                "quant": prediction.get("quant", {}).get("score", 50),
                "news": prediction.get("news", {}).get("score", 50),
                "risk": prediction.get("risk", {}).get("score", 50),
            },
            "timestamp": datetime.now().isoformat(),
        }

        history[code].append(prediction_entry)
        self._save_history(history)

        self.logger.info(f"Tracked prediction for {code} on {prediction['date']}")

    def get_history(self, code: str, days: int = None) -> List[Dict[str, Any]]:
        """Get prediction history for a stock"""
        history = self._load_history()

        if code not in history:
            return []

        predictions = history[code]

        if days:
            cutoff = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
            predictions = [p for p in predictions if p["date"] >= cutoff]

        return predictions

    def calculate_performance(self, code: str, days: int = 30) -> Dict[str, Any]:
        """
        Calculate performance metrics for predictions.

        Returns:
            Dict with accuracy, total_return, win_rate, etc.
        """
        history = self.get_history(code, days=days)

        if not history:
            return {"accuracy": 0, "total_return": 0, "prediction_count": 0}

        # Filter validated predictions
        validated = [p for p in history if p.get("validated") and p.get("actual_return") is not None]

        if not validated:
            return {"accuracy": 0, "total_return": 0, "prediction_count": len(history)}

        # Calculate metrics
        correct_predictions = 0
        total_return = 0

        for pred in validated:
            actual_return = pred["actual_return"]
            recommendation = pred["recommendation"]

            total_return += actual_return

            # Check if prediction was correct
            if (recommendation == "buy" and actual_return > 0) or \
               (recommendation == "sell" and actual_return < 0) or \
               (recommendation == "hold" and abs(actual_return) < 0.02):
                correct_predictions += 1

        accuracy = correct_predictions / len(validated) if validated else 0
        win_rate = correct_predictions / len(validated) if validated else 0

        return {
            "accuracy": accuracy,
            "win_rate": win_rate,
            "total_return": total_return,
            "avg_return": total_return / len(validated) if validated else 0,
            "prediction_count": len(history),
            "validated_count": len(validated),
        }

    def validate_prediction(self, code: str, prediction_date: str, actual_price: float):
        """
        Validate a past prediction with actual price.

        Args:
            code: Stock code
            prediction_date: Date of prediction
            actual_price: Actual price after period
        """
        history = self._load_history()

        if code not in history:
            return

        # Find prediction
        for pred in history[code]:
            if pred["date"] == prediction_date:
                price_at_pred = pred["price_at_prediction"]

                if price_at_pred > 0:
                    actual_return = (actual_price - price_at_pred) / price_at_pred
                    pred["actual_return"] = actual_return
                    pred["validated"] = True
                    pred["validated_at"] = datetime.now().isoformat()

                    self.logger.info(
                        f"Validated prediction for {code} on {prediction_date}: "
                        f"return={actual_return:.2%}"
                    )
                break

        self._save_history(history)

    def _load_history(self) -> Dict[str, List]:
        """Load history from file"""
        if not self.history_file.exists():
            return {}

        with open(self.history_file) as f:
            return json.load(f)

    def _save_history(self, history: Dict[str, List]):
        """Save history to file"""
        with open(self.history_file, "w") as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pytest tests/feedback/test_prediction_tracker.py -v
```

Expected: PASS (2 tests)

- [ ] **Step 5: Write test for accuracy validator**

Create `tests/feedback/test_accuracy_validator.py`:

```python
import pytest
from src.feedback.accuracy_validator import AccuracyValidator
from src.feedback.prediction_tracker import PredictionTracker


def test_validate_yesterday():
    tracker = PredictionTracker()
    validator = AccuracyValidator(tracker)

    # Mock prediction from yesterday
    from datetime import datetime, timedelta
    yesterday = (datetime.now() - timedelta(days=1)).strftime("%Y-%m-%d")

    tracker._save_history({
        "600519": [{
            "date": yesterday,
            "recommendation": "buy",
            "price_at_prediction": 1800.0,
            "validated": False,
        }]
    })

    results = validator.validate_periods("600519", current_price=1850.0)

    assert "yesterday" in results
    assert results["yesterday"]["validated"] == True


def test_calculate_accuracy_by_period():
    tracker = PredictionTracker()
    validator = AccuracyValidator(tracker)

    # Setup test data
    from datetime import datetime, timedelta

    today = datetime.now()
    dates = {
        "yesterday": (today - timedelta(days=1)).strftime("%Y-%m-%d"),
        "last_week": (today - timedelta(days=7)).strftime("%Y-%m-%d"),
    }

    tracker._save_history({
        "600519": [
            {"date": dates["yesterday"], "recommendation": "buy", "price_at_prediction": 1800.0, "validated": False},
            {"date": dates["last_week"], "recommendation": "hold", "price_at_prediction": 1790.0, "validated": False},
        ]
    })

    accuracy = validator.calculate_period_accuracy("600519", current_price=1850.0)

    assert "yesterday" in accuracy
    assert "last_week" in accuracy
    assert "last_month" in accuracy
```

- [ ] **Step 6: Implement accuracy validator**

Create `src/feedback/accuracy_validator.py`:

```python
from datetime import datetime, timedelta
from typing import Dict, Any
from .prediction_tracker import PredictionTracker
from ..utils.logger import get_logger


class AccuracyValidator:
    """Validate prediction accuracy across different time periods"""

    def __init__(self, tracker: PredictionTracker):
        self.tracker = tracker
        self.logger = get_logger("accuracy_validator")

    def validate_periods(self, code: str, current_price: float) -> Dict[str, Any]:
        """
        Validate predictions for different periods.

        Args:
            code: Stock code
            current_price: Current stock price

        Returns:
            Dict with validation results for each period
        """
        results = {}

        # Define periods to validate
        periods = {
            "yesterday": 1,
            "last_week": 7,
            "last_month": 30,
            "last_quarter": 90,
        }

        for period_name, days in periods.items():
            history = self.tracker.get_history(code, days=days)

            for pred in history:
                if not pred.get("validated"):
                    pred_date = pred["date"]

                    # Validate with current price
                    self.tracker.validate_prediction(code, pred_date, current_price)

                    results[period_name] = {
                        "date": pred_date,
                        "recommendation": pred["recommendation"],
                        "validated": True,
                    }

        return results

    def calculate_period_accuracy(self, code: str, current_price: float) -> Dict[str, Any]:
        """
        Calculate accuracy for different time periods.

        Returns:
            Dict with accuracy metrics for each period
        """
        periods = {
            "yesterday": 1,
            "last_week": 7,
            "last_month": 30,
            "last_quarter": 90,
        }

        accuracy_metrics = {}

        for period_name, days in periods.items():
            performance = self.tracker.calculate_performance(code, days=days)

            accuracy_metrics[period_name] = {
                "accuracy": performance["accuracy"],
                "total_return": performance["total_return"],
                "win_rate": performance["win_rate"],
                "prediction_count": performance["prediction_count"],
            }

        return accuracy_metrics

    def generate_comparison_chart_data(self, code: str) -> Dict[str, Any]:
        """
        Generate data for prediction vs reality comparison chart.

        Returns:
            Chart data with predicted returns and actual returns
        """
        history = self.tracker.get_history(code, days=90)

        chart_data = {
            "dates": [],
            "predicted_scores": [],
            "actual_returns": [],
            "recommendations": [],
        }

        for pred in history:
            if pred.get("validated"):
                chart_data["dates"].append(pred["date"])
                chart_data["predicted_scores"].append(pred["overall_score"])
                chart_data["actual_returns"].append(pred.get("actual_return", 0) * 100)  # Convert to %
                chart_data["recommendations"].append(pred["recommendation"])

        return chart_data
```

- [ ] **Step 7: Run tests**

```bash
pytest tests/feedback/test_accuracy_validator.py -v
```

Expected: PASS (2 tests)

- [ ] **Step 8: Write test for weight adjuster**

Create `tests/feedback/test_weight_adjuster.py`:

```python
import pytest
from src.feedback.weight_adjuster import WeightAdjuster


def test_initial_weights():
    adjuster = WeightAdjuster()

    weights = adjuster.get_weights()

    assert "fundamental" in weights
    assert weights["fundamental"] == 0.30
    assert sum(weights.values()) == pytest.approx(1.0, rel=0.01)


def test_adjust_weights_based_on_performance():
    adjuster = WeightAdjuster()

    performance = {
        "fundamental": {"accuracy": 0.8, "prediction_count": 10},
        "quant": {"accuracy": 0.6, "prediction_count": 10},
        "news": {"accuracy": 0.7, "prediction_count": 10},
        "risk": {"accuracy": 0.75, "prediction_count": 10},
    }

    adjuster.adjust_weights(performance)

    new_weights = adjuster.get_weights()

    # Fundamental should have higher weight due to better performance
    assert new_weights["fundamental"] > 0.30
    assert new_weights["quant"] < 0.25  # Lower performance


def test_apply_human_rules():
    adjuster = WeightAdjuster()

    # Human rule: increase fundamental weight
    rules = {
        "fundamental": {"multiplier": 1.2, "reason": "trust financials more"},
    }

    adjuster.apply_human_rules(rules)

    weights = adjuster.get_weights()
    assert weights["fundamental"] > 0.30
```

- [ ] **Step 9: Implement weight adjuster**

Create `src/feedback/weight_adjuster.py`:

```python
from typing import Dict, Any
from pathlib import Path
import json
from ..utils.logger import get_logger


class WeightAdjuster:
    """Adaptive weight adjustment based on prediction performance"""

    def __init__(self, config_file: str = "config/agent_weights.json"):
        self.config_file = Path(config_file)
        self.config_file.parent.mkdir(parents=True, exist_ok=True)
        self.logger = get_logger("weight_adjuster")

        # Default weights
        self.default_weights = {
            "fundamental": 0.30,
            "quant": 0.25,
            "news": 0.25,
            "risk": 0.20,
        }

        # Load or initialize weights
        self.weights = self._load_weights()

    def get_weights(self) -> Dict[str, float]:
        """Get current agent weights"""
        return self.weights.copy()

    def adjust_weights(self, performance: Dict[str, Dict[str, Any]]):
        """
        Adjust weights based on agent performance.

        Args:
            performance: Dict with accuracy metrics per agent
        """
        self.logger.info("Adjusting agent weights based on performance")

        # Calculate adjustment factors
        adjustments = {}

        for agent, metrics in performance.items():
            if agent not in self.weights:
                continue

            accuracy = metrics.get("accuracy", 0.5)
            count = metrics.get("prediction_count", 0)

            # Need minimum predictions for reliable adjustment
            if count < 5:
                adjustments[agent] = 1.0  # No change
                continue

            # Adjust based on accuracy deviation from 0.5 (random)
            # Higher accuracy = higher weight
            adjustment_factor = 1.0 + (accuracy - 0.5)  # Range: 0.5 to 1.5

            # Clip to reasonable range
            adjustment_factor = max(0.5, min(1.5, adjustment_factor))

            adjustments[agent] = adjustment_factor

        # Apply adjustments
        new_weights = {}
        for agent, weight in self.weights.items():
            factor = adjustments.get(agent, 1.0)
            new_weights[agent] = weight * factor

        # Normalize to sum to 1.0
        total = sum(new_weights.values())
        for agent in new_weights:
            new_weights[agent] /= total

        self.weights = new_weights
        self._save_weights()

        self.logger.info(f"Adjusted weights: {self.weights}")

    def apply_human_rules(self, rules: Dict[str, Dict[str, Any]]):
        """
        Apply human-defined rules to adjust weights.

        Args:
            rules: Dict with agent multipliers and reasons
                {
                    "fundamental": {"multiplier": 1.2, "reason": "trust financials more"},
                    "quant": {"multiplier": 0.8, "reason": "reduce technical noise"}
                }
        """
        self.logger.info("Applying human rules to weights")

        for agent, rule in rules.items():
            if agent not in self.weights:
                self.logger.warning(f"Unknown agent: {agent}")
                continue

            multiplier = rule.get("multiplier", 1.0)
            reason = rule.get("reason", "no reason provided")

            old_weight = self.weights[agent]
            self.weights[agent] *= multiplier

            self.logger.info(
                f"Applied human rule to {agent}: {old_weight:.3f} -> {self.weights[agent]:.3f} "
                f"(reason: {reason})"
            )

        # Normalize
        total = sum(self.weights.values())
        for agent in self.weights:
            self.weights[agent] /= total

        self._save_weights()

    def reset_to_default(self):
        """Reset weights to default values"""
        self.weights = self.default_weights.copy()
        self._save_weights()
        self.logger.info("Reset weights to default")

    def _load_weights(self) -> Dict[str, float]:
        """Load weights from config file"""
        if not self.config_file.exists():
            return self.default_weights.copy()

        with open(self.config_file) as f:
            data = json.load(f)
            return data.get("weights", self.default_weights.copy())

    def _save_weights(self):
        """Save weights to config file"""
        data = {
            "weights": self.weights,
            "updated_at": str(datetime.now()),
        }

        with open(self.config_file, "w") as f:
            json.dump(data, f, indent=2)
```

- [ ] **Step 10: Run tests**

```bash
pytest tests/feedback/test_weight_adjuster.py -v
```

Expected: PASS (3 tests)

- [ ] **Step 11: Implement human rules integration**

Create `src/feedback/human_rules.py`:

```python
from pathlib import Path
from typing import Dict, Any, List
import json
from datetime import datetime
from ..utils.logger import get_logger


class HumanRulesManager:
    """Manage human-defined rules for Agent behavior"""

    def __init__(self, rules_file: str = "config/human_rules.json"):
        self.rules_file = Path(rules_file)
        self.rules_file.parent.mkdir(parents=True, exist_ok=True)
        self.logger = get_logger("human_rules")

    def add_rule(self, agent: str, rule_type: str, rule_value: Any, reason: str):
        """
        Add a human rule.

        Args:
            agent: Agent name (e.g., "fundamental_analyst")
            rule_type: Type of rule (weight_multiplier, threshold_override, etc.)
            rule_value: Rule value
            reason: Explanation for the rule
        """
        rules = self._load_rules()

        if agent not in rules:
            rules[agent] = []

        rule_entry = {
            "type": rule_type,
            "value": rule_value,
            "reason": reason,
            "created_at": datetime.now().isoformat(),
            "active": True,
        }

        rules[agent].append(rule_entry)
        self._save_rules(rules)

        self.logger.info(f"Added human rule for {agent}: {rule_type}={rule_value}")

    def get_active_rules(self, agent: str) -> List[Dict[str, Any]]:
        """Get active rules for an agent"""
        rules = self._load_rules()

        if agent not in rules:
            return []

        return [r for r in rules[agent] if r.get("active", True)]

    def apply_rules_to_analysis(self, agent: str, analysis_result: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply human rules to modify analysis result.

        Args:
            agent: Agent name
            analysis_result: Original analysis result

        Returns:
            Modified analysis result
        """
        active_rules = self.get_active_rules(agent)

        if not active_rules:
            return analysis_result

        modified_result = analysis_result.copy()

        for rule in active_rules:
            rule_type = rule["type"]
            rule_value = rule["value"]

            if rule_type == "score_adjustment":
                # Adjust score by fixed amount
                modified_result["score"] += rule_value

            elif rule_type == "threshold_override":
                # Override threshold values
                for key, value in rule_value.items():
                    if key in modified_result.get("details", {}):
                        modified_result["details"][key] = value

            elif rule_type == "confidence_boost":
                # Boost confidence
                modified_result["confidence"] = min(1.0, modified_result["confidence"] * rule_value)

        # Clip score to valid range
        modified_result["score"] = max(0, min(100, modified_result["score"]))

        return modified_result

    def deactivate_rule(self, agent: str, rule_index: int):
        """Deactivate a specific rule"""
        rules = self._load_rules()

        if agent in rules and rule_index < len(rules[agent]):
            rules[agent][rule_index]["active"] = False
            rules[agent][rule_index]["deactivated_at"] = datetime.now().isoformat()

            self._save_rules(rules)
            self.logger.info(f"Deactivated rule {rule_index} for {agent}")

    def _load_rules(self) -> Dict[str, List]:
        """Load rules from file"""
        if not self.rules_file.exists():
            return {}

        with open(self.rules_file) as f:
            return json.load(f)

    def _save_rules(self, rules: Dict[str, List]):
        """Save rules to file"""
        with open(self.rules_file, "w") as f:
            json.dump(rules, f, indent=2, ensure_ascii=False)
```

- [ ] **Step 12: Implement exponential backoff retry**

Create `src/utils/retry.py`:

```python
import time
import random
from functools import wraps
from typing import Callable, Type, Tuple
from ..utils.logger import get_logger


def exponential_backoff(
    max_retries: int = 3,
    base_delay: float = 1.0,
    max_delay: float = 60.0,
    exponential_base: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,),
):
    """
    Exponential backoff retry decorator.

    Args:
        max_retries: Maximum number of retries
        base_delay: Initial delay in seconds
        max_delay: Maximum delay in seconds
        exponential_base: Base for exponential calculation
        exceptions: Exception types to catch
    """
    def decorator(func: Callable) -> Callable:
        logger = get_logger("retry")

        @wraps(func)
        def wrapper(*args, **kwargs):
            retry_count = 0

            while retry_count <= max_retries:
                try:
                    return func(*args, **kwargs)

                except exceptions as e:
                    retry_count += 1

                    if retry_count > max_retries:
                        logger.error(f"Max retries ({max_retries}) exceeded for {func.__name__}")
                        raise

                    # Calculate delay with exponential backoff + jitter
                    delay = min(
                        base_delay * (exponential_base ** (retry_count - 1)),
                        max_delay
                    )
                    jitter = random.uniform(0, delay * 0.1)
                    total_delay = delay + jitter

                    logger.warning(
                        f"Retry {retry_count}/{max_retries} for {func.__name__} "
                        f"after {total_delay:.2f}s due to: {str(e)}"
                    )

                    time.sleep(total_delay)

        return wrapper
    return decorator
```

- [ ] **Step 13: Update LLM client with retry**

Update `src/utils/llm_client.py` to use retry:

```python
# Add at top of file
from .retry import exponential_backoff

# Update the generate method:
@exponential_backoff(max_retries=3, base_delay=1.0, exceptions=(Exception,))
def generate(
    self,
    prompt: str,
    use_cache: bool = True,
    system: Optional[str] = None,
) -> str:
    """
    Generate response from LLM with exponential backoff retry.
    """
    # ... existing implementation ...
```

- [ ] **Step 14: Update pipeline to use multiprocessing**

Update `src/pipeline.py` to implement true parallel execution:

```python
from multiprocessing import Pool, Queue
from typing import List, Dict, Any


def _analyze_stock_parallel(args):
    """Worker function for multiprocessing"""
    code, data, weights = args

    # Create agents
    fundamental_analyst = FundamentalAnalyst()
    quant_analyst = QuantAnalyst()
    news_analyst = NewsAnalyst()
    risk_analyst = RiskAnalyst()

    # Run analysis
    fundamental_result = fundamental_analyst.analyze(data)
    quant_result = quant_analyst.analyze({"stock_history": data.get("stock_history", [])})
    news_result = news_analyst.analyze({"news_items": data.get("news_items", [])})
    risk_result = risk_analyst.analyze(_extract_risk_metrics(data))

    # Aggregate with weights
    overall_score = (
        fundamental_result.score * weights["fundamental"] +
        quant_result.score * weights["quant"] +
        news_result.score * weights["news"] +
        (100 - risk_result.score) * weights["risk"]
    )

    return {
        "code": code,
        "fundamental": fundamental_result.model_dump(),
        "quant": quant_result.model_dump(),
        "news": news_result.model_dump(),
        "risk": risk_result.model_dump(),
        "overall_score": overall_score,
    }


@flow(name="Stock Analysis Pipeline")
def stock_analysis_pipeline():
    """Main analysis pipeline with multiprocessing"""
    logger.info("Starting stock analysis pipeline")

    # Get monitored stocks
    stocks = config.get_monitored_stocks()
    stock_codes = [s["code"] for s in stocks]

    # Step 1: Collect data
    stock_data = collect_data(stock_codes)

    # Step 2: Get adaptive weights
    from .feedback.weight_adjuster import WeightAdjuster
    adjuster = WeightAdjuster()
    weights = adjuster.get_weights()

    # Step 3: Prepare parallel tasks
    tasks = [
        (stock["code"], stock_data.get(stock["code"], {}), weights)
        for stock in stocks
    ]

    # Step 4: Run analysis in parallel using multiprocessing
    with Pool(processes=min(4, len(stocks))) as pool:
        all_results = pool.map(_analyze_stock_parallel, tasks)

    # Step 5: Post-process results
    for i, result in enumerate(all_results):
        result["recommendation"] = _determine_recommendation(result["overall_score"])
        result["risk_level"] = result["risk"]["details"].get("risk_level", "medium")
        result["date"] = datetime.now().strftime("%Y-%m-%d")

    # Step 6: Track predictions
    from .feedback.prediction_tracker import PredictionTracker
    tracker = PredictionTracker()

    current_prices = {}  # Would fetch from stock_data

    for result in all_results:
        code = result["code"]
        result["price_at_prediction"] = current_prices.get(code, 0)
        tracker.track(result)

    # Step 7: Validate past predictions
    from .feedback.accuracy_validator import AccuracyValidator
    validator = AccuracyValidator(tracker)

    for stock in stocks:
        code = stock["code"]
        current_price = current_prices.get(code, 0)
        validator.validate_periods(code, current_price)

    # Step 8: Adjust weights based on performance
    performance = {}
    for stock in stocks:
        code = stock["code"]
        metrics = validator.calculate_period_accuracy(code, current_prices.get(code, 0))

        # Aggregate performance across agents (simplified)
        for agent in ["fundamental", "quant", "news", "risk"]:
            if agent not in performance:
                performance[agent] = {"accuracy": 0, "prediction_count": 0}

            performance[agent]["accuracy"] += metrics.get("last_month", {}).get("accuracy", 0.5)
            performance[agent]["prediction_count"] += 1

    # Average the accuracy
    for agent in performance:
        performance[agent]["accuracy"] /= len(stocks)

    adjuster.adjust_weights(performance)

    # Step 9: Save results
    save_results(all_results)

    # Step 10: Generate report with comparison charts
    from .agents.report_generator import ReportGenerator
    report_gen = ReportGenerator()

    for stock in stocks:
        code = stock["code"]
        chart_data = validator.generate_comparison_chart_data(code)

        # Generate comparison chart image
        chart_path = report_gen.generate_comparison_chart(code, chart_data)

        # Add to report
        report_gen.add_comparison_chart(code, chart_path)

    report_gen.generate_daily_report(all_results)

    logger.info("Pipeline completed successfully")

    return all_results


def _determine_recommendation(score: float) -> str:
    """Determine recommendation based on score"""
    if score >= 70:
        return "buy"
    elif score >= 40:
        return "hold"
    else:
        return "sell"
```

- [ ] **Step 15: Create Report Generator Agent**

Create `src/agents/report_generator.py`:

```python
from typing import Dict, Any, List
from pathlib import Path
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from datetime import datetime
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class ReportGenerator(BaseAgent):
    """Report generation agent"""

    def __init__(self, timeout: int = 600):
        super().__init__(name="report_generator", timeout=timeout)
        self.logger = get_logger("report_generator")
        self.charts = {}

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Generate report from analysis results"""
        # This agent doesn't follow standard pattern
        # It's called directly by pipeline
        pass

    def generate_comparison_chart(self, code: str, chart_data: Dict[str, Any]) -> str:
        """
        Generate prediction vs reality comparison chart.

        Args:
            code: Stock code
            chart_data: Dict with dates, predicted_scores, actual_returns

        Returns:
            Path to generated chart image
        """
        if not chart_data["dates"]:
            return ""

        # Create figure
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 8))

        # Plot predicted scores
        dates = [datetime.strptime(d, "%Y-%m-%d") for d in chart_data["dates"]]
        ax1.plot(dates, chart_data["predicted_scores"], 'b-o', label='Predicted Score', linewidth=2)
        ax1.set_ylabel('Predicted Score', fontsize=12)
        ax1.set_title(f'{code} - Prediction vs Reality', fontsize=14, fontweight='bold')
        ax1.legend()
        ax1.grid(True, alpha=0.3)

        # Plot actual returns
        ax2.bar(dates, chart_data["actual_returns"], color=['g' if r >= 0 else 'r' for r in chart_data["actual_returns"]], alpha=0.7)
        ax2.set_ylabel('Actual Return (%)', fontsize=12)
        ax2.set_xlabel('Date', fontsize=12)
        ax2.axhline(y=0, color='black', linestyle='-', linewidth=0.8)
        ax2.grid(True, alpha=0.3)

        # Add recommendation markers
        for i, rec in enumerate(chart_data["recommendations"]):
            color = {'buy': 'green', 'hold': 'orange', 'sell': 'red'}.get(rec, 'gray')
            ax1.scatter(dates[i], chart_data["predicted_scores"][i], s=100, c=color, zorder=5, marker='*')

        # Format dates
        ax1.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))
        ax2.xaxis.set_major_formatter(mdates.DateFormatter('%m-%d'))

        plt.tight_layout()

        # Save chart
        chart_dir = Path("reports/charts")
        chart_dir.mkdir(parents=True, exist_ok=True)

        chart_path = chart_dir / f"{code}_comparison_{datetime.now().strftime('%Y%m%d')}.png"
        plt.savefig(chart_path, dpi=150, bbox_inches='tight')
        plt.close()

        self.logger.info(f"Generated comparison chart: {chart_path}")
        self.charts[code] = str(chart_path)

        return str(chart_path)

    def add_comparison_chart(self, code: str, chart_path: str):
        """Register chart for report inclusion"""
        self.charts[code] = chart_path

    def generate_daily_report(self, results: List[Dict[str, Any]]):
        """Generate daily Markdown report with charts"""
        date_str = datetime.now().strftime("%Y-%m-%d")

        # Build report sections
        sections = [
            f"# 股票分析日报 - {date_str}\n",
            "\n## 预测准确性分析\n",
            self._generate_prediction_analysis(),
            "\n---\n",
            "\n## 今日分析结果\n",
        ]

        for result in results:
            code = result["code"]
            sections.append(f"\n### {code}\n")
            sections.append(self._format_stock_result(result))

            # Add comparison chart if available
            if code in self.charts:
                chart_rel_path = self.charts[code].replace("reports/", "../")
                sections.append(f"\n**预测vs实盘对比:**\n\n![{code} 对比图]({chart_rel_path})\n")

        sections.append("\n---\n")
        sections.append("\n*报告由AI Agent自动生成，包含历史预测验证*\n")

        # Save report
        report_path = Path(f"reports/daily/{date_str}.md")
        report_path.parent.mkdir(parents=True, exist_ok=True)

        with open(report_path, "w") as f:
            f.write("".join(sections))

        self.logger.info(f"Generated daily report: {report_path}")

    def _generate_prediction_analysis(self) -> str:
        """Generate prediction accuracy analysis section"""
        # Load prediction history
        from ..feedback.prediction_tracker import PredictionTracker
        from ..feedback.accuracy_validator import AccuracyValidator

        tracker = PredictionTracker()
        validator = AccuracyValidator(tracker)

        from ..config import config
        stocks = config.get_monitored_stocks()

        sections = ["\n| 股票 | 周期 | 准确率 | 平均收益 | 预测次数 |\n"]
        sections.append("|------|------|--------|----------|----------|\n")

        for stock in stocks:
            code = stock["code"]
            metrics = validator.calculate_period_accuracy(code, current_price=0)

            for period in ["yesterday", "last_week", "last_month", "last_quarter"]:
                data = metrics.get(period, {})
                accuracy = data.get("accuracy", 0)
                avg_return = data.get("avg_return", 0)
                count = data.get("prediction_count", 0)

                sections.append(
                    f"| {code} | {period} | {accuracy:.1%} | {avg_return:.2%} | {count} |\n"
                )

        return "".join(sections)

    def _format_stock_result(self, result: Dict[str, Any]) -> str:
        """Format single stock analysis result"""
        return f"""
**综合评分:** {result.get("overall_score", 0):.1f}/100
**建议操作:** {result.get("recommendation", "hold")}
**风险等级:** {result.get("risk_level", "medium")}

**基本面评分:** {result.get("fundamental", {}).get("score", 50):.1f}
**技术面评分:** {result.get("quant", {}).get("score", 50):.1f}
**舆情评分:** {result.get("news", {}).get("score", 50):.1f}
**风险评分:** {result.get("risk", {}).get("score", 50):.1f}
"""
```

- [ ] **Step 16: Commit feedback learning system**

```bash
git add src/feedback src/utils/retry.py src/agents/report_generator.py tests/feedback
git commit -m "feat: implement feedback learning system

- Add prediction tracking and validation
- Implement multi-period accuracy analysis (1d/7d/30d/90d)
- Add adaptive weight adjustment based on performance
- Support human rule integration
- Implement exponential backoff retry for LLM calls
- Use multiprocessing for parallel agent execution
- Generate prediction vs reality comparison charts
- Add Report Generator as standalone Agent
- Support simulated investment tracking (100 shares)
- Enable continuous self-learning and improvement"
```

---

## Task 12: Frontend Implementation

**Files:**
- Create: `frontend/index.html`
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/src/main.js`
- Create: `frontend/src/App.vue`
- Create: `frontend/src/components/StockOverview.vue`

- [ ] **Step 1: Create package.json**

Create `frontend/package.json`:

```json
{
  "name": "stock-analysis-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.4.0",
    "axios": "^1.6.0",
    "echarts": "^5.4.0",
    "element-plus": "^2.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^5.0.0",
    "vite": "^5.0.0"
  }
}
```

- [ ] **Step 2: Create vite config**

Create `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  base: './',  // Relative path for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

- [ ] **Step 3: Create index.html**

Create `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>股票分析平台</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 4: Create main.js**

Create `frontend/src/main.js`:

```javascript
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
```

- [ ] **Step 5: Create App.vue**

Create `frontend/src/App.vue`:

```vue
<template>
  <div id="app">
    <el-container>
      <el-header>
        <h1>股票分析平台</h1>
        <p class="subtitle">AI驱动的多维度智能分析</p>
      </el-header>

      <el-main>
        <StockOverview />
      </el-main>

      <el-footer>
        <p>© 2026 股票分析平台 | 由AI Agent自动生成</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script setup>
import StockOverview from './components/StockOverview.vue'
</script>

<style>
#app {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  color: #2c3e50;
}

.el-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
}

.el-header h1 {
  margin: 0;
  font-size: 32px;
}

.subtitle {
  margin: 5px 0 0 0;
  opacity: 0.9;
}

.el-main {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

.el-footer {
  text-align: center;
  color: #999;
  padding: 20px;
}
</style>
```

- [ ] **Step 6: Create StockOverview component**

Create `frontend/src/components/StockOverview.vue`:

```vue
<template>
  <div class="stock-overview">
    <el-card v-if="loading" class="loading-card">
      <el-skeleton :rows="10" animated />
    </el-card>

    <div v-else>
      <el-row :gutter="20" class="summary-row">
        <el-col :span="24">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>分析概览</span>
                <el-tag>{{ analysisDate }}</el-tag>
              </div>
            </template>

            <el-table :data="stocksData" style="width: 100%">
              <el-table-column prop="code" label="股票代码" width="120" />
              <el-table-column prop="name" label="股票名称" width="150" />
              <el-table-column prop="overall_score" label="综合评分" width="120">
                <template #default="scope">
                  <el-progress
                    :percentage="scope.row.overall_score"
                    :color="getScoreColor(scope.row.overall_score)"
                  />
                </template>
              </el-table-column>
              <el-table-column prop="recommendation" label="建议操作" width="120">
                <template #default="scope">
                  <el-tag :type="getRecommendationType(scope.row.recommendation)">
                    {{ translateRecommendation(scope.row.recommendation) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="risk_level" label="风险等级" width="120">
                <template #default="scope">
                  <el-tag :type="getRiskType(scope.row.risk_level)">
                    {{ scope.row.risk_level }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作">
                <template #default="scope">
                  <el-button
                    size="small"
                    @click="showDetails(scope.row)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>

      <el-dialog
        v-model="dialogVisible"
        :title="`${selectedStock?.code} - ${selectedStock?.name}`"
        width="80%"
      >
        <div v-if="selectedStock" class="stock-details">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card header="基本面分析">
                <AnalysisCard :analysis="selectedStock.fundamental" />
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card header="技术分析">
                <AnalysisCard :analysis="selectedStock.quant" />
              </el-card>
            </el-col>
          </el-row>

          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="12">
              <el-card header="舆情分析">
                <AnalysisCard :analysis="selectedStock.news" />
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card header="风险提示">
                <AnalysisCard :analysis="selectedStock.risk" />
              </el-card>
            </el-col>
          </el-row>

          <!-- Prediction vs Reality Comparison Chart -->
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="24">
              <el-card header="预测vs实盘对比">
                <PredictionComparisonChart :code="selectedStock.code" />
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import AnalysisCard from './AnalysisCard.vue'
import PredictionComparisonChart from './PredictionComparisonChart.vue'

const loading = ref(true)
const stocksData = ref([])
const analysisDate = ref('')
const dialogVisible = ref(false)
const selectedStock = ref(null)

const fetchData = async () => {
  try {
    const response = await axios.get('../data/latest.json')
    stocksData.value = response.data

    if (stocksData.value.length > 0) {
      analysisDate.value = stocksData.value[0].date
    }
  } catch (error) {
    console.error('Failed to fetch data:', error)
  } finally {
    loading.value = false
  }
}

const showDetails = (stock) => {
  selectedStock.value = stock
  dialogVisible.value = true
}

const getScoreColor = (score) => {
  if (score >= 70) return '#67c23a'
  if (score >= 40) return '#e6a23c'
  return '#f56c6c'
}

const getRecommendationType = (rec) => {
  const types = { buy: 'success', hold: 'warning', sell: 'danger' }
  return types[rec] || 'info'
}

const getRiskType = (level) => {
  const types = { low: 'success', medium: 'warning', high: 'danger' }
  return types[level] || 'info'
}

const translateRecommendation = (rec) => {
  const map = { buy: '买入', hold: '持有', sell: '卖出' }
  return map[rec] || rec
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.stock-overview {
  padding: 20px;
}

.loading-card {
  max-width: 800px;
  margin: 0 auto;
}

.summary-row {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stock-details {
  padding: 20px 0;
}
</style>
```

- [ ] **Step 7: Create AnalysisCard component**

Create `frontend/src/components/AnalysisCard.vue`:

```vue
<template>
  <div class="analysis-card">
    <div class="score-section">
      <el-progress
        type="circle"
        :percentage="analysis?.score || 0"
        :color="getScoreColor(analysis?.score)"
        :width="100"
      />
      <div class="confidence">
        置信度: {{ ((analysis?.confidence || 0) * 100).toFixed(0) }}%
      </div>
    </div>

    <div class="summary">
      <strong>结论:</strong> {{ analysis?.summary || '暂无分析' }}
    </div>

    <div v-if="analysis?.details" class="details">
      <el-divider />
      <div v-for="(value, key) in analysis.details" :key="key" class="detail-item">
        <span class="detail-key">{{ formatKey(key) }}:</span>
        <span class="detail-value">{{ formatValue(value) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  analysis: Object
})

const getScoreColor = (score) => {
  if (!score) return '#909399'
  if (score >= 70) return '#67c23a'
  if (score >= 40) return '#e6a23c'
  return '#f56c6c'
}

const formatKey = (key) => {
  // Convert snake_case to readable text
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

const formatValue = (value) => {
  if (Array.isArray(value)) {
    return value.join(', ')
  }
  if (typeof value === 'number') {
    return value.toFixed(2)
  }
  return value
}
</script>

<style scoped>
.analysis-card {
  padding: 10px;
}

.score-section {
  text-align: center;
  margin-bottom: 20px;
}

.confidence {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.summary {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  line-height: 1.6;
}

.details {
  margin-top: 15px;
}

.detail-item {
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-key {
  font-weight: 600;
  color: #606266;
}

.detail-value {
  margin-left: 10px;
  color: #909399;
}
</style>
```

- [ ] **Step 8: Create PredictionComparisonChart component**

Create `frontend/src/components/PredictionComparisonChart.vue`:

```vue
<template>
  <div class="prediction-comparison-chart">
    <div v-if="loading" class="loading">
      <el-skeleton :rows="5" animated />
    </div>

    <div v-else>
      <!-- Summary Metrics -->
      <el-row :gutter="20" class="metrics-row">
        <el-col :span="6">
          <el-statistic title="预测准确率" :value="metrics.accuracy * 100" suffix="%" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="总收益率" :value="metrics.totalReturn" suffix="%" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="投资次数" :value="metrics.predictionCount" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="胜率" :value="metrics.winRate * 100" suffix="%" />
        </el-col>
      </el-row>

      <!-- Chart -->
      <div ref="chartRef" style="width: 100%; height: 400px;"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import * as echarts from 'echarts'
import axios from 'axios'

const props = defineProps({
  code: String
})

const loading = ref(true)
const chartRef = ref(null)
const chartInstance = ref(null)
const metrics = ref({
  accuracy: 0,
  totalReturn: 0,
  predictionCount: 0,
  winRate: 0
})

const fetchChartData = async () => {
  try {
    // Load prediction history
    const response = await axios.get(`../data/history/${props.code}/predictions.json`)
    const data = response.data

    // Calculate metrics
    const predictions = data.predictions || []
    const validated = predictions.filter(p => p.validated)

    if (validated.length > 0) {
      const correct = validated.filter(p =>
        (p.recommendation === 'buy' && p.actual_return > 0) ||
        (p.recommendation === 'sell' && p.actual_return < 0)
      ).length

      metrics.value = {
        accuracy: correct / validated.length,
        totalReturn: validated.reduce((sum, p) => sum + (p.actual_return || 0), 0),
        predictionCount: predictions.length,
        winRate: correct / validated.length
      }
    }

    // Render chart
    renderChart(validated)

  } catch (error) {
    console.error('Failed to fetch prediction data:', error)

    // Display mock data if not available
    renderChart([])
  } finally {
    loading.value = false
  }
}

const renderChart = (data) => {
  if (!chartRef.value) return

  if (!chartInstance.value) {
    chartInstance.value = echarts.init(chartRef.value)
  }

  const option = {
    title: {
      text: '预测评分 vs 实际收益',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['预测评分', '实际收益率(%)'],
      bottom: 0
    },
    xAxis: {
      type: 'category',
      data: data.map(p => p.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '预测评分',
        min: 0,
        max: 100,
        position: 'left'
      },
      {
        type: 'value',
        name: '实际收益率(%)',
        position: 'right'
      }
    ],
    series: [
      {
        name: '预测评分',
        type: 'line',
        data: data.map(p => p.overall_score),
        smooth: true,
        itemStyle: {
          color: '#5470c6'
        }
      },
      {
        name: '实际收益率(%)',
        type: 'bar',
        yAxisIndex: 1,
        data: data.map(p => (p.actual_return * 100).toFixed(2)),
        itemStyle: {
          color: p => p.value >= 0 ? '#91cc75' : '#ee6666'
        }
      }
    ]
  }

  chartInstance.value.setOption(option)
}

onMounted(() => {
  fetchChartData()
})

watch(() => props.code, () => {
  loading.value = true
  fetchChartData()
})
</script>

<style scoped>
.prediction-comparison-chart {
  padding: 20px;
}

.loading {
  padding: 40px;
}

.metrics-row {
  margin-bottom: 30px;
}
</style>
```

- [ ] **Step 9: Build and test frontend**

```bash
cd frontend
npm install
npm run build
```

Expected: Build succeeds, dist/ directory created

- [ ] **Step 9: Commit frontend**

```bash
git add frontend/
git commit -m "feat: implement Vue3 frontend

- Create stock overview dashboard
- Add analysis detail dialogs
- Implement score visualization with progress bars
- Use Element Plus for UI components
- Configure Vite for GitHub Pages deployment"
```

---

## Task 13: GitHub Actions Workflow

**Files:**
- Create: `.github/workflows/daily-analysis.yml`
- Create: `README.md`
- Create: `.gitignore`

- [ ] **Step 1: Create GitHub Actions workflow**

Create `.github/workflows/daily-analysis.yml`:

```yaml
name: Daily Stock Analysis

on:
  schedule:
    - cron: '0 0 * * *'  # Run at 00:00 UTC (08:00 Beijing Time)
  workflow_dispatch:  # Allow manual trigger

jobs:
  analyze:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'

      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install -r requirements.txt

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package.json

      - name: Install frontend dependencies
        run: |
          cd frontend
          npm install

      - name: Run analysis pipeline
        env:
          DEEPSEEK_API_KEY: ${{ secrets.DEEPSEEK_API_KEY }}
          TUSHARE_TOKEN: ${{ secrets.TUSHARE_TOKEN }}
        run: |
          python run_local.py

      - name: Build frontend
        run: |
          cd frontend
          npm run build

      - name: Commit results
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add data/ reports/ frontend/dist/
          git commit -m "feat: update analysis results - $(date +%Y-%m-%d)" || echo "No changes to commit"
          git push

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
          publish_branch: gh-pages
```

- [ ] **Step 2: Create README**

Create `README.md`:

```markdown
# 股票分析平台

基于多Agent协作的自动化股票分析平台，每日自动采集数据、执行多维度分析、生成研究报告。

## 功能特性

- **多Agent协作**：Planner、数据采集、基本面/量化/舆情/风控分析
- **自动化执行**：GitHub Actions定时触发，无需手动干预
- **多维度分析**：
  - 基本面：ROE、PE、PB、财务健康度
  - 技术面：MA、RSI、MACD、趋势判断
  - 舆情面：新闻情绪、关键事件、影响评估
  - 风控：波动率、回撤、流动性、Beta
- **智能评分**：加权综合评分，生成买卖建议
- **可视化展示**：静态网站实时展示分析结果

## 技术栈

### 后端
- Python 3.11+
- Prefect 2.0 (工作流编排)
- Anthropic API (LLM分析)
- AkShare / Tushare (数据源)
- Pandas / NumPy (数据处理)

### 前端
- Vue 3 + Vite
- Element Plus (UI组件)
- ECharts (图表可视化)

### 部署
- GitHub Actions (定时任务)
- GitHub Pages (静态托管)

## 快速开始

### 本地运行

1. 安装依赖：
```bash
pip install -r requirements.txt
cd frontend && npm install
```

2. 配置环境变量：
```bash
export DEEPSEEK_API_KEY="your-api-key"
export TUSHARE_TOKEN="your-token"  # 可选
```

3. 配置监控股票：
编辑 `config/stocks.json`，添加要分析的股票。

4. 运行分析：
```bash
python run_local.py
```

5. 启动前端：
```bash
cd frontend
npm run dev
```

### GitHub部署

1. Fork本仓库

2. 配置Secrets：
   - `DEEPSEEK_API_KEY`: Anthropic API密钥
   - `TUSHARE_TOKEN`: Tushare令牌（可选）

3. 启用GitHub Pages：
   - Settings → Pages → Source: gh-pages branch

4. 等待首次自动运行或手动触发workflow

## 项目结构

```
stock-analysis-platform/
├── src/
│   ├── agents/          # Agent实现
│   ├── data_sources/    # 数据源封装
│   ├── models/          # 数据模型
│   ├── utils/           # 工具函数
│   └── pipeline.py       # 主流程
├── data/
│   ├── latest.json      # 最新分析结果
│   └── history/         # 历史数据
├── reports/
│   └── daily/           # 每日报告
├── frontend/            # Vue3前端
└── .github/workflows/   # GitHub Actions
```

## 扩展性

### 新增Agent

1. 继承 `BaseAgent` 类
2. 实现 `analyze()` 方法
3. 在Pipeline中注册

### 支持其他分析场景

本平台设计为通用分析框架，可扩展支持：
- 行业分析
- 宏观经济分析
- 基金绩效评估
- 企业竞品研究

## 许可证

MIT License
```

- [ ] **Step 3: Create .gitignore**

Create `.gitignore`:

```
# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
.pytest_cache/
.coverage
htmlcov/

# Virtual environments
venv/
env/
ENV/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Environment variables
.env
.env.local

# Node
node_modules/
frontend/node_modules/
frontend/dist/

# Cache
data/cache/
*.log

# OS
.DS_Store
Thumbs.db
```

- [ ] **Step 4: Initialize git repository**

```bash
git init
git add .
git commit -m "feat: initial commit - stock analysis platform

- Multi-agent architecture with Planner, Collector, 4 Analysts
- Prefect-based pipeline orchestration
- Vue3 frontend with Element Plus
- GitHub Actions automation
- Comprehensive test coverage"
```

- [ ] **Step 5: Test complete workflow locally**

```bash
# Run analysis
python run_local.py

# Build frontend
cd frontend
npm run build

# Serve locally to test
cd dist
python -m http.server 8080
```

Open http://localhost:8080 to verify frontend works.

- [ ] **Step 6: Commit final setup**

```bash
git add .
git commit -m "docs: add README, .gitignore, and GitHub Actions workflow

- Complete project documentation
- Configure daily cron schedule
- Set up deployment to GitHub Pages
- Add usage instructions"
```

---

## Task 14: Testing & Documentation

**Files:**
- Create: `tests/conftest.py`
- Update: All test files with fixtures

- [ ] **Step 1: Create pytest fixtures**

Create `tests/conftest.py`:

```python
import pytest
from src.models.schemas import StockData, FinancialData, NewsItem


@pytest.fixture
def sample_stock_data():
    return {
        "code": "600519",
        "name": "贵州茅台",
        "date": "2024-01-01",
        "open": 1800.0,
        "close": 1820.0,
        "high": 1830.0,
        "low": 1795.0,
        "volume": 1234567,
        "amount": 2234567890.0,
    }


@pytest.fixture
def sample_financial_data():
    return {
        "code": "600519",
        "report_date": "2023-12-31",
        "revenue": 150.5,
        "net_profit": 70.2,
        "roe": 0.31,
        "pe_ratio": 35.2,
        "pb_ratio": 10.5,
        "debt_ratio": 0.25,
    }


@pytest.fixture
def sample_news_items():
    return [
        {
            "title": "茅台发布新品",
            "content": "贵州茅台推出新产品线，拓展市场",
            "source": "新浪财经",
            "publish_date": "2024-01-15",
            "sentiment": "positive",
            "score": 0.85,
        }
    ]
```

- [ ] **Step 2: Run all tests**

```bash
pytest tests/ -v --cov=src --cov-report=html
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add tests/
git commit -m "test: add pytest fixtures and improve test coverage

- Create shared fixtures in conftest.py
- Improve test organization
- Add coverage reporting"
```

---

## Execution Checklist

After completing all tasks:

- [ ] All tests pass: `pytest tests/ -v`
- [ ] Analysis runs locally: `python run_local.py`
- [ ] Feedback learning system active: predictions tracked and validated
- [ ] Multiprocessing execution working: parallel agent analysis
- [ ] Weight adjustment functional: adaptive learning based on performance
- [ ] Human rules integration working: can apply manual adjustments
- [ ] Comparison charts generated: prediction vs reality visualization
- [ ] Frontend builds: `cd frontend && npm run build`
- [ ] Frontend works locally: Open dist/index.html
- [ ] README is complete and accurate
- [ ] Git repository initialized with all files committed
- [ ] Ready to push to GitHub

---

## Post-Implementation

After implementing this plan:

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/stock-analysis-platform.git
   git push -u origin main
   ```

2. **Configure GitHub Secrets:**
   - Settings → Secrets and variables → Actions
   - Add `DEEPSEEK_API_KEY`
   - Add `TUSHARE_TOKEN` (optional)

3. **Enable GitHub Pages:**
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: gh-pages / root

4. **Trigger first run:**
   - Actions → Daily Stock Analysis → Run workflow

5. **Verify deployment:**
   - Check GitHub Pages URL
   - Verify data updated in repository
   - Confirm reports generated
