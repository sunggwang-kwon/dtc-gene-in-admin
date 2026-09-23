import { createI18n } from 'vue-i18n'
import ko from './locales/ko.json'

const i18n = createI18n({
  legacy: false,
  locale: 'ko',
  fallbackLocale: 'ko',
  messages: { ko },
})

export default i18n
