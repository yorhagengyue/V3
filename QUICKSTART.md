# 🚀 Pixel Canvas for Change - 快速启动指南

## 前置要求

- Node.js 18+ 
- Docker & Docker Compose
- npm/pnpm

## 快速启动（5 分钟）

### 1. 安装依赖

```bash
npm install
# 或
pnpm install
```

### 2. 启动数据库

```bash
docker-compose up -d
```

等待 PostgreSQL 启动完成（约 10 秒）

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npx prisma generate

# 运行数据库迁移
npx prisma migrate dev --name init

# 填充种子数据
npm run db:seed
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 访问应用

打开浏览器访问: http://localhost:3000

## 默认测试账号

种子数据已创建以下用户：

- **Alice** - alice@example.com (50 代币)
- **Bob** - bob@example.com (30 代币)

## 主要功能

### ✅ 已实现

- [x] Gmail 验证码登录（开发模式下验证码显示在控制台）
- [x] 100×100 像素画布
- [x] 16 色调色板
- [x] 模拟捐款系统
- [x] 像素放置 + 5 分钟冷却
- [x] 排行榜（Top 10）
- [x] 像素历史跟踪
- [x] 代币系统
- [x] 成就系统（数据库）

### 🔨 开发模式特性

- **邮件验证码**：控制台显示，无需真实 Gmail 配置
- **模拟捐款**：无需真实支付，直接获得代币
- **即时刷新**：10 秒自动刷新画布

## 数据库管理

### 查看数据库

```bash
npx prisma studio
```

在浏览器打开 http://localhost:5555 查看和编辑数据

### 重置数据库

```bash
npm run db:reset
```

### 查看数据库日志

```bash
docker-compose logs -f postgres
```

## 项目结构

```
BuildingBlocs/
├── app/
│   ├── api/                 # API 路由
│   │   ├── auth/           # 认证接口
│   │   ├── donations/      # 捐款接口
│   │   ├── pixels/         # 像素接口
│   │   ├── projects/       # 项目接口
│   │   ├── tokens/         # 代币接口
│   │   └── leaderboard/    # 排行榜接口
│   ├── canvas/[id]/        # 画布页面
│   ├── login/              # 登录页面
│   ├── layout.tsx          # 布局
│   ├── page.tsx            # 首页
│   └── globals.css         # 全局样式
├── components/
│   ├── PixelCanvas.tsx     # 画布组件
│   ├── ColorPalette.tsx    # 调色板组件
│   └── TokenDisplay.tsx    # 代币显示组件
├── lib/
│   ├── prisma.ts           # Prisma 客户端
│   ├── auth.ts             # 认证工具
│   └── email.ts            # 邮件工具
├── prisma/
│   ├── schema.prisma       # 数据库 Schema
│   └── seed.ts             # 种子数据
└── docker-compose.yml      # 数据库配置
```

## 常用命令

```bash
# 开发
npm run dev

# 数据库迁移
npx prisma migrate dev

# 查看数据库
npx prisma studio

# 重置数据库
npm run db:reset

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

## 环境变量

查看 `.env` 文件配置：

- `DATABASE_URL` - PostgreSQL 连接字符串
- `NEXTAUTH_SECRET` - 会话密钥
- `GMAIL_USER` - Gmail 邮箱（可选）
- `GMAIL_APP_PASSWORD` - Gmail 应用密码（可选）

## 测试流程

### 1. 注册/登录

1. 访问 http://localhost:3000
2. 点击"登录/注册"
3. 输入任意邮箱
4. 查看控制台获取验证码
5. 输入验证码和用户名完成注册

### 2. 获取代币

1. 进入画布页面
2. 点击"获取代币"
3. 输入捐款金额（模拟）
4. 确认获得代币

### 3. 放置像素

1. 选择颜色
2. 点击画布
3. 输入留言（可选）
4. 等待 5 分钟冷却

### 4. 查看排行榜

点击右上角"🏆 排行榜"查看 Top 10

## 故障排除

### 数据库连接失败

```bash
# 检查 Docker 状态
docker-compose ps

# 重启数据库
docker-compose restart

# 查看日志
docker-compose logs postgres
```

### Prisma 错误

```bash
# 重新生成客户端
npx prisma generate

# 同步数据库
npx prisma db push
```

### 端口冲突

```bash
# 修改端口
PORT=3001 npm run dev
```

## 部署到 Vercel

```bash
# 1. 推送到 GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 2. 连接 Vercel
vercel

# 3. 配置环境变量
- DATABASE_URL (使用云数据库如 Neon、Supabase)
- NEXTAUTH_SECRET
```

## 技术栈

- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **Auth**: 自实现 Gmail 验证码
- **Deployment**: Vercel

## 支持

遇到问题？

1. 查看 [CLAUDE.md](./CLAUDE.md) 了解项目详情
2. 查看 [docs/NEXTJS_QUICKSTART.md](./docs/NEXTJS_QUICKSTART.md)
3. 查看 [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

**Pixel Canvas for Change** - 用像素艺术，拯救世界 🌍💚

