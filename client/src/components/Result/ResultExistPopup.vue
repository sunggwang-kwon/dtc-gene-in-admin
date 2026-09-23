<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?700:'100%'" persistent>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <h6>검사결과 선택</h6>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn @click="close" small icon><v-icon>mdi-window-close</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pt-5" :class="$vuetify.breakpoint.mobile?'px-1':null" style="background-color:rgba(0,0,0,0.01)">
        <div v-if="!$vuetify.breakpoint.mobile" class="tinycss">
          <table style="min-width:350px; table-layout:fixed;" border="1">
            <thead>
              <tr>
                <th style="text-align:center; font-weight:bold;">검사자ID</th>
                <th style="text-align:center; font-weight:bold;">이름</th>
                <th style="text-align:center; font-weight:bold;">의뢰일자</th>
                <th style="text-align:center; font-weight:bold;">검사일자</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item, index in list" :key="index" class="cursor-pointer" @click="$emit('commit', item); close();">
                <td>{{ item.patient_id }}</td>
                <td>{{ item.patient_name }}</td>
                <td style="text-align:center;">{{ item.request_date }}</td>
                <td style="text-align:center;">{{ item.test_date }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <v-card v-for="item, index in list" :key="index" @click="$emit('commit', item); close();" class="mb-3" outlined>
            <v-row style="margin-left:5px; margin-right:5px;" align="center">
              <v-col cols="auto">검사자ID</v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto" style="text-align:right">{{ item.patient_id }}</v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row style="margin-left:5px; margin-right:5px;" align="center">
              <v-col cols="auto">이름</v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto" style="text-align:right">{{ item.patient_name }}</v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row style="margin-left:5px; margin-right:5px;" align="center">
              <v-col cols="auto">의뢰일자</v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto" style="text-align:right">{{ item.request_date }}</v-col>
            </v-row>
            <v-divider></v-divider>
            <v-row style="margin-left:5px; margin-right:5px;" align="center">
              <v-col cols="auto">검사일자</v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto" style="text-align:right">{{ item.test_date.split(' ')[0] }}</v-col>
            </v-row>
          </v-card>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import http from '@/mixin/http'
import validation from '@/mixin/validation'
export default {
  name:"result-exist-popup-vue",
  mixins: [http, validation],
  data:()=>({
    is_open: false,
    list: [],
  }),
  methods:{
    open: function(list){
      this.list = list;
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
  }
}
</script>