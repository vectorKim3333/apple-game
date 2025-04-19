// 게임 보드 크기
export const BOARD_DIMENSIONS = {
  COLS: 23,
  ROWS: 15
} as const;

// 시간 관련 상수
export const TIME_CONSTANTS = {
  INITIAL: 120,
  PENALTY: 10,
  BONUS: 15
} as const;

// 타일 색상 정의
export const COLORS = [
  "bg-red-400",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-400",
  "bg-orange-400",
  "bg-teal-400",
  "bg-yellow-400",
  "bg-gray-400",
] as const;

// 특수 타일 비율
export const SPECIAL_TILE_RATIOS = {
  easy: {
    wild: 0.04,
    time_bonus: 0.03,
    multiplier: 0.03,
    bomb: 0.02,
    fillRate: 0.55,
  },
  normal: {
    wild: 0.03,
    time_bonus: 0.015,
    multiplier: 0.025,
    bomb: 0.01,
    fillRate: 0.6,
  },
  hard: {
    wild: 0.015,
    time_bonus: 0.01,
    multiplier: 0.02,
    bomb: 0.005,
    fillRate: 0.65,
  },
  time_attack: {
    wild: 0.025,
    time_bonus: 0.005,
    multiplier: 0.04,
    bomb: 0.015,
    fillRate: 0.6,
  },
} as const; 
