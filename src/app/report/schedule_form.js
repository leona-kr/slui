//# sourceURL=schedule_form.js
'use strict';

_SL.nmspc("schedule").form = function(){

	var
	// Config 정의
	mCfg = {
		formId 			: '#formReportSched',
		urlSelect 		: gCONTEXT_PATH + "report/schedule_form.json",
		urlDelete 		: gCONTEXT_PATH + "report/schedule_delete.do",
		urlSelectUser 	: gCONTEXT_PATH + "report/report_mail_user.json",
		eqpTreeId 		: "#eqp_ip_tree",
		eqpTypeTreeId 	: "#eqp_type_cd_tree",
		logCateTreeId 	: "#log_cate_cd_tree",
		assetGrpTreeId	: "#asset_group_cd_tree",
		eqpUrl 			: gCONTEXT_PATH + "report/eqp_list.json",
		eqpTypeUrl 		: gCONTEXT_PATH + "report/eqp_type_list.json",
		logCateUrl 		: gCONTEXT_PATH + "report/log_cate_list.json",
		assetGrpUrl 	: gCONTEXT_PATH + "report/asset_group_list.json",
		
		add : {
			action : gCONTEXT_PATH + "report/schedule_add.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "report/schedule_update.do",
			message : "수정 하시겠습니까?"
		},
		condIds : {
			"ALL" : ["eqp_ip", "eqp_type_cd", "log_cate_cd", "asset_group_cd"],
			"1" : ["log_cate_cd"],
			"2" : ["eqp_type_cd", "asset_group_cd"]
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form 			: $(mCfg.formId),
		eqpTree 		: $(mCfg.eqpTreeId),
		eqpTypeTree 	: $(mCfg.eqpTypeTreeId),
		logCateTree 	: $(mCfg.logCateTreeId),
		assetGrpTree 	: $(mCfg.assetGrpTreeId),
		
		scheduleId 		: $(mCfg.formId + ' [name=schedule_id]'),
		schdStat 		: $(mCfg.formId + ' [name=schd_stat]'),
		reportId 		: $(mCfg.formId + ' [name=report_id]'),
		genCycle 		: $(mCfg.formId + ' [name=gen_cycle]'),
		genStartDay 	: $(mCfg.formId + ' [name=genStartDay]'),
		genStartHour 	: $(mCfg.formId + ' [name=genStartHour]'),
		genStartMin 	: $(mCfg.formId + ' [name=genStartMin]'),
		timeSet 		: $(mCfg.formId + ' [name=timeSet]'),
		schPeriodTr 	: $(mCfg.formId + ' #schPeriodTr'),
		week 			: $(mCfg.formId + ' [name=week]'),
		genCondition 	: $(mCfg.formId + ' [name=gen_condition]')
	},
	
	// 현재 상태 변수
	mState = {
		tree : null,
		isNew : m$.scheduleId.val() == "" ? true : false,
		mode : m$.scheduleId.val() == "" ? mCfg.add : mCfg.update,
		genCondition : m$.genCondition.val() == "" ? "{}" : m$.genCondition.val()
	},
	
	init = function(){
		// 이벤트 Binding
		bindEvent();
		
		m$.reportId.trigger("change");
		
		// DOM 설정 Start
		// 추가 시 삭제버튼 숨기기
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
			m$.form.find(".schdStatTr").hide();
		}
		// 수정 시 보고서 셀렉트 비활성화
		else {
			m$.reportId.prop("disabled", true);
		}
		
		// 데이타 조회
		if(!mState.isNew) select();

		slui.attach.init(mCfg.formId);
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;
			
			if (setMin == 0) return;
			
			var startTime = _SL.formatDate.addMin(m$.form.find("[name=schEndDay]").val() + m$.form.find("[name=schEndHour]").val() + m$.form.find("[name=schEndMin]").val(), -setMin);
			
			m$.form.find("[name=schStartDay]").val(startTime.substring(0,8));
			m$.form.find("[name=schStartDay]").siblings('.tform-select').find('.tform-select-t').text(startTime.substring(0,8));
			m$.form.find("[name=schStartHour]").val(startTime.substring(8,10));
			m$.form.find("[name=schStartHour]").siblings('.tform-select').find('.tform-select-t').text(startTime.substring(8,10));
			m$.form.find("[name=schStartMin]").val(startTime.substring(10,12));
			m$.form.find("[name=schStartMin]").siblings('.tform-select').find('.tform-select-t').text(startTime.substring(10,12));
		});
		
		// Date,Time change 이벤트 설정
		m$.form.find("[name=schStartDay],[name=schStartHour],[name=schStartMin],[name=schEndDay],[name=schEndHour],[name=schEndMin]").change(function(){
			m$.form.find("[name=timeSet]").val(0);
			m$.form.find("[name=timeSet]").siblings('.tform-select').find('.tform-select-t').text( m$.timeSet.find('option:eq(0)').text() );
		});
		
		//보고서 change
		m$.reportId.on("change", onChangeReport);
		//주기 change
		onChangeGenCycle();
		m$.genCycle.on("change", onChangeGenCycle);
		
		// 메일수신자 add
		m$.form.find("#report_usr_add").click(function(){
			var val = m$.form.find("[name=chk_user]").val();
			if(val=='') return false;

			var text = m$.form.find("[name=chk_user] option:selected").text();
			var userInfo = text.split(",");
			var userId, mailAddr;

			for(var i=0; i<userInfo.length; i++) {
				userId = userInfo[0];
				mailAddr = userInfo[2];
			}
			
			if(mailAddr.length <= 2) {
				_alert("이메일이 등록되지 않은 사용자 입니다. <br>( " + userId + " )");
				return;
			}
			
			if(val == "") {
				_alert("사용자를 선택하세요.");
				return;
			}
			
			if( m$.form.find("[name=chk_user_list] option").is(
				function() {
					return this.value == val;
				})
			){
				_alert("해당 ID가 이미 존재합니다. ( ID : " + val + " )");
				return;
			}
			
			m$.form.find("[name=chk_user_list]").append($("<option>").val(val).text(text));
			//slui.attach.setTransformSelect('.section-container');
		});
		
		// 메일수신자 del
		m$.form.find("#report_usr_del").click(function(){
			m$.form.find("[name=chk_user_list] :selected").remove();
		});
	},
	
	select = function() {
		var
			id = m$.scheduleId.val(),
			rqData = {'schedule_id': id},
	
			callback = function(data){
				if(data != null) {
					var genSTime = data.gen_start_time;
					var schSTime = data.sch_start_time;
					var schETime = data.sch_end_time;
					var genDay = data.gen_day;
					var genCondition = data.gen_condition;
					var genCycle = data.gen_cycle;
					
					if(schSTime == null || schETime == null) {
						schSTime = _SL.formatDate.addMin(genSTime, -60);
						schETime = genSTime;
					}
					
					m$.form.find("[name=genStartHour]").val(genSTime.substring(8,10));
					m$.form.find("[name=genStartMin]").val(genSTime.substring(10,12));
					
					if(genCycle == "0") {	//생성주기 한번일 때
						m$.form.find("[name=genStartDay]").val(genSTime.substring(0,8));
						m$.form.find("[name=schStartDay]").val(schSTime.substring(0,8));
						m$.form.find("[name=schStartHour]").val(schSTime.substring(8,10));
						m$.form.find("[name=schStartMin]").val(schSTime.substring(10,12));
						m$.form.find("[name=schEndDay]").val(schETime.substring(0,8));
						m$.form.find("[name=schEndHour]").val(schETime.substring(8,10));
						m$.form.find("[name=schEndMin]").val(schETime.substring(10,12));
						m$.form.find("[name=gen_condition]").val(genCondition);
					}
					_SL.setDataToForm(data, m$.form, {
						"schd_stat" : {
							//field	:	schd_stat
							converter : function(cvData, $fld) {
								if(cvData == "3") {
									m$.schdStat.parents('[class^=range-]').hide();
									m$.form.find(".comp_stat").show();
									m$.form.find(".btn-save").hide();
								}
								else {
									m$.schdStat.val(cvData);
									m$.schdStat.parents('[class^=range-]').show();
									m$.form.find(".comp_stat").hide();
									m$.form.find(".btn-save").show();
								}
							}
						},
						"gen_day" : {
							field : "week",
							converter : function(cvData, $fld) {
								if(cvData == 7) cvData = 0;
								if(genCycle == "2") m$.form.find("[name=week]").val(cvData);
							}
						},
						"file_format_list" : {
							field : "file_format_list_chk",
							converter : function(cvData, $fld) {
								var fileFormArr = cvData.split(",");
								
								$.each(fileFormArr, function(idx, val) {
									m$.form.find("[name=file_format_list_chk]").each(function() {
										if(val == $(this).val()) {
											$(this).prop("checked", true);
										}
									});
								});
							}
						}
					});
					onChangeReport();
					onChangeGenCycle();

					slui.attach.init(mCfg.formId);
				}
				else {
					_alert("처리 중 에러가 발생하였습니다");
				}
			};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
		
		var 
			callbackUser = function(rsMap){
				var userId, userInfo;
				
				for(var i in rsMap) {
					userId = rsMap[i].user_id;
					userInfo = rsMap[i].user_nm + " ["+ rsMap[i].user_id +"], ["+ rsMap[i].mobile_no +"], ["+ rsMap[i].mail_addr +"]";
					m$.form.find("[name=chk_user_list]").append($("<option value='"+userId+"'>"+userInfo+"</option>"));
				}

				slui.attach.init(mCfg.formId);
			};
		
		$('body').requestData(mCfg.urlSelectUser, rqData, {callback : callbackUser});
	},
	
	onChangeReport = function() {
		var rqData = {'report_id': m$.reportId.val()};
		var reportType = m$.form.find("[name=report_id] option:selected").data("report-type");
		
//		$('body').requestData(mCfg.eqpUrl, rqData, {callback : _makeEqpTree});
		if(reportType == "2") {
			$('body').requestData(mCfg.eqpTypeUrl, rqData, {callback : _makeEqpTypeTree});
			$('body').requestData(mCfg.assetGrpUrl, rqData, {callback : _makeAssetGrpTree});
		}
		else if(reportType == "1") {
			$('body').requestData(mCfg.logCateUrl, rqData, {callback : _makeLogCateTree});
		}
		
		var curIds = mCfg.condIds[reportType];
		var curParamId;
		
		if(!curIds) curIds = [];
		
		for(var idx in mCfg.condIds.ALL) {
			curParamId = mCfg.condIds.ALL[idx];
			
			if($.inArray(curParamId, curIds) > -1)
				$("#" + curParamId + "_tr").show();
			else
				$("#" + curParamId + "_tr").hide();
		}
	},
	
	onChangeGenCycle = function() {
		var	genCycle = m$.genCycle.val();
		
		if(genCycle == "0") {
			m$.genStartDay.parents('[class^=range-]').css('visibility','visible');
			m$.schPeriodTr.show();
			m$.week.parents('[class^=range-]').css('visibility','hidden');
			slui.attach.setTransformSelect(mCfg.formId + ' #schPeriodTr');
		}
		else {
			m$.genStartDay.parents('[class^=range-]').css('visibility','hidden');
			m$.schPeriodTr.hide();
			
			if(genCycle == "2"){
				m$.week.parents('[class^=range-]').css('visibility','visible');
			}else{
				m$.week.parents('[class^=range-]').css('visibility','hidden');
			}
		}
	},
	
	_makeEqpTree = function(list) {
		var curParamId;
		var curFolder;
		var curAll;
		var treeData = {};
		var genCondition = m$.genCondition.val() == "" ? "{}" : $.parseJSON(m$.genCondition.val());
		
		curParamId = "eqp_ip";
		treeData[curParamId] = {title: "전체", key : "ALL", children : []};
		curAll = genCondition[curParamId] && genCondition[curParamId].length > 0 ? false : true;
		
		for(var i = 0, l = list.length; i < l; i++) {
			var data, hiddenMenu = [], nodes = {};
			
			data = list[i];
			treeData[curParamId].children.push({title : data.eqp_name+"("+data.eqp_ip+")", select : curAll || $.inArray(data.eqp_ip, genCondition[curParamId]) > -1, key : data.eqp_ip});
		}
		
		m$.eqpTree.dynatree({
			minExpandLevel : 3,
			checkbox: true,
			selectMode: 3,
			children : treeData[curParamId]
		});
		
		if(mState.tree == null) {
			mState.tree = m$.eqpTree.dynatree("getTree");
		}
		else {
			mState.tree.reload();
		}
	},
	
	_makeEqpTypeTree = function(eqpTypeMap) {
		var curParamId;
		var curAll;
		var treeData = {};
		var genCondition = m$.genCondition.val() == "" ? "{}" : $.parseJSON(m$.genCondition.val());
		
		curParamId = "eqp_type_cd";
		treeData[curParamId] = {title: "전체", key : "ALL", children : []};
		curAll = genCondition[curParamId] && genCondition[curParamId].length > 0 ? false : true;
		
		for(var i in eqpTypeMap) {
			var map, hiddenMenu = [], nodes = {};
			
			treeData[curParamId].children.push({title : eqpTypeMap[i], isFolder : false, children : [], select : curAll || $.inArray(i, genCondition[curParamId]) > -1, key : i});
		}
		
		m$.eqpTypeTree.dynatree({
			minExpandLevel : 3,
			checkbox: true,
			selectMode: 3,
			children : treeData[curParamId]
		});
		
		if(mState.tree == null) {
			mState.tree = m$.eqpTypeTree.dynatree("getTree");
		}
		else {
			mState.tree.reload();
		}
	},
	
	_makeLogCateTree = function(logCateMap) {
		var curParamId;
		var curAll;
		var treeData = {};
		var genCondition = m$.genCondition.val() == "" ? "{}" : $.parseJSON(m$.genCondition.val());
		
		curParamId = "log_cate_cd";
		treeData[curParamId] = {title: "전체", key : "ALL", children : []};
		curAll = genCondition[curParamId] && genCondition[curParamId].length > 0 ? false : true;
		
		for(var i in logCateMap) {
			var data, hiddenMenu = [], nodes = {};
			treeData[curParamId].children.push({title : logCateMap[i], isFolder : false, select : curAll || $.inArray(i, genCondition[curParamId]) > -1, children : [], key : i});
		}
		
		m$.logCateTree.dynatree({
			minExpandLevel : 3,
			checkbox: true,
			selectMode: 3,
			children : treeData[curParamId]
		});
		
		if(mState.tree == null) {
			mState.tree = m$.logCateTree.dynatree("getTree");
		}
		else {
			mState.tree.reload();
		}
	},
	
	_makeAssetGrpTree = function(assetGroupMap) {
		var curParamId;
		var curAll;
		var treeData = {};
		var genCondition = m$.genCondition.val() == "" ? "{}" : $.parseJSON(m$.genCondition.val());
		
		curParamId = "asset_group_cd";
		treeData[curParamId] = {title: "전체", key : "ALL", children : []};
		curAll = genCondition[curParamId] && genCondition[curParamId].length > 0 ? false : true;
		
		for(var i in assetGroupMap) {
			var data, hiddenMenu = [], nodes = {};
			
			treeData[curParamId].children.push({title : assetGroupMap[i], isFolder : false, select : curAll || $.inArray(i, genCondition[curParamId]) > -1, children : [], key : i});
		}
		
		m$.assetGrpTree.dynatree({
			minExpandLevel : 3,
			checkbox: true,
			selectMode: 3,
			children : treeData[curParamId]
		});
		
		if(mState.tree == null) {
			mState.tree = m$.assetGrpTree.dynatree("getTree");
		}
		else {
			mState.tree.reload();
		}
	},
	
	onSave = function(){
		
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		var genSTime = m$.form.find("[name=genStartDay]").val() + m$.form.find("[name=genStartHour]").val() + m$.form.find("[name=genStartMin]").val();
		var sTime = m$.form.find("[name=schStartDay]").val() + m$.form.find("[name=schStartHour]").val() + m$.form.find("[name=schStartMin]").val();
		var eTime = m$.form.find("[name=schEndDay]").val() + m$.form.find("[name=schEndHour]").val() + m$.form.find("[name=schEndMin]").val();
		var	genCycle = m$.genCycle.val();
		
		if(genCycle == "0") {
			if(genSTime < eTime) {
				_alert("실행시간이 검색기간보다 커야 합니다.");
				return;
			}
			
			var diffTime = _SL.formatDate.diff(sTime, eTime);
			
			if(diffTime <= 0) {
				_alert("검색기간 종료시간이 시작시간보다 커야 합니다.");
				return;
			}
			if(diffTime/60000 > m$.form.find("[name=timeSet] option:last-child").val()) {
				_alert("검색 기간 초과입니다.");
				return;
			} 
		}

		if(!_SL.validate()) return;

		var condData = {};
		var reportType = m$.form.find("[name=report_id] option:selected").data("report-type");
		var curIds = mCfg.condIds[reportType];
		
		if(!curIds) curIds = [];
		
		var idx, curParamId, tree;
		
		for(var idx in curIds) {
			curParamId = curIds[idx];
			
			tree = $("#" + curParamId + "_tree").dynatree("getTree");
			
			if(!tree.getNodeByKey("ALL").isSelected()) {
				condData[curParamId]= $.map(tree.getSelectedNodes(), function(node){
					if(node.data.key.charAt(0) != '_') { 
						return node.data.key;
					}
				});
			}
		}
		
		var fileFormatList = 
			m$.form.find("[name=file_format_list_chk]:checked").map(function() {
				return this.value;
			}).get().join(",");
		m$.form.find("[name=file_format_list]").val(fileFormatList);
		
		if(!$.isEmptyObject(condData)) {
			m$.form.find("[name=gen_condition]").val(JSON.stringify(condData));
		}
		
		m$.form.find("[name=report_id]").prop("disabled", false);//저장하기 전에 disabled풀어주기.
		
		$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(true);
					}
				});
			}
		});
	},

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){

				var scheduleId = m$.scheduleId.val();
				
				//삭제되는 아이디 값 전송
				$('body').requestData(mCfg.urlDelete, {schedule_id: scheduleId},
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
	slapp.schedule.form.init();
});
