(function( $ ) {
 
    $.fn.createLoader = function(options) {
        
        var cfg = $.extend({
            min: 0,
            max: 100,
            value: 0,
            text: "Loading...",     
        }, options);
        
        var ret = [];
        
        this.each(function () {
            var obj = $(this);            
            var backgroundDiv = $('<div></div>');
            var pos = obj.offset();
            var size = {
                width: parseInt(obj.width()) + parseInt(obj.css('border-left-width')) + parseInt(obj.css('border-right-width')) +  parseInt(obj.css('marginLeft')) + parseInt(obj.css('marginRight')) + parseInt(obj.css('paddingLeft')) + parseInt(obj.css('paddingRight')),
                height: parseInt(obj.height()) + parseInt(obj.css('border-bottom-width')) + parseInt(obj.css('border-top-width')) + parseInt(obj.css('marginTop')) + parseInt(obj.css('marginBottom')) + parseInt(obj.css('paddingTop')) + parseInt(obj.css('paddingBottom'))
            };
            backgroundDiv.css({
                'background-color': 'rgba(0,0,0,0.6)',
                'text-align': 'center',
                'display':'block', 
                'line-height': size.height  + 'px',
                'vertical-align':'middle',
                'position': 'absolute',
                'width': size.width + 'px',
                'height': size.height + 'px',
                'left': pos.left,
                'top': pos.top,
                'color': 'white'
                
            });
            var progressBar = $('<progress></progress>');
            progressBar.attr({
                min: cfg.min,
                max: cfg.max,
                value: cfg.value
            });
            var text = $('<span style="margin-right: 1em;">'+cfg.text+'</span>');
            backgroundDiv.append(text);
            backgroundDiv.append(progressBar);            
            
             backgroundDiv.updateProgress = function (value) {
                    return progressBar.attr('value', value);
               };
             backgroundDiv.updateLabel = function (msg) {
                    text.html(msg);
               }
             backgroundDiv.destroy = function() {
                 backgroundDiv.remove();
             };
            
            $('body').append(backgroundDiv);
            
            ret.push(backgroundDiv);            
        });
        
        ret = jQuery(ret);
        
        console.log(ret);
        
        return ret;
    };
 
}( jQuery ));