#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

main() {
    echo "====================================="
    echo "  股票分析平台 - 一键部署脚本"
    echo "====================================="
    echo ""

    print_info "检查系统依赖..."

    if ! command -v python3 >/dev/null 2>&1; then
        echo -e "${RED}ERROR: Python3 未安装${NC}"
        exit 1
    fi

    if ! command -v git >/dev/null 2>&1; then
        echo -e "${RED}ERROR: Git 未安装${NC}"
        exit 1
    fi

    PYTHON_VERSION=$(python3 --version | awk '{print $2}')
    print_success "Python 版本: $PYTHON_VERSION"
    print_success "Git 已安装"
    echo ""

    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
    cd "$PROJECT_ROOT"
    print_info "项目目录: $PROJECT_ROOT"
    echo ""

    print_info "创建Python虚拟环境..."

    if [ ! -d "venv" ]; then
        python3 -m venv venv
        print_success "虚拟环境创建成功"
    else
        print_warning "虚拟环境已存在"
    fi
    echo ""

    print_info "安装Python依赖..."
    source venv/bin/activate
    pip install --upgrade pip -q
    pip install -r requirements.txt -q
    print_success "依赖安装完成"
    echo ""

    print_info "检查配置文件..."

    if [ ! -f "config/stocks.json" ]; then
        print_warning "创建默认配置..."
        mkdir -p config
        echo '{"stocks":[{"code":"03690.HK","name":"美团","sector":"互联网"}]}' > config/stocks.json
        print_success "默认配置创建完成"
    fi
    echo ""

    print_info "初始化数据目录..."
    mkdir -p data/history logs reports

    if [ ! -f "data/latest.json" ]; then
        echo '{"stocks":[]}' > data/latest.json
    fi

    if [ ! -f "data/feedback_history.json" ]; then
        echo '{}' > data/feedback_history.json
    fi

    if [ ! -f "data/review_reports.json" ]; then
        echo '{"reports":[]}' > data/review_reports.json
    fi

    if [ ! -f "data/macro_articles.json" ]; then
        echo '{"articles":[]}' > data/macro_articles.json
    fi

    print_success "数据文件初始化完成"
    echo ""

    print_info "配置API密钥..."

    if [ ! -f ".env" ]; then
        print_warning "未找到 .env 文件"
        echo "请配置 DeepSeek API 密钥："
        echo "  export DEEPSEEK_API_KEY='your_key_here'"
        echo ""

        read -p "是否现在配置？(y/n): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            read -p "请输入API密钥: " API_KEY
            echo "DEEPSEEK_API_KEY=$API_KEY" > .env
            print_success "API密钥已保存"
        fi
    else
        print_success ".env 文件已存在"
    fi
    echo ""

    PORT=8888
    print_info "启动前端服务器..."
    echo ""
    echo "访问地址: http://localhost:$PORT"
    echo "按 Ctrl+C 停止服务器"
    echo ""

    cd frontend
    python3 -m http.server $PORT
}

main "$@"
