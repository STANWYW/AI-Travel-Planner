# AI 旅行规划师 (AI Travel Planner)

一个基于 AI 的智能旅行规划 Web 应用，帮助用户轻松规划和管理旅行计划。

**当前版本**：v1.0 - 用户注册登录系统

## 📋 项目简介

AI 旅行规划师旨在简化旅行规划过程，通过 AI 了解用户需求，自动生成详细的旅行路线和建议，并提供实时旅行辅助。

### 当前已实现功能

- ✅ 用户注册系统
- ✅ 用户登录系统
- ✅ JWT 身份认证
- ✅ 用户信息管理
- ✅ 云端数据同步（PostgreSQL 数据库）
- ✅ Docker 容器化部署

### 即将推出的功能

- 🎤 智能语音识别旅行需求
- 🗺️ AI 自动生成个性化旅行路线
- 💰 智能费用预算与管理
- 📍 实时地图导航与景点推荐
- 🌐 多语言支持

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

### 方式一：使用 Docker（推荐）

#### 前置要求
- Docker 20.10+
- Docker Compose 2.0+

#### 启动步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd AITravelPlanner
```

2. **配置环境变量（可选）**

创建 `.env` 文件（或使用默认配置）：
```bash
cp .env.example .env
```

编辑 `.env` 文件，设置 JWT 密钥：
```
JWT_SECRET=your-very-secure-secret-key-here
JWT_EXPIRES_IN=7d
```

> ⚠️ **重要**：在生产环境中，请务必修改 `JWT_SECRET` 为一个强随机字符串！

3. **启动所有服务**
```bash
docker-compose up -d
```

首次启动会自动：
- 拉取所需的 Docker 镜像
- 构建前后端应用
- 初始化 PostgreSQL 数据库
- 运行数据库迁移

4. **访问应用**
- 前端地址: http://localhost
- 后端 API: http://localhost:3000
- 数据库端口: 5432

5. **查看日志**
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

6. **停止服务**
```bash
docker-compose down

# 停止并删除数据卷（清空数据库）
docker-compose down -v
```

### 方式二：本地开发

#### 前置要求
- Node.js 20+
- PostgreSQL 16+
- npm 或 yarn

#### 后端设置

1. **安装依赖**
```bash
cd backend
npm install
```

2. **配置数据库**

确保 PostgreSQL 正在运行，然后配置数据库 URL：
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

后端服务将在 http://localhost:3000 启动

#### 前端设置

1. **安装依赖**
```bash
cd frontend
npm install
```

2. **配置 API 地址（可选）**

创建 `.env` 文件：
```bash
echo "VITE_API_URL=http://localhost:3000" > .env
```

3. **启动开发服务器**
```bash
npm run dev
```

前端应用将在 http://localhost:5173 启动

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

