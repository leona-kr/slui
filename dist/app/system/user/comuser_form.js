"use strict";_SL.nmspc("user").form=function(){var a={formId:"#formComuser",urlSelect:gCONTEXT_PATH+"system/comuser.json",urlExist:gCONTEXT_PATH+"system/comuser_exist.json",urlDelete:gCONTEXT_PATH+"system/comuser_delete.do",add:{action:gCONTEXT_PATH+"system/comuser_insert.do",message:"등록 하시겠습니까?",passwdValid:"비밀번호,required,password"},update:{action:gCONTEXT_PATH+"system/comuser_update.do",message:"수정 하시겠습니까?",passwdValid:"비밀번호,password"}},b={form:$(a.formId),userId:$(a.formId+" [name=user_id]")},c={isNew:""==b.userId.val(),mode:""==b.userId.val()?a.add:a.update},d={password:function(a){if(""!=$(a).val()){var c=b.userId.val(),d=$(a).val(),e=0;/[가-힣]/.test(d)?(this.message="비밀번호는 한글을 입력할 수 없습니다.",this.bValid=!1):d.length<9||d.length>15?(this.message="비밀번호는 9자 ~ 15자 이내로 입력하세요.",this.bValid=!1):d==c?(this.message="아이디와 비밀번호는 같을 수 없습니다.",this.bValid=!1):(/[A-Z]/.test(d)&&e++,/[a-z]/.test(d)&&e++,/[\d]/.test(d)&&e++,/[^A-Za-z0-9]/.test(d)&&e++,e<3&&(this.message="영문 대문자/영문 소문자/숫자/특수문자 중 3가지 이상의 문자 조합으로 입력하세요.",this.bValid=!1))}}},e=function(){f(),c.isNew?b.form.find(".btn-delete").hide():(b.userId.addClass("form-text").attr("readonly","readonly"),b.userId.val()==gSessionUserId&&b.form.find(".btn-delete").hide()),b.form.find("[name=passwd]").attr("data-valid",c.mode.passwdValid),"Y"!=gUserIpRestrictYn&&(""==b.form.find("[name=auth_ip1]").val()&&""==b.form.find("[name=auth_ip2]").val()?b.form.find("[name=auth_ip_opt][value=0]").trigger("click"):b.form.find("[name=auth_ip_opt][value=1]").trigger("click")),$.extend(!0,_SL.validate.Validator,d),c.isNew||g()},f=function(){b.form.find(".btn-save").on("click",h),b.form.find(".btn-delete").on("click",i),b.form.find("#cust_add").click(function(){var a=b.form.find("[name=user_cust_list] option:selected").val(),c=b.form.find("[name=user_cust_list] option:selected").text();return""==a?void _alert("기관을 선택하세요."):b.form.find("[name=cust_list] option").is(function(){return this.value==a})?void _alert("동일한 기관이 존재합니다."):void b.form.find("[name=cust_list]").append($("<option>").val(a).text(c))}),b.form.find("#cust_del").click(function(){b.form.find("[name=cust_list] :selected").remove()}),"Y"!=gUserIpRestrictYn&&b.form.find("[name=auth_ip_opt]").click(function(){$(this).val();"0"==$(this).val()?b.form.find("[data-name=auth_ip_wrapper]").hide():b.form.find("[data-name=auth_ip_wrapper]").show()})},g=function(){var c=b.userId.val(),d={user_id:c},e=function(c){if(c.passwd="",c.auth_ip&&""!=c.auth_ip)for(var d=c.auth_ip.split(),e=0,f=d.length;e<f;e++)c["auth_ip"+(e+1)]=d[e];_SL.setDataToForm(c,b.form,{cust_list:{converter:function(a,b){_SL.appendToSelect(a,b,"cust_id","cust_nm")}},auth_ip:{field:"auth_ip1",converter:function(a,c){""!=a&&b.form.find("[name=auth_ip_opt][value=1]").trigger("click")}}}),slui.attach.setTransformSelect(a.formId)};$("body").requestData(a.urlSelect,d,{callback:e})},h=function(){var d=(1==$(this).data("after-close"),b.form.find("[name=passwd]").val()),e=b.form.find("[name=passwd2]").val();if(d!=e)return""!=e&&""==d?(_alert("비밀번호를 입력하세요."),void b.form.find("[name=passwd]").focus()):""!=d&&""==e?(_alert("비밀번호 확인을 입력하세요."),void b.form.find("[name=passwd2]").focus()):(_alert("비밀번호가 일치하지 않습니다."),void b.form.find("[name=passwd2]").val("").focus());if(b.form.find("[name=auth_ip_opt][value=0]").is(":checked")&&(b.form.find("[name=auth_ip1]").val(""),b.form.find("[name=auth_ip2]").val("")),_SL.validate()){if(!b.form.find("[name=auth_ip_opt][value=0]").is(":checked")&&!b.form.find("[name=auth_ip1]").val()&&!b.form.find("[name=auth_ip2]").val())return _alert("접근가능 IP를 입력하세요."),void b.form.find("[name=auth_ip1]").focus();var f=function(){$("body").requestData(c.mode.action,_SL.serializeMap(b.form),{displayLoader:!0,callback:function(a,b,c){_alert(c,{onAgree:function(){j(!0)}})}})};c.isNew?$("body").requestData(a.urlExist,{user_id:b.userId.val()},{callback:function(a){1==a?f():_alert("사용중인 아이디가 있어 저장 할 수 없습니다.")}}):_confirm(c.mode.message,{onAgree:function(){f()}})}},i=function(){var c=1==$(this).data("after-close");_confirm("삭제하시겠습니까?",{onAgree:function(){var d=b.userId.val();$("body").requestData(a.urlDelete,{user_id:d},{callback:function(a,b,d){_alert(d,{onAgree:function(){j(c)}})}})}})},j=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:e}}(),$(function(){slapp.user.form.init()});