import { NextResponse } from 'next/server'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch user with tokens
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        userTokens: true,
      }
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }

    // Count pixels placed by this user
    const totalPixelsPlaced = await prisma.pixel.count({
      where: {
        contributorId: session.userId
      }
    })

    // Count unique projects user has contributed to
    const projectsJoined = await prisma.pixel.findMany({
      where: {
        contributorId: session.userId
      },
      select: {
        projectId: true
      },
      distinct: ['projectId']
    })

    const totalTokens = user.userTokens.reduce((sum, t) => sum + t.balance, 0)

    return NextResponse.json({
      success: true,
      data: {
        totalTokens,
        totalPixelsPlaced,
        projectsJoined: projectsJoined.length,
      }
    })
  } catch (error) {
    console.error('Get user stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

