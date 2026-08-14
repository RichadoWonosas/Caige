<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check, Eye, EyeOff, RotateCcw } from 'lucide-vue-next'
import type { CharacterCategory, CharacterControl, GameAction, PlainAction, Player, Question } from '../domain/game'
import { classifyCharacter } from '../domain/classify'
import { getQuestionStatus, revealQuestion } from '../domain/reveal'
import { toCodePoints } from '../domain/normalize'

const props = defineProps<{
  questions: Question[]
  players: Player[]
  actions: Array<GameAction | PlainAction>
  guessesByQuestion: Record<string, string[]>
  distinguishTypes: boolean
  visibleCategories: Record<CharacterCategory, boolean>
}>()

const emit = defineEmits<{
  cycleControl: [questionId: string, index: number]
  bulkControl: [questionId: string, control: CharacterControl]
  toggleSolved: [questionId: string]
}>()
const { t } = useI18n()

const rows = computed(() => props.questions.map((question) => ({
  question,
  status: getQuestionStatus(question, props.guessesByQuestion[question.id] ?? [], props.actions),
  characters: revealQuestion(question, props.guessesByQuestion[question.id] ?? [], props.actions),
  author: props.players.find((player) => player.id === question.authorPlayerId)?.name,
})))

function categoryClass(character: string) {
  const category = classifyCharacter(character)
  if (!props.distinguishTypes || !props.visibleCategories[category]) return 'char-neutral'
  return `char-${category}`
}

function controlLabel(question: Question, index: number) {
  const control = question.characterControls[index] ?? 'auto'
  return control === 'auto' ? t('board.overallAuto') : control === 'show' ? t('board.bulkShow') : t('board.bulkHide')
}
</script>

<template>
  <section class="panel board-panel" aria-labelledby="board-title">
    <header class="section-header board-header">
      <div>
        <div class="eyebrow">LIVE BOARD</div>
        <h2 id="board-title">{{ $t('board.title') }}</h2>
        <p>{{ $t('board.subtitle') }}</p>
      </div>
      <span class="count-badge">{{ questions.length }}</span>
    </header>

    <div v-if="!rows.length" class="empty-state">
      <span class="empty-mark">?</span>
      <p>{{ $t('board.empty') }}</p>
    </div>

    <article v-for="(row, rowIndex) in rows" :key="row.question.id" class="question-row" :class="{ solved: row.status === 'solved' }">
      <div class="question-meta">
        <span class="question-number">{{ String(rowIndex + 1).padStart(2, '0') }}</span>
        <div class="question-title-wrap">
          <h3>{{ row.question.title || $t('question.titlePlaceholder') }}</h3>
          <p>
            <span v-if="row.author">{{ row.author }} · </span>
            {{ $t(`question.status.${row.status}`) }} · {{ $t('board.chars', { count: toCodePoints(row.question.answer).length }) }}
          </p>
        </div>
        <span class="status-pill" :class="`status-${row.status}`">
          <Check v-if="row.status === 'solved'" :size="14" aria-hidden="true" />
          {{ $t(`question.status.${row.status}`) }}
        </span>
      </div>

      <div class="character-strip" role="group" :aria-label="row.question.title">
        <button
          v-for="(item, index) in row.characters"
          :key="`${row.question.id}-${index}`"
          type="button"
          class="character-tile"
          :class="[
            item.revealed ? categoryClass(item.character) : 'char-hidden',
            `control-${row.question.characterControls[index] ?? 'auto'}`,
            { 'char-space': /\s/u.test(item.character) },
          ]"
          :aria-label="`${index + 1}: ${item.revealed ? item.character : $t('board.hidden')}; ${controlLabel(row.question, index)}`"
          :title="controlLabel(row.question, index)"
          @click="emit('cycleControl', row.question.id, index)"
        >
          <span v-if="/\s/u.test(item.character)" aria-hidden="true">·</span>
          <span v-else>{{ item.revealed ? item.character : '•' }}</span>
          <small>{{ index + 1 }}</small>
        </button>
      </div>

      <div class="question-controls">
        <button class="mini-button" type="button" @click="emit('bulkControl', row.question.id, 'auto')"><RotateCcw :size="14" />{{ $t('board.bulkAuto') }}</button>
        <button class="mini-button" type="button" @click="emit('bulkControl', row.question.id, 'show')"><Eye :size="14" />{{ $t('board.bulkShow') }}</button>
        <button class="mini-button" type="button" @click="emit('bulkControl', row.question.id, 'hide')"><EyeOff :size="14" />{{ $t('board.bulkHide') }}</button>
        <button class="mini-button solved-toggle" type="button" :aria-pressed="row.question.hostStatusOverride === 'solved'" @click="emit('toggleSolved', row.question.id)">
          <Check :size="14" />{{ row.question.hostStatusOverride === 'solved' ? $t('board.overallAuto') : $t('board.markSolved') }}
        </button>
      </div>
    </article>
  </section>
</template>
