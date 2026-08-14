import type { CharacterCategory } from './game'
import { CHARACTER_RANGES } from '../data/character-ranges'

export function classifyCharacter(value: string): CharacterCategory {
  const codePoint = Array.from(value.normalize('NFC'))[0]?.codePointAt(0) ?? 0
  let category: CharacterCategory = 'ascii-symbol'
  for (const [threshold, nextCategory] of CHARACTER_RANGES) {
    if (codePoint < threshold) break
    category = nextCategory
  }
  return category
}
