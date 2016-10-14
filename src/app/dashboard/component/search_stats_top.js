//# sourceURL=search_stats_top.js
'use strict';

_SL.nmspc("slapp.component").search_stats_top = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$header		= $("#componentheader_" + containerId),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),	
	$list		= $body.find(".grid-table-group"),
	$chartDiv	= $body.find(".chart-group"),
	$title		= $header.find(".area-title"),
	
	$lastPeriod		= $form.find("[name=last_period]"),
	$groupField		= $form.find("[data-name=group_field]"),
	$rows			= $form.find("[name=rows]"),
	$listYn			= $form.find("[name=list_yn]"),
	
	urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlConfigMap	= gCONTEXT_PATH + "component/top_stats_mng_use_list.json",	
	urlSelect		= gCONTEXT_PATH + "component/top_stats_data_1h.json",
	urlLogSearch	= gCONTEXT_PATH + "monitoring/log_search.html",
	
	default_param 	= {last_period : "10080", rows : "5", list_yn : "N", top_code : "", item_seq:"", field_nm : "", time_reference : "", start_time : "", end_time : ""},
	config_param 	= configParam,
	component_title = componentTitle,

	gRsJson = null,
	
	gGrpFldArr = null,
	
	tree = null,
	
	load = function() {
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		chartStyle = $.extend(this.chartstyles, chartStyle);
		chartStyle.paletteColors = chartStyle.top5Colors;
		
		// Load 시 Cash Data 를 생성하기 위해 time_reference 값 setting
		config_param.time_reference = "";
		
		//설정 초기화
		initConfig();
		
		refresh();
	},

	refresh = function(isRefresh) {
		var refreshCallback = function(rsJson){
			gRsJson = rsJson;
			// Cash Data 를 확인하기 위한 시간 정보
			config_param.time_reference = rsJson.end_time;

			// 로그 검색 link 연동 시간 정보
			config_param.start_time = rsJson.start_time;
			config_param.end_time = rsJson.end_time;

			var fieldNm,
			 grpFldArr = [],
			 grpCvtFldArr = [],
			 funcNm = "COUNT";

			if(rsJson.top_item_mng != null){
				var topItem = rsJson.top_item_mng;
				gGrpFldArr = grpFldArr = (topItem.group_fields).split(",");

				for(var i in grpFldArr){
					grpCvtFldArr[i] = LogCaptionInfo[grpFldArr[i]];
				}

				fieldNm = grpCvtFldArr.join(",");

				funcNm = (topItem.func).toUpperCase();

				if(topItem.func != "count"){
					var funcFldNm = LogCaptionInfo[topItem.field_nm] ? LogCaptionInfo[topItem.field_nm] : topItem.field_nm;
					funcNm +="("+ funcFldNm +")";
				} 

				// 차트 X축 필드 표시
				chartStyle.xAxisName = fieldNm;
				chartStyle.yAxisName = funcNm;
			}
			
			// Title 필드 표시
			var titleStr = "";
			if(fieldNm != null){
				var $lastPeriodTxt = $form.find("[name=last_period]").find("[value=" + config_param.last_period + "]");

				titleStr = rsJson.top_mng.top_name  + "/" + fieldNm + " 순위 [" + $lastPeriodTxt.text() + "]"
				$title.text(titleStr);
			}
			
			//list draw
			if(config_param.list_yn == "N"){
				$list.hide();
			}else{
				var $thead = $list.find("thead").empty(),
				$tbody = $list.find("tbody").empty(),
				thead_tr = '<tr>';

				thead_tr += '<th scope="col">순위</th>';
				for(var idx in grpCvtFldArr){
					thead_tr += '<th scope="col">'+grpCvtFldArr[idx]+'</th>';
				}
				thead_tr += '<th scope="col">'+funcNm+'</th>';
				thead_tr += '<th scope="col">비율</th>';
				thead_tr += '</tr>';

				$thead.html(thead_tr);

				if(rsJson.list.length == 0) {
					var spansize = $thead.find('th').size();
					$tbody.html('<tr><td colspan="'+spansize+'" class="list-empty">There is no Result.</td></tr>');
				}else{
					//순위 목록
					var topCount = 0;
					for(var i = 0, len =rsJson.list.length; i < len; i++) {
						// 로그 검색 link 연동 검색 필드 정보
						var strHref = 'javascript:$.Dashboard.componentInstance[\"'+containerId+'\"].goSearchPopup("'+ rsJson.start_time +'","'+ rsJson.end_time +'","'+ i +'")',
							_html = '<tr>';

						_html += "<td>"+(i+1)+"</td>";
						for(var idx in grpFldArr){
							_html += "<td><a href='"+strHref+"'>"+(rsJson.list[i])[grpFldArr[idx]]+"</a></td>"
						} 
						_html += '<td>'+_SL.toComma(rsJson.list[i].value )+'</td>';

						if(rsJson.total ==0){
							_html += '<td>'+_SL.formatNumber(rsJson.total) + '%</td>';
						}else{
							_html += '<td>'+_SL.formatNumber({decimals:2},rsJson.list[i].value/rsJson.total*100 ) + '%</td>';
						}
						_html += '</tr>';

						$tbody.append(_html);

						topCount = topCount + rsJson.list[i].value;

						//차트 링크 지정
						rsJson.list[i].link = strHref;
					}
					
					//기타 목록
					var etcCount = rsJson.total - topCount;
					if(etcCount > 0){
						var _trhtml = '<tr>';
						_trhtml += '<td>기타</td>';

						for(var idx in grpFldArr){
							_trhtml += '<td></td>';
						}
						_trhtml += '<td>'+_SL.toComma(etcCount )+'</td>';
						_trhtml += '<td>'+_SL.formatNumber({decimals:2},etcCount/rsJson.total*100 ) + '%</td>';
						_trhtml += '</tr>';

						$tbody.append(_trhtml);
					}
				}
				$list.show();
			}

			//chart draw
			if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
				$.Dashboard.chartInstance[containerId].setJSONData({
					chart : chartStyle,
					data  : rsJson.list
				});
			} else {
				FusionCharts.ready(function(){
					$.Dashboard.chartInstance[containerId] = new FusionCharts({
						type: 'bar2d',
						renderAt: 'chart-container_' + containerId,
						width: '100%',
						height: (config_param.rows == "5" ? 220 : 260),
						dataFormat: 'json',
						dataSource: {
							chart : chartStyle,
							data  : rsJson.list
						}
					}).render();
				});
			}
		};

		if(config_param.item_seq) {
			$("body").requestData(urlSelect, config_param, {callback : refreshCallback});
		}
	},
	
	showConfig = function() {
		$lastPeriod.val(config_param.last_period);
		$rows.val(config_param.rows);
		$form.find("[name=list_yn]:input[value=" + config_param.list_yn + "]").prop("checked", true);
		$groupField.dynatree("getTree").activateKey(config_param.top_code + "|" + config_param.item_seq);
	},
	
	beforeSaveConfig = function(){
		config_param.group_field = $groupField.val();
		config_param.last_period = $lastPeriod.val();
		config_param.rows = $rows.val();
		config_param.list_yn = $form.find("[name=list_yn]:checked").val();

		var tNode = $groupField.dynatree("getTree").getActiveNode();

		if(!tNode)	return;
		
		var treeKey = tNode.data.key;
		config_param.top_code = treeKey.split("|")[0];
		config_param.item_seq = treeKey.split("|")[1];
	},
	
	afterSaveConfig = function() {
		refresh(true);
	},
	
	initConfig = function(){//	$groupField
		var initCallback = function(rsJson, rsCd, rsMsg){
			var TopStatsMngGroupFieldUseTreeData = null,
			TopMngGroupFieldUseTreeDataArr = [],
			oCurRow, strTopName, bActive;

			// 사용자 정의 통계 Tree
			for(var idx in rsJson.topMngGroupFieldUseList) {
				oCurRow = rsJson.topMngGroupFieldUseList[idx];
				strTopName = oCurRow.top_name;
				
				bActive = oCurRow.group_feild == config_param.field_nm;
				
				if(TopStatsMngGroupFieldUseTreeData == null || TopStatsMngGroupFieldUseTreeData.title != strTopName) {
					TopStatsMngGroupFieldUseTreeData = {title : strTopName, isFolder : true, children : []};
					TopMngGroupFieldUseTreeDataArr.push(TopStatsMngGroupFieldUseTreeData);
				}
				
				if(bActive) TopStatsMngGroupFieldUseTreeData.expand = true;
				
				var grpFldArr = oCurRow.group_field.split(",");
				
				for(var i in grpFldArr){
					grpFldArr[i] = LogCaptionInfo[grpFldArr[i]];
				}
				
				TopStatsMngGroupFieldUseTreeData.children.push({
					title : oCurRow.item_seq -1 + "." + grpFldArr.join(",") +"("+ (oCurRow.func).toUpperCase() +")" + "[" + oCurRow.group_field + "]", 
					tooltip : oCurRow.item_seq -1 + "." + grpFldArr.join(",") + "[" + oCurRow.group_field + "]", 
					key : oCurRow.top_code + "|" + oCurRow.item_seq 
				});
			}
	
			$groupField.dynatree({
		 		minExpandLevel : 1,
		 		clickFolderMode : 2,
				autoCollapse : true,
				children : TopMngGroupFieldUseTreeDataArr
			});
			
			tree = $groupField.dynatree("getTree");
		}
		//분석필드
		$("body").requestData(urlConfigMap,{},{callback : initCallback});
	},

	chartStyle = {
		"caption": "",
		"subCaption": "",
		"numberPrefix": ""
	},
	
	goSearchPopup = function(sTime,eTime,i){
		var expertKeyword ="",
		 fieldval;

		for(var idx in gGrpFldArr){
			fieldval = (gRsJson.list[i])[gGrpFldArr[idx]];
			
			if (expertKeyword != "") expertKeyword += " AND ";

			if(fieldval == "-"){
				expertKeyword += "NOT " + gGrpFldArr[idx] + ":*";
			}else{
				expertKeyword += gGrpFldArr[idx] + ":" + _SL.luceneValueEscape(fieldval);
			}
		}

		expertKeyword +=  " AND (" + gRsJson.top_mng.search_condition + ")";

		var $logSearchForm = $body.find("[name=logSearchForm]");
		
		$("[name=start_time]", $logSearchForm).val(sTime);
		$("[name=end_time]", $logSearchForm).val(eTime);
		$("[name=expert_keyword]", $logSearchForm).val(expertKeyword);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			action : urlLogSearch,
			target : winName,
			method : "post"
		}).submit();

	};
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig,
		goSearchPopup	: goSearchPopup
	};
}
