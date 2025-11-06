# Docker 镜像使用说明

本目录包含 AI 旅行规划师项目的 Docker 镜像文件。

## 📦 镜像文件

- `backend.tar` (645MB) - 后端服务镜像
- `frontend.tar` (53MB) - 前端服务镜像

## 🚀 快速使用

### 方法一：加载镜像并使用 docker-compose 启动（推荐）

```bash
# 1. 加载镜像
docker load -i docker-images/backend.tar
docker load -i docker-images/frontend.tar

# 2. 使用 docker-compose 启动所有服务
docker-compose up -d

# 3. 访问应用
# 前端: http://localhost
# 后端: http://localhost:3000
```

### 方法二：手动启动容器

```bash
# 1. 加载镜像
docker load -i docker-images/backend.tar
docker load -i docker-images/frontend.tar

# 2. 创建网络
docker network create travel-planner-network

# 3. 启动数据库
docker run -d \
  --name travel-planner-db \
  --network travel-planner-network \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=travel_planner \
  postgres:16-alpine

# 4. 启动后端（等待数据库启动后）
sleep 10
docker run -d \
  --name travel-planner-backend \
  --network travel-planner-network \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:postgres@travel-planner-db:5432/travel_planner?schema=public" \
  -e JWT_SECRET="your-secret-key-change-this" \
  -e JWT_EXPIRES_IN="7d" \
  -e PORT=3000 \
  -e NODE_ENV=production \
  aitravelplanner-backend:latest

# 5. 启动前端
docker run -d \
  --name travel-planner-frontend \
  --network travel-planner-network \
  -p 80:80 \
  aitravelplanner-frontend:latest
```

## 📋 验证安装

```bash
# 查看容器状态
docker ps

# 测试后端
curl http://localhost:3000/health
# 应返回: {"status":"ok","message":"Server is running"}

# 访问前端
# 在浏览器打开: http://localhost
```

## 🔑 默认测试账号

- 邮箱: test@example.com
- 密码: password123

## 📝 功能说明

### 1. 智能行程规划
- 支持语音或文字输入旅行需求
- AI 自动生成个性化旅行路线
- 需要配置 OpenRouter API Key（在应用的"设置"页面）

### 2. 费用预算管理
- 记录旅行开销
- 支持语音快速记录
- 实时预算使用情况

### 3. 用户管理
- 注册登录系统
- 多份旅行计划管理
- 云端数据同步

## 🔧 常用命令

### 查看日志
```bash
docker logs travel-planner-backend
docker logs travel-planner-frontend
docker logs travel-planner-db
```

### 重启服务
```bash
docker restart travel-planner-backend
docker restart travel-planner-frontend
```

### 停止服务
```bash
docker stop travel-planner-backend travel-planner-frontend travel-planner-db
```

### 清理容器
```bash
docker rm travel-planner-backend travel-planner-frontend travel-planner-db
docker network rm travel-planner-network
```

## 📊 镜像信息

### 后端镜像 (aitravelplanner-backend:latest)
- **大小**: 645MB
- **基础镜像**: node:20-slim
- **包含**:
  - Node.js 20 运行时
  - Express.js 应用
  - Prisma ORM
  - OpenRouter AI 集成
  - 所有依赖包

### 前端镜像 (aitravelplanner-frontend:latest)
- **大小**: 53MB
- **基础镜像**: nginx:alpine
- **包含**:
  - React 18 构建产物
  - Nginx 配置
  - 所有静态资源

## ⚠️ 注意事项

1. **数据库**: 使用官方 PostgreSQL 16 镜像（需要单独拉取）
   ```bash
   docker pull postgres:16-alpine
   ```

2. **端口**: 确保以下端口未被占用
   - 80: 前端服务
   - 3000: 后端 API
   - 5432: PostgreSQL（如果需要外部访问）

3. **环境变量**: 生产环境请修改 JWT_SECRET

4. **API Key**: 在应用设置页面配置 OpenRouter API Key 以启用 AI 功能

## 🐛 故障排查

### 问题 1: 后端无法连接数据库
```bash
# 确保数据库容器已启动并健康
docker ps | grep travel-planner-db

# 检查网络连接
docker network inspect travel-planner-network
```

### 问题 2: 前端无法访问后端
```bash
# 检查后端是否运行
curl http://localhost:3000/health

# 查看后端日志
docker logs travel-planner-backend
```

### 问题 3: 镜像加载失败
```bash
# 确认文件完整性
ls -lh docker-images/

# 重新加载镜像
docker load -i docker-images/backend.tar --quiet
docker load -i docker-images/frontend.tar --quiet
```

## 📞 技术支持

如遇问题，请查看：
- 项目 README.md
- SUCCESS.md - 运行指南
- SUBMISSION_GUIDE.md - 提交指南

## 🎯 版本信息

- **项目版本**: v2.0
- **构建日期**: 2024-11-04
- **Node.js**: 20.19.5
- **PostgreSQL**: 16-alpine
- **React**: 18.2.0

---

**祝使用愉快！** 🎉

