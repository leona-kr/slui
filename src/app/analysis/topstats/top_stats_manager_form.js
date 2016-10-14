//# sourceURL=top_stats_manager_form.js
'use strict';

_SL.nmspc("topStatsMng").form = function(){

	var
	// Config 정의
	mCfg = {
		formId 		: '#formTopStatsMng',
		urlSelect 	: gCONTEXT_PATH + "analysis/top_stats_manager.json",
		urlDelete 	: gCONTEXT_PATH + "analysis/top_stats_manager_delete.do",
		urlSyncChk 	: gCONTEXT_PATH + "analysis/top_stats_manager_sync_check.json",
		urlLogSearch: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlQueryChk : gCONTEXT_PATH + 'monitoring/log_search_list.json',
		add : {
			action : gCONTEXT_PATH + "analysis/top_stats_manager_add.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "analysis/top_stats_manager_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		itemTable : $(mCfg.formId + ' .grid-table-group'),
		topCode : $(mCfg.formId + ' [name=top_code]'),
		fieldSelBox : $(mCfg.formId + ' [name=field_sel_box]'),
		operatorSelBox : $(mCfg.formId + ' [name=operator_sel_box]'),
		sysValSelBox : $(mCfg.formId + ' [name=sysval_sel_box]'),
		searchQuery : $(mCfg.formId + ' [name=org_search_condition]')
	},

	// 현재 상태 변수
	mState = {
		isNew : m$.topCode.val() == "" ? true : false,
		mode : m$.topCode.val() == "" ? mCfg.add : mCfg.update
	},
	
	gItemList = [],
	
	init = function(){
		// 초기 화면 구성
		drawItemTable();
		
		//이벤트 Binding
		bindEvent();
		
		// DOM 설정 
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
	},
	
	drawItemTable = function(){
		if(mState.isNew){
			initChosenField();
		}else{
			// 데이타 조회
			m$.itemTable.find("tbody").empty();
			select();
		}
	},
	
	initChosenField = function(){
		m$.form.find("[name=group_field]").each(function(index,value){
			if(index == 0){
				$(this).prop("disabled",true);
			} 
			appendChosenField($(this),"m");
		});
				
		m$.form.find("[name=field_nm]").each(function(){
			appendChosenField($(this),"s");
		});
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
		
		//검색어
		m$.fieldSelBox.chosen({search_contains : true, 'width':'100%'});
		m$.fieldSelBox.on("change",addFieldName);
		m$.operatorSelBox.on("change",addOperator);
		m$.form.find('.btn-case').on("click", validCase);
		
		//시스템변수
		m$.sysValSelBox.chosen({search_contains : true, 'width':'100%'});
		m$.sysValSelBox.on("change",addSysVal);
		
		//Item 설정 추가버튼
		m$.form.find('.btn-plus').on("click", function(e) {
			addItemTr();
		});
		
		//Item 설정 제거버튼	
		m$.form.on("click",".btn-minus",function(){
			$(this).parent().parent().remove();//버튼이 담겨있는 <tr>
		});
		
		//통계
		m$.form.on("change","[name=func]",funcEvent);
		
	},
	
	appendChosenField = function ($select,type){
		$.each(gFieldCaptions, function(i, val) {
			$select.append($("<option value='"+ i +"'>"+val+" ["+ i +"]</option>"));	
		});
		
		var selVal = $select.data("sel-value");
				
		if(type=="m"){
			var valArr = selVal.split(',');
			$select.chosen({
				search_contains : true,
				placeholder_text_multiple :"[선택하세요]",
				width:'100%'
			});
			
			if(selVal) $select.setSelectionOrder(valArr,true);
		}else{
			$select.val(selVal);
			$select.chosen({width:'100%'});		
			$select.trigger("chosen:updated");
		}
	},
	
	select = function() {
		var
			topCode = m$.topCode.val(),
			rqData = {'top_code': topCode},
			
			callback = function(data){
				_SL.setDataToForm(data, m$.form);//기본정보

				var itemList = data.itemList;
				for(var i in itemList){//분석항목
					addItemTr(itemList[i]);
				}
				initChosenField();
			};			
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		m$.form.find("[name=delete_yn]").val("N");
		if(!_SL.validate(m$.form)) return;
		if(!checkItemList()) return;
		
		if(!mState.isNew){
			var chekList = {
				top_code : m$.topCode.val(),
				org_search_condition : m$.searchQuery.val()	,
				item_list : gItemList
			}
		
			$('body').requestData(mCfg.urlSyncChk, chekList, {
				callback : function(rsData){
					if(!rsData){
						_confirm("통계관련설정이 수정 되었으므로<br>기존의 통계 데이터는 삭제됩니다.",{
							onAgree : function(){
								m$.form.find("[name=delete_yn]").val("Y");
								checkInvalid2();
							}
						});
					}else{
						checkInvalid2();
					}
				}
			});
			
		}else{
			checkInvalid2();
		}
	},

	checkInvalid2 = function(){
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -60);
		var strQuery = m$.searchQuery.val();
		var logMaxCnt = m$.form.find("[name=log_max_cnt]").val();
		var param = {
			end_time : endTime,
			start_time : startTime,
			query : strQuery,
			pageRow : 1,
			startIndex : 0
		}
		
		$('body').requestData(mCfg.urlQueryChk,param, {
			callback : function(totalData, rsCd, rsMsg){
				if(totalData.total > logMaxCnt){
					_alert('검색결과가 최대건수를 초과했습니다.<br>\
							Case검증을 이용해 확인해 주세요.<br>\
							(검색결과 '+_SL.formatNumber(totalData.total)+'건)\
							(최대건수 '+_SL.formatNumber(logMaxCnt)+'건)');
					return;
				}
				
				$('body').requestData(mState.mode.action,$.extend({},_SL.serializeMap(m$.form),{item_list_json:gItemList}), {
					callback : function(rsData, rsCd, rsMsg){
						_alert(rsMsg, {
							onAgree : function(){
								onClose(true,rsData.top_code);
							}
						});	
					}
				});
			}
		});
	},
	
	checkItemList = function(){
		gItemList = [];
		var $listTable = m$.itemTable;
		var count = ($listTable.find("tr")).length -1;
		var checkFieldValidate = true;

		for(var i=0; i<count; i++){
			
			var grpFlds = $("[name=group_field]").eq(i).getSelectionOrder();
			var grpFldsJoin = grpFlds.join();
			var funcVal = $("[name=func]").eq(i).val();
			var funcFieldNm = $("[name=field_nm]").eq(i).val();
			
			if(!grpFlds.join()){
				_alert("기준필드를 선택해 주세요.");
				checkFieldValidate = false;
				return;
			}
			
			if(funcVal != "count" && funcFieldNm==""){
				_alert("통계필드를 선택해 주세요.");
				checkFieldValidate = false;
				return;
			}

			gItemList.push({
				item_seq : i+1,
				view_type : $.trim($("[name=view_type]").eq(i).data("sel-value")),
				group_fields : grpFldsJoin,
				func : funcVal,
				field_nm : funcFieldNm
			});
		}

		return checkFieldValidate;		
	},
	
	

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {top_code:m$.topCode.val()}, {
					callback : function(rsData, rsCd, rsMsg){
						_alert(rsMsg, {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					}
				});
			}
		});
	},

	onClose = function(afterClose,topCode){
		var code = 0 ;
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
			if(topCode){
				code = topCode;
				slapp.topstats.list.drawStatsInit(code);
			} 
		}
	},
	
	addFieldName= function(){
		var $searchQuery = m$.searchQuery;
		var $fieldSelBox = m$.fieldSelBox;
		
		$searchQuery.focus();
		
		var strKeyword = $.trim($searchQuery.val());
		var strFieldNm = $fieldSelBox.val();
		
		if(strFieldNm == "") return;

		strKeyword += (strKeyword == "" ? "" : strKeyword.charAt(strKeyword.length-1) == '+' ? "" : " ");
		
		$searchQuery.val(strKeyword + strFieldNm + ":");
		$fieldSelBox.val("");
		$searchQuery.focus();	
	},
	
	addOperator = function(){
		var $searchQuery = m$.searchQuery;
		var $optSelBox = m$.operatorSelBox;

		$searchQuery.focus();

		var strKeyword = $.trim($searchQuery.val());
		var strOperator = $optSelBox.val();
		
		if(strOperator == "") return;
		if(strKeyword != "" && "AND,OR,NOT,+".indexOf(strOperator) != -1) {
			strOperator = " " + strOperator;
		}
			
		$searchQuery.val(strKeyword + strOperator);
		$optSelBox.val("");
		$searchQuery.focus();		
	},
	
	addSysVal = function(){
		var strFieldNm = $(this).val();		
		var $searchQuery = m$.searchQuery;
		var strKeyword = $.trim($searchQuery.val());
		
		strKeyword += (strKeyword == "" ? "" : strKeyword.charAt(strKeyword.length-1) == '+' ? "" : " ");
		$searchQuery.val(strKeyword + "SYSVAR("+strFieldNm + ")");
		
		$(this).val("");
		m$.sysValSelBox.trigger('chosen:updated');
	},
	
	validCase = function(){
		// 60분이내 조회
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -60);
		var strQuery = m$.searchQuery.val()
		
		if(strQuery == "") {
			_alert("검색어가 없습니다.");
			return;
		}
	
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type">');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			
			m$.form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(startTime);
		$("[name=end_time]", $logSearchForm).val(endTime);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(strQuery);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
	},
	
	addItemTr = function(){
		 var $listTable = m$.itemTable.find("tbody");
		 var $tr = $("<tr>");
		 
		if(!arguments[0]){//버튼클릭해서 추가할때
			//표시형태
			$tr.append($('<td>\
							<input type="text" name="view_type" value="Top" data-sel-value="T" class="form-input form-block" readonly="readonly">\
						</td>'));
			//기준필드
			$tr.append($('<td>\
							<select name="group_field" data-sel-value="" class="form-select" multiple="multiple"></select>\
						</td>'));
			//통계	
			$tr.append($('<td><div class="ranges-group">\
							<div class="range-2"><select name="func" class="form-select" data-scroll="false">\
								<option value="count">Count</option>\
								<option value="sum">SUM</option>\
								<option value="avg">AVG</option>\
								<option value="max">MAX</option>\
								<option value="min">MIN</option>\
							</select></div>\
							<div class="range-8"><select name="field_nm" data-sel-value="" data-ui="false" disabled="disabled">\
								<option value="">[선택하세요]</option>\
							</select></div>\
						</div></td>'));
			//-아이콘
			$tr.append($('<td>\
							<button type="button" class="btn-basic btn-mini btn-minus"><i class="icon-minus"></i></button>\
						</td>'));
			
			$tr.appendTo($listTable);
			
			var $groupSel = $tr.find("[name=group_field]");
			var $fieldNmSel = $tr.find("[name=field_nm]");

			appendChosenField($groupSel,"m");
			appendChosenField($fieldNmSel,"s");
		}else{
			var itemData = arguments[0];
			var
				viewType = itemData.view_type,
				grpFld = itemData.group_fields,
				func = itemData.func,
				fieldNm = itemData.field_nm;
				
			//표시형태
			$tr.append($('<td>\
							<input type="text" name="view_type" value="'+ (viewType=='L'?'TimeLine':'TOP') +'" data-sel-value="'+viewType+'" class="form-input form-block" readonly="readonly">\
						</td>'));
			//기준필드
			$tr.append($('<td>\
							<select name="group_field" data-sel-value="' +grpFld +'" class="form-select" multiple="multiple"></select>\
						</td>'));
			//통계	
			$tr.append($('<td><div class="ranges-group">\
							<div class="range-2"><select name="func" class="form-select" data-scroll="false">\
								<option value="count"'+ (func == 'count' ? ' selected':'') +'>Count</option>\
								<option value="sum"'+ (func == 'sum' ? ' selected':'') +'>SUM</option>\
								<option value="avg"'+ (func == 'avg' ? ' selected':'') +'>AVG</option>\
								<option value="max"'+ (func == 'max' ? ' selected':'') +'>MAX</option>\
								<option value="min"'+ (func == 'min' ? ' selected':'') +'>MIN</option>\
							</select></div>\
							<div class="range-8"><select name="field_nm" data-sel-value="'+ fieldNm +'" data-ui="false" disabled="disabled">\
								<option value="">[선택하세요]</option>\
							</select></div>\
						</div></td>'));
			//-아이콘
			/*
			var trCnt = ($listTable.find("tr")).length;
			
			alert(trCnt);
			*/
			if(viewType=='L'){
				$tr.append('<td></td>');
			}else{
				$tr.append('<td><button type="button" class="btn-basic btn-mini btn-minus"><i class="icon-minus"></i></button></td>');
			}
			
			$tr.appendTo($listTable);
		}
		if($tr.parents('.nano').size()>0){
			$tr.parents('.nano').nanoScroller();
		}

		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	delItemTr = function(){
		var $parent = $(this).parent();//버튼이 담겨있는 <td>
		$parent = $parent.parent();////버튼이 담겨있는 <tr>
		$parent.remove();
	},
	
	
	funcEvent = function(){
		var tempVal = $(this).val();
		var $parent =  $(this).parents('tr');
		
		if(tempVal == "count"){
			$parent.find("[name=field_nm]").val("");
			$parent.find("[name=field_nm]").prop("disabled",true);
			$parent.find("[name=field_nm]").trigger("chosen:updated");
		}else{
			$parent.find("[name=field_nm]").prop("disabled",false);
			$parent.find("[name=field_nm]").trigger("chosen:updated");
		}
	};
	
	
	return {
		init: init
	};

}();

$(function(){
	slapp.topStatsMng.form.init();
});