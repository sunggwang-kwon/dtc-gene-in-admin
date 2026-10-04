<template>
  <v-container class="pa-0 content-background" style="border-left:1px solid rgba(0,0,0,0.12);border-right:1px solid rgba(0,0,0,0.12);min-height:100%;" fluid>
    <div id="header" :style="{
      position: 'sticky',
      top: $vuetify.application.top+'px',
      zIndex:1
    }">
      <div class="px-3 py-5" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto">
            <h3>{{ $t('app.menu.pgx') }}</h3>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <v-tooltip bottom color="rgba(0,0,0,0.7)">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="new_window" v-bind="attrs" v-on="on" icon><v-icon>mdi-window-restore</v-icon></v-btn>
              </template>
              <span>새창에서 열기</span>
            </v-tooltip>
          </v-col>
        </v-row>
      </div>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
      <div class="content-background" style="height:25px;"></div>
    </div>

    <div id="content" class="px-4">
      <v-card class="pa-8 text-center" outlined>
        <v-icon size="64" color="primary" class="mb-4">mdi-pill</v-icon>
        <h2 class="mb-2">{{ $t('app.menu.pgx') }}</h2>
        <p class="grey--text mb-0">해당 기능은 현재 준비 중입니다.</p>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import authority from '@/mixin/authority'

export default {
  name: 'pgx-vue',
  mixins: [authority],
  created() {
    if (!this.get_menu_authority('M008')) {
      alert('접근 권한이 없습니다.');
      this.$router.go(-1);
    }
  },
  methods: {
    new_window() {
      let routeData = this.$router.resolve({ name: 'Pgx' });
      window.open(routeData.href, '_blank');
    }
  }
}
</script>

<style scoped>
</style>
