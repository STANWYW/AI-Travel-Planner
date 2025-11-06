#!/bin/bash
set -e

# 等待数据库就绪
echo "等待数据库连接..."
until PGPASSWORD=$POSTGRES_PASSWORD psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" > /dev/null 2>&1; do
  echo "数据库未就绪，等待中..."
  sleep 2
done

echo "数据库已就绪"

# 运行数据库迁移
cd /app/backend
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"
npx prisma migrate deploy

# 启动后端（后台运行）
cd /app/backend
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:5432/${POSTGRES_DB}?schema=public"
node dist/index.js &

# 启动 Nginx（前台运行）
nginx -g "daemon off;"

