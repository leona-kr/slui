'use strict';

_SL.nmspc("resmanager").manager = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formResManager',
		urlSelect : gCONTEXT_PATH + "system/resource_manager.json",
		urlAdd : gCONTEXT_PATH + "system/resource_manager_insert.do",
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		select();
	},

	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
	},
	
	select = function() {

	var callback = function(data){
		_SL.setDataToForm(data, m$.form, {});
	};

	$('body').requestData(mCfg.urlSelect, {}, {callback : callback});
	
	},

	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		$('body').requestData(mCfg.urlAdd, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						location.reload();
					}
				});
			}
		});
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.resmanager.manager.init();
	//원복로그 복원
	
	$("#btnIdxRebuild").togglePage(gCONTEXT_PATH + "system/index_rebuild_list.html");
	$("#btnOriginalLog").togglePage(gCONTEXT_PATH + "system/restore_schedule_list.html");
	$("#btnContentsUpdate").togglePage(gCONTEXT_PATH + "system/contents_update.html");
});