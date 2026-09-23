<template>
  <v-app>
    <v-main class="d-flex align-center justify-center bg-blue-lighten-5" style="min-height: 100vh;">
      <v-card width="420" class="pa-8" rounded="xl" elevation="2">
        <!-- 로고 -->
        <div class="text-center mb-8">
          <v-img :src="logoUrl" max-width="180" height="60" contain class="mx-auto mb-4" alt="로고" />
          <div class="text-body-2 text-medium-emphasis">관리자 시스템에 로그인하세요</div>
        </div>

        <v-form ref="formRef" @submit.prevent="login">
          <v-text-field
            v-model="userId"
            label="아이디"
            prepend-inner-icon="mdi-account-outline"
            autofocus
            hide-details="auto"
            class="mb-4"
          />

          <v-text-field
            v-model="userPw"
            label="비밀번호"
            type="password"
            prepend-inner-icon="mdi-lock-outline"
            hide-details="auto"
            class="mb-2"
          />

          <v-checkbox
            v-model="rememberMe"
            label="아이디 저장"
            density="compact"
            hide-details
            color="primary"
            class="mb-6"
          />

          <v-btn
            type="submit"
            color="primary"
            block
            size="large"
            :loading="loading"
            rounded="lg"
          >
            로그인
          </v-btn>
        </v-form>
      </v-card>
    </v-main>

    <v-snackbar
      v-model="showError"
      :timeout="4000"
      location="bottom right"
      color="error"
      rounded="lg"
    >
      <div class="d-flex align-center">
        <v-icon icon="mdi-alert-circle-outline" class="mr-2" />
        {{ errorMessage }}
      </div>
      <template #actions>
        <v-btn variant="text" icon="mdi-close" size="small" @click="showError = false" />
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import VueCookies from 'vue-cookies'
import logoUrl from '@/assets/geni-in-logo.svg'
import { useAuthStore } from '@/stores/auth'
import { useHttp } from '@/composables/useHttp'

const router = useRouter()
const authStore = useAuthStore()
const { post } = useHttp()

const formRef = ref(null)
const userId = ref('')
const userPw = ref('')
const rememberMe = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const showError = ref(false)

const setError = (msg) => {
  errorMessage.value = msg
  showError.value = true
}

onMounted(() => {
  const savedId = VueCookies.get('admin_user_id')
  if (savedId) {
    userId.value = savedId
    rememberMe.value = true
  }
  if (authStore.isLoggedIn) {
    const route = authStore.firstAuthorizedRoute
    if (route) router.replace({ name: route })
  }
})

const login = async () => {
  const u = (userId.value || '').trim()
  const p = (userPw.value || '').trim()

  if (!u) return setError('아이디를 입력해주세요.')
  if (!p) return setError('비밀번호를 입력해주세요.')

  loading.value = true
  const res = await post('/server/member/login.php', { user_id: u, user_pw: p }, { suppressAlert: true })
  loading.value = false

  if (!res) return setError('네트워크 오류가 발생했습니다.')
  if (res.data?.ret !== '0000') return setError(res.data?.msg || '아이디 또는 비밀번호를 확인해주세요.')

  authStore.setSession(res.data)

  if (rememberMe.value) {
    VueCookies.set('admin_user_id', u, '365d')
  } else {
    VueCookies.remove('admin_user_id')
  }

  const route = authStore.firstAuthorizedRoute
  if (route) {
    router.replace({ name: route })
  } else {
    setError('접근 가능한 메뉴가 없습니다.')
  }
}
</script>
