# AI Travel Planner - Backend

后端服务基于 Express.js + TypeScript + Prisma + PostgreSQL。

## 目录结构

```
backend/
├── src/
│   ├── config/           # 配置文件
│   │   ├── database.ts   # Prisma 客户端
│   │   └── jwt.ts        # JWT 配置
│   ├── controllers/      # 控制器
│   │   └── authController.ts
│   ├── middleware/       # 中间件
│   │   └── auth.ts       # JWT 认证中间件
│   ├── routes/          # 路由
│   │   └── authRoutes.ts
│   └── index.ts         # 应用入口
├── prisma/
│   ├── schema.prisma    # 数据模型
│   └── migrations/      # 数据库迁移
├── Dockerfile
├── package.json
└── tsconfig.json
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travel_planner?schema=public"
JWT_SECRET="your-secret-key-change-this"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
```

## 本地开发

```bash
# 安装依赖
npm install

# 生成 Prisma 客户端
npx prisma generate

# 运行数据库迁移
npx prisma migrate deploy

# 启动开发服务器
npm run dev
```

## 构建和部署

```bash
# 编译 TypeScript
npm run build

# 运行生产服务器
npm start
```

## API 端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息（需要认证）
- `GET /health` - 健康检查

