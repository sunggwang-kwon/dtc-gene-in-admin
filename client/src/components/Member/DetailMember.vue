<template>
  <v-container class="pa-0 content-background" style="border-left:1px solid rgba(0,0,0,0.12);border-right:1px solid rgba(0,0,0,0.12);min-height:100%;" fluid>
    <div id="header" :style="{
      position: 'sticky',
      top: $vuetify.application.top+'px',
      zIndex:1
    }">
      <div :class="$vuetify.breakpoint.mobile?'py-5':'px-3 py-5'" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="$router.go(-1)" small icon><v-icon large>mdi-chevron-left</v-icon></v-btn>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <h3 v-if="transaction=='insert'">사용자 추가</h3>
            <h3 v-else>사용자 정보</h3>
          </v-col>
        </v-row>
      </div>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
    </div>
    <div v-if="is_open" id="content" class="pa-5">
      <v-card flat>
        <v-card-text>
          <v-form ref="form">
            <!-- 아이디 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">아이디<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col :lg="transaction=='insert'?3:4" :xl="transaction=='insert'?2:3">
                <v-text-field v-model="lims_id" ref="limsid" @input="check=false;" :readonly="transaction=='view'" :disabled="transaction=='update'" dense outlined placeholder="4~20자 영문, 숫자" :rules="[required, id_rule]"></v-text-field>
              </v-col>
              <v-col v-if="transaction=='insert'" cols="auto" lg="1" class="pl-1">
                <v-btn @click="id_check" :color="check?'grey':'primary'" dark small :elevation="0">중복확인</v-btn>
              </v-col>
            </v-row>
            <!-- 사용자명 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">사용자명<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="name" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 비밀번호 -->
            <v-row v-if="transaction!='view'" align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">{{transaction=='insert'?'비밀번호':'변경할비밀번호'}}<span v-if="transaction=='insert'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="password" :type="!show_password?'password':'text'" dense outlined :placeholder="$t('phrases.8~16자 영문, 숫자, 특수문자')" :rules="transaction=='insert'?[required, password_rule]:[password_rule]" :append-icon="!show_password?'mdi-eye':'mdi-eye-off'" @click:append="show_password=!show_password;"></v-text-field>
              </v-col>
            </v-row>
            <!-- 비밀번호확인 -->
            <v-row v-if="transaction!='view'" align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">{{transaction=='insert'?'비밀번호확인':'변경할비밀번호확인'}}<span v-if="transaction=='insert'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="password2" :type="!show_password?'password':'text'" dense outlined :placeholder="$t('phrases.8~16자 영문, 숫자, 특수문자')" :rules="transaction=='insert'?[required, password2_rule]:[password2_rule]" :append-icon="!show_password?'mdi-eye':'mdi-eye-off'" @click:append="show_password=!show_password;"></v-text-field>
              </v-col>
            </v-row>
            <!-- 관리자구분 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">관리자구분<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="level_name" dense outlined readonly></v-text-field>
                <v-select v-else v-model="level" :readonly="transaction=='view'" dense outlined :items="$session.get('Level')=='A'?[{text:'관리자', value:'A'},{text:'일반사용자', value:'N'}]:[{text:'일반사용자', value:'N'}]" item-text="text" item-value="value"></v-select>
              </v-col>
            </v-row>
            <!-- 메일주소 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">메일주소</div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="email" :readonly="transaction=='view'" type="email" dense outlined :placeholder="transaction=='view'?'':'abc@def.com'" :rules="[email_rule]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 조직 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">조직<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="org_name" dense outlined readonly></v-text-field>
                <v-select v-else v-model="org_code" dense outlined :items="org_list" item-text="value" item-value="code" :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 소속기관/회사 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">소속기관/회사<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="company_name" dense outlined readonly></v-text-field>
                <v-select v-else v-model="company_code" dense outlined :items="company_list" item-text="company_name" item-value="seq" :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 사용언어 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">사용언어<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="lang_name" dense outlined readonly></v-text-field>
                <v-select v-else v-model="lang_code" dense outlined :items="lang_list" item-text="value" item-value="code" :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 접근권한 -->
            <div v-if="$session.get('Level')=='A'" class="pt-5" style="border-top:1px solid rgba(0,0,0,0.12)">
              <!-- 메뉴 접근 권한 -->
              <v-row align="start" no-gutters class="pb-5">
                <v-col cols="12" lg="1" style="min-width:135px;">
                  <div class="pt-1">메뉴접근권한<span v-if="transaction!='view'" style="color:red">(*)</span></div>
                </v-col>
                <v-col v-for="menu_item in menu_list" :key="menu_item.code" cols="12" lg="auto" class="pr-5">
                  <v-checkbox v-model="checked_menu" class="pa-0 pt-1 ma-0" :disabled="transaction=='view'" dense hide-details :label="menu_item.value" :value="menu_item.code"></v-checkbox>
                </v-col>
              </v-row>
              <!-- 메뉴별 권한(관리자, 일반사용자) -->
              <v-row v-for="(menu_item, index) in checked_menu_in_menu_order" :key="index" class="pb-5" align="start" no-gutters>
                <v-col cols="12" lg="1" style="min-width:135px;">
                  {{ get_menu_value(menu_item) }} 권한 <span v-if="transaction!='view'" style="color:red">(*)</span>
                </v-col>
                <v-col cols="12" lg="4" xl="3">
                  <v-radio-group v-model="authority[menu_item]" class="radio-class pa-0 ma-0" :column="false" :disabled="transaction=='view'" hide-details>
                    <v-radio value="N" label="읽기" dense small hide-details class="pa-0 ma-0 pr-5"></v-radio>
                    <v-radio value="A" label="읽기/쓰기" dense small hide-details class="pa-0 ma-0"></v-radio>
                  </v-radio-group>
                </v-col>
              </v-row>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
      <div v-if="transaction=='update'" class="pt-1" style="font-size:10pt; color:red;">[변경할비밀번호], [변경할비밀번호확인]은 비밀번호를 변경할 경우에만 입력하세요.</div>
    </div>
    <div id="tail">
      <v-app-bar color="rgb(255,255,255)" style="border:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row v-if="transaction=='insert'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn @click="set_member" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='view'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M001')=='A' || $session.get('Userid')==lims_id" @click="transaction='update'" small dark :elevation="0">수정</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='update'" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="show_password=false;password=null;password2=null;get_member().then(()=>{transaction='view'})" color="grey" small dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M001')=='A' || $session.get('Userid')==lims_id" @click="set_member" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
      </v-app-bar>
    </div>
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import validation from '@/mixin/validation'
import { setI18nLocale } from '@/i18n'
export default {
  name: 'detail-member-vue',
  mixins: [http, authority, validation],
  data: () => ({
    is_open: false,
    show_password: false,

    transaction: null,  //view, insert, update
    check: false,
    lims_id: null,
    name: null,
    password: null,
    password2: null,
    email: null,
    level: 'N',
    level_name: null,
    org_code: 'D001',
    org_name: null,
    org_list:[],
    lang_code: 'kor',
    lang_name: '한국어',
    lang_list:[],
    menu_list:[],
    company_code: null,
    company_name: null,
    company_list:[],

    checked_menu: [],
    authority:{}
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:async function(){
    if ( !this.get_menu_authority('M001') && (this.$route.query.lims_id != this.$session.get('Userid')) ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      this.transaction = this.$route.query.transaction;
      
      if ( this.transaction == 'view' ){
        this.lims_id = this.$route.query.lims_id;
        this.is_open = await this.get_code_list() && await this.get_company_list() && await this.get_member();
      }
      else{
        this.is_open = await this.get_code_list() && await this.get_company_list();
        this.company_code = this.company_list[0]?.seq ?? null;
        this.company_name = this.company_list[0]?.company_name ?? null;
      }
    }
  },
  methods:{
    password2_rule:function(v){
      if ( v != this.password ){
        return '비밀번호가 일치하지 않습니다.';
      }
      return true;
    },
    update_cancel: function(){
      this.get_member().then(()=>{
        this.transaction='view';
      });
    },
    id_check: async function(){
      if ( this.check ) return;
      if ( !this.lims_id || this.lims_id.length == 0 ){
        alert("아이디를 입력하세요.");
        return;
      }
      if ( !this.$refs.limsid.valid ){
        return;
      }
      let data = {
        user_id: this.lims_id
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/member/id_check.php', data);
      if ( res ){
        this.check = true;
        alert("사용가능한 아이디입니다.");
        this.$store.commit('load', false);
      }
      else{
        this.check = false;
        alert("이미 사용중인 아이디입니다.");
        this.$store.commit('load', false);
      }
    },
    get_menu_value:function(code){
      let value = "";
      this.menu_list.forEach(element=>{
        if ( element.code == code ){
          value = element.value;
        }
      })
      return value;
    },
    set_member: async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }
      if ( this.transaction=='insert' && !this.check ){
        alert("아이디 중복체크가 필요합니다.");
        return;
      }
      if ( !this.checked_menu || this.checked_menu.length == 0 ){
        alert("최소 한 개 이상의 메뉴에 대한 접근권한이 필요합니다.");
        return;
      }
      let auth = [];
      for ( let key in this.authority ){
        if ( this.checked_menu.indexOf(key) >= 0 ){
          let item = {
            menu_code: key,
            auth: this.authority[key]
          }
          auth.push(item);
        }
      }
      let con = confirm("입력한 내용으로 사용자를 추가/수정하시겠습니까?");
      if ( !con ) return;
      
      let data = {
        transaction: this.transaction,
        user_id: this.lims_id,
        name: this.name,
        password: this.password,
        password2: this.password2,
        email: this.email,
        level: this.level,
        org_code: this.org_code,
        company_no: this.company_code,
        lang_cd: this.lang_code,
        auth: JSON.stringify(auth)
      }
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/member/set_member.php', data);
      this.$store.commit('load', false);
      if ( res ){
        if ( this.$session.get("Userid") == this.lims_id ){ // update 대상이 자기 자신일 경우 session 갱신
          this.$session.set("Auth", auth);
          this.$session.set("Username", this.name);
          this.$session.set("Email", this.email);
          this.$session.set("Level", this.level);
          this.$session.set("Lang", this.lang_code);
          setI18nLocale(this.lang_code);
        }
        alert("저장되었습니다.");
        if ( this.get_menu_authority('M001')=='A' ){
          this.$router.replace({name:'Member'});
        }
        else{
          this.$router.go(-1);
        }
      }
    },
    get_member: async function(){
      let data = {
        user_id: this.lims_id
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/member/get_member.php', data);
      this.$store.commit('load', false);
      if ( res ){
        this.name = res.data.info.name;
        this.email = res.data.info.email;
        this.level = res.data.info.level;
        this.level_name = res.data.info.level_name;
        this.org_code = res.data.info.org_code;
        this.org_name = res.data.info.org_name;
        this.company_code = res.data.info.company_no != "0" ? res.data.info.company_no : null;
        this.company_name = this.company_list.find(element=>element.seq == this.company_code)?.company_name ?? null;
        this.lang_code = res.data.info.lang_cd;
        this.lang_name = this.lang_list.find(element=>element.code == this.lang_code)?.value ?? null;
        if ( res.data.info.auth && (res.data.info.auth.length > 0) ){
          this.checked_menu = [];
          res.data.info.auth.forEach(element=>{
            this.checked_menu.push(element.menu_code);
            this.authority[element.menu_code] = element.auth;
          })
        }
        // level_name 다국어 변환
        if ( this.$i18n.locale === 'en' ){
          if ( this.level_name == '관리자' ) this.level_name = 'Admin';
          else if ( this.level_name == '일반사용자' ) this.level_name = 'Standard User';
        }
        if ( this.$i18n.locale === 'en' ){
          this.lang_list.forEach(element => {
            element['value'] == '한국어' ? element['value'] = 'Korean' : element['value'] = 'English';
          });
          if ( this.lang_name == '한국어' ) this.lang_name = 'Korean';
          else if ( this.lang_name == '영어' ) this.lang_name = 'English';
        }
        return true;
      }
      return false;
    },
    get_code_list:async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/common/get_code_list.php');
      this.$store.commit('load', false);
      if ( res ){
        this.org_list = [];
        this.menu_list = [];
        res.data.info.forEach(element=>{
          if ( element.group_code == 'G0001'){
            this.org_list.push(element);
          }
          else if ( element.group_code == 'G0002' ){
            this.menu_list.push(element);
            this.authority[element.code] = 'N';
          }
          else if ( element.group_code == 'G0004' ){
            this.lang_list.push(element);
          }
        })
        return true;
      }
      return false;
    },
    get_company_list:async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/company/get_company_popup.php');
      this.$store.commit('load', false);
      if ( res ){
        this.company_list = res.data.info;
        return true;
      }
      return false;
    }
  },
  computed:{
    checked_menu_in_menu_order:function(){
      if ( !this.menu_list || this.menu_list.length === 0 ) return [];
      if ( !this.checked_menu || this.checked_menu.length === 0 ) return [];
      const checked = new Set(this.checked_menu);
      return this.menu_list
        .filter(m => checked.has(m.code))
        .map(m => m.code);
    }
  },
}
</script>
