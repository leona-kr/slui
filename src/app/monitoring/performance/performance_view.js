//# sourceURL=performance_view.js
'use strict';
_SL.nmspc("performance").view = function() {
	// Config 정의
	var
	
	onloadValue = {
			s_eqp_type_cd : '',
			s_eqp_ip : '' 
	},

	mCfg = {
		urlView : gCONTEXT_PATH + 'monitoring/performance_view.json',
		urlLoadEqpType : gCONTEXT_PATH + 'common/eqp_type_use_list.json',
		urlLoadEqp : gCONTEXT_PATH + 'common/equipment_list.json',
		urlCpuChart : gCONTEXT_PATH + 'monitoring/cpu_chart.json',
		urlMemoryChart : gCONTEXT_PATH + 'monitoring/memory_chart.json',
		urlDiskChart : gCONTEXT_PATH + 'monitoring/disk_chart.json',
		urlNetworkChart : gCONTEXT_PATH + 'monitoring/network_chart.json',
		gridId : '#gridPerformView',
		formId : '#searchPerformView',
		cpuId : '#cpuContainer',
		memoryId : '#memoryContainer',
		diskId : '#diskContainer',
		networkId : '#networkContainer'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId),
		cpu : $(mCfg.cpuId),
		memory : $(mCfg.memoryId),
		disk : $(mCfg.diskId),
		network : $(mCfg.networkId)
	},
	
	init = function(){
		
		var paramEqpTypeCd = m$.form.find('[name=param_eqp_type_cd]').val();
		var paramEqpIp = m$.form.find('[name=param_eqp_ip]').val();

		onloadValue.s_eqp_ip = (paramEqpIp)? paramEqpIp : '';
		onloadValue.s_eqp_type_cd = (paramEqpTypeCd)? paramEqpTypeCd : '';

		// 초기 화면 구성
		drawGrid(m$.grid);
		charRequest(m$.cpu.attr("id"));
		charRequest(m$.memory.attr("id"));
		charRequest(m$.disk.attr("id"));
		charRequest(m$.network.attr("id"));
		
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form)) return;
			
			refresh(onloadValue);
		});

		// 이벤트 Binding
		bindEvent();
		
		// 장비분류 change 이벤트 설정
		m$.form.find("[name=s_eqp_type_cd]").change(loadEqp);
		
		loadEqpType();
	},
	
	bindEvent = function() {
		//Search
		m$.form.find('.btn-submit').off().on('click',function(){
			var sTime = m$.form.find("[name=startDay]").val() + m$.form.find("[name=startHour]").val() + m$.form.find("[name=startMin]").val();
			var eTime = m$.form.find("[name=endDay]").val() + m$.form.find("[name=endHour]").val() + m$.form.find("[name=endMin]").val();
			
			var diffTime = _SL.formatDate.diff(sTime, eTime);
			if(diffTime <= 0){
				_alert("시작일이 종료일보다 큽니다.");
				return;
			}

			if(diffTime/60000 > $(mCfg.formId+" option:last-child").val()) {
				_alert("검색 기간 초과입니다.");
				return;
			} 
			
			if(!_SL.validate()) return;
			
			refresh();
		});
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;
			if (setMin == 0) return;

			var setDateUI = function( $obj, _value ){
				var $select = $obj.siblings('.tform-select');
				$select.find('.tform-select-t').text(_value).end()
					.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
				$obj.val(_value);
			}
			
			var startTime = _SL.formatDate.addMin(m$.form.find("[name=endDay]").val() + m$.form.find("[name=endHour]").val() + m$.form.find("[name=endMin]").val(), -setMin);
			setDateUI(m$.form.find("[name=startDay]"),startTime.substring(0,8));
			setDateUI(m$.form.find("[name=startHour]"),startTime.substring(8,10));
			setDateUI(m$.form.find("[name=startMin]"),startTime.substring(10,12));
		});
		
		// Date,Time change 이벤트 설정
		m$.form.find("[name=startDay],[name=startHour],[name=startMin],[name=endDay],[name=endHour],[name=endMin]").change(function(){
			var $obj = m$.form.find("[name=timeSet]"),
				t = $obj.siblings('.tform-select').find('[data-value=0]').text();
			$obj.val(0)
				.siblings('.tform-select').find('.tform-select-t').text(t);
		});
	},
	
	drawGrid = function($grid){
		var params = $.extend({}, _SL.serializeMap(m$.form));
		var gridSource = {
			datatype: "json",
			data : params,
			datafields: [
				{ name: "eqp_time", type: "string"},
				{ name: "cpu_used", type: "string"},
				{ name: "used_percent", type: "string"},
				{ name: "read_bytes", type: "string"},
				{ name: "write_bytes", type: "string"},
				{ name: "rx_bytes", type: "string"},
				{ name: "tx_bytes", type: "string"}
			],
			root: 'rows',
			beforeprocessing: function(data){
				if (data != null){
					gridSource.totalrecords = data.totalRows;
				}
			},

			cache: false,
			url: mCfg.urlView
		},
		
		dataadapter = new $.jqx.dataAdapter(gridSource, {
			beforeLoadComplete: function(rows) {
				_SL.formatNumber.Options.decimals = 1;
				for (var i in rows) {
					rows[i].eqp_dt = rows[i].eqp_time;
					rows[i].eqp_time = _SL.formatDate(rows[i].eqp_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					rows[i].read_bytes = _SL.formatNumber(rows[i].read_bytes/(1024*1024));
					rows[i].write_bytes = _SL.formatNumber(rows[i].write_bytes/(1024*1024));
					rows[i].rx_bytes = _SL.formatNumber(rows[i].rx_bytes/(1024*1024));
					rows[i].tx_bytes = _SL.formatNumber(rows[i].tx_bytes/(1024*1024));
				}
				return rows;
			},
			formatData : function(data) {
				var params = {}, param, flds = m$.form.serializeArray();
				for(param in flds) {
					params[flds[param].name] = flds[param].value;
				};
				$.extend(data, params);

				return data;
			},
			loadError: function(xhr, status, error){
				_alert(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			width: '100%',
			virtualmode: true,
			enablehover: false,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '장비시간', datafield: 'eqp_time', cellsalign:'center'},
				{ text:'CPU', datafield: 'cpu_used', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value +'%')[0].outerHTML;
					}
				},
				{ text: 'Memory', datafield: 'used_percent', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value +'%')[0].outerHTML;
					}
				},
				{ text: 'Read', datafield: 'read_bytes', width:"10%", columngroup: 'disk_bps', cellsalign: 'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value +'MB')[0].outerHTML;
					}
				},
				{ text: 'Write', datafield: 'write_bytes', width:"10%", columngroup: 'disk_bps', cellsalign: 'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value +'MB')[0].outerHTML;
					}
				},
				{ text: 'Inbound', datafield: 'rx_bytes', width:"10%", columngroup: 'netw_bps', cellsalign: 'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value +'MB')[0].outerHTML;
					}
				},
				{ text: 'Outbound', datafield: 'tx_bytes', width:"10%", columngroup: 'netw_bps', cellsalign: 'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value +'MB')[0].outerHTML;
					}
				}
			],
			columngroups: [
				{ text: 'Disk(MBps)', align: 'center', name: 'disk_bps' },
				{ text: 'Network(MBps)', align: 'center', name: 'netw_bps' }
			]
		});

		$grid.on("cellclick", function (event){});
	},

	refresh = function() {

		m$.cpu.empty();
		m$.memory.empty();
		m$.disk.empty();
		m$.network.empty();
		
		charRequest(m$.cpu.attr("id"));
		charRequest(m$.memory.attr("id"));
		charRequest(m$.disk.attr("id"));
		charRequest(m$.network.attr("id"));
		drawGrid(m$.grid);

	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			onClose : function(){
				refresh();
			}
		});
	},
	
	charRequest = function(chartId){
		var url = '',
			params = $.extend({}, _SL.serializeMap(m$.form)),
			callback = function(rsData){
				switch(chartId){
					case 'cpuContainer' : urlCpuChart(rsData.list, rsData.trs, chartId);
						break;
					case 'memoryContainer' : urlMemoryChart(rsData.list, rsData.trs, chartId);
						break;
					case 'diskContainer' : urlDiskChart(rsData.list, rsData.trs, chartId);
						break;
					case 'networkContainer' : urlNetworkChart(rsData.list, rsData.trs, chartId);
						break;
					default : return;
				}
			};

		if(params.s_eqp_ip == "" && params.param_eqp_ip == "") return;
		switch(chartId){
			case 'cpuContainer' : url = mCfg.urlCpuChart;
				break;
			case 'memoryContainer' :  url = mCfg.urlMemoryChart;
				break;
			case 'diskContainer' : url = mCfg.urlDiskChart;
				break;
			case 'networkContainer' : url = mCfg.urlNetworkChart;
				break;
			default : return;
		}
		$('body').requestData(url, params, {callback : callback});
	},
	
	urlCpuChart = function(data, trs, chartId){
		if(data == null || data.length == 0) return;
		var cpuChart = new FusionCharts({
			type: 'area2d',
			renderAt: chartId,
			width: '100%',
			height: '300',
			dataFormat: 'json'
		});
		var cpuData = {
			chart: {
				caption : "CPU Monitoring",
				numberSuffix : "%",
				showvalues: "0",
				formatnumberscale : "1",
				plotfillcolor : "#00acc6",
				yAxisMaxValue : '100',
				"showBorder": "1"
			},
			trendlines:[{
				line : [{ startvalue : trs.trs_cpu_low, color:"#ff8400", displayvalue:"", tooltext : "CPU 임계치", alpha : 100, showOnTop : 1}]
			}]
		};
		cpuData.chart = $.extend({}, slui.chart.chartConfig, cpuData.chart);
		cpuData.data = data;
		cpuChart.setJSONData(JSON.stringify(cpuData));
		cpuChart.render();
	},
	
	urlMemoryChart = function(data, trs, chartId){
			if(data == null || data.length == 0) return;

			var memChart = new FusionCharts({ 
				type: 'area2d',
				renderAt: chartId,
				width: '100%',
				height: '300',
				dataFormat: 'json'
			});
			var memData = {
				chart: {
					caption : "Memory Monitoring",
					numberSuffix : "%",
					showvalues: "0",
					plotfillcolor : "#00acc6",
					yAxisMaxValue : '100',
					"showBorder": "1"
				},
				trendlines:[{
					line : [{ startvalue : trs.trs_mem_low, color:"#ff8400", displayvalue:"", tooltext : "Memory 임계치", alpha : 100, showOnTop : 1}]
				}]
			};
			memData.chart = $.extend({},slui.chart.chartConfig,memData.chart);
			memData.data = data;
			memChart.setJSONData(JSON.stringify(memData));
			memChart.render();
	},
	
	urlDiskChart = function(data, trs, chartId){
			if(data == null || data.length == 0) return;
			var diskChart = new FusionCharts({
				type: 'msarea',
				renderAt: chartId,
				width: '100%',
				height: '300',
				dataFormat: 'json'
			});
			var diskData = {
				chart: {
					caption : "Disk Monitoring",
					numberSuffix : "B",
					showvalues : "0",
					"plotfillalpha" : "60",
					numvdivlines : "10",
					"showBorder": "1"
				},
				trendlines:[
					{line : [
						{ startvalue : trs.trs_io_read, color:"#ff8400", tooltext : "Read 임계치", alpha : 100, showOnTop : "1"},
						{ startvalue : trs.trs_io_write, color:"#6dd0f7", tooltext : "Write 임계치", alpha : 100, showOnTop : "1"}
					]}
				]
			};
			diskData.chart = $.extend({},slui.chart.chartConfig,diskData.chart);
			diskData.categories = new Array();
			diskData.categories[0] = {
				category : data
			}

			var data1 = [],
				data2 = [],
				maxValue = Math.max((trs.trs_io_read == '') ? 0 : trs.trs_io_read, (trs.trs_io_write == '') ? 0 : trs.trs_io_write);

			for(var i = 0; i < data.length; i++) {
				maxValue =  Math.max(Math.max(data[i].value, data[i].value2), maxValue);
				data1[i] = { value : data[i].value };
				data2[i] = { value : data[i].value2 };
			}
			diskData.chart.yAxisMaxValue = _SL.getChartMaxValue(maxValue);
			
			diskData.dataset  = new Array();
			diskData.dataset[0] = {
					seriesname : "Read",
					data : data1
			}
			diskData.dataset[1] = {
					seriesname : "Write",
					data : data2
			}
			diskChart.setJSONData(JSON.stringify(diskData));
			
			diskChart.render();
	},
	
	urlNetworkChart = function(data, trs, chartId){
			if(data == null || data.length == 0) return;
			var netChart = new FusionCharts({
				type: 'msarea',
				renderAt: chartId,
				width: '100%',
				height: '300',
				dataFormat: 'json'
			});
			var netData = {
					chart: {
						caption : "Network Monitoring",
						numberSuffix : "B",
						showvalues : "0",
						numvdivlines : "10",
						"plotfillalpha" : "60",
						"showBorder": "1"
					},
					trendlines:[
						{line : [
							{ startvalue : trs.trs_net_rx, color:"#ff8400", tooltext : "Inbound 임계치", alpha : 100, showOnTop : "1"},
							{ startvalue : trs.trs_net_tx, color:"#6dd0f7", tooltext : "Outbound 임계치", alpha : 100, showOnTop : "1"}
							]
						}
					]
			};
			netData.chart = $.extend({}, slui.chart.chartConfig, netData.chart );
				
			netData.categories = [];
			netData.categories[0] = {
				category : data
			}

			var data1 = [],
				data2 = [],
				maxValue = Math.max((trs.trs_net_rx == '') ? 0 : trs.trs_net_rx, (trs.trs_net_tx == '')? 0 : trs.trs_net_tx);

			for(var i = 0; i < data.length; i++) {
				maxValue =  Math.max(Math.max(data[i].value, data[i].value2), maxValue);
				data1[i] = { value : data[i].value };
				data2[i] = { value : data[i].value2 };
			}
			netData.chart.yAxisMaxValue = _SL.getChartMaxValue(maxValue);

			netData.dataset = [];
			netData.dataset[0] = {
					seriesname : "Inbound",
					data : data1
			}
			
			netData.dataset[1] = {
					seriesname : "Outbound",
					data : data2
			}
			netChart.setJSONData(JSON.stringify(netData));
			
			netChart.render();
	},	
	
	loadEqpType = function(){
		$('body').requestData(mCfg.urlLoadEqpType, {}, {
			callback : function(rsData){
				var obj = m$.form.find('[name=s_eqp_type_cd]:eq(0)');
				
				$.each(rsData.eqp_type_list, function(){
					obj.append('<option value="'+this.eqp_type_cd+'">'+this.eqp_type_nm+'</option>');
				});

				if(onloadValue.s_eqp_type_cd != ''){
					obj.val(onloadValue.s_eqp_type_cd);
					onloadValue.s_eqp_type_cd = '';
					loadEqp();
				}
				slui.attach.setTransformSelect(mCfg.formId);
				
			}
		});
	},
	
	loadEqp = function(){
		var selValue = m$.form.find('[name=s_eqp_type_cd]').val();
		m$.form.find("[name=s_eqp_ip]").html("<option value=''>[Name(IP Address)]</option>");
		if(selValue == null) selValue = "";
		if(selValue == "") {
			m$.form.find("[name=s_eqp_ip]").html("<option value=''>[Name(IP Address)]</option>");
			slui.attach.setTransformSelect(mCfg.formId);
			return;
		}

		$('body').requestData(mCfg.urlLoadEqp, {s_eqp_type_cd : selValue}, {
			callback : function(rsData){
				var obj = m$.form.find('[name=s_eqp_ip]');
				$.each(rsData.eqp_list, function(){
					obj.append('<option value="'+this.eqp_ip+'">'+this.eqp_nm + '(' + this.eqp_ip + ')'+'</option>');
				});

				if(onloadValue.s_eqp_ip != ''){
					obj.val(onloadValue.s_eqp_ip);
					onloadValue.s_eqp_ip = '';
				}
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
	}
	
	return {
		init: init
	};
}();


$(function(){
	slapp.performance.view.init();
});