//# sourceURL=eps_security_event_form_all_check.js
'use strict';

_SL.nmspc("epsSecurityEvent").eventProcessForm = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formSecurityEventAllCheckForm',
		urlCurPageProcess : gCONTEXT_PATH + "event2/eps_security_event_form_curPage_check.do",
		urlAllPageProcess : gCONTEXT_PATH + "event2/eps_security_event_form_allPage_check.do",
		urlProc : gCONTEXT_PATH + "event2/eps_security_event_proc.json",
		urlCheckAll : gCONTEXT_PATH + '/event2/eps_event_handling_check_All.do',
		urlUpdateAll :  gCONTEXT_PATH + '/event2/eps_event_handling_update_all.do',
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
		m$.form.find('.btn-processAllPage').on('click', onProcessAllPage);
		m$.form.find('.btn-processCurPage').on('click', onProcessCurPage);
	
		
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	onProcessCurPage = function(){
		
		var afterClose = $(this).data('after-close') == true ? true : false;
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
			callback : function(rsData, rsCd, rsMsg){
				if(rsCd=="SUC_COM_0002"){
					_alert("처리 되었습니다.",{
						onAgree : function(){
							/*location.reload();*/
							onClose(true)
						}
					});
					
				}else{
					
					_alert("처리중 에러가 발생했습니다.\n다시 시도해 보세요.");
				}
			}
		});
		
		
	},
	
	saveDataCurPage = function(){
		
	},
	
	saveDataAllPage = function(){
		
		$("#updt_handling_type_cd").val(1);
		$("#proc_event_cont").val(procCont);

		


		$('body').requestData(mCfg.urlUpdateAll, param, {
							callback : function(rsData, rsCd, rsMsg){
								if(rsCd!="SUC_COM_0002"){
									_alert("처리중 에러가 발생했습니다.\n다시 시도해 보세요.");
								}
								else{
									/*location.reload();*/
									onClose(true);
								}
							}
						});
		
		
		
		
		
	},
	
	onProcessAllPage = function(){
		
		
		var handlingTypeCd = [];
		var handlingNm = "";
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
			
		}	
		

		

		$('body').requestData(mCfg.urlCheckAll, param, {
			callback : function(rsData, rsCd, rsMsg){
				if(rsCd!="SUC_COM_0002"){
					_alert(rsMsg);
				}else{
					if(rsData.rsMap.RESULT_MSG == "handlingTypeCd_incorrect" ){
						
						handlingTypeCd.push(data.handling_type_cd);
						for(var i=0; i < handlingTypeCd.length; i++){
							handlingNm = eventStatusJson[handlingTypeCd[i]];
							if(handlingTypeCd[i] != null){					
					
								_confirm(handlingNm + "인 상태가 있습니다. 상태를 변경하시겠습니까?",{
									onAgree : function(){
										saveDataAllPage
									}
									
								});
								
							}
						}
						
					}else{
						
						handlingTypeCd.push(data.handling_type_cd);
						for(var i=0; i < handlingTypeCd.length; i++){
							handlingNm = eventStatusJson[handlingTypeCd[i]];
							if(handlingTypeCd[i] != null){
								_confirm(handlingNm + "인 상태가 있습니다. 상태를 변경하시겠습니까?",{
									onAgree : function(){
										saveDataAllPage
									}
									
								});
								
			
								
							}
						}
						
					}
					
					
					
				}

			}
		});
	}

	
	return {
		init: init
	}

}();

$(function(){
	
	slapp.epsSecurityEvent.eventProcessForm.init();
});
