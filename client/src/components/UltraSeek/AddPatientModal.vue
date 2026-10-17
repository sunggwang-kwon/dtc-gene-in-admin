<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?620:'100%'" persistent>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <span style="font-size: 16px; font-weight: 600;">{{ titlePrefix }} {{ transaction === 'update' ? '수정' : '추가' }}</span>
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
          <!-- 아이디 (수정 시 readonly) -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>ID<span style="color:red">(*)</span></div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model="patient_id"
                :readonly="transaction === 'update'"
                dense
                outlined
                hide-details="auto"
                :rules="[required]"
                placeholder="수검자 ID"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- 거래처 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>거래처<span style="color:red">(*)</span></div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-select
                v-model="company_seq"
                dense
                outlined
                hide-details="auto"
                :items="company_list"
                item-text="company_name"
                item-value="seq"
                :rules="[required]"
                placeholder="거래처를 선택하세요"
              ></v-select>
            </v-col>
          </v-row>

          <!-- 고객명 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>고객명<span style="color:red">(*)</span></div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model="patient_name"
                dense
                outlined
                hide-details="auto"
                :rules="[required]"
                placeholder="성명"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- 성별 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>성별</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-select
                v-model="gender"
                dense
                outlined
                hide-details="auto"
                :items="[{text:'남자', value:'M'}, {text:'여자', value:'F'}]"
              ></v-select>
            </v-col>
          </v-row>

          <!-- 나이 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>나이</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model="age"
                type="number"
                dense
                outlined
                hide-details="auto"
                placeholder="나이"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- 채취일 (채혈일) -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>채취일</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model="blood_date"
                type="date"
                dense
                outlined
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- 접수일 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>접수일</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field
                v-model="reg_date"
                type="date"
                dense
                outlined
                hide-details="auto"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- 결과지 첨부 (단일 파일, 형식: ID_xxxxxxxxx.zzz) -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>결과지 첨부</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-file-input
                v-model="result_file"
                dense
                outlined
                hide-details="auto"
                show-size
                accept=".pdf,.xlsx,.xls,.zip"
                placeholder="파일 형식: [ID]_[파일명].[확장자]"
                append-icon="mdi-attachment"
                prepend-icon=""
                :rules="[result_file_rule]"
              ></v-file-input>
              <div class="caption grey--text mt-1">
                * 결과지 파일은 1개만 첨부 가능하며, 파일명은 ID_xxxxxxxxx.zzz 형식이어야 합니다.
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row style="margin:1px" align="center" justify="end">
          <v-col cols="auto" class="pr-0">
            <v-btn @click="close" color="grey" dark :elevation="0">취소</v-btn>
          </v-col>
          <v-col cols="auto">
            <v-btn @click="save" dark :elevation="0">저장</v-btn>
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
  name: 'add-patient-modal-vue',
  mixins: [http, validation],
  props: {
    endpoint: {
      type: String,
      default: ''
    },
    titlePrefix: {
      type: String,
      default: 'UltraSEEK'
    }
  },
  data: () => ({
    is_open: false,
    transaction: 'insert',
    patient_id: null,
    company_seq: null,
    company_list: [],
    patient_name: null,
    gender: 'M',
    age: null,
    blood_date: null,
    reg_date: null,
    result_file: null
  }),
  methods: {
    open: async function(item = null) {
      await this.get_company_list();

      let now = new Date();
      let year = now.getFullYear();
      let month = now.getMonth() + 1;
      let day = now.getDate();
      if (month < 10) month = '0' + month;
      if (day < 10) day = '0' + day;
      const todayStr = year + '-' + month + '-' + day;

      if (item && item.patient_id) {
        this.transaction = 'update';
        this.patient_id = item.patient_id;
        this.company_seq = item.company_seq || (this.company_list.find(c => c.company_name === item.company_name) || {}).seq || null;
        this.patient_name = item.patient_name ? item.patient_name.replace(/\*/g, '') : null;
        this.gender = item.gender === '여자' || item.gender === 'F' ? 'F' : 'M';
        this.age = item.age || null;
        this.blood_date = item.blood_date || null;
        this.reg_date = item.reg_date || todayStr;
        this.result_file = null;
      } else {
        this.transaction = 'insert';
        this.patient_id = null;
        this.company_seq = null;
        this.patient_name = null;
        this.gender = 'M';
        this.age = null;
        this.blood_date = null;
        this.reg_date = todayStr;
        this.result_file = null;
      }

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
      this.result_file = null;
      Object.assign(this.$data, this.$options.data());
    },
    get_company_list: async function() {
      if (this.company_list.length > 0) return;
      let res = await this.get(this.$rootUrl + '/server/company/get_company_popup.php');
      if (res && res.data && res.data.info) {
        this.company_list = res.data.info;
      }
    },
    result_file_rule: function(file) {
      if (!file) return true;
      const name = file.name || '';
      const id = (this.patient_id || '').trim();
      if (!id) {
        return '먼저 ID를 입력해 주세요.';
      }
      const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp('^' + escapedId + '_.+\\.[^.]+$');
      if (!regex.test(name)) {
        return '파일 형식은 ' + id + '_파일명.확장자 이어야 합니다.';
      }
      return true;
    },
    save: async function() {
      if (!this.$refs.form.validate()) {
        return;
      }
      if (!this.endpoint) {
        alert('해당 기능은 준비 중입니다.');
        return;
      }
      const actionText = this.transaction === 'update' ? '수정' : '등록';
      let con = confirm(this.titlePrefix + ' 검사자 정보를 ' + actionText + '하시겠습니까?');
      if (!con) return;

      let data = {
        transaction: this.transaction,
        patient_id: this.patient_id,
        company_seq: this.company_seq,
        patient_name: this.patient_name,
        gender: this.gender,
        age: this.age,
        blood_date: this.blood_date,
        reg_date: this.reg_date,
        result_file: this.result_file
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
