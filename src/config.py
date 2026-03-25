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
