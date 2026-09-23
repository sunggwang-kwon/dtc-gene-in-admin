import axios from 'axios'
axios.defaults.headers.get['Pragma'] = 'no-cache';
axios.defaults.headers.get['Cache-Control'] = 'no-cache, no-store';

export default{
  methods:{
    get:async function(url, data){
      //let headers = this.$session.getAll();
      //for ( let key in headers ){
      //  headers[key] = encodeURI(headers[key]);
      //}
      let params = new Object;
      for ( let key in data ){
        if ( data[key] ){
          params[key] = data[key];
        }
      }
      let res = await axios({
        method: "get",
        url: url,
        headers: {
          jwt : this.$session.get("jwt")
        },
        params: params,
        responseType: "json"
      }).catch(err=>{
        alert(err.message);
        return null;
      });
      if ( res.status == 200 ){
        if ( res.data.ret == '0000' || res.data.ret == '8888' ){
          return res;
        }
        else{
          if ( res.data.msg ){
            alert(res.data.msg);
          }
          else{
            alert(res.data);
          }
          return null;
        }
      }
      else{
        alert(this.$t('common.networkError'));
        return null;
      }
    },
    post:async function(url, data){
      //let headers = this.$session.getAll();
      //for ( let key in headers ){
      //  headers[key] = encodeURI(headers[key]);
      //}
      let form_data = new FormData();
      for ( let key in data ){
        if ( data[key] ){
          form_data.append(key, data[key]);
        }
      }
      let res = await axios({
        method: "post",
        url: url,
        headers: {
          jwt : this.$session.get("jwt")
        },
        data: form_data,
        responseType: "json"
      }).catch(err=>{
        alert(err.message);
        return null;
      });
      if ( res.status == 200 ){
        if ( res.data.ret == '0000' ){
          return res;
        }
        else{
          if ( res.data.msg ){
            alert(res.data.msg);
          }
          else{
            alert(res.data);
          }
          return null;
        }
      }
      else{
        alert(this.$t('common.networkError'));
        return null;
      }
    },
    download:async function(url, data){
      //let headers = this.$session.getAll();
      //for ( let key in headers ){
      //  headers[key] = encodeURI(headers[key]);
      //}
      let params = new Object;
      for ( let key in data ){
        if ( data[key] ){
          params[key] = data[key];
        }
      }
      let res = await axios({
        method: "get",
        url: url,
        headers: {
          jwt : this.$session.get("jwt")
        },
        params: params,
        responseType: "blob"
      }).catch(err=>{
        alert(err.message);
        return null;
      });
      if ( res.status == 200 ){
        return res;
      }
      else{
        alert(this.$t('common.networkError'));
        return null;
      }
    },
    postDownload:async function(url, data){
      let form_data = new FormData();
      for ( let key in data ){
        if ( data[key] !== null && data[key] !== undefined ){
          if ( Array.isArray(data[key]) ){
            data[key].forEach(item => {
              form_data.append(key + '[]', item);
            });
          }
          else{
            form_data.append(key, data[key]);
          }
        }
      }
      let res = await axios({
        method: "post",
        url: url,
        headers: {
          jwt : this.$session.get("jwt")
        },
        data: form_data,
        responseType: "blob"
      }).catch(err=>{
        alert(err.message);
        return null;
      });
      if ( res.status == 200 ){
        return res;
      }
      else{
        alert(this.$t('common.networkError'));
        return null;
      }
    },
  }
}