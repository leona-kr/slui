"use strict";_SL.nmspc("searchRuleset").importForm=function(){var a={formId:"#formSearchRulesetImport",urlImport:gCONTEXT_PATH+"event/search_ruleset_import.do"},b={form:$(a.formId),importMode:$(a.formId+" [name=import_mode]"),importModeMsg:$(a.formId+" [data-name=import_mode_msg]")},c=function(){d()},d=function(){b.form.find(".btn-import").on("click",e),b.importMode.change(function(){""==$(this).val()?b.importModeMsg.hide():b.importModeMsg.show()})},e=function(){var c=1==$(this).data("after-close");_SL.validate(b.form)&&(b.form.attr({enctype:"multipart/form-data",encoding:"multipart/form-data",action:a.urlImport}),b.form.ajaxSubmit({dataType:"text",success:function(a,b,d,e){"SUC_COM_0001"==a?(_alert("입력 되었습니다."),f(c)):_alert(a)}}))},f=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:c}}(),$(function(){slapp.searchRuleset.importForm.init()});