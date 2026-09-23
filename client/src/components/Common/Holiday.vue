<template>
    <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?600:'100%'" persistent>
      <v-card>
        <v-card-title>
          <v-row align="center">
            <v-col cols="auto">
              <h6>영업일관리</h6>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-btn @click="close" small icon><v-icon>mdi-window-close</v-icon></v-btn>
            </v-col>
          </v-row>
        </v-card-title>
        <v-divider class="pb-5"></v-divider>
        <v-card-text :class="$vuetify.breakpoint.mobile?'px-1':null" style="height:60vh; overflow-y:auto;">
          <v-row align="center">
            <v-spacer></v-spacer>
            <v-col cols="auto" class="pr-0">
              연도
            </v-col>
            <v-col cols="3">
              <v-select v-model="year" @input="get_holiday_list()" :items="year_items" hide-details dense outlined></v-select>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-spacer></v-spacer>
            <v-col cols="auto" class="pr-0">
              소속기관/회사
            </v-col>
            <v-col cols="7">
              <v-select v-model="company_seq" @input="get_holiday_list()" :items="company_list" item-text="company_name" item-value="seq" hide-details dense outlined></v-select>
            </v-col>
          </v-row>
          <v-row align="center">
            <v-col>
              <table style="width:100%" border="1">
                <thead>
                  <tr>
                    <th style="width:5px"></th>
                    <th style="text-align:center;">기관/회사</th>
                    <th style="text-align:center;">일자</th>
                    <th style="text-align:center;">휴일명</th>
                    <th style="text-align:center;">등록일</th>
                  </tr>
                </thead>
                <tbody v-if="items.length==0">
                  <tr>
                    <td :colspan="5" style="text-align:center;">데이터가 없습니다.</td>
                  </tr>
                </tbody>
                <tbody v-else>
                  <tr v-for="(item, idx) in items" :key="idx">
                    <td style="text-align:center;"><v-checkbox v-model="item.check" dense small class="pa-0 ma-0" hide-details></v-checkbox></td>
                    <td style="text-align:center;">{{ item.company_name || '-' }}</td>
                    <td style="text-align:center;">{{ item.date }}</td>
                    <td style="text-align:center;">{{ item.name }}</td>
                    <td style="text-align:center;">{{ item.input_date }}</td>
                  </tr>
                </tbody>
              </table>
            </v-col>
          </v-row>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-0 mx-0">
          <v-row style="margin:5px;" align="center">
            <v-spacer></v-spacer>
            <v-col cols="auto" class="pr-0">
              <v-btn @click="remove" :color="removeable?'primary':'grey'" small dark>삭제</v-btn>
            </v-col>
            <v-col cols="auto">
              <v-btn @click="is_set=true;" small dark>등록</v-btn>
              <v-dialog v-model="is_set" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?300:'50%'" persistent>
                <v-card>
                  <v-card-title>
                    <v-row align="center" justify="space-between">
                      <v-col cols="auto" class="text-subtitle-2 font-weight-bold">
                        {{ selected_company_name ? selected_company_name + ' ' : '' }}휴일 등록
                      </v-col>
                      <v-col cols="auto">
                        <v-btn @click="set_date=null;set_holiday_name=null;is_set=false;" small icon><v-icon>mdi-window-close</v-icon></v-btn>
                      </v-col>
                    </v-row>
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-card-text class="mt-5">
                    <v-form ref="form">
                      <v-row>
                        <v-col>
                          <div>날짜 <span style="color:red;">(*)</span></div>
                          <v-text-field v-model="set_date" dense outlined placeholder="YYYY-MM-DD" :rules="[required, birthday_rule]"></v-text-field>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="pt-0">
                          <div>휴일명 <span style="color:red;">(*)</span></div>
                          <v-text-field v-model="set_holiday_name" dense outlined aceholder="휴일명" :rules="[required]"></v-text-field>
                        </v-col>
                      </v-row>
                    </v-form>
                  </v-card-text>
                  <v-divider></v-divider>
                  <v-card-actions>
                    <v-row align="center" justify="end" class="ma-0 pa-0">
                      <v-col cols="auto">
                        <v-btn @click="set_holiday" small dark>저장</v-btn>
                      </v-col>
                    </v-row>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </template>
  
  <script>
  import http from '@/mixin/http'
  import validation from '@/mixin/validation'
  export default {
    name:"holiday-vue",
    mixins: [http, validation],
    data:()=>({
      is_open: false,
      items: [],

      company_seq: 0,
      company_list: [],
      year: null,
      year_items: [],
      is_set: false,

      set_date: null,
      set_holiday_name: null,
    }),
    methods:{
      open: function(){
        this.year = new Date().getFullYear();
        this.year_items = [];
        for ( let i = this.year ; i > this.year-3 ; i-- ){
          this.year_items.push(i);
        }
        this.get_company_list().then(()=>{
          this.get_holiday_list().then(res=>{
            this.is_open = res;
          })
        });
      },
      close:function(){
        this.is_open = false;
        setTimeout(() => {
          this.reset();
        }, 100);
      },
      reset:function(){
        if ( this.$refs.form ) this.$refs.form.reset();
        Object.assign(this.$data, this.$options.data());
      },
      remove:async function(){
        let error_cnt = 0;
        let remove_target = this.items.filter(element => true === element.check);
        if ( remove_target.length <= 0 ){
          return;
        }
        let con = confirm("선택한 " + remove_target.length + "건 삭제하시겠습니까?");
        if ( !con ) return;
        
        this.$store.commit('load', true);
        for ( let i = 0 ; i < remove_target.length ; i++ ){
          let element = remove_target[i];
          let compSeq = (element.company_seq !== null && element.company_seq !== undefined)
            ? element.company_seq
            : (this.company_seq !== null && this.company_seq !== undefined ? this.company_seq : 0);
          let data = {
            transaction: 'delete',
            year: element.year,
            date: element.date,
            company_seq: compSeq
          };
          let res = await this.post(this.$rootUrl+'/server/patient/set_holiday.php', data);
          if ( !res ){
            error_cnt++;
          }
        }
        this.$store.commit('load', false);
        if ( error_cnt > 0 ) alert("전체 " + remove_target.length + "건 중 " + (remove_target.length - error_cnt) + "건 삭제 되었습니다.");
        else alert("삭제되었습니다.");
        this.set_date = null;
        this.set_holiday_name = null;
        this.get_holiday_list();
      },
      set_holiday:async function(){
        if ( !this.$refs.form.validate() ){
          return;
        }
        let input_year = this.set_date ? parseInt(this.set_date.substring(0, 4)) : this.year;
        let data = {
          transaction: 'insert',
          year: input_year,
          date: this.set_date.substring(5),
          name: this.set_holiday_name,
          company_seq: this.company_seq !== null && this.company_seq !== undefined ? this.company_seq : 0
        };
        this.$store.commit('load', true);
        let res = await this.post(this.$rootUrl+'/server/patient/set_holiday.php', data);
        if ( res ){
          alert("저장되었습니다.");
          this.$store.commit('load', false);
          this.is_set = false;
          this.set_date = null;
          this.set_holiday_name = null;
          if ( input_year !== this.year && !this.year_items.includes(input_year) ){
            this.year_items.unshift(input_year);
            this.year_items.sort((a, b) => b - a);
          }
          this.year = input_year;
          this.get_holiday_list();
        }
        this.$store.commit('load', false);
      },
      get_company_list:async function(){
        let res = await this.get(this.$rootUrl+'/server/company/get_company_popup.php');
        if ( res ){
          let sorted = res.data.info.sort((a, b) => a.company_name.localeCompare(b.company_name));
          this.company_list = [{ company_name: '전체', seq: 0 }, ...sorted];
          this.company_seq = 0;
        }
      },
      get_holiday_list:async function(){
        let data = {
          year: this.year,
          company_seq: this.company_seq !== null && this.company_seq !== undefined ? this.company_seq : 0
        };
        this.$store.commit('load', true);
        this.items = [];
        let res = await this.get(this.$rootUrl+'/server/patient/get_holiday_list.php', data);
        if ( res ){
          for ( let i = 0 ; i < res.data.info.length ; i++ ){
            let item = new Object();
            item.check = false;
            item.company_seq = res.data.info[i].company_seq;
            item.company_name = res.data.info[i].company_name;
            item.year = res.data.info[i].year;
            item.date = res.data.info[i].date;
            item.name = res.data.info[i].name;
            item.input_date = res.data.info[i].input_date;
            this.items.push(item);
          }
          this.$store.commit('load', false);
          return true;
        }
        this.$store.commit('load', false);
        return false;
      }
    },
    computed:{
      removeable:function(){
        if ( !this.items || this.items.length == 0 ){
          return false;
        }
        let cnt = 0;
        for( let i = 0 ; i < this.items.length ; i++ ){
          if ( this.items[i].check ) cnt++;
        }
        return cnt > 0;
      },
      selected_company_name:function(){
        if ( !this.company_list || this.company_list.length === 0 || !this.company_seq ) return '';
        let target = this.company_list.find(c => c.seq === this.company_seq);
        return target ? target.company_name : '';
      }
    }
  }
  </script>