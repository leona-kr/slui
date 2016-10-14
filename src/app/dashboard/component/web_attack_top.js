//# sourceURL=web_attack_top.js
'use strict';

_SL.nmspc("slapp.component").web_attack_top = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$tableList = $("#"+containerId+"_inner_container"),
	$eqpIpLink = $("#"+containerId + "_inner_container .goSmsView"),
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),

	urlList = gCONTEXT_PATH + 'component/web_attack_top_list.json',
	urlLinkList = gCONTEXT_PATH + 'event2/eps_security_event_list.html',
	
	$formConfig = $("#config_" + containerId + " .btn-apply"),
	default_param = {last_period : "1440",  rows : "5" , start_time : ""},

	config_param = configParam,
	component_title = componentTitle,

	load = function() {
		this.title = component_title; 
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		drawList();
		_setTitle();
		_setParam();
	},
	
	bindEvent = function() {
		// Bind Event
		$form.off()
			.on("click", $formConfig, function(){		
				
				config_param = $.extend({}, _SL.serializeMap($form));
				drawList();
				_setTitle();
				_setParam();
		});
		
		$body.find(".grid-table-group tbody").find("[class*=color_ec]").off().on('click',function(){
			var $target = $(this);
			var s_src_ip = $target.data("s_src_ip");
			var s_tc_type = "1";
			var s_event_cate_cd = $target.data("s_event_cate_cd");
			var $searchForm = $body.find("[name=webAttackTopForm]");
			
			$("[name=s_src_ip]", $searchForm).val(s_src_ip);
			$("[name=s_tc_type]", $searchForm).val(s_tc_type);
			$("[name=s_event_cate_cd]", $searchForm).val(s_event_cate_cd);
			
			var winName = "webAttackTopFormWin_" + (new Date()).getTime();

			$searchForm.attr({
				action : urlLinkList,
				target : winName,
				method : "post"
			}).submit();
			
		});
		
		
		$(".toolkitImg").each(function(){
			$(this).on('click',function(){
				fnVAToolkit($(this).attr('data-ip'));
			});	
		});
		
	},
	
	fnVAToolkit = function(srcIp) {
		
		$("#hiddenIFrame").attr("src", "/monitoring/va_toolkit.do?" + 
			$.param({
				/*start_time	: $("[name=startDay]").val() + $("[name=startHour]").val() + $("[name=startMin]").val(),
				end_time	: $("[name=endDay]").val() + $("[name=endHour]").val() + $("[name=endMin]").val(),*/
				
				start_time : $("[name=start_time]").val(),
				end_time : $("[name=end_time]").val(),
				
				expert_keyword	: "",
				src_ip : srcIp,
				tc_type : 1
			})
		);
	},
	
	drawList = function(){
		var trArr = [];
		var trArr1 = [];
		var $tBody = $body.find(".grid-table-group tbody");
		var $tHead = $body.find(".grid-table-group thead");
		
		$tBody.empty();
		$tHead.empty();
		$tBody.children().remove();
	
		config_param = config_param = $.extend({}, default_param, config_param);
			
		$('body').requestData(urlList, config_param, {
			callback : function(rsData){			
				var list = rsData.rsList;
				var eventCates = rsData.eventCates;

				//시간셋팅
				$("[name=start_time]").val(rsData.start_time);
				$("[name=end_time]").val(rsData.end_time);
				//thead
				
				$tHead.append("<th scope='col'>HOST</th>");
				
				for(var i in eventCates){
					var rowData = list[i];
					var trData="";
					trData += "<th scope='col'>";
					trData += "<span>";
					trData += i*1+1 + "단계";
					trData += "</span><br>(" + eventCates[i].code_name + ")";
					
					$tHead.append(trData);
				}
				$tHead.append("<th scope='col'>위험도</th>");
			
				//tbody
				if( list.length == 0 ){
					var $tr = $("<tr>");
					$tr.append($("<td colspan='8'> 검색 결과가 없습니다. </td>"));
					
					$tr.appendTo($tBody);
				}
		
				for(var i in list){
					
					var rowData = list[i];				
					var $tr = $("<tr>");
					//Host
					
					$tr.append($("<td>" + rowData.src_ip + "</td>"))
					
					//단계별
					for(var j in eventCates){
						var count = rowData["cate"+ ((j*1)+1) +"_cnt"];
						var $td = $("<td>");
						$td.append(count);//count입력
						
						if(count != 0){
							$td
								.attr('tabindex','1')
								.addClass("color_ec" + ((j*1)+1) )		//색 입히기
								.data("s_src_ip", rowData.src_ip)
								.data("s_event_cate_cd", ((j*1)+1) );
							
						}
						
						$td.appendTo($tr);
					};
					
					//위혐도
					var toolkitImgTag="";
					toolkitImgTag += "<td>" + rowData.risk_score + "%";
					toolkitImgTag += "&nbsp; <button type='button' class='text-purple icon-download-square toolkitImg' data-ip='" + rowData.src_ip + "'></button>"
					
					toolkitImgTag += "</td>";
					$tr.append($(toolkitImgTag))
		
					$tr.appendTo($tBody);
				}
				bindEvent();
			}
		});		
	},
	
	refresh = function() {	
		
		drawList();
		
	},
	
	_setParam = function() {

		if(config_param.rows){
			$("#config_" + containerId + " [name=rows] option").each(function(){
				if($(this).val() == config_param.rows) $(this).attr("selected", true);
			});
		}
	},
	
	_setTitle = function(){
		
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