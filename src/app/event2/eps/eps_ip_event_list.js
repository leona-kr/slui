//# sourceURL=eps_ip_event_list.js
'use strict';

_SL.nmspc("epsIpEvent").list = function() {
	var
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'event2/eps_ip_event_list.json',
		formId 			: '#searchEpsIpEventList',
		gridId 			: '#gridEpsIpEventList',
		urlLink : gCONTEXT_PATH + 'event2/eps_security_event_list.html'
		
	},
	
	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]')
	},

	init = function() {
		
		// 초기 화면 구성
		drawTable();
		
		//drawGrid(m$.grid);
		
		
		// 이벤트 Binding
		bindInitEvent();
		
		
	},
	drawTable = function(){
		var params = $.extend({}, _SL.serializeMap(m$.form));
		
		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData){			
				var list = rsData.list;
				var eventCates = rsData.eventCates;
				
				var $tbody = m$.grid.find("tbody");
				$tbody.empty();
				var rowCount = 1;
				for(var i in list){
					
					var rowData = list[i];
					var $tr = $("<tr>");
					//Host
					if(rowCount%2==1) $tr.append($("<td rowspan='"+ "2"  +"'>" + rowData.src_ip + "</td>"))
			
					$tr.append($("<td>" + rsData.tcTypes[rowData.tc_type] + "</td>"))
					
					//단계별
					for(var j in eventCates){
						var count = rowData["cate"+j+"_cnt"];
						var $td = $("<td>");
						$td.append(count);//count입력
						
						if(count != 0){
							$td
								.attr('tabindex','1')
								.addClass("color_ec" + j)	//색 입히기
								.data({							//링크에서 사용할 변수들
									"s_src_ip": rowData.src_ip,
									"s_tc_type": rowData.tc_type,
									"s_event_cate_cd": j
								});
						}
						
						$td.appendTo($tr);
					};
					
					//위혐도
					var toolkitImgTag="";
					toolkitImgTag += "<td rowspan='"+ "2"  +"'>" + rowData.risk_score + "%";
					toolkitImgTag += "&nbsp; <button type='button' class='text-purple icon-download-square toolkitImg' data-ip='" + rowData.src_ip + "'></button>";
					toolkitImgTag += "</td>";

					
					if(rowCount%2==1) $tr.append($(toolkitImgTag))
					
					$tr.appendTo($tbody);
					rowCount++;
				}

				
				bindAfterEvent();//리스트가 그려진 후 이벤트 설정
			}
		});		
	},

	bindInitEvent = function() {
		//Search
		m$.form.find('.form-submit').off().on('click',function(){
			
			if(!_SL.validate(m$.form)) return;
			
			var sTime = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
			var eTime = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
			var diffTime = _SL.formatDate.diff(sTime, eTime);
			var s_eqp_ip1 = $("#s_eqp_ip").val();
			
			if(diffTime <= 0) {
				_alert("시작일이 종료일보다 큽니다.");
				return;
		    }
			if(diffTime/60000 > m$.form.find("[name=timeSet] option:last-child").val()) {
				_alert("검색 기간 초과입니다.");
				return;
			}
			
			m$.form.find("[name=currPage]").val(1);
			
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
	
	bindAfterEvent = function() {
		m$.form.find('.form-submit').off().on('click',function(){
			
			refresh();
		});
		
	
		m$.grid.find("[class*=color_ec]").off().on('click',function(){
			var $target = $(this);

			$("#s_src_ip").val($target.data("s_src_ip"));
			$("#s_tc_type").val($target.data("s_tc_type"));
			$("#s_event_cate_cd").val($target.data("s_event_cate_cd"));

			$("[name=searchEpsIpEventList]")[0].action = mCfg.urlLink
			$("[name=searchEpsIpEventList]")[0].submit();

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
				start_time	: $("[name=startDay]").val() + $("[name=startHour]").val() + $("[name=startMin]").val(),
				end_time	: $("[name=endDay]").val() + $("[name=endHour]").val() + $("[name=endMin]").val(), 
				expert_keyword	: "",
				src_ip : srcIp,
				tc_type : 1
			})
		);
	},
	
	refresh = function() {
		drawTable();
	},
	
	colorCode = [];
	
	return {
		init : init,
		fnVAToolkit:fnVAToolkit
	};

}();

$(function(){
	slapp.epsIpEvent.list.init();
	
	/*$("#form").keydown(function(event) {
		if(event.which=='13'){
			_SL.enterNext();
		}
	});*/

	//시나리오분석이벤트
	$("#btnSettingEpsRulesetList").togglePage(gCONTEXT_PATH + "event2/eps_ruleset_list.html");
	
	//시나리오분석위험도가중치
	$("#btnSettingRiskRuleView").off().on('click',function(){
		new ModalPopup(gCONTEXT_PATH + "event2/eps_event_risk_rule_view.html",{
			width: 820,
			height:250
		});
	});
	
});