(function($){

    $.fn.droparea = function(options) {

       var dnd = {},
           methods = {

           init     : function(e){},
           start    : function(e){},
           complete : function(r){},
           error    : function(r){ alert(r.error); return false; },

           traverse : function(files, area){
               if (typeof files !== 'undefined') {
                   for (var i=0, l=files.length; i<l; i++) {
                       methods.upload(files[i], area);
                   }
               } else {
                   area.html(nosupport);
               }
           },

           upload: function(file, area) {

               // File type control
               if (typeof FileReader === 'undefined' || !(/image/i).test(file.type)) {
                   //area.html(file.type, dnd.noimage);
                   alert('jpeg, png, gif に対応しています');
                   return false;
               }

               // File size control
               if (file.size > (dnd.maxsize * 1024)) {
                   //area.html(file.type,dnd.maxsize);
                   alert('max upload size: ' + dnd.maxsize + 'Kb');
                   return false;
               }

               // Uploading - for Firefox, Google Chrome and Safari
               var xhr = new XMLHttpRequest();

               // File uploaded
               xhr.addEventListener('load', function (e) {

                   var r = jQuery.parseJSON(e.target.responseText);

                   dnd.complete(r);
                   area.find('img').remove();
                   area.data('value', r.filename)
                     .append($('<img>', {'src': r.path + r.filename + '?' + Math.random()}));

               }, false);

               xhr.open('POST', dnd.post, true);

               // Set appropriate headers
               xhr.setRequestHeader('Content-Type', 'multipart/form-data');
               xhr.setRequestHeader('x-file-name', file.fileName);
               xhr.setRequestHeader('x-file-size', file.fileSize);
               xhr.setRequestHeader('x-file-type', file.type);

               // Set request headers
               for (var i in area.data()) {
                   if (typeof area.data(i) !== 'object') {
                       xhr.setRequestHeader('x-param-'+i, area.data(i));
                   }
               }

               xhr.send(file);

           }
       };

       var default_options = {
            'init'         : methods.init,
            'start'        : methods.start,
            'complete'     : methods.complete,
            'error'        : methods.error,
            'instructions' : 'ここにファイルをドロップして下さい',
            'over'         : 'ここはドロップできる領域です',
            'nosupport'    : 'File API に対応していません',
            'noimage'      : 'サポートしていないフォーマットです',
            'uploaded'     : 'アップロード完了',
            'maxsize'      : '50000', //Kb
            'post'         : './upload.php'
        };


        return this.each(function() {

            if(options) {
                dnd = $.extend({}, default_options, options);
            } else {
                dnd = $.extend({}, default_options);
            }

            var instructions = $('<div>').appendTo($(this));

            dnd.init($(this));

            if(!$(this).data('value')) {
                instructions.addClass('instructions').html(dnd.instructions);
            }

            $(this).bind({

                dragleave: function (e) {
                    e.preventDefault();
                    if($(this).data('value')) {
                        instructions.removeClass().empty();
                    } else {
                        instructions.removeClass('over').html(dnd.instructions);
                    }
                },

                dragenter: function (e) {
                    e.preventDefault();
                    instructions.addClass('instructions over').html(dnd.over);
                },

                dragover: function (e) {
                    e.preventDefault();
                }

            });

            this.addEventListener('drop', function (e) {

                e.preventDefault();
                dnd.start($(this));
                methods.traverse(e.dataTransfer.files, $(this));
                instructions.removeClass().empty();

            }, false);

        });
    };
})(jQuery);
