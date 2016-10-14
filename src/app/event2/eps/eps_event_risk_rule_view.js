//# sourceURL=eps_event_risk_rule_view
'use strict';

_SL.nmspc("epsRiskRule").form = function(){

	var
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'event2/eps_event_risk_rule.json',
		formId 			: '#searchEpsEventRiskRuleList',
		gridId 			: '#gridEpsEventRiskRuleView',
		updateLink : gCONTEXT_PATH + 'event2/eps_event_risk_rule_update.do'
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

	init = function(){
		// 초기 화면 구성
		drawTable();
		// 이벤트 Binding
		bindInitEvent();	
	},
	drawTable = function(){
		var params = _SL.serializeMap(m$.form);

		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData){
				var $tbody = m$.grid.find("tbody").empty(),

				$tr = $("<tr>")
					.append("<td>기본 가중치<br>(이벤트당)</td>");

				var list = rsData.list;
				for(var j in list){
					if(list[j].base_weight>0){
						$tr.append("<td>" 
						+ "<input type='text' class='form-input align-center' style='width:70px;' name='base_weight' value='" + list[j].base_weight + "' size='3' maxlength='5' data-slValid='기본 가중치,required,number,min=1'>"
						+ "<input type='hidden' name='event_cate_cd' value='" + list[j].event_cate_cd + "' size='3' maxlength='5'>"
						+ "</td>"
						);
					}else{
						$tr.append("<td> - </td>");
					}
				}
				$tr.appendTo($tbody);

				$tr = $("<tr>");
				$tr.append("<td>이벤트 최대 개수</td>");
				for(var j in list){
					if(list[j].base_weight>0){
						$tr.append("<td>" 
						+ "<input type='text' class='form-input align-center' style='width:70px;' name='max_event_count' value='" + list[j].max_event_count + "' size='3' maxlength='5' data-slValid='이벤트 최대 개수,required,number,min=1'>"
						+ "</td>"
						);
					}else{
						$tr.append("<td> - </td>");
					}
				}
				$tr.appendTo($tbody);

				$tr = $("<tr>");
				$tr.append("<td>연속 가중치</td>");
				for(var j in list){
					if(list[j].base_weight>0){
						$tr.append("<td>" 
						+ "<input type='text' class='form-input align-center' style='width:70px;' name='conn_weight' value='" + list[j].conn_weight + "' size='3' maxlength='5' data-slValid='연속 가중치,required,number,min=1'>"
						+ "</td>"
						);
					}else{
						$tr.append("<td> - </td>");
					}
				}
				$tr.appendTo($tbody);
			}
		});
	},

	bindInitEvent = function(){
		//save 버튼 클릭 이벤트
		m$.form.find('.btn-save').click(function(){
			if(!_SL.validate(m$.form)) return false;

			saveData();
		});
	},

	saveData = function(){
		var params = _SL.serializeMap(m$.form),
			callback = function(rsData, rsCd, rsMsg){
				if(rsCd=="SUC_COM_0002"){
					_alert("저장되었습니다.",{
						onAgree : function(){
							m$.form.find("[data-layer-close=true]").click();
						}
					});
				}else{
					_alert(rsMsg);
				}
			};

		$('body').requestData(mCfg.updateLink, params, {
			displayLoader : true,
			callback : callback
		});
	},

	refresh = function() {
		drawTable();
	}
	
	return {
		init : init
	}
}();

$(function(){
	slapp.epsRiskRule.form.init();
	
});