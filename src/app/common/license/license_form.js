//# sourceURL=license_form.js
'use strict';

_SL.nmspc("license").form = function() {

	var
	// Config 정의
	mCfg = {
		formId : '#licenseForm',
		urlSubmit : gCONTEXT_PATH + 'common/license_update.do'
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		licenseFile : $(mCfg.formId+' [name=license_file]')
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
		if(m$.licenseFile.val() == "" ){
			_alert("License 파일을 입력하세요");
			return;
		}	
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("파일을 올리시겠습니까?",{
			onAgree : function(){

				m$.form.attr({
					enctype : "multipart/form-data",
					encoding : "multipart/form-data",
					action : mCfg.urlSubmit
				});
				
				m$.form.ajaxSubmit({
					dataType:"text",
					success:function(rsMsg, statusText, xhr, $form) {
						if(rsMsg == "SUCCESS") {
							_alert("처리 되었습니다.", {
								onAgree : function(){
									onClose(afterClose);
								}
							});
						} else {
							_alert(rsMsg);
						}
					}
				});
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
	slapp.license.form.init();
});