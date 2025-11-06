#!/bin/bash

echo "================================"
echo "AI 旅行规划师 - 加载 Docker 镜像"
echo "================================"
echo ""

# 检查文件是否存在
if [ ! -f "backend.tar" ]; then
    echo "❌ 找不到 backend.tar"
    exit 1
fi

if [ ! -f "frontend.tar" ]; then
    echo "❌ 找不到 frontend.tar"
    exit 1
fi

# 加载后端镜像
echo "📦 加载后端镜像 (645MB)..."
docker load -i backend.tar
if [ $? -eq 0 ]; then
    echo "✅ 后端镜像加载成功"
else
    echo "❌ 后端镜像加载失败"
    exit 1
fi
echo ""

# 加载前端镜像
echo "📦 加载前端镜像 (53MB)..."
docker load -i frontend.tar
if [ $? -eq 0 ]; then
    echo "✅ 前端镜像加载成功"
else
    echo "❌ 前端镜像加载失败"
    exit 1
fi
echo ""

# 拉取数据库镜像
echo "📦 拉取 PostgreSQL 镜像..."
docker pull postgres:16-alpine
echo ""

# 显示镜像
echo "================================"
echo "✅ 所有镜像加载完成！"
echo "================================"
echo ""
echo "已加载的镜像："
docker images | grep -E "aitravelplanner|postgres:16"
echo ""
echo "下一步："
echo "1. 返回项目根目录: cd .."
echo "2. 启动服务: docker-compose up -d"
echo "3. 访问应用: http://localhost"
echo ""
