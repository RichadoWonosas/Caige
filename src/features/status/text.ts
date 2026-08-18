import { classifyCharacter } from '../../domain/classify'
import {
  CATEGORY_EMOJI,
  COMPATIBLE_CATEGORY_MARKERS,
  COMPATIBLE_DISABLED_MARKER,
  COMPATIBLE_WINNER_MARKER,
  DEFAULT_CATEGORY_EMOJI,
  FULL_WIDTH_SPACE,
} from '../../domain/category-presentation'
import type { BoardSnapshot } from '../screenshot/render'

export type BoardTextFormat = 'color' | 'compatible'

export function renderBoardText(snapshot: BoardSnapshot, format: BoardTextFormat = 'color'): string {
  const compatible = format === 'compatible'
  const disabledMarker = compatible ? COMPATIBLE_DISABLED_MARKER : DEFAULT_CATEGORY_EMOJI
  const categoryLine = snapshot.categories
    .map((category) => `${snapshot.distinguishCharacterTypes && category.enabled
      ? compatible ? COMPATIBLE_CATEGORY_MARKERS[category.key] : CATEGORY_EMOJI[category.key]
      : disabledMarker}${category.textLabel}`)
    .join(FULL_WIDTH_SPACE)
  const categoryLegend = snapshot.distinguishCharacterTypes
    ? categoryLine
    : `${disabledMarker}${snapshot.textLabels.disabledCategory}`

  const lines = [
    `${snapshot.textLabels.categories}：${categoryLegend}`,
    `${snapshot.textLabels.guessed}：${snapshot.textGuessedCharacters.join(' ') || '—'}`,
  ]

  snapshot.questions.forEach((question) => {
    if (question.status === 'solved' || question.winnerQuestion) {
      const winnerMarker = question.winnerQuestion ? compatible ? COMPATIBLE_WINNER_MARKER : '🟩' : ''
      const author = question.author ? `（${snapshot.textLabels.author}：${question.author}）` : ''
      const detail = `${question.source}${author}`
      lines.push(`${winnerMarker}${question.number}. ${question.answer}${detail ? `  -  ${detail}` : ''}`)
      return
    }
    const body = question.characters.map((item) => {
      if (/\s/u.test(item.character)) return FULL_WIDTH_SPACE
      if (item.revealed) return item.character
      const category = classifyCharacter(item.character)
      return snapshot.distinguishCharacterTypes && snapshot.categories.find((itemCategory) => itemCategory.key === category)?.enabled
        ? compatible ? COMPATIBLE_CATEGORY_MARKERS[category] : CATEGORY_EMOJI[category]
        : disabledMarker
    }).join('')
    lines.push(`${question.number}. ${body}`)
  })

  lines.push(`${snapshot.textLabels.rules}：`)
  lines.push(snapshot.rules.trim() || '—')
  snapshot.appliedRules?.forEach((rule) => lines.push(rule))
  if (snapshot.nextPlayer) lines.push(`${snapshot.textLabels.nextPlayer}：${snapshot.nextPlayer}`)
  return lines.join('\n')
}

function legacyCopy(text: string): boolean {
  const textarea = document.createElement('textarea')
  textarea.value = text
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()
  return copied
}

export async function copyBoardText(snapshot: BoardSnapshot, format: BoardTextFormat = 'color'): Promise<void> {
  const text = renderBoardText(snapshot, format)
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch { /* legacy fallback */ }
  }
  if (!legacyCopy(text)) throw new Error('clipboard-unavailable')
}
