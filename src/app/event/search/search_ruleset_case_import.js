//# sourceURL=search_ruleset_case_import.js
'use strict';

_SL.nmspc("searchRuleset").caseImport = function(){

	var
	// Config 정의
	mCfg = {
		formId 	: '#schRulesetCaseImport',
		urlList : gCONTEXT_PATH + "event/search_ruleset_case_import.json"
	},
	
	// JQuery 객체 변수
	m$ = {
		form 	: $(mCfg.formId),
		caseId 	: $(mCfg.formId + " [name=case_id]")
	},
	
	init = function(){
		loadCaseData();
		
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	loadCaseData = function() {
		$('body').requestData(mCfg.urlList, {}, {
			callback : function(rsData){
				var list = rsData.rsList;
				
				if(list.length > 0){
					for(var idx in list){
						var data = list[idx];
						m$.caseId.append('<option value="'+data.case_id+'">'+data.case_nm+'</option>');
					}
				};
				
				slui.attach.setTransformSelect(m$.form);
			}
		});
	},
	
	onSave = function(){
		var caseId = m$.caseId.val();
		
		if(caseId == "") {
			_alert("검증명을 선택하세요.");
			return;
		}
		
		slapp.searchRuleset.caseForm.setCaseData(caseId);
		onClose(true);
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
	slapp.searchRuleset.caseImport.init();
});