//# sourceURL=search_stats_top_time.js
'use strict';

_SL.nmspc("slapp.component").search_stats_top_time = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$header		= $("#componentheader_" + containerId),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),	
	$chartDiv	= $body.find(".chart-group"),
	$title		= $header.find(".area-title"),
	
	$lastPeriod		= $form.find("[name=last_period]"),
	$topCode		= $form.find("[name=top_code]"),
	
	urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlConfigMap	= gCONTEXT_PATH + "component/top_stats_mng_use_list.json",	
	urlSelect		= gCONTEXT_PATH + "component/search_stats_calc_time_total.json",
	
	default_param 	= {last_period : "10080", top_code : "", time_reference : "", start_time : "", end_time : ""},
	config_param 	= configParam,
	component_title = componentTitle,

	load = function() {
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		chartStyle = $.extend(this.chartstyles, chartStyle);
		chartStyle.paletteColors = chartStyle.unitColor;
		
		// Load 시 Cash Data 를 생성하기 위해 time_reference 값 setting
		config_param.time_reference = "";

		//설정 초기화
		initConfig();

		refresh();
	},

	refresh = function(isRefresh) {
		var refreshCallback = function(rsJson){
			// Cash Data 를 확인하기 위한 시간 정보
			config_param.time_reference = rsJson.end_time;
			
			// 로그 검색 link 연동 시간 정보
			config_param.start_time = rsJson.start_time;
			config_param.end_time = rsJson.end_time;
			
			if(rsJson.top_mng){		
				// Title 필드 표시
				var titleStr = "";
				var $lastPeriodTxt = $form.find("[name=last_period]").find("[value=" + config_param.last_period + "]");

				titleStr = rsJson.top_mng.top_name  + "/시간별 현황 합계 [" + $lastPeriodTxt.text() + "]";
				$title.text(titleStr);
			}
			
			// 차트 DATA
			var datas = [], oData = {};

			for(var i=0, len = rsJson.time_list.length; i<len; i++){
				var data = rsJson.time_list[i];
				oData = {};
				oData.label = (data.time).toString();
				oData.value = data.total;
				datas.push(oData);
				
				if(data.time == "18"){
					datas.push({
						vline : true,
						label : " 주간 ",
						dashed : '1', dashLen : '3', dashGap : '2',
						labelHAlign : "right"
					});

					datas.push({
						vline : true,
						label : " 야간 ",
						dashed : '1', dashLen : '3', dashGap : '2',
						labelHAlign : "left"
					});
				}
			}
			
			//chart draw
			if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
				$.Dashboard.chartInstance[containerId].setJSONData({
					chart : chartStyle,
					data  : datas
				});
			} else {
				FusionCharts.ready(function(){
					$.Dashboard.chartInstance[containerId] = new FusionCharts({
						type: 'area2d',
						renderAt: 'chart-container_' + containerId,
						width: '100%',
						height: 240,
						dataFormat: 'json',
						dataSource: {
							chart : chartStyle,
							data  : datas
						}
					}).render();
				});
			}
		}
		$("body").requestData(urlSelect, config_param, {callback : refreshCallback});
	},
	
	showConfig = function() {
		$lastPeriod.val(config_param.last_period);
		$topCode.val(config_param.top_code);
	},
	
	beforeSaveConfig = function(){
		config_param.last_period = $lastPeriod.val();
		config_param.top_code = $topCode.val();
	},
	
	afterSaveConfig = function() {
		refresh(true);
	},
	
	initConfig = function(){
		var initCallback = function(rsJson){
			for(var idx in rsJson.topMngUseList) {
				$("<option />")
					.val(rsJson.topMngUseList[idx].top_code)
					.text(rsJson.topMngUseList[idx].top_name)
					.appendTo($topCode);
			}
		}
		$("body").requestData(urlConfigMap,{},{callback : initCallback});
	},
	
	chartStyle = {
		"plotfillalpha" : "60",
		"showvalues":"0",
		"formatnumberscale" : "1"
	};
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig
	};
}
