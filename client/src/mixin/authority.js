export default{
  methods:{
    get_menu_authority:function(menu_code){
      let check = null;
      let auth = this.$session.get('Auth');
      for ( let i = 0 ; i < auth.length ; i++ ){
        if ( auth[i].menu_code == menu_code ){
          check = auth[i].auth;
          break;
        }
      }
      return check;
    }
  }
}