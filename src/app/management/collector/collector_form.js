'use strict';

_SL.nmspc("collector").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formCollector',
		urlSelect : gCONTEXT_PATH + "management/collector.json",
		urlExist : gCONTEXT_PATH + "management/collector_exist.json",
		urlExistIp : gCONTEXT_PATH + "common/asset_check_ip.json",
		urlExistAgent : gCONTEXT_PATH + "management/rel_agent_exist.json",
		urlDelete : gCONTEXT_PATH + "management/collector_delete.do",
		add : {
			action : gCONTEXT_PATH + "management/collector_insert.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "management/collector_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		collectorId : $(mCfg.formId + ' [name=collector_id]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.collectorId.val() == "" ? true : false,
		mode : m$.collectorId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.collectorId.addClass("form-text").prop("readonly", true);
		}
		// DOM 설정 End
		
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
			id = m$.collectorId.val(),
			rqData = {'collector_id': id},
	
			callback = function(data){
				_SL.setDataToForm(data, m$.form,{
					"collector_ip" : {
						converter	: function(cvData, $fld) {
							m$.form.find('[name=b_collector_ip]').val(cvData);
							m$.form.find('[name=collector_ip]').val(cvData);
						}
					}
				});
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if (!_SL.validate(m$.form)) return;

		var bip, cip;
		bip = m$.form.find("[name=b_collector_ip]").val();
		cip = m$.form.find("[name=collector_ip]").val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		//ip중복체크 함수
		var ipCheck = function(){
			// 이전 IP와 현재 IP가 다른 경우
			if(bip != cip) {
				$('body').requestData(mCfg.urlExistIp, {sip:cip,chk_type:1}, {
					callback : function(rsData){
						if(rsData == "OK")
							submit();						
						else if (rsData == "EXIST")
							_alert("이미 등록된 IP입니다.");
						else
							_alert("IP 중복 체크에 실패했습니다.<br>다시 시도하세요.");
					}
				});			
			}
			else {
				submit();
			}			
		}
		
		var submit = function(){
			$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(afterClose);
						}
					});
				}
			});			
		}
		
		if(mState.isNew) {
			$('body').requestData(mCfg.urlExist, {collector_id:m$.collectorId.val()}, {
				callback : function(rsData){
					if(rsData == true)
						ipCheck();
					else
						_alert("사용중인 아이디가 있어 저장 할 수 없습니다.");
				}
			});
		}
		else {
			ipCheck();
		}
	},

	onDelete = function(){
		
		var collectorId = m$.collectorId.val();
		var afterClose = $(this).data('after-close') == true ? true : false;
		var delCollector = function(){
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, _SL.serializeMap(m$.form), {
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
		};

		//삭제하기전에 연동된 agent 있는지 체크
		$('body').requestData(mCfg.urlExistAgent, {collector_id:collectorId}, {
			callback : function(rsData){
				if(rsData == true)
					delCollector();
				else
					_alert("연동중인 Agent가 존재합니다.<br>연동된 Agent를 확인하세요.");
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
	slapp.collector.form.init();
});