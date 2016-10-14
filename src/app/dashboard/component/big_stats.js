//# sourceURL=big_stats.js

'use strict';

_SL.nmspc("component").big_stats = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	urlLastBigCode	= gCONTEXT_PATH + "component/last_complete_big_code.json",
	urlItemInfo		= gCONTEXT_PATH + "component/big_stats_item_info.json",
	urlItemList		= gCONTEXT_PATH + "component/big_stats_item_list.json",
	urlFieldList	= gCONTEXT_PATH + "component/big_stats_field_list.json",
	urlTimeline		= gCONTEXT_PATH + "analysis/big_stats_rs_timeline.json",
	urlList			= gCONTEXT_PATH + "analysis/big_stats_rs_list.json",
	urlLogSearch	= gCONTEXT_PATH + "monitoring/log_search.html",
	
	config_param = configParam,
	component_title = componentTitle,
	isOpenConfig = false,
	processing = false,
	
	admin_config = {
		//max_stats_row : _SL.ifNull(slapp.component.my_log_search.admin_config.max_stats_row*1, 10000),
		//max_period_min : _SL.ifNull(slapp.component.my_log_search.admin_config.max_period_min*1, 60)
	},
	
	defaultOptions = {
		view_type : "L",
		chart_height : 180,
		list_height : 150,
		order_by : "DESC",
		series_rows : 10,
		rows : 10
	},
	
	options = {
		//delay			: 1
	},
	
	m$ = {
		body		: $("#componentbody_" + containerId),
		chart		: $("#chart_" + containerId),
		logTable	: $("#list_table_" + containerId),
		config		: $("#config_" + containerId),
		form		: $("#config_" + containerId + " form")
	},
	
	mState = {
		oChart			: null,
		DatasetList		: [],
		dataList		: [],
		FieldList		: [],

		lastBigCode		: 0,
		bMultiGroup 	: false,		
		bChangeConfig	: false,		// Config 변경 여부
		bInitItemInfo	: false,		// Item 초기화되었는지 여부
		bUserOnChange	: false
	},
	
	ctxData = _SL.nmspc("CONTEXT_DATA"),
	
	CHART_TYPES = {
		A : { type : "area2d",		height : 180 },
		MA :{ type : "msarea",		height : 180 },
		B : { type : "bar2d",		height : 180 },
		MB :{ type : "msbar2d",		height : 180 },
		C : { type : "column2d",	height : 180 },
		MC :{ type : "mscolumn2d",	height : 180 },
		L : { type : "line",		height : 180 },
		ML :{ type : "msline",		height : 180 },
		S : { type : "column2d",	height : 180 },
		MS :{ type : "stackedcolumn2d",	height : 180 },
		P : { type : "pie3d",		height : 180 }
	},
	
	load = function() {
		gDFD.fldToCodes.ready();
		
		this.config_param = config_param = $.extend({}, defaultOptions, config_param);
		
		_chartStyle = $.extend(this.chartstyles, _chartStyle);
		
		_createChart(CHART_TYPES["MA"].type);
		
		// UI 설정
		$(".dnd_field_pannel>ul", m$.form).sortable({
			opacity : 0.5,
			items : "li:not(.ui-state-disabled)",
			connectWith:".dnd_field_pannel>ul",
		});
		
		$(".dnd_field_pannel>ul>li", m$.form).disableSelection();
		
		$("[name=item_key]", m$.form)
/*		.chosen({
			search_contains : true,			
			width:"100%",
			placeholder_text_single :"[선택하세요]"
		})*/
		.off("change").on("change", function(e) {
			_onChangeItem($(":selected", this).text(), $(this).val());
		});
		
		refresh();
	},
	
	refresh = function() {
		if(isOpenConfig || processing) return; 
		
		if(!config_param.schedule_id) return;
		
		var dfdRefresh = $.Deferred();
		
		// Item 초기화
		if(!mState.bInitItemInfo && config_param.schedule_id && config_param.item_seq) {
			// Item 초기화
			dfdRefresh = _getDfdInitItemInfo(config_param.schedule_id, config_param.item_seq);
		}
		else {
			dfdRefresh.resolve(config_param.schedule_id);
		}
		
		// 최근 BigCode 조회 후 출력
		dfdRefresh.done(function() {
			_getDfdLastBigCode().done(_refresh);
		});
	},
	
	// 초기 데이타(schedule_id.last_big_code의 Dataset & Field) Load
	_getDfdInitItemInfo = function(scheduleId, itemSeq) {
		var dfd = $.Deferred();
		
		// Item 초기화
		$("body").requestData(urlItemInfo, { schedule_id : scheduleId, item_seq : itemSeq }, {callback : function(rsJson) {
			//console.log("_getDfdInitItemInfo : %o", rsJson);
			
			if(rsJson) {
				mState.bInitItemInfo = true;
				
				if(!rsJson.DatasetList) return;
				
				mState.DatasetList	= rsJson.DatasetList;
				mState.FieldList	= rsJson.FieldList;
				
				_initConfig();
				
				dfd.resolve(rsJson);
			}
		}});
		
		return dfd;
	},
	
	_getDfdLastBigCode = function() {
		var dfd = $.Deferred();
		//console.log("getDfdLastBigCode called...");
		
		$("body").requestData(urlLastBigCode, {schedule_id : config_param.schedule_id}, {callback : function(rsData) {
			//console.log("getDfdLastBigCode rsData : %o", rsData);
			dfd.resolve(rsData);
		}});
		
		return dfd;
	},
	
	// Load 또는 설정 변경 후 config_param에 따른 초기화 처리
	_initConfig = function(that) {
		var cfgParam = config_param;
		var fldList = mState.FieldList;
		var fldLen = fldList.length;
		
		// Timeline이고 검색 Dataset일 경우 검색조건 설정
		var prefix = ["start", "end"];
		
		if(cfgParam.view_type == "T") {
			if(!cfgParam.sub_view_type) cfgParam.sub_view_type = "L";
			
			if(fldList[0].set_type == "S") {
				for(var i; i < prefix.length; i++) {
					if(!cfgParam[prefix[i] + "_time"]) {
						cfgParam[prefix[i] + "_time"] = fldList[0]["sch_" + prefix[i] + "_time"];
					}
				}
			}
		}
		
		// 항목,범례 필드 Index 설정
		if(!cfgParam.category_field_index) {
			cfgParam.category_field_index = [];
			cfgParam.category_field_index.push(0);
		}
		if(!cfgParam.series_field_index) {
			cfgParam.series_field_index = [];
			if(fldLen > 2) cfgParam.series_field_index.push(1);
		}
		
		_createChart(CHART_TYPES[_getChartType()].type);
	},
	
	_createChart = function(chartType) {
		if(typeof chartType =='string' && chartType.indexOf('area')!=-1){
			_chartStyle.plotfillalpha = '60';
		}

		var oChart = mState.oChart;
		
		if (!oChart) {
			//chart draw
			FusionCharts.ready(function(){
				$.Dashboard.chartInstance[containerId] =  mState.oChart = new FusionCharts({
					type: chartType,
					renderAt: "chart_" + containerId,
					width: '100%',
					height: config_param.chart_height,
					dataFormat: 'json',
					dataSource: {
						chart : _chartStyle,
						data : []
					}
				}).render();
			});
		} else {
			//FusionCharts.items[containerId + "_chart_id"].chartType(chartType);
			//FusionCharts.items[containerId + "_chart_id"].resizeTo("100%", config_param.chart_height);
			oChart.chartType(chartType);
			oChart.resizeTo("100%", config_param.chart_height);
		}
	},
	
	_refresh = function(bigCode) {
		//console.log("_refresh big_code : " + bigCode);
		var cfgParam = config_param;
		var fldList = mState.FieldList;
		var strUrl, nMode;
		
		//현재 화면 표시된 bigCode와 동일하고 config 변경이 안될 경우 return;
		if(!bigCode || mState.DatasetList.length == 0) return;
		if(mState.last_big_code == bigCode && mState.bChangeConfig == false) return;
		
		mState.last_big_code = cfgParam.big_code = bigCode;
		
		if(mState.bChangeConfig) {
			_createChart(CHART_TYPES[_getChartType()].type);
			mState.bChangeConfig = false;
		}
		
		var categoryFieldList = _getCategoryFieldList();
		var totalAvgGroupFieldList = [];
		
		if(cfgParam.view_type == "T") {
			totalAvgGroupFieldList = [].concat(categoryFieldList);
			
			if(cfgParam.series_field_index.length > 0 && cfgParam.sub_view_type != "S") {
				totalAvgGroupFieldList = totalAvgGroupFieldList.concat(_getSeriesFieldList());
			}
			
			strUrl = urlTimeline;
			nMode = 1;
		}
		/*
		else if (this.config_param.view_type == "R1" || this.config_param.view_type == "R2") {
			strUrl = "big_stats_rs_list.json";
			nMode = 9;
		}*/
		else {
			if(cfgParam.view_type != "P") {
				totalAvgGroupFieldList = [].concat(categoryFieldList);
				
				if(cfgParam.series_field_index.length > 0 && cfgParam.view_type != "S") {
					totalAvgGroupFieldList = totalAvgGroupFieldList.concat(_getSeriesFieldList());
				}
			}
			
			strUrl = urlList;
			nMode = 2;
		}
		
		var param = $.extend({}, config_param,{
			schedule_id		: config_param.schedule_id,
			item_seq		: config_param.item_seq,
			category_field	: categoryFieldList,
			series_field	: _isMultiSeries() ? _getSeriesFieldList() : [],
			category_field_nm : _getCategoryOrgFieldList(),
			series_field_nm	: _isMultiSeries() ? _getSeriesOrgFieldList() : [],
			dt_func			: fldList[0].func,
			func			: fldList[fldList.length-1].func,
			total_group_field : totalAvgGroupFieldList 
		});
		
		$("body").requestData(strUrl, param, {callback : function(rsData, rsCd, rsMsg) {
			output(nMode, rsData);
		}});
	},
	
	_getCategoryFieldList = function() {
		var list = [];
		var listIdx = config_param.category_field_index;
		
		for(var i = 0; i < listIdx.length; i++) {
			list.push("field_value" + (listIdx[i] + 1));
		}
		
		return list;
	},
	
	_getCategoryOrgFieldList = function() {
		var list = [];
		var listIdx = config_param.category_field_index;
		
		for(var i = 0; i < listIdx.length; i++) {
			list.push(mState.FieldList[listIdx[i]].field_nm);
		}
		
		return list;
	},
	
	_getSeriesFieldList = function() {
		var list = [];
		var listIdx = config_param.series_field_index;
		
		for(var i = 0; i < listIdx.length; i++) {
			list.push("field_value" + (listIdx[i] + 1));
		}
		
		return list;
	},
	
	_getSeriesOrgFieldList = function() {
		var list = [];
		var listIdx = config_param.series_field_index;
		
		for(var i = 0; i < listIdx.length; i++) {
			list.push(mState.FieldList[listIdx[i]].field_nm);
		}
		
		return list;
	},
	
	_isMultiSeries = function() {
		if(config_param.series_field_index.length > 0 && ("P" != config_param.view_type))
			return true;
		
		return false;
	},
	
	output = function(pMode, pData) {
		//console.log("output pMode : %o, pData : %o", pMode, pData);
		
		$("h5", m$.body).text(config_param.item_nm);
		
		if(pMode == 1) {
			mState.dataList = pData.list;
			
			outputTimelineChart(pData.list, pData.totalAvg);
			outputList(pData.list);
		} else if(pMode == 2) {
			mState.dataList = pData.list;

			outputChart(pData.list, pData.totalAvg);
			outputList(pData.list);
		}
		/*
		else if(pMode == 9) {
			this.dataList = pData.list;
			
			this.outputRChart(pData.list, pData.totalAvg);
			this.outputList(pData.list);
		}
		*/
	},
	
	outputTimelineChart = function(dataList, totalAvg) {
		outputChart(dataList, totalAvg);
	},
	
	outputChart = function(dataList, totalAvg) {
		m$.chart.show();
		//$(".r_chart_container", this.$element).hide();
		
		var dataSource = $.extend(_getChartData(dataList || []), { chart : _chartStyle });
		
		if(totalAvg) {
			$.extend(dataSource, { 
				trendlines : [{
					line : [{
							startvalue: totalAvg,
							endvalue: "",
							color: "fda813",
							displayvalue: " ",
							tooltext : "Average : " + _SL.formatNumber(totalAvg),
							showontop: "1",
							thickness: "1"
					}]
				}]
			})
		}
		//console.log("chartType : %o", chartType);
		//console.log("dataSource : %o", dataSource);
		//console.log("chart : %o", this.$chartContainer);
		
		//var oChart = FusionCharts.items[containerId + "_chart_id"];
		if(mState.oChart) mState.oChart.setChartData(dataSource, "json");
	},
	
	_getChartType = function() {
		var chartType = config_param.view_type == "T" ? config_param.sub_view_type : config_param.view_type;
		
		if(_isMultiSeries()) {
			chartType = "M" + chartType;
		}
		
		return chartType;
	},
	
	_getChartData = function (dataList) {
		if(!dataList) dataList = [];
		
		var	cField = [], sField = [], allField;
		
		//console.log("category_field_index : %o", config_param.category_field_index);
		for(var i = 0; i < config_param.category_field_index.length; i++) {
			cField.push(mState.FieldList[config_param.category_field_index[i]]);
		}
		var chartDataSource = {}, seriesMap = {}, categoryIndex = {}, categoryList = [], nLen;
		
		if(_isMultiSeries()) {
			for(var i = 0; i < config_param.series_field_index.length; i++) {
				sField.push(mState.FieldList[config_param.series_field_index[i]]);
			}
			
			chartDataSource = {
				categories : [{category:[]}],
				dataset : []
			};
		}
		else {
			chartDataSource = {data : []}
		}
		
		allField = cField.concat(sField);
		
		// Dataset 정의
		//nLen = Math.min(dataList.length, 1440);
		nLen = dataList.length;
		
		var data, tData, values, labels, toolText, oField, fldVal, sFldVal;
		for(var i = 0; i < nLen; i++) {
			data = dataList[i];
			
			tData = {};
			values = [];
			labels = [];
			toolText = [];
			
			if(!_isMultiSeries()) {
				for(var j = 0; j < cField.length; j++) {
					oField = cField[j];
					fldVal = getFieldValue(data, oField);
					
					labels.push(getFieldFormatValue(fldVal, oField, true));
					toolText.push(getFieldFormatValue(fldVal, oField));
				}
				
				tData.label = labels.join("/");
				toolText = [toolText.join("/")];
				toolText.push(_SL.toComma(data.func_value));
				tData.toolText = toolText.join(", ");
				tData.value = data.func_value;
				tData.link = _getLinkUrl(i, cField);
				
				chartDataSource.data.push(tData);
			} else {
				for(var j = 0; j < cField.length; j++) {
					oField = cField[j];
					fldVal = getFieldValue(data, oField);
					
					values.push(fldVal);
					labels.push(getFieldFormatValue(fldVal, oField, true));
					toolText.push(getFieldFormatValue(fldVal, oField));
				}
				tData.value = values.join("/");
				tData.label = labels.join("/");
				tData.toolText = toolText.join("/");
				
				labels = [], toolText = [];
				for(var j = 0; j < sField.length; j++) {
					oField = sField[j];
					fldVal = getFieldValue(data, oField);
					
					labels.push(getFieldFormatValue(fldVal, oField, true));
					toolText.push(getFieldFormatValue(fldVal, oField));
				}
				sFldVal = labels.join("/");
				
				if(!seriesMap[sFldVal]) {
					seriesMap[sFldVal] = [];
				}
				
				if(typeof categoryIndex[tData.value] == "undefined") {
					categoryIndex[tData.value] = categoryList.length;
					categoryList.push({label : tData.label, toolText : tData.toolText});
				}
				
				seriesMap[sFldVal][categoryIndex[tData.value]] = {value : data.func_value, link : _getLinkUrl(i, allField)};
			}
		}
		
		if(_isMultiSeries()) {
			chartDataSource.categories = [ {category : categoryList} ];
			
			for(var oKey in seriesMap) {
				// TODO 0 채우기
				chartDataSource.dataset.push({seriesname : oKey, data : seriesMap[oKey]});
			}
			
			//console.log("chartDataSource : %s", JSON.stringify(chartDataSource));
		}
		
		return chartDataSource;
	},
	
	outputList = function(dataList) {
		var $tr, viewFldList, fldLen,
		cfgParam = config_param,
		$thead = m$.logTable.find("thead").empty(),
		$tbody = m$.logTable.find("tbody").empty();

		if(!dataList) dataList = [];

		viewFldList = _getViewFieldList();
		fldLen = viewFldList.length;
		
		// 제목 추가
		$tr = $("<tr>");
		
		for(var i = 0; i < fldLen; i++) {
			$tr.append("<th>"+getFieldCaption(viewFldList[i])+"</th>");
		}
		$tr.appendTo($thead);
		
		if(dataList.length == 0) {
			$tbody.append('<tr><td colspan="'+fldLen + 1+'">There is no data.</td></tr>');
		} else {
			var data, field, tCapKey, $span, fldVal, maxLen = config_param.wsize * 70;
			
			for(var i = 0; i < dataList.length; i++) {
				data = dataList[i];
				
				$tr = $("<tr>");
				 
				for(var j = 0; j < fldLen; j++) {
					field = viewFldList[j];
					fldVal = getFieldFormatValue(getFieldValue(data, field), field);
					$span = $("<span>").attr("title", fldVal);
					
					if(fldVal && fldVal.length > maxLen) {
						$span.text(fldVal.substring(0, maxLen - 3) + "...");
					} 
					else {
						$span.text(fldVal);
					}
					
					$tr.append(
						$("<td>").append(_get$Link(i, isFuncField(field) ? viewFldList : field, $span))
					);
				}
				
				$tr.appendTo($tbody);
			}
		}
	},
	
	_getViewFieldList = function() {
		var listIdx = config_param.category_field_index;
		var fieldList = mState.FieldList;
		var viewFldList = [];
		
		for(var i = 0; i < listIdx.length; i++) {
			viewFldList.push(fieldList[listIdx[i]]);
		}
		if(_isMultiSeries()) {
			listIdx = config_param.series_field_index;
			for(var i = 0; i < listIdx.length; i++) {
				viewFldList.push(fieldList[listIdx[i]]);
			}
		}
		viewFldList.push(fieldList[fieldList.length - 1]);	// 집계필드
		
		return viewFldList;
	},
	
	_get$Link = function(dataIdx, fields, $txt) {
		var strUrl = _getLinkUrl(dataIdx, fields);
		
		return strUrl == null ? $txt : $("<a>").attr('href',strUrl).append($txt);
	},
	
	// fields가 배열일 경우 통계필드 Link
	_getLinkUrl = function(dataIdx, fields) {
		var field, setSeq = 0, fldSeq = 0, bLink = false;
		
		if($.isArray(fields)) {
			fldSeq = -1;	// FuncField
		}
		else {
			fldSeq = fields.field_seq;
			fields = [fields];
		}
		
		for(var i = 0; i < fields.length; i++) {
			if(isFuncField(fields[i])) continue;
			
			if(setSeq == 0) {
				setSeq = fields[i].set_seq;
				
				if(mState.DatasetList[setSeq - 1].set_type == "S") {
					bLink = true;
				}
				else {
					bLink = false;
					break;
				}
			}
			else if(setSeq != fields[i].set_seq) {
				bLink = false;
				break;
			}
		}

		return bLink ? "javascript:$.Dashboard.componentInstance['" + containerId + "'].goLogSearch(" + dataIdx + "," + fldSeq + ")" : null;
	},
	
	goLogSearch = function(dataIdx, fldSeq) {
		var
			filterField,
			dataList = mState.dataList,
			viewFieldList = _getViewFieldList();
		
		// isFuncField일 경우 viewFieldList를 조건으로 Search
		if(fldSeq == -1) {
			filterField = viewFieldList.slice(0, viewFieldList.length - 1);
		}
		// isFuncfield 아닌 경우 현재 field의 조건으로 Search
		else {
			for(var i = 0; i < viewFieldList.length; i++) {
				if(viewFieldList[i].field_seq == fldSeq) {
					filterField = [viewFieldList[i]];
					break;
				}
			}
		}
		
		if(!filterField) {
			console.log("Error item_seq : %s, dataIdx : %s, fldSeq : %s", this.item_seq, dataIdx, fldSeq);
			return;
		}
		
		var dataSetInfo = 	mState.DatasetList[filterField[0].set_seq - 1];
		var data		=	mState.dataList[dataIdx];
		var schPeriod	= null;
		var strQry		= "(" + dataSetInfo.sch_query + ")";
		var fldNm, fldVal;
		
		// 검색 Query 설정
		for(var i = 0; i < filterField.length; i++) {
			fldNm = filterField[i].field_nm;
			fldVal = getFieldValue(data, filterField[i]);
			
			if(fldNm == "eqp_dt") {
				schPeriod = _getSearchPeriod(data, filterField[i]);
				continue;
			}
			
			if(fldVal == "-") 
				strQry += " NOT " + fldNm + ":*";
			else
				strQry += " AND " + fldNm + ":" + _SL.luceneValueEscape(fldVal);
		}
		
		// eqp_dt가 없을 경우 dataset에서 start_time, end_time 설정
		if(schPeriod == null) schPeriod = _getSearchPeriodFromDataset(filterField[0].set_seq);
		
		if(data.netJoinCd) {
			//$("[name=network_join_cd]", $frm).val(data.client_group_cd);
		}
		
		var $form = $("<form>").attr({
			target : "logSearchWin_" + (new Date()).getTime(),
			action : urlLogSearch,
			method : "post"
		});

		$form
			.append( $("<input type='hidden' name='start_time'>").val(schPeriod.start_time) )
			.append( $("<input type='hidden' name='end_time'>").val(schPeriod.end_time) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(strQry) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	},
	
	_getSearchPeriodFromDataset = function(setSeq) {
		var dataSet = mState.DatasetList[setSeq - 1];
		
		if(dataSet.set_type == 'S') {
			return {start_time : dataSet.sch_start_time + "00", end_time : dataSet.sch_end_time + "00"};
		}
		else {
			console.log("Error _getSearchPeriodFromDataset > DataSet Type is %s", dataSet.set_type);
			return null;
		}
	},
	
	_getSearchPeriod = function(data, timeField) {
		//console.log("_getSearchPeriod Data : %o, timeField : %o", data, timeField);
		var timeInfo = {start_time : getFieldValue(data, timeField), end_time : ""};
		
		switch(timeField.func) {
		case "8" :
			timeInfo.start_time += "0000";
			timeInfo.end_time = _SL.formatDate.addDay(timeInfo.start_time, 1);
			break;
		case "10" :
			timeInfo.start_time += "00";
			timeInfo.end_time = _SL.formatDate.addHour(timeInfo.start_time, 1);
			break;
		case "11" :
			timeInfo.start_time = timeInfo.start_time + "0";
			timeInfo.end_time = _SL.formatDate.addMin(timeInfo.start_time, 10);
			break;
		case "12" :
			timeInfo.end_time = _SL.formatDate.addMin(timeInfo.start_time, 1);
			break;
		default :
			//console.log("Error _getSearchPeriod > field_nm : %s, func : %s", timeField.field_nm, timeField.func);
			return null;
		}
		//console.log("timeInfo : %o", timeInfo);
		
		return timeInfo;
	},
	
	/*** Config 관련 START ***/
	showConfig = function() {
		//console.log("big_stats.showConfig");
		mState.bUserOnChange = false;
		
		_SL.setDataToForm(config_param, m$.form);
		
		_setItemToSelBox();
	},
	
	validateConfig = function() {
		if(!_SL.validate(m$.form)) return;
		
		var $schForm = $('.search-fieldset', m$.form);
		
		var cList = $(".dnd_category>ul", m$.form).sortable("toArray", {attribute : "field_index"});
		var sList = $(".dnd_series>ul", m$.form).sortable("toArray", {attribute : "field_index"});
		
		var viewType = $("[name=view_type]", m$.form).val();
		
		if(viewType == "T") {
			if($("[name=startDay]", $schForm).val() + $("[name=startHour]", $schForm).val() >= $("[name=endDay]", $schForm).val() + $("[name=endHour]", $schForm).val() ) {
				_alert("검색 시작시간이 종료시간보다 커야 합니다.", {onAgree : function() {
					$("[name=endHour]", $schForm).focus();
				}});
				return false;
			}
		}
		else if(cList.length == 0) {
			_alert("항목필드를 선택하세요.");
			return false;
		}
		
		/*
		if(viewType == "R1") {
			if(cList.length != 1) {
				_alert("R 차트는 항목필드를 하나만 선택하세요.");
				return false;
			}
			if(sList.length != 0) {
				_alert("R Word 차트는 범례필드를 선택할 수 없습니다.");
				return false;
			}
		}
		else if(viewType == "R2") {
			if(cList.length != 1) {
				_alert("R 차트는 항목필드를 하나만 선택하세요.");
				return false;
			}
			
			if(sList.length != 1) {
				_alert("R 방사 차트는 범례필드를 하나 선택하세요.");
				return false;
			}
		}
		*/
		return true;
	},
	
	beforeSaveConfig = function() {
		// 항목, 범례 필드 Config에 설정
		var cfgParam = _SL.serializeMap(m$.form);
		var fldList = mState.FieldList;
		var fldLen = fldList.length;
		
		var itemKeyList = cfgParam.item_key.split("_");
		cfgParam.schedule_id = parseInt(itemKeyList[0]);
		cfgParam.item_seq = parseInt(itemKeyList[1]);
		
		var cList = $(".dnd_category>ul", m$.form).sortable("toArray", {attribute : "field_index"});
		var sList = $(".dnd_series>ul", m$.form).sortable("toArray", {attribute : "field_index"});
		
		cfgParam.category_field_index = [];
		
		// Timeline일 경우 index:0은 sortable 안돼 무조건 추가
		if(cfgParam.view_type == "T") cfgParam.category_field_index.push(0);
		
		for(var i = 0; i < cList.length; i++) {
			cfgParam.category_field_index.push(parseInt(cList[i]));
		}
		
		cfgParam.series_field_index = [];
		for(var i = 0; i < sList.length; i++) {
			cfgParam.series_field_index.push(parseInt(sList[i]));
		}
		
		// 기간 설정
		var str = $("[name=startDay]", m$.form).val();
		
		if(str && str != "") {
			cfgParam.start_time = $("[name=startDay]", m$.form).val() + $("[name=startHour]", m$.form).val();
			cfgParam.end_time = $("[name=endDay]", m$.form).val() + $("[name=endHour]", m$.form).val();
		}
		
		/*
		if(cfgParam.view_type == "R1" || cfgParam.view_type == "R2") {
			if(oBfCfg.view_type != cfgParam.view_type
					|| !this.isSameArrayValue(oBfCfg.category_field_index, cfgParam.category_field_index) 
					|| !this.isSameArrayValue(oBfCfg.series_field_index, cfgParam.series_field_index)) {
				cfgParam.RChartStatus = 1;
			}
		}
		*/
		if(config_param.item_key != cfgParam.item_key) mState.bInitItemInfo = false;
		mState.bChangeConfig = true;
		
		this.config_param = config_param = cfgParam;
	},
	
	_setItemToSelBox = function() {
		var	cfgParam = config_param,
			cfgItemKey = !cfgParam.schedule_id ? "" : cfgParam.schedule_id + "_" + cfgParam.item_seq;
		//console.log("config item key : " + cfgItemKey);
		
		var __setCtxDataToSelBox = function() {
			var statsData = null, oCurRow, strStatsNm, curScheduleId, strItemKey, bActive;
			var itemData = ctxData.BigStatsItemData;
			var $itemSel = m$.form.find("[name=item_key]");
			var $curGroup;
			
			$itemSel
				.empty()
				.append($("<option>").text("[선택하세요]").val(""));

			for(var idx in itemData) {
				oCurRow = itemData[idx];
				strItemKey = oCurRow.schedule_id + "_" + oCurRow.item_seq
				
				if(oCurRow == null || oCurRow.schedule_id != curScheduleId) {
					strStatsNm = oCurRow.stats_nm;
					curScheduleId = oCurRow.schedule_id;
					$curGroup = $("<optgroup>").attr("label", strStatsNm);
					$itemSel.append($curGroup);
				}
				
				$curGroup.append($("<option>").text(oCurRow.item_nm).val(strItemKey));
			}
			
			$itemSel.val(cfgItemKey);
			$itemSel.trigger("change");
		};
		
		if(!ctxData.BigStatsItemData) {
			// 내 분석항목 가져오기
			$("body").requestData(urlItemList, {}, {callback : function(rsJson) {
				var statsData = null,
					oCurRow, strStatsNm, strItemKey, bActive;
				
				// 필드 트리 데이타 정의
				ctxData.BigStatsItemData = rsJson;
				
				__setCtxDataToSelBox();
			}});
		}
		else {
			__setCtxDataToSelBox();
		}
	},
	
	_onChangeItem = function(title, key) {
		//console.log("_onChangeItem called.");
		//console.log("title : %o, key : %o", title, key);
	
		var cfgParam = config_param;
		var curItemKey = cfgParam.schedule_id + "_" + cfgParam.item_seq;
		var itemData = _findItemFromTree(key);
		
		if(!itemData) {
			_appendDndFields("", []);
			_genSearchField([]);
			return;
		}
		
		// 현재 itemKey와 비교
		if(curItemKey == key) {
			// 동일한 경우
			// 현재 정보를 설정
			_setItemToCfgForm(cfgParam.item_nm, cfgParam.view_type, mState.FieldList, cfgParam.category_field_index, cfgParam.series_field_index);
		}
		else {
			// 다를 경우
			// Field 정보 조회 후 설정
			var dfdFieldList = _getDfdFieldList(itemData);
		
			dfdFieldList.done(function(fldList) {
				//console.log("fldList : %o", fldList);
				var cFldIndex = [], sFldIndex = [];
				
				cFldIndex.push(0);
				
				if(fldList.length > 2) sFldIndex.push(1);
				
				_setItemToCfgForm(itemData.stats_nm + "[" + itemData.item_nm + "]", itemData.view_type, itemData.fieldList, cFldIndex, sFldIndex);
			});
		}
	},
	
	_findItemFromTree = function(itemKey) {
		var ctxItemData = ctxData.BigStatsItemData;
		var l = ctxItemData.length;
		var itemData = null;
		
		for(var i = 0; i < l; i++) {
			if(itemKey == ctxItemData[i].schedule_id + "_" + ctxItemData[i].item_seq) {
				itemData = ctxItemData[i];
				break;
			}
		}
		
		return itemData;
	},
	
	_getDfdFieldList = function(itemData) {
		//console.log("_getDfdFieldList called...");
		var dfdFieldList = $.Deferred();
		
		if(!itemData) {
			dfdFieldList.resolve([]);
		}
		else if(itemData.fieldList) {
			dfdFieldList.resolve(itemData.fieldList);
		}
		else {
			var param = { schedule_id : itemData.schedule_id, item_seq : itemData.item_seq };
			
			$("body").requestData(urlFieldList, param, {callback : function(rsJson) {
				itemData.fieldList = rsJson;
				//console.log("itemData field list : %o", itemData.fieldList);
				dfdFieldList.resolve(itemData.fieldList);
			}});
		}
		
		return dfdFieldList;
	},
	
	_setItemToCfgForm = function(itemNm, viewType, fldList, cateFldIdx, seriesFldIdx) {
		var cfgParam = config_param;
		var fldLen = fldList.length;
		
		$("[name=item_nm]", m$.form).val(itemNm);
		
		if(viewType == "T") {
			// 테이블 목록 Hide
			//$(".list_container", this.$element).hide();
			if($("[name=view_type] [value=T]",	m$.form).length == 0) {
				$("[name=view_type]",			m$.form).append($("<option value=T>Timeline</option>"));
			}
			$("[name=view_type]",				m$.form).val("T");
			
			$("[name=category_rows]",			m$.form).hide();
			$("[name=view_type]",				m$.form).hide();
			$("[name=sub_view_type]",			m$.form).show();
			$("[name=rows]",					m$.form).hide();
		}
		else {
			$("[name=view_type] [value=T]",		m$.form).remove();
			
			$("[name=category_rows]",			m$.form).show();
			$("[name=view_type]",				m$.form).show();
			$("[name=sub_view_type]",			m$.form).hide();
			$("[name=rows]",					m$.form).show();
		}
	
		_genSearchField(fldList);
		
		if(mState.bUserOnChange == false && cfgParam.category_field_index) {
			_appendDndFields(cfgParam.view_type, fldList, cfgParam.category_field_index, cfgParam.series_field_index);
			//console.log("bUserOnChange is false.");
			// 검색필드 생성 후 Config Param 설정을 위해 호출 
			_SL.setDataToForm(config_param, m$.form);
		
			mState.bUserOnChange = true;
		}
		else {
 			_appendDndFields(viewType, fldList, cateFldIdx, seriesFldIdx);
		}
	},
	
	_appendDndFields = function(viewType, fldList, cateFldIdx, seriesFldIdx) {
		var $to, fldCaption, idx, idxKeys = {};
		
		$(".dnd_field_pannel>ul", m$.form).empty();

		if(!fldList || fldList.length == 0) return;
		
		$to = $(".dnd_category>ul", m$.form);
		
		for(var i = 0; i < cateFldIdx.length; i++) {
			idx = cateFldIdx[i];
			idxKeys["idx_" + idx] = idx;
			
			_appendDndFieldTo(viewType, $to, idx, "[" + fldList[idx].set_seq + "]" + getFieldCaption(fldList[idx]));
		}
		
		$to = $(".dnd_series>ul", m$.form);
		
		for(var i = 0; i < seriesFldIdx.length; i++) {
			idx = seriesFldIdx[i];
			idxKeys["idx_" + idx] = idx;

			_appendDndFieldTo(viewType, $to, idx, "[" + fldList[idx].set_seq + "]" + getFieldCaption(fldList[idx]));
		}
		
		$to = $(".dnd_selectable>ul", m$.form);
		
		for(var i = 0; i < fldList.length; i++) {
			if(typeof idxKeys["idx_" + i] != "undefined" || isFuncField(fldList[i])) continue;
			
			_appendDndFieldTo(viewType, $to, i, "[" + fldList[i].set_seq + "]" + getFieldCaption(fldList[i]));
		}
		/*
		if(!this.bMultiGroup) {
			$("ctrl_field_tr", m$.body).hide();
		}*/
	},
	
	_appendDndFieldTo = function(viewType, $to, idx, cap) {
		$to.append(
			$("<li>")
				.attr({ "field_index" : idx, "title" : cap })
				.addClass("dnd_field ui-state-default" + (idx == 0 && viewType == "T" ? " ui-state-disabled" : ""))
				.text(cap)
		);
	},
	
	_genSearchField = function(fldList) {
			// Config form 
		var fldLen = fldList.length;
		var $fldSet = $(".search-fieldset", m$.form);
		
		$("div", $fldSet).remove();
		
		// 검색 추가
		for(var i = 0; i < fldLen; i++) {
			$fldSet.append(_get$SearchField(fldList[i]));
		}

		slui.attach.setTransformSelect('.page-config-area')
	},
	
	_get$SearchField = function(pField) {
		if(isFuncField(pField)) return "";
		
		if(pField.field_nm == "eqp_dt") {
			return _get$SearchTimeField(pField)
		}
		else {
			return _get$SearchGeneralField(pField);
		}
	},
	
	_get$SearchGeneralField = function(pField) {
		var baseClass = "base-search-field";
		var $tpl = m$.config.find(".bigstats-tpl-search ." + baseClass).clone().removeClass(baseClass);
		
		$(".sp-label", $tpl).text("[" + pField.set_seq + "]" + getFieldCaption(pField));
		
		_setSearchOperator($("select", $tpl), pField);
		
		$("input[type=text]", $tpl).attr("name", "field_value" + pField.field_seq);
		
		return $tpl;
	},
	
	_setSearchOperator = function($op, pField) {
		$op.attr({
			name : "field_value" + pField.field_seq + "_op",
			title : "연산자"
		});
		
		$op.append( $("<option>").text("=")		.val("=") );
		$op.append( $("<option>").text("!=")	.val("!=") );
		$op.append( $("<option>").text(">")		.val(">") );
		$op.append( $("<option>").text("<")		.val(">") );
		$op.append( $("<option>").text(">=")	.val(">=") );
		$op.append( $("<option>").text("<=")	.val("<=") );
		$op.append( $("<option>").text("starts with")	.val("SW") ); 
		$op.append( $("<option>").text("ends with")	.val("EW") ); 
		$op.append( $("<option>").text("like")	.val("LIKE") );
		$op.append( $("<option>").text("not like")	.val("NOT LIKE") );
		$op.append( $("<option>").text("in")	.val("IN") );
		$op.append( $("<option>").text("not in").val("NOT IN") );
		
		return $op;
	},
	
	_get$SearchTimeField = function(pField) {
		var prefix = ["start", "end"]; 
		var $day = [], $hour = [], $min = [];
		var vDay = [], vHour = []; //var vMin = [];
		
		var baseClass = "base-time-field";
		var $tpl = m$.config.find(".bigstats-tpl-search ." + baseClass).clone().removeClass(baseClass);
		
		$(".sp-label", $tpl).text("[" + pField.set_seq + "]" + getFieldCaption(pField));
		
		var str;
		for(var i = 0; i < 2; i++) {
			str = pField["sch_" + prefix[i] + "_time"];
			
			if(str) {
				vDay[i] = str.substring(0, 8);
				vHour[i] = str.substring(8, 10);
			}
			else {
				vDay[i] = "";
				vHour[i] = "";
			}
			
			$day[i]		=	$("input[name=" + prefix[i] + "Day" + "]", $tpl);
			$hour[i]	=	$("select[name=" + prefix[i] + "Hour" + "]", $tpl);
			
			for(var j = 0; j < 24; j++) {
				str = _SL.toFixedWidth(j, 2, '0');
				$hour[i].append( $("<option/>").val(str).text(str) );
			}
			
			$day[i].val(vDay[i]);
			$hour[i].val(vHour[i]);
			/*
			//$min[i] = $("<select />").attr({name : prefix[i] + "Min"});
			//vMin[i] = "00";
			for(var j = 0; j < 60; j++) {
				str = _SL.toFixedWidth(j, 2, '0');
				$min[i].append( $("<option/>").val(str).text(str) );
			}
			//$min[i].val(vMin[i]);
			*/
			
			$day[i].datepicker({
				dateFormat : "yymmdd",
				changeMonth : true,
				changeYear : true,
				showAnim : "fadeIn"
			});
		}
		
		return $tpl;
	},
	/*** Config 관련 END ***/
	
	/*** Util START ***/
	isSameArrayValue = function(src, to) {
		if( !src || src.length == 0) {
			return ( !to || to.length == 0 );
		}
		else {
			if(!to || src.length != to.length) return false;
			
			for(var i = 0; i < src.length; i++) {
				if(src[i] != to[i]) return false;
			}
		}
		
		return true;
	},

	isFuncField = function(pField) {
		return pField.func && /^\D/.test(pField.func);
	},
	
	getFieldCaption = function(pField) {
		var fldNm = LogCaptionInfo[pField.field_nm] || pField.field_nm;
		
		if(isFuncField(pField)) {
			fldNm = (LogCaptionInfo[pField.func] || pField.func) + (pField.field_nm != "*" ? "[" + fldNm + "]" : "");
		}
		
		return fldNm;
	},
	
	// 날자는 날자형(축약일 경우 시분), 그외는 코드명을 포함한 값
	// 집계함수는 천단위(,) 값
	getFieldFormatValue = function(pValue, pField, bAbbr) {
		var seq = pField.field_seq;
		var strAbbr = bAbbr ? "" : "yyyy-MM-dd";
		var frmValue;
		
		if(pField.func) {
			switch(pField.func) {
			case "8":
				frmValue = _SL.formatDate(pValue, "yyyyMMdd", "yyyy-MM-dd");
				break;
			case "10" :
				frmValue = _SL.formatDate(pValue, "yyyyMMddHH", strAbbr + " HH:mm");
				break;
			case "11" :
				frmValue = _SL.formatDate(pValue +"0", "yyyyMMddHHmm", strAbbr + " HH:mm");
				break;
			case "12" :
				frmValue = _SL.formatDate(pValue, "yyyyMMddHHmm", strAbbr + " HH:mm");
				break;
			default :
				frmValue = _SL.formatNumber(pValue);
			}
		}
		else {
			frmValue = pValue;
			
			if(gDFD.fldToCodes.data[pField.field_nm] && gDFD.fldToCodes.data[pField.field_nm][pValue]) {
				frmValue = "[" + pValue + "]" + gDFD.fldToCodes.data[pField.field_nm][pValue];
			}
		}
	
		return frmValue;
	},
	
	getFieldValue = function(pData, pField) {
		var seq = pField.field_seq;
		
		if(pField.func) {
			switch(pField.func) {
			case "8":
			case "10" :
			case "11" :
			case "12" :
				return pData["field_value" + seq];
			default :
				return pData["func_value"];
			}
		}
		else {
			return pData["field_value" + seq];
		}
	},
	/*** Util END ***/
	
	_chartStyle = {
        "paletteColors": "89cf43,0099ff,ced2ff,9fa7ff,6dd0f7,dfbcfe,7dcbff,c07cfe,669933,dddddd",
        "showValues": "0"
    };
	
	//DUMMY;
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		isOpenConfig	: isOpenConfig,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		validateConfig	: validateConfig ,
		beforeSaveConfig: beforeSaveConfig,
		goLogSearch		: goLogSearch
	};
}