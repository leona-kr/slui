//# sourceURL=rel_event.js
'use strict';

_SL.nmspc("slapp.component").rel_event = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$header		= $("#componentheader_" + containerId),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),	
	$list		= $body.find(".grid-table-group"),
	$chartDiv	= $body.find(".chart-group"),
	$title		= $header.find(".area-title"),
	
	$rulesetId		= $form.find("[name=ruleset_id]"),
	$rulesetIdList	= $form.find("[name=ruleset_id_list]"),
	$eventCateCd	= $form.find("[name=event_cate_cd]"),
	$eventLevel		= $form.find("[name=event_level]"),
	$groupField		= $form.find("[name=group_field]"),
	$lastPeriod		= $form.find("[name=last_period]"),
	$rows			= $form.find("[name=rows]"),
	$chartYn		= $form.find("[name=chart_yn]"),
	
	urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlConfigMap	= gCONTEXT_PATH + "component/rel_event_config.json",	
	urlSelect		= gCONTEXT_PATH + "component/rel_event_list.json",
	urlEvent		= gCONTEXT_PATH + "event2/rel_event_list.html",
	
	default_param 	= {ruleset_id : "", event_cate_cd : "", event_level : "", last_period : "60", rows : "5", chart_yn : "N"},
	config_param 	= configParam,
	component_title = componentTitle,
	
	isFrequentRefresh = true,
	
	tk = null,
	tk_config_param = {grpFields : ["ruleset_id"], timeField : "event_time", sumField : "cnt", maxBuffers :	10000,  period : 60},
	
	//config용 변수
	eventNames,
	groupFields,

	load = function() {		
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		chartStyle = $.extend(this.chartstyles, chartStyle);
		chartStyle.paletteColors = "#89cf43,#ffc000,#ff0000";
		
		//설정 초기화
		initConfig();
		
		// Bind Event
		$form
		.on("click", ".btn-add", function(){
			var val = $rulesetId.find("option:selected").val();
			var text = $rulesetId.find("option:selected").text();
		
			if(val == "") {
				_alert("이벤트를 선택하세요.");
				return;
			}
		
			if( $rulesetIdList.find("option").is( function() { return this.value == val; }) 	){
				_alert("동일한 이벤트가 존재합니다.");
				return;
			}
			
			$rulesetIdList.append( $('<option>').val(val).text(text) );
		})
		.on("click", ".btn-del", function(){
			$rulesetIdList.find(":selected").remove();
		});

		//리스트 링크
		$list.on("click","a[name=rel_event_search]", function(event){
			listRelEvent($(event.target));
		});
		
		// Data 합산 객체 생성
		tk_config_param.period = config_param.last_period;
		tk = _SL.getDataTicker(tk_config_param);
		(tk).setBaseTime(_SL.formatDate.addMin(gGetServerTime(), - tk_config_param.period));

		// Load 시 기준 seq 값 setting
		config_param.event_seq = "";
		refresh();
	},

	refresh = function(isRefresh) {
		$("body").requestData(urlSelect, config_param, {callback : function(rsJson){
			
			var list = (rsJson && rsJson.rsList ? rsJson.rsList : []);
			var isInit = rsJson.isInit;
			
			if( list.length < 1 && !isInit) return;
			
			//Title 필드 표시
			var eventCateCdNm = ComCodes.CS0051[config_param.event_cate_cd];
			var eventLevelNm = ComCodes.CS0005[config_param.event_level];					

			var titleStr = "상관분석 이벤트";
			if(config_param.event_cate_cd != "") titleStr = titleStr + "/" + eventCateCdNm;
			if(config_param.event_level != "") titleStr = titleStr + "/" + eventLevelNm;					
			$title.text(titleStr);
			
			if(config_param.chart_yn == "Y") {
				(tk).addChartList(list);
				var chartDataList = (tk).getChartList();
				if($chartDiv.is(':hidden')){
					chartDraw(rsJson,chartDataList);
					$chartDiv.show();
				} else {
					chartDraw(rsJson,chartDataList,isRefresh);
				}
			} else {
				$chartDiv.hide();
			}
			
			//기준 seq
			var event_seq = config_param.event_seq;			
			if(list.length > 0) event_seq = list[0].event_seq; // 최근 이벤트 seq 설정
			
			(tk).addList(list);
			var sEventList = (tk).getList();
			
			sEventList.sort(function(d1, d2) {
				if		(d1.event_time > d2.event_time) return -1;
				else if	(d1.event_time < d2.event_time) return 1;
				
				if		((tk).getEventCount(d1.key) > (tk).getEventCount(d2.key)) return -1;
				else if	((tk).getEventCount(d1.key) < (tk).getEventCount(d2.key)) return 1;
				
				return 0;
			});
			
			//리스트생성 부분
			var $listTable = $list.find("tbody").empty();

			var count = sEventList.length;
			if(count > config_param.rows) count = config_param.rows;
			
			if(!count || count.length == 0) {
				$listTable.append('<tr><td colspan="6">There is no Result.</td></tr>');
			}else{
				var levelStrArr = ['Low','Middle','High'];
				var levelClsArr = ['label-success','label-attention','label-danger'];
				
				for(var i = 0; i < count; i++) {
					var rData = sEventList[i];
					var $tr = $("<tr></tr>"),
						$td1 = $('<td></td>').text(i+1).appendTo($tr),
						$td2 = $('<td></td>').appendTo($tr),
						$a = $('<a></a>')
								.attr({
									'name' : 'rel_event_search',
									'tabindex' : '1'
								})
								.css('cursor','pointer')
								.text(rData.event_nm)
								.data({
									'event_nm' : rData.event_nm,
									'event_time' : rData.event_time,
									's_event_time' : rData.s_event_time,
									'ruleset_id' : rData.ruleset_id,
									'event_cate_cd' : rData.event_cate_cd,
									'event_level' : rData.event_level
								})
								.appendTo($td2),
						$td3 = $('<td></td>').text(ComCodes.CS0051[rData.event_cate_cd]).appendTo($tr),
						$td4 = $('<td></td>').appendTo($tr),
						$td5 = $('<td></td>').text( _SL.toComma((tk).getEventCount(rData.key) + "건") ).appendTo($tr),
						$td6 = $('<td></td>').text( _SL.formatDate(rData.s_event_time, "MM-dd HH:mm")+ "~" +_SL.formatDate(rData.event_time, "MM-dd HH:mm") )
								.attr('title', _SL.formatDate(rData.s_event_time, "yyyy-MM-dd HH:mm") + " ~ " +  _SL.formatDate(rData.event_time, "yyyy-MM-dd HH:mm"))
								.appendTo($tr);

					rData.event_level_nm == 0 ? $td4.append('-') : $td4.append('<span class="'+levelClsArr[rData.event_level-1]+'">'+levelStrArr[rData.event_level-1]+'</span>');

					$tr.appendTo($listTable)
						.hide()
						.fadeIn(1500);
				}
			}
		
			config_param.event_seq = event_seq;
		}});
		
	},
	
	showConfig = function() {
		var sRulesetId	= config_param ? config_param.ruleset_id : "";
		
		//기본설정들
		$rulesetId.val("");
		$eventCateCd.val(config_param.event_cate_cd);
		$eventLevel.val(config_param.event_level);
		$groupField.val(config_param.group_field);
		$lastPeriod.val(config_param.last_period);
		$rows.val(config_param.rows);
		$form.find("[name=chart_yn]:input[value=" + config_param.chart_yn + "]").prop("checked", true);
		
		//이벤트명
		$rulesetIdList.empty();
		var rulesetIdArr = sRulesetId.split(",");

		for(var idx in rulesetIdArr){
			var id = rulesetIdArr[idx];
			if(id == null || id =="") continue;
			$rulesetIdList.append(new Option(eventNames[id], id));
		};
	},
	
	beforeSaveConfig = function(){
		var rulesetIdArr = [];
		
		var $rulesetIdListOption = $rulesetIdList.find("option");
		for(var idx=0; idx < $rulesetIdListOption.length; idx++) {
			rulesetIdArr.push($rulesetIdListOption.eq(idx).val());
		}
		
		config_param.ruleset_id = rulesetIdArr.join(",");
		config_param.event_cate_cd = $eventCateCd.val();
		config_param.event_level = $eventLevel.val();
		config_param.group_field = $groupField.val();
		config_param.last_period = $lastPeriod.val();
		config_param.rows = $rows.val();
		config_param.chart_yn = $form.find("[name=chart_yn]:checked").val();
		
		// Data 합산 객체 재생성
		tk_config_param.period = config_param.last_period;
		tk = _SL.getDataTicker(tk_config_param);
		
		(tk).setBaseTime(_SL.formatDate.addMin(gGetServerTime(), -tk_config_param.period));
		config_param.event_seq = "";
		
	},
	
	afterSaveConfig = function() {
		refresh(true);
	},
	
	initConfig = function(){
		
		if(!ComCodes.CS0051) {//분류
			$("body").requestData(urlCodeMap, {code_type : 'CS0051'}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0051 = rsJson;
				setEventCateCds();
			}});
		}else{
			setEventCateCds();
		};
		
		if(!ComCodes.CS0005) {//등급
			$("body").requestData(urlCodeMap, {code_type : 'CS0005'}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0005 = rsJson;
				setEventLevelCds();
			}});
		}else{
			setEventLevelCds();
		};
		
		//이벤트명
		$("body").requestData(urlConfigMap,{},{callback : function(rsJson, rsCd, rsMsg) {
			eventNames = rsJson.eventNames;
			setEventNames(eventNames);
		}});
	},	
	
	setEventCateCds = function() {
		$eventCateCd.html('<option value="">[선택하세요]</option>');
		
		for(var key in ComCodes.CS0051){
			$eventCateCd.append( $('<option>').val(key).text(ComCodes.CS0051[key]) );
		}
	},
	
	setEventLevelCds = function() {
		$eventLevel.html('<option value="">[선택하세요]</option>');
		
		for(var key in ComCodes.CS0005){
			$eventLevel.append( $('<option>').val(key).text(ComCodes.CS0005[key]) );
		}
	},
	
	setEventNames = function(eventNames) {
		$rulesetId.html('<option value="">[선택하세요]</option>');
		
		for(var key in eventNames){
			$rulesetId.append( $('<option>').val(key).text(eventNames[key]) );
		}
	},
	
	setGrpFlds = function(groupFields) {
		$groupField.html('<option value="">[선택하세요]</option>');
		
		for(var idx in groupFields){
			var fld = groupFields[idx];
			$groupField.append( $('<option>').val(fld).text(LogCaptionInfo[fld] +'('+ fld +')') );
		}
	},
	
	chartDraw = function(rsJson,list, isRefresh){

		var chartDataList = list;
		var chartData = {
			chart : chartStyle,
			categories : [],
			dataset : []
		};
		
		var dataset = [];
		var category = [];
		
		var eventLevels 	= ComCodes.CS0005;
		var groupByPeriod 	= rsJson.groupByPeriod;
		var categorys		= rsJson.categorys;
		var eventTime 		= "";
		
		for(var idx in categorys){
			category.push({label : _SL.formatDate(categorys[idx].event_time, "MM-dd HH:mm")});	
		}
	
		var grpChartDataList = {};
		var grpStime,grpEtime;
		var initDataO = {};
		
		for(var i in eventLevels){
			var levelNm = eventLevels[i];
			initDataO[levelNm] = 0;
		}	
	
		if(groupByPeriod > 1){
			for(var idx in categorys){
				var initDataO = {};
				
				for(var i in eventLevels){
					var levelNm = eventLevels[i];
					initDataO[levelNm] = 0;
				}
				
				grpStime = categorys[idx].event_time;
				grpEtime = _SL.formatDate.addMin(grpStime, groupByPeriod);
				grpChartDataList[grpStime] = initDataO;
				
				for(var i = 0; i<groupByPeriod ; i++){
					var tKey ;
					if(i == 0 ){
						tKey = grpStime;
					}else{
						tKey= _SL.formatDate.addMin(grpStime, i);
					}
					
					if(chartDataList[tKey]){
						for(var j in eventLevels){
							var levelNm = eventLevels[j];
							if(chartDataList[tKey][levelNm]){
								grpChartDataList[grpStime][levelNm] += chartDataList[tKey][levelNm];
							}
						}	
					}
				}
			}
			
			chartDataList = grpChartDataList;
			
		}
		
		for(var i in eventLevels){
			var levelNm = eventLevels[i];
			var tData = { seriesname : levelNm, data :[] };
			for(var j in categorys){
				eventTime = categorys[j].event_time;
				var cnt = 0 ;
				var sTime = categorys[j].event_time;
				var eTime = _SL.formatDate.addMin(sTime, groupByPeriod);
				var strHref = 'javascript:$.Dashboard.componentInstance["'+containerId+'"].chartRelEvent("'+i+'","'+sTime+'","'+eTime+'")';
				if(chartDataList[eventTime]){
					if(chartDataList[eventTime][levelNm]){
						cnt = chartDataList[eventTime][levelNm];
					}
				}
				
				tData.data.push({
					value : cnt,
					link : strHref
				});
			}
			dataset.push(tData);
		}
		
		chartData.categories.push({category : category});
		chartData.dataset = dataset;
		
		if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
			$.Dashboard.chartInstance[containerId].setJSONData(chartData);
		} else {
			FusionCharts.ready(function(){
				$.Dashboard.chartInstance[containerId] = new FusionCharts({
					type: 'stackedcolumn2d',
					renderAt: 'chart-container_' + containerId,
					width: '100%',
					height: '240',
					dataFormat: 'json',
					dataSource: chartData
				}).render();
			});
		}
	},	
	
	chartStyle = {
        "caption": "",
        "subCaption": "",
   		"numberPrefix": "",
   		"showValues" :"0"
	},
	
	listRelEvent = function($target){
		var $goEventForm = $body.find("[name=listForm]");
		var startTime = $target.data("s_event_time");
		var endTime = _SL.formatDate.addMin($target.data("event_time"), +1);
		
		$("[name=start_time]", $goEventForm).val(startTime);
		$("[name=end_time]", $goEventForm).val(endTime);
		$("[name=s_event_seq]", $goEventForm).val($target.data("event_seq"));
		$("[name=s_event_cate_cd]", $goEventForm).val($target.data("event_cate_cd"));
		$("[name=s_event_nm]", $goEventForm).val($target.data("event_nm"));
		$("[name=s_event_level]", $goEventForm).val($target.data("event_level"));

		
		var winName = "relEventSearchWin_" + (new Date()).getTime();		
		
		$goEventForm.attr({
			action : urlEvent,
    		target : winName,
    		method : "post"
    	}).submit();
	},
	
	chartRelEvent = function(eventLevel, sdate, edate){
		var $goEventForm = $body.find("[name=listForm]");
		$("input[type=hidden]", $goEventForm).val("");//form 초기화
		
		$("[name=start_time]", $goEventForm).val(sdate);
		$("[name=end_time]", $goEventForm).val(edate);
		$("[name=s_event_level]", $goEventForm).val(eventLevel);
		
		var winName = "relEventSearchWin_" + (new Date()).getTime();		
		
		$goEventForm.attr({
			action : urlEvent,
    		target : winName,
    		method : "post"
    	}).submit();
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig,
		chartRelEvent	: chartRelEvent
	};
}
