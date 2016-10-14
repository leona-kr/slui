//# sourceURL=group_field_form.js
'use strict';

_SL.nmspc("comGroupField").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formComGroupField',		
		add : {
			action : gCONTEXT_PATH + "sysdata/group_field_config_insert.do",
			message : "등록 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId)
	},
	
	// 현재 상태 변수
	mState = {
		mode : mCfg.add,
		/*	
		isNew : m$.codeId.val() == "" ? true : false,
		mode : m$.codeId.val() == "" ? mCfg.add : mCfg.update,
		*/
		groupField : []
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
	
		//chosen
		m$.form.find("[name=group_field_add]").chosen({
			search_contains : true
		});
	},
	
	getCode = function() {
		return mState.groupField;
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// PLUS
		m$.form.find('.btn-plus').on('click', function(){
			var fldVal = m$.form.find("[name=group_field_add] option:selected").val();
			var text = m$.form.find("[name=group_field_add] option:selected").text(); 
			
			if(fldVal == "") {
				_alert("기준필드를 선택하세요.");
				return;
			}
			
			if( m$.form.find("[name=add_group_field_list] option").is(
				function() {
					return this.value == fldVal;
				})
			){
				_alert("이미 추가한 필드입니다.");
				return;
			}
			
			m$.form.find('[name=add_group_field_list]').append("<option value='" + fldVal + "'>" + text + "</option>");
		});
		// MINUS
		m$.form.find('.btn-minus').on("click", function(){
			var $selVal = m$.form.find('[name=add_group_field_list] :selected');
			
			if($selVal.val() == 'eqp_ip'){
				_alert('장비IP는 삭제할 수 없습니다.');
				return;
			} 
			$selVal.remove();
		});			
	},
	
	onSave = function(){
		
		m$.form.find("[name=add_group_field_list] option").each(function(){this.selected = true;}); 
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		var req = _SL.serializeMap(m$.form);
		
		mState.groupField = req.add_group_field_list;
		
		$('body').requestData(mState.mode.action, req, {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(true);
					}
				});
			}
		});
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};

	return {
		init: init,
		getCode : getCode
	};

}();

$(function(){
	slapp.comGroupField.form.init();
});