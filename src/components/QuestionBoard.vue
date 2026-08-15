<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Check } from 'lucide-vue-next'
import type { CharacterCategory, GameAction, PlainAction, Player, Question } from '../domain/game'
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
  showAuthors: boolean
}>()

const emit = defineEmits<{
  cycleControl: [questionId: string, index: number]
}>()
const { t } = useI18n()

const rows = computed(() => props.questions.map((question) => ({
  question,
  status: getQuestionStatus(question, props.guessesByQuestion[question.id] ?? [], props.actions),
  characters: revealQuestion(question, props.guessesByQuestion[question.id] ?? [], props.actions),
  author: props.players.find((player) => player.id === question.authorPlayerId)?.name,
})))

function categoryClass(character: string) {
  if (/\s/u.test(character)) return 'char-space'
  const category = classifyCharacter(character)
  if (!props.distinguishTypes || !props.visibleCategories[category]) return 'char-neutral'
  return `char-${category}`
}

function controlLabel(question: Question, index: number) {
  const control = question.characterControls[index] ?? 'auto'
  return control === 'auto' ? t('board.controlAuto') : control === 'show' ? t('board.controlShow') : t('board.controlHide')
}
</script>

<template>
  <section class="panel board-panel" aria-labelledby="board-title">
    <header class="section-header board-header">
      <div>
        <div class="eyebrow">{{ $t('board.eyebrow') }}</div>
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
          <h3>{{ row.question.answer || $t('question.answer') }}</h3>
          <p>
            {{ row.question.title || $t('question.sourceUnknown') }}
            <template v-if="showAuthors && row.author"> · {{ row.author }}</template>
            · {{ $t('board.chars', { count: toCodePoints(row.question.answer).length }) }}
          </p>
        </div>
        <span class="status-pill" :class="`status-${row.status}`">
          <Check v-if="row.status === 'solved'" :size="14" aria-hidden="true" />
          {{ $t(`question.status.${row.status}`) }}
        </span>
      </div>

      <div class="character-strip" role="group" :aria-label="row.question.answer">
        <button
          v-for="(item, index) in row.characters"
          :key="`${row.question.id}-${index}`"
          type="button"
          class="character-tile"
          :class="[
            categoryClass(item.character),
            item.revealed ? 'char-revealed' : 'char-unrevealed',
            item.revealed && !item.guessed ? 'char-muted-reveal' : '',
            `control-${row.question.characterControls[index] ?? 'auto'}`,
          ]"
          :aria-label="`${index + 1}: ${item.revealed ? item.character : $t('board.hidden')}; ${controlLabel(row.question, index)}`"
          :title="controlLabel(row.question, index)"
          @click="emit('cycleControl', row.question.id, index)"
        >
          <span>{{ item.revealed && !/\s/u.test(item.character) ? item.character : '' }}</span>
          <small>{{ index + 1 }}</small>
        </button>
      </div>

    </article>
  </section>
</template>
