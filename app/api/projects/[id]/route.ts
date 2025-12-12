import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        pixels: {
          select: {
            positionX: true,
            positionY: true,
            color: true,
            contributorName: true,
            contributorMessage: true,
          },
          orderBy: [{ positionY: 'asc' }, { positionX: 'asc' }],
        },
        colorPalette: true,
      },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        targetAmount: Number(project.targetAmount),
        amountRaised: Number(project.amountRaised),
        progressPercentage: Number(((project.pixelsPlaced / project.pixelsTotal) * 100).toFixed(2)),
        colorPalette: project.colorPalette 
          ? (typeof project.colorPalette.colors === 'string' 
              ? project.colorPalette.colors.split(',')
              : project.colorPalette.colors)
          : [],
        // Every.org integration
        everyorgSlug: project.everyorgSlug,
        everyorgLogoUrl: project.everyorgLogoUrl,
        everyorgCoverUrl: project.everyorgCoverUrl,
      },
    })
  } catch (error) {
    console.error('Get project error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

