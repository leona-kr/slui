"use strict";_SL.nmspc("tagging").form=function(){var a={formId:"#formUserTagging",impDialogId:"#tagging_import_input_dlg",sqlDialogId:"#tagging_sql_list_dlg",urlSelect:gCONTEXT_PATH+"sysdata/user_tagging_form.json",urlImport:gCONTEXT_PATH+"sysdata/user_tagging_import.do",urlExport:gCONTEXT_PATH+"sysdata/user_tagging_export.do",urlSqlList:gCONTEXT_PATH+"sysdata/user_tagging_sql_list.json",urlExist:gCONTEXT_PATH+"sysdata/user_tagging_exist.json",urlDelete:gCONTEXT_PATH+"sysdata/user_tagging_delete.do",add:{action:gCONTEXT_PATH+"sysdata/user_tagging_insert.do",message:"등록 하시겠습니까?"},update:{action:gCONTEXT_PATH+"sysdata/user_tagging_update.do",message:"수정 하시겠습니까?"}},b={form:$(a.formId),importDialog:$(a.impDialogId),importDialogForm:$(a.impDialogId+" #formUserTaggingImport"),sqlDialog:$(a.sqlDialogId),sqlDialogGrid:$(a.sqlDialogId+" #gridTaggingSqlList"),sqlTr:$(a.formId+" .sqlTr"),taggingFld:$(a.formId+" #tagging_fld_list_inner_container"),taggingVal:$(a.formId+" #tagging_fld_val_list_inner_container"),divTaggingVal:$(a.formId+" #tagging_fld_val_list_title,#tagging_fld_val_list_inner_container"),mngId:$(a.formId+" [name=mng_id]"),refQuery:$(a.formId+" [name=ref_query]"),jdbcId:$(a.formId+" [name=jdbc_id]"),refreshCycleMin:$(a.formId+" [name=refresh_cycle_min]")},c={isNew:""==b.mngId.val(),sqlCheckYn:""!=b.mngId.val(),mode:""==b.mngId.val()?a.add:a.update},d=function(){e(),c.isNew?(b.form.find(".btn-delete").hide(),b.form.find(".btn-export").hide(),b.sqlTr.hide(),b.divTaggingVal.show()):(b.mngId.addClass("form-text").prop("readonly",!0),b.form.find(".btn-import").hide()),b.form.find("[name=org_fld]").chosen({search_contains:!0,width:"100%;"}),b.importDialog.jqxWindow({height:150,width:500,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5,cancelButton:b.importDialogForm.find("[data-button-cancel=true]")}),b.sqlDialog.jqxWindow({height:500,width:750,autoOpen:!1,resizable:!1,isModal:!0,modalOpacity:.5}),c.isNew||f()},e=function(){b.form.find("[name=mng_type]").on("change",function(){"2"==event.target.value?(b.sqlTr.show(),b.divTaggingVal.hide()):(b.sqlTr.hide(),b.divTaggingVal.show()),slui.attach.setTransformSelect(a.formId)}),b.form.find("[name=ref_query],[name=jdbc_id]").on("change",function(){c.sqlCheckYn=!1}),b.form.find(".btn-export").on("click",j),b.form.find(".btn-import").on("click",k),b.importDialogForm.find(".btn-import").on("click",l),b.form.find(".btn_add_tagfield").on("click",m),b.form.find(".btn_add_tagvalue").on("click",n),b.form.on("click",".btn_del_tagfield",function(a){o($(this))}),b.form.on("click",".btn_del_tagvalue",function(a){p($(this))}),b.form.on("click",".btn-chk",function(a){x()}),b.sqlDialog.on("close",function(a){b.sqlDialogGrid.empty()}),b.form.find(".btn-save").on("click",q),b.form.find(".btn-delete").on("click",w)},f=function(){var c=b.mngId.val(),d={mng_id:c},e=function(a){g(a,!1)};$("body").requestData(a.urlSelect,d,{callback:e})},g=function(a,b){h(a.data,b),i(a)},h=function(d,e){_SL.setDataToForm(d,b.form,{}),"2"==d.mng_type?(b.sqlTr.show(),b.divTaggingVal.hide(),e&&(c.sqlCheckYn=!1)):(b.sqlTr.hide(),b.divTaggingVal.show()),slui.attach.setTransformSelect(a.formId)},i=function(c){var d=c.fldCateJson,e=c.fldList,f=c.fldValList;b.taggingFld.find("tbody").children().remove(),b.taggingVal.find("tbody").children().remove();for(var g=0;g<e.length;g++){var h=g+1,i="Y"==e[g].overwrite?"checked":"",j=e[g].org_fld,k=$("<tr />").attr("id","fld_list_tr"+h).appendTo(b.taggingFld),l="<td class='align-center'><span data-name='seq_no'>"+h+"</span></td>";l+="<td><select name='org_fld' id='org_fld_sel_box"+h+"' class='form-select' data-ui='false' data-valid='원본 필드,required' "+h+"'></select></td>",l+="<td><input type='text' name='derv_fld' id='derv_fld"+h+"' class='form-input form-block' value='"+e[g].derv_fld+"' data-valid='태깅 필드,required' maxlength='50'></td>",l+="<td class='align-center'><input type='checkbox' id='overwriteYn"+h+"'name='overwriteYn' value='Y' "+i+"></td>",l+="<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagfield' data-value='"+h+"'><i class='icon-minus'></i></button></td>",k.append(l),$("#org_fld_sel_box"+h).append('<option value="">[검색 필드]</option>'),$.each(d,function(a,b){var c=b.code_name==j?"selected":"";$("#org_fld_sel_box"+h).append("<option value='"+b.code_name+"' "+c+">"+b.code_cont+" ["+b.code_name+"]</option>")}),$("#org_fld_sel_box"+h).chosen({search_contains:!0,width:"100%"})}for(var g=0;g<f.length;g++){var h=g+1,k=$("<tr />").attr("id","fld_val_list_tr"+h).appendTo(b.taggingVal),l="<td class='align-center'><span data-name='seq_no'>"+h+"</span></td>";l+="<td><input type='text' name='org_fld_val' id='org_fld_val"+h+"' class='form-input form-block' value='"+f[g].org_fld_val+"' maxlength='100'></td>",l+="<td><input type='text' name='derv_fld_val' id='derv_fld_val"+h+"' class='form-input form-block' value='"+f[g].derv_fld_val+"' maxlength='100'></td>",l+="<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagvalue' data-value='"+h+"'><i class='icon-minus'></i></button></td>",k.append(l)}slui.attach.setTransforms(a.formId),b.taggingFld.parents(".nano").nanoScroller(),b.taggingVal.parents(".nano").nanoScroller()},j=function(){b.form.attr({action:a.urlExport,method:"post"}).submit()},k=function(){b.importDialogForm[0].reset(),b.importDialog.find("[name=import_type]").val("ALL"),b.importDialog.jqxWindow("open")},l=function(){return""==b.importDialogForm.find("[name=import_file]").val()?void _alert("파일을 입력하세요"):(b.importDialogForm.attr({enctype:"multipart/form-data",encoding:"multipart/form-data",action:a.urlImport,method:"post"}),void b.importDialogForm.ajaxSubmit({dataType:"text",success:function(a){var c=JSON.parse(a);c.errMsg?_alert(c.errMsg):(g(c,!0),b.importDialog.find("[data-button-cancel=true]").click())}}))},m=function(){var c=b.taggingFld,d=c.find("tr").size(),e=$("<tr />").attr("id","fld_list_tr"+d).appendTo(c),f="<td class='align-center'><span data-name='seq_no'>"+d+"</span></td>";f+="<td><select name='org_fld' id='org_fld_sel_box"+d+"' class='form-select' data-ui='false' data-valid='원본 필드,required' "+d+"'></select></td>",f+="<td><input type='text' name='derv_fld' id='derv_fld"+d+"' class='form-input form-block' value='' data-valid='태깅 필드,required' maxlength='50'></td>",f+="<td class='align-center'><input type='checkbox' id='overwriteYn"+d+"'name='overwriteYn' value='Y'></td>",f+="<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagfield' data-value='"+d+"'><i class='icon-minus'></i></button></td>",e.append(f),$("#org_fld_sel_box"+d).append('<option value="">[검색 필드]</option>'),$.each(gFieldCategoryList,function(a,b){$("#org_fld_sel_box"+d).append("<option value='"+a+"'>"+b+" ["+a+"]</option>")}),$("#org_fld_sel_box"+d).chosen({search_contains:!0,width:"100%"}),slui.attach.setTransforms(a.formId),c.parents(".nano").nanoScroller()},n=function(){var a=b.taggingVal,c=a.find("tr").size(),d=$("<tr />").attr("id","fld_val_list_tr"+c).appendTo(a),e="<td class='align-center'><span data-name='seq_no'>"+c+"</span></td>";e+="<td><input type='text' name='org_fld_val' id='org_fld_val"+c+"' class='form-input form-block' value='' maxlength='100'></td>",e+="<td><input type='text' name='derv_fld_val' id='derv_fld_val"+c+"' class='form-input form-block' value='' maxlength='100'></td>",e+="<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagvalue' data-value='"+c+"'><i class='icon-minus'></i></button></td>",d.append(e),a.parents(".nano").nanoScroller()},o=function(a){var c=b.taggingFld;a.parent().parent().remove();for(var d=c.find("tr").length,e=0;e<d;e++)c.find("[data-name=seq_no]").eq(e).text(e+1),c.find("tr").eq(e).attr("id","fld_list_tr"+e)},p=function(a){var c=b.taggingVal;a.parent().parent().remove();for(var d=c.find("tr").length,e=0;e<d;e++)c.find("[data-name=seq_no]").eq(e).text(e+1),c.find("tr").eq(e).attr("id","fld_val_list_tr"+e)},q=function(){if(_SL.validate(b.form)){var d=b.form.find(":input:radio[name=mng_type]:checked").val(),e=$.trim(b.refQuery.val()),f=!0,g=!0,h=b.taggingFld.find("tr").length-1,i=b.taggingVal.find("tr").length-1;if(h<1)return void _alert("태깅 필드를 추가해 주세요");if(b.form.find("[name=org_fld_val]").each(function(){if(""==$.trim($(this).val()))return f=!1,!1}),b.form.find("[name=derv_fld_val]").each(function(){if(""==$.trim($(this).val()))return g=!1,!1}),"2"==d){if(""==e)return void _alert("SQL을 입력해 주세요");if(!c.sqlCheckYn)return void _alert("SQL확인을 해주세요")}else if("1"==d){if(i<1)return void _alert("태깅값을 추가해 주세요");if(!f)return void _alert("원본 내용(을)를 입력하세요");if(!g)return void _alert("태깅 내용(을)를 입력하세요");if(r())return void _alert("원본 내용 중 중복된 내용이 있습니다.")}return s()?void _alert("원본 필드 중 중복된 필드가 있습니다."):void(c.isNew?$("body").requestData(a.urlExist,_SL.serializeMap(b.form),{callback:function(a,b,c){"OK"==a?t():"EXIST"==a?_alert("사용중인 관리ID가 있어 처리 할 수 없습니다."):_alert("저장 처리중 에러가 발생했습니다.<br> 다시 실행하세요.")}}):t())}},r=function(){var a=[],c=!1;return b.form.find(":input:text[name=org_fld_val]").each(function(){var b=$.trim($(this).val());return $.inArray(b,a)!=-1?(c=!0,!1):void a.push(b)}),c},s=function(){var a=[],c=!1;return b.form.find("[name=org_fld]").each(function(){var b=$(this).val();return $.inArray(b,a)!=-1?(c=!0,!1):void a.push(b)}),c},t=function(){var a=$(":input:radio[name=mng_type]:checked").val();if("1"==a)b.refQuery.val(""),b.jdbcId.val(""),b.refreshCycleMin.val(0);else if("2"==a)for(var d=b.taggingVal,e=d.find("tr").length-1,f=1;f<=e;f++){var g=b.taggingVal.find("#fld_val_list_tr"+f);d.find(g).has("td").remove()}u(),v();var h=1==b.form.find(".btn-save").data("after-close");$("body").requestData(c.mode.action,_SL.serializeMap(b.form),{callback:function(a,b,c){_alert(c,{onAgree:function(){z(h)}})}})},u=function(){for(var a=[],c=b.taggingFld,d="N",e=c.find("tr").length-1,f=0;f<e;f++)d=$("input[name=overwriteYn]:checkbox").eq(f).is(":checked")?"Y":"N",a.push({org_fld:$.trim($("[name=org_fld]").eq(f).val()),derv_fld:$.trim($("[name=derv_fld]").eq(f).val()),overwrite:d});b.form.find("[name=tagging_fld_json]").val(JSON.stringify(a))},v=function(){for(var a=[],c=b.taggingVal,d=c.find("tr").length-1,e=0;e<d;e++)a.push({org_fld_val:$.trim($("[name=org_fld_val]").eq(e).val()),derv_fld_val:$.trim($("[name=derv_fld_val]").eq(e).val())});b.form.find("[name=tagging_fld_val_json]").val(JSON.stringify(a))},w=function(){var c=b.mngId.val();1==$(this).data("after-close");_confirm("삭제하시겠습니까?",{onAgree:function(){$("body").requestData(a.urlDelete,{mng_id:c},{callback:function(a,b,c){_alert(c,{onAgree:function(){z(!0)}})}})}})},x=function(){var a=$.trim(b.form.find("[name=ref_query]").val()),c=/^(select)\s+/i;if(""==a)return void _alert("SQL을 입력해 주세요");var d=c.test(a);if(!d)return void _alert("SELECT문만 입력할 수 있습니다.");var e=b.form.find("[name=jdbc_id]").val();b.sqlDialog.jqxWindow("open"),y(a.replace(/;+$/,""),e)},y=function(d,e){$("body").requestData(a.urlSqlList,{sqlStmt:d,jdbc_id:e},{callback:function(a,d,e){var f=a.sqlList,g=$("<thead>"),h=$("<tbody>"),i=$("<tr>");if(f.length>0){var j=Object.keys(f[0]),k=j.length>2?2:j.length;i.append('<th scope="col" style="width:50px;">번호</th>');for(var l=0;l<k;l++)i.append('<th scope="col">'+j[l]+"</th>");g.append(i);for(var m in f){i=$("<tr>");var n=f[m];i.append('<td class="align-center">'+(parseInt(m)+1)+"</td>");for(var o=0;o<k;o++){var p=n[j[o]].toString(),q=p.length>50?p.substring(0,49)+"....":p;i.append('<td class="align-center">'+q+"</td>")}h.append(i)}}else i.append('<th scope="col">번호</th>'),g.append(i),i=$("<tr>"),i.append('<td class="list-empty">There is no Search Result</td>'),h.append(i);b.sqlDialogGrid.append(g).append(h),"OK"==a.RESULT_MSG?c.sqlCheckYn=!0:_alert(a.RESULT_MSG,{onAgree:function(){c.sqlCheckYn=!1,b.sqlDialog.jqxWindow("close")}})}})},z=function(a){a&&b.form.find("[data-layer-close=true]").click()};return{init:d}}(),$(function(){slapp.tagging.form.init()});