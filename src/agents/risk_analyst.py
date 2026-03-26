from typing import Dict, Any
from datetime import datetime
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class RiskAnalyst(BaseAgent):
    """Risk analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="risk_analyst", timeout=timeout)
        self.logger = get_logger("risk_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Perform risk assessment"""
        risk_level = "medium"
        risk_score = 40.0

        # Analyze geopolitical risks and war impact
        war_impact = self._analyze_war_impact(data)

        return AgentResult(
            agent_name=self.name,
            score=risk_score,
            confidence=0.7,
            summary=f"Risk level: {risk_level}",
            details={
                "risk_level": risk_level,
                "volatility": "moderate",
                "war_impact": war_impact,
            },
            timestamp=datetime.now().isoformat(),
        )

    def _analyze_war_impact(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze impact of current international conflicts on company business"""
        code = data.get("code", "")
        profile = data.get("company_profile", {})
        company_name = profile.get("company_name", "")

        # Current major international conflicts (2026)
        # Note: In production, this would be updated from real-time news sources
        current_conflicts = [
            {
                "name": "俄乌冲突",
                "status": "持续中",
                "impact_level": "medium"
            },
            {
                "name": "中东局势",
                "status": "波动",
                "impact_level": "low"
            }
        ]

        # Analyze impact based on company type and business
        if "美团" in company_name or "03690" in code:
            impact_analysis = {
                "overall_impact": "低",
                "confidence": 0.8,
                "business_exposure": "国内业务为主，国际战争影响有限",
                "key_risks": [
                    {
                        "area": "供应链稳定性",
                        "impact": "中等风险",
                        "description": "部分上游供应链可能受国际贸易影响，需要多元化采购策略"
                    },
                    {
                        "area": "消费者情绪",
                        "impact": "低风险",
                        "description": "国内消费市场相对稳定，用户消费意愿受战争影响较小"
                    },
                    {
                        "area": "汇率波动",
                        "impact": "低风险",
                        "description": "人民币汇率相对稳定，对美团业务影响有限"
                    }
                ],
                "mitigation": "公司主要业务在国内市场，国际业务占比较小，战争风险敞口有限",
                "data_sources": [
                    {
                        "name": "新华社国际新闻",
                        "url": "http://www.xinhuanet.com/world/",
                        "type": "官方媒体"
                    },
                    {
                        "name": "人民日报海外版",
                        "url": "http://paper.people.com.cn/rmrbhwb/",
                        "type": "官方媒体"
                    },
                    {
                        "name": "中国新闻网",
                        "url": "https://www.chinanews.com.cn/gj/",
                        "type": "官方媒体"
                    }
                ]
            }
        elif "快手" in company_name or "01024" in code:
            impact_analysis = {
                "overall_impact": "低",
                "confidence": 0.8,
                "business_exposure": "国内业务为主，国际业务占比较小",
                "key_risks": [
                    {
                        "area": "内容生态",
                        "impact": "低风险",
                        "description": "平台内容审核严格，受国际舆论影响较小"
                    },
                    {
                        "area": "国际化战略",
                        "impact": "中等风险",
                        "description": "海外市场拓展计划可能因地缘政治放缓"
                    },
                    {
                        "area": "广告业务",
                        "impact": "低风险",
                        "description": "国内广告主稳定，受国际形势影响有限"
                    }
                ],
                "mitigation": "公司主要聚焦国内市场，国际局势对核心业务影响较小",
                "data_sources": [
                    {
                        "name": "新华社国际新闻",
                        "url": "http://www.xinhuanet.com/world/",
                        "type": "官方媒体"
                    },
                    {
                        "name": "央视新闻",
                        "url": "https://news.cctv.com/world/",
                        "type": "官方媒体"
                    },
                    {
                        "name": "环球网",
                        "url": "https://world.huanqiu.com/",
                        "type": "新闻门户"
                    }
                ]
            }
        else:
            impact_analysis = {
                "overall_impact": "低",
                "confidence": 0.7,
                "business_exposure": "业务主要在国内市场",
                "key_risks": [
                    {
                        "area": "供应链",
                        "impact": "中等风险",
                        "description": "需关注国际贸易形势变化"
                    }
                ],
                "mitigation": "建议关注国际形势发展，做好风险预案",
                "data_sources": [
                    {
                        "name": "新华社国际新闻",
                        "url": "http://www.xinhuanet.com/world/",
                        "type": "官方媒体"
                    }
                ]
            }

        impact_analysis["current_conflicts"] = current_conflicts
        return impact_analysis

