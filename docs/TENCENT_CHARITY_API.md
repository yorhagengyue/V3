# 腾讯公益 API 接入指南

## 平台概述

**腾讯公益开放平台** 为第三方应用提供了一系列 API，用于公益项目数据查询和捐款处理。

**官方文档：** https://open.gongyi.qq.com/docs/

**联系方式：** 通过开放平台后台提交工单

---

## 为什么选择腾讯公益

### 优势

1. **可量化目标**
   - 每个公益项目都有明确的筹款目标金额
   - 实时查询已筹金额和进度
   - 捐款人数统计

2. **可验证捐款**
   - 支付成功后服务器回调验证
   - 防止伪造和重复提交
   - 完整的订单查询 API

3. **用户信任度高**
   - 腾讯官方公益平台
   - 微信生态集成
   - 透明的资金流向

4. **零成本**
   - 免费 API 调用
   - 无需公司注册费
   - 资金直达公益组织

---

## 注册流程

### 第 1 步：注册开放平台账号

1. **访问：** https://open.gongyi.qq.com/

2. **注册账号：**
   - 使用 QQ 或微信登录
   - 完善开发者信息
   - 绑定手机号

3. **创建应用：**
   - 应用名称：Pixel Canvas for Change
   - 应用类型：Web 应用
   - 应用简介：公益像素画布平台
   - 应用网址：https://your-domain.com

### 第 2 步：开发者认证

**企业认证（推荐）：**
```
所需材料：
- 营业执照扫描件
- 法人身份证
- 对公银行账户信息

审核时间：3-5 个工作日
```

**个人认证（部分接口支持）：**
```
所需材料：
- 身份证正反面
- 手机号验证

审核时间：1-2 个工作日

注意：个人认证可能无法使用支付相关 API
```

### 第 3 步：申请 API 权限

1. **进入应用管理：**
   - 选择已创建的应用
   - 点击"API 权限管理"

2. **申请以下权限：**
   - 项目信息查询
   - 支付接入
   - 订单查询
   - 用户信息（可选）

3. **填写申请说明：**
   ```
   应用场景：
   公益像素画布平台，用户通过捐款获得像素绘制权，
   需要查询公益项目信息并验证用户捐款。

   预计调用量：
   初期 < 1000 次/天，未来可能增长至 10000 次/天

   数据用途：
   - 展示公益项目信息和筹款进度
   - 验证用户捐款金额
   - 根据捐款比例分配像素权
   ```

4. **审核时间：** 5-10 个工作日

### 第 4 步：获取密钥

**审核通过后：**
```
应用管理 → 密钥管理

获取：
- AppID: 应用唯一标识
- AppSecret: 应用密钥（保密）
- 沙箱环境密钥（测试用）
```

---

## API 接入

### 环境配置

#### 沙箱环境（测试）
```
API Base URL: https://sandbox.gongyi.qq.com/api
AppID: sandbox_xxx
AppSecret: sandbox_yyy
```

#### 生产环境
```
API Base URL: https://api.gongyi.qq.com/api
AppID: your_app_id
AppSecret: your_app_secret
```

#### 环境变量配置

```bash
# .env
TENCENT_CHARITY_ENV=sandbox  # 或 production
TENCENT_CHARITY_APP_ID=your_app_id
TENCENT_CHARITY_APP_SECRET=your_app_secret
TENCENT_CHARITY_CALLBACK_URL=https://your-domain.com/api/callback/tencent
```

---

### 核心 API 接口

#### 1. 获取项目列表

```typescript
// GET /api/projects/list
// 查询可用的公益项目

const response = await fetch(
  'https://api.gongyi.qq.com/api/projects/list',
  {
    headers: {
      'AppID': process.env.TENCENT_CHARITY_APP_ID,
      'Timestamp': Date.now().toString(),
      'Sign': generateSign(params, secret)
    }
  }
);

// Response
{
  "code": 0,
  "message": "success",
  "data": {
    "projects": [
      {
        "project_id": "123456",
        "project_name": "拯救亚马逊雨林",
        "target_amount": 10000000,  // 分（100,000 元）
        "raised_amount": 3500000,   // 已筹（35,000 元）
        "donor_count": 234,
        "status": "ongoing",
        "cover_image": "https://...",
        "description": "..."
      }
    ]
  }
}
```

#### 2. 获取项目详情

```typescript
// GET /api/projects/info?project_id=123456

interface ProjectDetail {
  project_id: string;
  project_name: string;
  target_amount: number;      // 目标金额（分）
  raised_amount: number;      // 已筹金额（分）
  remaining_amount: number;   // 剩余金额（分）
  donor_count: number;        // 捐款人数
  percent_funded: number;     // 完成百分比
  status: 'ongoing' | 'completed' | 'paused';
  organization: {
    name: string;
    license: string;
  };
  start_time: number;
  end_time: number;
  cover_image: string;
  detail_images: string[];
  description: string;
}
```

#### 3. 创建捐款订单

```typescript
// POST /api/payment/create

const orderData = {
  app_id: process.env.TENCENT_CHARITY_APP_ID,
  project_id: '123456',
  amount: 10000,              // 分（100 元）
  user_id: 'user-1',          // 你的系统用户 ID
  notify_url: process.env.TENCENT_CHARITY_CALLBACK_URL,
  return_url: 'https://your-domain.com/canvas/project-1',
  timestamp: Date.now(),
  sign: generateSign(orderData, secret)
};

const response = await fetch(
  'https://api.gongyi.qq.com/api/payment/create',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  }
);

// Response
{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": "202512110001",
    "payment_url": "https://gongyi.qq.com/pay?order_id=xxx",
    "qr_code": "https://...",  // 二维码支付
    "expire_time": 1234567890
  }
}
```

#### 4. 支付回调验证

```typescript
// POST https://your-domain.com/api/callback/tencent
// 腾讯公益服务器回调

{
  "app_id": "your_app_id",
  "order_id": "202512110001",
  "project_id": "123456",
  "amount": 10000,           // 实际支付金额（分）
  "user_id": "user-1",       // 你的系统用户 ID
  "status": "SUCCESS",       // SUCCESS | FAILED
  "pay_time": 1234567890,
  "transaction_id": "wx_xxx", // 微信交易号
  "timestamp": 1234567890,
  "sign": "abc123..."        // 签名验证
}

// 验证签名
const isValid = verifySign(callbackData, secret);
if (isValid && callbackData.status === 'SUCCESS') {
  // 分配像素权
  await assignPixelCredits(callbackData.user_id, callbackData.amount);
}

// 必须返回
return { code: 0, message: 'success' };
```

#### 5. 查询订单状态

```typescript
// GET /api/payment/query?order_id=202512110001

{
  "code": 0,
  "message": "success",
  "data": {
    "order_id": "202512110001",
    "status": "SUCCESS",
    "amount": 10000,
    "pay_time": 1234567890,
    "transaction_id": "wx_xxx"
  }
}
```

---

## 签名算法

### 生成签名（发送请求时）

```typescript
// lib/tencent-charity/sign.ts

import crypto from 'crypto';

export function generateSign(params: Record<string, any>, secret: string): string {
  // 1. 参数排序
  const sortedKeys = Object.keys(params).sort();

  // 2. 拼接字符串
  let signString = '';
  sortedKeys.forEach(key => {
    if (params[key] !== undefined && params[key] !== '') {
      signString += `${key}=${params[key]}&`;
    }
  });

  // 3. 添加密钥
  signString += `key=${secret}`;

  // 4. MD5 加密并转大写
  const sign = crypto
    .createHash('md5')
    .update(signString, 'utf8')
    .digest('hex')
    .toUpperCase();

  return sign;
}

// 使用示例
const params = {
  app_id: 'your_app_id',
  project_id: '123456',
  amount: 10000,
  timestamp: Date.now()
};

const sign = generateSign(params, process.env.TENCENT_CHARITY_APP_SECRET);
```

### 验证签名（接收回调时）

```typescript
export function verifySign(
  data: Record<string, any>,
  receivedSign: string,
  secret: string
): boolean {
  // 从数据中移除 sign 字段
  const { sign, ...params } = data;

  // 重新生成签名
  const calculatedSign = generateSign(params, secret);

  // 对比签名
  return calculatedSign === receivedSign;
}
```

---

## 完整代码实现

### 1. API 客户端封装

```typescript
// lib/tencent-charity/client.ts

import { generateSign } from './sign';

const BASE_URL = process.env.TENCENT_CHARITY_ENV === 'production'
  ? 'https://api.gongyi.qq.com/api'
  : 'https://sandbox.gongyi.qq.com/api';

const APP_ID = process.env.TENCENT_CHARITY_APP_ID!;
const APP_SECRET = process.env.TENCENT_CHARITY_APP_SECRET!;

interface TencentCharityClient {
  getProjects(): Promise<any>;
  getProjectDetail(projectId: string): Promise<any>;
  createPayment(params: any): Promise<any>;
  queryOrder(orderId: string): Promise<any>;
}

export const tencentCharity: TencentCharityClient = {
  async getProjects() {
    const params = {
      app_id: APP_ID,
      timestamp: Date.now()
    };

    const sign = generateSign(params, APP_SECRET);

    const response = await fetch(`${BASE_URL}/projects/list`, {
      headers: {
        'AppID': APP_ID,
        'Timestamp': params.timestamp.toString(),
        'Sign': sign
      }
    });

    return response.json();
  },

  async getProjectDetail(projectId: string) {
    const params = {
      app_id: APP_ID,
      project_id: projectId,
      timestamp: Date.now()
    };

    const sign = generateSign(params, APP_SECRET);

    const url = new URL(`${BASE_URL}/projects/info`);
    url.searchParams.append('project_id', projectId);

    const response = await fetch(url.toString(), {
      headers: {
        'AppID': APP_ID,
        'Timestamp': params.timestamp.toString(),
        'Sign': sign
      }
    });

    return response.json();
  },

  async createPayment(params: {
    projectId: string;
    amount: number;
    userId: string;
  }) {
    const orderData = {
      app_id: APP_ID,
      project_id: params.projectId,
      amount: params.amount,
      user_id: params.userId,
      notify_url: process.env.TENCENT_CHARITY_CALLBACK_URL,
      return_url: `${process.env.APP_URL}/canvas/${params.projectId}`,
      timestamp: Date.now()
    };

    const sign = generateSign(orderData, APP_SECRET);

    const response = await fetch(`${BASE_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...orderData, sign })
    });

    return response.json();
  },

  async queryOrder(orderId: string) {
    const params = {
      app_id: APP_ID,
      order_id: orderId,
      timestamp: Date.now()
    };

    const sign = generateSign(params, APP_SECRET);

    const url = new URL(`${BASE_URL}/payment/query`);
    url.searchParams.append('order_id', orderId);

    const response = await fetch(url.toString(), {
      headers: {
        'AppID': APP_ID,
        'Timestamp': params.timestamp.toString(),
        'Sign': sign
      }
    });

    return response.json();
  }
};
```

### 2. 数据库 Schema 更新

```typescript
// db/schema.ts

export const projects = sqliteTable('projects', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),

  // 关联腾讯公益项目
  tencentProjectId: text('tencent_project_id'),

  // 量化目标（从腾讯公益同步）
  targetAmount: real('target_amount').notNull(),
  currentAmount: real('current_amount').default(0),

  // 画布配置
  gridSize: integer('grid_size').notNull(),
  pixelsTotal: integer('pixels_total').notNull(),
  pixelsFilled: integer('pixels_filled').default(0),

  // 同步时间
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),

  status: text('status', { enum: ['ACTIVE', 'COMPLETED'] }).default('ACTIVE'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const donations = sqliteTable('donations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  projectId: text('project_id').notNull().references(() => projects.id),
  userId: text('user_id').notNull().references(() => users.id),

  // 腾讯公益订单信息
  tencentOrderId: text('tencent_order_id').unique(),
  tencentTransactionId: text('tencent_transaction_id'),

  amount: real('amount').notNull(),
  pixelsAwarded: integer('pixels_awarded').notNull(),

  status: text('status', {
    enum: ['PENDING', 'SUCCESS', 'FAILED']
  }).default('PENDING'),

  paymentTime: integer('payment_time', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
```

### 3. API 路由实现

```typescript
// app/api/donations/create/route.ts

import { tencentCharity } from '@/lib/tencent-charity/client';
import { db } from '@/db';
import { donations, projects } from '@/db/schema';

export async function POST(request: Request) {
  const { projectId, amount, userId } = await request.json();

  // 1. 获取项目信息
  const [project] = await db.select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!project || !project.tencentProjectId) {
    return Response.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // 2. 创建腾讯公益支付订单
  const paymentResult = await tencentCharity.createPayment({
    projectId: project.tencentProjectId,
    amount: amount * 100, // 转换为分
    userId
  });

  if (paymentResult.code !== 0) {
    return Response.json(
      { error: paymentResult.message },
      { status: 500 }
    );
  }

  // 3. 计算应分配的像素数
  const pixelsAwarded = Math.floor(
    (amount / project.targetAmount) * project.pixelsTotal
  );

  // 4. 创建捐款记录（待支付）
  const [donation] = await db.insert(donations).values({
    projectId,
    userId,
    tencentOrderId: paymentResult.data.order_id,
    amount,
    pixelsAwarded,
    status: 'PENDING'
  }).returning();

  // 5. 返回支付信息
  return Response.json({
    success: true,
    data: {
      donationId: donation.id,
      orderId: paymentResult.data.order_id,
      paymentUrl: paymentResult.data.payment_url,
      qrCode: paymentResult.data.qr_code,
      pixelsAwarded
    }
  });
}
```

### 4. 支付回调处理

```typescript
// app/api/callback/tencent/route.ts

import { verifySign } from '@/lib/tencent-charity/sign';
import { db } from '@/db';
import { donations, pixelCredits, projects } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(request: Request) {
  const callbackData = await request.json();

  // 1. 验证签名
  const isValid = verifySign(
    callbackData,
    callbackData.sign,
    process.env.TENCENT_CHARITY_APP_SECRET!
  );

  if (!isValid) {
    return Response.json(
      { code: -1, message: 'Invalid signature' },
      { status: 401 }
    );
  }

  // 2. 查找捐款记录
  const [donation] = await db.select()
    .from(donations)
    .where(eq(donations.tencentOrderId, callbackData.order_id))
    .limit(1);

  if (!donation) {
    return Response.json(
      { code: -1, message: 'Donation not found' },
      { status: 404 }
    );
  }

  // 3. 如果已处理，直接返回成功
  if (donation.status === 'SUCCESS') {
    return Response.json({ code: 0, message: 'success' });
  }

  // 4. 更新捐款状态
  if (callbackData.status === 'SUCCESS') {
    await db.update(donations)
      .set({
        status: 'SUCCESS',
        tencentTransactionId: callbackData.transaction_id,
        paymentTime: new Date(callbackData.pay_time * 1000)
      })
      .where(eq(donations.id, donation.id));

    // 5. 分配像素权
    const [existingCredits] = await db.select()
      .from(pixelCredits)
      .where(
        and(
          eq(pixelCredits.userId, donation.userId),
          eq(pixelCredits.projectId, donation.projectId)
        )
      )
      .limit(1);

    if (existingCredits) {
      // 增加现有像素权
      await db.update(pixelCredits)
        .set({
          totalCredits: existingCredits.totalCredits + donation.pixelsAwarded,
          remainingCredits: existingCredits.remainingCredits + donation.pixelsAwarded
        })
        .where(eq(pixelCredits.id, existingCredits.id));
    } else {
      // 创建新的像素权记录
      await db.insert(pixelCredits).values({
        userId: donation.userId,
        projectId: donation.projectId,
        totalCredits: donation.pixelsAwarded,
        remainingCredits: donation.pixelsAwarded
      });
    }

    // 6. 更新项目筹款金额
    await db.update(projects)
      .set({
        currentAmount: sql`${projects.currentAmount} + ${donation.amount}`
      })
      .where(eq(projects.id, donation.projectId));

    console.log(`✅ Donation ${donation.id} processed: ${donation.amount} yuan, ${donation.pixelsAwarded} pixels awarded`);
  } else {
    // 支付失败
    await db.update(donations)
      .set({ status: 'FAILED' })
      .where(eq(donations.id, donation.id));
  }

  // 7. 必须返回成功响应
  return Response.json({ code: 0, message: 'success' });
}
```

### 5. 同步项目数据

```typescript
// app/api/projects/sync/route.ts

import { tencentCharity } from '@/lib/tencent-charity/client';
import { db } from '@/db';
import { projects } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  const { projectId } = await request.json();

  // 1. 获取本地项目
  const [localProject] = await db.select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);

  if (!localProject || !localProject.tencentProjectId) {
    return Response.json(
      { error: 'Project not found' },
      { status: 404 }
    );
  }

  // 2. 从腾讯公益获取最新数据
  const result = await tencentCharity.getProjectDetail(
    localProject.tencentProjectId
  );

  if (result.code !== 0) {
    return Response.json(
      { error: result.message },
      { status: 500 }
    );
  }

  const tencentProject = result.data;

  // 3. 更新本地数据
  await db.update(projects)
    .set({
      currentAmount: tencentProject.raised_amount / 100, // 分转元
      lastSyncedAt: new Date(),
      status: tencentProject.status === 'completed' ? 'COMPLETED' : 'ACTIVE'
    })
    .where(eq(projects.id, projectId));

  // 4. 返回更新后的数据
  return Response.json({
    success: true,
    data: {
      targetAmount: tencentProject.target_amount / 100,
      currentAmount: tencentProject.raised_amount / 100,
      percentFunded: tencentProject.percent_funded,
      donorCount: tencentProject.donor_count
    }
  });
}
```

---

## 测试流程

### 1. 沙箱环境测试

```bash
# 设置环境变量
export TENCENT_CHARITY_ENV=sandbox
export TENCENT_CHARITY_APP_ID=sandbox_xxx
export TENCENT_CHARITY_APP_SECRET=sandbox_yyy

# 启动开发服务器
npm run dev
```

### 2. 测试步骤

```typescript
// 1. 获取测试项目
const projects = await tencentCharity.getProjects();
console.log('测试项目:', projects);

// 2. 创建测试订单
const payment = await tencentCharity.createPayment({
  projectId: 'test_project_123',
  amount: 100, // 1 元
  userId: 'test_user_1'
});

console.log('支付链接:', payment.data.payment_url);

// 3. 使用沙箱测试账号完成支付

// 4. 验证回调
// 沙箱环境会自动触发回调到你的 notify_url

// 5. 查询订单状态
const order = await tencentCharity.queryOrder(payment.data.order_id);
console.log('订单状态:', order);
```

### 3. 回调测试

```bash
# 使用 ngrok 暴露本地服务器
ngrok http 3000

# 更新回调 URL
# https://xxx.ngrok.io/api/callback/tencent

# 手动触发测试回调
curl -X POST https://your-domain.com/api/callback/tencent \
  -H "Content-Type: application/json" \
  -d '{
    "app_id": "your_app_id",
    "order_id": "test_order_123",
    "project_id": "test_project_123",
    "amount": 10000,
    "user_id": "test_user_1",
    "status": "SUCCESS",
    "pay_time": 1234567890,
    "transaction_id": "wx_test_123",
    "timestamp": 1234567890,
    "sign": "calculated_sign"
  }'
```

---

## 上线清单

### 申请审核前

- [ ] 完成开发者认证
- [ ] 申请所有必要的 API 权限
- [ ] 在沙箱环境完整测试所有流程
- [ ] 准备应用截图和说明文档
- [ ] 配置生产环境回调 URL（HTTPS）

### 审核通过后

- [ ] 获取生产环境密钥
- [ ] 更新环境变量
- [ ] 测试生产环境连通性
- [ ] 小额真实捐款测试
- [ ] 监控日志和错误

### 正式上线

- [ ] 切换到生产环境
- [ ] 设置监控和告警
- [ ] 准备客服支持
- [ ] 文档和用户指引

---

## 常见问题

### Q: 个人开发者能否使用支付接口？
**A:** 部分接口需要企业认证。建议：
1. 先完成项目查询等基础接口
2. Hackathon 使用模拟支付
3. 真实运营时注册公司或找合作伙伴

### Q: 回调 URL 必须是 HTTPS 吗？
**A:** 生产环境必须是 HTTPS。开发测试可以用 ngrok 等工具。

### Q: 如何处理回调重复？
**A:** 检查订单状态，如果已处理直接返回成功：
```typescript
if (donation.status === 'SUCCESS') {
  return Response.json({ code: 0, message: 'success' });
}
```

### Q: 签名验证失败怎么办？
**A:** 检查：
1. 参数排序是否正确
2. 密钥是否正确
3. 时间戳是否过期（通常 5 分钟有效）

### Q: 可以自定义捐款金额吗？
**A:** 可以，但通常有最低限额（如 1 元）。

---

## 下一步

1. **注册腾讯公益开放平台**（立即开始）
2. **申请沙箱环境**（1-2 天）
3. **集成基础 API**（项目查询）
4. **实现支付流程**（沙箱测试）
5. **申请生产环境**（提前 1 周）

需要帮助请参考：
- 官方文档：https://open.gongyi.qq.com/docs/
- 本项目文档：CLAUDE.md
- 技术栈文档：CLOUDFLARE_STACK.md

---

**版本**: V1.0
**最后更新**: 2025-12-11
**状态**: Draft
