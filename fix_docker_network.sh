#!/bin/bash

echo "==========================================="
echo "Docker 网络问题自动修复脚本"
echo "==========================================="
echo ""

# 检测 Docker 环境
if docker info | grep -q "Docker Desktop"; then
    echo "✅ 检测到 Docker Desktop (WSL2)"
    echo ""
    echo "📝 请手动配置 Docker Desktop 镜像加速器："
    echo ""
    echo "1. 打开 Docker Desktop"
    echo "2. 点击 Settings (齿轮图标)"
    echo "3. 选择 'Docker Engine'"
    echo "4. 在 JSON 配置中添加以下内容："
    echo ""
    echo '{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://mirror.ccs.tencentyun.com"
  ]
}'
    echo ""
    echo "5. 点击 'Apply & Restart'"
    echo ""
    read -p "配置完成后按回车继续..."
else
    echo "🐧 检测到 Linux Docker"
    echo "📝 正在自动配置镜像加速器..."
    
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json > /dev/null <<-'JSON'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://mirror.ccs.tencentyun.com"
  ]
}
JSON
    
    echo "✅ 配置文件已创建"
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    echo "✅ Docker 已重启"
fi

echo ""
echo "📊 验证镜像加速器配置..."
docker info | grep -A 5 "Registry Mirrors" || echo "⚠️  未检测到镜像加速器配置"

echo ""
echo "==========================================="
echo "✅ 配置完成！现在可以重新构建 Docker"
echo "==========================================="
echo ""
echo "执行以下命令："
echo "  docker-compose down"
echo "  docker-compose up -d --build"
echo ""
