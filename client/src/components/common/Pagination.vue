<template>
  <nav class="d-flex align-center justify-center ga-1" aria-label="Pagination">
    <v-btn icon variant="outlined" size="small" :disabled="page <= 1" @click="changePage(1)">
      <v-icon size="18">mdi-chevron-double-left</v-icon>
    </v-btn>

    <v-btn icon variant="outlined" size="small" :disabled="page <= 1" @click="changePage(page - 1)">
      <v-icon size="18">mdi-chevron-left</v-icon>
    </v-btn>

    <v-btn
      v-for="p in visiblePages"
      :key="p"
      icon
      size="small"
      :variant="p === page ? 'flat' : 'text'"
      :color="p === page ? 'primary' : undefined"
      @click="changePage(p)"
    >
      {{ p }}
    </v-btn>

    <v-btn icon variant="outlined" size="small" :disabled="page >= lastPage" @click="changePage(page + 1)">
      <v-icon size="18">mdi-chevron-right</v-icon>
    </v-btn>

    <v-btn icon variant="outlined" size="small" :disabled="page >= lastPage" @click="changePage(lastPage)">
      <v-icon size="18">mdi-chevron-double-right</v-icon>
    </v-btn>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  page: { type: Number, default: 1 },
  itemsPerPage: { type: Number, default: 30 },
  totalItems: { type: Number, default: 0 },
  maxVisible: { type: Number, default: 10 },
})

const emit = defineEmits(['update:page', 'change'])

const lastPage = computed(() => Math.ceil(props.totalItems / props.itemsPerPage) || 1)

const visiblePages = computed(() => {
  const bs = props.maxVisible
  const start = Math.floor((props.page - 1) / bs) * bs + 1
  const end = Math.min(start + bs - 1, lastPage.value)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const changePage = (p) => {
  if (p < 1 || p > lastPage.value || p === props.page) return
  emit('update:page', p)
  emit('change', p)
}
</script>
