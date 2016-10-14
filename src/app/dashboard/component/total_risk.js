//# sourceURL=eps_security_risk.js
'use strict';

_SL.nmspc("slapp.component").total_risk = function(id, configParam, componentTitle, componentParam) {
	var
	containerId = id,
	
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),
	//$chartDiv	= $("#chart-container_" + containerId),
	$resultDiv	= $("#result-container_" + containerId),
	
	$levelDiv	= $form.find("#area-table-risk-level"),
	$ruleSetDiv	= $form.find("#area-table-risk-ruleset"),
	
	urlSelectChart	= gCONTEXT_PATH + "component/total_risk_chart.json",
	urlSelectData	= gCONTEXT_PATH + "component/total_risk_data.json",
	urlSave 	= gCONTEXT_PATH + "system/risk_ruleset_update.do",
	
	component_title = componentTitle,
	
	load = function() {
		refresh();
	},
	
	refresh = function() {
		$("body").requestData(urlSelectChart, {curDate : (new Date()).getTime()}, {callback : function(rsJson){
			if(rsJson>0 && rsJson < 6){
				drawResult(rsJson);
			}
			//$chartDiv.jqxGauge(gaugeStyle);
			//$chartDiv.jqxGauge('setValue', rsJson * 20 - 10);
		}});
	},
	
	drawResult = function(value){
		switch(value){
			case 1:
				$resultDiv.attr('class','text-success').text('Normal');
				break;
			case 2:
				$resultDiv.attr('class','text-info').text('Attention');
				break;
			case 3:
				$resultDiv.attr('class','text-attention').text('Notice');
				break;
			case 4:
				$resultDiv.attr('class','text-warning').text('Alert');
				break;
			case 5:
				$resultDiv.attr('class','text-danger').text('Serious');
				break;
		}
	},
	
	/*gaugeStyle = {
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
			style: { 'stroke-width': '0', fill: '#ffffff' },
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
	},*/
	
	showConfig = function() {

		$("body").requestData(urlSelectData, {async : false}, {callback : function(rsJson){

			$levelDiv.empty();
			$ruleSetDiv.empty();
			
			//위험단계 테이블 Draw
			drawRiskLevelTbl(rsJson.level_list);

			//이벤트별 가중치 테이블 Draw
			drawRiskRuleSetTbl(rsJson.levels, rsJson.events, rsJson.evtWgtConfig);
			
			//위험도 비중 Change 이벤트
			$form.find('[name=ratio]').change(onRatioChange);
			
			$form.find('[name=ratio]').css("background-color","");	
			
		}});
	},

	drawRiskLevelTbl = function(levelList){
		
		var $tbl = $('<table class="board-table-group table-risk-ruleset"></table>');
		var $colgroup = $('<colgroup>');
		var $thead = $('<thead>');
		var $tbody = $('<tbody>');
		var $tr = $('<tr>');
		
		//**colGroup**
		$colgroup.append('<col width=118>').append('<col span=4>');
		
		//**th begin**
		$tr.append('<th scope="col">구분</th>');
		
		for(var idx = 1; idx < levelList.length; idx++){
			$tr.append('<th scope="col">'+ levelList[idx].risk_nm + '<br>' + levelList[idx].risk_nm_eng +'</th>');
		}
		
		$thead.append($tr);
		//**th end**
		
		//**td begin**
		$tr = $('<tr>');
		$tr.append("<td>위험률</td>");
		
		for(var idx = 1; idx < levelList.length; idx++){
			$tr.append('<td><input type="text" name="risk_range_from" class="form-input" value="'+ levelList[idx].risk_range_from +'" data-valid="required,number,min=0,max=100">')
			   .append('<input type="hidden" name="risk_level" class="form-input" value="'+ levelList[idx].risk_level +'"</td>');
			
		}
		
		$tbody.append($tr);
		//**td end**
		
		$tbl.append($colgroup).append($thead).append($tbody);
		$tbl.appendTo($levelDiv);
	},
	
	
	drawRiskRuleSetTbl = function(levels, events, evtWgtConfig){

		var levelsLen = Object.keys(levels).length;
		
		var $tbl = $('<table class="board-table-group table-risk-ruleset"></table>');
		var $colgroup = $('<colgroup>');
		var $thead = $('<thead>');
		var $tbody = $('<tbody>');
		var $tr = $('<tr>');
		
		//**colGroup**
		$colgroup.append('<col width=118>').append('<col width=84>')
				 .append('<col span=3>').append('<col width=72>');
		
		//**th begin**
		$tr.append('<th scope="col" rowspan="2">이벤트</th>').append('<th scope="col" rowspan="2">위험도 비중(%)</th>')
		   .append('<th scope="col" colspan="3">등급 가중치(건당)</th>').append('<th scope="col" rowspan="2">위험도 산출<br/> 최대 건수</th>');
		
		$thead.append($tr);
		
		$tr = $('<tr>');
		
		for(var idx = levelsLen; idx > 0; idx--){
			var strClassNm;
			
			switch(idx){
			case 1:
				strClassNm = "highlight-success"; 
				break;
			case 2:
				strClassNm = "highlight-attention";
				break;
			case 3:
				strClassNm = "highlight-danger";
				break;
			}
			
			$tr.append('<th scope="col" class="'+strClassNm +'">'+ levels[idx] +'</th>');
		}
		
		$thead.append($tr);
		//**th end**
		
		//**td begin**
		for(var outerIdx in events){
			$tr = $('<tr>');
			
			if(outerIdx != 5){
				
				$tr.append('<td>'+ events[outerIdx] +'<input type="hidden" name="event_type" value="'+ outerIdx +'"></td>')
				   .append('<td><input type="text" name="ratio" class="form-input" value="'+ evtWgtConfig[outerIdx].ratio  +'" data-valid="required,number,min=0,max=100"></td>');
				
					if(outerIdx == 4){
						var $td = $('<td>')
							.text('-')
							.addClass('align-center')
							.attr('colspan','3')
							.appendTo($tr)

						for(var inneridx = levelsLen; inneridx > 0; inneridx--){
							$td.append('<input type="hidden" name="lv'+ inneridx +'" class="form-input" value="1" data-valid="등급가중치,required,number,min=0,max=100">');
						}
					}else{
						for(var inneridx = levelsLen; inneridx > 0; inneridx--){
							$tr.append('<td><input type="text" name="lv'+ inneridx +'" class="form-input" value="'+ evtWgtConfig[outerIdx]['lv'+ inneridx] +'" data-valid="등급가중치,required,number,min=0,max=100"></td>');
						}
					}
					
					$tr.append('<td><input type="text" name="max_cnt" class="form-input" value="'+ evtWgtConfig[outerIdx].max_cnt +'" data-valid="산정 최대건수,required,number,min=0,max=99999"></td>');
			}
			$tbody.append($tr);	
		}
		
		$tbl.append($colgroup)
			.append($thead)
			.append($tbody)
			.appendTo($ruleSetDiv);
	},
	
	onRatioChange = function() {
		var $ratio = $form.find('[name=ratio]'),
		lastIdx = $ratio.length - 1,
		v = parseInt(this.value, 10),
		bLast = $ratio.eq(lastIdx)[0] == this,
		tot = 0,
		o;
	
		if(isNaN(v) || v < 0 || v > 100) {
			_alert("잘못된 입력 값입니다.");
			for(var i = 0; i <= lastIdx; i++) {
				o = $ratio.eq(i)[0];
				
				if(this != o) tot += parseInt(o.value, 10);
			}
			this.value = 100 - tot;
			this.focus();
			
			return false;
		}

		$ratio.css("background-color","");
		$(this).css("background-color", "#ffff44");
		
		tot = v;
		
		for(var i = 0; i <= lastIdx; i++) {
			o = $ratio.eq(i)[0];
			
			if(this != o) {
				tot += parseInt(o.value, 10);
				if(tot > 100 || i == (lastIdx + (bLast ? -1 : 0))) {
					o.value = parseInt(o.value, 10) + 100 - tot;
					$(o).css("background-color", "#ffff44");
					tot = 100;
				}
			}
		}
	},
	
	validateConfig = function() {
		var $riskRangeTo = $form.find('[name=risk_range_from]');
		var bfRange = -1;
		var isValidate = true;
		
		if(!_SL.validate($form)) {
			return false;
		}

		for(var i = 0; i < $riskRangeTo.size(); i++) {
			
			if(parseInt($riskRangeTo.eq(i).val()) <= bfRange){
				_alert("이전 단계보다 위험율이 커야 합니다.",{
					onAgree : function(){
						$riskRangeTo.eq(i).focus();
						isValidate = false;
					}
				});
				return;
			}

			bfRange = parseInt($riskRangeTo.eq(i).val());
		}
		
		
		if(!isValidate){
			return false;
		}
		else{
			$("body").requestData(urlSave +'?'+$form.serialize());
			return true;
		}
	},
	
	afterSaveConfig = function() {
		refresh();
	}
	
	return {
		component_title : component_title,
		load			: load,
		refresh			: refresh,
		showConfig      : showConfig,
		validateConfig  : validateConfig,
		//beforeSaveConfig : beforeSaveConfig,
		afterSaveConfig : afterSaveConfig
	};
}