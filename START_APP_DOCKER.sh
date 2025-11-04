#!/bin/bash

echo "================================"
echo "AI 旅行规划师 - Docker 完整启动"
echo "================================"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "✅ Docker 正在运行"
echo ""

echo "📦 启动所有服务（包括前端）..."
echo "⚠️  首次构建前端可能需要 3-5 分钟，请耐心等待..."
echo ""

docker-compose up -d --build

echo ""
echo "⏳ 等待服务启动..."
sleep 10

echo ""
echo "✅ 所有服务已启动"
echo ""
echo "访问地址："
echo "  - 前端: http://localhost"
echo "  - 后端: http://localhost:3000"
echo ""
echo "查看日志："
echo "  docker-compose logs -f"
echo ""
echo "停止服务："
echo "  docker-compose down"
echo ""

