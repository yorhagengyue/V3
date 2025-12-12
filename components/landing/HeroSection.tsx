'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import PixelWorldMap from '@/components/ui/PixelWorldMap'

// Dynamic import to avoid SSR issues with Three.js
const PixelBlast = dynamic(() => import('@/components/PixelBlast'), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-gray-900" />
})

interface Stats {
  totalPixels: number
  totalDonated: number
  totalContributors: number
}

interface HeroSectionProps {
  stats: Stats
}

export default function HeroSection({ stats }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Pixel Blast Background - Slower speed */}
      <div className="absolute inset-0 z-0 opacity-40">
        <PixelBlast 
          variant="circle"
          pixelSize={4}
          color="#8b5cf6"
          patternScale={2}
          patternDensity={1}
          enableRipples={true}
          rippleSpeed={0.2}
          rippleThickness={0.15}
          rippleIntensityScale={1.2}
          edgeFade={0.5}
          speed={0.1}
          className=""
          style={{}}
        />
      </div>

      {/* Pixel World Map Overlay */}
      <div className="absolute inset-0 z-10">
        <PixelWorldMap 
          pixelSize={4}
          gap={6}
          colors={['#10b981', '#3b82f6', '#f59e0b', '#ec4899']}
          animationSpeed={0.01}
        />
      </div>

      {/* Gradient Overlay for better text readability */}
      <div className="absolute inset-0 z-15 bg-gradient-to-b from-gray-900/80 via-gray-900/40 to-gray-900/80" />

      {/* Content */}
      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center pt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block px-4 py-1.5 bg-purple-900/50 text-purple-300 text-sm font-medium rounded-full mb-6 border border-purple-700/50 backdrop-blur-sm">
            Art Meets Charity
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
        >
          Every Pixel
          <br />
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Tells a Story
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Join a global community creating collaborative pixel art while supporting 
          real charitable causes. Your donation becomes pixels, your pixels become change.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/login"
            className="group px-8 py-4 bg-white text-gray-900 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            Get Started
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 bg-transparent text-white rounded-xl font-semibold text-lg border border-white/30 hover:border-white/60 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            Learn More
          </a>
        </motion.div>

        {/* Real Stats from Database - Clean, Minimal Design */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-24 flex flex-col md:flex-row justify-center items-center gap-12 md:gap-24 text-center"
        >
          <div className="relative">
            <div className="text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-2">
              {stats.totalPixels.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Pixels Placed</div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

          <div className="relative">
            <div className="text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-2">
              ${stats.totalDonated.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Donated</div>
          </div>

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-gray-700 to-transparent" />

          <div className="relative">
            <div className="text-5xl font-bold bg-gradient-to-b from-white to-gray-400 bg-clip-text text-transparent mb-2">
              {stats.totalContributors.toLocaleString()}
            </div>
            <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Contributors</div>
          </div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <div className="w-1.5 h-3 bg-white/50 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
