import { NextResponse } from 'next/server'
import { redirect } from 'next/navigation'
import { clearSession } from '@/lib/auth'

export async function POST() {
  try {
    await clearSession()
    redirect('/')
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await clearSession()
    redirect('/')
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

