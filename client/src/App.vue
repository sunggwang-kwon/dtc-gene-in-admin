<template>
  <v-app v-if="$session.has('jwt')">
    <v-app-bar app dense color="#F0F5FE" :elevation="0" :clipped-left="!$vuetify.breakpoint.mobile">
      <v-app-bar-nav-icon color="#222222" @click="navi_drawer=!navi_drawer"></v-app-bar-nav-icon>
      <span class="ml-2 font-weight-bold text-subtitle-1" style="letter-spacing: 0.5px; color: #222222; user-select: none;">GeneInsight</span>
      <v-spacer></v-spacer>
      <div class="d-flex align-center mr-3" style="color: #333333;">
        <v-icon v-if="!$vuetify.breakpoint.mobile" color="#444444" class="mr-1">mdi-account</v-icon>
        <span :class="$vuetify.breakpoint.mobile ? 'text-caption' : 'text-body-2'" class="font-weight-medium" style="color: #333333;">{{ $session.get("Username") }}</span>
      </div>
      <v-btn @click="logout" outlined class="header-logout-btn" :elevation="0">
        {{ $t('app.logout') }}
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="navi_drawer" app clipped color="#F0F5FE" :width="$vuetify.breakpoint.smAndDown?226:256" floating>
      <v-list nav>
        <v-list-item v-if="get_menu_authority('M001')" to="/member" @click="click_menu('member')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-human-male</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.member') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M003')" to="/type" @click="click_menu('type')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-flask</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.type') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M005')" to="/gene" @click="click_menu('gene')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-dna</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.gene') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M002')" to="/company" @click="click_menu('company')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-domain</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.company') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M004')" to="/manage" @click="click_menu('manage')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-human-male-height</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.manage') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M006')" to="/result" @click="click_menu('result')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-text-box</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.result') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M007')" to="/ultraseek" @click="click_menu('ultraseek')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-test-tube</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.ultraseek') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M008')" to="/pgx" @click="click_menu('pgx')" link dense>
          <v-list-item-icon>
            <v-icon color="#444444">mdi-pill</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.pgx') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <div class="text-center" style="padding: 8px 16px 12px 16px;">
          <v-img src="@/assets/images/geni-in-logo.svg" max-height="34" contain class="mx-auto" alt="지니인사이트"></v-img>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <router-view :key="$route.fullPath + '_' + view_id"></router-view>
      <v-overlay :absolute="false" :z-index="500" :opacity="0" :value="$store.getters.load">
        <v-progress-circular
          color="primary"
          indeterminate
          size="100"
          width="10">
        </v-progress-circular>
      </v-overlay>
    </v-main>
  </v-app>
  <v-app v-else>
    <v-main>
      <router-view :key="$route.fullPath"></router-view>
    </v-main>
  </v-app>
</template>

<script>
import authority from '@/mixin/authority'
import axios from 'axios'
import { setI18nLocale } from '@/i18n'
axios.defaults.headers.get['Pragma'] = 'no-cache';
axios.defaults.headers.get['Cache-Control'] = 'no-cache, no-store';

export default {
  name: 'App',
  mixins: [authority],
  data: () => ({
    navi_drawer: true,
    interval: null,
    click_event: new Date().getTime(),
    view_id: 0,
  }),
  created:async function(){
    this.sync_locale_from_session();

    window.addEventListener('click', this.on_window_click);

    this.interval = setInterval(async () => {
      if ( this.$session.has('jwt') ){
        if ( new Date().getTime() > this.click_event+3600000 ){ //60분간 클릭 이벤트가 발생하지 않은 경우
          this.$session.destroy();
          this.$store.commit('reset');
          this.$router.replace({name: "Login"});
          alert(this.$t('app.autoLogout'));
          return;
        }
        let res = await axios({
          method:'get',
          url:this.$rootUrl+'/server/common/reissuance_token.php',
          headers:{
            jwt: this.$session.get('jwt')
          }
        }).catch(err=>{
          alert(err.message);
          this.$session.destroy();
          this.$router.replace({name: "Login"});
          return;
        });
        if ( res.status == 200 ){
          if ( res.data.ret == '0000' ){
            this.$session.set('jwt', res.data.jwt);
          }
          else{
            this.$session.destroy();
            this.$store.commit('reset');
            this.$router.replace({name: "Login"});
            alert(this.$t('app.autoLogout'));
            return;
          }
        }
        else{
          this.$session.destroy();
          this.$router.replace({name: "Login"});
        }
      }
    }, 1000*60*20); //20분 마다 refresh token
  },
  beforeDestroy:function(){
    window.removeEventListener('click', this.on_window_click);
    if ( this.interval ){
      clearInterval(this.interval);
    }
  },
  methods:{
    on_window_click: function(){
      this.click_event = new Date().getTime();
    },
    sync_locale_from_session:function(){
      if ( this.$session.has('Lang') ){
        setI18nLocale(this.$session.get('Lang'));
      }
    },
    logout: function(){
      let con = confirm(this.$t('app.confirmLogout'));
      if ( !con ) return;
      this.$session.destroy();
      this.$store.commit('reset');
      this.$router.replace({name: "Login"});
    },
    click_menu: function(menu_name){
      this.$store.commit(menu_name, null);
      if ( this.$route.name && this.$route.name.toLowerCase() === menu_name ){
        this.view_id = new Date().getTime();
      }
    },
  },
};
</script>

<style>
@import '@/assets/content.css';
</style>

<style lang="scss">
/* 모바일 환경 중앙 배치 */
@media (pointer:coarse){
  #app {
    height: calc(var(--vh, 1vh) * 100);
    overflow: scroll;
    .v-application--wrap {
      min-height: calc(var(--vh, 1vh) * 100) !important;
    }
  }
}
</style>