//# sourceURL=group_stats.js

'use strict';

_SL.nmspc("logsearch").groupStats = function(){
	var
	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			content			: "#groupStatsContent",
			chartType		: "#groupStatsChartType",
			chart			: "#groupStatsChart",
			list			: "#groupStatsList",
			form			: "#formGroupStats",
			
			total			: ".group-stats-total",
			spantime		: ".group-stats-spantime",
			
			btnExcel		: ".btn-excel"
		},
		
		URL : {
			groupStats		: URL_PATH + "group_stats.json",
			excel			: URL_PATH + "group_stats_excel.do",
			logSearch		: URL_PATH + "log_search.html"
		},
		
		chartId				: "groupStatsChartId" 
	},
	
	m$ = {
		content				: $(mCfg.DOM.content),
		chartType			: $(mCfg.DOM.chartType),
		chart				: $(mCfg.DOM.chart),
		list				: $(mCfg.DOM.list),
		form				: $(mCfg.DOM.form),
		
		total				: $(mCfg.DOM.content + " " + mCfg.DOM.total),
		spantime			: $(mCfg.DOM.content + " " + mCfg.DOM.spantime),
		btnExcel			: $(mCfg.DOM.content + " " + mCfg.DOM.btnExcel)
	},
	
	mState = {
		param	: {},
		data	: {}		// 	{strJsonResultList, totalRecord, resultList, spanTime, chartData, etcData}


	},
	
	
	/*** Define Function ***/
	init = function() {
		mState.param = _SL.serializeMap(m$.form);
		if(mState.param.group_field && !$.isArray(mState.param.group_field)) {
			mState.param.group_field = [mState.param.group_field];
			mState.param.group_field_txt = [mState.param.group_field_txt];
		}
		
		// 처리중...
		loading.show();
		
		// 그룹필드 존재할 경우만 xls 버튼 show
		
		//Bind Event
		m$.chartType.on("change", function() {
			mState.chart.chartType($(this).val());
		});
		
		m$.btnExcel.on("click", function() {
			m$.form.submit();
		});
		
		m$.list.find("tbody").on("click", "tr", function() {
			var idx = $(this).data("row_index");
			
			if(typeof idx != "undefined") openSearch(idx);
		});
		
		// 데이터 요청
		requestData();
	},
	
	requestData = function() {
		$("body").requestData(mCfg.URL.groupStats, mState.param, {callback : function(rsData, rsCd, rsMsg) {
			mState.data = rsData;
			m$.form.find("[name=strJsonResultList]").val(rsData.strJsonResultList);
			m$.form.find("[name=totalRecord]").val(rsData.totalRecord);
			
			loading.hide();
			
			output();
		}});
	},
	
	output = function() {
		// Chart
		outputChart();
		
		outputList();
		
		/*
		$(".funcFieldTooltip").tooltip({
			position: {my: "center top" },
			content: function() {
				return "로그건수:" + $(this).attr('title') + "건";
			}
		});
		*/
	},
	
	outputChart = function() {
		var chartData = mState.data.chartData;
		var chartType = m$.chartType.val();

		_chartStyle = $.extend({},slui.chart.chartConfig,_chartStyle);
		
		for (var i = 0, l = chartData.length; i < l; i++) {
			chartData[i].link = "javascript:slapp.logsearch.groupStats.openSearch('" + _SL.htmlEscape(chartData[i].rank) + "');";
		}
		
		mState.chart = new FusionCharts({
	        type: chartType,
	        width:"100%",
	        height:"280",
	        renderAt: 'groupStatsChart',
	        dataFormat: 'json',
	        dataSource: {
				chart : _chartStyle,
				data : chartData
	        }
		})
		.render();
	},
	
	outputList = function() {
		var grpFld		= mState.param.group_field;
		var grpFldTxt	= mState.param.group_field_txt;
		var bCount		= mState.param.stats_func == "count";
		var funcFieldCaption = bCount ? "건수" : mState.param.stats_func.toUpperCase() + " (" + mState.param.funcFieldNm + ")"
		var $thead		= m$.list.find("thead");
		var $tbody		= m$.list.find("tbody");
		var listData	= mState.data.resultList; 
		var grpFldLen, $tr, data;
		
		$thead.empty();
		$tbody.empty();
		
		m$.total.text(_SL.formatNumber(mState.data.totalRecord));
		m$.spantime.text(_SL.formatNumber(mState.data.spanTime/1000.0));
		
		
		if(!!grpFld) {
			//THEAD
			$tr = $("<tr>").append( $("<th>").text("순위") );

			grpFldLen = !!grpFld ? grpFld.length : 0;
			for(var i = 0; i < grpFldLen; i++) {
				$tr.append( $("<th>").text(grpFldTxt[i]) );
			}
			
			$tr
				.append($("<th>").text(funcFieldCaption))
				.append($("<th>").text("비율"));
			
			$thead.append($tr);
			
			//TBODY
			if(listData.length == 0 && !mState.data.etcData) {
				$("<tr>")
					.append( $("<td class='align-center'>").attr("colspan", grpFldLen + 3).text("There is no Search Result") )
					.appendTo($tbody);
			}
			else {
				
				for(var i = 0, l = listData.length; i < l; i++) {
					data = listData[i];
					
					$tr = $("<tr>").data("row_index", i).append( $("<td class='align-center'>").text(data.rank) );
					
					for(var j = 0; j < grpFldLen; j++) {
						$tr.append( $("<td>").text(_SL.ifEmpty(data[grpFld[j]], "-")) );
					}

					$tr
						.append( $("<td class='align-right'>").attr("title", data.total).text(bCount ? data.total : data.func_value) )
						.append( $("<td class='align-right'>").text(data.percentage) );

					$tbody.append($tr);
				}
				
				if(mState.data.etcData) {
					data = mState.data.etcData;
					
					$("<tr>")
						.append( $("<td class='align-center'>").attr("colspan", grpFldLen + 1).text(data.group_field) )
						.append( $("<td class='align-right'>").attr("title", data.total).text(bCount ? data.total : data.func_value) )
						.append( $("<td class='align-right'>").text(data.percentage) )
						.appendTo($tbody);
				}
			}
		}
		else {
			data = listData[0];
			$thead.append( $("<tr>").append($("<th>").text(funcFieldCaption)) );
			$tbody.append( $("<tr>").append($("<td class='align-center'>").attr("title", !data ? "" : data.total).text(!data ? "There is no Search Result" : bCount ? data.total : data.func_value)) );
		}
	},
	
	openSearch = function(idx) {
		var query = mState.param.query;
		var flds = mState.param.group_field;
		var data = mState.data.resultList[idx];
		var fld;
		
		if(mState.param.group_field != ""){
			if(query != "") query = "(" + query + ")";
			
			for(var i = 0; i < flds.length; i++) {
				fld = flds[i];
				
				if (query != "") query += " AND ";
				
				if(data[fld] == "-")
					query += "NOT " + fld + ":*";
				else
					query += fld + ":" + _SL.luceneValueEscape(data[fld]);
			}
		}
		
		$("<form>")
			.attr({
				target : "logSearchWin_" + (new Date()).getTime(),
				action : mCfg.URL.logSearch,
				method : "post"
			})
			.append( $("<input type='hidden' name='start_time'>").val(mState.param.start_time) )
			.append( $("<input type='hidden' name='end_time'>").val(mState.param.end_time) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(query) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	},
	
	onClickExcelBtn = function() {
		m$.form.action				= mCfg.URL.excel;
		m$.form.strJsonResultList	= JSON.stringify(jsonResultList);
		m$.form.submit();
	},
	
	_chartStyle = {
		"showBorder": "1"
	},
	
	DUMMY;
	
	init();
	
	return {
		openSearch	: openSearch
	};
}();
