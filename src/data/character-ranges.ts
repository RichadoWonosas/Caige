import type { CharacterCategory } from '../domain/game'

export const CHARACTER_RANGES: ReadonlyArray<readonly [number, CharacterCategory]> = [
  [0, 'ascii-symbol'], [48, 'digit'], [58, 'ascii-symbol'], [65, 'latin'], [91, 'ascii-symbol'],
  [97, 'latin'], [123, 'ascii-symbol'], [128, 'other-symbol'], [192, 'other-letter'], [215, 'other-symbol'],
  [216, 'other-letter'], [247, 'other-symbol'], [248, 'other-letter'], [8192, 'other-symbol'], [12352, 'kana'],
  [12439, 'other-symbol'], [12449, 'kana'], [12539, 'other-symbol'], [12544, 'other-symbol'], [12592, 'hangul'],
  [12688, 'other-symbol'], [13312, 'cjk'], [19904, 'other-symbol'], [19968, 'cjk'], [40960, 'other-symbol'],
  [44032, 'hangul'], [55216, 'other-symbol'], [63744, 'cjk'], [64256, 'other-symbol'], [65296, 'digit'],
  [65306, 'other-symbol'], [65313, 'latin'], [65339, 'other-symbol'], [65345, 'latin'], [65371, 'other-symbol'],
  [65382, 'kana'], [65440, 'other-symbol'], [131072, 'cjk'], [196608, 'other-symbol'],
]
