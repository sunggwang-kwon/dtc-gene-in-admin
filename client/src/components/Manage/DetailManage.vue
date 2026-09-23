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
            <h3 v-if="transaction=='insert'">검사자 추가</h3>
            <h3 v-else>검사자 정보</h3>
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
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">아이디<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="patient_id" @input="check_request_path" :readonly="transaction=='view'" :disabled="transaction=='update'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 이름 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">이름<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="patient_name" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 성별 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">성별<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="gender=='M' ? $t('phrases.남자') : $t('phrases.여자')" readonly dense outlined></v-text-field>
                <v-select v-else v-model="gender" dense outlined :items="genderSelectItems" item-text="text" item-value="value"></v-select>
              </v-col>
            </v-row>
            <!-- 생년월일 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">생년월일<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="birth_date" :readonly="transaction=='view'" inputmode="numeric" dense outlined placeholder="YYYY-MM-DD" :rules="[required, birthday_rule]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 검사신청경로 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">검사신청경로</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="parsing_request_path()" readonly dense outlined></v-text-field>
                <v-select v-else v-model="request_path" :readonly="transaction=='view'" dense outlined :items="request_path_list" item-text="value" item-value="code"></v-select>
              </v-col>
            </v-row>
            <!-- 연락처 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">연락처</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="mobile" :readonly="transaction=='view'" inputmode="numeric" dense outlined :placeholder="transaction!='view'?'010-1234-5678':null" :rules="[phone_rule]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 주소 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">주소</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="addr" :readonly="transaction=='view'" inputmode="numeric" dense outlined></v-text-field>
              </v-col>
            </v-row>
            <!-- 검체적합성 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">검체적합성</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="fit_yn=='Y' ? $t('phrases.적합') : $t('phrases.부적합')" readonly dense outlined></v-text-field>
                <v-select v-else v-model="fit_yn" :readonly="transaction=='view'" dense outlined :items="fitSelectItems" item-text="text" item-value="value"></v-select>
              </v-col>
            </v-row>
            <!-- 소속기관/회사 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">소속기관/회사<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col cols="12" lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="company_name" dense outlined readonly></v-text-field>
                <v-select v-else v-model="company_code" dense outlined :items="company_list" item-text="company_name" item-value="seq" :rules="[required]"></v-select>
              </v-col>
            </v-row>
            <!-- 개인정보 수집 이용 동의 여부 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:350px;'">
                <div class="pt-1">개인정보 수집·이용 동의 여부</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="agree1_yn=='Y' ? $t('phrases.동의함') : $t('phrases.동의하지 않음')" readonly dense outlined></v-text-field>
                <v-select v-else v-model="agree1_yn" :readonly="transaction=='view'" dense outlined :items="[{text: $t('phrases.동의함'), value:'Y'},{text: $t('phrases.동의하지 않음'), value:'N'}]" item-text="text" item-value="value"></v-select>
              </v-col>
            </v-row>
            <!-- 2차 서비스 안내를 위한 개인정보 수집 이용 동의 여부 동의 여부 -->
            <v-row align="start" v-show="$i18n.locale !== 'en'" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" style="min-width:350px;">
                <div class="pt-1">2차 서비스 안내를 위한 개인정보 수집·이용 동의 여부</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="agree2_yn=='Y' ? $t('phrases.동의함') : $t('phrases.동의하지 않음')" readonly dense outlined></v-text-field>
                <v-select v-else v-model="agree2_yn" :readonly="transaction=='view'" dense outlined :items="[{text: $t('phrases.동의함'), value:'Y'},{text: $t('phrases.동의하지 않음'), value:'N'}]" item-text="text" item-value="value"></v-select>
              </v-col>
            </v-row>
            <!-- 변경사유 -->
            <v-row v-if="transaction=='update'" align="start" no-gutters>
              <v-col cols="12" :lg="$i18n.locale === 'en' ? 2 : 1" :style="$i18n.locale === 'en' ? 'min-width:220px;' : 'min-width:135px;'">
                <div class="pt-1">변경사유<span style="color:red">(*)</span></div>
              </v-col>
              <v-col>
                <v-text-field v-model="reason" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <v-divider></v-divider>
            <div class="pt-2">
              <v-row align="center" justify="end">
                <v-col cols="auto" class="pb-4 pr-0">
                  <v-btn v-if="get_menu_authority('M003')=='A'" @click="insert_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행추가</v-btn>
                </v-col>
                <v-col cols="auto" class="pb-4">
                  <v-btn v-if="get_menu_authority('M003')=='A'" @click="delete_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행삭제</v-btn>
                </v-col>
              </v-row>
            </div>           
            <v-row align="center">
              <v-col class="pt-0">
                <div class="tinycss" style="overflow-x:auto;">
                  <table style="position:relactive; min-width:350px; table-layout:fixed;" border="1">
                    <thead>
                      <tr>
                        <th width="40px"></th>
                        <th width="130px" style="text-align:center; font-size:10pt; font-weight:bold;">접수일자</th>
                        <th style="text-align:center; font-size:10pt; font-weight:bold;">검사항목</th>
                      </tr>
                    </thead>
                    <tbody v-if="detail.length>0">
                      <tr v-for="(detail_item, index) in detail" :key="index">
                        <td v-if="detail_item.flag!='D'">
                          <v-checkbox v-if="transaction!='view'" v-model="detail_item.check" class="pa-0 ma-0" dense hide-details></v-checkbox>
                        </td>
                        <td v-if="detail_item.flag!='D'">
                          <v-text-field v-model="detail_item.request_date" @change="detail_item.flag!='I'?detail_item.flag='U':null" :readonly="transaction=='view'" dense outlined hide-details placeholder="YYYY-MM-DD" :rules="[birthday_rule]"></v-text-field>
                        </td>
                        <td v-if="detail_item.flag!='D'">
                          <v-row align="center" no-gutters>
                            <v-col cols="12">
                              <v-checkbox :input-value="type_id_checkbox_list.length===detail_item.test_items.length" @change="all_test_items($event, detail_item)" :readonly="transaction=='view'" dense hide-details label="전체선택"></v-checkbox>
                            </v-col>
                            <v-col v-for="(type_id_checkbox_item, index2) in type_id_checkbox_list" :key="index2" cols="12" md="6" lg="4" xl="2">
                              <v-checkbox v-model="detail_item.test_items" @change="detail_item.flag!='I'?detail_item.flag='U':null" :value="type_id_checkbox_item.type_id" class="pa-0 ma-0" :readonly="transaction=='view'" dense hide-details :label="type_id_checkbox_item.type_name"></v-checkbox>
                            </v-col>
                          </v-row>
                        </td>
                      </tr>
                    </tbody>
                    <tbody v-else>
                      <tr>
                        <td :colspan="3" style="text-align:center;">데이터가 없습니다.</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
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
            <v-btn @click="set_patient" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='view'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M003')=='A'" @click="transaction='update'" small dark :elevation="0">수정</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='update'" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="get_patient().then(()=>{transaction='view'})" color="grey" small dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M003')=='A'" @click="set_patient" small dark :elevation="0">저장</v-btn>
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
  name: 'detail-manage-vue',
  mixins: [http, authority, validation],
  data: () => ({
    is_open1 : undefined,
    is_open2 : undefined,

    transaction: null,  //view, insert, update
    patient_id: null,
    patient_name: null,
    gender: 'M',
    age: null,
    birth_date: null,
    request_path: null,
    request_path_list:[],
    mobile: null,
    addr: null,
    fit_yn: 'Y',
    reason: null,
    agree1_yn: 'Y',
    agree2_yn: 'Y',
    company_code: null,
    company_name: null,
    company_list:[],
    detail:[
      /*
      {
        flag:'',//I, D, U
        org_request_date:'',
        request_date:'',
        all_check_test_items: '',
        test_items:[]
      }
      */
    ],
    type_id_checkbox_list:[
      /*
      {
        type_id:'',
        type_name:'',
      }
      */
    ]
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:function(){
    if ( !this.get_menu_authority('M003') ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      this.transaction = this.$route.query.transaction;
      this.get_code_list().then(res=>{
        if ( !res ){
          alert("오류가 발생했습니다.");
          return;
        }
        this.get_company_list().then(res => {
          if ( !res ){
            alert("오류가 발생했습니다.");
            return;
          }
          if ( this.transaction == 'view' ){
            this.patient_id = this.$route.query.patient_id;
            this.get_patient().then(res=>{
              this.is_open1 = res;
            })
          }
          else{
            this.is_open1 = true;
          }
          this.get_type_id_checkbox().then(res=>{
            this.is_open2 = res;
          });
          if ( this.transaction == 'insert' ){
            this.insert_row();
          }
        });
      });
    }
  },
  methods:{
    all_test_items:function(e, val){
      val.test_items = [];
      if ( e ){
        this.type_id_checkbox_list.forEach(element=>{
          val.test_items.push(element.type_id);   
        })
      }
    },
    update_cancel: function(){
      this.get_member().then(()=>{
        this.transaction='view';
      });
    },
    insert_row:function(){
      if ( this.transaction == 'view' ) return;
      let row = {
        flag: 'I',
        check: false,
        request_date: null,
        all_check_test_items: false,
        test_items: [],
      };
      this.detail.unshift(row);
    },
    delete_row:function(){
      for ( let i = this.detail.length-1 ; i >= 0 ; i-- ){
        if ( this.detail[i].check ){
          if ( this.detail[i].flag == 'I' ){
            this.detail.splice(i, 1);
          }
          else{
            this.$set(this.detail[i], 'flag', 'D');
          }
        }
      }
    },
    parsing_request_path: function(){
      if ( this.request_path.length > 0 
      && this.request_path_list.length > 0 ){
        for ( let i = 0 ; i < this.request_path_list.length ; i++ ){
          if ( this.request_path_list[i].code == this.request_path ){
            return this.request_path_list[i].value;
          }
        }
      }
      return null;
    },
    check_request_path: function(){
      if ( this.patient_id.length > 0 ){
        if ( this.patient_id[0] == 'S' ){
          this.request_path = 'S';
        }
        else if ( this.patient_id[0] == 'C' ){
          this.request_path = 'C';
        }
        else if ( this.patient_id[0] == 'G' ){
          this.request_path = 'G';
        }
        else if ( this.patient_id[0] == 'L' ){
          this.request_path = 'L';
        }
        else if ( this.patient_id[0] == 'A' ){
          this.request_path = 'A';
        }
      }
      else{
        this.request_path = null;
      }
    },
    set_patient: async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }
      let con = confirm("입력한 내용으로 검사자 정보를 추가/수정하시겠습니까?");
      if ( !con ) return;

      //빈값 행 제거
      for ( let i = this.detail.length-1 ; i >= 0 ; i-- ){
        if ( !this.detail[i].request_date ){
          this.detail.splice(i, 1);
        }
      }
      let detail = this.lodash.cloneDeep(this.detail);
      detail.forEach(element=>{
        let s_test_items = '';
        for ( let i = 0 ; i < element.test_items.length ; i++ ){
          if ( i > 0 ) s_test_items += ',';
          s_test_items += element.test_items[i];
        }
        element.test_items = s_test_items;
        delete element['check'];
      });
      
      let calculated_age = null;
      if ( this.birth_date ){
        let birth_year = parseInt(this.birth_date.split('-')[0]);
        if ( !isNaN(birth_year) ){
          calculated_age = new Date().getFullYear() - birth_year + 1;
        }
      }

      let data = {
        transaction: this.transaction,
        patient_id: this.patient_id,
        patient_name: this.patient_name,
        gender: this.gender,
        request_path: this.request_path,
        mobile: this.mobile,
        addr: this.addr,
        fit_yn: this.fit_yn,
        agree1_yn: this.agree1_yn,
        agree2_yn: this.agree2_yn,
        age: calculated_age,
        birth_date: this.birth_date,
        reason: this.reason,
        company_no: this.company_code,
        detail: JSON.stringify(detail)
      };
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/patient/set_patient.php', data);
      if ( res ){
        alert("저장되었습니다.");
        this.$store.commit('load', false);
        this.$router.replace({name:'Manage'});
      }
      this.$store.commit('load', false);
    },
    get_patient: async function(){
      let data = {
        patient_id: this.patient_id
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/patient/get_patient.php', data);
      if ( res ){
        this.patient_name = res.data.info.patient_name;
        this.gender = res.data.info.gender;
        this.age = res.data.info.age;
        this.birth_date =  res.data.info.birth_date;
        this.request_path = res.data.info.request_path;
        this.mobile = res.data.info.mobile;
        this.addr = res.data.info.addr;
        this.fit_yn = res.data.info.fit_yn;
        this.agree1_yn = res.data.info.agree1_yn;
        this.agree2_yn = res.data.info.agree2_yn;
        this.reason = res.data.info.reason;
        this.company_code = res.data.info.company_no != "0" ? res.data.info.company_no : null;
        this.company_name = this.company_list.find(element=>element.seq == this.company_code)?.company_name ?? null;
        this.detail = [];
        for ( let i = 0 ; i < res.data.info.detail.length ; i++ ){
          let item = new Object;
          item.org_request_date = res.data.info.detail[i].org_request_date;
          item.request_date = res.data.info.detail[i].request_date;
          item.test_items = [];
          let test_items = res.data.info.detail[i].test_items.split(',');
          test_items.forEach(element=>{
            item.test_items.push(element);
          });
          this.detail.push(item);
        }
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    },
    get_type_id_checkbox:async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/patient/get_type_id_checkbox.php');
      if ( res ){
        this.type_id_checkbox_list = res.data.info;
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    },
    get_code_list:async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/common/get_code_list.php'+'?group_code=G0003');
      if ( res ){
        this.request_path_list = [];
        for ( let i = 0 ; i < res.data.info.length ; i++ ){
          let item = new Object();
          item.code = res.data.info[i].code;
          item.value = res.data.info[i].value;
          this.request_path_list.push(item);
        }
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
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
    is_open: function(){
      if ( this.is_open1 === undefined || this.is_open2 === undefined ){
        this.$store.commit('load', true);
      }
      return this.is_open1 && this.is_open2;
    },
    genderSelectItems: function () {
      return [
        { text: this.$t('phrases.남자'), value: 'M' },
        { text: this.$t('phrases.여자'), value: 'F' },
      ]
    },
    fitSelectItems: function () {
      return [
        { text: this.$t('phrases.적합'), value: 'Y' },
        { text: this.$t('phrases.부적합'), value: 'N' },
      ]
    },
  },
}
</script>