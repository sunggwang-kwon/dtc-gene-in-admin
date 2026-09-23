<template>
    <textarea id="editor" style="width:100%; height:100%;"></textarea>
</template>

<script>
export default {
    name:"Editor-view",
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
                license_key: 'gpl',
                plugins: [
                    'advlist', 'autolink', 'link', 'image', 'lists', 'charmap', 'preview', 'hr',
                    'searchreplace', 'visualblocks', 'visualchars', 'insertdatetime',
                    'table', 'emoticons', 'paste'
                ],
                images_upload_url: '',
                image_description: false,
                image_advtab: false,
                image_dimensions: true,

                toolbar: 'alignleft aligncenter alignright alignjustify | fontsize bold italic underline | bullist numlist outdent indent | link image checkbox | forecolor backcolor table ',
                table_toolbar: '',
                table_column_resizing: 'preservetable',
                fontsize_formats: '8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 19pt 20pt 24pt 28pt 32pt 36pt',
                content_style: 'body{font-size:10pt;}',

                file_picker_types: 'image',
                file_picker_callback: (cb) => {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];

                        const reader = new FileReader();
                        reader.addEventListener('load', () => {
                            const id = 'blobid' + (new Date()).getTime();
                            const blobCache =  window.tinymce.activeEditor.editorUpload.blobCache;
                            const base64 = reader.result.split(',')[1];
                            const blobInfo = blobCache.create(id, file, base64);
                            blobCache.add(blobInfo);
                            cb(blobInfo.blobUri(), { title: file.name });
                        });
                        reader.readAsDataURL(file);
                    });
                    input.click();
                },

                // TinyMCE가 변경될 때 Vue 데이터와 동기화
                setup: function (editor) {
                    let fontArray = '8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 19pt 20pt 24pt 28pt 32pt 36pt'.split(' ')
                    editor.ui.registry.addButton('checkbox', {
                        icon: 'selected',
                        onAction: function(){
                            let fontsize = 10
                            for ( let i = 0 ; i < fontArray.length ; i++ ){
                                if ( editor.formatter.match('fontsize', {value:fontArray[i]}) ){
                                    fontsize = fontArray[i].replace('pt', '')*1
                                }
                            }
                            fontsize /= 10
                            fontsize += ''
                            editor.insertContent('<input name="checkboxs" style="zoom:' + fontsize + ';" type="checkbox"></input>')
                        },
                    })

                    editor.on('init', function(args){
                        th.editorId = args.target.id
                        editor.setContent(th.content);
                    })

                    editor.on('change', () => {
                        th.content = editor.getContent();
                    });
                },
                init_instance_callback:function(editor){
                    editor.on('click', function(e){
                        if ( e.target.type === 'checkbox' ){
                            if ( e.target.checked )
                                e.target.setAttribute('checked', 'checked')
                            else{
                                e.target.removeAttribute('checked')
                            }
                            
                        }
                    })
                }
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
    watch:{
        content:function(val){
            this.$emit("commitContent", val)
        },
    }
}
</script>

<style scoped>
@import '../../assets/content.css';
</style>