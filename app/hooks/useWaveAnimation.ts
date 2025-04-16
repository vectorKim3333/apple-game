import { useCallback, useRef, useState } from 'react'
import { WAVE_COLORS, WAVE_CONSTANTS } from '@/app/constants/wave-animation'

interface Stone {
  x: number
  y: number
  size: number
  color: string
  image?: HTMLImageElement
  velocityY: number
  rotation: number
  rotationSpeed: number
}

interface Ripple {
  x: number
  y: number
  size: number
  maxSize: number
  opacity: number
  velocityY: number
}

export const useWaveAnimation = (canvasWidth: number, canvasHeight: number) => {
  const stonesRef = useRef<Stone[]>([])
  const ripplesRef = useRef<Ripple[]>([])
  const [stoneCount, setStoneCount] = useState(0)

  const createStone = useCallback((x: number, y: number, size: number, color: string, image?: HTMLImageElement) => {
    const stone: Stone = {
      x,
      y,
      size,
      color,
      image,
      velocityY: 0,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.1,
    }
    stonesRef.current.push(stone)
    setStoneCount(prev => prev + 1)
  }, [])

  const createRipple = useCallback((x: number, y: number, size: number) => {
    const ripple: Ripple = {
      x,
      y,
      size: size * 2,
      maxSize: size * 4,
      opacity: 1,
      velocityY: 0,
    }
    ripplesRef.current.push(ripple)
  }, [])

  return {
    stonesRef,
    ripplesRef,
    stoneCount,
    createStone,
    createRipple,
  }
} 