# AI Travel Planner - Frontend

前端应用基于 React + TypeScript + Vite + Ant Design。

## 目录结构

```
frontend/
├── src/
│   ├── components/       # 可复用组件
│   │   └── ProtectedRoute.tsx
│   ├── contexts/        # React Context
│   │   └── AuthContext.tsx
│   ├── pages/          # 页面组件
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   └── Dashboard.tsx
│   ├── services/       # API 服务
│   │   ├── api.ts
│   │   └── authService.ts
│   ├── App.tsx         # 根组件
│   └── main.tsx        # 入口文件
├── index.html
├── vite.config.ts
└── package.json
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_API_URL=http://localhost:3000
```

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 在浏览器中打开 http://localhost:5173
```

## 构建和部署

```bash
# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 页面路由

- `/login` - 登录页面
- `/register` - 注册页面
- `/dashboard` - 用户仪表板（需要认证）
- `/` - 重定向到仪表板

## 功能特性

- ✅ 用户注册和登录
- ✅ JWT Token 认证
- ✅ 受保护的路由
- ✅ 响应式设计
- ✅ 表单验证
- ✅ 错误处理
- ✅ 加载状态

