import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      )
    }

    const userTokens = await prisma.userTokens.findUnique({
      where: {
        userId_projectId: {
          userId: session.userId,
          projectId,
        },
      },
    })

    if (!userTokens) {
      return NextResponse.json({
        success: true,
        data: {
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          pixelsPlaced: 0,
          isCoolingDown: false,
          cooldownRemaining: 0,
        },
      })
    }

    const now = new Date()
    const isCoolingDown = userTokens.cooldownUntil
      ? new Date(userTokens.cooldownUntil) > now
      : false

    const cooldownRemaining = isCoolingDown
      ? Math.ceil((new Date(userTokens.cooldownUntil!).getTime() - now.getTime()) / 1000)
      : 0

    return NextResponse.json({
      success: true,
      data: {
        balance: userTokens.balance,
        totalEarned: userTokens.totalEarned,
        totalSpent: userTokens.totalSpent,
        pixelsPlaced: userTokens.pixelsPlaced,
        totalDonated: Number(userTokens.totalDonated),
        isCoolingDown,
        cooldownRemaining,
        canPlaceAt: userTokens.cooldownUntil,
      },
    })
  } catch (error) {
    console.error('Get token status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

