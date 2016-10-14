'use strict';

_SL.nmspc("netflow").list = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'analysis/netflow_list.json',
		
		formId : '#searchNetFlowList',
		gridHeadId : '#netFlowTableHead',
		gridId : '#gridNetFlowList',
		chartId : '#chartNetFlow'
	},
	
	m$ = {
		form : $(mCfg.formId),
		gridHead : $(mCfg.gridHeadId),
		grid : $(mCfg.gridId),
		chart : $(mCfg.chartId),
		
		groupField : $(mCfg.formId + ' [name=s_group_field]'),
		selFields : $(mCfg.formId + ' [name=s_sel_fields]'),
		currPage	: $(mCfg.gridHeadId + ' [name=currPage]')
	},
	
	init = function() {

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});
		
		m$.form.find('[name=timeSet]').change(function(){
			var setMin = this.value;
			
			if (setMin == 0) {
				return;
			}
			
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
		
		drawData();
		
		bindEvent();
	},

	drawData = function(){
		
		var params = $.extend({}, _SL.serializeMap(m$.form),
				{
					pagesize : m$.gridHead.find("[name=pageRow]").val(),
					currPage : m$.gridHead.find("[name=currPage]").val()
				}
		);
		
		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData, rsCd, rsMsg){
				drawChart(rsData.chartListJson);
				drawGrid(rsData);
			}
		});
	},
	
	drawChart = function(chartList){
		
		m$.chart.empty();
		
		if(chartList == null || chartList.length == 0) return;
		
		var maxValue = 0;
		
		for(var i in chartList) {
			if(maxValue < chartList[i].value) maxValue = chartList[i].value;
		}
		
		maxValue = _SL.getChartMaxValue(maxValue);
		
		var chartStyle = {
				"baseFont": "dotum",
				"baseFontSize": "11",
				"baseFontColor": "#000000",
	            "paletteColors": "#89cf43",
	            "bgColor": "#ffffff",
	            "showBorder": "0",
	            "showvalues": "0",
	            "showCanvasBorder": "0",
	            "usePlotGradientColor": "0",
	            "plotBorderAlpha": "10",
	            "placeValuesInside": "1",
	            "valueFontColor": "#333333",
	            "showAxisLines": "1",
	            "axisLineAlpha": "25",
	            "divLineAlpha": "10",
	            "alignCaptionWithCanvas": "0",
	            "showAlternateVGridColor": "0",
	            "captionFontSize": "14",
	            "subcaptionFontSize": "14",
	            "subcaptionFontBold": "0",
	            "toolTipColor": "#ffffff",
	            "toolTipBorderThickness": "0",
	            "toolTipBgColor": "#000000",
	            "toolTipBgAlpha": "80",
	            "toolTipBorderRadius": "2",
	            "toolTipPadding": "5",
	            "numVisiblePlot" : '20',
	            "baseFontSize" : "11",
	            "formatnumberscale" : "1",
	            "showLegend" : "0",
				"yAxisMaxValue" : 1 >= maxValue ? 2 : maxValue
			},

			chartData = {
				chart : chartStyle,
				categories : [{category : chartList}],
				dataset : [{data : chartList}]
			};
		
		FusionCharts.ready(function(){
			new FusionCharts({
				type: 'scrollarea2d',
				renderAt: 'chartNetFlow',
				width: '100%',
				height: '240',
				dataFormat: 'json',
				dataSource: chartData
			}).render();
		});
	},
	
	drawGrid = function(rsData){	
		if(!rsData) return;
		
		//검색,페이징관련 값들 맵핑
		_SL.setDataToForm(rsData, m$.form);
		$('#netFlowTotalCnt').text(_SL.formatNumber(rsData.totalCount));
		$('#netFlowSpanTotalPage').text(_SL.formatNumber(rsData.totalPage));
		m$.currPage.data('total-page',rsData.totalPage);
		
		var list = rsData.list;
		var fldCaps = rsData.fldCaps;
		var sumFields = rsData.sumFields;
		var groupField = rsData.groupField;
		var viewFieldList = rsData.viewFieldList;

		var $thead = $('<thead>');
		var $tbody = $('<tbody>');
		var $tr = $('<tr>');
		
		m$.grid.empty();

		// th start
		$tr.append('<th scope="col" style="width:50px;">번호</th>');
		
		for(var idx =0; idx < viewFieldList.length; idx++){
			if(groupField == 'eqp_dt' && viewFieldList[idx] != 'eqp_dt' && viewFieldList[idx] != 'pkt_cnt' && viewFieldList[idx] != 'pkt_size')
				$tr.append('<th scope="col" class="head-group" style="text-decoration:underline; cursor:pointer;" data-value="'+ viewFieldList[idx] +'">'+ fldCaps[viewFieldList[idx]] +'</th>');
			else
				$tr.append('<th scope="col">'+ fldCaps[viewFieldList[idx]] +'</th>');
		}		
		// th end
		$thead.append($tr);
		
		
		if(list.length > 0){
			// td start
			for(var outerIdx in list){
				var $tr = $('<tr>');
				var data = list[outerIdx];
				//번호
				$tr.append('<td class="align-center">'+ (parseInt(outerIdx)+1+rsData.recordstartindex) +'</td>');
				
				for(var innerIdx in viewFieldList){
					if(innerIdx == 0){ // 첫번째 컬럼 일 때
						if(viewFieldList[innerIdx] == 'eqp_dt'){ //장비발생시간일때 Date형식 Convert
							var eqpDt = _SL.formatDate(list[outerIdx][viewFieldList[innerIdx]], 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
							$tr.append('<td class="align-center">'+ eqpDt +'</td>');
						}else{
							$tr.append('<td class="align-center">'+ list[outerIdx][viewFieldList[innerIdx]] +'</td>');
						}
					}else{ // 첫번째 컬럼이 아닐 때
						if(viewFieldList[innerIdx] == 'pkt_cnt' || viewFieldList[innerIdx] == 'pkt_size'){ //패킷건수나 패킷사이즈 일 때 포맷팅
							$tr.append('<td class="align-center"><span class="fmt_pkt">'+ list[outerIdx][viewFieldList[innerIdx]] +'</span></td>');
						}else if(groupField == 'eqp_dt'){//장비발생시간일때
							$tr.append('<td class="align-center">'+ list[outerIdx][viewFieldList[innerIdx]] +'</td>');
						}else{
							var strVal = _SL.javascriptEscape(list[outerIdx][groupField]);
							$tr.append('<td class="align-center btn-link sel-add" data-nm="'+ viewFieldList[innerIdx] +'" data-val="'+ strVal +'" style="cursor:pointer;">'+ list[outerIdx][viewFieldList[innerIdx]] +'</td>');
						}
					}
				}
				// td end
				$tbody.append($tr);	
			}
		}else{
			$tr = $('<tr>');
			
			// td start
			$tr.append('<td class="align-center" colspan="'+ (viewFieldList.length + 1) +'">There is no Search Result</td>');
			// td end
			
			$tbody.append($tr);					
		}
		
		m$.grid.append($thead).append($tbody);
		
		m$.grid.find(".fmt_pkt").each(function() {
			$(this).html(_SL.formatNumber($(this).html()));
		});
		
		gridBingEvent();
	},
	
	bindEvent = function() {
		//Paging start
		m$.gridHead.find('.btn-prev').off().on('click',function(){
			goPrev();
		});
		
		m$.gridHead.find('.btn-next').off().on('click',function(){
			goNext();
		});
		
		m$.currPage.off().on('keydown',function(){
			goPage();
		});
		
		m$.gridHead.find('[name=pageRow]').change(function(){
			refresh();
		});		
	},
	
	gridBingEvent = function() {
		m$.grid.find('.head-group').on("click", onChangeGroup);
		
		m$.grid.find('.sel-add').on("click", onSelAdd);
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
	
	onChangeGroup = function(){
		m$.form.find('[name=s_group_field]').val($(this).data('value'));
		$("#currPage").val(1);
		
		refresh();
	},
	
	onSelAdd = function(){
		var grpNm = $(this).data('nm');
		var grpVal = $(this).data('val');
		var oSelFields = JSON.parse(m$.selFields.val());
		
		if(m$.groupField.val() == 'eqp_dt'){
			var setMin = 1;
			var endTime = _SL.formatDate.addMin(val, setMin);
			
			m$.form.find("[name=startDay]").val(val.substring(0,8));
			m$.form.find("[name=startHour]").val(val.substring(8,10));
			m$.form.find("[name=startMin]").val(val.substring(10,12));

			m$.form.find("[name=endDay]").val(endTime.substring(0,8));
			m$.form.find("[name=endHour]").val(endTime.substring(8,10));
			m$.form.find("[name=endMin]").val(endTime.substring(10,12));
		}else{
			oSelFields[m$.groupField.val()] = grpVal;
			m$.selFields.val(JSON.stringify(oSelFields));
		}
		
		m$.groupField.val(grpNm);
		$("#currPage").val(1);
		
		refresh();
	},
	
	refresh = function() {
		drawData();
	};
	
	
	return {
		init : init
	};

}();

$(function(){
	slapp.netflow.list.init();
});