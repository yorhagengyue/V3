import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID required' },
        { status: 400 }
      )
    }

    const leaderboard = await prisma.userTokens.findMany({
      where: { projectId },
      orderBy: [
        { pixelsPlaced: 'desc' },
        { totalDonated: 'desc' },
      ],
      take: 10,
      select: {
        user: {
          select: {
            username: true,
          },
        },
        pixelsPlaced: true,
        totalDonated: true,
        totalEarned: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: leaderboard.map((entry: typeof leaderboard[number], index: number) => ({
        rank: index + 1,
        username: entry.user.username,
        pixelsPlaced: entry.pixelsPlaced,
        totalDonated: Number(entry.totalDonated),
        totalEarned: entry.totalEarned,
      })),
    })
  } catch (error) {
    console.error('Get leaderboard error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

