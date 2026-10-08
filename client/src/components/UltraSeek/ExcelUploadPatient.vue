<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?500:'100%'" persistent>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <span style="font-size: 16px; font-weight: 600;">검사자업로드</span>
          </v-col>
          <v-spacer></v-spacer>
          <v-col cols="auto">
            <v-btn @click="close" icon><v-icon>mdi-window-close</v-icon></v-btn>
          </v-col>
        </v-row>
      </v-card-title>
      <v-divider class="pb-5"></v-divider>
      <v-card-text :class="$vuetify.breakpoint.mobile?'px-1':null">
        <v-form ref="form">
          <v-file-input v-model="file" placeholder="파일명" show-size dense outlined append-icon="mdi-attachment" prepend-icon="" accept="application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" :rules="[required]"></v-file-input>
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
            <v-btn @click="excel_upload_patient" dark :elevation="0">저장</v-btn>
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
  name: 'ultraseek-excel-upload-patient-vue',
  mixins: [http, validation],
  props: {
    endpoint: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    is_open: false,
    file: null
  }),
  methods: {
    open: function() {
      this.is_open = true;
    },
    close: function() {
      this.is_open = false;
      setTimeout(() => {
        this.reset();
      }, 100);
    },
    reset: function() {
      if (this.$refs.form) {
        this.$refs.form.reset();
      }
      Object.assign(this.$data, this.$options.data());
    },
    example_file_download: async function() {
      alert('해당 기능은 준비 중입니다.');
    },
    excel_upload_patient: async function() {
      if (!this.$refs.form.validate()) {
        return;
      }
      if (!this.endpoint) {
        alert('해당 기능은 준비 중입니다.');
        return;
      }
      let con = confirm('검사자 업로드를 진행하시겠습니까?');
      if (!con) return;

      let data = {
        file: this.file
      };
      this.$store.commit('load', true);
      let res = await this.post(this.endpoint, data);
      this.$store.commit('load', false);
      if (res) {
        alert('저장되었습니다.');
        this.close();
        this.$emit('refresh');
      }
    }
  }
}
</script>
