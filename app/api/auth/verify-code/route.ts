import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyCode } from '@/lib/email'
import { prisma } from '@/lib/prisma'
import { createSession } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { email, code, username } = await request.json()

    // 验证输入
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      )
    }

    // 验证验证码
    const isValid = verifyCode(email, code)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired code' },
        { status: 400 }
      )
    }

    // 查找或创建用户
    let user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      // 新用户：需要用户名
      if (!username) {
        return NextResponse.json(
          { success: false, error: 'Username required for new users' },
          { status: 400 }
        )
      }

      // 检查用户名是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { username },
      })

      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'Username already taken' },
          { status: 400 }
        )
      }

      // 创建新用户
      user = await prisma.user.create({
        data: {
          username,
          email,
        },
      })
    }

    // 创建会话
    const sessionId = await createSession(user.id)

    // 设置 Cookie
    const cookieStore = await cookies()
    cookieStore.set('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30天
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

