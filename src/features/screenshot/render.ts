export interface BoardSnapshot {
  title: string
  subtitle: string
  theme: 'light' | 'dark'
  currentActor?: string
  players: Array<{ name: string; status: string }>
  questions: Array<{ title: string; author?: string; status: string; display: string }>
  history: string[]
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function copyBoardImage(snapshot: BoardSnapshot): Promise<'copied' | 'downloaded'> {
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const width = 1200
  const height = Math.max(720, 330 + snapshot.questions.length * 92 + Math.min(snapshot.history.length, 6) * 34)
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-unavailable')
  ctx.scale(scale, scale)
  const dark = snapshot.theme === 'dark'
  const colors = dark
    ? { bg: 'hsl(222 47% 8%)', surface: 'hsl(220 30% 12%)', text: 'hsl(210 40% 96%)', muted: 'hsl(215 18% 65%)', accent: 'hsl(24 94% 58%)', line: 'hsl(218 22% 25%)' }
    : { bg: 'hsl(48 33% 97%)', surface: 'hsl(0 0% 100%)', text: 'hsl(222 47% 11%)', muted: 'hsl(218 12% 45%)', accent: 'hsl(16 84% 50%)', line: 'hsl(40 18% 83%)' }
  ctx.fillStyle = colors.bg
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = colors.accent
  ctx.fillRect(0, 0, 18, height)
  ctx.fillStyle = colors.text
  ctx.font = '700 48px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.title, 66, 82)
  ctx.fillStyle = colors.muted
  ctx.font = '500 20px ui-sans-serif, system-ui, sans-serif'
  ctx.fillText(snapshot.subtitle, 68, 118)
  if (snapshot.currentActor) {
    ctx.fillStyle = colors.accent
    ctx.font = '700 20px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(snapshot.currentActor, 68, 160)
  }
  let y = 205
  for (const question of snapshot.questions) {
    ctx.fillStyle = colors.surface
    ctx.fillRect(52, y, 1096, 72)
    ctx.strokeStyle = colors.line
    ctx.strokeRect(52.5, y + 0.5, 1095, 71)
    ctx.fillStyle = colors.text
    ctx.font = '700 18px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(question.title || 'Untitled', 76, y + 28)
    ctx.fillStyle = colors.muted
    ctx.font = '500 14px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText([question.author, question.status].filter(Boolean).join(' · '), 76, y + 52)
    ctx.fillStyle = colors.text
    ctx.font = '700 24px ui-monospace, SFMono-Regular, monospace'
    ctx.textAlign = 'right'
    ctx.fillText(question.display, 1120, y + 44)
    ctx.textAlign = 'left'
    y += 88
  }
  if (snapshot.players.length) {
    y += 14
    ctx.fillStyle = colors.text
    ctx.font = '700 16px ui-sans-serif, system-ui, sans-serif'
    ctx.fillText(snapshot.players.map((player) => `${player.name} · ${player.status}`).join('    '), 68, y)
    y += 40
  }
  ctx.fillStyle = colors.muted
  ctx.font = '500 14px ui-sans-serif, system-ui, sans-serif'
  for (const line of snapshot.history.slice(-6)) {
    ctx.fillText(line, 68, y)
    y += 28
  }
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
