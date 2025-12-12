'use client'

import { useEffect, useRef } from 'react'

interface Pixel {
  x: number
  y: number
  size: number
  baseColor: string
  activeColor: string
  opacity: number
  targetOpacity: number
  speed: number
}

interface PixelWorldMapProps {
  className?: string
  pixelSize?: number
  gap?: number
  colors?: string[]
  animationSpeed?: number
}

export default function PixelWorldMap({
  className = '',
  pixelSize = 4,
  gap = 4,
  colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'],
  animationSpeed = 0.02
}: PixelWorldMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pixelsRef = useRef<Pixel[]>([])
  const requestRef = useRef<number>(0)

  // 扩大的世界地图区域定义 (x, y, width, height) 0-100 坐标系
  // 坐标经过调整，更贴近边缘，覆盖更广
  const continents = [
    // 北美 (扩大)
    { x: 5, y: 5, w: 30, h: 25 }, 
    { x: 2, y: 2, w: 20, h: 20 },
    // 南美 (扩大)
    { x: 25, y: 40, w: 15, h: 35 },
    { x: 30, y: 70, w: 8, h: 15 },
    // 欧洲 (扩大)
    { x: 45, y: 5, w: 20, h: 20 },
    // 非洲 (扩大)
    { x: 45, y: 30, w: 25, h: 35 },
    { x: 50, y: 60, w: 15, h: 15 },
    // 亚洲 (扩大)
    { x: 60, y: 5, w: 35, h: 35 },
    { x: 75, y: 35, w: 15, h: 15 }, // 东南亚
    // 澳洲 (扩大)
    { x: 80, y: 60, w: 15, h: 15 },
    // 极地/边缘补充
    { x: 30, y: 0, w: 40, h: 5 }, // 北极圈意向
    { x: 0, y: 20, w: 5, h: 40 }, // 太平洋左侧
    { x: 95, y: 20, w: 5, h: 40 }, // 太平洋右侧
  ]

  const isInContinent = (x: number, y: number) => {
    // 增加噪声范围
    const noise = (Math.random() - 0.5) * 3
    return continents.some(c => 
      x >= c.x + noise && 
      x <= c.x + c.w + noise && 
      y >= c.y + noise && 
      y <= c.y + c.h + noise
    )
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const initMap = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.offsetWidth
        canvas.height = parent.offsetHeight
      }

      pixelsRef.current = []
      
      const step = pixelSize + gap
      const cols = Math.floor(canvas.width / step)
      const rows = Math.floor(canvas.height / step)
      
      const offsetX = (canvas.width - cols * step) / 2
      const offsetY = (canvas.height - rows * step) / 2

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const relX = (i / cols) * 100
          const relY = (j / rows) * 100

          let shouldDraw = false
          let isOcean = false

          if (isInContinent(relX, relY)) {
            // 大陆区域：保留 80% 的点，更密集
            if (Math.random() > 0.2) {
              shouldDraw = true
            }
          } else {
            // 海洋区域：随机生成稀疏噪点 (5%)
            if (Math.random() < 0.05) {
              shouldDraw = true
              isOcean = true
            }
          }

          if (shouldDraw) {
            pixelsRef.current.push({
              x: offsetX + i * step,
              y: offsetY + j * step,
              size: pixelSize,
              baseColor: isOcean ? '#ffffff' : '#ffffff', // 统一白色基础，透明度控制深浅
              activeColor: colors[Math.floor(Math.random() * colors.length)],
              // 海洋像素更淡
              opacity: isOcean ? Math.random() * 0.1 : Math.random() * 0.3 + 0.1,
              targetOpacity: isOcean ? Math.random() * 0.1 : Math.random() * 0.3 + 0.1,
              speed: Math.random() * animationSpeed + 0.005
            })
          }
        }
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      pixelsRef.current.forEach(pixel => {
        if (Math.abs(pixel.opacity - pixel.targetOpacity) < 0.01) {
          // 重新随机目标透明度
          const isHighlight = Math.random() < 0.05
          pixel.targetOpacity = isHighlight ? 0.8 : Math.random() * 0.4 + 0.1
        }
        
        const dir = pixel.targetOpacity > pixel.opacity ? 1 : -1
        pixel.opacity += dir * pixel.speed

        ctx.fillStyle = pixel.opacity > 0.6 ? pixel.activeColor : pixel.baseColor
        ctx.globalAlpha = Math.max(0, pixel.opacity) // 确保不为负
        ctx.fillRect(pixel.x, pixel.y, pixel.size, pixel.size)
      })

      requestRef.current = requestAnimationFrame(animate)
    }

    initMap()
    animate()

    const handleResize = () => {
      initMap()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [pixelSize, gap, colors, animationSpeed])

  return (
    <canvas 
      ref={canvasRef} 
      className={`absolute inset-0 z-10 pointer-events-none ${className}`}
    />
  )
}
