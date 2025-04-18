"use client"

import { useCallback, useEffect, useState } from 'react'
import { COLORS, GAME_CONSTANTS } from '@/app/constants/color-tiles'

interface Position {
  x: number
  y: number
}

interface Tile {
  id: string
  color: string
  position: Position
  isSelected: boolean
}

export default function ColorTiles() {
  const [tiles, setTiles] = useState<Tile[]>([])
  const [score, setScore] = useState(0)
  const [isGameStarted, setIsGameStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState<number>(GAME_CONSTANTS.GAME_DURATION)
  const [isColorBlindMode, setIsColorBlindMode] = useState(false)

  const initializeTiles = useCallback(() => {
    const newTiles: Tile[] = []
    const totalCells = GAME_CONSTANTS.GRID_SIZE * GAME_CONSTANTS.GRID_SIZE
    const tilesToFill = Math.floor(totalCells * GAME_CONSTANTS.INITIAL_FILL_RATE)

    for (let i = 0; i < tilesToFill; i++) {
      const x = Math.floor(i / GAME_CONSTANTS.GRID_SIZE)
      const y = i % GAME_CONSTANTS.GRID_SIZE
      newTiles.push({
        id: `${x}-${y}`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        position: { x, y },
        isSelected: false
      })
    }
    setTiles(newTiles)
  }, [])

  const startGame = () => {
    setIsGameStarted(true)
    setScore(0)
    setTimeLeft(GAME_CONSTANTS.GAME_DURATION)
    initializeTiles()
  }

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isGameStarted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev: number) => {
          if (prev <= 1) {
            setIsGameStarted(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isGameStarted, timeLeft])

  const findNearestTiles = (tile: Tile): Tile[] => {
    return tiles.filter(t => {
      if (t.id === tile.id) return false
      if (t.color !== tile.color) return false
      
      const dx = Math.abs(t.position.x - tile.position.x)
      const dy = Math.abs(t.position.y - tile.position.y)
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1)
    })
  }

  const handleTileClick = (clickedTile: Tile) => {
    if (!isGameStarted) return

    const matchingTiles = findNearestTiles(clickedTile)
    if (matchingTiles.length >= GAME_CONSTANTS.MIN_MATCH - 1) {
      const matchedIds = [...matchingTiles.map(t => t.id), clickedTile.id]
      setTiles((prev: Tile[]) => prev.filter(t => !matchedIds.includes(t.id)))
      setScore((prev: number) => prev + matchedIds.length)
    } else {
      setTimeLeft((prev: number) => Math.max(0, prev - GAME_CONSTANTS.PENALTY_TIME))
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex justify-between w-full max-w-lg mb-4">
        <div>점수: {score}</div>
        <div>남은 시간: {timeLeft}초</div>
      </div>

      <div 
        className="grid gap-1 p-2 bg-gray-100 rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${GAME_CONSTANTS.GRID_SIZE}, minmax(0, 1fr))`,
          width: 'min(90vw, 600px)',
          height: 'min(90vw, 600px)'
        }}
      >
        {tiles.map(tile => (
          <button
            key={tile.id}
            onClick={() => handleTileClick(tile)}
            className="aspect-square rounded-md transition-colors hover:opacity-80"
            style={{ backgroundColor: tile.color }}
          >
            {isColorBlindMode && (
              <span className="text-xs text-white/80">
                {COLORS.indexOf(tile.color)}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={startGame}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {isGameStarted ? '다시 시작' : '게임 시작'}
        </button>
        <button
          onClick={() => setIsColorBlindMode(prev => !prev)}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          색약 모드 {isColorBlindMode ? '끄기' : '켜기'}
        </button>
      </div>
    </div>
  )
} 