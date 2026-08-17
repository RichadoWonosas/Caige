import { defineStore } from 'pinia'
import type { CharacterCategory, GameMode, Locale, ThemePreference } from '../domain/game'
import { CATEGORY_KEYS } from '../domain/game'

const defaultCategories = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, true])) as Record<CharacterCategory, boolean>
const storedHueValue = localStorage.getItem('caige.accentHue')
const storedHue = storedHueValue === null ? Number.NaN : Number(storedHueValue)
const defaultAccentHue = Number.isFinite(storedHue) ? ((Math.round(storedHue) % 360) + 360) % 360 : 16

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    mode: 'song-battle-royale' as GameMode,
    theme: (localStorage.getItem('caige.theme') || 'system') as ThemePreference,
    accentHue: defaultAccentHue,
    locale: (localStorage.getItem('caige.locale') || 'zh-Hans') as Locale,
    distinguishCharacterTypes: true,
    visibleCategories: { ...defaultCategories },
    hideSolvedAfterNextAction: true,
  }),
  actions: {
    setTheme(theme: ThemePreference) {
      this.theme = theme
      localStorage.setItem('caige.theme', theme)
    },
    setAccentHue(hue: number) {
      const safeHue = Number.isFinite(Number(hue)) ? Number(hue) : defaultAccentHue
      this.accentHue = ((Math.round(safeHue) % 360) + 360) % 360
      localStorage.setItem('caige.accentHue', String(this.accentHue))
    },
    setLocale(locale: Locale) {
      this.locale = locale
      localStorage.setItem('caige.locale', locale)
    },
  },
})
