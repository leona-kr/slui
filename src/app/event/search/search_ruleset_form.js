//# sourceURL=search_ruleset_form.js
'use strict';

_SL.nmspc("searchRuleset").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formSearchRuleset',
		urlSelect : gCONTEXT_PATH + "event/search_ruleset.json",
		urlDelete : gCONTEXT_PATH + "event/search_ruleset_delete.do",
		urlLogSearch: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlQueryChk : gCONTEXT_PATH + 'monitoring/log_search_list.json',
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlComConfigForm : gCONTEXT_PATH + 'sysdata/com_group_field_form.html',
		urlUserList : gCONTEXT_PATH + "system/comuser_list_to_select.html",
		urlCaseResult   : gCONTEXT_PATH + 'event/search_ruleset_case.json',
		
		add : {
			action : gCONTEXT_PATH + "event/search_ruleset_insert.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event/search_ruleset_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		//기본정보
		form : $(mCfg.formId),
		rulesetId : $(mCfg.formId + ' [name=ruleset_id]'),
		caseId	: $(mCfg.formId + ' [name=case_id]'),
		logMaxCnt : $(mCfg.formId + ' [name=log_max_cnt]'),
		systemLink : $(mCfg.formId + ' [name=system_link]'),
		characterLimit : $(mCfg.formId + ' [name=character_limit]'),
		btnCateCodeAdd : $(mCfg.formId + ' .btn-register-event-cate'),
		viewFieldSel: $(mCfg.formId + ' [name=view_field_sel]'),
		times : $(mCfg.formId + ' [name=times]'),
		timeType : $(mCfg.formId + ' [name=time_type]'),
		
		//탐지정보
		fieldSelBox : $(mCfg.formId + ' [name=field_sel_box]'),
		operatorSelBox : $(mCfg.formId + ' [name=operator_sel_box]'),
		sysValSelBox : $(mCfg.formId + ' [name=sysval_sel_box]'),
		searchQuery : $(mCfg.formId + ' [name=org_search_query]'),
		eventOption : $(mCfg.formId + ' [name=event_option]'),
		groupFieldSel : $(mCfg.formId + ' [name=group_field_sel]'),
		btnGrpFldAdd : $(mCfg.formId + ' .btn-group-fld-add'),
		func : $(mCfg.formId + ' [name=func]'),
		funcFld : $(mCfg.formId + ' [name=func_field]'),
		limitCount : $(mCfg.formId + ' [name=limit_count]'),		
		distinctFieldSel : $(mCfg.formId + ' [name=distinct_field_sel]'),
		distinctCount : $(mCfg.formId + ' [name=distinct_count]'),
		
		//조치사항
		orgFld : $(mCfg.formId + ' [name=org_fld]'),
		dervFldSpan : $(mCfg.formId + ' .dervFldSpan'),
		dervFld : $(mCfg.formId + ' [name=derv_fld]'),
		dervFldValSpan : $(mCfg.formId + ' .dervFldValSpan'),
		dervFldVal : $(mCfg.formId + ' [name=derv_fld_val]'),
		expirePeriodSpan : $(mCfg.formId + ' .expirePeriodSpan'),
		expirePeriod : $(mCfg.formId + ' [name=expire_period]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.rulesetId.val() == "" ? true : false,
		isLoad: m$.caseId.val() == "" ? false : true,
		mode : m$.rulesetId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
			m$.form.find(".rulesetIdTr").hide();
			
			bindEvent();
			initChosen();
			initOnEvent();
			setTimes();
			
		}else{
			// 데이타 조회
			select();
		}
		
		if(mState.isLoad) loadCaseData();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', checkInvalid);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);	
		
		//탭 Change 이벤트
		m$.form.find(".config_tab li").click(function(){
			changeTab($(this).index());
			slui.attach.setTransformSelect(mCfg.formId);
		});
		
		//이벤트종류 등록버튼
		m$.form.find('.btn-register-event-cate').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.btnCateCodeAdd.data('value'), {
			width:550,
			height:455,
			onClose: function(){
				_addCode(m$.form.find('[name=event_cate_cd]'));
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});

		//룰셋
		m$.fieldSelBox.on("change",addFieldName);
		m$.operatorSelBox.on("change",addOperator);
		m$.sysValSelBox.on("change",addSysVal);		
		m$.form.find('.btn-case').on("click", validCase);
		
		//탐지옵션 이벤트
		m$.eventOption.on("change",limitCountEvent);
		
		//체크주기이벤트	
		m$.timeType.on("change",setTimes);
		
		//기준필드 등록버튼
		m$.btnGrpFldAdd.exModalPopup(mCfg.urlComConfigForm, {
			width:470,
			height:295,
			onClose: function(){
				_addGroupField();
			}
		});
		
		//함수 이벤드
		m$.func.on("change",showFuncField);
		
		//기준필드 이벤트
		m$.groupFieldSel.siblings(".chosen-container").find(".chosen-choices").on('mousedown','li a',function(){
			var delGroupFldText = $(this).prev().text();
			var orgFldText = m$.orgFld.siblings(".chosen-container").find(".chosen-single").find(".chosen-selected-span").text();
			var self = $(this);
			if(delGroupFldText == orgFldText){
				
				_confirm("원본필드가 리셋됩니다.<br>그래도 적용하시겠습니까??",{
					onAgree : function(){
						self.trigger("click");
						addOrgFld();
					}
				});
			} 
			
		});
		
		// 경보대상자 PLUS
		m$.form.find(".btn-plus").exModalPopup(mCfg.urlUserList, {
			width:1000,
			height:550,
			setScroll : true,
			onClose: function(){
				_loadUser();
			}
		});
		
		// 경보대상자 MINUS
		m$.form.find('.btn-minus').off().on("click", function(){
			m$.form.find('[name=chk_user_list] :selected').remove();
		});		
		
		//원본필드 이벤트
		m$.orgFld.on("change",orgFldCheck);	

		//유일필드 이벤트
		m$.distinctFieldSel.on("change",distinctCountEvent);
		
		//태깅 필드
		m$.dervFld.on("change",addDervFldVal);
		
		//검증에 있는 값 가져오기
		m$.form.find("[name=case_id]").on("change" );
	},
	
	_loadUser = function(){

		var data = slapp.user.listSel.getParam();
		var userDataArr = data.userDataArr;
		var userIdx  = data.userIdx;
		
		var userInfo, userId, userName, userMobile, userMail;
		var $usrList = m$.form.find('[name=chk_user_list]');	
		var check = 0;
		var isDupChk = false;
		var msg = '';
		
		for(var idx in userDataArr){
			userInfo = userDataArr[idx];
			userId = userInfo.user_id;
			userName = userInfo.user_nm;
			userMobile = userInfo.mobile_no;
			userMail = userInfo.mail_addr;	
			
			if($usrList.size() == 0){
				$usrList.append("<option value='" + userId + "'>" + userName + " ["+userId + "], [" + userMobile + "], [" + userMail + "]" + "</option>");
			
			}else{
				m$.form.find('[name=chk_user_list] option').each(function(){
					if (userId == $(this).val()) check = 1;
				});
				
				if (check != 1){
					$usrList.append("<option value='" + userId + "'>" + userName + " ["+userId + "], [" + userMobile + "], [" + userMail + "]" + "</option>");
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
	
	initOnEvent = function(){
		limitCountEvent();
		showFuncField();
	},

	changeTab = function(idx){
		
		m$.form.find(".config_tab li").removeClass("tab-item-active");
		m$.form.find(".config_tab li").eq(idx).addClass("tab-item-active");
		
		switch(idx) {
			case 0 :
				m$.form.find(".defaultTab").css("display", "block"); 
				m$.form.find(".detectionInfoTab").css("display", "none");
				m$.form.find(".actionInfoTab").css("display", "none");
				break;
			case 1 :
				m$.form.find(".defaultTab").css("display", "none"); 
				m$.form.find(".detectionInfoTab").css("display", "block");
				m$.form.find(".actionInfoTab").css("display", "none"); 
				break;
			case 2 :
				m$.form.find(".defaultTab").css("display", "none"); 
				m$.form.find(".detectionInfoTab").css("display", "none");
				m$.form.find(".actionInfoTab").css("display", "block");
				addOrgFld();
				break;
		}
	},
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();
		$fld.append("<option value='"+data.code_id+"' selected='selected'>"+data.code_name+"</option>");
	},
	
	addFieldName= function(){
		var $searchQuery = m$.searchQuery;
		var $fieldSelBox = m$.fieldSelBox;
		var strKeyword = $.trim($searchQuery.val());
		var strFieldNm = $fieldSelBox.val();
				
		if(strFieldNm == "") return;

		strKeyword += (strKeyword == "" ? "" : strKeyword.charAt(strKeyword.length-1) == '+' ? "" : " ");
		
		$searchQuery.val(strKeyword + strFieldNm + ":");
		$fieldSelBox.val("");
		$fieldSelBox.trigger('chosen:updated');
	},	
	
	addOperator = function(){
		var $searchQuery = m$.searchQuery;
		var $optSelBox = m$.operatorSelBox;
		var strKeyword = $.trim($searchQuery.val());
		var strOperator = $optSelBox.val();
		
		if(strOperator == "") return;
		if(strKeyword != "" && "AND,OR,NOT,+".indexOf(strOperator) != -1) {
			strOperator = " " + strOperator;
		}
			
		$searchQuery.val(strKeyword + strOperator);
		$optSelBox.val("");
	},
	
	addSysVal = function(){
		var strFieldNm = $(this).val();		
		var $searchQuery = m$.searchQuery;
		var strKeyword = $.trim($searchQuery.val());
		
		strKeyword += (strKeyword == "" ? "" : strKeyword.charAt(strKeyword.length-1) == '+' ? "" : " ");
		$searchQuery.val(strKeyword + "SYSVAR("+strFieldNm + ")");
		
		$(this).val("");
		m$.sysValSelBox.trigger('chosen:updated');
	},
	
	validCase = function(){
		var characterLimit = $(mCfg.formId + ' [name=character_limit]').val();
		var searchQueryLength = m$.searchQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte<br>입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
		
		// 10분이내 조회
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -10);
		var strQuery = m$.searchQuery.val()
		
		if(strQuery == "") {
			_alert("검색어가 없습니다.",{
				onAgree : function(){
					m$.searchQuery.focus();
				}
			});
			return;
		}
	
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type">');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			
			m$.form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(startTime);
		$("[name=end_time]", $logSearchForm).val(endTime);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(strQuery);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
	},	
	
	setTimes = function(pInit){
		var timeUnit = {
				"1" : [1,2,3,5,10,15,30],
				"2" : [1,2,3,6,12]			
		};

		var $sTimesObj = m$.times;
		var $sTimesTypeObj = m$.timeType;
		var sType = $sTimesTypeObj.val();
		var oTimes = $sTimesObj.empty()[0]; 

		if(sType != "") {
			for(var i in timeUnit[sType]) {
				oTimes.add(new Option(timeUnit[sType][i],timeUnit[sType][i]));
			}

			if(typeof pInit == 'number' && pInit) {
				$("[value=" + pInit + "]", '[name=times]')[0].selected = true;
			}
		}
		
		if(sType == "1" || sType == "2"){
			$sTimesObj.prop('disabled',false);
		} else {
			$sTimesObj.prop('disabled',true);
		}

		setTimeout(function(){
			slui.attach.setTransformSelect(mCfg.formId);
		},10);
	},
	
	_addGroupField = function(){
		var data = slapp.comGroupField.form.getCode();
		var groupFieldArr = m$.groupFieldSel.getSelectionOrder();
			
		m$.groupFieldSel.empty();
		
		for(var i in data){
			m$.groupFieldSel.append($("<option value='"+ data[i] +"'>"+gFieldCapsJson[data[i]]+"("+ data[i] +")</option>"));
		}
		
		m$.groupFieldSel.setSelectionOrder(groupFieldArr,true);
		m$.groupFieldSel.trigger("chosen:updated");
	},
	
	showFuncField = function(){
		if(m$.func.val() == 1) m$.funcFld.siblings(".chosen-container").hide();
		else m$.funcFld.siblings(".chosen-container").show();
	},
	
	limitCountEvent = function(){
		if( m$.eventOption.val() < 4){
			m$.limitCount.prop("disabled",true);
			m$.limitCount.val("");
			
			m$.distinctFieldSel.val("");
			m$.distinctFieldSel.prop("disabled",true);
		}else{
			m$.limitCount.prop("disabled",false);
			m$.limitCount.attr("data-valid","임계치,required,number");
			
			m$.distinctFieldSel.prop("disabled",false);
		}
		m$.distinctFieldSel.trigger("chosen:updated");
		distinctCountEvent();
	},
	
	distinctCountEvent = function(){
		if( m$.distinctFieldSel.val() == null){
			m$.distinctCount.prop("disabled",true);
			m$.distinctCount.attr("data-valid","유일필드 임계치,number");
		}else{
			m$.distinctCount.prop("disabled",false);
			m$.distinctCount.attr("data-valid","유일필드 임계치,required,number");
		}
	},
	
	addOrgFld = function(){
		var orgFldTmp = m$.orgFld.val();
		m$.orgFld.empty()
				.append("<option value=''>[선택하세요]</option>")
				.chosen({search_contains : false,width:"100%;" });

		var fldSelArry = m$.groupFieldSel.getSelectionOrder();
		
		for(var i in fldSelArry){
		 	var orgFldVal = "";
		 	var orgFldText = "";

			orgFldVal = fldSelArry[i];
			orgFldText = gFieldCapsJson[fldSelArry[i]];
			m$.orgFld.append("<option value='" + orgFldVal + "'>" + orgFldText+"("+ orgFldVal +")"+"</option>");
		}
		m$.orgFld.val(orgFldTmp)
			.trigger("chosen:updated");
		orgFldCheck();
	},
	
	orgFldCheck = function(){
		if(!m$.orgFld.val()){
			m$.dervFldSpan.removeClass("mark-required");
			m$.dervFld.attr("data-valid","");
			
			m$.dervFldValSpan.removeClass("mark-required");
			m$.dervFldVal.attr("data-valid","");

			m$.expirePeriodSpan.removeClass("mark-required");
			m$.expirePeriod.attr("data-valid","");

		}else{
			m$.dervFldSpan.addClass("mark-required");
			m$.dervFld.attr("data-valid","태깅 필드,required");

			m$.dervFldValSpan.addClass("mark-required");
			m$.dervFldVal.attr("data-valid","태깅 내용,required");

			m$.expirePeriodSpan.addClass("mark-required");
			m$.expirePeriod.attr("data-valid","만료 시간,required");
		}
	},
	
	addDervFldVal = function(){
		if($(this).val()=="event_extr_ruleset_id" && m$.rulesetId.val()) m$.dervFldVal.val(m$.rulesetId.val());
	},
	
	initChosen = function(){
		//로그검색	표시필드
		m$.viewFieldSel.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_multiple :"[선택하세요]"
		})
		.end()
		.siblings(".chosen-container").find(".chosen-results")
			.css("max-height","200px")
		.end()
		.siblings(".chosen-container").find(".chosen-choices")
			.css({
				"max-height":"120px",
				"min-height":"120px",
				"overflow-y":"auto"
			});

		//검색어
		m$.fieldSelBox.chosen({
			search_contains : true,
			width:"100%"
		});

		//시스템변수
		m$.sysValSelBox.chosen({
			search_contains : true,
			width:"100%"
		});
		
		//기준필드
		m$.groupFieldSel.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 10
		})
		.end()
		.siblings(".chosen-container").find(".chosen-results")
			.css("max-height","100px")
		.end()
		.siblings(".chosen-container").find(".chosen-choices")
			.css({
				"max-height":"55px",
				"min-height":"55px",
				"overflow-y":"auto"
			});
		
		//함수필드
		m$.funcFld.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_single :"[선택하세요]"
		});

		//유일필드
		m$.distinctFieldSel.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 10
		})
		.end()
		.siblings(".chosen-container").find(".chosen-results")
			.css("max-height","100px")
		.end()
		.siblings(".chosen-container").find(".chosen-choices")
			.css({
				"max-height":"55px",
				"min-height":"55px",
				"overflow-y":"auto"
			});

		//태깅필드
		m$.dervFld.chosen({
			search_contains : true,
			width:"100%"
		});		
	},
	
	loadCaseData = function() {
		var
			id = m$.caseId.val(),
			rqData = {'case_id': id},
			
			callback = function(rsData){
				var data = rsData.data;
				
				bindEvent();
				initChosen();
				
				//Data mapping start
				//기본데이터들
				_SL.setDataToForm(data, m$.form);

				//기준필드(Group by)
				var sGrpFld = data.group_field;
				if(sGrpFld){
					var sGrpFlddArr = sGrpFld.split(',');
					for(var idx in sGrpFlddArr){
						var tField = sGrpFlddArr[idx];
						if(gGroupField.indexOf(tField) < 0){
							gFieldCapsJson[tField] = "undefined";
							m$.groupFieldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
						}
					}
					m$.groupFieldSel.setSelectionOrder(sGrpFlddArr, true);
				};
				
				//유일필드
				var sGrpFld = data.distinct_field;
				if(sGrpFld){
					var sGrpFlddArr = sGrpFld.split(',');
					
					for(idx in sGrpFlddArr){
						var tField = sGrpFlddArr[idx];
						if(gGroupField.indexOf(tField) < 0){
							gFieldCapsJson[tField] = "undefined";
							m$.distinctFieldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
						}
					}
					m$.distinctFieldSel.setSelectionOrder(sGrpFlddArr,true);
				}else{
					m$.distinctCount.val("");
				};
				
				//Data mapping end
				initOnEvent();
				setTimes(data.times);
			};
		
		$('body').requestData(mCfg.urlCaseResult, rqData, {callback : callback});
	},
	
	select = function() {
		var
			id = m$.rulesetId.val(),
			rqData = {'ruleset_id': id},
			
			callback = function(rsData){
				var data = rsData.data;

				bindEvent();
				initChosen();
				
				//Data mapping start
				//기본데이터들
				_SL.setDataToForm(data, m$.form);
				
				
				//로그검색 표시필드
				var sViewFld =data.view_field;
				if(sViewFld){
					var sViewFldArr = sViewFld.split(',');
					
					for(idx in sViewFldArr){
						var tField = sViewFldArr[idx];
						if(!gFieldCapsJson[tField]){
							gFieldCapsJson[tField] = "undefined";
							m$.viewFieldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
						}
					}
					m$.viewFieldSel.setSelectionOrder(sViewFldArr,true);
				};

				
				//기준필드(Group by)
				var sGrpFld = data.group_field;
				if(sGrpFld){
					var sGrpFlddArr = sGrpFld.split(',');
					for(var idx in sGrpFlddArr){
						var tField = sGrpFlddArr[idx];
						if(gGroupField.indexOf(tField) < 0){
							gFieldCapsJson[tField] = "undefined";
							m$.groupFieldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
						}
					}
					m$.groupFieldSel.setSelectionOrder(sGrpFlddArr, true);
				};
				
				//유일필드
				var sGrpFld = data.distinct_field;
				if(sGrpFld){
					var sGrpFlddArr = sGrpFld.split(',');
					
					for(idx in sGrpFlddArr){
						var tField = sGrpFlddArr[idx];
						if(gGroupField.indexOf(tField) < 0){
							gFieldCapsJson[tField] = "undefined";
							m$.distinctFieldSel.append('<option value="'+tField+'">undefined['+tField+']'+'</option>')
						}
					}
					m$.distinctFieldSel.setSelectionOrder(sGrpFlddArr,true);
				}else{
					m$.distinctCount.val("");
				};
				
				//원본필드
				var orgFld = data.org_fld;
				if(orgFld){
					
					var fldSelArry = m$.groupFieldSel.getSelectionOrder();
					for(var i in fldSelArry){
					 	var orgFldVal = "";
					 	var orgFldText = "";
				 	
				 		orgFldVal = fldSelArry[i];
				 		orgFldText = gFieldCapsJson[fldSelArry[i]];
				 		m$.orgFld.append("<option value='" + orgFldVal + "'>" + orgFldText+"("+ orgFldVal +")"+"</option>");
					 	
					}
					m$.orgFld.val(orgFld);
				}
				
				//태깅내용
				var dervFld = data.derv_fld;
				if(!dervFld){
					m$.dervFldVal.val(data.ruleset_id);
					m$.dervFld.val('event_extr_ruleset_id');
				} 
				m$.dervFld.trigger("chosen:updated");
			
				//Data mapping end
				
				initOnEvent();
				setTimes(data.times)
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	checkInvalid = function(){
		if (!_SL.validate(m$.form)) return;
		
		var characterLimit = m$.characterLimit.val();
		var searchQueryLength = m$.searchQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte<br>입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
		
		var groupFlds = m$.groupFieldSel.getSelectionOrder();
		var distinctFlds =m$.distinctFieldSel.getSelectionOrder();
		
		if(groupFlds.length == 0 && distinctFlds == 0){
			onSave();
		}else{//기준필드 또는 유일필드가 존재할때 count체크
			checkInvalid2();
		}
	},
	
	checkInvalid2 = function(){
		var endTime = _SL.formatDate();
		var startTime = _SL.formatDate.addMin(endTime, -60);
		var strQuery = m$.searchQuery.val();
		var logMaxCnt = m$.logMaxCnt.val();
		var param = {
			end_time : endTime,
			start_time : startTime,
			query : strQuery,
			pageRow : 1,
			startIndex : 0
		}

		$('body').requestData(mCfg.urlQueryChk,param, {
			displayLoader : true,
			callback : function(totalData, rsCd, rsMsg){
				if(totalData.total > logMaxCnt){
					_alert('검색결과가 최대건수를 초과했습니다.<br>\
							Case검증을 이용해 확인해 주세요.<br>\
							(검색결과 '+_SL.formatNumber(totalData.total)+'건)<br>\
							(최대건수 '+_SL.formatNumber(logMaxCnt)+'건)');
					return;
				}
				onSave();
			}
		});
	},
	
	onSave = function(){
		var viewFlds = m$.viewFieldSel.getSelectionOrder();
		var groupFlds = m$.groupFieldSel.getSelectionOrder();
		var distinctFlds = m$.distinctFieldSel.getSelectionOrder();
		
		$("option", "[name=chk_user_list]").each(function(){this.selected = true;});
		
		var param = $.extend({},_SL.serializeMap(m$.form),{
			view_field		:	viewFlds.join(),
			group_field		:	groupFlds.join(),
			distinct_field	:	distinctFlds.join()
		});
		
		$("option", "[name=chk_user_list]").each(function(){this.selected = false;});
		
		var afterClose = m$.form.find(".btn-save").data('after-close') == true ? true : false;
		
		$('body').requestData(mState.mode.action, param, {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});
	},

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				
				var rulesetId = m$.rulesetId.val();
				
				$('body').requestData(mCfg.urlDelete, {ruleset_id:rulesetId}, {
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
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.searchRuleset.form.init();
});