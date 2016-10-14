//# sourceURL=my_group_log_search.js

'use strict';

_SL.nmspc("component").my_group_log_search = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	urlMyfilterList		= gCONTEXT_PATH + "monitoring/myfilter_list.json",
	urlMyfilter			= gCONTEXT_PATH + "monitoring/myfilter_keywords.json",
	urlMyGroupLogSearch	= gCONTEXT_PATH + "component/my_group_log_search.json",
	urlLogSearch		= gCONTEXT_PATH + "monitoring/log_search.html",
	
	config_param = configParam,
	component_title = config_param.component_nm ? config_param.component_nm : componentTitle,
	isOpenConfig = false,
	
	riskClass = {
		ok		: "highlight-success",
		low		: "highlight-attention",
		middle	: "highlight-warning",
		high	: "highlight-danger"
	},
	
	admin_config = {
		limit_period_min: _SL.ifNull(slapp.component.my_group_log_search.admin_config.limit_period_min, 60),
		limit_row		: _SL.ifNull(slapp.component.my_group_log_search.admin_config.limit_row, 10000),
		limit_chart_row	: _SL.ifNull(slapp.component.my_group_log_search.admin_config.limit_chart_row, 10),
	},
	
	//riskClassTr = "event_ok-tr,event_low-tr,event_middle-tr,event_high-tr",
	//riskClassTd = "event_ok-td,event_low-td,event_middle-td,event_high-td",
	
	defaultOptions = {
		component_nm  : componentTitle,
		myFilterName : "",
		viewFields : ["src_ip","dstn_ip","dstn_port"],
		searchRows : 10,
		strQuery : "",
		limitRow : admin_config.limit_row,
		limitMin : 30,
		chart_yn : "N",
		chart_type : "msline",
		low : 0,
		middle : 0,
		high : 0,
		delay : 1
	},
	
	options = {},
	
	m$ = {
		tit		    : $("#componentcontainer_" + containerId + " .area-title"),
		body		: $("#componentbody_" + containerId),
		chart		: $("#chart_" + containerId),
		listTable	: $("#list_table_" + containerId),
		form		: $("#config_" + containerId + " form")
	},

	mState = {
		oChart : null
	},
	
	load = function() {
		_chartStyle = $.extend(this.chartstyles, _chartStyle);

		// DOM 변경
		//var bfChartType = options.chart_type;
		
		$.extend(options, defaultOptions);
		
		m$.form.find("[name=limitMin] option").each(function() {
			if(parseInt(this.value) > admin_config.limit_period_min) $(this).remove();
		});

		m$.listTable.find(".mylogdata-td")
			.off("click")
			.on("click", function(e) {
				e.preventDefault();
				//_goLogSearch($(this).parent());
			});
		
		if(config_param) {
			$.extend(options, config_param);
		}else{
			this.config_param = config_param = {};
		}
		
		_createChart(options.chart_type);
		
		if(options.myfilter_type) {
			if(options.myfilter_type == "1") {
				console.log("미지원 myfilter_type[1]!!!")
				return;
			}
			
			// 내 검색조건 정보 조회
			var that = this;
			
			$("body").requestData(urlMyfilter, { myfilter_id : options.myfilter_id }, {callback : function(rsJson){
				if(options.myfilter_type == "1") {
					console.log("미지원 myfilter_type[1]!!!");
					return;
				}
				
				if(rsJson.keywords) {
					options.strQuery = rsJson.keywords;
					
					// 제목 변경
					options.myFilterName = config_param.myfilter_name;
					
					// 필드 변경
					if(rsJson.view_fields) {
						options.viewFields = rsJson.view_fields.replace(",eqp_dt","").replace("eqp_dt,","").split(",");
						if (!config_param.viewFields) {
							that.config_param.viewFields = config_param.viewFields = options.viewFields; 
						}
					}
				}
				
				_dispFieldCaption();
				_calcSearchPeriod();
				refresh();
			}});
			
			return;
		}
		
		_dispFieldCaption();
		_calcSearchPeriod();
		refresh();
	},
	
	_createChart = function(chartType) {
		if(config_param.chart_yn != "Y") return;

		if (!mState.oChart) {
			m$.chart.show();

			FusionCharts.ready(function(){
				$.Dashboard.chartInstance[containerId] = mState.oChart = new FusionCharts({
					renderAt : "chart_" + containerId,
					type: chartType,
					width : "100%",
					height : 180,
					dataFormat : "json",
					dataSource : {
						chart : _chartStyle,
						categories : [{category:[]}],
						dataset : []
					}
				}).render();
				
				mState.oChart.setTransparent(true);
			});
		} else {
			mState.oChart.chartType(chartType);
		}
	},
	
	_calcSearchPeriod = function() {
		var periodUnit = 1;
		var limitMin = options.limitMin;
		var loadPeriod = Math.min(limitMin, 360);
		
		if(limitMin > 60) {
			if(limitMin < 360) {
				periodUnit = limitMin / 60;
			} else if(limitMin == 360) {
				periodUnit = 5;
			} else {
				periodUnit = 10;
			}
		}
		
		options.periodUnit = periodUnit;
		
		var eTime = _SL.formatDate.addMin(gGetServerTime(), -options.delay);
		var nMod = parseInt(eTime.substring(10, 12), 10) % periodUnit;
		
		if(nMod != 0) {
			eTime = _SL.formatDate.addMin(eTime, periodUnit - nMod);
		}
		
		options.schEndTime = eTime;
		options.schStartTime = _SL.formatDate.addMin(eTime, -loadPeriod);;
	},
	
	refresh = function(isRefresh) {
		
		if(options.component_nm || options.component_nm == ""){
			m$.tit.text(options.component_nm);
		}
		
		if(isOpenConfig) return; 

		if (options.myFilterName == "" || options.strQuery == "") {
			_outputData({});
		} else {
			if(options.schEndTime < _SL.formatDate.addMin(gGetServerTime(), -options.delay)) {
				options.schEndTime = _SL.formatDate.addMin(options.schEndTime, options.periodUnit);
				
				if(options.schStartTime <= _SL.formatDate.addMin(options.schEndTime, -options.limitMin)) {
					options.schStartTime = _SL.formatDate.addMin(options.schStartTime, options.periodUnit);
				}
			}
			
			var param = {
				query : options.strQuery, 
				pageRow : options.searchRows, 
				limitMin : options.limitMin, 
				chartYn : options.chart_yn, 
				schStartTime : options.schStartTime,
				schEndTime : options.schEndTime,
				periodUnit : options.periodUnit,
				delay : options.delay,
				viewFields : options.viewFields.join(",")
			};
 
			$("body").requestData(urlMyGroupLogSearch, param, {callback : function(rsJson) {
				options.limitMin = rsJson.limit_min;
				options.limitRow = rsJson.limit_row;
										
				var $sTitle = m$.body.find(".sp-title h5");
				
				var 
				view_text = "[" + _SL.formatDate(options.schStartTime, "yyyyMMddHHmm", "MM-dd HH:mm");
				view_text += " ~ ";
				view_text += _SL.formatDate(options.schEndTime, "yyyyMMddHHmm", "MM-dd HH:mm") + "]";
				
				m$.body.find(".list_row").html(_SL.toComma(options.limitRow));
				
				if (options.myFilterName == "") {
					options.myFilterName = "검색조건 없음";
				} 
				
				$sTitle.html(options.myFilterName + " - " + view_text)
					.attr('data-ui','tooltip')
					.data('text',"검색조건 : " + options.strQuery);
				
				_outputData(rsJson);

				if (options.chart_yn == "Y") {
					m$.chart.show();
					_chartData(rsJson);
				} else {
					m$.chart.hide();
				}

				slui.attach.tooltip("#componentcontainer_" + containerId);
			}});
		}
		
	},
	
	showConfig = function() {
		this.isOpenConfig = isOpenConfig = true; 

		var myfilterId = config_param.myfilter_id;

		m$.form.find("[name=component_nm]").val(options.component_nm);
		m$.form.find("[name=limitMin]").val(options.limitMin);
		m$.form.find("[name=searchRows]").val(options.searchRows);
		m$.form.find("[name=low]").val(options.low);
		m$.form.find("[name=middle]").val(options.middle);
		m$.form.find("[name=high]").val(options.high);
		m$.form.find("[name=chart_yn]:input[value=" + options.chart_yn + "]").prop("checked", true);
		m$.form.find("[name=chart_type]:input[value=" + options.chart_type + "]").prop("checked", true);
		
		// 내 검색조건 가져오기
		$("body").requestData(urlMyfilterList, {}, {callback:function(rsJson) {
			var $myFilterInfo = m$.form.find("[name=myFilterInfo]")
									.html("<option value=''>[선택하세요]</option>");
			
			for(var i = 0, len = rsJson.length; i < len; i++) {
				$("<option />")
					.attr(myfilterId == rsJson[i].myfilter_id ? {selected:true} : {})
					.val(JSON.stringify(rsJson[i]))
					.text(rsJson[i].myfilter_name)
					.appendTo($myFilterInfo);
			}
		}});

		if(options.component_nm || options.component_nm == ""){
			$("#config_" + containerId).find("h4").text(options.component_nm);
		}
	},

	beforeSaveConfig = function() {
		var strMyFilterInfo, oMyFilterInfo;
		
		config_param.component_nm	= m$.form.find("[name=component_nm]").val();
		config_param.limitMin	= m$.form.find("[name=limitMin]").val();
		config_param.searchRows = m$.form.find("[name=searchRows]").val();
		config_param.low		= m$.form.find("[name=low]").val();
		config_param.middle		= m$.form.find("[name=middle]").val();
		config_param.high		= m$.form.find("[name=high]").val();
		
		config_param.chart_yn	= m$.form.find("[name=chart_yn]:checked").val();
		config_param.chart_type	= m$.form.find("[name=chart_type]:checked").val();
		strMyFilterInfo			= m$.form.find("[name=myFilterInfo]").val();

		if(strMyFilterInfo == "" || strMyFilterInfo == null) {
			delete config_param.myfilter_id;
			delete config_param.myfilter_type;
			delete config_param.myfilter_name;
		}
		else if(strMyFilterInfo != "") {
			oMyFilterInfo = $.parseJSON(strMyFilterInfo);
			config_param.myfilter_id = oMyFilterInfo.myfilter_id;
			config_param.myfilter_type = oMyFilterInfo.myfilter_type;
			config_param.myfilter_name = oMyFilterInfo.myfilter_name;
		}
		
		this.config_param = config_param;
	},
			
	afterSaveConfig = function() {
		this.isOpenConfig = isOpenConfig = false;
		this.load();
	},
	
	cancelConfig = function() {
		this.isOpenConfig = isOpenConfig = false;
	},
	
	// 내부용
	_dispFieldCaption = function() {
		var $sTitle = m$.body.find(".sp_title");
		var $logTable = m$.listTable;
		//var strCaption, $tr;
		
		var view_text = "";
		
		if (options.myFilterName == "") {
			options.myFilterName = "검색조건 없음";
		}
		if (options.schStartTime) {
			view_text += " - [";
			view_text += _SL.formatDate(options.schStartTime, "yyyyMMddHHmm", "yyyy-MM-dd HH:mm") + " ~ " + _SL.formatDate(options.schEndTime, "yyyyMMddHHmm", "yyyy-MM-dd HH:mm");
			view_text += "]";
		}
		
		// 헤더 갱신
		var oldView = config_param.viewFields ? config_param.viewFields.join(",") : "";
		var newView = options.viewFields ? options.viewFields.join(",") : "";
		var $thead = $logTable.find("thead");
		var $tbody = $logTable.find("tbody");
		
		if (oldView != newView) {
			config_param.viewFields = options.viewFields;
			$thead.empty();
			$tbody.empty();
		}
		
		if ($thead.find("th").length == 0) {
			var $tr = $("<tr>")
				.append("<th width='40'>번호</th>")
				.append("<th width='60'>위험도</th>")
				.append("<th>최근발생시간</th>");
			
			for (var idx in options.viewFields) {
				if (options.viewFields[idx] == "eqp_dt") {
					//strCaption = "최근발생시간";
					continue;
				} 
				
				$tr.append("<th>" + _SL.ifNull(LogCaptionInfo[options.viewFields[idx]], options.viewFields[idx]) + "</th>");
			}
			
			$tr.append("<th>건수</th>");
			
			$thead.append($tr);
		}
		
		if ($tbody.find("td").length == 0) {
			$tbody.append('<tr><td colspan="'+options.viewFields.length + 4+'">검색중입니다...</td></tr>');
		}
	},

	_outputData = function(rsJson) {
		var rsList = _SL.ifNull(rsJson.rsList, {});
		var assetMap = _SL.ifNull(rsJson.assetMap, {});
		var rsRow, fldName, cont, ariaValue, $curTr, $curTd, allFld, groupByCount, risk;
		var $logTable = m$.listTable;
		var $tbody = $logTable.find("tbody").empty();
		
		// 기존 Row 삭제
		//$tbody.find("tr").fadeOut(1000).empty();
		
		// 결과 Data가 있을 경우 데이타 출력
		if(!!rsList && rsList.length > 0) {
			var trArray = [];
			
			// Table에 데이타 표시
			for(var rnum in rsList) {
				rsRow = rsList[rnum];
				
				groupByCount = rsRow.group_by_count;
				
				// 사용자가 선택한 항목 표시
				$curTr = $("<tr>").addClass("row-link"); 

				//add no
				$curTr.append("<td class='mylogdata-td'>"+parseInt(rnum) + 1+"</td>");
				
				// add risk
				risk = _riskData(groupByCount);
				$curTr.append("<td class='mylogdata-td '"+riskClass[risk]+">"+risk+"</td>");

				//add last eqp_dt
				$curTd = $("<td>").addClass('mylogdata-td');

				cont = rsRow.max_eqp_dt + "";
				
				ariaValue =_SL.formatDate(cont, "yyyyMMddHHmm");
				cont = _SL.formatDate(cont, "yyyyMMddHHmm", "yyyy-MM-dd HH:mm");
				$curTd.attr("title", cont)
						.attr("data-value", ariaValue)
						.append(cont)
						.appendTo($curTr);

				//for(var i in options.viewFields) {
				for( var i=0, len=options.viewFields.length; i<len; i++){
					fldName = options.viewFields[i];
					cont = rsRow[fldName] + "";
					
					$curTd = $("<td class='mylogdata-td'>");
					
					if(fldName == "eqp_dt") {
						continue;
					} else if(fldName.indexOf("ip") > -1 && cont != "-") {
						var title_txt = "* 자산정보";
						var assetData = assetMap[cont];
						if (assetData) {
							title_txt += "<br> - 자산명 : " + assetData.asset_nm;
							title_txt += "<br> - 아이피 : " + assetData.sip + "~" + assetData.eip;
							title_txt += "<br> - 직급 : " + _SL.ifNull(assetData.grade, "");
							title_txt += "<br> - 본부 : " + _SL.ifNull(assetData.division, "");
							title_txt += "<br> - 부서 : " + _SL.ifNull(assetData.department, "");
							title_txt += "<br> - 관리자 : " + _SL.ifNull(assetData.manager, "");
						} else {
							title_txt += "가 없습니다.";
						}
						
						$curTd.attr({
							'data-value2' : cont,
							'data-ui' : 'tooltip'
						})
						.data('text',title_txt)
						.append(cont);
						
					} else if(fldName =="recv_time") {
						//add recv_time
						$curTd.attr("data-value2", cont)
							.append( _SL.formatDate(cont, "yyyyMMddHHmmss", "yyyy-MM-dd HH:mm:ss") );
					} else if(fldName =="dstn_country_code" || fldName =="src_country_code") {
						
						$curTd.attr("data-value2", cont);
						var prefix = fldName.matc
						h(/^[^_]+_/);
						var flagCode = rsRow[prefix + "country_code"];

						if(flagCode) {
							if(flagCode =="PRN") flagCode = "PR-N";
							else if(rsRow[prefix + "country_name"] =="N/A") flagCode = "N-A";
					
							$curTd.append("<img src='/resources/images/flag/" + flagCode + ".png' style='margin-right:5px;'>");
						}

						$curTd.append(cont);
					} else {
						$curTd.attr("data-value2", cont);
						if(cont.length > 55) {
							$curTd.attr("title", cont);
							cont = _SL.htmlEscape(cont);
							cont = cont.substring(0,55) +"...";
						} 
						$curTd.append(cont);
					}

					$curTr.append($curTd);
				}
				
				// add group by count
				$curTr.append("<td class='mylogdata-td'>" + _SL.toComma(groupByCount) + "</td>")
					.appendTo($tbody)
					.hide()
					.fadeIn(1500);
			}
		} else {
			$curTr = $("<tr>")
				.append("<td colspan='"+options.viewFields.length + 4+"'>검색 결과가 없습니다.</td>")
				.appendTo($tbody)
				.hide()
				.fadeIn(1500);
		}
		
	},
	
	_riskData = function (groupByCount) {
		var low    = options.low;
		var middle = options.middle;
		var high   = options.high;
		
		if (low == 0) low = groupByCount + 1;
		if (middle == 0) middle = groupByCount + 1;
		if (high == 0) high = groupByCount + 1;
		
		if (groupByCount >= low && groupByCount < middle) {
			return "low";
		} else if (groupByCount >= middle && groupByCount < high) {
			return "middle";
		} else if (groupByCount >= high) {
			return "high";
		} else {
			return 'ok';
		}
	},
	
	_chartData = function (rsJson) {
		var tttt = new Date().getTime();
		//console.log("data start : " + tttt);
		var chartDataMap = rsJson.chartDataMap ? rsJson.chartDataMap : {};
		var chartData = {
			chart : _chartStyle,
			categories : [],
			dataset : []
		};
		
		var dataArray = [];
		var sTime = options.schStartTime;
		var eTime = options.schEndTime;
		for (var cTime = sTime; cTime < eTime; cTime = _SL.formatDate.addMin(cTime, options.periodUnit)) {
			dataArray.push(_SL.formatDate(cTime, "MM-dd HH:mm"));	
		}
		
		var dataset = [];
		var category = [];
		
		var dataMap = {};
		var dataList, rsDataList, dataLen, oKey, data;
		
		for (var n in dataArray) {
			category.push({label : dataArray[n]});
		}
		
		for (var n in chartDataMap) {
			dataList = chartDataMap[n];
			rsDataList = [];
			oKey = JSON.parse(n);
			
			dataLen = dataList.length;
			dataMap = {};
			
			for (var i=0; i < dataLen; i++) {
				dataMap[_SL.formatDate(dataList[i].eqp_dt, "MM-dd HH:mm")] = dataList[i];
			}
			
			/*//임시 데이터
			for (var j = dataArray.length - i; j > 0 ; j--) {
				dataMap[dataArray[j - 1]] = $.extend({}, dataList[dataLen-1]);
			}*/
			
			for (var d in dataArray) {
				data = _setChartData(dataMap, dataArray[d], oKey);
				rsDataList.push(data);
			}
			
			dataset.push({seriesname : _setFieldsName(oKey), data : rsDataList});
		}
		
		dataset.sort(function(a, b){
		    var a1 = parseInt(a.seriesname.split(" ")[0]), b1 = parseInt(b.seriesname.split(" ")[0]);
		    if (a1 == b1) {
		    	return 0;
		    }
		    return (a1 > b1) ? 1 : -1;
		});
		
		chartData.categories.push({category : category});
		chartData.dataset = dataset;
		//console.log("data end : " + (new Date().getTime() - tttt));
		
		mState.oChart.setChartData(chartData, "json");
		//console.log("chart is done : " + (new Date().getTime() - tttt));
	},
	
	_setChartData = function (sumMap, edate, oKey) {
		var resultData = {value : 0};
		
		var data = sumMap[edate];
		if(data) {
			resultData.link  = "JavaScript:$.Dashboard.componentInstance['" + containerId + "'].goLogSearchChart(" + oKey["rank"] + "," + "'" + data.eqp_dt + "')";
			resultData.value = data.group_by_count;
		}
		
		return resultData;
	},
	
	_setFieldsName = function(oKey) {
		return oKey.rank + " 순위";
	},
	
	goLogSearchChart = function(rank, sdate) {
		var $row = m$.listTable.find("tbody tr:eq(" + rank + ")");
		var edate = _SL.formatDate.addMin(sdate, options.periodUnit);
		
		_goLogSearch($row, sdate, edate);
	},
	
	_goLogSearch = function(oRow, sdate, edate) {
		var viewFields = options.viewFields;
		var viewFieldQuerys = [];
		var viewNotFieldQuerys = [];
		var strQuery =  "(" + options.strQuery + ")";
		var value;
		
		var $td = oRow.find("td");
		
		var idx;
		var viewField;
		for (var n in viewFields) {
			idx = parseInt(n);
			viewField = viewFields[idx];
			value=  $.trim($td.eq(idx + 3).attr("data-value2"));
			if (viewField == "eqp_dt") {
				continue;
			} else {
				if (value == "-" || value == "") {
					viewNotFieldQuerys.push(viewField + ":*");
				} else {
					viewFieldQuerys.push(viewField + ":" + _SL.luceneValueEscape(value));
				}
			}
		}
		
		strQuery += " AND " + viewFieldQuerys.join(" AND ");
		if (viewNotFieldQuerys.length > 0) {
			strQuery += " NOT " + viewNotFieldQuerys.join(" NOT ");
		}
		
		$("<form>")
			.attr({
				target : "MyGrouplogSearchWin_" + (new Date()).getTime(),
				action : urlLogSearch,
				method : "post"
			})
			.append( $("<input type='hidden' name='start_time'>").val(_SL.ifNull(sdate, options.schStartTime)) )
			.append( $("<input type='hidden' name='end_time'>").val(_SL.ifNull(edate, options.schEndTime)) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(strQuery) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	},
	
	_chartStyle = {
		"paletteColors": "89cf43,0099ff,ced2ff,9fa7ff,6dd0f7,dfbcfe,7dcbff,c07cfe,669933,dddddd",
		"showValues": "0"
	},
	
    DUMMY;
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		isOpenConfig	: isOpenConfig,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig,
		goLogSearchChart: goLogSearchChart
	};
}