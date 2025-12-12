import { cookies } from 'next/headers'
import { prisma } from './prisma'

export async function getServerSession() {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get('session_id')?.value

  if (!sessionId) return null

  const user = await prisma.user.findUnique({
    where: { sessionId },
  })

  if (!user) return null

  return {
    userId: user.id,
    username: user.username,
    email: user.email,
  }
}

export async function createSession(userId: string) {
  const sessionId = crypto.randomUUID()

  await prisma.user.update({
    where: { id: userId },
    data: { sessionId },
  })

  return sessionId
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session_id')
}

