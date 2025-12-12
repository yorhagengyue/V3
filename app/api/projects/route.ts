import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        everyorgLogoUrl: true,
        everyorgCoverUrl: true,
        targetAmount: true,
        amountRaised: true,
        gridSize: true,
        pixelsTotal: true,
        pixelsPlaced: true,
        uniquePixels: true,
        totalContributors: true,
        status: true,
        createdAt: true,
      },
    })

    const projectsWithProgress = projects.map((p: typeof projects[number]) => ({
      ...p,
      progressPercentage: Number(((p.pixelsPlaced / p.pixelsTotal) * 100).toFixed(2)),
      targetAmount: Number(p.targetAmount),
      amountRaised: Number(p.amountRaised),
    }))

    return NextResponse.json({
      success: true,
      data: projectsWithProgress,
    })
  } catch (error) {
    console.error('Get projects error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

