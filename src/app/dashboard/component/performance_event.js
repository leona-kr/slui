//# sourceURL=performance_event.js

'use strict';

_SL.nmspc("slapp.component").performance_event = function(id, configParam, componentTitle) {
	var
	containerId = id,
		
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),

	$tableList	= $body.find(".grid-table-group"),
	$eqpIpLink = $body.find(".goSmsView"),
	
	$formConfig = $form.find(".btn-apply"),
	$smsCd	= $form.find("[name=sms_type]"),
	$eventLevel	= $form.find("[name=event_level]"),
	$rows	= $form.find("[name=rows]"),
	
	urlPerformanceViewList = gCONTEXT_PATH + 'monitoring/performance_view.html',
	urlSmsCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlLevelCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlSelect		= gCONTEXT_PATH + "component/performance_event.json",
	
	default_param = {},

	config_param = configParam,
	component_title = componentTitle,

	load = function() {
		this.title = component_title; 
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		initConfig();
		
		$body.off().on("click", "[class^=goSmsView_]", function(){
			var keyArr = $(this).attr("data-key").split(",");
			/*openWindow("equipWin_" + (new Date()).getTime(), urlPerformanceViewList, 600, 800, null, "yes");*/
			var eqpIp = keyArr[2];
			var eqpType = keyArr[1];
			var endTime = _SL.formatDate.addMin(keyArr[3], 1);
			var startTime = _SL.formatDate.addMin(endTime, -30);
			viewDetail(urlPerformanceViewList +'?s_eqp_type_cd='+eqpType + '&s_eqp_ip='+eqpIp + '&start_time='+startTime + '&end_time='+endTime);
		});
		
		refresh();
	},
	
	showConfig = function() {
		$smsCd.val(config_param.sms_type);
		$eventLevel.val(config_param.event_level);
		$rows.val(config_param.rows);
	},
	
	beforeSaveConfig = function(){
		config_param.sms_type = $smsCd.val();
		config_param.event_level = $eventLevel.val();
		config_param.rows = $rows.val();	
	},
	
	afterSaveConfig = function() {
		refresh();
	},
	
	initConfig = function(){
		
		// DOM 생성
		if(!ComCodes.CS0003) {
			$("body").requestData(urlSmsCodeMap, {code_type : 'CS0003'}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0003 = rsJson;
				_setSmsGroupCds();
				_setTitle();
			}});
		}else{
			_setSmsGroupCds();
		}
		
		if(!ComCodes.CS0005) {
			$("body").requestData(urlLevelCodeMap, {code_type : 'CS0005'}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0005 = rsJson;
				_setLevelGroupCds();
				_setTitle();
			}});
		}else{
			_setLevelGroupCds();
		}
		
		_setParam();
		
	},
	
/*	bindEvent = function() {
		// Bind Event
		$body
			.on("click", ".goSmsView_"+containerId, function() {
				var keyArr = $(this).attr("key").split(",");
				openWindow("equipWin_" + (new Date()).getTime(), urlPerformanceViewList, 600, 800, null, "yes");
				var eqpIp = keyArr[2];
				var eqpType = keyArr[1];
				var endTime = _SL.formatDate.addMin(keyArr[3], 1);
				var startTime = _SL.formatDate.addMin(endTime, -30);
				viewDetail(urlPerformanceViewList +'?s_eqp_type_cd='+eqpType + '&s_eqp_ip='+eqpIp + '&start_time='+startTime + '&end_time='+endTime);
			});
	},
	*/
	refresh = function() {	
		var $tBody = $tableList.find("tbody");
		//config_param = $.extend({}, _SL.serializeMap($form));

		$("body").requestData(urlSelect, config_param, {callback : function(rsJson){
			$tBody.empty();
			var rsJsonLen = (rsJson)? rsJson.length : 0;
			if(rsJsonLen > 0){
				var $tr;
				for(var i = 0; i < rsJsonLen; i++){
					var eqpIp = rsJson[i].eqp_ip;
					var currVal = rsJson[i].curr_val;
					var fmCurrlVal = _SL.formatNumber(currVal);
					var limitVal = rsJson[i].limit_val;
					var fmLimitVal = _SL.formatNumber(limitVal);
					var eqpTime = _SL.formatDate(rsJson[i].eqp_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');	
					var eventLevel = rsJson[i].event_level;
					var eventTypeCd = rsJson[i].eqp_type_cd;

					$tr = $('<tr />')
						.append("<td>"+(i+1)+"</td>")
						.append("<td><a class='goSmsView_"+containerId+"' tabindex='1' style='cursor:pointer;' data-key='"+containerId+","+eventTypeCd+","+eqpIp+","+rsJson[i].eqp_time+"'>"+rsJson[i].eqp_nm+"("+eqpIp+")"+"</a></td>")
						.append("<td>"+rsJson[i].sms_type_nm+"</td>");
					if(rsJson[i].event_level == "1"){
						$tr.append("<td><span class='label-success'>Low</span></td>");
					}else if(rsJson[i].event_level == "2"){
						$tr.append("<td><span class='label-attention'>Middle</span></td>");
					}else if(rsJson[i].event_level == "3"){
						$tr.append("<td><span class='label-danger'>High</span></td>");
					}
					if(rsJson[i].sms_type == '1' || rsJson[i].sms_type == '2'){
						$tr.append("<td>"+currVal+"% / "+limitVal+"%</td>");
					}else{
						$tr.append("<td><span>"+fmCurrlVal+"</span>/<span>"+fmLimitVal+"</span></td>");
					}
					$tr.append("<td>"+eqpTime+"</td>");

					$tr.appendTo($tBody)
						.hide()
						.fadeIn(1500);
				}
			}else{
				$tBody.append('<tr><td scope="col" colspan="6">There is no Search Result</td></tr>');
			}
		}});
		_setTitle();
	},
	
	_setParam = function() {
		
		_setLevelGroupCds();

		_setSmsGroupCds();
				
		if(config_param.rows){
			$("#config_" + containerId + " [name=rows] option").each(function(){
				if($(this).val() == config_param.rows) $(this).prop("selected", true);
			});
		}
	},
	
	_setTitle = function(){
		var titleStr = "";
		var cnt = 0;
		for(var key in config_param){
			if(config_param[key] != ""){
				if(key == "sms_type"){
					titleStr += (cnt > 0)? " , " : ""; 
					titleStr += "구분 : ";
					
					if(!ComCodes.CS0003){
						$("body").requestData(urlSmsCodeMap, {code_type : 'CS0003'}, {callback : function(rsJson, rsCd, rsMsg) {
							ComCodes.CS0003 = rsJson;
							titleStr += ComCodes.CS0003[config_param[key]];
						}});
					}else{
						titleStr += ComCodes.CS0003[config_param[key]];
					}
					
					cnt++;
				}else if(key == "event_level"){
					titleStr += (cnt > 0)? " , " : ""; 
					titleStr += "등급 : ";
					if(!ComCodes.CS0005){
						$("body").requestData(urlLevelCodeMap, {code_type : 'CS0005'}, {callback : function(rsJson, rsCd, rsMsg) {
							ComCodes.CS0005 = rsJson;
							titleStr += ComCodes.CS0005[config_param[key]];
						}});
					}else{
						titleStr += ComCodes.CS0005[config_param[key]];
					}
					cnt++;
				}
			}
		}
		(cnt == 0)? $("#"+containerId+"_inner_container .sp-title h5").text("전체") : $("#"+containerId+"_inner_container .sp-title h5").text(titleStr);
	},

	_setSmsGroupCds = function() {	
		$smsCd.html('<option value="">[선택하세요]</option>');
		
		for(var key in ComCodes.CS0003){
			var $opt = $('<option>').val(key).text(ComCodes.CS0003[key]);
			if(config_param.sms_type == key) $opt.prop('selected',true);
			$smsCd.append($opt);
		}
	},
	
	_setLevelGroupCds = function() {
		$eventLevel.html('<option value="">[선택하세요]</option>');
		
		for(var key in ComCodes.CS0005){
			var $opt = $('<option>').val(key).text(ComCodes.CS0005[key]);
			if(config_param.event_level == key) $opt.prop('selected',true);
			$eventLevel.append($opt);
		}
	},
	
	viewDetail = function(url){
		window.open(url,"performView"+(new Date()).getTime());
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		showConfig		: showConfig,
		beforeSaveConfig: beforeSaveConfig,
		afterSaveConfig	: afterSaveConfig
	};
}