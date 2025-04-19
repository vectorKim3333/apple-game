import { useCallback } from "react"
import { SpecialTileType, Tile, GameDifficulty } from "../types/game"
import { BOARD_DIMENSIONS, SPECIAL_TILE_RATIOS } from "../constants/gameConstants"

interface UseSpecialTilesProps {
  difficulty: GameDifficulty
  boardRef: React.RefObject<HTMLDivElement>
}

export const useSpecialTiles = ({ difficulty, boardRef }: UseSpecialTilesProps) => {
  // 특수 타일 아이콘 생성 함수
  const createEffectPopup = useCallback((x: number, y: number, effect: SpecialTileType) => {
    if (!boardRef.current) return

    const boardRect = boardRef.current.getBoundingClientRect()
    const cellWidth = boardRect.width / BOARD_DIMENSIONS.COLS
    const cellHeight = boardRect.height / BOARD_DIMENSIONS.ROWS

    const popupElement = document.createElement("div")
    let text = ""
    let bgColor = ""

    switch (effect) {
      case SpecialTileType.TIME_BONUS:
        text = `+15초`
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

    popupElement.className = `absolute text-sm font-bold text-white ${bgColor} rounded-full px-2 py-0.5 z-10`
    popupElement.style.left = `${x * cellWidth + cellWidth / 2}px`
    popupElement.style.top = `${y * cellHeight + cellHeight / 2}px`
    popupElement.style.transform = "translate(-50%, -50%)"
    popupElement.textContent = text

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
  }, [boardRef])

  // 특수 타일 최대 개수 계산
  const calculateMaxSpecialTiles = useCallback(
    (totalTiles: number) => {
      const ratios = SPECIAL_TILE_RATIOS[difficulty]
      return {
        [SpecialTileType.WILD]: Math.floor(totalTiles * ratios.wild),
        [SpecialTileType.TIME_BONUS]: Math.floor(totalTiles * ratios.time_bonus),
        [SpecialTileType.MULTIPLIER]: Math.floor(totalTiles * ratios.multiplier),
        [SpecialTileType.BOMB]: Math.floor(totalTiles * ratios.bomb),
      }
    },
    [difficulty],
  )

  // 특수 타일 개수 세기
  const countSpecialTiles = useCallback((board: (Tile | null)[][]) => {
    const counts: Record<SpecialTileType, number> = {
      [SpecialTileType.WILD]: 0,
      [SpecialTileType.TIME_BONUS]: 0,
      [SpecialTileType.MULTIPLIER]: 0,
      [SpecialTileType.BOMB]: 0,
      [SpecialTileType.NONE]: 0,
    }

    for (let y = 0; y < board.length; y++) {
      for (let x = 0; x < board[y].length; x++) {
        const tile = board[y][x]
        if (tile && tile.special !== SpecialTileType.NONE) {
          counts[tile.special]++
        }
      }
    }

    return counts
  }, [])

  const totalTiles = BOARD_DIMENSIONS.COLS * BOARD_DIMENSIONS.ROWS;

  return {
    createEffectPopup,
    calculateMaxSpecialTiles,
    countSpecialTiles,
  }
} 