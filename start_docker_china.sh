#!/bin/bash

echo "==========================================="
echo "AI 旅行规划师 - Docker 启动（国内优化版）"
echo "==========================================="
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker Desktop"
    exit 1
fi

echo "📦 使用国内镜像源进行构建..."
echo "⏳ 这可能需要 5-10 分钟，请耐心等待..."
echo ""

# 停止旧容器
echo "1️⃣  停止旧容器..."
docker-compose -f docker-compose.china.yml down 2>/dev/null

# 清理构建缓存（可选）
# docker builder prune -f

# 构建并启动
echo ""
echo "2️⃣  构建并启动服务..."
docker-compose -f docker-compose.china.yml up -d --build

if [ $? -eq 0 ]; then
    echo ""
    echo "==========================================="
    echo "✅ 启动成功！"
    echo "==========================================="
    echo ""
    echo "📍 访问地址:"
    echo "   前端: http://localhost"
    echo "   后端 API: http://localhost/api"
    echo "   健康检查: http://localhost/health"
    echo ""
    echo "📊 查看服务状态:"
    echo "   docker-compose -f docker-compose.china.yml ps"
    echo ""
    echo "📝 查看日志:"
    echo "   docker-compose -f docker-compose.china.yml logs -f app"
    echo ""
    echo "🛑 停止服务:"
    echo "   docker-compose -f docker-compose.china.yml down"
    echo ""
else
    echo ""
    echo "❌ 启动失败，请查看错误信息"
    echo ""
    echo "📝 查看详细日志:"
    echo "   docker-compose -f docker-compose.china.yml logs"
    exit 1
fi
