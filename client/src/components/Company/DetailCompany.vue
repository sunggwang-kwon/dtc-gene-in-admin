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
            <h3 v-if="transaction=='insert'">기관/회사 추가</h3>
            <h3 v-else>기관/회사 정보</h3>
          </v-col>
        </v-row>
      </div>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
    </div>
    <div v-if="is_open" id="content" class="pa-5">
      <v-card flat>
        <v-card-text>
          <v-form ref="form">
            <!-- 회사명 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">회사명<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="company_name" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 담당자 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">담당자<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="contact" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 이메일 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">이메일<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="email" :readonly="transaction=='view'" type="email" dense outlined :placeholder="transaction=='view'?'':'abc@def.com'" :rules="[required, email_rule]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 연락처 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">연락처<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="phone" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 언어 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">언어<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="lang_name" dense outlined readonly></v-text-field>
                <v-select v-else v-model="lang_cd" dense outlined :items="lang_list" item-text="value" item-value="code" :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 주소 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">주소</div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="addr" :readonly="transaction=='view'" dense outlined></v-text-field>
              </v-col>
            </v-row>
            <!-- 메모 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">메모</div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="memo" :readonly="transaction=='view'" dense outlined></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
    <div id="tail">
      <v-app-bar color="rgb(255,255,255)" style="border:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row v-if="transaction=='insert'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn @click="set_company" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='view'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M007')=='A'" @click="transaction='update'" small dark :elevation="0">수정</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='update'" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="get_company().then(()=>{transaction='view'})" color="grey" small dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M007')=='A'" @click="set_company" small dark :elevation="0">저장</v-btn>
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
export default {
  name: 'detail-company-vue',
  mixins: [http, authority, validation],
  data: () => ({
    is_open: false,
    transaction: null,  // view, insert, update
    seq: null,
    company_name: null,
    contact: null,
    email: null,
    phone: null,
    lang_cd: 'kor',
    lang_name: null,
    lang_list: [],
    addr: null,
    memo: null,
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:async function(){
    if ( !this.get_menu_authority('M007') ){
      alert("해당 메뉴 접근 권한이 없습니다.");
      this.$router.go(-1);
      return;
    }
    this.transaction = this.$route.query.transaction;
    if ( this.transaction == 'view' || this.transaction == 'update' ){
      this.seq = this.$route.query.seq;
      if ( !this.seq ){
        alert("잘못된 접근입니다.");
        this.$router.replace({name:'Company'});
        return;
      }
      this.is_open = await this.get_code_list() && await this.get_company();
    }
    else if ( this.transaction == 'insert' ){
      this.is_open = await this.get_code_list();
      if ( this.is_open && this.lang_list.length > 0 ){
        this.lang_cd = this.lang_list[0].code;
      }
    }
    else{
      alert("잘못된 접근입니다.");
      this.$router.replace({name:'Company'});
    }
  },
  methods:{
    get_company: async function(){
      let data = { seq: this.seq };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/company/get_company.php', data);
      this.$store.commit('load', false);
      if ( res && res.data.info ){
        let info = Array.isArray(res.data.info) ? res.data.info[0] : res.data.info;
        if ( !info ) return false;
        this.company_name = info.company_name;
        this.contact = info.contact;
        this.email = info.email;
        this.phone = info.phone;
        this.lang_cd = info.lang_cd || 'kor';
        this.lang_name = this.lang_list.find(el => el.code === this.lang_cd)?.value ?? this.lang_cd;
        if ( this.$i18n.locale === 'en' ){
          if ( this.lang_name == '한국어' ) this.lang_name = 'Korean';
          else if ( this.lang_name == '영어' ) this.lang_name = 'English';
        }
        this.addr = info.addr || null;
        this.memo = info.memo || null;
        return true;
      }
      alert("데이터를 불러올 수 없습니다.");
      return false;
    },
    set_company: async function(){
      if ( !this.$refs.form.validate() ) return;
      let con = confirm("입력한 내용으로 저장하시겠습니까?");
      if ( !con ) return;

      let data = {
        transaction: this.transaction,
        company_name: this.company_name,
        contact: this.contact,
        email: this.email,
        phone: this.phone,
        lang_cd: this.lang_cd,
        addr: this.addr || '',
        memo: this.memo || ''
      };
      if ( this.transaction == 'update' || this.transaction == 'delete' ){
        data.seq = this.seq;
      }

      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/company/set_company.php', data);
      this.$store.commit('load', false);
      if ( res ){
        alert("저장되었습니다.");
        if ( this.transaction == 'insert' ){
          this.$router.replace({name:'Company'});
        }
        else{
          this.transaction = 'view';
          this.get_company();
        }
      }
    },
    get_code_list: async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/common/get_code_list.php');
      this.$store.commit('load', false);
      if ( res ){
        this.lang_list = [];
        res.data.info.forEach(element=>{
          if ( element.group_code == 'G0004' ){
            this.lang_list.push(element);
          }
        });
        return true;
      }
      return false;
    },
  },
}
</script>
