#!/bin/bash

echo "========================================="
echo "测试新 API 功能"
echo "========================================="
echo ""

# 1. 健康检查
echo "1. 健康检查..."
curl -s http://localhost:3000/health | jq '.'
echo ""

# 2. 登录获取 token
echo "2. 登录获取 token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo "✅ 登录成功"
else
  echo "❌ 登录失败，请先注册用户"
  exit 1
fi
echo ""

# 3. 配置 API Key
echo "3. 配置 API Key..."
curl -s -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"openrouterKey":"test-key-for-demo"}' | jq '.'
echo ""

# 4. 获取配置状态
echo "4. 获取配置状态..."
curl -s -X GET http://localhost:3000/api/config \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# 5. 创建旅行计划
echo "5. 创建旅行计划..."
PLAN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/travel-plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title":"日本东京之旅",
    "destination":"东京",
    "startDate":"2024-12-01T00:00:00Z",
    "endDate":"2024-12-05T00:00:00Z",
    "days":5,
    "budget":10000,
    "travelers":2,
    "preferences":{"interests":["美食","动漫","购物"]}
  }')

echo "$PLAN_RESPONSE" | jq '.'
PLAN_ID=$(echo "$PLAN_RESPONSE" | jq -r '.travelPlan.id')
echo ""

# 6. 获取所有计划
echo "6. 获取所有旅行计划..."
curl -s -X GET http://localhost:3000/api/travel-plans \
  -H "Authorization: Bearer $TOKEN" | jq '.travelPlans | length' | xargs echo "计划数量:"
echo ""

# 7. 添加费用
echo "7. 添加费用记录..."
curl -s -X POST http://localhost:3000/api/travel-plans/$PLAN_ID/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "category":"food",
    "amount":150.50,
    "currency":"CNY",
    "description":"寿司晚餐",
    "date":"2024-12-01T19:00:00Z"
  }' | jq '.'
echo ""

# 8. 获取费用统计
echo "8. 获取费用统计..."
curl -s -X GET http://localhost:3000/api/travel-plans/$PLAN_ID/expenses \
  -H "Authorization: Bearer $TOKEN" | jq '.statistics'
echo ""

echo "========================================="
echo "✅ 所有 API 测试完成！"
echo "========================================="
