'use client'

import AnimatedContent from '@/components/ui/AnimatedContent'
import SpotlightCard from '@/components/ui/SpotlightCard'

const visionPoints = [
  {
    title: 'Democratize Giving',
    description: 'Make charitable contributions accessible and meaningful for everyone, regardless of the amount they can give.',
    gradient: 'from-emerald-500 to-teal-600'
  },
  {
    title: 'Visualize Impact',
    description: 'Transform abstract donations into tangible, visible contributions that donors can see and share with pride.',
    gradient: 'from-blue-500 to-indigo-600'
  },
  {
    title: 'Build Community',
    description: 'Create a global network of contributors working together, fostering connection through shared creative expression.',
    gradient: 'from-purple-500 to-pink-600'
  }
]

const values = [
  { label: 'Transparency', description: 'Every donation is tracked and verified' },
  { label: 'Creativity', description: 'Art as a vehicle for positive change' },
  { label: 'Collaboration', description: 'Together we create something bigger' },
  { label: 'Impact', description: 'Real donations to real causes' }
]

export default function Vision() {
  return (
    <section id="vision" className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedContent>
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-medium text-sm tracking-wide uppercase">Our Vision</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Reimagining Philanthropy
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We believe that giving should be as engaging and rewarding as receiving.
            </p>
          </div>
        </AnimatedContent>

        {/* Vision Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {visionPoints.map((point, index) => (
            <AnimatedContent key={point.title} delay={index * 0.1}>
              <div className="relative group">
                <div className={`absolute inset-0 bg-gradient-to-br ${point.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
                <SpotlightCard className="relative h-full bg-white">
                  <div className={`w-12 h-1 bg-gradient-to-r ${point.gradient} rounded-full mb-6`} />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{point.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{point.description}</p>
                </SpotlightCard>
              </div>
            </AnimatedContent>
          ))}
        </div>

        {/* Values Grid */}
        <AnimatedContent>
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={value.label} className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">{index + 1}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{value.label}</h4>
                  <p className="text-sm text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedContent>
      </div>
    </section>
  )
}

