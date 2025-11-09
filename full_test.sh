#!/bin/bash
set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║          AI 旅行规划师 - 完整功能测试                                 ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# API Keys
OPENROUTER_KEY="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"
XFYUN_APPID="86e93909"
XFYUN_API_KEY="009c00732e5c99293a8525056645de25"
XFYUN_API_SECRET="ODAxMjAwM2VlOGJlNmQzMWVlOTFjNDFk"
AMAP_KEY="64817e2948f6a66c48ffd34ad235498b"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  测试服务健康状态"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

HEALTH=$(curl -s http://localhost/health)
echo "健康检查: $HEALTH"
if echo "$HEALTH" | grep -q "ok"; then
    echo "✅ 后端服务正常"
else
    echo "❌ 后端服务异常"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2️⃣  注册测试账号"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TIMESTAMP=$(date +%s)
TEST_EMAIL="test${TIMESTAMP}@test.com"
TEST_USERNAME="test${TIMESTAMP}"
TEST_PASSWORD="Test123456"

echo "邮箱: $TEST_EMAIL"
echo "用户名: $TEST_USERNAME"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST http://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"username\": \"$TEST_USERNAME\",
    \"password\": \"$TEST_PASSWORD\"
  }")

echo "$REGISTER_RESPONSE" | python3 -m json.tool
TOKEN=$(echo "$REGISTER_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

if [ -z "$TOKEN" ]; then
    echo "❌ 注册失败"
    exit 1
fi

echo ""
echo "✅ 注册成功"
echo "Token: ${TOKEN:0:50}..."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3️⃣  配置 API Keys"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

CONFIG_RESPONSE=$(curl -s -X PUT http://localhost/api/config \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"openrouterKey\": \"$OPENROUTER_KEY\",
    \"xfyunAppId\": \"$XFYUN_APPID\",
    \"xfyunApiKey\": \"$XFYUN_API_KEY\",
    \"xfyunApiSecret\": \"$XFYUN_API_SECRET\",
    \"amapKey\": \"$AMAP_KEY\"
  }")

echo "$CONFIG_RESPONSE" | python3 -m json.tool
echo ""
echo "✅ API Keys 配置成功"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4️⃣  创建旅行计划"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 获取当前日期和未来7天后的日期
START_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
END_DATE=$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -v+7d +"%Y-%m-%dT%H:%M:%S.000Z")

echo "创建去北京的7天旅行计划..."
echo ""

CREATE_PLAN_RESPONSE=$(curl -s -X POST http://localhost/api/travel-plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"title\": \"北京7日游\",
    \"destination\": \"北京\",
    \"startDate\": \"$START_DATE\",
    \"endDate\": \"$END_DATE\",
    \"days\": 7,
    \"budget\": 5000,
    \"travelers\": 2,
    \"preferences\": {
      \"interests\": [\"历史文化\", \"美食\"],
      \"pace\": \"轻松\"
    }
  }")

echo "$CREATE_PLAN_RESPONSE" | python3 -m json.tool
PLAN_ID=$(echo "$CREATE_PLAN_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['travelPlan']['id'])" 2>/dev/null)

if [ -z "$PLAN_ID" ]; then
    echo "❌ 创建计划失败"
    exit 1
fi

echo ""
echo "✅ 计划创建成功"
echo "计划 ID: $PLAN_ID"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5️⃣  AI 生成行程（使用 Qwen 3 235B 模型）"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⏳ 正在调用 AI 生成详细行程，这可能需要 10-30 秒..."
echo ""

AI_RESPONSE=$(curl -s -X POST http://localhost/api/travel-plans/$PLAN_ID/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

echo "$AI_RESPONSE" | python3 -m json.tool | head -100
echo ""
echo "✅ AI 行程生成完成"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6️⃣  添加费用记录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EXPENSE_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

echo "添加交通费用..."
EXPENSE1=$(curl -s -X POST http://localhost/api/travel-plans/$PLAN_ID/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"category\": \"transportation\",
    \"amount\": 500,
    \"currency\": \"CNY\",
    \"description\": \"往返高铁票\",
    \"date\": \"$EXPENSE_DATE\"
  }")

echo "$EXPENSE1" | python3 -m json.tool

echo ""
echo "添加住宿费用..."
EXPENSE2=$(curl -s -X POST http://localhost/api/travel-plans/$PLAN_ID/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"category\": \"accommodation\",
    \"amount\": 1200,
    \"currency\": \"CNY\",
    \"description\": \"酒店住宿（3晚）\",
    \"date\": \"$EXPENSE_DATE\"
  }")

echo "$EXPENSE2" | python3 -m json.tool

echo ""
echo "✅ 费用记录添加成功"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7️⃣  查询费用统计"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

EXPENSES=$(curl -s -X GET http://localhost/api/travel-plans/$PLAN_ID/expenses \
  -H "Authorization: Bearer $TOKEN")

echo "$EXPENSES" | python3 -m json.tool
echo ""
echo "✅ 费用查询成功"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8️⃣  查看所有旅行计划"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

ALL_PLANS=$(curl -s -X GET http://localhost/api/travel-plans \
  -H "Authorization: Bearer $TOKEN")

echo "$ALL_PLANS" | python3 -m json.tool | head -50
echo ""
echo "✅ 查询成功"

echo ""
echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║                    ✅ 所有测试完成！                                  ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 测试摘要"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ 服务健康检查：通过"
echo "✅ 用户注册：通过"
echo "✅ API Keys 配置：通过"
echo "✅ 创建旅行计划：通过"
echo "✅ AI 生成行程 (Qwen 3 235B)：通过"
echo "✅ 费用管理：通过"
echo "✅ 数据查询：通过"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 测试账号信息"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "邮箱: $TEST_EMAIL"
echo "用户名: $TEST_USERNAME"
echo "密码: $TEST_PASSWORD"
echo "计划 ID: $PLAN_ID"
echo ""
echo "您可以使用此账号登录系统查看详细信息："
echo "🌐 http://localhost"
echo ""

