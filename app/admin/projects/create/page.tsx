'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Nonprofit {
  name: string
  slug: string
  ein: string
  description: string
  profileUrl: string
  logoUrl: string
  coverImageUrl: string
  websiteUrl?: string
}

export default function CreateProjectPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Nonprofit[]>([])
  const [selectedNonprofit, setSelectedNonprofit] = useState<Nonprofit | null>(null)
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  
  // Project configuration
  const [projectTitle, setProjectTitle] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [targetAmount, setTargetAmount] = useState(10000)
  const [gridSize, setGridSize] = useState(100)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/nonprofits/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (data.success && Array.isArray(data.nonprofits)) {
        setSearchResults(data.nonprofits)
      } else {
        setSearchResults([])
        alert('Search failed: ' + (data.error || 'No results found'))
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
      alert('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectNonprofit = (nonprofit: Nonprofit) => {
    setSelectedNonprofit(nonprofit)
    setProjectTitle(nonprofit.name)
    setProjectDescription(nonprofit.description)
  }

  const handleCreateProject = async () => {
    if (!selectedNonprofit) {
      alert('Please select a nonprofit organization')
      return
    }

    if (!projectTitle || !projectDescription) {
      alert('Please fill in all required fields')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/admin/projects/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: projectTitle,
          description: projectDescription,
          everyorgSlug: selectedNonprofit.slug,
          everyorgEin: selectedNonprofit.ein,
          everyorgLogoUrl: selectedNonprofit.logoUrl,
          everyorgCoverUrl: selectedNonprofit.coverImageUrl,
          targetAmount,
          gridSize,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Project created successfully!')
        router.push('/projects')
      } else {
        alert('Failed to create project: ' + data.error)
      }
    } catch (error) {
      console.error('Create project error:', error)
      alert('Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
              <p className="text-sm text-gray-600 mt-1">Search and create projects from Every.org nonprofits</p>
            </div>
            <Link
              href="/projects"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Projects
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Search Nonprofits */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Search Nonprofits</h2>
              
              <div className="flex gap-3 mb-6">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for environmental, wildlife, climate..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Search Results */}
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {searchResults && searchResults.length > 0 ? (
                  searchResults.map((nonprofit) => (
                  <div
                    key={nonprofit.slug}
                    onClick={() => handleSelectNonprofit(nonprofit)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedNonprofit?.slug === nonprofit.slug
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {nonprofit.logoUrl ? (
                        <img
                          src={nonprofit.logoUrl}
                          alt={nonprofit.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                            e.currentTarget.nextElementSibling?.classList.remove('hidden')
                          }}
                        />
                      ) : null}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg ${nonprofit.logoUrl ? 'hidden' : ''}`}>
                        {nonprofit.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">{nonprofit.name}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{nonprofit.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                          <span>EIN: {nonprofit.ein}</span>
                          <span>•</span>
                          <a
                            href={nonprofit.profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View on Every.org
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  !loading && (
                    <div className="text-center py-12 text-gray-500">
                      <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <p>Search for nonprofits to get started</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Right: Project Configuration */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Project Configuration</h2>

              {selectedNonprofit ? (
                <div className="space-y-5">
                  {/* Selected Nonprofit Preview */}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <img
                        src={selectedNonprofit.logoUrl}
                        alt={selectedNonprofit.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-bold text-emerald-900 text-sm">{selectedNonprofit.name}</p>
                        <p className="text-xs text-emerald-600">Selected Nonprofit</p>
                      </div>
                    </div>
                  </div>

                  {/* Project Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Save the Amazon Rainforest"
                    />
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Description *
                    </label>
                    <textarea
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      placeholder="Describe the project and its goals..."
                    />
                  </div>

                  {/* Target Amount */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fundraising Goal (USD)
                    </label>
                    <input
                      type="number"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(Number(e.target.value))}
                      min="1000"
                      max="1000000"
                      step="1000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Total fundraising target for this project
                    </p>
                  </div>

                  {/* Grid Size */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Canvas Grid Size
                    </label>
                    <select
                      value={gridSize}
                      onChange={(e) => setGridSize(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value={50}>50x50 (2,500 pixels)</option>
                      <option value={100}>100x100 (10,000 pixels)</option>
                      <option value={150}>150x150 (22,500 pixels)</option>
                      <option value={200}>200x200 (40,000 pixels)</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Total pixels: {gridSize * gridSize}
                    </p>
                  </div>

                  {/* Create Button */}
                  <button
                    onClick={handleCreateProject}
                    disabled={creating}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    {creating ? 'Creating Project...' : 'Create Project'}
                  </button>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <p>Select a nonprofit to configure the project</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

