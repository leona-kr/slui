'use strict';

_SL.nmspc("resmanager").scheduleForm = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formScheduleForm',
		
		add : {
			action : gCONTEXT_PATH + "system/restore_schedule_insert.do",
			message : "등록 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		requestId : $(mCfg.formId + ' [name=request_id]')
	},
	
	// 현재 상태 변수
	mState = {
		mode : mCfg.add
	},

	init = function(){
		// 이벤트 Binding
		bindEvent();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	onSave = function(){

		var sTime = m$.form.find("[name=restoreStartDay]").val() + m$.form.find("[name=restoreStartHour]").val();
		var eTime = m$.form.find("[name=restoreEndDay]").val() + m$.form.find("[name=restoreEndHour]").val();
		var diffTime = _SL.formatDate.diff(sTime + "00", eTime + "00");
		
		if (diffTime < 0) {
			_alert("복원일시 종료시간이 시작시간보다 커야 합니다.");
			return;
	    } 
		
		diffTime = _SL.formatDate.diff(eTime + "00", _SL.formatDate("yyyyMMddHH") + "00");
		
		if (diffTime < 0) {
			_alert("복원일시 종료시간은 현재시간과 같거나 작아야 합니다.");
			return;
		}
		
		if (!_SL.validate()) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		$('body').requestData(mCfg.add.action, _SL.serializeMap(m$.form), {
			displayLoader : true,
			callback : function(rsData, rsCd, rsMsg){
				var rsCode = rsData.RESULT_CODE;
				switch(rsCode){
					case 'SUCCESS' :
						_alert("복원 요청하였습니다.", {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					break;
					case 'EXIST' :
						_alert("시작, 종료시간 구간에 이미 등록된 복원일시가 있습니다.");
					break;
					case 'ERROR' :
						_alert("복원 요청중 오류가 발생하였습니다.<br/>다시 시도하세요.");
					break;
					case 'RUNNING' :
						_alert("데이터 복원이 실행 중입니다.");
					break;
					default :
						_alert("복원요청에 실패했습니다.<br/>다시 시도하세요.");
					break;
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
	slapp.resmanager.scheduleForm.init();
});