'use strict';

_SL.nmspc("parser").import = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formLogParserImport',
		urlImport : gCONTEXT_PATH + "management/log_parser_manager_import.do",
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
				if(rsMsg == "SUC_COM_0005") {
					_alert("처리 되었습니다.",{
						onAgree : function(){
							onClose(afterClose);
						}
					});
				}else{
					_alert('처리중 이상이 발생하였습니다<br>다시 시도해주세요.');
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
	slapp.parser.import.init();
});