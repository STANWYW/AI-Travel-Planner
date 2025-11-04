#!/bin/bash

echo "================================"
echo "AI 旅行规划师 - 启动脚本"
echo "================================"
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "✅ Docker 正在运行"
echo ""

# 启动后端和数据库
echo "📦 启动后端服务和数据库..."
docker-compose up -d backend postgres

echo ""
echo "⏳ 等待数据库启动..."
sleep 5

echo ""
echo "✅ 后端服务已启动"
echo "   - 后端 API: http://localhost:3000"
echo "   - 健康检查: http://localhost:3000/health"
echo ""

# 检查前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd frontend
    npm install
    cd ..
    echo "✅ 前端依赖安装完成"
    echo ""
fi

echo "================================"
echo "🚀 启动前端开发服务器..."
echo "================================"
echo ""
echo "前端将在 http://localhost:5173 启动"
echo ""
echo "如需停止后端服务，运行："
echo "  docker-compose down"
echo ""
echo "按 Ctrl+C 停止前端服务"
echo ""

cd frontend
npm run dev

