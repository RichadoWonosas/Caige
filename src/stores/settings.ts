import { defineStore } from 'pinia'
import type { CharacterCategory, GameMode, Locale, ThemePreference } from '../domain/game'
import { CATEGORY_KEYS } from '../domain/game'

const defaultCategories = Object.fromEntries(CATEGORY_KEYS.map((key) => [key, true])) as Record<CharacterCategory, boolean>

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    mode: 'song-battle-royale' as GameMode,
    theme: (localStorage.getItem('caige.theme') || 'system') as ThemePreference,
    locale: (localStorage.getItem('caige.locale') || 'zh-Hans') as Locale,
    distinguishCharacterTypes: true,
    visibleCategories: { ...defaultCategories },
  }),
  actions: {
    setTheme(theme: ThemePreference) {
      this.theme = theme
      localStorage.setItem('caige.theme', theme)
    },
    setLocale(locale: Locale) {
      this.locale = locale
      localStorage.setItem('caige.locale', locale)
    },
  },
})
