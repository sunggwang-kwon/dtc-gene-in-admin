<template>
  <v-container fluid style="height:100%; background:linear-gradient(rgb(255, 255, 255), rgb(245, 249, 250));">
    <v-row align="center" justify="center" style="height:100%;">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="px-5 py-10" outlined>
          <v-form ref="form">
            <v-row align="center">
              <v-col>
                <v-img src="@/assets/images/geni-in-logo.svg" max-width="200" height="70" contain style="left:50%; transform: translate(-50%);" alt="지니인사이트 로고"></v-img>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="pb-0">
              <v-text-field v-model="user_id" :autofocus="true" dense outlined :placeholder="$t('login.idPlaceholder')" :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="py-0">
              <v-text-field v-model="user_pw" @keydown.enter="login" type="password" dense outlined :placeholder="$t('login.passwordPlaceholder')" :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="pt-0">
              <v-btn @click="login" dark block dense :elevation="0">{{ $t('login.submit') }}</v-btn>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col class="pb-0">
              <v-checkbox v-model="reg" class="pa-0 ma-0" hide-details :label="$t('login.rememberId')"></v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import validation from '@/mixin/validation'
import { setI18nLocale } from '@/i18n'
export default {
  name: 'login-vue',
  mixins: [validation, http, authority],
  data: function(){
    return {
      reg: false,
      user_id: null,
      user_pw: null,
    }
  },
  beforeCreate:function(){
    if ( this.$session.has('Lang') ){
      setI18nLocale(this.$session.get('Lang'));
    }
    if ( this.$session.has("jwt") ){
      if ( this.get_menu_authority('M001') ){
        this.$router.replace({name:'Member'});
      }
      else if ( this.get_menu_authority('M002') ){
        this.$router.replace({name:'Type'});
      }
      else if ( this.get_menu_authority('M003') ){
        this.$router.replace({name:'Manage'});
      }
      else if ( this.get_menu_authority('M004') ){
        this.$router.replace({name:'Result'});
      }
      else if ( this.get_menu_authority('M005') ){
        this.$router.replace({name:'Gene'});
      }
    }
  },
  created:function(){
    if ( this.$cookies.isKey('user_id') ){
      this.user_id = this.$cookies.get('user_id');
      this.reg = true;
    }
  },
  methods:{
    login: async function(){
      const valid = this.$refs.form.validate();
      if ( !valid ) return;

      let data = {
        user_id: this.user_id,
        user_pw: this.user_pw
      };
      let res = await this.post(this.$rootUrl + '/server/member/login.php', data);
      if ( res ){
        this.$session.set('jwt', res.data.jwt);
        this.$session.set('Level', res.data.Level);
        this.$session.set('Userid', res.data.Userid);
        this.$session.set('Username', res.data.Username);
        this.$session.set('Email', res.data.Email);
        this.$session.set('Lang', res.data.Lang);
        this.$session.set('Lastaccesstime', res.data.Lastaccesstime);
        this.$session.set('Auth', res.data.Auth);
        setI18nLocale(res.data.Lang);
        if ( this.reg ){
          this.$cookies.set('user_id', this.user_id);
        }
        else{
          this.$cookies.remove('user_id');
        }

        //router
        if ( this.get_menu_authority('M001') ){
          this.$router.replace({name:'Member'});
        }
        else if ( this.get_menu_authority('M002') ){
          this.$router.replace({name:'Type'});
        }
        else if ( this.get_menu_authority('M003') ){
          this.$router.replace({name:'Manage'});
        }
        else if ( this.get_menu_authority('M004') ){
          this.$router.replace({name:'Result'});
        }
        else if ( this.get_menu_authority('M005') ){
          this.$router.replace({name:'Gene'});
        }
      }
    }
  }
}
</script>
