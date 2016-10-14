'use strict';

_SL.nmspc("resmanager").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formRebuildForm',
		urlSelect 	: gCONTEXT_PATH + "system/index_rebuild_select.json",
		add : {
			//action : gCONTEXT_PATH + "system/restore_schedule_insert.do",
			action : gCONTEXT_PATH + "system/index_rebuild_insert.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "system/index_rebuild_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		requestId : $(mCfg.formId + ' [name=request_id]'),
		rebuildStartDay :   $(mCfg.formId + ' [name=rebuildStartDay]'),
		rebuildStartHour :   $(mCfg.formId + ' [name=rebuildStartHour]'),
		rebuildStartMin :   $(mCfg.formId + ' [name=rebuildStartMin]'),
		
		rebuildEndDay :   $(mCfg.formId + ' [name=rebuildEndDay]'),
		rebuildEndHour :   $(mCfg.formId + ' [name=rebuildEndHour]'),
		rebuildEndMin :   $(mCfg.formId + ' [name=rebuildEndMin]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.requestId.val()  == "" ? true : false,
		mode : m$.requestId.val() == "" ? mCfg.add : mCfg.update
	},

	init = function(){
		
/*		// DOM 설정 
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}*/
		console.log(mState.isNew);
		// 데이타 조회
		if(!mState.isNew) select();
		
		// 이벤트 Binding
		bindEvent();
	},
	
	select = function() {
		var
			requestId = m$.requestId.val(),
			rqData = {'request_id': requestId},
			callback = function(data){
				_SL.setDataToForm(data.data, m$.form);//기본정보

				var strtDt = data.data.proc_start_dt;
				var endDt = data.data.proc_end_dt;	
				var setDateUI = function( $obj, _value ){
					var $select = $obj.siblings('.tform-select');
					$select.find('.tform-select-t').text(_value).end()
						.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
					$obj.val(_value);
				}

				setDateUI(m$.form.find("[name=rebuildStartDay]"),strtDt.substring(0,8));
				setDateUI(m$.form.find("[name=rebuildStartHour]"),strtDt.substring(8,10));
				setDateUI(m$.form.find("[name=rebuildStartMin]"),strtDt.substring(10,12));
				
				setDateUI(m$.form.find("[name=rebuildEndDay]"),endDt.substring(0,8));
				setDateUI(m$.form.find("[name=rebuildEndHour]"),endDt.substring(8,10));
				setDateUI(m$.form.find("[name=rebuildEndMin]"),endDt.substring(10,12));

			};			
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},

	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	onSave = function(){

		var sTime = m$.form.find("[name=rebuildStartDay]").val() + m$.form.find("[name=rebuildStartHour]").val() + m$.form.find("[name=rebuildStartMin]").val();
		var eTime = m$.form.find("[name=rebuildEndDay]").val() + m$.form.find("[name=rebuildEndHour]").val() + m$.form.find("[name=rebuildEndMin]").val();
		var diffTime = _SL.formatDate.diff(sTime + "00", eTime + "00");
		
		if (diffTime < 0) {
			_alert("대상기간의 종료시간이 시작시간보다 커야 합니다.");
			return;
	    } 
		
		diffTime = _SL.formatDate.diff(eTime + "00", _SL.formatDate("yyyyMMddHHmm") + "00");
		
		if (diffTime < 0) {
			_alert("대상기간의 종료시간은 현재시간과 같거나 작아야 합니다.");
			return;
		}
		
		if (!_SL.validate()) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		var url = "";
		if(mState.isNew){
			url = mCfg.add.action;
		}else{
			url = mCfg.update.action;
		}
		
		$('body').requestData(url, _SL.serializeMap(m$.form), {
			callback : function(rsMap, rsCd, rsMsg){
				if(rsMap.RESULT_CODE == "SUCCESS"){
					var alertStr = "";
					(mState.isNew)? alertStr = "요청을 완료하였습니다." : alertStr = "수정을 완료하였습니다.";
					_alert(alertStr, {
						onAgree : function(){
							onClose(afterClose);
						}
					});
				}else if(rsMap.RESULT_CODE == "ERROR"){
					_alert(rsMap.RESULT_MESSAGE, {
						onAgree : function(){
							onClose(afterClose);
						}
					});
				}else if(rsMap.RESULT_CODE == "FAIL"){
					_alert(rsMap.RESULT_MESSAGE, {
						onAgree : function(){
							onClose(afterClose);
						}
					});
				}
			},
			displayLoader: true
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
	slapp.resmanager.form.init();
});