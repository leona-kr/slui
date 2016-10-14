'use strict';

_SL.nmspc("top2").list = function() {

	var
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'analysis/top2_list.json',	
		urlLogSearch : gCONTEXT_PATH + 'monitoring/log_search.html',
		urlReport : gCONTEXT_PATH + 'analysis/top2_report.do',
		formId 	: '#searchTop2List',
		etcFormId: '#top2EtcForm'
	},
	
	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		etcForm	: $(mCfg.etcFormId),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		sLogCate: $(mCfg.formId + ' [name=s_log_cate_cd]'),
		sGrpCd 	: $(mCfg.formId + ' [name=s_group_cd]')	
	},

	init = function() {
		// 초기 화면 구성
		drawTop2List();
		
		// 이벤트 Binding
		bindEvent();
	},
	
	drawTop2List = function(){

		var params = $.extend({}, _SL.serializeMap(m$.form), {pageRow : m$.etcForm.find("[name=row]").val()});
		
		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData, rsCd, rsMsg){
				var fieldsInfoList = rsData.fieldsInfoList;
				var rsListByFieldNm = rsData.rsListByFieldNm;
				
				for(var i in fieldsInfoList){
					var fldName = fieldsInfoList[i].field_nm;
					var fldData = rsListByFieldNm[fldName];
					
					drawContainer(fieldsInfoList[i],fldData);
				}
			}
		});
	},
	
	drawContainer = function(fieldsInfoData,fldData){
		var fldName = fieldsInfoData.field_nm;
		var groupField = fieldsInfoData.group_field;
		var groupFieldCaption = fieldsInfoData.group_field_caption;
		var cntCaption = fieldsInfoData.cnt_caption;
		
		var row = m$.etcForm.find("[name=row]").val();
		var chartData = chartCfg;
		var sourceData = [];
		
		//draw chart
		chartData.renderAt = fldName+"ChartContainer";
		chartData.dataSource.chart = $.extend({}, slui.chart.chartConfig, chartData.dataSource.chart);
		chartData.dataSource.chart.xAxisName = groupField;
		chartData.height = row == 5 ? 180 : 220 ;
			
		for(var i in fldData){
			var tData = fldData[i];
			var cData = {
				label : tData.asset_nm ? tData.asset_nm : _SL.javascriptEscape(tData.field_nm),
				toolText : tData.asset_nm ? _SL.javascriptEscape(tData.field_nm) +"(" + tData.asset_nm + "), " + _SL.formatNumber(tData.cnt) : _SL.javascriptEscape(tData.field_nm) + ", " + _SL.formatNumber(tData.cnt),
				link : "javascript:slapp.top2.list.goSearchPopup('" + groupField + "', '" + _SL.javascriptEscape(tData.field_nm) + "')",
				value: tData.cnt
			};
			
			sourceData.push(cData);
		}
		chartData.dataSource.data = sourceData;
		new FusionCharts(chartData).render();
		
		
		////draw list
		var $listContainer = $("#" + fldName + "ListContainer").empty(),
		$curTable = $("<table class='board-table-group'></table>"),
		$thead = $('<thead />').appendTo($curTable),
		$tbody = $('<tbody />').appendTo($curTable),
		$headTr = $("<tr />"),
		noRstColspan = 3;

		$headTr.append($("<th width=\"10%\">순번</th>"))
			.append($("<th>"+ groupFieldCaption +"</th>"));
		if(fldName.indexOf("_ip") > 0){
			$headTr.append($("<th width=\"20%\">자산</th>"));
			noRstColspan = 4;
		}
		$headTr.append($("<th width=\"20%\">"+ cntCaption +"</th>"))
			.appendTo($thead);

		if(fldData.length == 0){
			var $listTr = $("<tr>");
			$listTr.append($("<td colspan='"+ noRstColspan +"' class='list-empty'>There is no Search Result</td>"));
			$listTr.appendTo($curTable);
		}else{
			for(var i in fldData){
				var $listTr = $("<tr>");
				var tData = fldData[i];
				
				$listTr.append($("<td class='align-center'>"+(parseInt(i)+1)+"</td>"));
				$listTr.append($("<td><a href='#' onclick='slapp.top2.list.goSearchPopup(\""+groupField+"\",\""+ _SL.javascriptEscape(tData.field_nm)+"\")'>"+tData.field_nm+"</a></td>"));
				
				if(fldName.indexOf("_ip") > 0){
					$listTr.append($("<td>" + (tData.asset_nm ? tData.asset_nm : "") + "</td>"));
				}

				$listTr.append($("<td class='align-right'>"+_SL.formatNumber(tData.cnt)+"</td>"));
				$listTr.appendTo($tbody);
			}
		}
		$curTable.appendTo($listContainer);
	},
	
	bindEvent = function() {
		//Search
		m$.form.find('.btn-submit').off().on('click',function(){
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
		
		//row
		m$.etcForm.find("[name=row]").change(refresh);
		
		
		m$.etcForm.find('.btn-icon').off().on('click',function(){
			goReport($(this).data('btn_type'));
		});
	},
	
	goReport = function(fmt){
		var start_time = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
		var end_time   = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
		var sLogCateCd = m$.sLogCate.val();
		var sGrpCd = m$.sGrpCd.val();
		var $reportForm = m$.form.find("[name=reportForm]");
		
		if($reportForm.length == 0){
			$reportForm = $('<form name="reportForm">');
			$reportForm.append('<input type="hidden" name="format">');
			$reportForm.append('<input type="hidden" name="start_time">');
			$reportForm.append('<input type="hidden" name="end_time">');
			$reportForm.append('<input type="hidden" name="s_log_cate_cd">');
			$reportForm.append('<input type="hidden" name="s_group_cd">');
			
			m$.form.append($reportForm);
		}
		
		$("[name=format]", $reportForm).val(fmt);
		$("[name=start_time]", $reportForm).val(start_time);
		$("[name=end_time]", $reportForm).val(end_time);
		$("[name=s_log_cate_cd]", $reportForm).val(sLogCateCd);
		$("[name=s_group_cd]", $reportForm).val(sGrpCd);		
		
		$reportForm.attr({
			action : mCfg.urlReport
		}).submit();
	},
	
	goSearchPopup = function(fieldNm, fieldValue){
		var filterList = [{
			field_name : fieldNm,
			field_value : _SL.luceneValueEscape(fieldValue)
		}];
		
		var start_time = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
		var end_time   = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
		var strQuery	= fieldNm + ":" + _SL.luceneValueEscape(fieldValue);
		
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			
			m$.form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(start_time);
		$("[name=end_time]", $logSearchForm).val(end_time);
		$("[name=expert_keyword]", $logSearchForm).val(strQuery);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
	},	
	
	refresh = function() {
		drawTop2List();
	},

	chartCfg = {
		type: 'bar2d',
		width : "100%",
		height : "220",
		dataFormat : "json",
		dataSource : 
		{
			chart : {
				"paletteColors": "#89cf43,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd",
				"maxLabelWidthPercent" :"20"
			},
			data : []
		}
	};
	
	return {
		init : init,
		goSearchPopup: goSearchPopup
	};

}();

$(function(){
	slapp.top2.list.init();	
});