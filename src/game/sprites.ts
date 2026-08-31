const STRAW_COLORS = ['#e6c14a', '#d4a017', '#c4922a', '#f0d36a', '#b8860b', '#daa520']

export type SpriteAtlas = {
  straws: HTMLCanvasElement[]
  needle: HTMLCanvasElement
  hayTile: HTMLCanvasElement
}

function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  return canvas
}

function drawStraw(ctx: CanvasRenderingContext2D, color: string, accent: string): void {
  ctx.clearRect(0, 0, 32, 12)
  ctx.strokeStyle = color
  ctx.lineWidth = 3.4
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(3, 6)
  ctx.quadraticCurveTo(16, 2.5, 29, 6)
  ctx.stroke()
  ctx.strokeStyle = accent
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(5, 7.2)
  ctx.quadraticCurveTo(16, 4.4, 27, 7)
  ctx.stroke()
}

function drawNeedleSprite(ctx: CanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, 36, 12)
  ctx.strokeStyle = '#b8bec8'
  ctx.lineWidth = 1.6
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(7, 6)
  ctx.lineTo(33, 6)
  ctx.stroke()
  ctx.strokeStyle = '#e8ecf2'
  ctx.lineWidth = 0.7
  ctx.beginPath()
  ctx.moveTo(7, 5.4)
  ctx.lineTo(32, 5.4)
  ctx.stroke()
  ctx.strokeStyle = '#9aa3b0'
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.arc(5.2, 6, 2.3, 0, Math.PI * 2)
  ctx.stroke()
}

function drawHayTile(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = '#c99622'
  ctx.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 220; i += 1) {
    const x = Math.random() * 128
    const y = Math.random() * 128
    const len = 8 + Math.random() * 18
    const ang = (Math.random() - 0.5) * 0.8
    ctx.strokeStyle = STRAW_COLORS[i % STRAW_COLORS.length] ?? '#d4a017'
    ctx.globalAlpha = 0.55 + Math.random() * 0.4
    ctx.lineWidth = 1 + Math.random() * 1.6
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

export function createSpriteAtlas(): SpriteAtlas {
  const straws: HTMLCanvasElement[] = STRAW_COLORS.map((color, i) => {
    const canvas = makeCanvas(32, 12)
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const accent = STRAW_COLORS[(i + 3) % STRAW_COLORS.length] ?? '#f0d36a'
      drawStraw(ctx, color, accent)
    }
    return canvas
  })

  const needle = makeCanvas(36, 12)
  const needleCtx = needle.getContext('2d')
  if (needleCtx) drawNeedleSprite(needleCtx)

  const hayTile = makeCanvas(128, 128)
  const tileCtx = hayTile.getContext('2d')
  if (tileCtx) drawHayTile(tileCtx)

  return { straws, needle, hayTile }
}
