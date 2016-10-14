//# sourceURL=system_status.js

'use strict';

var goPerformance = function(eqp_type, eqp_ip, _label) {

	var label       = _label.split(':');
	var endTime = _SL.formatDate().substring(0,8)+label[0]+label[1];
	var startTime = _SL.formatDate.addMin(endTime,-10);

	var url = gCONTEXT_PATH + 'monitoring/performance_view.html?s_eqp_type_cd='+eqp_type + '&s_eqp_ip='+eqp_ip + '&start_time='+startTime + '&end_time='+endTime;
	window.open(url,"SystemView"+(new Date()).getTime());
};

_SL.nmspc("slapp.component").system_status = function(id, configParam, componentTitle) {

	var
	containerId = id,
	config_param = configParam,
	component_title = componentTitle,
	options = {bLoaded : false},
	//장비 성능정보 팝업 변수(2개)
	eqpList = [],
	eqpEndTime,
	
	urlSelect		= gCONTEXT_PATH + "component/system_status.json",
	urleqpList		= gCONTEXT_PATH + "component/eqp_list.json",
	urlView		= gCONTEXT_PATH + 'monitoring/performance_view.html',
	
	$body			= $("#system-status-" + containerId),
	$form			= $("#config_" + containerId + " form"),
	
	$title			= $body.find(".sp-title"), 
	$eqpIp		= $form.find("[name=eqp_ip]"),
	
	$cpuStat		= $("#cpu_stat_" + containerId),
	$memStat		= $("#memory_stat_" + containerId),
	$readStat		= $("#read_stat_" + containerId),
	
	/*//기존 장비성능정보 팝업
	goPerformance = function(label) {		console.log(label);
		if(label =="" || typeof(label) == "undefined") { label = eqpEndTime; }

		var eqpTypMap	= JSON.parse(eqpList),
		 eqpTyp		= "",
		 label       = label.split(':'),
		 endTime     = _SL.formatDate().substring(0,8)+label[0]+label[1],
		 startTime   = _SL.formatDate.addMin(endTime,-10);
		for(var i in eqpTypMap) {
			if(config_param.eqp_ip == eqpTypMap[i].eqp_ip) eqpTyp = eqpTypMap[i].eqp_type_cd;
		}

		var url = urlView +'?s_eqp_type_cd='+eqpTyp + '&s_eqp_ip='+config_param.eqp_ip + '&start_time='+startTime + '&end_time='+endTime,
		 modal = new ModalPopup(url, {
			width:1000,
			height:820,
			setScroll:true,
			onClose : function(){
				refresh(true);
			}
		});
	},*/

	load = function() {
		this.config_param = config_param;
		chartStyle = $.extend(this.chartstyles, chartStyle);
		chartStyle.paletteColors = chartStyle.unitColor;
		
		if(FusionCharts) {
			FusionCharts.items[containerId + "_id"] = null;
			delete FusionCharts.items[containerId + "_id"];
		}
		
		// Bind Event
		$eqpIp.chosen({
			search_contains : true,
			width:"100%"
		});
		
		refresh();
	},
	
	refresh = function(isRefresh) {
		var rqData = $.extend({curDate : (new Date()).getTime()}, options, config_param),
		refreshCallback = function(rsJson){
			eqpList = rsJson.EQP_LIST;

			var chartData = rsJson.chartData;
			var eqpTypMap = JSON.parse(eqpList);
			var eqpTyp = "";
			for(var i in eqpTypMap){
				if(config_param.eqp_ip == eqpTypMap[i].eqp_ip) eqpTyp = eqpTypMap[i].eqp_type_cd;
			}

			/*// 컴포넌트 추가 또는 로드시 eqp_ip/eqp_nm 설정
			if(!options.bLoaded) {
				//console.log("WAS IP : " + rsJson.eqp_ip);
				// 장비 지정 할 수 없을 경우 리턴
				if(!rsJson.eqp_ip) {
					return;
				}
				options.title = rsJson.eqp_nm + "[" + rsJson.eqp_ip + "]";
				options.bLoaded = true;

				//$title.html("<a href=\"javascript:$.Dashboard.componentInstance['"+containerId+"'].goPerformance();\"><h5>" + options.title + "</h5></a>");
				if(!config_param.eqp_ip) {
					config_param.eqp_ip = rsJson.eqp_ip;
				}

				$title.html('<a href="javascript:goPerformance(\''+eqpTyp+'\',\''+config_param.eqp_ip+'\',\''+eqpEndTime+'\');"><h5>' + options.title + '</h5></a>');
			}*/
			
			if(typeof(rsJson.cpu) == 'undefined' ) rsJson.cpu = "-";
			if(typeof(rsJson.memory) == 'undefined' ) rsJson.memory = "-";
			if(typeof(rsJson.read_bytes) == 'undefined' ) rsJson.read_bytes = "-";
			if(typeof(rsJson.write_bytes) == 'undefined' ) rsJson.write_bytes = "-";
			
			$cpuStat.text(" "+ rsJson.cpu + "%");
			$memStat.text(" "+ rsJson.memory + "%");
			$readStat.text(" "+ _SL.formatNumber(rsJson.read_bytes) + "/" + _SL.formatNumber(rsJson.write_bytes));
			
			var netData = {
				chart : chartStyle,
				categories : [{
					category : chartData
				}],
				dataset : []
			},
			
			 data1 = [],
			 data2 = [],
			 maxValue = 0,
			 len = chartData.length == 0 ? "" : chartData.length - 1;

			for(var i = 0, l = chartData.length; i < l; i++) {
				maxValue =  Math.max(Math.max(chartData[i].value, chartData[i].value2), maxValue);
				//data1[i] = { value : chartData[i].value , link : 'javascript:$.Dashboard.componentInstance["'+containerId+'"].goPerformance("'+chartData[len].label+'")' };
				//data2[i] = { value : chartData[i].value2, link : 'javascript:$.Dashboard.componentInstance["'+containerId+'"].goPerformance("'+chartData[len].label+'")' };
				data1[i] = { value : chartData[i].value , link : 'javascript:goPerformance("'+eqpTyp+'","'+config_param.eqp_ip+'","'+chartData[len].label+'")' };
				data2[i] = { value : chartData[i].value2, link : 'javascript:goPerformance("'+eqpTyp+'","'+config_param.eqp_ip+'","'+chartData[len].label+'")' };
			}

			//y축의 마지막값을 지정
			netData.chart.yAxisMaxValue = _SL.getChartMaxValue(maxValue);
			
			if(len != "") {
				eqpEndTime = rsJson.chartData[len].label;
				//netData.chart.logoLink = "javascript:$.Dashboard.componentInstance['"+containerId+"'].goPerformance('"+chartData[len].label+"')";
				netData.chart.logoLink = "javascript:goPerformance('"+eqpTyp+"','"+config_param.eqp_ip+"','"+chartData[len].label+"')";
			} else {
				eqpEndTime = _SL.formatDate(_SL.formatDate(), 'yyyyMMddHHmm','HH:mm');
			}

			netData.dataset[0] = {
				seriesname : "Inbound",
				color : "#89cf43",
				data : data1
			};
			netData.dataset[1] = {
				seriesname : "Outbound",
				color : "#0099ff",
				data : data2
			};

			// 컴포넌트 추가 또는 로드시 eqp_ip/eqp_nm 설정
			if(!options.bLoaded) {
				//console.log("WAS IP : " + rsJson.eqp_ip);
				// 장비 지정 할 수 없을 경우 리턴
				if(!rsJson.eqp_ip) {
					return;
				}
				options.title = rsJson.eqp_nm + "[" + rsJson.eqp_ip + "]";
				options.bLoaded = true;

				//$title.html("<a href=\"javascript:$.Dashboard.componentInstance['"+containerId+"'].goPerformance();\"><h5>" + options.title + "</h5></a>");
				if(!config_param.eqp_ip) {
					config_param.eqp_ip = rsJson.eqp_ip;
				}

				$title.html('<a href="javascript:goPerformance(\''+eqpTyp+'\',\''+config_param.eqp_ip+'\',\''+eqpEndTime+'\');"><h5>' + options.title + '</h5></a>');
			}

			if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
				$.Dashboard.chartInstance[containerId].setJSONData(netData);
			} else {
				FusionCharts.ready(function(){
					$.Dashboard.chartInstance[containerId] = new FusionCharts({
						type: 'msarea',
						renderAt: 'chart-container-' + containerId,
						width: '100%',
						height: '200',
						dataFormat: 'json',
						dataSource: netData
					}).render();
				});
			}
		};

		$("body").requestData(urlSelect, rqData, {callback : refreshCallback});
	},
	
	showConfig = function() {
		//장비
		$eqpIp.empty();
		
		for(var idx in EquipList) {
			var eData = EquipList[idx];
			$eqpIp.append('<option value="'+eData.eqp_ip+'">'+eData.eqp_nm + '[' + eData.eqp_ip + ']</option>');
		}
		$eqpIp.val(config_param.eqp_ip);
		$eqpIp.trigger("chosen:updated");
	},
	
	beforeSaveConfig = function() {
		var strEqpIp = $eqpIp.find("option:selected").val();
		var strTitle = $eqpIp.find("option:selected").text();
		
		if(strEqpIp == "") {
			delete config_param.eqp_ip;
		} else {
			config_param.eqp_ip = strEqpIp;
			options.title = strTitle;
			$title.html("<a href=\"javascript:$.Dashboard.componentInstance['"+containerId+"'].goPerformance();\"><h5>" + options.title + "</h5></a>");
		}
	},
	
	afterSaveConfig = function() {
		refresh(true);
	},
	
	_chart = null,
	
	chartStyle = {
		"plotfillalpha" : "60",
		"showValues": "0"
	}

	return {
		containerId		: containerId,
		config_param	: config_param,
		component_title	: component_title,
		options			: options,
		load				: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig,
		goPerformance	: goPerformance
	};
}