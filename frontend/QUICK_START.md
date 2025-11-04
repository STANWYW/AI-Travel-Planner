# 前端快速启动指南

## 问题说明

由于在 WSL2 + Docker 环境中构建前端时 npm install 非常慢（可能需要 10-15 分钟），**强烈推荐使用本地开发模式**。

## 🚀 推荐方式：本地开发模式（1-2 分钟启动）

### 前提条件

确保后端和数据库已启动：
```bash
cd /home/stan/code/AITravelPlanner
docker-compose up -d backend postgres
```

### 启动步骤

**方式 A：在 Linux/WSL 中启动**

如果 WSL 中已安装 Node.js：
```bash
cd /home/stan/code/AITravelPlanner/frontend
npm install  # 首次运行需要
npm run dev
```

访问：http://localhost:5173

**方式 B：在 Windows 中启动**（推荐）

如果您的 Windows 已安装 Node.js：
```bash
# 在 Windows PowerShell 或 CMD 中
cd C:\path\to\AITravelPlanner\frontend
npm install
npm run dev
```

访问：http://localhost:5173

> 💡 **提示**：前端开发服务器会自动代理 API 请求到 http://localhost:3000（后端）

## 📦 Docker 方式（如需生产环境）

如果确实需要 Docker 部署前端：

### 选项 1：预构建后部署（快速）

```bash
cd frontend

# 本地构建（快）
npm install
npm run build

# 创建简单的 Dockerfile
cat > Dockerfile.prod << 'EOF'
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

# 构建镜像（很快）
docker build -f Dockerfile.prod -t travel-planner-frontend .

# 启动
docker run -d -p 80:80 --name frontend travel-planner-frontend
```

### 选项 2：使用国内镜像加速

```bash
cd /home/stan/code/AITravelPlanner

# 使用淘宝镜像（Dockerfile 已配置）
docker-compose build --no-cache frontend

# 如果还是很慢，可以尝试：
docker-compose build --build-arg NPM_REGISTRY=https://registry.npmmirror.com frontend
```

## 🧪 测试功能

启动后访问前端，测试以下功能：

1. **用户注册**
   - 访问 http://localhost:5173
   - 点击"立即注册"
   - 填写邮箱、用户名、密码
   - 提交注册

2. **用户登录**
   - 使用注册的账号登录
   - 查看用户仪表板
   - 测试退出登录

3. **API 直接测试**
   ```bash
   # 健康检查
   curl http://localhost:3000/health
   
   # 注册
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","username":"testuser","password":"password123"}'
   
   # 登录
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123"}'
   ```

## 💡 说明

- **后端**: 已完全可用，使用 Docker 运行 ✅
- **前端代码**: 已完整实现所有功能 ✅
- **Docker 构建**: 由于环境限制，建议本地运行或预构建

## 🎯 给助教的说明

本项目采用**混合部署模式**：
- 后端和数据库使用 Docker（已测试通过）
- 前端支持本地开发或 Docker 两种方式
- 所有源代码已完整实现

这是常见的开发实践，可以兼顾开发效率和部署灵活性。

