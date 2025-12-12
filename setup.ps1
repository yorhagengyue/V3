# Pixel Canvas for Change - 一键启动脚本
# 适用于 Windows PowerShell

Write-Host "🎨 Pixel Canvas for Change - 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 检查 Node.js
try {
    $nodeVersion = node -v
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未安装 Node.js" -ForegroundColor Red
    Write-Host "请访问 https://nodejs.org/ 安装 Node.js 18+" -ForegroundColor Yellow
    exit 1
}

# 检查 Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ 错误: 未安装 Docker" -ForegroundColor Red
    Write-Host "请访问 https://www.docker.com/ 安装 Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# 步骤 1: 安装依赖
Write-Host ""
Write-Host "📦 步骤 1/5: 安装依赖..." -ForegroundColor Yellow
npm install

# 步骤 2: 启动数据库
Write-Host ""
Write-Host "🐘 步骤 2/5: 启动 PostgreSQL 数据库..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "⏳ 等待数据库启动 (15 秒)..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 步骤 3: 生成 Prisma Client
Write-Host ""
Write-Host "🔧 步骤 3/5: 生成 Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# 步骤 4: 运行数据库迁移
Write-Host ""
Write-Host "🗄️  步骤 4/5: 运行数据库迁移..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# 步骤 5: 填充种子数据
Write-Host ""
Write-Host "🌱 步骤 5/5: 填充种子数据..." -ForegroundColor Yellow
npm run db:seed

# 完成
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ 设置完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📍 下一步：" -ForegroundColor Cyan
Write-Host "  1. 启动开发服务器: npm run dev"
Write-Host "  2. 访问: http://localhost:3000"
Write-Host ""
Write-Host "💡 测试账户：" -ForegroundColor Cyan
Write-Host "  - alice@example.com (50 代币)"
Write-Host "  - bob@example.com (30 代币)"
Write-Host ""
Write-Host "🔍 查看数据库: npx prisma studio"
Write-Host "📖 查看文档: QUICKSTART.md"
Write-Host "========================================" -ForegroundColor Cyan

