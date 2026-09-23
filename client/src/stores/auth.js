import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    jwt: null,
    userid: null,
    username: null,
    level: null,
    email: null,
    lastaccesstime: null,
    lang: null,
    auth: [], // [{ menu_code: 'M001', auth: 'Y' }, ...]
  }),
  getters: {
    isLoggedIn: (state) => !!state.jwt,
    hasAuth: (state) => (menuCode) => {
      if (state.level === 'A') return 'A'
      const item = state.auth.find((a) => a.menu_code === menuCode)
      return item ? item.auth : null
    },
    canRead: (state) => (menuCode) => {
      if (state.level === 'A') return true
      const item = state.auth.find((a) => a.menu_code === menuCode)
      return !!(item && item.auth)
    },
    canManage: (state) => (menuCode) => {
      if (state.level === 'A') return true
      const item = state.auth.find((a) => a.menu_code === menuCode)
      return !!(item && (item.auth === 'A' || item.auth === 'Y'))
    },
    // 권한 있는 첫 번째 메뉴 라우트 이름 반환
    firstAuthorizedRoute: (state) => {
      const menuMap = [
        { code: 'M001', route: 'Member' },
        { code: 'M007', route: 'Company' },
        { code: 'M002', route: 'Type' },
        { code: 'M003', route: 'Manage' },
        { code: 'M004', route: 'Result' },
        { code: 'M005', route: 'Gene' },
        { code: 'M006', route: 'Banner' },
      ]
      for (const menu of menuMap) {
        if (state.level === 'A') return menu.route
        const item = state.auth.find((a) => a.menu_code === menu.code)
        if (item && item.auth) return menu.route
      }
      return null
    },
  },
  actions: {
    setSession(data) {
      this.jwt = data.jwt
      this.userid = data.Userid
      this.username = data.Username
      this.level = data.Level
      this.email = data.Email
      this.lastaccesstime = data.Lastaccesstime
      this.lang = data.Lang
      this.auth = data.Auth || []
    },
    clearSession() {
      this.$reset()
    },
    updateJwt(jwt) {
      this.jwt = jwt
    },
  },
  persist: {
    storage: sessionStorage,
  },
})
