import Vue from 'vue'
import Vuex from 'vuex'
//import lodash from 'lodash'

Vue.use(Vuex)

// 목록 페이지당 노출 건수 옵션 및 기본값
export const ROWS_OPTIONS = [10, 20, 50, 100];
const DEFAULT_ROWS = 20;
const ROWS_STORAGE_PREFIX = 'user_rows_';

function readUserRows(userId){
  try {
    const saved = parseInt(localStorage.getItem(ROWS_STORAGE_PREFIX + userId), 10);
    if ( ROWS_OPTIONS.indexOf(saved) !== -1 ) return saved;
  } catch (e) {
    // localStorage 사용 불가 환경은 기본값 사용
  }
  return DEFAULT_ROWS;
}

export const store = new Vuex.Store({
  strict:process.env.NODE_ENV !== 'production',

  state:{
    load: false,
    
    member:null,
    /*{
      page: null,
      rows: null,
      sort: null,
      order: null,
      search_value: null
    }
    */
    type:null,
    /*
    {
      sort: null,
      order: null,
    }
    */
    manage:null,
    /*
    {
      page: null,
      rows: null,
      sort: null,
      order: null,
      search_value: null,
      from_date: null,
      to_date: null,
      tat: null,
      type: null,
    }
    */
   result:null,
   /*
   {
      page: null,
      rows: null,
      sort: null,
      order: null,
      patient_id: null,
      search_type: null,
      search_value: null,
      request_date: null,
   }
   */
    gene:null,
    company:null,
    rows: DEFAULT_ROWS, // 목록 페이지당 노출 건수 (사용자별 localStorage 영구 저장)
  },
  getters:{
    load: function(state){
      return state.load;
    },
    member: function(state){
      return state.member;
    },
    type: function(state){
      return state.type;
    },
    manage: function(state){
      return state.manage;
    },
    result: function(state){
      return state.result;
    },
    gene: function(state){
      return state.gene;
    },
    company: function(state){
      return state.company;
    },
    rows: function(state){
      return state.rows;
    }
  },
  mutations:{
    reset: function(state){
      state.load = false;
      state.member = null;
      state.type = null;
      state.manage = null;
      state.result = null;
      state.gene = null;
      state.company = null;
      state.rows = DEFAULT_ROWS; // localStorage 값은 유지 (재로그인 시 사용자별 복원)
    },
    load: function(state, payload){
      state.load = payload;
    },
    load_rows: function(state, userId){
      state.rows = readUserRows(userId);
    },
    rows: function(state, payload){
      // payload: { userId, rows }
      if ( ROWS_OPTIONS.indexOf(payload.rows) === -1 ) return;
      state.rows = payload.rows;
      try {
        localStorage.setItem(ROWS_STORAGE_PREFIX + payload.userId, payload.rows);
      } catch (e) {
        // localStorage 사용 불가 환경은 세션 내 Vuex 값만 유지
      }
    },
    member: function(state, payload){
      state.member = payload;
    },
    type: function(state, payload){
      state.type = payload;
    },
    manage: function(state, payload){
      state.manage = payload;
    },
    result: function(state, payload){
      state.result = payload;
    },
    gene: function(state, payload){
      state.gene = payload;
    },
    company: function(state, payload){
      state.company = payload;
    }
  }
});