import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import ProjectsClient from '@/components/projects/ProjectsClient'

export default async function ProjectsPage() {
  const session = await getServerSession()
  
  if (!session) {
    redirect('/login')
  }

  // Fetch active projects
  const projects = await prisma.project.findMany({
    where: { status: 'ACTIVE' },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch user stats
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      userTokens: true,
    }
  })

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

  const totalTokens = user?.userTokens.reduce((sum: number, t: typeof user.userTokens[number]) => sum + t.balance, 0) || 0

  return (
    <ProjectsClient
      session={{
        userId: session.userId,
        username: session.username,
        email: session.email || '',
      }}
      projects={projects.map((p: typeof projects[number]) => ({
        ...p,
        targetAmount: Number(p.targetAmount),
        amountRaised: Number(p.amountRaised),
      }))}
      stats={{
        totalTokens,
        totalPixelsPlaced,
        projectsJoined: projectsJoined.length,
      }}
    />
  )
}
