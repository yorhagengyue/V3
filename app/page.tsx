import { prisma } from '@/lib/prisma'
import HeroSection from '@/components/landing/HeroSection'
import HowItWorks from '@/components/landing/HowItWorks'
import OurStory from '@/components/landing/OurStory'
import Vision from '@/components/landing/Vision'
import CallToAction from '@/components/landing/CallToAction'
import Footer from '@/components/landing/Footer'
import Navbar from '@/components/landing/Navbar'

export default async function HomePage() {
  // Fetch real data from database for stats
  const totalPixels = await prisma.pixel.count()
  const totalDonations = await prisma.donation.aggregate({
    _sum: { amount: true }
  })
  const totalContributors = await prisma.user.count()

  const stats = {
    totalPixels,
    totalDonated: Number(totalDonations._sum.amount) || 0,
    totalContributors
  }

  return (
    <main className="min-h-screen bg-white">
      <Navbar />
      <HeroSection stats={stats} />
      <HowItWorks />
      <OurStory stats={stats} />
      <Vision />
      <CallToAction />
      <Footer />
    </main>
  )
}
