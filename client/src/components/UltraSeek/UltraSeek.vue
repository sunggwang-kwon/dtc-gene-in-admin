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
            <h3>{{ $t('app.menu.ultraseek') }}</h3>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <v-tooltip bottom color="rgba(0,0,0,0.7)">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="new_window" v-bind="attrs" v-on="on" icon><v-icon>mdi-window-restore</v-icon></v-btn>
              </template>
              <span>새창에서 열기</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <div v-if="is_show_search">
          <v-row class="mx-1" align="end">
            <v-col cols="3" style="min-width:260px;">
              <v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar" :label="dt_type=='complete' ? '완료일자' : '접수일자'"></v-text-field>
              <calendar ref="calendar" @commit="set_calendar" @date_type="set_date_type"></calendar>
            </v-col>
            <v-col cols="2" style="min-width:140px;">
              <v-select v-model="dt_type" @change="on_change_dt_type" dense outlined hide-details :items="dt_type_items" item-text="text" item-value="value" label="기간구분"></v-select>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="search_value" @keydown.enter="page=1;get_ultraseek_list();" dense outlined hide-details clearable label="거래처명/검사자명/ID"></v-text-field>
            </v-col>
          </v-row>
          <v-row class="mx-1" align="center" justify="end">
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="py-1 pr-0">
              <v-tooltip bottom color="rgba(0,0,0,0.7)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="d-inline-block">
                    <v-btn @click="excel_upload_patient" color="primary" dark :elevation="0">검사자업로드</v-btn>
                  </span>
                </template>
                <span>검사자 엑셀 업로드</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="py-1 pr-0">
              <v-tooltip bottom color="rgba(0,0,0,0.7)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="d-inline-block">
                    <v-btn :class="{'btn-inactive': item_cnt === 0}" @click="item_cnt > 0 ? excel_download_patient() : null" :color="item_cnt > 0 ? 'primary' : ''" :dark="item_cnt > 0" :ripple="item_cnt > 0" :elevation="0">검사자다운로드</v-btn>
                  </span>
                </template>
                <span>{{ item_cnt === 0 ? '다운로드할 데이터가 없습니다' : '검사자 목록 다운로드' }}</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="py-1 pr-0">
              <v-tooltip bottom color="rgba(0,0,0,0.7)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="d-inline-block">
                    <v-btn @click="excel_upload_result" color="primary" dark :elevation="0">결과지 업로드</v-btn>
                  </span>
                </template>
                <span>결과지 다중 업로드</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="py-1 pr-0">
              <v-tooltip bottom color="rgba(0,0,0,0.7)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="d-inline-block">
                    <v-btn
                      :class="{'btn-inactive': selected_item.length === 0}"
                      @click="selected_item.length > 0 ? download_results() : null"
                      :color="selected_item.length > 0 ? 'primary' : ''"
                      :dark="selected_item.length > 0"
                      :ripple="selected_item.length > 0"
                      :elevation="0"
                    >결과지 다운로드</v-btn>
                  </span>
                </template>
                <span>{{ selected_item.length === 0 ? '대상을 선택하세요' : '결과지 일괄 다운로드' }}</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="py-1 pr-0">
              <v-tooltip bottom color="rgba(0,0,0,0.7)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="d-inline-block">
                    <v-btn
                      @click="add_patient"
                      color="primary"
                      dark
                      :elevation="0"
                    >추가</v-btn>
                  </span>
                </template>
                <span>검사자 신규 등록</span>
              </v-tooltip>
            </v-col>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="py-1 pr-0">
              <v-tooltip bottom color="rgba(0,0,0,0.7)">
                <template v-slot:activator="{ on, attrs }">
                  <span v-bind="attrs" v-on="on" class="d-inline-block">
                    <v-btn
                      :class="{'btn-inactive': selected_item.length === 0}"
                      @click="selected_item.length > 0 ? delete_patients() : null"
                      :color="selected_item.length > 0 ? 'primary' : ''"
                      :dark="selected_item.length > 0"
                      :ripple="selected_item.length > 0"
                      :elevation="0"
                    >삭제</v-btn>
                  </span>
                </template>
                <span>{{ selected_item.length === 0 ? '대상을 선택하세요' : '선택 검사자 삭제' }}</span>
              </v-tooltip>
            </v-col>
            <v-col cols="auto" class="py-1">
              <v-btn @click="page=1;get_ultraseek_list();" dark color="search_btn" :elevation="0">조회</v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
      <v-btn @click="changed=true;is_show_search=!is_show_search;" icon :elevation="0" style="background-color:white; position:absolute; transform: translate(-50%, -50%); left:50%; padding:0; border:1px solid rgba(0,0,0,0.12);">
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
        <v-spacer></v-spacer>
        <v-col cols="auto" class="pb-1">
          <rows-select v-model="rows" @change="change_rows"></rows-select>
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col class="pt-0">
          <data-table @select="select_item" @sort="sort_item" @link="click_file" @click="click_item" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order" :detail="false"></data-table>
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
    <excel-upload-patient ref="excel_upload_patient" :endpoint="api_endpoints.UPLOAD_PATIENT" @refresh="get_ultraseek_list"></excel-upload-patient>
    <upload-result ref="upload_result" :endpoint="api_endpoints.UPLOAD_RESULT" @refresh="get_ultraseek_list"></upload-result>
    <add-patient-modal ref="add_patient_modal" :endpoint="api_endpoints.ADD_PATIENT" @refresh="get_ultraseek_list"></add-patient-modal>
  </v-container>

  <!-- mobile -->
  <v-container v-else class="pa-0 content-background" style="min-height:100%;" fluid>
    <div id="header" style="position:sticky; top:48px; z-index:1">
      <div class="py-5" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto">
            <h3>{{ $t('app.menu.ultraseek') }}</h3>
          </v-col>
          <v-col cols="auto" class="pl-0">
            <v-tooltip bottom color="rgba(0,0,0,0.7)">
              <template v-slot:activator="{ on, attrs }">
                <v-btn @click="new_window" v-bind="attrs" v-on="on" icon><v-icon>mdi-window-restore</v-icon></v-btn>
              </template>
              <span>새창에서 열기</span>
            </v-tooltip>
          </v-col>
        </v-row>
        <v-row v-if="is_show_search" class="mx-1" align="center">
          <v-col cols="12">
            <v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar" :label="dt_type=='complete' ? '완료일자' : '접수일자'"></v-text-field>
            <m-calendar ref="calendar" @commit="set_calendar" @date_type="set_date_type"></m-calendar>
          </v-col>
          <v-col cols="12" class="pt-0">
            <v-select v-model="dt_type" @change="on_change_dt_type" dense outlined hide-details :items="dt_type_items" item-text="text" item-value="value" label="기간구분"></v-select>
          </v-col>
          <v-col cols="12" class="pt-0">
            <v-text-field v-model="search_value" @keydown.enter="page=1;get_ultraseek_list();" dense outlined hide-details clearable label="거래처명/검사자명/ID"></v-text-field>
          </v-col>
          <v-col cols="12">
            <v-btn @click="page=1;get_ultraseek_list();" dark color="search_btn" block :elevation="0">조회</v-btn>
          </v-col>
        </v-row>
      </div>
      <v-btn @click="changed=true;is_show_search=!is_show_search;" icon :elevation="0" style="background-color:white; position:absolute; transform: translate(-50%, -50%); left:50%; padding:0; border:1px solid rgba(0,0,0,0.12);">
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
          <data-table @select="select_item" @sort="sort_item" @link="click_file" @click="click_item" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order" :detail="false"></data-table>
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
          <v-list-item v-if="get_menu_authority('M007')=='A'" @click="excel_upload_patient" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>검사자업로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M007')=='A'" :disabled="item_cnt === 0" @click="item_cnt > 0 ? excel_download_patient() : null" :style="item_cnt === 0 ? 'opacity: 0.4; cursor: not-allowed;' : ''" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle :style="item_cnt === 0 ? 'color: #888888 !important;' : ''">검사자다운로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M007')=='A'" @click="excel_upload_result" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>결과지 업로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M007')=='A'" :disabled="selected_item.length === 0" @click="selected_item.length > 0 ? download_results() : null" :style="selected_item.length === 0 ? 'opacity: 0.4; cursor: not-allowed;' : ''" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle :style="selected_item.length === 0 ? 'color: #888888 !important;' : ''">결과지 다운로드</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M007')=='A'" @click="add_patient" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>추가</v-list-item-subtitle>
          </v-list-item>
          <v-list-item v-if="get_menu_authority('M007')=='A'" :disabled="selected_item.length === 0" @click="selected_item.length > 0 ? delete_patients() : null" :style="selected_item.length === 0 ? 'opacity: 0.4; cursor: not-allowed;' : ''" style="border-top:1px solid rgba(0,0,0,0.12);border-bottom:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle :style="selected_item.length === 0 ? 'color: #888888 !important;' : ''">삭제</v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div id="tail">
      <v-app-bar color="#f5f9fa" style="border-left:1px solid rgba(0,0,0,0.12);border-right:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row align="center" justify="center">
          <v-col cols="auto">
            <m-pagination @input="set_page" :page="page" :pagePerRecord="rows" :recordLength="item_cnt"></m-pagination>
          </v-col>
        </v-row>
      </v-app-bar>
    </div>
    <excel-upload-patient ref="excel_upload_patient" :endpoint="api_endpoints.UPLOAD_PATIENT" @refresh="get_ultraseek_list"></excel-upload-patient>
    <upload-result ref="upload_result" :endpoint="api_endpoints.UPLOAD_RESULT" @refresh="get_ultraseek_list"></upload-result>
    <add-patient-modal ref="add_patient_modal" :endpoint="api_endpoints.ADD_PATIENT" @refresh="get_ultraseek_list"></add-patient-modal>
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import datatable from '@/components/Common/DataTable'
import pagination from '@/components/Common/Pagination'
import mpagination from '@/components/Common/MPagination'
import rowsselect from '@/components/Common/RowsSelect'
import calendar from '@/components/Common/Calendar'
import mcalendar from '@/components/Common/MCalendar'
import exceluploadpatient from '@/components/UltraSeek/ExcelUploadPatient'
import uploadresult from '@/components/UltraSeek/UploadResult'
import addpatientmodal from '@/components/UltraSeek/AddPatientModal'

export default {
  name: 'UltraSeek',
  mixins: [http, authority],
  components: {
    'data-table': datatable,
    'pagination': pagination,
    'm-pagination': mpagination,
    'rows-select': rowsselect,
    'calendar': calendar,
    'm-calendar': mcalendar,
    'excel-upload-patient': exceluploadpatient,
    'upload-result': uploadresult,
    'add-patient-modal': addpatientmodal
  },
  data() {
    const root = this.$rootUrl + '/server/ultraseek/';
    return {
      is_show_search: true,
      changed: false,

      page: 1,
      rows: 20,
      sort: null,
      order: null,
      search_value: null,
      from_date: null,
      to_date: null,
      dt_type: '',
      dt_type_items: [
        { text: '접수일', value: '' },
        { text: '완료일', value: 'complete' }
      ],

      selected_item: [],
      api_endpoints: {
        GET_LIST: root + 'get_ultra_seek_list.php',
        UPLOAD_PATIENT: root + 'upload_ultra_seek_patient.php',
        DOWNLOAD_PATIENT: root + 'download_ultra_seek_patient.php',
        UPLOAD_RESULT: root + 'upload_ultra_seek_multifile.php',
        DOWNLOAD_RESULT: root + 'download_ultra_seek_multifile.php',
        ADD_PATIENT: root + 'set_ultra_seek.php',
        DELETE_PATIENT: root + 'set_ultra_seek.php'
      },

      table_top: null,
      item_cnt: 0,
      headers: [
        { key: 'no', text: '번호', align: 'center', width: '5%', sortable: false },
        { key: 'patient_id', text: 'ID', align: 'center', width: '9%' },
        { key: 'file_name', text: '파일명', align: 'center', width: '14%', link: true, sortable: false },
        { key: 'download_yn', text: '다운로드여부', align: 'center', width: '7%', sortable: false },
        { key: 'company_name', text: '거래처명', align: 'center', width: '12%' },
        { key: 'patient_name', text: '검사자명', align: 'center', width: '8%' },
        { key: 'age', text: '나이', align: 'center', width: '5%' },
        { key: 'gender', text: '성별', align: 'center', width: '5%' },
        { key: 'blood_date', text: '채혈일', align: 'center', width: '9%' },
        { key: 'reg_date', text: '접수일', align: 'center', width: '9%' },
        { key: 'finish_date', text: '완료일', align: 'center', width: '9%' },
        { key: 'status', text: '상태', align: 'center', width: '8%', sortable: false }
      ],
      items: []
    };
  },
  beforeCreate: function() {
    if (!this.$session.has('jwt')) {
      this.$router.replace({ name: 'Login' });
    }
  },
  created: function() {
    if (!this.get_menu_authority('M007')) {
      alert('해당 메뉴 접근 권한이 없습니다.');
      this.$router.go(-1);
      return;
    }

    this.$store.commit('load_rows', this.$session.get('Userid'));
    this.rows = this.$store.getters.rows;

    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let day = now.getDate();
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    let bef = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    let bef_year = bef.getFullYear();
    let bef_month = bef.getMonth() + 1;
    let bef_day = bef.getDate();
    if (bef_month < 10) bef_month = '0' + bef_month;
    if (bef_day < 10) bef_day = '0' + bef_day;

    this.from_date = bef_year + '-' + bef_month + '-' + bef_day;
    this.to_date = year + '-' + month + '-' + day;

    this.get_ultraseek_list();
  },
  mounted: function() {
    if (!this.$vuetify.breakpoint.mobile) {
      this.$nextTick(function() {
        setTimeout(() => {
          this.cal_table_top();
        }, 1000);
      });
    }
  },
  updated: function() {
    if (this.changed && !this.$vuetify.breakpoint.mobile) {
      this.$nextTick(function() {
        this.cal_table_top();
        this.changed = false;
      });
    }
  },
  methods: {
    cal_table_top: function() {
      if (!document.getElementById('header')) return;
      this.table_top = document.getElementById('header').clientTop + document.getElementById('header').clientHeight + 47 + 'px';
    },
    new_window: function() {
      let routeData = this.$router.resolve({ name: 'UltraSeek' });
      window.open(routeData.href, '_blank');
    },
    open_calendar: function(event) {
      let calType = this.dt_type === 'complete' ? 'C' : 'R';
      this.$refs.calendar.open([this.from_date, this.to_date], event.pageX, event.pageY, calType, false);
    },
    set_calendar: function(item) {
      if (item[0] < item[1]) {
        this.from_date = item[0];
        this.to_date = item[1];
      } else {
        this.from_date = item[1];
        this.to_date = item[0];
      }
    },
    set_date_type: function(item) {
      this.dt_type = item === 'C' ? 'complete' : '';
    },
    on_change_dt_type: function() {
      this.page = 1;
      this.get_ultraseek_list();
    },
    set_page: function(page) {
      this.page = page;
      this.get_ultraseek_list();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    change_rows: function() {
      this.page = 1;
      this.get_ultraseek_list();
    },
    select_item: function(item) {
      this.selected_item = item;
    },
    sort_item: function(sort, order) {
      if (this.item_cnt === 0) return;
      this.sort = sort;
      this.order = order;
      this.get_ultraseek_list();
    },
    download_result_zip: async function(seqs) {
      this.$store.commit('load', true);
      let res = await this.postBlobChecked(this.api_endpoints.DOWNLOAD_RESULT, { fseqs: seqs }, 'zip');
      this.$store.commit('load', false);
      if (!res) return;
      if (!res.ok) {
        alert(res.message);
        return;
      }
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(res.blob);
      let d = new Date();
      let ymd = d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2);
      link.setAttribute('download', 'multi_file_' + ymd + '.zip');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      this.get_ultraseek_list();
    },
    click_file: function(item) {
      if (!item || !item.file_name || item.file_name === '-') {
        alert('첨부된 결과 파일이 없습니다.');
        return;
      }
      if (item.seq === null || item.seq === undefined || item.seq === '') {
        alert('검사자 고유 식별자(seq)가 없습니다.');
        return;
      }
      this.download_result_zip([item.seq]);
    },
    click_item: function(item) {
      if (this.get_menu_authority('M007') === 'A') {
        this.$refs.add_patient_modal.open(item);
      }
    },
    excel_upload_patient: function() {
      this.$refs.excel_upload_patient.open();
    },
    excel_download_patient: async function() {
      if (this.item_cnt === 0) {
        alert('다운로드할 검사자 데이터가 없습니다.');
        return;
      }
      let seqs = Array.from(new Set(
        this.selected_item.map(idx => this.items[idx].seq).filter(seq => seq !== null && seq !== undefined && seq !== '')
      ));
      if (seqs.length === 0 && this.search_value && this.search_value.trim() !== '') {
        if (!confirm('선택한 항목이 없어 검색어와 관계없이 조회 기간 전체가 다운로드됩니다. 계속하시겠습니까?')) return;
      }
      let data = {
        start_date: this.from_date || '',
        end_date: this.to_date || '',
        dt_type: this.dt_type || '',
        seqs: seqs
      };
      this.$store.commit('load', true);
      let res = await this.postBlobChecked(this.api_endpoints.DOWNLOAD_PATIENT, data, 'xls');
      this.$store.commit('load', false);
      if (!res) return;
      if (!res.ok) {
        alert(res.message);
        return;
      }
      let link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([res.blob], { type: 'application/vnd.ms-excel' }));
      link.setAttribute('download', 'patient_list.xls');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    excel_upload_result: function() {
      this.$refs.upload_result.open();
    },
    download_results: function() {
      if (this.selected_item.length === 0) {
        alert('다운로드할 대상을 선택하세요.');
        return;
      }
      let rows = this.selected_item.map(idx => this.items[idx]).filter(it => it.file_name && it.file_name !== '-');
      let uniqueSeqs = Array.from(new Set(rows.map(it => it.seq).filter(seq => seq !== null && seq !== undefined && seq !== '')));
      if (uniqueSeqs.length === 0) {
        alert('선택한 항목 중 다운로드할 결과 파일이 없습니다.');
        return;
      }
      this.download_result_zip(uniqueSeqs);
    },
    add_patient: function() {
      this.$refs.add_patient_modal.open();
    },
    delete_patients: async function() {
      if (this.selected_item.length === 0) {
        alert('삭제할 대상을 선택하세요.');
        return;
      }
      let uniqueSeqs = Array.from(new Set(
        this.selected_item.map(idx => this.items[idx].seq).filter(seq => seq !== null && seq !== undefined && seq !== '')
      ));
      if (uniqueSeqs.length === 0) {
        alert('선택된 항목에 유효한 고유번호(seq)가 없습니다.');
        return;
      }
      if (!confirm('선택한 검사자 ' + uniqueSeqs.length + '명을 삭제하시겠습니까? 관련 첨부파일도 함께 삭제되며 되돌릴 수 없습니다.')) return;

      this.$store.commit('load', true);
      let successCnt = 0;
      let failMessages = [];
      for (let seq of uniqueSeqs) {
        let res = await this.postText(this.api_endpoints.DELETE_PATIENT, { transaction: 'delete', seq: seq });
        if (!res) {
          failMessages.push('seq(' + seq + '): 통신 오류');
        } else if (res.text.indexOf('delete success') !== -1) {
          successCnt++;
        } else {
          failMessages.push('seq(' + seq + '): ' + (res.text || '응답 없음'));
        }
      }
      this.$store.commit('load', false);

      if (failMessages.length === 0) {
        alert(successCnt + '건 삭제되었습니다.');
      } else {
        alert(failMessages.join('\n'));
      }
      this.selected_item = [];
      this.get_ultraseek_list();
    },
    get_ultraseek_list: async function() {
      this.selected_item = [];
      let searchVal = this.search_value ? this.search_value.trim() : null;
      let data = {
        page: this.page,
        rows: this.rows,
        sort: this.sort,
        order: this.order,
        search_value: searchVal,
        fromDate: this.from_date,
        toDate: this.to_date,
        dtType: this.dt_type || null
      };
      this.$store.commit('load', true);
      let res = await this.get(this.api_endpoints.GET_LIST, data);
      this.$store.commit('load', false);
      if (res && res.data) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          this.item_cnt = (res.data.total || 0) * 1;
          this.items = (res.data.info || []).map((item, idx) => ({
            ...item,
            no: (this.page - 1) * this.rows + idx + 1,
            gender: item.gender === 'M' ? '남자' : (item.gender === 'F' ? '여자' : (item.gender || '-')),
            file_name: item.file_name || '-',
            file_seq: item.file_seq || null,
            download_yn: item.download_yn || '-',
            finish_date: item.finish_date || '-',
            status: item.status || '-'
          }));
          return true;
        } else {
          this.item_cnt = 0;
          this.items = [];
        }
      } else {
        this.item_cnt = 0;
        this.items = [];
      }
      return false;
    }
  },
  computed: {
    date_range: function() {
      return this.from_date + ' ~ ' + this.to_date;
    }
  }
}
</script>

<style scoped>
</style>
