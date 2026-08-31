/** Deterministic 0..1 hash. Used so 100M straws never need stored positions. */
export function hash01(seed: number, i: number, lane = 0): number {
  let x = Math.imul(i ^ (lane * 0x9e3779b9), 0x9e3779b1) ^ seed
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b)
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35)
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296
}

export function createSeed(): number {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && 'getRandomValues' in cryptoObj) {
    const buf = new Uint32Array(1)
    cryptoObj.getRandomValues(buf)
    return buf[0] ?? (Math.random() * 0xffffffff) >>> 0
  }
  return (Math.random() * 0xffffffff) >>> 0
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
