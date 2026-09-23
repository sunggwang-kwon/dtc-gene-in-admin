import Vue from 'vue'
import VueI18n from 'vue-i18n'
import ko from '@/locales/ko.json'
import en from '@/locales/en.json'

Vue.use(VueI18n)

const LOCALE_STORAGE_KEY = 'app.locale'
const DEFAULT_LOCALE = 'ko'

const normalizeLocale = (locale) => {
  if (!locale) return DEFAULT_LOCALE
  const value = String(locale).toLowerCase()

  if (value === 'ko' || value.startsWith('ko') || value === 'kor') {
    return 'ko'
  }

  if (value === 'en' || value.startsWith('en') || value === 'eng') {
    return 'en'
  }

  return DEFAULT_LOCALE
}

const getSavedLocale = () => {
  try {
    return localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch (error) {
    return null
  }
}

const saveLocale = (locale) => {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch (error) {
    // no-op: localStorage can be unavailable in some environments
  }
}

const resolveInitialLocale = () => {
  const saved = getSavedLocale()
  if (saved) {
    return normalizeLocale(saved)
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return normalizeLocale(navigator.language)
  }

  return DEFAULT_LOCALE
}

const i18n = new VueI18n({
  locale: resolveInitialLocale(),
  fallbackLocale: DEFAULT_LOCALE,
  messages: {
    ko,
    en
  },
  silentFallbackWarn: true
})

const getPhraseMap = () => {
  const message = i18n.getLocaleMessage('en')
  return message && message.phrases ? message.phrases : {}
}

const interpolate = (template, params = {}) => {
  if (!template || typeof template !== 'string') return template
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return Object.prototype.hasOwnProperty.call(params, key) ? params[key] : `{${key}}`
  })
}

const translateCoreText = (text, locale, params = {}) => {
  const normalized = normalizeLocale(locale)
  if (normalized !== 'en') {
    return interpolate(text, params)
  }

  const phraseMap = getPhraseMap()
  const direct = phraseMap[text]
  if (direct) {
    return interpolate(direct, params)
  }

  let match = text.match(/^선택한 (.+) (\d+)건을 삭제하시겠습니까\?$/)
  if (match) {
    const target = phraseMap[match[1]] || match[1]
    return `Do you want to delete ${match[2]} selected ${target}?`
  }

  match = text.match(/^선택한 (.+) (\d+) 건을 삭제하시겠습니까\?$/)
  if (match) {
    const target = phraseMap[match[1]] || match[1]
    return `Do you want to delete ${match[2]} selected ${target}?`
  }

  match = text.match(/^선택한 (\d+)건 삭제하시겠습니까\?$/)
  if (match) {
    return `Do you want to delete ${match[1]} selected items?`
  }

  match = text.match(/^에러가 (\d+)건 발생했습니다\.?$/)
  if (match) {
    return `${match[1]} error(s) occurred.`
  }

  match = text.match(/^총 (\d+)건 중 (\d+)건 삭제에 성공했습니다\.?$/)
  if (match) {
    return `Deleted ${match[2]} out of ${match[1]} items.`
  }

  match = text.match(/^전체 (\d+)건 중 (\d+)건 삭제 되었습니다\.?$/)
  if (match) {
    return `Deleted ${match[2]} out of ${match[1]} items.`
  }

  return interpolate(text, params)
}

export const translateDynamicText = (input, locale = i18n.locale, params = {}) => {
  const source = input == null ? '' : String(input)

  const leading = source.match(/^\s*/)?.[0] || ''
  const trailing = source.match(/\s*$/)?.[0] || ''
  const core = source.slice(leading.length, source.length - trailing.length)

  if (!core) {
    return source
  }

  const translated = translateCoreText(core, locale, params)
  return `${leading}${translated}${trailing}`
}

export const setI18nLocale = (locale) => {
  const normalized = normalizeLocale(locale)
  i18n.locale = normalized
  saveLocale(normalized)
  return normalized
}

export const toServerLangCode = (locale) => {
  const normalized = normalizeLocale(locale)
  return normalized === 'en' ? 'eng' : 'kor'
}

export const tr = (locale, text, params = {}) => {
  return translateDynamicText(text, locale, params)
}

export default i18n
