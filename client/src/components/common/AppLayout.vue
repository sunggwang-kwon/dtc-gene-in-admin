<template>
  <v-app>
    <!-- 앱바 -->
    <v-app-bar elevation="0" border="b" color="surface">
      <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" />
      <router-link to="/" class="d-flex align-center text-decoration-none ml-1">
        <v-img :src="logoUrl" width="100" height="26" contain alt="로고" />
      </router-link>
      <v-spacer />
      <v-menu>
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" variant="text" rounded="xl" class="text-none">
            <v-avatar color="primary" size="32" class="mr-2">
              <span class="text-white text-caption font-weight-bold">
                {{ authStore.username?.substring(0, 1)?.toUpperCase() }}
              </span>
            </v-avatar>
            <span class="d-none d-sm-inline text-body-2">{{ authStore.username }}</span>
            <v-icon size="18" class="ml-1">mdi-chevron-down</v-icon>
          </v-btn>
        </template>
        <v-list density="compact" min-width="160">
          <v-list-item prepend-icon="mdi-account-outline" @click="goProfile">
            <v-list-item-title>정보수정</v-list-item-title>
          </v-list-item>
          <v-divider />
          <v-list-item prepend-icon="mdi-logout" @click="logout">
            <v-list-item-title class="text-error">로그아웃</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- 사이드바 -->
    <v-navigation-drawer v-model="drawer" :temporary="mobile" width="240" border="r" color="surface">
      <v-list density="compact" nav class="pa-3">
        <v-list-item
          v-if="authStore.canRead('M001')"
          to="/member"
          prepend-icon="mdi-account-group-outline"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.member') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.canRead('M007')"
          to="/company"
          prepend-icon="mdi-office-building-outline"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.company') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.canRead('M005')"
          to="/gene"
          prepend-icon="mdi-dna"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.gene') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.canRead('M002')"
          to="/type"
          prepend-icon="mdi-flask-outline"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.type') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.canRead('M003')"
          to="/manage"
          prepend-icon="mdi-test-tube"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.manage') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.canRead('M004')"
          to="/result"
          prepend-icon="mdi-file-document-outline"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.result') }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          v-if="authStore.canRead('M006')"
          to="/banner"
          prepend-icon="mdi-image-outline"
          rounded="lg"
          class="mb-1"
        >
          <v-list-item-title>{{ $t('app.menu.banner') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- 콘텐츠 -->
    <v-main>
      <slot />
      <v-overlay v-model="loading" class="align-center justify-center" persistent>
        <v-progress-circular color="primary" indeterminate size="48" width="3" />
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
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { mobile } = useDisplay()

const drawer = ref(!mobile.value)
const loading = ref(false)

let lastClick = Date.now()
let tokenInterval = null

const handleClick = () => { lastClick = Date.now() }

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

onMounted(() => {
  window.addEventListener('click', handleClick)

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
      // 네트워크 오류 무시
    }
  }, 20 * 60 * 1000)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', handleClick)
  if (tokenInterval) clearInterval(tokenInterval)
})

const goProfile = () => {
  if (authStore.userId) {
    router.push({
      name: 'DetailMember',
      query: { transaction: 'view', lims_id: authStore.userId },
    })
  }
}

const logout = () => {
  if (!confirm('로그아웃 하시겠습니까?')) return
  authStore.clearSession()
  router.replace({ name: 'Login' })
}
</script>
