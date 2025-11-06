# Docker 镜像使用指南

## 📦 镜像文件位置

Docker 镜像已保存在 `docker-images/` 目录：

```
docker-images/
├── backend.tar          # 后端镜像 (645MB)
├── frontend.tar         # 前端镜像 (53MB)
├── LOAD_IMAGES.sh       # 一键加载脚本
└── README.md            # 详细说明
```

**总大小**: 约 698MB

---

## 🚀 快速开始（给助教）

### 方法一：使用加载脚本（最简单）

```bash
# 1. 进入 docker-images 目录
cd docker-images

# 2. 运行加载脚本
bash LOAD_IMAGES.sh

# 3. 返回项目根目录
cd ..

# 4. 启动所有服务
docker-compose up -d

# 5. 访问应用
# 浏览器打开: http://localhost
```

### 方法二：手动加载

```bash
# 1. 加载镜像
docker load -i docker-images/backend.tar
docker load -i docker-images/frontend.tar
docker pull postgres:16-alpine

# 2. 启动服务
docker-compose up -d

# 3. 访问应用
# http://localhost
```

---

## ✅ 验证安装

```bash
# 查看镜像
docker images | grep aitravelplanner

# 查看运行的容器
docker-compose ps

# 测试后端
curl http://localhost:3000/health

# 应返回: {"status":"ok","message":"Server is running"}
```

---

## 🔑 测试账号

应用已内置测试账号：

- **邮箱**: test@example.com
- **密码**: password123

---

## 📝 API Key 配置说明

### OpenRouter API Key（用于 AI 功能）

1. 登录应用后，点击右上角"设置"
2. 输入 OpenRouter API Key
3. 格式：`sk-or-v1-...`

**重要提示**：
- 如果助教有阿里云百炼平台的 Key，也可以在此输入
- API Key 存储在服务器端数据库，不会暴露在前端
- **没有 API Key 可以先跳过**，应用其他功能仍可正常使用

### 可选 API Keys

- **科大讯飞语音识别**: 用于高级语音功能（可选）
- **高德/百度地图**: 用于地图展示（可选）

---

## 🎯 功能演示

### 1. 注册/登录
- 访问 http://localhost
- 使用测试账号登录或注册新账号

### 2. 创建旅行计划
- 点击"创建旅行计划"
- 填写旅行信息（目的地、日期、预算、人数）
- 可以使用"语音输入"按钮快速输入
- 提交创建

### 3. AI 生成行程（需要 API Key）
- 进入计划详情页
- 点击"AI 生成行程"
- AI 将自动生成详细的旅行路线

### 4. 管理费用
- 在计划详情页的"费用管理"部分
- 添加费用记录
- 支持手动输入或语音记录
- 实时查看预算使用情况

### 5. 查看所有计划
- 点击"我的计划"
- 查看、编辑、删除旅行计划

---

## 🔧 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 完全清理（包括数据）
docker-compose down -v
```

---

## 📊 镜像详细信息

### 后端镜像 (aitravelplanner-backend:latest)
- **大小**: 645MB
- **基础镜像**: node:20-slim
- **技术栈**: 
  - Node.js 20
  - Express.js
  - TypeScript
  - Prisma ORM
  - PostgreSQL 16
  - JWT 认证
  - OpenRouter AI 集成

### 前端镜像 (aitravelplanner-frontend:latest)
- **大小**: 53MB
- **基础镜像**: nginx:alpine
- **技术栈**: 
  - React 18
  - TypeScript
  - Ant Design 5
  - Vite 5
  - React Router v6

### 数据库
- **镜像**: postgres:16-alpine
- **自动拉取**: 运行 docker-compose 时自动下载

---

## 📦 分发方式

### 方式一：直接使用（本地）
- 镜像文件已保存在 `docker-images/` 目录
- 跟随项目一起提交

### 方式二：上传到云存储
```bash
# 可以打包压缩
tar -czf docker-images.tar.gz docker-images/

# 上传到网盘或云存储
# 下载后解压即可使用
```

### 方式三：推送到镜像仓库（可选）

如需推送到阿里云镜像仓库：

```bash
# 登录阿里云
docker login --username=<your-username> registry.cn-hangzhou.aliyuncs.com

# 打标签
docker tag aitravelplanner-backend:latest \
  registry.cn-hangzhou.aliyuncs.com/<namespace>/aitravelplanner-backend:latest

docker tag aitravelplanner-frontend:latest \
  registry.cn-hangzhou.aliyuncs.com/<namespace>/aitravelplanner-frontend:latest

# 推送
docker push registry.cn-hangzhou.aliyuncs.com/<namespace>/aitravelplanner-backend:latest
docker push registry.cn-hangzhou.aliyuncs.com/<namespace>/aitravelplanner-frontend:latest
```

---

## ⚠️ 注意事项

1. **文件大小**: 镜像文件约 698MB，确保有足够磁盘空间

2. **网络**: 首次运行需要下载 PostgreSQL 镜像（约 240MB）

3. **端口**: 确保以下端口未被占用：
   - 80: 前端
   - 3000: 后端
   - 5432: 数据库（内部使用）

4. **内存**: 建议至少 2GB 可用内存

5. **API Key**: 
   - 没有 OpenRouter API Key 时，可以正常使用其他功能
   - 仅 AI 生成行程功能需要 API Key

---

## 🐛 故障排查

### 问题 1: 镜像加载失败
```bash
# 检查文件完整性
ls -lh docker-images/

# 清理已有镜像后重新加载
docker rmi aitravelplanner-backend:latest
docker rmi aitravelplanner-frontend:latest
docker load -i docker-images/backend.tar
docker load -i docker-images/frontend.tar
```

### 问题 2: 容器无法启动
```bash
# 查看详细日志
docker-compose logs backend
docker-compose logs frontend

# 重新构建
docker-compose down
docker-compose up -d
```

### 问题 3: 数据库连接失败
```bash
# 等待数据库完全启动
docker-compose ps

# 数据库应显示 "healthy" 状态
# 如果没有，重启数据库
docker-compose restart postgres
```

---

## 📞 技术支持

详细文档：
- `README.md` - 项目主文档
- `SUCCESS.md` - 成功运行指南
- `SUBMISSION_GUIDE.md` - 提交指南
- `docker-images/README.md` - 镜像详细说明

---

## 🎓 作业提交说明

**已包含的内容**：
- ✅ Docker 镜像文件（backend.tar, frontend.tar）
- ✅ docker-compose.yml 配置
- ✅ 完整源代码
- ✅ README 文档
- ✅ 加载脚本

**助教使用流程**：
1. 克隆 GitHub 仓库
2. 进入 `docker-images` 目录
3. 运行 `bash LOAD_IMAGES.sh`
4. 返回项目根目录
5. 运行 `docker-compose up -d`
6. 访问 http://localhost

---

**预计加载时间**: 2-3 分钟  
**预计启动时间**: 30-60 秒

**祝评审顺利！** 🎉

