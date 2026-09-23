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
            <h3>기관/회사관리</h3>
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
            <v-col cols="3">
              <div style="font-size:11pt; color:rgba(0,0,0,0.5)">회사명/담당자</div>
              <div><v-text-field v-model="search_value" dense outlined hide-details clearable placeholder="전체"></v-text-field></div>
            </v-col>
            <v-spacer></v-spacer>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="pr-0">
              <v-btn @click="$router.push({name:'DetailCompany', query:{transaction:'insert'}})" small dark :elevation="0">추가</v-btn>
            </v-col>
            <v-col v-if="get_menu_authority('M007')=='A'" cols="auto" class="pr-0">
              <v-btn @click="set_company" :color="selected_item.length>0?'primary':'grey'" :ripple="selected_item.length>0" dark small :elevation="0">삭제</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn @click="page=1;get_company_list();" dark color="search_btn" small :elevation="0">조회</v-btn>
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
    <div v-if="is_open" id="content">
      <v-row class="mx-1" align="center">
        <v-col cols="auto" class="pb-1">
          &nbsp;&nbsp;{{ $t('phrases.목록') }} ({{ item_cnt }})
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col class="pt-0">
          <data-table @click="click_item" @select="select_item" @sort="sort_item" :headers="headers" :items="items" :top="table_top" :sort_="sort" :order_="order"></data-table>
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
    <div id="header" :style="{
      position: 'sticky',
      top: $vuetify.application.top+'px',
      zIndex:1
    }">
      <div class="py-5" style="background-color:white;">
        <v-row class="mx-1" align="center">
          <v-col cols="auto">
            <h3>기관/회사관리</h3>
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
            <div style="font-size:11pt; color:rgba(0,0,0,0.5)">회사명/담당자</div>
            <div><v-text-field v-model="search_value" dense outlined hide-details clearable placeholder="전체"></v-text-field></div>
          </v-col>
          <v-col cols="12">
            <v-btn @click="page=1;get_company_list()" dark color="search_btn" small block :elevation="0">조회</v-btn>
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
    <div v-if="is_open" id="content">
      <v-row class="mx-1" align="center">
        <v-col cols="auto" class="pb-1">
          &nbsp;&nbsp;{{ $t('phrases.목록') }} ({{ item_cnt }})
        </v-col>
      </v-row>
      <v-row class="mx-1" align="center">
        <v-col class="pt-0">
          <data-table @click="click_item" @select="select_item" @sort="sort_item" :headers="headers" :items="items" :top="table_top"></data-table>
        </v-col>
      </v-row>
    </div>
    <div :style="'position:fixed; bottom:' + ($vuetify.application.bottom) + 'px;right:10%;'">
      <v-menu v-if="get_menu_authority('M007')=='A'" offset-y top :close-on-content-click="false">
        <template v-slot:activator="{on, attrs}">
          <v-btn v-bind="attrs" v-on="on" icon :elevation="0">
            <v-icon size="50">mdi-plus-circle</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="$router.push({name:'DetailCompany', query:{transaction:'insert'}})" style="border-top:1px solid rgba(0,0,0,0.12)">
            <v-list-item-subtitle>추가</v-list-item-subtitle>
          </v-list-item>
          <v-list-item @click="set_company" style="border-top:1px solid rgba(0,0,0,0.12);border-bottom:1px solid rgba(0,0,0,0.12)">
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
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import datatable from '@/components/Common/DataTable'
import pagination from '@/components/Common/Pagination'
import mpagination from '@/components/Common/MPagination'
export default {
  name: 'company-vue',
  mixins: [http, authority],
  components:{
    'data-table': datatable,
    'pagination': pagination,
    'm-pagination': mpagination,
  },
  data: () => ({
    is_open: false,

    is_show_search: true,
    changed: false,

    page: 1,
    rows: 30,
    sort: null,
    order: null,
    search_value: null,

    table_top: null,
    item_cnt: 0,
    headers: [
      {key:'no', text:'번호', align:'center', width:'80px'},
      {key:'company_name', text:'회사명', align:'center'},
      {key:'contact', text:'담당자', align:'center'},
      {key:'email', text:'이메일', align:'center'},
      {key:'phone', text:'연락처', align:'center'},
      {key:'lang_cd', text:'언어', align:'center', width:'80px'},
      {key:'create_time', text:'등록일', align:'center', width:'10%'}
    ],
    items: [],
    selected_item: [],
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:function(){
    if ( !this.get_menu_authority('M007') ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      let bef_company = this.$store.getters.company;
      if( bef_company != null ){
        this.page = bef_company.page;
        this.rows = bef_company.rows;
        this.sort = bef_company.sort;
        this.order = bef_company.order;
        this.search_value = bef_company.search_value;
      }
      this.get_company_list().then(res=>{
        this.is_open = res;
      });
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
      const data = this.$router.resolve({name:'Company'});
      window.open(data.href, '_blank');
    },
    click_item:function(item){
      this.$router.push({name:'DetailCompany', query:{transaction:'view', seq:item.seq}});
    },
    select_item:function(item){
      this.selected_item = item;
    },
    sort_item:function(sort, order){
      if ( this.item_cnt == 0 ) return;
      this.sort = sort;
      this.order = order;
      this.get_company_list();
    },
    set_page:function(page){
      this.page = page;
      this.get_company_list();
      window.scrollTo({top:0, behavior: 'smooth'});
    },
    set_company: async function(){
      if ( this.selected_item.length == 0 ) {
        alert("삭제할 대상을 선택하세요.");
        return;
      }
      let con = confirm("선택한 기관/회사 " + this.selected_item.length + "건을 삭제하시겠습니까?");
      if ( !con ) return;

      let error_cnt = 0;
      this.$store.commit('load', true);
      for ( let i = 0 ; i < this.selected_item.length ; i++ ){
        let data = {
          transaction: 'delete',
          seq: this.items[this.selected_item[i]].seq
        };
        let res = await this.post(this.$rootUrl+'/server/company/set_company.php', data);
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
      this.get_company_list();
    },
    get_company_list:async function(){
      let data = {
        page: this.page,
        rows: this.rows,
        sort: this.sort,
        order: this.order,
        search_value: this.search_value ? '%'+this.search_value+'%' : null
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/company/get_company_list.php', data);
      this.$store.commit('load', false);
      if ( res ){
        this.item_cnt = res.data.total*1;
        this.items = res.data.info || [];
        for ( let i = 0 ; i < this.items.length ; i++ ){
          this.items[i].no = (this.page-1)*this.rows+i+1;
        }
        this.$store.commit('company', {
          page: this.page,
          rows: this.rows,
          sort: this.sort,
          order: this.order,
          search_value: this.search_value
        });
        return true;
      }
      return false;
    }
  },
}
</script>
