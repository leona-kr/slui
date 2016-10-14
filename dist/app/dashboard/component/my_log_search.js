"use strict";_SL.nmspc("component").my_log_search=function(a,b,c){var d=a,e=gCONTEXT_PATH+"monitoring/myfilter_list.json",f=gCONTEXT_PATH+"monitoring/myfilter_keywords.json",g=gCONTEXT_PATH+"monitoring/log_search_list.json",h=gCONTEXT_PATH+"component/my_log_search_chart.json",i=gCONTEXT_PATH+"monitoring/log_search.html",j=b,k=j.component_nm?j.component_nm:c,l=!1,m={max_stats_row:_SL.ifNull(1*slapp.component.my_log_search.admin_config.max_stats_row,1e4),max_period_min:_SL.ifNull(1*slapp.component.my_log_search.admin_config.max_period_min,60)},n={component_nm:c,myfilter_name:"검색조건 없음",viewFields:["eqp_dt","src_ip","dstn_ip","dstn_port","eqp_ip"],chart_yn:"N",list_yn:"Y",strQuery:"",searchPeriod:5,searchRows:5,viewRows:20,scroll_size:180,series_field:"",series_vals:[],series_val_etc:"N",stats_func:"count",stats_field:"",chart_type:"stackedcolumn2d"},o={rowsPerOut:250,intervalPerReq:200,intervalPerOut:20,delay:1,cycle:1,chartPeriod:1},p={tit:$("#componentheader_"+d+" .area-title"),body:$("#componentbody_"+d),chart:$("#chart_"+d),logTable:$("#log_table_"+d),form:$("#config_"+d+" form")},q={oChart:null},r={chartInfo:[]},s={searchParam:[],request:[],response:[],curResponse:null,appendTo:{},buffers:[],groupSearchParam:[]},t={initMode:{load:0,config:1},flagFields:{src_country_name:1,src_country_code:1,dstn_country_name:1,dstn_country_code:1},overLengthSuffix:"@@OverLength",reOverLengthSuffix:new RegExp("@@OverLength$"),alignCenterFieldRegExp:/.+_(dt|ip|port|prtc)$/},u={configMode:0,proc_idx:0,reqTimerId:0,outTimerId:0,curViewRowCnt:0};gDFD.fldToCodes.ready();var v=function(){$("[name=searchPeriod] option",p.form).each(function(){this.value>m.max_period_min&&$(this).remove()}),oa=$.extend(this.chartstyles,oa),p.logTable.off("click").on("click",".mylogdata-td",ka),p.form.on("change","[name=myfilterInfo]",ca).on("change","[name=stats_func]",ga).on("change","[name=series_field]",fa).on("click","[name=list_yn]",ha).on("click","[name=chart_yn]",ha).on("click",".btn-series-add",ia).on("click",".btn-series-del",ja),$.extend(o,n,j),B(o.myfilter_id,o.myfilter_type,function(a){a.myfilter_id&&(o.viewFields=j.viewFields=a.viewFields,o.strQuery=j.strQuery=a.strQuery),C(!0,!0),w()})},w=function(){(j.component_nm||""==j.component_nm)&&p.tit.text(j.component_nm);var a;_SL.isEmpty(o.strQuery)||("Y"==o.list_yn&&(0==s.schTime.length&&s.schTime.push({schStartTime:I(),schEndTime:H()}),L()),"Y"==o.chart_yn&&(0==s.groupSchTime.length&&(a=E(I()),s.groupSchTime.push({schStartTime:a,schEndTime:_SL.formatDate.addMin(a,o.chartPeriod)})),M()))},x=function(){this.isOpenConfig=l=!0;var a=j.myfilter_id;if(p.form.find("[name=component_nm]").val(o.component_nm),p.form.find("[name=list_yn]").each(function(){$(this).removeClass("selected"),this.value==o.list_yn&&$(this).addClass("selected")}),p.form.find("[name=searchPeriod]").val(o.searchPeriod),p.form.find("[name=searchRows]").val(o.searchRows),p.form.find("[name=viewRows]").val(o.viewRows),p.form.find("[name=scroll_size]").val(o.scroll_size),p.form.find("[name=chart_yn]").each(function(){$(this).removeClass("selected"),this.value==o.chart_yn&&$(this).addClass("selected")}),p.form.find("[name=stats_func]").val(o.stats_func).trigger("change"),p.form.find("[name=series_field]").val(o.series_field).trigger("change"),o.series_vals){var b=p.form.find("[name=series_vals]");b.empty();for(var c=0;c<o.series_vals.length;c++)b.append(new Option(o.series_vals[c],o.series_vals[c]))}p.form.find("[name=series_val_etc]")["Y"==o.series_val_etc?0:1].checked=!0,p.form.find("[name=chart_type]").val(o.chart_type),$("body").requestData(e,{},{callback:function(b,c,d){var e=p.form.find("[name=myfilterInfo]");e.empty().append(new Option("[선택하세요]",""));for(var f=0,g=b.length;f<g;f++)$("<option>").attr(a==b[f].myfilter_id?{selected:!0}:{}).val(JSON.stringify(b[f])).text(b[f].myfilter_name).appendTo(e);e.trigger("change")}}),(o.component_nm||""==o.component_nm)&&$("#config_"+d).find("h4").text(o.component_nm)},y=function(){if(_SL.validate(p.form)){var a=parseInt(p.form.find("[name=searchRows]").val()),b=parseInt(p.form.find("[name=viewRows]").val()),c=p.form.find("[name=list_yn].selected").val(),d=p.form.find("[name=chart_yn].selected").val(),e=p.form.find("[name=stats_func]").val(),f=p.form.find("[name=stats_field]").val(),g=p.form.find("[name=series_field]").val();p.form.find("[name=series_vals]").val();if("Y"!=c&&"Y"!=d)return _alert("목록 또는 차트중 하나는 표시해야 합니다."),!1;if("Y"==c&&a>b)return _alert("표시 건수가 건수/분 보다 커야 합니다.",{onAgree:function(){p.form.find("[name=viewRows]").focus()}}),!1;if("Y"==d&&"count"!=e&&""==f)return _alert("통계값 필드를 선택하세요."),!1;if(""==g)p.form.find("[name=series_vals] option").remove();else if(0==p.form.find("[name=series_vals] option").length)return _alert("범례 항목을 입력하세요."),!1;return!0}},z=function(){var a;p.form.find("[name=series_vals] option").prop("selected",!0);for(var b=p.form.serializeArray(),c={},d=0;d<b.length;d++)"series_vals"==b[d].name?(c[b[d].name]||(c[b[d].name]=[]),c[b[d].name].push(b[d].value)):c[b[d].name]=b[d].value;""!=c.myfilterInfo?(a=$.parseJSON(c.myfilterInfo),c.myfilter_id=a.myfilter_id,c.myfilter_type=a.myfilter_type,c.myfilter_name=a.myfilter_name):(c.myfilter_id="",c.myfilter_type="",c.myfilter_name=n.myfilter_name),c.list_yn=p.form.find("[name=list_yn].selected").val(),c.chart_yn=p.form.find("[name=chart_yn].selected").val(),delete c.myfilterInfo,this.config_param=j=c},A=function(){this.isOpenConfig=l=!1;var a=W(o,j,["myfilter_id"]),b=!1,c=!1;a?(b=!0,c=!0):(b=W(o,j,["stats_func","stats_field","series_field","series_vals"]),0!=b||o.searchPeriod==j.searchPeriod||parseInt(o.searchPeriod)>parseInt(j.searchPeriod)&&parseInt(o.searchPeriod)<=60||(b=!0)),B(j.myfilter_id,j.myfilter_type,function(a){j.viewFields=a.viewFields,j.strQuery=a.strQuery,C(c,b),w()})},B=function(a,b,c){var d={myfilter_id:"",myfilter_type:"",strQuery:"",viewFields:n.viewFields};a?$("body").requestData(f,{myfilter_id:a},{callback:function(e){e.view_fields&&$.extend(d,{myfilter_id:a,myfilter_type:b,viewFeidls:e.view_fields.split(",")}),"1"==b||"2"==b&&(d.strQuery=e.keywords),c(d)}}):c(d)},C=function(a,b){$.extend(o,j);var c=H(),d=_SL.formatDate.addMin(c,-o.searchPeriod);if(a&&(s.schTime=[],s.request=[],s.response=[],s.last_end_time=null,s.curResponse=null,s.appendTo={},s.buffers=[],u.proc_idx=0,u.outTimerId=0,u.reqTimerId=0,u.curViewRowCnt=0,J(),s.schTime.push({schStartTime:d,schEndTime:c})),b){s.groupSchTime=[],r.chartInfo=[],D();var e=o.searchPeriod;d=E(d,!0),e>360&&(e=360,d=_SL.formatDate.addMin(d,o.searchPeriod-e));for(var f=0;f<e;f+=o.chartPeriod)c=_SL.formatDate.addMin(d,o.chartPeriod),s.groupSchTime.push({schStartTime:d,schEndTime:c}),d=c;Z({})}F()},D=function(){var a=1;o.searchPeriod>60&&(a=o.searchPeriod<360?o.searchPeriod/60:360==o.searchPeriod?5:10),o.chartPeriod=a},E=function(a,b){var c=parseInt(a.substring(10,12),10)%o.chartPeriod;return 0!=c&&(a=_SL.formatDate.addMin(a,(b?o.chartPeriod:0)-c)),a},F=function(){var a=p.body.find(".filter-detail h5"),b=o.myfilter_name;a.attr("data-ui","tooltip").data("text","검색조건 : "+o.strQuery),"Y"==o.chart_yn?(b+=" - ["+o.stats_func.toUpperCase()+(""==o.stats_field?"":"("+V(o.stats_field)+")")+"]",G(o.chart_type),p.chart.show()):(r.chartInfo=[],p.chart.hide()),a.html(b),"Y"==o.list_yn?(p.logTable.show(),$(".rows-detail",p.body).text(""),$(".rows-detail",p.body).show(),K()):($(".rows-detail",p.body).hide(),p.logTable.hide()),slui.attach.tooltip("#componentcontainer_"+d)},G=function(a){var b=q.oChart;b?b.chartType(a):FusionCharts.ready(function(){$.Dashboard.chartInstance[d]=q.oChart=new FusionCharts({type:a,renderAt:"chart_"+d,width:"100%",height:180,dataFormat:"json",dataSource:{chart:oa,categories:[{category:[]}],dataset:[]}}).render()})},H=function(){return _SL.formatDate.addMin(gGetServerTime(),-o.delay)},I=function(){return _SL.formatDate.addMin(H(),-o.cycle)},J=function(){o.searchPeriod<5&&(o.searchPeriod=5);var a,b;p.logTable.empty();var b=$("<tr></tr>");for(var c in o.viewFields)a=a?" width="+a:"",b.append("<th"+a+" scope='col'>"+V(o.viewFields[c])+"</th>");p.logTable.append($("<thead>").append(b)),b=$("<tr height=25></tr>"),$("<td style='cursor:default'>검색 결과가 없습니다.</td>").attr({colspan:o.viewFields.length}).appendTo(b),p.logTable.append($("<tbody tabindex='1' style='cursor:pointer'>").append(b))},K=function(){},L=function(){var a=s.schTime.shift();$.when(gDFD.fldToCodes,N(a.schStartTime,a.schEndTime,0))},M=function(){var a=s.groupSchTime.shift();if(a){var b={start_time:a.schStartTime,end_time:a.schEndTime,query:o.strQuery,stats_func:o.stats_func,stats_field:o.stats_field,series_field:o.series_field,series_vals:o.series_vals||[],nocache:"N"};a.schEndTime>H()&&(b.nocache="Y"),$("body").requestData(h,b,{callback:function(a){X(b.start_time,a),s.groupSchTime.length>0&&M()}})}},N=function(a,b,c,d){var e=++u.proc_idx+"",f=o.searchRows;0==c&&_SL.formatDate.diff(a,b)>6e4&&(f=o.viewRows),s.request.push({proc_idx:e,start_time:a,end_time:b,query:o.strQuery,pageRow:f,startIndex:c,sort_by_field_name:"eqp_dt",sort_by_order:"desc"}),s.appendTo[e]=d,0==u.reqTimerId&&O()},O=function(){$("body").requestData(g,s.request.shift(),{callback:function(a){s.response.push(a),P(),s.request.length>0?u.reqTimerId=setTimeout(L,o.intervalPerReq):u.reqTimerId=0}})},P=function(){s.response.length&&!s.curResponse&&(u.outTimerId=setTimeout(Q,30))},Q=function(){var a=s.response.shift();a&&(s.curResponse={proc_idx:a.proc_idx,start_time:a.start_time,end_time:a.end_time,startIndex:a.startIndex,rows:a.rsList.length,total:a.total},!s.last_end_time||s.last_end_time<a.end_time?s.last_end_time=a.end_time:s.last_end_time==a.end_time&&0==a.startIndex&&R(),u.curTotal=a.total,u.curRows=a.rsList.length,0==u.curViewRowCnt&&U(1),s.buffers=a.rsList,p.logTable.find("tr.no1").removeClass("no1"),S())},R=function(){var a,b=s.curResponse;b&&(a=s.appendTo[b.proc_idx],a&&(s.appendTo[b.proc_idx]=null,delete s.appendTo[b.proc_idx]),s.curResponse=null)},S=function(){var a,b,c,d=((new Date).getTime(),s.curResponse);if(d){var e=d.proc_idx,f=s.appendTo[e],g=!0;if(_SL.formatDate.diff(d.start_time,d.end_time)>6e4&&(g=!1),f){if(!f.parent().length)return R(),void P();f.hasClass("mylogdata-more")?(f=f.prev(),s.appendTo[e].remove(),s.appendTo[e]=f):console.log("Don't have 'mylogdata-more' Class")}else $(".rows-detail",p.body).text("["+_SL.formatDate(d.start_time,"HH:mm")+(g?"":"~"+_SL.formatDate(d.end_time,"HH:mm"))+" - "+_SL.toComma(d.total)+" Rows]");g&&s.buffers.length==d.rows&&d.startIndex+d.rows<d.total&&(b=$("<tr class='mylogdata-more no1'>").append($("<td class='mylogdata-td mylogdata-more'>").text("["+_SL.formatDate(d.start_time,"HH:mm")+"] More "+_SL.toComma(d.total-d.startIndex-d.rows)+" Rows...").attr({valign:"middle",colspan:o.viewFields.length}).data("response",d)),f?f.after(b):p.logTable.find("tbody").prepend(b));var h=Math.min(o.rowsPerOut,s.buffers.length),i=s.buffers.splice(s.buffers.length-h,h),j=o.viewFields,k=j.length;if(i&&i.length>0){for(var l=document.createDocumentFragment(),m=document.createDocumentFragment(),n=0;n<i.length;n++){a=i[n],b=document.createElement("tr"),b.className="no1",b.setAttribute("aria-value",a.eqp_dt);for(var q=0;q<k;q++)c=document.createElement("td"),T(c,a,j[q],a[j[q]]||""),m.appendChild(c);l.appendChild(b),b.appendChild(m)}f?f.after(l):p.logTable.find("tbody").prepend(l),u.curViewRowCnt+=i.length;var r=u.curViewRowCnt-o.viewRows;if(r>0&&(U(r),u.curViewRowCnt-=r),s.buffers.length>0)return void(u.outTimerId=setTimeout(S,o.intervalPerOut))}else 0==u.curViewRowCnt&&(b=$("<tr></tr>"),$("<td>검색 결과가 없습니다.</td>").attr({valign:"middle",colspan:k}).appendTo(b),b.appendTo(p.logTable.find("tbody")));R(),P()}},T=function(a,b,c,d){var e,f;a.className="mylogdata-td",a.setAttribute("aria-value",d),"eqp_dt"==c||"recv_time"==c?(d=_SL.formatDate(d,"yyyyMMddHHmmss","yyyy-MM-dd HH:mm:ss"),a.setAttribute("title",d),d=d.substring(11)):"src_ip"==c||"dstn_ip"==c||(t.flagFields[c]?(f=c.match(/^[^_]+_/),e=b[f+"country_code"],e&&("PRN"==e?e="PR-N":"N/A"==b[f+"country_name"]&&(e="N-A"),a.appendChild($("<img src='"+gCONTEXT_PATH+"resources/images/flag/"+e+".png' style='margin-right:5px;'/>")[0]))):(gDFD.fldToCodes.data[c]&&gDFD.fldToCodes.data[c][d]&&(d=gDFD.fldToCodes.data[c][d]+"["+d+"]"),t.reOverLengthSuffix.test(d)&&(d=d.replace(t.overLengthSuffix,"")),d.length>55&&a.setAttribute("title",d),t.alignCenterFieldRegExp.test(c)||(a.className+=" align_left"))),a.appendChild(document.createTextNode(d))},U=function(a){for(var b,c=(new Date).getTime(),d=p.logTable[0],e=document.createDocumentFragment(),f=d.rows.length,g=1;g<=a;g++)b=d.rows[f-g],b.className.indexOf("mylogdata-more")!=-1&&a++,e.appendChild(b);$(e).remove(),e=null,c=(new Date).getTime()-c},V=function(a){return LogCaptionInfo[a]||a},W=function(a,b,c){for(var d=!1,e=0;e<c.length;e++){if((a[c[e]]||"")!=(b[c[e]]||""))if($.isArray(a[c[e]])&&$.isArray(b[c[e]])&&a[c[e]].length==b[c[e]].length){for(var f=0;f<a[c[e]].length;f++)if((a[c[e]][f]||"")!=(b[c[e]][f]||"")){d=!0;break}}else d=!0;if(d)break}return d},X=function(a,b){var c,d=r.chartInfo,e={};c=0==d.length?{}:d[d.length-1],c.start_time==a?c.rsList=b:d.push({start_time:a,rsList:b});for(var f=o.searchPeriod/o.chartPeriod;d.length>f;)c=d.shift(0,1);0==s.groupSchTime.length&&(e=Y(d),e.chart=oa,Z(e))},Y=function(a){a||(a=[]);var b,c="start_time",d="",e={},f={},g={},h=[];e={categories:[{category:[]}],dataset:[]},_()&&(d=o.series_field),b=a.length;var i,j,k,l,m,n;n="count"==o.stats_func&&""==d?"total":"func_value";for(var p=0;p<b;p++){i=a[p],i.rsList||(i.rsList=[]),j={},l=i[c],j.value=l,j.label=ba(l,c,!0),j.toolText=ba(l,c);for(var q=0;q<i.rsList.length;q++){if(k=i.rsList[q],m="",""==d)l="[전체]";else if(m=l=k[d],"_etc"==l){if("Y"!=o.series_val_etc)continue;l="[기타]"}else l=ba(l,d);f[l]||(f[l]=[]),"undefined"==typeof g[j.value]&&(g[j.value]=h.length,h.push({label:j.label,toolText:j.toolText})),f[l][g[j.value]]={value:k[n],link:aa(j.value,d,m)}}}e.categories=[{category:h}];for(var r in f)e.dataset.push({seriesname:r,data:f[r]});return e},Z=function(a){var b=q.oChart;b&&b.setChartData(a,"json")},_=function(){return o.series_field&&""!=o.series_field&&o.series_vals&&o.series_vals.length>0},aa=function(a,b,c){var e="javascript:$.Dashboard.componentInstance['"+d+"'].goLogSearch('"+a+"'";return""!=b&&(e+=",'"+b+"','"+_SL.javascriptEscape(c)+"'"),e+=")"},ba=function(a,b,c){var d,e=c?"":"yyyy-MM-dd";return"start_time"==b?d=_SL.formatDate(a,"yyyyMMddHHmm",e+" HH:mm"):"total"==b||"func_value"==b?d=_SL.toComma(a):(d=a,gDFD.fldToCodes.data[b]&&gDFD.fldToCodes.data[b][a]&&(pFldVal=gDFD.fldToCodes.data[b][a]+"["+a+"]")),d},ca=function(a){var b=$(a.target).val(),c={};""==b?(c.myfilter_id="",c.myfilter_type="",c.myfilter_name=""):c=$.parseJSON(b),B(c.myfilter_id,c.myfilter_type,function(a){da(a.viewFields,o.stats_field),ea(a.viewFields,o.series_field)})},da=function(a,b){var c=p.form.find("[name=stats_field]");c.empty().append($("<option/>").val("").text("[필드 선택]"));for(var d=0;d<a.length;d++)$("<option />").attr("selected",b==a[d]).val(a[d]).text(V(a[d])).appendTo(c)},ea=function(a,b){var c=p.form.find("[name=series_field]");c.empty().append($("<option/>").val("").text("[미지정]"));for(var d=0;d<a.length;d++)$("<option />").attr("selected",b==a[d]).val(a[d]).text(V(a[d])).appendTo(c)},fa=function(a){var b=$(a.target).val(),c=p.body.find(".area-series-val");""==b?c.hide():c.show()},ga=function(a){var b=$(a.target).val(),c=p.form.find("[name=stats_field]");"count"==b?c.hide():c.show()},ha=function(a){var b=$(a.target).val();p.form.find("[name="+a.target.name+"]").each(function(){$(this).removeClass("selected"),this.value==b&&$(this).addClass("selected")})},ia=function(a){var b=p.form.find("[name=t_inp_val]"),c=p.form.find("[name=series_vals]"),d=b.val(),e=c.find("option");if(""==d)return void _alert("범례 항목에 추가할 값을 입력하세요.");for(var f=0;f<e.length;f++)if(e.eq(f).val()==d)return void _alert("중복된 값이 존재합니다.");c.append($("<option>").val(d).text(d)),b.val(""),b.focus()},ja=function(a){p.form.find("[name=series_vals] option:selected").remove()},ka=function(a){$(a.target).hasClass("mylogdata-more")?la(a):ma(a)},la=function(a){var b=$(a.target).data("response"),c=_SL.formatDate.addMin(b.start_time,o.cycle);N(b.start_time,c,b.startIndex+b.rows,$(a.target).closest("tr"))},ma=function(a){var b=$(a.target),c=o.viewFields[b.index()],d=b.attr("aria-value"),e=b.closest("tr").attr("aria-value").substring(0,12);na(e,c,d,1)},na=function(a,b,c,d){var e=o.strQuery;c&&("-"==c?(""!=e&&(e="("+e+") AND "),e+=b+":*"):"_etc"==c?(e=(""==e?"*:*":"("+e+")")+" NOT ",e+=b+":("+o.series_vals.join(" ")+")"):(""!=e&&(e="("+e+") AND "),e+=b+":"+_SL.luceneValueEscape(c)));var f=$("<form>").attr({target:"logSearchWin_"+(new Date).getTime(),action:i,method:"post"});f.append($("<input type='hidden' name='start_time'>").val(a)).append($("<input type='hidden' name='end_time'>").val(_SL.formatDate.addMin(a,d?d:o.chartPeriod))).append($("<input type='hidden' name='myfilter_id'>").val(j.myfilter_id)).append($("<input type='hidden' name='expert_keyword'>").val(e)).append($("<input type='hidden' name='template_id'>").val("popup")).appendTo("body").submit().remove()},oa={paletteColors:"89cf43,0099ff,ced2ff,9fa7ff,6dd0f7,dfbcfe,7dcbff,c07cfe,669933,dddddd",showValues:"0"};return{config_param:j,component_title:k,isOpenConfig:l,load:v,refresh:w,showConfig:x,validateConfig:y,beforeSaveConfig:z,afterSaveConfig:A,goLogSearch:na}};