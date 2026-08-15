<script setup lang="ts">
import { Clock3 } from 'lucide-vue-next'
import type { GameAction, PlainAction, Player } from '../domain/game'
import { sortedLetterGuesses } from '../domain/guess-history'

const props = defineProps<{ actions: Array<GameAction | PlainAction>; players: Player[] }>()

function actorName(action: GameAction | PlainAction, players: Player[]) {
  return 'actorPlayerId' in action ? players.find((player) => player.id === action.actorPlayerId)?.name || '—' : ''
}
</script>

<template>
  <section class="panel history-panel">
    <header class="section-header compact">
      <div>
        <div class="eyebrow">{{ $t('history.eyebrow') }}</div>
        <h2>{{ $t('history.title') }}</h2>
      </div>
      <Clock3 :size="19" aria-hidden="true" />
    </header>
    <div class="guess-ledger">
      <h3>{{ $t('history.guessedCharacters') }}</h3>
      <p v-if="!sortedLetterGuesses(props.actions).length">{{ $t('history.noneGuessed') }}</p>
      <div v-else class="guess-chip-list">
        <span v-for="character in sortedLetterGuesses(props.actions)" :key="character">{{ character }}</span>
      </div>
    </div>
    <p v-if="!actions.length" class="history-empty">{{ $t('history.empty') }}</p>
    <ol v-else class="history-list">
      <li v-for="action in [...actions].reverse().slice(0, 12)" :key="action.id">
        <span class="history-dot" :class="`result-${action.result}`"></span>
        <div>
          <strong v-if="actorName(action, players)">{{ actorName(action, players) }}</strong>
          <span>{{ $t(action.type === 'guess-letter' ? 'history.letter' : 'history.answer', { value: action.value }) }}</span>
        </div>
        <small :class="`result-text-${action.result}`">{{ $t(`history.result.${action.result}`) }}</small>
      </li>
    </ol>
  </section>
</template>
