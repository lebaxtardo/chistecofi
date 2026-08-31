export type Difficulty = 'easy' | 'medium' | 'expert'

export type DragKind = 'none' | 'pan' | 'straw' | 'needle'

export type Vec2 = {
  x: number
  y: number
}

export type AABB = {
  x: number
  y: number
  w: number
  h: number
}

export type LooseItem = {
  x: number
  y: number
  angle: number
}

export type Camera = {
  x: number
  y: number
  zoom: number
}

export type LevelConfig = {
  id: Difficulty
  hayCount: number
}

export type EngineSnapshot = {
  levelId: Difficulty
  hayCount: number
  movedCount: number
  zoom: number
  proximity: number
  dragging: DragKind
  foundNeedle: boolean
  needleInView: boolean
  elapsedMs: number
  spriteMode: boolean
}

export type EngineCallbacks = {
  onSnapshot: (snapshot: EngineSnapshot) => void
  onFound: () => void
}
