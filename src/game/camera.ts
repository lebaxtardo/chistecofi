import type { AABB, Camera } from './types'

export function viewRect(cam: Camera, cssW: number, cssH: number): AABB {
  const w = cssW / cam.zoom
  const h = cssH / cam.zoom
  return {
    x: cam.x - w / 2,
    y: cam.y - h / 2,
    w,
    h,
  }
}

export function worldToScreen(
  cam: Camera,
  cssW: number,
  cssH: number,
  wx: number,
  wy: number,
): { x: number; y: number } {
  return {
    x: (wx - cam.x) * cam.zoom + cssW / 2,
    y: (wy - cam.y) * cam.zoom + cssH / 2,
  }
}

export function screenToWorld(
  cam: Camera,
  cssW: number,
  cssH: number,
  sx: number,
  sy: number,
): { x: number; y: number } {
  return {
    x: (sx - cssW / 2) / cam.zoom + cam.x,
    y: (sy - cssH / 2) / cam.zoom + cam.y,
  }
}

export function fitZoom(worldW: number, worldH: number, cssW: number, cssH: number): number {
  if (worldW <= 0 || worldH <= 0 || cssW <= 0 || cssH <= 0) return 1
  return Math.min(cssW / worldW, cssH / worldH) * 0.9
}
