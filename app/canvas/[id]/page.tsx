'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PixelCanvas from '@/components/PixelCanvas'
import ColorPalette from '@/components/ColorPalette'
import TokenDisplay from '@/components/TokenDisplay'
import AnimatedList from '@/components/ui/AnimatedList'

interface Pixel {
  positionX: number
  positionY: number
  color: string
  contributorName?: string
  contributorMessage?: string
}

interface Project {
  id: string
  title: string
  description: string
  targetAmount: number
  amountRaised: number
  gridSize: number
  pixelsTotal: number
  pixelsPlaced: number
  uniquePixels: number
  totalContributors: number
  status: string
  pixels: Pixel[]
  colorPalette: string[]
  everyorgSlug?: string
  everyorgLogoUrl?: string
  everyorgCoverUrl?: string
}

interface TokenStatus {
  balance: number
  totalEarned: number
  totalSpent: number
  pixelsPlaced: number
  totalDonated: number
  isCoolingDown: boolean
  cooldownRemaining: number
  canPlaceAt: string | null
}

interface LeaderboardEntry {
  rank: number
  username: string
  pixelsPlaced: number
  totalDonated: number
}

export default function CanvasPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()

  const [project, setProject] = useState<Project | null>(null)
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [selectedColor, setSelectedColor] = useState('#ffffff')
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [showBlessingMessage, setShowBlessingMessage] = useState(false)
  const [showDonateModal, setShowDonateModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [message, setMessage] = useState('')
  const [donateAmount, setDonateAmount] = useState(10)

  // 检查会话
  useEffect(() => {
    checkSession()
  }, [])

  // 加载项目数据
  useEffect(() => {
    if (session) {
      loadProject()
      loadTokenStatus()
      loadLeaderboard()
    }
  }, [session, id])

  // 定时刷新
  useEffect(() => {
    if (!session) return

    const interval = setInterval(() => {
      loadProject()
      loadTokenStatus()
    }, 10000) // 每10秒刷新

    return () => clearInterval(interval)
  }, [session, id])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        setSession(data.user)
      } else {
        router.push('/login')
      }
    } catch (error) {
      console.error('Session check error:', error)
      router.push('/login')
    }
  }

  const loadProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`)
      const data = await response.json()
      
      if (data.success) {
        setProject(data.data)
        if (data.data.colorPalette.length > 0 && !selectedColor) {
          setSelectedColor(data.data.colorPalette[0])
        }
      }
      setLoading(false)
    } catch (error) {
      console.error('Load project error:', error)
      setLoading(false)
    }
  }

  const loadTokenStatus = async () => {
    try {
      const response = await fetch(`/api/tokens/status?projectId=${id}`)
      const data = await response.json()
      
      if (data.success) {
        setTokenStatus(data.data)
      }
    } catch (error) {
      console.error('Load token status error:', error)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`/api/leaderboard?projectId=${id}`)
      const data = await response.json()
      
      if (data.success) {
        setLeaderboard(data.data)
      }
    } catch (error) {
      console.error('Load leaderboard error:', error)
    }
  }

  const handlePixelClick = async (x: number, y: number) => {
    if (!tokenStatus || tokenStatus.balance < 1) {
      setShowDonateModal(true)
      throw new Error('Insufficient tokens. Please get more tokens first.')
    }

    if (tokenStatus.isCoolingDown) {
      throw new Error(`Please wait for cooldown to end (${tokenStatus.cooldownRemaining} seconds remaining)`)
    }

    // Check if message is provided (required)
    if (!message || message.trim().length === 0) {
      showNotification('Please add a message before placing your pixel! ✍️', 'error')
      throw new Error('Message is required')
    }

    try {
      const response = await fetch('/api/pixels/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          positionX: x,
          positionY: y,
          color: selectedColor,
          message: message || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Refresh data
        await Promise.all([loadProject(), loadTokenStatus(), loadLeaderboard()])
        setMessage('')
        
        // Show success notification
        showNotification('Pixel placed successfully! 🎨', 'success')
      } else {
        throw new Error(data.error?.message || 'Failed to place pixel')
      }
    } catch (error: any) {
      console.error('Place pixel error:', error)
      showNotification(error.message || 'Failed to place pixel', 'error')
      throw error
    }
  }

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleDonate = async () => {
    if (donateAmount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const response = await fetch('/api/donations/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: id,
          amount: donateAmount,
          message: message || undefined,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert(`Donation successful! Received ${data.data.pixelsAwarded} pixel tokens`)
        await Promise.all([loadProject(), loadTokenStatus(), loadLeaderboard()])
        setShowDonateModal(false)
        setDonateAmount(10)
        setMessage('')
      } else {
        alert(data.error || 'Donation failed')
      }
    } catch (error) {
      console.error('Donate error:', error)
      alert('Donation failed. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Project not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push('/projects')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-sm text-gray-500">Pixel Canvas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="hidden md:flex items-center gap-6 px-6 py-2 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-xs text-gray-500">Pixels</p>
                  <p className="text-sm font-bold text-gray-900">{project.pixelsPlaced.toLocaleString()}</p>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Raised</p>
                  <p className="text-sm font-bold text-gray-900">${Number(project.amountRaised).toLocaleString()}</p>
                </div>
                <div className="w-px h-8 bg-gray-300"></div>
                <div className="text-center">
                  <p className="text-xs text-gray-500">Contributors</p>
                  <p className="text-sm font-bold text-gray-900">{project.totalContributors}</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowLeaderboard(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-semibold rounded-lg hover:shadow-lg transition-all"
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed top-24 right-6 z-50 px-6 py-4 rounded-lg shadow-2xl border-2 flex items-center gap-3 animate-slide-in ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-500 text-emerald-900' 
              : 'bg-red-50 border-red-500 text-red-900'
          }`}>
            {notification.type === 'success' ? (
              <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
        )}


        {/* Main Content */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Canvas Section */}
          <div className="space-y-4">
            {/* Message Input - MOVED TO TOP FOR VISIBILITY */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Add a message <span className="text-red-500">*</span> <span className="text-xs font-normal text-gray-500">(required)</span>
              </label>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Share your thoughts with the community... (required)"
                maxLength={200}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                  message.trim().length === 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">{message.length}/200 characters</p>
                {message.trim().length === 0 && (
                  <p className="text-xs text-red-500 font-semibold">⚠️ Message required to place pixel</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
              <PixelCanvas
                gridSize={project.gridSize}
                pixels={project.pixels}
                selectedColor={selectedColor}
                onPixelClick={handlePixelClick}
                disabled={!tokenStatus || tokenStatus.balance < 1 || tokenStatus.isCoolingDown || !message.trim()}
              />
              
              {/* Blessing Message Overlay - Shows when canvas is 100% complete */}
              {project.pixelsPlaced >= project.pixelsTotal && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 backdrop-blur-sm rounded-xl flex items-center justify-center z-50">
                  <div className="text-center px-8 py-12 max-w-2xl">
                    <div className="mb-6">
                      <div className="inline-block p-4 bg-white/10 rounded-full mb-4">
                        <svg className="w-16 h-16 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">
                        Canvas Complete!
                      </h2>
                      <div className="h-1 w-32 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 mx-auto rounded-full mb-6"></div>
                    </div>
                    
                    <p className="text-2xl font-bold text-white mb-4">
                      Together We Made a Difference
                    </p>
                    <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                      Every pixel represents a voice, a hope, and a commitment to change.<br/>
                      This collaborative artwork shows the power of unity and collective action.<br/>
                      <span className="text-yellow-300 font-semibold">Thank you for being part of this journey.</span>
                    </p>
                    
                    <div className="grid grid-cols-3 gap-6 mb-8">
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-yellow-300">{project.pixelsTotal.toLocaleString()}</div>
                        <div className="text-sm text-gray-300 uppercase tracking-wide">Pixels</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-green-300">${project.amountRaised.toLocaleString()}</div>
                        <div className="text-sm text-gray-300 uppercase tracking-wide">Raised</div>
                      </div>
                      <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-3xl font-black text-pink-300">{project.totalContributors.toLocaleString()}</div>
                        <div className="text-sm text-gray-300 uppercase tracking-wide">Contributors</div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowBlessingMessage(!showBlessingMessage)}
                      className="px-8 py-3 bg-white text-purple-900 font-bold rounded-lg hover:bg-gray-100 transition-all shadow-lg"
                    >
                      {showBlessingMessage ? 'View Canvas' : 'View Message'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Token Status */}
            {tokenStatus && (
              <TokenDisplay
                balance={tokenStatus.balance}
                cooldownUntil={tokenStatus.canPlaceAt ? new Date(tokenStatus.canPlaceAt) : null}
                onDonate={() => setShowDonateModal(true)}
              />
            )}

            {/* Color Palette */}
            <ColorPalette
              colors={project.colorPalette}
              selectedColor={selectedColor}
              onSelectColor={setSelectedColor}
              disabled={!tokenStatus || tokenStatus.balance < 1 || tokenStatus.isCoolingDown || !message.trim()}
            />

            {/* Stats Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-4">My Stats</h3>
              {tokenStatus && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Placed</span>
                    <span className="text-lg font-bold text-gray-900">{tokenStatus.pixelsPlaced}</span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Earned</span>
                    <span className="text-lg font-bold text-gray-900">{tokenStatus.totalEarned}</span>
                  </div>
                  <div className="h-px bg-gray-200"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Spent</span>
                    <span className="text-lg font-bold text-gray-900">{tokenStatus.totalSpent}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Canvas Info */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-5 rounded-xl border border-purple-200 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-3">Canvas Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Grid Size</span>
                  <span className="font-mono font-bold text-gray-900">{project.gridSize}×{project.gridSize}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Total Pixels</span>
                  <span className="font-mono font-bold text-gray-900">{project.pixelsTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Placed</span>
                  <span className="font-mono font-bold text-purple-600">{project.pixelsPlaced.toLocaleString()}</span>
                </div>
                <div className="h-px bg-purple-200"></div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Progress</span>
                  <span className="font-bold text-purple-600">
                    {((project.pixelsPlaced / project.pixelsTotal) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Donate Modal */}
        {showDonateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Get Pixel Tokens</h2>
                <button
                  onClick={() => setShowDonateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Every.org Charity Info */}
              {project.everyorgSlug && (
                <div className="mb-6 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-3 mb-2">
                    {project.everyorgLogoUrl && (
                      <img 
                        src={project.everyorgLogoUrl} 
                        alt="Charity logo"
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-emerald-900 text-sm">{project.title}</p>
                      <p className="text-xs text-emerald-600 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified Nonprofit
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Your donation supports real conservation efforts
                  </p>
                </div>
              )}
              
              {!project.everyorgSlug && (
                <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-purple-800">
                    Demo mode - No real payment required
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Donation Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                  <input
                    type="number"
                    value={donateAmount}
                    onChange={(e) => setDonateAmount(Number(e.target.value))}
                    min="1"
                    max="10000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-lg font-semibold"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  ≈ {Math.floor((donateAmount / Number(project.targetAmount)) * project.pixelsTotal)} pixel tokens
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {/* Simulated Donation Button */}
                <button
                  onClick={handleDonate}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Simulate Donation (Demo)
                </button>
                
                {/* Real Every.org Donation Link */}
                {project.everyorgSlug && (
                  <a
                    href={`https://www.every.org/${project.everyorgSlug}/donate?amount=${donateAmount}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg font-semibold text-center hover:shadow-lg transition-all"
                  >
                    Donate on Every.org
                  </a>
                )}
              </div>
              
              {project.everyorgSlug && (
                <p className="text-xs text-gray-500 text-center mt-4">
                  Donations processed securely by Every.org
                </p>
              )}
            </div>
          </div>
        )}

        {/* Leaderboard Modal */}
        {showLeaderboard && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
            <div className="bg-[#0a0a0a] rounded-none border border-gray-800 p-8 max-w-2xl w-full">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight mb-1">LEADERBOARD</h2>
                  <p className="text-sm text-gray-500 uppercase tracking-wider">Top Contributors</p>
                </div>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-gray-600">No contributors yet</p>
                </div>
              ) : (
                <AnimatedList
                  className="w-full"
                  gradientColor="#0a0a0a"
                  showGradients={true}
                  displayScrollbar={true}
                  enableArrowNavigation={false}
                >
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className="group relative bg-[#111] border border-gray-800 hover:border-purple-500/50 transition-all duration-200 overflow-hidden"
                    >
                      {/* Rank indicator line */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        entry.rank === 1 ? 'bg-yellow-500' :
                        entry.rank === 2 ? 'bg-gray-400' :
                        entry.rank === 3 ? 'bg-orange-500' :
                        'bg-purple-500/20'
                      }`} />

                      <div className="flex items-center gap-4 p-4 pl-6">
                        {/* Rank */}
                        <div className="w-12 text-center">
                          <span className={`text-3xl font-black tabular-nums ${
                            entry.rank === 1 ? 'text-yellow-500' :
                            entry.rank === 2 ? 'text-gray-400' :
                            entry.rank === 3 ? 'text-orange-500' :
                            'text-gray-600'
                          }`}>
                            {entry.rank}
                          </span>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-base mb-1 truncate uppercase tracking-wide">
                            {entry.username}
                          </p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500 uppercase tracking-wider">Pixels</span>
                              <span className="text-purple-400 font-mono font-bold">{entry.pixelsPlaced.toLocaleString()}</span>
                            </div>
                            <div className="w-px h-3 bg-gray-800"></div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-gray-500 uppercase tracking-wider">Donated</span>
                              <span className="text-green-400 font-mono font-bold">${Number(entry.totalDonated).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Rank Badge */}
                        {entry.rank <= 3 && (
                          <div className="hidden sm:flex items-center justify-center w-10 h-10 border border-gray-800 bg-black/50">
                            <span className={`text-lg ${
                              entry.rank === 1 ? 'text-yellow-500' :
                              entry.rank === 2 ? 'text-gray-400' :
                              'text-orange-500'
                            }`}>
                              {entry.rank === 1 ? '★' : entry.rank === 2 ? '★' : '★'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors pointer-events-none" />
                    </div>
                  ))}
                </AnimatedList>
              )}

              <div className="mt-6 p-3 border border-gray-800 bg-black/30">
                <p className="text-xs text-center text-gray-500 font-mono">
                  PLACE MORE PIXELS AND DONATE TO CLIMB THE LEADERBOARD
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

