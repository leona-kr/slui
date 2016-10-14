"use strict";_SL.nmspc("bigFileData").list=function(){var a={urlList:gCONTEXT_PATH+"analysis/big_file_data_list.json",urlForm:gCONTEXT_PATH+"analysis/big_file_data_form.html",urlView:gCONTEXT_PATH+"analysis/big_file_data_view.html",urlDelete:gCONTEXT_PATH+"analysis/big_file_data_delete.do",formId:"#searchBigFileDataList",gridId:"#gridBigFileDataList"},b={form:$(a.formId),grid:$(a.gridId)},c=function(){d(b.grid),e()},d=function(b){var c={datatype:"json",datafields:[{name:"file_id",type:"string"},{name:"normalize_type",type:"string"},{name:"normalize_type_nm",type:"string"},{name:"file_data_name",type:"string"},{name:"org_file_name",type:"string"},{name:"status_nm",type:"string"},{name:"proc_id",type:"string"},{name:"proc_nm",type:"string"},{name:"proc_dt",type:"string"},{name:"log_psr_id",type:"string"},{name:"log_psr_nm",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(c.totalrecords=a.totalRows)},cache:!1,url:a.urlList},d=new $.jqx.dataAdapter(c,{beforeLoadComplete:function(a){for(var b in a)a[b].proc_dt=_SL.formatDate(a[b].proc_dt,"yyyyMMddHHmmss","yyyy-MM-dd HH:mm:ss");return a},formatData:function(b){var c,d={},e=$(a.formId).serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(b,d),b},loadError:function(a,b,c){alert(c)}});b.jqxGrid({source:d,sortable:!1,width:"100%",virtualmode:!0,selectionmode:"checkbox",enablehover:!1,rendergridrows:function(a){return a.data},columns:[{text:"No",columntype:"number",width:40,cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"파일데이터명",datafield:"file_data_name",cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c)[0].outerHTML}},{text:"정규화방법",datafield:"normalize_type_nm",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){var g;return g=2==f.normalize_type?"로그파서("+c+")":c,$(d).text(g)[0].outerHTML}},{text:"파일명",datafield:"org_file_name",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).text(c)[0].outerHTML}},{text:"등록자",datafield:"proc_id",cellsalign:"center",width:"12%",cellsrenderer:function(a,b,c,d,e,f){return $(d).html(c+"("+f.proc_nm+")")[0].outerHTML}},{text:"등록일",datafield:"proc_dt",cellsalign:"center",width:"15%",cellsrenderer:function(a,b,c,d){return $(d).text(c)[0].outerHTML}},{text:"진행상태",datafield:"status_nm",cellsalign:"center",width:"10%",cellsrenderer:function(a,b,c,d,e,f){var g;return g="완료"==c?'<button type="button" class="btn-link">'+c+"</button>":c,$(d).html(g)[0].outerHTML}}]}),b.on("cellclick",function(b){if("status_nm"==b.args.datafield){var c=b.args.row.bounddata.status_nm,d=b.args.row.bounddata.file_id;"완료"==c&&g(a.urlView+"?file_id="+d)}})},e=function(){var c=b.grid.parent().siblings(".grid-bottom").find(".btn-add"),d=b.grid.parent().siblings(".grid-bottom").find(".btn-delete");b.form.find(".form-submit").off().on("click",function(){f()}),c.off().on("click",function(){new ModalPopup(a.urlForm,{width:1080,height:200,onClose:function(){f()}})}),d.off().on("click",function(){var a=[],c=b.grid.jqxGrid("selectedrowindexes"),d=b.grid.jqxGrid("getdisplayrows"),e=[];for(var f in d)for(var g=0,i=c.length;g<i;g++)c[g]==d[f].boundindex&&e.push(d[f].boundindex);if(e.length>0){for(var g in e){var j=b.grid.jqxGrid("getrowdata",e[g]);if(!j)break;a.push(j.file_id)}h(a)}else _alert("삭제할 데이터를 선택하세요.")})},f=function(){b.grid.jqxGrid("updatebounddata"),b.grid.jqxGrid("clearselection")},g=function(a){new ModalPopup(a,{width:1080,height:500,setScroll:!0,onClose:function(){f()}})},h=function(b){_confirm("삭제 하시겠습니까?",{onAgree:function(){$("body").requestData(a.urlDelete,{chk_file_ids:b},{callback:function(a){f()}})}})};return{init:c}}(),$(function(){slapp.bigFileData.list.init()});