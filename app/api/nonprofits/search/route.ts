import { NextResponse } from 'next/server'
import { searchNonprofits } from '@/lib/everyorg'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const take = parseInt(searchParams.get('take') || '10')

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    const nonprofits = await searchNonprofits(query, take)

    return NextResponse.json({
      success: true,
      nonprofits: nonprofits,
    })
  } catch (error) {
    console.error('Search nonprofits error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

