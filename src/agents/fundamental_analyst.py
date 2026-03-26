from typing import Dict, Any
from datetime import datetime
from .base import BaseAgent
from ..models.schemas import AgentResult
from ..utils.logger import get_logger


class FundamentalAnalyst(BaseAgent):
    """Fundamental analysis agent"""

    def __init__(self, timeout: int = 300):
        super().__init__(name="fundamental_analyst", timeout=timeout)
        self.logger = get_logger("fundamental_analyst")

    def analyze(self, data: Dict[str, Any]) -> AgentResult:
        """Perform fundamental analysis"""
        financial = data.get("financial_data", {})
        profile = data.get("company_profile", {})
        code = data.get("code", "")

        score = 60.0
        details = {
            "valuation": "fair",
            "growth": "moderate",
        }

        # Add financial indicators
        if financial:
            pe_ratio = financial.get("pe_ratio", 0)
            pb_ratio = financial.get("pb_ratio", 0)
            roe = financial.get("roe", 0)
            gross_margin = financial.get("gross_margin", 0)
            net_margin = financial.get("net_margin", 0)
            debt_ratio = financial.get("debt_ratio", 0)

            details.update({
                "pe_ratio": pe_ratio,
                "pb_ratio": pb_ratio,
                "roe": f"{(roe * 100):.2f}%" if roe else "N/A",
                "gross_margin": f"{(gross_margin * 100):.2f}%" if gross_margin else "N/A",
                "net_margin": f"{(net_margin * 100):.2f}%" if net_margin else "N/A",
                "debt_ratio": f"{(debt_ratio * 100):.2f}%" if debt_ratio else "N/A",
            })

            # Adjust score based on fundamentals
            if pe_ratio and pe_ratio < 25:
                score += 5
            if roe and roe > 0.15:
                score += 10
            if net_margin and net_margin > 0.10:
                score += 5

        # Add company profile
        if profile:
            details.update({
                "industry": profile.get("industry", "N/A"),
                "employees": profile.get("employees", "N/A"),
                "main_business": profile.get("main_business", "N/A"),
            })

        # 深度分析：从经济学家角度
        strategic_analysis = self._analyze_strategic_position(code, profile)
        if strategic_analysis:
            details.update(strategic_analysis)

        return AgentResult(
            agent_name=self.name,
            score=score,
            confidence=0.6,
            summary="Fundamental analysis completed",
            details=details,
            timestamp=datetime.now().isoformat(),
        )

    def _analyze_strategic_position(self, code: str, profile: Dict[str, Any]) -> Dict[str, Any]:
        """从经济学家角度分析公司战略定位和未来方向"""
        company_name = profile.get("company_name", "")

        # 美团深度分析
        if "美团" in company_name or "03690" in code:
            return {
                "strategic_analysis": {
                    "china_context": {
                        "title": "中国国情背景",
                        "points": [
                            "数字经济占比持续提升，平台经济政策环境趋于稳定",
                            "消费升级趋势明显，即时配送需求强劲",
                            "反垄断监管常态化，政策不确定性降低",
                            "平台经济纳入新基建，政策支持力度加大",
                            "共同富裕导向下，社会责任投入增加"
                        ]
                    },
                    "tech_strength": {
                        "title": "技术实力分析",
                        "score": 85,
                        "details": [
                            "智能调度系统：AI算法优化配送路径，效率行业领先",
                            "大数据能力：亿级用户画像，精准推荐算法",
                            "云计算架构：支撑千万级并发订单处理",
                            "无人配送技术：无人车、无人机试点运营",
                            "研发投入：年研发投入超200亿，占比收入超10%"
                        ]
                    },
                    "leadership_style": {
                        "title": "管理层风格（王兴）",
                        "characteristics": [
                            "战略前瞻性强：从团购到外卖到本地生活服务，布局领先",
                            "数据驱动决策：重视数据指标，快速试错迭代",
                            "长期主义：愿意为长期价值牺牲短期利润",
                            "执行力强：战略落地能力强，组织效率高",
                            "低调务实：少公开露面，专注业务本质"
                        ]
                    },
                    "future_direction": {
                        "title": "下一阶段发力方向预测",
                        "directions": [
                            "即时零售：美团闪购加速布局，与美团外卖形成协同",
                            "到店酒旅：疫后复苏，高毛利业务回归增长",
                            "新业务：优选、买菜等社区电商持续优化",
                            "B端服务：为商户提供SaaS服务，提升粘性",
                            "国际化探索：香港市场试点，海外扩张储备"
                        ]
                    },
                    "price_prediction": {
                        "title": "股价预测依据",
                        "short_term": "震荡上行，受益于消费复苏和成本优化",
                        "mid_term": "稳步增长，新业务亏损收窄，盈利能力提升",
                        "long_term": "长期看好，本地生活服务市场空间巨大，龙头地位稳固",
                        "risks": ["监管政策风险", "竞争加剧", "新业务投入周期长"]
                    }
                }
            }

        # 快手深度分析
        elif "快手" in company_name or "01024" in code:
            return {
                "strategic_analysis": {
                    "china_context": {
                        "title": "中国国情背景",
                        "points": [
                            "短视频用户渗透率超90%，行业进入存量竞争",
                            "内容监管趋严，合规成本上升",
                            "乡村振兴战略，下沉市场价值凸显",
                            "直播电商规范化发展，增长空间依然巨大",
                            "数字经济出海政策支持，海外市场机会增多"
                        ]
                    },
                    "tech_strength": {
                        "title": "技术实力分析",
                        "score": 80,
                        "details": [
                            "推荐算法：精准内容推荐，用户粘性强",
                            "视频技术：自研编解码技术，成本优势明显",
                            "直播技术：低延迟直播技术，电商转化率高",
                            "AI能力：内容审核AI、虚拟主播技术",
                            "研发投入：年研发投入超150亿，持续加码AI"
                        ]
                    },
                    "leadership_style": {
                        "title": "管理层风格（宿华、程一笑）",
                        "characteristics": [
                            "技术背景深厚：创始人都是工程师出身，重视产品技术",
                            "用户导向：专注用户体验，社区氛围维护",
                            "稳健发展：相比竞品更注重盈利能力",
                            "普惠理念：重视下沉市场和普通创作者",
                            "组织变革：近期进行组织架构调整，提升效率"
                        ]
                    },
                    "future_direction": {
                        "title": "下一阶段发力方向预测",
                        "directions": [
                            "电商业务：货架电商+直播电商双轮驱动",
                            "广告业务：内循环广告占比提升，商业化效率优化",
                            "海外市场：巴西、印尼等重点市场深耕",
                            "短剧内容：微短剧爆发，新增长点",
                            "AI应用：AI生成内容、虚拟人等新技术探索"
                        ]
                    },
                    "price_prediction": {
                        "title": "股价预测依据",
                        "short_term": "筑底回升，亏损大幅收窄，盈利拐点已现",
                        "mid_term": "稳定增长，商业化能力提升，利润率改善",
                        "long_term": "谨慎乐观，需关注竞争格局和内容生态健康度",
                        "risks": ["抖音竞争压力", "用户增长放缓", "内容监管风险"]
                    }
                }
            }

        return {}
