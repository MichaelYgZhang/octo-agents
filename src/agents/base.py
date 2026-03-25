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
