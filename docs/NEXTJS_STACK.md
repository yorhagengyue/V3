# Next.js 技术栈完整方案

## 技术架构

### Next.js 全栈部署

```
┌─────────────────────────────────────────────────┐
│           Next.js 15 App Router                 │
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │ Pages        │  │ API Routes   │            │
│  │ (React)      │→ │ (Backend)    │            │
│  │ + Tailwind   │  │              │            │
│  └──────────────┘  └──────────────┘            │
│                           ↓                     │
│                    ┌──────────────┐            │
│                    │ Prisma ORM   │            │
│                    └──────────────┘            │
│                           ↓                     │
│                    ┌──────────────┐            │
│                    │ PostgreSQL   │            │
│                    └──────────────┘            │
└─────────────────────────────────────────────────┘
```

### 技术栈

| 组件 | 技术选择 | 原因 |
|------|---------|------|
| **Frontend** | Next.js 15 + React 19 | App Router, Server Components |
| **Styling** | Tailwind CSS | 快速开发，响应式设计 |
| **Backend** | Next.js API Routes | 同框架，类型安全 |
| **ORM** | Prisma | 类型安全，自带迁移和可视化 |
| **Database** | PostgreSQL | 生产级，支持复杂查询 |
| **Auth** | 自实现 Gmail 验证码 | 简单，无需第三方服务 |
| **Deployment** | Vercel | 零配置，免费额度高 |

---

## Prisma Schema

### 完整 Schema 定义

`prisma/schema.prisma`:

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// 项目表
// ============================================
model Project {
  id          String   @id @default(cuid())
  title       String
  description String   @db.Text

  // Every.org 集成
  everyorgSlug     String?  @unique
  everyorgEin      String?
  everyorgLogoUrl  String?
  everyorgCoverUrl String?

  // 筹款目标
  targetAmount Decimal @default(10000) @db.Decimal(10, 2)
  amountRaised Decimal @default(0) @db.Decimal(10, 2)
  currency     String  @default("USD")

  // 画布配置
  gridSize     Int @default(100)
  pixelsTotal  Int @default(10000)

  // 统计
  pixelsPlaced      Int @default(0)
  uniquePixels      Int @default(0)
  totalContributors Int @default(0)

  // 状态
  status Status @default(ACTIVE)

  // 时间戳
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关系
  pixels          Pixel[]
  colorPalette    ColorPalette?
  userTokens      UserTokens[]
  donations       Donation[]

  @@index([status])
}

enum Status {
  ACTIVE
  PAUSED
  COMPLETED
}

// ============================================
// 像素表
// ============================================
model Pixel {
  id        String   @id @default(cuid())
  projectId String

  // 位置
  positionX Int
  positionY Int

  // 当前状态
  color              String
  contributorId      String?
  contributorName    String?
  contributorMessage String?  @db.VarChar(200)
  placedAt           DateTime @default(now())

  // 保护期（可选）
  protectedUntil DateTime?

  // 统计
  timesOverwritten Int @default(0)
  totalLikes       Int @default(0)

  // 关系
  project Project        @relation(fields: [projectId], references: [id], onDelete: Cascade)
  history PixelHistory[]

  @@unique([projectId, positionX, positionY])
  @@index([projectId])
}

// ============================================
// 像素历史表
// ============================================
model PixelHistory {
  id      String   @id @default(cuid())
  pixelId String

  contributorId      String?
  contributorName    String?
  contributorMessage String?  @db.VarChar(200)
  color              String
  placedAt           DateTime @default(now())

  wasOverwrite  Boolean @default(false)
  previousColor String?

  // 关系
  pixel Pixel @relation(fields: [pixelId], references: [id], onDelete: Cascade)

  @@index([pixelId, placedAt])
  @@index([placedAt])
}

// ============================================
// 用户表
// ============================================
model User {
  id       String  @id @default(cuid())
  username String  @unique
  email    String? @unique

  // Session
  sessionId String? @unique

  // 统计
  totalPixelsPlaced Int     @default(0)
  totalDonated      Decimal @default(0) @db.Decimal(10, 2)

  createdAt    DateTime @default(now())
  lastActiveAt DateTime @default(now())

  // 关系
  userTokens       UserTokens[]
  donations        Donation[]
  userAchievements UserAchievement[]

  @@index([email])
  @@index([sessionId])
}

// ============================================
// 用户代币表（每个项目独立）
// ============================================
model UserTokens {
  id        String @id @default(cuid())
  userId    String
  projectId String

  // 余额
  balance     Int @default(0)
  totalEarned Int @default(0)
  totalSpent  Int @default(0)

  // 统计
  pixelsPlaced Int     @default(0)
  totalDonated Decimal @default(0) @db.Decimal(10, 2)

  // 冷却
  lastPlacedAt  DateTime?
  cooldownUntil DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关系
  user         User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  project      Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  transactions TokenTransaction[]

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}

// ============================================
// 代币交易表
// ============================================
model TokenTransaction {
  id           String @id @default(cuid())
  userTokensId String

  type        TransactionType
  amount      Int
  description String?

  sourceType String?
  sourceId   String?

  balanceBefore Int
  balanceAfter  Int

  createdAt DateTime @default(now())

  // 关系
  userTokens UserTokens @relation(fields: [userTokensId], references: [id], onDelete: Cascade)

  @@index([userTokensId, createdAt])
}

enum TransactionType {
  EARN
  SPEND
  BONUS
  REFUND
}

// ============================================
// 捐款表
// ============================================
model Donation {
  id        String @id @default(cuid())
  projectId String
  userId    String

  amount         Decimal @db.Decimal(10, 2)
  pixelsAwarded  Int
  message        String? @db.VarChar(200)

  // 模拟标记
  isSimulated Boolean @default(true)

  // 真实捐款信息（未来）
  everyorgDonationId String?
  transactionId      String?

  status DonationStatus @default(SUCCESS)

  createdAt DateTime @default(now())

  // 关系
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([projectId])
  @@index([userId])
  @@index([createdAt])
}

enum DonationStatus {
  PENDING
  SUCCESS
  FAILED
}

// ============================================
// 调色板表
// ============================================
model ColorPalette {
  id        String @id @default(cuid())
  projectId String @unique

  name   String?
  colors Json // ["#ffffff", "#e4e4e4", ...]

  createdAt DateTime @default(now())

  // 关系
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
}

// ============================================
// 成就表
// ============================================
model Achievement {
  id   String @id @default(cuid())
  code String @unique

  title       String
  description String @db.Text
  iconUrl     String?
  tokenReward Int    @default(0)

  criteria Json // 成就解锁条件

  createdAt DateTime @default(now())

  // 关系
  userAchievements UserAchievement[]
}

// ============================================
// 用户成就表
// ============================================
model UserAchievement {
  id            String @id @default(cuid())
  userId        String
  achievementId String

  unlockedAt DateTime @default(now())

  // 关系
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)

  @@unique([userId, achievementId])
  @@index([userId])
}
```

---

## Next.js API Routes

### 项目相关 API

#### `app/api/projects/route.ts` - 获取所有项目

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        everyorgLogoUrl: true,
        everyorgCoverUrl: true,
        targetAmount: true,
        amountRaised: true,
        gridSize: true,
        pixelsTotal: true,
        pixelsPlaced: true,
        status: true,
        createdAt: true,
      },
    });

    const projectsWithProgress = projects.map(p => ({
      ...p,
      progressPercentage: Number((p.pixelsPlaced / p.pixelsTotal) * 100),
    }));

    return NextResponse.json({
      success: true,
      data: projectsWithProgress,
    });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

#### `app/api/projects/[id]/route.ts` - 获取项目详情

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        pixels: {
          select: {
            positionX: true,
            positionY: true,
            color: true,
            contributorName: true,
            placedAt: true,
          },
          orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
        },
        colorPalette: true,
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        progressPercentage: (project.pixelsPlaced / project.pixelsTotal) * 100,
        colorPalette: project.colorPalette ? JSON.parse(project.colorPalette.colors as string) : [],
      },
    });
  } catch (error) {
    console.error('Get project error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 捐款相关 API

#### `app/api/donations/simulate/route.ts` - 模拟捐款

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, amount, message } = await request.json();

    // 验证输入
    if (!projectId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    // 获取项目信息
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // 计算像素数
    const pixelsAwarded = Math.floor(
      (Number(amount) / Number(project.targetAmount)) * project.pixelsTotal
    );

    // 事务：创建捐款 + 更新代币
    const result = await prisma.$transaction(async (tx) => {
      // 1. 创建捐款记录
      const donation = await tx.donation.create({
        data: {
          projectId,
          userId: session.userId,
          amount,
          pixelsAwarded,
          message,
          isSimulated: true,
          status: 'SUCCESS',
        },
      });

      // 2. 更新或创建用户代币
      const existingTokens = await tx.userTokens.findUnique({
        where: {
          userId_projectId: {
            userId: session.userId,
            projectId,
          },
        },
      });

      let userTokens;
      if (existingTokens) {
        userTokens = await tx.userTokens.update({
          where: { id: existingTokens.id },
          data: {
            balance: { increment: pixelsAwarded },
            totalEarned: { increment: pixelsAwarded },
            totalDonated: { increment: amount },
          },
        });

        // 记录交易
        await tx.tokenTransaction.create({
          data: {
            userTokensId: existingTokens.id,
            type: 'EARN',
            amount: pixelsAwarded,
            description: `Simulated donation of $${amount}`,
            sourceType: 'donation',
            sourceId: donation.id,
            balanceBefore: existingTokens.balance,
            balanceAfter: existingTokens.balance + pixelsAwarded,
          },
        });
      } else {
        userTokens = await tx.userTokens.create({
          data: {
            userId: session.userId,
            projectId,
            balance: pixelsAwarded,
            totalEarned: pixelsAwarded,
            totalDonated: amount,
          },
        });

        // 记录交易
        await tx.tokenTransaction.create({
          data: {
            userTokensId: userTokens.id,
            type: 'EARN',
            amount: pixelsAwarded,
            description: `Simulated donation of $${amount}`,
            sourceType: 'donation',
            sourceId: donation.id,
            balanceBefore: 0,
            balanceAfter: pixelsAwarded,
          },
        });
      }

      // 3. 更新项目筹款金额
      await tx.project.update({
        where: { id: projectId },
        data: {
          amountRaised: { increment: amount },
        },
      });

      return { donation, userTokens };
    });

    return NextResponse.json({
      success: true,
      data: {
        donationId: result.donation.id,
        pixelsAwarded,
        newBalance: result.userTokens.balance,
      },
    });
  } catch (error) {
    console.error('Simulate donation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 像素放置 API

#### `app/api/pixels/place/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId, positionX, positionY, color, message } = await request.json();

    // 验证输入
    if (!projectId || positionX === undefined || positionY === undefined || !color) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. 检查用户代币
      const userTokens = await tx.userTokens.findUnique({
        where: {
          userId_projectId: {
            userId: session.userId!,
            projectId,
          },
        },
      });

      if (!userTokens || userTokens.balance < 1) {
        throw new Error('INSUFFICIENT_TOKENS');
      }

      // 2. 检查冷却
      const now = new Date();
      if (userTokens.cooldownUntil && new Date(userTokens.cooldownUntil) > now) {
        const remaining = Math.ceil(
          (new Date(userTokens.cooldownUntil).getTime() - now.getTime()) / 1000
        );
        throw new Error(`COOLDOWN_ACTIVE:${remaining}`);
      }

      // 3. 获取用户信息
      const user = await tx.user.findUnique({
        where: { id: session.userId! },
      });

      // 4. 查找现有像素
      const existingPixel = await tx.pixel.findUnique({
        where: {
          projectId_positionX_positionY: {
            projectId,
            positionX,
            positionY,
          },
        },
      });

      const wasOverwrite = !!existingPixel;
      const previousColor = existingPixel?.color;

      let pixel;
      if (existingPixel) {
        // 保存历史
        await tx.pixelHistory.create({
          data: {
            pixelId: existingPixel.id,
            contributorId: existingPixel.contributorId,
            contributorName: existingPixel.contributorName,
            contributorMessage: existingPixel.contributorMessage,
            color: existingPixel.color,
            placedAt: existingPixel.placedAt,
            wasOverwrite: true,
            previousColor: existingPixel.color,
          },
        });

        // 更新像素
        pixel = await tx.pixel.update({
          where: { id: existingPixel.id },
          data: {
            color,
            contributorId: session.userId,
            contributorName: user?.username,
            contributorMessage: message,
            placedAt: now,
            protectedUntil: new Date(now.getTime() + 60 * 60 * 1000), // 1小时保护
            timesOverwritten: { increment: 1 },
          },
        });
      } else {
        // 创建新像素
        pixel = await tx.pixel.create({
          data: {
            projectId,
            positionX,
            positionY,
            color,
            contributorId: session.userId,
            contributorName: user?.username,
            contributorMessage: message,
            protectedUntil: new Date(now.getTime() + 60 * 60 * 1000),
          },
        });
      }

      // 5. 扣除代币
      const cooldownUntil = new Date(now.getTime() + 5 * 60 * 1000); // 5分钟

      const updatedTokens = await tx.userTokens.update({
        where: { id: userTokens.id },
        data: {
          balance: { decrement: 1 },
          totalSpent: { increment: 1 },
          pixelsPlaced: { increment: 1 },
          lastPlacedAt: now,
          cooldownUntil,
        },
      });

      // 6. 记录交易
      await tx.tokenTransaction.create({
        data: {
          userTokensId: userTokens.id,
          type: 'SPEND',
          amount: -1,
          description: `Placed pixel at (${positionX}, ${positionY})`,
          sourceType: 'pixel_placement',
          sourceId: pixel.id,
          balanceBefore: userTokens.balance,
          balanceAfter: userTokens.balance - 1,
        },
      });

      // 7. 更新项目统计
      await tx.project.update({
        where: { id: projectId },
        data: {
          pixelsPlaced: { increment: wasOverwrite ? 0 : 1 },
          uniquePixels: { increment: wasOverwrite ? 0 : 1 },
        },
      });

      return {
        pixel,
        wasOverwrite,
        previousColor,
        tokensRemaining: updatedTokens.balance,
        cooldownUntil,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Place pixel error:', error);

    if (error.message === 'INSUFFICIENT_TOKENS') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSUFFICIENT_TOKENS',
            message: '代币不足',
          },
        },
        { status: 402 }
      );
    }

    if (error.message.startsWith('COOLDOWN_ACTIVE:')) {
      const remaining = error.message.split(':')[1];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'COOLDOWN_ACTIVE',
            message: '你还在冷却期',
            cooldownRemaining: parseInt(remaining),
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 代币状态 API

#### `app/api/tokens/status/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      );
    }

    const userTokens = await prisma.userTokens.findUnique({
      where: {
        userId_projectId: {
          userId: session.userId,
          projectId,
        },
      },
    });

    if (!userTokens) {
      return NextResponse.json({
        success: true,
        data: {
          balance: 0,
          isCoolingDown: false,
          cooldownRemaining: 0,
        },
      });
    }

    const now = new Date();
    const isCoolingDown = userTokens.cooldownUntil
      ? new Date(userTokens.cooldownUntil) > now
      : false;

    const cooldownRemaining = isCoolingDown
      ? Math.ceil((new Date(userTokens.cooldownUntil!).getTime() - now.getTime()) / 1000)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        balance: userTokens.balance,
        totalEarned: userTokens.totalEarned,
        totalSpent: userTokens.totalSpent,
        pixelsPlaced: userTokens.pixelsPlaced,
        isCoolingDown,
        cooldownRemaining,
        canPlaceAt: userTokens.cooldownUntil,
      },
    });
  } catch (error) {
    console.error('Get token status error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 排行榜 API

#### `app/api/leaderboard/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      );
    }

    const leaderboard = await prisma.userTokens.findMany({
      where: { projectId },
      orderBy: [
        { pixelsPlaced: 'desc' },
        { totalDonated: 'desc' },
      ],
      take: 10,
      select: {
        user: {
          select: {
            username: true,
          },
        },
        pixelsPlaced: true,
        totalDonated: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: leaderboard.map((entry, index) => ({
        rank: index + 1,
        username: entry.user.username,
        pixelsPlaced: entry.pixelsPlaced,
        totalDonated: Number(entry.totalDonated),
      })),
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 前端组件（Next.js + Tailwind）

### PixelCanvas 组件

`components/PixelCanvas.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

interface Pixel {
  positionX: number;
  positionY: number;
  color: string;
  contributorName?: string;
}

interface PixelCanvasProps {
  gridSize: number;
  pixels: Pixel[];
  selectedColor: string;
  onPixelClick: (x: number, y: number) => void;
}

export default function PixelCanvas({
  gridSize,
  pixels,
  selectedColor,
  onPixelClick,
}: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null);

  const canvasSize = 600; // 固定画布大小
  const pixelSize = canvasSize / gridSize;

  // 渲染画布
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 绘制网格
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;

    for (let i = 0; i <= gridSize; i++) {
      ctx.beginPath();
      ctx.moveTo(i * pixelSize, 0);
      ctx.lineTo(i * pixelSize, canvasSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * pixelSize);
      ctx.lineTo(canvasSize, i * pixelSize);
      ctx.stroke();
    }

    // 绘制像素
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(
        pixel.positionX * pixelSize,
        pixel.positionY * pixelSize,
        pixelSize,
        pixelSize
      );
    });

    // 高亮悬停像素
    if (hoveredPixel) {
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoveredPixel.x * pixelSize,
        hoveredPixel.y * pixelSize,
        pixelSize,
        pixelSize
      );
    }
  }, [pixels, gridSize, hoveredPixel]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      onPixelClick(x, y);
    }
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / pixelSize);
    const y = Math.floor((e.clientY - rect.top) / pixelSize);

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      setHoveredPixel({ x, y });
    } else {
      setHoveredPixel(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasSize}
        height={canvasSize}
        className="border-2 border-gray-800 shadow-2xl cursor-crosshair mx-auto"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMove}
        onMouseLeave={() => setHoveredPixel(null)}
      />

      {hoveredPixel && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-mono">
          ({hoveredPixel.x}, {hoveredPixel.y})
        </div>
      )}
    </div>
  );
}
```

### ColorPalette 组件

`components/ColorPalette.tsx`:

```typescript
'use client';

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPalette({
  colors,
  selectedColor,
  onSelectColor,
}: ColorPaletteProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-bold mb-3 text-gray-700">选择颜色</h3>

      <div className="grid grid-cols-8 gap-2">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={`
              w-10 h-10 rounded border-2 transition-all
              hover:scale-110 hover:shadow-md
              ${
                selectedColor === color
                  ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                  : 'border-gray-300'
              }
            `}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div
          className="w-6 h-6 rounded border-2 border-gray-300"
          style={{ backgroundColor: selectedColor }}
        />
        <span className="text-xs text-gray-600 font-mono">{selectedColor}</span>
      </div>
    </div>
  );
}
```

### TokenDisplay 组件

`components/TokenDisplay.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';

interface TokenDisplayProps {
  balance: number;
  cooldownUntil: Date | null;
  onDonate: () => void;
}

export default function TokenDisplay({
  balance,
  cooldownUntil,
  onDonate,
}: TokenDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!cooldownUntil) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, (cooldownUntil.getTime() - Date.now()) / 1000);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldownUntil]);

  const isCoolingDown = timeLeft > 0;

  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">可用代币</p>
          <p className="text-4xl font-bold">{balance}</p>
        </div>

        <button
          onClick={onDonate}
          className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          获取代币
        </button>
      </div>

      {isCoolingDown && (
        <div className="mt-4 pt-4 border-t border-white/30">
          <p className="text-sm opacity-90">冷却中...</p>
          <p className="text-2xl font-mono">
            {Math.floor(timeLeft / 60)}:{String(Math.floor(timeLeft % 60)).padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 辅助工具

### Prisma Client

`lib/prisma.ts`:

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

### Session 管理

`lib/auth.ts`:

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

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID();

  await prisma.user.update({
    where: { id: userId },
    data: { sessionId },
  });

  return sessionId;
}
```

---

**版本**: V3.0 (Next.js + Prisma)
**最后更新**: 2025-12-12
**状态**: 完整技术栈文档
