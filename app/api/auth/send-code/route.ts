import { NextResponse } from 'next/server'
import { generateCode, sendVerificationEmail, saveVerificationCode } from '@/lib/email'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // 生成验证码
    const code = generateCode()

    // 保存验证码
    saveVerificationCode(email, code)

    // 发送邮件（如果配置了 Gmail）
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const sent = await sendVerificationEmail(email, code)
      
      if (!sent) {
        return NextResponse.json(
          { success: false, error: 'Failed to send email' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email',
      })
    } else {
      // 开发模式：直接返回验证码
      console.log(`🔑 验证码 for ${email}: ${code}`)
      
      return NextResponse.json({
        success: true,
        message: 'Development mode: code displayed in console',
        devCode: code, // 仅在开发环境返回
      })
    }
  } catch (error) {
    console.error('Send code error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

