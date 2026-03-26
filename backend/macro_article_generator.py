#!/usr/bin/env python3
"""
宏观环境分析文章生成器
每日自动生成经济/政治/战争影响分析文章
采用金字塔原理结构
"""

import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
import random


class MacroArticleGenerator:
    """宏观分析文章生成器"""

    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        self.articles_file = os.path.join(data_dir, "macro_articles.json")

        # 文章模板库
        self.templates = {
            "经济": [
                {
                    "title_template": "{topic}对港股市场的影响分析",
                    "arguments_templates": [
                        "资金流向发生变化，市场流动性调整",
                        "估值水平重新定价，投资逻辑转变",
                        "投资者风险偏好改变，策略调整"
                    ]
                },
                {
                    "title_template": "宏观经济数据解读：{topic}",
                    "arguments_templates": [
                        "经济增长动力分析",
                        "通胀压力与货币政策展望",
                        "行业景气度变化趋势"
                    ]
                }
            ],
            "政治": [
                {
                    "title_template": "{event}对市场预期的冲击",
                    "arguments_templates": [
                        "政策变化的市场解读",
                        "行业格局调整方向",
                        "投资者应对策略"
                    ]
                },
                {
                    "title_template": "地缘政治变局：{event}的影响",
                    "arguments_templates": [
                        "政治风险溢价评估",
                        "供应链稳定性分析",
                        "长期战略布局建议"
                    ]
                }
            ],
            "战争": [
                {
                    "title_template": "{conflict}持续对全球市场的影响",
                    "arguments_templates": [
                        "能源供给格局变化",
                        "供应链重构压力",
                        "避险情绪与投资机会"
                    ]
                }
            ]
        }

    def generate_article(self, category: str = None) -> Dict:
        """
        生成单篇文章

        Args:
            category: 文章类别 (经济/政治/战争)，不指定则随机
        """
        if not category:
            category = random.choice(["经济", "政治", "战争"])

        # 根据类别生成具体内容
        if category == "经济":
            return self._generate_economic_article()
        elif category == "政治":
            return self._generate_political_article()
        elif category == "战争":
            return self._generate_war_article()

    def _generate_economic_article(self) -> Dict:
        """生成经济类文章"""
        topics = [
            ("美联储货币政策", "monetary_policy"),
            ("全球通胀趋势", "inflation"),
            ("经济增长前景", "growth"),
            ("利率走向", "interest_rate"),
            ("汇率波动", "exchange_rate")
        ]

        topic_cn, topic_en = random.choice(topics)
        date = datetime.now().strftime("%Y-%m-%d")

        article = {
            "id": f"article_{date}_{topic_en}",
            "title": f"{topic_cn}对港股市场的影响分析",
            "date": date,
            "category": "经济",
            "views": 0,
            "summary": f"本文深入分析{topic_cn}对港股市场的多维度影响，从资金流向、估值水平和投资者情绪三个维度展开，为投资者提供决策参考。",
            "pyramid": {
                "conclusion": f"{topic_cn}将重塑市场预期，建议投资者调整配置策略，关注结构性机会。",
                "arguments": [
                    {
                        "title": "市场环境发生变化",
                        "content": f"{topic_cn}导致市场环境出现重要变化，投资者需要重新评估投资组合风险收益特征。"
                    },
                    {
                        "title": "行业分化加剧",
                        "content": "不同行业对宏观环境变化的敏感度不同，将出现明显分化，把握行业轮动机会。"
                    },
                    {
                        "title": "投资策略调整",
                        "content": "在新的宏观环境下，投资者应适当调整投资策略，平衡风险与收益。"
                    }
                ],
                "data": [
                    f"恒生指数市盈率降至{random.randint(8, 12)}倍",
                    f"南向资金近一周净{random.choice(['流入', '流出'])}{random.randint(50, 200)}亿港元",
                    f"市场波动率指数VIX为{random.randint(15, 25)}",
                    f"板块轮动速度加快，日均换手率{random.randint(2, 5)}%"
                ]
            },
            "impact": {
                "positive": random.sample(["公用事业", "银行", "保险", "电信", "能源"], 3),
                "negative": random.sample(["科技", "地产", "消费", "新经济", "教育"], 3),
                "neutral": random.sample(["医疗", "基建", "工业", "材料", "可选消费"], 3)
            },
            "recommendations": [
                "关注宏观经济数据变化，及时调整仓位",
                "优选基本面扎实、估值合理的标的",
                "保持适度仓位，控制下行风险",
                "关注政策导向，把握结构性机会"
            ],
            "references": [
                { "title": "美联储官方网站", "url": "https://www.federalreserve.gov/" },
                { "title": "香港交易所数据", "url": "https://www.hkex.com.hk/" },
                { "title": "国家统计局数据", "url": "http://www.stats.gov.cn/" }
            ]
        }

        return article

    def _generate_political_article(self) -> Dict:
        """生成政治类文章"""
        events = [
            ("中美关系", "china_us"),
            ("中欧关系", "china_eu"),
            ("亚太地缘政治", "asia_pacific"),
            ("国际组织政策", "intl_org")
        ]

        event_cn, event_en = random.choice(events)
        date = datetime.now().strftime("%Y-%m-%d")

        article = {
            "id": f"article_{date}_{event_en}",
            "title": f"{event_cn}变化对市场的潜在影响",
            "date": date,
            "category": "政治",
            "views": 0,
            "summary": f"分析{event_cn}最新动态对港股市场的影响，评估政治风险溢价变化，为投资决策提供参考。",
            "pyramid": {
                "conclusion": f"{event_cn}变化将影响市场风险偏好，建议关注政策受益板块，警惕地缘政治风险。",
                "arguments": [
                    {
                        "title": "政策环境变化",
                        "content": f"{event_cn}出现新变化，相关政策环境随之调整，市场需要重新定价政治风险。"
                    },
                    {
                        "title": "行业影响分化",
                        "content": "不同行业受政治因素影响程度不同，需具体分析政策利好或利空方向。"
                    },
                    {
                        "title": "长期战略意义",
                        "content": "政治关系变化具有长期战略意义，投资者应关注中长期趋势而非短期波动。"
                    }
                ],
                "data": [
                    f"政治风险溢价指数为{random.randint(20, 40)}",
                    f"受影响板块市值占港股总市值{random.randint(15, 35)}%",
                    f"市场情绪指数为{random.randint(40, 70)}（满分100）",
                    f"机构投资者持仓比例调整{random.randint(-5, 5)}%"
                ]
            },
            "impact": {
                "positive": random.sample(["科技", "新能源", "高端制造", "医药", "消费"], 3),
                "negative": random.sample(["军工", "稀土", "信创", "传统制造"], 2),
                "neutral": random.sample(["金融", "地产", "基建", "公用事业"], 3)
            },
            "recommendations": [
                "密切跟踪政治事件进展",
                "关注政策受益方向，把握投资机会",
                "控制政治风险敞口",
                "保持投资组合多元化"
            ],
            "references": [
                { "title": "外交部官方网站", "url": "https://www.fmprc.gov.cn/" },
                { "title": "国际贸易政策数据库", "url": "https://www.wto.org/" },
                { "title": "政治风险评估机构", "url": "https://www.prsgroup.com/" }
            ]
        }

        return article

    def _generate_war_article(self) -> Dict:
        """生成战争类文章"""
        conflicts = [
            ("俄乌冲突", "russia_ukraine"),
            ("中东局势", "middle_east"),
            ("亚太安全形势", "asia_security")
        ]

        conflict_cn, conflict_en = random.choice(conflicts)
        date = datetime.now().strftime("%Y-%m-%d")

        article = {
            "id": f"article_{date}_{conflict_en}",
            "title": f"{conflict_cn}对全球市场的影响分析",
            "date": date,
            "category": "战争",
            "views": 0,
            "summary": f"深入分析{conflict_cn}对全球能源、供应链和金融市场的多维影响，评估投资风险与机会。",
            "pyramid": {
                "conclusion": f"{conflict_cn}推升全球避险情绪，能源和军工板块受益，建议关注防御性资产配置。",
                "arguments": [
                    {
                        "title": "能源价格波动",
                        "content": f"{conflict_cn}影响全球能源供给格局，原油、天然气价格波动加剧，传统能源和新能源板块表现分化。"
                    },
                    {
                        "title": "供应链冲击",
                        "content": "地缘冲突影响全球供应链稳定性，部分原材料供应受限，相关产业链面临调整压力。"
                    },
                    {
                        "title": "避险情绪上升",
                        "content": "地缘政治风险推升市场避险情绪，黄金、美元等避险资产受追捧，风险资产承压。"
                    }
                ],
                "data": [
                    f"原油价格年内波动{random.randint(20, 40)}%",
                    f"黄金价格上涨{random.randint(5, 15)}%",
                    f"军工板块上涨{random.randint(10, 25)}%",
                    f"能源板块市盈率{random.randint(8, 15)}倍",
                    f"市场恐慌指数VIX升至{random.randint(20, 35)}"
                ]
            },
            "impact": {
                "positive": random.sample(["石油", "天然气", "军工", "黄金", "新能源"], 4),
                "negative": random.sample(["航空", "航运", "旅游", "消费"], 3),
                "neutral": random.sample(["科技", "医药", "金融", "地产"], 3)
            },
            "recommendations": [
                "配置避险资产对冲地缘政治风险",
                "关注能源价格波动带来的投资机会",
                "优选基本面稳定的防御性标的",
                "控制仓位，保持充足流动性",
                "关注局势发展，灵活调整策略"
            ],
            "references": [
                { "title": "国际能源署(IEA)", "url": "https://www.iea.org/" },
                { "title": "联合国新闻", "url": "https://news.un.org/" },
                { "title": "国际危机组织", "url": "https://www.crisisgroup.org/" }
            ]
        }

        return article

    def save_article(self, article: Dict):
        """保存文章到文件"""
        if os.path.exists(self.articles_file):
            with open(self.articles_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
        else:
            data = {"articles": [], "meta": {}}

        # 检查是否已存在相同ID的文章
        existing_ids = [a["id"] for a in data["articles"]]
        if article["id"] not in existing_ids:
            data["articles"].append(article)

        # 按日期排序（最新的在前）
        data["articles"].sort(key=lambda x: x["date"], reverse=True)

        # 只保留最近30篇文章
        data["articles"] = data["articles"][:30]

        # 更新元数据
        data["meta"] = {
            "total_articles": len(data["articles"]),
            "last_updated": datetime.now().isoformat(),
            "next_update": (datetime.now() + timedelta(days=1)).isoformat()
        }

        with open(self.articles_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def generate_daily_article(self):
        """生成每日文章"""
        # 轮换类别，保证多样性
        day_of_year = datetime.now().timetuple().tm_yday
        categories = ["经济", "政治", "战争"]
        category = categories[day_of_year % len(categories)]

        article = self.generate_article(category)
        self.save_article(article)

        print(f"生成文章: {article['title']}")
        return article


def main():
    """主函数"""
    generator = MacroArticleGenerator()

    # 生成今日文章
    article = generator.generate_daily_article()

    print("\n文章详情:")
    print(json.dumps(article, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
