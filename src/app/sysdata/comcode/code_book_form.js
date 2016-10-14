//# sourceURL=code_book_form.js
'use strict';

_SL.nmspc("codebook").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formCodeBookForm',
		urlComCodeTypeForm : gCONTEXT_PATH + 'sysdata/comcode_type_form.html',
		urlFieldExist : gCONTEXT_PATH + 'sysdata/code_book_field_exist.json',
		urlSave : gCONTEXT_PATH + "sysdata/code_field_insert.do",
		urlDelete : gCONTEXT_PATH + "sysdata/code_field_del.do"
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		codeId : $(mCfg.formId + ' [name=code_id]'),
		codeType : $(mCfg.formId + ' [name=s_code_type]'),
		codeIdSel : $(mCfg.formId + ' [name=code_id_sel]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.codeId.val() == "" ? true : false
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();

		// 장비 종류 SelectBox Load
		m$.form.find('[name=log_field_sel]').chosen({search_contains : true, width:'100%'});
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}else{
			m$.form.find(".btn-register-code").hide();
		}
		
		// 데이타 조회
		if(!mState.isNew) select();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
		
		// Role Update Button
		m$.form.find('.btn-register-code').exModalPopup(mCfg.urlComCodeTypeForm, {
			width:550,
			height:300,
			onClose: function(){
				_addCodeType(m$.codeIdSel);
			}
		});
		
		// 코드종류 change Event
		codeIdSelChange();
		
		//로그필드 플러스 버튼
		m$.form.find('#cust_add').click(function(){
	 		var codeIdVal = m$.form.find("[name=code_id_sel] option:selected").val();
			var fldVal =  m$.form.find("[name=log_field_sel] option:selected").val();
			var text = m$.form.find("[name=log_field_sel] option:selected").text(); 

			if(codeIdVal ==""){
				_alert("코드종류를 선택하세요.");
				return;
			}
			
			if(fldVal == "") {
				_alert("로그필드를 선택하세요.");
				return;
			}
			
			if( m$.form.find("[name=add_field_list] option").is(
				function() {
					return this.value == fldVal;
				})
			){
				_alert("이미 추가한 필드입니다.");
				return;
			}

			$('body').requestData(mCfg.urlFieldExist, {code_id:codeIdVal , field_name:fldVal}, {
				callback : function(rsData, rsCd, rsMsg){
					if(rsData == "OK") {
						m$.form.find("[name=add_field_list]").append("<option value='" + fldVal + "'>" + text + "</option>");
					} else if (rsData == "EXIST"){
						_alert("이미 다른 코드종류에서 사용중입니다.");
					} else {
						_alert("저장 중 에러가 발생했습니다.<br>다시 실행하세요.");
					}
				}
			});
		});
		
		//로그필드 마이너스 버튼
		m$.form.find('#cust_del').click(function(){
			m$.form.find("[name=add_field_list] :selected").remove();
		});
	},
	
	codeIdSelChange = function() {
		
		m$.codeIdSel.change(function(){
			m$.form.find("[name=add_field_list] option").each(function(){
				if(this.value != "") $(this).remove();
			});
					
			if(gComCodeFieldToCode[$(this).val()] != null){
				var fieldNameArr = gComCodeFieldToCode[$(this).val()].split(",");
				
				for(var idx in fieldNameArr){
					var tempVal = fieldNameArr[idx];
					m$.form.find("[name=add_field_list]").append("<option value='" + tempVal + "'>" + gFieldCaptions[tempVal] +"["+ tempVal +"]</option>");
				}
			}
		});		
	},
	
	select = function() {
		
		var fieldNameArr = m$.form.find('[name=field_name_list]').val().split(",");
		
		for(var idx in fieldNameArr){
			var tempVal = fieldNameArr[idx];
			m$.form.find("[name=add_field_list]").append("<option value='" + tempVal + "'>" + gFieldCaptions[tempVal] +"["+ tempVal +"]</option>");
		}

		m$.form.find("[name=code_id_sel]").val(m$.codeId.val());
		m$.form.find("[name=code_id_sel]").prop('disabled', true);
	},
	
	
	onSave = function(){
		if(!mState.isNew)
			m$.form.find("[name=code_id_sel]").prop('disabled', false);
			
		var codeIdVal = m$.form.find("[name=code_id_sel] option:selected").val();
		
		m$.form.find("[name=add_field_list] option").each(function(){this.selected = true;}); 	
	 	
	 	if( m$.form.find("[name=add_field_list] option:selected").length == 0){
	 		_alert("로그필드를 추가하세요.");
	 		return;
	 	} 
	 	
	 	var afterClose = $(this).data('after-close') == true ? true : false;

		$('body').requestData(mCfg.urlSave, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});
	},
	onDelete = function(afterClose){
		if(!mState.isNew)
			m$.form.find("[name=code_id_sel]").prop('disabled', false);
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		var codeIdVal = m$.form.find("[name=code_id_sel] option:selected").val();

		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {code_id_sel : codeIdVal}, {
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
	
	_addCodeType = function($fld) {
		var data = slapp.comcode.typeform.getCodeType();
		
		$fld.append('<option value="'+data.code_id+'">'+data.code_name+'</option>');
		$fld.val(data.code_id);

		slui.attach.setTransformSelect(mCfg.formId);
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.codebook.form.init();
});