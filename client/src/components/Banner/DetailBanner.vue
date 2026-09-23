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
            <h3 v-if="transaction=='insert'">배너 추가</h3>
            <h3 v-else>배너 정보</h3>
          </v-col>
        </v-row>
      </div>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
    </div>
    <div v-if="is_open" id="content" class="pa-5">
      <v-card flat>
        <v-card-text>
          <v-form ref="form">
            <!-- 배너제목 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">배너제목<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="subject" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 배너위치 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">배너위치<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" v-model="position" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
                <v-select v-else v-model="position" :readonly="transaction=='view'" dense outlined :items="['bottom','right']"></v-select>
              </v-col>
            </v-row>
            <!-- 게시기간 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">게시기간<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <div><v-text-field :value="date_range" readonly dense outlined append-icon="mdi-calendar-month" @click:append="open_calendar"></v-text-field></div>
                <calendar ref="calendar" @commit="set_calendar"></calendar>
              </v-col>
            </v-row>
            <!-- 게시여부 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">게시여부<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" v-model="disp_yn" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
                <v-select v-else v-model="disp_yn" :readonly="transaction=='view'" dense outlined :items="['Y','N']"></v-select>
              </v-col>
            </v-row>
            <!-- 게시주기(초) -->
             <!--
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">게시주기(초)<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            -->
          </v-form>
          <v-divider class="mb-3"></v-divider>
          <div v-if="transaction=='view'" class="tinycss" :style="position=='bottom'?'width:100%; height:142px;':'width:300px; height:630px;'">
            <html-view :value="content"></html-view>
          </div>
          <div v-else class="resizable-box" :style="position=='bottom'?'width:100%; height:200px;':'width:300px; height:700px;'">
            <editor @commitContent="commitContent" :value="content"></editor>
          </div>
        </v-card-text>
      </v-card>
    </div>
    <div id="tail">
      <v-app-bar color="rgb(255,255,255)" style="border:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row v-if="transaction=='insert'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M006')=='A'" @click="set_banner" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='view'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M006')=='A'" @click="transaction='update'" small dark :elevation="0">수정</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='update'" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="update_cancel" color="grey" small dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M006')=='A'" @click="set_banner" small dark :elevation="0">저장</v-btn>
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
import calendar from '@/components/Common/Calendar'
import Editor from '@/components/Common/Editor'
import HtmlView from '@/components/Common/HtmlView'

export default {
  name: 'detail-banner-vue',
  mixins: [http, authority, validation],
  components:{
    'calendar': calendar,
    'editor': Editor,
    'html-view': HtmlView
  },
  data: () => ({
    is_open: false,
    transaction: null,  //view, insert, update
    seq: null,
    subject: null,
    position: 'bottom',
    start_date: null,
    end_date: null,
    disp_yn: "Y",
    content: null,
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:function(){
    if ( !this.get_menu_authority('M006') ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      this.transaction = this.$route.query.transaction;
      this.seq = this.$route.query.seq;
      if ( this.transaction == 'view' ){
        this.seq = this.$route.query.seq;
        this.get_banner().then(res=>{
          this.is_open = res;
        })
      }
      else{
        let now = new Date();
        let year = now.getFullYear();
        let month = (now.getMonth()*1)+1;
        let day = now.getDate();
        if ( month < 10 ) month = '0' + month;
        if ( day < 10 ) day = '0' + day;

        let bef = new Date(now.getFullYear(), now.getMonth()+1, now.getDate());
        let bef_year = bef.getFullYear();
        let bef_month = (bef.getMonth()*1)+1;
        let bef_day = bef.getDate();
        if ( bef_month < 10 ) bef_month = '0' + bef_month;
        if ( bef_day < 10 ) bef_day = '0' + bef_day;

        this.end_date = bef_year+'-'+bef_month+'-'+bef_day;
        this.start_date = year+'-'+month+'-'+day;
        
        this.is_open = true;
      }
    }
  },
  methods:{
    update_cancel: function(){
      this.get_banner().then(()=>{
        this.transaction='view';
      });
    },
    open_calendar:function(event){
      this.$refs.calendar.open([this.start_date, this.end_date], event.pageX, event.pageY, this.date_type, false);
    },
    set_calendar:function(item){
      if ( item[0] < item[1] ){
        this.start_date = item[0];
        this.end_date = item[1];
      }
      else{
        this.start_date = item[1];
        this.end_date = item[0];
      }
    },
    commitContent:function(val){
      this.content = val
    },
    set_banner: async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }

      let con = confirm("입력한 내용으로 배너를 추가/수정하시겠습니까?");
      if ( !con ) return;

      let data = {
        transaction: this.transaction,
        seq: this.seq,
        subject: this.subject,
        position: this.position,
        start_date: this.start_date,
        end_date: this.end_date,
        disp_yn: this.disp_yn,
        content: this.utf8ToHex(this.content)
      };
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/banner/set_banner.php', data);
      if ( res ){
        alert("저장되었습니다.");
        this.$store.commit('load', false);
        this.$router.replace({name:'Banner'});
      }
      this.$store.commit('load', false);
    },
    get_banner: async function(){
      let data = {
        seq: this.seq
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/banner/get_banner.php', data);
      if ( res ){
        this.subject = res.data.info.subject;
        this.position = res.data.info.position;
        this.start_date = res.data.info.start_date;
        this.end_date = res.data.info.end_date;
        this.disp_yn = res.data.info.disp_yn;
        this.content = this.hexToUtf8(res.data.info.content);
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    },
    utf8ToHex: function(str) {
      // TextEncoder를 사용하여 UTF-8 문자열을 바이트 배열로 변환
      const encoder = new TextEncoder();
      const bytes = encoder.encode(str);

      // 바이트 배열을 16진수 문자열로 변환
      const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
      return hex;
    },
    hexToUtf8: function(hex) {
      const bytes = new Uint8Array(hex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
  
      // TextDecoder를 사용하여 UTF-8로 디코딩
      const decoder = new TextDecoder('utf-8');
      return decoder.decode(bytes);
    }
  },
  computed:{
      date_range:function(){
        return this.start_date + ' ~ ' + this.end_date;
      }
    }
}
</script>
