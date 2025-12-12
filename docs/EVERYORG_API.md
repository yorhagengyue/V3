# Every.org API 集成文档 - 真实数据 + 模拟捐款

## 方案概述

**混合模式**：使用 Every.org 真实公益项目数据 + 模拟捐款流程

### 核心优势

1. 展示真实公益组织（100万+ 美国 501(c)(3) 机构）
2. 真实的筹款目标和进度数据
3. 无需处理真实支付（适合 Hackathon 演示）
4. 完整的技术实现（可无缝切换到真实支付）

---

## 快速开始

### 1. 注册 Every.org 开发者账户

访问：https://www.every.org/charity-api

1. 创建账户（5 分钟）
2. 访问开发者控制台
3. 获取 API Key（立即可用）

### 2. 环境变量配置

```bash
# .dev.vars (Cloudflare 本地开发)
EVERYORG_API_KEY=your_api_key_here
EVERYORG_BASE_URL=https://partners.every.org/v0.2
```

```bash
# 生产环境
wrangler secret put EVERYORG_API_KEY
```

---

## API 端点说明

### Nonprofit Search API

**搜索公益组织**

```http
GET https://partners.every.org/v0.2/search/{query}
```

**参数**：
- `query`: 搜索关键词（如 "climate", "education", "amazon rainforest"）

**响应示例**：
```json
{
  "nonprofits": [
    {
      "name": "Rainforest Foundation US",
      "slug": "rainforest-foundation-us",
      "ein": "13-3377893",
      "description": "Protecting rainforests and indigenous rights",
      "profileUrl": "https://www.every.org/rainforest-foundation-us",
      "logoUrl": "https://res.cloudinary.com/...",
      "coverImageUrl": "https://res.cloudinary.com/...",
      "matchedTerms": ["rainforest", "climate"]
    }
  ]
}
```

### Nonprofit Details API

**获取单个组织详情**

```http
GET https://partners.every.org/v0.2/nonprofit/{slug}
```

**响应示例**：
```json
{
  "nonprofit": {
    "id": "rainforest-foundation-us",
    "name": "Rainforest Foundation US",
    "ein": "13-3377893",
    "description": "详细描述...",
    "websiteUrl": "https://rainforestfoundation.org",
    "profileUrl": "https://www.every.org/rainforest-foundation-us",
    "logoUrl": "...",
    "coverImageUrl": "...",
    "nteeCode": "C34",
    "nteeCodeMeaning": "Land Resources Conservation"
  },
  "data": {
    "stats": {
      "totalRaised": 250000,
      "totalDonors": 1234
    }
  }
}
```

---

## 数据库 Schema 更新

### Projects 表

```typescript
export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),

  // Every.org 关联字段
  everyorgSlug: text('everyorg_slug').unique(), // 如 "rainforest-foundation-us"
  everyorgEin: text('everyorg_ein'),             // 税号
  everyorgLogoUrl: text('everyorg_logo_url'),
  everyorgCoverUrl: text('everyorg_cover_url'),

  // 筹款目标（可以自定义或使用 Every.org 数据）
  targetAmount: real('target_amount').notNull().default(10000),
  currentAmount: real('current_amount').default(0),

  // 画布配置
  gridSize: integer('grid_size').notNull().default(100),
  pixelsTotal: integer('pixels_total').notNull().default(10000),
  pixelsFilled: integer('pixels_filled').default(0),

  status: text('status', { enum: ['ACTIVE', 'COMPLETED'] }).default('ACTIVE'),

  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

### Donations 表（保持不变）

```typescript
export const donations = sqliteTable('donations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull().references(() => users.id),

  amount: real('amount').notNull(),
  pixelsAwarded: integer('pixels_awarded').notNull(),
  message: text('message'),

  // 模拟捐款标记
  isSimulated: integer('is_simulated', { mode: 'boolean' }).default(true),

  status: text('status', { enum: ['PENDING', 'SUCCESS', 'FAILED'] }).default('SUCCESS'),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

---

## 实现代码

### 1. Every.org API 客户端

```typescript
// lib/everyorg/client.ts
export class EveryOrgClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://partners.every.org/v0.2') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Every.org API error: ${response.statusText}`);
    }

    return response.json();
  }

  // 搜索公益组织
  async searchNonprofits(query: string) {
    return this.request<{
      nonprofits: Array<{
        name: string;
        slug: string;
        ein: string;
        description: string;
        profileUrl: string;
        logoUrl: string;
        coverImageUrl: string;
      }>;
    }>(`/search/${encodeURIComponent(query)}`);
  }

  // 获取组织详情
  async getNonprofit(slug: string) {
    return this.request<{
      nonprofit: {
        id: string;
        name: string;
        ein: string;
        description: string;
        websiteUrl: string;
        logoUrl: string;
        coverImageUrl: string;
      };
      data: {
        stats: {
          totalRaised: number;
          totalDonors: number;
        };
      };
    }>(`/nonprofit/${slug}`);
  }
}
```

### 2. 同步 Every.org 项目数据

```typescript
// app/api/projects/sync-everyorg/route.ts
import { EveryOrgClient } from '@/lib/everyorg/client';
import { db } from '@/lib/db';
import { projects } from '@/lib/db/schema';

export async function POST(request: Request) {
  const { query, targetAmount = 10000 } = await request.json();

  const client = new EveryOrgClient(process.env.EVERYORG_API_KEY!);

  // 搜索公益组织
  const { nonprofits } = await client.searchNonprofits(query);

  // 导入前 5 个组织作为项目
  const imported = [];

  for (const nonprofit of nonprofits.slice(0, 5)) {
    const projectId = crypto.randomUUID();

    const [project] = await db.insert(projects).values({
      id: projectId,
      title: nonprofit.name,
      description: nonprofit.description,
      everyorgSlug: nonprofit.slug,
      everyorgEin: nonprofit.ein,
      everyorgLogoUrl: nonprofit.logoUrl,
      everyorgCoverUrl: nonprofit.coverImageUrl,
      targetAmount,
      currentAmount: 0,
      gridSize: 100,
      pixelsTotal: 10000,
      status: 'ACTIVE',
      lastSyncedAt: new Date(),
    }).returning();

    imported.push(project);
  }

  return Response.json({
    success: true,
    imported: imported.length,
    projects: imported,
  });
}
```

### 3. 模拟捐款 API

```typescript
// app/api/donations/simulate/route.ts
import { db } from '@/lib/db';
import { donations, projects, users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  const { projectId, userId, amount, message } = await request.json();

  // 验证输入
  if (!projectId || !userId || !amount || amount <= 0) {
    return Response.json(
      { error: 'Invalid input' },
      { status: 400 }
    );
  }

  // 获取项目信息
  const [project] = await db.select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project) {
    return Response.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // 计算像素数
  const pixelsAwarded = Math.floor(
    (amount / project.targetAmount) * project.pixelsTotal
  );

  // 创建捐款记录
  const [donation] = await db.insert(donations).values({
    id: crypto.randomUUID(),
    projectId,
    userId,
    amount,
    pixelsAwarded,
    message,
    isSimulated: true,
    status: 'SUCCESS',
    createdAt: new Date(),
  }).returning();

  // 更新项目筹款进度
  await db.update(projects)
    .set({
      currentAmount: sql`${projects.currentAmount} + ${amount}`,
    })
    .where(eq(projects.id, projectId));

  // 更新用户可用像素数
  await db.update(users)
    .set({
      pixelsAvailable: sql`${users.pixelsAvailable} + ${pixelsAwarded}`,
    })
    .where(eq(users.id, userId));

  return Response.json({
    success: true,
    donation: {
      id: donation.id,
      amount: donation.amount,
      pixelsAwarded: donation.pixelsAwarded,
      isSimulated: true,
    },
  });
}
```

### 4. 前端集成示例

```typescript
// app/routes/projects.$id.tsx
import { useState } from 'react';

export default function ProjectPage() {
  const [amount, setAmount] = useState(10);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSimulateDonation = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/donations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          userId: currentUser.id,
          amount,
          message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert(`模拟捐款成功！获得 ${result.donation.pixelsAwarded} 个像素`);
        // 刷新页面或更新状态
        window.location.reload();
      }
    } catch (error) {
      console.error('Donation failed:', error);
      alert('捐款失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="donation-form">
      <div className="demo-badge">
        Demo Mode - 模拟捐款（无真实支付）
      </div>

      <h2>支持 {project.title}</h2>
      <img src={project.everyorgLogoUrl} alt={project.title} />
      <p>{project.description}</p>

      <div className="fundraising-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${(project.currentAmount / project.targetAmount) * 100}%`
            }}
          />
        </div>
        <p>
          ${project.currentAmount.toLocaleString()} / ${project.targetAmount.toLocaleString()}
        </p>
      </div>

      <div className="form-group">
        <label>捐款金额 (USD)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          max="1000"
        />
        <p className="hint">
          将获得约 {Math.floor((amount / project.targetAmount) * project.pixelsTotal)} 个像素
        </p>
      </div>

      <div className="form-group">
        <label>留言（可选）</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="说说你的想法..."
          maxLength={200}
        />
      </div>

      <button
        onClick={handleSimulateDonation}
        disabled={loading || amount <= 0}
        className="btn-primary"
      >
        {loading ? '处理中...' : '模拟捐款'}
      </button>

      <p className="disclaimer">
        这是 Hackathon 演示版本。真实版本将接入 Every.org 支付系统。
      </p>
    </div>
  );
}
```

---

## 初始化种子数据

### 导入真实公益项目

```typescript
// scripts/seed-everyorg.ts
import { EveryOrgClient } from '../lib/everyorg/client';

async function seedEveryOrgProjects() {
  const client = new EveryOrgClient(process.env.EVERYORG_API_KEY!);

  const queries = [
    'climate change',
    'ocean conservation',
    'rainforest',
    'wildlife protection',
    'renewable energy',
  ];

  console.log('Importing Every.org nonprofits...\n');

  for (const query of queries) {
    const response = await fetch('http://localhost:8787/api/projects/sync-everyorg', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        targetAmount: 10000,
      }),
    });

    const result = await response.json();
    console.log(`✓ Imported ${result.imported} projects for "${query}"`);
  }

  console.log('\nSeed completed!');
}

seedEveryOrgProjects();
```

**运行**：
```bash
npx tsx scripts/seed-everyorg.ts
```

---

## 测试流程

### 1. 本地开发测试

```bash
# 启动开发服务器
npm run dev

# 访问 http://localhost:8788
```

### 2. 测试场景

**场景 1：导入真实项目**
```bash
curl -X POST http://localhost:8788/api/projects/sync-everyorg \
  -H "Content-Type: application/json" \
  -d '{"query": "ocean conservation", "targetAmount": 5000}'
```

**场景 2：模拟捐款**
```bash
curl -X POST http://localhost:8788/api/donations/simulate \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "project-id-here",
    "userId": "user-id-here",
    "amount": 50,
    "message": "为海洋出一份力！"
  }'
```

**场景 3：查看项目进度**
```bash
curl http://localhost:8788/api/projects/project-id-here
```

---

## UI/UX 建议

### Demo 模式标识

在所有捐款相关页面显示明显标识：

```tsx
<div className="demo-banner">
  <span className="badge">Demo Mode</span>
  <p>
    本项目使用 Every.org 真实公益数据，捐款流程为演示用途（无真实支付）。
    生产环境将接入完整的支付系统。
  </p>
</div>
```

### 样式参考

```css
.demo-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.demo-banner .badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
```

---

## Hackathon 演示要点

### 开场白（30秒）

> "我们的平台连接了 Every.org 上的**100万+真实公益组织**。
>
> 这些是真实的环保项目，真实的筹款目标。
>
> 我们演示的是捐款流程，生产环境将接入完整支付系统。"

### 核心演示（3分钟）

1. **展示真实项目**
   - "这是 Rainforest Foundation US，真实存在的雨林保护组织"
   - 显示 Every.org 官网链接
   - 展示项目目标：$10,000

2. **模拟捐款**
   - 输入 $50
   - 系统计算：获得 50 个像素
   - 立即更新进度条

3. **放置像素**
   - 使用刚获得的像素绘制树木
   - 展示实时画布更新

4. **查看贡献**
   - 排行榜：显示模拟捐款总额
   - 个人页：显示捐款历史

### 技术亮点（2分钟）

- "使用 Every.org API 获取真实数据"
- "Cloudflare D1 存储捐款记录"
- "像素分配算法：donation / target × total_pixels"
- "可无缝切换到真实支付（Webhook 集成）"

---

## 生产环境切换指南

### 从模拟到真实支付

当需要切换到真实支付时：

1. **联系 Every.org 配置 Webhook**
   ```
   Email: support@every.org
   Subject: Webhook Setup for Production
   Content:
   - Webhook URL: https://your-app.com/api/webhooks/everyorg
   - Use case: Pixel art charity platform
   ```

2. **更新捐款 API**
   ```typescript
   // 将 simulate API 改为生成 Every.org Donate Link
   const donateUrl = `https://www.every.org/${project.everyorgSlug}?
     amount=${amount * 100}&
     webhook_token=${WEBHOOK_TOKEN}&
     partner_donation_id=${donationId}`;

   return Response.json({ donateUrl });
   ```

3. **实现 Webhook 处理**
   ```typescript
   // app/api/webhooks/everyorg/route.ts
   export async function POST(request: Request) {
     const webhook = await request.json();

     // 验证并分配像素
     await assignPixels(webhook.partnerDonationId, webhook.amount);

     return Response.json({ success: true });
   }
   ```

---

## FAQ

### Q1: 为什么选择 Every.org？
A:
- 立即可用（无需审核等待）
- 100万+ 真实公益组织
- 免费 API
- 完整的技术文档

### Q2: 模拟捐款会影响真实筹款吗？
A: 不会。模拟捐款只在你的数据库中记录，不会影响 Every.org 平台的真实数据。

### Q3: 可以显示真实的筹款进度吗？
A: 可以。使用 `GET /nonprofit/{slug}` API 获取 `totalRaised` 数据，但建议 Hackathon 演示时使用自己的模拟数据，避免混淆。

### Q4: 如何处理货币转换？
A: Every.org 使用 USD。如果需要显示其他货币，可以：
```typescript
const exchangeRate = 7.2; // USD to CNY
const amountCNY = amount * exchangeRate;
```

### Q5: 项目完成后画布怎么办？
A: 设置 `project.status = 'COMPLETED'`，禁止新捐款，但保留画布供查看和分享。

---

## 检查清单

### 开发阶段

- [ ] 注册 Every.org 开发者账户
- [ ] 配置环境变量 `EVERYORG_API_KEY`
- [ ] 运行数据库迁移（添加 `everyorgSlug` 等字段）
- [ ] 实现 API 客户端 (`lib/everyorg/client.ts`)
- [ ] 实现项目同步 API (`/api/projects/sync-everyorg`)
- [ ] 实现模拟捐款 API (`/api/donations/simulate`)
- [ ] 导入种子数据（5-10个真实项目）
- [ ] 创建 Demo 模式标识 UI
- [ ] 测试完整捐款流程

### 演示准备

- [ ] 准备演示脚本
- [ ] 预先导入精选项目（环保主题）
- [ ] 创建测试账户和捐款数据
- [ ] 录制 demo 视频
- [ ] 准备架构图（显示 Every.org 集成）

### 文档

- [ ] 更新 `CLAUDE.md` 捐款流程说明
- [ ] 在 `docs/README.md` 添加本文档链接
- [ ] 准备 Hackathon 提交文档

---

## 相关链接

- **Every.org 官网**: https://www.every.org
- **API 文档**: https://docs.every.org
- **开发者控制台**: https://www.every.org/charity-api
- **GitHub**: https://github.com/everydotorg/charity-api-docs

---

**版本**: V1.0 | **最后更新**: 2025-12-11 | **状态**: 立即可用
