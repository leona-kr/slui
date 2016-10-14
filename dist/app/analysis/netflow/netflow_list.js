"use strict";_SL.nmspc("netflow").list=function(){var a={urlList:gCONTEXT_PATH+"analysis/netflow_list.json",formId:"#searchNetFlowList",gridHeadId:"#netFlowTableHead",gridId:"#gridNetFlowList",chartId:"#chartNetFlow"},b={form:$(a.formId),gridHead:$(a.gridHeadId),grid:$(a.gridId),chart:$(a.chartId),groupField:$(a.formId+" [name=s_group_field]"),selFields:$(a.formId+" [name=s_sel_fields]"),currPage:$(a.gridHeadId+" [name=currPage]")},c=function(){b.form.find(".form-submit").off().on("click",function(){_SL.validate(b.form)&&n()}),b.form.find("[name=timeSet]").change(function(){var a=this.value;if(0!=a){var c=function(a,b){var c=a.siblings(".tform-select");c.find(".tform-select-t").text(b).end().find(".tform-select-option[data-value="+b+"]").addClass("selected").end(),a.val(b)},d=_SL.formatDate.addMin(b.form.find("[name=endDay]").val()+b.form.find("[name=endHour]").val()+b.form.find("[name=endMin]").val(),-a);c(b.form.find("[name=startDay]"),d.substring(0,8)),c(b.form.find("[name=startHour]"),d.substring(8,10)),c(b.form.find("[name=startMin]"),d.substring(10,12))}}),b.form.find("[name=startDay],[name=startHour],[name=startMin],[name=endDay],[name=endHour],[name=endMin]").change(function(){var a=b.form.find("[name=timeSet]"),c=a.siblings(".tform-select").find("[data-value=0]").text();a.val(0).siblings(".tform-select").find(".tform-select-t").text(c)}),d(),g()},d=function(){var c=$.extend({},_SL.serializeMap(b.form),{pagesize:b.gridHead.find("[name=pageRow]").val(),currPage:b.gridHead.find("[name=currPage]").val()});$("body").requestData(a.urlList,c,{callback:function(a,b,c){e(a.chartListJson),f(a)}})},e=function(a){if(b.chart.empty(),null!=a&&0!=a.length){var c=0;for(var d in a)c<a[d].value&&(c=a[d].value);c=_SL.getChartMaxValue(c);var e={baseFont:"dotum",baseFontSize:"11",baseFontColor:"#000000",paletteColors:"#89cf43",bgColor:"#ffffff",showBorder:"0",showvalues:"0",showCanvasBorder:"0",usePlotGradientColor:"0",plotBorderAlpha:"10",placeValuesInside:"1",valueFontColor:"#333333",showAxisLines:"1",axisLineAlpha:"25",divLineAlpha:"10",alignCaptionWithCanvas:"0",showAlternateVGridColor:"0",captionFontSize:"14",subcaptionFontSize:"14",subcaptionFontBold:"0",toolTipColor:"#ffffff",toolTipBorderThickness:"0",toolTipBgColor:"#000000",toolTipBgAlpha:"80",toolTipBorderRadius:"2",toolTipPadding:"5",numVisiblePlot:"20",baseFontSize:"11",formatnumberscale:"1",showLegend:"0",yAxisMaxValue:1>=c?2:c},f={chart:e,categories:[{category:a}],dataset:[{data:a}]};FusionCharts.ready(function(){new FusionCharts({type:"scrollarea2d",renderAt:"chartNetFlow",width:"100%",height:"240",dataFormat:"json",dataSource:f}).render()})}},f=function(a){if(a){_SL.setDataToForm(a,b.form),$("#netFlowTotalCnt").text(_SL.formatNumber(a.totalCount)),$("#netFlowSpanTotalPage").text(_SL.formatNumber(a.totalPage)),b.currPage.data("total-page",a.totalPage);var c=a.list,d=a.fldCaps,e=(a.sumFields,a.groupField),f=a.viewFieldList,g=$("<thead>"),i=$("<tbody>"),j=$("<tr>");b.grid.empty(),j.append('<th scope="col" style="width:50px;">번호</th>');for(var k=0;k<f.length;k++)"eqp_dt"==e&&"eqp_dt"!=f[k]&&"pkt_cnt"!=f[k]&&"pkt_size"!=f[k]?j.append('<th scope="col" class="head-group" style="text-decoration:underline; cursor:pointer;" data-value="'+f[k]+'">'+d[f[k]]+"</th>"):j.append('<th scope="col">'+d[f[k]]+"</th>");if(g.append(j),c.length>0)for(var l in c){var j=$("<tr>");c[l];j.append('<td class="align-center">'+(parseInt(l)+1+a.recordstartindex)+"</td>");for(var m in f)if(0==m)if("eqp_dt"==f[m]){var n=_SL.formatDate(c[l][f[m]],"yyyyMMddHHmm","yyyy-MM-dd HH:mm");j.append('<td class="align-center">'+n+"</td>")}else j.append('<td class="align-center">'+c[l][f[m]]+"</td>");else if("pkt_cnt"==f[m]||"pkt_size"==f[m])j.append('<td class="align-center"><span class="fmt_pkt">'+c[l][f[m]]+"</span></td>");else if("eqp_dt"==e)j.append('<td class="align-center">'+c[l][f[m]]+"</td>");else{var o=_SL.javascriptEscape(c[l][e]);j.append('<td class="align-center btn-link sel-add" data-nm="'+f[m]+'" data-val="'+o+'" style="cursor:pointer;">'+c[l][f[m]]+"</td>")}i.append(j)}else j=$("<tr>"),j.append('<td class="align-center" colspan="'+(f.length+1)+'">There is no Search Result</td>'),i.append(j);b.grid.append(g).append(i),b.grid.find(".fmt_pkt").each(function(){$(this).html(_SL.formatNumber($(this).html()))}),h()}},g=function(){b.gridHead.find(".btn-prev").off().on("click",function(){i()}),b.gridHead.find(".btn-next").off().on("click",function(){j()}),b.currPage.off().on("keydown",function(){k()}),b.gridHead.find("[name=pageRow]").change(function(){n()})},h=function(){b.grid.find(".head-group").on("click",l),b.grid.find(".sel-add").on("click",m)},i=function(){var a=parseInt(b.currPage.val());if(1!=a){if(0==b.currPage.data("total-page"))return void b.currPage.val(1);b.currPage.val(a-1),n()}},j=function(){var a=parseInt(b.currPage.val());if(a!=b.currPage.data("total-page")){if(0==b.currPage.data("total-page"))return void b.currPage.val(1);b.currPage.val(a+1),n()}},k=function(){var a=(event.srcElement||event.target).value,c=parseInt(b.currPage.data("total-page"));if(13==event.keyCode){if(isNaN(a)||parseInt(a)<1||parseInt(a)>c)return;$("#currPage").val(a),n()}},l=function(){b.form.find("[name=s_group_field]").val($(this).data("value")),$("#currPage").val(1),n()},m=function(){var a=$(this).data("nm"),c=$(this).data("val"),d=JSON.parse(b.selFields.val());if("eqp_dt"==b.groupField.val()){var e=1,f=_SL.formatDate.addMin(val,e);b.form.find("[name=startDay]").val(val.substring(0,8)),b.form.find("[name=startHour]").val(val.substring(8,10)),b.form.find("[name=startMin]").val(val.substring(10,12)),b.form.find("[name=endDay]").val(f.substring(0,8)),b.form.find("[name=endHour]").val(f.substring(8,10)),b.form.find("[name=endMin]").val(f.substring(10,12))}else d[b.groupField.val()]=c,b.selFields.val(JSON.stringify(d));b.groupField.val(a),$("#currPage").val(1),n()},n=function(){d()};return{init:c}}(),$(function(){slapp.netflow.list.init()});