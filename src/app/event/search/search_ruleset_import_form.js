//# sourceURL=search_ruleset_import_form.js
'use strict';

_SL.nmspc("searchRuleset").importForm = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formSearchRulesetImport',
		urlImport : gCONTEXT_PATH + "event/search_ruleset_import.do"
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		importMode : $(mCfg.formId + ' [name=import_mode]'),
		importModeMsg : $(mCfg.formId + ' [data-name=import_mode_msg]'),
	},
	
	init = function(){
		//이벤트 Binding
		bindEvent();

	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-import').on('click', onSave);
	
		// Import 방법 이벤트 설정
		m$.importMode.change(function(){
			if($(this).val() == "")
				m$.importModeMsg.hide();
			else
				m$.importModeMsg.show();
		});
	},
	
	onSave = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		if (!_SL.validate(m$.form)) return;

		m$.form.attr({
			enctype : "multipart/form-data",
			encoding : "multipart/form-data",
			action : mCfg.urlImport
		});
		
		
		m$.form.ajaxSubmit({
			dataType:"text",
			success:function(rsMsg, statusText, xhr, $form) {
				if(rsMsg == "SUC_COM_0001") {
					_alert("입력 되었습니다.");
					onClose(afterClose);
				}
				else {
					_alert(rsMsg);
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
	slapp.searchRuleset.importForm.init();
});