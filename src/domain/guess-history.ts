import type { GameAction, PlainAction } from './game'
import { normalizeCharacter, toCodePoints } from './normalize'

type GuessAction = GameAction | PlainAction

function sortBucket(character: string): number {
  if (/^[A-Za-z]$/u.test(character)) return 0
  if (/^[0-9]$/u.test(character)) return 1
  return 2
}

export function sortedLetterGuesses(actions: GuessAction[], preserveCase = false): string[] {
  const unique = new Map<string, string>()
  for (const action of actions) {
    if (action.type !== 'guess-letter' || action.result === 'invalid') continue
    const character = toCodePoints(action.value.trim())[0]
    if (!character) continue
    const identity = normalizeCharacter(character)
    if (!unique.has(identity)) unique.set(identity, preserveCase ? character : /^[A-Za-z]$/u.test(character) ? character.toUpperCase() : character)
  }
  return [...unique.values()].sort((left, right) => {
    const bucketDifference = sortBucket(left) - sortBucket(right)
    if (bucketDifference) return bucketDifference
    const leftPoint = (/^[A-Za-z]$/u.test(left) ? left.toUpperCase() : left).codePointAt(0) ?? 0
    const rightPoint = (/^[A-Za-z]$/u.test(right) ? right.toUpperCase() : right).codePointAt(0) ?? 0
    return leftPoint - rightPoint
  })
}
