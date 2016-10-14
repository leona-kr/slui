'use strict';

_SL.nmspc("comcode").typeform = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formComcodeType',
		urlSelect : gCONTEXT_PATH + "sysdata/comcode_type_form.json",
		urlExist : gCONTEXT_PATH + "sysdata/comcode_type_exist.json",
		urlDelete : gCONTEXT_PATH + "sysdata/comcode_type_delete.do",
		add : {
			action : gCONTEXT_PATH + "sysdata/comcode_type_insert.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "sysdata/comcode_type_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		codeId : $(mCfg.formId + ' [name=code_id]'),
		codeName : $(mCfg.formId + ' [name=code_name]'),
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.codeId.val() == "" ? true : false,
		mode : m$.codeId.val() == "" ? mCfg.add : mCfg.update,
	    comCodeType : {}
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.form.find("#spnUsr").hide();
			m$.codeId.addClass("form-text").attr("readonly", "readonly");
		}
		
		// 데이타 조회
		if(!mState.isNew) select();
	},

	getCodeType = function() {
		return mState.comCodeType;
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
			rqData = {'code_id': id},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {});
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var codeId = m$.codeId.val();
		var codeName = m$.codeName.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;	
		var submit = function(){
			$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					
					mState.comCodeType.code_id = 'USR'+codeId;
					mState.comCodeType.code_name = codeName;
					
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}

		if(mState.isNew) {
			$('body').requestData(mCfg.urlExist, {code_id: codeId}, {
				callback : function(rsData){
					if(rsData == "OK")
						submit();						
					else if (rsData == "EXIST")
						_alert("사용중인 코드종류ID가 있어 저장 할 수 없습니다.");
					else
						_alert("저장 중 에러가 발생했습니다.<br>다시 실행하세요.");	
				}
			});			
		}
		else {
			submit();
		}
	},
	
	onDelete = function(){
		var codeId = m$.codeId.val();
		var codeType = m$.form.find("[name=code_type]").val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		var delCode = function(){
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, {code_id: codeId, code_type:codeType}, {
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
		
		if(m$.form.find("[name=code_count]").val() > 0) {
			_alert("해당 코드종류에 등록된 코드가 있어 삭제 할 수 없습니다.");
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
		getCodeType : getCodeType
	};

}();

$(function(){
	slapp.comcode.typeform.init();
});