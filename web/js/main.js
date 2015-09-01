jQuery(function () {    
    
    // lightbox
    var makeLightbox = function (objs) {
        objs.each(
            function () {
                jQuery(this).lightBox({
                    fixedNavigation:false,
                    imageLoading: '//cdn.jsdelivr.net/lightbox/0.5/images/lightbox-ico-loading.gif',
                    imageBtnClose: '//cdn.jsdelivr.net/lightbox/0.5/images/lightbox-btn-close.gif',
                    imageBtnPrev: '//cdn.jsdelivr.net/lightbox/0.5/images/lightbox-btn-prev.gif',
                    imageBtnNext: '//cdn.jsdelivr.net/lightbox/0.5/images/lightbox-btn-next.gif',
                    imageBlank: '//cdn.jsdelivr.net/lightbox/0.5/images/lightbox-blank.gif'
                });
            }
        );
    }
    makeLightbox(jQuery('#images_list .image a'));
    
    // submit
    jQuery('form').submit(function (event) {                
        var form = jQuery(this);
        var fields = jQuery('input, button', form);
        fields.attr('disabled', 'disabled');
        var loader = form.createLoader({
            text: 'Siunčiama...'
        });
        event.preventDefault();
        //var data = new FormData(form[0]);
        form.serializeFormExt(function (data) {
           jQuery.ajax({
                url: form.attr('action'),  
                type: form.attr('method'),
                xhr: function() {  
                    var myXhr = jQuery.ajaxSettings.xhr();
                    if(myXhr.upload)
                        myXhr.upload.addEventListener('progress', function (e){
                            if(e.lengthComputable)
                                loader[0].updateProgress(100 / e.total * e.loaded);
                        }, false);
                    return myXhr;
                },            
                data: data,
                contentType: false,
                processData: false,
                cache: false
            }).done(function (data) {
                console.log(data); 
                var ret = jQuery.isPlainObject(data)?data:jQuery.parseJSON(data);                    
                if (!ret)
                    alert('Klaida: neaiškūs duomenys atkeliavo iš serverio!');
                if (ret.error)
                    alert(ret.error);
                else if (ret.msg) {
                    if (ret.new_item) {
                        var imglist = jQuery('#images_list');
                        if (jQuery('div', imglist).length < 1) {
                            imglist.html(' ');
                        }
                        var nlitems = jQuery(ret.new_item);
                        imglist.prepend(nlitems);
                        makeLightbox(jQuery('a', nlitems));
                    }
                    alert(ret.msg);
                    form[0].reset();          
                }                       
            }).fail(function () {            
                alert('Deja, nepavyko įkelti ;(')
            }).always(function () {
                fields.removeAttr('disabled');
                loader[0].destroy();            
            }); 
        });        
               
    });
});