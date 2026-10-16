import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import '@/styles/custom.scss'
import '@/assets/content.css'
import i18n, { translateDynamicText } from './i18n'
import { initDomTranslator } from './i18n/domTranslator'

import router from './router'
import {store} from "./store"
import lodash from 'lodash'
import VueSession from 'vue-session'
import VueCookies from 'vue-cookies'
import VueJWT from 'vuejs-jwt'

Vue.config.productionTip = false

Vue.config.errorHandler = function(err, vm, info) {
  console.error('[Vue Runtime Error]:', err, info);
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', function(event) {
    console.error('[Window Error]:', event.error || event.message);
  });
  window.addEventListener('unhandledrejection', function(event) {
    console.error('[Unhandled Promise Rejection]:', event.reason);
  });
}

Vue.prototype.lodash = lodash;
Vue.prototype.$tr = function(text, params){
  return translateDynamicText(text, this.$i18n.locale, params);
}

Vue.prototype.$rootUrl = (process.env.NODE_ENV==='development')?"/root/proxy":""

var sessionOption = {
  persist: false
}
Vue.use(VueJWT)
Vue.use(VueSession, sessionOption)
Vue.use(VueCookies);

VueCookies.config('30d');

if (typeof window !== 'undefined' && !window.__i18nDialogPatched) {
  const nativeAlert = window.alert.bind(window);
  const nativeConfirm = window.confirm.bind(window);

  window.alert = function(message){
    nativeAlert(translateDynamicText(message, i18n.locale));
  };

  window.confirm = function(message){
    return nativeConfirm(translateDynamicText(message, i18n.locale));
  };

  window.__i18nDialogPatched = true;
}

const app = new Vue({
  vuetify,
  i18n,
  router,
  store: store,
  render: h => h(App)
}).$mount('#app')

initDomTranslator(app)
