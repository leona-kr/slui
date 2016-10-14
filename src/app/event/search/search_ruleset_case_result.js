//# sourceURL=search_ruleset_case_result.js
'use strict';

_SL.nmspc("searchRuleset").caseResult = function() {
	
	var 
	caseResultList = {},

	mCfg = {
		urlList 	: gCONTEXT_PATH + 'event/search_ruleset_case_result.json',
		urlForm 	: gCONTEXT_PATH + "event/search_ruleset_case_form.html",
		urlRulesForm: gCONTEXT_PATH + 'event/search_ruleset_form.html',
		urlLogSearch: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlChartData: gCONTEXT_PATH + "event/eventCaseChartData.json",
		
		formId 		: '#searchRulesetCaseResult',
		tableHeadId : '#caseResultTableHead',
		tableListId : '#caseResultTableList',
		tableViewId : '#schRuleCaseResultView',
		lineChartId : 'lineChartContainer',
		chartId		: '#chartContainer',
		btnForm 	: '.grid-bottom'
	},
	
	m$ = {
		form 		: $(mCfg.formId),
		tableHead	: $(mCfg.tableHeadId),
		currPage	: $(mCfg.tableHeadId + ' [name=currPage]'),
		tableTitle 	: $(mCfg.tableListId + ' thead'),
		tableList 	: $(mCfg.tableListId + ' tbody'),
		tableView	: $(mCfg.tableViewId),
		
		caseId		: $(mCfg.formId + ' [name=case_id]'),
		sTime 		: $(mCfg.formId + ' [name=start_time]'),
		eTime 		: $(mCfg.formId + ' [name=end_time]'),
		sDay 		: $(mCfg.formId + ' [name=startDay]'),
		sHour 		: $(mCfg.formId + ' [name=startHour]'),
		sMin 		: $(mCfg.formId + ' [name=startMin]'),
		eDay 		: $(mCfg.formId + ' [name=endDay]'),
		eHour 		: $(mCfg.formId + ' [name=endHour]'),
		eMin 		: $(mCfg.formId + ' [name=endMin]'),
		timeType	: $(mCfg.formId + ' [name=time_type]'),
		times		: $(mCfg.formId + ' [name=times]')
	},
	
	init = function() {
		// 초기 화면 구성
		drawList();
		
		// 이벤트 Binding
		bindEvent();
		
		getLineChart();
	},

	drawList = function(){
		var params = $.extend({}, _SL.serializeMap(m$.form),
				{
					pagesize : m$.tableHead.find("[name=pageRow]").val(),
					currPage : m$.tableHead.find("[name=currPage]").val()
				}
		);

		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData, rsCd, rsMsg){
				if(!rsData) return;
				
				//검색,페이징관련 값들 맵핑
				_SL.setDataToForm(rsData, m$.form);
				_SL.setDataToForm(rsData, m$.tableHead);
				$('#rsTotalCnt').text(_SL.formatNumber(rsData.totalCount));
				$('#rsSpanTotalPage').text(_SL.formatNumber(rsData.totalPage));
				m$.currPage.data('total-page',rsData.totalPage);
				
				m$.sDay.val(rsData.startDay);
				m$.sHour.val(rsData.startHour);
				m$.sMin.val(rsData.startMin);
				m$.eDay.val(rsData.endDay);
				m$.eHour.val(rsData.endHour);
				m$.eMin.val(rsData.endMin);
				
				var fldCaptionMap = rsData.splitFieldVal;
				var cData = rsData.data;
				var list = rsData.list;
				var grpFldArr = [];
				
				if(cData.group_field.length > 0) grpFldArr = cData.group_field.split(',');
				fldCaptionMap = $.extend({}, fldCaptionMap);
				caseResultList = $.extend({}, list);
				
				//draw View
				var $tView = m$.tableView;
				$tView.empty();
				
				if(cData != null) {
					var $tr1 = $('<tr>'), $tr2 = $('<tr>'),	$tr3 = $('<tr>'), $tr4 = $('<tr>'),	$tr5 = $('<tr>'),
						tUnit, func, 
						grpFld = "", funcFld = "", distFld = "",	distCnt = "";
					$tr1.append('<th scope="row">탐지명</th>');
					$tr1.append('<td><span="">' + cData.case_nm + '</span></td>');
					$tr1.append('<th scope="row">검증기간</th>');
					$tr1.append('<td>' + _SL.formatDate(cData.case_start_time,"yyyyMMddHHmm","yyyy-MM-dd HH:mm")+" ~ "+_SL.formatDate(cData.case_end_time,"yyyyMMddHHmm","yyyy-MM-dd HH:mm") + '</td>');
					
					$tr2.append('<th scope="row">룰셋</th>');
					$tr2.append('<td colspan="3"><pre name="search_query">'+cData.search_query+'</pre><textarea name="tx_search_query" class="form-area" style="width:500px; display: none;" rows="3" wrap="hard">'+cData.search_query+'</textarea></td>');
					
					if(cData.time_type == 1) tUnit = " Minute";
					else tUnit = " Hour";
					if(grpFldArr.length == 0) grpFld = "전체";
					else {
						for(var i in grpFldArr) {
							for(var idx in fldCaptionMap) {
								if(idx == grpFldArr[i]) {
									if(i==0) grpFld += fldCaptionMap[idx];
									else grpFld += ", " + fldCaptionMap[idx];
								}
							}
						}
					}
					$tr3.append('<th scope="row">기준시간</th>');
					$tr3.append('<td>' + cData.times + tUnit + '</td>');
					$tr3.append('<th scope="row">기준필드</th>');
					$tr3.append('<td>' + grpFld + '</td>');
					
					if(cData.func) func = "COUNT";
					else func = "SUM";
					if(cData.func_field != null) {
						for(var idx in fldCaptionMap) {
							if(idx == cData.func_field) {
								funcFld = " [" + fldCaptionMap[idx] + "]";
							}
						}
					}
					$tr4.append('<th scope="row">함수</th>');
					$tr4.append('<td>' + func + funcFld + '</td>');
					$tr4.append('<th scope="row">임계치</th>');
					$tr4.append('<td>' + cData.limit_count + '</td>');
					
					if(cData.distinct_field != "") {
						var distFldArr = cData.distinct_field.split(',');
						for(var i in distFldArr) {
							for(var idx in fldCaptionMap) {
								if(idx == distFldArr[i]) {
									if(i==0) distFld += fldCaptionMap[idx];
									else distFld += ", " + fldCaptionMap[idx];
								}
							}
						}
					}
					if(cData.distinct_count != 0) distCnt = cData.distinct_count;
					$tr5.append('<th scope="row">유일필드</th>');
					$tr5.append('<td>' + distFld + '</td>');
					$tr5.append('<th scope="row">유일필드 임계치</th>');
					$tr5.append('<td>' + distCnt + '</td>');
					
					$tView.append($tr1, $tr2, $tr3, $tr4, $tr5);
				}
				
				//draw List
				var $tHead = m$.tableTitle;
				var $tBody = m$.tableList;
				$tHead.children().remove();
				$tBody.children().remove();
				
				if(list.length > 0){
					
					for(var i in list){
						var $trHead = $('<tr>');
						var $trBody = $('<tr>');
						var eData = list[i];
						
						if(i == 0) {
							$trHead.append('<th scope="col" width="40">번호</th>');
							$trHead.append('<th scope="col">발생시간</th>');
							$trHead.append('<th scope="col">탐지시간</th>');
							
							if(grpFldArr.length > 0) {
								for(var j in grpFldArr) {
									for(var idx in fldCaptionMap) {
										if(idx == grpFldArr[j]) {
											$trHead.append('<th scope="col">' + fldCaptionMap[idx] + '</th>');
										}
									}
								}
							}
							
							if(cData.func == 1) $trHead.append('<th scope="col">COUNT</th>');
							else $trHead.append('<th scope="col">SUM</th>');
							
							if(cData.distinct_field != "") $trHead.append('<th scope="col">유일필드 건수</th>');
							
							$trHead.appendTo($tHead);
						}
						
/*번호*/				$trBody.append($('<td class="align-center">'+(parseInt(i)+1+rsData.recordstartindex)+'</td>'));
/*발생시간*/			$trBody.append($('<td class="align-center">'+_SL.formatDate(eData.event_time,"yyyyMMddHHmm","MM-dd HH:mm")+'</td>'));
/*탐지시간*/			$trBody.append($('<td class="align-center">'+_SL.formatDate(eData.sdt,"yyyyMMddHHmm","MM-dd HH:mm")+" ~ "+_SL.formatDate(eData.ddt,"yyyyMMddHHmm","MM-dd HH:mm")+'</td>'));
						
						if(grpFldArr.length > 0) {
							for(var j in grpFldArr) {
								$trBody.append('<td class="align-center">' + eData.splitFieldVal[j] + '</td>');
							}
						}
						
/*COUNT or SUM*/		$trBody.append($("<td class='align-center'><a href='#' onclick='slapp.searchRuleset.caseResult.goSearchPopup(\""+(parseInt(i)+1+rsData.recordstartindex)+"\",\""+cData.group_field+"\");'>"+ eData.cnt +"</a></td>"));
						
/*유일필드 건수*/		if(eData.distinct_field != null) {
							$trBody.append($('<td class="align-center">'+ eData.distinct_cnt +'건</td>'));
						}
						
						$trBody.appendTo($tBody);
					}
				}else{
					$tHead.children().remove();
					$tHead.append( $('<tr><th scope="col">번호</th><th scope="col">발생시간</th><th scope="col">탐지시간</th><th scope="col">COUNT</th></tr>') );
					$tBody.children().remove();
					$tBody.append( $('<tr><td class="list-empty" colspan="4">There is no Search Result</td></tr>') );
				};
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
	},
	
	bindEvent = function() {
		// 이벤트 설정 (추가)
		var $btnAdd = m$.tableList.parent().siblings('.grid-bottom').find('.btn-add');
		
		$btnAdd.off().on('click',function(){
			var url = mCfg.urlRulesForm +'?case_id='+m$.caseId.val();
			
			var modal = new ModalPopup(url, {
				width:800,
				height:510,
				onClose : function(){
					refresh();
				}
			});
		});
		
		// 이벤트 설정 (검색버튼)
		m$.form.find('.form-submit').off().on('click',function(){
			var sTime = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
			var eTime = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
			
			var diffTime = _SL.formatDate.diff(sTime, eTime);
			if(diffTime <= 0){
				_alert("시작일이 종료일보다 큽니다.");
				return;
			}

			if(diffTime/60000 > $(mCfg.formId+" option:last-child").val()) {
				_alert("검색 기간 초과입니다.");
				return;
			}
			
			if(!_SL.validate(m$.form)) return;
			
			m$.sTime.val(sTime);
			m$.eTime.val(eTime);
			
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
		
		//Paging start
		m$.tableHead.find('.btn-prev').off().on('click',function(){
			goPrev();
		});
		
		m$.tableHead.find('.btn-next').off().on('click',function(){
			goNext();
		});
		
		m$.currPage.off().on('keydown',function(){
			goPage();
		});
		
		m$.tableHead.find('[name=pageRow]').change(function(){
			refresh();
		});
		//Paging end
	},
	
	getLineChart = function() {
		$.getJSON(mCfg.urlChartData,
			{
				case_id 	: m$.caseId.val(),
				start_time 	: m$.sTime.val(),
				end_time	: m$.eTime.val(),
				time_type	: m$.timeType.val(),
				times		: m$.times.val()
			},
			function(rsJson) {
				var chart  = lineChart;
				var linearScale  = rsJson.linearScale;
				var chartData = rsJson.chartData;
				
				for(var idx in chartData){
					if(idx == 0 ) chartData[idx].showLabel = 0;
					else if(chartData[idx-1].label != chartData[idx].label)	chartData[idx].showLabel = 1;
				}
				
				chart.dataSource.data = chartData;
				chart.dataSource.chart = $.extend({}, slui.chart.chartConfig, chart.dataSource.chart);
				chart.dataSource.chart.subCaption = "Linear scale : " + linearScale; 

				drawChart(chart);
			}
		);
	},
	
	drawChart = function(chart) {
		FusionCharts.ready(function () {
			new FusionCharts(chart).render();
		})
	},
	
	//Paging event start
	goPrev = function(){
		var currPage = parseInt(m$.currPage.val());
		if(currPage ==1){
			return;
		}else if(m$.currPage.data('total-page') == 0 ){
			m$.currPage.val(1);
			return;
		}
		
		m$.currPage.val(currPage-1);
		refresh();
	},
	
	goNext = function(){
		var currPage = parseInt(m$.currPage.val());
		
		if(currPage == m$.currPage.data('total-page')){
			return;
		}else if(m$.currPage.data('total-page') == 0){
			m$.currPage.val(1);
			return;
		}
		
		m$.currPage.val(currPage+1);
		refresh();
	},
	
	goPage = function(){
		var num = (event.srcElement || event.target).value;
		var totalPage = parseInt(m$.currPage.data('total-page'));
		
		if (event.keyCode == 13) {
			if(isNaN(num) || parseInt(num) < 1 || parseInt(num) > totalPage) {
				return;
			}else{
				$('#currPage').val(num);
				refresh();
			}
		}
	},
	//Paging event end
	goSearchPopup = function(idx, fieldNm){
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type">');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			
			m$.form.append($logSearchForm);
		}
		
		idx = idx - 1;
		
		var startTime = caseResultList[idx].sdt;
		var endTime = caseResultList[idx].ddt;
		var fieldNameArr = fieldNm.split(",");
		var strQuery = "(" +$("[name=tx_search_query]").val()+ ")";
		var fieldValArr = caseResultList[idx].splitFieldVal;
		var reCodeExtr = /.*\[(\d+)\]$/;
		var fieldval = "";
		
		for(var idx in fieldNameArr){
			//indexOutOf에러날 시 value에 '-' 대입
			try{
				fieldval = fieldValArr[idx];
			}catch(exception){
				fieldval = '-';
			}
			
			if(strQuery != "") strQuery += " AND ";

			if(fieldval !== '-'){
				var rsMatch = fieldval.match(reCodeExtr);
				
				if(rsMatch && rsMatch[1]) fieldval = rsMatch[1];
				strQuery += fieldNameArr[idx] + ":" + _SL.luceneValueEscape(fieldval);			
			}else{
				strQuery += "NOT " + fieldNameArr[idx] + ":*";			
			}
		}
		
		$("[name=logSearchForm] [name=start_time]").val(startTime);
		$("[name=logSearchForm] [name=end_time]").val(endTime);
		$("[name=logSearchForm] [name=filter_type]").val(2);
		$("[name=logSearchForm] [name=expert_keyword]").val(strQuery);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();

		return false;
	},
	
	lineChart = {
		type : 'area2d',
		renderAt: mCfg.lineChartId,
		width : "100%",
		height : "200",
		dataFormat : "json",
		dataSource : 
		{
			chart : {
				yAxisName : "Event Count"
			},
			data : []
		}
	},

	refresh = function() {
		drawList();
		getLineChart();
	}
	
	return {
		init : init,
		goSearchPopup : goSearchPopup
	};
	
}();

$(function(){
	slapp.searchRuleset.caseResult.init();
});