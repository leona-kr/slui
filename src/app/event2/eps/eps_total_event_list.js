//# sourceURL=eps_total_event_list.js
'use strict';

_SL.nmspc("epsTotalEvent").list = function() {

	var
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'event2/eps_total_event_list.json',
		urlLink : gCONTEXT_PATH + 'event2/eps_ip_event_list.html',
		formId 			: '#searchEpsTotalEventList',
		gridId 			: '#gridEpsTotalEventList',
		
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
		// 이벤트 Binding
		bindInitEvent();
		
		
	},
	drawTable = function(){
		
		var params = $.extend({}, _SL.serializeMap(m$.form) ),
		drwaCallback = function(rsData){
			var list = rsData.list;
			var eventCates = rsData.eventCates;

			var $tbody = m$.grid.find("tbody").empty();
			
			for(var i in list){
				
				var rowData = list[i];
				var $tr = $("<tr>");
				//구분
				$tr.append($("<td>" + rowData.tc_type_nm + "</td>"))
				
				//단계별
				for(var j in eventCates){
					var count = rowData["cate"+j+"_cnt"],
						$td = $("<td>").append(count);//count입력

					if(count != 0){
						$td
							.attr('tabindex','1')
							.addClass("color_ec" + j)//색 입히기
							.data({							//링크에서 사용할 변수들
								"tc_type": rowData.tc_type,
								"event_cate_cd": j,
								"count": count
							});
					}

					$td.appendTo($tr);
				};
				
				//위혐도
				if(i == 0 ) $tr.append($("<td rowspan='"+list.length+"'>" + rowData.risk_score + "%</td>"))
				$tr.appendTo($tbody);
			}

			
			bindAfterEvent();//리스트가 그려진 후 이벤트 설정
		}
		
		$('body').requestData(mCfg.urlList, params, {callback : drwaCallback});
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
		
		m$.grid.find("[class*=color_ec]").off().on('click',function(){
			var $target = $(this);

			$("#tc_type").val($target.data("tc_type"));
			$("#event_cate_cd").val($target.data("event_cate_cd"));
			$("#count").val($target.data("count"));

			$(mCfg.formId)[0].action = mCfg.urlLink;
			$(mCfg.formId)[0].submit();

		});
	},
	
	refresh = function() {
		drawTable();
	},

	colorCode = [];

	return {
		init : init
	};

}();

$(function(){
	slapp.epsTotalEvent.list.init();

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