'use strict';

_SL.nmspc("agent").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formAgent',
		urlSelect : gCONTEXT_PATH + "management/agent.json",
		urlExistIp : gCONTEXT_PATH + "common/asset_check_ip.json",
		urlExistEqu : gCONTEXT_PATH + "management/agent_check_delete.json",
		urlDelete : gCONTEXT_PATH + "management/agent_delete.do",
		add : {
			action : gCONTEXT_PATH + "management/agent_insert.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "management/agent_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		agentId : $(mCfg.formId + ' [name=agent_id]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.agentId.val() == "" ? true : false,
		mode : m$.agentId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.agentId.addClass("form-text").prop("readonly", true);
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
			id = m$.agentId.val(),
			rqData = {'agent_id': id},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {
				"agent_ip" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=b_agent_ip]').val(cvData);
						m$.form.find('[name=agent_ip]').val(cvData);
					}
				}
			});
			
			slui.attach.setTransformSelect(mCfg.formId);
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;	
		var submit = function(){
			$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}
		
		var bip = m$.form.find("[name=b_agent_ip]").val(),
			cip = m$.form.find("[name=agent_ip]").val();

		// 이전 IP와 현재 IP가 다른 경우
		if(bip != cip) {
			$('body').requestData(mCfg.urlExistIp, {sip:cip,chk_type:2}, {
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
	},
	
	onDelete = function(){
		
		var agentId = m$.agentId.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		var delAgent = function(){
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, {agent_id: agentId}, {
						callback : function(rsData, rsCd, rsMsg){
							_alert(rsMsg, {
								onAgree : function(){
									onClose(true);
								}
							});
						}
					});
				}
			});
		}
		
		//삭제하기전에 연동된 장비가 있는지 체크
		$('body').requestData(mCfg.urlExistEqu, {agent_id:agentId}, {
			callback : function(rsData){
				if(rsData == "OK")
					delAgent();
				else if (rsData == "EXIST")
					_alert("연동된 장비가 존재합니다.<br>먼저 연동된 장비를 삭제하세요.");
				else 
					_alert("연동된 장비 존재 여부 체크에 실패했습니다.<br>다시 시도하세요.");
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
	slapp.agent.form.init();
});