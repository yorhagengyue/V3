import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { Prisma } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    
    // For now, allow anyone to create projects
    // In production, add admin role check
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      everyorgSlug,
      everyorgEin,
      everyorgLogoUrl,
      everyorgCoverUrl,
      targetAmount,
      gridSize,
    } = body

    // Validate required fields
    if (!title || !description || !everyorgSlug || !targetAmount || !gridSize) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create project with transaction
    const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create project
      const project = await tx.project.create({
        data: {
          title,
          description,
          everyorgSlug,
          everyorgEin,
          everyorgLogoUrl,
          everyorgCoverUrl,
          targetAmount,
          amountRaised: 0,
          gridSize,
          pixelsTotal: gridSize * gridSize,
          pixelsPlaced: 0,
          uniquePixels: 0,
          totalContributors: 0,
          status: 'ACTIVE',
        },
      })

      // Create default color palette (16 colors)
      await tx.colorPalette.create({
        data: {
          projectId: project.id,
          name: `${title} Palette`,
          colors: JSON.stringify([
            '#ffffff', // White
            '#e8f5e9', // Light green
            '#a5d6a7', // Medium green
            '#66bb6a', // Green
            '#43a047', // Dark green
            '#2e7d32', // Forest green
            '#1b5e20', // Very dark green
            '#8d6e63', // Light brown
            '#6d4c41', // Brown
            '#5d4037', // Dark brown
            '#81d4fa', // Light blue
            '#4fc3f7', // Blue
            '#039be5', // Dark blue
            '#ffd54f', // Yellow
            '#ff6f00', // Orange
            '#212121', // Black
          ]),
        },
      })

      // Give the creator initial tokens for this project
      await tx.userTokens.create({
        data: {
          userId: session.userId,
          projectId: project.id,
          balance: 100, // Starting tokens for project creator
          totalEarned: 100,
          totalSpent: 0,
          pixelsPlaced: 0,
          totalDonated: 0,
        },
      })

      return project
    })

    return NextResponse.json({
      success: true,
      project: {
        id: result.id,
        title: result.title,
        slug: result.everyorgSlug,
      },
    })
  } catch (error) {
    console.error('Create project error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

