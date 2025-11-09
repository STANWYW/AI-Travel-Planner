#!/bin/bash

echo "========================================="
echo "AI 旅行规划师 - Docker 启动脚本"
echo "========================================="
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "📦 步骤 1/3: 停止旧容器（如果有）..."
docker-compose down

echo ""
echo "🔨 步骤 2/3: 构建并启动服务..."
echo "⏳ 首次构建需要 5-10 分钟，请耐心等待..."
docker-compose up -d --build

echo ""
echo "⏳ 步骤 3/3: 等待服务启动..."
sleep 10

echo ""
echo "========================================="
echo "✅ 启动完成！"
echo "========================================="
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost"
echo "   API: http://localhost/api"
echo "   健康检查: http://localhost/health"
echo ""
echo "📊 查看服务状态:"
echo "   docker-compose ps"
echo ""
echo "📝 查看日志:"
echo "   docker-compose logs -f app"
echo ""
echo "🛑 停止服务:"
echo "   docker-compose down"
echo ""
