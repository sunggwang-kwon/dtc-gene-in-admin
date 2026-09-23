import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Login from '@/components/Login.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { public: true },
  },
  {
    path: '/member',
    name: 'Member',
    component: () => import('@/components/Member/Member.vue'),
  },
  {
    path: '/member/detail',
    name: 'DetailMember',
    component: () => import('@/components/Member/DetailMember.vue'),
  },
  {
    path: '/company',
    name: 'Company',
    component: () => import('@/components/Company/Company.vue'),
  },
  {
    path: '/company/detail',
    name: 'DetailCompany',
    component: () => import('@/components/Company/DetailCompany.vue'),
  },
  {
    path: '/type',
    name: 'Type',
    component: () => import('@/components/Type/Type.vue'),
  },
  {
    path: '/type/detail',
    name: 'DetailType',
    component: () => import('@/components/Type/DetailType.vue'),
  },
  {
    path: '/manage',
    name: 'Manage',
    component: () => import('@/components/Manage/Manage.vue'),
  },
  {
    path: '/manage/detail',
    name: 'DetailManage',
    component: () => import('@/components/Manage/DetailManage.vue'),
  },
  {
    path: '/result',
    name: 'Result',
    component: () => import('@/components/Result/Result.vue'),
  },
  {
    path: '/result/detail',
    name: 'DetailResult',
    component: () => import('@/components/Result/DetailResult.vue'),
  },
  {
    path: '/gene',
    name: 'Gene',
    component: () => import('@/components/Gene/Gene.vue'),
  },
  {
    path: '/gene/detail',
    name: 'DetailGene',
    component: () => import('@/components/Gene/DetailGene.vue'),
  },
  {
    path: '/banner',
    name: 'Banner',
    component: () => import('@/components/Banner/Banner.vue'),
  },
  {
    path: '/banner/detail',
    name: 'DetailBanner',
    component: () => import('@/components/Banner/DetailBanner.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login',
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

// 목록 진입 시 상세 store 초기화를 위한 DETAIL_MAP
const DETAIL_MAP = {
  Member: 'DetailMember',
  Company: 'DetailCompany',
  Type: 'DetailType',
  Manage: 'DetailManage',
  Result: 'DetailResult',
  Gene: 'DetailGene',
  Banner: 'DetailBanner',
}

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // 비로그인 상태에서 보호 라우트 접근 시 로그인으로 리다이렉트
  if (!to.meta.public && !auth.isLoggedIn) {
    return next({ name: 'Login' })
  }

  // 로그인 상태에서 로그인 페이지 접근 시 첫 권한 메뉴로 이동
  if (to.name === 'Login' && auth.isLoggedIn) {
    const route = auth.firstAuthorizedRoute
    if (route) return next({ name: route })
  }

  // 목록 진입 시 store 상태 초기화 (추후 각 도메인 store 추가 시 연결)
  if (DETAIL_MAP[to.name]) {
    // 각 도메인 store가 추가되면 여기서 초기화
  }

  next()
})

export default router
