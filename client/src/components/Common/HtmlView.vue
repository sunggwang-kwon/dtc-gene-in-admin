<template>
    <div id="editor" style="width:100%; height:100%;"></div>
</template>

<script>
export default {
    name:"HtmlView-view",
    props:['value'],
    data:()=>({
        content:'',
        editorId: null
    }),
    created:function(){
        if ( this.value ){
            this.content = this.value.replace(/\\/g,'');
        }
    },
    mounted:function(){
       // 로컬 TinyMCE 로드
       if (!window.tinymce) {
            const script = document.createElement("script");
            //public쪽으로 바로 접근하려면
            ///tinymce/tinymce.min.js로 하면 되는데..
            script.src = (process.env.NODE_ENV==='development') ? "https://hlgenecheck.com/tinymce/tinymce.min.js" : "/lookup/tinymce/tinymce.min.js"; // CDN이 아닌 로컬 파일 로드
            script.onload = this.initTinyMCE;
            document.head.appendChild(script);
        } else {
            this.initTinyMCE();
        }
    },
    beforeDestroy:function(){
        // TinyMCE 에디터 인스턴스 제거
        if (window.tinymce && window.tinymce.get('editor')) {
            const editor = window.tinymce.get('editor');
            editor.remove();
        }
    },
    methods:{
        initTinyMCE:function() {
            var th = this;
            const isEnglish = this.$i18n.locale === 'en';
            const options = {
                selector: "#editor",
                height: '100%',
                readonly: true,
                toolbar: false, // 툴바 숨김
                menubar: false, // 메뉴바 숨김
                statusbar: false, // 상태바 숨김
                license_key: 'gpl',
                content_style: 'body{font-size:10pt;}',

                // TinyMCE가 변경될 때 Vue 데이터와 동기화
                setup: function (editor) {
                    editor.on('init', function(){
                        editor.setContent(th.content);
                    })
                },
            };

            if ( isEnglish ) {
                options.language = 'en';
            } else {
                options.language = 'ko';
                options.language_url = (process.env.NODE_ENV==='development') ? 'https://hlgenecheck.com/tinymce/langs/custom-ko.js' : '/lookup/tinymce/langs/custom-ko.js';
            }

            window.tinymce.init(options);
        },
    },
}
</script>

<style scoped>
@import '../../assets/content.css';
</style>