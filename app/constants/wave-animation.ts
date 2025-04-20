export const WAVE_CONSTANTS = {
  MIN_STONE_SIZE: 3,
  MAX_STONE_SIZE: 20,
  DRAG_THRESHOLD: 5,
  STONE_CREATION_INTERVAL: 50,
  RIPPLE_FADE_START: 60,
  RIPPLE_FADE_DURATION: 120,
  RIPPLE_MAX_AGE: 180,
  WAVE_COUNT: 3,
  DPR: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
  STONE_GRAVITY: 0.18,
  RIPPLE_STRENGTH: 15,
  WAVE_SPEED: 0.05,
} as const

export const WAVE_COLORS = {
  SKY_GRADIENT_TOP: "rgba(135, 206, 250, 0.8)",
  SKY_GRADIENT_BOTTOM: "rgba(200, 240, 255, 0.5)",
  WAVE_BASE: "rgba(0, 120, 255, ",
  SPLASH: "rgba(255, 255, 255, 0.8)",
  STONE_BORDER: "rgba(0, 0, 0, 0.2)",
  SIZE_INDICATOR: "rgba(255, 255, 255, 0.5)",
} as const 