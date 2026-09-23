<template>
  <v-app v-if="$session.has('jwt')">
    <v-app-bar v-if="!$vuetify.breakpoint.mobile" app dense dark :elevation="0" clipped-left>
      <v-row align="center">
        <v-col cols="auto">
          <v-app-bar-nav-icon @click="navi_drawer=!navi_drawer"></v-app-bar-nav-icon>
        </v-col>
        <v-col cols="auto" class="d-flex align-center">
          <v-img src="@/assets/images/geni-in-logo-white.svg" max-height="32" max-width="110" contain alt="지니인사이트 로고"></v-img>
        </v-col>
      </v-row>
    </v-app-bar>
    <v-app-bar v-else app dense dark :elevation="0">
      <v-row class="mx-5" align="center">
        <v-col cols="1"></v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto" class="d-flex align-center">
          <v-img src="@/assets/images/geni-in-logo-white.svg" max-height="32" max-width="110" contain alt="지니인사이트 로고"></v-img>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="1">
          <v-app-bar-nav-icon @click="navi_drawer=!navi_drawer"></v-app-bar-nav-icon>
        </v-col>
      </v-row>
    </v-app-bar>
    <v-navigation-drawer v-model="navi_drawer" app clipped :right="$vuetify.breakpoint.mobile" :width="$vuetify.breakpoint.smAndDown?226:256" floating>
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-avatar color="deep-purple" size="40">
              <span style="color:white">{{ $session.get("Username").substring(0,1) }}</span>
            </v-avatar>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ $session.get("Username") }}</v-list-item-title>
            <v-list-item-subtitle>{{ $session.get("Email") }}</v-list-item-subtitle>
            <v-list-item-subtitle>{{ $session.get("Lastaccesstime") }}</v-list-item-subtitle>
            <v-list-item-subtitle><v-btn @click="$router.push({name:'DetailMember', query:{transaction:'view', lims_id:$session.get('Userid')}})" color="rgb(240,241,242)" block small :elevation="0">{{ $t('app.profileEdit') }}</v-btn></v-list-item-subtitle>
            <v-list-item-subtitle><v-btn @click="logout" color="rgb(240,241,242)" block small :elevation="0">{{ $t('app.logout') }}</v-btn></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
      <v-list nav dense>
        <v-list-item v-if="get_menu_authority('M001')" prepend-icon="mdi-account" to="/member" @click="click_menu('member')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-human-male</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.member') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M007')" to="/company" @click="click_menu('company')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-domain</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.company') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M005')" prepend-icon="mdi-dna" to="/gene" @click="click_menu('gene')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-dna</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.gene') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M002')" to="/type" @click="click_menu('type')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-flask</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.type') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M003')" to="/manage" @click="click_menu('manage')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-human-male-height</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.manage') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M004')" to="/result" @click="click_menu('result')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-text-box</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.result') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item v-if="get_menu_authority('M006')" to="/banner" @click="click_menu('banner')" link>
          <v-list-item-icon>
            <v-icon color="primary">mdi-checkerboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ $t('app.menu.banner') }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
      <v-divider></v-divider>
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
      <router-view :key="$router.fullPath"></router-view>
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

    window.addEventListener('click', function(){
      this.click_event = new Date().getTime();
    }.bind(this));

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
    window.removeEventListener('click', function(){
      this.click_event = null;
    });
    if ( this.interval ){
      clearInterval(this.interval);
    }
  },
  methods:{
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
@import '@/assets/layout.css';
@import '@/assets/content.css';
</style>

<style lang="scss"> // 모바일 환경 중앙 배치
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