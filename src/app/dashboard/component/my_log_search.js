//# sourceURL=my_log_search.js

'use strict';

_SL.nmspc("component").my_log_search = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	urlMyfilterList	= gCONTEXT_PATH + "monitoring/myfilter_list.json",
	urlMyfilter		= gCONTEXT_PATH + "monitoring/myfilter_keywords.json",
	urlLogSearchList= gCONTEXT_PATH + "monitoring/log_search_list.json",
	urlLogSearchChart = gCONTEXT_PATH + "component/my_log_search_chart.json",
	urlLogSearch	= gCONTEXT_PATH + "monitoring/log_search.html",
	
	config_param = configParam,
	component_title = config_param.component_nm ? config_param.component_nm : componentTitle,
	isOpenConfig = false,
	
	admin_config = {
		max_stats_row : _SL.ifNull(slapp.component.my_log_search.admin_config.max_stats_row*1, 10000),
		max_period_min : _SL.ifNull(slapp.component.my_log_search.admin_config.max_period_min*1, 60)
	},
	
	defaultOptions = {
		component_nm : componentTitle,
		myfilter_name	: "검색조건 없음",
		viewFields		: ["eqp_dt","src_ip","dstn_ip","dstn_port","eqp_ip"],
		chart_yn		: "N",
		list_yn			: "Y",
		strQuery		: "",
		searchPeriod	: 5,
		searchRows		: 5,
		viewRows		: 20,
		scroll_size		: 180,
		series_field	: "",		// ""일 경우 "전체"
		series_vals		: [],		// "전체"는 항상 ""
		series_val_etc	: "N",
		stats_func		: "count",		// ""는 Count
		stats_field		: "",		// Count는 항상 ""
		chart_type		: "stackedcolumn2d"
	},
	
	options = {
		rowsPerOut		: 250,
		intervalPerReq	: 200,
		intervalPerOut	: 20,
		delay			: 1,
		cycle			: 1,
		chartPeriod		: 1
	},
	
	m$ = { 
		tit		    : $("#componentheader_" + containerId + " .area-title"),
		body		: $("#componentbody_" + containerId),
		chart		: $("#chart_" + containerId),
		logTable	: $("#log_table_" + containerId),
		form		: $("#config_" + containerId + " form")
	},
	
	mState = {
		oChart		: null
	},
	
	history = {
		chartInfo : []
	},
	
	queue = {
		// List
		searchParam : [],		// 검색 Parameter(List) 목록
		request : [],			// 검색 요청 목록
		response : [],			// 검색 결과 목록
		curResponse : null,
		appendTo : {},			// key : proc_idx, value : 검색 결과를 append할 객체
		buffers : [],			// 화면에 표시할 데이타 버퍼
		// Chart
		groupSearchParam : [],	// 통계검색 Parameter(Chart) 목록
	},
	
	cvars = {
		initMode : { load : 0, config : 1 },
		flagFields : {"src_country_name":1,"src_country_code":1,"dstn_country_name":1,"dstn_country_code":1},
		overLengthSuffix : "@@OverLength",
		reOverLengthSuffix : new RegExp("@@OverLength$"),
		alignCenterFieldRegExp : /.+_(dt|ip|port|prtc)$/
	},
	
	vars = {
		configMode : 0,			//0:표시 설정 변경, 1:데이타 변경
		proc_idx : 0,
		reqTimerId : 0,
		outTimerId : 0,
		curViewRowCnt : 0
	};
	
	gDFD.fldToCodes.ready();
	
	var
	load = function() {
		//console.log("load " + containerId);
		// DOM 변경
		$("[name=searchPeriod] option", m$.form).each(function() {
			if(this.value > admin_config.max_period_min) $(this).remove();
		});
		
		_chartStyle = $.extend(this.chartstyles, _chartStyle);
		//console.log("_chartStyle : %o", _chartStyle);
		// Event 설정
		m$.logTable
			.off("click").on("click", ".mylogdata-td", _onListClick);
		
		m$.form
			.on("change", "[name=myfilterInfo]", _onChangeMyfilterInfo)
			.on("change", "[name=stats_func]", _onChangeStatsFunc)
			.on("change", "[name=series_field]", _onChangeSeriesField)
			.on("click", "[name=list_yn]", _onClickYn)
			.on("click", "[name=chart_yn]", _onClickYn)
			.on("click", ".btn-series-add", _onClickSeriesValAddBt)
			.on("click", ".btn-series-del", _onClickSeriesValDelBt);
		
		// Default Option 설정
		$.extend(options, defaultOptions, config_param);
		
		_getDfdMyfilterInfo(options.myfilter_id, options.myfilter_type, function(data) {
			//console.log("load this.options : %o", this.options);
			//console.log("load data : %o", data);
			if(data.myfilter_id) {
				options.viewFields = config_param.viewFields = data.viewFields;
				options.strQuery = config_param.strQuery = data.strQuery;
			}
				
			_init(true, true);
			//console.log("call refresh : " + containerId);
			refresh();
		});
	},
	
	refresh = function() {
		
		if(config_param.component_nm || config_param.component_nm == ""){
			m$.tit.text(config_param.component_nm);
		}
		
		//console.log("exec refresh : " + containerId);
		var sTime;
		
		if(_SL.isEmpty(options.strQuery)) return;
		
		if(options.list_yn == "Y") {
			if(queue.schTime.length == 0) {
				queue.schTime.push({schStartTime : _getSchStartDate(), schEndTime : _getSchEndDate()});
			}
			_search();
		}
		
		if(options.chart_yn == "Y") {
			if(queue.groupSchTime.length == 0) {
				sTime = _getChartStartTime(_getSchStartDate());
				
				queue.groupSchTime.push({schStartTime : sTime, schEndTime : _SL.formatDate.addMin(sTime, options.chartPeriod)});
			}
			
			_searchGroup();
		}
	},
	
	showConfig = function() {
		this.isOpenConfig = isOpenConfig = true; 

		var myfilterId = config_param.myfilter_id;

		m$.form.find("[name=component_nm]").val(options.component_nm);
		m$.form.find("[name=list_yn]").each(function() {
			$(this).removeClass("selected");
			if(this.value == options.list_yn) $(this).addClass("selected");  
		});
		m$.form.find("[name=searchPeriod]").val(options.searchPeriod);
		m$.form.find("[name=searchRows]").val(options.searchRows);
		m$.form.find("[name=viewRows]").val(options.viewRows);
		m$.form.find("[name=scroll_size]").val(options.scroll_size);
		m$.form.find("[name=chart_yn]").each(function() {
			$(this).removeClass("selected");
			if(this.value == options.chart_yn) $(this).addClass("selected");  
		});
		m$.form.find("[name=stats_func]").val(options.stats_func).trigger("change");
		m$.form.find("[name=series_field]").val(options.series_field).trigger("change");
		
		if(!!options.series_vals) {
			var $seriesVals = m$.form.find("[name=series_vals]");
			$seriesVals.empty();
			for(var i = 0; i < options.series_vals.length; i++) {
				$seriesVals.append(new Option(options.series_vals[i], options.series_vals[i]));
			}
		}
		m$.form.find("[name=series_val_etc]")[options.series_val_etc == "Y" ? 0 : 1].checked = true;
		m$.form.find("[name=chart_type]").val(options.chart_type);
		
		// 내 검색조건 가져오기
		$("body").requestData(urlMyfilterList, {}, {callback : function(rsJson, rsCd, rsMsg) {
			var $myfilterInfo = m$.form.find("[name=myfilterInfo]");
			
			$myfilterInfo
				.empty()
				.append(new Option("[선택하세요]", ""));
			
			for(var i = 0, l = rsJson.length; i < l; i++) {
				$("<option>")
					.attr(myfilterId == rsJson[i].myfilter_id ? {selected:true} : {})
					.val(JSON.stringify(rsJson[i]))
					.text(rsJson[i].myfilter_name)
					.appendTo($myfilterInfo);
			}
			
			$myfilterInfo.trigger("change");
		}});
		
		if(options.component_nm || options.component_nm == ""){
			$("#config_" + containerId).find("h4").text(options.component_nm);
		}
	},

	validateConfig = function() {
		
		if(!_SL.validate(m$.form)) return;

		var
			s = parseInt(m$.form.find("[name=searchRows]").val()),
			v = parseInt(m$.form.find("[name=viewRows]").val()),
			listYn		= m$.form.find("[name=list_yn].selected").val(),
			chartYn		= m$.form.find("[name=chart_yn].selected").val(),
			statsFunc	= m$.form.find("[name=stats_func]").val(),
			statsField	= m$.form.find("[name=stats_field]").val(),
			seriesField	= m$.form.find("[name=series_field]").val(),
			seriesVals	= m$.form.find("[name=series_vals]").val();
		
		if(listYn != "Y" && chartYn != "Y") {
			_alert("목록 또는 차트중 하나는 표시해야 합니다.");
			return false;
		}
		
		if(listYn == "Y" && s > v) {
			_alert("표시 건수가 건수/분 보다 커야 합니다.", {onAgree : function(){m$.form.find("[name=viewRows]").focus();}});
			return false;
		}
		
		if(chartYn == "Y" && statsFunc != "count" && statsField == "") {
			_alert("통계값 필드를 선택하세요.");
			return false;
		}
		
		if(seriesField == "") {
			m$.form.find("[name=series_vals] option").remove();
		}
		else {
			if (m$.form.find("[name=series_vals] option").length == 0) {
				_alert("범례 항목을 입력하세요.");
				return false;
			}
		}
		
		return true;
	},
	
	beforeSaveConfig = function() {
		var oMyfilterInfo;
		
		m$.form.find("[name=series_vals] option").prop("selected", true);
		
		var list = m$.form.serializeArray();
		
		var t_config_param = {};
		
		for(var i = 0; i < list.length; i++) {
			if(list[i].name == "series_vals") {	// Multiple
				if(!t_config_param[list[i].name]) t_config_param[list[i].name] = [];
				t_config_param[list[i].name].push(list[i].value);
			}
			else t_config_param[list[i].name] = list[i].value;
		}
		
		if(t_config_param.myfilterInfo != "") {
			oMyfilterInfo = $.parseJSON(t_config_param.myfilterInfo);
			t_config_param.myfilter_id = oMyfilterInfo.myfilter_id;
			t_config_param.myfilter_type = oMyfilterInfo.myfilter_type;
			t_config_param.myfilter_name = oMyfilterInfo.myfilter_name;
		}
		else {
			t_config_param.myfilter_id = "";
			t_config_param.myfilter_type = "";
			t_config_param.myfilter_name = defaultOptions.myfilter_name;
		}
		
		t_config_param.list_yn = m$.form.find("[name=list_yn].selected").val();
		t_config_param.chart_yn = m$.form.find("[name=chart_yn].selected").val();
		
		delete t_config_param.myfilterInfo;
		
		this.config_param = config_param = t_config_param;
		//delete this.config_param.t_inp_val;
		
		//console.log("config_param : %o", this.config_param);
	},
			
	afterSaveConfig = function() {
		this.isOpenConfig = isOpenConfig = false; 
		//console.log("options.myfilter_id : " + options.myfilter_id + ", config_param.myfilter_id : " + config_param.myfilter_id);
		var bChkData = _isDiffObj(options, config_param, ["myfilter_id"]);
		var bChgChart = false, bChgList = false;
		
		if(bChkData) {
			bChgChart = true, bChgList = true;
		}
		else {
			bChgChart = _isDiffObj(options, config_param, ["stats_func","stats_field","series_field","series_vals"]);
			
			if(bChgChart == false &&
					options.searchPeriod != config_param.searchPeriod &&
					!(
						parseInt(options.searchPeriod) > parseInt(config_param.searchPeriod) && 
						parseInt(options.searchPeriod) <= 60
					))
				bChgChart = true; 
		}
		
		_getDfdMyfilterInfo(config_param.myfilter_id, config_param.myfilter_type, function(data) {
			//console.log("afterSaveConfig data : %o", data);
			config_param.viewFields = data.viewFields;
			config_param.strQuery = data.strQuery;
			
			_init(bChgList, bChgChart);
			
			refresh();
		});
	},
	
	cancelConfig = function() {
		this.isOpenConfig = isOpenConfig = false; 
	},
	
	/*** 내부용 ***/
	_getDfdMyfilterInfo = function(myfilterId, myfilterType, cbFunc) {
		var oMyfilterInfo = {
			myfilter_id		: "",
			myfilter_type	: "",
			strQuery		: "",
			viewFields		: defaultOptions.viewFields
		};
		
		if(!myfilterId) {
			cbFunc(oMyfilterInfo);
		}
		else {
			// 내 검색조건 정보 조회
			$('body').requestData(urlMyfilter, { myfilter_id : myfilterId }, {callback : function(rsJson) {
				if(rsJson.view_fields) {
					$.extend(oMyfilterInfo, {
						myfilter_id		: myfilterId,
						myfilter_type	: myfilterType,
						viewFeidls		: rsJson.view_fields.split(",")
					});
				}
				
				if(myfilterType == "1") {
					/* 미사용
					// 필터 추가
					var str, listFieldQuery = [];
					var listFieldInfo = rsJson.myfilter_field_list;
					
					if(listFieldInfo) {
						for(var i = 0; i < listFieldInfo.length; i++) {
							str = listFieldInfo[i].field_value.replace(/[:-]/g, " ");
							if(str.indexOf(" ") > 0) str = "(" + str + ")";
							
							listFieldQuery.push(listFieldInfo[i].field_name + ":" + str);
						}
						
						oMyfilterInfo.strQuery = listFieldQuery.join(" AND ");
					}
					else {
						oMyfilterInfo.strQuery = "";
					}
					*/
				}
				else if (myfilterType == "2") {
					oMyfilterInfo.strQuery = rsJson.keywords;
				}
				
				//console.log("oMyfilterInfo : " + JSON.stringify(oMyfilterInfo));
				cbFunc(oMyfilterInfo);
			}} );
		}
	},
	
	// Load/Config 후 초기화
	_init = function(bListClear, bChartClear) {
		$.extend(options, config_param);
		
		var eTime = _getSchEndDate();
		var sTime = _SL.formatDate.addMin(eTime, -options.searchPeriod);
		
		//console.log("sTime : " + sTime + ", eTime : " + eTime);
		
		if(bListClear) {
			queue.schTime = [];		// 검색 Parameter 목록
			queue.request = [];			// 검색 요청 목록
			queue.response = [];
			queue.last_end_time = null;	// 최종 처리한 end_time
			queue.curResponse = null;
			queue.appendTo = {};			// key : proc_idx, value : 검색 결과를 append할 객체
			queue.buffers = [];
				
			vars.proc_idx = 0;
			vars.outTimerId = 0;
			vars.reqTimerId = 0;
			vars.curViewRowCnt = 0;
			
			_dispFieldCaption();
			
			queue.schTime.push({schStartTime : sTime, schEndTime : eTime});
		}
		
		if(bChartClear) {
			queue.groupSchTime = [];		// 통계검색 Time 목록
			history.chartInfo = [];
			
			_calcChartPeriod();
			
			var loadPeriod = options.searchPeriod;
			
			sTime = _getChartStartTime(sTime, true);

			// Loading시 최대 검색 기간은 6시간
			if(loadPeriod > 360) {
				loadPeriod = 360;
				sTime = _SL.formatDate.addMin(sTime, options.searchPeriod - loadPeriod);
			}
			
			// queue에 검색 시간 추가 
			for(var i = 0; i < loadPeriod; i += options.chartPeriod) {
				eTime = _SL.formatDate.addMin(sTime, options.chartPeriod);
				queue.groupSchTime.push({schStartTime : sTime, schEndTime : eTime});
				
				sTime = eTime;
			}
			
			_setChartData({});
		}
		
		_preRefresh();
	},
	
	_calcChartPeriod = function() {
		var chartPeriod = 1;
		
		if(options.searchPeriod > 60) {
			if(options.searchPeriod < 360) {
				chartPeriod = options.searchPeriod / 60;
			}
			else if(options.searchPeriod == 360) {
				chartPeriod = 5;
			}
			else chartPeriod = 10;
		}
		
		options.chartPeriod = chartPeriod;
	},
	
	_getChartStartTime = function(sTime, bAfter) {
		var nMod = parseInt(sTime.substring(10, 12), 10) % options.chartPeriod;
		
		if(nMod != 0) {
			sTime = _SL.formatDate.addMin(sTime, (bAfter ? options.chartPeriod : 0) - nMod);
		}
		
		return sTime;
	},
	
	_preRefresh = function() {
		var $sTitle = m$.body.find(".filter-detail h5");
		var strTitle = options.myfilter_name;

		$sTitle.attr('data-ui','tooltip')
			.data('text',"검색조건 : " + options.strQuery);

		if(options.chart_yn == "Y") {
			strTitle += " - [" + options.stats_func.toUpperCase()
			              + (options.stats_field == "" ? "" : "(" + _getFieldCaption(options.stats_field)+ ")")
			              + "]";
			_createChart(options.chart_type);
			m$.chart.show();
		} else {
			history.chartInfo = [];
			m$.chart.hide();
		}
		
		$sTitle.html(strTitle);
		
		
		if(options.list_yn == "Y") {
			m$.logTable.show();
			$(".rows-detail", m$.body).text("");
			$(".rows-detail", m$.body).show();
			_resizeHeight();
		} else {
			$(".rows-detail", m$.body).hide();
			m$.logTable.hide();
		}

		// tooltip event attach
		slui.attach.tooltip("#componentcontainer_" + containerId);
	},
	
	_createChart = function(chartType) {
		var oChart = mState.oChart;
		
		if (!oChart) {
			FusionCharts.ready(function(){
				$.Dashboard.chartInstance[containerId] = mState.oChart = new FusionCharts({
					type: chartType,
					renderAt: "chart_" + containerId,
					width: '100%',
					height: 180,
					dataFormat: 'json',
					dataSource: {
						chart : _chartStyle,
						categories : [{category:[]}],
						dataset : []
					}
				}).render();
			});
		} else {
			oChart.chartType(chartType);
		}
	},
	
	_getSchEndDate = function() {
		return _SL.formatDate.addMin(gGetServerTime(), -(options.delay));
	},
	
	_getSchStartDate = function() {
		return _SL.formatDate.addMin(_getSchEndDate(), -(options.cycle));
	},
		
	_dispFieldCaption = function() {
		if(options.searchPeriod < 5) options.searchPeriod = 5;
		
		var strWidth, strCaption, $tr;
		
		// 기존 Row 삭제
		m$.logTable.empty();

		var $tr = $("<tr></tr>");
		
		for(var idx in options.viewFields) {
			if(strWidth)	strWidth = " width=" + strWidth;
			else			strWidth = "";
			
			$tr.append("<th" + strWidth + " scope='col'>" + _getFieldCaption(options.viewFields[idx]) + "</th>");
		}
		m$.logTable.append($("<thead>").append($tr));

		$tr = $("<tr height=25></tr>");
		
		$("<td style='cursor:default'>검색 결과가 없습니다.</td>")
			.attr({
				colspan : options.viewFields.length
			})
			.appendTo($tr);
		
		m$.logTable.append($("<tbody tabindex='1' style='cursor:pointer'>").append($tr));
	},

	_resizeHeight = function() {
		//scroll 사이즈 조정
		//$("#" + containerId + "_list_container").css("height", options.scroll_size ? options.scroll_size + "px" : "");
	},

	_search = function() {
		var schTime = queue.schTime.shift();
		//console.log("_search : " + JSON.stringify(schTime));
		
		$.when(
			gDFD.fldToCodes, 
			_addRequest(schTime.schStartTime, schTime.schEndTime, 0)
		);
	},
	
	_searchGroup = function() {
		var schTime = queue.groupSchTime.shift();
		
		if(schTime) {
			var param = {
					start_time : schTime.schStartTime,
					end_time : schTime.schEndTime,
					query : options.strQuery,
					stats_func : options.stats_func,
					stats_field : options.stats_field,
					series_field : options.series_field,
					series_vals : options.series_vals || [],
					nocache : "N"
				};
			
			if(schTime.schEndTime > _getSchEndDate()) {
				param.nocache = "Y";
			}
			//console.log("searchGroup start_time : %o", param.start_time);
			$("body").requestData(urlLogSearchChart, param, {callback : function(rsData) {
				//console.log("searchGroup requestData start_time : %o", param.start_time);
				_outputChart(param.start_time, rsData);
				if(queue.groupSchTime.length > 0) _searchGroup();
			}});
		}
	},
	
	_addRequest = function(stime, etime, sIndex, appendTo) {
		//console.log("_addRequest start.. query : %s", options.strQuery);
		
		var curProcIdx = (++vars.proc_idx) + "";
		var pageRow = options.searchRows;
		
		if(sIndex == 0 && _SL.formatDate.diff(stime, etime) > 1000 * 60) pageRow = options.viewRows;
		//console.log("period : " + _SL.formatDate.diff(stime, etime));
		
		queue.request.push({
			proc_idx : curProcIdx, start_time : stime, end_time : etime, 
			query : options.strQuery, pageRow : pageRow, startIndex : sIndex,
			sort_by_field_name : "eqp_dt", sort_by_order : "desc" 
		});
		queue.appendTo[curProcIdx] = appendTo;
		
		
		if(vars.reqTimerId == 0) {
			_searchRequest();
		} 
	},
	
	_searchRequest = function() {
		//console.log("_search start..");
		$('body').requestData(urlLogSearchList, queue.request.shift(), {callback : function(data) {
				//console.log("log_search_list done...");
			queue.response.push(data);

			_checkOutput();
			
			if(queue.request.length > 0) {
				vars.reqTimerId = setTimeout(_search, options.intervalPerReq);
			}
			else vars.reqTimerId = 0;
		}});
	},
	
	_checkOutput = function() {
		//console.log("_checkOutput response size : %s, outTimerId : %s", queue.response.length, vars.outTimerId);
		if(queue.response.length && !queue.curResponse) {
			vars.outTimerId = setTimeout(_output, 30);
		}
	},
	
	// Queue에 response가 있을 경우 출력 처리
	_output = function() {
		//console.log("_output start!!!, outTimerId : %s", vars.outTimerId);
		//if(vars.bOutputProc || queue.buffers.length > 0) return;
		//vars.bOutputProc = true;
		
		var	res = queue.response.shift();
			//info;
		
		if(res) {
			queue.curResponse = {proc_idx : res.proc_idx, start_time : res.start_time, end_time : res.end_time, startIndex : res.startIndex, rows : res.rsList.length, total : res.total};
			
			if(!queue.last_end_time || queue.last_end_time < res.end_time) {
				queue.last_end_time = res.end_time;
			}
			else if(queue.last_end_time == res.end_time && res.startIndex == 0) {
				_outputClearVar();
			}
			
			vars.curTotal = res.total;
			vars.curRows = res.rsList.length;
			
			// 데이타가 없을 경우 Row 삭제
			if(vars.curViewRowCnt == 0) {
				_removeRows(1);
			}
			
			queue.buffers = res.rsList;
			
			m$.logTable.find("tr.no1").removeClass("no1");
			
			_outputData();
		}
		
	},
	
	_outputClearVar = function() {
		var appendTo, res = queue.curResponse;
		
		if(res) {
			appendTo = queue.appendTo[res.proc_idx];
			
			if(appendTo) {
				queue.appendTo[res.proc_idx] = null;
				delete queue.appendTo[res.proc_idx];
			}
			
			queue.curResponse = null;
		}
	},
	
	// Buffer에 있는 데이타를 rowsPerOut만큼씩 출력
	_outputData = function() {
		var now = new Date().getTime();

		var rsRow, ariaValue, curTr, curTd;
		
		var curResponse = queue.curResponse;
		
		//console.log("_outputData curResponse : %o", curResponse);
		if(!curResponse) return;
		
		var curProcIdx = curResponse.proc_idx;
		var $appendTo = queue.appendTo[curProcIdx];
		var b1Min = true;
		
		if(_SL.formatDate.diff(curResponse.start_time, curResponse.end_time) > 1000 * 60) b1Min = false;
		
		if(!$appendTo) {
			$(".rows-detail", m$.body)
				.text(
						"[" + _SL.formatDate(curResponse.start_time, "HH:mm")
						+ (b1Min ? "" : ("~" + _SL.formatDate(curResponse.end_time, "HH:mm")))
						+ " - " + _SL.toComma(curResponse.total) + " Rows]"
				);
		}
		else {
			if($appendTo.parent().length) {
				if($appendTo.hasClass("mylogdata-more")) {
					// more...이면 이전 tr을 appendTo로 변경하고 more... 삭제
					//console.log("$appendTo change to Prev TR from more...!!!");
					
					$appendTo = $appendTo.prev();
					queue.appendTo[curProcIdx].remove();
					queue.appendTo[curProcIdx] = $appendTo;
				}
				else {
					console.log("Don't have 'mylogdata-more' Class");
				}
			}
			else {	// appendTo가 삭제된 경우이므로 미처리
				_outputClearVar();
				_checkOutput();
				return;
			}
		}
		//console.log("appendTo : %o", $appendTo);

		if(b1Min && queue.buffers.length == curResponse.rows
				&& curResponse.startIndex + curResponse.rows < curResponse.total) {
			//console.log("insert more...!!!");
			// startIndex + Rows가 total 보다 작으면 more...
			curTr = $("<tr class='mylogdata-more no1'>").append(
						$("<td class='mylogdata-td mylogdata-more'>")
							.text("[" + _SL.formatDate(curResponse.start_time, "HH:mm") + "] More "
									+ _SL.toComma(curResponse.total - curResponse.startIndex - curResponse.rows)
									+ " Rows...")
							.attr({
								valign : "middle",
								colspan : options.viewFields.length
							})
							.data("response", curResponse)
					)
			
			if(!$appendTo) m$.logTable.find("tbody").prepend(curTr);
			else $appendTo.after(curTr);
		}
		
		var patchCnt = Math.min(options.rowsPerOut, queue.buffers.length);
		var rsList = queue.buffers.splice(queue.buffers.length - patchCnt, patchCnt);
		var viewFields = options.viewFields;
		var vfLen = viewFields.length;
		
		//console.log("buffers.length : %s, rsList.length : %s", queue.buffers.length, rsList.length);
		//console.log("output slice span time : %s", new Date().getTime() - now);
		
		// 결과 Data가 있을 경우 데이타 출력
		if(!!rsList && rsList.length > 0) {
			var no = 1;
			var trFrag = document.createDocumentFragment();
			var tdFrag = document.createDocumentFragment();
			
			// Table에 데이타 표시
			for(var rnum = 0; rnum < rsList.length; rnum++) {
				rsRow = rsList[rnum];
				
				// 사용자가 선택한 항목 표시
				//$curTr = $("<tr class='no1'></tr>").attr("aria-value", rsRow.eqp_dt);
				
				curTr = document.createElement('tr');
				curTr.className = "no1";
				curTr.setAttribute("aria-value", rsRow.eqp_dt);
							//.addClass(rnum == 0 ? "no1" : rnum % 2 == 0 ? "" : "bg");
				for(var i = 0; i < vfLen; i++) {
					curTd = document.createElement('td');
					_outputFieldData(curTd, rsRow, viewFields[i], rsRow[viewFields[i]] || "");
					
					tdFrag.appendChild(curTd);
				}
				
				trFrag.appendChild(curTr);
				curTr.appendChild(tdFrag);
			}
			
			//console.log("output fragment span time : %s", new Date().getTime() - now);
			if(!$appendTo) m$.logTable.find("tbody").prepend(trFrag);
			else $appendTo.after(trFrag);
			//console.log("output fragment attach span time : %s", new Date().getTime() - now);
			
			vars.curViewRowCnt += rsList.length;
			//console.log("After append curViewRowCnt : %s", vars.curViewRowCnt);
			
			var delRowCnt = vars.curViewRowCnt - options.viewRows;
			if (delRowCnt > 0) {
				_removeRows(delRowCnt);
				vars.curViewRowCnt -= delRowCnt;
				//console.log("After remove curViewRowCnt : %s", vars.curViewRowCnt);
			}
			
			//console.log("output after buffers.length : %s", queue.buffers.length);
			
			// Buffer에 데이타가 남았을 경우 재귀 호출
			if(queue.buffers.length > 0) {
				//console.log("output span time : %s", new Date().getTime() - now);
				vars.outTimerId = setTimeout(_outputData, options.intervalPerOut);
				
				return;
			}
		}
		else if (vars.curViewRowCnt == 0) {
			curTr = $("<tr></tr>");
			
			$("<td>검색 결과가 없습니다.</td>")
				.attr({
					valign : "middle",
					colspan : vfLen
				})
				.appendTo(curTr);
			
			curTr.appendTo(m$.logTable.find("tbody"));
		}
		
		_outputClearVar();
		
		//console.log("output span time : %s", new Date().getTime() - now);

		_checkOutput();
	},
	
	_outputFieldData = function(pCurTd, pRsRow, pFldName, pFldVal) {
		var flagCode, prefix;

		pCurTd.className = "mylogdata-td";
		pCurTd.setAttribute("aria-value", pFldVal);
		
		if(pFldName == "eqp_dt" || pFldName == "recv_time") {
			pFldVal = _SL.formatDate(pFldVal, "yyyyMMddHHmmss", "yyyy-MM-dd HH:mm:ss");
			pCurTd.setAttribute("title", pFldVal);
			pFldVal = pFldVal.substring(11);
		}
		else if(pFldName == "src_ip" || pFldName == "dstn_ip") {
		}
		else if(cvars.flagFields[pFldName]) {
			prefix = pFldName.match(/^[^_]+_/);
			flagCode = pRsRow[prefix + "country_code"];
				
			if(flagCode) {
				if(flagCode =="PRN") flagCode = "PR-N";
				else if(pRsRow[prefix + "country_name"] =="N/A") flagCode = "N-A";
					
				pCurTd.appendChild($("<img src='" + gCONTEXT_PATH + "resources/images/flag/" + flagCode + ".png' style='margin-right:5px;'/>")[0]);
			}
		}
		else {
			// 공통코드 표시
			if(gDFD.fldToCodes.data[pFldName] && gDFD.fldToCodes.data[pFldName][pFldVal]) {
				pFldVal = gDFD.fldToCodes.data[pFldName][pFldVal] + "[" + pFldVal + "]";
			}
			
			if(cvars.reOverLengthSuffix.test(pFldVal)) {
				pFldVal = pFldVal.replace(cvars.overLengthSuffix, "");
			}
			
			if(pFldVal.length > 55) {
				pCurTd.setAttribute("title", pFldVal);
			}

			if(!cvars.alignCenterFieldRegExp.test(pFldName)) {
				pCurTd.className += " align_left";
			}
		}

		pCurTd.appendChild(document.createTextNode(pFldVal));
	},
	
	_appendFlag = function(p$Cur, pLogIdx, pFldName) {
		var flagCode, prefix;
		
		if($.inArray(pFldName, mCfg.flagFields) != -1) {
			prefix = pFldName.match(/^[^_]+_/);
			flagCode = mState.listData[pLogIdx][prefix + "country_code"];
			
			if(flagCode) {
				if(mState.listData[pLogIdx][prefix + "country_code"] =="PRN") flagCode = "PR-N";
				if(mState.listData[pLogIdx][prefix + "country_name"] =="N/A") flagCode = "N-A";
				
				if(flagCode != "PR-N"){
					p$Cur.append("<img src='/resources/images/flag/"+flagCode+".png' alt='"+flagCode+"' width='16' height='11'>");
				} else {
					p$Cur.append("<i class='icon-lock'></i>");
				}
			}
		}
	},
	
	_removeRows = function(cnt) {
		var now = new Date().getTime();

		var oTable = m$.logTable[0];
		
		var trFrag = document.createDocumentFragment();
		//tblFrag.appendChild(oTable);
		
		var totalRows = oTable.rows.length;
		var oTr;
		
		//console.log("before remove Table Rows : %s", oTable.rows.length);

		for (var i = 1; i <= cnt; i++) {
			oTr = oTable.rows[totalRows - i];
			
			// TODO history에 해당 시간 rows--;
			
			if(oTr.className.indexOf("mylogdata-more") != -1) cnt++;
			//oTable.deleteRow(oTr.rowIndex);
			trFrag.appendChild(oTr);
		}
		$(trFrag).remove();
		trFrag = null;
		//console.log("remove rows span time : %s", new Date().getTime() - now);
		
		//oTable.removeChild(trFrag);
		//cache.$listContainer.prepend(tblFrag);
		
		now = new Date().getTime() - now;
		//console.log("after remove Table Rows : %s", oTable.rows.length);
		//console.log("remove span time : %s", now);
	},
	
	_getFieldCaption = function(pFld) {
		return LogCaptionInfo[pFld] || pFld;
	},
	
	_isDiffObj = function(sObj, dObj, fldList) {
		var bChgData = false;
		
		for(var i = 0; i < fldList.length; i++) {
			
			if( (sObj[fldList[i]] || "") != (dObj[fldList[i]] || "") ) {
				// 배열일 경우 체크
				if( $.isArray(sObj[fldList[i]]) && $.isArray(dObj[fldList[i]])
						&& sObj[fldList[i]].length == dObj[fldList[i]].length) {
					for(var j = 0; j < sObj[fldList[i]].length; j++) {
						if( (sObj[fldList[i]][j] || "") != (dObj[fldList[i]][j] || "") ) {
							bChgData = true;
							break;
						}
					}
				}
				else bChgData = true;
			}
			//console.log("bChgData is " + bChgData);
			if(bChgData) break;
		}
		
		return bChgData;
	},
	
	_outputChart = function(startTime, rsList) {
		var info,
			chartInfo = history.chartInfo,
			dataSource = {};
		
		if(chartInfo.length == 0) {
			info = {};
		}
		else {
			info = chartInfo[chartInfo.length - 1];
		}
			
		if(info.start_time == startTime) {
			info.rsList = rsList;
		}
		else {
			chartInfo.push({start_time : startTime, rsList : rsList});
		}
		
		var maxChartLen = options.searchPeriod / options.chartPeriod;
		
		while(chartInfo.length > maxChartLen) {
			info = chartInfo.shift(0, 1);
		}
		
		if(queue.groupSchTime.length == 0) {
			dataSource = _getChartData(chartInfo);
			dataSource.chart = _chartStyle;
			
			//console.log("dataSource : " + JSON.stringify(dataSource));
			
			_setChartData(dataSource);
		}
	},
	
	_getChartData = function (dataList) {
		if(!dataList) dataList = [];
		
		var	cField = "start_time", sField = "", allField = [cField];
		
		/*
		for(var i = 0; i < config_param.category_field_index.length; i++) {
			cField.push(fieldList[config_param.category_field_index[i]]);
		}*/
		
		var chartDataSource = {}, seriesMap = {}, categoryIndex = {}, categoryList = [], nLen;
		
		chartDataSource = {
			categories : [{category:[]}],
			dataset : []
		};
		
		if (_isMultiSeries()) {
			sField = options.series_field;
			//allField.push(sField);
		}
		
		// Dataset 정의
		nLen = dataList.length;
		
		var data, cData, sData, fldVal, sFldVal, orgFldVal, funcField;
		
		if(options.stats_func == "count" && sField == "") 
			funcField = "total";
		else 
			funcField = "func_value";
		
		for(var i = 0; i < nLen; i++) {
			data = dataList[i];
			if(!data.rsList) data.rsList = [];
			
			cData = {};

			fldVal = data[cField];
			cData.value = fldVal;
			cData.label = _getFieldFormatValue(fldVal, cField, true);
			cData.toolText = _getFieldFormatValue(fldVal, cField);
			
			for(var j = 0; j < data.rsList.length; j++) {
				sData = data.rsList[j];
				orgFldVal = "";
				
				if(sField == "") {
					fldVal = "[전체]";
				}
				else {
					orgFldVal = fldVal = sData[sField];
					
					if(fldVal == "_etc") {
						if(options.series_val_etc == "Y") 	fldVal = "[기타]";
						else continue;
					}
					else fldVal = _getFieldFormatValue(fldVal, sField);
				}
				
				if(!seriesMap[fldVal]) {
					seriesMap[fldVal] = [];
				}
				
				if(typeof categoryIndex[cData.value] == "undefined") {
					categoryIndex[cData.value] = categoryList.length;
					categoryList.push({label : cData.label, toolText : cData.toolText});
				}
				
				seriesMap[fldVal][categoryIndex[cData.value]] = {value : sData[funcField], link : _getLinkUrl(cData.value, sField, orgFldVal)};
			}
			
		}
		
		chartDataSource.categories = [ {category : categoryList} ];
			
		for(var oKey in seriesMap) {
			chartDataSource.dataset.push({seriesname : oKey, data : seriesMap[oKey]});
		}
			
		return chartDataSource;
	},
	
	_setChartData = function (dataSource) {
		var oChart = mState.oChart;
		
		if(oChart) oChart.setChartData(dataSource, "json");
	},
	
	_isMultiSeries = function () {
		return options.series_field && options.series_field != "" && options.series_vals && options.series_vals.length > 0;
	},
	
	_getLinkUrl = function(sDate, field, fldVal) {
		var strLink = "javascript:$.Dashboard.componentInstance['" + containerId + "'].goLogSearch('"+ sDate + "'";
		
		if(field != "") {
			strLink += ",'" + field + "','" + _SL.javascriptEscape(fldVal) + "'"; 
		}
		
		strLink += ")";
		
		return strLink;
	},
	
	// 날자는 날자형(축약일 경우 시분), 그외는 코드명을 포함한 값
	// 집계함수는 천단위(,) 값
	_getFieldFormatValue = function(pValue, pField, bAbbr) {
		var strAbbr = bAbbr ? "" : "yyyy-MM-dd";
		var frmValue;
		
		if(pField == "start_time") {
			frmValue = _SL.formatDate(pValue, "yyyyMMddHHmm", strAbbr + " HH:mm");
		}
		else if(pField == "total" || pField == "func_value") {
			frmValue = _SL.toComma(pValue);
		}
		else {
			frmValue = pValue;
			
			if(gDFD.fldToCodes.data[pField] && gDFD.fldToCodes.data[pField][pValue]) {
				pFldVal = gDFD.fldToCodes.data[pField][pValue] + "[" + pValue + "]";
			}
		}
	
		return frmValue;
	},
	
	
	/*** Event Handler ***/
	// myfilterId에 해당하는 정보 조회
	_onChangeMyfilterInfo = function(e) {
		//console.log("fired change myfilterInfo")
		var strMyfilterInfo = $(e.target).val();
		var oMyfilter = {};
		var dfdMyfilter;

		if(strMyfilterInfo == "") {
			oMyfilter.myfilter_id = "";
			oMyfilter.myfilter_type = "";
			oMyfilter.myfilter_name = "";
		}
		else {
			oMyfilter = $.parseJSON(strMyfilterInfo);
		}
		
		_getDfdMyfilterInfo(oMyfilter.myfilter_id, oMyfilter.myfilter_type, function(data) {
			//console.log("done data : " + JSON.stringify(data));
			_setStatsFieldOptions(data.viewFields, options.stats_field);
			_setSeriesFieldOptions(data.viewFields, options.series_field);
		});
	},
	
	_setStatsFieldOptions = function(viewFields, val) {
		var $field = m$.form.find("[name=stats_field]");
		
		$field
			.empty()
			.append( $("<option/>").val("").text("[필드 선택]") );
		
		for(var i = 0; i < viewFields.length; i++) {
			$("<option />")
				.attr("selected", val == viewFields[i])
				.val(viewFields[i])
				.text(_getFieldCaption(viewFields[i]))
				.appendTo($field);
		}
	},
	
	_setSeriesFieldOptions = function(viewFields, val) {
		var $field = m$.form.find("[name=series_field]");
		
		$field
			.empty()
			.append( $("<option/>").val("").text("[미지정]") );
		
		for(var i = 0; i < viewFields.length; i++) {
			$("<option />")
				.attr("selected", val == viewFields[i])
				.val(viewFields[i])
				.text(_getFieldCaption(viewFields[i]))
				.appendTo($field);
		}
	},
	
	_onChangeSeriesField = function(e) {
		var sFldVal = $(e.target).val();
		var $area = m$.body.find(".area-series-val");
		
		if(sFldVal == "")
			$area.hide();
		else 
			$area.show();
	},
	
	_onChangeStatsFunc = function(e) {
		var sFunc = $(e.target).val();
		var $field = m$.form.find("[name=stats_field]");
		
		if(sFunc == "count") {
			$field.hide();
		}
		else { 
			$field.show();
		}
	},
	
	_onClickYn = function(e) {
		var yn = $(e.target).val();
		
		m$.form.find("[name=" + e.target.name + "]").each(function() {
			$(this).removeClass("selected");
			if(this.value == yn) $(this).addClass("selected");  
		});
	},
	
	_onClickSeriesValAddBt = function(e) {
		var 
			$tInpVal = m$.form.find("[name=t_inp_val]"),
			$seriesVal = m$.form.find("[name=series_vals]"),
			tVal = $tInpVal.val(),
			$sValOpt = $seriesVal.find("option");
			
		if(tVal == "") {
			_alert("범례 항목에 추가할 값을 입력하세요.");
			return;
		}
		else {
			for(var i = 0; i < $sValOpt.length; i++) {
				if($sValOpt.eq(i).val() == tVal) {
					_alert("중복된 값이 존재합니다.");
					return;
				}
			}
		}
		
		$seriesVal.append($("<option>").val(tVal).text(tVal));
		$tInpVal.val("");
		$tInpVal.focus();
	},
	
	_onClickSeriesValDelBt = function(e) {
		m$.form.find("[name=series_vals] option:selected").remove();
	},
	
	_onListClick = function(e) {
		if($(e.target).hasClass("mylogdata-more")) {
			_onMore(e);
		}
		else {
			_onListDataClick(e);
		}
	},
	
	_onMore = function(e) {
		// Tr에 데이타 추가(추가 ROW만큼, 시간단위로 지정된 기간까지) 요청
		var resp = $(e.target).data("response");
		
		var etime = _SL.formatDate.addMin(resp.start_time, options.cycle);
		
		_addRequest(resp.start_time, etime, resp.startIndex + resp.rows, $(e.target).closest("tr"));
	},

	_onListDataClick = function(e) {
		var o = $(e.target);
		var fldName = options.viewFields[o.index()];
		var fldValue = o.attr("aria-value");
		var stime = o.closest("tr").attr("aria-value").substring(0, 12);

		goLogSearch(stime, fldName, fldValue, 1);
	},
	
	// Handler : 미사용
	_onScroll = function() {
		var contentHeight  = m$.listContainer.prop("scrollHeight");
		var scrollHeight = m$.listContainer.scrollTop() + m$.listContainer.height();
		
		if(!vars.scrollflag && scrollHeight >= contentHeight) { //문서의 맨끝에 도달했을때 데이타 추가 
			//vars.scrollflag = true;
			// TODO
			// 현재 마지막 Row의 start_time을 구해, sindex와 rows 값이 total이면 이전 시간 start_time을 호출
			// sindex와 rows 값이 total보다 작으면 sindex += rows, rows = total - sindex; 만약 rows가 rowsPerOut이면 rows = rowsPerOut
			
			// removeRows를 2분간 정지...
			// _repeatSearch();
			
			vars.scrollflag = false;
		}
	},
	
	goLogSearch = function(stime, fldName, fldValue, period) {
		var q = options.strQuery;
		
		if(fldValue) {
			if(fldValue == "-") {
				if(q != "") q = "(" + q + ") AND ";
				q += fldName + ":*";
			}
			else if(fldValue == "_etc") {
				q = (q == "" ? "*:*" : "(" + q + ")") + " NOT ";
				q += fldName + ":(" + options.series_vals.join(" ") + ")"; 
			}
			else {
				if(q != "") q = "(" + q + ") AND ";
				q += fldName + ":" + _SL.luceneValueEscape(fldValue);
			} 
		}
		
		var $form = $("<form>").attr({
			target : "logSearchWin_" + (new Date()).getTime(),
			action : urlLogSearch,
			method : "post"
		});

		$form
			.append( $("<input type='hidden' name='start_time'>").val(stime) )
			.append( $("<input type='hidden' name='end_time'>").val(_SL.formatDate.addMin(stime, period ? period : options.chartPeriod)) )
			.append( $("<input type='hidden' name='myfilter_id'>").val(config_param.myfilter_id) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(q) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	},
	
	_chartStyle = {
		"paletteColors": "89cf43,0099ff,ced2ff,9fa7ff,6dd0f7,dfbcfe,7dcbff,c07cfe,669933,dddddd",
		"showValues": "0"
		//"toolTipBgAlpha": "80",
		//"toolTipBorderRadius": "2",
		//"toolTipPadding": "5"
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
		afterSaveConfig	: afterSaveConfig,
		goLogSearch		: goLogSearch
	};
}