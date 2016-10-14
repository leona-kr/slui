'use strict';
_SL.nmspc("mylogs").form = function(){

	
	
	var
	// Config 정의
	mCfg = {
			
	},
	
	// JQuery 객체 변수
	
	m$ = {
			urlSubmitLink 		: gCONTEXT_PATH + "monitoring/mylogs_list.html",
			urlDeleteLink 		: gCONTEXT_PATH + "monitoring/mylogs_delete.do",
			urlUpdateLink 		: gCONTEXT_PATH + "monitoring/mylogs_update.do",
			form				: $("#mylogs_form")
	},

	
	init = function(){
		
		
		if(!gSetting.use_delete) $("#bt_del").hide();
		
		$("#share_yn").attr("title",tooltip1);
		if( $("#yn_shared").val() == 'Y' ){
			/*$("input:radio[name=share_yn]:input[value='Y']").attr("checked", true);*/
			
			$("#share_yn input:radio[name=share_yn]:input[value='Y']").prop('checked',true);
		}
		else{
			/*$("input:radio[name=share_yn]:input[value='N']").attr("checked", true);*/
			$("#share_yn input:radio[name=share_yn]:input[value='N']").prop('checked',true);
		}
		
		
		checkShareYN_UI();

		
		$( 'input[name="share_yn"]:radio' ).on('change', function(e) {
			
			checkShareYN_UI();
		});
		
		$("form").keydown(function(event) {
			if(event.which=='13'){
				_SL.enterNext();  		
			}   	
		});

		 
		 $("#detail-add").click(function(){
			 var afterClose = $(this).data('after-close') == true ? true : false;
			 checkInvalid(afterClose);
			 
		 })
		 
		 $("#detail-delete").click(function(){
			 var afterClose = $(this).data('after-close') == true ? true : false;
			 deleteEquipment(afterClose);
		 })
		 
		 
		 $("#detail-cancel").click(function(){
			 
			 /*jsSubmit("CANCEL");*/
			 var afterClose = $(this).data('after-close') == true ? true : false;
			 onClose(afterClose);
		 })
		 
		 $("#yn_shared").val()
		 
	
	},
	
	bindEvent = function() {
		
	
	},
	

	drawGrid = function($grid){
		
		
		
	},


	jsSubmit = function() {
		
		switch(arguments[0]) {
		case "CANCEL" :
			
			onClose(true);
			break;
		}
	},

	checkInvalid = function(afterClose) {
		var _this = this;

		$("#share_group_list,#share_user_list").prop("disabled", false);//공유설정이 N일때 disabled를 풀어줘야 selected할수있고, 파라메터로 넘어간다
		$("#share_group_list option").each(function(){$(this).selected = true;});
		$("#share_user_list option").each(function(){$(this).selected = true;});

		var params = $.extend({}, _SL.serializeMap( $("#mylogs_form") ));

		$('body').requestData( m$.urlUpdateLink, params, {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});
	},
	
	deleteEquipment = function(afterClose) {
		_confirm("삭제 하시겠습니까?",{
			onAgree : function(){
				var params = $.extend({}, _SL.serializeMap( $("#mylogs_form") ));
		
				$('body').requestData( m$.urlDeleteLink, params, {
					callback : function(rsData, rsCd, rsMsg){
						_alert('처리되었습니다', {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					}
				});
			}
		});
	},
	
	loadUser = function(userDataArr){//사용자검색팝업에서 선택한 사용자정보들의 배열을 여기(opener)로  옮겨주는 함수

		var userInfo, userId, userName ;
		var select = $(document).find('#share_user_list option');
		var check = 0;
		
		if (select.length == 0){
			for(var idx in userDataArr){
				userInfo = userDataArr[idx].split(",");
				userId = userInfo[0];
				userName = userInfo[1];
				$(document).find('#share_user_list').append("<option value='" + userId + "'>" + userName + " ["+userId+"]" + "</option>");
			}
		} else {
			for(var idx in userDataArr){
				userInfo = userDataArr[idx].split(",");
				userId = userInfo[0];
				userName = userInfo[1];

				$(document).find('#share_user_list option').each(function(){
					if (userId == $(this).val()) check = 1;
				});
				
				if (check != 1){
					$(document).find('#share_user_list').append("<option value='" + userId + "'>" + userName + " ["+userId+"]" + "</option>");
				} else {
					_alert("해당 ID가 이미 존재합니다. ( ID : " + userId + " )");
					check = 0;
				}
			}
		}
	},

	checkShareYN_UI = function(){//공유가 Y인지 N인지 체크해서 UI변경..

		if ( $("#share_yn :input:radio[name=share_yn]:checked").val() == "N" ){	
			
			$("#user_cust_list,#share_group_list,#share_user_list").attr("disabled", true)
			$("#share_group_list option","#share_user_list option").each(function(){this.selected = false;});
			$("#group_btn,#user_btn").css("opacity","0.3");
			$("#group_btn,#user_btn").css("cursor","default");		
			$("#cust_add,#cust_del,#user_add,#user_del").unbind("click");
			$("#share_group_list option,#share_user_list option").each(function(){this.selected = false;});
			
		}else{		
			
			$("#user_cust_list,#share_group_list,#share_user_list").attr("disabled", false)
			$("#group_btn,#user_btn").css("opacity","1.0");
			$("#group_btn,#user_btn").css("cursor","pointer");
			
			checkShareY_Proc();
			
		}
	},

	checkShareY_Proc = function(){
		
		$("#cust_add,#cust_del,#user_add,#user_del").unbind("click");//click Event초기화 : 이거 안하면 공유가Y인 대시보드를 수정하려고 열때마다 click Event가 중복추가됨
		//기관 공유목록창 조정
		$("#cust_add").click(function(){			
			var val = $("#user_cust_list option:selected").val();
			var text = $("#user_cust_list option:selected").text();

			if(val == "") {
				_alert("기관을 선택하세요.");
				return;
			}
			
			if( $("#share_group_list option").is(
				function() {
					return this.value == val;
				})
			){
				_alert("동일한 기관이 존재합니다.");
				return;
			}
			
			$("#share_group_list").append("<option value='" + val + "'>" + text + "</option>");	
		});
	    
	    $("#cust_del").click(function(){
			$("#share_group_list :selected").remove();
		});
	    
	 
		$("#user_del").click(function(){		
			$("#share_user_list :selected").remove();
		});
		
		$("#user_add").exModalPopup("/system/comuser_list_to_select.html?menu_idx=multi&popup=y", {
			width:550,
			height:300,
			onClose: function(){
				
				_loadUser();
			}
		});
	},
	
	_loadUser = function(){
		
		var data = slapp.user.listSel.getParam();
		var userDataArr = data.userDataArr;
		var userIdx  = data.userIdx;
		
	
		var userInfo, userId, userName, userMobile, userMail;
		var select = $("#share_user_list");	
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
				$("#share_user_list").append("<option value='" + userId + "'>" + userName + " ["+userId + "]</option>");
			
			}else{
				$("#share_user_list option").each(function(){
					if (userId == $(this).val()) check = 1;
				});	
				
				if (check != 1){
					$("#share_user_list").append("<option value='" + userId + "'>" + userName + " ["+userId + "]</option>");
				} else {
					if(!isDupChk){//이전까지 유효성 체크된 ID가 하나도 없었을 때
						msg += '해당 ID가 이미 존재합니다.<br/>(ID : '+userId;
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
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
			
		}
	},

	
	viewDetail = function(url){
		
	};
	
	
	return {
		init: init
		
	};

}();

$(function(){
	


	slapp.mylogs.form.init();
});