"use strict";_SL.nmspc("parser").logList=function(){var a={urlList:gCONTEXT_PATH+"management/log_parser_list.json",urlForm:gCONTEXT_PATH+"management/log_parser_manager_form.html",formId:"#searchLogParserList",gridId:"#gridLogParserList",logPsrDetailId:"#log_parser_detail_dlg"},b={form:$(a.formId),grid:$(a.gridId),logPsrDetail:$(a.logPsrDetailId)},c=function(){var a=b.grid.parent().siblings(".grid-bottom").find(".btn-add");d(b.grid),b.form.find(".form-submit").off().on("click",function(){_SL.validate(b.form)&&e()}),b.logPsrDetail.jqxWindow({height:520,width:750,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5}),a.off().on("click",function(){var a=[],c=b.grid.jqxGrid("selectedrowindexes"),d=b.grid.jqxGrid("getdisplayrows"),e=[];for(var f in d)for(var g=0,h=c.length;g<h;g++)c[g]==d[f].boundindex&&e.push(d[f].boundindex);if(e.length>0){for(var g in e){var i=b.grid.jqxGrid("getrowdata",e[g]);if(!i)break;a.push(i)}slapp.parser.logForm.selectLogParser?(slapp.parser.logForm.selectLogParser(a),b.grid.parent().siblings(".grid-bottom").find(".btn-cancel").click()):_alert("호출한 페이지가 없거나 변경되었습니다.")}else _alert("추가할 로그파서를 선택하세요.")})},d=function(c){var d={datatype:"json",datafields:[{name:"log_psr_id",type:"string"},{name:"log_psr_nm",type:"string"},{name:"log_type_cd",type:"string"},{name:"log_type_nm",type:"string"},{name:"log_cate_cd",type:"string"},{name:"log_cate_nm",type:"string"},{name:"handle_type",type:"string"},{name:"handle_type_nm",type:"string"},{name:"handle_opt",type:"string"},{name:"log_cate_value",type:"string"},{name:"sample",type:"string"},{name:"psr_xml",type:"string"},{name:"description",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(d.totalrecords=a.totalRows)},cache:!1,url:a.urlList},e=new $.jqx.dataAdapter(d,{formatData:function(b){var c,d={},e=$(a.formId).serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(b,d),b},loadError:function(a,b,c){alert(c)}});c.jqxGrid({source:e,sortable:!0,width:"100%",selectionmode:"checkbox",virtualmode:!0,enablehover:!1,rendergridrows:function(a){return a.data},columns:[{text:"No",columntype:"number",width:40,cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"로그파서명",datafield:"log_psr_nm",cellsrenderer:function(a,b,c,d,e,f){return $(d).html('<button type="button" class="btn-link">'+c+"</button>")[0].outerHTML}},{text:"로그타입",datafield:"log_type_nm",width:"10%",cellsalign:"center"},{text:"구분방법",datafield:"handle_type_nm",width:"15%",cellsalign:"center"},{text:"구분Option",datafield:"handle_opt",width:"12%",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){var g=c;return 1==f.handle_type&&(g="구분자(",g+=c.split("|")[0].replace("@P@","|")+") ",g+=parseInt(c.split("|")[1])+1+"번째"),$(d).html(g)[0].outerHTML}},{text:"구분값",datafield:"log_cate_value",width:"12%",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){var g=c.length>25?c.substring(0,24)+"....":c;return $(d).html(g)[0].outerHTML}},{text:"로그분류",datafield:"log_cate_nm",cellsalign:"center"}]}),c.on("cellclick",function(a){if("log_psr_nm"===a.args.datafield){var c=a.args.row.bounddata;b.logPsrDetail.find("[name=log_cate_value]").val(c.log_cate_value),b.logPsrDetail.find("[name=sample]").val(c.sample),b.logPsrDetail.find("[name=psr_xml]").val(c.psr_xml),b.logPsrDetail.find("[name=description]").val(c.description),b.logPsrDetail.jqxWindow("open")}})},e=function(){b.grid.jqxGrid("updatebounddata")};return{init:c}}(),$(function(){slapp.parser.logList.init()});