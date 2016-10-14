//# sourceURL=time_stats.js

'use strict';

_SL.nmspc("logsearch").groupStats = function(){
	var
	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			content			: "#timeStatsContent",
			chartType		: "#timeStatsChartType",
			chart			: "#timeStatsChart",
			form			: "#formTimeStats",
			
			spantime		: ".time-stats-spantime"
		},
		
		URL : {
			timeStats		: URL_PATH + "time_stats.json",
			logSearch		: URL_PATH + "log_search.html"
		},
		
		chartId				: "timeStatsChartId" 
	},
	
	m$ = {
		content				: $(mCfg.DOM.content),
		chartType			: $(mCfg.DOM.chartType),
		chart				: $(mCfg.DOM.chart),
		form				: $(mCfg.DOM.form),
		
		spantime			: $(mCfg.DOM.content + " " + mCfg.DOM.spantime)
	},
	
	mState = {
		param	: {},
		data	: {}		// 	{resultMap, spanTime, chartData, etcData}
	},
	
	
	/*** Define Function ***/
	init = function() {
		mState.param = _SL.serializeMap(m$.form);
		if(mState.param.series_vals && !$.isArray(mState.param.series_vals)) {
			mState.param.series_vals = [mState.param.series_vals];
		}
		
		// 처리중...
		loading.show();
		
		//Bind Event
		m$.chartType.on("change", function() {
			mState.chart.chartType($(this).val());
		});
		
		// 데이터 요청
		requestData();
	},
	
	requestData = function() {
		$("body").requestData(mCfg.URL.timeStats, mState.param, {callback : function(rsData, rsCd, rsMsg) {
			mState.data = rsData;
			
			loading.hide();
			
			outputChart();
		}});
	},
	
	outputChart = function() {
		m$.spantime.text(_SL.formatNumber(mState.data.spanTime/1000.0));
		
		var dataset = [],categories=[], category = [], oData = {}, maxValue = 0, seriesName, idx, idx2;
		var resultMap = mState.data.resultMap;
		var cateRst = resultMap.categories;
		var seriesNameArr = mState.param.series_vals || [];
		//console.log("outputChart");
		seriesNameArr.push("_etc");
		
		_chartStyle = $.extend({},slui.chart.chartConfig,_chartStyle);
		
		for(idx in cateRst){
			category.push({label : _SL.formatDate(cateRst[idx], "HH:mm")});
			
			if( idx != cateRst.length-1 ){//날짜 경계선 삽입
				if( (cateRst[idx]).substring(0,8) != (cateRst[Number(idx)+1]).substring(0,8) ){
					category.push({
						vLine : "true",
						dashed:"1",
						dashlen:2,
						dashgap:3
					});
				}
			}
		}
		categories.push({category : category});
		
		var tData, valueArr, nextIdx, startTime, endTime;
		
		for(idx in seriesNameArr){
			seriesName = seriesNameArr[idx];
			
			tData = { seriesname : seriesName, data :[] };
			valueArr = resultMap[seriesName];
			
			for(idx2 in valueArr){
				nextIdx = Number(idx2) + 1;
				startTime,endTime;
				
				startTime = cateRst[idx2];
				endTime = cateRst[nextIdx];
				
				if(nextIdx == valueArr.length) endTime = mState.param.end_time;
				
				tData.data.push({
					value	: valueArr[idx2],
					toolText: seriesName + ", "+ _SL.formatDate(cateRst[idx2], "yyyy-MM-dd HH:mm") + ", " +_SL.formatNumber(valueArr[idx2]),
					link	:"javascript:slapp.logsearch.groupStats.openSearch('"+ cateRst[idx2] +"','"+ endTime +"','"+ _SL.javascriptEscape(seriesNameArr[idx]) +"');"
				});
				
				maxValue = Math.max(valueArr[idx2], maxValue);
			}
			
			if(seriesName == "_etc") {
				if(mState.param.series_field != "" && mState.param.series_val_etc != "Y") continue;
				
				tData.seriesname = mState.param.series_field == "" ? "[전체]" : "[기타]";
			}
			
			dataset.push(tData);
		}
		 
		if(mState.param.stats_func != "count"){ //Y축 이름 설정
			_chartStyle.yAxisName = mState.param.stats_func.toUpperCase() + "(" + mState.param.func_field_nm + ")";
		}
		
		var trendlines = [];
		if(mState.data.avg_per_time > 0) {
			trendlines = [{
				line : [{
						startvalue: mState.data.avg_per_time,
						endvalue: "",
						color: "fda813",
						displayvalue: " ",
						tooltext : "Average : " + _SL.formatNumber(mState.data.avg_per_time),
						showontop: "1",
						thickness: "1"
				}]
			}];
		}
		

		_chartStyle.yAxisMaxValue = _SL.getChartMaxValue(maxValue);//Y축 최대값 설정

		mState.chart = new FusionCharts({
			type: m$.chartType.val(),
			width:"100%",
			height:"250",
			renderAt: 'timeStatsChart',
			dataFormat: 'json',
			dataSource: {
				chart : _chartStyle,
				categories : categories,
				dataset : dataset,
				trendlines : trendlines
			}
		})
		.render();
	},
	
	openSearch = function(startTime, endTime, seriesName) {
		var q = mState.param.query;
		var fld = mState.param.series_field;
		
		if(fld != "") {
			if(seriesName == "_etc") {
				q = (q == "" ? "*:*" : "(" + q + ")") + " NOT ";
				q += seriesFld + ":(" + mState.param.series_vals.join(" ") + ")"; 
			}
			else {
				if(q != "") q = "(" + q + ") AND ";
				q += fld + ":" + _SL.luceneValueEscape(seriesName);
			} 
		}
		
		$("<form>")
			.attr({
				target : "logSearchWin_" + (new Date()).getTime(),
				action : mCfg.URL.logSearch,
				method : "post"
			})
			.append( $("<input type='hidden' name='start_time'>").val(startTime) )
			.append( $("<input type='hidden' name='end_time'>").val(endTime) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(q) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	},
	
	_chartStyle = {
		"maxLabelWidthPercent" :'35',
		"showBorder": "1",
		"showLimits" : "1",
		"yAxisMaxValue" : "0",
		"yAxisName" : "Count"
	},
	
	DUMMY;
	
	init();
	
	return {
		openSearch	: openSearch
	};
}();
