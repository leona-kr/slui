"use strict";_SL.nmspc("tagging").sqlList=function(){var a={urlList:gCONTEXT_PATH+"sysdata/user_tagging_sql_list.json",formId:"#formTaggingSqlList",gridHeadId:"#gridTaggingSqlListHead",gridId:"#gridTaggingSqlList"},b={form:$(a.formId),gridHead:$(a.gridHeadId),grid:$(a.gridId),sqlStmt:$(a.formId+" [name=sqlStmt]"),currPage:$(a.gridHeadId+" [name=currPage]")},c=function(){i(),e(),d()},d=function(){"ERROR"==rsMsg?_alert("SQL에 오류가 있습니다.",{onAgree:function(){self.close()}}):"OK"==rsMsg&&slapp.tagging.form.setSqlCheck()},e=function(){b.gridHead.find(".btn-prev").off().on("click",function(){f()}),b.gridHead.find(".btn-next").off().on("click",function(){g()}),b.currPage.off().on("keydown",function(){h()}),b.gridHead.find("[name=pageRow]").change(function(){j()})},f=function(){var a=parseInt(b.currPage.val());if(1!=a){if(0==b.currPage.data("total-page"))return void b.currPage.val(1);b.currPage.val(a-1),j()}},g=function(){var a=parseInt(b.currPage.val());if(a!=b.currPage.data("total-page")){if(0==b.currPage.data("total-page"))return void b.currPage.val(1);b.currPage.val(a+1),j()}},h=function(){var a=(event.srcElement||event.target).value,c=parseInt(b.currPage.data("total-page"));if(13==event.keyCode){if(isNaN(a)||parseInt(a)<1||parseInt(a)>c)return;$("#currPage").val(a),j()}},i=function(){var c=$.extend({},_SL.serializeMap(b.form),{pagesize:b.form.find("[name=pageRow]").val()});$("body").requestData(a.urlList,c,{callback:function(a,c,d){b.grid.empty();var e=$("<thead>"),f=$("<tbody>"),g=$("<tr>");if(a){var h=a.sqlList;$("#sqlTotalCnt").text(_SL.formatNumber(a.totalCount)),$("#sqlSpanTotalPage").text(_SL.formatNumber(a.totalPage)),b.currPage.data("total-page",a.totalPage);var i=Object.keys(h[0]),j=i.length>2?2:i.length;g.append('<th scope="col" style="width:50px;">번호</th>');for(var k=0;k<j;k++)g.append('<th scope="col">'+i[k]+"</th>");e.append(g);for(var l in h){g=$("<tr>");var m=h[l];g.append('<td class="align-center">'+(parseInt(l)+1+a.recordstartindex)+"</td>");for(var n=0;n<j;n++)g.append('<td class="align-center">'+m[i[n]]+"</td>");f.append(g)}b.grid.append(e).append(f)}else g.append('<th scope="col">번호</th>'),e.append(g),g=$("<tr>"),g.append('<td class="list-empty">There is no Search Result</td>'),f.append(g);b.grid.append(e).append(f)}})},j=function(){i()};return{init:c}}(),$(function(){slapp.tagging.sqlList.init()});