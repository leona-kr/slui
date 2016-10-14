//# sourceURL=comcode_form.js
'use strict';

_SL.nmspc("comcode").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formComcode',
		urlSelect : gCONTEXT_PATH + "sysdata/comcode_form.json",
		urlExist : gCONTEXT_PATH + "sysdata/comcode_exist.json",
		urlDelete : gCONTEXT_PATH + "sysdata/comcode_delete.do",
		add : {
			action : gCONTEXT_PATH + "sysdata/comcode_insert.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "sysdata/comcode_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		codeId : $(mCfg.formId + ' [name=code_id]'),
		codeType : $(mCfg.formId + ' [name=s_code_type]'),
		codeName : $(mCfg.formId + ' [name=code_name]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.codeId.val() == "" ? true : false,
		mode : m$.codeId.val() == "" ? mCfg.add : mCfg.update,
		code : {}
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.codeId.addClass("form-text").prop("readonly", true);
		}
		
		m$.codeType.addClass("form-text").prop("readonly", true);
		
		// 데이타 조회
		if(!mState.isNew) select();
	},
	
	getCode = function() {
		return mState.code;
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
	},

	select = function() {
		var
			id = m$.codeId.val(),
			types = m$.codeType.val(),
			rqData = {'code_id': id,'s_code_type': types},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {});
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var codeId = m$.codeId.val();
		var codeType = m$.codeType.val();
		var codeName = m$.codeName.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;	
		var submit = function(){
			$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					mState.code.code_id = codeId;
					mState.code.code_name = codeName;
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}

		if(mState.isNew) {
			$('body').requestData(mCfg.urlExist, {code_id: codeId, s_code_type: codeType}, {
				callback : function(rsData){
					if(rsData == "OK")
						submit();
					else if (rsData == "EXIST")
						_alert("사용중인 코드가 있어 처리 할 수 없습니다.");
					else
						_alert("저장 처리중 에러가 발생했습니다.<br>다시 실행하세요.");
				}
			});			
		}
		else {
			submit();
		}
	},
	
	onDelete = function(){
		var codeId = m$.codeId.val();
		var codeType = m$.codeType.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		var delCode = function(){
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, {code_id: codeId, s_code_type: codeType}, {
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
		}
		
		if(m$.form.find("[name=required]").val() == "Y") {
			_alert("필수 코드이므로 삭제할 수 없습니다.");
			return;
		}
		
		delCode();
		
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};

	return {
		init: init,
		getCode : getCode
	};

}();

$(function(){
	slapp.comcode.form.init();
});