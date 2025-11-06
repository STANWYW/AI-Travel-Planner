# 🌏 AI 旅行规划师 (AI Travel Planner)

一个功能完整的 AI 驱动的智能旅行规划 Web 应用，帮助用户轻松规划和管理旅行计划。

**当前版本**：v2.0 - 完整功能版

## 📋 项目简介

AI 旅行规划师简化了旅行规划过程，通过 AI 了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

### ✨ 已实现的核心功能

#### 1. 智能行程规划 ✅
- ✅ 支持文字和语音输入旅行需求
- ✅ AI 自动生成个性化旅行路线（使用 OpenRouter API）
- ✅ 包含交通、住宿、景点、餐厅等详细信息
- ✅ 支持多种旅行偏好（美食、文化、自然、购物等）

#### 2. 费用预算与管理 ✅
- ✅ AI 预算分析和建议
- ✅ 记录旅行开销（支持手动和语音输入）
- ✅ 费用分类管理
- ✅ 实时预算使用情况
- ✅ 预算超支提醒

#### 3. 用户管理与数据存储 ✅
- ✅ 注册登录系统（JWT 认证）
- ✅ 多份旅行计划管理
- ✅ 云端数据同步（PostgreSQL）
- ✅ API Key 安全配置

#### 4. 地图与导航（框架已实现）✅
- ✅ 地图展示组件（支持高德/百度地图）
- ⚠️ 需配置 API Key 完全启用

## 🛠️ 技术栈

### 后端
- **运行环境**: Node.js 20
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL 16
- **ORM**: Prisma
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite 5
- **UI 组件库**: Ant Design 5
- **路由**: React Router v6
- **HTTP 客户端**: Axios

### 部署
- **容器化**: Docker & Docker Compose
- **Web 服务器**: Nginx (用于前端静态资源)

## 📦 项目结构

```
AITravelPlanner/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置文件（数据库、JWT）
│   │   ├── controllers/    # 控制器（业务逻辑）
│   │   ├── middleware/     # 中间件（认证等）
│   │   ├── routes/         # 路由定义
│   │   └── index.ts        # 应用入口
│   ├── prisma/
│   │   ├── schema.prisma   # 数据库模型定义
│   │   └── migrations/     # 数据库迁移文件
│   ├── Dockerfile
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── contexts/       # React Context（状态管理）
│   │   ├── pages/          # 页面组件
│   │   ├── services/       # API 服务
│   │   ├── App.tsx         # 应用根组件
│   │   └── main.tsx        # 应用入口
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml      # Docker 编排配置
└── README.md              # 项目文档
```

## 🚀 快速开始

### 方式一：Docker 单容器部署（推荐）✅

**一键启动，前后端打包在一个容器中！**

```bash
# 1. 克隆项目
git clone https://github.com/STANWYW/AI-Travel-Planner.git
cd AI-Travel-Planner

# 2. 启动所有服务（单容器）
docker-compose up -d --build
```

**首次构建需要 5-10 分钟**（包含 npm install），请耐心等待。

**访问应用**：
- **前端**: http://localhost
- **后端 API**: http://localhost/api
- **健康检查**: http://localhost/health

**服务说明**：
- ✅ 单容器部署：前后端打包在一个容器中
- ✅ 自动迁移：首次启动自动运行数据库迁移
- ✅ Nginx 反向代理：统一入口，自动路由

> 💡 **详细说明**：查看 `DEPLOYMENT_SINGLE_CONTAINER.md`

### 方式二：本地开发模式（开发推荐）

**后端 Docker，前端本地运行**

```bash
# 1. 启动后端和数据库
docker-compose up -d postgres
# 注意：单容器模式下，需要单独启动后端（见下方说明）

# 2. 本地启动前端
cd frontend
npm install
npm run dev
# 访问 http://localhost:5173
```

> ⚠️ **注意**：单容器模式下，如需本地开发，需要单独配置后端服务

---

### 方式三：完全本地开发

仅在不使用 Docker 时使用此方式。

#### 前置要求
- Node.js 20+
- PostgreSQL 16+

#### 后端设置

1. **安装依赖**
```bash
cd backend
npm install
```

2. **配置数据库**

确保 PostgreSQL 正在运行：
```bash
# 创建 .env 文件
cat > .env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travel_planner?schema=public"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
EOF
```

3. **运行数据库迁移**
```bash
npx prisma migrate deploy
npx prisma generate
```

4. **启动开发服务器**
```bash
npm run dev
```

#### 前端设置

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:5173 启动

## 🔑 API Key 配置（重要）

### 必需的 API Key

#### OpenRouter API Key（必需）
用于 AI 行程生成功能

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册并登录
3. 充值 $5-10（推荐用于测试）
4. 创建 API Key
5. 在应用的"设置"页面输入 API Key

**注意**：
- API Key 格式：`sk-or-v1-...`
- 推荐使用阿里云百炼平台（如果助教有 Key）
- API Key 会安全存储在服务器端，不会暴露在前端

### 可选的 API Key

#### 科大讯飞语音识别（可选）
用于高级语音识别功能

1. 访问 [科大讯飞开放平台](https://console.xfyun.cn/)
2. 创建应用
3. 获取：AppId, ApiKey, ApiSecret
4. 在设置页面配置

**注意**：如不配置，仍可使用基础录音功能

#### 高德地图 / 百度地图（可选）
用于地图展示功能

- **高德地图**: https://console.amap.com/
- **百度地图**: https://lbsyun.baidu.com/

**注意**：如不配置，地图组件会显示占位符

---

## 📖 API 文档

### 认证接口

#### 1. 用户注册
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

响应：
```json
{
  "message": "注册成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 2. 用户登录
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

响应：
```json
{
  "message": "登录成功",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

#### 3. 获取当前用户信息
```http
GET /api/auth/me
Authorization: Bearer <token>
```

响应：
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "createdAt": "2024-11-04T00:00:00.000Z"
  }
}
```

#### 4. 健康检查
```http
GET /health
```

响应：
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

## 🔒 安全注意事项

1. **JWT 密钥**
   - 在生产环境中，必须设置强随机的 `JWT_SECRET`
   - 不要在代码中硬编码密钥
   - 建议使用 32 字符以上的随机字符串

2. **数据库密码**
   - 修改默认的 PostgreSQL 密码
   - 在 `docker-compose.yml` 中使用环境变量

3. **HTTPS**
   - 生产环境中应使用 HTTPS
   - 可以在 Nginx 层配置 SSL 证书

4. **CORS 配置**
   - 根据实际需求配置允许的域名
   - 不要在生产环境中使用 `*` 允许所有域名

## 🐳 Docker 镜像

### 构建镜像

```bash
# 构建后端镜像
docker build -t ai-travel-planner-backend:latest ./backend

# 构建前端镜像
docker build -t ai-travel-planner-frontend:latest ./frontend
```

### 推送到镜像仓库

```bash
# 登录阿里云镜像仓库（示例）
docker login --username=<your-username> registry.cn-hangzhou.aliyuncs.com

# 打标签
docker tag ai-travel-planner-backend:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-backend:latest
docker tag ai-travel-planner-frontend:latest registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-frontend:latest

# 推送镜像
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-backend:latest
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-frontend:latest
```

### 从镜像仓库拉取并运行

```bash
# 拉取镜像
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-backend:latest
docker pull registry.cn-hangzhou.aliyuncs.com/your-namespace/ai-travel-planner-frontend:latest

# 使用 docker-compose（需要修改 docker-compose.yml 中的镜像地址）
docker-compose up -d
```

## 🧪 测试

### 使用 curl 测试 API

```bash
# 注册用户
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'

# 登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# 获取用户信息（需要替换 <token>）
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

## 🛠️ 数据库管理

### 使用 Prisma Studio

```bash
cd backend
npx prisma studio
```

Prisma Studio 将在 http://localhost:5555 打开，提供可视化的数据库管理界面。

### 数据库迁移

```bash
# 创建新的迁移
npx prisma migrate dev --name <migration-name>

# 应用迁移到生产环境
npx prisma migrate deploy

# 重置数据库（删除所有数据）
npx prisma migrate reset
```

## 📝 开发说明

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 规则
- 统一使用 4 空格缩进
- 组件和函数应添加适当的注释

### Git 提交规范

建议使用以下前缀：
- `feat:` 新功能
- `fix:` 修复 bug
- `docs:` 文档更新
- `style:` 代码格式调整
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建或辅助工具的变动

## 🔄 版本历史

- **v1.0** (2024-11-04)
  - ✅ 实现用户注册登录系统
  - ✅ JWT 身份认证
  - ✅ Docker 容器化部署
  - ✅ PostgreSQL 数据库集成

## 📄 许可证

MIT License

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题，请通过 GitHub Issues 联系。

---

**注意**：当前版本仅实现了用户注册登录系统，其他核心功能（智能行程规划、语音识别、地图导航等）将在后续版本中实现。

