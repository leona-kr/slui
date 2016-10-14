"use strict";_SL.nmspc("relRulesetlist").list=function(){var a={formId:"#searchRelRuleset",gridId:"#gridRelRuleset",urlList:gCONTEXT_PATH+"event2/rel_ruleset_list.json",urlForm:gCONTEXT_PATH+"event2/rel_ruleset_form.html",urlOnOff:gCONTEXT_PATH+"event2/rel_ruleset_onoff.json"},b={grid:$(a.gridId),form:$(a.formId)},c=function(){d(b.grid),e()},d=function(c){var d=["Low","Middle","High"],e=["label-success","label-attention","label-danger"],f={datatype:"json",datafields:[{name:"ruleset_id",type:"string"},{name:"use_yn",type:"string"},{name:"event_nm",type:"string"},{name:"event_cate_nm",type:"string"},{name:"event_level",type:"string"},{name:"times",type:"string"},{name:"time_nm",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(f.totalrecords=a.totalRows)},cache:!1,url:a.urlList},g=new $.jqx.dataAdapter(f,{formatData:function(a){var c,d={},e=b.form.serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(a,d),a},loadError:function(a,b,c){alert(c)}});c.jqxGrid({source:g,sortable:!0,width:"100%",virtualmode:!0,enablehover:!1,rendergridrows:function(a){return a.data},columns:[{text:"상태",datafield:"use_yn",cellsalign:"center",width:70,cellsrenderer:function(a,b,c,d,e,f){var g="on",h="1";return"N"==c&&(g="off",h="0"),$(d).html('<button type="button" data-ruleset_id="'+f.ruleset_id+'" class="onoff-icon btn-switch-'+g+'" value="'+h+'" data-switch-toggle="true"><span class="text-on">ON</span><span class="text-off">OFF</span></button>')[0].outerHTML}},{text:"번호",columntype:"number",cellsalign:"center",width:50,cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"이벤트명",datafield:"event_nm",width:"39%",cellsrenderer:function(a,b,c,d,e,f){return $(d).html('<button type="button" class="btn-link">'+c+"</button>")[0].outerHTML}},{text:"분류",datafield:"event_cate_nm",cellsalign:"center"},{text:"등급",datafield:"event_level",cellsrenderer:function(a,b,c,f,g,h){return $(f).html('<span class="'+e[c-1]+'">'+d[c-1]+"</span>")[0].outerHTML}},{text:"체크 주기",datafield:"time_nm",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).html(f.times+c)[0].outerHTML}}]}),c.on("cellclick",function(b){if("event_nm"===b.args.datafield){var c=b.args.row.bounddata.ruleset_id;i(a.urlForm+"?ruleset_id="+c,!0)}})},e=function(){var c=b.grid.parent().siblings(".grid-bottom").find(".btn-add"),d=b.grid.parent().siblings(".grid-bottom").find(".btn-apply");g(),b.form.find("[name=s_time_type]").on("change",function(){g()}),b.form.find(".form-submit").on("click",function(){h()}),c.off().on("click",function(){i(a.urlForm,!1)}),d.off().on("click",function(){f()})},f=function(){var c=[];b.grid.find("*[class*='btn-switch-']").each(function(){c.push({ruleset_id:$(this).data("ruleset_id"),use_yn:"1"==$(this).val()?"Y":"N"})}),0==c.length?_alert("On/Off 적용할 건을 선택하세요."):_confirm("적용 하시겠습니까??",{onAgree:function(){$("body").requestData(a.urlOnOff,c,{callback:function(a,b,c){h(),_alert(c)}})},onDisagree:function(){}})},g=function(){var c={1:[1,2,3,5,10,15,30],2:[1,2,3,6,12],3:[1]},d=b.form.find("[name=s_times]"),e=b.form.find("[name=s_time_type]"),f=e.val();d.empty()[0];if(""!=f){"3"!=f&&d.append("<option>전체</option>");for(var g in c[f])d.append('<option value="'+c[f][g]+'">'+c[f][g]+"</option>");setTimeout(function(){slui.attach.setTransformSelect(a.formId)},10)}"1"==f||"2"==f?d.prop("disabled",!1):d.prop("disabled",!0),slui.attach.setTransformSelect(a.formId)},h=function(){b.grid.jqxGrid("updatebounddata")},i=function(a,b){new ModalPopup(a,{width:800,height:600,setScroll:b,onClose:function(){h()}})};return{init:c}}(),$(function(){slapp.relRulesetlist.list.init()});