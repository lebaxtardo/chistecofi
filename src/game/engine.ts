import { fitZoom, screenToWorld, viewRect } from './camera'
import {
  forEachIndexInRect,
  indexAngle,
  indexPosition,
  layoutMetrics,
  mountainPath,
  SPACING_X,
  SPACING_Y,
  type LayoutMetrics,
} from './layout'
import {
  DPR_CAP,
  MAX_SPRITES,
  MAX_ZOOM,
  MIN_SPRITE_PIXELS,
  MINIMAP_SIZE,
  NEEDLE_DRAG_TO_WIN,
  PAN_SPEED,
  PICK_RADIUS,
  SCATTER_FORCE,
} from './levels'
import { clamp, hash01, lerp } from './math'
import { createSpriteAtlas, type SpriteAtlas } from './sprites'
import type {
  AABB,
  Camera,
  DragKind,
  EngineCallbacks,
  EngineSnapshot,
  LevelConfig,
  LooseItem,
  Vec2,
} from './types'

type Pointer = {
  id: number
  x: number
  y: number
}

type DragSession = {
  kind: Exclude<DragKind, 'none'>
  pointerId: number
  lastX: number
  lastY: number
  index: number
  grabX: number
  grabY: number
  startNeedleX: number
  startNeedleY: number
}

/**
 * Canvas engine: the haystack is a triangular index space.
 * Positions are hashed from (seed, index) so expert (1e8 straws) never
 * allocates a particle array. Only moved items and the needle id live in RAM.
 */
export class GameEngine {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private callbacks: EngineCallbacks
  private config: LevelConfig
  private seed: number
  private metrics: LayoutMetrics
  private atlas: SpriteAtlas
  private hayPattern: CanvasPattern | null
  private cam: Camera
  private minZoom = 0.05
  private didFit = false
  private cssW = 1
  private cssH = 1
  private loose = new Map<number, LooseItem>()
  private needleId = 0
  private found = false
  private dragging: DragSession | null = null
  private pointers = new Map<number, Pointer>()
  private pinchDist = 0
  private keys = new Set<string>()
  private raf = 0
  private lastTs = 0
  private startedAt = 0
  private observer: ResizeObserver
  private spriteMode = true
  private needleInView = false
  private destroyed = false

  constructor(
    canvas: HTMLCanvasElement,
    config: LevelConfig,
    seed: number,
    callbacks: EngineCallbacks,
  ) {
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) throw new Error('Canvas 2D is not available')

    this.canvas = canvas
    this.ctx = ctx
    this.callbacks = callbacks
    this.config = config
    this.seed = seed
    this.metrics = layoutMetrics(config.hayCount)
    this.atlas = createSpriteAtlas()
    this.hayPattern = ctx.createPattern(this.atlas.hayTile, 'repeat')
    this.needleId = Math.floor(hash01(seed, 0x0dd1e, 9) * config.hayCount)
    this.cam = { x: this.metrics.width / 2, y: this.metrics.height * 0.58, zoom: 1 }
    this.startedAt = performance.now()

    this.observer = new ResizeObserver(() => this.resize())
    this.observer.observe(canvas.parentElement ?? canvas)

    canvas.addEventListener('pointerdown', this.onPointerDown)
    canvas.addEventListener('pointermove', this.onPointerMove)
    canvas.addEventListener('pointerup', this.onPointerUp)
    canvas.addEventListener('pointercancel', this.onPointerUp)
    canvas.addEventListener('wheel', this.onWheel, { passive: false })
    canvas.addEventListener('contextmenu', this.onContextMenu)
    canvas.addEventListener('dblclick', this.onDblClick)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)

    this.resize()
    this.raf = requestAnimationFrame(this.tick)
  }

  destroy(): void {
    this.destroyed = true
    cancelAnimationFrame(this.raf)
    this.observer.disconnect()
    this.canvas.removeEventListener('pointerdown', this.onPointerDown)
    this.canvas.removeEventListener('pointermove', this.onPointerMove)
    this.canvas.removeEventListener('pointerup', this.onPointerUp)
    this.canvas.removeEventListener('pointercancel', this.onPointerUp)
    this.canvas.removeEventListener('wheel', this.onWheel)
    this.canvas.removeEventListener('contextmenu', this.onContextMenu)
    this.canvas.removeEventListener('dblclick', this.onDblClick)
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
  }

  snapshot(): EngineSnapshot {
    return {
      levelId: this.config.id,
      hayCount: this.config.hayCount,
      movedCount: this.loose.size,
      zoom: this.cam.zoom,
      proximity: this.proximity(),
      dragging: this.dragging?.kind ?? 'none',
      foundNeedle: this.found,
      needleInView: this.needleInView,
      elapsedMs: performance.now() - this.startedAt,
      spriteMode: this.spriteMode,
    }
  }

  private tick = (now: number): void => {
    if (this.destroyed) return
    const dt = Math.min(0.05, (now - this.lastTs) / 1000 || 0.016)
    this.lastTs = now
    this.panWithKeys(dt)
    this.draw(now)
    this.callbacks.onSnapshot(this.snapshot())
    this.raf = requestAnimationFrame(this.tick)
  }

  private resize(): void {
    const parent = this.canvas.parentElement
    const rect = parent?.getBoundingClientRect() ?? this.canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
    this.cssW = Math.max(1, rect.width)
    this.cssH = Math.max(1, rect.height)
    this.canvas.width = Math.floor(this.cssW * dpr)
    this.canvas.height = Math.floor(this.cssH * dpr)
    this.canvas.style.width = `${this.cssW}px`
    this.canvas.style.height = `${this.cssH}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    this.minZoom = fitZoom(this.metrics.width, this.metrics.height, this.cssW, this.cssH)
    if (!this.didFit) {
      this.cam.zoom = this.minZoom
      this.didFit = true
    } else {
      this.cam.zoom = clamp(this.cam.zoom, this.minZoom, MAX_ZOOM)
    }
    this.clampCamera()
  }

  private panWithKeys(dt: number): void {
    if (this.keys.size === 0) return
    const speed = (PAN_SPEED / this.cam.zoom) * dt
    if (this.keys.has('arrowleft') || this.keys.has('a')) this.cam.x -= speed
    if (this.keys.has('arrowright') || this.keys.has('d')) this.cam.x += speed
    if (this.keys.has('arrowup') || this.keys.has('w')) this.cam.y -= speed
    if (this.keys.has('arrowdown') || this.keys.has('s')) this.cam.y += speed
    this.clampCamera()
  }

  private worldOf(event: PointerEvent | WheelEvent | MouseEvent): Vec2 {
    const rect = this.canvas.getBoundingClientRect()
    return screenToWorld(
      this.cam,
      this.cssW,
      this.cssH,
      event.clientX - rect.left,
      event.clientY - rect.top,
    )
  }

  private onContextMenu = (event: Event): void => {
    event.preventDefault()
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    const key = event.key.toLowerCase()
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
      event.preventDefault()
    }
    this.keys.add(key)
    if (event.key === '+' || event.key === '=') this.zoomAt(this.cssW / 2, this.cssH / 2, 1.12)
    if (event.key === '-' || event.key === '_') this.zoomAt(this.cssW / 2, this.cssH / 2, 1 / 1.12)
  }

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.key.toLowerCase())
  }

  private onWheel = (event: WheelEvent): void => {
    event.preventDefault()
    const rect = this.canvas.getBoundingClientRect()
    const factor = event.deltaY > 0 ? 1 / 1.12 : 1.12
    this.zoomAt(event.clientX - rect.left, event.clientY - rect.top, factor)
  }

  private zoomAt(sx: number, sy: number, factor: number): void {
    const before = screenToWorld(this.cam, this.cssW, this.cssH, sx, sy)
    this.cam.zoom = clamp(this.cam.zoom * factor, this.minZoom, MAX_ZOOM)
    const after = screenToWorld(this.cam, this.cssW, this.cssH, sx, sy)
    this.cam.x += before.x - after.x
    this.cam.y += before.y - after.y
    this.clampCamera()
  }

  private onPointerDown = (event: PointerEvent): void => {
    this.canvas.setPointerCapture(event.pointerId)
    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    this.pointers.set(event.pointerId, { id: event.pointerId, x, y })

    if (this.pointers.size === 2) {
      this.dragging = null
      this.pinchDist = this.pointerDistance()
      return
    }

    const world = this.worldOf(event)
    const canPick = this.spriteMode && event.button !== 1 && event.button !== 2
    const hit = canPick ? this.hitTest(world.x, world.y) : -1

    if (hit >= 0) {
      const item = this.ensureLoose(hit)
      this.dragging = {
        kind: hit === this.needleId ? 'needle' : 'straw',
        pointerId: event.pointerId,
        lastX: x,
        lastY: y,
        index: hit,
        grabX: world.x - item.x,
        grabY: world.y - item.y,
        startNeedleX: item.x,
        startNeedleY: item.y,
      }
      return
    }

    this.dragging = {
      kind: 'pan',
      pointerId: event.pointerId,
      lastX: x,
      lastY: y,
      index: -1,
      grabX: 0,
      grabY: 0,
      startNeedleX: 0,
      startNeedleY: 0,
    }
  }

  private onPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const pointer = this.pointers.get(event.pointerId)
    if (pointer) {
      pointer.x = x
      pointer.y = y
    }

    if (this.pointers.size === 2) {
      const dist = this.pointerDistance()
      if (this.pinchDist > 0 && dist > 0) {
        this.zoomAt(this.cssW / 2, this.cssH / 2, dist / this.pinchDist)
      }
      this.pinchDist = dist
      return
    }

    const drag = this.dragging
    if (!drag || drag.pointerId !== event.pointerId) return

    if (drag.kind === 'pan') {
      this.cam.x -= (x - drag.lastX) / this.cam.zoom
      this.cam.y -= (y - drag.lastY) / this.cam.zoom
      drag.lastX = x
      drag.lastY = y
      this.clampCamera()
      return
    }

    const world = this.worldOf(event)
    const item = this.loose.get(drag.index)
    if (!item) return
    item.x = world.x - drag.grabX
    item.y = world.y - drag.grabY

    if (drag.kind === 'needle' && !this.found) {
      const dist = Math.hypot(item.x - drag.startNeedleX, item.y - drag.startNeedleY)
      if (dist >= NEEDLE_DRAG_TO_WIN) this.markFound()
    }
  }

  private onPointerUp = (event: PointerEvent): void => {
    this.pointers.delete(event.pointerId)
    if (this.dragging?.pointerId === event.pointerId) this.dragging = null
    this.pinchDist = this.pointers.size === 2 ? this.pointerDistance() : 0
  }

  private onDblClick = (event: MouseEvent): void => {
    if (!this.spriteMode) return
    const world = this.worldOf(event)
    this.scatter(world.x, world.y)
  }

  private pointerDistance(): number {
    const pts = [...this.pointers.values()]
    if (pts.length < 2) return 0
    const a = pts[0]
    const b = pts[1]
    if (!a || !b) return 0
    return Math.hypot(a.x - b.x, a.y - b.y)
  }

  private markFound(): void {
    this.found = true
    this.callbacks.onFound()
  }

  private position(index: number): Vec2 {
    return indexPosition(index, this.metrics, this.seed)
  }

  private ensureLoose(index: number): LooseItem {
    const existing = this.loose.get(index)
    if (existing) return existing
    const pos = this.position(index)
    const item: LooseItem = {
      x: pos.x,
      y: pos.y,
      angle: indexAngle(index, this.seed, index === this.needleId),
    }
    this.loose.set(index, item)
    return item
  }

  private hitTest(wx: number, wy: number): number {
    const radius = PICK_RADIUS
    const rect: AABB = { x: wx - radius, y: wy - radius, w: radius * 2, h: radius * 2 }
    let best = -1
    let bestD = radius * radius

    forEachIndexInRect(this.metrics, rect, 1, (index) => {
      if (this.loose.has(index)) return
      const pos = this.position(index)
      const d = (pos.x - wx) ** 2 + (pos.y - wy) ** 2
      if (d <= bestD) {
        bestD = d
        best = index
      }
    })

    for (const [index, item] of this.loose) {
      if (this.dragging?.index === index) continue
      const d = (item.x - wx) ** 2 + (item.y - wy) ** 2
      if (d <= bestD) {
        bestD = d
        best = index
      }
    }

    return best
  }

  private scatter(wx: number, wy: number): void {
    const radius = clamp(56 / this.cam.zoom, 22, 90)
    const rect: AABB = { x: wx - radius, y: wy - radius, w: radius * 2, h: radius * 2 }
    forEachIndexInRect(this.metrics, rect, 1, (index) => {
      const item = this.ensureLoose(index)
      const dx = item.x - wx
      const dy = item.y - wy
      const dist = Math.hypot(dx, dy) || 1
      if (dist > radius) return
      const force = (1 - dist / radius) * SCATTER_FORCE
      item.x += (dx / dist) * force
      item.y += (dy / dist) * force
    })
  }

  private proximity(): number {
    const needle = this.loose.get(this.needleId) ?? this.position(this.needleId)
    const dist = Math.hypot(this.cam.x - needle.x, this.cam.y - needle.y)
    const worldSpan = Math.hypot(this.metrics.width, this.metrics.height)
    const range = worldSpan * (this.config.id === 'easy' ? 0.55 : this.config.id === 'medium' ? 0.28 : 0.12)
    return 1 - clamp(dist / range, 0, 1)
  }

  private clampCamera(): void {
    const halfW = this.cssW / this.cam.zoom / 2
    const halfH = this.cssH / this.cam.zoom / 2
    const pad = 80
    this.cam.x = clamp(this.cam.x, -pad + halfW, this.metrics.width + pad - halfW)
    this.cam.y = clamp(this.cam.y, -pad + halfH, this.metrics.height + pad - halfH)
    if (this.metrics.width < this.cssW / this.cam.zoom) this.cam.x = this.metrics.width / 2
    if (this.metrics.height < this.cssH / this.cam.zoom) this.cam.y = this.metrics.height / 2
  }

  private draw(now: number): void {
    const ctx = this.ctx
    const { cssW: w, cssH: h } = this
    ctx.clearRect(0, 0, w, h)
    this.drawBackdrop(ctx, w, h)

    ctx.save()
    ctx.translate(w / 2, h / 2)
    ctx.scale(this.cam.zoom, this.cam.zoom)
    ctx.translate(-this.cam.x, -this.cam.y)

    const view = viewRect(this.cam, w, h)
    const est = (view.w / SPACING_X) * (view.h / SPACING_Y)
    const step = est > MAX_SPRITES ? Math.ceil(Math.sqrt(est / MAX_SPRITES)) : 1
    const cellPx = (SPACING_X * this.cam.zoom) / step
    this.spriteMode = cellPx >= MIN_SPRITE_PIXELS && est / (step * step) <= MAX_SPRITES * 1.4

    this.drawGround(ctx)
    if (this.spriteMode) {
      this.drawSprites(ctx, view, step, now)
    } else {
      this.drawSilhouette(ctx, view)
      this.needleInView = false
    }

    ctx.restore()
    this.drawMinimap(ctx, w, h)
    this.drawVignette(ctx, w, h)
  }

  private drawBackdrop(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const sky = ctx.createLinearGradient(0, 0, 0, h)
    sky.addColorStop(0, '#3a2414')
    sky.addColorStop(0.45, '#24160d')
    sky.addColorStop(1, '#120c08')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, w, h)

    const lamp = ctx.createRadialGradient(w * 0.5, h * 0.12, 20, w * 0.5, h * 0.2, w * 0.55)
    lamp.addColorStop(0, 'rgba(240, 199, 94, 0.18)')
    lamp.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = lamp
    ctx.fillRect(0, 0, w, h)
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#2c1c10'
    ctx.fillRect(-40, this.metrics.height - 90, this.metrics.width + 80, 140)
    ctx.fillStyle = '#3a2616'
    ctx.beginPath()
    ctx.ellipse(this.metrics.width / 2, this.metrics.height - 70, this.metrics.maxRowWidth * 0.55, 36, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  private drawSilhouette(ctx: CanvasRenderingContext2D, view: AABB): void {
    const { width, height } = this.metrics
    const shade = ctx.createLinearGradient(width / 2, 40, width / 2, height)
    shade.addColorStop(0, '#f0d36a')
    shade.addColorStop(0.55, '#d4a017')
    shade.addColorStop(1, '#8a5a12')
    mountainPath(ctx, this.metrics)
    ctx.fillStyle = shade
    ctx.fill()
    if (this.hayPattern) {
      ctx.save()
      mountainPath(ctx, this.metrics)
      ctx.clip()
      ctx.globalAlpha = 0.28
      ctx.fillStyle = this.hayPattern
      ctx.fillRect(view.x, view.y, view.w, view.h)
      ctx.restore()
    }
    ctx.strokeStyle = 'rgba(80, 48, 12, 0.55)'
    ctx.lineWidth = Math.max(2, 8 / this.cam.zoom)
    mountainPath(ctx, this.metrics)
    ctx.stroke()
  }

  private drawSprites(ctx: CanvasRenderingContext2D, view: AABB, step: number, now: number): void {
    const pad = 24
    const vis: AABB = { x: view.x - pad, y: view.y - pad, w: view.w + pad * 2, h: view.h + pad * 2 }
    const size = 10 + Math.min(4, step)
    this.needleInView = false

    forEachIndexInRect(this.metrics, vis, step, (index) => {
      if (this.loose.has(index) || index === this.needleId) return
      const pos = this.position(index)
      this.drawStraw(ctx, pos.x, pos.y, indexAngle(index, this.seed, false), index, size)
    })

    if (!this.loose.has(this.needleId)) {
      const pos = this.position(this.needleId)
      if (this.inView(pos, vis)) {
        this.drawNeedle(ctx, pos.x, pos.y, indexAngle(this.needleId, this.seed, true), now, false)
        this.needleInView = true
      }
    }

    for (const [index, item] of this.loose) {
      if (!this.inView(item, vis)) continue
      if (index === this.needleId) {
        this.drawNeedle(ctx, item.x, item.y, item.angle, now, this.dragging?.index === index)
        this.needleInView = true
      } else {
        this.drawStraw(ctx, item.x, item.y, item.angle, index, size)
      }
    }
  }

  private inView(item: Vec2, vis: AABB): boolean {
    return item.x > vis.x && item.x < vis.x + vis.w && item.y > vis.y && item.y < vis.y + vis.h
  }

  private drawStraw(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    index: number,
    size: number,
  ): void {
    const sprite = this.atlas.straws[index % this.atlas.straws.length]
    if (!sprite) return
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    ctx.drawImage(sprite, -size, -size * 0.38, size * 2, size * 0.75)
    ctx.restore()
  }

  private drawNeedle(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    angle: number,
    now: number,
    held: boolean,
  ): void {
    const glint = 0.55 + Math.sin(now / 220) * 0.45
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(angle)
    if (held) {
      ctx.shadowColor = 'rgba(230, 236, 255, 0.9)'
      ctx.shadowBlur = 12
    }
    ctx.globalAlpha = lerp(0.85, 1, glint)
    ctx.drawImage(this.atlas.needle, -14, -5, 28, 10)
    ctx.restore()
  }

  private drawMinimap(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const size = MINIMAP_SIZE
    const x = w - size - 16
    const y = h - size - 16
    ctx.save()
    ctx.globalAlpha = 0.92
    ctx.fillStyle = 'rgba(18, 12, 8, 0.72)'
    ctx.strokeStyle = 'rgba(196, 163, 90, 0.45)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(x, y, size, size, 10)
    ctx.fill()
    ctx.stroke()

    const scale = Math.min((size - 20) / this.metrics.width, (size - 20) / this.metrics.height)
    const ox = x + (size - this.metrics.width * scale) / 2
    const oy = y + (size - this.metrics.height * scale) / 2 + 4

    ctx.translate(ox, oy)
    ctx.scale(scale, scale)
    mountainPath(ctx, this.metrics)
    ctx.fillStyle = '#c99622'
    ctx.fill()

    const view = viewRect(this.cam, w, h)
    ctx.strokeStyle = '#f0c75e'
    ctx.lineWidth = 2 / scale
    ctx.strokeRect(view.x, view.y, view.w, view.h)
    ctx.restore()
  }

  private drawVignette(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.72)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(8, 5, 2, 0.42)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }
}

