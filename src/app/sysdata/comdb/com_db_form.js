//# sourceURL=com_db_form.js
'use strict';

_SL.nmspc("comdb").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formComDb',
		urlSelect : gCONTEXT_PATH + "sysdata/com_db_form.json",
		urlSelectSample : gCONTEXT_PATH + "sysdata/get_com_db_sample.json",
		urlSelectEncrypt : gCONTEXT_PATH + "sysdata/get_com_db_text_encrypt.json",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlExist : gCONTEXT_PATH + "sysdata/com_db_id_exist.json",
		urlDelete : gCONTEXT_PATH + "sysdata/com_db_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "sysdata/com_db_add.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "sysdata/com_db_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		jdbcId : $(mCfg.formId + ' [name=jdbc_id]'),
		typeCodeType : $(mCfg.formId + ' .btn-register-type').data('value')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.jdbcId.val() == "" ? true : false,
		mode : m$.jdbcId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.jdbcId.addClass("form-text").prop("readonly", true);
		}
		
		// 데이타 조회
		if(!mState.isNew) select();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
		
		//종류 SelectBox Change
		m$.form.find('[name=jdbc_type]').change(function(){
			if($(this).val() !=""){
				$('body').requestData(mCfg.urlSelectSample, {code_id:$(this).val()}, {
					callback : function(rsData, rsCd, rsMsg){
						m$.form.find('[name=jdbc_prop]').val(rsData);
					}
				});
			}
		});
		
		//종류코드 등록
		m$.form.find('.btn-register-type').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.typeCodeType, {
			width:550,
			height:450,
			onClose: function(){
				_addCode(m$.form.find('[name=jdbc_type]'));
			}
		});
		
		//변환
		m$.form.find('.btn-convert').on("click", function(){
			var text = m$.form.find("[name=encrypt_text]").val();
			
			if(text != ""){
				$('body').requestData(mCfg.urlSelectEncrypt, {text_str:text}, {
					callback : function(rsData, rsCd, rsMsg){
						m$.form.find('[name=encrypt_text]').val(rsData);
					}
				});
			}
		});
	},

	select = function() {
		var
			id = m$.jdbcId.val(),
			rqData = {'jdbc_id': id},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {});
			
			slui.attach.setTransformSelect(mCfg.formId);
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var exceptNm = /^[_|a-z|A-Z|0-9|\*]+$/;
		var jdbcId = m$.jdbcId.val();
		
		if(!exceptNm.test(jdbcId)){
			_alert("ID는 영문, 숫자, _ 만 사용 할 수 있습니다.");
			return;
		} 
		
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

		if(mState.isNew) {
			$('body').requestData(mCfg.urlExist, {jdbc_id : jdbcId}, {
				callback : function(rsData){
					if(rsData == true){
						submit();
					} else {
						_alert("사용중인 JDBC ID가 있어 저장 할 수 없습니다.");
					}
				}
			});
		}
		else {
			submit();
		}
	},
	
	onDelete = function(){
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
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
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();

		$fld.append('<option value="'+data.code_id+'">'+data.code_name+'</option>');
		$fld.val(data.code_id);

		slui.attach.setTransformSelect(mCfg.formId);
		$fld.trigger('change');
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.comdb.form.init();
});