//# sourceURL=blacklist_event.js
'use strict';

_SL.nmspc("slapp.component").blacklist_event = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),
	$formConfig = $("#config_" + containerId + " .btn-apply"),

	$table = $body.find("#"+containerId+"_table thead"),
	$tableList = $body.find(".grid-table-group"),
	$blackIpLink = $body.find(".goLogSearchView"),
	
	$lastPeriod	= $form.find("[name=last_period]"),
	$sType	= $form.find("[name=s_type]"),
	$ipViewOpt	= $form.find("[name=ip_view_opt]"),
	$rows	= $form.find("[name=rows]"),
	$pie	= $form.find("input:radio[name='pie']"),
	$area	= $form.find("input:radio[name='area']"),
	$list	= $form.find("input:radio[name='list']"),
	
	pieChartId 		= containerId+'_pie_chart_container',
	areaChartId		= containerId+'_area_chart_container',
	subPieChartId 	= 'subPieChartContainer',
	subAreaChartId	= 'subAreaChartContainer',

	urlSTypeCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlSelect		= gCONTEXT_PATH + "component/blacklist_event_list.json",
	urlChartData = gCONTEXT_PATH + 'event/blacklist_event_main_chart_data.json',
	urlSubChartForm = gCONTEXT_PATH + 'event/blacklist_event_sub_chart_form.html',
	urlSubChartData = gCONTEXT_PATH + 'event/blacklist_event_sub_chart_data.json',
	urlLogSearch	= gCONTEXT_PATH + 'monitoring/log_search.html',
	urlHandlingUdate= gCONTEXT_PATH + 'event/blacklist_event_update.json',
	
	default_param = {last_period: "10", list : "on"},

	config_param = configParam,

	component_title = componentTitle,	

	isOpenConfig = false,
	
	load = function() {
		this.title = component_title; 
		this.config_param = config_param = $.extend({}, default_param, config_param);

		$.Dashboard.chartInstance[containerId] = [];
		
		initConfig();
		_PIE_CHART.dataSource.chart = $.extend(_pieChartStyle, this.chartstyles);
		_AREA_CHART.dataSource.chart = $.extend(_areaChartStyle, this.chartstyles);
		_AREA_CHART.dataSource.chart.labelDisplay = "stagger";
	
		$body
		.on("click", ".goLogSearchView_"+containerId, function() {
			var keyArr = $(this).attr("data-key").split(",");
			var blacklistIp = keyArr[0];
			var eventTime = keyArr[1];
			var ipType = keyArr[2];
			goLogSearch(blacklistIp,eventTime,ipType);
			return false;
		});
		
		if(FusionCharts) {//기존 대시보드에 있던 컴포넌트들과는 id형식이 달라서 기존에 있던 대시보드 로직에서는 지워주지 못하는 컴포넌트 id와 객체들 삭제
			FusionCharts.items[containerId + "_pie_chart_id"] = null;
			delete FusionCharts.items[containerId + "_pie_chart_id"];
			
			FusionCharts.items[containerId + "_area_chart_id"] = null;
			delete FusionCharts.items[containerId + "_area_chart_id"];
			
			FusionCharts.items["subPieChartContainer"] = null;
			delete FusionCharts.items["subPieChartContainer"];
				
			FusionCharts.items["subPreaChartContainer"] = null;
			delete FusionCharts.items["subPreaChartContainer"];
		}

		refresh();

	},
	
	initConfig = function(){
		// DOM 생성
		if(!ComCodes.CS0021) {
			$("body").requestData(urlSTypeCodeMap, {code_type : 'CS0021'}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0021 = rsJson;
				_setStypeCds();
				//_setTitle(); //중복이라 제거
			}});
		}else{
			_setStypeCds();
		}
		_setParam();
		
	},

	showConfig = function() {
		$lastPeriod.val(config_param.last_period);
		$sType.val(config_param.s_type);
		$ipViewOpt.val(config_param.ip_view_opt);
		$rows.val(config_param.rows);
	},
	
	beforeSaveConfig = function(){

		config_param.last_period = $lastPeriod.val();
		config_param.s_type = $sType.val();
		config_param.ip_view_opt = $ipViewOpt.val();
		config_param.rows = $rows.val();
		config_param.pie = $form.find("[name=pie]:checked").val();
		config_param.area = $form.find("[name=area]:checked").val();
		config_param.list = ($form.find("[name=list]:checked").val() == undefined)? "" : $form.find("[name=list]:checked").val();
	},
	
	
	afterSaveConfig = function() {
		refresh();
	},
	
	
	subChartInit = function(date, type, name) {
		var modal = new ModalPopup(urlSubChartForm,{
			width  : 1000,
			height : 350,
			onOpen : getSubChart(date, type, name)/*,
			onClose : function(){
				console.log('onclose')
				$.Dashboard.chartInstance[containerId].splice(2,2);
			}*/
		});
	},
	
	
	refresh = function(isRefresh) {

		var trArr = [];
		var bAssetView = (config_param && config_param.ip_view_opt == "ASSET");
		var bAsset;
		var $tBody = $tableList.find("tbody");
		var startTime, endTime;
		var period = (config_param.last_period) ? config_param.last_period : default_param.last_period;

		config_param.end_time = _SL.formatDate();			
		config_param.start_time = _SL.formatDate.addMin(config_param.end_time,-period);

		if(config_param.list == 'on'){		
			$tableList.show();
			$("body").requestData(urlSelect, config_param, {callback : function(rsJson){
				$tBody.children().remove();
				var list = (rsJson && rsJson.rsList ? rsJson.rsList : []);
				if(!list || list.length == 0){
					$tBody.append('<tr><td class="list-empty" colspan="6">There is no Search Result</td></tr>');
				}else{
					for(var i = 0; i < list.length; i++){

						bAsset = (bAssetView) ? (list[i].asset_name != "") : false;
						var trClass = "";
						trClass = (i == 0)? "no1" : "";  
						trClass = (i % 2)? "bg" : "";	
						var blacklistIp = "";
						if(bAsset)
							blacklistIp = list[i].asset_name+"("+list[i].blacklist_ip+")";
						else 
							blacklistIp =list[i].blacklist_ip
						
						if(list[i].domain == '') list[i].domain = '-';
						if(list[i].nation == '') list[i].nation = '-';
						if(list[i].type_nm == '') list[i].type_nm = '-';
				
						trArr[i] += "<tr class='"+trClass+"'><td>"+(i+1)+"</td>";
						trArr[i] += "<td><a href='#' class='goLogSearchView_"+containerId+"' aria-value='"+i+"' title='"+blacklistIp+"' data-key='"+list[i].blacklist_ip+","+list[i].event_time+","+list[i].ip_type+"'>"+blacklistIp+"</a></td>";
						trArr[i] += "<td>"+list[i].domain+"</td>";
						trArr[i] += "<td>"+list[i].nation+"</td>";
						trArr[i] += "<td>"+list[i].type_nm+"</td>";
						trArr[i] += "<td title='"+_SL.formatDate(list[i].event_time, "MM-dd HH:mm")+"'>"+_SL.formatDate(list[i].event_time, "MM-dd HH:mm")+"</td></tr>";
					}
				}

				$tBody.append(''+trArr.join(",")+'');
				trArr = [];

			}});
			
		}else{
			$tableList.hide();
		}
		
		if(config_param.area || config_param.pie){
			getMainChart(isRefresh);
			
		}else{
			$("#" + containerId + "_pie_chart_container").hide();
			$("#" + containerId + "_area_chart_container").hide();
		}
		
		_setTitle();
	},
	
	_setParam = function(){
		
		if(config_param.last_period){
			$("#config_" + containerId + " [name=last_period] option").each(function(){
				if($(this).val() == config_param.last_period) $(this).prop("selected", true);
			});
		}
		
		if (config_param.ip_view_opt) {
			$("#config_" + containerId + " [name=ip_view_opt] option").each(function(){
				if($(this).val() == config_param.ip_view_opt) $(this).prop("selected", true);
			});
		}
		_setStypeCds();
		
		if(config_param.rows){
			$("#config_" + containerId + " [name=rows] option").each(function(){
				if($(this).val() == config_param.rows) $(this).prop("selected", true);
			});
		}
		
		if (config_param.pie)  $("#config_" + containerId+ " #pie").prop("checked",true);
		if (config_param.area)  $("#config_" + containerId + " #area").prop("checked",true);
		if (config_param.list)  $("#config_" + containerId + " #list").prop("checked",true);
		
	},
	
	_setTitle = function(){
		var titleStr = "";
		var cnt = 0;
		for(var key in config_param){
			if(config_param[key] != "" && key == "s_type"){
				titleStr += "IP유형 : ";

				if(!ComCodes.CS0021) {
					$("body").requestData(urlSTypeCodeMap, {code_type : 'CS0021'}, {callback : function(rsJson, rsCd, rsMsg) {
						ComCodes.CS0021 = rsJson;
						titleStr += ComCodes.CS0021[config_param[key]];
					}});
				}else{
					titleStr += ComCodes.CS0021[config_param[key]];
				}
				cnt++;
			}
		}
		var t = (cnt == 0)? "전체" :  titleStr;
		$("#componentbody_" + containerId+' .sp-title h5').text(t);
	},
	
	getMainChart = function(isRefresh){
		var startTime,endTime;
		var period = config_param.last_period ? config_param.last_period : default_param.last_period
		endTime = _SL.formatDate();
		startTime = _SL.formatDate.addMin(endTime,-period);
		if (!config_param.pie) $("#" + containerId + "_pie_chart_container").hide();
		if (!config_param.area) $("#" + containerId + "_area_chart_container").hide();
		
		$.getJSON(urlChartData,
			{
				start_time 		: startTime,
				end_time		: endTime,
				s_type			: config_param.s_type
			},
			function(rsJson) {
				
				_CHART_FUNCTION.groupByPeriod = rsJson.groupByPeriod;
				
				var labels            = rsJson.labels;
				var pieChartDataList  = rsJson.pieChartDataList;
				var areaChartDataList = rsJson.areaChartDataList;
				var categorys         = rsJson.categorys;
				
				if ( config_param.s_type != "") {
					labels = [ComCodes["CS0021"][config_param.s_type]];
				}

				var pieChartData  = _PIE_CHART;
				var areaChartData = _AREA_CHART;
				
				pieChartData.renderAt = pieChartId;
				areaChartData.renderAt = areaChartId;
				pieChartData.dataSource.chart.caption  = "유형별 현황";
				areaChartData.dataSource.chart.caption = "유형별 시간대별 현황";
				pieChartData.dataSource.data = [];
				areaChartData.dataSource.categories = [];
				areaChartData.dataSource.dataset = [];
				
				areaChartData.dataSource.categories.push({category : categorys});
				
				for (var i in labels) {
					
					if(config_param.pie){
						pieChartData.dataSource.data.push(_CHART_FUNCTION.getData(labels[i], pieChartDataList, false));
						$("#" + containerId + "_pie_chart_container").show();
					}
					
					if(config_param.area){
						areaChartData.dataSource.dataset.push({
							seriesname : labels[i],
							data : []
						});
						
						for (var n in categorys) {
							areaChartData.dataSource.dataset[i].data.push(_CHART_FUNCTION.getDataset(labels[i], categorys[n].label, areaChartDataList, false));
						}
						$("#" + containerId + "_area_chart_container").show();
					}
				}	

				setTimeout(function(){
					if(isRefresh != true
							&& ($.Dashboard.chartInstance[containerId] == undefined | $.Dashboard.chartInstance[containerId][0] == undefined)){
						FusionCharts.ready(function(){
							$.Dashboard.chartInstance[containerId][0] = new FusionCharts(pieChartData).render();
						});	
					}else{
						$.Dashboard.chartInstance[containerId][0].setJSONData(pieChartData.dataSource);
					}
					
					if(isRefresh != true && $.Dashboard.chartInstance[containerId][1] == undefined){
						FusionCharts.ready(function(){
							$.Dashboard.chartInstance[containerId][1] = new FusionCharts(areaChartData).render();
						});
					}else{
						$.Dashboard.chartInstance[containerId][1].setJSONData(areaChartData.dataSource);
					}
				},1000);
			}
		);		
	},

	_setStypeCds = function() {	
		$sType.empty();
		$sType.append(new Option("[선택하세요]", ""));
		
		for(var key in ComCodes.CS0021){
			var opt = new Option(ComCodes.CS0021[key], key);
			if(config_param.s_type == key) opt.selected = true;
			$sType.append(opt);
		}
	},
	
	goLogSearch = function(ip, eventTime, ipType){	
		var startTime = eventTime;
		var endTime = _SL.formatDate.addMin(startTime, 1);
		var fldName = ipType == "1" ? "src_ip" : "dstn_ip";
		
		var $logSearchForm = $form.find("[name='logSearchForm']");
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type"');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			
			$form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(startTime);
		$("[name=end_time]", $logSearchForm).val(endTime);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(fldName+":"+ip);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : urlLogSearch
		}).submit();
	},
/*	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:1400, height:1000,
			onClose : function(){
				refresh();
			}
		});
	},*/
	
	goSearchPopup = function(ip, date){

		date = date.replace(/\D/gi, "");

		var start_time,end_time;

		var period = config_param.last_period ? config_param.last_period : default_param.last_period

		end_time = _SL.formatDate();			
		start_time = _SL.formatDate.addMin(end_time,-period);
		
		if (date != "") {
			end_time = _SL.formatDate.addMin(date, _CHART_FUNCTION.groupByPeriod);
			start_time = date;
		}
		
		var $logSearchForm = $form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type"');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			
			$form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(start_time);
		$("[name=end_time]", $logSearchForm).val(end_time);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val("src_ip:" + ip + " OR dstn_ip:" + ip);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : urlLogSearch
		}).submit();
	},

	_pieChartStyle = {
			"caption": "유형별 현황",
			"pieRadius":"130",
			"showpercentintooltip":"0",
			"startingangle":"125"
	},
	
	_areaChartStyle = {
			"caption": "유형별 시간대별 현황",
			"numvdivlines" : "10",
			"showlabels":"0",
			"showvalues":"0"
	},
	
	_pieSubChartStyle = {
			"caption": "유형별 현황",
			"pieRadius":"130",
			"showpercentintooltip":"0",
			"startingangle":"125"
	},
	
	_areaSubChartStyle = {
			"caption": "유형별 시간대별 현황",
			"numvdivlines" : "10",
			"showlabels":"0",
			"showvalues":"0"
	},
	
	_PIE_CHART = {
			type: 'pie3d',
			renderAt: pieChartId,
			width : "100%",
			height : "240",
			dataFormat : "json",
			dataSource : 
			{
				chart : _pieChartStyle,
				data : []
			}
	},
	
	_AREA_CHART = {
			type: 'msline',
		    renderAt: areaChartId,
			width : "100%",
			height : "240",
			dataFormat : "json",
			dataSource : 
			{
				chart : _areaChartStyle,
				categories : [],
				dataset : []
			}
	},

	getSubChart = function(date, type, name){

		date = date.replace(/\D/gi, "");

		_CHART_FUNCTION.ip_type = type;
		
		var subPieChartData  = $.extend(true, {}, _PIE_CHART);
		var subAreaChartData = $.extend(true, {}, _AREA_CHART);

		subPieChartData.dataSource.chart.showBorder="1";
		subAreaChartData.dataSource.chart.showBorder="1";

		subPieChartData.renderAt = subPieChartId;
		subAreaChartData.renderAt = subAreaChartId;
		
		subPieChartData.height = "300";
		subAreaChartData.height = "300";
		
		
		subPieChartData.dataSource.chart = $.extend(_pieSubChartStyle, slui.chart.chartConfig);
		subAreaChartData.dataSource.chart  = $.extend(_areaSubChartStyle, slui.chart.chartConfig);

		subPieChartData.dataSource.chart.showBorder = "1";
		subAreaChartData.dataSource.chart.showBorder = "1";

		subPieChartData.dataSource.chart.caption  = "[" +decodeURIComponent(name) + "]" + "TOP " + _CHART_FUNCTION.top_limit + " 현황";
		subAreaChartData.dataSource.chart.caption = "[" +decodeURIComponent(name) + "]" + "시간대별 TOP " + _CHART_FUNCTION.top_limit + " 현황";

		var start_time,end_time;

		var period = config_param.last_period ? config_param.last_period : default_param.last_period

		end_time = _SL.formatDate();			
		start_time = _SL.formatDate.addMin(end_time,-period);

		if (date != "") {
			end_time = _SL.formatDate.addMin(date, _CHART_FUNCTION.groupByPeriod);
			start_time = date;
		}

		$.getJSON(urlSubChartData,
			{
				top_limit       : _CHART_FUNCTION.top_limit,
				start_time 		: start_time,
				end_time		: end_time,
				s_type			: type,
				s_blacklist_ip	: $("input[name=s_blacklist_ip]").val(),
				s_domain 		: $("input[name=s_domain]").val(),
				s_nation 		: $("input[name=s_nation]").val()
			},
			function(rsJson) {
				
				_CHART_FUNCTION.groupByPeriod = rsJson.groupByPeriod;
				
				var labels            = rsJson.labels;
				var pieChartDataList  = rsJson.pieChartDataList;
				var areaChartDataList = rsJson.areaChartDataList;
				var categorys         = rsJson.categorys;
				
				subPieChartData.dataSource.data = [];
				subAreaChartData.dataSource.categories = [];
				subAreaChartData.dataSource.dataset = [];
				
				subAreaChartData.dataSource.categories.push({category : categorys});
				
				for (var i in labels) {
					subPieChartData.dataSource.data.push(_CHART_FUNCTION.getData(labels[i], pieChartDataList, true));
					
					subAreaChartData.dataSource.dataset.push({
						seriesname : labels[i],
						data : []
					});
					
					for (var n in categorys) {
						subAreaChartData.dataSource.dataset[i].data.push(_CHART_FUNCTION.getDataset(labels[i], categorys[n].label, areaChartDataList, true));
					}
				}

				if($.Dashboard.chartInstance[containerId].length > 2){
					$.Dashboard.chartInstance[containerId][2].dispose();
					$.Dashboard.chartInstance[containerId][3].dispose();
				}
				setTimeout(function(){
					FusionCharts.ready(function(){
						$.Dashboard.chartInstance[containerId][2] = new FusionCharts(subPieChartData).render();
					
					});
					FusionCharts.ready(function () {
						$.Dashboard.chartInstance[containerId][3] = new FusionCharts(subAreaChartData).render();
					});
				},1000);
			}
		);
	},
	
	_CHART_FUNCTION = {
			top_limit : 10,
			groupByPeriod : 1,
			getDataset : function(label, category, resultList, isSub) {
				var data = {value : 0};
				for (var r in resultList) {
					if ((label == resultList[r].label) && (category == resultList[r].category)) {
						if (isSub) {
							data = {value : resultList[r].value, link : 'javascript:$.Dashboard.componentInstance["'+containerId+'"].goSearchPopup("' + resultList[r].label + '", "' + resultList[r].category + '")'}; 
						} else {
							data = {value : resultList[r].value, link : 'javascript:$.Dashboard.componentInstance["'+containerId+'"].subChartInit("' + resultList[r].category + '", "' + resultList[r].type + '", "' + _SL.htmlEscape(resultList[r].label) + '")'}; 
						}
						break;
					}
				}
				return data;
			},
			getData : function(label, resultList, isSub) {
				var data = {label : label, value : 0};
				for (var r in resultList) {
					if (label == resultList[r].label) {
						if (isSub) {
							data = {label : resultList[r].label, value : resultList[r].value, link : 'javascript:$.Dashboard.componentInstance["'+containerId+'"].goSearchPopup("' + resultList[r].label + '", "")'}; 
						} else {
							data = {label : resultList[r].label, value : resultList[r].value, link : 'javascript:$.Dashboard.componentInstance["'+containerId+'"].subChartInit("", "' + resultList[r].type + '", "' +_SL.htmlEscape(resultList[r].label) + '")'}; 
						}
						break;
					}
				}
				return data;
			}
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		subChartInit 	: subChartInit,
		goSearchPopup	: goSearchPopup,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig
	};
}