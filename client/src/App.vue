<template>
  <!-- 로그인 화면 (레이아웃 없이 단독 렌더) -->
  <router-view v-if="!authStore.isLoggedIn || $route.meta.public" />

  <!-- 로그인 후: AppLayout 안에 router-view -->
  <app-layout v-else>
    <router-view :key="$route.fullPath" />
  </app-layout>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import AppLayout from '@/components/common/AppLayout.vue'

const authStore = useAuthStore()
</script>
