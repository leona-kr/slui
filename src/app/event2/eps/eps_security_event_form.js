//# sourceURL=eps_security_event_form.js
'use strict';
_SL.nmspc("epsSecurityEvent").eventProcessForm1 = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formSecurityEventCheckForm',
		urlCurPageProcess : gCONTEXT_PATH + "event2/eps_security_event_form_curPage_check.do",
		urlAllPageProcess : gCONTEXT_PATH + "event2/eps_security_event_form_allPage_check.do",
		urlProc : gCONTEXT_PATH + 'event2/eps_security_event_proc.json',
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		
		
	},
	
	init = function(){
		//이벤트 Binding
		bindEvent();

		
		
		
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-processPage').on('click', onProcessPage);
	
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	onProcessPage = function(){
		
		
		var procCont = $.trim($("#proc_cont").val());
		
		if(procCont == "") {
			_alert("처리내용을 입력하세요.");
			$("#proc_cont").focus();
			return;
		}
		
		var param = {
			proc_cont : procCont,
			proc_list : []
		}
		
		for(var i=0; i<slapp.epsSecurityEvent.list.getAllPageIpParam().length; ++i){
			var arrIp = slapp.epsSecurityEvent.list.getAllPageIpParam();
			var arrEventTime = slapp.epsSecurityEvent.list.getAllPageEventTimeParam();
			var arrRulesetId = slapp.epsSecurityEvent.list.getAllPageRulesetIdParam();
			
			param.proc_list.push({
				ruleset_id : arrRulesetId[i],
				src_ip : arrIp[i],
				event_time : arrEventTime[i],
				handling_type_cd : '1'
			});
			
		}
		
	
		
		$('body').requestData(mCfg.urlProc, param, {
			callback : function(rsData){
				if(!rsData){
					_alert("처리중 에러가 발생했습니다.\n다시 시도해 보세요.");
				}else{
					_alert("처리 되었습니다.",{
						onAgree : function(){
							/*location.reload();*/
							onClose(true);
						}
					});
					
				}
			}
		});

			
	}
	
	return {
		init: init
	}

}();

$(function(){
	
	slapp.epsSecurityEvent.eventProcessForm1.init();
});