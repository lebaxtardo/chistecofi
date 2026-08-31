import type { Difficulty, LevelConfig } from './types'

export const LEVELS: Record<Difficulty, LevelConfig> = {
  easy: { id: 'easy', hayCount: 1_000 },
  medium: { id: 'medium', hayCount: 100_000 },
  expert: { id: 'expert', hayCount: 100_000_000 },
}

export const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'expert']

export const MAX_SPRITES = 3_200
export const MIN_SPRITE_PIXELS = 3.2
export const MAX_ZOOM = 8
export const PAN_SPEED = 420
export const SCATTER_FORCE = 30
export const PICK_RADIUS = 12
export const NEEDLE_DRAG_TO_WIN = 18
export const MINIMAP_SIZE = 132
export const DPR_CAP = 2
