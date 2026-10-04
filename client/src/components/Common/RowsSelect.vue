<template>
  <v-select
    :value="value"
    :items="items"
    @change="change"
    dense
    outlined
    hide-details
    style="width:120px;"
  ></v-select>
</template>

<script>
import { ROWS_OPTIONS } from '@/store'

// 목록 페이지당 노출 건수 선택 (10/20/50/100)
// 선택값은 Vuex + localStorage(사용자별)에 저장되어 다른 페이지/재로그인 후에도 유지됩니다.
export default {
  name: 'rows-select-vue',
  props: ['value'],
  data: () => ({
    items: ROWS_OPTIONS.map(n => ({ text: n + '개씩', value: n })),
  }),
  methods: {
    change: function(rows){
      this.$store.commit('rows', { userId: this.$session.get('Userid'), rows: rows });
      this.$emit('input', rows);
      this.$emit('change', rows);
    },
  },
}
</script>
