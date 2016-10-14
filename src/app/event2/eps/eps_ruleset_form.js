//# sourceURL=eps_ruleset_form.js
'use strict';

_SL.nmspc("epsRuleset").form = function(){

	var
	// Config 정의
	mCfg = {
		formId 		: '#formEpsRuleset',
		urlSelect 	: gCONTEXT_PATH + "event2/eps_ruleset.json",
		urlDelete 	: gCONTEXT_PATH + "event2/eps_ruleset_delete.do",
		urlLogSearch: gCONTEXT_PATH + 'monitoring/log_search.html',
		add : {
			action : gCONTEXT_PATH + "event2/eps_ruleset_insert.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event2/eps_ruleset_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		rulesetId : $(mCfg.formId + ' [name=ruleset_id]'),
		times : $(mCfg.formId + ' [name=times]'),
		timeType : $(mCfg.formId + ' [name=time_type]'),
		fieldSelBox : $(mCfg.formId + ' [name=field_sel_box]'),
		operatorSelBox : $(mCfg.formId + ' [name=operator_sel_box]'),
		searchQuery : $(mCfg.formId + ' [name=search_query]')
	},

	// 현재 상태 변수
	mState = {
		isNew : m$.rulesetId.val() == "" ? true : false,
		mode : m$.rulesetId.val() == "" ? mCfg.add : mCfg.update
	},
	
	
	init = function(){
		
		//이벤트 Binding
		bindEvent();
		
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		// DOM 설정 End

		// 데이타 조회
		if(!mState.isNew) select();
		
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);

		//체크주기이벤트
		setTimes("");
		m$.timeType.on("change",function(){
			setTimes("")
		});
		
		//검색어
		m$.fieldSelBox.chosen({search_contains : true, width:'100%'});
		m$.fieldSelBox.on("change",addFieldName);
		m$.operatorSelBox.on("change",addOperator);
		m$.form.find('.btn-case').on("click", validCase);
	},
	
	select = function() {
		var
			id = m$.rulesetId.val(),
			rqData = {'ruleset_id': id},
			
			callback = function(data){
				_SL.setDataToForm(data, m$.form);
				setTimes(data.times);
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){		
		var characterLimit = $(mCfg.formId + ' [name=character_limit]').val();
		
		var searchQueryLength = m$.searchQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		var afterClose = $(this).data('after-close') == true ? true : false;

		if (!_SL.validate(m$.form)) return;
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte\n입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		};
		
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

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				
				var rulesetId = m$.rulesetId.val();
				
				$('body').requestData(mCfg.urlDelete, {ruleset_id:rulesetId}, {
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
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	setTimes = function(pInit){
		var gTimeUnit = {
				"1" : [1,2,3,5,10,15,30],
				"2" : [1,2,3,6,12],
				"3" : [1]
		};
		var $sTimesObj = m$.times;
		var $sTimesTypeObj = m$.timeType;
		var sType = $sTimesTypeObj.val();
		var oTimes = $sTimesObj.empty()[0]; 

		if(sType != "") {
			for(var i in gTimeUnit[sType]){
				$sTimesObj.append('<option value="'+gTimeUnit[sType][i]+'">'+gTimeUnit[sType][i]+'</option>');
			}
			
			if(pInit) {
				$("[value=" + pInit + "]",$sTimesObj)[0].selected = true;
			}
			setTimeout(function(){
				slui.attach.setTransformSelect(mCfg.formId);
			},10);
		}

		if(sType == "1" || sType == "2"){
			$sTimesObj.prop('disabled',false);
		} else {
			$sTimesObj.prop('disabled',true);
		}
		slui.attach.setTransformSelect(mCfg.formId);
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
	
	validCase = function(){
		var characterLimit = $(mCfg.formId + ' [name=character_limit]').val();
		var searchQueryLength = m$.searchQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte\n입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
		
		// 10분이내 조회
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -10);
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
	
	checkInvalid = function(){
		
		var characterLimit = $(mCfg.formId + ' [name=character_limit]').val();
		var searchQueryLength = m$.searchQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(!_SL.validate(m$.form)) return;
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte\n입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
	};
	
	
	return {
		init: init
	};

}();

$(function(){
	slapp.epsRuleset.form.init();
});