"use strict";_SL.nmspc("comcode").typeform=function(){var a={formId:"#formComcodeType",urlSelect:gCONTEXT_PATH+"sysdata/comcode_type_form.json",urlExist:gCONTEXT_PATH+"sysdata/comcode_type_exist.json",urlDelete:gCONTEXT_PATH+"sysdata/comcode_type_delete.do",add:{action:gCONTEXT_PATH+"sysdata/comcode_type_insert.do",message:"등록 하시겠습니까?"},update:{action:gCONTEXT_PATH+"sysdata/comcode_type_update.do",message:"수정 하시겠습니까?"}},b={form:$(a.formId),codeId:$(a.formId+" [name=code_id]"),codeName:$(a.formId+" [name=code_name]")},c={isNew:""==b.codeId.val(),mode:""==b.codeId.val()?a.add:a.update,comCodeType:{}},d=function(){f(),c.isNew?b.form.find(".btn-delete").hide():(b.form.find("#spnUsr").hide(),b.codeId.addClass("form-text").attr("readonly","readonly")),c.isNew||g()},e=function(){return c.comCodeType},f=function(){b.form.find(".btn-save").on("click",h),b.form.find(".btn-delete").on("click",i)},g=function(){var c=b.codeId.val(),d={code_id:c},e=function(a){_SL.setDataToForm(a,b.form,{})};$("body").requestData(a.urlSelect,d,{callback:e})},h=function(){if(_SL.validate(b.form)){var d=b.codeId.val(),e=b.codeName.val(),f=(1==$(this).data("after-close"),function(){$("body").requestData(c.mode.action,_SL.serializeMap(b.form),{callback:function(a,b,f){c.comCodeType.code_id="USR"+d,c.comCodeType.code_name=e,_alert(f,{onAgree:function(){j(!0)}})}})});c.isNew?$("body").requestData(a.urlExist,{code_id:d},{callback:function(a){"OK"==a?f():"EXIST"==a?_alert("사용중인 코드종류ID가 있어 저장 할 수 없습니다."):_alert("저장 중 에러가 발생했습니다.<br>다시 실행하세요.")}}):f()}},i=function(){var c=b.codeId.val(),d=b.form.find("[name=code_type]").val(),e=(1==$(this).data("after-close"),function(){_confirm("삭제하시겠습니까?",{onAgree:function(){$("body").requestData(a.urlDelete,{code_id:c,code_type:d},{callback:function(a,b,c){_alert(c,{onAgree:function(){j(!0)}})}})}})});return"Y"==b.form.find("[name=required]").val()?void _alert("필수 코드이므로 삭제할 수 없습니다."):b.form.find("[name=code_count]").val()>0?void _alert("해당 코드종류에 등록된 코드가 있어 삭제 할 수 없습니다."):void e()},j=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:d,getCodeType:e}}(),$(function(){slapp.comcode.typeform.init()});