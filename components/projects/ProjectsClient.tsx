'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PixelCard from '@/components/ui/PixelCard'

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

interface UserStats {
  totalTokens: number
  totalPixelsPlaced: number
  projectsJoined: number
}

interface ProjectsClientProps {
  session: {
    userId: string
    username: string
    email: string
  }
  projects: Project[]
  stats: UserStats
}

export default function ProjectsClient({ session, projects, stats: initialStats }: ProjectsClientProps) {
  const router = useRouter()
  const [stats, setStats] = useState<UserStats>(initialStats)

  // Refresh stats when component mounts or page gains focus
  const refreshStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStats(data.data)
        }
      }
    } catch (error) {
      console.error('Failed to refresh stats:', error)
    }
  }

  useEffect(() => {
    // Refresh stats when page loads
    refreshStats()

    // Refresh stats when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshStats()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })
      
      if (response.ok) {
        router.push('/login')
      } else {
        alert('Logout failed. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Logout failed. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/projects" className="text-2xl font-bold text-gray-900">
                Pixel Canvas
              </Link>
              <p className="text-sm text-gray-600 mt-1">Paint for the Planet</p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href="/admin/projects/create"
                className="px-5 py-2.5 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                Create Project
              </Link>
              <div className="text-right">
                <p className="text-xs text-gray-500">Signed in as</p>
                <p className="text-gray-900 font-semibold">{session.username}</p>
              </div>
              <button 
                onClick={handleLogout}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-12">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Pixel Tokens</p>
              <p className="text-5xl font-black bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {stats.totalTokens}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Pixels Placed</p>
              <p className="text-5xl font-black bg-gradient-to-br from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {stats.totalPixelsPlaced}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Projects Joined</p>
              <p className="text-5xl font-black bg-gradient-to-br from-pink-600 to-red-600 bg-clip-text text-transparent">
                {stats.projectsJoined}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Active Projects</h1>
          <p className="text-gray-600 text-lg">Choose a cause and start creating pixel art for change.</p>
        </div>

        {projects.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center">
            <p className="text-gray-500 text-lg">No active projects at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => {
              const progress = (project.pixelsPlaced / project.pixelsTotal) * 100
              const variants = ['blue', 'yellow', 'pink', 'default'] as const
              const variant = variants[index % variants.length]

              return (
                <Link 
                  key={project.id} 
                  href={`/canvas/${project.id}`}
                  className="block group"
                >
                  <PixelCard 
                    variant={variant}
                    className="w-full h-[420px] border border-gray-300 rounded-2xl bg-white hover:border-gray-400"
                  >
                    <div className="relative z-10 p-6 flex flex-col h-full justify-end">
                      {/* Project Info */}
                      <div className="bg-white/95 backdrop-blur-sm rounded-xl p-5 shadow-lg">
                        {/* Header */}
                        <div className="flex items-start gap-3 mb-3">
                          {project.everyorgLogoUrl ? (
                            <img 
                              src={project.everyorgLogoUrl} 
                              alt="Logo"
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-base group-hover:text-purple-600 transition-colors line-clamp-1">
                              {project.title}
                            </h3>
                            {project.everyorgSlug && (
                              <span className="text-xs text-emerald-600 font-medium">Verified Nonprofit</span>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-xs mb-4 line-clamp-2 leading-relaxed">
                          {project.description}
                        </p>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-gray-500">{project.pixelsPlaced.toLocaleString()} pixels</span>
                            <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-gray-900 text-sm">
                              ${Number(project.amountRaised).toLocaleString()}
                            </span>
                            <span className="text-gray-500 ml-1">raised</span>
                          </div>
                          <span className="text-gray-500">{project.totalContributors} contributors</span>
                        </div>
                      </div>
                    </div>
                  </PixelCard>
                </Link>
              )
            })}

            {/* Coming Soon Card */}
            {projects.length < 6 && (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-12 text-center min-h-[420px]">
                <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 mb-2">More Projects Coming</h3>
                <p className="text-sm text-gray-500">New charity campaigns are being added regularly</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

