'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import DotGrid from '@/components/ui/DotGrid'

export default function LoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [devCode, setDevCode] = useState('')

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code')
      }

      if (data.devCode) {
        setDevCode(data.devCode)
      }

      setStep('code')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, username: username || undefined }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify code')
      }

      // 登录成功，跳转到项目页面
      router.push('/projects')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a] relative overflow-hidden">
      {/* DotGrid Background */}
      <div className="absolute inset-0">
        <DotGrid
          dotSize={4}
          gap={28}
          baseColor="#1a1a1a"
          activeColor="#8b5cf6"
          proximity={180}
          speedTrigger={100}
          shockRadius={280}
          shockStrength={10}
          maxSpeed={5500}
          resistance={750}
          returnDuration={1.8}
        />
      </div>
      
      <div className="max-w-md w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-block">
            <h1 className="text-6xl font-black text-white mb-3 tracking-tight">
              Pixel Canvas
            </h1>
            <div className="h-1 w-20 bg-purple-500 mx-auto mb-4"></div>
          </Link>
          <p className="text-gray-400 text-base font-light tracking-wider">PAINT FOR THE PLANET</p>
        </div>

        {/* Login Form */}
        <div className="bg-[#111111] border border-gray-800 p-10">
          {step === 'email' ? (
            <form onSubmit={handleSendCode}>
              <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Login / Sign Up</h2>

              <div className="mb-8">
                <label htmlFor="email" className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-800 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
                  placeholder="your@email.com"
                  required
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-purple-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-purple-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode}>
              <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Verify Email</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-400">
                  Code sent to <span className="text-white font-semibold">{email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setCode('')
                    setDevCode('')
                  }}
                  className="text-xs text-purple-400 hover:text-purple-300 uppercase tracking-wider mt-1"
                >
                  Change email
                </button>
              </div>

              {devCode && (
                <div className="mb-6 p-4 bg-yellow-500/10 border-l-4 border-yellow-500">
                  <p className="text-xs text-yellow-400 font-semibold mb-2 uppercase tracking-wider">Dev Mode</p>
                  <p className="text-3xl font-mono font-bold text-yellow-300">{devCode}</p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="code" className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-800 text-white text-3xl font-mono text-center tracking-[0.5em] focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-800"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="mb-8">
                <label htmlFor="username" className="block text-xs font-semibold text-gray-400 mb-3 uppercase tracking-widest">
                  Username <span className="text-gray-600 normal-case">(for new users)</span>
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-0 py-4 bg-transparent border-b-2 border-gray-800 text-white text-lg focus:outline-none focus:border-purple-500 transition-colors placeholder:text-gray-700"
                  placeholder="Choose a username"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-5 bg-purple-600 text-white font-bold text-sm uppercase tracking-widest hover:bg-purple-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying...' : 'Verify and Login'}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs mt-8 uppercase tracking-wider">
          By logging in, you agree to our Terms & Privacy
        </p>
      </div>
    </div>
  )
}

