'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimatedContent from '@/components/ui/AnimatedContent'
import SpotlightCard from '@/components/ui/SpotlightCard'

interface Project {
  id: string
  title: string
  description: string
  targetAmount: number
  amountRaised: number
  pixelsTotal: number
  pixelsPlaced: number
  totalContributors: number
  everyorgLogoUrl?: string | null
  everyorgSlug?: string | null
}

interface FeaturedProjectsProps {
  projects: Project[]
}

export default function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  return (
    <section id="projects" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedContent>
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-medium text-sm tracking-wide uppercase">Active Campaigns</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 mb-6">
              Featured Projects
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a cause you care about and start creating today.
            </p>
          </div>
        </AnimatedContent>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const progress = (project.pixelsPlaced / project.pixelsTotal) * 100

            return (
              <AnimatedContent key={project.id} delay={index * 0.1}>
                <Link href={`/canvas/${project.id}`} className="block h-full">
                  <SpotlightCard className="h-full group cursor-pointer hover:border-emerald-200 transition-colors">
                    {/* Header with Logo */}
                    <div className="flex items-start gap-4 mb-4">
                      {project.everyorgLogoUrl ? (
                        <img 
                          src={project.everyorgLogoUrl} 
                          alt="Charity logo"
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors line-clamp-1">
                          {project.title}
                        </h3>
                        {project.everyorgSlug && (
                          <span className="text-xs text-emerald-600 font-medium">Verified Nonprofit</span>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2">
                      {project.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-500">{project.pixelsPlaced.toLocaleString()} pixels</span>
                        <span className="font-medium text-gray-900">{progress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${progress}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          ${Number(project.amountRaised).toLocaleString()}
                        </span>
                        <span className="text-sm text-gray-500"> raised</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-gray-500">{project.totalContributors} contributors</span>
                      </div>
                    </div>

                    {/* Hover Arrow */}
                    <div className="mt-4 flex items-center text-emerald-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      Start Contributing
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </SpotlightCard>
                </Link>
              </AnimatedContent>
            )
          })}

          {/* Coming Soon Card */}
          {projects.length < 3 && (
            <AnimatedContent delay={projects.length * 0.1}>
              <div className="h-full border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-600 mb-2">More Projects Coming</h3>
                <p className="text-sm text-gray-500">New charity campaigns are being added regularly</p>
              </div>
            </AnimatedContent>
          )}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No active projects at the moment. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  )
}

