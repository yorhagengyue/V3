import { NextResponse } from 'next/server'
import { getNonprofit, getDonationLink } from '@/lib/everyorg'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    const nonprofit = await getNonprofit(slug)

    if (!nonprofit) {
      return NextResponse.json(
        { success: false, error: 'Nonprofit not found' },
        { status: 404 }
      )
    }

    // Add donation link
    const donationLink = getDonationLink(slug)

    return NextResponse.json({
      success: true,
      data: {
        ...nonprofit,
        donationLink,
      },
    })
  } catch (error) {
    console.error('Get nonprofit error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

