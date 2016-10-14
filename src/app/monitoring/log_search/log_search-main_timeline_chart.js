'use strict';

_SL.nmspc("logsearch").mainTimelineChart = function(){
	var
	// Reference Modules
	refMng,
	refDynPaging,

	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID
		DOM : {
			//chartCntn	: ".section-chart",
			chart		: "#chartWrapper"
		},
		
		URL : {
			list		: URL_PATH + "log_search_list.json"
		},
		
		cookie : {
			isShowChartYN : "isShowChartYN"
		},
		
		chartStyle : {
			"caption": "Timeline of Rows",
			"captionFontSize": "11",
			"chartTopMargin" : "5",
			"chartBottomMargin" : "10",
			"yAxisName": "Count",
			"yAxisMaxValue" : 5,
			"paletteColors": "#468cdb",	//"#0075c2",
			"bgColor": "#f0f2f0",
			"plotBorderAlpha": "10",
			"placevaluesInside" : 0,
			"valueFontColor": "#666666",
			"showXAxisLine": "1",
			"showAlternateHGridColor": "0"
		},
		
		chartHeight : 130
	},
	
	m$ = {
		chart : null,
		charOnoffBtn : null,
	},

	mState = {
		oChart	: null,
		isShowChart : true,
		maxValue : 0,
		avgValue : 0
	},
	
	/*** Define Function ***/
	init = function() {
		refMng			= slapp.logsearch.manager;
		refDynPaging	= slapp.logsearch.dynPaging;
		
		mState.isShowChart = $.cookie(mCfg.cookie.isShowChartYN) != 'N';
		
		m$.chart 		= $(mCfg.DOM.chart);
		
		//console.log("Chart init complete.");
	},
			
	toggleChart = function() {
		if(refDynPaging.bSearched) {
			mState.isShowChart = !m$.chart.is(":visible");
			$.cookie(mCfg.cookie.isShowChartYN, mState.isShowChart ? "Y" : "N", {expires:30});
			show(mState.isShowChart);
		}
	},
	
	show = function(bShow) {
		var cur = m$.chart.is(":visible");
		if(bShow != cur) {
			if(bShow)	m$.chart.show();
			else 		m$.chart.hide();
		}
	},
	
	update = function() {
		var data = getChartData();
		mCfg.chartStyle = $.extend({}, slui.chart.chartConfig, mCfg.chartStyle);
		
		// TODO linear_scale
		//$("#linear_scale").text(DynPaging.sch_time_unit/60);//시간 단위
		
		if(mState.isShowChart) show(mState.isShowChart);
		
		if(mState.maxValue) {
			mCfg.chartStyle.yAxisMaxValue = mState.maxValue ? _SL.getChartMaxValue(mState.maxValue) : 5;
		}
		
		mCfg.chartStyle.plotSpacePercent = data.length >= 20 ? (data.length >= 60 ? 20 : 45) : 80;
		
		//console.log("Chart Data : %o", data);

		if(!FusionCharts.items["mainTimelineChart"]) {
			m$.chart.insertFusionCharts({
				id : "mainTimelineChart",
				type: 'column2d',
				width : "100%",
				height : mCfg.chartHeight,
				dataFormat : "json",
				dataSource : {
					chart : mCfg.chartStyle,
					data : data,
					styles : mCfg._styles,
					trendlines : mState.avgValue == 0 ? [] : [{
						line : [{
								startvalue: mState.avgValue,
								endvalue: "",
								color: "fda813",
								displayvalue: " ",
								tooltext : "Average : " + _SL.formatNumber(mState.avgValue),
								showontop: "1",
								thickness: "1"
						}]
					}]
				}
			});
		}
		else {
			m$.chart.updateFusionCharts({
				dataSource : {
					chart : mCfg.chartStyle,
					data : data,
					styles : mCfg._styles,
					trendlines : mState.avgValue == 0 ? [] : [{
						line : [{
								startvalue: mState.avgValue,
								endvalue: "",
								color: "fda813",
								displayvalue: " ",
								tooltext : "Average : " + _SL.formatNumber(mState.avgValue),
								showontop: "1",
								thickness: "1"
						}]
					}]
				}
			});
		} 
		
	},
	
	getChartData = function() {
		var data = [],
			sDate, eDate, hhmm,
			sumValue = 0,
			rowsPerTime = refDynPaging.getRowsPerTime(),
			rowsPerTimeLen = rowsPerTime.length, 
			bAlternative = rowsPerTimeLen >= 60,
			funcAdd = refDynPaging.isAsc() ? "push" : "unshift";

		mState.maxValue = 0; 
		mState.avgValue = 0; 
		
		$.each(rowsPerTime, function(idx, item) {
			var sDate = item.sch_start_time.substring(0, 8),
				sHHmm = item.sch_start_time.substring(8, 12),
				eDate = item.sch_end_time.substring(0, 8),
				eHHmm = item.sch_end_time.substring(8, 12),
				sTime,eTime;
			
			/*
			if(hhmm || sDate != eDate) {
				console.log("VLINE Date : " + cDate)
				data.unshift({
					vline	: "true",
					label	: _SL.formatDate(bDate, "yyyyMMdd", "MM-dd"),
					labelHAlign	: "left",
					showLabelBorder	: 1,
					color	: "000000",
					thickness : "1",
					dashed	: "1",
					dashlen	: "2",
					dashgap	: "3",
					labelPosition	: "0"
				});
			}
			*/
			sTime = _SL.formatDate(item.sch_start_time, "HH:mm");
			data[funcAdd]({
				label	: _SL.formatDate(eHHmm == "0000" ? sDate : eDate, "yyyyMMdd", "MM/dd"),
				showLabel : sHHmm == "0000" || (sDate != eDate && eHHmm != "0000") ? "1" : "0",
				value	: item.rows,
				showValue : bAlternative && (idx % 2) ? "0" : "1",
				link	: "javascript:slapp.logsearch.mainTimelineChart.openSearch('"+ item.sch_start_time + "','" + item.sch_end_time + "');",
				toolText: sTime + "~" + _SL.formatDate(item.sch_end_time, "HH:mm")
							+ ", " + _SL.formatNumber(item.rows)
			});
			
			mState.maxValue = Math.max(mState.maxValue, item.rows);
			sumValue += item.rows;
		});
		
		if(rowsPerTimeLen > 0) {
			mState.avgValue = sumValue/rowsPerTimeLen;
		}
		
		return data;
	},
	
	openSearch = function(sDt, eDt) {
		refMng.openSearch({
			start_time : sDt,
			end_time : eDt
		});
	},
	
	DUMMY = null;
	
	return {
		init : init,
		show : show,
		update : update,
		openSearch : openSearch
	};
}();
