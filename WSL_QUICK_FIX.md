# WSL 环境快速修复指南

## 问题说明
您的 WSL 环境中使用的是 Windows 版本的 npm，导致路径不兼容。

## 🚀 立即可用的解决方案

### 方案 1：使用 Docker 运行前端（推荐，最简单）

前端容器已经在运行！直接访问：

```bash
# 访问前端应用
http://localhost
```

如果前端容器没运行，执行：

```bash
bash START_APP_DOCKER.sh
```

这会启动所有服务（包括前端），然后访问：**http://localhost**

---

### 方案 2：在 WSL 中安装 Linux 版本的 Node.js

```bash
# 1. 安装 nvm（Node Version Manager）
bash INSTALL_NODE_WSL.sh

# 2. 重新加载 shell
source ~/.bashrc

# 3. 验证安装
which npm
# 应该显示：/home/stan/.nvm/versions/node/...

# 4. 重新运行启动脚本
bash START_APP.sh
```

---

### 方案 3：在 Windows 中运行前端

如果您的 Windows 上已安装 Node.js：

1. 打开 Windows PowerShell 或 CMD
2. 进入项目目录：
   ```
   cd \\wsl$\Ubuntu-20.04\home\stan\code\AITravelPlanner\frontend
   ```
3. 运行：
   ```
   npm install
   npm run dev
   ```
4. 访问：http://localhost:5173

---

## 📋 推荐方案对比

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| Docker | 最简单，立即可用 | 首次构建需要3-5分钟 | ⭐⭐⭐⭐⭐ |
| WSL Node | 开发体验好，热重载 | 需要安装 | ⭐⭐⭐⭐ |
| Windows | 可能已有环境 | 跨系统访问慢 | ⭐⭐⭐ |

---

## ✅ 快速验证

### 检查后端是否运行
```bash
curl http://localhost:3000/health
```

应该返回：`{"status":"ok","message":"Server is running"}`

### 检查所有容器状态
```bash
docker-compose ps
```

应该看到：
- travel-planner-db (健康)
- travel-planner-backend (运行中)
- travel-planner-frontend (运行中)

---

## 🎯 现在就开始使用

**最简单的方式：**

```bash
# 如果前端容器没运行
bash START_APP_DOCKER.sh

# 等待 3-5 分钟后，访问
http://localhost
```

**测试账号：**
- 邮箱：test@example.com
- 密码：password123

---

## 📞 遇到问题？

### 问题 1：前端构建失败
```bash
# 重新构建
docker-compose down
docker-compose up -d --build
```

### 问题 2：端口被占用
```bash
# 检查 80 端口
sudo lsof -i :80
# 或更改 docker-compose.yml 中的端口映射
```

### 问题 3：容器无法启动
```bash
# 查看日志
docker-compose logs frontend
```

---

**推荐：现在就运行 `bash START_APP_DOCKER.sh`，3-5分钟后访问 http://localhost 开始使用！** 🚀

