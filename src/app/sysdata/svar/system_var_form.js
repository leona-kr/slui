'use strict';

_SL.nmspc("svar").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formSystemVar',
		urlSelect : gCONTEXT_PATH + "sysdata/system_var.json",
		urlExist : gCONTEXT_PATH + "sysdata/var_nm_check.json",
		urlChkDelete : gCONTEXT_PATH + "sysdata/rel_sys_check.json",
		urlDelete : gCONTEXT_PATH + "sysdata/system_var_delete.do",
		add : {
			action : gCONTEXT_PATH + "sysdata/system_var_insert.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "sysdata/system_var_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		varNm : $(mCfg.formId + ' [name=var_nm]'),
		dupCheck : $(mCfg.formId + ' #dup_check')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.varNm.val() == "" ? true : false,
		mode : m$.varNm.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		else {
			m$.varNm.addClass("form-text").prop("readonly",true);
		}
		// 데이타 조회
		if(!mState.isNew) select();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);

		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);

		//검색필드 SelectBox
		m$.form.find('[name=fldAddSelBox]').change(fldAddSelBox);
		m$.form.find('[name=fldAddSelBox]').chosen({search_contains : true,width:"100%" });

		//검색연산자 SelectBox
		m$.form.find('[name=operatorSelBox]').change(addOperator);
		
		m$.varNm.keyup(varNmControll);
	},
	
	fldAddSelBox = function(){
		var $searchQuery = m$.form.find('[name=var_val]'),
		$fldAddSelBox = m$.form.find('[name=fldAddSelBox]'),
		strKeyword = $.trim($searchQuery.val()),
		strFieldNm = $(this).val();

		$searchQuery.focus();

		if(strFieldNm == "") return;
		strKeyword += (strKeyword == "" ? "" : strKeyword.charAt(strKeyword.length-1) == '+' ? "" : " ");

		$searchQuery.val(strKeyword + strFieldNm + ":");
		$fldAddSelBox.val("");
		$searchQuery.focus();
	},
	
	addOperator = function(){
		var $searchQuery = m$.form.find('[name=var_val]'),
		$optSelBox = m$.form.find('[name=operatorSelBox]'),
		strKeyword = $.trim($searchQuery.val()),
		strOperator = $optSelBox.val();

		$searchQuery.focus();

		if(strOperator == "") return;
		if(strKeyword != "" && "AND,OR,NOT,+".indexOf(strOperator) != -1) {
			strOperator = " " + strOperator;
		}
			
		$searchQuery.val(strKeyword + strOperator);
		$optSelBox.val("");
		$searchQuery.focus();
	},
	
	varNmControll = function(){
		
		if(m$.varNm.prop("readonly")) return;
		
		var isSpace = /\s/,
		exceptNm = /[~!@\#$%<>^&*\()\-=+\']/gi;
		
		if(isSpace.exec(m$.varNm.val())){
			_alert("시스템변수는 공백을 사용할 수 없습니다.", {
				onAgree : function(){
					m$.varNm.focus();
					m$.varNm.val(m$.varNm.val().replace(/ /gi,""));
				}
			});
		}
		
		if(exceptNm.test(m$.varNm.val())){
			_alert("시스템변수에서는 언더 바(_)를 제외한 특수문자를 사용 할 수 없습니다.", {
				onAgree : function(){
					m$.varNm.addClass('text-danger');
					m$.varNm.focus();
					m$.dupCheck.text("언더 바(_)를 제외한 특수문자를 사용할 수 없습니다.");
					m$.dupCheck.addClass('text-danger form-label');
					m$.varNm.val(m$.varNm.val().replace(/ /gi,""));
				}
			});
			return false;
		}
		
		$('body').requestData(mCfg.urlExist, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				if(rsData == "OK"){
					m$.dupCheck.text("이미 사용중 입니다. 다시 입력해주세요.");		
					m$.varNm.addClass('text-danger');
				}else{
					(m$.varNm.val() == "") ? m$.dupCheck.text("") : m$.dupCheck.text("사용가능").addClass('text-danger form-label');
					m$.varNm.removeClass('text-danger');
				}
			}
		});
	},

	select = function() {
		var id = m$.varNm.val(),
		rqData = {'var_nm': id},
		callback = function(data){
			_SL.setDataToForm(data, m$.form, {});
		};

		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if(!_SL.validate(m$.form)) return;
		
		var exceptNm = /[~!@\#$%<>^&*\()\-=+\']/gi;

		if(exceptNm.test(m$.varNm.val())){
			_alert("시스템변수에서는 언더 바(_)를 제외한 특수문자를 사용 할 수 없습니다.", {
				onAgree : function(){
					m$.varNm.addClass('text-danger');
					m$.dupCheck.text("언더 바(_)를 제외한 특수문자를 사용할 수 없습니다.");	
					m$.dupCheck.addClass('text-danger form-label');
					m$.varNm.focus();
				}
			});
			return false;
		}

		var afterClose = $(this).data('after-close') == true ? true : false,	
		submit = function(){
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

		if(mState.isNew){
			$('body').requestData(mCfg.urlExist, _SL.serializeMap(m$.form), {
				callback : function(rsData, rsCd, rsMsg){
					if(rsData == "OK"){
						_alert("이미 사용중인 시스템변수명이 있습니다.<br>다시 작성해주세요.");
					}else{
						submit();
					}
				}
			});
		}else{
			submit();
		}
	},
	
	onDelete = function(){
		var varNm = m$.varNm.val(),
		afterClose = $(this).data('after-close') == true ? true : false,
		delSystemVar = function(){
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, {var_nm: varNm}, {
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
		}

		$('body').requestData(mCfg.urlChkDelete, {var_nm: varNm}, {
			callback : function(rsList, rsCd, rsMsg){
				if(rsList.length > 0){
					_alert("현재 사용중인 이벤트가 있습니다.<br>이벤트를 삭제 후 다시 시도해 주십시오.");
				}else{
					delSystemVar();
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
	slapp.svar.form.init();
});