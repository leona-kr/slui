"use strict";_SL.nmspc("pms").form=function(){var a={formId:"#formPms",urlSelect:gCONTEXT_PATH+"management/pms_list.json",urlAdd:gCONTEXT_PATH+"management/pms_insert.do"},b={form:$(a.formId),evtType:$(a.formId+" [name=evt_type]"),appCode:$(a.formId+" [name=app_code]"),serverSeqs:$(a.formId+" [name=server_seqs]"),patchFile:$(a.formId+" [name=patch_file]")},c=function(){d()},d=function(){b.form.find("[name=evt_type]").click(function(){switch($(this).val()){case"1":$("#p_tab1").hide(),$("#p_tab2").show(),$("#app_code").val("");break;case"2":$("#p_tab1").show(),$("#p_tab2").hide(),$("#app_code").val(""),$("#patch_file").val(""),slui.attach.setTransformSelect("#p_tab1");break;case"3":$("#p_tab1").hide(),$("#p_tab2").show(),$("#app_code").val("")}}),b.form.find(".btn-save").on("click",e)},e=function(){var c=1==$(this).data("after-close");if(_SL.validate(b.form)){if(b.form.attr({enctype:"multipart/form-data",encoding:"multipart/form-data",action:a.urlAdd}),f(1)||f(3)){if(b.appCode.val(""),""==b.patchFile.val().trim())return void _alert("패치파일을 선택하세요.");var d=b.patchFile.val();if(!/.*\.(zip)$/.test(d.toLowerCase()))return void _alert("zip 파일만 업로드 할수 있습니다.")}if(f(2)&&""==b.appCode.val().trim())return _alert("프로세스를 선택하세요."),void b.appCode.focus();var e=[];if(!($(".ms-elem-selection").filter(".ms-selected").length>0))return void _alert("패치서버를 선택하세요.");$.each($(".ms-elem-selection").filter(".ms-selected"),function(){e.push($(this).data("ms-value"))}),b.serverSeqs.val(e.join(",")),b.serverSeqs.length>0&&_confirm("저장하시겠습니까?",{onAgree:function(){b.form.ajaxSubmit({dataType:"text",success:function(a,b,d,e){"SUC_COM_0001"==a?g(c):_alert(a)}})}})}},f=function(a){var c=b.evtType.length;for(i=0;i<c;i++)if(b.evtType[i].checked)return b.evtType[i].value==a},g=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:c}}(),$(function(){slapp.pms.form.init();$("#src_server_list").multiSelect({selectableHeader:"<div class='custom-header'><input type='text' id='selectableSearch' autocomplete='off' placeholder='검색' class='form-input form-block'>&nbsp;<button type='button' class='btn-basic btn-mini' id='select-all'>전체선택</button></div>",selectionHeader:"<div class='custom-header'><input type='text' id='selectionSearch' autocomplete='off' placeholder='검색' class='form-input form-block'>&nbsp;<button type='button' class='btn-basic btn-mini' id='deselect-all'>전체선택</button></div>",selectableFooter:"<div class='custom-footer'>Count : <span id='selectableCnt'>0</span></div>",selectionFooter:"<div class='custom-footer'>Count : <span id='selectionCnt'>0</span></div>",afterInit:function(a){var b=this,c=$("#selectableSearch"),d=$("#selectionSearch"),e="#"+b.$container.attr("id")+" .ms-elem-selectable:not(.ms-selected)",f="#"+b.$container.attr("id")+" .ms-elem-selection.ms-selected";b.qs1=c.quicksearch(e).on("keydown",function(a){if(40===a.which)return b.$selectableUl.focus(),!1}),b.qs2=d.quicksearch(f).on("keydown",function(a){if(40==a.which)return b.$selectionUl.focus(),!1})},afterSelect:function(){this.qs1.cache(),this.qs2.cache()},afterDeselect:function(){this.qs1.cache(),this.qs2.cache()}});$("#select-all").click(function(){var a=[];return $(".ms-elem-selectable").filter(":visible").length>0&&$.each($(".ms-elem-selectable").filter(":visible"),function(){a.push($(this).data("ms-value"))}),$("#src_server_list").multiSelect("select",a),!1}),$("#deselect-all").click(function(){var a=[];return $(".ms-elem-selection").filter(":visible").length>0&&$.each($(".ms-elem-selection").filter(":visible"),function(){a.push($(this).data("ms-value"))}),$("#src_server_list").multiSelect("deselect",a),!1})});