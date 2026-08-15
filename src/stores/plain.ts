import { defineStore } from 'pinia'
import { createQuestion, type PlainLettersState } from '../domain/game'
import { answerContainsGuess, isSingleCharacter, normalizeCharacter, toCodePoints } from '../domain/normalize'
import { getQuestionStatus } from '../domain/reveal'
import { byCreatedAt, shuffled } from '../domain/order'

const initialState = (): PlainLettersState => {
  const question = createQuestion(null)
  return { questions: [question], questionOrder: [question.id], guessedLetters: [], actionHistory: [], sessionRules: '' }
}

export const usePlainStore = defineStore('plain', {
  state: initialState,
  getters: {
    orderedQuestions: (state) => {
      const order = state.questionOrder?.length ? state.questionOrder : state.questions.map((question) => question.id)
      const ordered = order.map((id) => state.questions.find((question) => question.id === id)).filter((question): question is NonNullable<typeof question> => Boolean(question))
      return [...ordered, ...state.questions.filter((question) => !order.includes(question.id))]
    },
  },
  actions: {
    addQuestion() {
      const question = createQuestion(null)
      this.questions.push(question)
      this.questionOrder.push(question.id)
    },
    removeQuestion(id: string) {
      this.questions = this.questions.filter((question) => question.id !== id)
      this.questionOrder = this.questionOrder.filter((questionId) => questionId !== id)
    },
    randomizeQuestions() { this.questionOrder = shuffled(this.orderedQuestions.map((question) => question.id)) },
    restoreQuestions() { this.questionOrder = byCreatedAt(this.questions).map((question) => question.id) },
    resetGame(clearSessionRules = false) {
      const sessionRules = clearSessionRules ? '' : this.sessionRules
      Object.assign(this, initialState())
      this.sessionRules = sessionRules
    },
    submitLetter(value: string) {
      const guess = value.trim()
      let result: 'hit' | 'miss' | 'invalid' | 'solved' = 'invalid'
      if (isSingleCharacter(guess) && !this.guessedLetters.some((item) => normalizeCharacter(item) === normalizeCharacter(guess))) {
        const hit = this.questions.some((question) => question.answer.trim() && answerContainsGuess(question.answer, guess))
        result = hit ? 'hit' : 'miss'
        if (hit) {
          this.guessedLetters.push(guess)
          const allSolved = this.questions.filter((question) => question.answer.trim()).every((question) =>
            getQuestionStatus(question, this.guessedLetters, this.actionHistory) === 'solved',
          )
          if (allSolved) result = 'solved'
        }
      }
      if (result !== 'invalid') this.actionHistory.push({ id: crypto.randomUUID(), type: 'guess-letter', value: guess, result, createdAt: new Date().toISOString() })
      return result
    },
    submitAnswer(questionId: string, correct: boolean) {
      const question = this.questions.find((item) => item.id === questionId)
      if (!question) return 'invalid' as const
      const result = correct ? 'solved' as const : 'miss' as const
      this.actionHistory.push({ id: crypto.randomUUID(), type: 'guess-answer', questionId, value: '', hostJudgement: correct ? 'correct' : 'incorrect', result, createdAt: new Date().toISOString() })
      return result
    },
    normalizeQuestionControls(questionId: string) {
      const question = this.questions.find((item) => item.id === questionId)
      if (!question) return
      const length = toCodePoints(question.answer).length
      question.characterControls = Array.from({ length }, (_, index) => question.characterControls[index] ?? 'auto')
    },
  },
})
