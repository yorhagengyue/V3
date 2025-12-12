# Pixel Canvas for Change - r/place 风格重设计

## 核心概念升级

### 原概念 vs. 新概念

| 原设计 | r/place 新设计 |
|--------|---------------|
| 认领像素 + 填写故事 | 自由绘制 + 颜色选择 |
| 每个像素一个贡献者 | 像素可被覆盖（或保护） |
| 画布完成后解锁故事 | 实时可见，时间线回放 |
| 预设目标金额 | 每个像素都需要"代币"购买 |

---

## 重新设计的系统架构

### 1. 核心机制

#### A. 像素购买系统

用户通过以下方式获得"像素代币"：

1. **捐款获取**
   - 每捐 $1 = 1 个像素代币
   - 可一次性购买多个代币包

2. **行为获取**
   - 上传环保行为（骑车、垃圾分类等）
   - 审核通过后获得 3-5 个代币

3. **每日签到**（可选）
   - 每天登录送 1 个免费代币
   - 鼓励持续参与

#### B. 像素放置规则

```
用户流程：
1. 消耗 1 个代币
2. 选择颜色（16色 / 32色调色板）
3. 点击画布任意位置
4. 可选：留下一句话（最多 100 字符）
5. 进入冷却期（5 分钟，可通过额外捐款缩短）
```

#### C. 像素覆盖机制（三种模式可选）

**模式 1：自由覆盖**
- 任何像素都可以被覆盖
- 像素历史会被保存（可查看时间线）
- 适合：完全开放的创作

**模式 2：保护期覆盖**
- 新放置的像素有 1 小时保护期
- 保护期后可被覆盖
- 适合：hackathon 快速演示

**模式 3：价格竞价**（高级）
- 覆盖别人的像素需要支付更多代币
- 越老的像素越贵（防止破坏成品）
- 适合：真实运营场景

**Hackathon 建议：用模式 2**

---

## 2. 画布主题设计

### 主题示例

每个画布代表一个真实的公益项目：

#### 画布 1：拯救亚马逊雨林 (100x100)
- **目标**：筹集 $10,000 修复 1000 公顷森林
- **调色板**：绿色系为主（16 种绿 + 棕色 + 蓝色）
- **建议创作**：画出雨林、动物、树木

#### 画布 2：清洁海洋 (100x100)
- **目标**：筹集 $5,000 清理海洋垃圾
- **调色板**：蓝色系（海洋蓝 + 白色波浪 + 垃圾颜色）
- **建议创作**：海洋生物、清洁场景

#### 画布 3：儿童教育 (50x50)
- **目标**：筹集 $3,000 为贫困地区建图书馆
- **调色板**：彩虹色（象征希望）
- **建议创作**：书本、孩子、学校

---

## 3. 游戏化机制

### A. 冷却系统

```typescript
interface Cooldown {
  userId: string;
  canPlaceAt: Date;  // 下次可放置时间

  // 缩短冷却的方式
  reduceCooldownOptions: [
    { cost: 1, reduction: '1分钟' },
    { cost: 3, reduction: '5分钟（跳过冷却）' }
  ];
}
```

### B. 成就系统（可选但加分）

```typescript
achievements = [
  {
    id: 'first_pixel',
    title: '第一笔',
    description: '放置你的第一个像素',
    reward: 1  // 额外代币
  },
  {
    id: 'artist',
    title: '艺术家',
    description: '放置 100 个像素',
    reward: 10
  },
  {
    id: 'color_master',
    title: '色彩大师',
    description: '使用过所有 16 种颜色',
    reward: 5
  },
  {
    id: 'protector',
    title: '森林守护者',
    description: '在"雨林"画布放置 50 个绿色像素',
    reward: 10
  }
]
```

### C. 实时排行榜

```typescript
leaderboard = [
  {
    rank: 1,
    username: 'GreenWarrior',
    pixelsPlaced: 237,
    tokensContributed: 150,
    favoriteColor: '#2ecc71'
  },
  // ...
]
```

---

## 4. 核心功能清单

### MVP 必须有

1. **画布渲染**
   - 100x100 像素网格
   - 16 色调色板
   - 实时显示所有像素

2. **像素放置**
   - 选择颜色
   - 点击空白/已有像素
   - 消耗代币
   - 进入冷却

3. **代币系统**
   - 模拟捐款获取代币
   - 显示代币余额
   - 代币消耗记录

4. **冷却机制**
   - 5 分钟冷却
   - 显示倒计时
   - 冷却期间禁用放置

5. **历史记录**
   - 查看某个像素的历史
   - 显示"谁、何时、什么颜色"
   - 时间线滑块（简化版）

### 高级功能（加分项）

1. **时间线回放**
   - 拖动滑块查看画布演变
   - 速度控制（1x, 5x, 10x）
   - 导出为 GIF 动画

2. **协作模式**
   - 用户可创建"小队"
   - 小队成员共享代币池
   - 协作完成特定图案

3. **像素故事**
   - 点击像素查看留言
   - Hover 显示贡献者昵称
   - 点赞最喜欢的像素

4. **成就与徽章**
   - 完成成就解锁徽章
   - 在个人页面展示
   - 特殊徽章可获得额外代币

5. **AI 辅助保护**
   - 检测恶意涂鸦（纯色覆盖、攻击性内容）
   - 自动标记可疑操作
   - 管理员审核工具

---

## 5. 技术实现要点

### 数据库 Schema 更新

```prisma
model Pixel {
  id        String   @id @default(uuid())
  projectId String

  // 位置
  positionX Int
  positionY Int

  // 颜色（核心变化！）
  color     String   // HEX 格式 "#2ecc71"

  // 当前像素信息
  currentContributorId   String?
  currentContributorName String?
  currentMessage         String?  @db.VarChar(100)
  currentPlacedAt        DateTime @default(now())

  // 统计
  timesOverwritten Int @default(0)

  // 关系
  project Project @relation(fields: [projectId], references: [id])
  history PixelHistory[]

  @@unique([projectId, positionX, positionY])
  @@index([projectId])
}

// 新增：像素历史表
model PixelHistory {
  id        String   @id @default(uuid())
  pixelId   String

  contributorId   String?
  contributorName String?
  color           String
  message         String?  @db.VarChar(100)
  placedAt        DateTime @default(now())

  // 关系
  pixel Pixel @relation(fields: [pixelId], references: [id], onDelete: Cascade)

  @@index([pixelId, placedAt])
  @@index([placedAt])  // 用于时间线查询
}

// 新增：用户代币账户
model UserTokens {
  id     String  @id @default(uuid())
  userId String  @unique

  balance         Int @default(0)
  totalEarned     Int @default(0)
  totalSpent      Int @default(0)

  pixelsPlaced    Int @default(0)
  totalDonated    Decimal @db.Decimal(10, 2) @default(0)

  lastPlacedAt    DateTime?
  cooldownUntil   DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}

// 新增：代币交易记录
model TokenTransaction {
  id        String   @id @default(uuid())
  userId    String

  type      TokenTransactionType
  amount    Int      // 正数=获得，负数=消耗

  // 来源信息
  sourceType String?  // 'donation', 'action', 'achievement', 'daily'
  sourceId   String?  // 关联的捐款ID/行为ID等

  balanceAfter Int

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}

enum TokenTransactionType {
  EARN
  SPEND
  BONUS
  REFUND
}

// 调色板配置（每个项目可自定义）
model ColorPalette {
  id        String @id @default(uuid())
  projectId String @unique

  colors    Json   // ["#ffffff", "#e4e4e4", "#888888", ...]

  project Project @relation(fields: [projectId], references: [id])
}
```

### API 端点更新

#### `POST /api/projects/:id/place-pixel`

```typescript
// Request
{
  "positionX": 42,
  "positionY": 58,
  "color": "#2ecc71",
  "message": "为地球添一抹绿！"  // 可选
}

// Response 200
{
  "success": true,
  "data": {
    "pixel": {
      "id": "pixel-uuid",
      "positionX": 42,
      "positionY": 58,
      "color": "#2ecc71",
      "contributorName": "小明",
      "placedAt": "2025-12-11T10:30:00Z",
      "wasOverwritten": true,  // 是否覆盖了别人的像素
      "previousColor": "#3498db"
    },
    "tokensRemaining": 7,
    "cooldownUntil": "2025-12-11T10:35:00Z"
  }
}

// Response 400 (冷却中)
{
  "success": false,
  "error": {
    "code": "COOLDOWN_ACTIVE",
    "message": "你还在冷却期",
    "cooldownRemaining": 180,  // 秒
    "canPlaceAt": "2025-12-11T10:35:00Z"
  }
}

// Response 402 (代币不足)
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_TOKENS",
    "message": "代币不足",
    "balance": 0,
    "required": 1
  }
}
```

#### `GET /api/projects/:id/pixels/:x/:y/history`

```typescript
// Response
{
  "success": true,
  "data": {
    "currentPixel": {
      "color": "#2ecc71",
      "contributorName": "小明",
      "message": "为地球添一抹绿！",
      "placedAt": "2025-12-11T10:30:00Z"
    },
    "history": [
      {
        "color": "#3498db",
        "contributorName": "Alice",
        "message": "蓝色的希望",
        "placedAt": "2025-12-10T15:20:00Z"
      },
      {
        "color": "#ffffff",
        "contributorName": "Bob",
        "message": null,
        "placedAt": "2025-12-09T09:10:00Z"
      }
    ],
    "totalChanges": 3
  }
}
```

#### `POST /api/tokens/purchase`

```typescript
// Request
{
  "amount": 50,  // 购买 50 个代币
  "paymentMethod": "stripe",
  "paymentToken": "tok_visa"
}

// Response
{
  "success": true,
  "data": {
    "tokensPurchased": 50,
    "dollarAmount": 50,
    "newBalance": 57,
    "transactionId": "tx-uuid"
  }
}
```

#### `GET /api/projects/:id/timelapse`

```typescript
// Query: ?from=timestamp&to=timestamp&interval=3600
// 返回每小时的画布快照

// Response
{
  "success": true,
  "data": {
    "snapshots": [
      {
        "timestamp": "2025-12-10T00:00:00Z",
        "pixels": [
          { "x": 0, "y": 0, "color": "#ffffff" },
          { "x": 0, "y": 1, "color": "#e4e4e4" },
          // ... 只返回有颜色的像素
        ]
      },
      {
        "timestamp": "2025-12-10T01:00:00Z",
        "pixels": [...]
      }
    ]
  }
}
```

---

## 6. 前端组件更新

### ColorPalette.tsx（新组件）

```tsx
'use client';

import { useState } from 'react';

interface ColorPaletteProps {
  colors: string[];
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export default function ColorPalette({
  colors,
  selectedColor,
  onSelectColor
}: ColorPaletteProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
      <h3 className="text-sm font-bold mb-3 text-gray-700">选择颜色</h3>

      <div className="grid grid-cols-8 gap-2">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => onSelectColor(color)}
            className={`
              w-8 h-8 rounded border-2 transition-all
              hover:scale-110 hover:shadow-md
              ${selectedColor === color
                ? 'border-blue-500 ring-2 ring-blue-300 scale-110'
                : 'border-gray-300'
              }
            `}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* 当前选中颜色显示 */}
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

### PixelCanvas.tsx（更新）

```tsx
'use client';

import { useState, useCallback } from 'react';
import { Project, Pixel } from '@/types';

export default function PixelCanvas({
  project,
  pixels,
  selectedColor,
  onPixelClick
}: {
  project: Project;
  pixels: Pixel[];
  selectedColor: string;
  onPixelClick: (x: number, y: number, color: string) => void;
}) {
  const [hoveredPixel, setHoveredPixel] = useState<{x: number, y: number} | null>(null);

  const pixelSize = 600 / project.gridSize;  // 假设画布 600x600px

  // 创建像素网格矩阵
  const pixelGrid = Array.from({ length: project.gridSize }, (_, y) =>
    Array.from({ length: project.gridSize }, (_, x) => {
      const pixel = pixels.find(p => p.positionX === x && p.positionY === y);
      return pixel?.color || '#ffffff';  // 默认白色
    })
  );

  const handlePixelClick = (x: number, y: number) => {
    onPixelClick(x, y, selectedColor);
  };

  return (
    <div className="relative">
      {/* 画布 */}
      <div
        className="border-2 border-gray-800 shadow-2xl mx-auto"
        style={{
          width: project.gridSize * pixelSize,
          height: project.gridSize * pixelSize
        }}
      >
        {pixelGrid.map((row, y) => (
          <div key={y} className="flex">
            {row.map((color, x) => (
              <div
                key={`${x}-${y}`}
                onClick={() => handlePixelClick(x, y)}
                onMouseEnter={() => setHoveredPixel({ x, y })}
                onMouseLeave={() => setHoveredPixel(null)}
                className={`
                  border border-gray-200 cursor-crosshair
                  transition-all duration-100
                  ${hoveredPixel?.x === x && hoveredPixel?.y === y
                    ? 'ring-2 ring-blue-400 scale-110 z-10 shadow-lg'
                    : ''
                  }
                `}
                style={{
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: color
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Hover 坐标提示 */}
      {hoveredPixel && (
        <div className="absolute top-0 right-0 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-mono">
          ({hoveredPixel.x}, {hoveredPixel.y})
        </div>
      )}
    </div>
  );
}
```

### TokenDisplay.tsx（新组件）

```tsx
'use client';

export default function TokenDisplay({
  balance,
  cooldownUntil,
  onPurchaseTokens
}: {
  balance: number;
  cooldownUntil: Date | null;
  onPurchaseTokens: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

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
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">可用代币</p>
          <p className="text-3xl font-bold">{balance}</p>
        </div>

        <button
          onClick={onPurchaseTokens}
          className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          购买代币
        </button>
      </div>

      {/* 冷却倒计时 */}
      {isCoolingDown && (
        <div className="mt-3 pt-3 border-t border-white/30">
          <p className="text-sm opacity-90">冷却中...</p>
          <p className="text-xl font-mono">
            {Math.floor(timeLeft / 60)}:{String(Math.floor(timeLeft % 60)).padStart(2, '0')}
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 7. 视觉效果升级

### 像素放置动画

```tsx
// 当像素被放置时的动画效果
<div className="pixel-place-animation">
  <style jsx>{`
    @keyframes pixelPop {
      0% {
        transform: scale(0);
        opacity: 0;
      }
      50% {
        transform: scale(1.3);
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    @keyframes ripple {
      0% {
        box-shadow: 0 0 0 0 currentColor;
      }
      100% {
        box-shadow: 0 0 0 20px transparent;
      }
    }

    .pixel-place-animation {
      animation: pixelPop 0.3s ease-out, ripple 0.6s ease-out;
    }
  `}</style>
</div>
```

### 时间线滑块

```tsx
'use client';

export default function TimelineSlider({
  minTime,
  maxTime,
  currentTime,
  onTimeChange
}: {
  minTime: Date;
  maxTime: Date;
  currentTime: Date;
  onTimeChange: (time: Date) => void;
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="font-bold mb-4">时间线回放</h3>

      {/* 播放控制 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? '⏸ 暂停' : '▶ 播放'}
        </button>

        <select
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
          className="px-3 py-2 border rounded"
        >
          <option value={1}>1x</option>
          <option value={5}>5x</option>
          <option value={10}>10x</option>
        </select>
      </div>

      {/* 时间滑块 */}
      <input
        type="range"
        min={minTime.getTime()}
        max={maxTime.getTime()}
        value={currentTime.getTime()}
        onChange={e => onTimeChange(new Date(Number(e.target.value)))}
        className="w-full"
      />

      <div className="flex justify-between text-sm text-gray-600 mt-2">
        <span>{minTime.toLocaleDateString()}</span>
        <span className="font-bold">{currentTime.toLocaleString()}</span>
        <span>{maxTime.toLocaleDateString()}</span>
      </div>
    </div>
  );
}
```

---

## 8. Demo 视频脚本（重制）

### 0:00-1:00 开场
- "还记得 Reddit 的 r/place 吗？数百万人一起创作的像素艺术"
- "如果我们把这种集体创作的力量，用来拯救世界呢？"

### 1:00-3:00 核心演示
1. 展示画布主题："拯救亚马逊雨林"
2. 通过模拟捐款获得代币
3. 选择绿色，在画布上画一棵树
4. 展示其他用户也在同时创作
5. 点击某个像素，查看背后的故事

### 3:00-5:00 游戏化机制
1. 展示冷却机制
2. 查看排行榜
3. 解锁一个成就徽章
4. 购买更多代币继续创作

### 5:00-7:00 时间线回放
1. 拖动时间滑块
2. 展示画布从空白到丰富的演变
3. 加速播放（10x）
4. 暂停在某个精彩瞬间

### 7:00-9:00 技术亮点
- 实时同步（WebSocket）
- 像素历史追踪
- 代币系统
- 可扩展的调色板

### 9:00-10:00 收尾
- "每一个像素都是一份真实的贡献"
- "每一幅画布都是拯救世界的集体行动"
- "这不只是艺术，这是希望"

---

## 9. 评分标准对应（更新）

### Technical Accomplishment (40%)
- **实时像素同步**：WebSocket 或轮询实现多用户实时绘制
- **像素历史系统**：完整的版本追踪 + 时间线回放
- **高性能渲染**：10000 像素（100x100）流畅交互
- **代币经济系统**：购买、消耗、冷却的完整闭环

### Originality (20%)
- **r/place + 公益**：首次将集体像素艺术应用于慈善
- **故事化像素**：每个像素不只是颜色，还有人的温度
- **时间线叙事**：把画布演变变成感人的故事

### Completeness (20%)
- 完整的用户流程：注册 → 获取代币 → 绘制 → 查看历史
- 两种获取代币方式（捐款 + 行为）
- 时间线回放功能
- 响应式设计

### Feasibility & Significance (20%)
- 真实可运营：接入支付后立即可商用
- 社交传播性：用户会分享自己的像素艺术
- 持续参与：冷却机制鼓励每天回来

---

你觉得这个重设计怎么样？需要我：
1. 更新完整的数据库 schema 代码？
2. 提供实时同步的 WebSocket 实现？
3. 生成时间线回放的算法？
4. 其他具体实现细节？
