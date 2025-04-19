"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Volume2, Plus, Minus, Shuffle, RefreshCw } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface Apple {
  id: string
  value: number
  selected: boolean
  removed: boolean
}

type ToolType = "plus" | "minus" | "random" | "reset" | null

interface ToolUsage {
  plus: number
  minus: number
  random: number
  reset: number
}

// 게임 상태 타입 추가
type GameState = "start" | "playing" | "gameover"

export default function AppleNumberGame() {
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes in seconds
  const [bgmEnabled, setBgmEnabled] = useState(true)
  const [volume, setVolume] = useState(75)
  const [previousVolume, setPreviousVolume] = useState(75) // Store previous volume when BGM is disabled
  const [gameState, setGameState] = useState<GameState>("start") // 게임 상태 추가
  const [isDragging, setIsDragging] = useState(false)
  const [selectionBox, setSelectionBox] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 })
  const [selectedSum, setSelectedSum] = useState(0)
  const [isValidSelection, setIsValidSelection] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)
  const [resetKey, setResetKey] = useState(0) // Add a key to force timer reset
  const [audioStarted, setAudioStarted] = useState(false)
  const [activeTool, setActiveTool] = useState<ToolType>(null)
  const [toolUsage, setToolUsage] = useState<ToolUsage>({
    plus: 3,
    minus: 3,
    random: 3,
    reset: 1,
  })
  const [eyeComfortMode, setEyeComfortMode] = useState(false)

  const gameAreaRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 게임 활성화 상태 계산
  const gameActive = gameState === "playing"

  // Generate a grid of random numbers between 1-9
  const generateGrid = useCallback(() => {
    const apples: Apple[][] = []
    for (let i = 0; i < 10; i++) {
      const row: Apple[] = []
      for (let j = 0; j < 17; j++) {
        row.push({
          id: `${i}-${j}`,
          value: Math.floor(Math.random() * 9) + 1,
          selected: false,
          removed: false,
        })
      }
      apples.push(row)
    }
    return apples
  }, [])

  const [apples, setApples] = useState<Apple[][]>(generateGrid())

  // Initialize audio element
  useEffect(() => {
    // Use the DOM audio element
    audioRef.current = document.getElementById("bgm-audio") as HTMLAudioElement

    if (audioRef.current) {
      audioRef.current.volume = bgmEnabled ? volume / 100 : 0
    }

    return () => {
      // No need to clean up the DOM audio element
    }
  }, [])

  // 게임 시작 함수 수정
  const startGame = useCallback(() => {
    setGameState("playing")
    setTimeLeft(120)
    setScore(0)
    setApples(generateGrid())
    setToolUsage({
      plus: 3,
      minus: 3,
      random: 3,
      reset: 1,
    })
  }, [generateGrid])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!gameActive) return

      switch (e.key.toLowerCase()) {
        case "q":
          if (toolUsage.plus > 0) {
            // 토글 기능: 이미 활성화된 경우 비활성화, 아닌 경우 활성화
            setActiveTool(activeTool === "plus" ? null : "plus")
          }
          break
        case "w":
          if (toolUsage.minus > 0) {
            // 토글 기능: 이미 활성화된 경우 비활성화, 아닌 경우 활성화
            setActiveTool(activeTool === "minus" ? null : "minus")
          }
          break
        case "e":
          if (toolUsage.random > 0) {
            // 토글 기능: 이미 활성화된 경우 비활성화, 아닌 경우 활성화
            setActiveTool(activeTool === "random" ? null : "random")
          }
          break
        case "r":
          // 모든 남아있는 사과 랜덤 변경 (사용 가능 횟수 확인)
          if (toolUsage.reset > 0) {
            randomizeAllApples()
          }
          break
        case "escape":
          setActiveTool(null)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [gameActive, apples, toolUsage, activeTool]) // activeTool을 의존성 배열에 추가

  // 모든 남아있는 사과 랜덤 변경
  const randomizeAllApples = useCallback(() => {
    if (!gameActive || toolUsage.reset <= 0) return

    setApples((prevApples) =>
      prevApples.map((row) =>
        row.map((apple) => {
          if (apple.removed) return apple
          return {
            ...apple,
            value: Math.floor(Math.random() * 9) + 1,
          }
        }),
      ),
    )

    // 사용 횟수 감소
    setToolUsage((prev) => ({
      ...prev,
      reset: prev.reset - 1,
    }))
  }, [gameActive, toolUsage.reset])

  // Update which apples are selected based on the selection box
  const updateSelectedApples = useCallback((selBox: { x: number; y: number; width: number; height: number }) => {
    const grid = gridRef.current
    if (!grid) return
    const rect = grid.getBoundingClientRect()
    const cellWidth = rect.width / 17
    const cellHeight = rect.height / 10
    const newApples = apples.map((row, rowIndex) =>
      row.map((apple, colIndex) => {
        if (apple.removed) return apple
        const appleX = colIndex * cellWidth + cellWidth / 2
        const appleY = rowIndex * cellHeight + cellHeight / 2
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
  }, [apples])

  // Handle mouse move to update selection box
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !gameActive || activeTool) return
    const grid = gridRef.current
    if (!grid) return
    const rect = grid.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    const width = currentX - startPoint.x
    const height = currentY - startPoint.y
    const selBox = {
      x: width > 0 ? startPoint.x : currentX,
      y: height > 0 ? startPoint.y : currentY,
      width: Math.abs(width),
      height: Math.abs(height),
    }
    setSelectionBox(selBox)
    updateSelectedApples(selBox)
  }, [isDragging, gameActive, activeTool, startPoint, updateSelectedApples])

  // 특정 사과 클릭 처리
  const handleAppleClick = useCallback((rowIndex: number, colIndex: number) => {
    if (!gameActive || !activeTool || apples[rowIndex][colIndex].removed) return

    const apple = apples[rowIndex][colIndex]
    let newValue = apple.value
    let toolUsed = false

    switch (activeTool) {
      case "plus":
        // 9는 +1 할 수 없음
        if (apple.value === 9 || toolUsage.plus <= 0) return
        newValue = apple.value + 1
        toolUsed = true
        break
      case "minus":
        // 1은 -1 할 수 없음
        if (apple.value === 1 || toolUsage.minus <= 0) return
        newValue = apple.value - 1
        toolUsed = true
        break
      case "random":
        // 현재 값을 제외한 랜덤 값 생성
        if (toolUsage.random <= 0) return
        let randomValue
        do {
          randomValue = Math.floor(Math.random() * 9) + 1
        } while (randomValue === apple.value)
        newValue = randomValue
        toolUsed = true
        break
    }

    if (toolUsed) {
      // 사과 값 업데이트
      const newApples = [...apples]
      newApples[rowIndex][colIndex] = {
        ...apple,
        value: newValue,
      }
      setApples(newApples)

      // 도구 사용 횟수 감소
      setToolUsage((prev) => ({
        ...prev,
        [activeTool]: prev[activeTool as keyof ToolUsage] - 1,
      }))

      // 도구 비활성화
      setActiveTool(null)
    }
  }, [gameActive, activeTool, apples, toolUsage])

  // 도구 활성화 처리 (토글 기능 포함)
  const handleToolActivation = useCallback((tool: ToolType) => {
    if (!gameActive) return

    // 사용 가능 횟수 확인
    if (tool && toolUsage[tool as keyof ToolUsage] <= 0) return

    // 토글 기능: 이미 활성화된 경우 비활성화, 아닌 경우 활성화
    setActiveTool(activeTool === tool ? null : tool)
  }, [gameActive, toolUsage, activeTool])

  // BGM 재생 함수 개선
  const tryPlayAudio = () => {
    if (!audioRef.current) return

    try {
      // 이미 재생 중이면 중복 재생 방지
      if (!audioRef.current.paused) {
        return
      }

      // 볼륨 설정 확인
      audioRef.current.volume = bgmEnabled ? volume / 100 : 0

      const playPromise = audioRef.current.play()

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setAudioStarted(true)
            console.log("Audio started successfully")
          })
          .catch((error) => {
            console.log("Audio play failed, will try again:", error)
            // 사용자 상호작용 후 다시 시도
            setTimeout(() => {
              if (gameState === "playing" && bgmEnabled) {
                audioRef.current?.play().catch((e) => console.log("Retry failed:", e))
              }
            }, 1000)
          })
      }
    } catch (err) {
      console.log("Error playing audio:", err)
    }
  }

  // BGM 상태 관리 useEffect 수정
  useEffect(() => {
    if (!audioRef.current) return

    // Set volume (0-1 scale)
    audioRef.current.volume = bgmEnabled ? volume / 100 : 0

    // Play or pause based on game state
    if (gameState === "playing" && bgmEnabled) {
      // 게임 플레이 중이고 BGM이 활성화된 경우에만 재생
      tryPlayAudio()
    } else if (gameState === "gameover") {
      // 게임 오버 시에만 일시 정지
      audioRef.current.pause()
    }
  }, [gameState, volume, bgmEnabled])

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
            setGameState("gameover")
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

  // Reset the game
  const resetGame = useCallback(() => {
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    setScore(0)
    setTimeLeft(120)
    setApples(generateGrid())
    setGameState("playing")
    setIsDragging(false)
    setSelectionBox({ x: 0, y: 0, width: 0, height: 0 })
    setSelectedSum(0)
    setIsValidSelection(false)
    setSelectedCount(0)
    setResetKey((prev) => prev + 1) // Increment resetKey to trigger useEffect
    setActiveTool(null)

    // 도구 사용 횟수 초기화
    setToolUsage({
      plus: 3,
      minus: 3,
      random: 3,
      reset: 1,
    })

    // Restart BGM
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      tryPlayAudio()
    }
  }, [generateGrid, tryPlayAudio])

  // Handle mouse down to start dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!gameActive) return

    // 활성화된 도구가 있으면 드래그 시작하지 않음
    if (activeTool) return

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
  }, [gameActive, activeTool, tryPlayAudio])

  // Handle mouse up to end dragging and process selection
  const handleMouseUp = useCallback(() => {
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
  }, [isDragging, gameActive, isValidSelection, selectedCount, apples, score])

  // Toggle BGM
  const handleBgmToggle = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setBgmEnabled(checked)

      if (checked) {
        // Restore previous volume when BGM is enabled
        setVolume(previousVolume)
        if (audioRef.current) {
          audioRef.current.volume = previousVolume / 100
        }
      } else {
        // Store current volume and set to 0 when BGM is disabled
        setPreviousVolume(volume)
        if (audioRef.current) {
          audioRef.current.volume = 0
        }
      }

      // Try to play audio immediately on user interaction
      if (gameActive) {
        tryPlayAudio()
      }
    }
  }

  // 눈아파요 모드 토글
  const handleEyeComfortToggle = (checked: boolean | "indeterminate") => {
    if (typeof checked === "boolean") {
      setEyeComfortMode(checked)
    }
  }

  // Handle volume change
  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0]
    setVolume(vol)

    // Update audio volume
    if (audioRef.current) {
      audioRef.current.volume = vol / 100
    }

    // If volume is adjusted manually and not zero, enable BGM
    if (vol > 0 && !bgmEnabled) {
      setBgmEnabled(true)
    }

    // If volume is set to zero, disable BGM
    if (vol === 0 && bgmEnabled) {
      setPreviousVolume(previousVolume > 0 ? previousVolume : 75) // Ensure we have a non-zero previous volume
      setBgmEnabled(false)
    }
  }

  // Calculate progress percentage for the timer bar
  const progressPercentage = useMemo(() => (timeLeft / 120) * 100, [timeLeft])

  // 시작 화면 렌더링 - 사과 아이콘 제거
  if (gameState === "start") {
    return (
      <div className="flex items-center justify-center min-h-[84vh] bg-white">
        <div className="relative w-full max-w-4xl p-6 rounded-3xl bg-green-500">
          {/* 배경 장식 요소 */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {/* 상단 장식 사과들 */}
            <div className="absolute -top-5 -left-5 w-20 h-20 opacity-20">
              <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                <path
                  d="M12,3.5c-0.8-0.5-2.2-0.5-3-0.3C7.2,3.6,6,4.8,6,7c-1.8,0.5-3,1.8-3,3.5c0,1,0.2,2.3,0.8,3.5c0.7,1.5,1.7,2.7,3,3.5C8.5,18.8,10.2,19,12,19c1.8,0,3.5-0.2,5.2-1.5c1.3-0.8,2.3-2,3-3.5c0.6-1.2,0.8-2.5,0.8-3.5c0-1.7-1.2-3-3-3.5c0-2.2-1.2-3.4-3-3.8C14.2,3,12.8,3,12,3.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="absolute -top-3 right-20 w-16 h-16 opacity-20 rotate-45">
              <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                <path
                  d="M12,3.5c-0.8-0.5-2.2-0.5-3-0.3C7.2,3.6,6,4.8,6,7c-1.8,0.5-3,1.8-3,3.5c0,1,0.2,2.3,0.8,3.5c0.7,1.5,1.7,2.7,3,3.5C8.5,18.8,10.2,19,12,19c1.8,0,3.5-0.2,5.2-1.5c1.3-0.8,2.3-2,3-3.5c0.6-1.2,0.8-2.5,0.8-3.5c0-1.7-1.2-3-3-3.5c0-2.2-1.2-3.4-3-3.8C14.2,3,12.8,3,12,3.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div className="absolute bottom-5 -right-5 w-16 h-16 opacity-20 -rotate-12">
              <svg viewBox="0 0 24 24" className="w-full h-full text-white">
                <path
                  d="M12,3.5c-0.8-0.5-2.2-0.5-3-0.3C7.2,3.6,6,4.8,6,7c-1.8,0.5-3,1.8-3,3.5c0,1,0.2,2.3,0.8,3.5c0.7,1.5,1.7,2.7,3,3.5C8.5,18.8,10.2,19,12,19c1.8,0,3.5-0.2,5.2-1.5c1.3-0.8,2.3-2,3-3.5c0.6-1.2,0.8-2.5,0.8-3.5c0-1.7-1.2-3-3-3.5c0-2.2-1.2-3.4-3-3.8C14.2,3,12.8,3,12,3.5z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>

          <div className="flex">
            <div className="relative bg-gradient-to-br from-green-100 to-green-50 p-4 rounded-lg flex-1 flex flex-col items-center justify-center overflow-hidden">
              {/* 배경 패턴 */}
              <div className="absolute inset-0 grid grid-cols-10 grid-rows-6 opacity-5">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8">
                      <path
                        d="M12,3.5c-0.8-0.5-2.2-0.5-3-0.3C7.2,3.6,6,4.8,6,7c-1.8,0.5-3,1.8-3,3.5c0,1,0.2,2.3,0.8,3.5c0.7,1.5,1.7,2.7,3,3.5C8.5,18.8,10.2,19,12,19c1.8,0,3.5-0.2,5.2-1.5c1.3-0.8,2.3-2,3-3.5c0.6-1.2,0.8-2.5,0.8-3.5c0-1.7-1.2-3-3-3.5c0-2.2-1.2-3.4-3-3.8C14.2,3,12.8,3,12,3.5z"
                        fill="#000"
                      />
                    </svg>
                  </div>
                ))}
              </div>

              {/* 타이틀 영역 - 사과 아이콘 제거 */}
              <div className="relative flex flex-col items-center mb-6 mt-4">
                <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-800 to-green-500 drop-shadow-sm mb-2">
                  사과 게임
                </h1>
                <div className="h-1 w-40 bg-gradient-to-r from-green-300 to-green-500 rounded-full mb-2"></div>
                <div className="h-1 w-20 bg-gradient-to-r from-green-300 to-green-500 rounded-full"></div>
              </div>

              <div className="text-center mb-12 max-w-xl relative z-10 px-4">
                <div className="bg-white/70 backdrop-blur-sm p-4 rounded-xl shadow-md border border-green-100 mb-4">
                  <p className="text-base text-green-800 mb-2 font-medium">
                    합이 <span className="text-lg font-bold text-red-500">10</span>이 되는 사과들을 드래그하여
                    선택하세요.
                  </p>
                  <p className="text-sm text-green-700 mb-2">선택한 사과의 개수만큼 점수를 얻습니다!</p>
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-green-200 to-transparent my-2"></div>
                  <p className="text-sm text-green-800 mb-2 font-medium">
                    도구를 사용하여 사과의 숫자를 변경할 수 있습니다:
                  </p>
                  <ul className="text-xs text-green-700 space-y-1 bg-green-50/50 p-2 rounded-lg inline-block mx-auto">
                    <li className="flex items-center">
                      <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-1 flex items-center justify-center text-xs font-bold">
                        Q
                      </span>
                      <span>
                        <strong>사과 값 +1</strong> (3회)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-1 flex items-center justify-center text-xs font-bold">
                        W
                      </span>
                      <span>
                        <strong>사과 값 -1</strong> (3회)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-1 flex items-center justify-center text-xs font-bold">
                        E
                      </span>
                      <span>
                        <strong>사과 값 랜덤 변경</strong> (3회)
                      </span>
                    </li>
                    <li className="flex items-center">
                      <span className="inline-block w-5 h-5 bg-green-100 rounded-full mr-1 flex items-center justify-center text-xs font-bold">
                        R
                      </span>
                      <span>
                        <strong>모든 사과 랜덤 변경</strong> (1회)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              <Button
                onClick={startGame}
                className="relative overflow-hidden bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg px-10 py-3 rounded-xl shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl group mb-4"
              >
                <span className="relative z-10">게임 시작</span>
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                <span className="absolute -inset-x-1 bottom-0 h-1 bg-gradient-to-r from-green-300 to-green-400"></span>

                {/* 빛나는 효과 */}
                <span className="absolute top-0 left-0 w-full h-full">
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-20 bg-white opacity-20 rotate-12 transform-gpu blur-xl"></span>
                </span>
              </Button>
            </div>
          </div>
          <audio id="bgm-audio" src="/sounds/bgm.mp3" loop preload="auto" style={{ display: "none" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center  min-h-[84vh] bg-white">
      <div className="relative w-full max-w-4xl p-6 rounded-3xl bg-green-500">
        <div className="flex">
          <div ref={gameAreaRef} className="relative bg-green-100 p-4 rounded-lg grid-bg select-none flex-1">
            {/* 도구 아이콘 */}
            <div className="absolute top-2 left-4 flex space-x-3 z-10">
              <button
                className={`p-2 rounded-full ${
                  activeTool === "plus" ? "bg-green-500 text-white" : "bg-white/80 text-green-800"
                } relative ${toolUsage.plus <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-200"}`}
                onClick={() => handleToolActivation("plus")}
                title="사과 값 +1 (Q)"
                disabled={toolUsage.plus <= 0}
              >
                <Plus size={18} />
                <span className="sr-only">+1</span>
                <span className="absolute bottom-0 right-0 text-xs font-bold bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">
                  Q
                </span>
                <span className="absolute top-0 right-0 text-xs font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {toolUsage.plus}
                </span>
              </button>
              <button
                className={`p-2 rounded-full ${
                  activeTool === "minus" ? "bg-green-500 text-white" : "bg-white/80 text-green-800"
                } relative ${toolUsage.minus <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-200"}`}
                onClick={() => handleToolActivation("minus")}
                title="사과 값 -1 (W)"
                disabled={toolUsage.minus <= 0}
              >
                <Minus size={18} />
                <span className="sr-only">-1</span>
                <span className="absolute bottom-0 right-0 text-xs font-bold bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">
                  W
                </span>
                <span className="absolute top-0 right-0 text-xs font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {toolUsage.minus}
                </span>
              </button>
              <button
                className={`p-2 rounded-full ${
                  activeTool === "random" ? "bg-green-500 text-white" : "bg-white/80 text-green-800"
                } relative ${toolUsage.random <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-200"}`}
                onClick={() => handleToolActivation("random")}
                title="사과 값 랜덤 변경 (E)"
                disabled={toolUsage.random <= 0}
              >
                <Shuffle size={18} />
                <span className="sr-only">랜덤</span>
                <span className="absolute bottom-0 right-0 text-xs font-bold bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">
                  E
                </span>
                <span className="absolute top-0 right-0 text-xs font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {toolUsage.random}
                </span>
              </button>
              <button
                className={`p-2 rounded-full bg-white/80 text-green-800 relative ${
                  toolUsage.reset <= 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500 hover:text-white"
                }`}
                onClick={randomizeAllApples}
                title="모든 사과 랜덤 변경 (R)"
                disabled={toolUsage.reset <= 0}
              >
                <RefreshCw size={18} />
                <span className="sr-only">초기화</span>
                <span className="absolute bottom-0 right-0 text-xs font-bold bg-green-200 rounded-full w-4 h-4 flex items-center justify-center">
                  R
                </span>
                <span className="absolute top-0 right-0 text-xs font-bold bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                  {toolUsage.reset}
                </span>
              </button>
            </div>

            {/* Score display */}
            <div className="absolute top-2 right-4 text-4xl font-bold text-green-800 bg-green-100/90 px-3 py-1 rounded-lg z-10">
              {score}
            </div>

            {/* Grid of apples - 고정 높이 추가 */}
            <div
              ref={gridRef}
              className="grid grid-cols-17 gap-0.5 mb-4 relative mt-12 h-[440px]"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {apples.map((row, rowIndex) =>
                row.map((apple, colIndex) => (
                  <div key={apple.id} className="flex items-center justify-center">
                    {!apple.removed ? (
                      <div
                        className={`relative w-11 h-11 flex items-center justify-center transition-all duration-100 
                          ${apple.selected ? (isValidSelection ? "scale-110" : "scale-95 opacity-70") : ""}
                          ${activeTool ? "cursor-pointer hover:scale-110" : ""}`}
                        onClick={() => handleAppleClick(rowIndex, colIndex)}
                      >
                        <svg viewBox="0 0 24 24" className="w-full h-full">
                          <path
                            d="M12,3.5c-0.8-0.5-2.2-0.5-3-0.3C7.2,3.6,6,4.8,6,7c-1.8,0.5-3,1.8-3,3.5c0,1,0.2,2.3,0.8,3.5c0.7,1.5,1.7,2.7,3,3.5C8.5,18.8,10.2,19,12,19c1.8,0,3.5-0.2,5.2-1.5c1.3-0.8,2.3-2,3-3.5c0.6-1.2,0.8-2.5,0.8-3.5c0-1.7-1.2-3-3-3.5c0-2.2-1.2-3.4-3-3.8C14.2,3,12.8,3,12,3.5z"
                            fill={
                              apple.selected && isValidSelection
                                ? eyeComfortMode
                                  ? "#FF9999"
                                  : "#FF0000"
                                : eyeComfortMode
                                  ? "#FFAA99"
                                  : "#FF3B30"
                            }
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
                    ) : (
                      // 제거된 사과는 투명한 공간으로 유지
                      <div className="w-11 h-11 opacity-0"></div>
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
        {gameState === "gameover" && (
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

        {/* Audio element - using a direct DOM element */}
        <audio id="bgm-audio" src="/sounds/bgm.mp3" loop preload="auto" style={{ display: "none" }} />

        {/* Controls */}
        <div className="flex items-center justify-between mt-4">
          <Button onClick={resetGame} className="bg-white text-green-800 hover:bg-gray-100 border border-green-300">
            초기화
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="eye-comfort-game"
                checked={eyeComfortMode}
                onCheckedChange={handleEyeComfortToggle}
                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-green-500"
              />
              <label htmlFor="eye-comfort-game" className="text-white">
                눈아파요
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="bgm"
                checked={bgmEnabled}
                onCheckedChange={handleBgmToggle}
                className="border-white data-[state=checked]:bg-white data-[state=checked]:text-green-500"
              />
              <label htmlFor="bgm" className="text-white">
                BGM
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-white" />
              <Slider value={[volume]} max={100} step={1} className="w-24" onValueChange={handleVolumeChange} />
            </div>
          </div>
        </div>

        {/* Play button to explicitly start audio (only shown if audio hasn't started yet) */}
        {!audioStarted && (
          <div className="mt-2 text-center">
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.volume = bgmEnabled ? volume / 100 : 0
                  audioRef.current
                    .play()
                    .then(() => setAudioStarted(true))
                    .catch((e) => console.log("Play button error:", e))
                }
              }}
              className="text-xs text-white underline"
            >
              BGM 재생 시작
            </button>
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
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
