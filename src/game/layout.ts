import { hash01 } from './math'
import type { AABB, Vec2 } from './types'

export const SPACING_X = 10
export const SPACING_Y = 5.5
export const PADDING = 64
export const JITTER_X = 3.4
export const JITTER_Y = 2.2

export type LayoutMetrics = {
  count: number
  rows: number
  width: number
  height: number
  maxRowWidth: number
}

export function triangleRow(index: number): number {
  return Math.floor((Math.sqrt(8 * index + 1) - 1) / 2)
}

export function triangleBase(row: number): number {
  return (row * (row + 1)) >> 1
}

export function rowCountFor(count: number): number {
  if (count <= 0) return 0
  return Math.ceil((Math.sqrt(8 * count + 1) - 1) / 2)
}

export function layoutMetrics(count: number): LayoutMetrics {
  const rows = rowCountFor(count)
  const maxRowWidth = rows * SPACING_X
  return {
    count,
    rows,
    maxRowWidth,
    width: maxRowWidth + PADDING * 2,
    height: rows * SPACING_Y + PADDING * 2,
  }
}

export function itemsInRow(row: number, count: number): number {
  const start = triangleBase(row)
  if (start >= count) return 0
  return Math.min(row + 1, count - start)
}

export function rowOriginX(row: number, metrics: LayoutMetrics): number {
  const actual = itemsInRow(row, metrics.count)
  return PADDING + (metrics.maxRowWidth - actual * SPACING_X) / 2
}

export function indexPosition(index: number, metrics: LayoutMetrics, seed: number): Vec2 {
  const row = triangleRow(index)
  const col = index - triangleBase(row)
  return {
    x: rowOriginX(row, metrics) + col * SPACING_X + (hash01(seed, index, 1) - 0.5) * JITTER_X,
    y: PADDING + row * SPACING_Y + (hash01(seed, index, 2) - 0.5) * JITTER_Y,
  }
}

export function indexAngle(index: number, seed: number, isNeedle: boolean): number {
  if (isNeedle) return (hash01(seed, index, 7) - 0.5) * 0.5
  return (hash01(seed, index, 3) - 0.5) * 0.9
}

/**
 * Visit hay indices whose rest pose overlaps `rect`.
 * O(visible cells) — never walks the full 100M set.
 */
export function forEachIndexInRect(
  metrics: LayoutMetrics,
  rect: AABB,
  step: number,
  fn: (index: number, restX: number, restY: number) => void,
): void {
  const rowStep = Math.max(1, step)
  const colStep = Math.max(1, step)
  const row0 = clampInt(Math.floor((rect.y - PADDING) / SPACING_Y) - 2, 0, metrics.rows - 1)
  const row1 = clampInt(Math.ceil((rect.y + rect.h - PADDING) / SPACING_Y) + 2, 0, metrics.rows - 1)

  for (let row = row0; row <= row1; row += rowStep) {
    const start = triangleBase(row)
    if (start >= metrics.count) break
    const actual = itemsInRow(row, metrics.count)
    if (actual <= 0) continue
    const x0 = rowOriginX(row, metrics)
    const y = PADDING + row * SPACING_Y
    let col0 = Math.floor((rect.x - x0) / SPACING_X) - 2
    let col1 = Math.ceil((rect.x + rect.w - x0) / SPACING_X) + 2
    col0 = clampInt(col0, 0, actual - 1)
    col1 = clampInt(col1, 0, actual - 1)
    for (let col = col0; col <= col1; col += colStep) {
      const index = start + col
      if (index >= metrics.count) break
      fn(index, x0 + col * SPACING_X, y)
    }
  }
}

export function mountainPath(ctx: CanvasRenderingContext2D, metrics: LayoutMetrics): void {
  const topX = metrics.width / 2
  const topY = PADDING
  const left = PADDING
  const right = metrics.width - PADDING
  const bottom = metrics.height - PADDING
  ctx.beginPath()
  ctx.moveTo(topX, topY)
  ctx.lineTo(right, bottom)
  ctx.lineTo(left, bottom)
  ctx.closePath()
}

function clampInt(value: number, min: number, max: number): number {
  if (max < min) return min
  return Math.max(min, Math.min(max, value | 0))
}
