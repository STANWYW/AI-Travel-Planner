# 🔧 问题诊断和解决方案

## 问题 1: 科大讯飞语音识别 WebSocket 401 错误

### 错误信息
```
WebSocket 错误: Unexpected server response: 401
科大讯飞 IAT WebSocket 连接已关闭
```

### 可能的原因

#### 1. **API 凭证配置错误** ⚠️ 最常见
- **AppID**: `86e93909` ✅
- **APIKey**: `009c00732e5c99293a8525056645de25` ✅
- **APISecret**: `ODAxMjAwM2VlOGJlNmQzMWVlOTFjNDFk` ✅

**检查方法**:
1. 登录科大讯飞开放平台: https://console.xfyun.cn/
2. 检查 AppID 是否正确
3. 检查 APIKey 和 APISecret 是否匹配
4. 确认服务权限已开通（语音听写 IAT）

#### 2. **签名算法错误**
- 签名原文格式必须严格按照官方文档
- 时间戳必须是 RFC1123 格式
- HMAC-SHA256 加密必须正确

**已修复**: ✅ 已更正主机地址为 `iat-api.xfyun.cn`

#### 3. **服务未开通**
- 需要在科大讯飞控制台开通"语音听写"服务
- 检查服务状态和配额

#### 4. **网络问题**
- 容器内可能无法访问外部 WebSocket
- 检查防火墙设置

### 解决方案

#### 方案 1: 验证 API 凭证
```bash
# 在设置页面重新配置
1. 访问 http://localhost/settings
2. 检查科大讯飞配置
3. 重新输入 APIKey 和 APISecret
4. 保存配置
```

#### 方案 2: 检查服务权限
1. 登录 https://console.xfyun.cn/
2. 进入"我的应用"
3. 检查 AppID `86e93909` 的服务权限
4. 确认"语音听写"服务已开通

#### 方案 3: 测试 WebSocket 连接
```bash
# 查看后端日志
docker-compose -f docker-compose.china.yml logs -f app | grep -i "科大讯飞\|xfyun\|401"

# 检查 URL 生成
# 应该看到类似输出：
# 科大讯飞 WebSocket URL 已生成
# AppID: 86e93909
# Host: iat-api.xfyun.cn
```

#### 方案 4: 使用测试工具验证
可以使用 Postman 或 curl 测试科大讯飞 API 是否正常。

---

## 问题 2: 地图一直不显示

### 可能的原因

#### 1. **API Key 未配置或错误** ⚠️ 最常见
- 高德地图 Key: `8a7a65524976da9f824679c55e279e8a`
- 需要在设置页面正确配置

**检查方法**:
1. 打开浏览器控制台 (F12)
2. 查看 Console 标签
3. 应该看到：
   ```
   开始检查地图 API Key...
   API 配置: { hasAmapKey: true, ... }
   使用 amap 地图，API Key: 8a7a6552...
   开始加载 amap 地图，目的地: 北京
   ```

#### 2. **脚本加载失败**
- 网络问题导致无法加载高德地图 CDN
- API Key 无效导致脚本拒绝加载

**检查方法**:
1. 打开浏览器开发者工具 (F12)
2. 查看 Network 标签
3. 查找 `webapi.amap.com` 请求
4. 检查状态码：
   - ✅ 200: 正常
   - ❌ 403: API Key 无效或未授权
   - ❌ 404: 脚本地址错误
   - ❌ 其他: 网络问题

#### 3. **API Key 权限问题**
- 高德地图 Key 需要开通"Web 服务 API"
- 需要添加安全域名白名单

**解决方案**:
1. 登录高德开放平台: https://console.amap.com/
2. 进入"应用管理"
3. 检查 Key `8a7a65524976da9f824679c55e279e8a` 的权限
4. 确认已开通"Web 服务 API"
5. 添加安全域名: `localhost` 或您的域名

#### 4. **容器网络问题**
- Docker 容器可能无法访问外部 CDN
- 需要检查网络配置

#### 5. **浏览器控制台错误**
- JavaScript 错误阻止地图初始化
- 需要检查控制台错误信息

### 解决方案

#### 方案 1: 检查 API Key 配置
```bash
# 1. 访问设置页面
http://localhost/settings

# 2. 检查高德地图 Key 是否正确
# 应该显示: 8a7a65524976da9f824679c55e279e8a

# 3. 如果为空，重新输入并保存
```

#### 方案 2: 检查浏览器控制台
```bash
# 1. 打开浏览器开发者工具 (F12)
# 2. 查看 Console 标签
# 3. 查找以下日志：

# 正常情况应该看到：
✅ 开始检查地图 API Key...
✅ API 配置: { hasAmapKey: true, ... }
✅ 使用 amap 地图，API Key: 8a7a6552...
✅ 开始加载 amap 地图，目的地: 北京
✅ 高德地图脚本加载成功
✅ 初始化高德地图...
✅ 高德地图对象创建成功
✅ 高德地图 Geocoder 插件加载成功

# 如果有错误，会显示：
❌ 高德地图脚本加载失败: ...
❌ 地图初始化失败: ...
```

#### 方案 3: 检查网络请求
```bash
# 1. 打开浏览器开发者工具 (F12)
# 2. 查看 Network 标签
# 3. 刷新页面
# 4. 查找请求: https://webapi.amap.com/maps?v=2.0&key=...

# 检查响应：
# - Status: 200 ✅
# - Type: script ✅
# - Size: 应该有内容 ✅

# 如果 Status 是 403:
# → API Key 无效或未授权
# → 需要在控制台重新申请 Key
```

#### 方案 4: 测试 API Key 有效性
```bash
# 使用 curl 测试高德地图 API
curl "https://webapi.amap.com/maps?v=2.0&key=8a7a65524976da9f824679c55e279e8a"

# 如果返回 JavaScript 代码，说明 Key 有效 ✅
# 如果返回错误信息，说明 Key 无效 ❌
```

#### 方案 5: 手动测试地图
```javascript
// 在浏览器控制台执行以下代码测试：

// 1. 检查 AMap 对象是否存在
console.log('AMap:', window.AMap);

// 2. 如果不存在，手动加载脚本
const script = document.createElement('script');
script.src = 'https://webapi.amap.com/maps?v=2.0&key=8a7a65524976da9f824679c55e279e8a';
script.onload = () => {
  console.log('脚本加载成功');
  console.log('AMap:', window.AMap);
};
script.onerror = (err) => {
  console.error('脚本加载失败:', err);
};
document.head.appendChild(script);
```

---

## 🔍 调试步骤

### 语音识别调试

1. **检查后端日志**:
```bash
docker-compose -f docker-compose.china.yml logs -f app | grep -E "科大讯飞|xfyun|401|WebSocket"
```

2. **检查 API 配置**:
```bash
# 在设置页面查看配置
# 确保 AppID、APIKey、APISecret 都正确
```

3. **测试 WebSocket URL**:
```bash
# 查看生成的 URL（在日志中）
# 应该类似: wss://iat-api.xfyun.cn/v2/iat?authorization=...
```

### 地图调试

1. **检查浏览器控制台**:
   - 打开 F12
   - 查看 Console 标签
   - 查找地图相关日志

2. **检查网络请求**:
   - 打开 F12 → Network
   - 查找 `webapi.amap.com` 请求
   - 检查状态码和响应

3. **检查 API Key**:
   - 访问设置页面
   - 确认高德地图 Key 已配置
   - 检查 Key 长度（应该是 32 位）

---

## ⚠️ 常见错误和解决方案

### 错误 1: "未配置地图 API Key"
**原因**: 设置页面没有配置高德地图 Key
**解决**: 在设置页面输入高德地图 Key 并保存

### 错误 2: "地图脚本加载失败"
**原因**: 
- API Key 无效
- 网络问题
- CDN 访问被阻止
**解决**: 
- 检查 API Key 是否正确
- 检查网络连接
- 检查浏览器控制台错误

### 错误 3: "认证失败 (401)"
**原因**: 
- API Key/Secret 不匹配
- 服务未开通
- 签名算法错误
**解决**: 
- 重新配置 API 凭证
- 检查服务权限
- 查看后端日志

---

## 📝 验证清单

### 语音识别
- [ ] 科大讯飞 AppID 已配置
- [ ] 科大讯飞 APIKey 已配置
- [ ] 科大讯飞 APISecret 已配置
- [ ] 服务权限已开通
- [ ] WebSocket URL 生成正确
- [ ] 后端日志无 401 错误

### 地图功能
- [ ] 高德地图 Key 已配置
- [ ] API Key 长度正确（32 位）
- [ ] 浏览器控制台无错误
- [ ] 网络请求状态 200
- [ ] AMap 对象已加载
- [ ] 地图容器存在

---

## 🚀 快速修复命令

```bash
# 1. 重启服务
docker-compose -f docker-compose.china.yml restart app

# 2. 查看实时日志
docker-compose -f docker-compose.china.yml logs -f app

# 3. 检查服务状态
curl http://localhost/health

# 4. 强制刷新浏览器
# Ctrl + Shift + R (Windows/Linux)
# Cmd + Shift + R (Mac)
```

---

**最后更新**: 2025-11-09  
**文档版本**: v1.0.0
