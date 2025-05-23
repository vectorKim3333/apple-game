import { useCallback, useRef } from 'react'

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
  lastDragVelocity: number
}

export const useCanvasInteraction = (
  waterLevel: number,
  createStone: (x: number, y: number, size: number, color: string, image?: HTMLImageElement) => void,
  waveConstants: typeof import("@/app/constants/wave-animation").WAVE_CONSTANTS
) => {
  const holdStateRef = useRef<HoldState>({
    isHolding: false,
    x: 0,
    y: 0,
    startTime: 0,
    size: waveConstants.MIN_STONE_SIZE,
    isDragging: false,
    lastStoneTime: 0,
    initialX: 0,
    initialY: 0,
    stoneDropped: false,
    grownSize: waveConstants.MIN_STONE_SIZE,
    lastDragVelocity: 0,
  })

  const getCanvasCoordinates = useCallback((clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * waveConstants.DPR,
      y: (clientY - rect.top) * waveConstants.DPR,
    }
  }, [waveConstants])

  const startHolding = useCallback((x: number, y: number) => {
    if (y >= waterLevel) return

    holdStateRef.current = {
      isHolding: true,
      x,
      y,
      startTime: Date.now(),
      size: waveConstants.MIN_STONE_SIZE,
      isDragging: false,
      lastStoneTime: 0,
      initialX: x,
      initialY: y,
      stoneDropped: false,
      grownSize: waveConstants.MIN_STONE_SIZE,
      lastDragVelocity: 0,
    }
  }, [waterLevel, waveConstants])

  const updateHoldingPosition = useCallback((x: number, y: number, color: string, image?: HTMLImageElement) => {
    const holdState = holdStateRef.current
    if (!holdState.isHolding) return

    if (!holdState.isDragging) {
      const dx = x - holdState.initialX
      const dy = y - holdState.initialY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > waveConstants.DRAG_THRESHOLD) {
        holdState.isDragging = true
        holdState.grownSize = Math.max(holdState.grownSize, holdState.size)
      }
    }

    if (holdState.isDragging && y < waterLevel) {
      const now = Date.now()
      const timeDiff = now - holdState.lastStoneTime
      
      if (timeDiff > waveConstants.STONE_CREATION_INTERVAL) {
        const dx = x - holdState.x
        const dy = y - holdState.y
        const dragVelocity = Math.sqrt(dx * dx + dy * dy) / timeDiff
        
        // 드래그 속도에 따라 돌 생성 간격 조절
        const interval = Math.max(20, waveConstants.STONE_CREATION_INTERVAL - dragVelocity * 10)
        
        if (timeDiff > interval) {
          createStone(x, y, holdState.grownSize, color, image)
          holdState.lastStoneTime = now
          holdState.lastDragVelocity = dragVelocity
        }
      }
    }

    holdState.x = x
    holdState.y = y
  }, [waterLevel, createStone, waveConstants])

  return {
    holdStateRef,
    getCanvasCoordinates,
    startHolding,
    updateHoldingPosition,
  }
} 