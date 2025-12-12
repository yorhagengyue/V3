'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PillNav from '@/components/ui/PillNav'

const navItems = [
  { id: 'how-it-works', label: 'How It Works', href: '#how-it-works' },
  { id: 'our-story', label: 'Our Story', href: '#our-story' },
  { id: 'vision', label: 'Vision', href: '#vision' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-black/30 backdrop-blur-md border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-white rounded-sm"></div>
                <div className="bg-white/60 rounded-sm"></div>
                <div className="bg-white/60 rounded-sm"></div>
                <div className="bg-white rounded-sm"></div>
              </div>
            </div>
            <span className="font-semibold text-lg text-white">
              Pixel Canvas
            </span>
          </Link>

          {/* Pill Navigation */}
          <div className="hidden md:block">
            <PillNav items={navItems} defaultActive="how-it-works" />
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 text-white/80 hover:text-white rounded-lg transition-colors hover:bg-white/10"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium px-5 py-2.5 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

