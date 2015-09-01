(function( $ ) {
 
    $.fn.serializeFormExt = function(callback) {                
        
        var form = $(this);
        
        var ret = new FormData();
        var loading = 0;
        var xcallback = function () {
            if (loading > 0)
                setTimeout(xcallback, 250);
            else
                callback(ret);
        };
        var reader = {
            file: function (fileObj) {
                fileObj = $(fileObj);
                var reader = new FileReader();
                var file = fileObj[0].files[0];
                loading++;
                reader.onload = function (e) {                    
                     ret.append(fileObj.attr('name'), e.target.result);
                     loading--;
                };
                reader.readAsDataURL(file);
            },
            text: function (textObj) {
                textObj = $(textObj);
                ret.append(textObj.attr('name'), textObj.val());
            }
        };
        $('input', form).each(function () {
            var obj = $(this);
            var type = obj.attr('type');            
            if (!type)
                return;
            type = type.toLowerCase();            
            if (!reader[type])
                return;
            reader[type](obj);
        });
        xcallback();        
    };
 
}( jQuery ));