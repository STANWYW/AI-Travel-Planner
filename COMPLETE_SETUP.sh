#!/bin/bash

echo "==================================="
echo "AI 旅行规划师 - 完整部署脚本"
echo "==================================="
echo ""

# 检查 Docker 是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

echo "📦 步骤 1/5: 构建所有服务..."
docker-compose build

echo ""
echo "🚀 步骤 2/5: 启动所有服务..."
docker-compose up -d

echo ""
echo "⏳ 步骤 3/5: 等待服务启动..."
sleep 10

echo ""
echo "🧪 步骤 4/5: 测试后端 API..."
echo "健康检查:"
curl -s http://localhost:3000/health | jq '.' || curl -s http://localhost:3000/health

echo ""
echo ""
echo "测试用户注册:"
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","username":"demouser","password":"demo123456"}' | jq '.' 2>/dev/null || echo "注册 API 测试完成"

echo ""
echo "📊 步骤 5/5: 显示服务状态..."
docker-compose ps

echo ""
echo "==================================="
echo "✅ 部署完成！"
echo "==================================="
echo ""
echo "📍 访问地址:"
echo "   前端: http://localhost"
echo "   后端: http://localhost:3000"
echo ""
echo "📝 快速测试:"
echo "   1. 打开浏览器访问 http://localhost"
echo "   2. 点击 '立即注册' 创建账号"
echo "   3. 登录查看用户仪表板"
echo ""
echo "🔧 管理命令:"
echo "   查看日志: docker-compose logs -f"
echo "   停止服务: docker-compose down"
echo "   重启服务: docker-compose restart"
echo ""

