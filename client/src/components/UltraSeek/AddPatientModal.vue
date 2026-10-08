<template>
  <v-dialog v-model="is_open" content-class="d-print-none" :width="!$vuetify.breakpoint.mobile?600:'100%'" persistent>
    <v-card>
      <v-card-title>
        <v-row align="center">
          <v-col cols="auto">
            <span style="font-size: 16px; font-weight: 600;">검사자 추가</span>
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
          <!-- 아이디 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>아이디<span style="color:red">(*)</span></div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="patient_id" dense outlined hide-details="auto" :rules="[required]" placeholder="수검자 ID"></v-text-field>
            </v-col>
          </v-row>
          <!-- 검사자명 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>검사자명<span style="color:red">(*)</span></div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="patient_name" dense outlined hide-details="auto" :rules="[required]" placeholder="성명"></v-text-field>
            </v-col>
          </v-row>
          <!-- 영문명 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>영문명</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="patient_eng_name" dense outlined hide-details="auto" placeholder="English Name"></v-text-field>
            </v-col>
          </v-row>
          <!-- 성별 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>성별</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-select v-model="gender" dense outlined hide-details="auto" :items="[{text:'남자', value:'M'}, {text:'여자', value:'F'}]"></v-select>
            </v-col>
          </v-row>
          <!-- 나이 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>나이</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="age" type="number" dense outlined hide-details="auto" placeholder="나이"></v-text-field>
            </v-col>
          </v-row>
          <!-- 기관명 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>기관명</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="company_name" dense outlined hide-details="auto" placeholder="기관명/거래처"></v-text-field>
            </v-col>
          </v-row>
          <!-- 채혈일자 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>채혈일자</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="blood_date" type="date" dense outlined hide-details="auto"></v-text-field>
            </v-col>
          </v-row>
          <!-- 비고 -->
          <v-row align="center" no-gutters class="mb-3">
            <v-col cols="12" sm="3">
              <div>비고</div>
            </v-col>
            <v-col cols="12" sm="9">
              <v-text-field v-model="bigo" dense outlined hide-details="auto" placeholder="비고"></v-text-field>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-row style="margin:1px" align="center">
          <v-spacer></v-spacer>
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
  name: 'ultraseek-add-patient-modal-vue',
  mixins: [http, validation],
  props: {
    endpoint: {
      type: String,
      default: ''
    }
  },
  data: () => ({
    is_open: false,
    patient_id: null,
    patient_name: null,
    patient_eng_name: null,
    gender: 'M',
    age: null,
    company_name: null,
    blood_date: null,
    bigo: null
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
    save: async function() {
      if (!this.$refs.form.validate()) {
        return;
      }
      if (!this.endpoint) {
        alert('해당 기능은 준비 중입니다.');
        return;
      }
      let con = confirm('검사자를 등록하시겠습니까?');
      if (!con) return;

      let data = {
        transaction: 'insert',
        patient_id: this.patient_id,
        patient_name: this.patient_name,
        patient_eng_name: this.patient_eng_name,
        gender: this.gender,
        age: this.age,
        company_name: this.company_name,
        blood_date: this.blood_date,
        bigo: this.bigo
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
