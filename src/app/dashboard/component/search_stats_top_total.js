//# sourceURL=search_stats_top_total.js
'use strict';

_SL.nmspc("slapp.component").search_stats_top_total = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$header		= $("#componentheader_" + containerId),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),
	$list		= $body.find(".table-total"),
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
			
		// Load 시 Cash Data 를 생성하기 위해 time_reference 값 setting
		config_param.time_reference = "";
		
		//설정 초기화
		initConfig();

		refresh();
	},

	refresh = function() {
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
			
				titleStr = rsJson.top_mng.top_name  + "/전체 합계 [" + $lastPeriodTxt.text() + "]";
				$title.text(titleStr);
			}
			
			var totalCount = rsJson.total;
			var dayAvgCnt = rsJson.day_avg_cnt;
			
			var weekdayCnt1 = rsJson.weekday_cnt_1;
			var weekdayCnt1Percent;
			totalCount == 0 ? weekdayCnt1Percent = 0 : weekdayCnt1Percent = weekdayCnt1/totalCount*100;
			var weekdayCnt2 = rsJson.weekday_cnt_2;
			var weekdayCnt2Percent;
			totalCount == 0 ? weekdayCnt2Percent = 0 : weekdayCnt2Percent = weekdayCnt2/totalCount*100;
			var weekdayCnt = weekdayCnt1 + weekdayCnt2;
			var weekdayPercent;
			totalCount == 0 ? weekdayPercent = 0 : weekdayPercent = (weekdayCnt1 + weekdayCnt2)/totalCount*100;
			var weekdayAvgCnt = rsJson.weekday_avg_cnt;
			
			var weekendCnt1 = rsJson.weekend_cnt_1;
			var weekendCnt1Percent;
			totalCount == 0 ? weekendCnt1Percent = 0 : weekendCnt1Percent = weekendCnt1/totalCount*100;
			var weekendCnt2 = rsJson.weekend_cnt_2;
			var weekendCnt2Percent;
			totalCount == 0 ? weekendCnt2Percent = 0 : weekendCnt2Percent = weekendCnt2/totalCount*100;
			var weekendCnt = weekendCnt1 + weekendCnt2;
			var weekendPercent;
			totalCount == 0 ? weekendPercent = 0 : weekendPercent = (weekendCnt1 + weekendCnt2)/totalCount*100;
			var weekendAvgCnt = rsJson.weekend_avg_cnt;
			
	
			$body.find(".total_count").text(_SL.toComma(totalCount));
			$body.find(".day_avg_cnt").text(_SL.toComma(dayAvgCnt));
			
			/*<!-- 평일 -->*/
			$list.find(".weekday_cnt_1").text(_SL.toComma(weekdayCnt1));
			$list.find(".weekday_cnt_1_percent").text(_SL.formatNumber(weekdayCnt1Percent) + "%");
			$list.find(".weekday_cnt_2").text(_SL.toComma(weekdayCnt2));
			$list.find(".weekday_cnt_2_percent").text(_SL.formatNumber(weekdayCnt2Percent) + "%");
			$list.find(".weekday_cnt").text(_SL.toComma(weekdayCnt));
			$list.find(".weekday_cnt_percent").text(_SL.formatNumber(weekdayPercent) + "%");
			$list.find(".weekday_avg").text(_SL.toComma(weekdayAvgCnt));
			
			/*<!-- 주말 -->*/
			$list.find(".weekend_cnt_1").text(_SL.toComma(weekendCnt1));
			$list.find(".weekend_cnt_1_percent").text(_SL.formatNumber(weekendCnt1Percent) + "%");
			$list.find(".weekend_cnt_2").text(_SL.toComma(weekendCnt2));
			$list.find(".weekend_cnt_2_percent").text(_SL.formatNumber(weekendCnt2Percent) + "%");
			$list.find(".weekend_cnt").text(_SL.toComma(weekendCnt));
			$list.find(".weekend_cnt_percent").text(_SL.formatNumber(weekendPercent) + "%");
			$list.find(".weekend_avg").text(_SL.toComma(weekendAvgCnt));
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
		refresh();
	},
	
	initConfig = function(){
		var initCallback = function(rsJson){
			for(var idx in rsJson.topMngUseList) {
				$("<option />")
					.val(rsJson.topMngUseList[idx].top_code)
					.text(rsJson.topMngUseList[idx].top_name)
					.appendTo($topCode);
			}
		};
		$("body").requestData(urlConfigMap,{},{callback : initCallback});
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
