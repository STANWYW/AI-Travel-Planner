# 快速启动指南（本地开发模式）

## 方式 1：本地运行前端（推荐，启动快）

### 启动后端和数据库
```bash
# 1. 启动后端和数据库（已经在运行）
docker-compose up -d backend postgres

# 2. 检查服务状态
docker-compose ps

# 3. 测试后端
curl http://localhost:3000/health
```

### 本地启动前端
```bash
# 1. 进入前端目录
cd frontend

# 2. 安装依赖（首次运行）
npm install

# 3. 启动开发服务器
npm run dev
```

前端将在 http://localhost:5173 启动

### 访问应用
- 前端：http://localhost:5173
- 后端：http://localhost:3000

---

## 方式 2：完整 Docker 模式（需等待前端构建）

```bash
# 等待前端构建完成（8-10分钟）
docker-compose build frontend

# 启动所有服务
docker-compose up -d

# 访问应用
# 前端：http://localhost
# 后端：http://localhost:3000
```

---

## 测试流程

1. 打开浏览器访问前端地址
2. 点击"立即注册"
3. 填写信息：
   - 邮箱：demo@example.com
   - 用户名：demouser
   - 密码：demo123456
4. 注册成功后自动跳转到仪表板
5. 点击"退出登录"
6. 使用相同账号登录测试

---

## 说明

**本地开发模式的优势**：
- ✅ 启动快（1-2分钟）
- ✅ 热重载
- ✅ 开发调试方便
- ✅ 后端仍使用 Docker（数据持久化）

**Docker 完整模式的优势**：
- ✅ 生产环境模拟
- ✅ 一键部署
- ✅ 环境隔离
- ❌ 首次构建慢

**推荐做法**：
- 开发阶段：使用本地运行前端
- 生产部署：使用完整 Docker 模式
- 作业演示：两种方式都可以

