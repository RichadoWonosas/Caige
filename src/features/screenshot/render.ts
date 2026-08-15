import type { CharacterCategory, QuestionStatus } from '../../domain/game'
import type { RevealedCharacter } from '../../domain/reveal'
import { classifyCharacter } from '../../domain/classify'

export interface BoardSnapshot {
  title: string
  subtitle: string
  theme: 'light' | 'dark'
  themeHue: number
  rules: string
  nextPlayer?: string
  guessedCharacters: string[]
  categories: Array<{ key: CharacterCategory; label: string; enabled: boolean }>
  labels: {
    rules: string
    categories: string
    guesses: string
    guessOrder: string
    history: string
  }
  questions: Array<{
    number: number
    answer: string
    source: string
    author?: string
    status: QuestionStatus
    statusLabel: string
    characters: RevealedCharacter[]
  }>
  history: string
}

const CATEGORY_COLORS: Record<'light' | 'dark', Record<CharacterCategory, string>> = {
  light: {
    latin: 'hsl(0 78% 86%)', digit: 'hsl(45 88% 82%)', 'ascii-symbol': 'hsl(90 58% 80%)', kana: 'hsl(135 55% 82%)',
    hangul: 'hsl(180 55% 80%)', cjk: 'hsl(225 72% 86%)', 'other-letter': 'hsl(271 68% 86%)', 'other-symbol': 'hsl(315 66% 85%)',
  },
  dark: {
    latin: 'hsl(0 45% 31%)', digit: 'hsl(45 48% 29%)', 'ascii-symbol': 'hsl(90 34% 27%)', kana: 'hsl(135 35% 27%)',
    hangul: 'hsl(180 38% 27%)', cjk: 'hsl(225 42% 34%)', 'other-letter': 'hsl(271 38% 34%)', 'other-symbol': 'hsl(315 37% 31%)',
  },
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = (text || '').split(/\r?\n/u)
  const lines: string[] = []
  for (const paragraph of paragraphs) {
    if (!paragraph) {
      lines.push('')
      continue
    }
    let line = ''
    for (const character of Array.from(paragraph)) {
      const candidate = line + character
      if (line && ctx.measureText(candidate).width > maxWidth) {
        lines.push(line)
        line = character
      } else line = candidate
    }
    if (line) lines.push(line)
  }
  return lines.length ? lines : ['']
}

export async function copyBoardImage(snapshot: BoardSnapshot): Promise<'copied' | 'downloaded'> {
  const width = 1280
  const margin = 58
  const contentWidth = width - margin * 2
  const tileSize = 38
  const tileGap = 4
  const tileColumns = Math.max(1, Math.floor(contentWidth / (tileSize + tileGap)))
  const measuringCanvas = document.createElement('canvas')
  const measuringContext = measuringCanvas.getContext('2d')
  if (!measuringContext) throw new Error('canvas-unavailable')

  measuringContext.font = '500 13pt ui-sans-serif, system-ui, sans-serif'
  const ruleLines = wrapLines(measuringContext, snapshot.rules.trim() || '—', contentWidth - 32)
  measuringContext.font = '500 11.5pt ui-sans-serif, system-ui, sans-serif'
  const historyLines = wrapLines(measuringContext, snapshot.history || '—', contentWidth - 32)
  measuringContext.font = '800 14pt ui-monospace, "Noto Sans Mono", monospace'
  const guessedLines = wrapLines(measuringContext, snapshot.guessedCharacters.join('  ') || '—', contentWidth)
  const questionLayouts = snapshot.questions.map((question) => {
    const characterRows = Math.max(1, Math.ceil(Math.max(question.characters.length, 1) / tileColumns))
    measuringContext.font = '500 11.5pt ui-sans-serif, system-ui, sans-serif'
    const resolvedText = [question.answer, question.source, question.author].filter(Boolean).join(' · ')
    const metaLines = question.status === 'solved' ? wrapLines(measuringContext, resolvedText, contentWidth - 32) : []
    return { characterRows, metaLines, height: 34 + characterRows * (tileSize + tileGap) + (metaLines.length ? 8 + metaLines.length * 22 : 8) }
  })
  const rulesHeight = 50 + ruleLines.length * 27
  const nextPlayerHeight = snapshot.nextPlayer ? 54 : 0
  const legendHeight = 112
  const guessesHeight = 64 + (guessedLines.length - 1) * 26
  const questionsHeight = questionLayouts.reduce((total, value) => total + value.height, 0)
  const historyHeight = 58 + historyLines.length * 23
  const height = Math.max(800, 126 + rulesHeight + nextPlayerHeight + legendHeight + guessesHeight + questionsHeight + historyHeight + 52)
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-unavailable')
  ctx.scale(scale, scale)

  const dark = snapshot.theme === 'dark'
  const theme = dark ? 'dark' as const : 'light' as const
  const accent = `hsl(${snapshot.themeHue} ${dark ? '86% 62%' : '78% 45%'})`
  const accentInk = snapshot.themeHue >= 35 && snapshot.themeHue <= 195 ? 'hsl(222 47% 8%)' : 'white'
  const colors = dark
    ? { bg: 'hsl(222 47% 8%)', surface: 'hsl(220 30% 12%)', subtle: 'hsl(220 22% 18%)', text: 'hsl(210 40% 96%)', muted: 'hsl(215 18% 70%)', accent, line: 'hsl(218 22% 27%)' }
    : { bg: 'hsl(48 33% 97%)', surface: 'hsl(0 0% 100%)', subtle: 'hsl(45 24% 93%)', text: 'hsl(222 47% 11%)', muted: 'hsl(218 12% 42%)', accent, line: 'hsl(40 18% 82%)' }

  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = colors.accent
  ctx.fillRect(0, 0, 14, height)

  let y = 58
  ctx.fillStyle = colors.text
  ctx.font = '800 30pt ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.title, margin, y)
  y += 28
  ctx.fillStyle = colors.muted
  ctx.font = '500 11.5pt ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.subtitle, margin + 2, y)
  y += 34

  ctx.fillStyle = colors.surface
  ctx.fillRect(margin, y, contentWidth, rulesHeight - 8)
  ctx.fillStyle = colors.accent
  ctx.font = '800 11pt ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.labels.rules, margin + 16, y + 23)
  ctx.fillStyle = colors.text
  ctx.font = '500 13pt ui-sans-serif, system-ui, sans-serif'
  ruleLines.forEach((line, index) => ctx.fillText(line, margin + 16, y + 51 + index * 27))
  y += rulesHeight

  if (snapshot.nextPlayer) {
    ctx.fillStyle = colors.accent
    ctx.fillRect(margin, y, contentWidth, 44)
    ctx.fillStyle = accentInk
    ctx.font = '800 15pt ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(snapshot.nextPlayer, margin + 16, y + 30)
    y += nextPlayerHeight
  }

  ctx.fillStyle = colors.muted
  ctx.font = '800 11pt ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.labels.categories, margin, y + 16)
  const legendY = y + 28
  const legendGap = 8
  const legendColumns = 4
  const legendWidth = (contentWidth - legendGap * (legendColumns - 1)) / legendColumns
  const legendBoxHeight = 34
  snapshot.categories.forEach((category, index) => {
    const column = index % legendColumns
    const row = Math.floor(index / legendColumns)
    const x = margin + column * (legendWidth + legendGap)
    const boxY = legendY + row * (legendBoxHeight + legendGap)
    ctx.fillStyle = category.enabled ? CATEGORY_COLORS[theme][category.key] : colors.subtle
    ctx.fillRect(x, boxY, legendWidth, legendBoxHeight)
    ctx.strokeStyle = colors.line
    ctx.strokeRect(x + 0.5, boxY + 0.5, legendWidth - 1, legendBoxHeight - 1)
    ctx.fillStyle = category.enabled ? colors.text : colors.muted
    ctx.font = '750 11pt ui-sans-serif, system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`${category.enabled ? '●' : '○'} ${category.label}`, x + legendWidth / 2, boxY + 23)
  })
  ctx.textAlign = 'left'
  y += legendHeight

  ctx.fillStyle = colors.muted
  ctx.font = '800 11pt ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(`${snapshot.labels.guesses} · ${snapshot.labels.guessOrder}`, margin, y + 15)
  ctx.fillStyle = colors.text
  ctx.font = '800 14pt ui-monospace, "Noto Sans Mono", monospace'
  guessedLines.forEach((line, index) => ctx.fillText(line, margin, y + 44 + index * 26))
  y += guessesHeight

  snapshot.questions.forEach((question, questionIndex) => {
    const layout = questionLayouts[questionIndex]
    ctx.fillStyle = colors.accent
    ctx.font = '900 12pt ui-monospace, monospace'
    ctx.fillText(`#${String(question.number).padStart(2, '0')}`, margin, y + 22)
    ctx.fillStyle = question.status === 'solved' ? colors.accent : colors.muted
    ctx.font = '700 11pt ui-sans-serif, system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillText(question.statusLabel, margin + contentWidth, y + 22)
    ctx.textAlign = 'left'

    const characters = question.characters.length ? question.characters : [{ character: '', revealed: false, guessed: false }]
    characters.forEach((item, index) => {
      const column = index % tileColumns
      const row = Math.floor(index / tileColumns)
      const x = margin + column * (tileSize + tileGap)
      const tileY = y + 32 + row * (tileSize + tileGap)
      const isSpace = /\s/u.test(item.character)
      if (!isSpace) {
        const category = classifyCharacter(item.character)
        const categorySetting = snapshot.categories.find((itemCategory) => itemCategory.key === category)
        ctx.fillStyle = categorySetting?.enabled ? CATEGORY_COLORS[theme][category] : colors.subtle
        ctx.fillRect(x, tileY, tileSize, tileSize)
        ctx.strokeStyle = colors.line
        ctx.strokeRect(x + 0.5, tileY + 0.5, tileSize - 1, tileSize - 1)
        if (item.revealed && item.character) {
          ctx.save()
          ctx.globalAlpha = item.guessed ? 1 : 0.42
          ctx.fillStyle = colors.text
          ctx.font = '800 15pt ui-monospace, "Noto Sans Mono", monospace'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(item.character, x + tileSize / 2, tileY + tileSize / 2 + 1)
          ctx.restore()
          ctx.textAlign = 'left'
          ctx.textBaseline = 'alphabetic'
        }
      }
    })

    if (question.status === 'solved') {
      const metaY = y + 39 + layout.characterRows * (tileSize + tileGap) + 10
      ctx.fillStyle = colors.muted
      ctx.font = '500 11.5pt ui-sans-serif, system-ui, sans-serif'
      layout.metaLines.forEach((line, index) => ctx.fillText(line, margin, metaY + index * 22))
    }
    y += layout.height
    ctx.strokeStyle = colors.line
    ctx.beginPath()
    ctx.moveTo(margin, y - 1)
    ctx.lineTo(margin + contentWidth, y - 1)
    ctx.stroke()
  })

  ctx.fillStyle = colors.subtle
  ctx.fillRect(margin, y + 10, contentWidth, 44 + historyLines.length * 23)
  ctx.fillStyle = colors.muted
  ctx.font = '800 11pt ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.labels.history, margin + 16, y + 36)
  ctx.fillStyle = colors.text
  ctx.font = '500 11.5pt ui-sans-serif, system-ui, sans-serif'
  historyLines.forEach((line, index) => ctx.fillText(line, margin + 16, y + 64 + index * 23))

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error('png-failed')), 'image/png'))
  if (window.isSecureContext && navigator.clipboard && 'ClipboardItem' in window) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return 'copied'
    } catch { /* download fallback */ }
  }
  download(blob, `caige-${new Date().toISOString().slice(0, 10)}.png`)
  return 'downloaded'
}
