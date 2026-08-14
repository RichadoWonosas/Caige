import { defineStore } from 'pinia'
import { createPlayer, createQuestion, type BattleRoyaleState, type GameAction } from '../domain/game'
import { standardRuleset } from '../domain/rulesets/standard-v1'
import { byCreatedAt, shuffled } from '../domain/order'
import { toCodePoints } from '../domain/normalize'

function initialState(): BattleRoyaleState {
  const first = createPlayer()
  const second = createPlayer()
  return {
    players: [first, second],
    questions: [createQuestion(first.id), createQuestion(second.id)],
    turnOrder: [first.id, second.id],
    currentActorId: null,
    actionHistory: [],
    phase: 'setup',
    rulesetId: 'standard-v1',
    rulesetVersion: 1,
    rulesetConfig: { allowSelfTarget: false, letterScope: 'all', consumeTurnOnMiss: true, autoWinner: true },
  }
}

export const useBattleStore = defineStore('battle', {
  state: initialState,
  getters: {
    orderedPlayers: (state) => state.turnOrder.map((id) => state.players.find((player) => player.id === id)).filter(Boolean),
    outcomes: (state) => standardRuleset.evaluatePlayers(state, state.rulesetConfig),
    setupViolations: (state) => standardRuleset.validateSetup(state, state.rulesetConfig),
  },
  actions: {
    addPlayer() {
      const player = createPlayer()
      this.players.push(player)
      this.turnOrder.push(player.id)
      this.questions.push(createQuestion(player.id))
    },
    removePlayer(id: string) {
      this.players = this.players.filter((player) => player.id !== id)
      this.questions = this.questions.filter((question) => question.authorPlayerId !== id)
      this.turnOrder = this.turnOrder.filter((playerId) => playerId !== id)
      if (this.currentActorId === id) this.currentActorId = this.turnOrder[0] ?? null
    },
    addQuestion(authorPlayerId: string) { this.questions.push(createQuestion(authorPlayerId)) },
    removeQuestion(id: string) { this.questions = this.questions.filter((question) => question.id !== id) },
    randomizePlayers() { this.turnOrder = shuffled(this.turnOrder) },
    restorePlayers() { this.turnOrder = byCreatedAt(this.players).map((player) => player.id) },
    movePlayer(id: string, direction: -1 | 1) {
      const index = this.turnOrder.indexOf(id)
      const next = index + direction
      if (index < 0 || next < 0 || next >= this.turnOrder.length) return
      ;[this.turnOrder[index], this.turnOrder[next]] = [this.turnOrder[next], this.turnOrder[index]]
    },
    startGame() {
      const violations = standardRuleset.validateSetup(this.$state, this.rulesetConfig)
      if (violations.length) return violations
      this.phase = 'playing'
      const active = standardRuleset.evaluatePlayers(this.$state, this.rulesetConfig).filter((item) => item.status === 'active')
      this.currentActorId = this.turnOrder.find((id) => active.some((item) => item.playerId === id)) ?? null
      return []
    },
    unlockSetup() { this.phase = 'setup' },
    submitAction(input: { type: GameAction['type']; questionId?: string; value: string }) {
      if (!this.currentActorId) return { result: 'invalid' as const, consumedTurn: false }
      const action = {
        id: crypto.randomUUID(), type: input.type, actorPlayerId: this.currentActorId,
        questionId: input.questionId, value: input.value, createdAt: new Date().toISOString(),
      }
      const applied = standardRuleset.applyAction(this.$state, action, this.rulesetConfig)
      this.$patch(applied.state)
      return applied
    },
    resetGame() { Object.assign(this, initialState()) },
    normalizeQuestionControls(questionId: string) {
      const question = this.questions.find((item) => item.id === questionId)
      if (!question) return
      const length = toCodePoints(question.answer).length
      question.characterControls = Array.from({ length }, (_, index) => question.characterControls[index] ?? 'auto')
    },
  },
})
