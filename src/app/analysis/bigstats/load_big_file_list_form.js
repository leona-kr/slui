//# sourceURL=load_big_file_list_form.js

_SL.nmspc("bigStatsManager").loadBigFileForm = function(){

	var
	// Config 정의
	mCfg = {
		formId 	: '#loadBigFileList',
		urlList : gCONTEXT_PATH + "analysis/load_big_file_list.json"
	},
	
	// JQuery 객체 변수
	m$ = {
		form 	: $(mCfg.formId),
		fileId 	: $(mCfg.formId + " [name=file_id]")
	},
	
	init = function(){
		loadBigFileData();
		
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	loadBigFileData = function() {
		$('body').requestData(mCfg.urlList, {}, {
			callback : function(rsData){
				var list = rsData;
				
				if(list.length > 0){
					for(var idx in list){
						var data = list[idx];
						
						$("<option/>").attr({'value' : data.file_id}).text(data.file_data_name).appendTo(m$.fileId);
					}
				};
				
				m$.fileId.chosen();
			}
		});
	},
	
	onSave = function(){
		
		var fileId = m$.fileId.val();
		slapp.bigStatsManager.form.loadFileInfo(fileId);
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
	slapp.bigStatsManager.loadBigFileForm.init();
});