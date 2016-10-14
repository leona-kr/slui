//# sourceURL=parser_form.js
'use strict';

_SL.nmspc("parser").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formParser',
		urlSelect : gCONTEXT_PATH + "management/parser_form.json",
		urlChkConn : gCONTEXT_PATH + "management/parser_check_delete.json",
		urlDelete : gCONTEXT_PATH + "management/parser_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "management/parser_add.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "management/parser_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		psrId : $(mCfg.formId + ' [name=psr_id]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.psrId.val() == "" ? true : false,
		mode : m$.psrId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		
		// 데이타 조회
		if(!mState.isNew) select();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
	},

	select = function() {
		var
			id = m$.psrId.val(),
			rqData = {'psr_id': id},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {});
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;	
		
		$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});
	},
	
	onDelete = function(){
		
		var psrId = m$.psrId.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		var delParser = function(){
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, {psr_id: psrId}, {
						callback : function(rsData, rsCd, rsMsg){
							_alert(rsMsg, {
								onAgree : function(){
									onClose(afterClose);
								}
							});
						}
					});
				}
			});
		}
		
		//장비연동체크
		$('body').requestData(mCfg.urlChkConn, {psr_id:psrId}, {
			callback : function(rsData){
				if(rsData == "OK")
					delParser();
				else if (rsData == "EXIST")
					_alert("연동중이므로 삭제할 수 없습니다.");
				else 
					_alert("연동 여부 체크에 실패했습니다.<br> 다시 시도하세요.");
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
	slapp.parser.form.init();
});