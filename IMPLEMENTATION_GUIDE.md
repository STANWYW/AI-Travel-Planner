# AI 旅行规划师 - 完整实现指南

## 📊 当前进度

### ✅ 已完成（后端核心）

1. **数据库模型扩展** ✅
   - User (用户)
   - ApiConfig (API 配置管理，支持加密存储)
   - TravelPlan (旅行计划)
   - Expense (费用记录)

2. **后端 API 实现** ✅
   - ✅ API 配置管理 (`/api/config`)
   - ✅ 旅行计划 CRUD (`/api/travel-plans`)
   - ✅ 费用管理 (`/api/travel-plans/:id/expenses`)
   - ✅ OpenRouter AI 集成服务

3. **安全特性** ✅
   - API Key 加密存储（AES-256-CBC）
   - JWT 认证保护
   - 用户数据隔离

---

## 🎯 需要完成的功能

### 1. 前端界面（React + TypeScript）

#### 1.1 API 配置页面
**文件**: `frontend/src/pages/Settings.tsx`

```typescript
// 功能：
// - 输入并保存 OpenRouter API Key
// - 输入科大讯飞语音识别凭证（AppId, ApiKey, ApiSecret）
// - 输入高德/百度地图 API Key
// - 显示已配置状态（不显示完整 key）
```

#### 1.2 旅行计划创建页面
**文件**: `frontend/src/pages/CreatePlan.tsx`

```typescript
// 功能：
// - 表单输入：目的地、日期、预算、人数
// - 旅行偏好选择（美食、文化、自然、购物等）
// - 语音输入按钮（调用科大讯飞 API）
// - 提交后调用 AI 生成行程
```

#### 1.3 旅行计划列表页
**文件**: `frontend/src/pages/PlanList.tsx`

```typescript
// 功能：
// - 显示所有旅行计划卡片
// - 筛选（状态、日期）
// - 搜索功能
// - 点击查看详情
```

#### 1.4 旅行计划详情页
**文件**: `frontend/src/pages/PlanDetail.tsx`

```typescript
// 功能：
// - 显示 AI 生成的详细行程
// - 地图展示（集成高德/百度地图）
// - 费用统计图表
// - 添加/编辑费用记录
// - 语音输入费用
```

#### 1.5 费用管理组件
**文件**: `frontend/src/components/ExpenseManager.tsx`

```typescript
// 功能：
// - 费用列表展示
// - 添加费用（手动/语音）
// - 费用统计（总计、分类）
// - 预算进度条
```

---

### 2. 语音识别集成（科大讯飞）

#### 2.1 Web Audio API + WebSocket
**文件**: `frontend/src/services/voiceRecognition.ts`

```typescript
// 功能：
// - 录音功能（使用 Web Audio API）
// - 连接科大讯飞 WebSocket
// - 实时语音识别
// - 返回识别结果

// 科大讯飞 Web API 文档：
// https://www.xfyun.cn/doc/asr/voicedictation/API.html
```

**实现步骤**：
1. 从用户配置获取科大讯飞凭证
2. 生成 WebSocket 签名（参考官方文档）
3. 建立 WebSocket 连接
4. 发送音频数据
5. 接收识别结果

#### 2.2 语音输入组件
**文件**: `frontend/src/components/VoiceInput.tsx`

```typescript
// UI 组件：
// - 麦克风按钮
// - 录音动画
// - 识别结果显示
// - 错误提示
```

---

### 3. 地图集成

#### 3.1 高德地图（推荐）
**文件**: `frontend/src/components/AmapView.tsx`

```typescript
// 功能：
// - 显示旅行目的地
// - 标注景点位置
// - 路线规划
// - 周边POI搜索

// 高德地图 JS API 文档：
// https://lbs.amap.com/api/javascript-api-v2/summary
```

**实现步骤**：
1. 在 `index.html` 中引入高德地图 SDK
2. 使用用户配置的 API Key
3. 创建地图实例
4. 添加标记和路线

#### 3.2 或者百度地图
**文件**: `frontend/src/components/BaiduMapView.tsx`

```typescript
// 百度地图 API 文档：
// https://lbsyun.baidu.com/index.php?title=jspopular3.0
```

---

### 4. AI 行程生成优化

#### 4.1 更新控制器
**文件**: `backend/src/controllers/travelPlanController.ts`

```typescript
// 在 generateItinerary 函数中：
import { generateTravelItinerary } from '../services/openrouterService';

export const generateItinerary = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const travelPlan = await prisma.travelPlan.findFirst({
      where: { id, userId: req.userId },
    });
    
    if (!travelPlan) {
      res.status(404).json({ error: '旅行计划未找到' });
      return;
    }
    
    // 调用 OpenRouter 生成行程
    const itinerary = await generateTravelItinerary(req.userId!, {
      destination: travelPlan.destination,
      days: travelPlan.days,
      budget: travelPlan.budget,
      travelers: travelPlan.travelers,
      preferences: travelPlan.preferences,
    });
    
    // 更新旅行计划
    const updated = await prisma.travelPlan.update({
      where: { id },
      data: {
        itinerary,
        suggestions: itinerary.tips || [],
      },
    });
    
    res.json({ message: '行程生成成功', travelPlan: updated });
  } catch (error: any) {
    console.error('生成行程错误:', error);
    res.status(500).json({ error: error.message || '生成行程失败' });
  }
};
```

---

## 📦 需要安装的依赖

### 后端
```bash
cd backend
npm install axios crypto  # 已经是 Node.js 内置模块
```

### 前端
```bash
cd frontend
npm install @ant-design/charts  # 图表库
npm install @react-spring/web   # 动画库（可选）
npm install recorder-core       # 录音库（或使用 Web Audio API）
```

---

## 🔑 API Key 配置流程

### 用户使用流程：

1. **注册/登录** → 进入系统

2. **进入设置页面** → 配置 API Keys：
   - OpenRouter API Key（必需）
     - 获取：https://openrouter.ai/
     - 用途：AI 行程生成、预算分析
   
   - 科大讯飞凭证（可选，用于语音）
     - 获取：https://console.xfyun.cn/
     - 需要：AppId, ApiKey, ApiSecret
   
   - 地图 API Key（可选，用于地图展示）
     - 高德：https://console.amap.com/
     - 百度：https://lbsyun.baidu.com/

3. **创建旅行计划**
   - 输入基本信息或使用语音输入
   - 点击"生成行程"
   - AI 自动生成详细计划

4. **管理费用**
   - 手动添加或语音记录费用
   - 查看预算使用情况
   - 导出费用报告

---

## 🚀 快速实现步骤

### 步骤 1：更新数据库（已完成✅）
```bash
cd backend
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma generate
docker-compose restart backend
```

### 步骤 2：测试后端 API
```bash
# 测试 API 配置
curl -X PUT http://localhost:3000/api/config \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"openrouterKey": "sk-or-..."}'

# 创建旅行计划
curl -X POST http://localhost:3000/api/travel-plans \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "日本之旅",
    "destination": "东京",
    "startDate": "2024-12-01",
    "endDate": "2024-12-05",
    "days": 5,
    "budget": 10000,
    "travelers": 2
  }'
```

### 步骤 3：实现前端页面
按照上面的文件列表逐个实现。

### 步骤 4：集成语音和地图
参考科大讯飞和高德地图的官方文档。

---

## 📝 重要提示

1. **API Key 安全**
   - ✅ 后端已实现加密存储
   - ✅ 不在前端暴露完整 key
   - ✅ 使用 HTTPS（生产环境）

2. **科大讯飞语音识别**
   - 需要生成 WebSocket 签名
   - 参考官方 demo 代码
   - 处理实时流式识别

3. **OpenRouter 配置**
   - 支持多种模型选择
   - 注意 token 消耗和费用
   - 可以让用户选择模型（GPT-4, Claude等）

4. **地图 API**
   - 高德和百度二选一即可
   - 需要申请开发者账号
   - 注意请求配额限制

---

## 🎨 UI/UX 建议

1. **行程展示**
   - 使用时间轴组件展示每日行程
   - 卡片式布局，清晰美观
   - 支持折叠/展开

2. **地图展示**
   - 全屏地图模式
   - 景点标记可点击查看详情
   - 路线规划可视化

3. **费用管理**
   - 使用图表展示预算使用（饼图、柱状图）
   - 实时计算剩余预算
   - 分类统计清晰

4. **语音输入**
   - 醒目的麦克风按钮
   - 录音动画效果
   - 实时显示识别结果

---

## 📖 参考资源

### API 文档
- OpenRouter: https://openrouter.ai/docs
- 科大讯飞语音: https://www.xfyun.cn/doc/
- 高德地图: https://lbs.amap.com/api/
- 百度地图: https://lbsyun.baidu.com/

### 示例代码
- WebSocket 音频流: 科大讯飞官方 demo
- 地图集成: 高德/百度官方示例
- React 录音: Web Audio API + MediaRecorder

---

## 🐛 常见问题

### Q1: 科大讯飞 WebSocket 连接失败？
A: 检查签名生成是否正确，参考官方文档的签名算法。

### Q2: OpenRouter API 调用失败？
A: 检查 API Key 是否正确，确认账户有余额。

### Q3: 地图不显示？
A: 检查 API Key 是否配置，浏览器控制台是否有错误。

### Q4: 数据库迁移失败？
A: 先备份数据，然后重新运行迁移命令。

---

## ✅ 下一步行动

1. [ ] 运行数据库迁移
2. [ ] 实现设置页面（API Key 配置）
3. [ ] 实现旅行计划创建页面
4. [ ] 集成 OpenRouter AI
5. [ ] 添加语音识别功能
6. [ ] 集成地图组件
7. [ ] 完善费用管理
8. [ ] 测试完整流程
9. [ ] 更新文档

---

**时间估计**：
- 前端基础界面：4-6 小时
- 语音识别集成：2-3 小时
- 地图集成：1-2 小时
- AI 功能完善：1-2 小时
- 测试和优化：2-3 小时

**总计**：约 10-16 小时可完成核心功能。

