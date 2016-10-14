//# sourceURL=risk_ruleset_form.js
'use strict';

_SL.nmspc("alarm").riskForm = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formRiskRuleset',
		urlSelect : gCONTEXT_PATH + "system/comcode_type_form.json",
		urlSave : gCONTEXT_PATH + "system/risk_ruleset_update.do",
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		m$.form.find('[name=ratio]').change(onRatioChange);
	},
	
	onRatioChange = function() {
		
		var $ratio = m$.form.find('[name=ratio]'),
		lastIdx = $ratio.length - 1,
		v = parseInt(this.value, 10),
		bLast = $ratio.eq(lastIdx)[0] == this,
		tot = 0, o;
	
		if(isNaN(v) || v < 0 || v > 100) {
			_alert("잘못된 입력 값입니다.");
			for(var i = 0; i <= lastIdx; i++) {
				o = $ratio.eq(i)[0];
				
				if(this != o) tot += parseInt(o.value, 10);
			}
			this.value = 100 - tot;
			this.focus();
			
			return false;
		}

		$ratio.css("background-color","");
		$(this).css("background-color", "#ffff44");
		
		tot = v;
		
		for(var i = 0; i <= lastIdx; i++) {
			o = $ratio.eq(i)[0];
			
			if(this != o) {
				tot += parseInt(o.value, 10);
				if(tot > 100 || i == (lastIdx + (bLast ? -1 : 0))) {
					o.value = parseInt(o.value, 10) + 100 - tot;
					$(o).css("background-color", "#ffff44");
					tot = 100;
				}
			}
		}
	
	},
	
	onSave = function(){
		
		var $riskRangeTo = m$.form.find('[name=risk_range_from]');
		var bfRange = -1;
		
		if(!_SL.validate(m$.form)) return;

		for(var i = 0; i < $riskRangeTo.size(); i++) {
			if(parseInt($riskRangeTo.eq(i).val()) <= bfRange){
				_alert("이전 단계보다 위험율이 커야 합니다.");
				$riskRangeTo.eq(i).focus();
				return;
			}
			
			bfRange = parseInt($riskRangeTo.eq(i).val());
		}
		
		var afterClose = $(this).data('after-close') == true ? true : false;	
		
		$.ajax({
			url : mCfg.urlSave,
			type : "POST",
			dataType : "json",
			data: m$.form.serialize(),
			success : function(rsJson, textStatus, jqXHR){
				if(rsJson.result_cd == "SUC_COM_0004") {
					_alert(rsJson.result_msg, {
						onAgree : function() {
							onClose(afterClose);
						}
					});
				}else{
					_alert("저장 처리중 에러가 발생했습니다.<br/> 다시 실행하세요.");
				}
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
	slapp.alarm.riskForm.init();
});