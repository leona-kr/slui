"use strict";_SL.nmspc("comcode").typelist=function(){var a={urlList:gCONTEXT_PATH+"sysdata/comcode_type_list.json",urlForm:gCONTEXT_PATH+"sysdata/comcode_type_form.html",formId:"#searchComCodeTypeList",gridId:"#gridComCodeTypeList"},b={form:$(a.formId),grid:$(a.gridId)},c=function(){var c=b.grid.parent().siblings(".grid-bottom").find(".btn-add");d(b.grid),b.form.find(".form-submit").off().on("click",function(){_SL.validate(b.form)&&e()}),c.off().on("click",function(){g(a.urlForm)})},d=function(b){var c={datatype:"json",datafields:[{name:"code_type",type:"string"},{name:"code_id",type:"string"},{name:"code_name",type:"string"},{name:"flag1",type:"string"},{name:"flag2",type:"string"},{name:"code_cont",type:"string"},{name:"user_view",type:"string"}],root:"rows",beforeprocessing:function(a){null!=a&&(c.totalrecords=a.totalRows)},cache:!1,url:a.urlList},d=new $.jqx.dataAdapter(c,{formatData:function(b){var c,d={},e=$(a.formId).serializeArray();for(c in e)d[e[c].name]=e[c].value;return $.extend(b,d),b},loadComplete:function(){f()},loadError:function(a,b,c){alert(c)}});b.jqxGrid({source:d,sortable:!0,width:"100%",virtualmode:!0,enablehover:!1,rendergridrows:function(a){return a.data},columns:[{text:"No",columntype:"number",width:40,cellsalign:"center",cellsrenderer:function(a,b,c,d){return $(d).text(c+1)[0].outerHTML}},{text:"코드종류ID",datafield:"code_id",width:"15%",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).html('<button type="button" class="btn-link">'+c+"</button>")[0].outerHTML}},{text:"코드종류명",datafield:"code_name",cellsalign:"center"},{text:"기본설명",datafield:"code_cont",cellsalign:"center",cellsrenderer:function(a,b,c,d,e,f){return $(d).html('<label class="hasTooltip" data-value="'+c+'">'+c+"</label>")[0].outerHTML}}]}),b.on("cellclick",function(b){if("code_id"===b.args.datafield){var c=b.args.row.bounddata.code_id;g(a.urlForm+"?code_id="+c)}})},e=function(){b.grid.jqxGrid("updatebounddata"),f()},f=function(){setTimeout(function(){b.grid.find(".hasTooltip").each(function(a){var b=$(this).data("value");$(this).jqxTooltip({position:"mouse",content:b})})},500)},g=function(a){new ModalPopup(a,{height:310,onClose:function(){e()}})};return{init:c}}(),$(function(){slapp.comcode.typelist.init()});