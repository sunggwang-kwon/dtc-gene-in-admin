<template>
  <v-app>
    <v-main class="d-flex align-center justify-center login-bg">
      <v-container style="max-width: 440px">
        <v-card class="pa-6 pa-sm-10" rounded="lg" elevation="4">
          <!-- 로고 -->
          <div class="d-flex justify-center mb-8">
            <v-img :src="logoUrl" max-width="200" height="70" contain alt="지니인사이트 로고" />
          </div>

          <v-form ref="formRef" @submit.prevent="login">
            <!-- 아이디 -->
            <v-text-field
              v-model="userId"
              :placeholder="$t('login.idPlaceholder')"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              autofocus
              :hide-details="true"
              class="mb-3"
            />

            <!-- 비밀번호 -->
            <v-text-field
              v-model="userPw"
              :placeholder="$t('login.passwordPlaceholder')"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              :hide-details="true"
              class="mb-3"
            />

            <!-- 아이디 저장 -->
            <v-checkbox
              v-model="rememberMe"
              :label="$t('login.rememberId')"
              density="compact"
              hide-details
              class="mb-4"
            />

            <!-- 로그인 버튼 -->
            <v-btn
              type="submit"
              color="primary"
              block
              size="large"
              :loading="loading"
              rounded="lg"
            >
              {{ $t('login.submit') }}
            </v-btn>
          </v-form>
        </v-card>
      </v-container>
    </v-main>

    <!-- VS Code 스타일 우측 하단 플로팅 토스트 알림 -->
    <transition name="toast-slide">
      <div
        v-if="errorMessage"
        class="vscode-toast"
        role="alert"
      >
        <div class="toast-content">
          <v-icon icon="mdi-alert-circle" color="#f14c4c" size="18" class="mr-2 flex-shrink-0" />
          <span class="toast-text">{{ errorMessage }}</span>
        </div>
        <button type="button" class="toast-close" @click="closeError" aria-label="닫기">
          <v-icon icon="mdi-close" size="16" />
        </button>
      </div>
    </transition>
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
let errorTimer = null

const showError = (msg) => {
  errorMessage.value = msg
  if (errorTimer) clearTimeout(errorTimer)
  errorTimer = setTimeout(() => {
    errorMessage.value = ''
  }, 4000)
}

const closeError = () => {
  errorMessage.value = ''
  if (errorTimer) clearTimeout(errorTimer)
}

onMounted(() => {
  // 저장된 아이디 불러오기
  const savedId = VueCookies.get('admin_user_id')
  if (savedId) {
    userId.value = savedId
    rememberMe.value = true
  }
  // 이미 로그인된 경우 첫 권한 메뉴로 이동
  if (authStore.isLoggedIn) {
    const route = authStore.firstAuthorizedRoute
    if (route) router.replace({ name: route })
  }
})

const login = async () => {
  const u = (userId.value || '').trim()
  const p = (userPw.value || '').trim()

  if (!u) {
    showError('아이디를 입력해주세요.')
    return
  }
  if (!p) {
    showError('비밀번호를 입력해주세요.')
    return
  }

  loading.value = true
  const res = await post(
    '/server/member/login.php',
    {
      user_id: u,
      user_pw: p,
    },
    { suppressAlert: true }
  )
  loading.value = false

  if (!res) {
    showError('네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    return
  }

  if (res.data?.ret !== '0000') {
    showError(res.data?.msg || '로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.')
    return
  }

  authStore.setSession(res.data)

  // 아이디 저장
  if (rememberMe.value) {
    VueCookies.set('admin_user_id', u, '365d')
  } else {
    VueCookies.remove('admin_user_id')
  }

  // 첫 번째 권한 메뉴로 이동
  const route = authStore.firstAuthorizedRoute
  if (route) {
    router.replace({ name: route })
  } else {
    showError('접근 가능한 메뉴가 없습니다. 관리자에게 문의하세요.')
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.vscode-toast {
  position: fixed !important;
  right: 24px !important;
  bottom: 24px !important;
  z-index: 999999 !important;
  background: #252526;
  color: #cccccc;
  border-left: 4px solid #f14c4c;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
  border-radius: 6px;
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-width: 280px;
  max-width: 440px;
  font-size: 13px;
  line-height: 1.4;
  pointer-events: auto;
}

.toast-content {
  display: flex;
  align-items: center;
  word-break: keep-all;
}

.toast-text {
  color: #f1f1f1;
  font-weight: 500;
}

.toast-close {
  background: none;
  border: none;
  color: #858585;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.toast-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: #ffffff;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
}

.toast-slide-enter-from,
.toast-slide-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>
