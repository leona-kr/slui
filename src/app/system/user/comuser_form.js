//# sourceURL=comuser_form.js
'use strict';


_SL.nmspc("user").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formComuser',
		urlSelect : gCONTEXT_PATH + "system/comuser.json",
		urlExist : gCONTEXT_PATH + "system/comuser_exist.json",
		urlDelete : gCONTEXT_PATH + "system/comuser_delete.do",
		add : {
			action : gCONTEXT_PATH + "system/comuser_insert.do",
			message : "등록 하시겠습니까?",
			passwdValid : "비밀번호,required,password" 
		},
		update : {
			action : gCONTEXT_PATH + "system/comuser_update.do",
			message : "수정 하시겠습니까?",
			passwdValid : "비밀번호,password" 
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		userId : $(mCfg.formId + ' [name=user_id]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.userId.val() == "" ? true : false,
		mode : m$.userId.val() == "" ? mCfg.add : mCfg.update
	},
	
	// 기타 변수
	userValidator = {
		password : function (elem) {
			if ($(elem).val() == "") return;
			
			var userId = m$.userId.val();
			var passwd = $(elem).val();
			var typeCnt = 0;
			
			if (/[가-힣]/.test(passwd)) {
				this.message = "비밀번호는 한글을 입력할 수 없습니다.";
				this.bValid = false;
			} else if (passwd.length < 9 || passwd.length > 15) {
				this.message = "비밀번호는 9자 ~ 15자 이내로 입력하세요.";
				this.bValid = false;
			} else if (passwd == userId) {
				this.message = "아이디와 비밀번호는 같을 수 없습니다.";
				this.bValid = false;
			} else {
				if(/[A-Z]/.test(passwd)) typeCnt++;
				if(/[a-z]/.test(passwd)) typeCnt++;
				if(/[\d]/.test(passwd)) typeCnt++;
				if(/[^A-Za-z0-9]/.test(passwd)) typeCnt++;
				
				if(typeCnt < 3) {
					this.message = "영문 대문자/영문 소문자/숫자/특수문자 중 3가지 이상의 문자 조합으로 입력하세요.";
					this.bValid = false;
				}
			}
		}
	},
	
	init = function(){
		
		// 이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.userId.addClass("form-text").attr("readonly", "readonly");
			
			if(m$.userId.val() == gSessionUserId) m$.form.find(".btn-delete").hide();
		}
		
		m$.form.find("[name=passwd]").attr("data-valid", mState.mode.passwdValid);
		
		if(gUserIpRestrictYn != 'Y') {
			if(m$.form.find('[name=auth_ip1]').val() == "" && m$.form.find('[name=auth_ip2]').val() == "")
				m$.form.find('[name=auth_ip_opt][value=0]').trigger("click");
			else 
				m$.form.find('[name=auth_ip_opt][value=1]').trigger("click");
		}
		// DOM 설정 End
		
		$.extend(true, _SL.validate.Validator, userValidator);
		
		// 데이타 조회
		if(!mState.isNew) select();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);		
		
		// 기관 add
		m$.form.find("#cust_add").click(function(){			
			var val = m$.form.find("[name=user_cust_list] option:selected").val();
			var text = m$.form.find("[name=user_cust_list] option:selected").text();

			if(val == "") {
				_alert("기관을 선택하세요.");
				return;
			}
			
			if( m$.form.find("[name=cust_list] option").is(
				function() {
					return this.value == val;
				})
			){
				_alert("동일한 기관이 존재합니다.");
				return;
			}
			
			m$.form.find("[name=cust_list]").append($("<option>").val(val).text(text));	
		});
		
		// 기관 del
		m$.form.find("#cust_del").click(function(){
			m$.form.find("[name=cust_list] :selected").remove();
		});

		// 접근 IP opt
		if(gUserIpRestrictYn != 'Y') {
			m$.form.find("[name=auth_ip_opt]").click(function() {
				var v = $(this).val();
				
				if($(this).val() == "0") 
					m$.form.find('[data-name=auth_ip_wrapper]').hide();
				else 
					m$.form.find('[data-name=auth_ip_wrapper]').show();
			});
		}
	},
	
	select = function() {
		var
			id = m$.userId.val(),
			rqData = {'user_id': id},
	
			callback = function(data){
				data.passwd = "";
				if(data.auth_ip && data.auth_ip != "") {
					var ips = data.auth_ip.split();
					for(var i = 0, l = ips.length; i < l; i++) {
						data["auth_ip" + (i+1)] = ips[i];
					}
				}
				
				_SL.setDataToForm(data, m$.form, {
					"cust_list" : {
						//field		: "cust_list",
						converter	: function(cvData, $fld) {
							_SL.appendToSelect(cvData, $fld, "cust_id", "cust_nm");
						}
					},
					"auth_ip" : {
						field	: "auth_ip1",
						converter	: function(cvData, $fld) {
							if(cvData != "") m$.form.find('[name=auth_ip_opt][value=1]').trigger("click");
						}
					}
				});

				slui.attach.setTransformSelect(mCfg.formId);
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		//step1 폼 데이터 벨리데이션 하기
		var pwd = m$.form.find("[name=passwd]").val();
		var rePwd = m$.form.find("[name=passwd2]").val();
		
		if(pwd != rePwd) {
			if(rePwd != "" && pwd == "") {
				_alert("비밀번호를 입력하세요.");
				m$.form.find("[name=passwd]").focus();
				return;
			} else if(pwd != "" && rePwd == "") {
				_alert("비밀번호 확인을 입력하세요.");
				m$.form.find("[name=passwd2]").focus();
				return;
			}  else{
				_alert("비밀번호가 일치하지 않습니다.");
				m$.form.find("[name=passwd2]").val("").focus();
				return;
			}
		}
		
		if(m$.form.find("[name=auth_ip_opt][value=0]").is(":checked")) {
			m$.form.find("[name=auth_ip1]").val("");
			m$.form.find("[name=auth_ip2]").val("");
		}

		if (!_SL.validate()) return;
		
		if(!m$.form.find("[name=auth_ip_opt][value=0]").is(":checked")) {
			if(!m$.form.find("[name=auth_ip1]").val() && !m$.form.find("[name=auth_ip2]").val()) {
				_alert("접근가능 IP를 입력하세요.");
				m$.form.find("[name=auth_ip1]").focus();
				
				return;
			}
		}
		
		var submit = function(){
			$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
				displayLoader : true,
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}
		
		if(mState.isNew) {
			$('body').requestData(mCfg.urlExist, {user_id:m$.userId.val()}, {
				callback : function(rsData){
					if(rsData == true)
						submit();
					else
						_alert("사용중인 아이디가 있어 저장 할 수 없습니다.");
				}
			});
		}
		else {
			_confirm(mState.mode.message,{
				onAgree : function(){
					submit();
				}
			});
		}
	},

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				var userId = m$.userId.val();

				//삭제되는 아이디 값 전송
				$('body').requestData(mCfg.urlDelete, {user_id: userId},
					{callback: function(rsData, rsCd, rsMsg){
						_alert(rsMsg, {
							onAgree : function() {
								onClose(afterClose);
							}
						});
					}}
				);
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
	slapp.user.form.init();
});