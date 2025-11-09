#!/bin/bash

echo "==========================================="
echo "   AI 旅行规划师 - 单容器 Docker 部署"
echo "==========================================="
echo ""
echo "请选择启动方式："
echo ""
echo "1) 国内优化版（华为云镜像 + 阿里云apt，推荐）"
echo "2) 简化版（官方镜像 + npm淘宝源，备用方案）"
echo "3) 标准方式（需要配置 Docker 镜像加速器）"
echo "4) 退出"
echo ""
read -p "请输入选项 (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📦 使用国内优化版启动..."
        ./start_docker_china.sh
        ;;
    2)
        echo ""
        echo "📦 使用简化版启动..."
        docker-compose -f docker-compose.yml -f <(echo '
services:
  app:
    build:
      dockerfile: Dockerfile.simple
') up -d --build
        ;;
    3)
        echo ""
        echo "📦 使用标准方式启动..."
        docker-compose up -d --build
        ;;
    4)
        echo "👋 再见！"
        exit 0
        ;;
    *)
        echo "❌ 无效选项"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "==========================================="
    echo "✅ 启动完成！"
    echo "==========================================="
    echo ""
    echo "📍 访问地址: http://localhost"
    echo ""
    echo "📊 常用命令:"
    echo "   查看状态: docker-compose ps"
    echo "   查看日志: docker-compose logs -f app"
    echo "   停止服务: docker-compose down"
    echo ""
fi
