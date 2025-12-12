#!/bin/bash

# Pixel Canvas for Change - 一键启动脚本
# 适用于 Mac/Linux

set -e

echo "🎨 Pixel Canvas for Change - 启动脚本"
echo "========================================"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    echo "请访问 https://nodejs.org/ 安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node -v)"

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ 错误: 未安装 Docker"
    echo "请访问 https://www.docker.com/ 安装 Docker"
    exit 1
fi

echo "✅ Docker 已安装"

# 步骤 1: 安装依赖
echo ""
echo "📦 步骤 1/5: 安装依赖..."
npm install

# 步骤 2: 启动数据库
echo ""
echo "🐘 步骤 2/5: 启动 PostgreSQL 数据库..."
docker-compose up -d

echo "⏳ 等待数据库启动 (15 秒)..."
sleep 15

# 步骤 3: 生成 Prisma Client
echo ""
echo "🔧 步骤 3/5: 生成 Prisma Client..."
npx prisma generate

# 步骤 4: 运行数据库迁移
echo ""
echo "🗄️  步骤 4/5: 运行数据库迁移..."
npx prisma migrate dev --name init

# 步骤 5: 填充种子数据
echo ""
echo "🌱 步骤 5/5: 填充种子数据..."
npm run db:seed

# 完成
echo ""
echo "========================================"
echo "✅ 设置完成！"
echo ""
echo "📍 下一步："
echo "  1. 启动开发服务器: npm run dev"
echo "  2. 访问: http://localhost:3000"
echo ""
echo "💡 测试账户："
echo "  - alice@example.com (50 代币)"
echo "  - bob@example.com (30 代币)"
echo ""
echo "🔍 查看数据库: npx prisma studio"
echo "📖 查看文档: QUICKSTART.md"
echo "========================================"

