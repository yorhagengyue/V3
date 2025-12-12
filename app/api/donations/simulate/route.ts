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

    const { projectId, amount, message } = await request.json()

    // 验证输入
    if (!projectId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }

    // 获取项目信息
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    // 计算像素数
    const pixelsAwarded = Math.floor(
      (Number(amount) / Number(project.targetAmount)) * project.pixelsTotal
    )

    // 事务：创建捐款 + 更新代币
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. 创建捐款记录
      const donation = await tx.donation.create({
        data: {
          projectId,
          userId: session.userId,
          amount,
          pixelsAwarded,
          message,
          isSimulated: true,
          status: 'SUCCESS',
        },
      })

      // 2. 更新或创建用户代币
      const existingTokens = await tx.userTokens.findUnique({
        where: {
          userId_projectId: {
            userId: session.userId,
            projectId,
          },
        },
      })

      let userTokens
      if (existingTokens) {
        userTokens = await tx.userTokens.update({
          where: { id: existingTokens.id },
          data: {
            balance: { increment: pixelsAwarded },
            totalEarned: { increment: pixelsAwarded },
            totalDonated: { increment: amount },
          },
        })

        // 记录交易
        await tx.tokenTransaction.create({
          data: {
            userTokensId: existingTokens.id,
            type: 'EARN',
            amount: pixelsAwarded,
            description: `Simulated donation of $${amount}`,
            sourceType: 'donation',
            sourceId: donation.id,
            balanceBefore: existingTokens.balance,
            balanceAfter: existingTokens.balance + pixelsAwarded,
          },
        })
      } else {
        userTokens = await tx.userTokens.create({
          data: {
            userId: session.userId,
            projectId,
            balance: pixelsAwarded,
            totalEarned: pixelsAwarded,
            totalDonated: amount,
          },
        })

        // 记录交易
        await tx.tokenTransaction.create({
          data: {
            userTokensId: userTokens.id,
            type: 'EARN',
            amount: pixelsAwarded,
            description: `Simulated donation of $${amount}`,
            sourceType: 'donation',
            sourceId: donation.id,
            balanceBefore: 0,
            balanceAfter: pixelsAwarded,
          },
        })
      }

      // 3. 更新项目筹款金额
      await tx.project.update({
        where: { id: projectId },
        data: {
          amountRaised: { increment: amount },
        },
      })

      return { donation, userTokens }
    })

    return NextResponse.json({
      success: true,
      data: {
        donationId: result.donation.id,
        pixelsAwarded,
        newBalance: result.userTokens.balance,
      },
    })
  } catch (error) {
    console.error('Simulate donation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

