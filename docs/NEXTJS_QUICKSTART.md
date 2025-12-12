# Next.js 快速启动指南

## 30 分钟搭建完整项目

### 准备工作

1. **Node.js 18+**
   ```bash
   node --version  # 确保 >= 18
   ```

2. **PostgreSQL**
   - 使用 Docker（推荐）
   - 或本地安装

3. **代码编辑器**
   - VS Code + Prisma 扩展（推荐）

---

## Step 1: 创建 Next.js 项目（3 分钟）

```bash
# 创建项目
npx create-next-app@latest pixel-canvas-for-change

# 配置选项：
# ✔ Would you like to use TypeScript? Yes
# ✔ Would you like to use ESLint? Yes
# ✔ Would you like to use Tailwind CSS? Yes
# ✔ Would you like to use `src/` directory? No
# ✔ Would you like to use App Router? Yes
# ✔ Would you like to customize the default import alias? No

cd pixel-canvas-for-change
```

---

## Step 2: 安装依赖（2 分钟）

```bash
# Prisma
npm install prisma @prisma/client

# 其他依赖
npm install nodemailer
npm install -D @types/nodemailer

# 初始化 Prisma
npx prisma init
```

这会创建：
- `prisma/schema.prisma` - Schema 文件
- `.env` - 环境变量

---

## Step 3: 配置数据库（5 分钟）

### 使用 Docker（推荐）

创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: pixel-canvas-db
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: pixel_canvas
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

启动数据库：
```bash
docker-compose up -d
```

### 配置环境变量

编辑 `.env`:

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/pixel_canvas?schema=public"

# Auth
NEXTAUTH_SECRET="your-secret-key-here"  # 运行: openssl rand -base64 32

# Email (Gmail)
GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-app-password"

# Every.org API (可选)
EVERYORG_API_KEY="your-api-key"
```

---

## Step 4: 创建 Prisma Schema（5 分钟）

将 `docs/NEXTJS_STACK.md` 中的完整 Schema 复制到 `prisma/schema.prisma`

或者手动创建核心表：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Project {
  id           String   @id @default(cuid())
  title        String
  description  String   @db.Text
  targetAmount Decimal  @default(10000) @db.Decimal(10, 2)
  amountRaised Decimal  @default(0) @db.Decimal(10, 2)
  gridSize     Int      @default(100)
  pixelsTotal  Int      @default(10000)
  pixelsPlaced Int      @default(0)
  status       Status   @default(ACTIVE)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  pixels       Pixel[]
  userTokens   UserTokens[]
  colorPalette ColorPalette?
}

enum Status {
  ACTIVE
  PAUSED
  COMPLETED
}

model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  sessionId String?  @unique
  createdAt DateTime @default(now())

  userTokens UserTokens[]
  donations  Donation[]
}

model UserTokens {
  id            String    @id @default(cuid())
  userId        String
  projectId     String
  balance       Int       @default(0)
  totalEarned   Int       @default(0)
  totalSpent    Int       @default(0)
  pixelsPlaced  Int       @default(0)
  totalDonated  Decimal   @default(0) @db.Decimal(10, 2)
  cooldownUntil DateTime?
  createdAt     DateTime  @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
}

model Pixel {
  id                 String    @id @default(cuid())
  projectId          String
  positionX          Int
  positionY          Int
  color              String
  contributorId      String?
  contributorName    String?
  contributorMessage String?   @db.VarChar(200)
  placedAt           DateTime  @default(now())
  timesOverwritten   Int       @default(0)

  project Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  history PixelHistory[]

  @@unique([projectId, positionX, positionY])
}

model PixelHistory {
  id                 String   @id @default(cuid())
  pixelId            String
  contributorId      String?
  contributorName    String?
  contributorMessage String?  @db.VarChar(200)
  color              String
  placedAt           DateTime @default(now())
  wasOverwrite       Boolean  @default(false)
  previousColor      String?

  pixel Pixel @relation(fields: [pixelId], references: [id], onDelete: Cascade)
}

model Donation {
  id            String         @id @default(cuid())
  projectId     String
  userId        String
  amount        Decimal        @db.Decimal(10, 2)
  pixelsAwarded Int
  message       String?        @db.VarChar(200)
  isSimulated   Boolean        @default(true)
  status        DonationStatus @default(SUCCESS)
  createdAt     DateTime       @default(now())

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])
}

enum DonationStatus {
  PENDING
  SUCCESS
  FAILED
}

model ColorPalette {
  id        String   @id @default(cuid())
  projectId String   @unique
  name      String?
  colors    Json
  createdAt DateTime @default(now())

  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

---

## Step 5: 运行数据库迁移（2 分钟）

```bash
# 生成迁移
npx prisma migrate dev --name init

# 生成 Prisma Client
npx prisma generate
```

---

## Step 6: 创建种子数据（5 分钟）

创建 `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始种子数据...');

  // 创建用户
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@example.com',
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@example.com',
    },
  });

  // 创建项目
  const project = await prisma.project.upsert({
    where: { id: 'project-rainforest' },
    update: {},
    create: {
      id: 'project-rainforest',
      title: '拯救亚马逊雨林',
      description: '用像素艺术记录我们对地球的承诺',
      targetAmount: 10000,
      gridSize: 100,
      pixelsTotal: 10000,
    },
  });

  // 创建调色板
  await prisma.colorPalette.upsert({
    where: { projectId: project.id },
    update: {},
    create: {
      projectId: project.id,
      name: 'Rainforest',
      colors: JSON.stringify([
        '#ffffff', '#e8f5e9', '#a5d6a7', '#66bb6a',
        '#43a047', '#2e7d32', '#1b5e20', '#8d6e63',
        '#6d4c41', '#5d4037', '#81d4fa', '#4fc3f7',
        '#039be5', '#ffd54f', '#ff6f00', '#212121',
      ]),
    },
  });

  // 给用户分配代币
  await prisma.userTokens.upsert({
    where: {
      userId_projectId: {
        userId: alice.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: alice.id,
      projectId: project.id,
      balance: 50,
      totalEarned: 50,
    },
  });

  await prisma.userTokens.upsert({
    where: {
      userId_projectId: {
        userId: bob.id,
        projectId: project.id,
      },
    },
    update: {},
    create: {
      userId: bob.id,
      projectId: project.id,
      balance: 50,
      totalEarned: 50,
    },
  });

  // 创建示例像素（小树）
  const treePixels = [
    { x: 50, y: 60, color: '#6d4c41', userId: alice.id },
    { x: 50, y: 61, color: '#6d4c41', userId: alice.id },
    { x: 49, y: 58, color: '#43a047', userId: bob.id },
    { x: 50, y: 58, color: '#43a047', userId: bob.id },
    { x: 51, y: 58, color: '#43a047', userId: bob.id },
  ];

  for (const tp of treePixels) {
    const user = tp.userId === alice.id ? alice : bob;
    await prisma.pixel.create({
      data: {
        projectId: project.id,
        positionX: tp.x,
        positionY: tp.y,
        color: tp.color,
        contributorId: tp.userId,
        contributorName: user.username,
        contributorMessage: '为地球添一抹绿！',
      },
    });
  }

  // 更新项目统计
  await prisma.project.update({
    where: { id: project.id },
    data: {
      pixelsPlaced: treePixels.length,
      uniquePixels: treePixels.length,
    },
  });

  console.log('种子数据创建完成！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

在 `package.json` 添加：

```json
{
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

安装 ts-node：
```bash
npm install -D ts-node
```

运行种子数据：
```bash
npx prisma db seed
```

---

## Step 7: 创建辅助工具（3 分钟）

### `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### `lib/auth.ts`

```typescript
import { cookies } from 'next/headers';
import { prisma } from './prisma';

export async function getServerSession() {
  const cookieStore = cookies();
  const sessionId = cookieStore.get('session_id')?.value;

  if (!sessionId) return null;

  const user = await prisma.user.findUnique({
    where: { sessionId },
  });

  if (!user) return null;

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
  };
}
```

---

## Step 8: 创建首页（5 分钟）

### `app/page.tsx`

```typescript
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const projects = await prisma.project.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4">
          Pixel Canvas for Change
        </h1>
        <p className="text-center text-gray-600 mb-12">
          用像素艺术，拯救世界
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/canvas/${project.id}`}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition"
            >
              <h2 className="text-2xl font-bold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-4">{project.description}</p>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full"
                  style={{
                    width: `${(project.pixelsPlaced / project.pixelsTotal) * 100}%`,
                  }}
                />
              </div>

              <p className="text-sm text-gray-600 mt-2">
                {project.pixelsPlaced} / {project.pixelsTotal} 像素
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 9: 启动开发服务器（1 分钟）

```bash
npm run dev
```

访问 http://localhost:3000

---

## Step 10: Prisma Studio（可选）

```bash
# 打开数据库可视化界面
npx prisma studio
```

访问 http://localhost:5555

---

## 常用命令

### 开发

```bash
# 启动开发服务器
npm run dev

# 启动数据库
docker-compose up -d

# 查看数据库
npx prisma studio
```

### 数据库

```bash
# 生成新迁移
npx prisma migrate dev --name <migration_name>

# 重置数据库
npx prisma migrate reset

# 运行种子数据
npx prisma db seed

# 查看数据库状态
npx prisma migrate status
```

### 部署

```bash
# 生产构建
npm run build

# 本地预览
npm run start

# 部署到 Vercel
vercel --prod
```

---

## 部署到 Vercel

### 1. 推送到 GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. 连接 Vercel

1. 访问 https://vercel.com
2. 导入 GitHub 仓库
3. 配置环境变量：
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=...
   ```

### 3. 配置数据库

使用 Vercel Postgres 或外部数据库（Railway, Neon 等）

### 4. 部署

点击 Deploy，Vercel 会自动：
- 安装依赖
- 运行 Prisma generate
- 构建项目
- 部署

---

## 故障排除

### PostgreSQL 连接失败

```bash
# 检查 Docker 容器
docker ps

# 重启容器
docker-compose restart

# 查看日志
docker-compose logs postgres
```

### Prisma Client 未生成

```bash
npx prisma generate
```

### 端口占用

```bash
# 更改端口
PORT=3001 npm run dev
```

### 迁移失败

```bash
# 重置数据库
npx prisma migrate reset

# 重新迁移
npx prisma migrate dev
```

---

## 下一步

1. **完成 API Routes** - 参考 `docs/NEXTJS_STACK.md`
2. **创建画布页面** - 实现 PixelCanvas 组件
3. **添加认证** - Gmail 验证码登录
4. **集成 Every.org** - 真实公益项目数据

---

**版本**: V3.0 (Next.js + Prisma)
**最后更新**: 2025-12-12
**预计完成时间**: 30-60 分钟
