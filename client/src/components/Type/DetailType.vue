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
            <h3 v-if="transaction=='insert'">검사종류 추가</h3>
            <h3 v-else>검사종류 정보</h3>
          </v-col>
        </v-row>
      </div>
      <v-divider style="border-color: rgb(223, 223, 223)"></v-divider>
    </div>
    <div v-if="is_open" id="content" class="pa-5">
      <v-card flat>
        <v-card-text>
          <v-form ref="form">
            <!-- 분류명 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">분류명<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="type_name" :readonly="transaction=='view'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 분류코드 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">분류코드<span v-if="transaction!='view'" style="color:red">(*)</span></div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="type_id" :readonly="transaction!='insert'" dense outlined :rules="[required]"></v-text-field>
              </v-col>
            </v-row>
            <!-- 영문명 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">영문명</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="type_eng_name" :readonly="transaction=='view'" dense outlined></v-text-field>
              </v-col>
            </v-row>
            <!-- 출력순서 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">출력순서</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-model="disp_order" :readonly="transaction=='view'" inputmode="decimal" dense outlined :placeholder="transaction!='view'?'숫자':null" oninput="this.value=this.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g, '$1')"></v-text-field>
              </v-col>
            </v-row>
            <!-- 사용여부 -->
            <v-row align="start" no-gutters>
              <v-col cols="12" lg="1" style="min-width:135px;">
                <div class="pt-1">사용여부</div>
              </v-col>
              <v-col lg="4" xl="3">
                <v-text-field v-if="transaction=='view'" :value="use_yn=='Y'?'사용':'미사용'" readonly dense outlined></v-text-field> 
                <v-select v-else v-model="use_yn" :readonly="transaction=='view'" dense outlined :items="[{text:'사용',value:'Y'},{text:'미사용',value:'N'}]"></v-select>
              </v-col>
            </v-row>
          </v-form>
          <v-divider></v-divider>
          <div v-if="!$vuetify.breakpoint.mobile" class="pt-2">
            <v-row align="center">
              <v-col cols="auto" class="pb-4">
                <div style="font-size:10pt;">SNP값을 추가/수정합니다. <span style="font-size:10pt;color:red;"> (SNP값은 중복 불가)</span></div>
              </v-col>
              <v-spacer></v-spacer>
              <v-col v-if="get_menu_authority('M002')=='A'" cols="auto" class="pb-4 pr-0">
                <v-btn @click="insert_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행추가</v-btn>
              </v-col>
              <v-col v-if="get_menu_authority('M002')=='A'" cols="auto" class="pb-4">
                <v-btn @click="delete_row" :color="transaction=='view'?'grey':'primary'" :ripple="transaction!='view'" small dark :elevation="0">행삭제</v-btn>
              </v-col>
            </v-row>
          </div>
          <div v-else class="pt-2">
            <v-row align="center">
              <v-col cols="12" class="pb-0">
                <div style="font-size:10pt;">SNP값을 추가/수정합니다.</div>
              </v-col>
            </v-row>
            <v-row align="center">
              <v-col cols="12" class="pt-0">
                <div style="font-size:10pt;color:red;"> (SNP값은 중복 불가)</div>
              </v-col>
            </v-row>
            <v-row v-if="get_menu_authority('M002')=='A'" align="center" justify="end">
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
                <table style="position:relactive; min-width:1320px; table-layout:fixed;" border="1">
                  <thead>
                    <tr>
                      <th width="40px"></th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">검사코드</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">검사명</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">영문검사명</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">유전자</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">SNP</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">타입명1</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">risk1</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">타입명2</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">risk2</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">타입명3</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">risk3</th>
                      <th width="8%" style="text-align:center; font-size:10pt; font-weight:bold;">평균값</th>
                      <th style="text-align:center; font-size:10pt; font-weight:bold;">출력순서</th>
                    </tr>
                  </thead>
                  <tbody v-if="snp.length>0">
                    <tr v-for="(snp_item, index) in snp" :key="index">
                      <td v-if="snp_item.flag!='D'">
                        <v-checkbox v-if="transaction!='view'" v-model="snp_item.check" class="pa-0 ma-0" dense hide-details></v-checkbox>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.test_type_id" @input="snp_item.gene_cd=null;" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.test_type_name" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.test_type_eng_name" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-if="transaction=='view'" :value="snp_item.gene_cd" readonly dense outlined hide-details></v-text-field>
                        <v-text-field v-else class="cursor-pointer" @click="$refs.gene.open(snp_item.test_type_id, index)" @click:append="$refs.gene.open(snp_item.test_type_id, index)" :value="snp_item.gene_cd" append-icon="mdi-window-restore" readonly dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_cd" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_type1" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_risk1" :readonly="transaction=='view'" inputmode="decimal" oninput="this.value=this.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g, '$1')" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_type2" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_risk2" :readonly="transaction=='view'" inputmode="decimal" oninput="this.value=this.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g, '$1')" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_type3" :readonly="transaction=='view'" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.snp_risk3" :readonly="transaction=='view'" inputmode="decimal" oninput="this.value=this.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g, '$1')" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.risk_avg" :readonly="transaction=='view'" inputmode="decimal" oninput="this.value=this.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g, '$1')" dense outlined hide-details></v-text-field>
                      </td>
                      <td v-if="snp_item.flag!='D'">
                        <v-text-field v-model="snp_item.order_no" :readonly="transaction=='view'" inputmode="decimal" oninput="this.value=this.value.replace(/[^0-9.]/g,'').replace(/(\..*)\./g, '$1')" dense outlined hide-details></v-text-field>
                      </td>
                    </tr>
                  </tbody>
                  <tbody v-else>
                    <tr>
                      <td :colspan="14" style="text-align:center;">데이터가 없습니다.</td>
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
            <v-btn v-if="get_menu_authority('M002')=='A'" @click="set_check" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='view'" align="center" justify="end">
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M002')=='A'" @click="transaction='update'" small dark :elevation="0">수정</v-btn>
          </v-col>
        </v-row>
        <v-row v-else-if="transaction=='update'" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="update_cancel" color="grey" small dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn v-if="get_menu_authority('M002')=='A'" @click="set_check" small dark :elevation="0">저장</v-btn>
          </v-col>
        </v-row>
      </v-app-bar>
    </div>
    <gene ref="gene" @commit="set_test_gene"></gene>
  </v-container>
</template>

<script>
import http from '@/mixin/http'
import authority from '@/mixin/authority'
import validation from '@/mixin/validation'
import gene from '@/components/Common/Gene'
export default {
  name: 'detail-type-vue',
  mixins: [http, authority, validation],
  components: {
    'gene': gene,
  },
  data: () => ({
    is_open: false,

    transaction: null,  //view, insert, update
    type_id: null,
    type_name: null,
    type_eng_name: null,
    disp_order: null,
    use_yn: 'Y',
    bef_snp: [
      /*
      {
        seq:'',
        test_type_id:'',
        test_type_name:'',
        test_type_eng_name:'',
        gene_cd:'',
        snp_cd:'',
        snp_type1:'',
        snp_risk1:'',
        snp_type2:'',
        snp_risk2:'',
        snp_type3:'',
        snp_risk3:'',
        risk_avg:'',
        flag:'',//D-삭제, U-수정
      }
      */
    ],
    snp: [
      /*
      {
        seq:'',
        test_type_id:'',
        test_type_name:'',
        test_type_eng_name:'',
        gene_cd:'',
        snp_cd:'',
        snp_type1:'',
        snp_risk1:'',
        snp_type2:'',
        snp_risk2:'',
        snp_type3:'',
        snp_risk3:'',
        risk_avg:'',
        order_no:'',
        flag:'',//D-삭제, U-수정
      }
      */
    ],
    gene_list: [
      /*
      {
        test_type_id:'',
        gene_cd:'',
        note:'',
      }
      */
    ],
  }),
  beforeCreate:function(){
    if ( !this.$session.has("jwt") ){
      this.$router.replace({name:"Login"});
    }
  },
  created:function(){
    if ( !this.get_menu_authority('M002') ){
      alert("해당 메뉴 접근 권한이 없습니다.")
      this.$router.go(-1);
    }
    else{
      this.transaction = this.$route.query.transaction;
      if ( this.transaction == 'view' ){
        this.type_id = this.$route.query.type_id;
        this.get_check().then(res=>{
          this.is_open = res;
        });
      }
      else{
        this.is_open = true;
      }
      if ( this.transaction == 'insert' ){
        for ( let i = 0 ; i < 5 ; i++ ){
          this.insert_row();
        }
      }
    }
  },
  methods:{
    update_cancel: function(){
      this.get_check().then(()=>{
        this.transaction='view';
      });
    },
    insert_row: function(){
      if ( this.transaction == 'view' ) return;
      let row = {
        seq: null,
        test_type_id: null,
        test_type_name:null,
        test_type_eng_name:null,
        gene_cd:null,
        snp_cd:null,
        snp_type1:null,
        snp_risk1:null,
        snp_type2:null,
        snp_risk2:null,
        snp_type3:null,
        snp_risk3:null,
        risk_avg:null,
        order_no:null,
        flag: 'I',
      };
      this.snp.unshift(row);
    },
    delete_row: function(){
      if ( this.transaction == 'view' ) return;
      for ( let i = this.snp.length-1 ; i >= 0 ; i-- ){
        if ( this.snp[i].check ){
          if ( this.snp[i].seq ){ //등록되어있는 정보인 경우
            //this.snp[i].flag = 'D';
            this.$set(this.snp[i], 'flag', 'D');
          }
          else{ //신규등록하려고 했던 정보인 경우
            this.snp.splice(i, 1);
          }
        }
      }
    },
    set_test_gene: function(event){
      this.snp[event.index].gene_cd = event.item.gene_cd;
      if ( this.snp[event.index].test_type_id != event.item.test_type_id ){
        this.snp[event.index].test_type_id = event.item.test_type_id;
      }
    },
    set_check: async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }

      let con = confirm("입력한 내용으로 검사종류를 추가/수정하시겠습니까?");
      if ( !con ) return;

      //빈값 행 제거
      for ( let i = this.snp.length-1 ; i >= 0 ; i-- ){
        let all_cnt = 0;
        let null_cnt = 0;
        for(let key in this.snp[i]){
          if ( key == 'check' || key == 'flag' ) continue;
          if ( !this.snp[i][key] ){
            null_cnt++;
          }
          all_cnt++;
        }
        if ( null_cnt == all_cnt ){
          this.snp.splice(i, 1);
        }
      }
      //수정되었을 경우 판단
      for ( let i = 0 ; i < this.bef_snp.length; i++ ){
        for ( let j = 0 ; j < this.snp.length; j++ ){
          if ( this.bef_snp[i].seq && (this.bef_snp[i].seq == this.snp[j].seq) ){
            let diff = false;
            for( let key in this.bef_snp[i] ){
              if ( (this.bef_snp[i][key] != this.snp[j][key]) && ( !this.snp[j].flag || this.snp[j].flag.length==0) ){
                diff = true;
                break;
              }
            }
            if ( diff ){
              this.snp[j].flag = 'U';
            }
            break;
          }
        }
      }
      //I, U, D가 아닌 경우 제거, null값 제거
      let snp = [];
      this.snp.forEach(element=>{
        if ( element.flag && element.flag.length > 0 ){
          let temp = this.lodash.cloneDeep(element);
          for ( let key in temp ){
            if ( !temp[key] ){
              delete temp[key];
            }
          }
          delete temp['check'];
          snp.push(temp);
        }
      });

      let data = {
        transaction: this.transaction,
        type_id: this.type_id,
        type_name: this.type_name,
        type_eng_name: this.type_eng_name,
        disp_order: this.disp_order,
        use_yn: this.use_yn,
        snp: JSON.stringify(snp)
      };
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/base/set_check.php', data);
      if ( res ){
        alert("저장되었습니다.");
        this.$store.commit('load', false);
        this.$router.replace({name:'Type'});
      }
      this.$store.commit('load', false);
    },
    get_check: async function(){
      let data = {
        type_id: this.type_id
      };
      this.$store.commit('load', true);
      let res = await this.get(this.$rootUrl+'/server/base/get_check.php', data);
      if ( res ){
        this.name = res.data.info.name;
        this.type_name = res.data.info.type_name;
        this.type_eng_name = res.data.info.type_eng_name;
        this.disp_order = res.data.info.disp_order;
        this.use_yn = res.data.info.use_yn;
        this.bef_snp = this.lodash.cloneDeep(res.data.info.snp);
        this.snp = this.lodash.cloneDeep(res.data.info.snp);
        for ( let i = 0 ; i < this.snp.length ; i++ ){
          this.snp[i].check = false;
        }
        this.$store.commit('load', false);
        return true;
      }
      this.$store.commit('load', false);
      return false;
    },
  },
}
</script>