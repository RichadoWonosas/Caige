import type {
  ActionResult,
  BattleRoyaleState,
  GameAction,
  GameOutcome,
  GameRuleset,
  PlayerOutcome,
  RuleViolation,
  StandardRulesetConfig,
} from '../game'
import { answerContainsGuess, isSingleCharacter, normalizeCharacter, toCodePoints } from '../normalize'
import { getQuestionStatus, guessedForQuestion } from '../reveal'

function questionGuesses(state: BattleRoyaleState, questionId: string): string[] {
  return guessedForQuestion(state.actionHistory, questionId)
}

function cloneState(state: BattleRoyaleState): BattleRoyaleState {
  return {
    ...state,
    players: state.players.map((player) => ({ ...player })),
    questions: state.questions.map((question) => ({ ...question, characterControls: [...question.characterControls] })),
    questionOrder: [...state.questionOrder],
    turnOrder: [...state.turnOrder],
    actionHistory: state.actionHistory.map((action) => ({ ...action })),
    rulesetConfig: { ...state.rulesetConfig },
  }
}

export const standardRuleset: GameRuleset<StandardRulesetConfig> = {
  id: 'standard-v1',
  version: 1,

  validateSetup(state, config): RuleViolation[] {
    const violations: RuleViolation[] = []
    if (state.players.length < 2) violations.push({ code: 'players.min', message: '至少需要 2 位玩家' })
    for (const player of state.players) {
      if (!player.name.trim()) violations.push({ code: 'player.name', message: '每位玩家都需要名字' })
      const questions = state.questions.filter((question) => question.authorPlayerId === player.id)
      if (!questions.length) violations.push({ code: 'player.question', message: `${player.name || '未命名玩家'}至少需要 1 道题` })
    }
    for (const question of state.questions) {
      if (!question.title.trim() || !question.answer.trim()) violations.push({ code: 'question.required', message: '题目名称和答案不能为空' })
      if (toCodePoints(question.answer).length > 100) violations.push({ code: 'question.length', message: '答案不能超过 100 个字符' })
      if (!state.players.some((player) => player.id === question.authorPlayerId)) violations.push({ code: 'question.author', message: '题目必须关联现有玩家' })
    }
    if (config.letterScope === 'target' && !state.questions.length) violations.push({ code: 'question.target', message: '指定题目玩法至少需要 1 道题' })
    return violations
  },

  getAvailableActions(state, actorId) {
    const outcome = this.evaluatePlayers(state, state.rulesetConfig).find((item) => item.playerId === actorId)
    return state.phase === 'playing' && outcome?.status === 'active' ? ['guess-letter', 'guess-answer'] : []
  },

  canTargetQuestion(state, actorId, questionId, _action, config) {
    const question = state.questions.find((item) => item.id === questionId)
    if (!question) return false
    if (!config.allowSelfTarget && question.authorPlayerId === actorId) return false
    return getQuestionStatus(question, questionGuesses(state, question.id), state.actionHistory) !== 'solved'
  },

  applyAction(state, action, config): ActionResult {
    const next = cloneState(state)
    if (state.phase !== 'playing' || action.actorPlayerId !== state.currentActorId) {
      return { state: next, result: 'invalid', consumedTurn: false }
    }

    let result: GameAction['result'] = 'invalid'
    if (action.type === 'guess-letter') {
      if (!isSingleCharacter(action.value)) return { state: next, result, consumedTurn: false }
      const normalized = normalizeCharacter(action.value)
      const duplicate = state.actionHistory.some((item) =>
        item.type === 'guess-letter' && normalizeCharacter(item.value) === normalized &&
        (!action.questionId || !item.questionId || item.questionId === action.questionId),
      )
      if (duplicate) return { state: next, result, consumedTurn: false }

      const targets = config.letterScope === 'target'
        ? next.questions.filter((question) => question.id === action.questionId && this.canTargetQuestion(next, action.actorPlayerId, question.id, action, config))
        : next.questions.filter((question) => this.canTargetQuestion(next, action.actorPlayerId, question.id, action, config))
      const hit = targets.some((question) => answerContainsGuess(question.answer, action.value))
      result = hit ? 'hit' : 'miss'
    } else if (action.questionId && action.hostJudgement && this.canTargetQuestion(next, action.actorPlayerId, action.questionId, action, config)) {
      result = action.hostJudgement === 'correct' ? 'solved' : 'miss'
    }

    const consumedTurn = result === 'hit' || result === 'solved' || (result === 'miss' && config.consumeTurnOnMiss)
    next.actionHistory.push({ ...action, result })
    const actionResult: ActionResult = { state: next, result, consumedTurn }
    if (consumedTurn) next.currentActorId = this.getNextActorId(next, actionResult, config)
    const game = this.evaluateGame(next, config)
    if (game.status === 'finished') {
      next.phase = 'finished'
      next.currentActorId = null
    }
    return actionResult
  },

  getNextActorId(state, _result, config) {
    const active = new Set(this.evaluatePlayers(state, config).filter((item) => item.status === 'active').map((item) => item.playerId))
    if (!active.size) return null
    const currentIndex = Math.max(0, state.turnOrder.indexOf(state.currentActorId ?? ''))
    for (let offset = 1; offset <= state.turnOrder.length; offset += 1) {
      const candidate = state.turnOrder[(currentIndex + offset) % state.turnOrder.length]
      if (active.has(candidate)) return candidate
    }
    return null
  },

  evaluatePlayers(state, config): PlayerOutcome[] {
    const raw = state.players.map((player): PlayerOutcome => {
      const questions = state.questions.filter((question) => question.authorPlayerId === player.id)
      const failed = questions.length > 0 && questions.every((question) =>
        getQuestionStatus(question, questionGuesses(state, question.id), state.actionHistory) === 'solved',
      )
      return { playerId: player.id, status: failed ? 'failed' : 'active' }
    })
    if (config.autoWinner && state.phase !== 'setup') {
      const active = raw.filter((item) => item.status === 'active')
      if (active.length === 1 && state.players.length >= 2) active[0].status = 'winner'
    }
    return raw
  },

  evaluateGame(state, config): GameOutcome {
    const outcomes = this.evaluatePlayers(state, config)
    const winner = outcomes.find((item) => item.status === 'winner')
    const active = outcomes.filter((item) => item.status === 'active' || item.status === 'winner')
    if (winner) return { status: 'finished', winnerId: winner.playerId }
    if (state.phase !== 'setup' && active.length === 0) return { status: 'finished', winnerId: null }
    return { status: 'active', winnerId: null }
  },
}
