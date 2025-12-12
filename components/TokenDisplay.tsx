'use client'

import { useEffect, useState } from 'react'

interface TokenDisplayProps {
  balance: number
  cooldownUntil: Date | null
  onDonate: () => void
}

export default function TokenDisplay({
  balance,
  cooldownUntil,
  onDonate,
}: TokenDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!cooldownUntil) {
      setTimeLeft(0)
      return
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, (new Date(cooldownUntil).getTime() - Date.now()) / 1000)
      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldownUntil])

  const isCoolingDown = timeLeft > 0
  const minutes = Math.floor(timeLeft / 60)
  const seconds = Math.floor(timeLeft % 60)

  return (
    <div className="bg-gradient-to-br from-purple-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm opacity-90 mb-2">Available Tokens</p>
          <p className="text-6xl font-black">{balance}</p>
        </div>

        <button
          onClick={onDonate}
          className="bg-white text-purple-600 px-5 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
        >
          Get Tokens
        </button>
      </div>

      {isCoolingDown && (
        <div className="pt-4 border-t border-white/20">
          <p className="text-xs opacity-75 mb-3">Next pixel available in:</p>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-2xl font-mono font-bold">
                {String(minutes).padStart(2, '0')}
              </span>
            </div>
            <span className="text-xl font-bold">:</span>
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-2xl font-mono font-bold">
                {String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      )}

      {!isCoolingDown && balance === 0 && (
        <div className="pt-4 border-t border-white/20">
          <p className="text-sm opacity-90">Get more tokens to continue creating</p>
        </div>
      )}
    </div>
  )
}

