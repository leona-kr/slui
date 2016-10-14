"use strict";_SL.nmspc("logsearch").groupStats=function(){var a=gCONTEXT_PATH+"monitoring/",b={DOM:{content:"#timeStatsContent",chartType:"#timeStatsChartType",chart:"#timeStatsChart",form:"#formTimeStats",spantime:".time-stats-spantime"},URL:{timeStats:a+"time_stats.json",logSearch:a+"log_search.html"},chartId:"timeStatsChartId"},c={content:$(b.DOM.content),chartType:$(b.DOM.chartType),chart:$(b.DOM.chart),form:$(b.DOM.form),spantime:$(b.DOM.content+" "+b.DOM.spantime)},d={param:{},data:{}},e=function(){d.param=_SL.serializeMap(c.form),d.param.series_vals&&!$.isArray(d.param.series_vals)&&(d.param.series_vals=[d.param.series_vals]),loading.show(),c.chartType.on("change",function(){d.chart.chartType($(this).val())}),f()},f=function(){$("body").requestData(b.URL.timeStats,d.param,{callback:function(a,b,c){d.data=a,loading.hide(),g()}})},g=function(){c.spantime.text(_SL.formatNumber(d.data.spanTime/1e3));var a,b,e,f=[],g=[],h=[],j=0,k=d.data.resultMap,l=k.categories,m=d.param.series_vals||[];m.push("_etc"),i=$.extend({},slui.chart.chartConfig,i);for(b in l)h.push({label:_SL.formatDate(l[b],"HH:mm")}),b!=l.length-1&&l[b].substring(0,8)!=l[Number(b)+1].substring(0,8)&&h.push({vLine:"true",dashed:"1",dashlen:2,dashgap:3});g.push({category:h});var n,o,p,q,r;for(b in m){a=m[b],n={seriesname:a,data:[]},o=k[a];for(e in o)p=Number(e)+1,q=l[e],r=l[p],p==o.length&&(r=d.param.end_time),n.data.push({value:o[e],toolText:a+", "+_SL.formatDate(l[e],"yyyy-MM-dd HH:mm")+", "+_SL.formatNumber(o[e]),link:"javascript:slapp.logsearch.groupStats.openSearch('"+l[e]+"','"+r+"','"+_SL.javascriptEscape(m[b])+"');"}),j=Math.max(o[e],j);if("_etc"==a){if(""!=d.param.series_field&&"Y"!=d.param.series_val_etc)continue;n.seriesname=""==d.param.series_field?"[전체]":"[기타]"}f.push(n)}"count"!=d.param.stats_func&&(i.yAxisName=d.param.stats_func.toUpperCase()+"("+d.param.func_field_nm+")");var s=[];d.data.avg_per_time>0&&(s=[{line:[{startvalue:d.data.avg_per_time,endvalue:"",color:"fda813",displayvalue:" ",tooltext:"Average : "+_SL.formatNumber(d.data.avg_per_time),showontop:"1",thickness:"1"}]}]),i.yAxisMaxValue=_SL.getChartMaxValue(j),d.chart=new FusionCharts({type:c.chartType.val(),width:"100%",height:"250",renderAt:"timeStatsChart",dataFormat:"json",dataSource:{chart:i,categories:g,dataset:f,trendlines:s}}).render()},h=function(a,c,e){var f=d.param.query,g=d.param.series_field;""!=g&&("_etc"==e?(f=(""==f?"*:*":"("+f+")")+" NOT ",f+=seriesFld+":("+d.param.series_vals.join(" ")+")"):(""!=f&&(f="("+f+") AND "),f+=g+":"+_SL.luceneValueEscape(e))),$("<form>").attr({target:"logSearchWin_"+(new Date).getTime(),action:b.URL.logSearch,method:"post"}).append($("<input type='hidden' name='start_time'>").val(a)).append($("<input type='hidden' name='end_time'>").val(c)).append($("<input type='hidden' name='expert_keyword'>").val(f)).append($("<input type='hidden' name='template_id'>").val("popup")).appendTo("body").submit().remove()},i={maxLabelWidthPercent:"35",showBorder:"1",showLimits:"1",yAxisMaxValue:"0",yAxisName:"Count"};return e(),{openSearch:h}}();