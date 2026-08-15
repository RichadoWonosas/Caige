import { CHARACTER_ALIAS_GROUPS } from '../data/character-aliases'

const aliasGroupsByKey = new Map<string, ReadonlySet<string>>()
for (const [key, aliases] of CHARACTER_ALIAS_GROUPS) {
  const lookupKey = key.toLocaleLowerCase('en-US').normalize('NFC')
  aliasGroupsByKey.set(lookupKey, new Set(Array.from(`${key}${aliases}`.normalize('NFC'))))
}

export const toCodePoints = (value: string): string[] => Array.from(value.normalize('NFC'))

export function normalizeCharacter(value: string): string {
  const normalized = toCodePoints(value.trim())[0] ?? ''
  return /^[A-Z]$/u.test(normalized) ? normalized.toLowerCase() : normalized
}

export function normalizeAnswer(value: string): string {
  return toCodePoints(value)
    .filter((character) => !/\s/u.test(character))
    .map(normalizeCharacter)
    .join('')
}

export const isSingleCharacter = (value: string): boolean => toCodePoints(value.trim()).length === 1

export function expandGuessCharacter(value: string): ReadonlySet<string> {
  const character = toCodePoints(value.trim())[0] ?? ''
  if (!character) return new Set()
  const aliases = aliasGroupsByKey.get(character.toLocaleLowerCase('en-US'))
  return aliases ? new Set([character, ...aliases]) : new Set([character])
}

export function guessRevealsCharacter(character: string, guess: string): boolean {
  return expandGuessCharacter(guess).has(character.normalize('NFC'))
}

export function answerContainsGuess(answer: string, guess: string): boolean {
  return toCodePoints(answer).some((character) => guessRevealsCharacter(character, guess))
}

export const aliasGroupCount = CHARACTER_ALIAS_GROUPS.length
