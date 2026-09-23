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
            <h3>검사자관리</h3>
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
          <v-row class="mx-1" align="end">
            <v-col cols="3" style="min-width:260px;">
              <div v-if="date_type=='R'" style="font-size:11pt; color:rgba(0,0,0,0.5)">접수일자</div>
              <div v-else-if="date_type=='C'" style="font-size:11pt; color:rgba(0,0,0,0.5)">등록일자</div>
              <div><v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar"></v-text-field></div>
              <calendar ref="calendar" @commit="set_calendar" @date_type="set_date_type"></calendar>
            </v-col>
            <v-col cols="3">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">ID/검사자명/연락처</div>
              <div><v-text-field v-model="search_value" dense outlined hide-details clearable placeholder="전체"></v-text-field></div>
            </v-col>
            <v-col cols="2">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">TAT</div>
              <div><v-select v-model="tat" class="pa-0 ma-0" hide-details dense outlined :items="[{text:'전체',value:'A'},{text:'초과',value:'E'},{text:'정상',value:'N'}]" item-text="text" item-value="value"></v-select></div>
            </v-col>
          </v-row>
          <v-row class="mx-1" align="center" justify="end">
            <v-col v-if="get_menu_authority('M003')=='A'" cols="auto" class="pr-0">
              <v-btn @click="open_holiday" small dark :elevation="0">영업일관리</v-btn>
            </v-col>
            <v-col v-if="get_menu_authority('M003')=='A'" cols="auto" class="pr-0">
              <v-btn @click="excel_upload" small dark :elevation="0">검사자업로드</v-btn>
            </v-col>
            <v-col v-if="get_menu_authority('M003')=='A'" cols="auto" class="pr-0">
              <v-btn @click="excel_download" small dark :elevation="0">다운로드</v-btn>
            </v-col>
            <v-col cols="auto" class="pr-0">
              <v-btn @click="get_barcode" :color="selected_item.length>0?'primary':'grey'" :ripple="selected_item>0" small dark :elevation="0">바코드</v-btn>
            </v-col>
            <v-col v-if="get_menu_authority('M003')=='A'" cols="auto" class="pr-0">
              <v-btn @click="$router.push({name:'DetailManage', query:{transaction:'insert'}})" small dark :elevation="0">추가</v-btn>
            </v-col>
            <v-col v-if="get_menu_authority('M003')=='A'" cols="auto" class="pr-0">
              <v-btn @click="set_patient" :color="selected_item.length>0?'primary':'grey'" :ripple="selected_item>0" dark small :elevation="0">삭제</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn @click="page=1;get_patient_list();" dark color="search_btn" small :elevation="0">조회</v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
      <v-btn @click="changed=true;is_show_search=!is_show_search;" icon small :elevation="0" style="background-color:white; position:absolute; transform: translate(-50%, -50%); left:50%; padding:0; border:1px solid rgba(0,0,0,0.12);">
        <v-icon v-if="is_show_search">mdi-menu-up</v-icon>
        <v-icon v-else>mdi-menu-down</v-icon>
      </v-btn>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
      <div class="content-background" style="height:25px;"></div>
    </div>
    <div id="content">
      <v-row class="mx-1" align="center">
        <v-col cols="auto" class="pb-1">
          &nbsp;&nbsp;{{ $t('phrases.목록') }} ({{ item_cnt }})
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col class="pt-0">
          <data-table @click="click_item" @select="select_item" @sort="sort_item" @link="click_update_date" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order"></data-table>
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
    <holiday ref="holiday"></holiday>
    <manage-history ref="manage_history"></manage-history>
    <detail-barcode ref="detail_barcode"></detail-barcode>
    <excel-upload-patient ref="excel_upload_patient"></excel-upload-patient>
  </v-container>

  <!-- mobile -->
  <v-container v-else class="pa-0 content-background" style="min-height:100%;" fluid>
    <div id="header" style="position:sticky; top:48px; z-index:1">
      <div class="py-5" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto">
            <h3>검사자관리</h3>
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
        <v-row v-if="is_show_search" class="mx-1" align="center">
          <v-col cols="12">
            <div v-if="date_type=='R'" style="font-size:11pt; color:rgba(0,0,0,0.5)">접수일자</div>
            <div v-else-if="date_type=='C'" style="font-size:11pt; color:rgba(0,0,0,0.5)">등록일자</div>
            <div><v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar"></v-text-field></div>
            <m-calendar ref="calendar" @commit="set_calendar" @date_type="set_date_type"></m-calendar>
          </v-col>
          <v-col cols="12" class="pt-0">
            <div style="font-size:11pt; color:rgba(0,0,0,0.5)">ID/검사자명/연락처</div>
            <div><v-text-field v-model="search_value" dense outlined hide-details clearable placeholder="전체"></v-text-field></div>
          </v-col>
          <v-col cols="12" class="pt-0">
            <div style="font-size:11pt; color:rgba(0,0,0,0.5)">TAT</div>
            <v-select v-model="tat" class="pa-0 ma-0" hide-details dense outlined :items="[{text:'전체',value:'A'},{text:'초과',value:'E'},{text:'정상',value:'N'}]" item-text="text" item-value="value"></v-select>
          </v-col>
          <v-col cols="12">
            <v-btn @click="page=1;get_patient_list();" dark color="search_btn" small block :elevation="0">조회</v-btn>
          </v-col>
        </v-row>
      </div>
      <v-btn @click="changed=true;is_show_search=!is_show_search;" icon small :elevation="0" style="background-color:white; position:absolute; transform: translate(-50%, -50%); left:50%; padding:0; border:1px solid rgba(0,0,0,0.12);">
        <v-icon v-if="is_show_search">mdi-menu-up</v-icon>
        <v-icon v-else>mdi-menu-down</v-icon>
      </v-btn>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
      <div class="content-background" style="height:25px;"></div>
    </div>
    <div id="content">
      <v-row class="mx-1" align="center">
        <v-col cols="auto" class="pb-1">
          &nbsp;&nbsp;{{ $t('phrases.목록') }} ({{ item_cnt }})
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col>
          <data-table @click="click_item" @select="select_item" @sort="sort_item" @link="click_update_date" :headers="headers" :items="items" :top="table_top"></data-table>
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
          <v-list-item v-if="get_menu_authority('M003')=='A'" @click="open_holiday" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>영업일관리</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M003')=='A'" @click="excel_upload" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>검사자업로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M003')=='A'" @click="excel_download" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>다운로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item @click="get_barcode" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>바코드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M003')=='A'" @click="$router.push({name:'DetailManage', query:{transaction:'insert'}})" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>추가</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M003')=='A'" @click="set_patient" style="border-top:1px solid rgba(0,0,0,0.12);border-bottom:1px solid rgba(0,0,0,0.12)">
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
    <holiday ref="holiday"></holiday>
    <manage-history ref="manage_history"></manage-history>
    <detail-barcode ref="detail_barcode"></detail-barcode>
    <excel-upload-patient ref="excel_upload_patient"></excel-upload-patient>
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import datatable from '@/components/Common/DataTable'
import pagination from '@/components/Common/Pagination'
import mpagination from '@/components/Common/MPagination'
import calendar from '@/components/Common/Calendar'
import mcalendar from '@/components/Common/MCalendar'
import managehistory from '@/components/Common/ManageHistory'
import detailbarcode from '@/components/Common/DetailBarcode'
import holiday from '@/components/Common/Holiday'
import exceluploadpatient from '@/components/Manage/ExcelUploadPatient'
export default {
  name: 'manage-vue',
  mixins: [http, authority],
  components:{
    'data-table': datatable,
    'pagination': pagination,
    'm-pagination': mpagination,
    'calendar': calendar,
    'm-calendar': mcalendar,
    'manage-history':managehistory,
    'detail-barcode': detailbarcode,
    'holiday': holiday,
    'excel-upload-patient': exceluploadpatient,
  },
  data: () => ({
    is_show_search: true,
    changed: false,

    page: 1,
    rows: 30,
    sort: null,
    order: null,
    search_value: null,
    from_date: null,
    to_date: null,

    table_top: null,
    item_cnt: 0,
    headers: [
      //{key:'no', text:'번호', align:'center'},
      {key:'patient_id', text:'아이디', align:'center'},
      {key:'patient_name', text:'검사자명', align:'center'},
      {key:'gender', text:'성별', align:'center', width:'7%'},
      //{key:'requset_date', text:'접수일자', align:'center', width:'9%'},
      {key:'check_status', text:'진행상황', align:'center', width:'9%'},
      {key:'birth_date', text:'생년월일', align:'center', width:'10%'},
      {key:'lims_id', text:'등록자', align:'center'},
      {key:'tat_day', text:'TAT초과일', align:'center'},
      {key:'fit_yn', text:'검체적합성', align:'center'},
      {key:'create_time', text:'접수일자', align:'center', width:'9%'},
      {key:'result_date', text:'결과등록일자', align:'center', width:'9%'},
      {key:'modify_time', text:'수정일자', align:'center', width:'9%', link:true},
      {key:'modify_id', text:'수정자', align:'center'}
    ],
    items: [
      /*
      {

      }
      */
    ],
    tat: 'A',
    date_type: 'R',
    selected_item: [],
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
      let bef_manage = this.$store.getters.manage;
      if( bef_manage != null ){
        this.page = bef_manage.page;
        this.rows = bef_manage.rows;
        this.sort = bef_manage.sort;
        this.order = bef_manage.order;
        this.search_value = bef_manage.search_value;
        this.from_date = bef_manage.from_date;
        this.to_date = bef_manage.to_date;
        this.tat = bef_manage.tat;
        this.date_type = bef_manage.date_type;
        this.get_patient_list().then(res=>{
          this.is_open = res;
        });
      }
      else{
        let now = new Date();
        let year = now.getFullYear();
        let month = (now.getMonth()*1)+1;
        let day = now.getDate();
        if ( month < 10 ) month = '0' + month;
        if ( day < 10 ) day = '0' + day;

        let bef = new Date(now.getFullYear(), now.getMonth()-1, now.getDate());
        let bef_year = bef.getFullYear();
        let bef_month = (bef.getMonth()*1)+1;
        let bef_day = bef.getDate();
        if ( bef_month < 10 ) bef_month = '0' + bef_month;
        if ( bef_day < 10 ) bef_day = '0' + bef_day;

        this.from_date = bef_year+'-'+bef_month+'-'+bef_day;
        this.to_date = year+'-'+month+'-'+day;
        this.get_patient_list().then(res=>{
          this.is_open = res;
        });
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
  methods:{
    cal_table_top: function(){
      if ( !document.getElementById('header') ) return;
      this.table_top = document.getElementById('header').clientTop + document.getElementById('header').clientHeight + 47 + 'px';
    },
    new_window:function(){
      const data = this.$router.resolve({name:'Manage'});
      window.open(data.href, '_blank');
    },
    click_update_date:function(item){
      this.$refs.manage_history.open(item.patient_id);
    },
    click_item:function(item/*, event*/){
      this.$router.push({name:'DetailManage', query:{transaction:'view', patient_id: item.patient_id}});
    },
    select_item:function(item){
      this.selected_item = item;
    },
    sort_item:function(sort, order){
      if ( this.item_cnt == 0 ) return; //테이블 내용이 없을 경우 무시(조회하기 전)
      this.sort = sort;
      this.order = order;
      this.get_patient_list();
    },
    open_calendar:function(event){
      this.$refs.calendar.open([this.from_date, this.to_date], event.pageX, event.pageY, this.date_type);
    },
    set_calendar:function(item){
      if ( item[0] < item[1] ){
        this.from_date = item[0];
        this.to_date = item[1];
      }
      else{
        this.from_date = item[1];
        this.to_date = item[0];
      }
    },
    set_date_type:function(item){
      this.date_type = item;
      console.log(this.date_type);
    },
    set_page:function(page){
      this.page = page;
      this.get_patient_list();
      window.scrollTo({top:0, behavior: 'smooth'});
    },
    excel_upload:async function(){
      this.$refs.excel_upload_patient.open();
    },
    excel_download:async function(){
      let data = {
        date_type: this.date_type,
        from_date: this.from_date,
        to_date: this.to_date
      };
      let ids = [];
      // 선택된 검사자가 있을 경우 해당 ID만 다운로드
      if ( this.selected_item.length > 0 ){
        this.selected_item.forEach(index => {
          ids.push(this.items[index].patient_id);
        });
        data.patient_ids = ids;
      }
      this.$store.commit('load', true);
      let res = await this.postDownload(this.$rootUrl+'/server/patient/excel_download_patient.php', data);
      this.$store.commit('load', false);
      if ( res ){
        let fileURL = window.URL.createObjectURL(new Blob([res.data], {type:'application/vnd.ms-excel'}));
        let fileLink = document.createElement('a');
        fileLink.href = fileURL;

        let fileName = '';
        if ( ids.length === 1 ) {
          fileName = 'Patient_list_' + ids[0] + '.xls';
        } else if ( ids.length > 1 ) {
          fileName = 'Patient_list_' + ids[0] + '_외' + (ids.length - 1) + '건.xls';
        } else {
          fileName = 'Patient_list_' + this.from_date + '_' + this.to_date + '.xls';
        }

        fileLink.setAttribute('download', fileName);
        document.body.appendChild(fileLink);
        fileLink.click();
        return true;
      }
      return false;
    },
    get_barcode:async function(){
      if ( this.selected_item.length == 0 ) {
        alert("바코드를 생성할 대상을 선택하세요.");
        return;
      }
      let items = [];
      this.selected_item.forEach(element=>{
        items.push({patient_id: this.items[element].patient_id, request_date: this.items[element].request_date});
      })
      this.$refs.detail_barcode.open(items);
    },
    open_holiday:function(){
      this.$refs.holiday.open();
    },
    set_patient:async function(){
      if ( this.selected_item.length == 0 ) {
        alert("삭제할 대상을 선택하세요.");
        return;
      }
      let con = confirm("선택한 검사자 " + this.selected_item.length + "건을 삭제하시겠습니까?");
      if ( !con ) return;

      let error_cnt = 0;
      this.$store.commit('load', true);
      for ( let i = 0 ; i < this.selected_item.length ; i++ ){
        let data = {
          transaction: 'delete',
          patient_id: this.items[this.selected_item[i]].patient_id
        };
        let res = await this.post(this.$rootUrl+'/server/patient/set_patient.php', data);
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
      this.get_patient_list();
    },
    get_patient_list:async function(){
      let data = {
        page: this.page,
        rows: this.rows,
        sort: this.sort,
        order: this.order,
        search_value: this.search_value?'%'+this.search_value+'%':null,
        from_date: this.from_date,
        to_date: this.to_date,
        tat: this.tat,
        date_type: this.date_type
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/patient/get_patient_list.php', data);
      if ( res ){
        this.item_cnt = res.data.total*1;
        this.items = res.data.info;
        this.$store.commit('manage', {
          page: this.page,
          rows: this.rows,
          sort: this.sort,
          order: this.order,
          search_value: this.search_value,
          from_date: this.from_date,
          to_date: this.to_date,
          tat: this.tat,
          date_type: this.date_type
        });
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    }
  },
  computed:{
    date_range:function(){
      return this.from_date + ' ~ ' + this.to_date;
    }
  }
}
</script>
