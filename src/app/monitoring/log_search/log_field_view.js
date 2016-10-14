//# sourceURL=log_field_view.js

'use strict';

_SL.nmspc("logsearch").logFieldView = function(){
	var
	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		DOM : { form			: "#formLogsearchFieldView" },
		URL : {	fieldView		: URL_PATH + "log_field_view.json" }
	},
	
	m$ = {
		form				: $(mCfg.DOM.form),
		textarea			: $(mCfg.DOM.form + " textarea")
	},
	
	mState = {},
	
	/*** Define Function ***/
	init = function(param) {
		$.extend(mState, param);
		
		// 데이터 요청
		requestData();
	},
	
	requestData = function() {
		m$.textarea.val("Loading...");
		
		$("body").requestData(mCfg.URL.fieldView, mState, {callback : function(rsData) {
			loading.hide();
			
			m$.textarea.val(rsData); 
		}});
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();
