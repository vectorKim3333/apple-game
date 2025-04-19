// 특수 타일 유형 정의
export enum SpecialTileType {
  NONE = "none",
  WILD = "wild",
  TIME_BONUS = "time",
  MULTIPLIER = "multiplier",
  BOMB = "bomb",
}

// 게임 난이도 모드 정의
export enum GameDifficulty {
  EASY = "easy",
  NORMAL = "normal",
  HARD = "hard",
  TIME_ATTACK = "time_attack",
}

// 타일 인터페이스 정의
export interface Tile {
  id: number
  color: string
  x: number
  y: number
  special: SpecialTileType
}

// 경로 세그먼트 인터페이스 정의
export interface PathSegment {
  startX: number
  startY: number
  endX: number
  endY: number
  isHorizontal: boolean
}

// 게임 상태 인터페이스 정의
export interface GameState {
  board: (Tile | null)[][]
  score: number
  timeLeft: number
  gameActive: boolean
  removingTiles: { id: number; x: number; y: number }[]
  scoreAnimation: boolean
  penaltyAnimation: boolean
  activeEffects: { type: SpecialTileType; x: number; y: number }[]
  timePenaltyAnimation: boolean
  difficulty: GameDifficulty
  specialTileCounts: Record<SpecialTileType, number>
  showStartScreen: boolean
}

// 특수 타일 효과 상태 인터페이스
export interface SpecialTileEffects {
  multiplier: { tile: Tile; direction: string }[]
  timeBonus: { tile: Tile; direction: string }[]
  bomb: { tile: Tile; direction: string }[]
  wild: { tile: Tile; direction: string }[]
} 