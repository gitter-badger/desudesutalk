var upload_handler = (new Date()).getTime() * 10000;

var TinyBoardFields = ["name","email","subject","post","spoiler","body","file","file_url","password","thread","board", "recaptcha_challenge_field", "recaptcha_response_field", "user_flag", "huehuehue", "derpibooruAPIKey", "embed"];

ParseUrl = function(url){
    "use strict";
    var m = (url || document.location.href).match( /https?:\/\/([^\/]+)\/([^\/]+)\/((\d+)|res\/(\d+)|\w+)(\.x?html)?(#i?(\d+))?/);
    return m?{host:m[1], board:m[2], page:m[4], thread:m[5], pointer:m[8]}:{};
};
var Hanabira={URL:ParseUrl()};

var sendBoardForm = function(file) {
    "use strict";
    replyForm.find("#do_encode").val('..Working...').attr("disabled", "disabled");

    if(location.hostname == '127.0.0.1'){
        var ta = $('textarea.reply-body, textarea#reply');

        if(ta.length === 0){
            alert('Can\'t find reply form.');
            replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
            return;
        }

        var out = '\n[img=' + arrayBufferDataUri(file) + ']';
        if(out.length < 64518){
            ta.first().val(ta.first().val() + out);
            replyForm.remove();
            replyForm = null;
            container_image = null;
            container_data = null;
            return;
        }else{
            alert('File is too big!');
            replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
            return;
        }
    }

    if(["dmirrgetyojz735v.onion", "2-chru.net", "mirror.2-chru.net", "bypass.2-chru.net", "2chru.cafe", "2-chru.cafe"].indexOf(document.location.host.toLowerCase()) != -1){
        $('body').append('<iframe class="ninja" id="csstest" src="../csstest.foo"></iframe>');
        $('iframe.ninja#csstest').on('load', function(e){
            $(e.target).remove();
            _sendBoardForm(file, []);
        });
        return;
    }

    if(["syn-ch.com", "syn-ch.org", "syn-ch.ru", "syn-ch.com.ua"].indexOf(document.location.host.toLowerCase()) != -1 && $('#de-pform form').length === 0){
        _sendBoardSync(file);
        return;
    }

    if (document.location.host === "ech.su") {
        _sendBoardEch(file);
        return;
    }

    if ($('form[name*="postcontrols"]').length !==0) {
        $.ajax({
            url: location.href,
            type: 'GET',
            processData: false,
            contentType: false,
            success: function(data, textStatus, jqXHR) {
                var doc = document.implementation.createHTMLDocument('');
                doc.documentElement.innerHTML = data;

                var l = $("form[action*=post]", doc).serializeArray();
                l = l.filter(function(a){
                    if(TinyBoardFields.indexOf(a.name) > -1) return false;
                    return true;
                });

                l.push({"name": "post", "value": $('form[name=post] input[type=submit]').val()});

                //console.log("fresh post form: ", l);

                _sendBoardForm(file, l);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('failed to get fresh form. Try again!');
                replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
                upload_handler = (new Date()).getTime() * 10000;
            }
        });
    }else{
        _sendBoardForm(file, []);
    }
};

var _sendBoardForm = function(file, formAddon) {
    "use strict";

    var formData, fileInputName, formAction,
        fd = new FormData();

    if($('a#yukiForceUpdate').length !== 0 && $('form#yukipostform').length === 0){
        $('a.reply_.icon').last().click();
        $('form#yukipostform textarea').val('');
    }

    $('form noscript').remove();

    if($('#de-pform form').length !== 0){
        formData = $('#de-pform form').serializeArray();
        fileInputName = $("#de-pform form input[type=file]")[0].name;
        formAction = $("#de-pform form")[0].action; //+ "?X-Progress-ID=" + upload_handler,
    }else if(($('form#yukipostform').length !== 0)){
        formData = $('form#yukipostform').serializeArray();
        fileInputName = 'file_1';
        fd.append('file_1_rating', 'SFW');
        formAction = '/' + Hanabira.URL.board + '/post/new.xhtml' + "?X-Progress-ID=" + upload_handler;
    }else if(($('form[name=post]').length !== 0)){
        formData = $('form[name=post]').first().serializeArray();
        fileInputName = $("form[name=post] input[type=file]").length ? $("form[name=post] input[type=file]")[0].name : 'file';
        formAction = $("form[name=post]")[0].action;
    }else if(($('form#qr-postform').length !== 0)){
        formData = $('form#qr-postform').first().serializeArray();
        fileInputName = 'image1';
        formAction = $("form#qr-postform")[0].action;
    }else if(($('form#postform').length !== 0)){
        formData = $('form#postform').first().serializeArray();
        fileInputName = 'image1';
        formAction = $("form#postform")[0].action;
    }

    if(is4chan){
        var forForm = $('form[name=post]');
        if($('form[name=qrPost], div#qr form').length !==0){
            forForm = $('form[name=qrPost], div#qr form');
        }

        fileInputName = forForm.find("input[type=file]")[0].name;
        formAction = forForm[0].action;

        formData = forForm.serializeArray();

        if($('div#qr form').length !==0){
            formData.push({"name": "recaptcha_response_field", "value": $('div#qr .captcha-input.field').val()});
            formData.push({"name": "recaptcha_challenge_field", "value": $('div#qr .captcha-img img').attr('alt')});
            formData.push({"name": "com", "value": $('div#qr textarea').val()});

            formData.push({"name": "MAX_FILE_SIZE", "value": $('form[name=post] input[name=MAX_FILE_SIZE]').val()});
            formData.push({"name": "mode", "value": $('form[name=post] input[name=mode]').val()});
            formData.push({"name": "pwd", "value": $('form[name=post] input[name=pwd]').val()});
            formData.push({"name": "resto", "value": $('form[name=post] input[name=resto]').val()});

            formData.push({"name": "recaptcha_response_field", "value": $('div#qr .captcha-input.field').val()});
            formAction = $('form[name=post]')[0].action;
            fileInputName = $("form[name=post] input[type=file]")[0].name;
        }

//        console.log(formData);
    }

    if(formAddon.length > 0){
        formData = formData.filter(function(a){
            if(TinyBoardFields.indexOf(a.name) > -1) return true;
            return false;
        });
        formData.push.apply(formData, formAddon);
    }

    for (var i = 0; i < formData.length; i++) {
        if (formData[i].name && formData[i].name != fileInputName && formData[i].name !== "") {
            fd.append(formData[i].name, formData[i].value);
        }
    }

    var fnme = Math.floor((new Date()).getTime() / 10 - Math.random() * 100000000) + '.jpg';

    fd.append(fileInputName, uint8toBlob(file, 'image/jpeg'), fnme);

    $.ajax({
        url: formAction,
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
            var doc = document.implementation.createHTMLDocument(''),
                p;
            doc.documentElement.innerHTML = data;

            if (jqXHR.status === 200 && jqXHR.readyState === 4) {
                p = $('form[action*="delete"]', doc).length +
                    $('form[action*="delete"]', doc).length +
                    $('#posts_form, #delform', doc).length +
                    $('form:not([enctype])', doc).length +
                    $('form[name="postcontrols"]', doc).length +
                    $('form[name="postcontrols"]', doc).length +
                    $('#delform, form[name="delform"]', doc).length;
                    if(isDobro && data.match(/parent\.location\.replace/)){
                        p = 1;
                    }

                    if(is4chan && data.indexOf('<title>Post successful!</title>') != -1){
                        p = 1;
                    }
            } else {
                p = 1;
            }

            if(typeof data == "string" && data.match(/<h1>Ошибка!<\/h1>/)) p = 0;

            if (p !== 0 || (data.Status && data.Status == "OK")) {
                $('#de-pform textarea').val('');
                $('form#yukipostform textarea').val('');
                $('form[name=post] textarea').val('');
                $('#de-pform img[src*=captcha]').click();
                $('#hidbord_replyform #c_file').val('');
                $('.de-thread-updater .de-abtn').click();
                $('#de-thrupdbtn').click();
                $('a#yukiForceUpdate').click();
                $('a#update_thread').click();
                $('#recaptcha_response_field').val('');
                $('#recaptcha_challenge_image').click();
                $('input[name=recaptcha_response_field]').val('');
                $('.recaptcha_image').click();
                $('#ABU-getnewposts a').first().click();
                $('.captcha-reload-button').click();
                $('#qr-shampoo, #shampoo, #qr-captcha-value').val('');
                $('#imgcaptcha').click();
                $('#recaptcha_reload').click();
                $('#captchainput').val('');
                $('a#updateThread').click();
                if(is4chan){
                    setTimeout(function() {$('a[data-cmd=update]').first().click(); $('.thread-refresh-shortcut.fa.fa-refresh').first().click();}, 2500);
                    $('#qrCapField').val('');
                    $('#qrCaptcha').click();
                    $('textarea[name=com]').val('');
                    $('div#qr .captcha-input.field').val('');
                    $('div#qr .captcha-img img').click();
                    $('div#qr textarea').val('');
                }
                replyForm.remove();
                replyForm = null;
                container_image = null;
                container_data = null;

            } else {
                alert('Can\'t post. Wrong capch? Fucked up imageboard software?.');
                replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
            }
            upload_handler = (new Date()).getTime() * 10000;
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error while posting. Something in network or so.\n[' + jqXHR.status + ' ' + jqXHR.statusText + ']');
            replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
            upload_handler = (new Date()).getTime() * 10000;
        }
    });
};


var _sendBoardSync = function(file) {
 "use strict";

    var formData, fileInputName, formAction,
        fd = new FormData();

    formData = $('form[name=post]').first().serializeArray();
    formData.push({"name": "json_response", "value": 1});
    formData.push({"name": "post", "value": $('form[name=post] input[type=submit]').val()});
    fileInputName = 'file';
    formAction = $("form[name=post]")[0].action;

    for (var i = 0; i < formData.length; i++) {
        if (formData[i].name && formData[i].name != fileInputName && formData[i].name !== "") {
            fd.append(formData[i].name, formData[i].value);
        }
    }

    var fnme = Math.floor((new Date()).getTime() / 10 - Math.random() * 100000000) + '.jpg';

    fd.append(fileInputName, uint8toBlob(file, 'image/jpeg'), fnme);

    $.ajax({
        url: formAction,
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
            var resp = JSON.parse(data);
            if (resp.redirect) {
                $('a#updateThread').click();
                $('form[name=post] textarea').val('');
                $('form[name=post] input[name=embed]').val('');
                replyForm.remove();
                replyForm = null;
                container_image = null;
                container_data = null;
            } else {
                alert(resp.error);
                replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error while posting. Something in network or so.\n[' + jqXHR.status + ' ' + jqXHR.statusText + ']');
            replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
        }
    });
};

var _sendBoardEch = function (file) {
    "use strict";

    var form, formData, fileInputName, formAction,
        fd = new FormData();

    form = $('form[id=postform]').first();
    formData = form.serializeArray();
    fileInputName = 'image';
    formAction = form.action;

    for (var i = 0; i < formData.length; i++) {
        if (formData[i].name && formData[i].name != fileInputName && formData[i].name !== "") {
            fd.append(formData[i].name, formData[i].value);
        }
    }

    var fnme = Math.floor((new Date()).getTime() / 10 - Math.random() * 100000000) + '.jpg';

    fd.append(fileInputName, uint8toBlob(file, 'image/jpeg'), fnme);

    $.ajax({
        url: formAction,
        type: 'POST',
        data: fd,
        processData: false,
        contentType: false,
        success: function(data, textStatus, jqXHR) {
            replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
            replyForm.remove();
            replyForm = null;
            container_image = null;
            container_data = null;
            $('#updt-link').click();
            $('#message').val('');
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error while posting. Something in network or so.\n[' + jqXHR.status + ' ' + jqXHR.statusText + ']');
            replyForm.find("#do_encode").val('crypt and send').removeAttr("disabled");
        }
    });
};
