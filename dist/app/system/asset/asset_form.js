"use strict";_SL.nmspc("asset").form=function(){var a={formId:"#formAsset",urlEqpJson:gCONTEXT_PATH+"system/eqp_codes.json",urlSelect:gCONTEXT_PATH+"system/asset.json",urlIpList:gCONTEXT_PATH+"system/asset_list.json",urlLoadForm:gCONTEXT_PATH+"management/equip_popup_list.html",urlComCodeForm:gCONTEXT_PATH+"sysdata/comcode_form.html",urlExistIp:gCONTEXT_PATH+"system/asset_check_ip.json",urlDelete:gCONTEXT_PATH+"system/asset_delete.do",add:{action:gCONTEXT_PATH+"system/asset_add.do",message:"등록 하시겠습니까?"},update:{action:gCONTEXT_PATH+"system/asset_update.do",message:"수정 하시겠습니까?"}},b={form:$(a.formId),listTable:$(a.formId+" #tbl_asset_ip"),pAssetId:$(a.formId+" [name=p_asset_id]"),assetId:$(a.formId+" [name=asset_id]"),groupCodeType:$(a.formId+" .btn-register-group").data("value"),typeCodeType:$(a.formId+" .btn-register-type").data("value")},c={isNew:""==b.pAssetId.val(),mode:""==b.pAssetId.val()?a.add:a.update},d=function(){e(),b.form.find("[name=eqp_type_cd]").chosen({search_contains:!0,width:"100%"}),c.isNew?b.form.find(".btn-delete").hide():b.assetId.addClass("form-text").prop("readonly",!0),c.isNew||f()},e=function(){b.form.find(".btn-save").on("click",l),b.form.find(".btn-delete").on("click",o),b.form.find(".btn-load").exModalPopup(a.urlLoadForm,{width:800,height:500,onClose:function(){q()}}),b.form.find(".btn-register-group").exModalPopup(a.urlComCodeForm+"?code_type="+b.groupCodeType,{width:550,height:455,onClose:function(){r(b.form.find("[name=group_cd]"))}}),b.form.find(".btn-register-type").exModalPopup(a.urlComCodeForm+"?code_type="+b.typeCodeType,{width:550,height:455,onClose:function(){s(b.form.find("[name=eqp_type_cd]"))}}),b.form.find(".config_tab li").click(function(){g($(this).index())}),b.form.find(".btn-plus").on("click",function(a){i()}),b.form.on("click",".btn-minus",function(a){j($(this))}),b.form.find("[name=ip_type]").change(function(){h($(this).val())})},f=function(){var c=b.assetId.val(),d={asset_id:c},e=function(c){_SL.setDataToForm(c,b.form,{eqp_type_cd:{converter:function(a,c){b.form.find("[name=eqp_type_cd]").val(a),b.form.find("[name=eqp_type_cd]").trigger("chosen:updated")}}}),h(b.form.find("[name=ip_type]:checked").val()),slui.attach.setTransformSelect(a.formId)};$("body").requestData(a.urlSelect,d,{callback:e})},g=function(a){switch(b.form.find(".config_tab li").removeClass("tab-item-active"),b.form.find(".config_tab li").eq(a).addClass("tab-item-active"),a){case 0:b.form.find("#default").css("display","block"),b.form.find("#ipInfo").css("display","none");break;case 1:b.form.find("#default").css("display","none"),b.form.find("#ipInfo").css("display","block")}},h=function(a){b.listTable.find("tr").each(function(c,d){c>0&&(b.listTable.find("#tr_ip"+c).find("input").removeAttr("data-valid"),b.listTable.find("#tr_ip"+c).find("input").attr("data-valid","자산 IP,required,ipv"+a))})},i=function(){var a=b.form.find("[name=ip_type]:checked").val(),c=b.listTable.find("tr").size(),d=$("<tr id='tr_ip"+c+"' class='align-center'>"),e=$("<td><span data-name='seq_no'>"+c+"</span></td>"),f=$("<td />"),g=$("<input type='text' name='sip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv4'><span> ~ </span>"),h=$("<input type='text' name='eip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv4'>"),i=$("<input type='text' name='sip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv6'><span> ~ </span>"),j=$("<input type='text' name='eip' class='form-input' style='width: 250px;' value='' data-valid='자산 IP,required,ipv6'>"),k=$("<td><button type='button' class='btn-basic btn-mini btn-minus'><i class='icon-minus'></i></button></td>");4==a?f.append(g,h):f.append(i,j),d.append(e,f,k),d.appendTo(b.listTable)},j=function(a){var c=b.listTable;if(2!=c.find("tr").size()){a.parent().parent().remove();for(var d=c.find("tr").size(),e=0;e<d;e++)c.find("[data-name=seq_no]").eq(e).text(e+1),c.find("tr").eq(e).attr("id","tr_ip"+e)}},k=function(){if(!_SL.validate(b.form)){switch(_SL.validElement.name){case"asset_nm":case"group_cd":case"eqp_type_cd":case"weight":case"weak_score":g(0),_SL.validElement.focus();break;case"sip":case"eip":g(1),_SL.validElement.focus()}return!1}return!0},l=function(){k()&&m()},m=function(){var d,e,f=b.assetId.val(),g=b.form.find("[name=ip_type]:checked").val(),h=b.listTable,i=$.map(h.find("[name=sip]"),function(a,b){return $.trim($(a).val())}),j=$.map(h.find("[name=eip]"),function(a,b){return $.trim($(a).val())}),k=i.slice(),l=j.slice(),m=i.length,o=!1,p=!1,q=[],r=[],s=c.isNew?"add":"upd";for(var t in i)i[t]=_SL.ip.toNormalize(i[t]),j[t]=_SL.ip.toNormalize(j[t]),q.push(i[t]),r.push(j[t]);for(var t=0;t<m;t++){var u;if(u=q[t]==r[t]?0:q[t]>r[t]?1:q[t]<r[t]?-1:"",0==u)e="single",0==t&&(d=e),o=!0;else{if(1==u)return _alert("시작 IP가 종료 IP보다 큽니다."),b.listTable.find("#tr_ip"+(t+1)).find("[name=sip]").focus(),void(o=!1);if(u!=-1)return _alert("에러가 발생하였습니다."),void(o=!1);e="multi",0==t&&(d=e),o=!0}if(d!=e)return _alert("단일IP 혹은 범위IP로만 일괄 입력가능합니다."),void(o=!1);if(d==e?o=!0:(_alert("단일,범위체크 에러발생!!!"),o=!1),"multi"==e&&m>1)for(var v=t+1;v<q.length;v++){var w=q[t],x=r[t],y=q[v],z=r[v];if(w>=y&&w<=z)return _alert("중복된 IP가 있습니다.("+w+")"),void(o=!1);if(x>=y&&x<=z)return _alert("중복된 IP가 있습니다.("+x+")"),void(o=!1);o=!0}}var A={asset_id:f,page_type:s,ip_range_type:e,ip_type:g,sips:i,eips:j};$("body").requestData(a.urlExistIp,A,{callback:function(a){return"EXIST_ID"!=a||c.isNew?"EXIST_IP"==a?(_alert("이미 자산에 등록된 IP입니다."),void(p=!1)):"EMPTY_IP"!=a&&"OK"!=a?void _alert("처리 중 에러가 발생하였습니다. 관리자에게 문의하세요."):(p=!0,void(o&&p&&n(k,l))):(_alert("사용중인 자산ID가 있습니다."),void(p=!1))}})},n=function(a,d){var e=1==b.form.find(".btn-save").data("after-close"),f=_SL.serializeMap(b.form);$.extend(f,{sips:a,eips:d}),$("body").requestData(c.mode.action,f,{callback:function(a,b,c){_alert(c,{onAgree:function(){p(e)}})}})},o=function(){var c=b.pAssetId.val(),d=1==$(this).data("after-close");_confirm("삭제하시겠습니까?",{onAgree:function(){$("body").requestData(a.urlDelete,{asset_id:c},{callback:function(a,b,c){_alert(c,{onAgree:function(){p(d)}})}})}})},p=function(a){a&&b.form.find("[data-layer-close=true]").click()},q=function(){var c=slapp.parser.eqpPopupList.getParam();b.listTable.find("tr").each(function(a,b){a>1&&$(this).remove()}),b.form.find("[name=ip_type]").each(function(){4==$(this).val()?$(this).prop("checked",!0):$(this).prop("checked",!1)}),h(4),b.form.find("[name=asset_nm]").val(c.eqp_nm),b.form.find("[name=sip]").val(c.eqp_ip),b.form.find("[name=eip]").val(c.eqp_ip),b.form.find("[name=group_cd]").val(c.group_cd),b.form.find("[name=eqp_type_cd]").val(c.eqp_type_cd),b.form.find("[name=eqp_type_cd]").trigger("chosen:updated"),slui.attach.setTransformSelect(a.formId)},r=function(b){var c=slapp.comcode.form.getCode();b.append('<option value="'+c.code_id+'">'+c.code_name+"</option>"),b.val(c.code_id),slui.attach.setTransformSelect(a.formId)},s=function(a){var b=slapp.comcode.form.getCode();a.append('<option value="'+b.code_id+'">'+b.code_name+"</option>"),a.val(b.code_id),a.trigger("chosen:updated")};return{init:d}}(),$(function(){slapp.asset.form.init()});