# 🔧 问题修复总结

## 修复日期: 2025-11-09

---

## ✅ 已修复的问题

### 1. 🤖 AI 模型限流问题（429 错误）

**问题描述**:
```
google/gemini-2.0-flash-exp:free is temporarily rate-limited upstream
Error: Provider returned error (code: 429)
```

**根本原因**:
- Google Gemini 免费模型被限流
- 单一模型依赖导致服务不可用

**解决方案**:
✅ **实现多模型自动切换机制**
- 添加 5 个免费 AI 模型作为备选
- 按优先级自动重试
- 遇到限流错误（429）自动切换到下一个模型

**可用模型列表**（按优先级）:
1. `deepseek/deepseek-chat-v3-0324:free` ⭐ 推荐
2. `deepseek/deepseek-r1-0528:free`
3. `tngtech/deepseek-r1t2-chimera:free`
4. `tngtech/deepseek-r1t-chimera:free`
5. `google/gemini-2.0-flash-exp:free`

**效果**:
- ✅ 即使单个模型限流，也能自动切换到可用模型
- ✅ 大幅提高服务可用性
- ✅ 用户无感知的自动降级

---

### 2. 🎤 科大讯飞语音识别 WebSocket 401 错误

**问题描述**:
```
WebSocket 错误: Unexpected server response: 401
```

**根本原因**:
- WebSocket 主机地址错误
  - 错误：`iat-api.xfyun.cn`
  - 正确：`ws-api.xfyun.cn`
- URL 构建不符合科大讯飞官方文档规范

**解决方案**:
✅ **更正 WebSocket 连接配置**
```typescript
// 修改前
const host = 'iat-api.xfyun.cn';

// 修改后
const host = 'ws-api.xfyun.cn';
```

✅ **改进 URL 生成逻辑**
- 更新签名原文构建方式
- 确保符合科大讯飞官方文档规范
- 添加详细调试日志

**科大讯飞 API 配置**:
- AppID: `86e93909` ✅
- APIKey: `009c00732e5c99293a8525056645de25` ✅
- APISecret: `ODAxMjAwM2VlOGJlNmQzMWVlOTFjNDFk` ✅
- WebSocket 地址: `wss://ws-api.xfyun.cn/v2/iat` ✅

---

### 3. 🗺️ 地图不显示问题

**问题描述**:
- 地图一直显示"正在加载中..."
- 地图容器显示但没有实际地图

**根本原因**:
- `setLoading(false)` 在 `loadMap` 函数开始就被调用
- 地图脚本还未加载完成就显示了容器
- 导致 DOM 元素存在但 AMap 对象未初始化

**问题代码**:
```typescript
// ❌ 错误位置
const loadMap = (apiKey: string, provider: 'amap' | 'baidu') => {
  setLoading(false); // 太早了！脚本还没加载
  
  const script = document.createElement('script');
  script.onload = () => {
    // 地图初始化...
  };
}
```

**解决方案**:
✅ **将 setLoading(false) 移到正确位置**
```typescript
// ✅ 正确位置
const loadMap = (apiKey: string, provider: 'amap' | 'baidu') => {
  const script = document.createElement('script');
  script.onload = () => {
    setLoading(false); // 脚本加载完成后再设置
    
    // 初始化地图...
    const map = new AMap.Map(mapRef.current, { ... });
  };
}
```

✅ **改进错误处理**
- 添加 script.onerror 处理
- 添加地理编码失败提示
- 所有错误情况都会正确设置 loading 状态

---

### 4. 🗺️ 高德地图 API Key 更新

**旧 Key** (已删除):
- `64817e2948f6a66c48ffd34ad235498b`

**新 Key** (已配置):
- `8a7a65524976da9f824679c55e279e8a` ✅
- 另一个 Key: `afae161e439286f81cb806807a911d10` ✅

**配置位置**:
- 设置页面 → 高德地图 Key

---

## 📊 测试验证

### AI 模型自动切换测试

**测试步骤**:
1. 创建新的旅行计划
2. 点击"生成行程"
3. 观察后端日志

**预期结果**:
```bash
尝试使用模型: deepseek/deepseek-chat-v3-0324:free
✅ 成功使用模型: deepseek/deepseek-chat-v3-0324:free
```

**如果第一个模型限流**:
```bash
尝试使用模型: deepseek/deepseek-chat-v3-0324:free
❌ 模型失败: Provider returned error
尝试使用模型: deepseek/deepseek-r1-0528:free
✅ 成功使用模型: deepseek/deepseek-r1-0528:free
```

---

### 语音识别测试

**测试步骤**:
1. 访问 http://localhost/plans/create
2. 点击紫色语音卡片的🎤按钮
3. 允许麦克风权限
4. 说："我想去上海三天"
5. 停止录音

**预期后端日志**:
```bash
科大讯飞 WebSocket URL 已生成
AppID: 86e93909
Date: Sat, 09 Nov 2025 12:00:00 GMT
科大讯飞 IAT WebSocket 连接已建立
识别结果: 我想去上海三天
```

**预期前端**:
- 显示"语音识别完成！"
- 文本自动填充

---

### 地图显示测试

**测试步骤**:
1. 在设置页面配置高德地图 Key: `8a7a65524976da9f824679c55e279e8a`
2. 创建旅行计划（目的地：北京）
3. 查看计划详情
4. 滚动到底部

**预期结果**:
- ✅ 看到实际的高德地图（不是"加载中"）
- ✅ 地图中心定位到北京
- ✅ 在北京位置显示标记点
- ✅ 可以缩放、拖动地图

---

## 🔍 调试指南

### 查看后端日志
```bash
docker-compose -f docker-compose.china.yml logs -f app
```

### 查看浏览器控制台
```bash
# 打开浏览器开发者工具
F12 → Console

# 地图相关日志
console.log('科大讯飞 WebSocket URL 已生成')
console.log('地图加载失败:', err)
console.warn('地理编码失败，使用默认位置')
```

### 测试语音识别 API
```bash
curl -X POST http://localhost/api/voice/recognize \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"audioBase64": "BASE64_AUDIO_DATA"}'
```

---

## 📝 关键代码变更

### 1. 多模型切换逻辑

**文件**: `backend/src/services/openrouterService.ts`

```typescript
const models = [
  'deepseek/deepseek-chat-v3-0324:free',
  'deepseek/deepseek-r1-0528:free',
  'tngtech/deepseek-r1t2-chimera:free',
  'tngtech/deepseek-r1t-chimera:free',
  'google/gemini-2.0-flash-exp:free',
];

for (const model of models) {
  try {
    response = await axios.post(OPENROUTER_API_URL, { model, ... });
    console.log(`✅ 成功使用模型: ${model}`);
    break;
  } catch (error: any) {
    if (error.response?.data?.error?.code !== 429) {
      throw error; // 非限流错误，直接抛出
    }
    // 限流错误，继续尝试下一个模型
  }
}
```

### 2. 科大讯飞 WebSocket URL

**文件**: `backend/src/services/xfyunService.ts`

```typescript
const host = 'ws-api.xfyun.cn';  // ✅ 修正
const path = '/v2/iat';
const signatureOrigin = `host: ${host}\ndate: ${date}\nGET ${path} HTTP/1.1`;
const url = `wss://${host}${path}?authorization=...&date=...&host=${host}`;
```

### 3. 地图加载时机

**文件**: `frontend/src/components/MapView.tsx`

```typescript
script.onload = () => {
  setLoading(false); // ✅ 移到这里
  const map = new AMap.Map(mapRef.current, { ... });
};
```

---

## ⚠️ 注意事项

### AI 模型使用
- DeepSeek 模型是国产模型，网络访问更稳定
- 如果所有模型都限流，会返回错误（概率很低）
- 可以考虑添加自己的 OpenRouter API Key

### 语音识别
- 需要安静的环境
- 麦克风权限必须允许
- 录音时长建议不超过 60 秒

### 地图显示
- 高德地图 Key 有配额限制
- 如果超出配额，地图可能无法加载
- 可以在高德开放平台查看使用量

---

## 🎯 验证清单

在浏览器测试以下功能:

- [ ] 创建旅行计划时 AI 能成功生成行程（不报429错误）
- [ ] 语音识别点击后能正常录音和识别
- [ ] 计划详情页底部能看到实际地图
- [ ] 地图能正确定位到目的地
- [ ] 地图可以缩放和拖动

---

## 🚀 快速验证命令

```bash
# 1. 检查服务状态
curl http://localhost/health

# 2. 强制刷新浏览器
# Ctrl + Shift + R

# 3. 查看实时日志
docker-compose -f docker-compose.china.yml logs -f app | grep -E "模型|识别|地图"

# 4. 重启服务（如果需要）
docker-compose -f docker-compose.china.yml restart app
```

---

**修复完成时间**: 2025-11-09  
**测试状态**: ✅ 待用户验证  
**文档版本**: v1.0.0
