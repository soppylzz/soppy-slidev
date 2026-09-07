/** deterministic 32-bit hash scatter of a seed, so neighboring uids land apart */
export function scatter(seed: number): number {
  let h = Math.imul(seed ^ (seed >>> 16), 0x45d9f3b)
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b)
  return (h ^ (h >>> 16)) >>> 0
}

/** pick from a list by a scattered seed — stable per seed, spread across the list */
export function pickBySeed<T>(seed: number, list: readonly T[]): T | undefined {
  if (!list.length) return undefined
  return list[scatter(seed) % list.length]
}
