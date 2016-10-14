'use strict';

_SL.nmspc("comcode").import = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formComcodeImport',
		urlImport : gCONTEXT_PATH + "sysdata/comcode_import.do",
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId)
	},
	
	init = function(){
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		m$.form.attr({
			enctype : "multipart/form-data",
			encoding : "multipart/form-data",
			action : mCfg.urlImport
		});
		
		m$.form.ajaxSubmit({
			dataType:"text",
			success:function(rsMsg, statusText, xhr, $form) {
				if(rsMsg == "SUCCESS") {
					_alert("처리 되었습니다.");
					onClose(afterClose);
				}
				else {
					_alert("처리 중 에러가 발생하였습니다.");
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
	slapp.comcode.import.init();
});