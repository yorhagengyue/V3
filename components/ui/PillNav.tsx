'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

interface NavItem {
  id: string
  label: string
  href: string
}

interface PillNavProps {
  items: NavItem[]
  defaultActive?: string
}

export default function PillNav({ items, defaultActive }: PillNavProps) {
  const [activeId, setActiveId] = useState(defaultActive || items[0]?.id)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const updatePill = () => {
      if (!navRef.current) return
      
      const activeElement = navRef.current.querySelector(
        `[data-nav-id="${activeId}"]`
      ) as HTMLElement
      
      if (activeElement) {
        const navRect = navRef.current.getBoundingClientRect()
        const activeRect = activeElement.getBoundingClientRect()
        
        setPillStyle({
          left: activeRect.left - navRect.left,
          width: activeRect.width,
        })
      }
    }

    updatePill()
    window.addEventListener('resize', updatePill)
    return () => window.removeEventListener('resize', updatePill)
  }, [activeId])

  const handleClick = (id: string, href: string) => {
    setActiveId(id)
    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav
      ref={navRef}
      className="relative inline-flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-full p-1.5 border border-white/20"
    >
      {/* Animated pill background */}
      <motion.div
        className="absolute h-[calc(100%-12px)] bg-white/20 rounded-full"
        animate={{
          left: pillStyle.left + 6,
          width: pillStyle.width,
        }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 30,
        }}
      />

      {/* Nav items */}
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          data-nav-id={item.id}
          onClick={(e) => {
            e.preventDefault()
            handleClick(item.id, item.href)
          }}
          className={`
            relative z-10 px-5 py-2 text-sm font-medium rounded-full transition-colors
            ${
              activeId === item.id
                ? 'text-white'
                : 'text-white/70 hover:text-white/90'
            }
          `}
        >
          {item.label}
        </a>
      ))}
    </nav>
  )
}

