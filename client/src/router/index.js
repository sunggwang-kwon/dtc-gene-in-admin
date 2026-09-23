import Vue from 'vue'
import VueRouter from 'vue-router'
import { store } from '@/store'

import Login from '@/components/Login'
import Member from '@/components/Member/Member'
import DetailMember from '@/components/Member/DetailMember'
import Type from '@/components/Type/Type'
import DetailType from '@/components/Type/DetailType'
import Manage from '@/components/Manage/Manage'
import DetailManage from '@/components/Manage/DetailManage'
import Result from '@/components/Result/Result'
import DetailResult from '@/components/Result/DetailResult'
import Gene from '@/components/Gene/Gene'
import DetailGene from '@/components/Gene/DetailGene'
import Banner from '@/components/Banner/Banner'
import DetailBanner from '@/components/Banner/DetailBanner'
import Company from '@/components/Company/Company'
import DetailCompany from '@/components/Company/DetailCompany'
Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/member',
    name: 'Member',
    component: Member
  },
  {
    path: '/member/detail',
    name: 'DetailMember',
    component: DetailMember,
  },
  {
    path: '/type',
    name: 'Type',
    component: Type
  },
  {
    path: '/type/detail',
    name: 'DetailType',
    component: DetailType
  },
  {
    path: '/manage',
    name: 'Manage',
    component: Manage
  },
  {
    path: '/manage/detail',
    name: 'DetailManage',
    component: DetailManage
  },
  {
    path: '/result',
    name: 'Result',
    component: Result
  },
  {
    path: '/result/detail',
    name: 'DetailResult',
    component: DetailResult
  },
  {
    path:'/gene',
    name: 'Gene',
    component: Gene
  },
  {
    path: '/gene/detail',
    name: 'DetailGene',
    component: DetailGene
  },
  {
    path: '/banner',
    name: 'Banner',
    component: Banner
  },
  {
    path: '/banner/detail',
    name: 'DetailBanner',
    component: DetailBanner
  },
  {
    path: '/company',
    name: 'Company',
    component: Company
  },
  {
    path: '/company/detail',
    name: 'DetailCompany',
    component: DetailCompany
  },
  {
    path: '*',
    component: Login
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes,
  scrollBehavior(){
    return {x:0, y:0}
  }
});

const DETAIL_MAP = {
  Member: 'DetailMember',
  Company: 'DetailCompany',
  Gene: 'DetailGene',
  Type: 'DetailType',
  Manage: 'DetailManage',
  Result: 'DetailResult',
  Banner: 'DetailBanner',
};

router.beforeEach((to, from, next) => {
  if (DETAIL_MAP[to.name] && from.name !== DETAIL_MAP[to.name]) {
    store.commit(to.name.toLowerCase(), null);
  }
  next();
});

export default router;