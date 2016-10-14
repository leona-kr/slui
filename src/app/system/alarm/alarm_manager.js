'use strict';

_SL.nmspc("alarm").manager = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formAlarmManager',
		urlUserList : gCONTEXT_PATH + "system/comuser_list_to_select.html",
		urlSave : gCONTEXT_PATH + "system/alarm_manager_save.do"
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
		// PLUS
		m$.form.find('.btn-plus').off().on('click', function(){
			var modal = new ModalPopup(mCfg.urlUserList, {
				width:900,
				height:600,
				setScroll : true,
				onClose : function(){
					_loadUser();
				}
			});
		});
		
		// MINUS
		m$.form.find('.btn-minus').off().on("click", function(){
			m$.form.find('[name=chk_user_list] :selected').remove();
		});
		
		// SAVE
		m$.form.find('.btn-save').off().on("click", onSave);
	},

	_loadUser = function(){

		var data = slapp.user.listSel.getParam();
		var userDataArr = data.userDataArr;
		var userIdx  = data.userIdx;
		
		var userInfo, userId, userName, userMobile, userMail;
		var select = m$.form.find('[name=chk_user_list] option');	
		var check = 0;
		var isDupChk = false;
		var msg = '';
		
		for(var idx in userDataArr){
			userInfo = userDataArr[idx];
			userId = userInfo.user_id;
			userName = userInfo.user_nm;
			userMobile = userInfo.mobile_no;
			userMail = userInfo.mail_addr;	
			
			if(select.length == 0){
				m$.form.find('[name=chk_user_list]').append("<option value='" + userId + "'>" + userName + " ["+userId + "], [" + userMobile + "], [" + userMail + "]" + "</option>");
			
			}else{
				m$.form.find('[name=chk_user_list] option').each(function(){
					if (userId == $(this).val()) check = 1;
				});	
				
				if (check != 1){
					m$.form.find('[name=chk_user_list]').append("<option value='" + userId + "'>" + userName + " ["+userId + "], [" + userMobile + "], [" + userMail + "]" + "</option>");
				} else {
					if(!isDupChk){//이전까지 유효성 체크된 ID가 하나도 없었을 때
						msg += '해당 ID가 이미 존재합니다.<br>(ID : '+userId;
						isDupChk = true;
					}else{
						msg += ', '+userId;
					}
					
					check = 0;
				}
			}
		}
		
		if(isDupChk) 
			_alert(msg+ ' )');
	},

	onSave = function(){
		
		var alarmCds =  new Array();
		var chkUserList =  new Array();
		
		m$.form.find('input[name=alarm_cd]:checked').each(function(){
			alarmCds.push(this.value);
		});
		
		$("option", "[name=chk_user_list]").each(function(){this.selected = true;});

		var data = _SL.serializeMap(m$.form);
		$.extend(data ,{alarm_cd_arr : alarmCds});
		
		$("option", "[name=chk_user_list]").each(function(){this.selected = false;});
		
		
		$('body').requestData(mCfg.urlSave, data, {
			callback : function(rsData, rsCd, rsMsg){
				if(rsCd) {
					if(rsCd == "SUC_COM_0004"){
						_alert(rsMsg, {
							onAgree : function() {
								location.reload();
							}
						});
					}
					else
						_alert("저장 처리중 에러가 발생했습니다.<br> 다시 실행하세요.");
				}else{
					_alert("적용중 에러가 발생했습니다.<br>다시 실행하거나 수정권한이 있는지 확인해 주세요.");
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
	slapp.alarm.manager.init();
	
	//위험도 설정
	$("#btnRiskSettting").click(function(){
		new ModalPopup(gCONTEXT_PATH + "system/risk_ruleset_form.html",{
			width:650,
			height:530,
			onClose : function(){
				location.reload();
			}
		});
	});
});