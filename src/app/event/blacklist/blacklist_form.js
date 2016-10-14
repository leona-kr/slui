//# sourceURL=blacklist_form.js
'use strict';

_SL.nmspc("blacklist").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formBlacklist',
		urlSelect : gCONTEXT_PATH + "event/blacklist.json",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlExist : gCONTEXT_PATH + "event/blacklist_exist.json",
		urlDelete : gCONTEXT_PATH + "event/blacklist_delete.do",
		urlRangeInsert : gCONTEXT_PATH + "event/blacklist_range_add.do",
		add : {
			action : gCONTEXT_PATH + "event/blacklist_insert.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event/blacklist_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		blacklistIp : $(mCfg.formId + ' [name=blacklist_ip]'),
		blacklistIp2 : $(mCfg.formId + ' [name=blacklist_ip2]'),
		btnTypeCodeAdd : $(mCfg.formId + ' .btn-register-type'),
		expDt : $(mCfg.formId + ' [name=expire_dt]'),
		timeSet : $(mCfg.formId + ' [name=timeSet]'),
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.blacklistIp.val() == "" ? true : false,
		mode : m$.blacklistIp.val() == "" ? mCfg.add : mCfg.update
	},
	
	
	init = function(){
		
		//이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}else{
			m$.blacklistIp.addClass("form-text").prop("readonly", true);
			m$.form.find(".blacklist_ip2_text").hide();
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
		
		//이벤트유형 등록버튼
		m$.btnTypeCodeAdd.exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.btnTypeCodeAdd.data('value'), {
			width:550,
			height:455,
			draggable: true,
			onClose: function(){
				_addCode(m$.form.find('[name=type]'));
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
		
		// timeSet change 이벤트 설정
		m$.timeSet.change(function(){
			var setMin = this.value;
			var nTime = _SL.formatDate("yyyyMMdd");
			
			if (setMin == 0) {
				m$.expDt.val("");
			}else{
				var startDate = _SL.formatDate.addMin(nTime+"0000", setMin);
				m$.expDt.val(startDate.substring(0,8));
			}
		});		
		
		// 만료일자 change 이벤트 설정
		m$.expDt.change(function(){
			m$.timeSet.val(0);
			slui.attach.setTransformSelect(mCfg.formId);
		});
	},
	
	select = function() {
		var rqData = {'blacklist_ip': m$.blacklistIp.val()},
			callback = function(data){
				_SL.setDataToForm(data, m$.form);
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if (!_SL.validate(m$.form)) return;

		var afterClose = $(this).data('after-close') == true ? true : false,
			sBlackIp = m$.blacklistIp.val(),
			eBlackIp = m$.blacklistIp2.val(),
			expDt = m$.expDt.val();

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
		};
		
		if(expDt){//만료일자가 입력되었다면 valid체크!!
			var nDt = _SL.formatDate("yyyyMMdd");
			
			if(nDt > expDt) {
				_alert("만료일이 현재시간보다 작습니다.");
				return;
		    }
		}
		
		if(eBlackIp){//IP범위입력..
			if(_SL.ip.compare(sBlackIp, eBlackIp) == 1) {
				_alert("시작 IP가 종료 IP보다 큽니다.",{
					onAgree : function(){
						m$.blacklistIp.focus();
					}
				});
				return;
			}
			
			$('body').requestData(mCfg.urlRangeInsert, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					if(rsData == true) {
						_alert(rsMsg, {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					}else{
						_alert(rsMsg);
					}
				}
			});
			
			
		}else{
			if(mState.isNew) {
				$('body').requestData(mCfg.urlExist, {blacklist_ip:sBlackIp}, {
					callback : function(rsData, rsCd, rsMsg){
						if(rsData == true)
							submit();
						else
							_alert(rsMsg);
					}
				});
			}else{
				submit();
			}
		}
	},

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				
				var blackIp = m$.blacklistIp.val();
				
				$('body').requestData(mCfg.urlDelete, {blacklist_ip:blackIp}, {
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
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();
		$fld.append("<option value='"+data.code_id+"' selected='selected'>"+data.code_name+"</option>");
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
	slapp.blacklist.form.init();
});