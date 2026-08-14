import { defineStore } from 'pinia'
import { createQuestion, type PlainLettersState } from '../domain/game'
import { answerContainsGuess, isSingleCharacter, normalizeCharacter, toCodePoints } from '../domain/normalize'
import { answerMatches, getQuestionStatus } from '../domain/reveal'
import { byCreatedAt, shuffled } from '../domain/order'

const initialState = (): PlainLettersState => ({ questions: [createQuestion(null)], guessedLetters: [], actionHistory: [] })

export const usePlainStore = defineStore('plain', {
  state: initialState,
  actions: {
    addQuestion() { this.questions.push(createQuestion(null)) },
    removeQuestion(id: string) { this.questions = this.questions.filter((question) => question.id !== id) },
    randomizeQuestions() { this.questions = shuffled(this.questions) },
    restoreQuestions() { this.questions = byCreatedAt(this.questions) },
    resetGame() { Object.assign(this, initialState()) },
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
      this.actionHistory.push({ id: crypto.randomUUID(), type: 'guess-letter', value: guess, result, createdAt: new Date().toISOString() })
      return result
    },
    submitAnswer(questionId: string, value: string) {
      const question = this.questions.find((item) => item.id === questionId)
      const result = question && answerMatches(question, value) ? 'solved' : 'miss'
      this.actionHistory.push({ id: crypto.randomUUID(), type: 'guess-answer', questionId, value, result, createdAt: new Date().toISOString() })
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
