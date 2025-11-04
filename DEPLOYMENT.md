# 部署指南

本文档详细说明如何将 AI 旅行规划师部署到生产环境。

## 目录

1. [使用 Docker Compose 部署（推荐）](#使用-docker-compose-部署)
2. [使用阿里云镜像仓库](#使用阿里云镜像仓库)
3. [配置 GitHub Actions 自动部署](#配置-github-actions-自动部署)
4. [生产环境配置](#生产环境配置)
5. [常见问题](#常见问题)

## 使用 Docker Compose 部署

### 1. 服务器要求

- 操作系统: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- 内存: 最低 2GB，推荐 4GB+
- 存储: 最低 20GB
- Docker: 20.10+
- Docker Compose: 2.0+

### 2. 安装 Docker 和 Docker Compose

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash

# 启动 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 安装 Docker Compose（如果未安装）
sudo curl -L "https://github.com/docker/compose/releases/download/v2.23.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 3. 部署步骤

```bash
# 1. 克隆项目
git clone <repository-url>
cd AITravelPlanner

# 2. 配置环境变量
cat > .env << EOF
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
EOF

# 3. 启动服务
docker-compose up -d

# 4. 查看服务状态
docker-compose ps

# 5. 查看日志
docker-compose logs -f
```

### 4. 验证部署

```bash
# 检查后端健康状态
curl http://localhost:3000/health

# 检查前端访问
curl -I http://localhost

# 测试注册接口
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

## 使用阿里云镜像仓库

### 1. 创建阿里云镜像仓库

1. 登录阿里云控制台
2. 进入容器镜像服务
3. 创建命名空间（如 `aitravel`）
4. 创建镜像仓库：
   - `ai-travel-planner-backend`
   - `ai-travel-planner-frontend`

### 2. 构建和推送镜像

```bash
# 登录阿里云镜像仓库
docker login --username=<your-username> registry.cn-hangzhou.aliyuncs.com

# 构建后端镜像
cd backend
docker build -t registry.cn-hangzhou.aliyuncs.com/aitravel/ai-travel-planner-backend:latest .
docker push registry.cn-hangzhou.aliyuncs.com/aitravel/ai-travel-planner-backend:latest

# 构建前端镜像
cd ../frontend
docker build -t registry.cn-hangzhou.aliyuncs.com/aitravel/ai-travel-planner-frontend:latest .
docker push registry.cn-hangzhou.aliyuncs.com/aitravel/ai-travel-planner-frontend:latest
```

### 3. 从镜像仓库部署

修改 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    # ... 其他配置保持不变

  backend:
    image: registry.cn-hangzhou.aliyuncs.com/aitravel/ai-travel-planner-backend:latest
    # ... 其他配置保持不变

  frontend:
    image: registry.cn-hangzhou.aliyuncs.com/aitravel/ai-travel-planner-frontend:latest
    # ... 其他配置保持不变
```

然后运行：

```bash
docker-compose pull
docker-compose up -d
```

## 配置 GitHub Actions 自动部署

### 1. 配置 GitHub Secrets

在 GitHub 仓库的 Settings > Secrets and variables > Actions 中添加以下 secrets：

- `ALIYUN_REGISTRY`: 阿里云镜像仓库地址，如 `registry.cn-hangzhou.aliyuncs.com`
- `ALIYUN_NAMESPACE`: 您的命名空间，如 `aitravel`
- `ALIYUN_USERNAME`: 阿里云镜像仓库用户名
- `ALIYUN_PASSWORD`: 阿里云镜像仓库密码

### 2. 触发自动构建

GitHub Actions 工作流已配置为在以下情况下自动触发：

- 推送到 `main` 或 `master` 分支
- 创建新的版本标签（如 `v1.0.0`）
- 创建 Pull Request

```bash
# 推送代码触发构建
git push origin main

# 创建版本标签触发构建
git tag v1.0.0
git push origin v1.0.0
```

### 3. 在服务器上更新

```bash
# 拉取最新镜像
docker-compose pull

# 重启服务
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

## 生产环境配置

### 1. 配置 HTTPS（使用 Nginx + Let's Encrypt）

安装 Certbot：

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

修改 `frontend/nginx.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

获取 SSL 证书：

```bash
sudo certbot --nginx -d your-domain.com
```

### 2. 配置防火墙

```bash
# 允许 HTTP 和 HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 如果需要直接访问后端（不推荐在生产环境）
sudo ufw allow 3000/tcp

# 启用防火墙
sudo ufw enable
```

### 3. 设置自动备份

创建备份脚本 `/usr/local/bin/backup-travel-planner.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/backup/travel-planner"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
docker exec travel-planner-db pg_dump -U postgres travel_planner > $BACKUP_DIR/db_backup_$DATE.sql

# 压缩备份
gzip $BACKUP_DIR/db_backup_$DATE.sql

# 删除 7 天前的备份
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/db_backup_$DATE.sql.gz"
```

设置定时任务：

```bash
# 编辑 crontab
sudo crontab -e

# 添加每天凌晨 2 点执行备份
0 2 * * * /usr/local/bin/backup-travel-planner.sh >> /var/log/travel-planner-backup.log 2>&1
```

### 4. 配置监控和日志

安装日志轮转：

```bash
cat > /etc/logrotate.d/docker-compose << EOF
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    missingok
    delaycompress
    copytruncate
}
EOF
```

### 5. 性能优化

修改 `docker-compose.yml` 添加资源限制：

```yaml
services:
  backend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M

  frontend:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 256M
        reservations:
          cpus: '0.25'
          memory: 128M

  postgres:
    # ... 其他配置
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 常见问题

### 1. 端口被占用

```bash
# 查看端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000

# 修改 docker-compose.yml 中的端口映射
ports:
  - "8080:80"  # 使用 8080 端口
```

### 2. 数据库连接失败

```bash
# 检查数据库容器状态
docker-compose logs postgres

# 检查数据库是否就绪
docker exec travel-planner-db pg_isready -U postgres

# 重启数据库
docker-compose restart postgres
```

### 3. 前端无法连接后端

检查 Nginx 配置：

```bash
# 进入前端容器
docker exec -it travel-planner-frontend sh

# 测试后端连接
wget -O- http://backend:3000/health
```

### 4. 内存不足

```bash
# 查看容器资源使用情况
docker stats

# 清理未使用的资源
docker system prune -a

# 增加 swap 空间
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### 5. 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 或从镜像仓库更新
docker-compose pull
docker-compose up -d
```

## 维护命令

```bash
# 查看所有服务状态
docker-compose ps

# 查看日志
docker-compose logs -f [service-name]

# 重启服务
docker-compose restart [service-name]

# 停止服务
docker-compose stop

# 停止并删除容器
docker-compose down

# 停止并删除所有数据（谨慎使用！）
docker-compose down -v

# 进入容器
docker exec -it travel-planner-backend sh
docker exec -it travel-planner-frontend sh
docker exec -it travel-planner-db psql -U postgres

# 数据库备份
docker exec travel-planner-db pg_dump -U postgres travel_planner > backup.sql

# 数据库恢复
docker exec -i travel-planner-db psql -U postgres travel_planner < backup.sql
```

## 安全建议

1. ✅ 使用强随机的 JWT_SECRET
2. ✅ 修改默认数据库密码
3. ✅ 配置 HTTPS
4. ✅ 限制数据库端口访问（不要暴露 5432 端口）
5. ✅ 定期更新 Docker 镜像
6. ✅ 配置防火墙规则
7. ✅ 设置日志轮转
8. ✅ 定期备份数据库
9. ✅ 使用 Docker 资源限制
10. ✅ 监控应用性能和错误

---

如有问题，请查看项目 README 或提交 Issue。

