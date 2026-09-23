<template>
  <v-container fluid class="pa-6">
    <!-- 상단 헤더 -->
    <v-card flat border rounded="lg" class="mb-4">
      <v-card-text class="py-4">
        <v-row align="center" justify="space-between">
          <v-col cols="auto" class="d-flex align-center">
            <v-btn icon variant="text" size="small" class="mr-2" @click="goBack">
              <v-icon icon="mdi-chevron-left" size="28" />
            </v-btn>
            <h2 class="text-h6 font-weight-bold mb-0">
              {{ transaction === 'insert' ? '사용자 추가' : (transaction === 'update' ? '사용자 정보 수정' : '사용자 정보') }}
            </h2>
          </v-col>
          <v-col cols="auto" class="d-flex ga-2 align-center">
            <!-- 조회 모드 버튼 -->
            <template v-if="transaction === 'view'">
              <v-btn
                v-if="canManage"
                color="error"
                variant="tonal"
                @click="onDelete"
              >
                삭제
              </v-btn>
              <v-btn
                v-if="canManage || isSelf"
                color="primary"
                @click="transaction = 'update'"
              >
                수정
              </v-btn>
            </template>

            <!-- 수정 모드 버튼 -->
            <template v-else-if="transaction === 'update'">
              <v-btn variant="outlined" color="primary" @click="cancelUpdate">
                취소
              </v-btn>
              <v-btn color="primary" :loading="saving" @click="saveMember">
                저장
              </v-btn>
            </template>

            <!-- 등록 모드 버튼 -->
            <template v-else-if="transaction === 'insert'">
              <v-btn variant="outlined" color="primary" @click="goBack">
                취소
              </v-btn>
              <v-btn color="primary" :loading="saving" @click="saveMember">
                저장
              </v-btn>
            </template>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 사용자 정보 입력 폼 -->
    <v-card flat border rounded="lg">
      <v-card-text class="pa-6">
        <v-form ref="formRef" @submit.prevent="saveMember">
          <!-- 기본 정보 섹션 -->
          <div class="text-subtitle-1 font-weight-bold mb-4 pb-2 border-b d-flex align-center">
            <v-icon icon="mdi-card-account-details-outline" size="20" class="mr-2 text-primary" />
            기본 정보
          </div>

          <v-row>
            <!-- 아이디 -->
            <v-col cols="12" md="6">
              <v-row no-gutters align="center">
                <v-col>
                  <v-text-field
                    v-model="form.userId"
                    label="아이디"
                    :placeholder="transaction === 'insert' ? '4~20자의 영문, 숫자' : ''"
                    :readonly="transaction !== 'insert'"
                    :disabled="transaction === 'update'"
                    :rules="transaction === 'insert' ? [rules.required, rules.idRule] : []"
                    variant="outlined"
                    density="comfortable"
                    @update:model-value="idChecked = false"
                  />
                </v-col>
                <v-col v-if="transaction === 'insert'" cols="auto" class="pl-2">
                  <v-btn
                    color="primary"
                    variant="flat"
                    height="44"
                    @click="checkIdDuplicate"
                  >
                    {{ idChecked ? '확인완료' : '중복확인' }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>

            <!-- 사용자명 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.name"
                label="사용자명"
                :readonly="transaction === 'view'"
                :rules="transaction !== 'view' ? [rules.required] : []"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- 비밀번호 (수정/등록 시) -->
            <template v-if="transaction !== 'view'">
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.password"
                  :label="transaction === 'insert' ? '비밀번호' : '변경할 비밀번호'"
                  :placeholder="transaction === 'insert' ? '8~16자 영문, 숫자, 특수문자' : '변경 시에만 입력'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="transaction === 'insert' ? [rules.required, rules.passwordRule] : [rules.passwordRule]"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  variant="outlined"
                  density="comfortable"
                  @click:append-inner="showPassword = !showPassword"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.passwordConfirm"
                  :label="transaction === 'insert' ? '비밀번호 확인' : '변경할 비밀번호 확인'"
                  :placeholder="transaction === 'insert' ? '동일한 비밀번호 재입력' : '변경 시에만 입력'"
                  :type="showPassword ? 'text' : 'password'"
                  :rules="transaction !== 'view' ? [passwordMatchRule] : []"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
            </template>

            <!-- 관리자구분 -->
            <v-col cols="12" md="6">
              <v-select
                v-model="form.level"
                label="관리자 구분"
                :items="levelItems"
                item-title="text"
                item-value="value"
                :readonly="transaction === 'view' || !canManage"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- 이메일 -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="form.email"
                label="이메일"
                placeholder="example@domain.com"
                :readonly="transaction === 'view'"
                :rules="[rules.emailRule]"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- 조직 -->
            <v-col cols="12" md="4">
              <v-select
                v-model="form.orgCode"
                label="조직"
                :items="orgList"
                item-title="value"
                item-value="code"
                :readonly="transaction === 'view'"
                :rules="transaction !== 'view' ? [rules.required] : []"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- 소속기관/회사 -->
            <v-col cols="12" md="4">
              <v-select
                v-model="form.companyNo"
                label="소속기관/회사"
                :items="companyList"
                item-title="company_name"
                item-value="seq"
                :readonly="transaction === 'view'"
                :rules="transaction !== 'view' ? [rules.required] : []"
                variant="outlined"
                density="comfortable"
              />
            </v-col>

            <!-- 사용 언어 -->
            <v-col cols="12" md="4">
              <v-select
                v-model="form.langCd"
                label="기본 언어"
                :items="langList"
                item-title="value"
                item-value="code"
                :readonly="transaction === 'view'"
                :rules="transaction !== 'view' ? [rules.required] : []"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
          </v-row>

          <!-- 메뉴 접근 권한 섹션 (관리자만 설정 가능) -->
          <div v-if="canManage || transaction === 'view'" class="mt-6">
            <div class="text-subtitle-1 font-weight-bold mb-4 pb-2 border-b d-flex align-center">
              <v-icon icon="mdi-shield-account-outline" size="20" class="mr-2 text-primary" />
              메뉴 접근 권한 설정
            </div>

            <!-- 메뉴 선택 체크박스 그리드 -->
            <div class="text-caption text-medium-emphasis mb-2">접근 가능한 메뉴를 선택하세요.</div>
            <v-row class="mb-4">
              <v-col
                v-for="menu in menuList"
                :key="menu.code"
                cols="6"
                sm="4"
                md="3"
                lg="auto"
              >
                <v-checkbox
                  v-model="checkedMenus"
                  :value="menu.code"
                  :label="menu.value"
                  :disabled="transaction === 'view'"
                  density="compact"
                  hide-details
                />
              </v-col>
            </v-row>

            <!-- 메뉴별 권한 레벨 (읽기 vs 읽기/쓰기) -->
            <template v-if="checkedMenus.length > 0">
              <div class="text-caption text-medium-emphasis mb-2">선택한 메뉴의 상세 권한을 설정하세요.</div>
              <v-table density="compact" class="border rounded">
                <thead>
                  <tr>
                    <th style="width: 200px">메뉴명</th>
                    <th>권한 레벨</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="menuCode in checkedMenus" :key="menuCode">
                    <td class="font-weight-medium">{{ getMenuName(menuCode) }}</td>
                    <td>
                      <v-radio-group
                        v-model="menuAuth[menuCode]"
                        inline
                        density="compact"
                        hide-details
                        :disabled="transaction === 'view'"
                      >
                        <v-radio label="읽기 (조회)" value="N" class="mr-4" />
                        <v-radio label="읽기/쓰기 (관리)" value="A" />
                      </v-radio-group>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </template>
          </div>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHttp } from '@/composables/useHttp'
import { useValidation } from '@/composables/useValidation'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { get, post } = useHttp()
const rules = useValidation()

const formRef = ref(null)
const transaction = ref(route.query.transaction || 'view') // 'view', 'insert', 'update'
const targetUserId = ref(route.query.lims_id || '')

const saving = ref(false)
const showPassword = ref(false)
const idChecked = ref(false)

// 권한 확인
const canManage = computed(() => {
  const auth = authStore.hasAuth('M001')
  return auth === 'A' || auth === 'Y' || authStore.level === 'A'
})

const isSelf = computed(() => {
  return authStore.userId === targetUserId.value
})

const levelItems = computed(() => {
  if (authStore.level === 'A') {
    return [
      { text: '관리자', value: 'A' },
      { text: '일반사용자', value: 'N' },
    ]
  }
  return [{ text: '일반사용자', value: 'N' }]
})

// 입력 폼 데이터
const form = reactive({
  userId: '',
  name: '',
  password: '',
  passwordConfirm: '',
  email: '',
  level: 'N',
  orgCode: '',
  companyNo: '',
  langCd: 'kor',
})

// 공통 코드 데이터
const orgList = ref([])
const menuList = ref([])
const langList = ref([])
const companyList = ref([])

// 메뉴 권한 데이터
const checkedMenus = ref([])
const menuAuth = reactive({})

// 비밀번호 일치 규칙
const passwordMatchRule = (v) => {
  if (transaction.value === 'update' && !form.password) return true
  return v === form.password || '비밀번호가 일치하지 않습니다.'
}

const getMenuName = (code) => {
  const menu = menuList.value.find((m) => m.code === code)
  return menu ? menu.value : code
}

// 기초 코드 목록 조회
const loadCodes = async () => {
  try {
    const res = await get('/server/common/get_code_list.php')
    if (res && res.data && res.data.info) {
      orgList.value = res.data.info.filter((item) => item.group_code === 'G0001')
      menuList.value = res.data.info.filter((item) => item.group_code === 'G0002')
      langList.value = res.data.info.filter((item) => item.group_code === 'G0004')

      menuList.value.forEach((m) => {
        if (!menuAuth[m.code]) menuAuth[m.code] = 'N'
      })
    }
  } catch (err) {
    console.error('공통 코드 로드 실패:', err)
  }

  try {
    const res = await get('/server/company/get_company_popup.php')
    if (res && res.data && res.data.info) {
      companyList.value = res.data.info
    }
  } catch (err) {
    console.error('업체 목록 로드 실패:', err)
  }
}

// 회원 상세 정보 조회
const loadMember = async (userId) => {
  if (!userId) return
  try {
    const res = await get('/server/member/get_member.php', { user_id: userId })
    if (res && res.data && res.data.info) {
      const info = res.data.info
      form.userId = info.lims_id || userId
      form.name = info.name || ''
      form.email = info.email || ''
      form.level = info.level || 'N'
      form.orgCode = info.org_code || ''
      form.companyNo = info.company_no !== '0' ? Number(info.company_no) || info.company_no : ''
      form.langCd = info.lang_cd || 'kor'

      // 권한 매핑
      checkedMenus.value = []
      if (Array.isArray(info.auth)) {
        info.auth.forEach((a) => {
          checkedMenus.value.push(a.menu_code)
          menuAuth[a.menu_code] = a.auth || 'N'
        })
      }
    }
  } catch (err) {
    console.error('사용자 정보 로드 실패:', err)
  }
}

// 아이디 중복 확인
const checkIdDuplicate = async () => {
  const id = form.userId?.trim()
  if (!id) {
    alert('아이디를 먼저 입력해주세요.')
    return
  }
  const checkRule = rules.idRule(id)
  if (checkRule !== true) {
    alert(typeof checkRule === 'string' ? checkRule : '올바른 아이디 형식이 아닙니다.')
    return
  }

  try {
    const res = await get('/server/member/id_check.php', { user_id: id })
    if (res && res.data && res.data.ret === '0000') {
      idChecked.value = true
      alert('사용 가능한 아이디입니다.')
    } else {
      idChecked.value = false
      alert(res?.data?.msg || '이미 사용 중인 아이디입니다.')
    }
  } catch {
    idChecked.value = false
    alert('중복 확인 중 오류가 발생했습니다.')
  }
}

// 사용자 저장/수정
const saveMember = async () => {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) return
  }

  if (transaction.value === 'insert' && !idChecked.value) {
    alert('아이디 중복확인을 완료해주세요.')
    return
  }

  if (checkedMenus.value.length === 0) {
    alert('최소 하나 이상의 메뉴 접근 권한을 선택해야 합니다.')
    return
  }

  const ok = confirm(
    transaction.value === 'insert'
      ? '사용자를 등록하시겠습니까?'
      : '사용자 정보를 수정하시겠습니까?'
  )
  if (!ok) return

  // 권한 배열 빌드
  const authPayload = checkedMenus.value.map((code) => ({
    menu_code: code,
    auth: menuAuth[code] || 'N',
  }))

  const payload = {
    transaction: transaction.value,
    user_id: form.userId,
    name: form.name,
    password: form.password || '',
    password2: form.passwordConfirm || '',
    email: form.email,
    level: form.level,
    org_code: form.orgCode,
    company_no: form.companyNo,
    lang_cd: form.langCd,
    auth: JSON.stringify(authPayload),
  }

  saving.value = true
  try {
    const res = await post('/server/member/set_member.php', payload)
    saving.value = false

    if (res && res.data && res.data.ret === '0000') {
      alert('성공적으로 저장되었습니다.')
      if (transaction.value === 'insert') {
        router.replace({ name: 'Member' })
      } else {
        transaction.value = 'view'
        loadMember(form.userId)
      }
    } else {
      alert(res?.data?.msg || '저장에 실패했습니다.')
    }
  } catch (err) {
    saving.value = false
    alert(err.message || '저장 중 오류가 발생했습니다.')
  }
}

// 삭제
const onDelete = async () => {
  const ok = confirm(`'${form.name || form.userId}' 사용자를 정말 삭제하시겠습니까?`)
  if (!ok) return

  saving.value = true
  try {
    const res = await post('/server/member/set_member.php', {
      transaction: 'delete',
      user_id: form.userId,
    })
    saving.value = false
    if (res && res.data && res.data.ret === '0000') {
      alert('삭제되었습니다.')
      router.replace({ name: 'Member' })
    } else {
      alert(res?.data?.msg || '삭제에 실패했습니다.')
    }
  } catch (err) {
    saving.value = false
    alert(err.message || '삭제 중 오류가 발생했습니다.')
  }
}

// 수정 취소
const cancelUpdate = () => {
  form.password = ''
  form.passwordConfirm = ''
  transaction.value = 'view'
  loadMember(targetUserId.value)
}

// 뒤로가기
const goBack = () => {
  router.push({ name: 'Member' })
}

onMounted(async () => {
  await loadCodes()
  if (transaction.value === 'insert') {
    form.level = 'N'
    form.langCd = 'kor'
  } else if (targetUserId.value) {
    await loadMember(targetUserId.value)
  }
})
</script>
