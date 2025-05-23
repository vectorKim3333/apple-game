"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Timer, RefreshCw, Star, Zap, Clock, Award, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import GameStart from "./tile-game-start"
import { BOARD_DIMENSIONS, COLORS, TIME_CONSTANTS, SPECIAL_TILE_RATIOS } from "../constants/gameConstants"
import { GameDifficulty, SpecialTileType, Tile, PathSegment } from "../types/game"
import { useSpecialTiles } from "../hooks/useSpecialTiles"

// 게임 보드 크기와 시간 상수
const { ROWS: BOARD_ROWS, COLS: BOARD_COLS } = BOARD_DIMENSIONS
const { INITIAL: INITIAL_TIME, PENALTY: TIME_PENALTY, BONUS: TIME_BONUS } = TIME_CONSTANTS

type SpecialTileCounts = Record<SpecialTileType, number>

// 특수 타일 비율 구성 인터페이스 정의
interface SpecialTileRatios {
  [SpecialTileType.WILD]: number
  [SpecialTileType.TIME_BONUS]: number
  [SpecialTileType.MULTIPLIER]: number
  [SpecialTileType.BOMB]: number
  [SpecialTileType.NONE]: number
  fillRate: number
}

// 특수 타일 생성 확률 계산
const calculateSpecialTileChance = (ratios: Record<SpecialTileType, number>) => {
  return (
    ratios[SpecialTileType.WILD] +
    ratios[SpecialTileType.TIME_BONUS] +
    ratios[SpecialTileType.MULTIPLIER] +
    ratios[SpecialTileType.BOMB] +
    ratios[SpecialTileType.NONE]
  )
}

export default function TileGame() {
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [board, setBoard] = useState<(Tile | null)[][]>([])
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL_TIME)
  const [gameActive, setGameActive] = useState(false)
  const [removingTiles, setRemovingTiles] = useState<{ id: number; x: number; y: number }[]>([])
  const [scoreAnimation, setScoreAnimation] = useState(false)
  const [penaltyAnimation, setPenaltyAnimation] = useState(false)
  const [activeEffects, setActiveEffects] = useState<{ type: SpecialTileType; x: number; y: number }[]>([])
  const [timePenaltyAnimation, setTimePenaltyAnimation] = useState(false)
  const [difficulty, setDifficulty] = useState<GameDifficulty>(GameDifficulty.NORMAL)

  // 특수 타일 수 추적
  const [specialTileCounts, setSpecialTileCounts] = useState<SpecialTileCounts>({
    [SpecialTileType.WILD]: 0,
    [SpecialTileType.TIME_BONUS]: 0,
    [SpecialTileType.MULTIPLIER]: 0,
    [SpecialTileType.BOMB]: 0,
    [SpecialTileType.NONE]: 0,
  })

  const boardRef = useRef<HTMLDivElement>(null!)
  const timerRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef(score)
  const timeLeftRef = useRef(timeLeft)

  const { createEffectPopup: createSpecialEffectPopup, calculateMaxSpecialTiles, countSpecialTiles } = useSpecialTiles({
    difficulty,
    boardRef,
  })

  // BGM(효과음) on/off 상태 및 로컬스토리지 연동
  const getInitialBgmEnabled = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tilegame_bgmEnabled')
      return stored === null ? true : stored === 'true'
    }
    return true
  }
  const [bgmEnabled, setBgmEnabled] = useState(getInitialBgmEnabled)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('tilegame_bgmEnabled', String(bgmEnabled))
    }
  }, [bgmEnabled])

  // 사운드 효과 오디오 ref 선언
  const successAudioRef = useRef<HTMLAudioElement>(null)
  const penaltyAudioRef = useRef<HTMLAudioElement>(null)
  const boomAudioRef = useRef<HTMLAudioElement>(null)
  const multiplierAudioRef = useRef<HTMLAudioElement>(null)
  const timeBonusAudioRef = useRef<HTMLAudioElement>(null)

  // 값이 변경될 때 refs 업데이트
  useEffect(() => {
    scoreRef.current = score
  }, [score])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  // 게임 보드 초기화
  const initializeBoard = useCallback(() => {
    const newBoard: (Tile | null)[][] = Array(BOARD_ROWS)
      .fill(null)
      .map(() => Array(BOARD_COLS).fill(null))

    // 상태를 즉시 업데이트하지 않고 로컬에서 특수 타일 수 추적
    const newSpecialTileCounts: Record<SpecialTileType, number> = {
      [SpecialTileType.WILD]: 0,
      [SpecialTileType.TIME_BONUS]: 0,
      [SpecialTileType.MULTIPLIER]: 0,
      [SpecialTileType.BOMB]: 0,
      [SpecialTileType.NONE]: 0
    }

    // 현재 난이도의 채움 비율에 따라 보드 채우기
    const difficultyConfig = SPECIAL_TILE_RATIOS[difficulty.toLowerCase() as keyof typeof SPECIAL_TILE_RATIOS]
    const fillRate = difficultyConfig.fillRate
    const tilesToPlace = Math.floor(BOARD_ROWS * BOARD_COLS * fillRate)
    let tilesPlaced = 0
    let idCounter = 1

    // 배치할 총 타일 수에 따라 최대 특수 타일 계산
    const maxSpecialTiles = calculateMaxSpecialTiles(tilesToPlace)

    while (tilesPlaced < tilesToPlace) {
      const x = Math.floor(Math.random() * BOARD_COLS)
      const y = Math.floor(Math.random() * BOARD_ROWS)

      if (newBoard[y][x] === null) {
        const colorIndex = Math.floor(Math.random() * COLORS.length)

        // 이것이 특수 타일이어야 하는지 결정
        let special = SpecialTileType.NONE

        // 특수 타일을 생성할 무작위 확률
        const totalSpecialProbability = difficultyConfig.wild + difficultyConfig.time_bonus + 
                                      difficultyConfig.multiplier + difficultyConfig.bomb
        
        if (Math.random() <= totalSpecialProbability) {
          // 적격 특수 유형(최대 개수 미만인 것) 배열 생성
          const eligibleTypes: { type: SpecialTileType; probability: number }[] = []

          if (newSpecialTileCounts[SpecialTileType.WILD] < maxSpecialTiles[SpecialTileType.WILD]) {
            eligibleTypes.push({ type: SpecialTileType.WILD, probability: difficultyConfig.wild })
          }

          if (newSpecialTileCounts[SpecialTileType.TIME_BONUS] < maxSpecialTiles[SpecialTileType.TIME_BONUS]) {
            eligibleTypes.push({ type: SpecialTileType.TIME_BONUS, probability: difficultyConfig.time_bonus })
          }

          if (newSpecialTileCounts[SpecialTileType.MULTIPLIER] < maxSpecialTiles[SpecialTileType.MULTIPLIER]) {
            eligibleTypes.push({ type: SpecialTileType.MULTIPLIER, probability: difficultyConfig.multiplier })
          }

          if (newSpecialTileCounts[SpecialTileType.BOMB] < maxSpecialTiles[SpecialTileType.BOMB]) {
            eligibleTypes.push({ type: SpecialTileType.BOMB, probability: difficultyConfig.bomb })
          }

          // 적격 유형이 있으면 확률에 따라 선택
          if (eligibleTypes.length > 0) {
            const totalProb = eligibleTypes.reduce((sum, { probability }) => sum + probability, 0)
            let rand = Math.random() * totalProb
            
            for (const { type, probability } of eligibleTypes) {
              rand -= probability
              if (rand <= 0) {
                special = type
                break
              }
            }
            
            if (special !== SpecialTileType.NONE) {
              newSpecialTileCounts[special]++
            }
          }
        }

        newBoard[y][x] = {
          id: idCounter++,
          color: COLORS[colorIndex],
          x,
          y,
          special,
        }
        tilesPlaced++
      }
    }

    // 여기서 상태를 업데이트하지 않고 새 보드와 개수를 반환
    return { board: newBoard, specialTileCounts: newSpecialTileCounts }
  }, [difficulty, calculateMaxSpecialTiles])

  // 게임 난이도에 따른 초기 시간 계산
  const getInitialTimeForDifficulty = useCallback((gameDifficulty: GameDifficulty) => {
    switch (gameDifficulty) {
      case GameDifficulty.EASY:
        return INITIAL_TIME + 30 // 150초
      case GameDifficulty.HARD:
        return INITIAL_TIME - 30 // 90초
      case GameDifficulty.TIME_ATTACK:
        return 60 // 60초
      default:
        return INITIAL_TIME // 120초
    }
  }, [])

  // 새 게임 시작
  const startGame = useCallback(
    (gameDifficulty = difficulty) => {
      setShowStartScreen(false)
      setDifficulty(gameDifficulty)
      const { board: newBoard, specialTileCounts: newCounts } = initializeBoard()

      setBoard(newBoard)
      setSpecialTileCounts(newCounts)
      setScore(0)
      setTimeLeft(getInitialTimeForDifficulty(gameDifficulty))
      setGameActive(true)
      setActiveEffects([])
    },
    [difficulty, initializeBoard, getInitialTimeForDifficulty],
  )

  // 게임 난이도 변경
  const changeDifficulty = useCallback(
    (newDifficulty: GameDifficulty) => {
      setDifficulty(newDifficulty)

      // 새 난이도로 게임 재시작
      if (gameActive) {
        setGameActive(false)
        setTimeout(() => {
          setDifficulty(newDifficulty)
          startGame(newDifficulty)
        }, 100)
      }
    },
    [gameActive, startGame],
  )

  // 타이머 처리
  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer)
          setGameActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive])

  // 클릭 위치에 물결 효과 생성
  const createRippleEffect = useCallback((x: number, y: number) => {
    if (!boardRef.current) return

    const boardRect = boardRef.current.getBoundingClientRect()
    const cellWidth = boardRect.width / BOARD_COLS
    const cellHeight = boardRect.height / BOARD_ROWS

    const rippleElement = document.createElement("div")
    rippleElement.className = "absolute rounded-full bg-white/30 animate-ripple"
    rippleElement.style.width = "5px"
    rippleElement.style.height = "5px"
    rippleElement.style.left = `${x * cellWidth + cellWidth / 2}px`
    rippleElement.style.top = `${y * cellHeight + cellHeight / 2}px`

    boardRef.current.appendChild(rippleElement)

    setTimeout(() => {
      if (boardRef.current && boardRef.current.contains(rippleElement)) {
        boardRef.current.removeChild(rippleElement)
      }
    }, 1000)
  }, [])

  // 시간 패널티 애니메이션 생성
  const createTimePenaltyAnimation = useCallback((x: number, y: number) => {
    if (!boardRef.current || !timerRef.current) return

    // 클릭 위치에 패널티 팝업 생성
    const boardRect = boardRef.current.getBoundingClientRect()
    const cellWidth = boardRect.width / BOARD_COLS
    const cellHeight = boardRect.height / BOARD_ROWS

    const penaltyElement = document.createElement("div")
    penaltyElement.className =
      "absolute text-sm font-bold text-white bg-red-500 rounded-full px-2 py-0.5 z-20 flex items-center" // 텍스트 크기 축소
    penaltyElement.style.left = `${x * cellWidth + cellWidth / 2}px`
    penaltyElement.style.top = `${y * cellHeight + cellHeight / 2}px`
    penaltyElement.style.transform = "translate(-50%, -50%)"

    const iconSpan = document.createElement("span")
    iconSpan.className = "mr-1"
    iconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` // 아이콘 크기 축소

    const textSpan = document.createElement("span")
    textSpan.textContent = `-${TIME_PENALTY}초`

    penaltyElement.appendChild(iconSpan)
    penaltyElement.appendChild(textSpan)

    // CSS로 애니메이션 추가
    penaltyElement.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1, offset: 0.2 },
        { transform: "translate(-50%, -150%) scale(1)", opacity: 1, offset: 0.7 },
        { transform: "translate(-50%, -200%) scale(0.8)", opacity: 0 },
      ],
      {
        duration: 1200,
        easing: "ease-out",
        fill: "forwards",
      },
    )

    boardRef.current.appendChild(penaltyElement)

    // 타이머에 빨간색 플래시 생성
    setTimePenaltyAnimation(true)

    // 정리
    setTimeout(() => {
      if (boardRef.current && boardRef.current.contains(penaltyElement)) {
        boardRef.current.removeChild(penaltyElement)
      }
      setTimePenaltyAnimation(false)
    }, 1200)
  }, [])

  // 효과 팝업 생성
  const createEffectPopup = useCallback((x: number, y: number, effect: SpecialTileType) => {
    if (!boardRef.current) return

    const boardRect = boardRef.current.getBoundingClientRect()
    const cellWidth = boardRect.width / BOARD_COLS
    const cellHeight = boardRect.height / BOARD_ROWS

    const popupElement = document.createElement("div")
    let text = ""
    let bgColor = ""

    switch (effect) {
      case SpecialTileType.TIME_BONUS:
        text = `+${TIME_BONUS}초`
        bgColor = "bg-blue-500"
        break
      case SpecialTileType.MULTIPLIER:
        text = "2배!"
        bgColor = "bg-purple-500"
        break
      case SpecialTileType.WILD:
        text = "와일드 카드!"
        bgColor = "bg-yellow-500"
        break
    }

    popupElement.className = `absolute text-sm font-bold text-white ${bgColor} rounded-full px-2 py-0.5 z-10` // 텍스트 크기 축소
    popupElement.style.left = `${x * cellWidth + cellWidth / 2}px`
    popupElement.style.top = `${y * cellHeight + cellHeight / 2}px`
    popupElement.style.transform = "translate(-50%, -50%)"
    popupElement.textContent = text

    // CSS로 애니메이션 추가
    popupElement.animate(
      [
        { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0 },
        { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1, offset: 0.2 },
        { transform: "translate(-50%, -100%) scale(1)", opacity: 1, offset: 0.8 },
        { transform: "translate(-50%, -150%) scale(0.8)", opacity: 0 },
      ],
      {
        duration: 1000,
        easing: "ease-out",
        fill: "forwards",
      },
    )

    boardRef.current.appendChild(popupElement)

    setTimeout(() => {
      if (boardRef.current && boardRef.current.contains(popupElement)) {
        boardRef.current.removeChild(popupElement)
      }
    }, 1000)
  }, [])

  // 폭탄 효과 적용
  const applyBombEffect = useCallback(
    (x: number, y: number) => {
      if (!boardRef.current) return []

      const tilesToRemove: { id: number; x: number; y: number }[] = []
      const directions = [
        { dx: -1, dy: -1 },
        { dx: 0, dy: -1 },
        { dx: 1, dy: -1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
        { dx: -1, dy: 1 },
        { dx: 0, dy: 1 },
        { dx: 1, dy: 1 },
      ]

      // 폭발 애니메이션 생성
      const boardRect = boardRef.current.getBoundingClientRect()
      const cellWidth = boardRect.width / BOARD_COLS
      const cellHeight = boardRect.height / BOARD_ROWS

      const explosionElement = document.createElement("div")
      explosionElement.className = "absolute bg-red-500 rounded-full z-20 opacity-70"
      explosionElement.style.left = `${x * cellWidth + cellWidth / 2}px`
      explosionElement.style.top = `${y * cellHeight + cellHeight / 2}px`
      explosionElement.style.width = "5px" // 원래 크기의 50%로 축소
      explosionElement.style.height = "5px" // 원래 크기의 50%로 축소
      explosionElement.style.transform = "translate(-50%, -50%)"

      boardRef.current.appendChild(explosionElement)

      explosionElement.animate(
        [
          { width: "5px", height: "5px", opacity: 0.9 },
          { width: `${cellWidth * 3}px`, height: `${cellHeight * 3}px`, opacity: 0 },
        ],
        {
          duration: 250,
          easing: "ease-out",
          fill: "forwards",
        },
      )

      setTimeout(() => {
        if (boardRef.current && boardRef.current.contains(explosionElement)) {
          boardRef.current.removeChild(explosionElement)
        }
      }, 250)

      // 인접한 타일 확인
      directions.forEach(({ dx, dy }) => {
        const nx = x + dx
        const ny = y + dy

        if (nx >= 0 && nx < BOARD_COLS && ny >= 0 && ny < BOARD_ROWS && board[ny][nx]) {
          tilesToRemove.push({
            id: board[ny][nx]!.id,
            x: nx,
            y: ny,
          })
        }
      })

      return tilesToRemove
    },
    [board],
  )

  // 두 점 사이의 경로가 깨끗한지 확인
  const isPathClear = useCallback(
    (startX: number, startY: number, endX: number, endY: number, isHorizontalFirst: boolean) => {
      // 경로가 먼저 수평이고 그 다음 수직인 경우
      if (isHorizontalFirst) {
        // 수평 경로 확인
        const minX = Math.min(startX, endX)
        const maxX = Math.max(startX, endX)
        for (let x = minX + 1; x <= maxX; x++) {
          if (x !== startX && x !== endX && board[startY][x] !== null) {
            // 이 타일이 제거되고 있는지 확인
            const isTileRemoving = removingTiles.some((tile) => board[startY][x] && tile.id === board[startY][x]!.id)
            if (!isTileRemoving) {
              return false // 제거되지 않는 타일에 의해 경로가 차단됨
            }
          }
        }

        // 수직 경로 확인
        const minY = Math.min(startY, endY)
        const maxY = Math.max(startY, endY)
        for (let y = minY; y <= maxY; y++) {
          if (y !== startY && y !== endY && board[y][endX] !== null) {
            // 이 타일이 제거되고 있는지 확인
            const isTileRemoving = removingTiles.some((tile) => board[y][endX] && tile.id === board[y][endX]!.id)
            if (!isTileRemoving) {
              return false // 제거되지 않는 타일에 의해 경로가 차단됨
            }
          }
        }
      } else {
        // 경로가 먼저 수직이고 그 다음 수평인 경우
        // 수직 경로 확인
        const minY = Math.min(startY, endY)
        const maxY = Math.max(startY, endY)
        for (let y = minY + 1; y <= maxY; y++) {
          if (y !== startY && y !== endY && board[y][startX] !== null) {
            // 이 타일이 제거되고 있는지 확인
            const isTileRemoving = removingTiles.some((tile) => board[y][startX] && tile.id === board[y][startX]!.id)
            if (!isTileRemoving) {
              return false // 제거되지 않는 타일에 의해 경로가 차단됨
            }
          }
        }

        // 수평 경로 확인
        const minX = Math.min(startX, endX)
        const maxX = Math.max(startX, endX)
        for (let x = minX; x <= maxX; x++) {
          if (x !== startX && x !== endX && board[endY][x] !== null) {
            // 이 타일이 제거되고 있는지 확인
            const isTileRemoving = removingTiles.some((tile) => board[endY][x] && tile.id === board[endY][x]!.id)
            if (!isTileRemoving) {
              return false // 제거되지 않는 타일에 의해 경로가 차단됨
            }
          }
        }
      }

      return true // 경로가 깨끗함
    },
    [board, removingTiles],
  )

  // 클릭한 위치에서 타일까지 경로 생성
  const createPathToTile = useCallback((clickedPos: { x: number; y: number }, tile: Tile): PathSegment[] | null => {
    const startX = clickedPos.x
    const startY = clickedPos.y
    const endX = tile.x
    const endY = tile.y

    // 직접 경로 생성
    return [
      {
        startX,
        startY,
        endX,
        endY: startY,
        isHorizontal: true,
      },
      {
        startX: endX,
        startY,
        endX,
        endY,
        isHorizontal: false,
      },
    ]
  }, [])

  // 경로 세그먼트 그리기
  const drawPathSegments = useCallback((segments: PathSegment[], clickX: number, clickY: number) => {
    if (!boardRef.current) return

    const boardRect = boardRef.current.getBoundingClientRect()
    const cellWidth = boardRect.width / BOARD_COLS
    const cellHeight = boardRect.height / BOARD_ROWS

    // 각 세그먼트를 약간의 지연으로 그리기
    segments.forEach((segment, index) => {
      setTimeout(() => {
        if (!boardRef.current) return

        const line = document.createElement("div")
        line.className = "absolute bg-yellow-300 z-5 rounded-full opacity-70"

        const startX = segment.startX * cellWidth + cellWidth / 2
        const startY = segment.startY * cellHeight + cellHeight / 2
        const endX = segment.endX * cellWidth + cellWidth / 2
        const endY = segment.endY * cellHeight + cellHeight / 2

        if (segment.isHorizontal) {
          // 수평선
          const length = Math.abs(endX - startX)
          line.style.width = `${length}px`
          line.style.height = "2px" // 원래 크기의 50%로 축소
          line.style.left = `${Math.min(startX, endX)}px`
          line.style.top = `${startY}px`
          line.style.transformOrigin = "left center"
          line.classList.add("animate-draw-horizontal")
        } else {
          // 수직선
          const length = Math.abs(endY - startY)
          line.style.width = "2px" // 원래 크기의 50%로 축소
          line.style.height = `${length}px`
          line.style.left = `${startX}px`
          line.style.top = `${Math.min(startY, endY)}px`
          line.style.transformOrigin = "center top"
          line.classList.add("animate-draw-vertical")
        }

        boardRef.current.appendChild(line)

        // 애니메이션 후 선 제거
        setTimeout(() => {
          if (boardRef.current && boardRef.current.contains(line)) {
            boardRef.current.removeChild(line)
          }
        }, 350)
      }, index * 100) // 애니메이션 시차 두기
    })
  }, [])

  // 점수 팝업 생성
  const createScorePopup = useCallback(
    (x: number, y: number, points: number, isMultiplied: boolean, isBombEffect = false) => {
      if (!boardRef.current) return

      const boardRect = boardRef.current.getBoundingClientRect()
      const cellWidth = boardRect.width / BOARD_COLS
      const cellHeight = boardRect.height / BOARD_ROWS

      const popupElement = document.createElement("div")

      // 폭탄 효과인 경우 다른 스타일 적용
      const bgColor = isBombEffect ? "bg-red-500" : isMultiplied ? "bg-purple-500" : "bg-green-500"

      popupElement.className = `absolute text-sm font-bold text-white ${bgColor} rounded-full px-2 py-0.5 z-10`
      popupElement.style.left = `${x * cellWidth + cellWidth / 2}px`
      popupElement.style.top = `${y * cellHeight + cellHeight / 2}px`
      popupElement.style.transform = "translate(-50%, -50%)"

      // 폭탄 효과인 경우 다른 텍스트 표시
      if (isBombEffect) {
        popupElement.textContent = isMultiplied ? `폭탄 +${points}×2` : `폭탄 +${points}`
      } else {
        popupElement.textContent = isMultiplied ? `+${points}×2` : `+${points}`
      }

      // CSS로 애니메이션 추가
      popupElement.animate(
        [
          { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0 },
          { transform: "translate(-50%, -50%) scale(1.2)", opacity: 1, offset: 0.2 },
          { transform: "translate(-50%, -100%) scale(1)", opacity: 1, offset: 0.8 },
          { transform: "translate(-50%, -150%) scale(0.8)", opacity: 0 },
        ],
        {
          duration: 500,
          easing: "ease-out",
          fill: "forwards",
        },
      )

      boardRef.current.appendChild(popupElement)

      setTimeout(() => {
        if (boardRef.current && boardRef.current.contains(popupElement)) {
          boardRef.current.removeChild(popupElement)
        }
      }, 500)
    },
    [],
  )

  // 셀 클릭 처리
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      if (!gameActive) return

      // 타일을 클릭한 경우 아무것도 하지 않음
      if (board[y][x]) {
        return
      }

      // 물결 효과 생성
      createRippleEffect(x, y)

      // 상하좌우 방향의 가장 가까운 타일 찾기
      const tilesInDirections: Record<string, Tile | null> = {
        up: null,
        right: null,
        down: null,
        left: null,
      }

      // 위쪽 확인
      for (let ny = y - 1; ny >= 0; ny--) {
        if (board[ny][x]) {
          tilesInDirections.up = board[ny][x]
          break
        }
      }

      // 오른쪽 확인
      for (let nx = x + 1; nx < BOARD_COLS; nx++) {
        if (board[y][nx]) {
          tilesInDirections.right = board[y][nx]
          break
        }
      }

      // 아래쪽 확인
      for (let ny = y + 1; ny < BOARD_ROWS; ny++) {
        if (board[ny][x]) {
          tilesInDirections.down = board[ny][x]
          break
        }
      }

      // 왼쪽 확인
      for (let nx = x - 1; nx >= 0; nx--) {
        if (board[y][nx]) {
          tilesInDirections.left = board[y][nx]
          break
        }
      }

      // 매치 확인
      const matches: [string, string][] = []
      const directions = ["up", "right", "down", "left"]

      // 효과를 위한 특수 타일 추적
      const specialTiles = {
        multiplier: [] as { tile: Tile; direction: string }[],
        timeBonus: [] as { tile: Tile; direction: string }[],
        bomb: [] as { tile: Tile; direction: string }[],
        wild: [] as { tile: Tile; direction: string }[],
      }

      // 타일 쌍 간의 매치 확인
      for (let i = 0; i < directions.length; i++) {
        for (let j = i + 1; j < directions.length; j++) {
          const dir1 = directions[i]
          const dir2 = directions[j]
          const tile1 = tilesInDirections[dir1 as keyof typeof tilesInDirections]
          const tile2 = tilesInDirections[dir2 as keyof typeof tilesInDirections]

          // 둘 중 하나의 타일이 null이면 건너뜀
          if (!tile1 || !tile2) continue

          // 특수 타일 추적
          if (tile1.special === SpecialTileType.MULTIPLIER) {
            specialTiles.multiplier.push({ tile: tile1, direction: dir1 })
          }
          if (tile2.special === SpecialTileType.MULTIPLIER) {
            specialTiles.multiplier.push({ tile: tile2, direction: dir2 })
          }

          if (tile1.special === SpecialTileType.TIME_BONUS) {
            specialTiles.timeBonus.push({ tile: tile1, direction: dir1 })
          }
          if (tile2.special === SpecialTileType.TIME_BONUS) {
            specialTiles.timeBonus.push({ tile: tile2, direction: dir2 })
          }

          if (tile1.special === SpecialTileType.BOMB) {
            specialTiles.bomb.push({ tile: tile1, direction: dir1 })
          }
          if (tile2.special === SpecialTileType.BOMB) {
            specialTiles.bomb.push({ tile: tile2, direction: dir2 })
          }

          if (tile1.special === SpecialTileType.WILD) {
            specialTiles.wild.push({ tile: tile1, direction: dir1 })
          }
          if (tile2.special === SpecialTileType.WILD) {
            specialTiles.wild.push({ tile: tile2, direction: dir2 })
          }

          // 같은 색상이거나 이 두 타일 중 하나가 와일드 카드인 경우 매치
          if (
            tile1.color === tile2.color ||
            tile1.special === SpecialTileType.WILD ||
            tile2.special === SpecialTileType.WILD
          ) {
            matches.push([dir1, dir2])
          }
        }
      }

      // 매치가 없으면 패널티 적용
      if (matches.length === 0) {
        setTimeLeft((prev) => Math.max(0, prev - TIME_PENALTY))
        setPenaltyAnimation(true)

        // 시간 패널티 애니메이션 생성
        createTimePenaltyAnimation(x, y)

        // 패널티 사운드 재생
        if (bgmEnabled && penaltyAudioRef.current) {
          penaltyAudioRef.current.currentTime = 0
          penaltyAudioRef.current.play()
        }

        setTimeout(() => {
          setPenaltyAnimation(false)
        }, 250)

        return
      }

      // 애니메이션을 위해 제거할 타일 수집
      let tilesToRemove: { id: number; x: number; y: number }[] = []

      // 매치된 타일을 제거 목록에 추가
      matches.forEach(([dir1, dir2]) => {
        const tile1 = tilesInDirections[dir1 as keyof typeof tilesInDirections]
        const tile2 = tilesInDirections[dir2 as keyof typeof tilesInDirections]

        if (tile1) {
          tilesToRemove.push({ id: tile1.id, x: tile1.x, y: tile1.y })
        }

        if (tile2) {
          tilesToRemove.push({ id: tile2.id, x: tile2.x, y: tile2.y })
        }
      })

      // 특수 효과 확인
      const hasMultiplier = specialTiles.multiplier.some(({ tile }) => tilesToRemove.some((t) => t.id === tile.id))

      const hasTimeBonus = specialTiles.timeBonus.some(({ tile }) => tilesToRemove.some((t) => t.id === tile.id))

      // 폭탄 효과로 제거된 타일 수를 추적할 변수 추가
      let bombRemovedTilesCount = 0

      // 필요한 경우 폭탄 효과 적용
      for (const { tile } of specialTiles.bomb) {
        if (tilesToRemove.some((t) => t.id === tile.id)) {
          const bombTiles = applyBombEffect(tile.x, tile.y)

          // 폭탄 사운드 재생
          if (bgmEnabled && boomAudioRef.current) {
            boomAudioRef.current.currentTime = 0
            boomAudioRef.current.play()
          }

          // 폭탄으로 제거된 타일 수 추적
          bombRemovedTilesCount += bombTiles.length

          tilesToRemove = [...tilesToRemove, ...bombTiles]

          // 폭탄 효과 표시
          createEffectPopup(tile.x, tile.y, SpecialTileType.BOMB)

          // 활성 효과에 추가
          setActiveEffects((prev) => [...prev, { type: SpecialTileType.BOMB, x: tile.x, y: tile.y }])

          // 애니메이션 후 폭탄 효과 제거
          setTimeout(() => {
            setActiveEffects((prev) =>
              prev.filter(
                (effect) => !(effect.type === SpecialTileType.BOMB && effect.x === tile.x && effect.y === tile.y),
              ),
            )
          }, 500)
        }
      }

      // tilesToRemove에서 중복 제거
      tilesToRemove = tilesToRemove.filter((tile, index, self) => index === self.findIndex((t) => t.id === tile.id))

      // 필요한 경우 시간 보너스 적용
      if (hasTimeBonus) {
        setTimeLeft((prev) => Math.min(INITIAL_TIME, prev + TIME_BONUS))

        // 타임보너스 사운드 재생
        if (bgmEnabled && timeBonusAudioRef.current) {
          timeBonusAudioRef.current.currentTime = 0
          timeBonusAudioRef.current.play()
        }

        // 제거되는 각 시간 보너스 타일에 대해 시간 보너스 효과 표시
        for (const { tile } of specialTiles.timeBonus) {
          if (tilesToRemove.some((t) => t.id === tile.id)) {
            createEffectPopup(tile.x, tile.y, SpecialTileType.TIME_BONUS)

            // 활성 효과에 추가
            setActiveEffects((prev) => [...prev, { type: SpecialTileType.TIME_BONUS, x: tile.x, y: tile.y }])

            // 애니메이션 후 시간 보너스 효과 제거
            setTimeout(() => {
              setActiveEffects((prev) =>
                prev.filter(
                  (effect) =>
                    !(effect.type === SpecialTileType.TIME_BONUS && effect.x === tile.x && effect.y === tile.y),
                ),
              )
            }, 500)
          }
        }
      }

      // 타일을 제거 중으로 설정 (애니메이션용)
      setRemovingTiles((prev) => {
        // 이전에 제거 중인 타일과 새 타일을 중복 없이 결합
        const combinedTiles = [...prev]

        tilesToRemove.forEach((tile) => {
          if (!combinedTiles.some((t) => t.id === tile.id)) {
            combinedTiles.push(tile)
          }
        })

        return combinedTiles
      })

      // 클릭한 영역에서 각 제거된 타일로 연결선 그리기
      if (boardRef.current) {
        // 상하좌우 방향의 각 매치된 타일에 선 그리기
        directions.forEach((dir) => {
          const tile = tilesInDirections[dir as keyof typeof tilesInDirections]

          // 제거되는 타일에만 선 그리기
          if (tile && tilesToRemove.some((t) => t.id === tile.id)) {
            // 클릭한 위치에서 타일까지 직접 경로 생성
            const clickedPos = { x, y }
            const tilePath = createPathToTile(clickedPos, tile)

            // 경로가 존재하면 그리기
            if (tilePath) {
              drawPathSegments(tilePath, x, y)
            }
          }
        })
      }

      // 필요한 경우 멀티플라이어 효과 표시
      if (hasMultiplier) {
        // 멀티플라이어 사운드 재생
        if (bgmEnabled && multiplierAudioRef.current) {
          multiplierAudioRef.current.currentTime = 0
          multiplierAudioRef.current.play()
        }

        // 제거되는 각 멀티플라이어 타일에 대해 멀티플라이어 효과 표시
        for (const { tile } of specialTiles.multiplier) {
          if (tilesToRemove.some((t) => t.id === tile.id)) {
            createEffectPopup(tile.x, tile.y, SpecialTileType.MULTIPLIER)

            // 활성 효과에 추가
            setActiveEffects((prev) => [...prev, { type: SpecialTileType.MULTIPLIER, x: tile.x, y: tile.y }])

            // 애니메이션 후 멀티플라이어 효과 제거
            setTimeout(() => {
              setActiveEffects((prev) =>
                prev.filter(
                  (effect) =>
                    !(effect.type === SpecialTileType.MULTIPLIER && effect.x === tile.x && effect.y === tile.y),
                ),
              )
            }, 500)
          }
        }
      }

      // 제거되는 각 와일드 카드 타일에 대해 와일드 카드 효과 표시
      for (const { tile } of specialTiles.wild) {
        if (tilesToRemove.some((t) => t.id === tile.id)) {
          createEffectPopup(tile.x, tile.y, SpecialTileType.WILD)

          // 활성 효과에 추가
          setActiveEffects((prev) => [...prev, { type: SpecialTileType.WILD, x: tile.x, y: tile.y }])

          // 애니메이션 후 와일드 카드 효과 제거
          setTimeout(() => {
            setActiveEffects((prev) =>
              prev.filter(
                (effect) => !(effect.type === SpecialTileType.WILD && effect.x === tile.x && effect.y === tile.y),
              ),
            )
          }, 500)
        }
      }

      // 점수 계산 부분을 수정하여 폭탄으로 제거된 타일에 대한 점수 추가
      // 기존 매치 점수 + 폭탄 효과 점수
      const pointsToAdd = (matches.length + bombRemovedTilesCount) * (hasMultiplier ? 2 : 1)

      // 지우기 성공 사운드 재생
      if (bgmEnabled && successAudioRef.current) {
        successAudioRef.current.currentTime = 0
        successAudioRef.current.play()
      }

      // 점수 팝업 생성
      const basePoints = matches.length
      createScorePopup(x, y, basePoints, hasMultiplier)

      // 폭탄 효과로 제거된 타일이 있으면 추가 점수 팝업 표시
      if (bombRemovedTilesCount > 0) {
        createScorePopup(x, y, bombRemovedTilesCount, hasMultiplier, true)
      }

      // 점수 애니메이션
      setScoreAnimation(true)
      setTimeout(() => {
        setScoreAnimation(false)
      }, 250)

      // 애니메이션 후 매치된 타일 제거 및 점수 업데이트
      setTimeout(() => {
        // 타일 제거 시 특수 타일 수 업데이트
        const newSpecialTileCounts = { ...specialTileCounts }

        // 개수를 업데이트하기 위해 제거되는 특수 타일 목록 생성
        const specialTilesBeingRemoved: SpecialTileType[] = []

        tilesToRemove.forEach(({ x, y }) => {
          const tile = board[y][x]
          if (tile && tile.special !== SpecialTileType.NONE) {
            specialTilesBeingRemoved.push(tile.special)
          }
        })

        // 각 특수 타일 유형에 대한 개수 업데이트
        specialTilesBeingRemoved.forEach((specialType) => {
          if (newSpecialTileCounts[specialType] > 0) {
            newSpecialTileCounts[specialType]--
          }
        })

        // 보드 업데이트
        setBoard((currentBoard) => {
          // 현재 보드 상태의 깊은 복사본 생성
          const newBoard = [...currentBoard.map((row) => [...row])]

          // 이 작업에서 제거하기 위해 표시된 모든 타일 제거
          tilesToRemove.forEach(({ x, y }) => {
            newBoard[y][x] = null
          })

          return newBoard
        })

        // 특수 타일 개수 업데이트
        setSpecialTileCounts(newSpecialTileCounts)

        setScore((prev) => prev + pointsToAdd)

        // removingTiles 상태에서 이 특정 타일만 제거
        setRemovingTiles((currentRemoving) =>
          currentRemoving.filter((tile) => !tilesToRemove.some((removeTile) => removeTile.id === tile.id)),
        )
      }, 320)
    },
    [
      board,
      gameActive,
      createRippleEffect,
      createScorePopup,
      createEffectPopup,
      applyBombEffect,
      createTimePenaltyAnimation,
      drawPathSegments,
      createPathToTile,
      specialTileCounts,
      bgmEnabled,
    ],
  )

  // 시간을 MM:SS 형식으로 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 진행률 백분율 계산
  const timeProgress = (timeLeft / getInitialTimeForDifficulty(difficulty)) * 100

  // 특수 타일 아이콘 가져오기
  const getSpecialTileIcon = (type: SpecialTileType) => {
    switch (type) {
      case SpecialTileType.WILD:
        return (
          <Star className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )
      case SpecialTileType.TIME_BONUS:
        return (
          <Clock className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )
      case SpecialTileType.MULTIPLIER:
        return (
          <Award className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )
      case SpecialTileType.BOMB:
        return (
          <Zap className="h-3 w-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        )
      default:
        return null
    }
  }

  // 표시용 난이도 이름 가져오기
  const getDifficultyName = (diff: GameDifficulty) => {
    switch (diff) {
      case GameDifficulty.EASY:
        return "쉬움"
      case GameDifficulty.NORMAL:
        return "보통"
      case GameDifficulty.HARD:
        return "어려움"
      case GameDifficulty.TIME_ATTACK:
        return "타임 어택"
    }
  }

  // 표시용 특수 타일 개수 가져오기
  const getSpecialTileCountsDisplay = () => {
    return (
      <div className="flex flex-col text-xs text-gray-500 mb-1">
        <div className="grid grid-cols-4 gap-1">
          <div className="flex items-center">
            <Star className="h-3 w-3 mr-1 text-yellow-500" /> {specialTileCounts[SpecialTileType.WILD]}
          </div>
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1 text-blue-500" /> {specialTileCounts[SpecialTileType.TIME_BONUS]}
          </div>
          <div className="flex items-center">
            <Award className="h-3 w-3 mr-1 text-purple-500" /> {specialTileCounts[SpecialTileType.MULTIPLIER]}
          </div>
          <div className="flex items-center">
            <Zap className="h-3 w-3 mr-1 text-red-500" /> {specialTileCounts[SpecialTileType.BOMB]}
          </div>
        </div>
      </div>
    )
  }

  // 시작 화면 또는 게임 렌더링
  if (showStartScreen) {
    return <GameStart onStartGame={startGame} />
  }

  return (
    <div className="flex flex-col items-center max-w-4xl w-full mx-auto">
      <div className="w-full bg-white rounded-lg shadow-lg p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <div
            ref={timerRef}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all",
              timePenaltyAnimation && "animate-time-penalty bg-red-100",
            )}
          >
            <Timer className={cn("text-gray-500", timePenaltyAnimation && "text-red-500")} />
            <div
              className={cn("text-lg font-medium transition-all", timePenaltyAnimation && "text-red-500 animate-shake")}
            >
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className={cn("text-3xl font-bold text-red-500", scoreAnimation && "animate-bounce")}>{score}</div>
        </div>

        {/* 진행 바 */}
        <div className="w-full h-4 bg-gray-200 rounded-full mb-4 overflow-hidden">
          <div
            className={cn(
              "h-full bg-red-500 rounded-full transition-all duration-1000",
              timePenaltyAnimation && "animate-progress-flash",
            )}
            style={{ width: `${timeProgress}%` }}
          />
        </div>

        {/* 게임 보드 */}
        <div
          className={cn(
            "relative w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300",
            penaltyAnimation && "animate-[shadow_0.5s_ease-in-out]",
          )}
          style={{ aspectRatio: `${BOARD_COLS}/${BOARD_ROWS}` }} // 새 치수에 맞게 조정된 종횡비
        >
          <div
            ref={boardRef}
            className="absolute inset-0 grid"
            style={{
              gridTemplateColumns: `repeat(${BOARD_COLS}, 1fr)`,
              gridTemplateRows: `repeat(${BOARD_ROWS}, 1fr)`,
              backgroundImage:
                "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
              backgroundSize: "10px 10px", // 원래 크기의 50%로 축소
              backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px", // 작은 패턴에 맞게 조정
            }}
          >
            {board.map((row, y) =>
              row.map((tile, x) => (
                <div
                  key={`${y}-${x}`}
                  className="relative border border-gray-200/50 hover:bg-white/20 transition-colors duration-200"
                  onClick={() => handleCellClick(x, y)}
                >
                  {tile && (
                    <div
                      className={cn(
                        "absolute inset-0.5 rounded-sm shadow-sm transition-all duration-200 transform hover:scale-105", // 패딩 및 테두리 반경 축소
                        tile.special === SpecialTileType.WILD 
                          ? "bg-gradient-to-r from-red-400 via-yellow-400 via-green-400 via-blue-400 to-purple-400 animate-gradient" 
                          : tile.color,
                        removingTiles.some((t) => t.id === tile.id) &&
                          "animate-[scale_0.64s_ease-out_forwards] ring-2 ring-yellow-300 ring-opacity-80 z-10 before:absolute before:inset-0 before:bg-white before:opacity-40 before:rounded-sm before:animate-pulse highlight-pulse sparkle", // 링 크기 축소
                        tile.special !== SpecialTileType.NONE && "border border-white", // 테두리 크기 축소
                      )}
                    >
                      {tile.special !== SpecialTileType.NONE && (
                        <div
                          className={cn(
                            "absolute inset-0 rounded-sm flex items-center justify-center",
                            activeEffects.some((e) => e.type === tile.special && e.x === tile.x && e.y === tile.y) &&
                              "animate-pulse",
                          )}
                        >
                          {getSpecialTileIcon(tile.special)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )),
            )}
          </div>

          {/* 게임 오버 오버레이 */}
          {!gameActive && timeLeft === 0 && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center animate-[fadeIn_0.5s_ease-out]">
              <div className="text-center">
                <div className="text-white text-5xl font-bold mb-8 animate-[bounceIn_0.6s_ease-out]">
                  <span className="block text-xl text-gray-300 mb-2">최종 점수</span>
                  <span className="text-6xl text-green-400">{score}</span>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => startGame()}
                    className="px-8 py-3 text-lg animate-[bounceIn_0.6s_ease-out_0.2s] bg-green-500 hover:bg-green-600"
                  >
                    <RefreshCw className="h-5 w-5 mr-2" />
                    다시 하기
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 컨트롤 */}
      <div className="flex justify-between items-center w-full bg-white rounded-lg shadow-lg p-4">
        <div className="flex flex-col items-start">
          {/* 현재 특수 타일 개수 표시 */}
          {getSpecialTileCountsDisplay()}

          <div className="flex gap-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Star className="h-3 w-3 mr-1 text-yellow-500" /> 와일드 카드
            </div>
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-blue-500" /> 시간 보너스
            </div>
            <div className="flex items-center">
              <Award className="h-3 w-3 mr-1 text-purple-500" /> 2배 점수
            </div>
            <div className="flex items-center">
              <Zap className="h-3 w-3 mr-1 text-red-500" /> 폭탄
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* BGM(효과음) 체크박스 */}
          <label className="flex items-center gap-1 mr-2 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={bgmEnabled}
              onChange={e => setBgmEnabled(e.target.checked)}
              className="accent-red-500 w-4 h-4"
            />
            <span className="text-sm text-gray-700">효과음</span>
          </label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span>{getDifficultyName(difficulty)}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>난이도</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => changeDifficulty(GameDifficulty.EASY)}>쉬움</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeDifficulty(GameDifficulty.NORMAL)}>보통</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeDifficulty(GameDifficulty.HARD)}>어려움</DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeDifficulty(GameDifficulty.TIME_ATTACK)}>
                타임 어택
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => startGame()}
            className="flex items-center gap-2 transition-all duration-200 hover:scale-105"
          >
            <RefreshCw className="h-4 w-4" />
            초기화
          </Button>
        </div>
      </div>
      <audio ref={successAudioRef} src="/sounds/success.mp3" preload="auto" />
      <audio ref={penaltyAudioRef} src="/sounds/penalty.mp3" preload="auto" />
      <audio ref={boomAudioRef} src="/sounds/boom.mp3" preload="auto" />
      <audio ref={multiplierAudioRef} src="/sounds/multiplier.mp3" preload="auto" />
      <audio ref={timeBonusAudioRef} src="/sounds/time-bonus.mp3" preload="auto" />
    </div>
  )
}
