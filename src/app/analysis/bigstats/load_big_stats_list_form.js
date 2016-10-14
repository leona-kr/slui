//# sourceURL=load_big_stats_list_form.js

_SL.nmspc("bigStatsManager").loadBigStatsForm = function(){

	var
	// Config 정의
	mCfg = {
		formId 	: '#loadBigStatsList',
		urlList : gCONTEXT_PATH + "analysis/load_big_stats_list.json",
		mngUrlForm : gCONTEXT_PATH + 'analysis/big_stats_manager_form.html?page_type=big_stats_mng_load',
	},
	
	// JQuery 객체 변수
	m$ = {
		form 	: $(mCfg.formId),
		bigCode : $(mCfg.formId + " [name=big_code]")
	},
	
	init = function(){
		loadBigStatsData();
		
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	loadBigStatsData = function() {
		$('body').requestData(mCfg.urlList, {}, {
			callback : function(rsData){
				var list = rsData;
				
				if(list.length > 0){
					for(var idx in list){
						var data = list[idx];
						
						$("<option/>").attr({'value' : data.big_code}).text(data.stats_nm).appendTo(m$.bigCode);
					}
				};
				
				m$.bigCode.chosen();
			}
		});
	},
	
	onSave = function(){
		var bigCode = m$.bigCode.val();		
		slapp.bigStatsManager.list.viewDetail(mCfg.mngUrlForm+'&big_code='+bigCode);		
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
	slapp.bigStatsManager.loadBigStatsForm.init();
});