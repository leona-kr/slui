//# sourceURL=equip_form.js
'use strict';

_SL.nmspc("equipment").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formEquip',
		psrTreeId : '#psrTree',
		
		urlEqpJson : gCONTEXT_PATH + "system/eqp_codes.json",
		urlSelect : gCONTEXT_PATH + "management/equip_form.json",
		urlSelectPsrTree : gCONTEXT_PATH + "management/log_psr_list.json",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlPerFormLimitForm : gCONTEXT_PATH + 'event/performance_limit_form.html',
		urlExistIp : gCONTEXT_PATH + 'management/equip_check_ip.json',
		urlDelete : gCONTEXT_PATH + "management/equip_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "management/equip_add.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "management/equip_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		psrTree : $(mCfg.psrTreeId),
		
		eqpId : $(mCfg.formId + ' [name=eqp_id]'),
		equipCodeType : $(mCfg.formId + ' .btn-register-equip').data('value'),
		groupCodeType : $(mCfg.formId + ' .btn-register-group').data('value')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.eqpId.val() == "" ? true : false,
		mode : m$.eqpId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		
		m$.form.find('[name=eqp_type_cd]').chosen({search_contains : true, width:'100%'});
		
		// 이벤트 Binding
		bindEvent();
		
		m$.psrTree.hide();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.eqpId.addClass("form-text").prop("readonly", true);
		}
		// 데이타 조회
		if(!mState.isNew) select();
		
		//트리 초기화
		initTree();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
		
		//장비종류 등록 버튼
		m$.form.find('.btn-register-equip').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.equipCodeType, {
			width:550,
			height:455,
			onClose: function(){
				_addCodeChosen(m$.form.find('[name=eqp_type_cd]'));
			}
		});
		
		// 그룹 등록 버튼
		m$.form.find('.btn-register-group').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.groupCodeType, {
			width:550,
			height:455,
			onClose: function(){
				_addCode(m$.form.find('[name=group_cd]'));
			}
		});
		
		m$.form.find('[name=psr_id]').change(getParserList);
		
		// 성능 임계치 유형 등록 버튼
		m$.form.find('.btn-register-threshold').exModalPopup(mCfg.urlPerFormLimitForm, {
			width:550,
			height:420,
			onClose: function(){
				_addThreshold(m$.form.find('[name=threshold_id]'));
			}
		});
		
		//상태체크방법 부분
		m$.form.find('[name=stat_chk_type]').change(function(event) {
			if(event.target.value == "2") {
				m$.form.find('[name=input_port]').show();
				m$.form.find("[name=stat_chk_port]").attr("data-valid", "Port 번호,required,number");
			} else {
				m$.form.find('[name=input_port]').hide();
				m$.form.find("[name=stat_chk_port]").removeAttr("data-valid");
			}
		});
		
		m$.psrTree.draggable({
			handle: ".area-head"
		});
	},

	select = function() {
		var
			id = m$.eqpId.val(),
			rqData = {'eqp_id': id},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {
				"eqp_ip" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=b_eqp_ip]').val(cvData);
						m$.form.find('[name=eqp_ip]').val(cvData);
					}
				},
				"eqp_type_cd" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=eqp_type_cd]').val(cvData);
						m$.form.find('[name=eqp_type_cd]').trigger('chosen:updated');
						m$.form.find('[name=b_eqp_type_cd]').val(cvData);
					}
				},
				"agent_id" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=agent_id]').val(cvData);
						m$.form.find('[name=b_agent_id]').val(cvData);
					}
				},
				"psr_id" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=psr_id]').val(cvData);
						m$.form.find('[name=b_psr_id]').val(cvData);
					}
				}
			});
			
			slui.attach.setTransformSelect(mCfg.formId);
			
			m$.form.find("[name=stat_chk_type]:checked").trigger("change");
			
			getParserList();
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	getParserList  = function(){
		var psrId = m$.form.find('[name=psr_id]').val();
		
		$('body').requestData(mCfg.urlSelectPsrTree, {psr_id: psrId}, {
			callback : function(rsData, rsCd, rsMsg){
				if(rsData.length > 0){
					openTree(rsData);
				}else{
					m$.psrTree.hide();
				}
			}
		});
	},
	
	initTree = function(){
		// Parser 트리 초기화
		m$.psrTree.find('.dynTree').dynatree({
			minExpandLevel : 2,
			onClick: function(node, event) {
				if(node.data.key == 'root'){
					//console.log('링크걸곳');
					return false;
				}
			},
			persist: false,
			children: [
				{title : 'erere' , key : "root" ,icon : false,
					children : [
						{title : "Security", key : "log_type_cd_1", isFolder : true},
						{title : "Traffic", key : "log_type_cd_2", isFolder : true},
						{title : "System", key : "log_type_cd_3", isFolder : true},
						{title : "SMS", key : "log_type_cd_4", isFolder : true}
					]
				}
			]
		});		
	},
	
	openTree  = function(rsData){
		var title = m$.form.find('[name=psr_id] :selected').text();
		var key = "log_type_cd_1";
		var oTree = m$.psrTree.find('.dynTree').dynatree("getTree");
		var pNode;
		
		oTree.reload();
		oTree.getNodeByKey("root").setTitle(_SL.htmlEscape(title));
		
		// Parser 트리 데이터 Load
		for(var i = 0; rsData != null && i < rsData.length; i++) {
			var data = rsData[i];
			
			pNode = oTree.getNodeByKey("log_type_cd_" + data.log_type_cd);
			
			pNode.addChild({
				title : data.log_psr_nm,
				key : "log_psr_id_" + data.log_psr_id,
				dto : data
			});
			
			if(!pNode.data.dto) {
				
				pNode.data.dto = {
					psr_id	: data.psr_id,
					log_type_cd	: data.log_type_cd
				}
				
				pNode.toggleExpand();
			}
		}
		
		m$.psrTree.show();
	},

	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var afterClose = $(this).data('after-close') == true ? true : false;	
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
		
		var bip = m$.form.find("[name=b_eqp_ip]").val(),
			cip = m$.form.find("[name=eqp_ip]").val();

		// 이전 IP와 현재 IP가 다른 경우
		if(bip != cip) {
			$('body').requestData(mCfg.urlExistIp, {eqp_ip:cip}, {
				callback : function(rsData){
					if(rsData == "OK")
						submit();						
					else if (rsData == "EXIST")
						_alert("이미 장비에 등록된 IP입니다.");
					else
						_alert("IP 중복 체크에 실패했습니다.<br> 다시 시도하세요.");
				}
			});			
		}
		else {
			submit();
		}
	},
	
	onDelete = function(){
		
		var eqpId = m$.eqpId.val();
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {eqp_id: eqpId}, {
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
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();
		$fld.append("<option value='"+data.code_id+"'>"+data.code_name+"</option>");
		$fld.val(data.code_id);
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	_addCodeChosen = function($fld) {
		var data = slapp.comcode.form.getCode();
		$fld.append("<option value='"+data.code_id+"'>"+data.code_name+"</option>");
		$fld.val(data.code_id);
		$fld.trigger('chosen:updated');
	},
	
	
	_addThreshold = function($fld) {
		var data = slapp.sms.form.getThreshold();
		$fld.append("<option value='"+data.threshold_id+"'>"+data.threshold_name+"</option>");
		$fld.val(data.threshold_id);
		slui.attach.setTransformSelect(mCfg.formId);
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.equipment.form.init();
});