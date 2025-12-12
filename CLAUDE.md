# Claude 项目记忆文档

> **核心参考**: 所有代码实现必须严格遵循此文档。

---

## 文档导航

### 必读（按顺序）
1. **CLAUDE.md**（本文）- 项目核心规范
2. **[docs/NEXTJS_STACK.md](./docs/NEXTJS_STACK.md)** - 技术实现（数据库 + API + 组件）
3. **[docs/NEXTJS_QUICKSTART.md](./docs/NEXTJS_QUICKSTART.md)** - 开发步骤

### 参考文档
- **[docs/REDESIGN_RPLACE_STYLE.md](./docs/REDESIGN_RPLACE_STYLE.md)** - 产品设计理念
- **[docs/SUMMARY_V2.md](./docs/SUMMARY_V2.md)** - 项目规划和时间安排

### 集成文档
- **[docs/EVERYORG_API.md](./docs/EVERYORG_API.md)** - Every.org API 集成（当前方案）
- **[docs/TENCENT_CHARITY_API.md](./docs/TENCENT_CHARITY_API.md)** - 腾讯公益 API 接入指南（备选）

### Hackathon 官方文档
- **[docs/[2025_Dec] Rubrics.pdf](./docs/%5B2025_Dec%5D%20Rubrics.pdf)** - 评分标准
- **[docs/[2025_Dec] December Hackathon Details.pdf](./docs/%5B2025_Dec%5D%20December%20Hackathon%20Details.pdf)** - 规则和要求

### 实现状态
- **[README.md](./README.md)** - 项目完整说明和使用指南
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 部署指南

---

## 项目核心

### 项目名称
**Pixel Canvas for Change** - 公益像素画布

### 核心理念
r/place 风格的集体像素艺术 + 公益捐款。用户捐款后按比例获得像素放置权，自由绘制，画布完成后展示所有人的愿望。

### Hackathon 主题
**"If you made a website that could save the world, what would it look like?"**

### 核心创新
1. **捐款比例分配**：捐款 / 目标金额 × 总像素数 = 你的像素权
2. **资金零接触**：所有捐款通过外部平台（Every.org 等），平台不经手资金
3. **画布完成揭晓**：填满前隐藏愿望，填满后展示所有内容
4. **冷却机制**：5 分钟冷却，避免垄断

---

## 技术栈

```
Frontend:  Next.js 15 + React 19
Styling:   Tailwind CSS
Backend:   Next.js API Routes
Database:  PostgreSQL
ORM:       Prisma
Auth:      Gmail 验证码（自实现）
Deployment: Vercel
```

**理由**:
- **Next.js**: 现代全栈框架，SEO 友好，部署简单
- **Tailwind CSS**: 快速开发，响应式设计
- **PostgreSQL**: 生产级数据库，支持复杂查询
- **Prisma**: 类型安全的 ORM，自带迁移和可视化工具
- **Vercel**: Next.js 官方平台，零配置部署

---

## 捐款比例系统（核心机制）

### 公式
```
用户获得像素数 = (捐款金额 / 目标金额) × 画布总像素数
```

### 例子
- 画布目标：$10,000
- 画布大小：100×100 = 10,000 像素
- 用户捐 $10 → 获得 10 像素 ($10 / $10,000 × 10,000)
- 用户捐 $100 → 获得 100 像素

### 灵活性
- 目标 $5,000，用户捐 $10 → 20 像素（比例提高）
- 目标 $20,000，用户捐 $10 → 5 像素（比例降低）

### 捐款流程

**Hackathon 版（当前）：真实数据 + 模拟捐款**
```
1. 使用 Every.org API 获取真实公益项目
2. 显示真实组织名称、Logo、筹款目标
3. 用户点击"模拟捐款"（无真实支付）
4. 系统计算像素数 → 立即分配代币
5. 用户开始绘制像素
```

**优势**：
- 真实公益数据（100万+ 组织）
- 立即可用（无需审核等待）
- 完整演示所有功能
- 可无缝切换到真实支付

**生产版（未来）：**
```
1. 用户选择画布 → 点击捐款
2. 跳转 Every.org 捐款页面
3. 完成真实支付
4. Webhook 回调验证 → 自动分配代币
5. 返回画布开始绘制
```

**详见**: docs/EVERYORG_API.md

---

## 数据库核心表

**详见**: docs/NEXTJS_STACK.md

### 关键表
1. **projects** - 画布项目
2. **users** - 用户信息
3. **userTokens** - 用户代币（每个项目独立）
4. **pixels** - 像素当前状态
5. **pixelHistory** - 像素历史
6. **donations** - 捐款记录
7. **colorPalettes** - 调色板配置
8. **achievements** - 成就定义
9. **userAchievements** - 用户成就
10. **tokenTransactions** - 代币交易记录

### 关键字段
```typescript
projects {
  targetAmount: Decimal  // 目标金额
  amountRaised: Decimal  // 已筹金额
  gridSize: Int          // 网格大小（100）
  pixelsTotal: Int       // 总像素数（10000）
  pixelsPlaced: Int      // 已放置像素
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
}

userTokens {
  balance: Int           // 当前余额
  totalEarned: Int       // 总获得
  totalSpent: Int        // 总消耗
  pixelsPlaced: Int      // 已放置像素数
  totalDonated: Decimal  // 总捐款金额
  cooldownUntil: DateTime // 冷却结束时间
}

pixels {
  positionX: Int         // X 坐标
  positionY: Int         // Y 坐标
  color: String          // HEX 颜色
  contributorName: String
  contributorMessage: String
  placedAt: DateTime
  timesOverwritten: Int  // 被覆盖次数
}
```

---

## API 端点

**详见**: docs/NEXTJS_STACK.md

### 核心 API（Next.js API Routes）
```
GET  /api/projects              # 获取所有项目
GET  /api/projects/[id]         # 获取项目详情
POST /api/donations/simulate    # 模拟捐款
POST /api/pixels/place          # 放置像素
GET  /api/tokens/status         # 查询代币状态
GET  /api/leaderboard           # 排行榜
GET  /api/pixels/history        # 像素历史
```

### 认证 API
```
POST /api/auth/send-code        # 发送 Gmail 验证码
POST /api/auth/verify-code      # 验证码验证
GET  /api/auth/session          # 获取当前会话
POST /api/auth/logout           # 退出登录
```

### 关键逻辑
- 模拟捐款 → 计算代币数 → 更新 userTokens.balance
- 放置像素 → 检查代币 → 检查冷却 → 扣除代币 → 保存历史
- 画布满 → 状态改为 COMPLETED → 展示所有愿望

---

## 游戏机制

### 代币系统
- **获取**: 模拟捐款按比例获得代币
- **消耗**: 每放置 1 个像素消耗 1 个代币
- **永久有效**: 代币不过期，可随时使用

### 冷却系统
- **时长**: 5 分钟
- **触发**: 每次成功放置像素
- **目的**: 防止一人瞬间画完
- **实现**: userTokens.cooldownUntil 字段

### 像素覆盖
- **规则**: 允许覆盖别人的像素
- **历史**: 每次覆盖保存到 pixelHistory
- **统计**: pixels.timesOverwritten 记录覆盖次数

### 画布完成
```
当 pixelsPlaced >= pixelsTotal:
1. 状态 → COMPLETED
2. 停止接受新捐款
3. 停止像素放置
4. 展示所有像素背后的愿望/图片
```

---

## 前端组件

**详见**: docs/NEXTJS_STACK.md

### 页面结构（App Router）
```
app/
├── page.tsx                    # 首页（项目列表）
├── login/page.tsx              # Gmail 验证码登录
├── canvas/[id]/page.tsx        # 画布页面
├── leaderboard/page.tsx        # 排行榜
└── profile/page.tsx            # 用户个人页面
```

### 核心组件
1. **PixelCanvas** - 100×100 网格渲染（Canvas API）
2. **ColorPalette** - 16 色选择器
3. **DonationModal** - 模拟捐款弹窗
4. **TokenDisplay** - 代币余额 + 冷却倒计时
5. **LeaderboardModal** - 排行榜弹窗
6. **PixelHistoryModal** - 像素历史弹窗

---

## 开发工作流

### 本地开发
```bash
# 安装依赖
npm install

# 启动 PostgreSQL（Docker）
docker-compose up -d

# 运行数据库迁移
npx prisma migrate dev

# 种子数据
npx prisma db seed

# 启动开发服务器
npm run dev
```

### 数据库管理
```bash
# Prisma Studio（可视化管理）
npx prisma studio

# 生成新迁移
npx prisma migrate dev --name <migration_name>

# 查看数据库状态
npx prisma db status
```

### 部署到 Vercel
```bash
# 连接 Vercel 项目
vercel link

# 配置环境变量（在 Vercel Dashboard）
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
EVERYORG_API_KEY=...

# 部署
vercel --prod
```

---

## Claude 工作规范

### 规则 1: 遵循文档
- 所有实现基于文档
- 禁止擅自修改设计
- 需要修改时先询问用户

### 规则 2: 避免重复
- CLAUDE.md：核心规范（本文档）
- NEXTJS_STACK.md：技术细节（Prisma Schema + API 代码）
- 其他文档：产品理念

### 规则 3: 更新同步
- 写代码后，检查是否需要更新文档
- 发现冲突，询问用户

---

## 种子数据

### 默认数据
- 用户: alice, bob
- 项目: 拯救亚马逊雨林（目标 $10,000, 100×100 像素）
- 调色板: 16 色雨林主题
- 示例像素: 小树图案（23 个像素）
- 代币: 每个用户 50 代币

**详见**: docs/NEXTJS_QUICKSTART.md

---

## MVP 功能

### 必须实现
- [x] Gmail 验证码登录
- [ ] 画布渲染（100×100，Canvas API）
- [ ] 颜色选择（16 色调色板）
- [ ] 模拟捐款（获得代币）
- [ ] 像素放置 + 冷却机制
- [ ] 排行榜（Top 10）
- [ ] 像素历史查看

### 可选
- [ ] 成就系统
- [ ] 用户个人页面
- [ ] 时间线回放
- [ ] WebSocket 实时同步

---

## 重要提醒

### 核心原则
1. **零资金接触**: 平台不经手任何捐款
2. **按比例分配**: 捐款越多，代币越多
3. **画布完成揭晓**: 填满前隐藏，填满后展示

### MVP 核心概念
- **捐款比例系统**: 代币数 = (捐款 / 目标) × 总像素数
- **技术栈**: Next.js 15 + Prisma + PostgreSQL + Tailwind CSS
- **画布配置**: 100×100 像素，16 色调色板，5 分钟冷却

---

## 文档原则

1. **避免重复**: 每个信息只在一个文档中详细说明
2. **职责分明**: CLAUDE.md（规范）+ NEXTJS_STACK.md（实现）
3. **及时更新**: 代码变化时同步更新文档

---

## 快速查找

### 想了解...
- **项目核心机制** → CLAUDE.md（本文）
- **数据库表结构** → docs/NEXTJS_STACK.md (Prisma Schema 部分)
- **API 端点定义** → docs/NEXTJS_STACK.md (API Routes 部分)
- **如何开始开发** → docs/NEXTJS_QUICKSTART.md
- **产品设计理念** → docs/REDESIGN_RPLACE_STYLE.md

### 想实现...
- **模拟捐款** → docs/NEXTJS_STACK.md → API: POST /api/donations/simulate
- **像素放置** → docs/NEXTJS_STACK.md → API: POST /api/pixels/place
- **画布渲染** → docs/NEXTJS_STACK.md → Component: PixelCanvas
- **颜色选择器** → docs/NEXTJS_STACK.md → Component: ColorPalette

---

**版本**: V3.0 (Next.js + Prisma + PostgreSQL)
**最后更新**: 2025-12-12
**状态**: 开发中
**技术栈**: Next.js 本地开发
