import Vue from 'vue'
import Vuetify from 'vuetify/lib'

Vue.use(Vuetify)

export default new Vuetify({
  theme: {
    options: {
      customProperties: true, // CSS 변수(--v-primary-base 등)를 자동 생성
    },
    themes: {
      light: {
        // --- Primary ---
        primary:   '#336BD6',  // --color-primary
        secondary: '#555555',  // --color-text-secondary
        accent:    '#336BD6',

        // --- Semantic ---
        error:   '#ef4444',
        success: '#22c55e',
        warning: '#f59e0b',
        info:    '#336BD6',

        // --- Surface ---
        background: '#ffffff',
        surface:    '#ffffff',

        // --- Custom (Vuetify 2 treats unknown keys as CSS variables) ---
        anchor: '#336BD6',  // <a> 태그 기본 색상
      },
    },
  },
})

