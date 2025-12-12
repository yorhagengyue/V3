'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Pixel {
  positionX: number
  positionY: number
  color: string
  contributorName?: string
  contributorMessage?: string
}

interface PixelCanvasProps {
  gridSize: number
  pixels: Pixel[]
  selectedColor: string
  onPixelClick: (x: number, y: number) => void
  disabled?: boolean
}

export default function PixelCanvas({
  gridSize,
  pixels,
  selectedColor,
  onPixelClick,
  disabled = false,
}: PixelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasWrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hoveredPixel, setHoveredPixel] = useState<{ x: number; y: number } | null>(null)
  const [hoveredInfo, setHoveredInfo] = useState<Pixel | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Transform state
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  
  // Drawing state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingPixel, setPendingPixel] = useState<{ x: number; y: number } | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)
  const [continuousMode, setContinuousMode] = useState(false)
  
  // UI enhancements
  const [showCrosshair, setShowCrosshair] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; canvasX: number; canvasY: number } | null>(null)

  const canvasSize = 800 // Base canvas size
  const pixelSize = canvasSize / gridSize

  // 渲染画布
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 清空画布
    ctx.clearRect(0, 0, canvasSize, canvasSize)

    // 绘制网格背景
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasSize, canvasSize)

    // 绘制网格线（根据设置和缩放级别）
    if (showGrid && scale >= 0.3) {
      ctx.strokeStyle = scale > 2 ? '#d1d5db' : '#e5e7eb'
      ctx.lineWidth = 0.5 / scale

      // 每5个格子加粗一次（在高缩放时）
      for (let i = 0; i <= gridSize; i++) {
        const isThick = i % 5 === 0 && scale > 1.5
        ctx.lineWidth = isThick ? 1 / scale : 0.5 / scale
        ctx.strokeStyle = isThick ? '#9ca3af' : '#e5e7eb'

        ctx.beginPath()
        ctx.moveTo(i * pixelSize, 0)
        ctx.lineTo(i * pixelSize, canvasSize)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(0, i * pixelSize)
        ctx.lineTo(canvasSize, i * pixelSize)
        ctx.stroke()
      }
    }


    // 绘制像素
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color
      ctx.fillRect(
        pixel.positionX * pixelSize,
        pixel.positionY * pixelSize,
        pixelSize,
        pixelSize
      )
    })

    // 高亮悬停的行列（十字准星）
    if (hoveredPixel && !disabled && showCrosshair && !isPanning) {
      ctx.save()
      
      // 使用固定的紫色高亮，避免在白色背景上看不见
      ctx.globalAlpha = 0.08
      ctx.fillStyle = '#8b5cf6' // 紫色

      // 高亮行
      ctx.fillRect(
        0,
        hoveredPixel.y * pixelSize,
        canvasSize,
        pixelSize
      )

      // 高亮列
      ctx.fillRect(
        hoveredPixel.x * pixelSize,
        0,
        pixelSize,
        canvasSize
      )
      ctx.restore()

      // 高亮悬停像素边框 - 使用深色边框确保可见
      ctx.strokeStyle = '#6366f1' // 使用靛蓝色边框
      ctx.lineWidth = 3 / scale
      ctx.strokeRect(
        hoveredPixel.x * pixelSize,
        hoveredPixel.y * pixelSize,
        pixelSize,
        pixelSize
      )

      // 预览颜色（半透明）- 只在非禁用状态下显示
      if (!disabled) {
        ctx.fillStyle = selectedColor + '80'
        ctx.fillRect(
          hoveredPixel.x * pixelSize,
          hoveredPixel.y * pixelSize,
          pixelSize,
          pixelSize
        )
      }
    }
  }, [pixels, gridSize, hoveredPixel, selectedColor, disabled, scale, pixelSize, canvasSize, showGrid, showCrosshair, isPanning])

  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback((screenX: number, screenY: number) => {
    const wrapper = canvasWrapperRef.current
    if (!wrapper) return null

    const rect = wrapper.getBoundingClientRect()
    
    // Mouse position relative to the wrapper container
    const relativeX = screenX - rect.left
    const relativeY = screenY - rect.top
    
    // Apply inverse transform: subtract offset, then divide by scale
    const x = (relativeX - offset.x) / scale
    const y = (relativeY - offset.y) / scale
    
    return { x, y }
  }, [scale, offset])

  // Zoom functions
  const handleZoom = useCallback((delta: number, centerX?: number, centerY?: number) => {
    setScale(prevScale => {
      const newScale = Math.max(0.25, Math.min(8, prevScale + delta))
      
      // Zoom towards center point
      if (centerX !== undefined && centerY !== undefined) {
        const wrapper = canvasWrapperRef.current
        if (wrapper) {
          const rect = wrapper.getBoundingClientRect()
          const mouseX = centerX - rect.left
          const mouseY = centerY - rect.top
          
          setOffset(prev => ({
            x: mouseX - (mouseX - prev.x) * (newScale / prevScale),
            y: mouseY - (mouseY - prev.y) * (newScale / prevScale)
          }))
        }
      }
      
      return newScale
    })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    // Only zoom when Ctrl key is pressed, otherwise allow normal page scrolling
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      e.stopPropagation()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      handleZoom(delta, e.clientX, e.clientY)
    }
  }, [handleZoom])

  // Pan functions
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      // Middle mouse or Shift+Click to pan
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
    }
  }, [offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      })
      return
    }

    const coords = screenToCanvas(e.clientX, e.clientY)
    if (!coords) return

    const x = Math.floor(coords.x / pixelSize)
    const y = Math.floor(coords.y / pixelSize)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      setHoveredPixel({ x, y })
      const pixelInfo = pixels.find(p => p.positionX === x && p.positionY === y)
      setHoveredInfo(pixelInfo || null)
    } else {
      setHoveredPixel(null)
      setHoveredInfo(null)
    }
    
    // Early return if disabled (after setting hover info)
    if (disabled) return
  }, [isPanning, disabled, panStart, screenToCanvas, pixelSize, gridSize, pixels])

  const handleMouseUp = useCallback(() => {
    setIsPanning(false)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const coords = screenToCanvas(e.clientX, e.clientY)
    if (!coords) return

    const x = Math.floor(coords.x / pixelSize)
    const y = Math.floor(coords.y / pixelSize)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        canvasX: x,
        canvasY: y
      })
    }
  }, [screenToCanvas, pixelSize, gridSize])

  const closeContextMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleZoomToPixel = useCallback((x: number, y: number) => {
    const targetScale = 6
    setScale(targetScale)

    const wrapper = canvasWrapperRef.current
    if (wrapper) {
      const rect = wrapper.getBoundingClientRect()
      const centerX = rect.width / 2
      const centerY = rect.height / 2

      setOffset({
        x: centerX - (x * pixelSize + pixelSize / 2) * targetScale,
        y: centerY - (y * pixelSize + pixelSize / 2) * targetScale
      })
    }
    closeContextMenu()
  }, [pixelSize, closeContextMenu])

  const handleCopyCoordinates = useCallback((x: number, y: number) => {
    navigator.clipboard.writeText(`(${x}, ${y})`)
    closeContextMenu()
  }, [closeContextMenu])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (disabled || isPanning) return

    const coords = screenToCanvas(e.clientX, e.clientY)
    if (!coords) return

    const x = Math.floor(coords.x / pixelSize)
    const y = Math.floor(coords.y / pixelSize)

    if (x >= 0 && x < gridSize && y >= 0 && y < gridSize) {
      if (continuousMode) {
        // In continuous mode, place immediately
        handlePlacePixel(x, y)
      } else {
        // Show confirmation modal
        setPendingPixel({ x, y })
        setShowConfirmModal(true)
      }
    }
  }, [disabled, isPanning, screenToCanvas, pixelSize, gridSize, continuousMode])

  const handlePlacePixel = useCallback(async (x: number, y: number) => {
    setIsPlacing(true)
    try {
      await onPixelClick(x, y)
    } finally {
      setIsPlacing(false)
      setShowConfirmModal(false)
      setPendingPixel(null)
    }
  }, [onPixelClick])

  const handleConfirmPlace = useCallback(() => {
    if (pendingPixel) {
      handlePlacePixel(pendingPixel.x, pendingPixel.y)
    }
  }, [pendingPixel, handlePlacePixel])

  const handleCancelPlace = useCallback(() => {
    setShowConfirmModal(false)
    setPendingPixel(null)
  }, [])

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Reset view
  const resetView = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCancelPlace()
        if (document.fullscreenElement) {
          document.exitFullscreen()
        }
      } else if (e.key === 'Enter' && showConfirmModal) {
        handleConfirmPlace()
      } else if (e.key === 'c' || e.key === 'C') {
        setContinuousMode(prev => !prev)
      } else if (e.key === 'r' || e.key === 'R') {
        resetView()
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [showConfirmModal, handleConfirmPlace, handleCancelPlace, resetView, toggleFullscreen])

  return (
    <div 
      ref={containerRef}
      className={`relative inline-block ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-900 flex items-center justify-center' : ''}`}
    >
      {/* Canvas Controls */}
      <div className="absolute top-3 left-3 flex gap-2 z-10">
        <button
          onClick={() => handleZoom(0.2)}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Zoom In (Ctrl + Scroll Up)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={() => handleZoom(-0.2)}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Zoom Out (Ctrl + Scroll Down)"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title="Reset View"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          )}
        </button>
        <div className="h-8 w-px bg-gray-300"></div>
        <button
          onClick={() => setContinuousMode(prev => !prev)}
          className={`px-3 py-2 border rounded-lg transition-all shadow-sm text-xs font-semibold ${
            continuousMode 
              ? 'bg-purple-600 border-purple-600 text-white' 
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          title="Toggle Continuous Mode (C)"
        >
          {continuousMode ? 'Continuous ON' : 'Confirm Mode'}
        </button>
      </div>


      {/* Zoom indicator with tip */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-2">
        <div className="bg-white border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 shadow-sm">
          {Math.round(scale * 100)}%
        </div>
        {!isFullscreen && scale === 1 && (
          <div className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg animate-pulse">
            Ctrl + Scroll to Zoom
          </div>
        )}
      </div>

      {/* Canvas */}
      <div 
        ref={canvasWrapperRef}
        className="overflow-hidden border border-gray-300 rounded-lg shadow-sm bg-white relative"
        style={{ 
          width: isFullscreen ? '90vw' : canvasSize,
          height: isFullscreen ? '90vh' : canvasSize,
          cursor: isPanning ? 'grabbing' : (disabled ? 'not-allowed' : 'crosshair')
        }}
        onWheel={handleWheel}
      >
        <div
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            width: canvasSize,
            height: canvasSize,
          }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize}
            height={canvasSize}
            className={disabled ? 'opacity-60' : ''}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              setHoveredPixel(null)
              setHoveredInfo(null)
              setIsPanning(false)
            }}
            onContextMenu={handleContextMenu}
          />
        </div>
      </div>

      {/* Coordinates */}
      {hoveredPixel && !isPanning && (
        <div className="absolute bottom-3 right-3 bg-gray-900/95 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs shadow-xl border border-gray-700">
          <p className="font-mono font-bold">
            ({hoveredPixel.x}, {hoveredPixel.y})
          </p>
        </div>
      )}

      {/* Pixel Info Tooltip */}
      {hoveredInfo && !isPanning && (
        <div className="absolute bottom-3 left-3 bg-white p-4 rounded-xl shadow-2xl border-2 border-purple-200 max-w-sm animate-in fade-in duration-200 z-10">
          <div className="space-y-2">
            {/* User Info */}
            <div className="flex items-center gap-3 pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2 flex-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {(hoveredInfo.contributorName || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-900">{hoveredInfo.contributorName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-500">Contributor</p>
                </div>
              </div>
              <div
                className="w-10 h-10 border-2 border-gray-300 rounded-lg shadow-sm flex-shrink-0"
                style={{ backgroundColor: hoveredInfo.color }}
                title={hoveredInfo.color}
              />
            </div>
            
            {/* Color Info */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 font-medium">Color:</span>
              <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{hoveredInfo.color}</span>
            </div>
            
            {/* Message */}
            {hoveredInfo.contributorMessage && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500 font-medium mb-1">Message:</p>
                <p className="text-sm text-gray-700 italic leading-relaxed bg-purple-50 p-2 rounded-lg border border-purple-100">
                  "{hoveredInfo.contributorMessage}"
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!isFullscreen && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-gray-600 shadow-sm border border-gray-200">
          <span className="font-semibold">Scroll to zoom • Shift+Drag to pan</span>
        </div>
      )}


      {/* Confirmation Modal */}
      {showConfirmModal && pendingPixel && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Place Pixel?</h3>
            
            {/* Preview */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Position</p>
                  <p className="text-xl font-mono font-bold text-gray-900">
                    {pendingPixel.x}, {pendingPixel.y}
                  </p>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">Color</p>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-lg border-2 border-gray-300 shadow-sm"
                      style={{ backgroundColor: selectedColor }}
                    />
                    <span className="text-xs font-mono text-gray-600">{selectedColor}</span>
                  </div>
                </div>
              </div>

              {/* Existing pixel warning */}
              {pixels.find(p => p.positionX === pendingPixel.x && p.positionY === pendingPixel.y) && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs text-yellow-800 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    This will overwrite an existing pixel
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancelPlace}
                disabled={isPlacing}
                className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel (ESC)
              </button>
              <button
                onClick={handleConfirmPlace}
                disabled={isPlacing}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isPlacing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Placing...
                  </>
                ) : (
                  'Confirm (Enter)'
                )}
              </button>
            </div>

            {/* Quick tip */}
            <p className="text-xs text-gray-500 text-center mt-4">
              Tip: Enable Continuous Mode to skip confirmations
            </p>
          </div>
        </div>
      )}


    </div>
  )
}

