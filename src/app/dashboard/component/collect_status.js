//# sourceURL=collect_status.js

'use strict';

var goCollectView = function(eqpIp, period){
	var url = gCONTEXT_PATH + 'monitoring/collect_info_view.html?&s_eqp_ip='+eqpIp+'&period='+period;
	window.open(url,"collectView"+(new Date()).getTime());
}

_SL.nmspc("slapp.component").collect_status = function(id, configParam, componentTitle) {

	var
	containerId = id,
	config_param = configParam,
	component_title = componentTitle,
	chartId			= "chart-inner-container-" + containerId,
	
	urlSelect		= gCONTEXT_PATH + "component/collect_status.json",
	//urlView			= gCONTEXT_PATH + 'monitoring/collect_info_view.html',
	
	$body			= $("#chart-container-" + containerId),
	$chtId			= $body.find("#chart-inner-container-" + containerId),
	$form			= $("#config_" + containerId + " form"),
	$eqpIp			= $form.find("[name=eqp_ip]"),
	$eqpList		= $form.find("[name=eqp_ip_list]"),
	$logCate		= $form.find("[name=log_cate_cd]"),
	$chtType		= $form.find("[name=chart_type]"),
	$lastPeriod		= $form.find("[name=last_period]"),
	
	$cfgEqpIp		= $form.find("[name="+containerId+"_eqp_ip]"),
	$cfgEqpList		= $form.find("[name="+containerId+"_eqp_ip_list]"),
	$cfgLogCate		= $form.find("[name="+containerId+"_log_cate_cd]"),
	$cfgChtType		= $form.find("[name="+containerId+"_chart_type]"),
	$cfgLastPeriod	= $form.find("[name="+containerId+"_last_period]"),
	
	default_param = {last_period : "30", col_opt : "equip", agent_ip : "", eqp_ip_list : "", log_cate_cd : "", chart_type : "A" },
	
	/*goCollectView = function(eqpIp){
		var url = urlView +'?&s_eqp_ip='+eqpIp+'&period='+config_param.last_period
		var modal = new ModalPopup(url, {
			width:1050,
			height:800,
			setScroll:true,
			onClose : function(){
				refresh();
			}
		});
	},*/
	
	load = function(isRefresh) {
		if(isRefresh === true){
			refresh(isRefresh);

		}else{

			this.title = component_title;
			this.config_param = config_param = $.extend({}, default_param, config_param);
			
			chartData.dataSource.chart = $.extend(this.chartstyles, chartStyle);
			//chartData.dataSource.chart.paletteColors = this.chartstyles.unitColor;
			//chartData.dataSource.chart.paletteColors = "#669933,#0099ff,#7dcbff,#6dd0f7,#ced2ff,#9fa7ff,#dfbcfe,#c07cfe,#dddddd,#ff0000,#ff9898,#ff8400,#ffc07d,#ffc000,#c3e79f,#89cf43";
			
			//설정부분
			$form
				.on("click", ".btn-add", function(){
					var val = $eqpIp.find(":selected").val();
					var text = $eqpIp.find(":selected").text();
					
					if($eqpList.find("option").size() > 10) {
						_alert("최대 10개까지만 선택가능합니다.");
						return;
					}
				
					if(val == "") {
						_alert("장비를 선택하세요.");
						return;
					}
				
					if( $eqpList.find("option").is( function() { return this.value == val; }) 	){
						_alert("동일한 장비가 존재합니다.");
						return;
					}
					
					$eqpList.append(new Option(text, val));
				})
				.on("click", ".btn-del", function(){
					$eqpList.find(":selected").remove();
				});
			
			if(FusionCharts) {
				FusionCharts.items[containerId + "_id"] = null;
				delete FusionCharts.items[containerId + "_id"];
			}
			
			// Bind Event
			$eqpIp.chosen({
				search_contains : true,
				width:"100%",
				max_selected_options : 10
			});
			
			refresh();

		}
	},
	
	refresh = function(isRefresh) {
		
		var eqp_ip_list = config_param.eqp_ip_list.split(",");
		
		if (config_param.eqp_ip_list != "" && eqp_ip_list.length > 0) {
			var getCategories = function(){
				var i = config_param.last_period;
				var dateArray = [];
				for (i; i>0; i--) {
					edate = _SL.formatDate.addMin(sysdate, i * -1);
					dateArray.push(_SL.formatDate(edate, "MM-dd HH:mm"));
				}
				
				var category = [], tmpList = [];
				for (var n in dateArray) {
					category.push({label : dateArray[n]});
					tmpList.push({value : 0});
				}
				chartData.dataSource.categories = [];
				chartData.dataSource.categories.push({"category" : category});
			};
			var edate, sysdate = _SL.formatDate();
			var chartType = _chartFiles[config_param.chart_type];
			var param = $.extend({curDate : (new Date()).getTime()}, config_param);
			var callback = function(rsJson){
				var dataset = [], eqp_ip;
				var period = config_param.last_period;

				getCategories();

				for (var idx in eqp_ip_list) {

					var eqpIpCaption, tmpList = [];
					eqp_ip = eqp_ip_list[idx];
					var tChartData = rsJson[eqp_ip];
					
					if(tChartData != null) {
						for(var i in tChartData) {
							tmpList.push({value : tChartData[i].value, link: 'javascript:goCollectView("'+eqp_ip+'","'+period+'")'});
						}
					} else {
						for(var i=0; i<period; i++) {
							tmpList.push({value : 0, link: 'javascript:goCollectView("'+eqp_ip+'","'+period+'")'});
						}
					}
					dataset.push({seriesname : eqp_ip, data : tmpList});
				}
				
				chartData.dataSource.dataset = dataset;

				if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
					$.Dashboard.chartInstance[containerId].chartType(chartType);
					$.Dashboard.chartInstance[containerId].setJSONData(chartData.dataSource);
				} else {
					FusionCharts.ready(function(){
						$.Dashboard.chartInstance[containerId] = new FusionCharts(chartData).render();
					});
				}
			};

			chartData.type = chartType;
			if(chartData.type == "msarea"){
				chartData.dataSource.chart.plotfillalpha = "60";
			}

			getCategories();

			$("body").requestData(urlSelect, param, {callback : callback});
		} else {
			var category = [];
			chartData.dataSource.categories = [];
			chartData.dataSource.dataset = [];
			chartData.dataSource.categories.push({"category" : category});
			
			if(isRefresh === true && $.Dashboard.chartInstance[containerId] != undefined){
				$.Dashboard.chartInstance[containerId].setJSONData(chartData.dataSource);
			} else {
				FusionCharts.ready(function(){
					$.Dashboard.chartInstance[containerId] = new FusionCharts(chartData).render();
				});
			}
		}
		
	},
	
	chartData = {
		type: "msarea",
		renderAt: chartId,
		width : "100%",
		height : "200",
		dataFormat : "json",
		dataSource : {
			chart : chartStyle,
			categories : [],
			dataset : []
		}
		
	},
	
	chartStyle = {
		"caption": "",
		"subCaption": "",
		"xAxisName": "",
		"yAxisName": "",
		"numberPrefix": "",
		"showValues" :"0"
	},
	
	_chartFiles = {"A" : "msarea", "L" : "msline", "C" : "mscolumn2d", "S" : "stackedcolumn2d"},
	
	showConfig = function() {
		
		//장비
		$eqpIp.html('<option value="">[선택하세요]</option>');
		$eqpList.empty();

		var eqpList = config_param.eqp_ip_list;
		var eqpIpArr = eqpList.split(",");
		
		for(var idx in EquipList) {
			var eData = EquipList[idx];
			$eqpIp.append('<option value="'+eData.eqp_ip+'">'+eData.eqp_nm + '[' + eData.eqp_ip + ']</option>');

			for(var idx in eqpIpArr){
				var eqpArr = eqpIpArr[idx];
				if(eqpArr == eData.eqp_ip) {
					$eqpList.append('<option value="'+eData.eqp_ip+'">'+eData.eqp_nm + '[' + eData.eqp_ip + ']</option>');
				}
			}
		}
		$eqpIp.trigger("chosen:updated");
		
		//로그분류코드
		$logCate.html('<option value="">[전체]</option>');

		for(var idx in LogCategoryList){
			var lData = LogCategoryList[idx];
			$logCate.append('<option value="'+lData.code_id+'">'+lData.code_name+'</option>');
		}

		$logCate.val(config_param.log_cate_cd);
		$chtType.val(config_param.chart_type);
		$lastPeriod.val(config_param.last_period);
	},
	
	validateConfig = function() {
		if($chtType.val() == "") {
			_alert("차트를 선택하세요.");
			return false;
		}
		
		return true;
	},
	
	beforeSaveConfig = function() {
		var eqp_ip_list = $.map($eqpList.find("option"), function(o, i){ return o.value; });
		var log_cate_cd = $logCate.val();
		var chart_type 	= $chtType.val();
		var last_period = $lastPeriod.val();
		
//		config_param.col_opt = $cntr.find(".config-select-area [name=col_opt]:checked").val();
		config_param.eqp_ip_list = eqp_ip_list.join(",");
		config_param.log_cate_cd = log_cate_cd;
		config_param.chart_type = chart_type;
		config_param.last_period = last_period;
	},
	
	afterSaveConfig = function() {
		refresh(true);
	}

	return {
		containerId		: containerId,
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		validateConfig	: validateConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig
		//_chartFiles		: _chartFiles,
		//goCollectView	: goCollectView
	};
}