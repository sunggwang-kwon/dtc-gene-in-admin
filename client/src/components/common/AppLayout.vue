<template>
  <v-app>
    <!-- 상단 앱바 (모바일/데스크탑) -->
    <v-app-bar color="primary" elevation="2">
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-avatar size="28" color="white" class="mr-2">
            <v-img :src="symbolUrl" width="18" height="18" contain alt="로고" />
          </v-avatar>
          <span class="text-body-1 font-weight-bold">유전자 검사 관리</span>
        </div>
      </v-app-bar-title>
      <template #append>
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar color="white" size="32">
                <span class="text-primary text-caption font-weight-bold">
                  {{ authStore.username?.substring(0, 1) }}
                </span>
              </v-avatar>
            </v-btn>
          </template>
          <v-list density="compact" min-width="200">
            <v-list-item>
              <v-list-item-title class="font-weight-bold">{{ authStore.username }}</v-list-item-title>
              <v-list-item-subtitle>{{ authStore.email }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider />
            <v-list-item prepend-icon="mdi-logout" @click="logout">
              <v-list-item-title>{{ $t('app.logout') }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- 사이드 네비게이션 -->
    <v-navigation-drawer v-model="drawer" :temporary="mobile">
      <!-- 드로어 상단 로고 -->
      <div class="pa-4 d-flex align-center justify-center border-b">
        <router-link to="/" class="d-flex align-center justify-center text-decoration-none">
          <v-img :src="logoUrl" max-width="140" height="42" contain alt="지니인사이트 로고" />
        </router-link>
      </div>

      <v-list density="compact" nav class="py-2">
        <v-list-item
          v-if="authStore.hasAuth('M001') === 'Y'"
          prepend-icon="mdi-account-group"
          :title="$t('app.menu.member')"
          to="/member"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.hasAuth('M007') === 'Y'"
          prepend-icon="mdi-domain"
          :title="$t('app.menu.company')"
          to="/company"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.hasAuth('M002') === 'Y'"
          prepend-icon="mdi-flask"
          :title="$t('app.menu.type')"
          to="/type"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.hasAuth('M003') === 'Y'"
          prepend-icon="mdi-test-tube"
          :title="$t('app.menu.manage')"
          to="/manage"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.hasAuth('M004') === 'Y'"
          prepend-icon="mdi-file-document"
          :title="$t('app.menu.result')"
          to="/result"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.hasAuth('M005') === 'Y'"
          prepend-icon="mdi-dna"
          :title="$t('app.menu.gene')"
          to="/gene"
          rounded="lg"
        />
        <v-list-item
          v-if="authStore.hasAuth('M006') === 'Y'"
          prepend-icon="mdi-image"
          :title="$t('app.menu.banner')"
          to="/banner"
          rounded="lg"
        />
      </v-list>
    </v-navigation-drawer>

    <!-- 메인 콘텐츠 -->
    <v-main>
      <v-container fluid class="pa-4">
        <slot />
      </v-container>

      <!-- 전역 로딩 오버레이 -->
      <v-overlay v-model="loading" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="64" />
      </v-overlay>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import axios from 'axios'
import logoUrl from '@/assets/geni-in-logo.svg'
import symbolUrl from '@/assets/symbol-logo.svg'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawer = ref(!mobile.value) // 데스크탑은 기본 열림
const loading = ref(false)

// 자동 로그아웃: 60분 무입력
let lastClick = Date.now()
let tokenInterval = null

const handleClick = () => { lastClick = Date.now() }

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

onMounted(() => {
  window.addEventListener('click', handleClick)

  // 20분마다 토큰 갱신, 60분 무입력 시 자동 로그아웃
  tokenInterval = setInterval(async () => {
    if (!authStore.isLoggedIn) return

    if (Date.now() > lastClick + 60 * 60 * 1000) {
      authStore.clearSession()
      router.replace({ name: 'Login' })
      alert('장시간 미사용으로 자동 로그아웃 되었습니다.')
      return
    }

    try {
      const res = await axios({
        method: 'get',
        url: BASE_URL + '/server/common/reissuance_token.php',
        headers: { jwt: authStore.jwt },
      })
      if (res.status === 200 && res.data.ret === '0000') {
        authStore.updateJwt(res.data.jwt)
      } else {
        authStore.clearSession()
        router.replace({ name: 'Login' })
        alert('세션이 만료되었습니다. 다시 로그인해주세요.')
      }
    } catch {
      // 네트워크 오류 시 무시
    }
  }, 20 * 60 * 1000) // 20분
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClick)
  if (tokenInterval) clearInterval(tokenInterval)
})

const logout = () => {
  if (!confirm('로그아웃 하시겠습니까?')) return
  authStore.clearSession()
  router.replace({ name: 'Login' })
}
</script>
