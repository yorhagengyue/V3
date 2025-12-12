'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import AnimatedContent from '@/components/ui/AnimatedContent'

interface Stats {
  totalPixels: number
  totalDonated: number
  totalContributors: number
}

interface OurStoryProps {
  stats: Stats
}

export default function OurStory({ stats }: OurStoryProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  const y = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section id="our-story" className="py-24 bg-gray-50 overflow-hidden" ref={containerRef}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <div>
            <AnimatedContent>
              <span className="text-emerald-600 font-medium text-sm tracking-wide uppercase">Our Story</span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-8 leading-tight">
                Born from a Simple Question
              </h2>
            </AnimatedContent>

            <AnimatedContent delay={0.1}>
              <div className="space-y-6 text-gray-600 leading-relaxed">
                <p className="text-lg">
                  What if we could make charitable giving more engaging, more visible, and more fun?
                </p>
                <p>
                  Inspired by the viral success of Reddit&apos;s r/place experiment, where millions of people 
                  collaborated to create digital art one pixel at a time, we saw an opportunity to channel 
                  that collective energy toward something meaningful.
                </p>
                <p>
                  We created Pixel Canvas for Change during a hackathon with a bold vision: merge the joy 
                  of collaborative creation with the impact of charitable giving. Every pixel placed represents 
                  a real contribution to verified nonprofit organizations through our partnership with Every.org.
                </p>
                <p>
                  What started as a weekend project has grown into a platform where art and altruism meet, 
                  where every contribution, no matter how small, becomes part of something bigger.
                </p>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.2}>
              <div className="mt-10 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[...Array(Math.min(stats.totalContributors, 4))].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-emerald-400 to-blue-500"
                      style={{ zIndex: 4 - i }}
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{stats.totalContributors} contributors</span>
                  <br />have joined the canvas
                </div>
              </div>
            </AnimatedContent>
          </div>

          {/* Visual Element */}
          <motion.div style={{ y }} className="relative">
            <AnimatedContent direction="horizontal" reverse>
              <div className="relative">
                {/* Main Canvas Visual */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 border border-gray-100">
                  <div className="grid grid-cols-10 gap-1">
                    {[...Array(100)].map((_, i) => {
                      const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#f3f4f6']
                      const colorIndex = i % colors.length
                      const pixelColor = colors[colorIndex]
                      return (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.01, duration: 0.3 }}
                          className="aspect-square rounded-sm"
                          style={{ backgroundColor: pixelColor }}
                        />
                      )
                    })}
                  </div>
                </div>

                {/* Floating Stats Cards - Real Data */}
                <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="text-2xl font-bold text-emerald-600">${stats.totalDonated.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Donated</div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPixels.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Pixels Placed</div>
                </div>
              </div>
            </AnimatedContent>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
