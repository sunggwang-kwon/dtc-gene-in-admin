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

export default {
  methods: {
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
        let errText = err.response && err.response.data ? extractErrorText(err.response.data) : (err.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
      if (!res) return null;
      if (res.status === 200 && res.data && typeof res.data === 'object' && !isHtml(res.data)) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          return res;
        } else {
          let msg = res.data.msg ? String(res.data.msg) : extractErrorText(res.data);
          alert(msg || this.$t('common.networkError'));
          return null;
        }
      } else {
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
        let errText = err.response && err.response.data ? extractErrorText(err.response.data) : (err.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
      if (!res) return null;
      if (res.status === 200 && res.data && typeof res.data === 'object' && !isHtml(res.data)) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          return res;
        } else {
          let msg = res.data.msg ? String(res.data.msg) : extractErrorText(res.data);
          alert(msg || this.$t('common.networkError'));
          return null;
        }
      } else {
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
        let errText = err.response && err.response.data ? extractErrorText(err.response.data) : (err.message || this.$t('common.networkError'));
        alert(errText);
        return null;
      }
      if (!res) return null;
      if (res.status === 200 && res.data && typeof res.data === 'object' && !isHtml(res.data)) {
        if (res.data.ret === '0000' || res.data.ret === '8888') {
          return res;
        } else {
          let msg = res.data.msg ? String(res.data.msg) : extractErrorText(res.data);
          alert(msg || this.$t('common.networkError'));
          return null;
        }
      } else {
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
        alert(errText || err.message || this.$t('common.networkError'));
        return null;
      }
      if (!res) return null;
      if (res.status === 200) {
        return res;
      } else {
        let errText = await readBlobText(res.data);
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
        alert(errText || err.message || this.$t('common.networkError'));
        return null;
      }
      if (!res) return null;
      if (res.status === 200) {
        return res;
      } else {
        let errText = await readBlobText(res.data);
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
        return {
          text: stripHtml(toText(res.data)),
          raw: res.data,
          json: (res.data && typeof res.data === 'object') ? res.data : null
        };
      } catch (e) {
        let errText = e.response && e.response.data ? extractErrorText(e.response.data) : (e.message || this.$t('common.networkError'));
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
        alert(errText || e.message || this.$t('common.networkError'));
        return null;
      }
      if (!res || res.status !== 200) {
        let errText = res && res.data ? await readBlobText(res.data) : '';
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
        return { ok: false, message: cleanMsg || full || '서버에서 빈 응답을 반환했습니다.' };
      }
      return { ok: true, blob: blob };
    }
  }
}
