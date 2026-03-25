#!/usr/bin/env python3
"""Run stock analysis pipeline locally"""

from src.pipeline import run_analysis


def main():
    print("=" * 60)
    print("股票分析平台 - 本地执行")
    print("=" * 60)
    print()
    
    print("开始分析美团(03690.HK)和快手(01024.HK)...")
    print("数据范围: 最近7天")
    print()
    
    results = run_analysis()
    
    print()
    print("=" * 60)
    print("分析完成！")
    print("=" * 60)
    print()
    
    for result in results:
        print(f"股票: {result['code']} - {result['name']}")
        print(f"综合评分: {result['overall_score']:.1f}/100")
        print(f"建议操作: {result['recommendation']}")
        print(f"风险等级: {result['risk_level']}")
        print()
    
    print(f"结果已保存到: data/latest.json")
    print(f"报告已保存到: reports/daily/")
    print()
    print("运行前端查看详细结果:")
    print("  cd frontend && python3 -m http.server 8080")
    print("  打开浏览器: http://localhost:8080")


if __name__ == "__main__":
    main()
