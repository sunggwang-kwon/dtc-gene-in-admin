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
              <v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar" :label="dt_type=='complete' ? '완료일자' : '등록일자'"></v-text-field>
              <calendar ref="calendar" @commit="set_calendar" @date_type="set_date_type"></calendar>
            </v-col>
            <v-col cols="2" style="min-width:140px;">
              <v-select v-model="dt_type" @change="on_change_dt_type" dense outlined hide-details :items="dt_type_items" item-text="text" item-value="value" label="기간구분"></v-select>
            </v-col>
            <v-col cols="4">
              <v-text-field v-model="search_value" @keydown.enter="page=1;get_ultraseek_list();" dense outlined hide-details clearable label="ID/수검자명/기관명"></v-text-field>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
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
          <data-table @sort="sort_item" @link="click_file" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order" :select="false" :detail="false"></data-table>
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
            <v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar" :label="dt_type=='complete' ? '완료일자' : '등록일자'"></v-text-field>
            <m-calendar ref="calendar" @commit="set_calendar" @date_type="set_date_type"></m-calendar>
          </v-col>
          <v-col cols="12" class="pt-0">
            <v-select v-model="dt_type" @change="on_change_dt_type" dense outlined hide-details :items="dt_type_items" item-text="text" item-value="value" label="기간구분"></v-select>
          </v-col>
          <v-col cols="12" class="pt-0">
            <v-text-field v-model="search_value" @keydown.enter="page=1;get_ultraseek_list();" dense outlined hide-details clearable label="ID/수검자명/기관명"></v-text-field>
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
          <data-table @sort="sort_item" @link="click_file" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order" :select="false" :detail="false"></data-table>
        </v-col>
      </v-row>
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

export default {
  name: 'UltraSeek',
  mixins: [http, authority],
  components: {
    'data-table': datatable,
    'pagination': pagination,
    'm-pagination': mpagination,
    'rows-select': rowsselect,
    'calendar': calendar,
    'm-calendar': mcalendar
  },
  data: () => ({
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
      { text: '등록일자', value: '' },
      { text: '완료일자', value: 'complete' }
    ],

    table_top: null,
    item_cnt: 0,
    headers: [
      { key: 'patient_id', text: '아이디', align: 'center', width: '10%' },
      { key: 'patient_name', text: '검사자명', align: 'center', width: '10%' },
      { key: 'patient_eng_name', text: '영문명', align: 'center', width: '10%' },
      { key: 'gender', text: '성별', align: 'center', width: '6%' },
      { key: 'age', text: '나이', align: 'center', width: '6%' },
      { key: 'company_name', text: '기관명', align: 'center', width: '14%' },
      { key: 'blood_date', text: '채혈일자', align: 'center', width: '10%' },
      { key: 'reg_date', text: '등록일자', align: 'center', width: '10%' },
      { key: 'fseq', text: '결과파일', align: 'center', width: '12%', link: true },
      { key: 'bigo', text: '비고', align: 'left' }
    ],
    items: []
  }),
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
      this.$refs.calendar.open([this.from_date, this.to_date], event.pageX, event.pageY, calType);
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
    sort_item: function(sort, order) {
      if (this.item_cnt === 0) return;
      this.sort = sort;
      this.order = order;
      this.get_ultraseek_list();
    },
    click_file: function(item) {
      if (!item.fseq || item.fseq === '-') {
        alert('첨부된 결과 파일이 없습니다.');
        return;
      }
      alert('결과 파일: ' + item.fseq);
    },
    get_ultraseek_list: async function() {
      let searchVal = this.search_value ? this.search_value.trim() : null;
      let data = {
        page: this.page,
        rows: this.rows,
        sort: this.sort,
        order: this.order,
        search_value: searchVal ? '%' + searchVal + '%' : null,
        fromDate: this.from_date,
        toDate: this.to_date,
        dtType: this.dt_type || null
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl + '/server/ultraseek/get_ultraseek_list.php', data);
      this.$store.commit('load', false);
      if (res && res.data) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          this.item_cnt = (res.data.total || 0) * 1;
          this.items = (res.data.info || []).map(item => ({
            ...item,
            gender: item.gender === 'M' ? '남자' : (item.gender === 'F' ? '여자' : (item.gender || '-')),
            fseq: item.fseq || '-'
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
