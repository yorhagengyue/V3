import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getNonprofit } from '@/lib/everyorg'

// Sync project data with Every.org
export async function POST(request: Request) {
  try {
    const { projectId } = await request.json()

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }

    if (!project.everyorgSlug) {
      return NextResponse.json(
        { success: false, error: 'Project has no Every.org integration' },
        { status: 400 }
      )
    }

    // Fetch nonprofit data from Every.org
    const nonprofit = await getNonprofit(project.everyorgSlug)

    if (!nonprofit) {
      return NextResponse.json(
        { success: false, error: 'Failed to fetch nonprofit data' },
        { status: 500 }
      )
    }

    // Update project with latest data
    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        everyorgLogoUrl: nonprofit.nonprofit.logoUrl || project.everyorgLogoUrl,
        everyorgCoverUrl: nonprofit.nonprofit.coverImageUrl || project.everyorgCoverUrl,
        description: nonprofit.nonprofit.description || project.description,
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProject,
    })
  } catch (error) {
    console.error('Sync project error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

