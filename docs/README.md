# 项目文档 / Project Documentation

> **Pixel Canvas for Change** - 所有设计和技术文档

---

## 文档导航

### 必读（按顺序）
1. **[claude.md](./claude.md)** - 项目核心规范
2. **[NEXTJS_STACK.md](./NEXTJS_STACK.md)** - 技术实现（Prisma Schema + API Routes + 组件）
3. **[NEXTJS_QUICKSTART.md](./NEXTJS_QUICKSTART.md)** - 开发步骤（30分钟快速开始）

### 参考文档
- **[REDESIGN_RPLACE_STYLE.md](./REDESIGN_RPLACE_STYLE.md)** - 产品设计理念
- **[SUMMARY_V2.md](./SUMMARY_V2.md)** - 项目规划和时间安排

### 集成文档
- **[EVERYORG_API.md](./EVERYORG_API.md)** - Every.org API 集成（真实数据 + 模拟捐款）
- **[TENCENT_CHARITY_API.md](./TENCENT_CHARITY_API.md)** - 腾讯公益 API 接入指南（备选）

### Hackathon 官方文档
- **[[2025_Dec] Rubrics.pdf](./%5B2025_Dec%5D%20Rubrics.pdf)** - 评分标准
- **[[2025_Dec] December Hackathon Details.pdf](./%5B2025_Dec%5D%20December%20Hackathon%20Details.pdf)** - 规则和要求

---

## 文档职责

| 文档 | 内容 | 用途 |
|------|------|------|
| claude.md | 核心规范、API 端点、数据表概览 | AI 助手工作参考 |
| NEXTJS_STACK.md | 完整 Prisma Schema、API Routes、组件设计 | 实现参考 |
| NEXTJS_QUICKSTART.md | 10 步开发流程、种子数据、部署 | 开发指南 |
| REDESIGN_RPLACE_STYLE.md | r/place 理念、用户体验 | 产品设计 |
| SUMMARY_V2.md | 时间规划、功能优先级 | 项目管理 |

---

## 快速查找

### 想了解...
- **项目核心机制** → claude.md
- **数据库表结构** → NEXTJS_STACK.md (Prisma Schema 部分)
- **API 端点定义** → NEXTJS_STACK.md (API Routes 部分)
- **如何开始开发** → NEXTJS_QUICKSTART.md
- **产品设计理念** → REDESIGN_RPLACE_STYLE.md

### 想实现...
- **模拟捐款** → NEXTJS_STACK.md → API: POST /api/donations/simulate
- **像素放置** → NEXTJS_STACK.md → API: POST /api/pixels/place
- **画布渲染** → NEXTJS_STACK.md → Component: PixelCanvas
- **颜色选择器** → NEXTJS_STACK.md → Component: ColorPalette

---

## 核心概念

### 捐款比例系统
```
代币数 = (捐款 / 目标) × 总像素数

例如：捐 $10 / $10,000 × 10,000 = 10 代币
```

### 技术栈
- **Frontend**: Next.js 15 + React 19
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL + Prisma
- **Deployment**: Vercel

### MVP 功能
1. Gmail 验证码登录
2. 模拟捐款获取代币
3. 像素放置（100×100 画布，16 色）
4. 冷却机制（5 分钟）
5. 排行榜
6. 像素历史

---

## Future Features
- AI 环保行为审核
- 成就系统
- 时间线回放
- WebSocket 实时同步

---

## 文档原则

1. **避免重复**: 每个信息只在一个文档中详细说明
2. **职责分明**: claude.md（规范）+ NEXTJS_STACK.md（实现）
3. **及时更新**: 代码变化时同步更新文档

---

**版本**: V3.0 (Next.js + Prisma + PostgreSQL)
**最后更新**: 2025-12-12
**技术栈**: Next.js 本地开发
**总文档**: 7 个
