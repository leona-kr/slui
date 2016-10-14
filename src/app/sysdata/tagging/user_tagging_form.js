//# sourceURL=user_tagging_form.js
'use strict';

_SL.nmspc("tagging").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formUserTagging',
		
		impDialogId : '#tagging_import_input_dlg',
		sqlDialogId : '#tagging_sql_list_dlg',
			
		urlSelect : gCONTEXT_PATH + "sysdata/user_tagging_form.json",
		urlImport : gCONTEXT_PATH + "sysdata/user_tagging_import.do",
		urlExport : gCONTEXT_PATH + "sysdata/user_tagging_export.do",
		urlSqlList : gCONTEXT_PATH + 'sysdata/user_tagging_sql_list.json',
		urlExist : gCONTEXT_PATH + "sysdata/user_tagging_exist.json",
		urlDelete : gCONTEXT_PATH + "sysdata/user_tagging_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "sysdata/user_tagging_insert.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "sysdata/user_tagging_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),

		importDialog : $(mCfg.impDialogId),
		importDialogForm : $(mCfg.impDialogId + ' #formUserTaggingImport'),
		sqlDialog : $(mCfg.sqlDialogId),
		sqlDialogGrid : $(mCfg.sqlDialogId + ' #gridTaggingSqlList'),
		
		sqlTr : $(mCfg.formId + ' .sqlTr'),
		taggingFld : $(mCfg.formId + ' #tagging_fld_list_inner_container'),
		taggingVal : $(mCfg.formId + ' #tagging_fld_val_list_inner_container'),
		divTaggingVal : $(mCfg.formId + ' #tagging_fld_val_list_title,#tagging_fld_val_list_inner_container'),

		mngId : $(mCfg.formId + ' [name=mng_id]'),
		refQuery : $(mCfg.formId + ' [name=ref_query]'),
		jdbcId : $(mCfg.formId + ' [name=jdbc_id]'),
		refreshCycleMin : $(mCfg.formId + ' [name=refresh_cycle_min]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.mngId.val() == "" ? true : false,
		sqlCheckYn : m$.mngId.val() == "" ? false : true,
		mode : m$.mngId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) { 
			m$.form.find(".btn-delete").hide();
			m$.form.find(".btn-export").hide();
			m$.sqlTr.hide();
			m$.divTaggingVal.show();
		}
		else {
			m$.mngId.addClass("form-text").prop("readonly",true);
			m$.form.find(".btn-import").hide();
		}
		
		m$.form.find('[name=org_fld]').chosen({search_contains : true,width:"100%;" });
		 
		m$.importDialog.jqxWindow({
			height: 150, width: 500, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5,
			cancelButton : m$.importDialogForm.find('[data-button-cancel=true]')
		});
		
		m$.sqlDialog.jqxWindow({
			height: 500, width: 750, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5
		});
		
		// 데이타 조회
		if(!mState.isNew) select();
		
	},
	
	bindEvent = function() {
		
		m$.form.find("[name=mng_type]").on("change", function() {
			if(event.target.value == "2") {
				m$.sqlTr.show();
				m$.divTaggingVal.hide();
			}else{
				m$.sqlTr.hide();
				m$.divTaggingVal.show();
			}
			
			slui.attach.setTransformSelect(mCfg.formId);
		});

		//SQL input,DataSource
		m$.form.find('[name=ref_query],[name=jdbc_id]').on("change", function() {
			mState.sqlCheckYn = false;
		});
		
		// Export 버튼 클릭
		m$.form.find('.btn-export').on("click", goExport);
		
		// Import 버튼 클릭
		m$.form.find('.btn-import').on("click", goImport);
		
		//IMPORT
		m$.importDialogForm.find('.btn-import').on('click', importTaggingFile);
		
		//태깅 필드 plus Click
		m$.form.find('.btn_add_tagfield').on("click", addTaggingField);
		
		//태깅 값 plus Click
		m$.form.find('.btn_add_tagvalue').on("click", addTaggingVal);

		//태깅 필드 minus Click
		m$.form.on("click",".btn_del_tagfield",function(e){
			delTaggingField($(this));
		});
		
		//태깅 값 minus Click
		m$.form.on("click",".btn_del_tagvalue",function(e){
			delTaggingVal($(this));
		});

		//sql확인 버튼 Click
		m$.form.on("click",".btn-chk",function(e){
			checkSql();
		});
		
		m$.sqlDialog.on('close', function (event) {
			m$.sqlDialogGrid.empty();
	    });
		
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
	},

	select = function() {
		
		var
			id = m$.mngId.val(),
			rqData = {'mng_id': id},
	
			callback = function(rsData){
				bindingData(rsData,false);
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	bindingData = function(rsData,isImport){
		bindingForm(rsData.data,isImport);
		bindingGrid(rsData);
	},
	
	bindingForm = function(data,isImport){
		_SL.setDataToForm(data, m$.form, {});
		
		if(data.mng_type == '2'){
			m$.sqlTr.show();
			m$.divTaggingVal.hide();
			
			if(isImport) mState.sqlCheckYn = false;
		}else{
			m$.sqlTr.hide();
			m$.divTaggingVal.show();
		}		
		
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	bindingGrid = function(rsData){
		var fldCateJson = rsData.fldCateJson;
		var fldList = rsData.fldList;
		var fldValList = rsData.fldValList;
		
		m$.taggingFld.find('tbody').children().remove();
		m$.taggingVal.find('tbody').children().remove();
		
		//태깅 필드 Binding
		for(var idx=0; idx < fldList.length; idx++){
			
			var seqCnt = idx + 1;
			var chkStatus = fldList[idx].overwrite == 'Y' ? "checked" : "";
			var org_fld = fldList[idx].org_fld;
			
			var $tr = $("<tr />").attr('id','fld_list_tr'+seqCnt).appendTo(m$.taggingFld);
			//번호
			var str = "<td class='align-center'><span data-name='seq_no'>" + seqCnt + "</span></td>";
			//원본 필드
			str += "<td><select name='org_fld' id='org_fld_sel_box" + seqCnt + "' class='form-select' data-ui='false' data-valid='원본 필드,required' " + seqCnt + "'></select></td>";
			//태깅 필드
			str += "<td><input type='text' name='derv_fld' id='derv_fld" + seqCnt + "' class='form-input form-block' value='"+ fldList[idx].derv_fld +"' data-valid='태깅 필드,required' maxlength='50'></td>";
			
			// Overwrite
			str += "<td class='align-center'><input type='checkbox' id='overwriteYn" + seqCnt + "'name='overwriteYn' value='Y' "+chkStatus+"></td>",
			// Minus 버튼
			str += "<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagfield' data-value='"+ seqCnt +"'><i class='icon-minus'></i></button></td>";

			$tr.append(str);
			$('#org_fld_sel_box'+seqCnt).append('<option value="">[검색 필드]</option>');
			
			$.each(fldCateJson, function(idx, data) {
				var selStatus = data.code_name == org_fld ? "selected" : "";
				$('#org_fld_sel_box'+seqCnt).append("<option value='"+ data.code_name+"' "+selStatus+">"+data.code_cont+" ["+ data.code_name +"]</option>");
			});
			
			$('#org_fld_sel_box'+seqCnt).chosen({search_contains:true, width:"100%"});
		}

		//태깅 값 Binding
		for(var idx=0; idx < fldValList.length; idx++){
			
			var seqCnt = idx + 1;
			
			var $tr = $("<tr />").attr('id','fld_val_list_tr'+seqCnt).appendTo(m$.taggingVal);
			
			//번호
			var str = "<td class='align-center'><span data-name='seq_no'>" + seqCnt + "</span></td>";
			//원본 내용
			str += "<td><input type='text' name='org_fld_val' id='org_fld_val" + seqCnt + "' class='form-input form-block' value='"+ fldValList[idx].org_fld_val +"' maxlength='100'></td>",
			//태깅 내용
			str += "<td><input type='text' name='derv_fld_val' id='derv_fld_val" + seqCnt + "' class='form-input form-block' value='"+ fldValList[idx].derv_fld_val +"' maxlength='100'></td>";
			// Minus 버튼
			str += "<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagvalue' data-value='"+ seqCnt +"'><i class='icon-minus'></i></button></td>";
			$tr.append(str);
		}
		
		slui.attach.setTransforms(mCfg.formId);
		
		m$.taggingFld.parents('.nano').nanoScroller();
		m$.taggingVal.parents('.nano').nanoScroller();
	},

	goExport = function(){
		m$.form.attr({
				action : mCfg.urlExport,
				method : 'post'
		}).submit();
	},
	
	goImport = function(){
		m$.importDialogForm[0].reset();
		m$.importDialog.find("[name=import_type]").val("ALL");
		m$.importDialog.jqxWindow('open');
	},
	
	importTaggingFile = function(){
		
		if(m$.importDialogForm.find('[name=import_file]').val() == ""){
			_alert("파일을 입력하세요");
			return;
		}
			
		m$.importDialogForm.attr({
			enctype : "multipart/form-data",
			encoding : "multipart/form-data",
			action : mCfg.urlImport,
			method : "post"
		})
		
		m$.importDialogForm.ajaxSubmit({
			dataType:"text",
			success:function(rsData) {
				var rs = JSON.parse(rsData);
				if(!rs.errMsg){
					bindingData(rs,true);
					m$.importDialog.find("[data-button-cancel=true]").click();					
				}else{
					_alert(rs.errMsg);
				}
			}
		});
	},
	
	addTaggingField = function(){
		var $listTable = m$.taggingFld,
		seqCnt = $listTable.find("tr").size(),
		$tr = $("<tr />").attr('id','fld_list_tr'+seqCnt).appendTo($listTable),
		//번호
		str = "<td class='align-center'><span data-name='seq_no'>" + seqCnt + "</span></td>";
		//원본 필드
		str += "<td><select name='org_fld' id='org_fld_sel_box" + seqCnt + "' class='form-select' data-ui='false' data-valid='원본 필드,required' " + seqCnt + "'></select></td>";
		//태깅 필드
		str += "<td><input type='text' name='derv_fld' id='derv_fld" + seqCnt + "' class='form-input form-block' value='' data-valid='태깅 필드,required' maxlength='50'></td>";
		// Overwrite
		str += "<td class='align-center'><input type='checkbox' id='overwriteYn" + seqCnt + "'name='overwriteYn' value='Y'></td>",
		// Minus 버튼
		str += "<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagfield' data-value='"+ seqCnt +"'><i class='icon-minus'></i></button></td>";

		$tr.append(str);
		$('#org_fld_sel_box'+seqCnt).append('<option value="">[검색 필드]</option>');

		$.each(gFieldCategoryList, function(code_name, code_cont) {
			$('#org_fld_sel_box'+seqCnt).append("<option value='"+ code_name+"'>"+code_cont+" ["+ code_name +"]</option>");
		});
		$('#org_fld_sel_box'+seqCnt).chosen({search_contains:true, width:"100%"});

		slui.attach.setTransforms(mCfg.formId);
		$listTable.parents('.nano').nanoScroller();
	},
	
	addTaggingVal = function(){

		var $listTable = m$.taggingVal,
		seqCnt = $listTable.find("tr").size(),
		$tr = $("<tr />").attr('id','fld_val_list_tr'+seqCnt).appendTo($listTable),

		//번호
		str = "<td class='align-center'><span data-name='seq_no'>" + seqCnt + "</span></td>";
		//원본 내용
		str += "<td><input type='text' name='org_fld_val' id='org_fld_val" + seqCnt + "' class='form-input form-block' value='' maxlength='100'></td>",
		//태깅 내용
		str += "<td><input type='text' name='derv_fld_val' id='derv_fld_val" + seqCnt + "' class='form-input form-block' value='' maxlength='100'></td>";
		// Minus 버튼
		str += "<td class='align-center'><button type='button' class='btn-basic btn-mini btn_del_tagvalue' data-value='"+ seqCnt +"'><i class='icon-minus'></i></button></td>";
		$tr.append(str);
		
		$listTable.parents('.nano').nanoScroller();
	},
	
	delTaggingField = function(btnMinus){
		
		var $listTable = m$.taggingFld;
		
		btnMinus.parent().parent().remove();
		
		//순번 변경
		var seqCnt = $listTable.find("tr").length;
		
		for(var i=0; i<seqCnt; i++){
			$listTable.find("[data-name=seq_no]").eq(i).text(i+1);
			$listTable.find("tr").eq(i).attr("id", "fld_list_tr"+i);
		}
	},
	
	delTaggingVal = function(btnMinus){
		
		var $listTable = m$.taggingVal;
		
		btnMinus.parent().parent().remove();
		
		//순번 변경
		var seqCnt = $listTable.find("tr").length;
		
		for(var i=0; i<seqCnt; i++){
			$listTable.find("[data-name=seq_no]").eq(i).text(i+1);
			$listTable.find("tr").eq(i).attr("id", "fld_val_list_tr"+i);
		}
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var mngType = m$.form.find(":input:radio[name=mng_type]:checked").val();
		var refQuery =  $.trim(m$.refQuery.val());
		var orgFldVal = true;
		var dervFldVal = true;	
		var tFldCount = m$.taggingFld.find("tr").length -1;
		var tFldValcount = m$.taggingVal.find("tr").length -1;
		
		if(tFldCount < 1){
			_alert("태깅 필드를 추가해 주세요");
			return;
		}		

		m$.form.find("[name=org_fld_val]").each(function() {//원본 내용 중 빈칸이 있는지 체크
			if( $.trim($(this).val()) =="" ){
				orgFldVal = false;
				return false;//break;
			}
		});
		
		m$.form.find("[name=derv_fld_val]").each(function() {//태깅 내용 중 빈칸이 있는지 체크
			if( $.trim($(this).val()) =="" ){
				 dervFldVal = false;
				 return false;//break;
			}
		});
		
		if(mngType == "2"){//종류 1=수동 , 2=sql
			if(refQuery ==""){
				_alert("SQL을 입력해 주세요");
				return;
			}
			else if(!mState.sqlCheckYn){
				_alert("SQL확인을 해주세요");
				return;
			}
		}else if(mngType == "1"){
			if( tFldValcount < 1){
				_alert("태깅값을 추가해 주세요");
				return ;
			}else if(!orgFldVal){
				_alert("원본 내용(을)를 입력하세요");
				return;
			}else if(!dervFldVal){
				_alert("태깅 내용(을)를 입력하세요");
				return;
			}else{
				if(orgFldValExistCheck()){
					_alert("원본 내용 중 중복된 내용이 있습니다.");
					return;
				}
			}
		}
		
		if(orgFldExistCheck()){
			_alert("원본 필드 중 중복된 필드가 있습니다.");
			return;
		}

		if(mState.isNew){
			$('body').requestData(mCfg.urlExist, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					if(rsData == "OK"){
						fnSubmit();
					}else if(rsData == "EXIST"){
						_alert("사용중인 관리ID가 있어 처리 할 수 없습니다.");
					}else{
						_alert("저장 처리중 에러가 발생했습니다.<br> 다시 실행하세요.");
					}
				}
			});			
		}else{
			fnSubmit();
		}
	},
	
	orgFldValExistCheck = function(){
		
		var orgFldValArr =[];
		var existYn = false;
		
		m$.form.find(":input:text[name=org_fld_val]").each(function() {//원본 내용 중 빈칸이 있는지 체크
			var checkVal = $.trim($(this).val());
			
			if( $.inArray(checkVal,orgFldValArr) == -1){
				orgFldValArr.push(checkVal);
			}else{
				existYn = true;
				return false;
			}
		}); 
		
		return existYn;		
	},
	
	orgFldExistCheck = function(){

		var orgFldArr =[];
		var existYn = false;
		
		m$.form.find("[name=org_fld]").each(function() {//원본 내용 중 빈칸이 있는지 체크
			var checkVal = $(this).val();
			
			if( $.inArray(checkVal,orgFldArr) == -1){
				orgFldArr.push(checkVal);
			}else{
				existYn = true;
				return false;
			}
		}); 
		
		return existYn;
	},
	
	fnSubmit = function(){
		
		var mngType = $(":input:radio[name=mng_type]:checked").val();
		
		if(mngType=="1"){
			m$.refQuery.val("");//종류가 수동일때 sql은 빈칸으로
			m$.jdbcId.val("");
			m$.refreshCycleMin.val(0);
		}else if(mngType=="2"){//종류가 sql일때 태깅값들은 삭제
			
			var $listTable = m$.taggingVal;
			var count = ($listTable.find("tr")).length -1;			
			
			for(var i = 1 ; i <= count; i ++){
				var $tr = m$.taggingVal.find("#fld_val_list_tr" + i);
				$listTable.find($tr).has("td").remove();
			}
		}
		
		taggingFldToJsonString();
		taggingFldValToJsonString();
		
		var afterClose = m$.form.find('.btn-save').data('after-close') == true ? true : false;
		
		$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});	
	},
	
	taggingFldToJsonString = function(){

		var list=[];
		var $listTable = m$.taggingFld;
		var checkYn = "N";
		
		var count = ($listTable.find("tr")).length -1;
		for(var i=0; i<count; i++){
			
			if($("input[name=overwriteYn]:checkbox").eq(i).is(":checked"))
				checkYn = "Y";
			else
				checkYn = "N";
			
					
			list.push({
				org_fld : $.trim($("[name=org_fld]").eq(i).val()),
				derv_fld : $.trim($("[name=derv_fld]").eq(i).val()),
				overwrite : checkYn
			});
		}
		
		m$.form.find("[name=tagging_fld_json]").val(JSON.stringify(list));
		
	},
	
	taggingFldValToJsonString = function(){

		var list=[];
		var $listTable = m$.taggingVal;
		
		var count = ($listTable.find("tr")).length -1;
		for(var i=0; i<count; i++){
			list.push({
				org_fld_val : $.trim($("[name=org_fld_val]").eq(i).val()),
				derv_fld_val : $.trim($("[name=derv_fld_val]").eq(i).val())
			});
		}
		
		m$.form.find("[name=tagging_fld_val_json]").val(JSON.stringify(list));
		
	},
	
	onDelete = function(){
		
		var mngId = m$.mngId.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {mng_id: mngId}, {
					callback : function(rsData, rsCd, rsMsg){
						_alert(rsMsg, {
							onAgree : function(){
								onClose(true);
							}
						});
					}
				});
			}
		});
	},
		
	checkSql = function(){

		var strSql = $.trim(m$.form.find("[name=ref_query]").val());
		var regExp = /^(select)\s+/i;
		
		if(strSql=="") {
			_alert("SQL을 입력해 주세요");
			return;
		}
		var regExpTest = regExp.test(strSql);
		
		if(!regExpTest){
			_alert("SELECT문만 입력할 수 있습니다.");
			return;
		}
		
		var jdbcId = m$.form.find("[name=jdbc_id]").val();
		
		m$.sqlDialog.jqxWindow('open');
		
		drawList(strSql.replace(/;+$/, ""),jdbcId);
	},
	
	drawList = function(strSql,jdbcId){
		$('body').requestData(mCfg.urlSqlList, {sqlStmt : strSql, jdbc_id : jdbcId} , {
			callback : function(rsData, rsCd, rsMsg){
				
				var list = rsData.sqlList;
				var $thead = $('<thead>');
				var $tbody = $('<tbody>');
				var $tr = $('<tr>');
				
				if(list.length > 0){
					
					var listHead = Object.keys(list[0]);
					var len = listHead.length > 2 ? 2 : listHead.length;

					// th start
					$tr.append('<th scope="col" style="width:50px;">번호</th>');
					
					for(var idx =0; idx < len; idx++){
						$tr.append('<th scope="col">'+ listHead[idx] +'</th>');
					}
				
					$thead.append($tr);
					// th end
				
					// td start
					for(var outerIdx in list){
						
						$tr = $('<tr>');
						
						var data = list[outerIdx];
						
						$tr.append('<td class="align-center">'+ (parseInt(outerIdx) + 1) +'</td>');

						for(var innerIdx =0; innerIdx < len; innerIdx++){
							var val = data[listHead[innerIdx]].toString();
							var outerVal = val.length > 50 ? val.substring(0,49) + '....' : val;
							$tr.append('<td class="align-center">'+ outerVal +'</td>');
						}
						
						$tbody.append($tr);
					}
					// td end
					
				}else{
					
					// th start
					$tr.append('<th scope="col">번호</th>');
					$thead.append($tr);
					// th end
					
					$tr = $('<tr>');
					
					// td start
					$tr.append('<td class="list-empty">There is no Search Result</td>');
					// td end
					
					$tbody.append($tr);
				}
				
				m$.sqlDialogGrid.append($thead).append($tbody);
				
				if(rsData.RESULT_MSG == "OK"){
					mState.sqlCheckYn = true;					
				}else{
					_alert(rsData.RESULT_MSG, {
						onAgree : function(){
							mState.sqlCheckYn = false;
							m$.sqlDialog.jqxWindow('close');
						}
					});					
				}
			}
		});		
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.tagging.form.init();
});