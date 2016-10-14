'use strict';

_SL.nmspc("role").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formRole',
		urlSave : gCONTEXT_PATH + "system/role_update.do",
		urlExist : gCONTEXT_PATH + "system/role_nm_exist.json"
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		roleNm : $(mCfg.formId + ' [name=role_nm]')
	},
	
	// 현재 상태 변수
	mState = {
		role : {},
		bChange : false
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		m$.roleNm.focus();
	},
	
	bindEvent = function() {
		// Save Button
		m$.form.find('.btn-save').on('click', onClickSave);
	},
	
	setRole = function(roleId, roleNm) {
		mState.role.roleId = roleId;
		mState.role.roleNm = roleNm;
		
		m$.roleNm.val(roleNm);
	},
	
	getRole = function() {
		return mState.role;
	},
	
	onClickSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		var rqData = {
				role_id : mState.role.roleId,
				role_nm : m$.roleNm.val()
			};
		
		var submit = function() {
			$('body').requestData(mCfg.urlSave, rqData, {
				callback : function(rsData, rsCd, rsMsg) {
					mState.role.role_nm = rqData.role_nm;
					_alert(rsMsg, {
						onAgree : function() {
							onClose(afterClose);
						}
					});
				}
			});
		};
		
		// 이름 중복 체크 후 저장
		$('body').requestData(mCfg.urlExist, rqData, {
			callback : function(rsData, rsCd, rsMsg) {
				if(rsData)
					submit();
				else
					_alert("중복된 이름이 존재합니다.");
			}
		});
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},

	dummy = null;
	
	return {
		init: init,
		getRole : getRole,
		setRole : setRole
	};

}();

$(function(){
	slapp.role.form.init();
});