# Docker 连接超时解决方案

## 问题原因
Docker Hub 连接超时，无法拉取镜像（常见于中国大陆网络环境）

## 解决方案（选择其一）

### 方案一：配置 Docker 镜像加速器（推荐）

#### 对于 Docker Desktop（Windows/WSL2）

1. 打开 Docker Desktop
2. 点击 Settings (齿轮图标)
3. 选择 "Docker Engine"
4. 在 JSON 配置中添加：

```json
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}
```

5. 点击 "Apply & Restart"

#### 对于 Linux Docker

```bash
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'JSON'
{
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://docker.nju.edu.cn",
    "https://mirror.ccs.tencentyun.com",
    "https://registry.docker-cn.com"
  ]
}
JSON
sudo systemctl daemon-reload
sudo systemctl restart docker
```

### 方案二：使用离线构建（如果方案一不行）

直接使用阿里云或其他国内镜像源的基础镜像

```bash
# 在项目目录执行
docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/node:20-slim
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/node:20-slim node:20-slim

docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/node:20-alpine
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/node:20-alpine node:20-alpine

docker pull registry.cn-hangzhou.aliyuncs.com/google_containers/postgres:16-alpine
docker tag registry.cn-hangzhou.aliyuncs.com/google_containers/postgres:16-alpine postgres:16-alpine
```

### 方案三：手动下载镜像（最后选择）

如果以上都不行，可以：
1. 使用 VPN/代理
2. 或从其他能访问 Docker Hub 的机器上导出镜像再导入

---

## 配置完成后，重新构建

```bash
cd /home/stan/code/AITravelPlanner

# 清理旧容器和镜像
docker-compose down
docker system prune -f

# 重新构建
docker-compose up -d --build
```

---

## 验证镜像加速器是否生效

```bash
docker info | grep -A 10 "Registry Mirrors"
```

应该看到配置的镜像源列表。

