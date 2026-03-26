from abc import ABC, abstractmethod
from typing import Dict, Any
from datetime import datetime
import signal
import sys
from pathlib import Path

# 添加项目根目录到sys.path
project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from ..models.schemas import AgentResult
from ..utils.logger import get_logger
from src.feedback.feedback_manager import FeedbackManager


class TimeoutException(Exception):
    """Agent execution timeout"""
    pass


def timeout_handler(signum, frame):
    raise TimeoutException("Agent execution timed out")


class BaseAgent(ABC):
    """Base class for all analysis agents"""

    def __init__(self, name: str, timeout: int = 300, auto_apply_feedback: bool = True):
        self.name = name
        self.timeout = timeout
        self.logger = get_logger(f"agent.{name}")
        self.auto_apply_feedback = auto_apply_feedback
        self.thresholds = {}
        self.weights = {}

        # 自动应用反馈
        if self.auto_apply_feedback:
            self._apply_latest_feedback()

    def _apply_latest_feedback(self):
        """应用最新的反馈到Agent"""
        try:
            feedback_manager = FeedbackManager()
            adjustments = feedback_manager.get_agent_adjustments(self.name)

            if adjustments.get("has_feedback"):
                self.logger.info(f"Applying latest feedback to {self.name}")

                # 应用阈值调整
                for threshold, value in adjustments.get("new_thresholds", {}).items():
                    self.thresholds[threshold] = value
                    self.logger.info(f"  Applied threshold: {threshold} = {value}")

                # 应用权重调整
                for weight, multiplier in adjustments.get("weight_changes", {}).items():
                    if weight in self.weights:
                        old_weight = self.weights[weight]
                        self.weights[weight] = old_weight * multiplier
                        self.logger.info(f"  Applied weight change: {weight} {old_weight} -> {self.weights[weight]}")

                # 应用参数调整
                for param, value in adjustments.get("parameter_adjustments", {}).items():
                    if hasattr(self, param):
                        setattr(self, param, value)
                        self.logger.info(f"  Applied parameter: {param} = {value}")

        except Exception as e:
            self.logger.warning(f"Failed to apply feedback: {str(e)}")

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
