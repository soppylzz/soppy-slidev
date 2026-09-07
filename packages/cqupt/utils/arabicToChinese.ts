const DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"] as const
const UNITS = ["", "十", "百", "千"] as const

/**
 * The Chinese reading of one 4-digit group (0–9999), e.g. 1234 → 一千二百三十四
 * or 1001 → 一千零一; an empty string when the group is 0. The tens 1 always
 * reads 一十 here — the leading 一 of the whole number is dropped by the caller.
 */
function groupToChinese(group: number): string {
  let out = ""
  let pendingZero = false
  for (let pos = 3; pos >= 0; pos--) {
    const digit = Math.floor(group / 10 ** pos) % 10
    if (digit === 0) {
      if (out) pendingZero = true
      continue
    }
    if (pendingZero) {
      out += "零"
      pendingZero = false
    }
    out += DIGITS[digit] + UNITS[pos]
  }
  return out
}

/**
 * Read a non-negative integer in Chinese numerals, e.g. 21 → 二十一,
 * 101 → 一百零一, 10001 → 一万零一. Uses the lowercase characters
 * 零一二…九 with units 十/百/千 and group units 万/亿 (10¹² reads 万亿);
 * 10–19 reads 十X per the common convention.
 *
 * @param value a non-negative safe integer
 * @returns the Chinese numeral reading
 * @throws RangeError for negative, non-integer, or non-safe values
 */
export function arabicToChinese(value: number): string {
  if (!Number.isInteger(value) || value < 0 || value > Number.MAX_SAFE_INTEGER) {
    throw new RangeError(`expected a non-negative safe integer, got ${value}`)
  }
  if (value === 0) return "零"

  // 4-digit groups, least significant first: group i carries the unit 万 (odd i)
  // or 亿 (even i ≥ 2), smaller unit first, so 10¹² composes as 万亿
  const groups: number[] = []
  for (let n = value; n > 0; n = Math.floor(n / 10000)) groups.push(n % 10000)

  let out = ""
  let pendingZero = false
  for (let i = groups.length - 1; i >= 0; i--) {
    const group = groups[i]
    if (group === 0) {
      if (out) pendingZero = true
      continue
    }
    // a connector 零 is required when a lower group starts below its thousands
    // digit (一万零一) or when whole zero groups sit in between (一亿零一)
    if (out && (pendingZero || group < 1000)) out += "零"
    pendingZero = false
    out += groupToChinese(group) + (i % 2 ? "万" : "") + "亿".repeat(Math.floor(i / 2))
  }
  // 10–19 reads 十X rather than 一十X, but only at the very start of the number
  // (elsewhere the 一 is kept: 110 reads 一百一十, 10010 reads 一万零一十)
  return out.startsWith("一十") ? out.slice(1) : out
}
