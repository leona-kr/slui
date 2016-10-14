//# sourceURL=eps_security_risk.js
'use strict';

_SL.nmspc("slapp.component").eps_security_risk = function(id, configParam, componentTitle, componentParam) {
	var
	containerId = id,
	
	$chartDiv	= $("#chart-container_" + containerId),
	$resultDiv	= $("#result-container_" + containerId),
	
	urlSelect	= gCONTEXT_PATH + "component/eps_security_risk_chart.json",
	
	default_param = {curDate : (new Date()).getTime()},
	config_param = configParam,
	
	load = function() {
		gaugeStyle.style.fill = this.chartstyles.bgColor;

		this.config_param = config_param = $.extend({}, default_param, config_param);

		refresh();
	},
	
	refresh = function() {
		$("body").requestData(urlSelect, config_param, {callback : function(rsJson){
			switch(rsJson.RISK_LEVEL){
				case 1:
					gaugeStyle.colorScheme = 'scheme01';
					break;
				case 2:
					gaugeStyle.colorScheme = 'scheme02';
					break;
				case 3:
					gaugeStyle.colorScheme = 'scheme03';
					break;
				case 4:
					gaugeStyle.colorScheme = 'scheme07';
					break;
				case 5:
					gaugeStyle.colorScheme = 'scheme04';
					break;
			}
			$chartDiv.jqxGauge(gaugeStyle);
			$chartDiv.jqxGauge('setValue', rsJson.RISK_LEVEL * 20 - 10);
		}});
	},
	gaugeStyle = {
			ranges: [{ startValue: 0, endValue: 20, style: { fill: '#0099ff', stroke: '#0099ff' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
					 { startValue: 20, endValue: 40, style: { fill: '#89cf43', stroke: '#89cf43' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
					 { startValue: 40, endValue: 60, style: { fill: ' #ffc000', stroke: ' #ffc000' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
					 { startValue: 60, endValue: 80, style: { fill: '#ff8400', stroke: '#ff8400' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 },
					 { startValue: 80, endValue: 100, style: { fill: '#ff0000', stroke: '#ff0000' }, startDistance: '5%', endDistance: '5%', endWidth: 13, startWidth: 13 }
			],
			caption: { visible:false },
			max:100,
			endAngle: 180,
			startAngle: 0,
			value: 0,
			style: { 'stroke-width': '0' },
			animationDuration: 1500,
			colorScheme: 'scheme05',
			labels: { visible: true, position: 'outside', interval: 10,
				formatValue: function(value) { 
					var t = '';
					switch(value){
						case 10:
							t = '정상'; break;
						case 30:
							t = '관심'; break;
						case 50:
							t = '주의'; break;
						case 70:
							t = '경계'; break;
						case 90:
							t = '심각'; break;
					}
					return t;
				}
			},
			ticksDistance : "10%",
			ticksMinor: { visible: false },
			ticksMajor: { visible: false },
			border: { visible:false }
	}
	
	return {
		config_param   :  config_param,
		load			: load,
		refresh			: refresh
	};
}