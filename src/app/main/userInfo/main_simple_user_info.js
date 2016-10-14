//# sourceURL=main_simple_user_info.js
'use strict';

_SL.nmspc("userInfo").userInfoForm = function() {

	var
	// Config 정의
	mCfg = {
		formId : '#formUserInfo',
		urlSelect : gCONTEXT_PATH + 'main/main_simpleUserInfo.json',
		urlSave : gCONTEXT_PATH + 'main/comuser_login_menu_id_update.do'
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		userId : $(mCfg.formId + ' [name=p_user_id]')
	},
	
	userValidator = {
		password : function (elem) {
			if ($(elem).val() == "") return;
			
			var userId = (typeof m$.form.find('[name=user_id]').val() == "undefined") ? m$.form.find("[name='p_user_id']").val() : m$.form.find('[name=user_id]').val();
			var passwd = $(elem).val();
			var typeCnt = 0;
			
			if (/[가-힣]/.test(passwd)) {
				this.message = "비밀번호는 한글을 입력할 수 없습니다.";
				this.bValid = false;
			} else if (passwd.length < 9 || passwd.length > 15) {
				this.message = "비밀번호는 9자 ~ 15자 이내로 입력하세요.";
				this.bValid = false;
			} else if (passwd == userId) {
				this.message = "아이디와 비밀번호는 같을 수 없습니다.";
				this.bValid = false;
			} else {
				if(/[A-Z]/.test(passwd)) typeCnt++;
				if(/[a-z]/.test(passwd)) typeCnt++;
				if(/[\d]/.test(passwd)) typeCnt++;
				if(/[^A-Za-z0-9]/.test(passwd)) typeCnt++;
				
				if(typeCnt < 3) {
					this.message = "영문 대문자/영문 소문자/숫자/특수문자 중 3가지 이상의 문자 조합으로 입력하세요.";
					this.bValid = false;
				}
			}
		}						
	},
	
	init = function(){
		
		// 이벤트 Binding
		bindEvent();
		
		// 데이타 조회
		select();
		
		$.extend(true, _SL.validate.Validator, userValidator);
		
	},
	
	
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	select = function() {
		var
			id = m$.userId.val(),
			rqData = {'user_id': id},
	
			
			callback = function(data){
			
			data.passwd = "";
			
			_SL.setDataToForm(data, m$.form, {
				"p_user_id" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=p_user_id]').val(cvData);
						m$.form.find('[name=user_id]').val(cvData);
					}
				},
				"auth_ip" : {
					converter	: function(cvData, $fld) {
						if(cvData != ""){
							   var strVal = "1." +(cvData.indexOf(cvData.split(',')[0]) == -1 ? cvData : cvData.split(',')[0]) 
								       + "    2." + (cvData.split(',')[1]);
						
							   m$.form.find('[name=auth_ip]').val(strVal);							
						}
					}
				}
			});
			
			slui.attach.setTransformSelect(mCfg.formId);
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},

	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var pwd = m$.form.find("[name=passwd]").val(),
		rePwd = m$.form.find("[name=re_passwd]").val();

		if(pwd != rePwd) {
			if(rePwd != "" && pwd == "") {
				_alert("비밀번호를 입력하세요.");
				m$.form.find("[name=passwd]").focus();
				return;
			} else if(pwd != "" && rePwd == "") {
				_alert("비밀번호를 확인하여 주세요.");
				m$.form.find("[name=re_passwd]").focus();
				return;
			} else{
				_alert("비밀번호가 일치하지 않습니다.");
				m$.form.find("[name=re_passwd]").val("").focus();
				return;
			}
		}
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		var params = {
			passwd : m$.form.find("[name=passwd]").val(),
			login_menu_id : m$.form.find("[name=login_menu_id] :selected").val(),
			login_menu : m$.form.find("[name=login_menu_id] :selected").data("value"),
			alarm_mode : m$.form.find("[name=alarm_mode]:checked").val()
		};
		
		$('body').requestData(mCfg.urlSave, params, {
			callback : function(rsData, rsCd, rsMsg){
				gDISPLAY_ALARM = m$.form.find("[name=alarm_mode]:checked").val();
				onClose(true);
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
	slapp.userInfo.userInfoForm.init();
});