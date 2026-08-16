export type ThemePreference = 'system' | 'light' | 'dark'
export type Locale = 'en-US' | 'zh-Hans' | 'zh-Hant' | 'ja-JP'
export type GameMode = 'song-battle-royale' | 'give-your-letters'
export type QuestionStatus = 'active' | 'solved'
export type PlayerStatus = 'active' | 'failed' | 'winner'
export type CharacterControl = 'auto' | 'show' | 'hide'
export type CharacterCategory =
  | 'latin'
  | 'digit'
  | 'ascii-symbol'
  | 'kana'
  | 'hangul'
  | 'cjk'
  | 'other-letter'
  | 'other-symbol'

export interface Player {
  id: string
  name: string
  createdAt: string
}

export interface Question {
  id: string
  authorPlayerId: string | null
  title: string
  answer: string
  characterControls: CharacterControl[]
  createdAt: string
}

export type ActionResultType = 'hit' | 'miss' | 'invalid' | 'solved'

export interface GameAction {
  id: string
  type: 'guess-letter' | 'guess-answer'
  actorPlayerId: string
  questionId?: string
  value: string
  hostJudgement?: 'correct' | 'incorrect'
  result: ActionResultType
  createdAt: string
}

export interface PlainAction {
  id: string
  type: 'guess-letter' | 'guess-answer'
  questionId?: string
  value: string
  hostJudgement?: 'correct' | 'incorrect'
  result: ActionResultType
  createdAt: string
}

export interface PlainLettersState {
  questions: Question[]
  questionOrder: string[]
  guessedLetters: string[]
  actionHistory: PlainAction[]
  sessionRules: string
}

export interface StandardRulesetConfig {
  allowSelfTarget: boolean
  letterScope: 'all' | 'target'
  consumeTurnOnMiss: boolean
  extraTurnOnCorrect: boolean
  autoWinner: boolean
}

export interface BattleRoyaleState {
  players: Player[]
  questions: Question[]
  questionOrder: string[]
  turnOrder: string[]
  currentActorId: string | null
  actionHistory: GameAction[]
  phase: 'setup' | 'playing' | 'finished'
  rulesetId: 'standard-v1'
  rulesetVersion: 1
  rulesetConfig: StandardRulesetConfig
  sessionRules: string
}

export interface GameState {
  schemaVersion: 1
  mode: GameMode
  plain: PlainLettersState
  battleRoyale: BattleRoyaleState
  distinguishCharacterTypes: boolean
  visibleCategories: Record<CharacterCategory, boolean>
  updatedAt: string
}

export interface RuleViolation {
  code: string
  message: string
}

export interface ActionResult {
  state: BattleRoyaleState
  result: ActionResultType
  consumedTurn: boolean
}

export interface PlayerOutcome {
  playerId: string
  status: PlayerStatus
}

export interface GameOutcome {
  status: 'active' | 'finished'
  winnerId: string | null
}

export interface GameRuleset<TConfig = unknown> {
  readonly id: string
  readonly version: number
  validateSetup(state: BattleRoyaleState, config: TConfig): RuleViolation[]
  getAvailableActions(state: BattleRoyaleState, actorId: string): Array<GameAction['type']>
  canTargetQuestion(state: BattleRoyaleState, actorId: string, questionId: string, action: Pick<GameAction, 'type'>, config: TConfig): boolean
  applyAction(state: BattleRoyaleState, action: Omit<GameAction, 'result'>, config: TConfig): ActionResult
  getNextActorId(state: BattleRoyaleState, result: ActionResult, config: TConfig): string | null
  evaluatePlayers(state: BattleRoyaleState, config: TConfig): PlayerOutcome[]
  evaluateGame(state: BattleRoyaleState, config: TConfig): GameOutcome
}

export const CATEGORY_KEYS: CharacterCategory[] = [
  'latin', 'digit', 'ascii-symbol', 'kana', 'hangul', 'cjk', 'other-letter', 'other-symbol',
]

export const createQuestion = (authorPlayerId: string | null = null): Question => ({
  id: crypto.randomUUID(),
  authorPlayerId,
  title: '',
  answer: '',
  characterControls: [],
  createdAt: new Date().toISOString(),
})

export const createPlayer = (): Player => ({
  id: crypto.randomUUID(),
  name: '',
  createdAt: new Date().toISOString(),
})
