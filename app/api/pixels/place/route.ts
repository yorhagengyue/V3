import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { projectId, positionX, positionY, color, message } = await request.json()

    // 验证输入
    if (!projectId || positionX === undefined || positionY === undefined || !color) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 检查用户代币
      const userTokens = await tx.userTokens.findUnique({
        where: {
          userId_projectId: {
            userId: session.userId!,
            projectId,
          },
        },
      })

      if (!userTokens || userTokens.balance < 1) {
        throw new Error('INSUFFICIENT_TOKENS')
      }

      // 2. 检查冷却
      const now = new Date()
      if (userTokens.cooldownUntil && new Date(userTokens.cooldownUntil) > now) {
        const remaining = Math.ceil(
          (new Date(userTokens.cooldownUntil).getTime() - now.getTime()) / 1000
        )
        throw new Error(`COOLDOWN_ACTIVE:${remaining}`)
      }

      // 3. 获取用户信息
      const user = await tx.user.findUnique({
        where: { id: session.userId! },
      })

      // 4. 查找现有像素
      const existingPixel = await tx.pixel.findUnique({
        where: {
          projectId_positionX_positionY: {
            projectId,
            positionX,
            positionY,
          },
        },
      })

      const wasOverwrite = !!existingPixel
      const previousColor = existingPixel?.color

      let pixel
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
        })

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
        })
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
        })
      }

      // 5. 扣除代币
      const cooldownUntil = new Date(now.getTime() + 5 * 60 * 1000) // 5分钟

      const updatedTokens = await tx.userTokens.update({
        where: { id: userTokens.id },
        data: {
          balance: { decrement: 1 },
          totalSpent: { increment: 1 },
          pixelsPlaced: { increment: 1 },
          lastPlacedAt: now,
          cooldownUntil,
        },
      })

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
      })

      // 7. 更新项目统计
      await tx.project.update({
        where: { id: projectId },
        data: {
          pixelsPlaced: { increment: wasOverwrite ? 0 : 1 },
          uniquePixels: { increment: wasOverwrite ? 0 : 1 },
        },
      })

      return {
        pixel,
        wasOverwrite,
        previousColor,
        tokensRemaining: updatedTokens.balance,
        cooldownUntil,
      }
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error: any) {
    console.error('Place pixel error:', error)

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
      )
    }

    if (error.message.startsWith('COOLDOWN_ACTIVE:')) {
      const remaining = error.message.split(':')[1]
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
      )
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

