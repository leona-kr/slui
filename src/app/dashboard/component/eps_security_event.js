//# sourceURL=eps_security_event.js

'use strict';

_SL.nmspc("slapp.component").eps_security_event = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$tableList = $("#"+containerId+"_inner_container"),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),
	
	urlList = gCONTEXT_PATH + 'component/eps_security_event_list.do',
	urlLinkList = gCONTEXT_PATH + 'event2/eps_ip_event_list.html',
	default_param = {},

	$formConfig = $("#config_" + containerId + " .btn-apply"),
	config_param = configParam,
	component_title = componentTitle,

	load = function() {
		this.title = component_title; 
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		drawList();	
	},
	
	bindEvent = function() {
		// Bind Event
		$body
			.on("click", ".goSmsView_"+containerId, function() {
				var keyArr = $(this).attr("key").split(",");
				/*openWindow("equipWin_" + (new Date()).getTime(), urlPerformanceViewList, 600, 800, null, "yes");*/
				var eqpIp = keyArr[2];
				var eqpType = keyArr[1];
				var endTime = _SL.formatDate.addMin(keyArr[3], 1);
				var startTime = _SL.formatDate.addMin(endTime, -30);
				viewDetail(urlPerformanceViewList +'?s_eqp_type_cd='+eqpType + '&s_eqp_ip='+eqpIp + '&start_time='+startTime + '&end_time='+endTime);
			});
		$form
			.on("click", $formConfig, function(){
				
				config_param = $.extend({}, _SL.serializeMap($form));
				drawList();
				_setTitle();
				_setParam();
		});
		
		$body.find(".grid-table-group [class*=color_ec]").off().on('click',function(){
			var $target = $(this);
			var tc_type = $target.data("tc_type");
			var event_cate_cd = $target.data("event_cate_cd");
			var count = $target.data("count");
			var startTime = $target.data("start_time");
			var endTime = $target.data("end_time");
	
			var $searchForm = $body.find("[name=epsSecurityEventForm]");
			
			$searchForm.find("[name=start_time]").val(startTime);
			$searchForm.find("[name=end_time]").val(endTime);
			$searchForm.find("[name=count]").val(count);
			$searchForm.find("[name=event_cate_cd]").val(event_cate_cd);
			$searchForm.find("[name=tc_type]").val(tc_type);
			
			var winName = "epsSecurityEventWin_" + (new Date()).getTime();
				$searchForm.attr({
				action : urlLinkList,
				target : winName,
				method : "post"
			}).submit();
		});
	},
	
	drawList = function(){
		var trArr = [],
			trArr1 = [],
			$tBody = $body.find(".grid-table-group tbody").empty(),
			$tHead = $body.find(".grid-table-group thead").empty(),
			drawCallback = function(rsData){
			var list = rsData.rsList;
			var eventCates = rsData.eventCates;	
				//thead
				$tHead.append("<th scope='col'>구분</th>");
				for(var i in eventCates){
					$tHead.append("<th scope='col'><span>"+i+"단계</span><br>(" + eventCates[i] + ")</th>");
				}
		
				if( list.length == 0 ){
					$tBody.append("<tr><td colspan='9' class='list-empty'> 검색 결과가 없습니다. </td></tr>");
				}
				
				for(var i in list){
					var rowData = list[i];
					var $tr = $("<tr>");
					var event_type="";
					//구분
					if(rowData.tc_type == '1'){
						event_type = "Trigger";
					}else{
						event_type = "Trace";
					}
					$tr.append("<td>" + event_type + "</td>");
					
					//단계별
					for(var j in eventCates){
						var count = rowData["cate"+j+"_cnt"];
						var $td = $("<td>");
						$td.append(count);//count입력
						
						if(count != 0){
							$td
							.attr('tabindex','1')
							.addClass("color_ec" + j)		//색 입히기
							.data({				//링크에서 사용할 변수들
								"tc_type": rowData.tc_type,
								"event_cate_cd": j,
								"count": count,
								"start_time": rsData.start_time,
								"end_time": rsData.end_time
							});
						}
						
						$td.appendTo($tr);
					};
					
					//위혐도
					/*if(i == 0 ) $tr.append($("<td rowspan='"+list.length+"'>" + rowData.risk_score + "%</td>"))*/
					$tr.appendTo($tBody);
				}
	
				bindEvent();
			}

		config_param = $.extend({}, default_param, config_param);

		$('body').requestData(urlList, config_param, { callback : drawCallback});
	},
	
	refresh = function() {	
		drawList();
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:1000, height:900,
			onClose : function(){
				refresh();
			}
		});
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh
	};
}