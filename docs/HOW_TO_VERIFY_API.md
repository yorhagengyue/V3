# 如何验证 API 集成

## 快速测试

运行以下命令来测试 Every.org API 是否正常工作：

```bash
npm run test:api
```

## 预期输出

如果 API 正常工作，你应该看到：

```
🧪 Testing Every.org API Integration...

============================================================
  Every.org API Integration Test Suite
============================================================

📍 Test 1: Search Nonprofits
Query: "rainforest"

✅ Success! Found 3 nonprofits

Results:
  1. Rainforest Trust
     Slug: rainforest-trust
     Description: Rainforest Trust saves endangered wildlife and protects our planet...

📍 Test 2: Get Nonprofit Details
Slug: "rainforest-trust"

✅ Success! Retrieved organization details

Details:
  Name: Rainforest Trust
  EIN: 13-3500609
  Website: https://www.rainforesttrust.org
  Logo: https://res.cloudinary.com/everydotorg/...
  Profile: https://www.every.org/rainforest-trust

📍 Test 3: Generate Donation Link

✅ Donation link generated:
   https://www.every.org/rainforest-trust/donate?amount=25

============================================================
  Test Results Summary
============================================================

  Search Nonprofits:     ✅ PASS
  Get Nonprofit Details: ✅ PASS
  Donation Link:         ✅ PASS

🎉 All tests passed! Every.org API is working correctly.

📝 Notes:
   - Organization data is REAL (from Every.org)
   - Donation links are REAL (redirect to Every.org)
   - In-app donations are SIMULATED (demo mode)
```

## 手动验证步骤

### 1. 检查项目数据

访问项目列表页面并查看：
- ✅ 项目卡片显示 "Verified Nonprofit" 标签
- ✅ 组织 Logo 正常加载（来自 Every.org CDN）
- ✅ 项目描述是真实的慈善组织信息

### 2. 测试捐款流程

1. 进入任一项目的画布页面
2. 点击 "Get Tokens" 按钮
3. 你会看到两个选项：
   - **"Simulate Donation (Demo)"** - 模拟捐款，仅用于测试
   - **"Donate on Every.org"** - 真实捐款链接

### 3. 验证真实捐款链接

点击 "Donate on Every.org" 按钮：
- ✅ 应该跳转到 `https://www.every.org/rainforest-trust/donate`
- ✅ 页面显示真实的 Rainforest Trust 组织信息
- ✅ 可以进行真实的在线捐款

## 数据来源说明

### ✅ 真实数据
- 组织名称：Rainforest Trust
- 组织 Logo：从 Every.org CDN 获取
- 组织描述：从 Every.org API 获取
- 捐款链接：指向 Every.org 官方页面

### ❌ 模拟数据
- 应用内募款金额（$100 起始 + 用户模拟捐款）
- Pixel tokens 系统（完全是应用内的游戏化机制）
- 用户通过 "Simulate Donation" 的捐款记录

## 为什么使用混合模式？

1. **降低试用门槛**：用户可以免费体验完整的像素画布功能
2. **保护隐私**：不处理真实支付信息，无需 PCI DSS 合规
3. **展示真实项目**：使用真实的慈善组织数据建立信任
4. **提供真实选项**：用户随时可以跳转到 Every.org 进行真实捐款

## 如何接入真实支付？

如果需要在应用内处理真实捐款，需要：

1. 集成支付网关（Stripe / PayPal / Every.org Payment API）
2. 获取支付处理许可证
3. 实现 PCI DSS 合规性
4. 添加支付验证和失败处理逻辑
5. 实现税务报告和合规性要求

详见 `docs/API_INTEGRATION_STATUS.md` 获取完整说明。

## 常见问题

### Q: 应用内显示的募款金额是真实的吗？
**A:** 不是。应用内的金额来自模拟捐款，仅用于 Demo 展示。

### Q: 我可以进行真实捐款吗？
**A:** 可以！点击 "Donate on Every.org" 按钮，会跳转到真实的捐款页面。

### Q: Rainforest Trust 是真实的组织吗？
**A:** 是的！这是一个真实的国际环保组织，EIN: 13-3500609。

### Q: API 密钥是否正确配置？
**A:** 运行 `npm run test:api` 来验证。

## 更多信息

- [Every.org 官网](https://www.every.org)
- [Rainforest Trust 页面](https://www.every.org/rainforest-trust)
- [Every.org API 文档](https://docs.every.org)

