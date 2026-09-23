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
            <h3 v-if="transaction=='insert'">유전자 추가</h3>
            <h3 v-else>유전자 정보</h3>
          </v-col>
        </v-row>
      </div>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
    </div>
    <div v-if="is_open" id="content" class="pa-5">
      <v-card flat>
        <v-card-text>
          <v-form ref="form">
            <!-- 검사명 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">검사명<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" v-model="test_type_id" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
                <v-select v-else v-model="test_type_id" :readonly="transaction=='view'" dense outlined :items="gene_test_combo_list" item-text="test_type_name" item-value="test_type_id"></v-select>
              </v-col>
            </v-row>
            <!-- 유전자 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">유전자<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="gene_cd" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 역할 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">역할</div>
              </v-col>
              <v-col>
                <v-text-field v-model="note" :readonly="transaction=='view'" dense outlined></v-text-field>
              </v-col>
            </v-row>
          </v-form>
          <v-divider></v-divider>
          <div v-if="!$vuetify.breakpoint.mobile" class="pt-2">
            <v-row align="center">
              <v-col cols="auto" class="pb-4">
                <div style="font-size:10pt;">유전자 관련 정보를 추가/수정 합니다.</div>
              </v-col>
              <v-spacer></v-spacer>
              <v-col v-if="get_menu_authority('M005')=='A'" cols="auto" class="pb-4 pr-0">
                <v-btn @click="insert_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행추가</v-btn>
              </v-col>
              <v-col v-if="get_menu_authority('M005')=='A'" cols="auto" class="pb-4">
                <v-btn @click="delete_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행삭제</v-btn>
              </v-col>
            </v-row>
          </div>
          <div v-else class="pt-2">
            <v-row align="center">
              <v-col cols="12" class="pb-0">
                <div style="font-size:10pt;">유전자 관련 정보를 추가/수정 합니다.</div>
              </v-col>
            </v-row>
            <v-row v-if="get_menu_authority('M005')=='A'" align="center" justify="end">
              <v-col cols="auto" class="pt-1 pr-0 pb-4">
                <v-btn @click="insert_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행추가</v-btn>
              </v-col>
              <v-col cols="auto" class="pt-1 pb-4">
                <v-btn @click="delete_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행삭제</v-btn>
              </v-col>
            </v-row>
          </div>
          <v-row align="center">
            <v-col class="pt-0">
              <div class="tinycss" style="overflow-x:auto;">
                <table style="position:relactive; min-width:1200px; table-layout:fixed;" border="1">
                  <thead>
                    <tr>
                      <th width="40px"></th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">정상타입</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">정상빈도율(%)</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">위험타입</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">위험빈도율(%)</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">인종</th>
                    </tr>
                  </thead>
                  <tbody v-if="detail.length>0">
                    <tr v-for="(detail_item, index) in detail" :key="index">
                      <td v-if="detail_item.flag!='D'">
                        <v-checkbox v-if="transaction!='view'" v-model="detail_item.check" class="pa-0 ma-0" dense hide-details></v-checkbox>
                      </td>
                      <td v-if="detail_item.flag!='D'">
                        <v-text-field v-model="detail_item.normal_type" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="detail_item.flag!='D'">
                        <v-text-field v-model="detail_item.normal_rate" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="detail_item.flag!='D'">
                        <v-text-field v-model="detail_item.risk_type" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="detail_item.flag!='D'">
                        <v-text-field v-model="detail_item.risk_rate" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="detail_item.flag!='D'">
                        <v-text-field v-model="detail_item.breed" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td :colspan="6" style="text-align:center;">데이터가 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>
    <div id="tail">
      <v-app-bar color="rgb(255,255,255)" style="border:1px solid rgba(0,0,0,0.12);" bottom app :elevation="0">
        <v-row v-if="transaction=='insert'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M005')=='A'" @click="set_gene" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='view'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M005')=='A'" @click="transaction='update'" small dark :elevation="0">수정</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='update'" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="update_cancel" color="grey" small dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M005')=='A'" @click="set_gene" small dark :elevation="0">저장</v-btn>
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
  name: 'detail-gene-vue',
  mixins: [http, authority, validation],
  data: () => ({
    is_open: false,

    seq: null,
    gene_cd: null,
    transaction: null,  //view, insert, update
    test_type_id: null,
    note : null,

    gene_test_combo_list: [],

    bef_detail:[],
    detail:[
      /*
      {
        seq: null,
        risk_type: null,
        risk_rate: null,
        normal_type: null,
        normal_rate: null,
        breed: null,
        flag: null,
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
    if ( !this.get_menu_authority('M005') ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      this.transaction = this.$route.query.transaction;
      this.seq = this.$route.query.seq;
      this.get_gene_test_combo().then(res=>{
        if ( !res ){
          alert("오류가 발생했습니다.");
          return;
        }
        if ( this.transaction == 'view' ){
          this.patient_id = this.$route.query.patient_id;
          this.get_gene().then(res=>{
            this.is_open = res;
          })
        }
        else{
          this.is_open = true;
        }
      });
    }

    if ( this.transaction == 'insert' ){
      for ( let i = 0 ; i < 5 ; i++ ){
        this.insert_row();
      }
    }
  },
  methods:{
    update_cancel: function(){
      this.get_gene().then(()=>{
        this.transaction='view';
      });
    },
    insert_row: function(){
      if ( this.transaction == 'view' ) return;
      let row = {
        seq: null,
        risk_type: null,
        risk_rate: null,
        normal_type: null,
        normal_rate: null,
        breed: null,
        flag: 'I',
      };
      this.detail.unshift(row);
    },
    delete_row: function(){
      if ( this.transaction == 'view' ) return;
      for ( let i = this.detail.length-1 ; i >= 0 ; i-- ){
        if ( this.detail[i].check ){
          if ( this.detail[i].seq ){ //등록되어있는 정보인 경우
            //this.snp[i].flag = 'D';
            this.$set(this.detail[i], 'flag', 'D');
          }
          else{ //신규등록하려고 했던 정보인 경우
            this.detail.splice(i, 1);
          }
        }
      }
    },
    set_gene: async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }

      let con = confirm("입력한 내용으로 유전자종류를 추가/수정하시겠습니까?");
      if ( !con ) return;

      //빈값 행 제거
      for ( let i = this.detail.length-1 ; i >= 0 ; i-- ){
        let all_cnt = 0;
        let null_cnt = 0;
        for(let key in this.detail[i]){
          if ( key == 'check' || key == 'flag' ) continue;
          if ( !this.detail[i][key] ){
            null_cnt++;
          }
          all_cnt++;
        }
        if ( null_cnt == all_cnt ){
          this.detail.splice(i, 1);
        }
      }
      //수정되었을 경우 판단
      for ( let i = 0 ; i < this.bef_detail.length; i++ ){
        for ( let j = 0 ; j < this.detail.length; j++ ){
          if ( this.bef_detail[i].seq && (this.bef_detail[i].seq == this.detail[j].seq) ){
            let diff = false;
            for( let key in this.bef_detail[i] ){
              if ( (this.bef_detail[i][key] != this.detail[j][key]) && ( !this.detail[j].flag || this.detail[j].flag.length==0) ){
                diff = true;
                break;
              }
            }
            if ( diff ){
              this.detail[j].flag = 'U';
            }
            break;
          }
        }
      }
      //I, U, D가 아닌 경우 제거, null값 제거
      let detail = [];
      this.detail.forEach(element=>{
        if ( element.flag && element.flag.length > 0 ){
          let temp = this.lodash.cloneDeep(element);
          for ( let key in temp ){
            if ( !temp[key] ){
              delete temp[key];
            }
          }
          delete temp['check'];
          detail.push(temp);
        }
      });

      let data = {
        transaction: this.transaction,
        seq: this.seq,
        gene_cd: this.gene_cd,
        test_type_id: this.test_type_id,
        note: this.note,
        detail: JSON.stringify(detail)
      };
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/gene/set_gene.php', data);
      if ( res ){
        alert("저장되었습니다.");
        this.$store.commit('load', false);
        this.$router.replace({name:'Gene'});
      }
      this.$store.commit('load', false);
    },
    get_gene: async function(){
      let data = {
        seq: this.seq
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/gene/get_gene.php', data);
      if ( res ){
        this.test_type_id = res.data.info.test_type_id;
        this.gene_cd = res.data.info.gene_cd;
        this.note = res.data.info.note;
        this.bef_detail = this.lodash.cloneDeep(res.data.info.detail);
        this.detail = this.lodash.cloneDeep(res.data.info.detail);
        for ( let i = 0 ; i < this.detail.length ; i++ ){
          this.detail[i].check = false;
        }
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    },
    get_gene_test_combo:async function(){
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/gene/get_gene_test_combo.php');
      if ( res ){
        this.gene_test_combo_list = [];
        for ( let i = 0 ; i < res.data.info.length ; i++ ){
          let item = new Object();
          item.test_type_id = res.data.info[i].test_type_id;
          item.test_type_name = res.data.info[i].test_type_name;
          this.gene_test_combo_list.push(item);
        }
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    }
  }
}
</script>