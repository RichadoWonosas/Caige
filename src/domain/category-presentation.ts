import type { CharacterCategory } from './game'

export const CATEGORY_EMOJI: Record<CharacterCategory, string> = {
  latin: '🟥',
  digit: '🟧',
  'ascii-symbol': '🟨',
  kana: '🟩',
  hangul: '🟦',
  cjk: '🟪',
  'other-letter': '🟫',
  'other-symbol': '⬜',
}

// Matches the commonly used square emoji palette closely while remaining stable in Canvas and CSS.
export const CATEGORY_COLORS: Record<CharacterCategory, string> = {
  latin: '#dd2e44',
  digit: '#f4900c',
  'ascii-symbol': '#fdcb58',
  kana: '#78b159',
  hangul: '#55acee',
  cjk: '#aa8ed6',
  'other-letter': '#c1694f',
  'other-symbol': '#e6e7e8',
}

export const CATEGORY_INK: Record<CharacterCategory, string> = {
  latin: '#ffffff',
  digit: '#111827',
  'ascii-symbol': '#111827',
  kana: '#111827',
  hangul: '#111827',
  cjk: '#111827',
  'other-letter': '#ffffff',
  'other-symbol': '#111827',
}

export const DEFAULT_CATEGORY_EMOJI = '⬛'
export const DEFAULT_CATEGORY_COLOR = '#31373d'
export const DEFAULT_CATEGORY_INK = '#ffffff'
export const FULL_WIDTH_SPACE = '　'
