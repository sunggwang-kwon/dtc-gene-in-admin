import axios from 'axios'
axios.defaults.headers.get['Pragma'] = 'no-cache';
axios.defaults.headers.get['Cache-Control'] = 'no-cache, no-store';

function isHtml(data) {
  return typeof data === 'string' && /<[a-z][\s\S]*>/i.test(data);
}

function toText(data) {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') return data;
  if (data.msg) return String(data.msg);
  try { return JSON.stringify(data); } catch (e) { return ''; }
}

function stripHtml(text) {
  return String(text || '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim();
}

function extractErrorText(data) {
  if (data === null || data === undefined) return '';
  if (typeof data === 'string') {
    let trimmed = data.replace(/^\uFEFF/, '').trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        let parsed = JSON.parse(trimmed);
        if (parsed.msg) return String(parsed.msg);
        if (parsed.message) return String(parsed.message);
      } catch (e) {
        // ignore JSON parse failure on non-JSON text
      }
    }
    return stripHtml(data);
  }
  if (typeof data === 'object') {
    if (data.msg) return String(data.msg);
    if (data.message) return String(data.message);
    try { return JSON.stringify(data); } catch (e) { return ''; }
  }
  return String(data);
}

function readBlobText(blob) {
  if (!(blob instanceof Blob)) return Promise.resolve('');
  return new Promise(resolve => {
    let reader = new FileReader();
    reader.onload = () => resolve(stripHtml(String(reader.result || '')));
    reader.onerror = () => resolve('');
    reader.readAsText(blob);
  });
}

function isSessionError(data, status) {
  if (status === 401) return true;
  if (!data) return false;
  if (typeof data === 'object') {
    const ret = String(data.ret || '');
    if (ret === '1001' || ret === '1002' || ret === '1009') {
      return true;
    }
    const msg = String(data.msg || data.message || '');
    if (msg.includes('세션 인증 오류') || msg.includes('세션이 만료') || msg.includes('세션 만료')) {
      return true;
    }
  }
  if (typeof data === 'string') {
    if (data.includes('세션 인증 오류') || data.includes('세션이 만료') || data.includes('세션 만료')) {
      return true;
    }
    const trimmed = data.replace(/^\uFEFF/, '').trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      try {
        const parsed = JSON.parse(trimmed);
        const ret = String(parsed.ret || '');
        if (ret === '1001' || ret === '1002' || ret === '1009') {
          return true;
        }
        const msg = String(parsed.msg || parsed.message || '');
        if (msg.includes('세션 인증 오류') || msg.includes('세션이 만료') || msg.includes('세션 만료')) {
          return true;
        }
      } catch (e) {
        // ignore JSON parse failure on non-JSON text
      }
    }
  }
  return false;
}

let isHandlingSessionError = false;

function handleSessionExpired(vm, msg) {
  if (isHandlingSessionError) return;
  isHandlingSessionError = true;
  setTimeout(() => {
    isHandlingSessionError = false;
  }, 2000);

  const displayMsg = msg || '세션 인증 오류!';
  alert(displayMsg);

  try {
    if (vm && vm.$session && typeof vm.$session.destroy === 'function') {
      vm.$session.destroy();
    }
  } catch (e) {
    // ignore
  }

  try {
    sessionStorage.removeItem('vue-session-key');
  } catch (e) {
    // ignore
  }

  try {
    if (vm && vm.$store && typeof vm.$store.commit === 'function') {
      vm.$store.commit('reset');
    }
  } catch (e) {
    // ignore
  }

  try {
    if (vm && vm.$router && vm.$router.currentRoute && vm.$router.currentRoute.name !== 'Login') {
      vm.$router.replace({ name: 'Login' }).catch(() => {});
    } else {
      window.location.hash = '#/login';
    }
  } catch (e) {
    window.location.hash = '#/login';
  }
}

export default {
  methods: {
    handleSessionError: function(msg) {
      handleSessionExpired(this, msg);
    },
    get: async function(url, data) {
      let params = {};
      for (let key in data) {
        if (data[key]) {
          params[key] = data[key];
        }
      }
      let res;
      try {
        res = await axios({
          method: 'get',
          url: url,
          headers: {
            jwt: this.$session.get('jwt')
          },
          params: params,
          responseType: 'json'
        });
      } catch (err) {
        let errData = err.response ? err.response.data : null;
        let errStatus = err.response ? err.response.status : 0;
        if (isSessionError(errData, errStatus)) {
          let msg = extractErrorText(errData);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let errText = errData ? extractErrorText(errData) : (err.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
      if (!res) return null;
      if (res.status === 200 && res.data && typeof res.data === 'object' && !isHtml(res.data)) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          return res;
        } else {
          let msg = res.data.msg ? String(res.data.msg) : extractErrorText(res.data);
          if (isSessionError(res.data, res.status)) {
            handleSessionExpired(this, msg || '세션 인증 오류!');
            return null;
          }
          alert(msg || this.$t('common.networkError'));
          return null;
        }
      } else {
        if (isSessionError(res.data, res.status)) {
          let msg = extractErrorText(res.data);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let msg = extractErrorText(res.data);
        alert(msg || this.$t('common.networkError'));
        return null;
      }
    },
    post: async function(url, data) {
      let form_data = new FormData();
      for (let key in data) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => {
              form_data.append(key + '[]', item);
            });
          } else {
            form_data.append(key, data[key]);
          }
        }
      }
      let res;
      try {
        res = await axios({
          method: 'post',
          url: url,
          headers: {
            jwt: this.$session.get('jwt')
          },
          data: form_data,
          responseType: 'json'
        });
      } catch (err) {
        let errData = err.response ? err.response.data : null;
        let errStatus = err.response ? err.response.status : 0;
        if (isSessionError(errData, errStatus)) {
          let msg = extractErrorText(errData);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let errText = errData ? extractErrorText(errData) : (err.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
      if (!res) return null;
      if (res.status === 200 && res.data && typeof res.data === 'object' && !isHtml(res.data)) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          return res;
        } else {
          let msg = res.data.msg ? String(res.data.msg) : extractErrorText(res.data);
          if (isSessionError(res.data, res.status)) {
            handleSessionExpired(this, msg || '세션 인증 오류!');
            return null;
          }
          alert(msg || this.$t('common.networkError'));
          return null;
        }
      } else {
        if (isSessionError(res.data, res.status)) {
          let msg = extractErrorText(res.data);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let msg = extractErrorText(res.data);
        alert(msg || this.$t('common.networkError'));
        return null;
      }
    },
    postFile: async function(url, data) {
      let form_data = new FormData();
      for (let key in data) {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => {
              form_data.append(key + '[]', item);
            });
          } else {
            form_data.append(key, data[key]);
          }
        }
      }
      let res;
      try {
        res = await axios({
          method: 'post',
          url: url,
          headers: {
            jwt: this.$session.get('jwt')
          },
          data: form_data,
          responseType: 'json'
        });
      } catch (err) {
        let errData = err.response ? err.response.data : null;
        let errStatus = err.response ? err.response.status : 0;
        if (isSessionError(errData, errStatus)) {
          let msg = extractErrorText(errData);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let errText = errData ? extractErrorText(errData) : (err.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
      if (!res) return null;
      if (res.status === 200 && res.data && typeof res.data === 'object' && !isHtml(res.data)) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          return res;
        } else {
          let msg = res.data.msg ? String(res.data.msg) : extractErrorText(res.data);
          if (isSessionError(res.data, res.status)) {
            handleSessionExpired(this, msg || '세션 인증 오류!');
            return null;
          }
          alert(msg || this.$t('common.networkError'));
          return null;
        }
      } else {
        if (isSessionError(res.data, res.status)) {
          let msg = extractErrorText(res.data);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let msg = extractErrorText(res.data);
        alert(msg || this.$t('common.networkError'));
        return null;
      }
    },
    download: async function(url, data) {
      let params = {};
      for (let key in data) {
        if (data[key]) {
          params[key] = data[key];
        }
      }
      let res;
      try {
        res = await axios({
          method: 'get',
          url: url,
          headers: {
            jwt: this.$session.get('jwt')
          },
          params: params,
          responseType: 'blob'
        });
      } catch (err) {
        let errText = '';
        if (err.response && err.response.data) {
          errText = await readBlobText(err.response.data);
        }
        if (isSessionError(errText, err.response ? err.response.status : 0)) {
          handleSessionExpired(this, errText || '세션 인증 오류!');
          return null;
        }
        alert(errText || err.message || this.$t('common.networkError'));
        return null;
      }
      if (!res) return null;
      if (res.status === 200) {
        if (res.data instanceof Blob && (res.data.type === 'application/json' || res.data.size < 500)) {
          let head = await readBlobText(res.data.slice(0, 500));
          if (isSessionError(head, 200)) {
            handleSessionExpired(this, extractErrorText(head) || '세션 인증 오류!');
            return null;
          }
        }
        return res;
      } else {
        let errText = await readBlobText(res.data);
        if (isSessionError(errText, res.status)) {
          handleSessionExpired(this, errText || '세션 인증 오류!');
          return null;
        }
        alert(errText || this.$t('common.networkError'));
        return null;
      }
    },
    postDownload: async function(url, data) {
      let form_data = new FormData();
      for (let key in data) {
        if (data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            data[key].forEach(item => {
              form_data.append(key + '[]', item);
            });
          } else {
            form_data.append(key, data[key]);
          }
        }
      }
      let res;
      try {
        res = await axios({
          method: 'post',
          url: url,
          headers: {
            jwt: this.$session.get('jwt')
          },
          data: form_data,
          responseType: 'blob'
        });
      } catch (err) {
        let errText = '';
        if (err.response && err.response.data) {
          errText = await readBlobText(err.response.data);
        }
        if (isSessionError(errText, err.response ? err.response.status : 0)) {
          handleSessionExpired(this, errText || '세션 인증 오류!');
          return null;
        }
        alert(errText || err.message || this.$t('common.networkError'));
        return null;
      }
      if (!res) return null;
      if (res.status === 200) {
        if (res.data instanceof Blob && (res.data.type === 'application/json' || res.data.size < 500)) {
          let head = await readBlobText(res.data.slice(0, 500));
          if (isSessionError(head, 200)) {
            handleSessionExpired(this, extractErrorText(head) || '세션 인증 오류!');
            return null;
          }
        }
        return res;
      } else {
        let errText = await readBlobText(res.data);
        if (isSessionError(errText, res.status)) {
          handleSessionExpired(this, errText || '세션 인증 오류!');
          return null;
        }
        alert(errText || this.$t('common.networkError'));
        return null;
      }
    },
    postText: async function(url, data) {
      let form_data = new FormData();
      for (let key in data) {
        if (data[key] === null || data[key] === undefined || data[key] === '') continue;
        if (Array.isArray(data[key])) {
          data[key].forEach(item => form_data.append(key + '[]', item));
        } else {
          form_data.append(key, data[key]);
        }
      }
      try {
        let res = await axios({
          method: 'post',
          url: url,
          headers: { jwt: this.$session.get('jwt') },
          data: form_data,
          responseType: 'text'
        });
        if (isSessionError(res.data, res.status)) {
          let msg = extractErrorText(res.data);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        return {
          text: stripHtml(toText(res.data)),
          raw: res.data,
          json: (res.data && typeof res.data === 'object') ? res.data : null
        };
      } catch (e) {
        let errData = e.response ? e.response.data : null;
        let errStatus = e.response ? e.response.status : 0;
        if (isSessionError(errData, errStatus)) {
          let msg = extractErrorText(errData);
          handleSessionExpired(this, msg || '세션 인증 오류!');
          return null;
        }
        let errText = errData ? extractErrorText(errData) : (e.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
    },
    postBlobChecked: async function(url, data, kind) {
      let form_data = new FormData();
      for (let key in data) {
        if (data[key] === null || data[key] === undefined) continue;
        if (Array.isArray(data[key])) {
          data[key].forEach(item => form_data.append(key + '[]', item));
        } else {
          form_data.append(key, data[key]);
        }
      }
      let res;
      try {
        res = await axios({
          method: 'post',
          url: url,
          headers: { jwt: this.$session.get('jwt') },
          data: form_data,
          responseType: 'blob'
        });
      } catch (e) {
        let errText = '';
        if (e.response && e.response.data) {
          errText = await readBlobText(e.response.data);
        }
        if (isSessionError(errText, e.response ? e.response.status : 0)) {
          handleSessionExpired(this, errText || '세션 인증 오류!');
          return null;
        }
        alert(errText || e.message || this.$t('common.networkError'));
        return null;
      }
      if (!res || res.status !== 200) {
        let errText = res && res.data ? await readBlobText(res.data) : '';
        if (isSessionError(errText, res ? res.status : 0)) {
          handleSessionExpired(this, errText || '세션 인증 오류!');
          return null;
        }
        alert(errText || this.$t('common.networkError'));
        return null;
      }
      let blob = res.data;
      let head = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = () => resolve('');
        reader.readAsText(blob.slice(0, 2048));
      });
      let isError = false;
      if (kind === 'zip') {
        isError = !(head.startsWith('PK'));
      } else {
        isError = /^\s*\{[\s\S]*"ret"/.test(head) || (head.indexOf('<table') === -1 && head.length > 0);
      }
      if (blob.size === 0) isError = true;
      if (isError) {
        let full = await readBlobText(blob);
        let cleanMsg = extractErrorText(full);
        if (isSessionError(cleanMsg || full, res ? res.status : 0)) {
          handleSessionExpired(this, cleanMsg || '세션 인증 오류!');
          return { ok: false, message: cleanMsg || '세션 인증 오류!' };
        }
        return { ok: false, message: cleanMsg || full || '서버에서 빈 응답을 반환했습니다.' };
      }
      return { ok: true, blob: blob };
    }
  }
}
