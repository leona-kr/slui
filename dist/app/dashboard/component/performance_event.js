"use strict";_SL.nmspc("slapp.component").performance_event=function(a,b,c){var d=a,e=$("#componentbody_"+d),f=$("#config_"+d+" form"),g=e.find(".grid-table-group"),h=(e.find(".goSmsView"),f.find(".btn-apply"),f.find("[name=sms_type]")),i=f.find("[name=event_level]"),j=f.find("[name=rows]"),k=gCONTEXT_PATH+"monitoring/performance_view.html",l=gCONTEXT_PATH+"sysdata/comcode_map.json",m=gCONTEXT_PATH+"sysdata/comcode_map.json",n=gCONTEXT_PATH+"component/performance_event.json",o={},p=b,q=c,r=function(){this.title=q,this.config_param=p=$.extend({},o,p),v(),e.off().on("click","[class^=goSmsView_]",function(){var a=$(this).attr("data-key").split(","),b=a[2],c=a[1],d=_SL.formatDate.addMin(a[3],1),e=_SL.formatDate.addMin(d,-30);B(k+"?s_eqp_type_cd="+c+"&s_eqp_ip="+b+"&start_time="+e+"&end_time="+d)}),w()},s=function(){h.val(p.sms_type),i.val(p.event_level),j.val(p.rows)},t=function(){p.sms_type=h.val(),p.event_level=i.val(),p.rows=j.val()},u=function(){w()},v=function(){ComCodes.CS0003?z():$("body").requestData(l,{code_type:"CS0003"},{callback:function(a,b,c){ComCodes.CS0003=a,z(),y()}}),ComCodes.CS0005?A():$("body").requestData(m,{code_type:"CS0005"},{callback:function(a,b,c){ComCodes.CS0005=a,A(),y()}}),x()},w=function(){var a=g.find("tbody");$("body").requestData(n,p,{callback:function(b){a.empty();var c=b?b.length:0;if(c>0)for(var e,f=0;f<c;f++){var g=b[f].eqp_ip,h=b[f].curr_val,i=_SL.formatNumber(h),j=b[f].limit_val,k=_SL.formatNumber(j),l=_SL.formatDate(b[f].eqp_time,"yyyyMMddHHmm","yyyy-MM-dd HH:mm"),m=(b[f].event_level,b[f].eqp_type_cd);e=$("<tr />").append("<td>"+(f+1)+"</td>").append("<td><a class='goSmsView_"+d+"' tabindex='1' style='cursor:pointer;' data-key='"+d+","+m+","+g+","+b[f].eqp_time+"'>"+b[f].eqp_nm+"("+g+")</a></td>").append("<td>"+b[f].sms_type_nm+"</td>"),"1"==b[f].event_level?e.append("<td><span class='label-success'>Low</span></td>"):"2"==b[f].event_level?e.append("<td><span class='label-attention'>Middle</span></td>"):"3"==b[f].event_level&&e.append("<td><span class='label-danger'>High</span></td>"),"1"==b[f].sms_type||"2"==b[f].sms_type?e.append("<td>"+h+"% / "+j+"%</td>"):e.append("<td><span>"+i+"</span>/<span>"+k+"</span></td>"),e.append("<td>"+l+"</td>"),e.appendTo(a).hide().fadeIn(1500)}else a.append('<tr><td scope="col" colspan="6">There is no Search Result</td></tr>')}}),y()},x=function(){A(),z(),p.rows&&$("#config_"+d+" [name=rows] option").each(function(){$(this).val()==p.rows&&$(this).prop("selected",!0)})},y=function(){var a="",b=0;for(var c in p)""!=p[c]&&("sms_type"==c?(a+=b>0?" , ":"",a+="구분 : ",ComCodes.CS0003?a+=ComCodes.CS0003[p[c]]:$("body").requestData(l,{code_type:"CS0003"},{callback:function(b,d,e){ComCodes.CS0003=b,a+=ComCodes.CS0003[p[c]]}}),b++):"event_level"==c&&(a+=b>0?" , ":"",a+="등급 : ",ComCodes.CS0005?a+=ComCodes.CS0005[p[c]]:$("body").requestData(m,{code_type:"CS0005"},{callback:function(b,d,e){ComCodes.CS0005=b,a+=ComCodes.CS0005[p[c]]}}),b++));0==b?$("#"+d+"_inner_container .sp-title h5").text("전체"):$("#"+d+"_inner_container .sp-title h5").text(a)},z=function(){h.html('<option value="">[선택하세요]</option>');for(var a in ComCodes.CS0003){var b=$("<option>").val(a).text(ComCodes.CS0003[a]);p.sms_type==a&&b.prop("selected",!0),h.append(b)}},A=function(){i.html('<option value="">[선택하세요]</option>');for(var a in ComCodes.CS0005){var b=$("<option>").val(a).text(ComCodes.CS0005[a]);p.event_level==a&&b.prop("selected",!0),i.append(b)}},B=function(a){window.open(a,"performView"+(new Date).getTime())};return{config_param:p,component_title:q,load:r,refresh:w,showConfig:s,beforeSaveConfig:t,afterSaveConfig:u}};