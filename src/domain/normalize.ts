import { CHARACTER_ALIAS_GROUPS } from '../data/character-aliases'

const aliasLookup = new Map<string, string>()
for (const [key, aliases] of CHARACTER_ALIAS_GROUPS) {
  const canonical = key.toLocaleLowerCase('en-US').normalize('NFC')
  for (const character of Array.from(`${key}${aliases}`.normalize('NFC'))) {
    aliasLookup.set(character.toLocaleLowerCase('en-US'), canonical)
  }
}

export const toCodePoints = (value: string): string[] => Array.from(value.normalize('NFC'))

export function normalizeCharacter(value: string): string {
  const normalized = toCodePoints(value.trim())[0] ?? ''
  const folded = normalized.toLocaleLowerCase('en-US')
  return aliasLookup.get(folded) ?? folded
}

export function normalizeAnswer(value: string): string {
  return toCodePoints(value)
    .filter((character) => !/\s/u.test(character))
    .map(normalizeCharacter)
    .join('')
}

export const isSingleCharacter = (value: string): boolean => toCodePoints(value.trim()).length === 1

export function answerContainsGuess(answer: string, guess: string): boolean {
  const needle = normalizeCharacter(guess)
  return toCodePoints(answer).some((character) => normalizeCharacter(character) === needle)
}

export const aliasGroupCount = CHARACTER_ALIAS_GROUPS.length
