"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { WAVE_CONSTANTS, WAVE_COLORS } from '../constants/wave-animation'
import { useWaveAnimation } from '../hooks/useWaveAnimation'
import { useCanvasInteraction } from '../hooks/useCanvasInteraction'

interface WaveRectangleProps {
  width: number
  className?: string
  stoneColor: string
  stoneImage?: string
  activeTab: "color" | "image" // 추가: 현재 활성화된 탭
}

interface Stone {
  x: number
  y: number
  size: number
  velocity: number
  active: boolean
  color: string
  image?: HTMLImageElement // 추가: 이미지 객체
}

interface Ripple {
  x: number
  y: number
  radius: number
  maxRadius: number
  strength: number
  opacity: number
  age: number
  active: boolean
}

interface HoldState {
  isHolding: boolean
  x: number
  y: number
  startTime: number
  size: number
  isDragging: boolean
  lastStoneTime: number
  initialX: number
  initialY: number
  stoneDropped: boolean
  grownSize: number
}

interface WaveAnimationProps {
  onStoneCountChange?: (count: number) => void
  stoneImage?: string
  maxStones?: number
}

export const WaveAnimation = ({ onStoneCountChange, stoneImage, maxStones = 10 }: WaveAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contextRef = useRef<CanvasRenderingContext2D | null>(null)
  const waterLevelRef = useRef(0)
  const lastStoneTimeRef = useRef(0)
  const pointerDownRef = useRef(false)
  const pointerPosRef = useRef({ x: 0, y: 0 })
  const stoneImageRef = useRef<HTMLImageElement | null>(null)
  const animationFrameRef = useRef<number>(0)

  const initializeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const context = canvas.getContext('2d')
    if (!context) return

    context.scale(dpr, dpr)
    contextRef.current = context
    waterLevelRef.current = rect.height * 0.7
  }, [])

  const { stonesRef, ripplesRef, stoneCount, createStone, createRipple } = useWaveAnimation(
    canvasRef.current?.width || 0,
    canvasRef.current?.height || 0
  )

  useEffect(() => {
    if (stoneImage) {
      const img = new Image()
      img.src = stoneImage
      img.onload = () => {
        stoneImageRef.current = img
      }
    }
  }, [stoneImage])

  useEffect(() => {
    onStoneCountChange?.(stoneCount)
  }, [stoneCount, onStoneCountChange])

  useEffect(() => {
    initializeCanvas()
    const handleResize = () => {
      initializeCanvas()
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [initializeCanvas])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (stoneCount >= maxStones) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    pointerDownRef.current = true
    pointerPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    const now = Date.now()
    if (now - lastStoneTimeRef.current > WAVE_CONSTANTS.STONE_CREATION_INTERVAL) {
      const size = WAVE_CONSTANTS.MIN_STONE_SIZE + Math.random() * (WAVE_CONSTANTS.MAX_STONE_SIZE - WAVE_CONSTANTS.MIN_STONE_SIZE)
      const color = WAVE_COLORS.STONE_BORDER
      createStone(pointerPosRef.current.x, pointerPosRef.current.y, size, color, stoneImageRef.current || undefined)
      createRipple(pointerPosRef.current.x, pointerPosRef.current.y, size)
      lastStoneTimeRef.current = now
    }
  }, [createStone, createRipple, stoneCount, maxStones])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pointerDownRef.current || stoneCount >= maxStones) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const currentPos = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }

    const now = Date.now()
    if (now - lastStoneTimeRef.current > WAVE_CONSTANTS.STONE_CREATION_INTERVAL) {
      const size = WAVE_CONSTANTS.MIN_STONE_SIZE + Math.random() * (WAVE_CONSTANTS.MAX_STONE_SIZE - WAVE_CONSTANTS.MIN_STONE_SIZE)
      const color = WAVE_COLORS.STONE_BORDER
      createStone(currentPos.x, currentPos.y, size, color, stoneImageRef.current || undefined)
      createRipple(currentPos.x, currentPos.y, size)
      lastStoneTimeRef.current = now
    }

    pointerPosRef.current = currentPos
  }, [createStone, createRipple, stoneCount, maxStones])

  const handlePointerUp = useCallback(() => {
    pointerDownRef.current = false
  }, [])

  return (
    <canvas
      ref={canvasRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    />
  )
}

export default function WaveRectangle({
  width,
  className = "",
  stoneColor,
  stoneImage,
  activeTab,
}: WaveRectangleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const height = width * 0.6 // Set height proportional to width
  const [stoneCount, setStoneCount] = useState(0)
  const stoneColorRef = useRef(stoneColor)
  const stoneImageRef = useRef<HTMLImageElement | null>(null)
  const stoneImageLoadedRef = useRef(false)
  const isPressingRef = useRef(false)
  const pressDurationRef = useRef(0)
  const lastPositionRef = useRef({ x: 0, y: 0 })

  // Use refs instead of state for animation-critical values to avoid re-renders
  const holdStateRef = useRef<HoldState>({
    isHolding: false,
    x: 0,
    y: 0,
    startTime: 0,
    size: 3,
    isDragging: false,
    lastStoneTime: 0,
    initialX: 0,
    initialY: 0,
    stoneDropped: false,
    grownSize: 3,
  })

  // Refs to store stones and ripples
  const stonesRef = useRef<Stone[]>([])
  const ripplesRef = useRef<Ripple[]>([])
  const animationFrameIdRef = useRef<number>(0)
  const isAnimatingRef = useRef<boolean>(true)

  // Water level (where stones will create ripples)
  const waterLevelRef = useRef(height * 0.5)

  // 이미지 로드 처리
  useEffect(() => {
    if (stoneImage) {
      const img = new Image()
      img.crossOrigin = "anonymous" // CORS 이슈 방지
      img.onload = () => {
        stoneImageRef.current = img
        stoneImageLoadedRef.current = true
      }
      img.onerror = () => {
        stoneImageRef.current = null
        stoneImageLoadedRef.current = false
        console.error("Failed to load stone image")
      }
      img.src = stoneImage
    } else {
      stoneImageRef.current = null
      stoneImageLoadedRef.current = false
    }
  }, [stoneImage])

  // stoneColor가 변경될 때 ref 업데이트
  useEffect(() => {
    stoneColorRef.current = stoneColor
  }, [stoneColor])

  // Create a stable animation function that doesn't depend on changing props
  const setupAnimation = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions with device pixel ratio for sharp rendering
    const dpr = window.devicePixelRatio || 1
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)

    // Update water level based on height
    waterLevelRef.current = height * 0.5

    // Animation variables
    let time = 0

    // Wave parameters
    const waveCount = 3
    const waves = Array.from({ length: waveCount }, (_, i) => ({
      amplitude: 8 + i * 4,
      frequency: 0.02 - i * 0.005,
      speed: 0.05 + i * 0.02,
      phase: 0,
      color: `rgba(0, 120, 255, ${0.3 - i * 0.1})`,
    }))

    // Function to create a splash effect
    const createSplash = (x: number, y: number, stoneSize: number) => {
      // Scale splash based on stone size
      const splashCount = Math.floor(8 + stoneSize / 2)
      const splashSize = 2 + stoneSize / 3
      const splashRadius = 10 + stoneSize

      // Draw splash particles
      for (let i = 0; i < splashCount; i++) {
        const angle = (Math.PI * 2 * i) / splashCount
        const splashX = x + Math.cos(angle) * splashRadius
        const splashY = y - 5 - Math.random() * splashRadius

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.beginPath()
        ctx.arc(splashX, splashY, splashSize * Math.random(), 0, Math.PI * 2)
        ctx.fill()
      }
    }

    // Function to create a new ripple
    const createRipple = (x: number, y: number, stoneSize: number) => {
      const ripples = ripplesRef.current

      // Find an inactive ripple or create a new one
      let ripple = ripples.find((r) => !r.active)

      if (!ripple) {
        ripple = {
          x: 0,
          y: 0,
          radius: 0,
          maxRadius: 0,
          strength: 0,
          opacity: 1,
          age: 0,
          active: false,
        }
        ripples.push(ripple)
      }

      // Initialize ripple with strength based on stone size
      ripple.x = x
      ripple.y = y
      ripple.radius = 5
      ripple.maxRadius = 100 + stoneSize * 10 // Larger stones create larger ripples
      ripple.strength = 15 + stoneSize * 2 // Larger stones create stronger ripples
      ripple.opacity = 1
      ripple.age = 0
      ripple.active = true
    }

    // Function to create a new stone
    const createStone = (x: number, y: number, size: number) => {
      const stones = stonesRef.current

      // Find an inactive stone or create a new one
      let stone = stones.find((s) => !s.active)

      if (!stone) {
        stone = {
          x: 0,
          y: 0,
          size: 0,
          velocity: 0,
          active: false,
          color: stoneColorRef.current,
          image: activeTab === "image" && stoneImageLoadedRef.current ? stoneImageRef.current || undefined : undefined,
        }
        stones.push(stone)
      }

      // Initialize stone
      stone.x = x
      stone.y = y
      stone.size = size
      stone.velocity = 0.9 * (1 + size / 10) // Reduced by 10% to fall slower
      stone.active = true
      stone.color = stoneColorRef.current
      stone.image =
        activeTab === "image" && stoneImageLoadedRef.current ? stoneImageRef.current || undefined : undefined
    }

    // 입체감 있는 돌맹이 그리기 함수
    const drawStone = (x: number, y: number, size: number, color: string, image?: HTMLImageElement) => {
      // 클리핑 영역 설정 (원형)
      ctx.save()
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.clip()

      if (image) {
        // 이미지가 있는 경우 이미지 그리기
        try {
          // 이미지를 원형으로 그리기
          const aspectRatio = image.width / image.height
          let drawWidth, drawHeight, drawX, drawY

          if (aspectRatio >= 1) {
            // 이미지가 가로로 더 긴 경우
            drawHeight = size * 2
            drawWidth = drawHeight * aspectRatio
            drawX = x - drawWidth / 2
            drawY = y - drawHeight / 2
          } else {
            // 이미지가 세로로 더 긴 경우
            drawWidth = size * 2
            drawHeight = drawWidth / aspectRatio
            drawX = x - drawWidth / 2
            drawY = y - drawHeight / 2
          }

          ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight)
        } catch (error) {
          console.error("Error drawing image:", error)
          // 이미지 그리기 실패 시 색상으로 대체
          ctx.fillStyle = color
          ctx.fillRect(x - size, y - size, size * 2, size * 2)
        }
      } else {
        // 이미지가 없는 경우 색상으로 채우기
        ctx.fillStyle = color
        ctx.fillRect(x - size, y - size, size * 2, size * 2)
      }

      // 입체감을 위한 그라데이션 오버레이
      const gradient = ctx.createRadialGradient(
        x - size * 0.3,
        y - size * 0.3,
        size * 0.1, // 하이라이트 시작점
        x,
        y,
        size, // 그라데이션 끝점
      )
      gradient.addColorStop(0, "rgba(255, 255, 255, 0.4)") // 하이라이트
      gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.1)")
      gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.05)")
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.3)") // 그림자

      ctx.fillStyle = gradient
      ctx.fill()

      // 테두리 효과
      ctx.strokeStyle = "rgba(0, 0, 0, 0.2)"
      ctx.lineWidth = 1
      ctx.stroke()

      ctx.restore()
    }

    // Draw function - the core animation loop
    const draw = () => {
      if (!isAnimatingRef.current) return

      // Clear canvas
      ctx.clearRect(0, 0, width, height)

      // Update time
      time += 0.05

      // Draw sky background
      const skyGradient = ctx.createLinearGradient(0, 0, 0, waterLevelRef.current)
      skyGradient.addColorStop(0, "rgba(135, 206, 250, 0.8)")
      skyGradient.addColorStop(1, "rgba(200, 240, 255, 0.5)")
      ctx.fillStyle = skyGradient
      ctx.fillRect(0, 0, width, height)

      // Draw each wave layer
      waves.forEach((wave, waveIndex) => {
        // Update phase
        wave.phase += wave.speed

        ctx.beginPath()
        ctx.moveTo(0, height)

        // Draw wave path
        for (let x = 0; x <= width; x += 5) {
          let waveY = Math.sin(x * wave.frequency + wave.phase) * wave.amplitude

          // Add ripple influences
          ripplesRef.current.forEach((ripple) => {
            if (ripple.active) {
              const distX = x - ripple.x
              const distance = Math.abs(distX)

              // Calculate influence based on distance and ripple size
              // Use a smoother falloff function
              const normalizedDistance = distance / ripple.radius
              const influence = Math.max(0, 1 - normalizedDistance * normalizedDistance)

              if (distance < ripple.radius) {
                // Calculate ripple effect with smooth falloff based on age
                const ageRatio = Math.min(1, ripple.age / 120)
                const fadeOutFactor = Math.cos((ageRatio * Math.PI) / 2) // Smooth cosine falloff

                // Use ripple strength and age to determine wave height
                const rippleHeight = influence * ripple.strength * fadeOutFactor

                // Add a phase shift based on distance for more natural wave motion
                const phaseShift = distance / 20 + time * 2
                waveY += Math.sin(phaseShift) * rippleHeight
              }
            }
          })

          // Position waves at different heights
          const baseY = waterLevelRef.current + height * 0.1 * waveIndex
          ctx.lineTo(x, baseY + waveY)
        }

        // Complete the wave path
        ctx.lineTo(width, height)
        ctx.lineTo(0, height)
        ctx.closePath()

        // Fill wave
        ctx.fillStyle = wave.color
        ctx.fill()
      })

      // Update and draw stones
      const stones = stonesRef.current
      for (let i = 0; i < stones.length; i++) {
        const stone = stones[i]
        if (stone.active) {
          // Update stone position with gravity
          stone.y += stone.velocity
          stone.velocity += 0.18 // Gravity effect reduced by 10%

          // Check if stone hit water
          if (stone.y >= waterLevelRef.current && stone.velocity > 0) {
            stone.active = false

            // Create ripple at impact point with strength based on stone size
            createRipple(stone.x, waterLevelRef.current, stone.size)

            // Create splash effect
            createSplash(stone.x, waterLevelRef.current, stone.size)
          }

          // Draw stone with image or color
          drawStone(stone.x, stone.y, stone.size, stone.color, stone.image)
        }
      }

      // Update ripples with smoother transitions
      const ripples = ripplesRef.current
      for (let i = 0; i < ripples.length; i++) {
        const ripple = ripples[i]
        if (ripple.active) {
          // Increment age
          ripple.age += 1

          // Calculate expansion rate that slows down over time
          const expansionRate = 2.5 * Math.max(0.2, 1 - ripple.age / 100)
          ripple.radius += expansionRate

          // Gradually reduce strength for natural fadeout
          if (ripple.age > 60) {
            // Start fading after a delay
            const fadeProgress = (ripple.age - 60) / 120
            ripple.strength *= 1 - 0.01 * fadeProgress
          }

          // Only deactivate ripple after it's fully faded out
          if (ripple.age > 180 || ripple.radius >= ripple.maxRadius) {
            ripple.active = false
          }
        }
      }

      // Draw growing stone preview when holding mouse (only if not dragging)
      const holdState = holdStateRef.current
      if (holdState.isHolding && !holdState.isDragging && holdState.y < waterLevelRef.current) {
        // Calculate growing size based on hold duration
        const holdDuration = Date.now() - holdState.startTime
        holdState.size = Math.min(20, 3 + holdDuration / 100)
        holdState.grownSize = holdState.size // Store the current grown size

        // Draw growing stone preview with image or color
        drawStone(
          holdState.x,
          holdState.y,
          holdState.size,
          stoneColorRef.current,
          activeTab === "image" && stoneImageLoadedRef.current ? stoneImageRef.current || undefined : undefined,
        )

        // Draw size indicator
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(holdState.x, holdState.y, holdState.size + 5, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Continue animation loop
      animationFrameIdRef.current = requestAnimationFrame(draw)
    }

    // Start the animation
    isAnimatingRef.current = true
    draw()

    // Return a cleanup function
    return () => {
      isAnimatingRef.current = false
      cancelAnimationFrame(animationFrameIdRef.current)
    }
  }, [width, activeTab])

  useEffect(() => {
    // Set up mouse event handlers
    const canvas = canvasRef.current
    if (!canvas) return

    // Helper function to get canvas coordinates from event
    const getCanvasCoordinates = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect()
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      }
    }

    // Helper function to start holding
    const startHolding = (x: number, y: number) => {
      // Only start holding if in sky area
      if (y < waterLevelRef.current) {
        holdStateRef.current = {
          isHolding: true,
          x,
          y,
          startTime: Date.now(),
          size: 3,
          isDragging: false,
          lastStoneTime: 0,
          initialX: x,
          initialY: y,
          stoneDropped: false,
          grownSize: 3,
        }
      }
    }

    // Helper function to create a stone
    const createStone = (x: number, y: number, size: number) => {
      if (y >= waterLevelRef.current) return // Only create stones in sky area

      setTimeout(() => {
        const stones = stonesRef.current
        let stone = stones.find((s) => !s.active)

        if (!stone) {
          stone = {
            x: 0,
            y: 0,
            size: 0,
            velocity: 0,
            active: false,
            color: stoneColorRef.current,
            image:
              activeTab === "image" && stoneImageLoadedRef.current ? stoneImageRef.current || undefined : undefined,
          }
          stones.push(stone)
        }

        stone.x = x
        stone.y = y
        stone.size = size
        stone.velocity = 0.9 * (1 + size / 10)
        stone.active = true
        stone.color = stoneColorRef.current
        stone.image =
          activeTab === "image" && stoneImageLoadedRef.current ? stoneImageRef.current || undefined : undefined

        // Increment stone count
        setStoneCount((prevCount) => prevCount + 1)
      }, 0)
    }

    // Helper function to end holding and create stone
    const endHolding = () => {
      const holdState = holdStateRef.current
      if (holdState.isHolding) {
        // Only create a stone if not in dragging mode
        if (!holdState.isDragging) {
          // Create stone with size based on hold duration
          createStone(holdState.x, holdState.y, holdState.grownSize)
        }
      }

      holdStateRef.current.isHolding = false
      holdStateRef.current.isDragging = false
      holdStateRef.current.stoneDropped = false
    }

    // Helper function to update holding position
    const updateHoldingPosition = (x: number, y: number) => {
      const holdState = holdStateRef.current
      if (holdState.isHolding) {
        // Check if we should switch to dragging mode
        if (!holdState.isDragging) {
          const dx = x - holdState.initialX
          const dy = y - holdState.initialY
          const distance = Math.sqrt(dx * dx + dy * dy)

          // If moved more than 5 pixels, switch to dragging mode
          if (distance > 5) {
            holdState.isDragging = true
            // Store the current grown size when dragging starts
            holdState.grownSize = Math.max(holdState.grownSize, holdState.size)
          }
        }

        // If in dragging mode, create stones of the grown size along the path
        if (holdState.isDragging && y < waterLevelRef.current) {
          const now = Date.now()
          // Create stones at a rate of about 20 per second (50ms interval)
          if (now - holdState.lastStoneTime > 50) {
            // Use the grown size for all stones created during dragging
            createStone(x, y, holdState.grownSize)
            holdState.lastStoneTime = now
          }
        }

        // Update position
        holdStateRef.current.x = x
        holdStateRef.current.y = y
      }
    }

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      const coords = getCanvasCoordinates(e.clientX, e.clientY)
      startHolding(coords.x, coords.y)
    }

    const handleMouseUp = () => {
      endHolding()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const coords = getCanvasCoordinates(e.clientX, e.clientY)
      updateHoldingPosition(coords.x, coords.y)
    }

    const handleMouseLeave = () => {
      holdStateRef.current.isHolding = false
      holdStateRef.current.isDragging = false
      holdStateRef.current.stoneDropped = false
    }

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault() // Prevent default touch behaviors like scrolling
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const coords = getCanvasCoordinates(touch.clientX, touch.clientY)
        startHolding(coords.x, coords.y)
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault()
      endHolding()
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        const coords = getCanvasCoordinates(touch.clientX, touch.clientY)
        updateHoldingPosition(coords.x, coords.y)
      }
    }

    const handleTouchCancel = (e: TouchEvent) => {
      e.preventDefault()
      holdStateRef.current.isHolding = false
      holdStateRef.current.isDragging = false
      holdStateRef.current.stoneDropped = false
    }

    // Add mouse event listeners
    canvas.addEventListener("mousedown", handleMouseDown)
    canvas.addEventListener("mouseup", handleMouseUp)
    canvas.addEventListener("mousemove", handleMouseMove)
    canvas.addEventListener("mouseleave", handleMouseLeave)

    // Add touch event listeners
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false })
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false })
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false })
    canvas.addEventListener("touchcancel", handleTouchCancel)

    // Set up the animation
    const cleanup = setupAnimation()

    // Cleanup function
    return () => {
      // Remove mouse event listeners
      canvas.removeEventListener("mousedown", handleMouseDown)
      canvas.removeEventListener("mouseup", handleMouseUp)
      canvas.removeEventListener("mousemove", handleMouseMove)
      canvas.removeEventListener("mouseleave", handleMouseLeave)

      // Remove touch event listeners
      canvas.removeEventListener("touchstart", handleTouchStart)
      canvas.removeEventListener("touchend", handleTouchEnd)
      canvas.removeEventListener("touchmove", handleTouchMove)
      canvas.removeEventListener("touchcancel", handleTouchCancel)

      cleanup?.()
    }
  }, [setupAnimation, activeTab])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          cursor: "pointer",
          touchAction: "none", // Disable browser touch actions like scrolling
        }}
        className={className}
      />
      <div className="absolute top-3 right-3 bg-white bg-opacity-70 w-8 h-8 flex items-center justify-center rounded-full shadow-sm text-sm font-bold text-blue-800">
        {stoneCount}
      </div>
    </div>
  )
}
