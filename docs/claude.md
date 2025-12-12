# Claude 项目记忆文档

> **核心参考**: 所有代码实现必须严格遵循此文档。

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

**理由**: 现代全栈框架 + 类型安全 + 零配置部署

---

## 捐款比例系统（核心机制）

### 公式
```
用户获得像素数 = (捐款金额 / 目标金额) × 画布总像素数
```

### 例子
- 画布目标：$10,000
- 画布大小：100×100 = 10,000 像素
- 用户捐 $10 → 获得 10 像素
- 用户捐 $100 → 获得 100 像素

### 灵活性
- 目标 $5,000，用户捐 $10 → 20 像素
- 目标 $20,000，用户捐 $10 → 5 像素

### 捐款流程（Hackathon 版）
```
1. 使用 Every.org API 获取真实公益项目
2. 用户点击"模拟捐款"（无真实支付）
3. 系统计算代币数 → 立即分配
4. 用户开始绘制像素
```

---

## 数据库核心表

**详见**: NEXTJS_STACK.md

### 关键表
1. **projects** - 画布项目
2. **users** - 用户信息
3. **userTokens** - 用户代币
4. **pixels** - 像素当前状态
5. **pixelHistory** - 像素历史

### 关键字段
```typescript
projects {
  targetAmount: 目标金额
  amountRaised: 已筹金额
  pixelsTotal: 总像素数
  pixelsPlaced: 已放置数
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
}

userTokens {
  balance: 当前余额
  totalEarned: 总获得
  totalSpent: 总消耗
  cooldownUntil: 冷却结束时间
}

pixels {
  positionX: X 坐标
  positionY: Y 坐标
  color: HEX 颜色
  contributorName: 贡献者
  placedAt: 放置时间
  timesOverwritten: 被覆盖次数
}
```

---

## API 端点

**详见**: NEXTJS_STACK.md

### 核心 API
```
GET  /api/projects              # 获取所有项目
GET  /api/projects/[id]         # 获取项目详情
POST /api/donations/simulate    # 模拟捐款
POST /api/pixels/place          # 放置像素
GET  /api/tokens/status         # 查询代币状态
GET  /api/leaderboard           # 排行榜
```

### 关键逻辑
- 模拟捐款 → 计算代币 → 更新 userTokens
- 放置像素 → 检查代币 → 检查冷却 → 扣除代币 → 保存历史
- 画布满 → 状态改为 COMPLETED → 展示愿望

---

## 游戏机制

### 冷却系统
- **时长**: 5 分钟
- **触发**: 每次成功放置像素
- **目的**: 防止一人瞬间画完

### 像素覆盖
- **规则**: 允许覆盖别人的像素
- **历史**: 每次覆盖保存到 pixelHistory

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

**详见**: NEXTJS_STACK.md

### 核心组件
1. **PixelCanvas** - 100×100 网格渲染
2. **ColorPalette** - 16 色选择器
3. **DonationModal** - 捐款凭证上传
4. **TokenDisplay** - 显示剩余代币
5. **LeaderboardModal** - 排行榜

---

## Claude 工作规范

### 规则 1: 遵循文档
- 所有实现基于文档
- 禁止擅自修改设计
- 需要修改时先询问用户

### 规则 2: 避免重复
- claude.md：核心规范（本文档）
- NEXTJS_STACK.md：技术细节（代码 + Schema）
- 其他文档：产品理念

### 规则 3: 更新同步
- 写代码后，检查是否需要更新文档
- 发现冲突，询问用户

---

## Future Features（暂不实现）

### 环保行为验证
- 上传环保行为照片
- AI 审核
- 通过后获得代币（等价 $3）

### 其他功能
- 成就系统
- WebSocket 实时同步
- 时间线回放

---

## 种子数据

### 默认数据
- 用户: alice, bob
- 项目: 拯救亚马逊雨林（目标 $10,000, 100×100 像素）
- 调色板: 16 色雨林主题
- 示例像素: 小树图案（23 个像素）

**详见**: NEXTJS_QUICKSTART.md

---

## MVP 功能

### 必须实现
- [x] Gmail 验证码登录
- [ ] 画布渲染（100×100）
- [ ] 颜色选择（16 色）
- [ ] 模拟捐款
- [ ] 像素放置 + 冷却
- [ ] 排行榜

### 可选
- [ ] 成就系统
- [ ] 像素历史查看

---

## 重要提醒

### 核心原则
1. **零资金接触**: 平台不经手任何捐款
2. **按比例分配**: 捐款越多，像素越多
3. **画布完成揭晓**: 填满前隐藏，填满后展示

---

**版本**: V3.0 (Next.js + Prisma + PostgreSQL)
**最后更新**: 2025-12-12
**状态**: 开发中
