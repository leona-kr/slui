//# sourceURL=top5.js
'use strict';

var viewTop5LogSearch = function(sTime,eTime,i, filterList, containerId) {
	var $searchForm = $("#componentbody_" + containerId+" [name=searchForm]");

	$("input[type=hidden]", $searchForm).val("");//form 초기화
	$("[name=start_time]", $searchForm).val(sTime);
	$("[name=end_time]", $searchForm).val(eTime);
	$("[name=expert_keyword]", $searchForm).val(filterList);
		
	var winName = "TOP5_" + (new Date()).getTime();
	$searchForm.attr({
		action : gCONTEXT_PATH + 'monitoring/log_search.html',
		target : winName,
		method : "post"
	}).submit();
};

_SL.nmspc("slapp.component").top5 = function(id, configParam, componentTitle, componentParam) {
	var
	containerId = id,
	
	$header		= $("#componentheader_" + containerId),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),
	
	//$searchForm = $body.find("[name=searchForm]"),
	$spTitle	= $body.find(".sp-title"),
	$listDiv	= $body.find(".table-group"),
	
	$list		= $listDiv.find(".grid-table-group"),
	$listThChild = $listDiv.find(".grid-table-group th:nth-child(3)"),
	
	$labelTypeTr = $form.find(".label_type_tr"),
	
	$lastPeriod	= $form.find("[name=last_period]"),
	$labelType	= $form.find("[name=label_type]"),
	$rows	= $form.find("[name=rows]"),
	$groupCd	= $form.find("[name=group_cd]"),
	$logCateCd	= $form.find("[name=log_cate_cd]"),
	$thFieldCaption	= $body.find("[data-name=th_field_caption]"),
	$thAssetCaption	= $body.find("[data-name=th_asset_caption]"),
	$thAsset	= $body.find("[name=th_asset]"),

	urlEquipStatList = gCONTEXT_PATH + "management/equip_stat_list.html",
	urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlSelect		= gCONTEXT_PATH + "component/top5_chart.json",
	urlSwf	= "/resources/fusion/charts/Bar2D.swf",
	urlPerformanceViewList = gCONTEXT_PATH + 'monitoring/performance_view.html',
	//urlLogSearch = gCONTEXT_PATH + 'monitoring/log_search.html',
	
	component_title = componentTitle,
	
	param = $.parseJSON(componentParam),
	
	default_param = {last_period : "10", label_type : "IP", rows : "5", 
			         list_yn : "N", curDate : (new Date()).getTime(),
			         section_name : param.section_name , log_cate_cd : "", group_cd : ""},

	config_param = configParam,
	
	gRsJson = null,
	
	load = function() {
		
		this.config_param = config_param = $.extend({}, default_param, config_param);

		chartStyle = $.extend(this.chartstyles, chartStyle);

		chartStyle.paletteColors = chartStyle.top5Colors;

		initConfig();
		
		$thFieldCaption.html(LogCaptionInfo[param.section_name]);
		
		chartStyle.xAxisName = param.section_name;
		
		refresh();
	},
	
	initConfig = function() {
		
		// DOM 생성
		if(!ComCodes.CS0010) {
			var _callback = function(rsJson){
				ComCodes.CS0010 = rsJson;
				setLogCateCds();
			};
			$("body").requestData(urlCodeMap, {code_type : 'CS0010'}, {callback : _callback});
		}else{
			setLogCateCds();
		}

		if(!ComCodes.CS0011) {
			var _callback = function(rsJson){
				ComCodes.CS0011 = rsJson;
				setGroupCds();
			};
			$("body").requestData(urlCodeMap, {code_type : 'CS0011'}, {callback : _callback});
		}else{
			setGroupCds();
		}
	},
	
	setTitle = function() {
		var strMyFilterInfo, strMyFilterInfoTwo;
		
		if(ComCodes.CS0010) {
			strMyFilterInfo = config_param.log_cate_cd ? ComCodes.CS0010[config_param.log_cate_cd] : "";
		}
		if(ComCodes.CS0011) {
			strMyFilterInfoTwo = config_param.group_cd ? ComCodes.CS0011[config_param.group_cd] : "";
		}
		
		if(strMyFilterInfo == "" && strMyFilterInfoTwo == ""){
			$spTitle.html("<h5>전체</h5>");
		}else{
			if(strMyFilterInfoTwo == ""){
				$spTitle.html("<h5>로그분류 : " + strMyFilterInfo+"</h5>");
			}else if(strMyFilterInfo == ""){
				$spTitle.html("<h5>기관 : " + strMyFilterInfoTwo+"</h5>");	
			}else{
				$spTitle.html("<h5>기관 : " + strMyFilterInfoTwo + " , 로그종류  : " + strMyFilterInfo+"</h5>");
			}
		}
	},
	
	refresh = function(isRefresh) {
		var c = this,
		refreshCallback = function(rsJson){
			gRsJson = $.extend(true, {}, rsJson);

			var $listTable = $list.find("tbody").empty();
			var bAssetView = !!config_param.label_type;
			
			if(config_param.list_yn == "Y") {
				$listDiv.show();
				var cntColspan;
				
				if(bAssetView && config_param.label_type == "ASSET"){
					$thAssetCaption.show();
					cntColspan = 4;
				}else{
					$thAssetCaption.hide();
					cntColspan = 3;
				}
				
				if(rsJson.list.length == 0) {
					$list.append('<tr><td class="list-empty" colspan="'+ cntColspan +'">There is no result.</td></tr>');
				}
			}
			else {
				$listDiv.hide();
			}
			
			for(var i = 0; i < rsJson.list.length; i++) {
				var filterList = param.section_name + ':' + _SL.luceneValueEscape(rsJson.list[i].label),
 					 filterListString = JSON.stringify(filterList),
 					// strHref ="javascript:$.Dashboard.componentInstance['"+containerId+"'].viewLogSearch('"+ rsJson.start_time+ "', '" + rsJson.end_time + "', '"+  i +"')";
 					 strHref = "javascript:viewTop5LogSearch('"+ rsJson.start_time+ "', '" + rsJson.end_time + "', '"+ i +"', '"+param.section_name+':'+ _SL.luceneValueEscape(gRsJson.list[i].label)+"', '"+containerId+"')";

				// *** List *** 
				if(config_param.list_yn == "Y") {
					
					var $tr = $("<tr />")
						.append( "<td>"+(i+1)+"</td>")
						.append( "<td><a href=\""+strHref+"\" name='search_log'>"+rsJson.list[i].label+"</a></td>" )
						.append( bAssetView && config_param.label_type == "ASSET" ?  $("<td>").text(rsJson.list[i].asset_name).attr("title", rsJson.list[i].asset_name) : "" )
						.append( "<td>"+_SL.toComma(rsJson.list[i].value)+"</td>" )
						.appendTo($listTable);

					var flagCode;
					
					if(param.section_name.indexOf('country_name') != -1){
						flagCode =  rsJson.list[i].country_code;
						
						if(rsJson.list[i].label=="N/A")	flagCode = "N-A";
						
						if(flagCode != "PRN"){
							$tr.find('td:eq(1)').prepend('<img src="/resources/images/flag/'+flagCode+'.png" alt="'+flagCode+'" width="16" height="11">');
						} else {
							$tr.find('td:eq(1)').prepend('<i class="icon-lock"></i>');
						}
					}
				}

				rsJson.list[i].link = strHref;
				if(bAssetView && config_param.label_type == "ASSET") {
					rsJson.list[i].toolText = (rsJson.list[i].asset_name == "" ? rsJson.list[i].label : rsJson.list[i].asset_name + "(" + rsJson.list[i].label + ")") + ", " + rsJson.list[i].value;
					rsJson.list[i].label = (rsJson.list[i].asset_name == "" ? rsJson.list[i].label : rsJson.list[i].asset_name);
				}
				else if(param.section_name == "dstn_port") {
					rsJson.list[i].label = " Port No : " + rsJson.list[i].label;
				}
			}
			
			$listTable = null;
			setTitle();

			//drawChart
			if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
				$.Dashboard.chartInstance[containerId].setJSONData({
					chart : chartStyle,
					categories : [],
					data : rsJson.list
				});
			}else{
				FusionCharts.ready(function(){
					$.Dashboard.chartInstance[containerId] = new FusionCharts({
						type: 'bar2d',
						renderAt: 'chart-container_' + containerId,
						width: '100%',
						height: 240,
						dataFormat: 'json',
						dataSource: {
							chart : chartStyle,
							categories : [],
							data : rsJson.list
						}
					}).render();
				});
			}
		}

		// IP 표시 설정 필요한지 체크 
		if(param.section_name.indexOf("_ip") == -1) {
			delete config_param.label_type;
			$labelTypeTr.remove();
			$listThChild.remove();
		}
		
		$("body").requestData(urlSelect, config_param, {callback : refreshCallback});
	},
	
	showConfig = function(){
		$groupCd.val(config_param.group_cd);
		$logCateCd.val(config_param.log_cate_cd);
		$lastPeriod.val(config_param.last_period);
		$labelType.val(config_param.label_type);
		$rows.val(config_param.rows);
		$form.find("[name=list_yn]:input[value=" + config_param.list_yn + "]").prop("checked", true);
	},
	
	chartStyle = {
		"caption": "",
		"subCaption": "",
		"xAxisName": "",
		"yAxisName": "Count",
		"numberPrefix": "",
		"maxLabelWidthPercent" :"20"
	},
	
	/*viewLogSearch = function(sTime,eTime,i) {
		var filterList = param.section_name + ':' + _SL.luceneValueEscape(gRsJson.list[i].label);
		
		$("input[type=hidden]", $searchForm).val("");//form 초기화
		$("[name=start_time]", $searchForm).val(sTime);
		$("[name=end_time]", $searchForm).val(eTime);
		$("[name=expert_keyword]", $searchForm).val(filterList);
			
		var winName = "TOP5_" + (new Date()).getTime();
			
		$searchForm.attr({
			action : urlLogSearch,
			target : winName,
			method : "post"
		}).submit();
	},*/
	
	beforeSaveConfig = function() {
		config_param.last_period = $lastPeriod.val();
		config_param.label_type = $labelType.val();
		config_param.rows = $rows.val();
		config_param.list_yn = $form.find("[name=list_yn]:checked").val();
		config_param.curDate = (new Date()).getTime();
		config_param.section_name = param.section_name;
		config_param.log_cate_cd = $logCateCd.val();
		config_param.group_cd = $groupCd.val();
	},
		
	afterSaveConfig = function() {
		setTitle();
		refresh(true);
	},
	
	setLogCateCds = function() {
		$logCateCd.html('<option value="">[선택하세요]</option>');

		for(var key in ComCodes.CS0010){
			$logCateCd.append( $('<option>').val(key).text(ComCodes.CS0010[key]) );
		}
	},
	
	setGroupCds = function() {
		$groupCd.html('<option value="">[선택하세요]</option>');
		for(var key in ComCodes.CS0011){
			$groupCd.append( $('<option>').val(key).text(ComCodes.CS0011[key]) );
		}
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig      : showConfig,
		beforeSaveConfig : beforeSaveConfig,
		afterSaveConfig : afterSaveConfig
		//viewLogSearch : viewLogSearch
	};
}