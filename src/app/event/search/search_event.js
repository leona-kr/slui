'use strict';

_SL.nmspc("searchEvent").manager = function() {

	var
	tl,
	eventSource,
	
	// Config 정의	
	mCfg = {
		urlList 		: gCONTEXT_PATH + 'event/search_event_list.json',
		urlChartData 	: gCONTEXT_PATH + 'event/search_event_chart_data.json',
		urlHandlingUdate: gCONTEXT_PATH + 'event/search_event_update.json',
		urlDuplicate 	: gCONTEXT_PATH + 'event/search_event_duplication.do',
		urlDuplForm		: gCONTEXT_PATH + 'event/search_event_duplication_form.html',
		urlDownload 	: gCONTEXT_PATH + 'event/search_event_export.do',
		
		formId 			: '#searchSearchEventList',
		gridId 			: '#searchEventListTable',
		cateChartId 	: 'cateChartContainer',
		handlChartId	: 'handlChartContainer',
		timeLineId		: '#searchEventTimeline'
		
	},
	
	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		timeLine: $(mCfg.timeLineId),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		
		groupCd		 	: $(mCfg.formId + ' [name=s_group_cd]'),
		eventCateCd 	: $(mCfg.formId + ' [name=s_event_cate_cd]'),
		eventNm 		: $(mCfg.formId + ' [name=s_event_nm]'),
		eventLevel 		: $(mCfg.formId + ' [name=s_event_level]'),
		fieldVal 		: $(mCfg.formId + ' [name=s_field_val]'),
		handlingTypeCd 	: $(mCfg.formId + ' [name=s_handling_type_cd]'),
		dashboardYn 	: $(mCfg.formId + ' [name=s_dashboard_yn]')
	},

	init = function() {
		// 이벤트 Binding
		bindEvent();
		
		//이벤트 리스트 초기화
		slapp.searchEvent.dynPaging.init();
		//타임라인 초기화
		initTimeLine();
		//내표시필드
		slapp.searchEvent.dlgViewField.init();
		
		//차트
		getMainChart();
		//리스트
		slapp.searchEvent.dynPaging.search();
		
		//우클릭 도움말
		slapp.searchEvent.contextMenuManager.init();
		
	},
	
	bindEvent = function() {
		//Search
		m$.form.find('.form-submit').off().on('click',function(){
			refresh();
		});
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;
			if (setMin == 0) return;
			
			var setDateUI = function( $obj, _value ){
				var $select = $obj.siblings('.tform-select');
				$select.find('.tform-select-t').text(_value).end()
					.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
				$obj.val(_value);
			}

			var startTime = _SL.formatDate.addMin(m$.form.find("[name=endDay]").val() + m$.form.find("[name=endHour]").val() + m$.form.find("[name=endMin]").val(), -setMin);
			setDateUI(m$.form.find("[name=startDay]"),startTime.substring(0,8));
			setDateUI(m$.form.find("[name=startHour]"),startTime.substring(8,10));
			setDateUI(m$.form.find("[name=startMin]"),startTime.substring(10,12));
		});
		
		// Date,Time change 이벤트 설정
		m$.form.find("[name=startDay],[name=startHour],[name=startMin],[name=endDay],[name=endHour],[name=endMin]").change(function(){
			var $obj = m$.form.find("[name=timeSet]"),
				t = $obj.siblings('.tform-select').find('[data-value=0]').text();
			$obj.val(0)
				.siblings('.tform-select').find('.tform-select-t').text(t);
		});
		
		//엑셀다운로드
		m$.form.find('.btn-download').off().on('click',function(){
			excelDownLoad();
		});
		
		//Eventhandling
		var $btnHandling = m$.grid.parent().siblings('.grid-bottom').find('.btn-handling');
		$btnHandling.on("click", goProcess);
		
		
	},
	
	getMainChart = function(){
		cateChartCfg.dataSource.chart = $.extend({}, slui.chart.chartConfig, cateChartCfg.dataSource.chart);
		handlChartCfg = $.extend(true, {}, cateChartCfg);
		eventSource.clear();		
		
		$('body').requestData(
			mCfg.urlChartData,
			{
				start_time 			:	m$.sDay.val() + m$.sHour.val() + m$.sMin.val(),
				end_time 			:  	m$.eDay.val() + m$.eHour.val() + m$.eMin.val(),
				s_group_cd		 	: 	m$.groupCd.val(),
				s_event_cate_cd 	: 	m$.eventCateCd.val(),
				s_event_nm 			: 	m$.eventNm.val(),
				s_event_level 		: 	m$.eventLevel.val(),
				s_field_val 		: 	m$.fieldVal.val(),
				s_handling_type_cd 	: 	m$.handlingTypeCd.val(),
				s_dashboard_yn 		: 	m$.dashboardYn.val()
			},
			{ 	
				callback : function(rsData, rsCd, rsMsg){
					drawPieChart(rsData);
					drawTimeLineWidget(rsData);
				}
			}
		);
	},
	
	drawPieChart = function(rsJson){
		//분류별 현황
		var cateCdChartLabels = rsJson.cateCdChartLabels;
		var cateCdChartData  = cateChartCfg;
		var cateCdChartDataList  = rsJson.cateCdChartDataList;
		
		cateCdChartData.renderAt = mCfg.cateChartId;

		cateCdChartData.dataSource.chart.caption  = "분류별 현황";
		cateCdChartData.dataSource.data = [];
		
		for (var i in cateCdChartLabels) {
			cateCdChartData.dataSource.data.push(getPieChartData("event_cate_cd", cateCdChartLabels[i], cateCdChartDataList));
		}
		
	
		//상태별 현황
		var handlingTypeChartLabels = rsJson.handlingTypeChartLabels;
		var handlingTypeChartDataList  = rsJson.handlingTypeChartDataList;
		var handlingTypeChartData  = handlChartCfg;
		
		handlingTypeChartData.renderAt = mCfg.handlChartId;
		handlingTypeChartData.dataSource.chart.caption  = "상태별 현황";
		handlingTypeChartData.dataSource.data = [];
		
		for (var i in handlingTypeChartLabels) {
			handlingTypeChartData.dataSource.data.push(getPieChartData("handling_type_cd", handlingTypeChartLabels[i], handlingTypeChartDataList));
		}
		
		drawChart(cateCdChartData);
		drawChart(handlingTypeChartData);		
	},	
	
	
	getPieChartData = function(type, label, resultList){
		var data = {label : label, value : 0};
		for (var r in resultList) {
			if (label == resultList[r].label) {
				data = {label : resultList[r].label, value : resultList[r].value, 
						link : "javascript:slapp.searchEvent.manager.goChartSearch('" + type + "','" + resultList[r].type + "')"}; 
				break;
			}
		}
		return data;
	},
	
	drawChart = function(pieChartData) {
		FusionCharts.ready(function(){
			var pieChart = new FusionCharts(pieChartData).render();
		});
	},
	
	drawTimeLineWidget = function(rsJson){
		var timeLineList = rsJson;
		if(timeLineList.events){

			tl.clearBandCount(0);
			tl.clearBandCount(1);
			eventSource.loadJSON(timeLineList, "/");
	    	
			var d = new Date();
			if(timeLineList.events.length > 0){
				var len = Math.floor(timeLineList.events.length/2)-1
		    	if(len <0) len=0;
				d = new Date(timeLineList.events[len].start);
			}
			
			tl.getBand(0).setCenterVisibleDate(d);
			tl.finishedEventLoading();
		}	
	},

	cateChartCfg = {
		type: 'pie3d',
		width : "100%",
		height : "300",
		dataFormat : "json",
		dataSource : 
		{
			chart : {},
			data : []
		}
	},

	handlChartCfg = {},
	
	initTimeLine = function(){
		eventSource = new Timeline.DefaultEventSource();
		var theme1 = Timeline.ClassicTheme.create();
		theme1.event.bubble.width = 250;
		theme1.autoWidth = true;
		
		var theme2 = Timeline.ClassicTheme.create();
		
		var bandInfos = [
	        Timeline.createBandInfo({
	            width:          200, 
	            intervalUnit:   Timeline.DateTime.MINUTE, 
	            intervalPixels: 50,
	            timeZone:       9,
	            eventSource:    eventSource,
	            theme:          theme1
	        }),
	        Timeline.createBandInfo({
	        	width:          50, 
	            intervalUnit:   Timeline.DateTime.HOUR, 
	            intervalPixels: 100,
	            timeZone:       9,
	            eventSource:    eventSource,
	            theme:			theme2,
	            overview:       true
	        })
	    ];
		bandInfos[0].minWidth = 200;
	    bandInfos[1].syncWith = 0;
	    bandInfos[1].highlight = true;
	    tl = Timeline.create(document.getElementById("searchEventTimeline"), bandInfos);
	    tl.finishedEventLoading();		
	},
	
	refresh = function() {	
		//차트들
		getMainChart();
		//리스트
		slapp.searchEvent.dynPaging.search();
	},
	
	goChartSearch = function(type, value){
		if(type == "event_cate_cd"){
			m$.eventCateCd.val(value);
		}
		else if(type == "handling_type_cd"){
			m$.handlingTypeCd.val(value);
		}
		refresh();
	},
	
	excelDownLoad = function(){
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	},
	
	goProcess = function(){
		var process = $(this).data('handle-type');
		var process_text = $(this).text();
		var idxs = [];
		
		
		m$.grid.find("input[name=chk_idx]:checked").each(function (){						
			var key = $(this).data("key");
			idxs.push(key);
		});
				
		if(idxs.length < 1){
			_alert(process_text + "할 이벤트를 체크해주세요.");
			return;
		}else{
			_confirm("이벤트를 " + process_text + " 하시겠습니까?",{
				onAgree : function(){
					if(process == 1 || process == 2){
						statusUpdate(process);
					}else if(process == 4){
						duplicationUpdate();
					}
				}
			});
		}
	},
	
	statusUpdate = function(process){
		var idxs = [];

		m$.grid.find("input[name=chk_idx]:checked").each(function (){
			var key = $(this).data("key");
			idxs.push(key);
		});
		
		var len = idxs.length;
		var cnt = 0;
		var json = {};
		
		loading.show($('body'));
		for (var i in idxs) {
			console.log(i);
			json = {
				handling_type_cd : process,
				event_seq  : idxs[i]
			}
		
			$('body').requestData(mCfg.urlHandlingUdate, json, {
				callback : function(rsData, rsCd, rsMsg){
					cnt ++;
					if(cnt == len){
						loading.hide($('body'));
						refresh();
					}
				}
			});
		}
	},
	
	
	duplicationUpdate = function(){

		if(!checkDuplicationValue()) return; //여기서 중복조건 체크
		var process_text="중복";
		var dataList = slapp.searchEvent.dynPaging.getListData();
		var checkDataNum = m$.grid.find("input[name=chk_idx]:checked").data("num");
		
		
		var idxs = [];//중복설정 새로 등록후 상태 업데이트할 이벤트들

		m$.grid.find("input[name=chk_idx]:checked").each(function (){						
			var key = $(this).data("key");
			idxs.push(key);
		});
		
		var duplicationQuery = dataList[checkDataNum].field_val;
		var rulesetId = dataList[checkDataNum].ruleset_id;
		var groupField = dataList[checkDataNum].group_field;
		var eventSeq = dataList[checkDataNum].event_seq;
		var seqCsv = idxs.join();
		
		$('body').requestData(mCfg.urlDuplicate, {duplication_query : duplicationQuery, group_field : groupField, ruleset_id : rulesetId, event_type_cd : 1}, {callback : function(data) {
			if(data.cnt != 0 || data.cnt2 == 0 ){ //중복설정에 등록되있거나 삭제된 이벤트가 있을경우에
				var confirmString = "";
				if(data.cnt != 0 ){
					confirmString = process_text+"설정에 등록된 이벤트이므로\n상태만 업데이트 됩니다.";
				}else if(data.cnt2 == 0){
					confirmString = "설정에서 삭제된 이벤트이므로\n상태만 업데이트 됩니다.";
				}
				_confirm(confirmString ,{
					onAgree : function(){
						statusUpdate(4);
					}
				});
			}else{
				viewDuplForm(mCfg.urlDuplForm +'?seq='+eventSeq+'&seqCsv='+ seqCsv +'&chk=insert');
			}
		}});
	},
	
	checkDuplicationValue = function(){
		var rowNums = [];
		var process_text = "중복";
		
		m$.grid.find("input[name=chk_idx]:checked").each(function (){
			var rowNum = $(this).data("num");
			rowNums.push(rowNum);
		});

		var dataList = slapp.searchEvent.dynPaging.getListData();
			
		for(var i=1; i<rowNums.length; i++){
			if(dataList[rowNums[0]].event_nm != dataList[rowNums[i]].event_nm){
				_alert(process_text+"조건이 일치하지 않습니다.");
				return false;
			}else if(dataList[rowNums[0]].group_field != dataList[rowNums[i]].group_field){
				_alert(process_text+"조건이 일치하지 않습니다.");
				return false;
			}else if(dataList[rowNums[0]].field_val != dataList[rowNums[i]].field_val){
				_alert(process_text+"조건이 일치하지 않습니다.");
				return false;
			}else if(dataList[rowNums[0]].ruleset_id != dataList[rowNums[i]].ruleset_id){
				_alert(process_text+"조건이 일치하지 않습니다.");
				return false;
			}
		};
		return true;
	},
	
	viewDuplForm = function(url){
		var modal = new ModalPopup(url, {
			width: 800,
			height: 500,
			onClose : function(){
				
			}
		});
	};
	
	return {
		init : init,
		goChartSearch : goChartSearch,
		refresh : refresh
	};

}();

/**
 * 내 표시필드
 **/
slapp.searchEvent.dlgViewField = function() {
	var
	refDynPaging,
	
	dlg				= '#windowViewFields',
	classSave		= ".btn-save",
	classDelete		= ".btn-delete",
	classOk			= ".btn-ok",
	classCancel		= ".btn-cancel",

	defaultViewNamePrefix = "[",
	
	urlList 		= gCONTEXT_PATH + "monitoring/myviewfield_list.json",
	urlInsert 		= gCONTEXT_PATH + "monitoring/myviewfield_insert.do",
	urlUpdate 		= gCONTEXT_PATH + "monitoring/myviewfield_update.do",
	urlDelete 		= gCONTEXT_PATH + "monitoring/myviewfield_delete.do",
	
	$dlg, $form, $viewId, $viewFields,
	
	init = function() {
		refDynPaging	= slapp.searchEvent.dynPaging;
		
		$dlg		= $(dlg);
		$form		= $("form", $dlg);
		$viewId		= $("[name=view_id]", $form);
		$viewFields	= $("[name=view_fields]", $form);
		
		//설정 창 만들기
		$dlg.jqxWindow({
			height: 250, width: 640, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5,
			cancelButton : $(dlg+' '+classCancel)
		}).on('open',function(){
			slui.attach.setTransformSelect('.jqx-window');
		});
		
		$viewFields.chosen({
			width:"100%",
			search_contains : true,
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 50
		});
		$("ul.chosen-choices", $form).sortable({cancel : ".search-field"}).disableSelection();
		
		// Bind Event
		$viewId.on('change', _onChangeViewId);
		$(classSave, $dlg).on('click', _onClickSave);
		$(classDelete, $dlg).on('click', _onClickDelete);
		$(classOk, $dlg).on('click', _onClickOk);
		
		// 표시필드명 대화창 초기화
		mDlgViewName.init(_callbackSave);
	},
	open = function(pViewFields) {
		console.log(pViewFields);
		// 내표시필드 목록 Load
		$viewId
			.empty()
			.append(
				$("<option/>").attr({
					'value'				: "",
					'selected'			: true,
					'data-view-fields'	: pViewFields.join(",")
				})
				.text("새로 등록...")
			);
		
		$viewFields.setSelectionOrder(pViewFields, true);
		
		$('body').requestData(urlList, { view_type : 2 }, {callback : function(data) {
			$.each(data, function(idx, val) {
				$("<option>").attr({
					'value' 			: val.view_id,
					'title' 			: val.view_name,
					'data-view-fields'	: val.view_fields
				})
				.text(val.view_name)
				.appendTo($viewId);
			});
			
			$viewId.trigger("change");
		}});

		$dlg.jqxWindow('open');
	},
	_onChangeViewId = function() {
		var viewId = $viewId.val();
		
		if(viewId != "")
			$viewFields.setSelectionOrder($viewId.find(":selected").attr("data-view-fields").split(","), true);
	},
	_onClickOk = function() {
		var viewFields = $viewFields.getSelectionOrder();
		
		if(viewFields.length == 0) {
			_alert("표시할 필드를 선택하세요.");
			return;
		}
		
		refDynPaging.changeFieldCaption(viewFields);
		
		$dlg.jqxWindow("close");
	},
	_onClickSave = function() {
		var data = {
			view_id		: $viewId.val(),
			view_name	: $viewId.val() == "" ? "" : $viewId.find(":selected").text(),
			view_fields	: $viewFields.getSelectionOrder().join(","),
			view_type	: "2"
		};
		
		if(data.view_fields.length == 0) {
			_alert("표시할 필드를 선택하세요.");
			return;
		}
		
		if(data.view_name.indexOf(defaultViewNamePrefix) == 0) {
			_save(data);
		}
		else {
			mDlgViewName.open(data.view_name);
		}
	},
	_onClickDelete = function() {
		var viewId = $viewId.val();
		var viewName = $viewId.find(":selected").text();
		
		if(viewId == "") {
			_alert("삭제할 내 표시필드를 선택하세요.");
			return false;
		}
		else if(viewName.indexOf(defaultViewNamePrefix) == 0) {
			_alert("기본 표시필드는 삭제할 수 없습니다.");
			return false;
		}
//		else if(viewName.indexOf(myFilterViewNamePrefix) == 0) {
//			_alert("내검색조건에서 선택한 필드이므로 삭제할 수 없습니다.");
//			return false;
//		}
		else {
			_confirm("삭제 하시겠습니까?", { onAgree : function(){
				$("body").requestData(urlDelete, { view_id : $viewId.val() }, {callback : function(rsData, rsCd, rsMsg){
					$viewId.find(":selected").remove();
					$viewId.val("");
					_alert(rsMsg);
				}});
			} } );
		}
	},
	_callbackSave = function(pViewName) {
		_save({
			view_id		: $viewId.val(),
			view_name	: pViewName,
			view_fields	: $viewFields.getSelectionOrder().join(","),
			view_type	: "2"
		});
	},
	_save = function(rqData) {
		$('body').requestData(rqData.view_id == "" ? urlInsert : urlUpdate, rqData, {
			callback : function(rsData, rsCd, rsMsg) {
				if(rqData.view_id == "") {
					$("<option/>").attr({
						'value'				: rsData.view_id,
						'title' 			: rsData.view_name,
						'data-field-value'	: rsData.view_fields,
						'selected' : true
					})
					.text(rsData.view_name)
					.appendTo($viewId);
				}
				else {
					if(rsData.view_name) {
						$viewId.find(":selected").attr({
							'title' : rsData.view_name,
							'data-field-value' : rsData.view_fields
						})
						.text(rsData.view_name);
					}
				}
				_alert(rsMsg);
				refDynPaging.changeFieldCaption(rsData.view_fields.split(","));
			}
		});
	},
	_close = function() {
		$dlg.jqxWindow('close');
	},
	
	mDlgViewName = function() {
		var
		dlg = "#windowViewName",
		
		classSave		= ".btn-save",
		classCancel		= ".btn-cancel",
		
		defaultViewNamePrefix = "[",
		
		$dlg, $form, $viewName,
		
		init = function(callback) {
			$dlg		= $(dlg);
			$viewName	= $("[name=view_name]", $dlg);
			
			$dlg.jqxWindow({
				height: 115, width: 300, autoOpen: false,
				resizable: false, isModal: true, modalOpacity: 0.5,
				cancelButton : $(dlg+' '+classCancel)
			});
			
			$(classSave, $dlg).on("click", function(){ _onClickSave(callback); });
		},
		open = function(viewName) {
			$viewName.val(viewName);
			
			$dlg.jqxWindow('open');
		},
		_onClickSave = function(callback) {
			var viewName = $viewName.val();
			
			if(viewName == "") {
				_alert("이름을 입력하세요.");
				return;
			}
			else if(viewName.indexOf(defaultViewNamePrefix) == 0) {
				_alert("'" + defaultViewNamePrefix + "'로 시작되는<br> 이름은 사용할 수 없습니다.");
				return;
			}
			$dlg.jqxWindow('close');
			callback(viewName);
		}
		
		return {
			init : init,
			open : open
		};
	}();
	
	return {
		init : init,
		open : open,
		close : _close
	};
	
}();

_SL.nmspc("searchEvent").contextMenuManager = function() {
	
	var

	// Config 정의	
	mCfg = {		
		eventInfoDlgId : '#eventInfoDlg'
	},	
	
	m$ = {
		eventInfoDlg : $(mCfg.eventInfoDlgId)
	},
	
	init = function() {
		var items = {string_codec: {name: "도움말", callback : onCtxDescription}}
		
		$.contextMenu({
			selector: '.context-menu-one',
			zIndex : 1003,					// 페이지 하단 1002
			items : items
		});
		
		m$.eventInfoDlg.jqxWindow({
			height: 450, width: 700, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5
		});
		
	},
	
	onCtxDescription = function(key, options){
		var ariaValue = options.$trigger.data("aria");
		if(!ariaValue) {
			console.log("Invalid aria-value!! >> onCtxLogType[key=" + key + ", aria-value=" + ariaValue + "]");
			return;
		}
		var listVal = ariaValue.split(",");
		
		if(listVal.length != 2) {
			console.log("Invalid aria-value!! >> onCtxLogType[key=" + key + ", aria-value=" + ariaValue + "]");
			return;
		}
		var listData = slapp.searchEvent.dynPaging.getListData();
		var data = listData[listVal[0]];
		
		m$.eventInfoDlg.find("[name=event_desc]").val(data.description);
		m$.eventInfoDlg.jqxWindow('open');
	}
	
	return {
		init : init
	};
}();

$(function(){
	slapp.searchEvent.manager.init();
	
	//일반이벤트 검증
	$("#btnSettingSearchRulesetCase").togglePage(gCONTEXT_PATH + "event/search_ruleset_case_list.html");
	//일반이벤트 설정
	$("#btnSettingSearchRuleset").togglePage(gCONTEXT_PATH + "event/search_ruleset_list.html");
	//일반이벤트 중복 설정
	$("#btnSettingEventDuplication").togglePage(gCONTEXT_PATH + "event/search_event_duplication_list.html");

});