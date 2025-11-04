#!/bin/bash

echo "================================"
echo "AI 旅行规划师 - API 测试脚本"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# 测试健康检查
echo "1. 测试健康检查..."
HEALTH=$(curl -s ${BASE_URL}/health)
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ 健康检查通过"
else
    echo "❌ 健康检查失败"
    exit 1
fi
echo ""

# 注册/登录用户
echo "2. 测试用户登录..."
LOGIN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "token"; then
    echo "✅ 用户登录成功"
    TOKEN=$(echo "$LOGIN_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
else
    echo "⚠️  用户不存在，尝试注册..."
    REGISTER_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/auth/register \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@example.com",
        "username": "testuser",
        "password": "password123"
      }')
    
    if echo "$REGISTER_RESPONSE" | grep -q "token"; then
        echo "✅ 用户注册成功"
        TOKEN=$(echo "$REGISTER_RESPONSE" | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
    else
        echo "❌ 注册失败"
        exit 1
    fi
fi
echo ""

# 获取用户信息
echo "3. 测试获取用户信息..."
USER_RESPONSE=$(curl -s -X GET ${BASE_URL}/api/auth/me \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$USER_RESPONSE" | grep -q "email"; then
    echo "✅ 获取用户信息成功"
else
    echo "❌ 获取用户信息失败"
    exit 1
fi
echo ""

# 获取API配置
echo "4. 测试API配置..."
CONFIG_RESPONSE=$(curl -s -X GET ${BASE_URL}/api/config \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$CONFIG_RESPONSE" | grep -q "openrouterKey"; then
    echo "✅ API配置获取成功"
else
    echo "❌ API配置获取失败"
    exit 1
fi
echo ""

# 创建旅行计划
echo "5. 测试创建旅行计划..."
PLAN_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/travel-plans \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试日本之旅",
    "destination": "东京",
    "startDate": "2024-12-01",
    "endDate": "2024-12-05",
    "days": 5,
    "budget": 10000,
    "travelers": 2
  }')

if echo "$PLAN_RESPONSE" | grep -q "travelPlan"; then
    echo "✅ 创建旅行计划成功"
    PLAN_ID=$(echo "$PLAN_RESPONSE" | sed -n 's/.*"id":"\([^"]*\)".*/\1/p' | head -1)
else
    echo "❌ 创建旅行计划失败"
    exit 1
fi
echo ""

# 获取旅行计划列表
echo "6. 测试获取旅行计划列表..."
PLANS_RESPONSE=$(curl -s -X GET ${BASE_URL}/api/travel-plans \
  -H "Authorization: Bearer ${TOKEN}")

if echo "$PLANS_RESPONSE" | grep -q "travelPlans"; then
    echo "✅ 获取旅行计划列表成功"
else
    echo "❌ 获取旅行计划列表失败"
    exit 1
fi
echo ""

# 添加费用
echo "7. 测试添加费用..."
EXPENSE_RESPONSE=$(curl -s -X POST ${BASE_URL}/api/travel-plans/${PLAN_ID}/expenses \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "food",
    "amount": 150,
    "currency": "CNY",
    "description": "午餐",
    "date": "2024-12-01"
  }')

if echo "$EXPENSE_RESPONSE" | grep -q "expense"; then
    echo "✅ 添加费用成功"
else
    echo "❌ 添加费用失败"
    exit 1
fi
echo ""

echo "================================"
echo "✅ 所有API测试通过！"
echo "================================"
echo ""
echo "系统运行正常，可以开始使用！"
echo ""
echo "访问地址："
echo "  - 前端（已部署）: http://localhost"
echo "  - 前端（开发模式）: http://localhost:5173"
echo "  - 后端 API: http://localhost:3000"
echo ""
echo "下一步："
echo "1. 访问前端应用"
echo "2. 使用 test@example.com / password123 登录"
echo "3. 在设置中配置 OpenRouter API Key"
echo "4. 开始创建旅行计划！"
echo ""

