#!/bin/bash

echo "================================"
echo "在 WSL 中安装 Node.js"
echo "================================"
echo ""

# 安装 nvm（Node Version Manager）
echo "📦 安装 nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 加载 nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo ""
echo "📦 安装 Node.js 20..."
nvm install 20
nvm use 20

echo ""
echo "✅ 安装完成！"
echo ""
echo "请运行以下命令重新加载 shell："
echo "  source ~/.bashrc"
echo ""
echo "然后再次运行："
echo "  bash START_APP.sh"
echo ""

