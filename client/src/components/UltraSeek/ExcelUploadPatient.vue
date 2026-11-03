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
          <v-file-input
            ref="file_input"
            v-model="file"
            placeholder="Excel 97-2003 파일 (.xls)"
            show-size
            dense
            outlined
            append-icon="mdi-attachment"
            prepend-icon=""
            @click:append="on_click_append"
            accept=".xls,application/vnd.ms-excel"
            :rules="[required, xls_only_rule]"
          ></v-file-input>
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
    on_click_append: function() {
      if (this.$refs.file_input && this.$refs.file_input.$refs && this.$refs.file_input.$refs.input) {
        this.$refs.file_input.$refs.input.click();
      }
    },
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
    xls_only_rule: function(file) {
      if (!file) return true;
      const name = file.name || '';
      if ((name.match(/\./g) || []).length !== 1) {
        return '파일명에 마침표(.)는 확장자 구분용 1개만 사용할 수 있습니다. (예: sample.xls)';
      }
      return name.toLowerCase().endsWith('.xls') || 'Excel 97-2003 (.xls) 파일만 업로드할 수 있습니다.';
    },
    example_file_download: function() {
      let link = document.createElement('a');
      link.href = this.$rootUrl + '/server/document/ultraseek_upload_sample.xls';
      link.setAttribute('download', 'ultraseek_upload_sample.xls');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    excel_upload_patient: async function() {
      if (!this.$refs.form.validate()) return;
      if (!confirm('검사자 엑셀 업로드를 진행하시겠습니까? (이미 등록된 검사자는 중복 등록될 수 있습니다)')) return;

      this.$store.commit('load', true);
      let res = await this.postText(this.endpoint, { upload_file: this.file });
      this.$store.commit('load', false);
      if (!res) return;

      let m = res.text.match(/총\s*(\d+)\s*건\s*입력됨/);
      let cnt = m ? parseInt(m[1], 10) : -1;
      if (cnt > 0) {
        alert(res.text);
        this.close();
        this.$emit('refresh');
      } else {
        alert(res.text || '검사자 업로드에 실패했습니다.');
      }
    }
  }
}
</script>
