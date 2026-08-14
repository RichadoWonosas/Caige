import type { GameAction, PlainAction, Question, QuestionStatus } from './game'
import { normalizeAnswer, normalizeCharacter, toCodePoints } from './normalize'

export function guessedForQuestion(actions: Array<GameAction | PlainAction>, questionId: string): string[] {
  return actions
    .filter((action) => action.type === 'guess-letter' && (!action.questionId || action.questionId === questionId))
    .map((action) => action.value)
}

export function directAnswerSolved(actions: Array<GameAction | PlainAction>, question: Question): boolean {
  return actions.some((action) => action.type === 'guess-answer' && action.questionId === question.id && action.result === 'solved')
}

export function getQuestionStatus(question: Question, guesses: string[], actions: Array<GameAction | PlainAction>): QuestionStatus {
  if (question.hostStatusOverride === 'solved' || directAnswerSolved(actions, question)) return 'solved'
  const answerCharacters = toCodePoints(question.answer)
  if (!answerCharacters.some((character) => !/\s/u.test(character))) return 'active'
  const guessed = new Set(guesses.map(normalizeCharacter))
  const allRevealed = answerCharacters.every((character, index) => {
    if (/\s/u.test(character)) return true
    const control = question.characterControls[index] ?? 'auto'
    return control === 'show' || (control !== 'hide' && guessed.has(normalizeCharacter(character)))
  })
  return allRevealed ? 'solved' : 'active'
}

export function revealQuestion(question: Question, guesses: string[], actions: Array<GameAction | PlainAction>): Array<{ character: string; revealed: boolean }> {
  const status = getQuestionStatus(question, guesses, actions)
  const guessed = new Set(guesses.map(normalizeCharacter))
  return toCodePoints(question.answer).map((character, index) => {
    if (/\s/u.test(character)) return { character, revealed: true }
    if (status === 'solved') return { character, revealed: true }
    const control = question.characterControls[index] ?? 'auto'
    if (control === 'hide') return { character, revealed: false }
    if (control === 'show') return { character, revealed: true }
    return { character, revealed: guessed.has(normalizeCharacter(character)) }
  })
}

export function answerMatches(question: Question, value: string): boolean {
  return normalizeAnswer(question.answer) === normalizeAnswer(value) && normalizeAnswer(value).length > 0
}
