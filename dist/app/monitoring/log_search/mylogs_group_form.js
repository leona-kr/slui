"use strict";_SL.nmspc("monitoring").mylogs_group_form=function(){var a={urlGroupList:gCONTEXT_PATH+"monitoring/gGroup_List_Json.json",gridId:"#gridMylogGroupList",urlGetMylogGroupList:gCONTEXT_PATH+"monitoring/mylogs_list.json",logSearch:gCONTEXT_PATH+"monitoring/log_search.html",urlLink:gCONTEXT_PATH+"monitoring/mylogs_form.html",formId:"#searchMylogsGroup"},b={form:$("#searchMylogsGroup"),grid:$(a.gridId)},c=function(){j.init(),i.init(),d(),self.focus(),$("#group_name").keypress(function(a){"13"==a.which&&a.preventDefault()})},d=function(){$(".btn-submit").off().on("click",function(){e(b.grid)}),$("#group_name").off().on("keyup",function(a){var b=$(this).val();b.length>=50&&_alert("50 글자를 초과했습니다")}),$(".write-cancel").off().on("click",function(){jsSubmit("CANCEL")})},e=function(b){var c=$("#s_group_id").val(),d={datatype:"json",datafields:[{name:"cnt",type:"string"},{name:"mylogs_name",type:"string"},{name:"search_stime",type:"string"},{name:"search_query",type:"string"},{name:"save_count",type:"string"},{name:"log_file_name",type:"string"},{name:"search_etime",type:"string"},{name:"mylogs_id",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(d.totalrecords=a.totalRows)},cache:!1,url:a.urlGetMylogGroupList+"?s_group_id="+c},e=new $.jqx.dataAdapter(d,{beforeLoadComplete:function(a){for(var b in a)a[b].search_stime=_SL.formatDate(a[b].search_stime,"yyyyMMddHHmm","yyyyMMddHHmm"),a[b].search_etime=_SL.formatDate(a[b].search_etime,"yyyyMMddHHmm","yyyyMMddHHmm");return a},formatData:function(b){var c,d={},e=$(a.formId).serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(b,d),b},loadError:function(a,b,c){_alert(c)}});b.jqxGrid({source:e,sortable:!0,width:"100%",virtualmode:!0,enablehover:!1,rendergridrows:function(a){return a.data},columns:[{text:"번호",columntype:"number",width:40,cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"이름",datafield:"mylogs_name",cellsalign:"center",width:"18%",cellsrenderer:function(a,b,c,d,e,f){return"0"==$("#s_group_id").val()?$(d).html(""+f.mylogs_name)[0].outerHTML:$(d).html('<button type="button" class="btn-link" data-mylogs_id='+f.mylogs_id+">"+f.mylogs_name+"</button>")[0].outerHTML}},{text:"발생시간",datafield:"search_stime",cellsalign:"center",width:"20%",cellsrenderer:function(a,b,c,d,e,f){var g=_SL.formatDate(f.search_stime,"yyyyMMddHHmm","MM-dd HH:mm"),h=_SL.formatDate(f.search_etime,"yyyyMMddHHmm","MM-dd HH:mm");return $(d).html(g+" ~ "+h)[0].outerHTML}},{text:"검색어",datafield:"search_query"},{text:"저장건수",datafield:"save_count",cellsalign:"center",width:"12%"},{text:"보기",datafield:"log_file_name",cellsalign:"center",width:"12%",cellsrenderer:function(a,b,c,d,e,f){return null==f.log_file_name?$(d).html('<button type="button" class="btn-link" data-line='+a+">처리중</button>")[0].outerHTML:$(d).html('<button type="button" class="btn-link" data-line='+a+">결과보기</button>")[0].outerHTML}}]}),b.on("cellclick",function(a){"log_file_name"===a.args.datafield?h(a.args.row.bounddata.search_stime,a.args.row.bounddata.search_etime,a.args.row.bounddata.search_query,a.args.row.bounddata.mylogs_id):"mylogs_name"===a.args.datafield&&f(a.args.row.bounddata.mylogs_id)})},f=function(b){if("0"==$("#s_group_id").val())return void _alert("공유 건은 수정할 수 없습니다.");$("mylogs_id").val(b);var c=a.urlLink+"?mylogs_id="+b;g(c)},g=function(a){new ModalPopup(a,{height:300,onClose:function(){e(b.grid)}})},h=function(c,d,e,f){var g=b.form.find("[name='logSearchForm']");0==g.length&&(g=$('<form name="logSearchForm">'),g.append('<input type="hidden" name="start_time">'),g.append('<input type="hidden" name="end_time">'),g.append('<input type="hidden" name="filter_type">'),g.append('<input type="hidden" name="expert_keyword">'),g.append('<input type="hidden" name="popup" id="popup" value="Y">'),g.append('<input type="hidden" name="mylogs_id">'),b.form.append(g)),$("[name=start_time]",g).val(c),$("[name=end_time]",g).val(d),$("[name=filter_type]",g).val("2"),$("[name=expert_keyword]",g).val(e),$("[name=mylogs_id]",g).val(f);var h="logSearchWin_"+(new Date).getTime();g.attr({target:h,action:a.logSearch}).submit()},i=function(){var a,b=function(){a=$("#searchResultDlg"),a.jqxWindow({width:440,height:130,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5}),$(".btn-save",a).click(function(){g()}),$("#dlgBottomDiv .btn-cancel").click(function(){a=$("#searchResultDlg"),$(a).jqxWindow("close")}),$(".area-buttons .btn-add").click(d),$(".area-buttons .btn-delete").click(e),$(".area-buttons .btn-modify").click(f),c(),$(window).resize(c)},c=function(){var a=$("body").outerHeight()-$(".pop_area").outerHeight();$(".ifrm").css("height",a+"px")},d=function(){var b=j.getCurNode();return b.data.key==gShareGroup.key?void _alert(gShareGroup.title+"는 분류를 추가할 수 없습니다."):($("[name=dlg_mode]",a).val("1"),$("[name=group_id]",a).val(""),$("[name=group_name]",a).val(""),$("[name=group_level]",a).val(b.getLevel()+1),$("[name=parent_group_id]",a).val(b.data.key),a=$("#searchResultDlg"),void a.jqxWindow("open"))},e=function(){var a=j.getCurNode();return a.data.key==gShareGroup.key?void _alert(gShareGroup.title+"는 삭제할 수 없습니다."):1==a.getLevel()?void _alert("최상위 분류는 삭제할 수 없습니다."):a.hasChildren()?void _alert("먼저 하위 분류를 삭제하세요."):void _confirm("삭제 하시겠습니까?<br>현재 분류에 존재하는 검색결과는 상위 분류로 이동됩니다.",{onAgree:function(){$.post("mylogs_group_delete.json",{group_id:a.data.key,parent_group_id:a.getParent().data.key},function(a,b,c){a.RESULT_CODE?"0000"==a.RESULT_CODE?j.delNode():_alert(a.RESULT_MSG):_alert("처리중 에러가 발생했습니다.<br>다시 시도해 보세요.")}).fail(function(a,b){_alert("처리중 에러가 발생했습니다.("+b+")<br>다시 시도해 보세요.")})}})},f=function(){var b=j.getCurNode();return b.data.key==gShareGroup.key?void _alert(gShareGroup.title+"는 수정할 수 없습니다."):($("[name=dlg_mode]",a).val("2"),$("[name=group_id]",a).val(b.data.key),$("[name=group_name]",a).val(b.data.title),$("[name=group_level]",a).val(""),$("[name=parent_group_id]",a).val(""),a=$("#searchResultDlg"),void $(a).jqxWindow("open"))},g=function(){var b,c=$("[name=dlg_mode]",a).val(),d=($("[name=group_id]",a).val(),$("[name=group_name]",a).val());return""==d?void _alert("분류명을 입력하세요."):(b="1"==c?"mylogs_group_insert.json":"mylogs_group_update.json",void $.post(b,$("#group_dlg_form").serialize(),function(b,e,f){b.RESULT_CODE?"0000"==b.RESULT_CODE?("1"==c?j.addNode(d,b.group_id):j.updNode(d),a=$("#searchResultDlg"),$(a).jqxWindow("close")):_alert(b.RESULT_MSG):_alert("처리중 에러가 발생했습니다.<br>다시 시도해 보세요.")}).fail(function(a,b){_alert("처리중 에러가 발생했습니다.("+b+")<br>다시 시도해 보세요.")}))};return{init:b}}(),j=function(){var c={},d=null,f=null,g=function(){var g,h,i=_SL.serializeMap(b.form),j=function(a){var i=a.gGroupListJson;for(var j in i)g=i[j],c[g.group_id]={title:g.group_name,tooltip:g.group_name,key:g.group_id,children:[]},h=c[g.parent_group_id],h?h.children.push(c[g.group_id]):d=c[g.group_id];d.children.push({title:gShareGroup.title,tooltip:gShareGroup.title,key:gShareGroup.key}),$("#mylogsGroupTree").dynatree({minExpandLevel:2,autoFocus:!0,clickFolderMode:3,onActivate:function(a){$("#s_group_id").val(a.data.key),b.grid.unbind(),e(b.grid)},children:[d]}),f=$("#mylogsGroupTree").dynatree("getTree"),gInitGroupId==-1?f.getNodeByKey(d.key).activate():f.getNodeByKey(gInitGroupId).activate();var l;setTimeout(function(){k()},400),$("#expandcontent .section-container").on("resize",function(){clearTimeout(l),l=setTimeout(function(){k()},300)})},k=function(){var a=$("#expandcontent .section-container").height()-$("#expandcontent .section-tree-cols .area-buttons").outerHeight(!0)-10;$("#expandcontent .section-tree-cols ul.dynatree-container").height(a+"px")};$("body").requestData(a.urlGroupList,i,{callback:j})},h=function(){return f.getActiveNode()},i=function(){return h().data.key},j=function(a,b){var c=h();c.addChild({title:a,tooltip:a,key:b}).activate()},k=function(a){h().setTitle(a)},l=function(){var a=h(),b=a.getParent();a.remove(),b.activate()};return{init:g,getCurNode:h,getCurId:i,addNode:j,updNode:k,delNode:l}}();return{init:c,GroupManager:i,TreeManager:j}}(),$(function(){slapp.monitoring.mylogs_group_form.init()});