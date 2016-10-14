"use strict";_SL.nmspc("epsRulesetlist").list=function(){var a={formId:"#searchEpsRulesetlist",gridId:"#gridEpsRulesetlist",urlList:gCONTEXT_PATH+"event2/eps_ruleset_list.json",urlForm:gCONTEXT_PATH+"event2/eps_ruleset_form.html",urlOnOff:gCONTEXT_PATH+"event2/eps_ruleset_onoff.json",urlImportForm:gCONTEXT_PATH+"event2/eps_ruleset_import_form.html",urlDownload:gCONTEXT_PATH+"event2/eps_ruleset_export.do",urlImport:gCONTEXT_PATH+"event2/eps_ruleset_import.form.html"},b={grid:$(a.gridId),form:$(a.formId)},c=function(){d(b.grid),e()},d=function(c){var d={datatype:"json",datafields:[{name:"ruleset_id",type:"string"},{name:"use_yn",type:"string"},{name:"event_nm",type:"string"},{name:"event_cate_nm",type:"string"},{name:"tc_nm",type:"string"},{name:"times",type:"string"},{name:"time_nm",type:"string"},{name:"log_type_nm",type:"string"},{name:"limit_count",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(d.totalrecords=a.totalRows)},cache:!1,url:a.urlList},e=new $.jqx.dataAdapter(d,{beforeLoadComplete:function(a){for(var b in a)a[b].reg_dt=_SL.formatDate(a[b].reg_dt,"yyyyMMddHHmm","yyyy-MM-dd HH:mm");return a},formatData:function(a){var c,d={},e=b.form.serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(a,d),a},loadError:function(a,b,c){alert(c)}});c.jqxGrid({source:e,sortable:!0,width:"100%",virtualmode:!0,enablehover:!1,rendergridrows:function(a){return a.data},columns:[{text:"상태",datafield:"use_yn",width:60,cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){var g="on",h="1";return"N"==c&&(g="off",h="0"),$(d).html('<button type="button" data-ruleset_id="'+f.ruleset_id+'" class="onoff-icon btn-switch-'+g+'" value="'+h+'" data-switch-toggle="true"><span class="text-on">ON</span><span class="text-off">OFF</span></button>')[0].outerHTML}},{text:"번호",columntype:"number",width:50,cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"이벤트명",datafield:"event_nm",cellsrenderer:function(a,b,c,d,e,f){return $(d).html('<button type="button" class="btn-link">'+c+"</button>")[0].outerHTML}},{text:"이벤트 분류",datafield:"event_cate_nm",width:200},{text:"구분",datafield:"tc_nm",cellsalign:"center",width:120},{text:"체크 주기",datafield:"time_nm",width:100,cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).html(f.times+c)[0].outerHTML}},{text:"로그 종류",datafield:"log_type_nm",width:120,cellsalign:"center"},{text:"기준 건수",datafield:"limit_count",width:100,cellsalign:"center"}]}),c.on("cellclick",function(b){if("event_nm"===b.args.datafield){var c=b.args.row.bounddata.ruleset_id;i(a.urlForm+"?ruleset_id="+c)}})},e=function(){var c=b.grid.parent().siblings(".grid-bottom").find(".btn-add"),d=b.grid.parent().siblings(".grid-bottom").find(".btn-import"),e=b.grid.parent().siblings(".grid-bottom").find(".btn-apply"),k=b.form.find(".btn-download");g(),b.form.find("[name=s_time_type]").on("change",function(){g()}),b.form.find(".form-submit").on("click",function(){h()}),c.off().on("click",function(){i(a.urlForm)}),e.off().on("click",function(){f()}),k.off().on("click",function(){j()}),d.off().on("click",function(){i(a.urlImport,{width:500,height:170})})},f=function(){var c=[];b.grid.find("*[class*='btn-switch-']").each(function(){c.push({ruleset_id:$(this).data("ruleset_id"),use_yn:"1"==$(this).val()?"Y":"N"})}),0==c.length?_alert("On/Off 적용할 건을 선택하세요."):_confirm("적용 하시겠습니까??",{onAgree:function(){$("body").requestData(a.urlOnOff,c,{callback:function(a,b,c){h(),_alert(c)}})},onDisagree:function(){}})},g=function(){var c={1:[1,2,3,5,10,15,30],2:[1,2,3,6,12],3:[1]},d=b.form.find("[name=s_times]"),e=b.form.find("[name=s_time_type]"),f=e.val();d.empty()[0];if(""!=f){"3"!=f&&d.append("<option value>전체</option>");for(var g in c[f])d.append('<option value="'+c[f][g]+'">'+c[f][g]+"</option>")}"1"==f||"2"==f?d.prop("disabled",!1):d.prop("disabled",!0),setTimeout(function(){slui.attach.setTransformSelect(a.formId)},10)},h=function(){b.grid.jqxGrid("updatebounddata")},i=function(a,b){var c={width:800,height:480,onClose:function(){h()}};c=$.extend(c,b),new ModalPopup(a,c)},j=function(){b.form.attr({action:a.urlDownload}).submit()};return{init:c}}(),$(function(){slapp.epsRulesetlist.list.init()});