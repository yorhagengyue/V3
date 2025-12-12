# 🚀 START HERE - 开始使用指南

欢迎来到 **Pixel Canvas for Change** - 用像素艺术拯救世界的公益平台！

## ⚡ 快速开始（5 分钟）

### Windows 用户

1. 在项目根目录打开 PowerShell
2. 运行自动化脚本：

```powershell
.\setup.ps1
```

### Mac/Linux 用户

1. 在项目根目录打开终端
2. 运行自动化脚本：

```bash
./setup.sh
```

### 手动启动

如果脚本失败，可以手动执行：

```bash
# 1. 安装依赖
npm install

# 2. 启动数据库
docker-compose up -d

# 3. 等待 15 秒后初始化数据库
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed

# 4. 启动服务
npm run dev
```

## 🌐 访问应用

启动后访问: **http://localhost:3000**

## 🎮 使用流程

### 1. 登录/注册

- 点击"登录/注册"
- 输入任意邮箱（如 `test@example.com`）
- 查看**控制台**获取验证码（开发模式）
- 输入验证码和用户名完成注册

### 2. 进入画布

- 从首页选择项目"拯救亚马逊雨林"
- 进入画布创作页面

### 3. 获取代币

- 点击"获取代币"按钮
- 输入捐款金额（模拟，无需真实支付）
- 获得像素代币

### 4. 放置像素

- 选择一个颜色
- 点击画布上的空白位置
- 可选：输入留言
- 确认放置
- 等待 5 分钟冷却

### 5. 查看排行榜

- 点击右上角"🏆 排行榜"
- 查看 Top 10 贡献者

## 📦 项目结构

```
BuildingBlocs/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由（9个接口）
│   ├── canvas/[id]/       # 画布页面
│   ├── login/             # 登录页面
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── PixelCanvas.tsx   # 画布组件
│   ├── ColorPalette.tsx  # 调色板组件
│   └── TokenDisplay.tsx  # 代币显示
├── lib/                   # 工具库
│   ├── prisma.ts         # 数据库客户端
│   ├── auth.ts           # 认证工具
│   └── email.ts          # 邮件工具
├── prisma/                # 数据库
│   ├── schema.prisma     # Schema（10个表）
│   └── seed.ts           # 种子数据
├── docker-compose.yml     # PostgreSQL 配置
├── setup.sh / setup.ps1   # 一键启动脚本
├── QUICKSTART.md          # 详细启动指南
└── PROJECT_STATUS.md      # 完成状态
```

## 🎯 核心功能

✅ **已实现的 MVP 功能**

- Gmail 验证码登录（开发模式）
- 100×100 像素画布
- 16 色调色板
- 模拟捐款系统
- 像素放置 + 5 分钟冷却
- 排行榜（Top 10）
- 像素历史跟踪
- 代币系统
- 成就系统（数据库）

## 🛠️ 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 数据库
npx prisma studio        # 可视化查看数据库
npx prisma migrate dev   # 创建新迁移
npm run db:seed          # 重新填充种子数据
npm run db:reset         # 重置数据库

# Docker
docker-compose up -d     # 启动数据库
docker-compose down      # 停止数据库
docker-compose logs      # 查看日志
```

## 📖 文档索引

- **[QUICKSTART.md](./QUICKSTART.md)** - 详细启动指南
- **[PROJECT_STATUS.md](./PROJECT_STATUS.md)** - 项目完成状态
- **[CLAUDE.md](./CLAUDE.md)** - 项目核心规范
- **[docs/README.md](./docs/README.md)** - 项目概览
- **[docs/NEXTJS_QUICKSTART.md](./docs/NEXTJS_QUICKSTART.md)** - Next.js 快速指南
- **[docs/NEXTJS_STACK.md](./docs/NEXTJS_STACK.md)** - 技术栈详解

## 💡 测试账户

种子数据已创建：

| 用户名 | 邮箱 | 代币 | 状态 |
|--------|------|------|------|
| alice | alice@example.com | 50 | ✅ 可用 |
| bob | bob@example.com | 30 | ✅ 可用 |

**或者注册新用户**（推荐）：
- 使用任意邮箱
- 验证码会显示在**控制台**
- 自定义用户名

## 🔧 故障排除

### 数据库连接失败

```bash
# 检查 Docker
docker-compose ps

# 重启数据库
docker-compose restart

# 查看日志
docker-compose logs postgres
```

### 端口被占用

```bash
# 使用不同端口
PORT=3001 npm run dev
```

### Prisma 错误

```bash
# 重新生成
npx prisma generate

# 同步数据库
npx prisma db push
```

## 🎨 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 15 + React 19 |
| 样式 | Tailwind CSS |
| 后端 | Next.js API Routes |
| 数据库 | PostgreSQL + Prisma |
| 认证 | 自实现 Gmail 验证码 |
| 部署 | Vercel (Ready) |

## 🌟 特色亮点

### 1. 创新的公益模式
r/place 风格 + 真实公益捐款

### 2. 游戏化体验
代币系统、冷却机制、排行榜、成就

### 3. 开发友好
模拟模式、完整种子数据、一键启动

### 4. 生产就绪
完整数据库、API 设计、类型安全

## 📊 项目状态

- ✅ MVP 完成
- ✅ 所有核心功能实现
- ✅ 文档完整
- ✅ 可部署到 Vercel
- ✅ Hackathon 就绪

## 🚀 部署到生产

### Vercel（推荐）

1. 推送代码到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量：
   - `DATABASE_URL`（使用 Neon/Supabase）
   - `NEXTAUTH_SECRET`
4. 自动部署

### 其他平台

- Railway
- Render
- Fly.io

## 📞 支持

遇到问题？

1. 查看 [QUICKSTART.md](./QUICKSTART.md)
2. 查看 [PROJECT_STATUS.md](./PROJECT_STATUS.md)
3. 检查控制台错误信息
4. 查看 Docker 日志

## 🎉 开始创作

一切准备就绪！现在你可以：

1. ✅ 运行 `npm run dev`
2. ✅ 访问 http://localhost:3000
3. ✅ 注册账户并开始创作
4. ✅ 用像素艺术，拯救世界！

---

**Pixel Canvas for Change** 🌍💚  
*Every pixel makes a difference*

