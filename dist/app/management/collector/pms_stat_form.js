"use strict";_SL.nmspc("pms").statForm=function(){var a={formId:"#formPmsStat",urlSelect:gCONTEXT_PATH+"management/pms_list.json",urlAdd:gCONTEXT_PATH+"management/pms_stat_add.do"},b={form:$(a.formId),appCode:$(a.formId+" [name=app_code]"),serverSeqs:$(a.formId+" [name=server_seqs]"),patchFile:$(a.formId+" [name=patch_file]")},c=function(){d()},d=function(){b.form.find(".btn-save").on("click",e)},e=function(){var c=1==$(this).data("after-close");if(_SL.validate(b.form)){var d=[];if(!($(".ms-elem-selection").filter(".ms-selected").length>0))return void _alert("패치서버를 선택하세요.");$.each($(".ms-elem-selection").filter(".ms-selected"),function(){d.push($(this).data("ms-value"))}),b.serverSeqs.val(d.join(",")),b.serverSeqs.length>0&&_confirm("저장하시겠습니까?",{onAgree:function(){$("body").requestData(a.urlAdd,_SL.serializeMap(b.form),{callback:function(a,b,d){_alert(d,{onAgree:function(){f(c)}})}})}})}},f=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:c}}(),$(function(){slapp.pms.statForm.init();$("#src_server_list").multiSelect({selectableHeader:"<div class='custom-header'><input type='text' id='selectableSearch' autocomplete='off' placeholder='검색' class='form-input form-block'>&nbsp;<button type='button' class='btn-basic btn-mini' id='select-all'>전체선택</button></div>",selectionHeader:"<div class='custom-header'><input type='text' id='selectionSearch' autocomplete='off' placeholder='검색' class='form-input form-block'>&nbsp;<button type='button' class='btn-basic btn-mini' id='deselect-all'>전체선택</button></div>",selectableFooter:"<div class='custom-footer' align='right'>Count : <span id='selectableCnt'>0</span></div>",selectionFooter:"<div class='custom-footer' align='right'>Count : <span id='selectionCnt'>0</span></div>",afterInit:function(a){var b=this,c=$("#selectableSearch"),d=$("#selectionSearch"),e="#"+b.$container.attr("id")+" .ms-elem-selectable:not(.ms-selected)",f="#"+b.$container.attr("id")+" .ms-elem-selection.ms-selected";b.qs1=c.quicksearch(e).on("keydown",function(a){if(40===a.which)return b.$selectableUl.focus(),!1}),b.qs2=d.quicksearch(f).on("keydown",function(a){if(40==a.which)return b.$selectionUl.focus(),!1})},afterSelect:function(){this.qs1.cache(),this.qs2.cache()},afterDeselect:function(){this.qs1.cache(),this.qs2.cache()}});$("#select-all").click(function(){var a=[];return $(".ms-elem-selectable").filter(":visible").length>0&&$.each($(".ms-elem-selectable").filter(":visible"),function(){a.push($(this).data("ms-value"))}),$("#src_server_list").multiSelect("select",a),!1}),$("#deselect-all").click(function(){var a=[];return $(".ms-elem-selection").filter(":visible").length>0&&$.each($(".ms-elem-selection").filter(":visible"),function(){a.push($(this).data("ms-value"))}),$("#src_server_list").multiSelect("deselect",a),!1})});