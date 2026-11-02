<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?560:'100%'" persistent>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <span style="font-size: 16px; font-weight: 600;">결과지 업로드</span>
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
            v-model="files"
            multiple
            small-chips
            show-size
            dense
            outlined
            placeholder="결과지 파일을 선택하세요 (다중 선택 가능)"
            append-icon="mdi-attachment"
            prepend-icon=""
            accept=".pdf,.xlsx,.xls,.zip"
            :rules="[files_required_rule, files_name_rule]"
          ></v-file-input>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row style="margin:1px" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="close" color="grey" dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="upload_result" dark :elevation="0">저장</v-btn>
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
  name: 'ultraseek-upload-result-vue',
  mixins: [http, validation],
  props: {
    endpoint: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    is_open: false,
    files: []
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
      this.files = [];
      Object.assign(this.$data, this.$options.data());
    },
    files_required_rule: function(v) {
      return (Array.isArray(v) && v.length > 0) || '결과지 파일을 1개 이상 선택해 주세요.';
    },
    files_name_rule: function(v) {
      if (!Array.isArray(v) || v.length === 0) return true;
      const invalid = v.filter(file => {
        const name = file ? file.name : '';
        const m = name.match(/^(\d{4})(\d{2})(\d{2})([^_]+)_.+\.[^.]+$/);
        if (!m) return true;
        const y = parseInt(m[1], 10), mo = parseInt(m[2], 10), d = parseInt(m[3], 10);
        const dt = new Date(y, mo - 1, d);
        return !(dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d);
      });
      if (invalid.length > 0) {
        return '파일명 형식이 올바르지 않습니다: ' + invalid.map(f => f.name).join(', ') +
               ' (규칙: YYYYMMDD(채혈일) + 수검자ID + _파일명.확장자)';
      }
      return true;
    },
    upload_result: async function() {
      if (!this.$refs.form.validate()) return;
      if (!confirm(this.files.length + '개의 결과지 업로드를 진행하시겠습니까? (동일 파일명은 서버에서 덮어쓰기 됩니다)')) return;

      this.$store.commit('load', true);
      let res = await this.postText(this.endpoint, { files: this.files });
      this.$store.commit('load', false);
      if (!res) return;

      let text = res.text;
      if (!text) {
        alert('서버에서 처리된 파일이 없습니다. 파일 용량 초과 가능성이 있습니다. 파일 크기를 줄이거나 나누어 업로드해 주세요.');
        return;
      }
      let successCnt = (text.match(/업로드 성공/g) || []).length;
      if (successCnt > 0) {
        alert(text);
        this.close();
        this.$emit('refresh');
      } else {
        alert(text || '결과지 업로드에 실패했습니다.');
      }
    }
  }
}
</script>
