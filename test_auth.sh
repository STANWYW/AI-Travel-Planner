#!/bin/bash

echo "======================================"
echo "测试注册和登录功能"
echo "======================================"
echo ""

# 生成随机用户
TIMESTAMP=$(date +%s)
EMAIL="user${TIMESTAMP}@test.com"
USERNAME="user${TIMESTAMP}"
PASSWORD="Test123456"

echo "1️⃣  测试注册..."
echo "邮箱: $EMAIL"
echo "用户名: $USERNAME"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }")

echo "注册响应:"
echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
echo ""

# 检查是否成功
if echo "$REGISTER_RESPONSE" | grep -q "注册成功"; then
    echo "✅ 注册成功！"
    TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
    echo "Token: ${TOKEN:0:50}..."
else
    echo "❌ 注册失败！"
    exit 1
fi

echo ""
echo "2️⃣  测试登录..."
echo ""

LOGIN_RESPONSE=$(curl -s -X POST http://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "登录响应:"
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
echo ""

if echo "$LOGIN_RESPONSE" | grep -q "登录成功"; then
    echo "✅ 登录成功！"
else
    echo "❌ 登录失败！"
    exit 1
fi

echo ""
echo "======================================"
echo "✅ 所有测试通过！API 功能正常！"
echo "======================================"

