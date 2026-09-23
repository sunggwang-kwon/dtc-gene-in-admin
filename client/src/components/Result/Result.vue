<template>
  <!-- desktop -->
  <v-container v-if="!$vuetify.breakpoint.mobile" class="pa-0 content-background" style="border-left:1px solid rgba(0,0,0,0.12);border-right:1px solid rgba(0,0,0,0.12);min-height:100%;" fluid>
    <div id="header" :style="{
      position: 'sticky',
      top: $vuetify.application.top+'px',
      zIndex:1
    }">
      <div class="px-3 py-5" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto">
            <h3>검사결과</h3>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <v-tooltip bottom color="rgba(0,0,0,0.7)">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="new_window" v-bind="attrs" v-on="on" icon small><v-icon>mdi-window-restore</v-icon></v-btn>
              </template>
              <span>새창에서 열기</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <div v-if="is_show_search">
          <v-form ref="form">
            <v-row class="mx-1" align="end">
              <v-col cols="2">
                <div style="font-size:11pt; color:rgba(0,0,0,0.5)">검색조건<span style="color:red"> *</span></div>
                <div><v-select v-model="search_type" @change="patient_id=null;request_date=null;" dense outlined hide-details :items="['ID', '이름']"></v-select></div>
              </v-col>
              <v-col cols="2" class="pl-0">
                <div style="font-size:11pt; color:rgba(0,0,0,0.5)">검색어<span style="color:red"> *</span></div>
                <div><v-text-field v-model="search_value" @change="patient_id=null;request_date=null;" dense outlined hide-details :rules="[required]"></v-text-field></div>
              </v-col>
              <v-col cols="2" class="pl-0">
                <div style="font-size:11pt; color:rgba(0,0,0,0.5)">접수일자</div>
                <div><v-text-field v-model="request_date" readonly dense outlined hide-details></v-text-field></div>
              </v-col>
              <v-col cols="auto" class="pl-0">
                <div style="font-size:11pt; color:rgba(0,0,0,0.5)">결과지 템플릿 버전</div>
                <div><v-text-field v-model="selected_template_name" dense outlined hide-details :readonly="true" append-icon="mdi-cog" @click:append="open_template_dialog"></v-text-field></div>
              </v-col>
            </v-row>
            <v-row class="mx-1" align="center" justify="end">
              <v-col cols="auto" class="pr-0">
                <v-btn @click="print_result" :color="item_cnt>0?'primary':'grey'" :ripple="item_cnt>0" small dark :elevation="0">결과지 출력</v-btn>
              </v-col>
              <v-col cols="auto" class="pr-0">
                <v-btn @click="$refs.result_term_list.open();" small dark :elevation="0">기간별 결과지 출력</v-btn>
              </v-col>
              <v-col v-if="get_menu_authority('M004')=='A'" cols="auto" class="pr-0">
                <v-btn  @click="excel_upload" small dark :elevation="0">검사결과 업로드</v-btn>
              </v-col>
              <v-col v-if="get_menu_authority('M004')=='A'" cols="auto" class="pr-0">
                <v-btn @click="$router.push({name:'DetailResult'})" small dark :elevation="0">추가</v-btn>
              </v-col>
              <v-col v-if="get_menu_authority('M004')=='A'" cols="auto" class="pr-0">
                <v-btn @click="set_result" :color="selected_item.length>0?'primary':'grey'" :ripple="selected_item.length>0" dark small :elevation="0">삭제</v-btn>
              </v-col>
              <v-col cols="auto">
                <v-btn @click="page=1;get_result_list(true);" dark color="search_btn" small :elevation="0">조회</v-btn>
              </v-col>
            </v-row>
          </v-form>
        </div>
      </div>
      <v-btn @click="changed=true;is_show_search=!is_show_search;" icon small :elevation="0" style="background-color:white; position:absolute; transform: translate(-50%, -50%); left:50%; padding:0; border:1px solid rgba(0,0,0,0.12);">
        <v-icon v-if="is_show_search">mdi-menu-up</v-icon>
        <v-icon v-else>mdi-menu-down</v-icon>
      </v-btn>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
      <div class="content-background" style="height:25px;"></div>
    </div>
    <div v-if="is_open" id="content">
      <v-row class="mx-1" align="center">
        <v-col cols="auto" class="pb-1">
          &nbsp;&nbsp;{{ $t('phrases.목록') }} ({{ item_cnt }})
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col class="pt-0">
          <data-table @select="select_item" @sort="sort_item" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order" :detail="false"></data-table>
        </v-col>
      </v-row>
    </div>
    <div id="tail">
      <v-app-bar color="#f5f9fa" style="border-left:1px solid rgba(0,0,0,0.12);border-right:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <pagination @input="set_page" :page="page" :pagePerRecord="rows" :recordLength="item_cnt"></pagination>
          </v-col>
        </v-row>
      </v-app-bar>
    </div>
    <excel-upload-result ref="excel_upload_result"></excel-upload-result>
    <result-exist-popup ref="result_exist_popup" @commit="select_popup"></result-exist-popup>
    <result-term-list ref="result_term_list"></result-term-list>
    <v-dialog v-model="open_template" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?700:'50%'" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center" justify="end">
            <v-col cols="auto">
              <v-btn @click="close_template_dialog()" small icon><v-icon>mdi-window-close</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="mt-5">
          <v-row>
            <v-col>
              <table style="position:relactive; min-width:100%; table-layout:fixed;" border="1">
                <thead>
                  <td style="text-align:center;">버전</td>
                  <td style="text-align:center;">템플릿명</td>
                  <td style="text-align:center;">시작일</td>
                  <td style="text-align:center;">종료일</td>
                </thead>
                <tbody v-if="template_items.length>0">
                  <tr v-for="template_item in template_items" :key="template_item.seq" class="cursor-pointer" @click="select_template(template_item)">
                    <td style="text-align:center;">{{ template_item.version_name }}</td>
                    <td style="text-align:center;">{{ template_item.template_name }}</td>
                    <td style="text-align:center;">{{ template_item.start_date }}</td>
                    <td style="text-align:center;">{{ template_item.end_date }}</td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr>
                    <td style="text-align:center;" :colspan="4">데이터가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>

  <!-- mobile -->
  <v-container v-else class="pa-0 content-background" style="min-height:100%;" fluid>
    <div id="header" :style="{
      position: 'sticky',
      top: $vuetify.application.top+'px',
      zIndex:1
    }">
      <div class="py-5" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto">
            <h3>검사결과</h3>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <v-tooltip bottom color="rgba(0,0,0,0.7)">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="new_window" v-bind="attrs" v-on="on" icon small><v-icon>mdi-window-restore</v-icon></v-btn>
              </template>
              <span>새창에서 열기</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-form ref="form">
          <v-row v-if="is_show_search" class="mx-1" align="center">
            <v-col cols="12" class="pt-0">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">검색조건<span style="color:red"> *</span></div>
              <div><v-select v-model="search_type" @change="patient_id=null;request_date=null;" dense outlined hide-details :items="['ID', '이름']"></v-select></div>
            </v-col>
            <v-col cols="12" class="pt-0">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">검색어<span style="color:red"> *</span></div>
              <div><v-text-field v-model="search_value" @change="patient_id=null;request_date=null;" dense outlined hide-details :rules="[required]"></v-text-field></div>
            </v-col>
            <v-col cols="12" class="pt-0">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">접수일자</div>
              <div><v-text-field v-model="request_date" readonly dense outlined hide-details></v-text-field></div>
            </v-col>
            <v-col cols="12" class="pt-0">
              <v-btn @click="page=1;get_result_list(true);" dark color="search_btn" small block :elevation="0">조회</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </div>
      <v-btn @click="changed=true;is_show_search=!is_show_search;" icon small :elevation="0" style="background-color:white; position:absolute; transform: translate(-50%, -50%); left:50%; padding:0; border:1px solid rgba(0,0,0,0.12);">
        <v-icon v-if="is_show_search">mdi-menu-up</v-icon>
        <v-icon v-else>mdi-menu-down</v-icon>
      </v-btn>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
      <div class="content-background" style="height:25px;"></div>
    </div>
    <div v-if="is_open" id="content">
      <v-row class="mx-1" align="center">
        <v-col cols="auto" class="pb-1">
          &nbsp;&nbsp;{{ $t('phrases.목록') }} ({{ item_cnt }})
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col class="pt-0">
          <data-table @select="select_item" @sort="sort_item" :headers="headers" :items="items" :top="table_top" :detail="false"></data-table>
        </v-col>
      </v-row>
    </div>
    <div :style="'position:fixed; bottom:' + ($vuetify.application.bottom) + 'px;right:10%;'">
      <v-menu offset-y top>
        <template v-slot:activator="{on, attrs}">
          <v-btn v-bind="attrs" v-on="on" icon :elevation="0">
            <v-icon size="50">mdi-plus-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="print_result" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>결과지 출력</v-list-item-subtitle>
          </v-list-item>
          <v-list-item @click="$refs.result_term_list.open();" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>기간별 결과지 출력</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M004')=='A'" @click="excel_upload" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>검사결과 업로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M004')=='A'" @click="$router.push({name:'DetailResult'})" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>추가</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M004')=='A'" @click="set_result" style="border-top:1px solid rgba(0,0,0,0.12);border-bottom:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>삭제</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div id="tail">
      <v-app-bar color="#f5f9fa" bottom app :elevation="0">
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <m-pagination @input="set_page" :page="page" :pagePerRecord="rows" :recordLength="item_cnt"></m-pagination>
          </v-col>
        </v-row>
      </v-app-bar>
    </div>
    <excel-upload-result ref="excel_upload_result"></excel-upload-result>
    <result-exist-popup ref="result_exist_popup" @commit="select_popup"></result-exist-popup>
    <result-term-list ref="result_term_list"></result-term-list>
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import validation from '@/mixin/validation'
import datatable from '@/components/Common/DataTable'
import pagination from '@/components/Common/Pagination'
import mpagination from '@/components/Common/MPagination'
import exceluploadresult from '@/components/Result/ExcelUploadResult'
import resultexistpopup from '@/components/Result/ResultExistPopup'
import resulttermlist from '@/components/Result/ResultTermList'
export default {
  name: 'result-vue',
  mixins: [http, authority, validation],
  components:{
    'data-table': datatable,
    'pagination': pagination,
    'm-pagination': mpagination,
    'excel-upload-result': exceluploadresult,
    'result-exist-popup': resultexistpopup,
    'result-term-list': resulttermlist
  },
  data: () => ({
    is_open: false,
    is_show_search: true,
    changed: false,

    page: 1,
    rows: 60,
    sort: null,
    order: null,
    patient_id: null,
    search_type: 'ID',
    search_value: null,
    request_date: null,

    request_date_list: [],

    table_top: null,
    item_cnt: 0,
    headers: [
      {key:'seq', text:'번호', align:'center', width:'50px'},
      {key:'patient_id', text:'검사자 아이디', align:'center'},
      {key:'patient_name', text:'이름', align:'center'},
      {key:'request_date', text:'접수일자', align:'center'},
      {key:'create_time', text:'결과등록일자', align:'center'},
      {key:'gene_cd', text:'유전자명', align:'center'},
      {key:'snp_cd', text:'SNP', align:'center'},
      {key:'result_type', text:'결과타입', align:'center'},
      {key:'test_date', text:'검사일자', align:'center'},
      {key:'result_risk', text:'결과 Risk', align:'center'},
      {key:'modify_time', text:'수정일자', align:'center'},
      {key:'modify_id', text:'수정자', align:'center'}
    ],
    items: [
      /*
      {

      }
      */
    ],
    selected_item: [],
    selected_template: null,
    selected_template_name: null,
    template_items:[
      /*
      {
        seq:'',
        version_name:'',
        template_name:'',
        file_name:'',
        start_date:'',
        end_date:'',
      }
      */
    ],

    open_template: false,
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:function(){
    if ( !this.get_menu_authority('M004') ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      let bef_result = this.$store.getters.result;
      if( bef_result != null ){
        this.page = bef_result.page;
        this.rows = bef_result.rows;
        this.sort = bef_result.sort;
        this.order = bef_result.order;
        this.patient_id = bef_result.patient_id;
        this.search_type = bef_result.search_type;
        this.search_value = bef_result.search_value;
        this.request_date = bef_result.request_date;
        this.get_template_list().then(res=>{
          if ( res ){
            this.get_result_list().then(res=>{
              this.is_open = res;
            })
          }
          else{
            this.is_open = false;
          }
        });
      }
      else{
        this.get_template_list().then(res=>{
          this.is_open = res;
        })
      }
    }
  },
  mounted:function(){
    if ( !this.$vuetify.breakpoint.mobile ){
      this.$nextTick(function(){
        setTimeout(() => {
          this.cal_table_top();
        }, 1000);
      });
    }
  },
  updated: function(){
    if ( this.changed && !this.$vuetify.breakpoint.mobile ){
      this.$nextTick(function(){
        this.cal_table_top();
        this.changed = false;
      });
    }
  },
  destroyed:function(){
  },
  methods:{
    cal_table_top: function(){
      if ( !document.getElementById('header') ) return;
      this.table_top = document.getElementById('header').clientTop + document.getElementById('header').clientHeight + 47 + 'px';
    },
    new_window:function(){
      const data = this.$router.resolve({name:'Result'});
      window.open(data.href, '_blank');
    },
    select_item:function(item){
      this.selected_item = item;
    },
    sort_item:function(sort, order){
      if ( this.item_cnt == 0 ) return; //테이블 내용이 없을 경우 무시(조회하기 전)
      this.sort = sort;
      this.order = order;
      this.get_result_list();
    },
    set_page:function(page){
      this.page = page;
      this.get_result_list();
      window.scrollTo({top:0, behavior: 'smooth'});
    },
    excel_upload:async function(){
      this.$refs.excel_upload_result.open();
    },
    select_popup:function(item){
      this.patient_id = item.patient_id;
      this.request_date = item.request_date;
      this.get_result_list();
    },
    open_template_dialog:function(){
      this.open_template = true;
    },
    close_template_dialog:function(){
      this.open_template = false;
    },
    select_template:function(val){
      this.selected_template = val.seq;
      this.selected_template_name = val.template_name;
      this.close_template_dialog();
    },
    print_result:function(){
      if ( this.item_cnt <= 0 ) {
        alert("출력할 데이터가 없습니다.");
        return;
      }
      let data = {
        headers:{
          jwt: this.$session.get("jwt")
        },
        param:[{
          patient_id: this.patient_id,
          request_date: this.request_date
        }],
        template_version:this.selected_template,  //template version(seq)
        expire: new Date().getTime()+1800000  //expire time : now() + 30min
      };
      let query_string = "?data=" + btoa(JSON.stringify(data));
      if ( this.selected_template*1 < 4 ){
        window.open(process.env.NODE_ENV==='development'?"http://localhost:8081/viewer"+query_string:"https://hlgenecheck.com/viewer"+query_string, "", "");
      }
      else if ( this.selected_template*1 == 4 ){  //version 4
        window.open(process.env.NODE_ENV==='development'?"http://localhost:8081/v4"+query_string:"https://hlgenecheck.com/v4"+query_string, "", "");
      }
      else if ( this.selected_template*1 == 6 || this.selected_template*1 == 8 ){  //version 5 or 4-1
        window.open(process.env.NODE_ENV==='development'?"http://localhost:8081/v5"+query_string:"https://hlgenecheck.com/v5"+query_string, "", "");
      }
      else if ( this.selected_template*1 == 9 ){  //version 6
        window.open(process.env.NODE_ENV==='development'?"http://localhost:8081"+query_string:"https://hlgenecheck.com/v6"+query_string, "", "");
      }
      else if ( this.selected_template*1 == 7 ){  //영문 version 1
        window.open(process.env.NODE_ENV==='development'?"http://localhost:8081/eng/v1"+query_string:"https://hlgenecheck.com/eng/v1"+query_string, "", "");
      }
    },
    get_request_date_combo:async function(){
      if ( !this.patient_id || this.patient_id.length == 0 ) {
        this.request_date = null;
        this.request_date_list = []
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
    set_result:async function(){
      if ( this.selected_item.length == 0 ) {
        alert("삭제할 대상을 선택하세요.");
        return;
      }
      let con = confirm("선택한 검사결과 " + this.selected_item.length + "건을 삭제하시겠습니까?");
      if ( !con ) return;

      let error_cnt = 0;
      this.$store.commit('load', true);
      for ( let i = 0 ; i < this.selected_item.length ; i++ ){
        let data = {
          transaction: 'delete',
          patient_id: this.items[this.selected_item[i]].patient_id,
          request_date: this.items[this.selected_item[i]].request_date,
          seq: this.items[this.selected_item[i]].seq
        };
        let res = await this.post(this.$rootUrl+'/server/result/set_result.php', data);
        if ( !res ){
          error_cnt++;
        }
      }
      this.$store.commit('load', false);
      if ( error_cnt == 0 ){
        alert("삭제되었습니다.");
      }
      else{
        alert("에러가 " + error_cnt + "건 발생했습니다.");
      }
      this.get_result_list();
    },
    get_template_list:async function(){
      this.$store.commit('load', true);
      const langCd = this.$session.get('Lang');
      const url = this.$rootUrl + '/server/result/get_template_list.php' + (langCd ? '?lang_cd=' + langCd : '');
      let res = await this.get(url);
      this.$store.commit('load', false);
      if ( res ){
        this.template_items = [];
        this.template_items = res.data.info;
        if ( this.template_items.length > 0 ){
          this.template_items.sort((a,b)=>{return b.start_date - a.start_date});
          this.selected_template = this.template_items[0].seq;
          this.selected_template_name = this.template_items[0].template_name;
        }
        return true;
      }
      return false;
    },
    get_result_list:async function(button){
      if ( this.$refs.form && !this.$refs.form.validate() ){
        return false;
      }
      if ( button ){
        let data = {
          search_type: this.search_type == 'ID'? 'id' : this.search_type == '이름' ? 'name' : null,
          search_value : this.search_value
        };
        this.$store.commit('load', true);
        let res = await this.get(this.$rootUrl+'/server/result/get_result_exists_popup.php', data);
        if ( res ){
          if ( res.data.total*1 > 1 ){
            this.$store.commit('load', false);
            this.$refs.result_exist_popup.open(res.data.info);
            return;
          }
          else if( res.data.total*1 == 1 ){
            this.patient_id = res.data.info[0].patient_id;
            this.request_date = res.data.info[0].request_date;
          }
          else{
            alert("데이터가 없습니다.");
            this.$store.commit('load', false);
            return;
          }
        }
        else{
          this.$store.commit('load', false);
          return;
        }
        this.$store.commit('load', false);
      }
      let data = {
        page: this.page,
        rows: this.rows,
        sort: this.sort,
        order: this.order,
        patient_id: this.patient_id,
        request_date: this.request_date
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/result/get_result_list.php', data);
      if ( res ){
        this.item_cnt = res.data.total*1;
        this.items = res.data.info;
        this.items.forEach(element=>{
          element.test_date = element.test_date.split(' ')[0];
        })
        this.$store.commit('result', {
          page: this.page,
          rows: this.rows,
          sort: this.sort,
          order: this.order,
          patient_id: this.patient_id,
          search_type: this.search_type,
          search_value: this.search_value,
          request_date: this.request_date
        });
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    }
  },
}
</script>
