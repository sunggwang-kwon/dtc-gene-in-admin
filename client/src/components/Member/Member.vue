<template>
  <v-container fluid class="pa-6">
    <!-- 헤더 -->
    <div class="d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h5 font-weight-bold">사용자 관리</h1>
        <p class="text-body-2 text-medium-emphasis mt-1 mb-0">시스템 사용자를 조회하고 관리합니다.</p>
      </div>
      <div v-if="canManage" class="d-flex ga-2">
        <v-btn color="primary" prepend-icon="mdi-plus" @click="goInsert">추가</v-btn>
        <v-btn
          color="error"
          variant="tonal"
          prepend-icon="mdi-delete-outline"
          :disabled="selected.length === 0"
          @click="deleteSelected"
        >
          삭제 {{ selected.length > 0 ? `(${selected.length})` : '' }}
        </v-btn>
      </div>
    </div>

    <!-- 검색 카드 -->
    <v-card flat border rounded="lg" class="mb-4">
      <v-card-text class="py-3">
        <v-row align="center" no-gutters>
          <v-col cols="12" sm="auto">
            <v-text-field
              v-model="searchValue"
              label="ID / 사용자명"
              placeholder="검색어 입력"
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
              style="min-width: 280px;"
              @keydown.enter="onSearch"
              @click:clear="onClearSearch"
            />
          </v-col>
          <v-col cols="auto" class="ml-sm-3 mt-3 mt-sm-0">
            <v-btn color="primary" variant="tonal" @click="onSearch">조회</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- 데이터 카드 -->
    <v-card flat border rounded="lg">
      <!-- 건수 -->
      <v-card-text class="py-2 text-caption text-medium-emphasis font-weight-medium border-b">
        총 {{ totalItems }}건
      </v-card-text>

      <!-- 모바일 -->
      <template v-if="isMobile">
        <v-progress-linear v-if="loading" indeterminate color="primary" />
        <v-list v-if="items.length > 0" lines="three" class="pa-0">
          <template v-for="(item, i) in items" :key="item.lims_id">
            <v-list-item class="px-4 py-3" @click="handleCardClick(item)">
              <template #title>
                <div class="d-flex align-center ga-2">
                  <span class="font-weight-bold text-primary">{{ item.lims_id }}</span>
                  <v-chip size="x-small" :color="item.level === 'A' ? 'purple' : 'grey'" variant="tonal" label>
                    {{ item.level_name || (item.level === 'A' ? '관리자' : '일반') }}
                  </v-chip>
                </div>
              </template>
              <template #subtitle>
                <div class="mt-1">{{ item.user_name }} · {{ item.email || '-' }}</div>
                <div class="text-caption">{{ item.company_name || '-' }} · {{ item.last_access_time || '-' }}</div>
              </template>
              <template v-if="canManage" #append>
                <v-checkbox-btn
                  :model-value="selected.includes(item.lims_id)"
                  color="primary"
                  @click.stop
                  @update:model-value="(v) => toggleSelect(item.lims_id, v)"
                />
              </template>
            </v-list-item>
            <v-divider v-if="i < items.length - 1" />
          </template>
        </v-list>
        <v-card-text v-else-if="!loading" class="text-center text-medium-emphasis py-10">
          조회된 데이터가 없습니다.
        </v-card-text>
      </template>

      <!-- 데스크탑 -->
      <v-data-table-server
        v-if="!isMobile"
        v-model="selected"
        :headers="headers"
        :items="items"
        :items-length="totalItems"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :page="page"
        :show-select="canManage"
        item-value="lims_id"
        hover
        density="comfortable"
        hide-default-footer
        @update:options="loadItems"
        @click:row="handleRowClick"
      >
        <template #item.lims_id="{ item }">
          <span class="text-primary font-weight-medium" style="cursor:pointer">{{ item.lims_id }}</span>
        </template>

        <template #item.level_name="{ item }">
          <v-chip size="x-small" :color="item.level === 'A' ? 'purple' : 'grey'" variant="tonal" label>
            {{ item.level_name || (item.level === 'A' ? '관리자' : '일반') }}
          </v-chip>
        </template>

        <template #item.last_access_time="{ item }">
          <span class="text-medium-emphasis">{{ item.last_access_time || '-' }}</span>
        </template>
        <template #item.create_time="{ item }">
          <span class="text-medium-emphasis">{{ item.create_time || '-' }}</span>
        </template>

        <template #no-data>
          <div class="pa-10 text-center text-medium-emphasis">데이터가 없습니다.</div>
        </template>
      </v-data-table-server>

      <v-divider />

      <!-- 페이지네이션 -->
      <v-card-text class="py-2">
        <Pagination
          :page="page"
          :items-per-page="itemsPerPage"
          :total-items="totalItems"
          :max-visible="isMobile ? 5 : 10"
          @change="onPageChange"
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import { useAuthStore } from '@/stores/auth'
import { useHttp } from '@/composables/useHttp'
import Pagination from '@/components/common/Pagination.vue'

const router = useRouter()
const authStore = useAuthStore()
const { get, post } = useHttp()
const { mobile } = useDisplay()

const isMobile = computed(() => mobile.value)

const canManage = computed(() => {
  const auth = authStore.hasAuth('M001')
  return auth === 'A' || auth === 'Y'
})

const loading = ref(false)
const items = ref([])
const totalItems = ref(0)
const selected = ref([])
const page = ref(1)
const itemsPerPage = ref(30)
const sortBy = ref([])
const searchValue = ref('')

const headers = [
  { title: '아이디', key: 'lims_id', sortable: true },
  { title: '사용자명', key: 'user_name', sortable: true },
  { title: '이메일', key: 'email', sortable: false },
  { title: '소속', key: 'company_name', sortable: false },
  { title: '구분', key: 'level_name', align: 'center', width: '100px', sortable: false },
  { title: '최종접속', key: 'last_access_time', align: 'center', width: '150px', sortable: true },
  { title: '등록일', key: 'create_time', align: 'center', width: '130px', sortable: true },
]

let isFetching = false

const loadItems = async ({ page: p, itemsPerPage: ipp, sortBy: sb } = {}) => {
  if (isFetching) return
  isFetching = true
  loading.value = true

  if (p) page.value = p
  if (ipp) itemsPerPage.value = ipp
  if (sb !== undefined) sortBy.value = sb

  const params = {
    page: page.value,
    rows: itemsPerPage.value,
    sort: sortBy.value?.[0]?.key || null,
    order: sortBy.value?.[0]?.order || null,
    search_value: searchValue.value ? `%${searchValue.value.trim()}%` : null,
  }

  try {
    const res = await get('/server/member/get_member_list.php', params)
    if (res?.data) {
      totalItems.value = Number(res.data.total) || 0
      items.value = res.data.info || []
    } else {
      items.value = []
      totalItems.value = 0
    }
  } catch (err) {
    console.error('사용자 목록 조회 실패:', err)
  } finally {
    loading.value = false
    isFetching = false
  }
}

onMounted(() => {
  if (isMobile.value) loadItems()
})

const onSearch = () => { page.value = 1; loadItems() }
const onClearSearch = () => { searchValue.value = ''; onSearch() }
const onPageChange = (p) => { page.value = p; loadItems() }

const handleRowClick = (e, { item }) => {
  if (item?.lims_id) router.push({ name: 'DetailMember', query: { transaction: 'view', lims_id: item.lims_id } })
}

const handleCardClick = (item) => {
  if (item?.lims_id) router.push({ name: 'DetailMember', query: { transaction: 'view', lims_id: item.lims_id } })
}

const toggleSelect = (id, v) => {
  selected.value = v
    ? [...selected.value.filter(x => x !== id), id]
    : selected.value.filter(x => x !== id)
}

const goInsert = () => router.push({ name: 'DetailMember', query: { transaction: 'insert' } })

const deleteSelected = async () => {
  if (!selected.value.length) return
  if (!confirm(`선택한 사용자 ${selected.value.length}명을 삭제하시겠습니까?`)) return

  loading.value = true
  let errors = 0

  for (const id of selected.value) {
    try {
      const res = await post('/server/member/set_member.php', { transaction: 'delete', user_id: id })
      if (res?.data?.ret !== '0000') errors++
    } catch { errors++ }
  }

  loading.value = false
  alert(errors ? `삭제 중 ${errors}건의 오류가 발생했습니다.` : '성공적으로 삭제되었습니다.')
  selected.value = []
  loadItems()
}
</script>
