'use client'

import AnimatedContent from '@/components/ui/AnimatedContent'
import CardSwap, { Card } from '@/components/ui/CardSwap'

const steps = [
  {
    number: '01',
    title: 'Choose a Cause',
    description: 'Browse active charity projects supporting environmental conservation, education, or humanitarian aid.',
    gradient: 'from-emerald-500 to-teal-600',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )
  },
  {
    number: '02',
    title: 'Make a Donation',
    description: 'Contribute any amount through our secure payment system powered by Every.org. 100% goes to charity.',
    gradient: 'from-blue-500 to-cyan-600',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    number: '03',
    title: 'Earn Pixel Tokens',
    description: 'Your donation converts into tokens. Each token lets you place one pixel on the shared canvas.',
    gradient: 'from-purple-500 to-pink-600',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    number: '04',
    title: 'Create Together',
    description: 'Join the community in creating meaningful pixel art. Leave your mark and message for the world to see.',
    gradient: 'from-orange-500 to-red-600',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )
  }
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Text content */}
          <div className="space-y-8">
            <AnimatedContent>
              <div>
                <span className="text-emerald-600 font-medium text-sm tracking-wide uppercase">How It Works</span>
                <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mt-4 mb-6">
                  Simple Steps to Make an Impact
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Transform your charitable giving into a creative, collaborative experience that you can see and share.
                </p>
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.2}>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.number} className="flex gap-4 group">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-110 transition-transform`}>
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimatedContent>

            <AnimatedContent delay={0.4}>
              <div className="flex gap-4 pt-4">
                <a
                  href="/login"
                  className="px-8 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors shadow-lg"
                >
                  Start Creating
                </a>
                <a
                  href="#our-story"
                  className="px-8 py-3 border-2 border-gray-900 text-gray-900 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition-colors"
                >
                  Learn More
                </a>
              </div>
            </AnimatedContent>
          </div>

          {/* Right side - Card Swap */}
          <div className="relative h-[600px] hidden lg:block">
            <CardSwap
              width={400}
              height={480}
              cardDistance={40}
              verticalDistance={50}
              delay={3500}
              pauseOnHover={true}
              skewAmount={4}
              easing="elastic"
            >
              {steps.map((step) => (
                <Card key={step.number} className={`bg-gradient-to-br ${step.gradient} border-none shadow-2xl p-8`}>
                  <div className="flex flex-col h-full text-white">
                    <div className="mb-6 opacity-80">{step.icon}</div>
                    <div className="text-7xl font-black mb-4 opacity-20">{step.number}</div>
                    <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                    <p className="text-lg leading-relaxed opacity-90">{step.description}</p>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>
      </div>
    </section>
  )
}

