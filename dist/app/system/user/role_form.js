"use strict";_SL.nmspc("role").form=function(){var a={formId:"#formRole",urlSave:gCONTEXT_PATH+"system/role_update.do",urlExist:gCONTEXT_PATH+"system/role_nm_exist.json"},b={form:$(a.formId),roleNm:$(a.formId+" [name=role_nm]")},c={role:{},bChange:!1},d=function(){e(),b.roleNm.focus()},e=function(){b.form.find(".btn-save").on("click",h)},f=function(a,d){c.role.roleId=a,c.role.roleNm=d,b.roleNm.val(d)},g=function(){return c.role},h=function(){if(_SL.validate(b.form)){var d=1==$(this).data("after-close"),e={role_id:c.role.roleId,role_nm:b.roleNm.val()},f=function(){$("body").requestData(a.urlSave,e,{callback:function(a,b,f){c.role.role_nm=e.role_nm,_alert(f,{onAgree:function(){i(d)}})}})};$("body").requestData(a.urlExist,e,{callback:function(a,b,c){a?f():_alert("중복된 이름이 존재합니다.")}})}},i=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:d,getRole:g,setRole:f}}(),$(function(){slapp.role.form.init()});