//# sourceURL=eps_ip_event_list.js
'use strict';

_SL.nmspc("epsRulesetImport").form = function() {

	var
	// Config 정의	
	mCfg = {
				
		formId : '#epsRulesetImportForm',
		urlImport : gCONTEXT_PATH + "event2/eps_ruleset_import.do"
		
	},
	
	// JQuery 객체 변수	
	m$ = {
			form : $(mCfg.formId),
			importMode : $(mCfg.formId + ' [name=import_mode]'),
			importModeMsg : $(mCfg.formId + ' [data-name=import_mode_msg]'),
	},

	init = function() {
		bindInitEvent();	
	},

	

	bindInitEvent = function() {	
		m$.importMode.change(function(){
			if($(this).val() == "")
				m$.importModeMsg.hide();
			else
				m$.importModeMsg.show();
		});		
	
		//save
		m$.form.find('.btn-save').on('click', onSave);	
	},
	
	fnGoList = function(){
		$("#frm").attr({
			enctype : "text/plain",
			encoding : "text/plain",
			action : "<c:url value='/event2/eps_ruleset_list.do' />"
		})
		.submit();
	},

	onSave = function() {
		var afterClose = $(this).data('after-close') == true ? true : false;
		if(!_SL.validate(m$.form)) return;

		_confirm("Import 파일을 올리시겠습니까?", {
			onAgree : function(){
				m$.form.attr({
					enctype : "multipart/form-data",
					encoding : "multipart/form-data",
					action : mCfg.urlImport
				});
				
				m$.form.ajaxSubmit({
					dataType:"text",
					success:function(rsMsg, statusText, xhr, $form) {
						if(rsMsg == "SUCCESS") {
							_alert("입력 되었습니다.");
							onClose(afterClose);
						}
						else {
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
		init : init
	};

}();

$(function(){
	slapp.epsRulesetImport.form.init();

});