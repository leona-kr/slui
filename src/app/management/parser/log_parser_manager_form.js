//# sourceURL=log_parser_manager_form.js
'use strict';

_SL.nmspc("parser").logManagerForm = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formLogParserManager',

		urlSelect : gCONTEXT_PATH + "management/log_parser_manager_form.json",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlUsedCheck : gCONTEXT_PATH + "management/log_psr_mng_check_used.json",
		urlXmlCheck : gCONTEXT_PATH + "management/log_psr_xml_check.json",
		urlLogPsrNameCheck : gCONTEXT_PATH + "management/log_parser_name_exist.json",
		urlParserGenerator : gCONTEXT_PATH + "management/parser_generator.do?menu_idx=1",
		urlDelete : gCONTEXT_PATH + "management/log_psr_mng_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "management/log_psr_add.do",
			message : "등록 하시겠습니까?",
		},
		update : {
			action : gCONTEXT_PATH + "management/log_psr_mng_update.do",
			message : "수정 하시겠습니까?",
		}
	},
	// JQuery 객체 변수
	m$ = {
		//form
		form : $(mCfg.formId),
		
		//구분Option tr space
		trHandleOpt1 : $(mCfg.formId + ' #handle_opt_1_wrap'),
		trHandleOpt2 : $(mCfg.formId + ' #handle_opt_2_wrap'),
		
		trLogCateValue : $(mCfg.formId + ' #log_cate_value_wrap'),
		comment1 : $(mCfg.formId + ' #comment1'),
		
		//기본정보
		logPsrId : $(mCfg.formId + ' [name=log_psr_id]'),
		logPsrNm : $(mCfg.formId + ' [name=log_psr_nm]'),
		sample : $(mCfg.formId + ' [name=sample]'),
		psrXml : $(mCfg.formId + ' [name=psr_xml]'),
		description : $(mCfg.formId + ' [name=description]'),
		
		//파서등록 기본 값
		logCateCd : $(mCfg.formId + ' [name=log_cate_cd]'),
		logTypeCd : $(mCfg.formId + ' [name=log_type_cd]'),
		handleType : $(mCfg.formId + ' [name=handle_type]'),
		
		handleOptChar : $(mCfg.formId + ' [name=handle_opt_1_char]'),
		handleOptIndex : $(mCfg.formId + ' [name=handle_opt_1_index]'),
		handleOpt : $(mCfg.formId + ' [name=handle_opt]'),
		
		logCateValue : $(mCfg.formId + ' [name=log_cate_value]'),
		
		//로그분류 등록 값
		categoryCode : $(mCfg.formId + ' .btn-register-category').data('value')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.logPsrId.val() == "" ? true : false,
		mode : m$.logPsrId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();

		// 데이타 조회
		if(!mState.isNew) select();
		
		if(mState.isNew) {
			m$.psrXml.data("nCheck",-1);
			m$.form.find(".btn-delete").hide();
			
			//로그파서 구분방법,구분 값 init
			MethodManager.initHandleType();
		}else{
			m$.psrXml.data("nCheck",1);
			//장비,파서연동체크
			$('body').requestData(mCfg.urlUsedCheck, {log_psr_id : m$.logPsrId.val()}, {
				callback : function(rsData, rsCd, rsMsg){
					connCnt = rsData.CONN_CNT;
					useCnt = rsData.USE_CNT;

					//로그파서 구분방법,구분 값 init
					MethodManager.initHandleType();
				}
			});
		}
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);

		// 로그 분류 등록 버튼
		m$.form.find('.btn-register-category').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.categoryCode, {
			width:550,
			height:455,
			onClose: function(){
				_addCode(m$.logCateCd);
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
		
		//탭 Change 이벤트
		m$.form.find(".config_tab li").click(function(){
			changeTab($(this).index());
			return false;
		});
		
		// Parser_generator 버튼 클릭
		m$.form.find('#psr_generator').on("click", goParserGenerator);

		//로그파서 구분방법 Change
		m$.handleType.change(MethodManager.changeHandleType);
		
		//Parser XML Change
		m$.psrXml.change(MethodManager.changePsrXml);
	},
	
	select = function() {
		var
			id = m$.logPsrId.val(),
			rqData = {'log_psr_id': id},
	
			callback = function(data){
			_SL.setDataToForm(data, m$.form, {
				"log_type_cd" : {
					converter	: function(cvData, $fld) {
						m$.form.find("[name=log_type_cd]").val(cvData);
						m$.form.find("[name=b_log_type_cd]").val(cvData);
					}
				},
				"handle_type" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=handle_type]').val(cvData);
						m$.form.find('[name=b_handle_type]').val(cvData);
					}
				},
				"handle_opt" : {
					converter	: function(cvData, $fld) {
						m$.form.find('[name=handle_opt]').val(cvData);
						m$.form.find('[name=b_handle_opt]').val(cvData);
					}
				}
			});

		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	changeTab = function(idx){
		m$.form.find(".config_tab li").removeClass("tab-item-active");
		m$.form.find(".config_tab li").eq(idx).addClass("tab-item-active");
		
		switch(idx) {
			case 0 :
				m$.form.find("#default").css("display", "block"); 
				m$.form.find("#parserDefault").css("display", "none");
				break;
			case 1 :
				m$.form.find("#default").css("display", "none"); 
				m$.form.find("#parserDefault").css("display", "block");
				break;
		}
		slui.attach.setTransformSelect(mCfg.formId);
	},

	onSave = function(){
		MethodManager.save();
	},
	
	onDelete = function(){
		MethodManager.remove();
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
	},
	
	goParserGenerator = function(){
		m$.form.attr({
			action : mCfg.urlParserGenerator,
			method : 'post'
		}).submit();
	},

	MethodManager = {
		initHandleType : function(){
			var vHandleType, vHandleOpt;
			
			m$.trHandleOpt2.jqxTooltip('destroy');
			m$.logCateValue.jqxTooltip('destroy');
			
			vHandleType = m$.handleType.val();
			
			switch(vHandleType) {//로그파서구분방법에 따른 툴팁 초기화
				case "2" ://Regular Expression
					m$.trHandleOpt2.jqxTooltip({ content: tooltip1, position: 'mouse'});
					break;
				case "3" ://IndexOf
					m$.logCateValue.jqxTooltip({ content: tooltip2, position: 'mouse'});
					m$.comment1.css("visibility","visible");
					break;
				default :
					break;
			}
			
			if(vHandleType == "1" || vHandleType == "2") {
				m$.form.find("#handle_opt_" + vHandleType + "_wrap").show();
				
				if(vHandleType == "1") {
					vHandleOpt = m$.handleOpt.val();
					
					if(vHandleOpt != "") {
						var vHandleOptList = vHandleOpt.split("|");
						var vHandleOptIndex = "";
						if(vHandleOptList.length == 2) vHandleOptIndex = parseInt(vHandleOptList[1]) + 1;
						m$.handleOptChar.val(vHandleOptList[0].replace(new RegExp(SEPARATOR_PIPE_STR, "g"), "|"));
						m$.handleOptIndex.val(vHandleOptIndex);
					}
					m$.trHandleOpt2.hide();
				}
				else {
					m$.trHandleOpt1.hide();
				}
			}
			else {
				m$.trHandleOpt1.hide();
				m$.trHandleOpt2.hide();
			}
			
			if(vHandleType != "-1") {
				m$.trLogCateValue.show();
			}
			else {
				m$.trLogCateValue.hide();
			}		
		},
		changeHandleType : function (){	
		
			m$.trHandleOpt1.hide();
			m$.trHandleOpt2.hide();
			
			m$.comment1.css("visibility","hidden");//indexOf코멘트초기화
			m$.trHandleOpt2.jqxTooltip('destroy');
			m$.logCateValue.jqxTooltip('destroy');
			
			var handleType = m$.handleType.val();
			switch(handleType) {//로그파서구분방법에 따른 툴팁	
			case "-1" ://None
				m$.handleOpt.val("");
				m$.trLogCateValue.hide();
				break;
			case "1" ://Separator
				if(m$.form.find('[name=b_handle_type]').val() == '2'){
					m$.handleOptChar.val("");
					m$.handleOptIndex.val("");
				}
				
				m$.trLogCateValue.show();
				m$.form.find("#handle_opt_" + handleType + "_wrap").show();
				break;
			case "2" ://Regular Expression
				if(m$.form.find('[name=b_handle_type]').val() == '1'){
					m$.handleOpt.val("");
				}
				
				m$.trLogCateValue.show();
				m$.form.find("#handle_opt_" + handleType + "_wrap").show();
				m$.trHandleOpt2.jqxTooltip({ content: tooltip1, position: 'mouse'});
				break;
			case "3" ://IndexOf
				m$.trLogCateValue.show();
				m$.handleOpt.val("");
				m$.logCateValue.jqxTooltip({ content: tooltip2, position: 'mouse'});
				m$.comment1.css("visibility","visible");
				break;
			default :
				break;
			}
		},
		changePsrXml : function() {
			var $this = $(this);
			
			var v = $this.val();
			
			$this.data("nCheck", 0);

			$('body').requestData(mCfg.urlXmlCheck, {psr_xml: $this.val()}, {
				callback : function(rsData, rsCd, rsMsg){
					if(rsData == "OK") 
						$this.data("nCheck", 1);
					else
						$this.data("nCheck", -1);
				}
			});
		},
		getDataFormPage : function() {
			return {
				log_psr_id : m$.logPsrId.val(),
				log_type_cd : m$.logTypeCd.val(),
				handle_type : m$.handleType.val(),
				handle_opt : m$.handleType.val() == 1 ? m$.handleOptChar.val().replace(/\|/g, SEPARATOR_PIPE_STR) + "|" + (parseInt(m$.handleOptIndex.val()) - 1) : m$.handleOpt.val(),
			
				// LOG PARSER
				log_psr_nm : m$.logPsrNm.val(),
				psr_xml : m$.psrXml.val(),
				sample : m$.sample.val(),
				log_cate_value : m$.logCateValue.val(),
				log_cate_cd : m$.logCateCd.val(),
				description : m$.description.val()
			};
		},
		
		slvalidate : function(){
			if(!_SL.validate(m$.form.find('#default'))) {
				changeTab(0);
				return false;
			}else{
				if(m$.form.find('[name=log_cate_cd]').val() == ""){
					_alert('로그 분류(을)를 입력하세요.');
					changeTab(1);
					return false;
				}else if(m$.form.find('[name=log_type_cd]').val() == ""){
					_alert('로그 타입(을)를 입력하세요.');
					changeTab(1);
					return false;
				}
				
				switch(m$.form.find('[name=handle_type]').val()){
					case "1" :
						if(m$.form.find('[name=handle_opt_1_char]').val() == ""){
							_alert('구분자(을)를 입력하세요.');
							changeTab(1);
							return false;							
						}else if(m$.form.find('[name=handle_opt_1_index]').val() == ""){
							_alert('위치(을)를 입력하세요.');
							changeTab(1);
							return false;							
						}
						break;
					case "2" :
						if(m$.form.find('[name=handle_opt]').val() == ""){
							_alert('구분 Option(을)를 입력하세요.');
							changeTab(1);
							return false;							
						}					
						break;
					default :
						break;
				}
				
				if(m$.form.find('[name=handle_type]').val() != '-1'){
					if(m$.form.find('[name=log_cate_value]').val() == ""){
						_alert('구분 값(을)를 입력하세요.');
						changeTab(1);
						return false;							
					}
				}
				
				return true;
			}
		},
		
		save : function() {
			if(!MethodManager.slvalidate()) return;
			
			var data = MethodManager.getDataFormPage();
			
			//처음 들어온 정보
			var bLogTypeCd = m$.form.find("[name=b_log_type_cd]").val();
			var bHandleType = m$.form.find("[name=b_handle_type]").val();
			var bHandleOpt = m$.form.find("[name=b_handle_opt]").val();
			
			//저장할 시점의 정보
			var aLogTypeCd = m$.logTypeCd.val();
			var aHandleType = m$.handleType.val();
			var aHandleOpt = data.handle_opt;
			var eqpCheck = false;
			var msg = "";

			if(!mState.isNew){//ADD가 아닌 수정,삭제일때만 연동체크
				if(connCnt == undefined) {				
					_alert("장비 연동 여부 체크에 실패했습니다.<br/> 다시 시도하세요.");
					return;
				}
				if(connCnt > 0) {
					if( bLogTypeCd != aLogTypeCd){//로그타입이 수정됐을때
						msg = msg + "<span class='text-info'>로그타입</span>";					
						eqpCheck = true;
					}
					if( bHandleType != aHandleType){//로그파서 구분방법이 수정됐을때
						if( msg == "" ){
							msg = msg + "<span class='text-info'>로그파서 구분방법</span>";
						}else{
							msg = msg + "과 <span class='text-info'>로그파서 구분방법</span>";
						}
						eqpCheck = true;
					}
					if( bHandleType == aHandleType && bHandleOpt != aHandleOpt){//구분 Option이 수정됐을때
						if( msg=="" ){
							msg = msg + "<span class='text-info'>구분 Option</span>";
						}else{
							msg = msg + "과 <span class='text-info'>구분 Option</span>";						
						}					
						eqpCheck = true;
					}
					if( bLogTypeCd != aLogTypeCd || bHandleType != aHandleType || bHandleOpt != aHandleOpt ){
						if(!_confirm("장비에 연동중인 로그파서입니다.<br/>"+ msg +"을 수정하면<br/>오류가 발생 할 수 있습니다.<br/>수정하시겠습니까?")) return;
					}
				}			
				if(useCnt > 0 && !eqpCheck) {
					if( bLogTypeCd != aLogTypeCd){//로그타입이 수정됐을때
						msg = msg + "<span class='text-info'>로그타입</span>";
					}
					if( bHandleType != aHandleType){//로그파서 구분방법이 수정됐을때
						if( msg == "" ){
							msg = msg + "<span class='text-info'>로그파서 구분방법</span>";
						}else{
							msg = msg + "과 <span class='text-info'>로그파서 구분방법</span>";
						}
					}
					if( bHandleType == aHandleType && bHandleOpt != aHandleOpt){//구분 Option이 수정됐을때
						if( msg=="" ){
							msg = msg + "<span class='text-info'>구분 Option</span>";
						}else{
							msg = msg + "과 <span class='text-info'>구분 Option</span>";						
						}					
					}
					if( bLogTypeCd != aLogTypeCd || bHandleType != aHandleType || bHandleOpt != aHandleOpt ){
						if(!_confirm("장비에 연동중인 로그파서입니다.<br/>"+ msg +"을 수정하면<br/>오류가 발생 할 수 있습니다.<br/>수정하시겠습니까?")) return;
					}
				}
			}

			// XML 정상 여부
			switch(m$.psrXml.data("nCheck")) {
			case 1 : 
				break;
			case 0 :
				_alert("Parser XML 체크 중입니다. 체크 후 저장하세요.");
				return;
			case -1 :
				_alert("잘못된 Parser XML 입니다.");
				changeTab(0);
				return;
			case -2 :
				_alert("Parser XML 체크중 에러 발생으로 체크되지 않았습니다.");
				return;
			default :
				_alert("잘못된 체크 코드입니다.");
				return;
			}

			var afterClose = m$.form.find('.btn-save').data('after-close') == true ? true : false;
			
			var submit = function(){
				$('body').requestData(mState.mode.action, data, {
					callback : function(rsData, rsCd, rsMsg){
						if(rsCd == 'SUC_COM_0001' && rsData){
							data.log_psr_id = rsData;
							if(slapp.parser.logForm){
								slapp.parser.logForm.addLogParser(data);
							}
						}

						_alert(rsMsg, {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					}
				});
			}
			
			if(mState.isNew){//Add일때만 로그파서명 중복검사
				$('body').requestData(mCfg.urlLogPsrNameCheck, data, {
					callback : function(rsData, rsCd, rsMsg){
						if(rsData == "OK")
							submit();
						else if(rsData == "EXIST")
							_alert("동일한 로그파서명이 있어 처리 할 수 없습니다.");
						else 
							_alert("저장 처리중 에러가 발생했습니다.<br/> 다시 실행하세요.");
					}
				});
			}else{
				submit();
			}
		},
		remove : function() {
			var afterClose = m$.form.find('.btn-delete').data('after-close') == true ? true : false;
			var data = MethodManager.getDataFormPage();
			var msg='';
	
			if(connCnt == undefined) {
				_alert("장비 연동 여부 체크에 실패했습니다.<br>다시 시도하세요.");
				return;
			}
			if(connCnt > 0) {
				_alert("장비에 연동중인 파서입니다.<br>삭제할수없습니다.");
				return;
			} 
			
			if(useCnt > 0){
				msg = "파서에 등록된 로그파서입니다.<br>삭제하면 오류가 발생 할 수 있습니다.<br>삭제하시겠습니까?";
			} else {
				msg = "삭제하시겠습니까?";
			}

			_confirm(msg,{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, data, {
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
	}

	return {
		init: init
	};

}();

$(function(){
	slapp.parser.logManagerForm.init();
});