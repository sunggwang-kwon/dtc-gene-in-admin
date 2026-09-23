import Vue from 'vue'
import Vuex from 'vuex'
//import lodash from 'lodash'

Vue.use(Vuex)

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
    banner:null,
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
    banner: function(state){
      return state.banner;
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
      state.banner = null;
    },
    load: function(state, payload){
      state.load = payload;
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
    },
    banner: function(state, payload){
      state.banner = payload;
    }
  }
});