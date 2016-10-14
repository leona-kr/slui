//# sourceURL=search_event.js
'use strict';

_SL.nmspc("slapp.component").search_event = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$header		= $("#componentheader_" + containerId),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),	
	$list		= $body.find(".grid-table-group"),
	$chartDiv	= $body.find(".chart-group"),
	$title		= $header.find(".area-title"),
	
	$rulesetId		= $form.find("[name=ruleset_id]"),
	$rulesetIdList	= $form.find("[name=ruleset_id_list]"),
	$groupCd		= $form.find("[name=group_cd]"),
	$eventCateCd	= $form.find("[name=event_cate_cd]"),
	$eventLevel		= $form.find("[name=event_level]"),
	$groupField		= $form.find("[name=group_field]"),
	$lastPeriod		= $form.find("[name=last_period]"),
	$viewField		= $form.find("[name=view_field]"),
	$rows			= $form.find("[name=rows]"),
	$chartYn		= $form.find("[name=chart_yn]"),
	
	urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlConfigMap	= gCONTEXT_PATH + "component/search_event_config.json",	
	urlSelect		= gCONTEXT_PATH + "component/search_event_list.json",
	urlEvent		= gCONTEXT_PATH + "event/search_event_list.html",
	
	default_param = {ruleset_id : "", group_cd : "", event_cate_cd : "", event_level : "", group_field : "", event_seq : "", last_period : "60", rows : "5", chart_yn : "N", view_fields : ["event_nm", "group_field", "event_cate_cd", "event_level", "cnt", "event_time"]},
	config_param = configParam,
	component_title = componentTitle,	
	
	isFrequentRefresh = true,
	field_index = 1,
	
	tk = null,
	tk_config_param = {grpFields : ["ruleset_id", "open_time", "group_field", "field_val"], timeField : "event_time", sumField : "cnt", sumFieldList : ["distinct_cnt"], maxBuffers :	10000,  period : 60},
	
	//config용 변수
	eventNames,
	groupCds,
	groupFields,

	load = function() {		
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		chartStyle = $.extend(this.chartstyles, chartStyle);
		chartStyle.paletteColors = "#89cf43,#ffc000,#ff0000";
		
		//설정 초기화
		initConfig();
		
		// Bind Event
		$form
		.on("click", ".btn-add", function(){	
			var val = $rulesetId.find("option:selected").val();
			var text = $rulesetId.find("option:selected").text();
		
			if(val == "") {
				_alert("이벤트를 선택하세요.");
				return;
			}
		
			if( $rulesetIdList.find("option").is( function() { return this.value == val; }) 	){
				_alert("동일한 이벤트가 존재합니다.");
				return;
			}
			
			$rulesetIdList.append(new Option(text, val));
		})
		.on("click", ".btn-del", function(){
			$rulesetIdList.find(":selected").remove();
		});
		
		//리스트 링크
		$list.on("click", "a[name=search_event]", function(event){
			listSearchEvent($(event.target));
			return false;
		});
		
		//동적컬럼 생성
		dispFieldCaption();
		
		// Data 합산 객체 생성
		tk_config_param.period = config_param.last_period;
		tk = _SL.getDataTicker(tk_config_param);
		(tk).setBaseTime(_SL.formatDate.addMin(gGetServerTime(), -tk_config_param.period));

		// Load 시 기준 seq 값 setting
		config_param.event_seq = "";
		refresh();
	},

	refresh = function(isRefresh) {
		var refreshCallback = function(rsJson){

			var list = (rsJson && rsJson.rsList ? rsJson.rsList : []);
			var isInit = rsJson.isInit;
			
			if( list.length < 1 && !isInit) return;

			//Title 필드 표시
			var groupNm = GroupCaptionInfo[config_param.group_cd];
			var eventCateCdNm = ComCodes.CS0051[config_param.event_cate_cd];
			var eventLevelNm = ComCodes.CS0005[config_param.event_level];
			var groupFiledNm = LogCaptionInfo[config_param.group_field];

			var titleStr = "일반 이벤트";
			if(config_param.group_cd != "") titleStr = titleStr + "/" + groupNm;
			if(config_param.event_cate_cd != "") titleStr = titleStr + "/" + eventCateCdNm;
			if(config_param.event_level != "") titleStr = titleStr + "/" + eventLevelNm;
			if(config_param.group_field != "") titleStr = titleStr + "/" + groupFiledNm;
			$title.text(titleStr);

			if(config_param.chart_yn == "Y") {
				(tk).addChartList(list);
				var chartDataList = (tk).getChartList();
				if($chartDiv.is(':hidden')){
					chartDraw(rsJson,chartDataList);
					$chartDiv.show();
				}else{
					chartDraw(rsJson,chartDataList,isRefresh);
				}
			} else {
				$chartDiv.hide();
			}
			
			//기준 seq
			var event_seq = config_param.event_seq;
			if(list.length > 0) event_seq = list[0].event_seq; // 최근 이벤트 seq 설정
			(tk).addList(list);

			var sEventList = (tk).getList(),
			 $listTable = $list.find("tbody").empty(),
			 count = sEventList.length;
			if(count > config_param.rows) count = config_param.rows;

			if(!count || count.length == 0) {
				$listTable.append("<tr><td colspan="+field_index+">There is no Event.</td></tr>");
			} else {
				var $curTr, $curTd, rsRow, cont, _html ='',
				 viewFields = config_param.view_fields,
				 levelStrArr = ['Low','Middle','High'],
				 levelClsArr = ['label-success','label-attention','label-danger'],
				 flagFields = ['src_country_name','src_country_code','dstn_country_name','dstn_country_code'];

				for(var i = 0; i < count; i++) {
					rsRow = sEventList[i];
					$curTr = $("<tr>")
						.append( $("<td>").text(i+1));

					for(var idx in viewFields){
						$curTd = $("<td>");

						var fldName = viewFields[idx];
						cont = rsRow[fldName];

						switch(fldName){
							case "event_nm":
								var $a = $('<a />')
								.attr({
									'href' : '#',
									'name': 'search_event',
								})
								.text(cont)
								.data({
									'event_nm' : cont,
									'event_time' : rsRow.event_time,
									's_event_time' : rsRow.s_event_time,
									'ruleset_id' : sEventList[i].ruleset_id,
									'event_cate_cd' : sEventList[i].event_cate_cd,
									'event_level' : sEventList[i].event_level,
									'group_cd' : sEventList[i].group_cd
								})
								.appendTo($curTd);

								break;
							case "group_field":
								if(!cont){
									$curTd.append("전체");
								}
								else{
									var grpFldArr = cont.split(","),
									 fldValArr = rsRow.field_val.split(","),
									 flagCode,
									 flagTag ="";

									for(var idx in grpFldArr){

										if(flagFields.indexOf(grpFldArr[idx])>-1){
											flagCode = (rsRow["flag_code"] ? rsRow["flag_code"] : rsRow[grpFldArr[idx]]);

											if(rsRow[grpFldArr[idx]]=="N/A") flagCode = "N-A";

											if(flagCode != "PRN"){
												flagTag = '<img src="/resources/images/flag/'+flagCode+'.png" alt="'+flagCode+'" width="16" height="11">';
											} else {
												flagTag = '<i class="icon-lock"></i>';
											}
										}

										if(idx == grpFldArr.length -1){
											$curTd.append(LogCaptionInfo[grpFldArr[idx]] + ' : ' + flagTag +rsRow[grpFldArr[idx]]);
										}else{
											$curTd.append(LogCaptionInfo[grpFldArr[idx]] + ' : ' + flagTag + rsRow[grpFldArr[idx]]+"\n");
											$curTd.append($("<br>"));
										}
									}
								}
								break;
							case "event_cate_cd":
								$curTd.append(rsRow.event_cate_cd_nm);
								break;
							case "event_level":
								if(cont == 0)
									$curTd.append("-");
								else
									$curTd.append('<span class="'+levelClsArr[cont-1]+'">'+levelStrArr[cont-1]+'</span>');
								break;
							case "event_time":
								$curTd.text(_SL.formatDate(rsRow.s_event_time, "MM-dd HH:mm")+ "~" +_SL.formatDate(rsRow.event_time, "MM-dd HH:mm"));
								$curTd.attr("title", _SL.formatDate(rsRow.s_event_time, "yyyy-MM-dd HH:mm") + " ~ " +  _SL.formatDate(rsRow.event_time, "yyyy-MM-dd HH:mm"));
								break;
							case "handling_type_cd":
								if(!rsRow.handling_type_cd_nm)
									$curTd.append("-");
								else
									$curTd.append(rsRow.handling_type_cd_nm);
								break;
							case "group_cd":
								$curTd.append(rsRow.group_cd_nm);
								break;
							case "cnt":
								$curTd.append(_SL.toComma(cont +"/"+(tk).getEventCount(rsRow.key) +"건"));
								break;
							case "distinct_cnt":
							case "limit_distinct_count":
							case "limit_count":
								cont = _SL.formatNumber(cont);
								$curTd.append(cont);
								break;
							default:
								$curTd.append(cont);
								break;
						}
						$curTr.append($curTd);
					}

					$curTr.appendTo($listTable);
				}
			}
			// 기준 seq 설정
			config_param.event_seq = event_seq;
		};
		
		$("body").requestData(urlSelect, config_param, {callback : refreshCallback});
	},
	
	showConfig = function() {
		
		var sRulesetId	= config_param ? config_param.ruleset_id : "";
		var sViewFields = config_param ? config_param.view_fields : [];
		
		//기본설정들
		$rulesetId.val("");
		$groupCd.val(config_param.group_cd);
		$eventCateCd.val(config_param.event_cate_cd);
		$eventLevel.val(config_param.event_level);
		$groupField.val(config_param.group_field);
		$lastPeriod.val(config_param.last_period);
		$rows.val(config_param.rows);
		$form.find("[name=chart_yn]:input[value=" + config_param.chart_yn + "]").prop("checked", true);

		//이벤트명
		$rulesetIdList.empty();
		var rulesetIdArr = sRulesetId.split(",");

		for(var idx in rulesetIdArr){
			var id = rulesetIdArr[idx];
			if(id == null || id =="") continue;
			$rulesetIdList.append('<option value="'+id+'">'+eventNames[id]+'</option>');
		};
		
		//표시필드
		$viewField.setSelectionOrder(sViewFields, true);
	},
	
	beforeSaveConfig = function(){
		var rulesetIdArr = [],
		 $rulesetIdListOption = $rulesetIdList.find("option");

		for(var idx=0; idx < $rulesetIdListOption.length; idx++) {
			rulesetIdArr.push($rulesetIdListOption.eq(idx).val());
		}
		
		config_param.ruleset_id = rulesetIdArr.join(",");
		config_param.group_cd = $groupCd.val();
		config_param.event_cate_cd = $eventCateCd.val();
		config_param.event_level = $eventLevel.val();
		config_param.group_field = $groupField.val();
		config_param.last_period = $lastPeriod.val();
		config_param.rows = $rows.val();
		config_param.chart_yn = $form.find("[name=chart_yn]:checked").val();
		config_param.view_fields = $viewField.getSelectionOrder();
		
		// Data 합산 객체 재생성
		tk_config_param.period = config_param.last_period;
		tk = _SL.getDataTicker(tk_config_param);
		
		(tk).setBaseTime(_SL.formatDate.addMin(gGetServerTime(), -tk_config_param.period));
		config_param.event_seq = "";
	},
	
	afterSaveConfig = function() {
		dispFieldCaption();
		refresh(true);
	},
	
	initConfig = function(){
		var callback0051 = function(rsJson, rsCd, rsMsg){
			ComCodes.CS0051 = rsJson;
			setEventCateCds();
		},
		callback0005 = function(rsJson, rsCd, rsMsg){
			ComCodes.CS0005 = rsJson;
			setEventLevelCds();
		},
		initCallback = function(rsJson, rsCd, rsMsg){
			eventNames 		= rsJson.eventNames,
			groupCds		= rsJson.groups,
			groupFields 	= rsJson.groupFields;
				
			setEventNames(eventNames);
			setGroupCds(groupCds);
			setGrpFlds(groupFields);
			setEventCaptions(groupFields);
		};

		if(!ComCodes.CS0051) {//분류
			$("body").requestData(urlCodeMap, {code_type : 'CS0051'}, {callback : callback0051});
		}else{
			setEventCateCds();
		};
		
		if(!ComCodes.CS0005) {//등급
			$("body").requestData(urlCodeMap, {code_type : 'CS0005'}, {callback : callback0005});
		}else{
			setEventLevelCds();
		};

		//이벤트명,기준필드,표시필드
		$("body").requestData(urlConfigMap,{},{callback : initCallback});
	},
	
	setEventCateCds = function() {
		$eventCateCd.html('<option value="">[선택하세요]</option>');

		for(var key in ComCodes.CS0051){
			$eventCateCd.append('<option value="'+key+'">'+ComCodes.CS0051[key]+'</option>');
		}
	},
	
	setEventLevelCds = function() {
		$eventLevel.html('<option value="">[선택하세요]</option>');

		for(var key in ComCodes.CS0005){
			$eventLevel.append('<option value="'+key+'">'+ComCodes.CS0005[key]+'</option>');
		}
	},

	setGroupCds = function(groupCds) {
		$groupCd.html('<option value="">[선택하세요]</option>');

		for(var key in groupCds){
			$groupCd.append('<option value="'+key+'">'+groupCds[key]+'</option>');
		}
	},
	
	setEventNames = function(eventNames) {
		$rulesetId.html('<option value="">[선택하세요]</option>');

		for(var key in eventNames){
			$rulesetId.append('<option value="'+key+'">'+eventNames[key]+'</option>');
		}
	},
	
	setGrpFlds = function(groupFields) {
		$groupField.html('<option value="">[선택하세요]</option>');
		
		for(var idx in groupFields){
			var fld = groupFields[idx];
			$groupField.append('<option value="'+fld+'">'+LogCaptionInfo[fld] + '(' + fld + ')'+'</option>');
		}
	},
	
	setEventCaptions = function(groupFields) {
		$viewField.empty();

		delete EventCaptionInfo["dashboard_yn"];
		for(var caption in EventCaptionInfo){//기본표시필드
			$viewField.append('<option value="'+caption+'">'+EventCaptionInfo[caption] + '(' + caption + ')'+'</option>');
		}

		for(var idx in groupFields){//기준필드로 등록할수있는 필드
			var fld = groupFields[idx];
			$viewField.append('<option value="'+fld+'">'+LogCaptionInfo[fld] + '(' + fld + ')'+'</option>');
		}

		var viewFields = config_param ? config_param.view_fields : [];	
		for(var idx in viewFields){//이미 컴포넌트 설정에 등록되어 있으나 위에서 추가되지 않은 필드
			var tField = viewFields[idx];
			if(!EventCaptionInfo[tField] && groupFields.indexOf(tField) < 0){
				$viewField.append('<option value="'+tField+'">'+'undefined(' + tField + ')'+'</option>');
			}
		}
		// 표시필드 설정
		$viewField.chosen({
			search_contains : true,
			placeholder_text_multiple :"[선택하세요]",
			width:"100%",
			max_selected_options : 30
		});
		
		$viewField.siblings(".chosen-container").find(".chosen-results").css("max-height","100px");
		$viewField.siblings(".chosen-container").find(".chosen-choices").css({
			"max-height" : "55px",
			"min-height" : "55px",
			"overflow-y" : "auto"
		});
	},
	
	dispFieldCaption = function() {
		
		var width,
		 strCaption,
		 $tr,
		 $eventTable = $list.find("thead").empty(),
		 viewFields = config_param.view_fields;

		$tr = $('<tr />');
		$tr.append('<th scope="col">번호</th>');
		
		for(var idx in viewFields) {
			strCaption = EventCaptionInfo[viewFields[idx]];
			
			if(!strCaption){
				strCaption = LogCaptionInfo[viewFields[idx]];
			}
			
			var $th = $('<th scope="col" />');
			if(viewFields[idx] == "cnt")
				$th.attr("title", "로그건수/이벤트건수");
			
			$tr.append($th.append(strCaption ? strCaption : viewFields[idx]));
			field_index++;
		}
		
		$eventTable.append($tr)
	},
	
	chartDraw = function(rsJson,list, isRefresh){
		var chartDataList = list;
		var chartData = {
			chart : chartStyle,
			categories : [],
			dataset : []
		};
		
		var dataset = [];
		var category = [];
		
		var eventLevels 	= ComCodes.CS0005;
		var groupByPeriod 	= rsJson.groupByPeriod;
		var categorys		= rsJson.categorys;
		var eventTime 		= "";
		
		for(var idx in categorys){
			category.push({label : _SL.formatDate(categorys[idx].event_time, "MM-dd HH:mm")});	
		}
	
		var grpChartDataList = {};
		var grpStime,grpEtime;
		var initDataO = {};
		
		for(var i in eventLevels){
			var levelNm = eventLevels[i];
			initDataO[levelNm] = 0;
		}	
	
		if(groupByPeriod > 1){
			for(var idx in categorys){
				var initDataO = {};
				
				for(var i in eventLevels){
					var levelNm = eventLevels[i];
					initDataO[levelNm] = 0;
				}
				
				grpStime = categorys[idx].event_time;
				grpEtime = _SL.formatDate.addMin(grpStime, groupByPeriod);
				grpChartDataList[grpStime] = initDataO;
				
				for(var i = 0; i<groupByPeriod ; i++){
					var tKey ;
					if(i == 0 ){
						tKey = grpStime;
					}else{
						tKey= _SL.formatDate.addMin(grpStime, i);
					}
					
					if(chartDataList[tKey]){
						for(var j in eventLevels){
							var levelNm = eventLevels[j];
							if(chartDataList[tKey][levelNm]){
								grpChartDataList[grpStime][levelNm] += chartDataList[tKey][levelNm];
							}
						}	
					}
				}
			}
			
			chartDataList = grpChartDataList;
		}

		for(var i in eventLevels){
			var levelNm = eventLevels[i];
			var tData = { seriesname : levelNm, data :[] };
			for(var j in categorys){
				eventTime = categorys[j].event_time;
				var cnt = 0 ;
				var sTime = categorys[j].event_time;
				var eTime = _SL.formatDate.addMin(sTime, groupByPeriod);
				var strHref = 'javascript:$.Dashboard.componentInstance["'+containerId+'"].chartSearchEvent("'+i+'","'+sTime+'","'+eTime+'")';
				if(chartDataList[eventTime]){
					if(chartDataList[eventTime][levelNm]){
						cnt = chartDataList[eventTime][levelNm];
					}
				}
				
				tData.data.push({
					value : cnt,
					link : strHref
				});
			}
			dataset.push(tData);
		}
		
		chartData.categories.push({category : category});
		chartData.dataset = dataset;
		
		if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
			$.Dashboard.chartInstance[containerId].setJSONData(chartData);
		} else {
			FusionCharts.ready(function(){
				$.Dashboard.chartInstance[containerId] = new FusionCharts({
					type: 'stackedcolumn2d',
					renderAt: 'chart-container_' + containerId,
					width: '100%',
					height: '240',
					dataFormat: 'json',
					dataSource: chartData
				}).render();
			});
		}
	},	
	
	chartStyle = {
		"caption": "",
		"subCaption": "",
		"numberPrefix": "",
		"showValues" :"0"
	},
	
	listSearchEvent = function($target){
		var $goEventForm = $body.find("[name=listForm]");
		var startTime = $target.data("s_event_time");
		var endTime = _SL.formatDate.addMin($target.data("event_time"), +1);
		$("[name=start_time]", $goEventForm).val(startTime);
		$("[name=end_time]", $goEventForm).val(endTime);
		$("[name=s_ruleset_id]", $goEventForm).val($target.data("ruleset_id"));
		$("[name=s_group_cd]", $goEventForm).val($target.data("group_cd"));
		$("[name=s_event_cate_cd]", $goEventForm).val($target.data("event_cate_cd"));
		$("[name=s_event_nm]", $goEventForm).val($target.data("event_nm"));
		$("[name=s_event_level]", $goEventForm).val($target.data("event_level"));

		var winName = "searchEventSearchWin_" + (new Date()).getTime();

		$goEventForm.attr({
			action : urlEvent,
			target : winName,
			method : "post"
		}).submit();
	},
	
	chartSearchEvent = function(eventLevel, sdate, edate){
		var $goEventForm = $body.find("[name=listForm]");
		$("input[type=hidden]", $goEventForm).val("");//form 초기화
		
		$("[name=start_time]", $goEventForm).val(sdate);
		$("[name=end_time]", $goEventForm).val(edate);
		$("[name=s_event_level]", $goEventForm).val(eventLevel);
		
		var winName = "searchEventSearchWin_" + (new Date()).getTime();
		
		$goEventForm.attr({
			action : urlEvent,
    		target : winName,
    		method : "post"
    	}).submit();
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig,
		chartSearchEvent: chartSearchEvent
	};
}
