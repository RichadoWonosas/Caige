import { describe, expect, it, vi } from 'vitest'
import type { BattleRoyaleState, Question, StandardRulesetConfig } from '../src/domain/game'
import { aliasGroupCount, answerContainsGuess, normalizeAnswer, normalizeCharacter } from '../src/domain/normalize'
import { classifyCharacter } from '../src/domain/classify'
import { getQuestionStatus, revealQuestion } from '../src/domain/reveal'
import { sortedLetterGuesses } from '../src/domain/guess-history'
import { standardRuleset } from '../src/domain/rulesets/standard-v1'
import { byCreatedAt, shuffled } from '../src/domain/order'
import { i18n, messages } from '../src/i18n'

const question = (id: string, authorPlayerId: string, answer: string): Question => ({
  id, authorPlayerId, title: id, answer, characterControls: [], createdAt: `2026-01-0${id.length}T00:00:00.000Z`,
})

const config: StandardRulesetConfig = { allowSelfTarget: false, letterScope: 'all', consumeTurnOnMiss: true, extraTurnOnCorrect: true, autoWinner: true }

function battleState(): BattleRoyaleState {
  return {
    players: [
      { id: 'p1', name: 'Alpha', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: 'p2', name: 'Beta', createdAt: '2026-01-02T00:00:00.000Z' },
    ],
    questions: [question('q1', 'p1', 'Moon'), question('q2', 'p1', 'Star'), question('q3', 'p2', 'Rain')], questionOrder: ['q1', 'q2', 'q3'],
    turnOrder: ['p1', 'p2'], currentActorId: 'p2', actionHistory: [], phase: 'playing',
    rulesetId: 'standard-v1', rulesetVersion: 1, rulesetConfig: { ...config }, sessionRules: '',
  }
}

function flatten(value: unknown, prefix = ''): string[] {
  if (!value || typeof value !== 'object') return [prefix]
  return Object.entries(value as Record<string, unknown>).flatMap(([key, child]) => flatten(child, prefix ? `${prefix}.${key}` : key))
}

describe('workbook-compatible character engine', () => {
  it('loads all 106 alias groups and preserves the workbook one-way expansion', () => {
    expect(aliasGroupCount).toBe(106)
    expect(normalizeCharacter('A')).toBe('a')
    expect(normalizeCharacter('Á')).toBe('Á')
    expect(answerContainsGuess('Á', 'a')).toBe(true)
    expect(answerContainsGuess('a', 'Á')).toBe(false)
    expect(answerContainsGuess('Γ', 'c')).toBe(true)
    expect(answerContainsGuess('Γ', 'g')).toBe(true)
    expect(normalizeAnswer('A Moon')).toBe(normalizeAnswer('a moon'))
  })

  it('classifies range boundaries from the workbook', () => {
    expect(classifyCharacter('A')).toBe('latin')
    expect(classifyCharacter('９')).toBe('digit')
    expect(classifyCharacter('あ')).toBe('kana')
    expect(classifyCharacter('한')).toBe('hangul')
    expect(classifyCharacter('鸡')).toBe('cjk')
    expect(classifyCharacter('★')).toBe('other-symbol')
  })

  it('honors forced show and hide while a question remains active', () => {
    const item = question('q', 'p1', 'AB')
    item.characterControls = ['hide', 'show']
    expect(getQuestionStatus(item, ['A'], [])).toBe('active')
    expect(revealQuestion(item, ['A'], [])).toEqual([
      { character: 'A', revealed: false, guessed: true },
      { character: 'B', revealed: true, guessed: false },
    ])
  })
})

describe('standard-v1 ruleset', () => {
  it('fails a player only after all of their questions are solved', () => {
    const state = battleState()
    state.actionHistory.push({ id: 'a1', type: 'guess-answer', actorPlayerId: 'p2', questionId: 'q1', value: 'Moon', result: 'solved', createdAt: '2026-01-01T00:00:00Z' })
    expect(standardRuleset.evaluatePlayers(state, config).find((item) => item.playerId === 'p1')?.status).toBe('active')
    state.actionHistory.push({ id: 'a2', type: 'guess-answer', actorPlayerId: 'p2', questionId: 'q2', value: 'Star', result: 'solved', createdAt: '2026-01-01T00:01:00Z' })
    const outcomes = standardRuleset.evaluatePlayers(state, config)
    expect(outcomes.find((item) => item.playerId === 'p1')?.status).toBe('failed')
    expect(outcomes.find((item) => item.playerId === 'p2')?.status).toBe('winner')
  })

  it('records a letter action and advances the turn', () => {
    const state = battleState()
    const applied = standardRuleset.applyAction(state, {
      id: 'a1', type: 'guess-letter', actorPlayerId: 'p2', value: 'o', createdAt: '2026-01-01T00:00:00Z',
    }, config)
    expect(applied.result).toBe('hit')
    expect(applied.consumedTurn).toBe(true)
    expect(applied.state.currentActorId).toBe('p1')
    expect(applied.state.actionHistory).toHaveLength(1)
  })

  it('uses the host judgement for full-song guesses without recording response text', () => {
    const state = battleState()
    const applied = standardRuleset.applyAction(state, {
      id: 'a1', type: 'guess-answer', actorPlayerId: 'p2', questionId: 'q1', value: '', hostJudgement: 'correct', createdAt: '2026-01-01T00:00:00Z',
    }, config)
    expect(applied.result).toBe('solved')
    expect(applied.consumedTurn).toBe(false)
    expect(applied.state.currentActorId).toBe('p2')
    expect(applied.state.actionHistory[0].hostJudgement).toBe('correct')
    expect(applied.state.actionHistory[0].value).toBe('')
  })

  it('advances after a correct full-song guess when the extra-turn option is off', () => {
    const state = battleState()
    const applied = standardRuleset.applyAction(state, {
      id: 'a1', type: 'guess-answer', actorPlayerId: 'p2', questionId: 'q1', value: '', hostJudgement: 'correct', createdAt: '2026-01-01T00:00:00Z',
    }, { ...config, extraTurnOnCorrect: false })
    expect(applied.consumedTurn).toBe(true)
    expect(applied.state.currentActorId).toBe('p1')
  })

  it('allows an empty song source and accepts up to 256 Unicode characters', () => {
    const state = battleState()
    state.questions.forEach((item) => { item.title = '' })
    state.questions[0].answer = '曲'.repeat(256)
    expect(standardRuleset.validateSetup(state, config).map((item) => item.code)).not.toContain('question.required')
    expect(standardRuleset.validateSetup(state, config).map((item) => item.code)).not.toContain('question.length')
    state.questions[0].answer += '名'
    expect(standardRuleset.validateSetup(state, config).map((item) => item.code)).toContain('question.length')
  })

  it('rejects setup without one question per named player', () => {
    const state = battleState()
    state.questions = state.questions.filter((item) => item.authorPlayerId !== 'p2')
    expect(standardRuleset.validateSetup(state, config).map((item) => item.code)).toContain('player.question')
  })
})

describe('dynamic ordering and localization', () => {
  it('sorts the host ledger as A-Z, 0-9, then Unicode while keeping chronology separate', () => {
    const actions = [
      { id: '1', type: 'guess-letter' as const, value: 'あ', result: 'miss' as const, createdAt: '' },
      { id: '2', type: 'guess-letter' as const, value: '9', result: 'hit' as const, createdAt: '' },
      { id: '3', type: 'guess-letter' as const, value: 'b', result: 'hit' as const, createdAt: '' },
      { id: '4', type: 'guess-letter' as const, value: 'A', result: 'hit' as const, createdAt: '' },
    ]
    expect(sortedLetterGuesses(actions)).toEqual(['A', 'B', '9', 'あ'])
    expect(actions.map((action) => action.value)).toEqual(['あ', '9', 'b', 'A'])
  })
  it('shuffles without losing or duplicating stable ids', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1).mockReturnValueOnce(0.7).mockReturnValueOnce(0.2)
    const source = ['a', 'b', 'c', 'd']
    expect([...shuffled(source)].sort()).toEqual(source)
  })

  it('restores creation order', () => {
    const rows = [{ id: 'b', createdAt: '2026-01-02' }, { id: 'a', createdAt: '2026-01-01' }]
    expect(byCreatedAt(rows).map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('provides the same message-key set for all four locales', () => {
    const baseline = flatten(messages['zh-Hans']).sort()
    expect(flatten(messages['zh-Hant']).sort()).toEqual(baseline)
    expect(flatten(messages['en-US']).sort()).toEqual(baseline)
    expect(flatten(messages['ja-JP']).sort()).toEqual(baseline)
  })

  it('resolves dotted validation codes to localized text instead of returning their ids', () => {
    expect(i18n.global.t('errors.players.min')).toBe('至少需要 2 位玩家。')
    expect(i18n.global.t('errors.question.required')).toBe('曲名原文不能为空。')
  })

  it('defines every statically referenced translation key', () => {
    const defined = new Set(flatten(messages['zh-Hans']))
    const referenced = new Set<string>()
    const pattern = /(?<![\w.])\$?t\(\s*['"]([^'"]+)['"]/gu
    const sources = import.meta.glob('../src/**/*.{ts,vue}', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>
    Object.values(sources).forEach((source) => {
      for (const match of source.matchAll(pattern)) referenced.add(match[1])
    })
    expect([...referenced].filter((key) => !defined.has(key))).toEqual([])
  })
})
