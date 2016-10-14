//# sourceURL=search_ruleset_case_form.js
'use strict';

_SL.nmspc("searchRuleset").caseForm = function(){

	var
	// Config 정의
	mCfg = {
		formId				: '#formSearchRulesetCase',
		urlSelect			: gCONTEXT_PATH + "event/search_ruleset_case_form.json",
		urlDelete			: gCONTEXT_PATH + "event/search_ruleset_case_delete.do",
		//기준필드
		urlComConfigForm 	: gCONTEXT_PATH + 'sysdata/com_group_field_form.html',
		urlLoadCaseList		: gCONTEXT_PATH + 'event/search_ruleset_case_import.html',
		urlStatCheck 		: gCONTEXT_PATH + 'event/search_ruleset_case_stat_check.json',
		urlRulesetCaseProc	: gCONTEXT_PATH + 'event/search_ruleset_case_stop_or_retry.do',
		urlLogSearch		: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlQueryChk			: gCONTEXT_PATH + 'monitoring/log_search_list.json',
		urlChkCaseNm		: gCONTEXT_PATH + 'event/search_ruleset_case_nm_check.json',
		
		add : {
			action : gCONTEXT_PATH + "event/search_ruleset_case_add.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event/search_ruleset_case_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form 			: $(mCfg.formId),
		
		//불러오기
		btnImport	 	: $(mCfg.formId + ' .btn-import'),
		//기준필드
		btnGrpFldAdd 	: $(mCfg.formId + ' .btn-group-fld-add'),
		groupFieldSel 	: $(mCfg.formId + ' [name=group_field_sel]'),
		//기준시간
		times 			: $(mCfg.formId + ' [name=times]'),
		timeType 		: $(mCfg.formId + ' [name=time_type]'),
		
		// hidden value
		caseId 			: $(mCfg.formId + ' [name=case_id]'),
		pCaseNm 		: $(mCfg.formId + ' [name=p_case_nm]'),
		caseSTime 		: $(mCfg.formId + ' [name=case_start_time]'),
		caseETime 		: $(mCfg.formId + ' [name=case_end_time]'),
		grpFld		 	: $(mCfg.formId + ' [name=group_field]'),
		distFld	 		: $(mCfg.formId + ' [name=distinct_field]'),
		status 			: $(mCfg.formId + ' [name=status]'),
		characterLimit 	: $(mCfg.formId + ' [name=characterLimit]'),
		logMaxCnt 		: $(mCfg.formId + ' [name=logMaxCnt]'),
//		pageType 		: $(mCfg.formId + ' [name=page_type]'),
		
		caseNm 			: $(mCfg.formId + ' [name=case_nm]'),
		timeSet 		: $(mCfg.formId + ' [name=timeSet]'),
		caseStartDay	: $(mCfg.formId + ' [name=caseStartDay]'),
		caseStartHour	: $(mCfg.formId + ' [name=caseStartHour]'),
		caseStartMin	: $(mCfg.formId + ' [name=caseStartMin]'),
		caseEndDay		: $(mCfg.formId + ' [name=caseEndDay]'),
		caseEndHour		: $(mCfg.formId + ' [name=caseEndHour]'),
		caseEndMin		: $(mCfg.formId + ' [name=caseEndMin]'),
		schQuery 		: $(mCfg.formId + ' [name=search_query]'),
		func 			: $(mCfg.formId + ' [name=func]'),
		funcFld 		: $(mCfg.formId + ' [name=func_field]'),
		limitCnt		: $(mCfg.formId + ' [name=limit_count]'),
		distFldSel		: $(mCfg.formId + ' [name=distinct_field_sel]'),
		distCnt 		: $(mCfg.formId + ' [name=distinct_count]')
		
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.caseId.val() == "" ? true : false,
		mode : m$.caseId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		//체크주기이벤트	
		m$.timeType.on("change",setTimes);
		
		//검증기간 시간설정
		calendarInit();
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
			m$.form.find(".btn-retry").hide();
			m$.form.find(".btn-stop").hide();
			
			bindEvent();
			initChosen();
			initOnEvent();
			setTimes();
			
		}else{
			if(m$.status.val() == 0) {
				m$.form.find(".btn-retry").show();
				m$.form.find(".btn-stop").hide();
			}
			else if(m$.status.val() == 1 || m$.status.val() == 3) {
				m$.form.find(".btn-retry").hide();
				m$.form.find(".btn-stop").show();
			}
			else {
				m$.form.find(".btn-retry").hide();
				m$.form.find(".btn-stop").hide();
			}
			m$.form.find(".btn-import").hide();
			m$.form.find(".btn-save").hide();
			m$.form.find(".btn-group-fld-add").hide();
			
			m$.form.find(":input").not("[name=status],[name=case_id],.btn-delete,.btn-retry,.btn-stop,.btn-cancel").prop("disabled", true);
			
			bindEvent();
			initChosen();
			// 데이타 조회
			select();
		}
	},
	
	bindEvent = function() {
		m$.form.find('.btn-save').on('click', onSave);
		m$.form.find('.btn-delete').on('click', onDelete);
		m$.form.find('.btn-retry').on('click', onRetry);
		m$.form.find('.btn-stop').on('click', onStop);
		m$.form.find('.btn-case').on("click", validCase);
		
		//불러오기
		m$.btnImport.exModalPopup(mCfg.urlLoadCaseList, {
			width : 400,
			height : 135,
			onClose : function(){}
		});
		
		//기준필드 등록버튼
		m$.btnGrpFldAdd.exModalPopup(mCfg.urlComConfigForm, {
			width:470,
			height:295,
			onClose: function(){
				_addGroupField();
			}
		});
		
		//기준필드 이벤트
		m$.groupFieldSel.siblings(".chosen-container").find(".chosen-choices").on('mousedown','li a',function(){
			var delGroupFldText = $(this).prev().text();
			var orgFldText = m$.orgFld.siblings(".chosen-container").find(".chosen-single").find(".chosen-selected-span").text();
			var self = $(this);
			if(delGroupFldText == orgFldText){
				
				_confirm("원본필드가 리셋됩니다.<br>그래도 적용하시겠습니까??",{
					onAgree : function(){
						self.trigger("click");
						addOrgFld();
					}
				});
			} 
		});
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;
			
			if (setMin == 0) return;
			var startTime = _SL.formatDate.addMin(m$.form.find("[name=caseEndDay]").val() + m$.form.find("[name=caseEndHour]").val() + m$.form.find("[name=caseEndMin]").val(), -setMin);
			
			var setDateUI = function( $obj, _value ){
				var $select = $obj.siblings('.tform-select');
				$select.find('.tform-select-t').text(_value).end()
					.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
				$obj.val(_value);
			}

			setDateUI(m$.form.find("[name=caseStartDay]"),startTime.substring(0,8));
			setDateUI(m$.form.find("[name=caseStartHour]"),startTime.substring(8,10));
			setDateUI(m$.form.find("[name=caseStartMin]"),startTime.substring(10,12));
		});
		
		// Date,Time change 이벤트 설정
		m$.form.find("[name=caseStartDay],[name=caseStartHour],[name=caseStartMin],[name=caseEndDay],[name=caseEndHour],[name=caseEndMin]").change(function(){
			var $obj = m$.form.find("[name=timeSet]"),
				t = $obj.siblings('.tform-select').find('[data-value=0]').text();
			$obj.val(0)
				.siblings('.tform-select').find('.tform-select-t').text(t);
		});
		
		// 함수 설정
		m$.func.change(showFuncField);
		
		// 유일필드 임계치 설정
		m$.distFldSel.change(distinctCountEvent);
	},
	
	setTimes = function(pInit) {
		var timeUnit = {
				"1" : [1,2,3,5,10,15,30],
				"2" : [1,2,3,6,12]			
			};

		var $timeType = m$.timeType;
		var tType = $timeType.val();
		
		if(tType != "") {
			m$.times.empty();
			
			for(var i in timeUnit[tType]) {
				m$.times[0].add(new Option(timeUnit[tType][i],timeUnit[tType][i]));
			}
			
			if(m$.caseId.val() != "") {
				m$.form.find("[value=" + pInit + "]", '[name=times]')[0].selected = true;
			}
		}

		if(tType == "1" || tType == "2"){
			m$.form.find('[name-times]').prop('disabled',false);
		} else {
			m$.form.find('[name-times]').prop('disabled',true);
		}
		setTimeout(function(){
			slui.attach.setTransformSelect(mCfg.formId);
		},10);
	},
	
	//기준필드
	_addGroupField = function(){
		var data = slapp.comGroupField.form.getCode();
		var groupFieldArr = m$.groupFieldSel.getSelectionOrder();
		
		m$.groupFieldSel.empty();
		
		for(var i in data){
			m$.groupFieldSel.append($("<option value='"+ data[i] +"'>"+gFieldCapsJson[data[i]]+"("+ data[i] +")</option>"));
		}
		
		m$.groupFieldSel.setSelectionOrder(groupFieldArr,true);
		m$.groupFieldSel.trigger("chosen:updated");
	},
	
	initChosen = function() {
		
		//기준필드
		m$.groupFieldSel.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 10
		});
		m$.groupFieldSel.siblings(".chosen-container").find(".chosen-results").css("max-height","100px")
		.end()
		.siblings(".chosen-container").find(".chosen-choices").css({
			"max-height":"55px",
			"min-height":"55px",
			"overflow-y":"auto"
		});

		//유일필드
		m$.distFldSel.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 10
		});
		m$.distFldSel.siblings(".chosen-container").find(".chosen-results").css("max-height","100px")
		.end()
		.siblings(".chosen-container").find(".chosen-choices").css({
			"max-height":"55px",
			"min-height":"55px",
			"overflow-y":"auto"
		});
	},
	
	select = function() {
		var
			id = m$.caseId.val(),
			rqData = {'case_id': id},
			
			callback = function(data){
				//Data mapping start
				//기본데이터들
				_SL.setDataToForm(data, m$.form);
				
				//검증기간
				var sTime = data.case_start_time;
				var eTime = data.case_end_time;
				
				m$.caseStartDay.val(sTime.substring(0,8));
				m$.caseStartHour.val(sTime.substring(8,10));
				m$.caseStartMin.val(sTime.substring(10,12));
				
				m$.caseEndDay.val(eTime.substring(0,8));
				m$.caseEndHour.val(eTime.substring(8,10));
				m$.caseEndMin.val(eTime.substring(10,12));
				
				//기준필드(Group by)
				var sGrpFld = data.group_field;
				if(sGrpFld){
					var sGrpFlddArr = sGrpFld.split(',');
					for(var idx in sGrpFlddArr){
						var tField = sGrpFlddArr[idx];
						if(gGroupField.indexOf(tField) < 0){
							gFieldCapsJson[tField] = "undefined";
							m$.groupFieldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
						}
					}
					m$.groupFieldSel.setSelectionOrder(sGrpFlddArr, true);
				};
				
				//유일필드
				var sGrpFld = data.distinct_field;
				if(sGrpFld){
					var sGrpFlddArr = sGrpFld.split(',');
					
					for(idx in sGrpFlddArr){
						var tField = sGrpFlddArr[idx];
						if(gGroupField.indexOf(tField) < 0){
							gFieldCapsJson[tField] = "undefined";
							m$.distFldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
						}
					}
					m$.distFldSel.setSelectionOrder(sGrpFlddArr,true);
				}else{
					m$.distCnt.val("");
				};
				
				m$.groupFieldSel.trigger("chosen:updated");
				m$.distFldSel.trigger("chosen:updated");
				
				//Data mapping end
				initOnEvent();
				setTimes(data.times);
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	initOnEvent = function(){
		distinctCountEvent();
		showFuncField();
	},
	
	//검증기간 시간설정
	calendarInit = function(){
		var sTime = m$.caseSTime.val().length > 0 ? m$.caseSTime.val() : _SL.formatDate.addMin(_SL.formatDate(),-30) ;
		var eTime = m$.caseETime.val().length > 0 ? m$.caseETime.val() : _SL.formatDate() ;
		
		m$.caseStartDay.val(sTime.substring(0,8));
		m$.caseStartHour.val(sTime.substring(8,10));
		m$.caseStartMin.val(sTime.substring(10,12));

		m$.caseEndDay.val(eTime.substring(0,8));
		m$.caseEndHour.val(eTime.substring(8,10));
		m$.caseEndMin.val(eTime.substring(10,12));
	},
	
	jsSubmit = function() {
		switch($.trim(arguments[0])) {
			case "SAVE" :
				checkInvalid();
				break;
			case "DELETE" :
				_confirm("삭제 하시겠습니까?", {
					onAgree : function(){
						$('body').requestData(mCfg.urlDelete, {case_id:m$.caseId.val()}, {
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
				break;
			case "STOP" :
					chkStatus(0);
				break;
			case "RETRY" :
					chkStatus(1);
				break;
			case "CANCEL" :
				onClose(true);
				break;
		}
	},
	
	slValidate = function(){
		if (!_SL.validate(m$.form)) return false;
		
		if(m$.func.val() != '1' && m$.funcFld.val() == null){
			_alert("함수필드를 선택하세요");
			return false;
		}
		
		return true;
	},
	
	checkInvalid = function() {
		if(!slValidate()) return;
		var characterLimit = m$.characterLimit.val();
		var searchQueryLength = m$.schQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte<br>입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
		
		var sTime = m$.caseStartDay.val() + m$.caseStartHour.val() + m$.caseStartMin.val(); //검증시작시작
		var eTime = m$.caseEndDay.val() + m$.caseEndHour.val() + m$.caseEndMin.val(); //검증시작시작
		
		var diffTime = (_SL.formatDate.diff(sTime, eTime)/(1000 * 60)); //종료시간 - 시작시간
		var stTime = m$.timeType.val() == 2 ? m$.times.val() * 60 :  m$.times.val() ; //기준시간kk
		
		if(diffTime <= 0){
			_alert("검증기간을 잘못 입력하셨습니다.<br>확인 후 다시 입력바랍니다.");
			return;		
		}else if(diffTime < stTime){
			_alert("검증기간이 기준시간 미만입니다.<br>확인 후 다시 입력바랍니다.");
			return;		
		}else if(diffTime > 10080){
			_alert("검증기간은 7일을 초과할 수 없습니다.<br>확인 후 다시 입력바랍니다.");
			return;
		}

		m$.caseSTime.val(sTime);
		m$.caseETime.val(eTime);
		
		//수정자체를 못하게 막아버렸기 때문에 이 체크 로직 사용
		if(mState.isNew){ //등록창일 경우
			$('body').requestData(mCfg.urlChkCaseNm, _SL.serializeMap(m$.form), {
				callback : function(rsMap){
					if(rsMap.RESULT_CODE == "000"){
						if(rsMap.data != null){ // 검증명 중복 시
							_alert("검증명["+rsMap.data.case_nm+"]은(는)<br>이미 존재하므로 등록할 수 없습니다");
							return;
						}else{// 검증명 중복이 아닐 때
							saveRuleSetCase();
						}
					}
				}
			});
		}else{
			return;
		}
	},
	 
	saveRuleSetCase = function(){
		var groupFlds = m$.groupFieldSel.getSelectionOrder();
		m$.grpFld.val( groupFlds.join());
		
		var distinctFlds = m$.distFldSel.getSelectionOrder();
		m$.distFld.val( distinctFlds.join());
		
		if(groupFlds.length == 0 && distinctFlds == 0){
			$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}else{//기준필드 또는 유일필드가 존재할때 count체크
			checkInvalid2();
		}
	},
	
	checkInvalid2 = function(){//저장하기전에 룰셋의 count체크
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -10);
		var strQuery = m$.schQuery.val();
		var logMaxCnt = m$.logMaxCnt.val();

		var
			rqData = {
				'end_time' : endTime,
				'start_time' : startTime,
				'query' : strQuery,
				'pageRow' : 1,
				'startIndex' : 0
			},
			
			callback = function(rsJson){
				if(rsJson.total > logMaxCnt){
					_alert("검색결과가 최대건수를 초과했습니다.<br>Case검증을 이용해 확인해 주세요.<br>(검색결과 "
							+_SL.formatNumber(rsJson.total)+"건)<br>(최대건수 "+_SL.formatNumber(logMaxCnt)+"건)");
					return;
				}else{
					$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
						callback : function(rsData, rsCd, rsMsg){
							_alert(rsMsg, {
								onAgree : function(){
									onClose(true);
								}
							});
						}
					});
				}
			};
		
		$('body').requestData(mCfg.urlQueryChk, rqData, {callback : callback});
	},
	
	// 중지, 재요청 기능
	chkStatus = function(status){

		var str_stat =  status == 0 ? "중지" : "재요청";
		
		_confirm(str_stat + " 하시겠습니까?", {
			onAgree : function(){
				$('body').requestData(mCfg.urlStatCheck, { case_id : m$.caseId.val() }, {
					callback : function(rsMap){
						if(rsMap.RESULT_CODE == "000"){
							if(rsMap.data.status == 5){ // 상태가 (처리중),완료 인 경우(처리중인 경우에도 수정가능하도록 변경)
								_alert("해당건은 현재 [" + rsMap.data.str_stat + "] 상태이므로<br>"+str_stat+"할 수 없습니다.");
								jsSubmit('CANCEL');
								return;
							}else{
								m$.status.val(status);
								
								$('body').requestData(mCfg.urlRulesetCaseProc, { case_id : m$.caseId.val(), status : m$.status.val() }, {
									callback : function(rsData, rsCd, rsMsg){
										_alert(rsMsg, {
											onAgree : function(){
												onClose(true);
											}
										});
									}
								});
							}
						}else{
							_alert("처리 중 오류가 발생 하였습니다.");
						}
					}
				});
			}
		});
	},
	
	distinctCountEvent = function(){
		if( m$.distFldSel.val() == null){
			m$.distCnt.prop("disabled",true);
			m$.distCnt.attr("data-valid","유일필드 임계치,number");
		}else{
			m$.distCnt.prop("disabled",false);
			m$.distCnt.attr("data-valid","유일필드 임계치,required,number");
		}
	},

	showFuncField = function(){
		if(m$.func.val() == '1'){
			m$.funcFld.parent('.form-select-outer').css('visibility','hidden');
		}else{
			m$.funcFld.parent('.form-select-outer').css('visibility','visible');
		}
	},
	
	validCase = function(){
		var characterLimit = m$.characterLimit.val();
		var searchQueryLength = m$.schQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte<br>입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
		
		// 10분이내 조회
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -10);
		var strQuery = m$.schQuery.val();
		
		if(searchQueryLength == "") {
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
	
	onSave = function(){
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		jsSubmit("SAVE");
	},
	
	onDelete = function() {
		var afterClose = $(this).data('after-close') == true ? true : false;
		jsSubmit("DELETE");
	},
	
	onRetry = function() {
		var afterClose = $(this).data('after-close') == true ? true : false;
		jsSubmit("RETRY");
	},
	
	onStop = function() {
		var afterClose = $(this).data('after-close') == true ? true : false;
		jsSubmit("STOP");
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	setCaseData = function(caseId){
		m$.caseId.val(caseId);
		select();
	}

	return {
		init: init,
		setCaseData:setCaseData
	};

}();

$(function(){
	slapp.searchRuleset.caseForm.init();
});
