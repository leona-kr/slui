"use strict";_SL.nmspc("slapp.component").eps_security_event=function(a,b,c){var d=a,e=($("#"+d+"_inner_container"),$("#componentbody_"+d)),f=$("#config_"+d+" form"),g=gCONTEXT_PATH+"component/eps_security_event_list.do",h=gCONTEXT_PATH+"event2/eps_ip_event_list.html",i={},j=$("#config_"+d+" .btn-apply"),k=b,l=c,m=function(){this.title=l,this.config_param=k=$.extend({},i,k),o()},n=function(){e.on("click",".goSmsView_"+d,function(){var a=$(this).attr("key").split(","),b=a[2],c=a[1],d=_SL.formatDate.addMin(a[3],1),e=_SL.formatDate.addMin(d,-30);q(urlPerformanceViewList+"?s_eqp_type_cd="+c+"&s_eqp_ip="+b+"&start_time="+e+"&end_time="+d)}),f.on("click",j,function(){k=$.extend({},_SL.serializeMap(f)),o(),_setTitle(),_setParam()}),e.find(".grid-table-group [class*=color_ec]").off().on("click",function(){var a=$(this),b=a.data("tc_type"),c=a.data("event_cate_cd"),d=a.data("count"),f=a.data("start_time"),g=a.data("end_time"),i=e.find("[name=epsSecurityEventForm]");i.find("[name=start_time]").val(f),i.find("[name=end_time]").val(g),i.find("[name=count]").val(d),i.find("[name=event_cate_cd]").val(c),i.find("[name=tc_type]").val(b);var j="epsSecurityEventWin_"+(new Date).getTime();i.attr({action:h,target:j,method:"post"}).submit()})},o=function(){var a=e.find(".grid-table-group tbody").empty(),b=e.find(".grid-table-group thead").empty(),c=function(c){var d=c.rsList,e=c.eventCates;b.append("<th scope='col'>구분</th>");for(var f in e)b.append("<th scope='col'><span>"+f+"단계</span><br>("+e[f]+")</th>");0==d.length&&a.append("<tr><td colspan='9' class='list-empty'> 검색 결과가 없습니다. </td></tr>");for(var f in d){var g=d[f],h=$("<tr>"),i="";i="1"==g.tc_type?"Trigger":"Trace",h.append("<td>"+i+"</td>");for(var j in e){var k=g["cate"+j+"_cnt"],l=$("<td>");l.append(k),0!=k&&l.attr("tabindex","1").addClass("color_ec"+j).data({tc_type:g.tc_type,event_cate_cd:j,count:k,start_time:c.start_time,end_time:c.end_time}),l.appendTo(h)}h.appendTo(a)}n()};k=$.extend({},i,k),$("body").requestData(g,k,{callback:c})},p=function(){o()},q=function(a){new ModalPopup(a,{width:1e3,height:900,onClose:function(){p()}})};return{config_param:k,component_title:l,load:m,refresh:p}};