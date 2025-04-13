"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Volume2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"

interface Apple {
  id: string
  value: number
  selected: boolean
  removed: boolean
}

interface AppleNumberGameProps {
  existingAudio?: HTMLAudioElement
}

export default function AppleNumberGame({ existingAudio }: AppleNumberGameProps) {
  // Generate a grid of random numbers between 1-9
  const generateGrid = () => {
    const apples: Apple[][] = []
    for (let i = 0; i < 10; i++) {
      const row: Apple[] = []
      for (let j = 0; j < 17; j++) {
        row.push({
          id: `${i}-${j}`,
          value: Math.floor(Math.random() * 9) + 1,
          selected: false,
          removed: false
        })
      }
      apples.push(row)
    }
    return apples
  }

  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [gameActive, setGameActive] = useState(true)
  const [isDragging, setIsDragging] = useState(false)
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [selectedSum, setSelectedSum] = useState(0)
  const [isValidSelection, setIsValidSelection] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [resetKey, setResetKey] = useState(0) // Add a key to force timer reset
  const [apples, setApples] = useState<Apple[][]>([])
  const [selectedApples, setSelectedApples] = useState<Apple[]>([])
  const [isSelecting, setIsSelecting] = useState(false)
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing')
  const [bgmEnabled, setBgmEnabled] = useState(true)
  const [volume, setVolume] = useState(50)
  const [audioStarted, setAudioStarted] = useState(false)
  const [audioError, setAudioError] = useState<string | null>(null)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize grid and audio on client-side only
  useEffect(() => {
    setApples(generateGrid())
    
    // Use existing audio if provided
    if (existingAudio) {
      audioRef.current = existingAudio
      setAudioStarted(true)
    } else {
      // Initialize new audio only if not provided
      const audio = new Audio()
      audio.src = '/sounds/bgm.mp3'
      audio.loop = true
      audio.preload = 'auto'
      audio.volume = volume / 100
      audioRef.current = audio
    }
    
    // Check if audio can be loaded
    const handleError = (e: Event) => {
      console.error('Audio loading error:', e)
      setAudioError('BGM 파일을 로드할 수 없습니다. 파일이 존재하는지 확인해주세요.')
    }

    audioRef.current?.addEventListener('error', handleError)

    // Cleanup
    return () => {
      if (audioRef.current && !existingAudio) {
        audioRef.current.pause()
        audioRef.current.removeEventListener('error', handleError)
        audioRef.current = null
      }
    }
  }, [])

  // Handle BGM toggle
  const handleBgmToggle = (checked: boolean) => {
    setBgmEnabled(checked)
    if (audioRef.current) {
      if (checked) {
        audioRef.current.play()
          .then(() => {
            setAudioStarted(true)
            setAudioError(null)
          })
          .catch((e) => {
            console.log("BGM toggle failed:", e)
            setAudioError('BGM 재생에 실패했습니다. 브라우저 설정을 확인해주세요.')
          })
      } else {
        audioRef.current.pause()
      }
    }
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
  }

  // Start the game timer
  useEffect(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Start a new timer if the game is active
    if (gameActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            setGameActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    // Cleanup function
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [gameActive, timeLeft, resetKey]) // Add resetKey to dependencies

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gameActive) return

    const grid = gridRef.current
    if (!grid) return

    const rect = grid.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDragging(true)
    setStartPoint({ x, y })
    setSelectionBox({ x, y, width: 0, height: 0 })

    // Try to play audio on user interaction
    tryPlayAudio()
  }

  // Handle mouse move to update selection box
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !gameActive) return

    const grid = gridRef.current
    if (!grid) return

    const rect = grid.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top

    const width = currentX - startPoint.x
    const height = currentY - startPoint.y

    // Calculate the selection box coordinates
    const selBox = {
      x: width > 0 ? startPoint.x : currentX,
      y: height > 0 ? startPoint.y : currentY,
      width: Math.abs(width),
      height: Math.abs(height),
    }

    setSelectionBox(selBox)

    // Update selected apples
    updateSelectedApples(selBox)
  }

  // Update which apples are selected based on the selection box
  const updateSelectedApples = (selBox: { x: number; y: number; width: number; height: number }) => {
    const grid = gridRef.current
    if (!grid) return

    const rect = grid.getBoundingClientRect()
    const cellWidth = rect.width / 17
    const cellHeight = rect.height / 10

    // Calculate which cells are within the selection box
    const newApples = apples.map((row, rowIndex) =>
      row.map((apple, colIndex) => {
        if (apple.removed) return apple

        const appleX = colIndex * cellWidth + cellWidth / 2
        const appleY = rowIndex * cellHeight + cellHeight / 2

        // Add a buffer around each apple to make selection more generous
        const buffer = Math.min(cellWidth, cellHeight) * 0.3

        const isSelected =
          appleX + buffer >= selBox.x &&
          appleX - buffer <= selBox.x + selBox.width &&
          appleY + buffer >= selBox.y &&
          appleY - buffer <= selBox.y + selBox.height

        return { ...apple, selected: isSelected }
      }),
    )

    setApples(newApples)

    // Calculate sum of selected apples and count
    let sum = 0
    let count = 0
    newApples.forEach((row) => {
      row.forEach((apple) => {
        if (apple.selected && !apple.removed) {
          sum += apple.value
          count++
        }
      })
    })

    setSelectedSum(sum)
    setSelectedCount(count)
    setIsValidSelection(sum === 10)
  }

  // Handle mouse up to end dragging and process selection
  const handleMouseUp = () => {
    if (!isDragging || !gameActive) return

    setIsDragging(false)

    // If selection is valid (sum = 10), remove selected apples and add to score
    if (isValidSelection) {
      const pointsEarned = selectedCount // Score is based on the number of apples removed

      const newApples = apples.map((row) =>
        row.map((apple) => {
          if (apple.selected && !apple.removed) {
            return { ...apple, removed: true, selected: false }
          }
          return { ...apple, selected: false }
        }),
      )

      setApples(newApples)
      setScore(score + pointsEarned)
    } else {
      // Just clear selection if not valid
      setApples(apples.map((row) => row.map((apple) => ({ ...apple, selected: false }))))
    }

    setSelectionBox({ x: 0, y: 0, width: 0, height: 0 })
    setSelectedSum(0)
    setSelectedCount(0)
    setIsValidSelection(false)
  }

  // Reset the game
  const resetGame = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setScore(0)
    setTimeLeft(120)
    setApples(generateGrid())
    setGameActive(true)
    setIsDragging(false)
    setSelectionBox({ x: 0, y: 0, width: 0, height: 0 })
    setSelectedSum(0)
    setIsValidSelection(false)
    setSelectedCount(0)
    setResetKey((prev) => prev + 1)

    // Restart BGM
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      tryPlayAudio()
    }
  }

  // Calculate progress percentage for the timer bar
  const progressPercentage = (timeLeft / 120) * 100

  // Try to play audio safely
  const tryPlayAudio = () => {
    if (!audioRef.current || !gameActive) return

    try {
      const playPromise = audioRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioStarted(true)
            setAudioError(null)
          })
          .catch((error) => {
            console.log("Audio play failed:", error)
            // Don't show error message for initial autoplay failure
            if (audioStarted) {
              setAudioError('BGM 재생에 실패했습니다. 브라우저 설정을 확인해주세요.')
            }
          })
      }
    } catch (err) {
      console.log("Error playing audio:", err)
      if (audioStarted) {
        setAudioError('BGM 재생에 실패했습니다.')
      }
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="relative w-full max-w-4xl p-6 rounded-3xl bg-green-500">
        <div className="flex">
          <div ref={gameAreaRef} className="relative bg-green-100 p-4 rounded-lg grid-bg select-none flex-1">
            {/* Score display */}
            <div className="absolute top-2 right-4 text-4xl font-bold text-green-800 bg-green-100/90 px-3 py-1 rounded-lg z-10">
              {score}
            </div>

            {/* Grid of apples */}
            <div
              ref={gridRef}
              className="grid grid-cols-17 gap-0.5 mb-4 relative mt-12"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {apples.map((row, rowIndex) =>
                row.map((apple, colIndex) => (
                  <div key={apple.id} className="flex items-center justify-center">
                    {!apple.removed && (
                      <div
                        className={`relative w-11 h-11 flex items-center justify-center transition-all duration-100 ${
                          apple.selected ? (isValidSelection ? "scale-110" : "scale-95 opacity-70") : ""
                        }`}
                      >
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path
                            d="M12,3.5c-0.8-0.5-2.2-0.5-3-0.3C7.2,3.6,6,4.8,6,7c-1.8,0.5-3,1.8-3,3.5c0,1,0.2,2.3,0.8,3.5c0.7,1.5,1.7,2.7,3,3.5C8.5,18.8,10.2,19,12,19c1.8,0,3.5-0.2,5.2-1.5c1.3-0.8,2.3-2,3-3.5c0.6-1.2,0.8-2.5,0.8-3.5c0-1.7-1.2-3-3-3.5c0-2.2-1.2-3.4-3-3.8C14.2,3,12.8,3,12,3.5z"
                            fill={apple.selected && isValidSelection ? "#FF0000" : "#FF3B30"}
                          />
                          <path
                            d="M12,2c-0.5,0-1,0.5-1,1c0,0.3,0.1,0.5,0.2,0.7c0.1,0.1,0.2,0.2,0.3,0.3c0.3,0.1,0.7,0.1,1,0c0.1-0.1,0.2-0.2,0.3-0.3C12.9,3.5,13,3.3,13,3C13,2.5,12.5,2,12,2z"
                            fill="#4CD964"
                          />
                          <path
                            d="M12,3.5c0,0-0.5,0.5-0.5,1.2c0,0.7,0.5,1.3,0.5,1.3s0.5-0.6,0.5-1.3C12.5,4,12,3.5,12,3.5z"
                            fill="#4CD964"
                          />
                        </svg>
                        <span className="absolute text-white font-bold text-lg">{apple.value}</span>
                      </div>
                    )}
                  </div>
                )),
              )}

              {/* Selection box */}
              {isDragging && (
                <div
                  className={`absolute border-2 ${isValidSelection ? "border-red-500 bg-red-500/20" : "border-blue-500 bg-blue-500/10"}`}
                  style={{
                    left: `${selectionBox.x}px`,
                    top: `${selectionBox.y}px`,
                    width: `${selectionBox.width}px`,
                    height: `${selectionBox.height}px`,
                    pointerEvents: "none",
                  }}
                />
              )}
            </div>
          </div>

          {/* Timer area */}
          <div className="ml-2 w-8 bg-green-100 rounded-lg flex items-center justify-center">
            <div className="h-[90%] w-6 bg-white rounded-full overflow-hidden relative">
              <div
                className="bg-green-500 w-full rounded-full absolute bottom-0"
                style={{
                  height: `${progressPercentage}%`,
                  transition: "height 1s linear",
                }}
              />
            </div>
          </div>
        </div>

        {/* Game over message */}
        {!gameActive && timeLeft === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-3xl">
            <div className="bg-white p-8 rounded-xl text-center">
              <div className="text-5xl font-bold mb-6 text-green-500">
                {score}
                <span className="text-2xl ml-2 text-gray-600">점</span>
              </div>
              <Button onClick={resetGame} className="bg-green-500 hover:bg-green-600 text-lg px-6 py-3 h-auto">
                다시 하기
              </Button>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <Button onClick={resetGame} className="bg-white text-green-800 hover:bg-gray-100 border border-green-300">
            초기화
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="bgm"
                checked={bgmEnabled}
                onCheckedChange={handleBgmToggle}
              />
              <Label htmlFor="bgm" className="text-white">BGM</Label>
            </div>
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-white" />
              <Slider
                value={[volume]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={(values) => handleVolumeChange(values[0])}
              />
            </div>
          </div>
        </div>

        {audioError && (
          <div className="mt-2 text-center text-red-500 text-sm">
            {audioError}
          </div>
        )}
      </div>

      <style jsx global>{`
        .grid-bg {
          background-image: linear-gradient(to right, rgba(0,255,0,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,255,0,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .grid-cols-17 {
          grid-template-columns: repeat(17, minmax(0, 1fr));
        }
      `}</style>
    </div>
  )
}
