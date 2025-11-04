# AI 旅行规划师 - 作业提交文档

## 项目信息

- **项目名称**: AI 旅行规划师 (AI Travel Planner)
- **当前版本**: v1.0 - 用户注册登录系统
- **开发日期**: 2024-11-04
- **GitHub 仓库**: [请填写您的 GitHub 仓库地址]

## 项目概述

AI 旅行规划师是一个基于 AI 的智能旅行规划 Web 应用。本次提交实现了完整的用户注册登录系统，为后续的核心功能（智能行程规划、语音识别、地图导航等）打下了基础。

## 已实现功能

### 1. 用户认证系统
- ✅ 用户注册功能
  - 邮箱验证
  - 用户名唯一性检查
  - 密码强度验证
  - 密码加密存储（bcrypt）
  
- ✅ 用户登录功能
  - 邮箱密码登录
  - JWT Token 认证
  - Token 自动续期
  
- ✅ 用户信息管理
  - 获取当前用户信息
  - 用户数据云端存储

### 2. 前端界面
- ✅ 现代化的登录注册界面
  - 响应式设计
  - 表单验证
  - 加载状态提示
  - 错误信息展示
  
- ✅ 用户仪表板
  - 用户信息展示
  - 退出登录功能
  - 未来功能预告

### 3. 技术实现
- ✅ 前后端分离架构
- ✅ RESTful API 设计
- ✅ JWT 身份认证
- ✅ PostgreSQL 数据库
- ✅ Docker 容器化部署
- ✅ GitHub Actions CI/CD

## 技术栈

### 后端
- **运行环境**: Node.js 20
- **Web 框架**: Express.js
- **编程语言**: TypeScript
- **数据库**: PostgreSQL 16
- **ORM**: Prisma
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcryptjs
- **数据验证**: express-validator

### 前端
- **框架**: React 18
- **编程语言**: TypeScript
- **构建工具**: Vite 5
- **UI 框架**: Ant Design 5
- **路由**: React Router v6
- **HTTP 客户端**: Axios
- **状态管理**: React Context API

### 部署
- **容器化**: Docker & Docker Compose
- **Web 服务器**: Nginx
- **CI/CD**: GitHub Actions

## 项目结构

```
AITravelPlanner/
├── backend/                 # 后端服务
│   ├── src/
│   │   ├── config/         # 配置（数据库、JWT）
│   │   ├── controllers/    # 控制器
│   │   ├── middleware/     # 中间件
│   │   ├── routes/         # 路由
│   │   └── index.ts        # 入口文件
│   ├── prisma/
│   │   ├── schema.prisma   # 数据模型
│   │   └── migrations/     # 数据库迁移
│   ├── Dockerfile
│   └── package.json
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/     # 组件
│   │   ├── contexts/       # Context
│   │   ├── pages/          # 页面
│   │   ├── services/       # API 服务
│   │   └── App.tsx
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── .github/
│   └── workflows/
│       └── docker-build.yml # CI/CD 配置
├── docker-compose.yml      # Docker 编排
├── README.md              # 项目文档
├── DEPLOYMENT.md          # 部署指南
└── SUBMISSION.md          # 提交文档（本文件）
```

## Docker 镜像

### 镜像仓库

**阿里云镜像仓库地址**（请根据实际情况填写）：
```
registry.cn-hangzhou.aliyuncs.com/[your-namespace]/ai-travel-planner-backend:latest
registry.cn-hangzhou.aliyuncs.com/[your-namespace]/ai-travel-planner-frontend:latest
```

### 拉取和运行

```bash
# 克隆项目
git clone [您的 GitHub 仓库地址]
cd AITravelPlanner

# 使用 Docker Compose 启动（推荐）
docker-compose up -d

# 或者从阿里云拉取镜像
docker-compose pull
docker-compose up -d
```

### 访问地址

- **前端**: http://localhost
- **后端 API**: http://localhost:3000
- **健康检查**: http://localhost:3000/health

### 测试账号

启动后可以注册新账号进行测试。

## API 密钥说明

本项目当前版本（v1.0）仅实现用户注册登录系统，**暂不需要**外部 API Key（如大语言模型、语音识别、地图服务等）。

未来版本将会集成以下 API 服务：
- 大语言模型 API（用于行程规划）
- 语音识别 API（科大讯飞或其他）
- 地图服务 API（高德或百度地图）

### JWT 密钥配置

项目使用 JWT 进行用户认证，需要配置 JWT_SECRET。在生产环境部署时，请务必修改默认的密钥：

```bash
# 创建 .env 文件
echo "JWT_SECRET=$(openssl rand -base64 32)" > .env
echo "JWT_EXPIRES_IN=7d" >> .env
```

> ⚠️ **重要**: 已在代码中确保 API Key 不会硬编码，所有敏感配置均通过环境变量注入。

## 运行说明

### 方式一：使用 Docker Compose（推荐）

**前置要求**：
- Docker 20.10+
- Docker Compose 2.0+

**启动步骤**：

```bash
# 1. 克隆项目
git clone [您的 GitHub 仓库地址]
cd AITravelPlanner

# 2. 配置环境变量（可选，使用默认配置也可以）
cp .env.example .env
# 编辑 .env 文件，设置 JWT_SECRET

# 3. 启动所有服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

**访问应用**：
- 打开浏览器访问: http://localhost
- 注册新用户并登录
- 可以在控制台查看 API 请求和响应

**停止服务**：
```bash
docker-compose down
```

### 方式二：本地开发运行

详细步骤请参考主 README.md 文件。

## 功能演示

### 1. 用户注册
1. 访问 http://localhost
2. 点击"立即注册"
3. 填写邮箱、用户名、密码
4. 点击"注册"按钮
5. 自动跳转到用户仪表板

### 2. 用户登录
1. 访问 http://localhost/login
2. 输入邮箱和密码
3. 点击"登录"按钮
4. 跳转到用户仪表板

### 3. 用户信息管理
1. 登录后可以查看用户信息
2. 点击"退出登录"可以退出

### 4. API 测试

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

## GitHub 提交记录

本项目保持了详细的 Git 提交记录，展示了开发过程：

```bash
# 查看提交记录
git log --oneline --graph --all

# 查看代码统计
git log --author="Your Name" --pretty=tformat: --numstat | \
  awk '{ add += $1; subs += $2; loc += $1 - $2 } END \
  { printf "added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }'
```

**主要提交**：
- 项目初始化和结构搭建
- 后端 API 实现
- 前端界面开发
- Docker 配置
- 文档编写
- CI/CD 配置

## 安全措施

1. ✅ **密码安全**
   - 使用 bcrypt 加密存储
   - 最小密码长度限制
   - 不返回密码字段

2. ✅ **身份认证**
   - JWT Token 认证
   - Token 过期机制
   - 受保护的路由

3. ✅ **数据验证**
   - 服务端表单验证
   - 客户端实时验证
   - SQL 注入防护（Prisma ORM）

4. ✅ **配置安全**
   - 环境变量管理
   - .gitignore 排除敏感文件
   - 不硬编码密钥

## 测试环境

### 开发环境
- **OS**: Ubuntu 22.04 LTS
- **Node.js**: v20.10.0
- **Docker**: 24.0.7
- **Docker Compose**: v2.23.0

### 浏览器兼容性
- Chrome 100+
- Firefox 100+
- Safari 15+
- Edge 100+

## 未来规划

### 第二阶段（即将开发）
- 🎤 语音识别功能（基于科大讯飞 API）
- 🤖 AI 行程规划（接入大语言模型）
- 💰 费用预算管理
- 📝 行程列表管理

### 第三阶段
- 🗺️ 地图集成（高德或百度地图）
- 📍 景点推荐
- 🏨 住宿建议
- 🍜 餐厅推荐

### 第四阶段
- 📱 移动端适配
- 🌐 国际化支持
- 👥 行程分享功能
- 📊 数据分析和报表

## 项目亮点

1. **完整的工程化实践**
   - TypeScript 全栈开发
   - 代码规范和最佳实践
   - Docker 容器化部署
   - CI/CD 自动化

2. **安全可靠**
   - JWT 认证机制
   - 密码加密存储
   - 数据验证和防护
   - 错误处理完善

3. **用户体验**
   - 现代化 UI 设计
   - 响应式布局
   - 流畅的交互
   - 清晰的错误提示

4. **可扩展性**
   - 模块化设计
   - 前后端分离
   - RESTful API
   - 易于添加新功能

5. **文档完善**
   - 详细的 README
   - 部署指南
   - API 文档
   - 代码注释

## 联系方式

- **GitHub**: [您的 GitHub 地址]
- **Email**: [您的邮箱]

## 附件清单

提交的 PDF 文件应包含：

1. ✅ GitHub 仓库地址
2. ✅ 本 README 文档内容
3. ✅ Docker 镜像拉取和运行说明
4. ✅ 项目截图（可选）
5. ✅ API 密钥说明（当前版本不需要外部 API Key）

---

**注意**: 
- 当前提交的是 v1.0 版本，仅包含用户注册登录系统
- 后续版本将逐步实现智能行程规划、语音识别、地图导航等核心功能
- 所有代码已上传 GitHub，保持详细的提交记录
- Docker 镜像已构建完成，可通过 docker-compose 一键启动
- 没有硬编码任何 API Key，所有配置通过环境变量管理

