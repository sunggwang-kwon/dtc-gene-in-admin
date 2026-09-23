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
            <h3>검사결과 추가</h3>
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
                <div class="pt-1">아이디<span style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="patient_id" @blur="get_request_date_combo" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 의뢰일자 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">접수일자<span style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-select v-model="request_date" dense outlined item-text="request_date" item-value="request_date" :items="request_date_list" no-data-text="데이터가 없습니다." :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 검사일자 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">검사일자<span style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-model="test_date" readonly dense outlined :rules="[required]" append-icon="mdi-calendar-month" @click:append="open_calendar"></v-text-field>
                <calendar v-if="!$vuetify.breakpoint.mobile" ref="calendar" :select="1" @commit="set_calendar"></calendar>
                <m-calendar v-else ref="calendar" :select="1" @commit="set_calendar"></m-calendar>
              </v-col>
            </v-row>
            <!-- 분류코드 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">분류코드<span style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-select v-model="type_id" @change="get_snp_code_combo" dense outlined item-text="type_name" item-value="type_id" :items="type_id_list" no-data-text="데이터가 없습니다." :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- SNP코드 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">SNP<span style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-select v-model="snp_cd" @change="get_snp_type_combo" dense outlined item-text="snp_cd" item-value="snp_cd" :items="snp_cd_list" no-data-text="데이터가 없습니다." :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 결과타입 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">결과타입<span style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-select v-model="result_snp_type" dense outlined item-text="snp_type" item-value="snp_type" :items="result_snp_list" no-data-text="데이터가 없습니다." :rules="[required]"></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </div>
    <div id="tail">
      <v-app-bar color="rgb(255,255,255)" style="border:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row align="center" justify="end">
          <v-col cols="auto">
            <v-btn @click="set_result" small dark :elevation="0">저장</v-btn>
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
import mcalendar from '@/components/Common/MCalendar'
export default {
  name: 'detail-result-vue',
  mixins: [http, authority, validation],
  components:{
    'calendar': calendar,
    'm-calendar': mcalendar,
  },
  data: () => ({
    is_open: false,

    transaction: 'insert',
    seq: null,
    patient_id: null,
    request_date: null,
    test_date: null,
    type_id: null,
    snp_cd: null,
    result_snp_type: null,

    request_date_list: [],
    type_id_list: [],
    snp_cd_list: [],
    result_snp_list: [],
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:function(){
    if ( !this.get_menu_authority('M004') || this.get_menu_authority('M004')!='A' ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      let now = new Date();
      let year = now.getFullYear();
      let month = (now.getMonth()*1)+1;
      let day = now.getDate();
      if ( month < 10 ) month = '0' + month;
      if ( day < 10 ) day = '0' + day;
      this.test_date = year + '-' + month + '-' + day;
      this.is_open = true;
      
      this.get_type_id_combo();
    }
  },
  methods:{
    open_calendar:function(event){
      this.$refs.calendar.open(this.test_date, event.pageX, event.pageY);
    },
    set_calendar:function(item){
      this.test_date = item;
    },
    set_result: async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }
      let con = confirm("입력한 내용으로 검사결과를 추가하시겠습니까?");
      if ( !con ) return;
      
      let data = {
        transaction: this.transaction,
        seq: this.seq,
        patient_id: this.patient_id,
        request_date: this.request_date,
        test_date: this.test_date,
        type_id: this.type_id,
        snp_cd: this.snp_cd,
        result_snp_type: this.result_snp_type
      }
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/result/set_result.php', data);
      if ( res ){
        alert("저장되었습니다.");
        this.$store.commit('load', false);
        this.$router.replace({name:'Result'});
      }
      this.$store.commit('load', false);
    },
    get_snp_type_combo: async function(){
      if ( !this.snp_cd || this.snp_cd.length == 0 ){
        this.result_snp_type = null;
        this.result_snp_list = [];
        return;
      }
      let data = {
        snp_cd: this.snp_cd
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/result/get_snp_type_combo.php', data);
      if ( res ){
        this.result_snp_type = null;
        this.result_snp_list = res.data.info;
        this.result_snp_list.forEach(element=>{
          if ( element.snp_type == null ){
            element.snp_type = 'null';
          }
        })
      }
      this.$store.commit('load', false);
      return false;
    },
    get_snp_code_combo: async function(){
      if ( !this.type_id || this.type_id.length == 0 ){
        this.snp = null;
        this.snp_cd_list = [];
        return;
      }
      let data = {
        type_id: this.type_id
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/result/get_snp_code_combo.php', data);
      if ( res ){
        this.snp = null;
        this.snp_cd_list = res.data.info;
      }
      this.$store.commit('load', false);
      return false;
    },
    get_request_date_combo:async function(){
      if ( !this.patient_id || this.patient_id.length == 0 ){
        this.request_date = null;
        this.request_date_list = [];
        return;
      }
      let data = {
        patient_id: this.patient_id
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/result/get_request_date_combo.php', data);
      if ( res ){
        this.request_date = null;
        this.request_date_list = res.data.info;
      }
      this.$store.commit('load', false);
      return false;
    },
    get_type_id_combo: async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/result/get_type_id_combo.php');
      if ( res ){
        //this.type_id = null;
        this.type_id_list = res.data.info;
      }
      this.$store.commit('load', false);
      return false;
    },
  }
}
</script>