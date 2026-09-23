import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: { mdi },
  },
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#3B82F6',
          secondary: '#64748B',
          accent: '#8B5CF6',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
          success: '#22C55E',
          background: '#F1F5F9',
          surface: '#FFFFFF',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; letter-spacing: 0;',
      elevation: 0,
    },
    VCard: {
      elevation: 0,
    },
    VTextField: {
      variant: 'outlined',
      density: 'compact',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'compact',
      color: 'primary',
    },
  },
})
