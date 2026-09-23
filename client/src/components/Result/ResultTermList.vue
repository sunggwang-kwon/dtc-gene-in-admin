<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?750:'100%'" persistent scrollable>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <h6>기간별 결과지 출력</h6>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn @click="close" small icon><v-icon>mdi-window-close</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider class="pb-5"></v-divider>
      <v-card-text :class="$vuetify.breakpoint.mobile?'px-1':null">
        <div v-if="!$vuetify.breakpoint.mobile">
          <v-row align="end">
            <v-col cols="3" style="min-width:260px;">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">결과등록일<span style="color:red;">(*)</span></div>
              <div><v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar"></v-text-field></div>
              <calendar ref="calendar" @commit="set_calendar"></calendar>
            </v-col>
            <v-col cols="3">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">정렬순서<span style="color:red;">(*)</span></div>
              <div><v-select v-model="sort" dense outlined hide-details item-text="value" item-value="key" :items="[{key:'id', value:'ID'},{key:'request_date',value:'의뢰일'},{key:'name',value:'이름'}]"></v-select></div>
            </v-col>
            <v-col cols="3">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">출력여부<span style="color:red;">(*)</span></div>
              <div><v-select v-model="print_yn" dense outlined hide-details :items="['전체', 'Y', 'N']"></v-select></div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-btn @click="page=1;get_term_result_list();" small dark :elevation="0">조회</v-btn>
            </v-col>
          </v-row>
          <div class="mt-5" style="height:200px; overflow-y:auto;">
            <div>
              {{ $t('phrases.목록') }} ({{ item_cnt }})
            </div>
            <data-table id="datatable" @select="select_item" :headers="headers" :items="items" :detail="false"></data-table>
          </div>
        </div>
        <div v-else>
          <v-row class="ma-0" align="end">
            <v-col cols="12" style="min-width:200px;">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">의뢰일자<span style="color:red;">(*)</span></div>
              <div><v-text-field :value="date_range" readonly dense outlined hide-details append-icon="mdi-calendar-month" @click:append="open_calendar"></v-text-field></div>
              <m-calendar ref="calendar" @commit="set_calendar"></m-calendar>
            </v-col>
          </v-row>
          <v-row class="ma-0" align="end">
            <v-col cols="12" class="py-0">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">정렬순서<span style="color:red;">(*)</span></div>
              <div><v-select v-model="sort" dense outlined hide-details item-text="value" item-value="key" :items="[{key:'id', value:'ID'},{key:'request_date',value:'의뢰일'},{key:'name',value:'이름'}]"></v-select></div>
            </v-col>
          </v-row>
          <v-row class="ma-0" align="end">
            <v-col cols="12" class="pb-0">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">출력여부<span style="color:red;">(*)</span></div>
              <div><v-select v-model="print_yn" dense outlined hide-details :items="['전체', 'Y', 'N']"></v-select></div>
            </v-col>
          </v-row>
          <v-row class="ma-0" align="end">
            <v-col cols="12">
              <v-btn @click="page=1;get_term_result_list();" block small dark color="red" :elevation="0">조회</v-btn>
            </v-col>
          </v-row>
          <v-row class="ma-0" align="end">
            <v-col cols="auto" class="pb-0">
              {{ $t('phrases.목록') }} ({{ item_cnt }})
            </v-col>
          </v-row>
          <data-table id="datatable" @select="select_item" :headers="headers" :items="items" :detail="false"></data-table>
        </div>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row style="margin:1px" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="print_result" small :elevation="0" style="color:rgba(0,0,0,0.7);">출력</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="close()" small dark :elevation="0">닫기</v-btn>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import http from '@/mixin/http'
import validation from '@/mixin/validation'
import datatable from '@/components/Common/DataTable'
import calendar from '@/components/Common/Calendar'
import mcalendar from '@/components/Common/MCalendar'
export default {
  name:"result-term-list-vue",
  mixins: [http, validation],
  components:{
    'data-table': datatable,
    'calendar': calendar,
    'm-calendar': mcalendar
  },
  data:()=>({
    is_open: false,

    from_date: null,
    to_date: null,
    sort: 'id',
    print_yn: '전체',

    headers: [
      {key:'patient_id', text:'아이디', align:'center'},
      {key:'patient_name', text:'이름', align:'center'},
      {key:'create_date', text:'결과등록일', align:'center'},
      {key:'print_yn', text:'출력여부', align:'center'}
    ],
    item_cnt: 0,
    items:[
      /*
      {
        patient_id:'',
        patient_name:'',
        create_date:'',
        request_date:'',
        print_yn:'',
      }
      */
    ],
    selected_item:[],
  }),
  methods:{
    open: function(){
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

      this.is_open = true;
    },
    close:function(){
      this.is_open = false;
      setTimeout(() => {
        this.reset();
      }, 100);
    },
    reset:function(){
      Object.assign(this.$data, this.$options.data());
    },
    open_calendar:function(event){
      this.$refs.calendar.open([this.from_date, this.to_date], event.pageX, event.pageY, null, false);
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
    select_item:function(item){
      this.selected_item = item;
    },
    get_term_result_list:async function(){
      let data = {
        sort: this.sort,
        from_date: this.from_date,
        to_date: this.to_date,
        print_yn: this.print_yn=='전체'?null:this.print_yn
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/result/get_term_result_list.php', data);
      if ( res ){
        this.item_cnt = res.data.total * 1;
        this.items = res.data.info;
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    },
    print_result: async function(){
      if ( this.selected_item.length == 0 ){
        alert("출력할 데이터가 없습니다.");
        return;
      }
      let param = [];
      for ( let i = 0 ; i < this.selected_item.length ; i++ ){
        param.push({
          patient_id: this.items[this.selected_item[i]].patient_id,
          request_date: this.items[this.selected_item[i]].request_date
        });
      }

      let path = '/v5';
      let template_version = null;

      if ( this.$i18n.locale === 'en' ) {
        path = '/eng/v1';
        template_version = 7;
      } else {
        const res = await this.get(this.$rootUrl + '/server/result/get_template_list.php');
        if ( res && res.data && res.data.info ) {
          // KST(한국 표준시) 기준 오늘 날짜 (YYYY-MM-DD)
          const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
          const latest = res.data.info
            .filter(t => t.start_date <= today)
            .sort((a, b) => b.start_date.localeCompare(a.start_date))[0];

          if ( latest ) {
            template_version = latest.seq;

            // 향후 v7, v8 추가 시 여기에 else if 추가
            if ( latest.seq * 1 == 9 ) {        // version 6
              path = '/v6';
            }
            // else if ( latest.seq * 1 == 10 ) { // version 7
            //   path = '/v7';
            // }
            else {                              // version 5 및 기타
              path = '/v5';
            }
          }
        }
      }

      let data = {
        headers:{
          jwt: this.$session.get("jwt")
        },
        param: param,
        template_version: template_version,
        expire: new Date().getTime() + 1800000  //expire time : now() + 30min
      };
      let query_string = "?data=" + btoa(JSON.stringify(data));
      const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8081' : 'https://hlgenecheck.com';
      window.open(baseUrl + path + query_string, '', '');
    }
  },
  computed:{
    date_range:function(){
      return this.from_date + ' ~ ' + this.to_date;
    }
  }
}
</script>