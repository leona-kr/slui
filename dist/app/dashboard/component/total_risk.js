"use strict";_SL.nmspc("slapp.component").total_risk=function(a,b,c,d){var e=a,f=($("#componentbody_"+e),$("#config_"+e+" form")),g=$("#result-container_"+e),h=f.find("#area-table-risk-level"),i=f.find("#area-table-risk-ruleset"),j=gCONTEXT_PATH+"component/total_risk_chart.json",k=gCONTEXT_PATH+"component/total_risk_data.json",l=gCONTEXT_PATH+"system/risk_ruleset_update.do",m=c,n=function(){o()},o=function(){$("body").requestData(j,{curDate:(new Date).getTime()},{callback:function(a){a>0&&a<6&&p(a)}})},p=function(a){switch(a){case 1:g.attr("class","text-success").text("Normal");break;case 2:g.attr("class","text-info").text("Attention");break;case 3:g.attr("class","text-attention").text("Notice");break;case 4:g.attr("class","text-warning").text("Alert");break;case 5:g.attr("class","text-danger").text("Serious")}},q=function(){$("body").requestData(k,{async:!1},{callback:function(a){h.empty(),i.empty(),r(a.level_list),s(a.levels,a.events,a.evtWgtConfig),f.find("[name=ratio]").change(t),f.find("[name=ratio]").css("background-color","")}})},r=function(a){var b=$('<table class="board-table-group table-risk-ruleset"></table>'),c=$("<colgroup>"),d=$("<thead>"),e=$("<tbody>"),f=$("<tr>");c.append("<col width=118>").append("<col span=4>"),f.append('<th scope="col">구분</th>');for(var g=1;g<a.length;g++)f.append('<th scope="col">'+a[g].risk_nm+"<br>"+a[g].risk_nm_eng+"</th>");d.append(f),f=$("<tr>"),f.append("<td>위험률</td>");for(var g=1;g<a.length;g++)f.append('<td><input type="text" name="risk_range_from" class="form-input" value="'+a[g].risk_range_from+'" data-valid="required,number,min=0,max=100">').append('<input type="hidden" name="risk_level" class="form-input" value="'+a[g].risk_level+'"</td>');e.append(f),b.append(c).append(d).append(e),b.appendTo(h)},s=function(a,b,c){var d=Object.keys(a).length,e=$('<table class="board-table-group table-risk-ruleset"></table>'),f=$("<colgroup>"),g=$("<thead>"),h=$("<tbody>"),j=$("<tr>");f.append("<col width=118>").append("<col width=84>").append("<col span=3>").append("<col width=72>"),j.append('<th scope="col" rowspan="2">이벤트</th>').append('<th scope="col" rowspan="2">위험도 비중(%)</th>').append('<th scope="col" colspan="3">등급 가중치(건당)</th>').append('<th scope="col" rowspan="2">위험도 산출<br/> 최대 건수</th>'),g.append(j),j=$("<tr>");for(var k=d;k>0;k--){var l;switch(k){case 1:l="highlight-success";break;case 2:l="highlight-attention";break;case 3:l="highlight-danger"}j.append('<th scope="col" class="'+l+'">'+a[k]+"</th>")}g.append(j);for(var m in b){if(j=$("<tr>"),5!=m){if(j.append("<td>"+b[m]+'<input type="hidden" name="event_type" value="'+m+'"></td>').append('<td><input type="text" name="ratio" class="form-input" value="'+c[m].ratio+'" data-valid="required,number,min=0,max=100"></td>'),4==m)for(var n=$("<td>").text("-").addClass("align-center").attr("colspan","3").appendTo(j),o=d;o>0;o--)n.append('<input type="hidden" name="lv'+o+'" class="form-input" value="1" data-valid="등급가중치,required,number,min=0,max=100">');else for(var o=d;o>0;o--)j.append('<td><input type="text" name="lv'+o+'" class="form-input" value="'+c[m]["lv"+o]+'" data-valid="등급가중치,required,number,min=0,max=100"></td>');j.append('<td><input type="text" name="max_cnt" class="form-input" value="'+c[m].max_cnt+'" data-valid="산정 최대건수,required,number,min=0,max=99999"></td>')}h.append(j)}e.append(f).append(g).append(h).appendTo(i)},t=function(){var a,b=f.find("[name=ratio]"),c=b.length-1,d=parseInt(this.value,10),e=b.eq(c)[0]==this,g=0;if(isNaN(d)||d<0||d>100){_alert("잘못된 입력 값입니다.");for(var h=0;h<=c;h++)a=b.eq(h)[0],this!=a&&(g+=parseInt(a.value,10));return this.value=100-g,this.focus(),!1}b.css("background-color",""),$(this).css("background-color","#ffff44"),g=d;for(var h=0;h<=c;h++)a=b.eq(h)[0],this!=a&&(g+=parseInt(a.value,10),(g>100||h==c+(e?-1:0))&&(a.value=parseInt(a.value,10)+100-g,$(a).css("background-color","#ffff44"),g=100))},u=function(){var a=f.find("[name=risk_range_from]"),b=-1,c=!0;if(!_SL.validate(f))return!1;for(var d=0;d<a.size();d++){if(parseInt(a.eq(d).val())<=b)return void _alert("이전 단계보다 위험율이 커야 합니다.",{onAgree:function(){a.eq(d).focus(),c=!1}});b=parseInt(a.eq(d).val())}return!!c&&($("body").requestData(l+"?"+f.serialize()),!0)},v=function(){o()};return{component_title:m,load:n,refresh:o,showConfig:q,validateConfig:u,afterSaveConfig:v}};