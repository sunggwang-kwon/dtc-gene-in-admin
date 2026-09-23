import i18n from '@/i18n'

export default({
  data:function(){
    return {
      required: v => !!v || i18n.t('validation.required'),
      id_rule: v => !v || (/^[a-zA-Z0-9]{4,20}$/.test(v)) || i18n.t('validation.idRule'),
      email_rule: v => !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v) || i18n.t('validation.emailRule'),
      birthday_rule: v => !v || /^(19[0-9][0-9]|20\d{2})-?(0[0-9]|1[0-2])-?(0[1-9]|[1-2][0-9]|3[0-1])$/.test(v) || i18n.t('validation.birthdayRule'),
      phone_rule: v => !v || /^([0-9]{2,3})-?([0-9]{3,4})-?([0-9]{4})$/.test(v) || i18n.t('validation.phoneRule'),
    }
  },
  methods:{
    password_rule:function(v){
      if ( !v || v.length == 0 ) return true;
      if ( !/^(?=.*[a-zA-Z])(?=.*[./!@#$%^*+=-])(?=.*[0-9]).{8,16}$/.test(v) ){
        return i18n.t('validation.passwordComplexity');
      }
      
      const keyboard = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm", "0987654321", "poiuytrewq", "lkjhgfdsa", "mnbvcxz"];
      for (let i = 0; i < v.length-2; i++) {
          const sliceValue = v.substring(i, i + 3);
          
          if (keyboard.some((code) => code.includes(sliceValue))) {
              return i18n.t('validation.passwordSequential');
          }
      }
      let ch = null;
      let cnt = 0;
      for ( let i = 0 ; i < v.length ; i++ ){
        if ( !ch ){
          ch = v[i];
          cnt++;
        }
        else{
          if ( ch == v[i] ){
            cnt++;
          }
          else{
            ch = v[i];
            cnt = 1;
          }
        }
        if ( cnt >= 3 ){
          return i18n.t('validation.passwordRepeated')
        }
      }
      return true;
    }
  }
});