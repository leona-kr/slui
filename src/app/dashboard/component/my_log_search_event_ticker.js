//# sourceURL=my_log_search_event_ticker.js

'use strict';

_SL.nmspc("component").my_log_search_event_ticker = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	urlMyLogSearchTicker= gCONTEXT_PATH + "component/my_log_search_event_ticker.json",
	urlMyfilterList		= gCONTEXT_PATH + "monitoring/myfilter_list.json",
	urlMyfilter			= gCONTEXT_PATH + "monitoring/myfilter_keywords.json",
	urlLogSearch		= gCONTEXT_PATH + "monitoring/log_search.html",
	
	riskClass = {
		ok		: "highlight-success",
		low		: "highlight-attention",
		middle	: "highlight-warning",
		high	: "highlight-danger"
	},
	
	config_param = configParam,
	component_title = config_param.component_nm ? config_param.component_nm : componentTitle,
	isOpenConfig = false,
	
	admin_config = {
		limit_period_min: _SL.ifNull(slapp.component.my_log_search_event_ticker.admin_config.limit_period_min, 60),
		limit_row		: _SL.ifNull(slapp.component.my_log_search_event_ticker.admin_config.limit_row, 10000)
	},
	
	mState = {
		isFirst : true
	},
	//riskClassTr = "event_ok-tr,event_low-tr,event_middle-tr,event_high-tr",
	//riskClassTd = "event_ok-td,event_low-td,event_middle-td,event_high-td",
	
	defaultOptions = {
		component_nm : componentTitle,
		myFilterName : "",
		viewFields : ["src_ip","dstn_ip","dstn_port"],
		searchRows : 10,
		strQuery : "",
		limitRow : admin_config.limit_row,
		limitMin : 30,
		low : 0,
		middle : 0,
		high : 0,
		delay : 1
	},
	
	options = {},
	
	m$ = {
		tit		    : $("#componentheader_" + containerId + " .area-title"),
		body		: $("#componentbody_" + containerId),
		listTable	: $("#list_table_" + containerId),
		form		: $("#config_" + containerId + " form")
	},

	load = function() {
		$.extend(options, defaultOptions);
		
		if (mState.isFirst) {
			m$.form.find("[name=limitMin] option").each(function() {
				if(parseInt(this.value) > admin_config.limit_period_min) $(this).remove();
			});
			
			m$.form.find(".list_row").text(_SL.toComma(options.limitRow));
			mState.isFirst = false;
		}
		
		m$.listTable.off("click").on("click", ".mylogdata-td", function(e) {
			e.preventDefault();
			goLogSearch($(this).parent());
		});
		
		if(config_param) {
			$.extend(options, config_param);
		
			if(config_param.myfilter_type) {
				if(config_param.myfilter_type == "1") {
					console.log("미지원 myfilter_type[1]!!!")
					return;
				}
				
 				// 내 검색조건 정보 조회
				$("body").requestData(urlMyfilter, { myfilter_id : options.myfilter_id }, {callback : function(rsJson){
					
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
					
					_dispFieldCaption();
					_calcSearchPeriod();
					refresh();
				}});
 				
 				return;
			}
		}
		else {
			this.config_param = config_param = {};
		}
		
		_dispFieldCaption();
		_calcSearchPeriod();
		refresh();
	},
		
	_calcSearchPeriod = function() {
		var periodUnit = 1;
		var limitMin = options.limitMin;
		var loadPeriod = Math.min(limitMin, 360);
		
		options.periodUnit = periodUnit;
		
		var eTime = _SL.formatDate.addMin(gGetServerTime(), -options.delay);
		var nMod = parseInt(eTime.substring(10, 12), 10) % periodUnit;
		
		if(nMod != 0) {
			eTime = _SL.formatDate.addMin(eTime, periodUnit - nMod);
		}
		
		options.schEndTime = eTime;
		options.schStartTime = _SL.formatDate.addMin(eTime, -loadPeriod);
	},
	
	refresh = function() {

		if(config_param.component_nm || config_param.component_nm == ""){
			m$.tit.text(config_param.component_nm);
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
				query		: options.strQuery, 
				pageRow		: options.searchRows, 
				limitMin	: options.limitMin,
				schStartTime : options.schStartTime,
				schEndTime	: options.schEndTime,
				periodUnit	: options.periodUnit,
				delay		: options.delay,
				viewFields	: options.viewFields.join(",")
			};
			$("body").requestData(urlMyLogSearchTicker, param, {callback : function(rsJson) {
				options.limitMin = rsJson.limit_min;
				options.limitRow = rsJson.limit_row;
				
				var $sTitle = m$.body.find(".sp-title h5");
				
				m$.body.find(".list_row").html(_SL.toComma(options.limitRow));
				
				var
				view_text  = "["+ _SL.formatDate(options.schStartTime, "yyyyMMddHHmm", "MM-dd HH:mm");
				view_text += " ~ ";
				view_text += _SL.formatDate(options.schEndTime, "yyyyMMddHHmm", "MM-dd HH:mm") + "]";
				
				if (options.myFilterName == "") {
					options.myFilterName = "검색조건 없음";
				} 
				$sTitle.html(options.myFilterName + " - " + view_text)
					.attr('data-ui','tooltip')
					.data('text', "검색조건 : " + options.strQuery);
				
				_outputData(rsJson);
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
		
		// 내 검색조건 가져오기
		$("body").requestData(urlMyfilterList, {}, {callback:function(rsJson) {
			var $myFilterInfo = m$.form.find("[name=myFilterInfo]")
									.html('<option value="">[선택하세요]</option>');
			
			for(var i = 0, len = rsJson.length; i < len; i++) {
				$("<option />")
					.attr(myfilterId == rsJson[i].myfilter_id ? {selected:true} : {})
					.val(JSON.stringify(rsJson[i]))
					.text(rsJson[i].myfilter_name)
					.appendTo($myFilterInfo);
			}
		}});
		
		if(options.component_nm || options.component_nm == ""){
			$("#config_" + containerId+" h4").text(options.component_nm);
		}
	},
	
	beforeSaveConfig = function() {
		var strMyFilterInfo, oMyFilterInfo;
		
		config_param.component_nm = m$.form.find("[name=component_nm]").val();
		config_param.limitMin	= m$.form.find("[name=limitMin]").val();
		config_param.searchRows	= m$.form.find("[name=searchRows]").val();
		config_param.low		= m$.form.find("[name=low]").val();
		config_param.middle		= m$.form.find("[name=middle]").val();
		config_param.high		= m$.form.find("[name=high]").val();
		
		strMyFilterInfo 		= m$.form.find("[name=myFilterInfo]").val();
		
		if(strMyFilterInfo == "" || strMyFilterInfo == null) {
			delete config_param.myfilter_id;
			delete config_param.myfilter_type;
			delete config_param.myfilter_name;
		}
		else if(strMyFilterInfo != "") {
			oMyFilterInfo = $.parseJSON(strMyFilterInfo);
			config_param.myfilter_id	= oMyFilterInfo.myfilter_id;
			config_param.myfilter_type	= oMyFilterInfo.myfilter_type;
			config_param.myfilter_name	= oMyFilterInfo.myfilter_name;
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
		var strCaption, $tr;
		
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
		
		if ( $thead.find("th").length == 0) {
			var $tr = $("<tr>")
				.append("<th>번호</th>")
				.append("<th>위험도</th>")
				.append("<th>최근발생시간</th>");
			
			for (var idx in options.viewFields) {
				if (options.viewFields[idx] == "eqp_dt") {
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
		var rsRow, fldName, cont, ariaValue, $curTr, $curTd, groupByCount, viewNo, risk;
		var $logTable = m$.listTable;
		var $tbody = $logTable.find("tbody").empty();

		// 기존 Row 삭제
		//$tbody.find("tr").fadeOut(1000).remove();
		
		// 결과 Data가 있을 경우 데이타 출력
		if(!!rsList && rsList.length > 0) {
			var trArray = [];
			
			// Table에 데이타 표시
			for(var rnum in rsList) {
				rsRow = rsList[rnum];
				
				groupByCount = rsRow.group_by_count;
				
				// 사용자가 선택한 항목 표시
				$curTr = $("<tr>"); 
				
				viewNo = parseInt(rnum) + 1;
				
				//add no
				$curTr.append("<td class='mylogdata-td'>"+viewNo+"</td>");
				
				// add risk
				risk = _riskData(groupByCount);
				$curTr.append("<td class='mylogdata-td '"+riskClass[risk]+">"+risk+"</td>");
				$curTr.addClass("row-link");
				
				//add last eqp_dt
				$curTd = $("<td>");
				
				cont = rsRow["max_eqp_dt"] + "";
				
				ariaValue =_SL.formatDate(cont, "yyyyMMddHHmm");
				cont = _SL.formatDate(cont, "yyyyMMddHHmm", "yyyy-MM-dd HH:mm");
				$curTd
					.attr("title", cont)
					.attr("data-value", ariaValue)
					.append(cont)
					.appendTo($curTr);
				
				for(var i in options.viewFields) {
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
						}
						else {
							title_txt += "가 없습니다.";
						}
						
						$curTd.attr({
							"data-value2" : cont,
							'data-ui' : 'tooltip'
						})
						.data('text',title_txt)
						.append(cont);
					} else if(fldName =="recv_time") {
						//add recv_time
						$curTd.attr("data-value2", cont);
						cont = _SL.formatDate(cont, "yyyyMMddHHmmss", "yyyy-MM-dd HH:mm:ss");
						$curTd.append(cont);
					} else if(fldName =="dstn_country_code" || fldName =="src_country_code") {
						
						$curTd.attr("aria-value2", cont);
						prefix = fldName.match(/^[^_]+_/);
						flagCode = rsRow[prefix + "country_code"];
						
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
				$curTr.append("<td class='mylogdata-td'>"+_SL.toComma(groupByCount)+"</td>")
					.appendTo($tbody)
					.hide()
					.fadeIn(1500);
			}
		} else {
			$curTr = $("<tr height=25>")
				.append("<td colspan='"+options.viewFields.length + 4+"'>검색 결과가 없습니다.</td>")
				.appendTo($tbody)
				.hide()
				.fadeIn(1500);
		}

		// tooltip event attach
		slui.attach.tooltip("#componentcontainer_" + containerId);
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
	
	goLogSearch = function(oRow) {
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
				target : "MyLogSearchTickerWin_" + (new Date()).getTime(),
				action : urlLogSearch,
				method : "post"
			})
			.append( $("<input type='hidden' name='start_time'>").val(options.schStartTime) )
			.append( $("<input type='hidden' name='end_time'>").val(options.schEndTime) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(strQuery) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	}
	
	//DUMMY;
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		isOpenConfig	: isOpenConfig,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig,
		goLogSearch		: goLogSearch
	};
}