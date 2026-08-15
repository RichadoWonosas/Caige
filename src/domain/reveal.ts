import type { GameAction, PlainAction, Question, QuestionStatus } from './game'
import { guessRevealsCharacter, toCodePoints } from './normalize'

export interface RevealedCharacter {
  character: string
  revealed: boolean
  guessed: boolean
}

export function guessedForQuestion(actions: Array<GameAction | PlainAction>, questionId: string): string[] {
  return actions
    .filter((action) => action.type === 'guess-letter' && (!action.questionId || action.questionId === questionId))
    .map((action) => action.value)
}

export function directAnswerSolved(actions: Array<GameAction | PlainAction>, question: Question): boolean {
  return actions.some((action) => action.type === 'guess-answer' && action.questionId === question.id && action.result === 'solved')
}

export function getQuestionStatus(question: Question, guesses: string[], actions: Array<GameAction | PlainAction>): QuestionStatus {
  if (directAnswerSolved(actions, question)) return 'solved'
  const answerCharacters = toCodePoints(question.answer)
  if (!answerCharacters.some((character) => !/\s/u.test(character))) return 'active'
  const allRevealed = answerCharacters.every((character, index) => {
    if (/\s/u.test(character)) return true
    const control = question.characterControls[index] ?? 'auto'
    return control === 'show' || (control !== 'hide' && guesses.some((guess) => guessRevealsCharacter(character, guess)))
  })
  return allRevealed ? 'solved' : 'active'
}

export function revealQuestion(question: Question, guesses: string[], actions: Array<GameAction | PlainAction>): RevealedCharacter[] {
  const status = getQuestionStatus(question, guesses, actions)
  return toCodePoints(question.answer).map((character, index) => {
    const guessed = guesses.some((guess) => guessRevealsCharacter(character, guess))
    if (/\s/u.test(character)) return { character, revealed: true, guessed: false }
    if (status === 'solved') return { character, revealed: true, guessed }
    const control = question.characterControls[index] ?? 'auto'
    if (control === 'hide') return { character, revealed: false, guessed }
    if (control === 'show') return { character, revealed: true, guessed }
    return { character, revealed: guessed, guessed }
  })
}
