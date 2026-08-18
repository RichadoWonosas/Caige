<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import {
  ArrowDown, ArrowUp, BookOpen, Check, ChevronUp, CircleHelp, CircleX, ClipboardCopy, Download,
  Image, Languages, LockKeyhole, MonitorDown, Play, Plus, RotateCcw, Save, Settings2,
  Share2, Shuffle, Swords, Trash2, TriangleAlert, Type, Undo2, Upload,
} from 'lucide-vue-next'
import AppModal from './components/AppModal.vue'
import QuestionBoard from './components/QuestionBoard.vue'
import ActionHistory from './components/ActionHistory.vue'
import { useSettingsStore } from './stores/settings'
import { usePlainStore } from './stores/plain'
import { useBattleStore } from './stores/battle'
import type { BattleRoyaleState, CharacterControl, GameAction, GameState, Locale, PlainLettersState, Question, ThemePreference } from './domain/game'
import { CATEGORY_KEYS } from './domain/game'
import { guessedForQuestion, getQuestionStatus, revealQuestion, shouldHideSolvedQuestion } from './domain/reveal'
import { sortedLetterGuesses } from './domain/guess-history'
import { toCodePoints } from './domain/normalize'
import { DEFAULT_STANDARD_RULESET_CONFIG, standardRuleset } from './domain/rulesets/standard-v1'
import { copyBoardImage, saveBoardImage, type BoardSnapshot } from './features/screenshot/render'
import { copyBoardText } from './features/status/text'
import { loadGameState, saveGameState, validateImportedState } from './persistence/indexed-db'
import compassHandUrl from './assets/theme/compass-hand.svg?url'
import compassDialLightUrl from './assets/theme/compass-dial-light.svg?url'
import compassDialDarkUrl from './assets/theme/compass-dial-dark.svg?url'

interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type ToastTone = 'success' | 'warning' | 'error'
interface ToastItem { id: number; message: string; tone: ToastTone }

const settings = useSettingsStore()
const plain = usePlainStore()
const battle = useBattleStore()
const { t, locale } = useI18n()

const helpOpen = ref(false)
const themeSettingsOpen = ref(false)
const statusMenuOpen = ref(false)
const setupCollapsed = ref(typeof window !== 'undefined' && window.matchMedia('(max-width: 860px)').matches)
const toasts = ref<ToastItem[]>([])
const hydrated = ref(false)
const saveStatus = ref<'saved' | 'saving'>('saved')
const guessType = ref<'guess-letter' | 'guess-answer'>('guess-letter')
const guessValue = ref('')
const targetQuestionId = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const statusMenuRef = ref<HTMLElement | null>(null)
const pendingImport = ref<GameState | null>(null)
const confirmState = ref<{ kind: 'reset' | 'delete-player' | 'import' | 'undo'; playerId?: string } | null>(null)
const clearSessionRulesOnReset = ref(false)
const battleUndoStack = ref<BattleRoyaleState[]>([])
const plainUndoStack = ref<PlainLettersState[]>([])
const isDark = ref(false)
const hueDragging = ref(false)
const installPrompt = ref<InstallPromptEvent | null>(null)
const isStandalone = ref(false)
const toastTimers = new Map<number, ReturnType<typeof setTimeout>>()
let nextToastId = 0
let saveTimer: ReturnType<typeof setTimeout> | undefined
let themeMedia: MediaQueryList | undefined

const currentQuestions = computed(() => settings.mode === 'song-battle-royale' ? battle.orderedQuestions : plain.orderedQuestions)
const currentPlayers = computed(() => settings.mode === 'song-battle-royale'
  ? battle.turnOrder.map((id) => battle.players.find((player) => player.id === id)).filter((player): player is NonNullable<typeof player> => Boolean(player))
  : [])
const currentActions = computed(() => settings.mode === 'song-battle-royale' ? battle.actionHistory : plain.actionHistory)
const currentSortedGuesses = computed(() => sortedLetterGuesses(currentActions.value))
const currentTextGuesses = computed(() => sortedLetterGuesses(currentActions.value, true))
const currentActor = computed(() => battle.players.find((player) => player.id === battle.currentActorId))
const currentSessionRules = computed({
  get: () => settings.mode === 'song-battle-royale' ? battle.sessionRules : plain.sessionRules,
  set: (value: string) => {
    if (settings.mode === 'song-battle-royale') battle.sessionRules = value
    else plain.sessionRules = value
  },
})
const accentHue = computed({
  get: () => settings.accentHue,
  set: (value: number) => settings.setAccentHue(value),
})
const currentThemeLabel = computed(() => t(`theme.${settings.theme}`))
const themeOptions: ThemePreference[] = ['system', 'light', 'dark']
const huePresets = [0, 16, 45, 90, 160, 210, 255, 315]
const undoAvailable = computed(() => settings.mode === 'song-battle-royale' ? battleUndoStack.value.length > 0 : plainUndoStack.value.length > 0)
const outcomeMap = computed(() => new Map(battle.outcomes.map((outcome) => [outcome.playerId, outcome.status])))
const battleGameFinished = computed(() => battle.phase === 'finished' || standardRuleset.evaluateGame(battle.$state, battle.rulesetConfig).status === 'finished')
const allPlainSolved = computed(() => plain.questions.length > 0 && plain.questions.every((question) =>
  getQuestionStatus(question, plain.guessedLetters, plain.actionHistory) === 'solved',
))
const exportQuestionEntries = computed(() => {
  const gameFinished = settings.mode === 'song-battle-royale' ? battleGameFinished.value : allPlainSolved.value
  return currentQuestions.value
    .map((question, index) => ({ question, number: index + 1 }))
    .filter(({ question }) => !settings.hideSolvedAfterNextAction || gameFinished || !shouldHideSolvedQuestion(question, currentActions.value))
})

const guessesByQuestion = computed<Record<string, string[]>>(() => Object.fromEntries(currentQuestions.value.map((question) => [
  question.id,
  settings.mode === 'song-battle-royale' ? guessedForQuestion(battle.actionHistory, question.id) : plain.guessedLetters,
])))

const eligibleBattleQuestions = computed(() => {
  if (!battle.currentActorId) return currentQuestions.value
  return currentQuestions.value.filter((question) => standardRuleset.canTargetQuestion(
    battle.$state,
    battle.currentActorId!,
    question.id,
    { type: guessType.value },
    battle.rulesetConfig,
  ))
})

const selectableQuestions = computed(() => settings.mode === 'song-battle-royale'
  ? eligibleBattleQuestions.value
  : currentQuestions.value.filter((question) => getQuestionStatus(question, plain.guessedLetters, plain.actionHistory) === 'active'))
const needsTarget = computed(() => guessType.value === 'guess-answer' || (settings.mode === 'song-battle-royale' && battle.rulesetConfig.letterScope === 'target'))
const canSubmit = computed(() => {
  if (settings.mode === 'song-battle-royale' && (battle.phase !== 'playing' || battleGameFinished.value)) return false
  if (guessType.value === 'guess-letter' && !guessValue.value.trim()) return false
  return !needsTarget.value || Boolean(targetQuestionId.value)
})

const confirmTitle = computed(() => {
  if (confirmState.value?.kind === 'delete-player') return t('dialog.deletePlayerTitle')
  if (confirmState.value?.kind === 'import') return t('dialog.importTitle')
  if (confirmState.value?.kind === 'undo') return t('dialog.undoTitle')
  return t('dialog.resetTitle')
})
const confirmDescription = computed(() => {
  if (confirmState.value?.kind === 'delete-player') return t('dialog.deletePlayerBody')
  if (confirmState.value?.kind === 'import') return t('dialog.importBody')
  if (confirmState.value?.kind === 'undo') return t('dialog.undoBody')
  return t('dialog.resetBody')
})

const { needRefresh, offlineReady, updateServiceWorker } = useRegisterSW({ immediate: true })

function dismissToast(id: number) {
  clearTimeout(toastTimers.get(id))
  toastTimers.delete(id)
  toasts.value = toasts.value.filter((item) => item.id !== id)
}

function showToast(message: string, tone: ToastTone = 'success') {
  const id = ++nextToastId
  toasts.value.push({ id, message, tone })
  if (toasts.value.length > 5) dismissToast(toasts.value[0].id)
  toastTimers.set(id, setTimeout(() => dismissToast(id), 3200))
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function checkpointUndo() {
  if (settings.mode === 'song-battle-royale') {
    battleUndoStack.value.push(cloneState(battle.$state))
    if (battleUndoStack.value.length > 50) battleUndoStack.value.shift()
  } else {
    plainUndoStack.value.push(cloneState(plain.$state))
    if (plainUndoStack.value.length > 50) plainUndoStack.value.shift()
  }
}

function discardUndoCheckpoint() {
  const stack = settings.mode === 'song-battle-royale' ? battleUndoStack.value : plainUndoStack.value
  stack.pop()
}

function undoLastOperation() {
  if (settings.mode === 'song-battle-royale') {
    const snapshot = battleUndoStack.value.pop()
    if (snapshot) battle.$patch(cloneState(snapshot))
  } else {
    const snapshot = plainUndoStack.value.pop()
    if (snapshot) plain.$patch(cloneState(snapshot))
  }
  showToast(t('toast.undone'))
}

function stateSnapshot(): GameState {
  return JSON.parse(JSON.stringify({
    schemaVersion: 1,
    mode: settings.mode,
    plain: plain.$state,
    battleRoyale: battle.$state,
    distinguishCharacterTypes: settings.distinguishCharacterTypes,
    visibleCategories: settings.visibleCategories,
    hideSolvedAfterNextAction: settings.hideSolvedAfterNextAction,
    updatedAt: new Date().toISOString(),
  })) as GameState
}

function applyState(state: GameState) {
  settings.mode = state.mode
  settings.distinguishCharacterTypes = state.distinguishCharacterTypes
  settings.visibleCategories = { ...state.visibleCategories }
  settings.hideSolvedAfterNextAction = state.hideSolvedAfterNextAction ?? true
  plain.$patch({
    ...state.plain,
    questionOrder: Array.isArray(state.plain.questionOrder) ? state.plain.questionOrder : state.plain.questions.map((question) => question.id),
    sessionRules: state.plain.sessionRules ?? '',
  })
  battle.$patch({
    ...state.battleRoyale,
    questionOrder: Array.isArray(state.battleRoyale.questionOrder) ? state.battleRoyale.questionOrder : state.battleRoyale.questions.map((question) => question.id),
    rulesetConfig: { ...DEFAULT_STANDARD_RULESET_CONFIG, ...state.battleRoyale.rulesetConfig },
    sessionRules: state.battleRoyale.sessionRules ?? '',
  })
  battleUndoStack.value = []
  plainUndoStack.value = []
}

function applyTheme() {
  const dark = settings.theme === 'dark' || (settings.theme === 'system' && Boolean(themeMedia?.matches))
  isDark.value = dark
  document.documentElement.classList.toggle('dark', dark)
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  document.documentElement.style.setProperty('--theme-hue', String(settings.accentHue))
  const accentNeedsDarkInk = dark || (settings.accentHue >= 35 && settings.accentHue <= 195)
  document.documentElement.style.setProperty('--accent-ink', accentNeedsDarkInk ? '222 47% 8%' : '0 0% 100%')
  const metaThemeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
  metaThemeColor?.setAttribute('content', `hsl(${settings.accentHue} ${dark ? '48% 13%' : '74% 42%'})`)
}

function adjustHue(delta: number) {
  settings.setAccentHue(settings.accentHue + delta)
}

function setHueFromPointer(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = event.clientX - (rect.left + rect.width / 2)
  const y = event.clientY - (rect.top + rect.height / 2)
  settings.setAccentHue(Math.atan2(y, x) * 180 / Math.PI + 90)
}

function startHueDrag(event: PointerEvent) {
  hueDragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  setHueFromPointer(event)
}

function moveHueDrag(event: PointerEvent) {
  if (hueDragging.value) setHueFromPointer(event)
}

function stopHueDrag() {
  hueDragging.value = false
}

function onHueKeydown(event: KeyboardEvent) {
  const delta = event.shiftKey ? 15 : 1
  if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') adjustHue(-delta)
  else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') adjustHue(delta)
  else if (event.key === 'Home') settings.setAccentHue(0)
  else if (event.key === 'End') settings.setAccentHue(359)
  else return
  event.preventDefault()
}

function onBeforeInstallPrompt(event: Event) {
  event.preventDefault()
  installPrompt.value = event as InstallPromptEvent
}

function onAppInstalled() {
  installPrompt.value = null
  isStandalone.value = true
  showToast(t('pwa.installed'))
}

async function installApp() {
  if (!installPrompt.value) {
    showToast(t(import.meta.env.DEV ? 'pwa.installPreparing' : 'pwa.installUnavailable'), 'warning')
    return
  }
  const promptEvent = installPrompt.value
  await promptEvent.prompt()
  const choice = await promptEvent.userChoice
  installPrompt.value = null
  if (choice.outcome === 'dismissed') showToast(t('pwa.installDismissed'), 'warning')
}

function onLocaleChange(event: Event) {
  settings.setLocale((event.target as HTMLSelectElement).value as Locale)
}

function switchMode(mode: GameState['mode']) {
  if (settings.mode === mode) return
  settings.mode = mode
  guessValue.value = ''
  targetQuestionId.value = ''
}

function addBattleQuestion() {
  const authorId = battle.turnOrder[0]
  if (!authorId) {
    battle.addPlayer()
    battle.addQuestion(battle.turnOrder[0])
    return
  }
  battle.addQuestion(authorId)
}

function questionChanged(question: Question) {
  const characters = toCodePoints(question.answer)
  if (characters.length > 256) question.answer = characters.slice(0, 256).join('')
  if (settings.mode === 'song-battle-royale') battle.normalizeQuestionControls(question.id)
  else plain.normalizeQuestionControls(question.id)
}

function playerQuestionCount(playerId: string) {
  return battle.questions.filter((question) => question.authorPlayerId === playerId).length
}

function startGame() {
  checkpointUndo()
  const violations = battle.startGame()
  if (violations.length) {
    discardUndoCheckpoint()
    showToast(t(`errors.${violations[0].code}`), 'error')
    return
  }
  showToast(t('toast.started'))
  nextTick(() => document.querySelector<HTMLInputElement>('#guess-input')?.focus())
}

function submitGuess() {
  if (!canSubmit.value) {
    showToast(t('toast.invalid'), 'warning')
    return
  }
  checkpointUndo()
  let result: 'hit' | 'miss' | 'invalid' | 'solved'
  if (settings.mode === 'give-your-letters') result = plain.submitLetter(guessValue.value)
  else result = battle.submitAction({ type: 'guess-letter', questionId: needsTarget.value ? targetQuestionId.value : undefined, value: guessValue.value }).result
  if (result === 'invalid') discardUndoCheckpoint()
  showToast(t(`toast.${result}`), result === 'miss' || result === 'invalid' ? 'warning' : 'success')
  if (result !== 'invalid') guessValue.value = ''
}

function resolveAnswer(correct: boolean) {
  if (!canSubmit.value || !targetQuestionId.value) {
    showToast(t('toast.invalidTarget'), 'warning')
    return
  }
  checkpointUndo()
  const result = settings.mode === 'give-your-letters'
    ? plain.submitAnswer(targetQuestionId.value, correct)
    : battle.submitAction({ type: 'guess-answer', questionId: targetQuestionId.value, value: '', hostJudgement: correct ? 'correct' : 'incorrect' }).result
  if (result === 'invalid') discardUndoCheckpoint()
  showToast(t(`toast.${result}`), result === 'miss' || result === 'invalid' ? 'warning' : 'success')
}

function cycleControl(questionId: string, index: number) {
  const question = currentQuestions.value.find((item) => item.id === questionId)
  if (!question) return
  checkpointUndo()
  questionChanged(question)
  const order: CharacterControl[] = ['auto', 'show', 'hide']
  question.characterControls[index] = order[(order.indexOf(question.characterControls[index] ?? 'auto') + 1) % order.length]
}

function randomizeOrder() {
  checkpointUndo()
  if (settings.mode === 'song-battle-royale') battle.randomizeQuestions()
  else plain.randomizeQuestions()
  showToast(t('toast.shuffled'))
}

function restoreOrder() {
  checkpointUndo()
  if (settings.mode === 'song-battle-royale') battle.restoreQuestions()
  else plain.restoreQuestions()
  showToast(t('toast.restoredOrder'))
}

function requestReset() {
  clearSessionRulesOnReset.value = false
  confirmState.value = { kind: 'reset' }
}
function requestUndo() { if (undoAvailable.value) confirmState.value = { kind: 'undo' } }
function requestDeletePlayer(playerId: string) { confirmState.value = { kind: 'delete-player', playerId } }

function executeConfirm() {
  const state = confirmState.value
  confirmState.value = null
  if (state?.kind === 'delete-player' && state.playerId) {
    checkpointUndo()
    battle.removePlayer(state.playerId)
  }
  if (state?.kind === 'undo') undoLastOperation()
  if (state?.kind === 'reset') {
    checkpointUndo()
    if (settings.mode === 'song-battle-royale') battle.resetGame(clearSessionRulesOnReset.value)
    else plain.resetGame(clearSessionRulesOnReset.value)
    showToast(t('toast.reset'))
  }
  if (state?.kind === 'import' && pendingImport.value) {
    applyState(pendingImport.value)
    pendingImport.value = null
    showToast(t('toast.imported'))
  }
}

function downloadText(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportState() {
  downloadText(JSON.stringify(stateSnapshot(), null, 2), `caige-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json')
  showToast(t('toast.exported'))
}

async function importState(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || file.size > 2_000_000) return showToast(t('errors.import'), 'error')
  try {
    const value = JSON.parse(await file.text())
    if (!validateImportedState(value)) throw new Error('invalid')
    pendingImport.value = value
    confirmState.value = { kind: 'import' }
  } catch { showToast(t('errors.import'), 'error') }
}

function historyLine(action: GameAction | (typeof plain.actionHistory)[number]) {
  const actor = 'actorPlayerId' in action ? battle.players.find((player) => player.id === action.actorPlayerId)?.name : ''
  if (action.type === 'guess-answer') {
    const number = currentQuestions.value.findIndex((question) => question.id === action.questionId) + 1
    const result = action.result === 'solved'
      ? t('screenshot.answerResult.correct')
      : action.result === 'miss'
        ? t('screenshot.answerResult.incorrect')
        : t('history.result.invalid')
    return `${actor ? `${actor} · ` : ''}${t('screenshot.answerHistory', { number: number || '—' })} - ${result}`
  }
  return `${actor ? `${actor} · ` : ''}${t('history.letter', { value: action.value })} · ${t(`history.result.${action.result}`)}`
}

function boardSnapshot(): BoardSnapshot {
  const isBattle = settings.mode === 'song-battle-royale'
  const appliedRules = isBattle ? [
    battle.rulesetConfig.allowSelfTarget ? t('rules.allowSelf') : t('rules.disallowSelf'),
    battle.rulesetConfig.consumeTurnOnMiss ? t('rules.consumeMiss') : t('rules.keepTurnOnMiss'),
    battle.rulesetConfig.extraTurnOnCorrect ? t('rules.extraTurnOnCorrect') : t('rules.noExtraTurnOnCorrect'),
    battle.rulesetConfig.autoWinner ? t('rules.autoWinner') : t('rules.manualWinner'),
    battle.rulesetConfig.letterScope === 'all' ? t('rules.globalLetters') : t('rules.targetLetters'),
  ] : undefined
  return {
    title: `${t('brand.name')} · ${t(isBattle ? 'mode.battle' : 'mode.plain')}`,
    subtitle: new Intl.DateTimeFormat(settings.locale, { dateStyle: 'long', timeStyle: 'short' }).format(new Date()),
    theme: isDark.value ? 'dark' : 'light',
    themeHue: settings.accentHue,
    rules: currentSessionRules.value,
    appliedRules,
    nextPlayer: isBattle && !battleGameFinished.value && currentActor.value ? currentActor.value.name : undefined,
    players: isBattle ? currentPlayers.value.map((player) => {
      const status = outcomeMap.value.get(player.id) ?? 'active'
      return { name: player.name || '—', status, statusLabel: t(`player.status.${status}`) }
    }) : undefined,
    guessedCharacters: currentSortedGuesses.value,
    textGuessedCharacters: currentTextGuesses.value,
    categories: CATEGORY_KEYS.map((key) => ({ key, label: t(`category.${key}`), textLabel: t(`textStatus.category.${key}`), enabled: settings.distinguishCharacterTypes && settings.visibleCategories[key] })),
    labels: {
      rules: t('screenshot.rules'),
      appliedRules: t('screenshot.appliedRules'),
      players: t('screenshot.players'),
      nextPlayer: t('game.nextPlayer'),
      author: t('question.author'),
      categories: t('screenshot.categories'),
      guesses: t('screenshot.guesses'),
      guessOrder: t('screenshot.guessOrder'),
      history: t('screenshot.history'),
    },
    questions: exportQuestionEntries.value.map(({ question, number }) => {
      const status = getQuestionStatus(question, guessesByQuestion.value[question.id] ?? [], currentActions.value)
      const winnerQuestion = isBattle && question.authorPlayerId !== null && outcomeMap.value.get(question.authorPlayerId) === 'winner'
      const characters = revealQuestion(question, guessesByQuestion.value[question.id] ?? [], currentActions.value)
      return {
        number,
        answer: question.answer,
        source: question.title,
        author: isBattle ? battle.players.find((player) => player.id === question.authorPlayerId)?.name : undefined,
        status,
        winnerQuestion,
        statusLabel: winnerQuestion ? t('screenshot.winnerQuestion') : t(`question.status.${status}`),
        characters: winnerQuestion ? characters.map((character) => ({ ...character, revealed: true })) : characters,
      }
    }),
    history: currentActions.value.map(historyLine).join('  →  '),
    textLabels: {
      categories: t('textStatus.categories'),
      guessed: t('textStatus.guessed'),
      defaultCategory: t('textStatus.defaultCategory'),
      rules: t('textStatus.rules'),
      nextPlayer: t('textStatus.nextPlayer'),
      author: t('question.author'),
    },
  }
}

function closeStatusMenu() {
  statusMenuOpen.value = false
}

function toggleStatusMenu() {
  statusMenuOpen.value = !statusMenuOpen.value
}

function onDocumentPointerDown(event: PointerEvent) {
  if (statusMenuOpen.value && !statusMenuRef.value?.contains(event.target as Node)) closeStatusMenu()
}

async function copyTextStatus() {
  closeStatusMenu()
  try {
    await copyBoardText(boardSnapshot())
    showToast(t('toast.textCopied'))
  } catch { showToast(t('errors.generic'), 'error') }
}

async function copyImage() {
  closeStatusMenu()
  try {
    const result = await copyBoardImage(boardSnapshot())
    showToast(t(result === 'copied' ? 'toast.copied' : 'toast.downloaded'))
  } catch { showToast(t('errors.generic'), 'error') }
}

async function saveImage() {
  closeStatusMenu()
  try {
    await saveBoardImage(boardSnapshot())
    showToast(t('toast.imageSaved'))
  } catch { showToast(t('errors.generic'), 'error') }
}

async function performUpdate() {
  try { await saveGameState(stateSnapshot()) } finally { await updateServiceWorker(true) }
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && statusMenuOpen.value) {
    closeStatusMenu()
    return
  }
  const target = event.target as HTMLElement | null
  if (target?.matches('input, textarea, select, [contenteditable="true"]')) return
  if (!event.ctrlKey || !event.shiftKey) return
  const key = event.key.toLowerCase()
  if (!['g', 'r', 'c', 'f'].includes(key)) return
  event.preventDefault()
  if (key === 'g') randomizeOrder()
  if (key === 'r') restoreOrder()
  if (key === 'c') requestReset()
  if (key === 'f') toggleStatusMenu()
}

watch(() => settings.locale, (value) => { locale.value = value }, { immediate: true })
watch(() => settings.theme, applyTheme)
watch(() => settings.accentHue, applyTheme)
watch([selectableQuestions, needsTarget], () => {
  if (!needsTarget.value) targetQuestionId.value = ''
  else if (!selectableQuestions.value.some((question) => question.id === targetQuestionId.value)) targetQuestionId.value = selectableQuestions.value[0]?.id ?? ''
}, { immediate: true })
watch(offlineReady, (ready) => { if (ready) showToast(t('pwa.offlineReady')) })

watch(
  [() => settings.mode, () => settings.distinguishCharacterTypes, () => settings.visibleCategories, () => settings.hideSolvedAfterNextAction, () => plain.$state, () => battle.$state],
  () => {
    if (!hydrated.value) return
    saveStatus.value = 'saving'
    clearTimeout(saveTimer)
    saveTimer = setTimeout(async () => {
      try {
        await saveGameState(stateSnapshot())
        saveStatus.value = 'saved'
      } catch {
        saveStatus.value = 'saved'
        showToast(t('errors.storage'), 'error')
      }
    }, 550)
  },
  { deep: true },
)

onMounted(async () => {
  themeMedia = window.matchMedia('(prefers-color-scheme: dark)')
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  themeMedia.addEventListener('change', applyTheme)
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
  applyTheme()
  window.addEventListener('keydown', onKeydown)
  document.addEventListener('pointerdown', onDocumentPointerDown)
  try {
    const saved = await loadGameState()
    if (saved && validateImportedState(saved)) {
      applyState(saved)
      showToast(t('toast.restored'))
    }
  } catch { /* start with in-memory defaults */ }
  hydrated.value = true
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
  themeMedia?.removeEventListener('change', applyTheme)
  toastTimers.forEach((timer) => clearTimeout(timer))
  toastTimers.clear()
  clearTimeout(saveTimer)
})
</script>

<template>
  <div class="app-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Caige home">
        <span class="brand-mark">C<span>·</span></span>
        <span><strong>{{ $t('brand.name') }}</strong><small>LOCAL GAME KIT</small></span>
      </a>

      <nav class="mode-switcher" :aria-label="$t('mode.label')">
        <button type="button" :class="{ active: settings.mode === 'song-battle-royale' }" @click="switchMode('song-battle-royale')">
          <Swords :size="17" aria-hidden="true" />
          <span><strong>{{ $t('mode.battle') }}</strong><small>{{ $t('mode.battleNote') }}</small></span>
        </button>
        <button type="button" :class="{ active: settings.mode === 'give-your-letters' }" @click="switchMode('give-your-letters')">
          <Type :size="17" aria-hidden="true" />
          <span><strong>{{ $t('mode.plain') }}</strong><small>{{ $t('mode.plainNote') }}</small></span>
        </button>
      </nav>

      <div class="topbar-actions">
        <span class="save-state"><Save :size="15" aria-hidden="true" />{{ $t(saveStatus === 'saved' ? 'toolbar.saved' : 'toolbar.saving') }}</span>
        <button class="theme-settings-trigger" type="button" :title="$t('theme.settingsTitle')" :aria-label="$t('theme.settingsTitle')" @click="themeSettingsOpen = true">
          <Settings2 :size="16" aria-hidden="true" />
          <span class="theme-color-dot" :style="{ background: `hsl(${settings.accentHue} 86% 52%)` }"></span>
          <span class="theme-trigger-label">{{ currentThemeLabel }}</span>
        </button>
        <label class="select-control" :title="$t('toolbar.language')">
          <Languages :size="16" aria-hidden="true" />
          <select :value="settings.locale" :aria-label="$t('toolbar.language')" @change="onLocaleChange">
            <option value="zh-Hans">简体中文</option><option value="zh-Hant">繁體中文</option><option value="en-US">English</option><option value="ja-JP">日本語</option>
          </select>
        </label>
        <button v-if="!isStandalone" class="icon-button install-button" :class="{ ready: Boolean(installPrompt) }" type="button" :title="$t(installPrompt ? 'pwa.installReady' : 'pwa.installWaiting')" :aria-label="$t('toolbar.install')" @click="installApp"><MonitorDown :size="18" /></button>
        <button class="icon-button" type="button" :title="$t('actions.export')" :aria-label="$t('actions.export')" @click="exportState"><Download :size="18" /></button>
        <button class="icon-button" type="button" :title="$t('actions.import')" :aria-label="$t('actions.import')" @click="fileInput?.click()"><Upload :size="18" /></button>
        <button class="icon-button" type="button" :title="$t('toolbar.help')" :aria-label="$t('toolbar.help')" @click="helpOpen = true"><CircleHelp :size="19" /></button>
      </div>
    </header>

    <div v-if="needRefresh" class="update-banner" role="status">
      <span><Check :size="17" />{{ $t('pwa.updateAvailable') }}</span>
      <button type="button" @click="performUpdate">{{ $t('actions.update') }}</button>
    </div>

    <main class="workspace">
      <aside class="panel setup-panel" :class="{ collapsed: setupCollapsed }">
        <header class="section-header">
          <div>
            <div class="eyebrow">{{ $t('setup.eyebrow') }}</div>
            <h1>{{ $t('setup.title') }}</h1>
            <p>{{ $t('setup.subtitle') }}</p>
          </div>
          <div class="setup-header-actions">
            <span class="mode-code">{{ settings.mode === 'song-battle-royale' ? 'BR' : 'GL' }}</span>
            <button
              class="setup-collapse-button"
              type="button"
              :title="$t(setupCollapsed ? 'setup.expand' : 'setup.collapse')"
              :aria-label="$t(setupCollapsed ? 'setup.expand' : 'setup.collapse')"
              :aria-expanded="!setupCollapsed"
              aria-controls="setup-content"
              @click="setupCollapsed = !setupCollapsed"
            ><ChevronUp :size="17" :class="{ collapsed: setupCollapsed }" /></button>
          </div>
        </header>

        <div id="setup-content" v-show="!setupCollapsed" class="setup-content">
          <section class="setup-section session-rules-section">
          <label class="field-label" for="session-rules"><span>{{ $t('setup.sessionRules') }}</span></label>
          <textarea id="session-rules" v-model="currentSessionRules" :placeholder="$t('setup.sessionRulesPlaceholder')" maxlength="600"></textarea>
          <small>{{ $t('setup.sessionRulesHint') }}</small>
          </section>

        <template v-if="settings.mode === 'song-battle-royale'">
          <div v-if="battle.phase !== 'setup'" class="locked-state">
            <LockKeyhole :size="22" />
            <div><strong>{{ $t('setup.editLocked') }}</strong><span>{{ battle.players.length }} {{ $t('setup.players') }} · {{ battle.questions.length }} {{ $t('setup.questions') }}</span></div>
            <button class="button button-ghost" type="button" @click="battle.unlockSetup()">{{ $t('setup.unlock') }}</button>
          </div>

          <template v-else>
            <section class="setup-section">
              <div class="subsection-title"><h2>{{ $t('setup.players') }}</h2><span>{{ battle.players.length }}</span></div>
              <div class="player-editors">
                <div v-for="(player, index) in currentPlayers" :key="player.id" class="player-editor">
                  <span class="order-index">{{ index + 1 }}</span>
                  <div class="editor-main">
                    <input v-model="player.name" type="text" :aria-label="$t('player.name')" :placeholder="$t('player.placeholder')" maxlength="40" />
                    <small>{{ $t('player.questionCount', { count: playerQuestionCount(player.id) }) }}</small>
                  </div>
                  <div class="row-actions">
                    <button type="button" :title="$t('actions.moveUp')" :aria-label="$t('actions.moveUp')" :disabled="index === 0" @click="battle.movePlayer(player.id, -1)"><ArrowUp :size="14" /></button>
                    <button type="button" :title="$t('actions.moveDown')" :aria-label="$t('actions.moveDown')" :disabled="index === currentPlayers.length - 1" @click="battle.movePlayer(player.id, 1)"><ArrowDown :size="14" /></button>
                    <button type="button" class="delete-action" :title="$t('actions.delete')" :aria-label="$t('actions.delete')" @click="requestDeletePlayer(player.id)"><Trash2 :size="14" /></button>
                  </div>
                </div>
              </div>
              <button id="add-player" class="add-row-button" type="button" @click="battle.addPlayer"><Plus :size="16" />{{ $t('actions.addPlayer') }}</button>
            </section>

            <section class="setup-section">
              <div class="subsection-title"><h2>{{ $t('setup.questions') }}</h2><span>{{ battle.questions.length }}</span></div>
              <div class="question-editors">
                <div v-for="(question, index) in battle.questions" :key="question.id" class="question-editor">
                  <div class="question-editor-head"><strong>#{{ String(index + 1).padStart(2, '0') }}</strong><button type="button" :aria-label="$t('actions.delete')" :title="$t('actions.delete')" @click="battle.removeQuestion(question.id)"><Trash2 :size="14" /></button></div>
                  <label><span>{{ $t('question.author') }}</span><select v-model="question.authorPlayerId"><option v-for="player in currentPlayers" :key="player.id" :value="player.id">{{ player.name || $t('player.placeholder') }}</option></select></label>
                  <label><span>{{ $t('question.source') }}</span><input v-model="question.title" type="text" :placeholder="$t('question.sourcePlaceholder')" maxlength="80" /></label>
                  <label><span>{{ $t('question.answer') }}</span><input v-model="question.answer" type="text" :placeholder="$t('question.answerPlaceholder')" @input="questionChanged(question)" /></label>
                </div>
              </div>
              <button class="add-row-button" type="button" @click="addBattleQuestion"><Plus :size="16" />{{ $t('actions.addQuestion') }}</button>
            </section>

            <section class="setup-section rules-section">
              <div class="subsection-title"><h2>{{ $t('setup.rules') }}</h2><span>{{ $t('rules.rulesetVersion', { version: 1 }) }}</span></div>
              <label class="toggle-row"><input v-model="battle.rulesetConfig.allowSelfTarget" type="checkbox" /><span>{{ $t('rules.allowSelf') }}</span></label>
              <label class="toggle-row"><input v-model="battle.rulesetConfig.consumeTurnOnMiss" type="checkbox" /><span>{{ $t('rules.consumeMiss') }}</span></label>
              <label class="toggle-row"><input v-model="battle.rulesetConfig.extraTurnOnCorrect" type="checkbox" /><span>{{ $t('rules.extraTurnOnCorrect') }}</span></label>
              <label class="toggle-row"><input v-model="battle.rulesetConfig.autoWinner" type="checkbox" /><span>{{ $t('rules.autoWinner') }}</span></label>
              <label class="field-label"><span>{{ $t('game.letter') }}</span><select v-model="battle.rulesetConfig.letterScope"><option value="all">{{ $t('rules.globalLetters') }}</option><option value="target">{{ $t('rules.targetLetters') }}</option></select></label>
              <p class="rules-note">{{ $t('rules.localConfig') }}</p>
            </section>
          </template>
        </template>

        <template v-else>
          <section class="setup-section plain-setup">
            <div class="subsection-title"><h2>{{ $t('setup.questions') }}</h2><span>{{ plain.questions.length }}</span></div>
            <div class="question-editors">
              <div v-for="(question, index) in plain.questions" :key="question.id" class="question-editor">
                <div class="question-editor-head"><strong>#{{ String(index + 1).padStart(2, '0') }}</strong><button type="button" :aria-label="$t('actions.delete')" :title="$t('actions.delete')" @click="plain.removeQuestion(question.id)"><Trash2 :size="14" /></button></div>
                <label><span>{{ $t('question.source') }}</span><input v-model="question.title" type="text" :placeholder="$t('question.sourcePlaceholder')" maxlength="80" /></label>
                <label><span>{{ $t('question.answer') }}</span><input v-model="question.answer" type="text" :placeholder="$t('question.answerPlaceholder')" @input="questionChanged(question)" /></label>
              </div>
            </div>
            <button id="add-question" class="add-row-button" type="button" @click="plain.addQuestion"><Plus :size="16" />{{ $t('actions.addQuestion') }}</button>
          </section>
        </template>
        </div>
      </aside>

      <div class="main-column">
        <section class="stage-panel">
          <div class="stage-copy">
            <div class="eyebrow">PLAY / 02</div>
            <h2>{{ $t('game.title') }}</h2>
            <p v-if="settings.mode === 'give-your-letters'">{{ allPlainSolved ? $t('game.allComplete') : $t('game.plainIntro') }}</p>
            <p v-else-if="battleGameFinished">{{ $t('game.finished') }}</p>
            <p v-else-if="battle.phase === 'playing'">{{ $t('game.nextPlayer') }} <strong>{{ currentActor?.name }}</strong></p>
            <p v-else>{{ $t('game.waiting') }}</p>
          </div>
          <button v-if="settings.mode === 'song-battle-royale' && battle.phase === 'setup'" class="start-button" type="button" @click="startGame"><Play :size="19" fill="currentColor" />{{ $t('game.start') }}</button>
          <div v-else-if="settings.mode === 'song-battle-royale'" class="current-actor-badge">
            <span>{{ $t(battleGameFinished ? 'game.endBadge' : 'game.turnBadge') }}</span><strong>{{ battleGameFinished ? $t('game.finished') : currentActor?.name }}</strong>
          </div>
          <div v-else class="current-actor-badge plain"><span>{{ $t('game.sharedBadge') }}</span><strong>{{ currentSortedGuesses.length }}</strong></div>
        </section>

        <div v-if="settings.mode === 'song-battle-royale'" class="standings-strip" :aria-label="$t('game.playerStandings')">
          <div v-for="(player, index) in currentPlayers" :key="player.id" :class="[`standing-${outcomeMap.get(player.id) || 'active'}`, { current: player.id === battle.currentActorId }]">
            <span>{{ index + 1 }}</span><strong>{{ player.name || '—' }}</strong><small>{{ $t(`player.status.${outcomeMap.get(player.id) || 'active'}`) }}</small>
          </div>
        </div>

        <section class="guess-console panel" :class="{ disabled: settings.mode === 'song-battle-royale' && (battle.phase !== 'playing' || battleGameFinished) }">
          <div class="guess-tabs" role="tablist">
            <button type="button" :class="{ active: guessType === 'guess-letter' }" @click="guessType = 'guess-letter'"><Type :size="16" />{{ $t('game.letter') }}</button>
            <button type="button" :class="{ active: guessType === 'guess-answer' }" @click="guessType = 'guess-answer'"><BookOpen :size="16" />{{ $t('game.answer') }}</button>
          </div>
          <div class="guess-form">
            <label v-if="needsTarget" class="guess-target"><span>{{ $t('game.target') }}</span><select v-model="targetQuestionId"><option v-for="question in selectableQuestions" :key="question.id" :value="question.id">{{ $t('board.anonymousQuestion', { number: String(currentQuestions.findIndex((item) => item.id === question.id) + 1).padStart(2, '0') }) }} · {{ question.answer }} · {{ question.title || $t('question.sourceUnknown') }}</option></select></label>
            <template v-if="guessType === 'guess-letter'">
              <label class="guess-input-wrap"><span>{{ $t('game.letter') }}</span><input id="guess-input" v-model="guessValue" type="text" :placeholder="$t('game.inputLetter')" autocomplete="off" @keydown.enter.prevent="submitGuess" /></label>
              <button class="submit-action" type="button" :disabled="!canSubmit" @click="submitGuess">{{ $t('game.submitLetter') }}<ArrowUp :size="18" /></button>
            </template>
            <div v-else class="answer-decision-buttons">
              <button class="button button-danger" type="button" :disabled="!canSubmit" @click="resolveAnswer(false)">{{ $t('game.answerIncorrect') }}</button>
              <button class="button button-primary" type="button" :disabled="!canSubmit" @click="resolveAnswer(true)">{{ $t('game.answerCorrect') }}</button>
            </div>
          </div>
        </section>

        <div class="macro-bar" :aria-label="$t('actions.gameActions')">
          <button type="button" aria-keyshortcuts="Control+Shift+G" @click="randomizeOrder"><Shuffle :size="16" />{{ $t('actions.randomQuestions') }}<kbd>G</kbd></button>
          <button type="button" aria-keyshortcuts="Control+Shift+R" @click="restoreOrder"><RotateCcw :size="16" />{{ $t('actions.restoreQuestions') }}<kbd>R</kbd></button>
          <button type="button" :disabled="!undoAvailable" @click="requestUndo"><Undo2 :size="16" />{{ $t('actions.undo') }}</button>
          <div ref="statusMenuRef" class="status-menu-wrap">
            <button
              class="status-menu-trigger"
              type="button"
              :title="$t('actions.statusMenu')"
              :aria-label="$t('actions.statusMenu')"
              aria-haspopup="menu"
              :aria-expanded="statusMenuOpen"
              aria-keyshortcuts="Control+Shift+F"
              @click="toggleStatusMenu"
            ><Share2 :size="16" />{{ $t('actions.status') }}<ChevronUp :size="14" class="menu-chevron" :class="{ open: statusMenuOpen }" /><kbd>F</kbd></button>
            <div v-if="statusMenuOpen" class="status-menu" role="menu">
              <button type="button" role="menuitem" @click="copyTextStatus"><ClipboardCopy :size="16" />{{ $t('actions.copyTextStatus') }}</button>
              <button type="button" role="menuitem" @click="copyImage"><Image :size="16" />{{ $t('actions.copyImage') }}</button>
              <button type="button" role="menuitem" @click="saveImage"><Download :size="16" />{{ $t('actions.saveImage') }}</button>
            </div>
          </div>
          <button class="danger" type="button" aria-keyshortcuts="Control+Shift+C" @click="requestReset"><Trash2 :size="16" />{{ $t('actions.reset') }}<kbd>C</kbd></button>
        </div>

        <QuestionBoard
          :questions="currentQuestions"
          :players="currentPlayers"
          :actions="currentActions"
          :guesses-by-question="guessesByQuestion"
          :distinguish-types="settings.distinguishCharacterTypes"
          :visible-categories="settings.visibleCategories"
          :show-authors="settings.mode === 'song-battle-royale'"
          @cycle-control="cycleControl"
        />

        <div class="lower-grid">
          <section class="panel legend-panel">
            <header class="section-header compact"><div><div class="eyebrow">{{ $t('category.eyebrow') }}</div><h2>{{ $t('category.title') }}</h2></div><label class="switch"><input v-model="settings.distinguishCharacterTypes" type="checkbox" /><span></span></label></header>
            <div class="legend-grid">
              <button v-for="category in CATEGORY_KEYS" :key="category" type="button" :class="[`legend-${category}`, { muted: !settings.visibleCategories[category] }]" :aria-pressed="settings.visibleCategories[category]" @click="settings.visibleCategories[category] = !settings.visibleCategories[category]">
                <span></span>{{ $t(`category.${category}`) }}
              </button>
            </div>
            <label class="toggle-row status-visibility-option"><input v-model="settings.hideSolvedAfterNextAction" type="checkbox" /><span>{{ $t('board.hideSolvedAfterNextAction') }}</span></label>
          </section>
          <ActionHistory :actions="currentActions" :players="currentPlayers" />
        </div>

        <footer class="privacy-footer"><span><Save :size="14" />{{ $t('toolbar.local') }}</span><span>Caige MVP · schema v1 · ruleset standard-v1</span></footer>
      </div>
    </main>

    <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="importState" />

    <AppModal :open="themeSettingsOpen" :title="$t('theme.settingsTitle')" :description="$t('theme.settingsDescription')" @close="themeSettingsOpen = false">
      <div class="theme-settings-layout">
        <section class="hue-picker-section">
          <div
            class="hue-compass"
            role="slider"
            tabindex="0"
            :aria-label="$t('theme.hue')"
            aria-valuemin="0"
            aria-valuemax="359"
            :aria-valuenow="settings.accentHue"
            :style="{ '--hue-rotation': `${settings.accentHue}deg`, '--hand-tint': `${settings.accentHue}deg` }"
            @pointerdown="startHueDrag"
            @pointermove="moveHueDrag"
            @pointerup="stopHueDrag"
            @pointercancel="stopHueDrag"
            @keydown="onHueKeydown"
          >
            <div class="hue-spectrum"></div>
            <img class="compass-dial" :src="isDark ? compassDialDarkUrl : compassDialLightUrl" alt="" draggable="false" />
            <img class="compass-hand" :src="compassHandUrl" alt="" draggable="false" />
            <span class="hue-center" :style="{ background: `hsl(${settings.accentHue} 86% 52%)` }">{{ settings.accentHue }}°</span>
          </div>
          <div class="hue-stepper" :aria-label="$t('theme.hueFineTune')">
            <button type="button" @click="adjustHue(-15)">−15</button>
            <button type="button" @click="adjustHue(-1)">−1</button>
            <input v-model.number="accentHue" type="number" min="0" max="359" :aria-label="$t('theme.hueValue')" />
            <button type="button" @click="adjustHue(1)">+1</button>
            <button type="button" @click="adjustHue(15)">+15</button>
          </div>
        </section>

        <section class="theme-options-section">
          <div class="theme-option-group">
            <span>{{ $t('theme.appearance') }}</span>
            <div class="theme-segments">
              <button v-for="theme in themeOptions" :key="theme" type="button" :class="{ active: settings.theme === theme }" @click="settings.setTheme(theme)">{{ $t(`theme.${theme}`) }}</button>
            </div>
          </div>
          <label class="theme-range">
            <span>{{ $t('theme.hue') }}</span>
            <input v-model.number="accentHue" type="range" min="0" max="359" step="1" />
          </label>
          <div class="hue-presets">
            <span>{{ $t('theme.presets') }}</span>
            <div>
              <button v-for="hue in huePresets" :key="hue" type="button" :class="{ active: settings.accentHue === hue }" :style="{ '--preset-color': `hsl(${hue} 82% 50%)` }" :aria-label="$t('theme.useHue', { hue })" @click="settings.setAccentHue(hue)"></button>
            </div>
          </div>
          <div class="theme-live-preview">
            <span>{{ $t('theme.preview') }}</span>
            <strong>{{ $t('theme.previewTitle') }}</strong>
            <p>{{ $t('theme.previewBody') }}</p>
            <button type="button">{{ $t('theme.previewAction') }}</button>
          </div>
        </section>
      </div>
    </AppModal>

    <AppModal :open="helpOpen" :title="$t('help.title')" @close="helpOpen = false">
      <div class="help-content">
        <p class="help-intro">{{ $t('help.intro') }}</p>
        <div class="help-steps">
          <section><span>01</span><div><h3>{{ $t('help.step1Title') }}</h3><p>{{ $t('help.step1') }}</p></div></section>
          <section><span>02</span><div><h3>{{ $t('help.step2Title') }}</h3><p>{{ $t('help.step2') }}</p></div></section>
          <section><span>03</span><div><h3>{{ $t('help.step3Title') }}</h3><p>{{ $t('help.step3') }}</p></div></section>
        </div>
        <h3>{{ $t('help.shortcuts') }}</h3>
        <div class="shortcut-grid"><span><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>G</kbd>{{ $t('help.keyG') }}</span><span><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>R</kbd>{{ $t('help.keyR') }}</span><span><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>C</kbd>{{ $t('help.keyC') }}</span><span><kbd>Ctrl</kbd><kbd>Shift</kbd><kbd>F</kbd>{{ $t('help.keyF') }}</span></div>
        <p class="privacy-warning"><LockKeyhole :size="18" />{{ $t('help.privacy') }}</p>
      </div>
    </AppModal>

    <AppModal :open="Boolean(confirmState)" :title="confirmTitle" :description="confirmDescription" :confirm-label="$t('actions.confirm')" :danger="confirmState?.kind !== 'import'" @close="confirmState = null" @confirm="executeConfirm">
      <label v-if="confirmState?.kind === 'reset'" class="reset-rules-option"><input v-model="clearSessionRulesOnReset" type="checkbox" /><span>{{ $t('dialog.clearSessionRules') }}</span></label>
    </AppModal>

    <div class="toast-stack" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div v-for="toast in toasts" :key="toast.id" class="toast" :class="`toast-${toast.tone}`" :role="toast.tone === 'error' ? 'alert' : 'status'">
          <Check v-if="toast.tone === 'success'" :size="17" />
          <TriangleAlert v-else-if="toast.tone === 'warning'" :size="17" />
          <CircleX v-else :size="17" />
          <span>{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>
