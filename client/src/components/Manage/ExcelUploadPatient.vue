<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?500:'100%'" persistent>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <h6>검사자업로드</h6>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn @click="close" small icon><v-icon>mdi-window-close</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider class="pb-5"></v-divider>
      <v-card-text :class="$vuetify.breakpoint.mobile?'px-1':null">
        <v-form ref="form">
          <v-row align="start" no-gutters>
            <v-col cols="12" lg="auto" class="pr-2">
              <div class="pt-1">파일명</div>
            </v-col>
            <v-col>
              <v-file-input v-model="file" show-size dense outlined append-icon="mdi-attachment" prepend-icon="" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :rules="[required]"></v-file-input>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row style="margin:1px" align="center">
          <v-col cols="auto">
            <v-btn @click="example_file_download" class="pa-0 ma-0" style="color:rgba(0,0,0,0.5);" text>예시파일 다운로드</v-btn>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn @click="excel_upload_result" small dark :elevation="0">저장</v-btn>
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
  name:"excel-upload-patient-vue",
  mixins: [http, validation],
  data:()=>({
    is_open: false,
    file: null,
  }),
  methods:{
    open: function(){
      this.is_open = true;
    },
    close:function(){
      this.is_open = false;
      setTimeout(() => {
        this.reset();
      }, 100);
    },
    reset:function(){
      this.$refs.form.reset();
      Object.assign(this.$data, this.$options.data());
    },
    example_file_download:async function(){
      const isEn = this.$i18n.locale === 'en';
      const docPath = isEn ? '/server/document/Subject Upload Template(ENG).xlsx' : '/server/document/DTC검사자업로드양식.xlsx';
      let res = await this.download(this.$rootUrl + docPath);
      if ( res ){
        let fileURL = window.URL.createObjectURL(new Blob([res.data], {type:'application/vnd.ms-excel'}));
        let fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', isEn ? 'Subject Upload Template(ENG).xlsx' : '검사자업로드양식.xlsx');
        document.body.appendChild(fileLink);
        fileLink.click();
      }
    },
    excel_upload_result:async function(){
      if ( !this.$refs.form.validate() ){
        return;
      }
      let con = confirm("검사자 업로드를 진행하시겠습니까?");
      if ( !con ) return;

      let data = {
        file: this.file
      }
      this.$store.commit('load', true);
      let res = await this.post(this.$rootUrl+'/server/patient/excel_upload_patient.php', data);
      if ( res ){
        alert("저장되었습니다.");
        this.$store.commit('load', false);
        this.$router.replace({name:'Manage'});
      }
      this.$store.commit('load', false);
    }
  }
}
</script>