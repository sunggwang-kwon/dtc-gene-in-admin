<template>
  <v-app>
    <v-main class="d-flex align-center justify-center login-bg">
      <v-container style="max-width: 440px">
        <v-card class="pa-6 pa-sm-10" rounded="lg" elevation="4">
          <!-- 로고 -->
          <div class="d-flex justify-center mb-8">
            <v-img src="/logo.png" max-width="160" />
          </div>

          <v-form ref="formRef" @submit.prevent="login">
            <!-- 아이디 -->
            <v-text-field
              v-model="userId"
              :placeholder="$t('login.idPlaceholder')"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-account-outline"
              autofocus
              class="mb-2"
              hide-details="auto"
            />

            <!-- 비밀번호 -->
            <v-text-field
              v-model="userPw"
              :placeholder="$t('login.passwordPlaceholder')"
              :rules="[rules.required]"
              type="password"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-lock-outline"
              class="mb-4"
              hide-details="auto"
              @keydown.enter="login"
            />

            <!-- 아이디 기억 -->
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
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCookies } from 'vue-cookies'
import { useAuthStore } from '@/stores/auth'
import { useHttp } from '@/composables/useHttp'
import { useValidation } from '@/composables/useValidation'

const router = useRouter()
const $cookies = useCookies()
const authStore = useAuthStore()
const { post } = useHttp()
const rules = useValidation()

const formRef = ref(null)
const userId = ref('')
const userPw = ref('')
const rememberMe = ref(false)
const loading = ref(false)

onMounted(() => {
  // 저장된 아이디 불러오기
  const savedId = $cookies.get('admin_user_id')
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
  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  const res = await post('/server/member/login.php', {
    user_id: userId.value,
    user_pw: userPw.value,
  })
  loading.value = false

  if (!res) return

  authStore.setSession(res.data)

  // 아이디 기억
  if (rememberMe.value) {
    $cookies.set('admin_user_id', userId.value, '365d')
  } else {
    $cookies.remove('admin_user_id')
  }

  // 첫 번째 권한 메뉴로 이동
  const route = authStore.firstAuthorizedRoute
  if (route) {
    router.replace({ name: route })
  } else {
    alert('접근 가능한 메뉴가 없습니다. 관리자에게 문의하세요.')
  }
}
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}
</style>
