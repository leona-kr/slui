"use strict";_SL.nmspc("searchEvent").manager=function(){var a,b,c={urlList:gCONTEXT_PATH+"event/search_event_list.json",urlChartData:gCONTEXT_PATH+"event/search_event_chart_data.json",urlHandlingUdate:gCONTEXT_PATH+"event/search_event_update.json",urlDuplicate:gCONTEXT_PATH+"event/search_event_duplication.do",urlDuplForm:gCONTEXT_PATH+"event/search_event_duplication_form.html",urlDownload:gCONTEXT_PATH+"event/search_event_export.do",formId:"#searchSearchEventList",gridId:"#searchEventListTable",cateChartId:"cateChartContainer",handlChartId:"handlChartContainer",timeLineId:"#searchEventTimeline"},d={form:$(c.formId),grid:$(c.gridId),timeLine:$(c.timeLineId),sDay:$(c.formId+" [name=startDay]"),sHour:$(c.formId+" [name=startHour]"),sMin:$(c.formId+" [name=startMin]"),eDay:$(c.formId+" [name=endDay]"),eHour:$(c.formId+" [name=endHour]"),eMin:$(c.formId+" [name=endMin]"),groupCd:$(c.formId+" [name=s_group_cd]"),eventCateCd:$(c.formId+" [name=s_event_cate_cd]"),eventNm:$(c.formId+" [name=s_event_nm]"),eventLevel:$(c.formId+" [name=s_event_level]"),fieldVal:$(c.formId+" [name=s_field_val]"),handlingTypeCd:$(c.formId+" [name=s_handling_type_cd]"),dashboardYn:$(c.formId+" [name=s_dashboard_yn]")},e=function(){f(),slapp.searchEvent.dynPaging.init(),n(),slapp.searchEvent.dlgViewField.init(),g(),slapp.searchEvent.dynPaging.search(),slapp.searchEvent.contextMenuManager.init()},f=function(){d.form.find(".form-submit").off().on("click",function(){o()}),d.form.find("[name=timeSet]").change(function(){var a=this.value;if(0!=a){var b=function(a,b){var c=a.siblings(".tform-select");c.find(".tform-select-t").text(b).end().find(".tform-select-option[data-value="+b+"]").addClass("selected").end(),a.val(b)},c=_SL.formatDate.addMin(d.form.find("[name=endDay]").val()+d.form.find("[name=endHour]").val()+d.form.find("[name=endMin]").val(),-a);b(d.form.find("[name=startDay]"),c.substring(0,8)),b(d.form.find("[name=startHour]"),c.substring(8,10)),b(d.form.find("[name=startMin]"),c.substring(10,12))}}),d.form.find("[name=startDay],[name=startHour],[name=startMin],[name=endDay],[name=endHour],[name=endMin]").change(function(){var a=d.form.find("[name=timeSet]"),b=a.siblings(".tform-select").find("[data-value=0]").text();a.val(0).siblings(".tform-select").find(".tform-select-t").text(b)}),d.form.find(".btn-download").off().on("click",function(){q()});var a=d.grid.parent().siblings(".grid-bottom").find(".btn-handling");a.on("click",r)},g=function(){l.dataSource.chart=$.extend({},slui.chart.chartConfig,l.dataSource.chart),m=$.extend(!0,{},l),b.clear(),$("body").requestData(c.urlChartData,{start_time:d.sDay.val()+d.sHour.val()+d.sMin.val(),end_time:d.eDay.val()+d.eHour.val()+d.eMin.val(),s_group_cd:d.groupCd.val(),s_event_cate_cd:d.eventCateCd.val(),s_event_nm:d.eventNm.val(),s_event_level:d.eventLevel.val(),s_field_val:d.fieldVal.val(),s_handling_type_cd:d.handlingTypeCd.val(),s_dashboard_yn:d.dashboardYn.val()},{callback:function(a,b,c){h(a),k(a)}})},h=function(a){var b=a.cateCdChartLabels,d=l,e=a.cateCdChartDataList;d.renderAt=c.cateChartId,d.dataSource.chart.caption="분류별 현황",d.dataSource.data=[];for(var f in b)d.dataSource.data.push(i("event_cate_cd",b[f],e));var g=a.handlingTypeChartLabels,h=a.handlingTypeChartDataList,k=m;k.renderAt=c.handlChartId,k.dataSource.chart.caption="상태별 현황",k.dataSource.data=[];for(var f in g)k.dataSource.data.push(i("handling_type_cd",g[f],h));j(d),j(k)},i=function(a,b,c){var d={label:b,value:0};for(var e in c)if(b==c[e].label){d={label:c[e].label,value:c[e].value,link:"javascript:slapp.searchEvent.manager.goChartSearch('"+a+"','"+c[e].type+"')"};break}return d},j=function(a){FusionCharts.ready(function(){new FusionCharts(a).render()})},k=function(c){var d=c;if(d.events){a.clearBandCount(0),a.clearBandCount(1),b.loadJSON(d,"/");var e=new Date;if(d.events.length>0){var f=Math.floor(d.events.length/2)-1;f<0&&(f=0),e=new Date(d.events[f].start)}a.getBand(0).setCenterVisibleDate(e),a.finishedEventLoading()}},l={type:"pie3d",width:"100%",height:"300",dataFormat:"json",dataSource:{chart:{},data:[]}},m={},n=function(){b=new Timeline.DefaultEventSource;var c=Timeline.ClassicTheme.create();c.event.bubble.width=250,c.autoWidth=!0;var d=Timeline.ClassicTheme.create(),e=[Timeline.createBandInfo({width:200,intervalUnit:Timeline.DateTime.MINUTE,intervalPixels:50,timeZone:9,eventSource:b,theme:c}),Timeline.createBandInfo({width:50,intervalUnit:Timeline.DateTime.HOUR,intervalPixels:100,timeZone:9,eventSource:b,theme:d,overview:!0})];e[0].minWidth=200,e[1].syncWith=0,e[1].highlight=!0,a=Timeline.create(document.getElementById("searchEventTimeline"),e),a.finishedEventLoading()},o=function(){g(),slapp.searchEvent.dynPaging.search()},p=function(a,b){"event_cate_cd"==a?d.eventCateCd.val(b):"handling_type_cd"==a&&d.handlingTypeCd.val(b),o()},q=function(){d.form.attr({action:c.urlDownload}).submit()},r=function(){var a=$(this).data("handle-type"),b=$(this).text(),c=[];return d.grid.find("input[name=chk_idx]:checked").each(function(){var a=$(this).data("key");c.push(a)}),c.length<1?void _alert(b+"할 이벤트를 체크해주세요."):void _confirm("이벤트를 "+b+" 하시겠습니까?",{onAgree:function(){1==a||2==a?s(a):4==a&&t()}})},s=function(a){var b=[];d.grid.find("input[name=chk_idx]:checked").each(function(){var a=$(this).data("key");b.push(a)});var e=b.length,f=0,g={};loading.show($("body"));for(var h in b)console.log(h),g={handling_type_cd:a,event_seq:b[h]},$("body").requestData(c.urlHandlingUdate,g,{callback:function(a,b,c){f++,f==e&&(loading.hide($("body")),o())}})},t=function(){if(u()){var a="중복",b=slapp.searchEvent.dynPaging.getListData(),e=d.grid.find("input[name=chk_idx]:checked").data("num"),f=[];d.grid.find("input[name=chk_idx]:checked").each(function(){var a=$(this).data("key");f.push(a)});var g=b[e].field_val,h=b[e].ruleset_id,i=b[e].group_field,j=b[e].event_seq,k=f.join();$("body").requestData(c.urlDuplicate,{duplication_query:g,group_field:i,ruleset_id:h,event_type_cd:1},{callback:function(b){if(0!=b.cnt||0==b.cnt2){var d="";0!=b.cnt?d=a+"설정에 등록된 이벤트이므로\n상태만 업데이트 됩니다.":0==b.cnt2&&(d="설정에서 삭제된 이벤트이므로\n상태만 업데이트 됩니다."),_confirm(d,{onAgree:function(){s(4)}})}else v(c.urlDuplForm+"?seq="+j+"&seqCsv="+k+"&chk=insert")}})}},u=function(){var a=[],b="중복";d.grid.find("input[name=chk_idx]:checked").each(function(){var b=$(this).data("num");a.push(b)});for(var c=slapp.searchEvent.dynPaging.getListData(),e=1;e<a.length;e++){if(c[a[0]].event_nm!=c[a[e]].event_nm)return _alert(b+"조건이 일치하지 않습니다."),!1;if(c[a[0]].group_field!=c[a[e]].group_field)return _alert(b+"조건이 일치하지 않습니다."),!1;if(c[a[0]].field_val!=c[a[e]].field_val)return _alert(b+"조건이 일치하지 않습니다."),!1;if(c[a[0]].ruleset_id!=c[a[e]].ruleset_id)return _alert(b+"조건이 일치하지 않습니다."),!1}return!0},v=function(a){new ModalPopup(a,{width:800,height:500,onClose:function(){}})};return{init:e,goChartSearch:p,refresh:o}}(),slapp.searchEvent.dlgViewField=function(){var a,b,c,d,e,f="#windowViewFields",g=".btn-save",h=".btn-delete",i=".btn-ok",j=".btn-cancel",k="[",l=gCONTEXT_PATH+"monitoring/myviewfield_list.json",m=gCONTEXT_PATH+"monitoring/myviewfield_insert.do",n=gCONTEXT_PATH+"monitoring/myviewfield_update.do",o=gCONTEXT_PATH+"monitoring/myviewfield_delete.do",p=function(){a=slapp.searchEvent.dynPaging,b=$(f),c=$("form",b),d=$("[name=view_id]",c),e=$("[name=view_fields]",c),b.jqxWindow({height:250,width:640,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5,cancelButton:$(f+" "+j)}).on("open",function(){slui.attach.setTransformSelect(".jqx-window")}),e.chosen({width:"100%",search_contains:!0,placeholder_text_multiple:"[선택하세요]",max_selected_options:50}),$("ul.chosen-choices",c).sortable({cancel:".search-field"}).disableSelection(),d.on("change",r),$(g,b).on("click",t),$(h,b).on("click",u),$(i,b).on("click",s),y.init(v)},q=function(a){console.log(a),d.empty().append($("<option/>").attr({value:"",selected:!0,"data-view-fields":a.join(",")}).text("새로 등록...")),e.setSelectionOrder(a,!0),$("body").requestData(l,{view_type:2},{callback:function(a){$.each(a,function(a,b){$("<option>").attr({value:b.view_id,title:b.view_name,"data-view-fields":b.view_fields}).text(b.view_name).appendTo(d)}),d.trigger("change")}}),b.jqxWindow("open")},r=function(){var a=d.val();""!=a&&e.setSelectionOrder(d.find(":selected").attr("data-view-fields").split(","),!0)},s=function(){var c=e.getSelectionOrder();return 0==c.length?void _alert("표시할 필드를 선택하세요."):(a.changeFieldCaption(c),void b.jqxWindow("close"))},t=function(){var a={view_id:d.val(),view_name:""==d.val()?"":d.find(":selected").text(),view_fields:e.getSelectionOrder().join(","),view_type:"2"};return 0==a.view_fields.length?void _alert("표시할 필드를 선택하세요."):void(0==a.view_name.indexOf(k)?w(a):y.open(a.view_name))},u=function(){var a=d.val(),b=d.find(":selected").text();return""==a?(_alert("삭제할 내 표시필드를 선택하세요."),!1):0==b.indexOf(k)?(_alert("기본 표시필드는 삭제할 수 없습니다."),!1):void _confirm("삭제 하시겠습니까?",{onAgree:function(){$("body").requestData(o,{view_id:d.val()},{callback:function(a,b,c){d.find(":selected").remove(),d.val(""),_alert(c)}})}})},v=function(a){w({view_id:d.val(),view_name:a,view_fields:e.getSelectionOrder().join(","),view_type:"2"})},w=function(b){$("body").requestData(""==b.view_id?m:n,b,{callback:function(c,e,f){""==b.view_id?$("<option/>").attr({value:c.view_id,title:c.view_name,"data-field-value":c.view_fields,selected:!0}).text(c.view_name).appendTo(d):c.view_name&&d.find(":selected").attr({title:c.view_name,"data-field-value":c.view_fields}).text(c.view_name),_alert(f),a.changeFieldCaption(c.view_fields.split(","))}})},x=function(){b.jqxWindow("close")},y=function(){var a,b,c="#windowViewName",d=".btn-save",e=".btn-cancel",f="[",g=function(f){a=$(c),b=$("[name=view_name]",a),a.jqxWindow({height:115,width:300,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5,cancelButton:$(c+" "+e)}),$(d,a).on("click",function(){i(f)})},h=function(c){b.val(c),a.jqxWindow("open")},i=function(c){var d=b.val();return""==d?void _alert("이름을 입력하세요."):0==d.indexOf(f)?void _alert("'"+f+"'로 시작되는<br> 이름은 사용할 수 없습니다."):(a.jqxWindow("close"),void c(d))};return{init:g,open:h}}();return{init:p,open:q,close:x}}(),_SL.nmspc("searchEvent").contextMenuManager=function(){var a={eventInfoDlgId:"#eventInfoDlg"},b={eventInfoDlg:$(a.eventInfoDlgId)},c=function(){var a={string_codec:{name:"도움말",callback:d}};$.contextMenu({selector:".context-menu-one",zIndex:1003,items:a}),b.eventInfoDlg.jqxWindow({height:450,width:700,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5})},d=function(a,c){var d=c.$trigger.data("aria");if(!d)return void console.log("Invalid aria-value!! >> onCtxLogType[key="+a+", aria-value="+d+"]");var e=d.split(",");if(2!=e.length)return void console.log("Invalid aria-value!! >> onCtxLogType[key="+a+", aria-value="+d+"]");var f=slapp.searchEvent.dynPaging.getListData(),g=f[e[0]];b.eventInfoDlg.find("[name=event_desc]").val(g.description),b.eventInfoDlg.jqxWindow("open")};return{init:c}}(),$(function(){slapp.searchEvent.manager.init(),$("#btnSettingSearchRulesetCase").togglePage(gCONTEXT_PATH+"event/search_ruleset_case_list.html"),$("#btnSettingSearchRuleset").togglePage(gCONTEXT_PATH+"event/search_ruleset_list.html"),$("#btnSettingEventDuplication").togglePage(gCONTEXT_PATH+"event/search_event_duplication_list.html")});