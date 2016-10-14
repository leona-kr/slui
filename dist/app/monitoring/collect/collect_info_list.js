"use strict";_SL.nmspc("collectInfo").list=function(){var a={urlList:gCONTEXT_PATH+"monitoring/collect_info_list.json",urlView:gCONTEXT_PATH+"monitoring/collect_info_view.html",urlChartData:gCONTEXT_PATH+"monitoring/collect_info_chart_data.json",urlChartSearch:gCONTEXT_PATH+"monitoring/collect_info_list.html",urlDownload:gCONTEXT_PATH+"monitoring/collect_info_export.do",formId:"#searchCollectInfoList",gridId:"#gridCollectInfoList",pieChartId:"pieChartContainer",lineChartId:"lineChartContainer"},b={form:$(a.formId),grid:$(a.gridId),eqpTyp:$(a.formId+" [name=s_eqp_type_cd]"),eqpNm:$(a.formId+" [name=s_eqp_nm]"),eqpIp:$(a.formId+" [name=s_eqp_ip]"),grpCd:$(a.formId+" [name=s_group_cd]"),colYn:$(a.formId+" [name=s_collect_yn]"),logCd:$(a.formId+" [name=s_log_cate_cd]"),logCds:$(a.formId+" [name=s_log_cate_cds]"),period:$(a.formId+" [name=period]")},c=function(){d(b.grid),f(),g(),h()},d=function(b){var c={datatype:"json",datafields:[{name:"eqp_ip",type:"string"},{name:"eqp_nm",type:"string"},{name:"eqp_type_cd",type:"string"},{name:"eqp_type_nm",type:"string"},{name:"group_cd",type:"string"},{name:"group_nm",type:"string"},{name:"collect_yn",type:"string"},{name:"recv_time",type:"string"},{name:"min_recv_time",type:"string"},{name:"max_recv_time",type:"string"},{name:"last_recv_time",type:"string"},{name:"collect_allow_time",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(c.totalrecords=a.totalRows)},cache:!1,url:a.urlList},d=new $.jqx.dataAdapter(c,{beforeLoadComplete:function(a){for(var b in a);return a},formatData:function(b){var c,d={},e=$(a.formId).serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(b,d),b},loadError:function(a,b,c){_alert(c)}});b.jqxGrid({source:d,sortable:!1,width:"100%",virtualmode:!0,rendergridrows:function(a){return a.data},columns:[{text:"No",columntype:"number",width:40,cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"장비명[IP]",datafield:"eqp_ip",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).html('<button type="button" class="btn-link">'+f.eqp_nm+"["+f.eqp_ip+"]</button>")[0].outerHTML}},{text:"장비 종류",datafield:"eqp_type_nm",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).html(c)[0].outerHTML}},{text:"자산 그룹",datafield:"group_nm",cellsalign:"center",width:"15%"},{text:"최종 수집시간",datafield:"last_recv_time",cellsalign:"center",width:"15%",cellsrenderer:function(a,b,c,d,e,f){var g=""+f.min_recv_time,h=f.max_recv_time,i=f.recv_time,j=f.collect_yn,k=_SL.formatDate(),l="";if(null!=i){l="Y"==j?g:h;var m=_SL.formatDate.diff(l,k)/6e4;if(""!=l){m<0&&(m=0);var n=parseInt(m/1440),o=parseInt(m%1440/60),p=parseInt(m%1440%60),q="";0!=n&&(q+=n+"일 "),0==n&&0==o||(q+=o+"시간 "),0==n&&0==o&&0==p||(q+=p+"분"),l=""!=q?_SL.formatDate(l,"yyyyMMddHHmm","yyyy-MM-dd HH:mm")+("("+q+" 전)"):_SL.formatDate(l,"yyyyMMddHHmm","yyyy-MM-dd HH:mm")+"(1분내)"}}return $(d).html(l)[0].outerHTML}},{text:"정상수집 허용시간",datafield:"collect_allow_time",cellsalign:"center",width:"10%",cellsrenderer:function(a,b,c,d,e,f){switch(c){case 5:c="5분";break;case 10:c="10분";break;case 30:c="30분";break;case 60:c="1시간";break;case 180:c="3시간";break;case 360:c="6시간";break;case 720:c="12시간";break;case 1440:c="1일";break;default:c="-"}return $(d).html(c)[0].outerHTML}},{text:"수집상태",datafield:"collect_yn",width:"10%",cellsrenderer:function(a,b,c,d,e,f){var g;return g="Y"==c?"<span class='label-success'>수집</span>":"<span class='label-danger'>미수집</span>",$(d).html('<button type="button" class="btn-link" style="margin-left:4px;">'+g+"</button>")[0].outerHTML}}]}),b.on("cellclick",function(b){if("eqp_ip"===b.args.datafield||"collect_yn"===b.args.datafield){var c=b.args.row.bounddata,d=c.eqp_type_cd,f=c.eqp_ip;c.eqp_nm;e(a.urlView+"?s_eqp_type_cd="+d+"&s_eqp_ip="+f+"&period=120")}})},e=function(a){new ModalPopup(a,{width:1050,height:800,setScroll:!0,onClose:function(){m()}})},f=function(){b.form.find("[name=s_log_cate_cd]").each(function(a,b){$(this).chosen({search_contains:!0,placeholder_text_multiple:"[선택하세요]"})})},g=function(){var a=b.form.find(".btn-download");b.form.find(".form-submit").off().on("click",function(){_SL.validate(b.form)&&m()}),a.off().on("click",function(){n()})},h=function(){$.getJSON(a.urlChartData,{s_eqp_type_cd:b.eqpTyp.val(),s_eqp_nm:b.eqpNm.val(),s_eqp_ip:b.eqpIp.val(),s_group_cd:b.grpCd.val(),s_collect_yn:b.colYn.val(),s_log_cate_cds:b.logCds.val(),period:b.period.val()},function(b){var c=b.pieChartDataList,d=k;d.renderAt=a.pieChartId,d.dataSource.chart=$.extend({},slui.chart.chartConfig,k.dataSource.chart),d.dataSource.data=[];for(var e in c){var f={};f={label:c[e].label,value:c[e].value},"수집"==f.label?f.link="javascript:slapp.collectInfo.list.goChartSearch('Y')":f.link="javascript:slapp.collectInfo.list.goChartSearch('N')",d.dataSource.data.push(f)}var g=b.lineChartDatalist,h=l,j=0;h.renderAt=a.lineChartId,h.dataSource.chart=$.extend({},slui.chart.chartConfig,l.dataSource.chart),h.dataSource.data=[];for(var e in g){var f={};if(f={label:g[e].label.substring(3,8),value:g[e].value},j+=g[e].value,0!=e&&g[e-1].label.substring(0,2)!=g[e].label.substring(0,2)){var m=g[e-1].label.substring(0,2)+"일",n=g[e].label.substring(0,2)+"일";h.dataSource.data.push({vline:!0,label:m,dashed:"1",dashLen:"3",dashGap:"2",labelHAlign:"right"}),h.dataSource.data.push({vline:!0,label:n,dashed:"1",dashLen:"3",dashGap:"2",labelHAlign:"left"})}h.dataSource.data.push(f)}h.dataSource.chart.subCaption="(최근 1일 "+_SL.formatNumber(j)+"건)",i(d,h)})},i=function(a,b){FusionCharts.ready(function(){new FusionCharts(a).render()}),FusionCharts.ready(function(){new FusionCharts(b).render()})},j=function(c){b.form.find("[name=s_collect_yn]").val(c),slui.attach.setTransformSelect(a.formId),m()},k={type:"pie3d",renderAt:a.pieChartId,width:"100%",height:"300",dataFormat:"json",dataSource:{chart:{showlegend:"1",caption:"수집 상태별 현황"},data:[]}},l={type:"area2d",renderAt:a.lineChartId,width:"100%",height:"300",dataFormat:"json",dataSource:{chart:{plotfillcolor:"#00acc6",caption:"시간별 수집 건수",showvalues:"0",yAxisName:"Count"},data:[]}},m=function(){null!=b.logCd.val()?b.logCds.val(b.logCd.val()):b.logCds.val(""),b.grid.jqxGrid("updatebounddata"),h()},n=function(){b.form.attr({action:a.urlDownload}).submit()};return{init:c,goChartSearch:j}}(),$(function(){slapp.collectInfo.list.init()});