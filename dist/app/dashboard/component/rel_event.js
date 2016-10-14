"use strict";_SL.nmspc("slapp.component").rel_event=function(a,b,c){var d,e=a,f=$("#componentheader_"+e),g=$("#componentbody_"+e),h=$("#config_"+e+" form"),i=g.find(".grid-table-group"),j=g.find(".chart-group"),k=f.find(".area-title"),l=h.find("[name=ruleset_id]"),m=h.find("[name=ruleset_id_list]"),n=h.find("[name=event_cate_cd]"),o=h.find("[name=event_level]"),p=h.find("[name=group_field]"),q=h.find("[name=last_period]"),r=h.find("[name=rows]"),s=(h.find("[name=chart_yn]"),gCONTEXT_PATH+"sysdata/comcode_map.json"),t=gCONTEXT_PATH+"component/rel_event_config.json",u=gCONTEXT_PATH+"component/rel_event_list.json",v=gCONTEXT_PATH+"event2/rel_event_list.html",w={ruleset_id:"",event_cate_cd:"",event_level:"",last_period:"60",rows:"5",chart_yn:"N"},x=b,y=c,z=null,A={grpFields:["ruleset_id"],timeField:"event_time",sumField:"cnt",maxBuffers:1e4,period:60},B=function(){this.config_param=x=$.extend({},w,x),L=$.extend(this.chartstyles,L),L.paletteColors="#89cf43,#ffc000,#ff0000",G(),h.on("click",".btn-add",function(){var a=l.find("option:selected").val(),b=l.find("option:selected").text();return""==a?void _alert("이벤트를 선택하세요."):m.find("option").is(function(){return this.value==a})?void _alert("동일한 이벤트가 존재합니다."):void m.append($("<option>").val(a).text(b))}).on("click",".btn-del",function(){m.find(":selected").remove()}),i.on("click","a[name=rel_event_search]",function(a){M($(a.target))}),A.period=x.last_period,z=_SL.getDataTicker(A),z.setBaseTime(_SL.formatDate.addMin(gGetServerTime(),-A.period)),x.event_seq="",C()},C=function(a){$("body").requestData(u,x,{callback:function(b){var c=b&&b.rsList?b.rsList:[],d=b.isInit;if(!(c.length<1)||d){var e=ComCodes.CS0051[x.event_cate_cd],f=ComCodes.CS0005[x.event_level],g="상관분석 이벤트";if(""!=x.event_cate_cd&&(g=g+"/"+e),""!=x.event_level&&(g=g+"/"+f),k.text(g),"Y"==x.chart_yn){z.addChartList(c);var h=z.getChartList();j.is(":hidden")?(K(b,h),j.show()):K(b,h,a)}else j.hide();var l=x.event_seq;c.length>0&&(l=c[0].event_seq),z.addList(c);var m=z.getList();m.sort(function(a,b){return a.event_time>b.event_time?-1:a.event_time<b.event_time?1:z.getEventCount(a.key)>z.getEventCount(b.key)?-1:z.getEventCount(a.key)<z.getEventCount(b.key)?1:0});var n=i.find("tbody").empty(),o=m.length;if(o>x.rows&&(o=x.rows),o&&0!=o.length)for(var p=["Low","Middle","High"],q=["label-success","label-attention","label-danger"],r=0;r<o;r++){var s=m[r],t=$("<tr></tr>"),u=($("<td></td>").text(r+1).appendTo(t),$("<td></td>").appendTo(t)),v=($("<a></a>").attr({name:"rel_event_search",tabindex:"1"}).css("cursor","pointer").text(s.event_nm).data({event_nm:s.event_nm,event_time:s.event_time,s_event_time:s.s_event_time,ruleset_id:s.ruleset_id,event_cate_cd:s.event_cate_cd,event_level:s.event_level}).appendTo(u),$("<td></td>").text(ComCodes.CS0051[s.event_cate_cd]).appendTo(t),$("<td></td>").appendTo(t));$("<td></td>").text(_SL.toComma(z.getEventCount(s.key)+"건")).appendTo(t),$("<td></td>").text(_SL.formatDate(s.s_event_time,"MM-dd HH:mm")+"~"+_SL.formatDate(s.event_time,"MM-dd HH:mm")).attr("title",_SL.formatDate(s.s_event_time,"yyyy-MM-dd HH:mm")+" ~ "+_SL.formatDate(s.event_time,"yyyy-MM-dd HH:mm")).appendTo(t);0==s.event_level_nm?v.append("-"):v.append('<span class="'+q[s.event_level-1]+'">'+p[s.event_level-1]+"</span>"),t.appendTo(n).hide().fadeIn(1500)}else n.append('<tr><td colspan="6">There is no Result.</td></tr>');x.event_seq=l}}})},D=function(){var a=x?x.ruleset_id:"";l.val(""),n.val(x.event_cate_cd),o.val(x.event_level),p.val(x.group_field),q.val(x.last_period),r.val(x.rows),h.find("[name=chart_yn]:input[value="+x.chart_yn+"]").prop("checked",!0),m.empty();var b=a.split(",");for(var c in b){var e=b[c];null!=e&&""!=e&&m.append(new Option(d[e],e))}},E=function(){for(var a=[],b=m.find("option"),c=0;c<b.length;c++)a.push(b.eq(c).val());x.ruleset_id=a.join(","),x.event_cate_cd=n.val(),x.event_level=o.val(),x.group_field=p.val(),x.last_period=q.val(),x.rows=r.val(),x.chart_yn=h.find("[name=chart_yn]:checked").val(),A.period=x.last_period,z=_SL.getDataTicker(A),z.setBaseTime(_SL.formatDate.addMin(gGetServerTime(),-A.period)),x.event_seq=""},F=function(){C(!0)},G=function(){ComCodes.CS0051?H():$("body").requestData(s,{code_type:"CS0051"},{callback:function(a,b,c){ComCodes.CS0051=a,H()}}),ComCodes.CS0005?I():$("body").requestData(s,{code_type:"CS0005"},{callback:function(a,b,c){ComCodes.CS0005=a,I()}}),$("body").requestData(t,{},{callback:function(a,b,c){d=a.eventNames,J(d)}})},H=function(){n.html('<option value="">[선택하세요]</option>');for(var a in ComCodes.CS0051)n.append($("<option>").val(a).text(ComCodes.CS0051[a]))},I=function(){o.html('<option value="">[선택하세요]</option>');for(var a in ComCodes.CS0005)o.append($("<option>").val(a).text(ComCodes.CS0005[a]))},J=function(a){l.html('<option value="">[선택하세요]</option>');for(var b in a)l.append($("<option>").val(b).text(a[b]))},K=function(a,b,c){var d=b,f={chart:L,categories:[],dataset:[]},g=[],h=[],i=ComCodes.CS0005,j=a.groupByPeriod,k=a.categorys,l="";for(var m in k)h.push({label:_SL.formatDate(k[m].event_time,"MM-dd HH:mm")});var n,o,p={},q={};for(var r in i){var s=i[r];q[s]=0}if(j>1){for(var m in k){var q={};for(var r in i){var s=i[r];q[s]=0}n=k[m].event_time,o=_SL.formatDate.addMin(n,j),p[n]=q;for(var r=0;r<j;r++){var t;if(t=0==r?n:_SL.formatDate.addMin(n,r),d[t])for(var u in i){var s=i[u];d[t][s]&&(p[n][s]+=d[t][s])}}}d=p}for(var r in i){var s=i[r],v={seriesname:s,data:[]};for(var u in k){l=k[u].event_time;var w=0,x=k[u].event_time,y=_SL.formatDate.addMin(x,j),z='javascript:$.Dashboard.componentInstance["'+e+'"].chartRelEvent("'+r+'","'+x+'","'+y+'")';d[l]&&d[l][s]&&(w=d[l][s]),v.data.push({value:w,link:z})}g.push(v)}f.categories.push({category:h}),f.dataset=g,c===!0&&void 0!=$.Dashboard.chartInstance[e]?$.Dashboard.chartInstance[e].setJSONData(f):FusionCharts.ready(function(){$.Dashboard.chartInstance[e]=new FusionCharts({type:"stackedcolumn2d",renderAt:"chart-container_"+e,width:"100%",height:"240",dataFormat:"json",dataSource:f}).render()})},L={caption:"",subCaption:"",numberPrefix:"",showValues:"0"},M=function(a){var b=g.find("[name=listForm]"),c=a.data("s_event_time"),d=_SL.formatDate.addMin(a.data("event_time"),1);$("[name=start_time]",b).val(c),$("[name=end_time]",b).val(d),$("[name=s_event_seq]",b).val(a.data("event_seq")),$("[name=s_event_cate_cd]",b).val(a.data("event_cate_cd")),$("[name=s_event_nm]",b).val(a.data("event_nm")),$("[name=s_event_level]",b).val(a.data("event_level"));var e="relEventSearchWin_"+(new Date).getTime();b.attr({action:v,target:e,method:"post"}).submit()},N=function(a,b,c){var d=g.find("[name=listForm]");$("input[type=hidden]",d).val(""),$("[name=start_time]",d).val(b),$("[name=end_time]",d).val(c),$("[name=s_event_level]",d).val(a);var e="relEventSearchWin_"+(new Date).getTime();d.attr({action:v,target:e,method:"post"}).submit()};return{config_param:x,component_title:y,load:B,refresh:C,showConfig:D,beforeSaveConfig:E,afterSaveConfig:F,chartRelEvent:N}};