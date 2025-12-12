import nodemailer from 'nodemailer'

// Create email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

// Verification code storage (use Redis in production)
const verificationCodes = new Map<string, { code: string; expires: number }>()

// Generate 6-digit verification code
export function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Send verification code email
export async function sendVerificationEmail(email: string, code: string) {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Pixel Canvas for Change - Verification Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">Pixel Canvas for Change</h2>
        <p>Your verification code is:</p>
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">
          ${code}
        </div>
        <p style="color: #6b7280; margin-top: 20px;">This code will expire in 10 minutes.</p>
        <p style="color: #6b7280;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
        <p style="color: #9ca3af; font-size: 12px;">
          Pixel Canvas for Change - Paint for the Planet
        </p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

// Save verification code
export function saveVerificationCode(email: string, code: string) {
  const expires = Date.now() + 10 * 60 * 1000 // Expires in 10 minutes
  verificationCodes.set(email, { code, expires })
  console.log(`💾 Code saved for ${email}: ${code}`)
}

// Verify verification code
export function verifyCode(email: string, code: string): boolean {
  // Development mode: Accept any 6-digit code
  if (process.env.NODE_ENV === 'development' && /^\d{6}$/.test(code)) {
    console.log(`✅ Development mode: Code accepted for ${email}`)
    return true
  }

  const stored = verificationCodes.get(email)
  
  if (!stored) {
    console.log(`❌ No code found for ${email}`)
    return false
  }

  if (Date.now() > stored.expires) {
    verificationCodes.delete(email)
    console.log(`❌ Code expired for ${email}`)
    return false
  }

  if (stored.code !== code) {
    console.log(`❌ Code mismatch for ${email}. Expected: ${stored.code}, Got: ${code}`)
    return false
  }

  // Delete code after successful verification
  verificationCodes.delete(email)
  console.log(`✅ Code verified successfully for ${email}`)
  return true
}

// Cleanup expired codes (call periodically)
export function cleanupExpiredCodes() {
  const now = Date.now()
  for (const [email, data] of verificationCodes.entries()) {
    if (now > data.expires) {
      verificationCodes.delete(email)
    }
  }
}

