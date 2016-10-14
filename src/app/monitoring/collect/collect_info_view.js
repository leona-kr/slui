//# sourceURL=collect_info_view.js
'use strict';

_SL.nmspc("collectInfo").view = function() {
	
	var
	mCfg = {
		urlList 		: gCONTEXT_PATH + 'monitoring/collect_info_view.json',
		urlChartData 	: gCONTEXT_PATH + 'monitoring/detail_collect_info_chart.json',
		urlLoadEqp 		: gCONTEXT_PATH + 'common/equipment_list.json',
		formId 			: '#searchCollectInfoView',
		gridId 			: '#gridCollectInfoView',
		lineChartContId	: '#logCateLineChart',
		lineChartId		: 'colViewChartCont'
	},
	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		chtCont	: $(mCfg.lineChartContId),
		eqpTyp 	: $(mCfg.formId + ' [name=s_eqp_type_cd]'),
		eqpNm 	: $(mCfg.formId + ' [name=s_eqp_nm]'),
		eqpIp 	: $(mCfg.formId + ' [name=s_eqp_ip]'),
		grpCd 	: $(mCfg.formId + ' [name=s_group_cd]'),
		colYn 	: $(mCfg.formId + ' [name=s_collect_yn]'),
		logCd 	: $(mCfg.formId + ' [name=s_log_cate_cd]'),
		logCds 	: $(mCfg.formId + ' [name=s_log_cate_cds]'),
		period 	: $(mCfg.formId + ' [name=period]'),
		
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		
		pEqpIp 	: $(mCfg.formId + ' [name=p_eqp_ip]'),
		pEqpTyp	: $(mCfg.formId + ' [name=p_eqp_type_cd]')
	},
	
	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// 이벤트 Binding
		bindEvent();
		
		// 차트
		getMainChart();
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "collect_allow_time", type: "string"},
			    { name: "collect_yn", type: "string"},
				{ name: "eqp_ip", type: "string"},
				{ name: "eqp_nm", type: "string"},
				{ name: "eqp_type_cd", type: "string"},
				{ name: "eqp_type_nm", type: "string"},
				{ name: "log_cate_cd", type: "string"},
				{ name: "log_cate_nm", type: "string"},
				{ name: "max_recv_time", type: "string"},
				{ name: "min_recv_time", type: "string"},
				{ name: "last_recv_time", type: "string"}
			],
			root: 'rows',
			beforeprocessing: function(data){
				if (data != null){
					gridSource.totalrecords = data.totalRows;
				}
			},

			cache: false,
			url: mCfg.urlList
		},

		dataadapter = new $.jqx.dataAdapter(gridSource, {
			beforeLoadComplete: function(rows) {
				for (var i in rows) {
					var eqpTypCd = rows[i].eqp_type_cd;
					m$.eqpTyp.val(eqpTypCd);
				}
				return rows;
			},
			formatData : function(data) {
				var params = {}, param, flds = $(mCfg.formId).serializeArray();
				for(param in flds) {
					params[flds[param].name] = flds[param].value;
				};
				$.extend(data, params);
				
				return data;
			},
			loadError: function(xhr, status, error){
				_alert(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			sortable: false,
			width: '100%',
			virtualmode: true,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '로그분류코드', datafield: 'log_cate_nm', cellsalign:'center' },
				{ text: '정상수집 허용시간', datafield: 'collect_allow_time', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						switch(value) {
						case 5 :
							value = "5분";
							break;
						case 10 :
							value = "10분";
							break;
						case 30 :
							value = "30분";
							break;
						case 60 :
							value = "1시간";
							break;
						case 180 :
							value = "3시간";
							break;
						case 360 :
							value = "6시간";
							break;
						case 720 :
							value = "12시간";
							break;
						case 1440 :
							value = "1일";
							break;
						default :
							value = "-";
							break;
						}
						
						return $(defaulthtml).html(value)[0].outerHTML;
					}
				},
				{ text: '최종 수집시간', datafield: 'last_recv_time', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var minTime = rowdata.min_recv_time;
						var maxTime = rowdata.max_recv_time;
						var colYn = rowdata.collect_yn;
						var nowTime = _SL.formatDate();
						var lastTime = "";
						
						if(minTime != null) {
							if(colYn == "Y") lastTime = minTime.toString();
							else lastTime = maxTime.toString();
							var timeDiff = _SL.formatDate.diff(lastTime, nowTime) / (60 * 1000);
							
							if(lastTime !=""){
								if(timeDiff < 0) timeDiff = 0 ;
								
								var day = parseInt(timeDiff/(24*60));
								var hour = parseInt((timeDiff%(24*60))/60);
								var min = parseInt(((timeDiff%(24*60)))%60);
								var timeStr ="";
								
								if(day != 0) timeStr += day + "일 ";
								if(day != 0 || hour != 0) timeStr += hour + "시간 ";
								if(day != 0 || hour != 0 || min != 0) timeStr += min + "분"
								
								if(timeStr !=""){
									lastTime = _SL.formatDate(lastTime, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm') + ("\(" + timeStr + " 전\)");
								}else{
									lastTime = _SL.formatDate(lastTime, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm') + ("\(1분내\)");
								}
							}
						}
						
						return $(defaulthtml).html(lastTime)[0].outerHTML;
					}
				},
				{ text: '수집상태', datafield: 'collect_yn', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var colYn;
						
						if(value == "Y") colYn = "<span class='label-success'>수집</span>";
						else colYn = "<span class='label-danger'>미수집</span>";
						
						return $(defaulthtml).html(colYn)[0].outerHTML;
					}
				}
			]
		});
	},
	
	bindEvent = function() {
		// 이벤트 설정 (검색버튼)
		m$.form.find('.btn-submit').off().on('click',function(){
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
		
		// 장비분류 change 이벤트 설정
		loadEqp(true);
		$("[name=s_eqp_type_cd]").change(function() {
			loadEqp(false);
		});
	},
	
	loadEqp = function(boo) {
		var sEqpTyp = m$.eqpTyp.val();
		var pEqpTyp = m$.pEqpTyp.val();
		
		//장비종류코드 초기화
		if(sEqpTyp == "" && pEqpTyp == "") {
			m$.form.find("[name=s_eqp_ip]").html("<option value=''>[Name(IP Address)]</option>");
			slui.attach.setTransformSelect(mCfg.formId);
			return;
		}
		else {
			if(sEqpTyp != "" && pEqpTyp != "") m$.pEqpTyp.val("");
			if(sEqpTyp == "" && boo) {
				m$.eqpTyp.val(pEqpTyp);
				m$.pEqpTyp.val("");
			}
			
			var rqData = {'s_eqp_type_cd' : m$.eqpTyp.val()},
				callbackEqp = function(rsMap){
					m$.form.find("[name=s_eqp_ip]").html("<option value=''>[Name(IP Address)]</option>");

					var eqpList = rsMap.eqp_list;
					
					for(var i in eqpList) {
						var eqpIp = eqpList[i].eqp_ip;
						var eqpNm = eqpList[i].eqp_nm;
						
						m$.eqpIp.append($("<option>").val(eqpIp).text(eqpNm+"("+eqpIp+")"));
						
						if(m$.pEqpIp.val() == eqpIp && boo) {
							m$.eqpIp.val(eqpIp);
						}
						slui.attach.setTransformSelect(mCfg.formId);
					}
				};
			
			$('body').requestData(mCfg.urlLoadEqp, rqData, {callback : callbackEqp});
		}
	},
	
	getMainChart = function(){
		var eqpIp = m$.eqpIp.val(),
			eqpTyp = m$.eqpTyp.val();
			
		if(eqpIp == "") eqpIp = m$.pEqpIp.val();
		if(eqpTyp == "") eqpTyp = m$.eqpTyp.val();
		
		$.getJSON(mCfg.urlChartData,
			{
				's_eqp_ip' 		: eqpIp,
				's_eqp_type_cd'	: eqpTyp,
				'start_time' 	: m$.sDay.val() + m$.sHour.val() + m$.sMin.val(),
				'end_time' 		: m$.eDay.val() + m$.eHour.val() + m$.eMin.val()
			},
			function(rsJson) {
				var lineChartCaption = rsJson.logCateList;
				var lineChartDatalist = rsJson.logChartList;

				_lineChart.dataSource.chart = $.extend({}, slui.chart.chartConfig, _lineChart.dataSource.chart);

				if(lineChartCaption.length == 0) {
					var lineChartData = _lineChart;
					m$.chtCont.html(
						'<div class="item-board item-board-wide" >\
							<div class="board-head">\
								<div class="btns-group">\
									<button type="button" class="btn-toggle" data-toggle-handle="true" data-toggle-target="#colViewToggleChart" data-toggle-class="hide">\
										<i class="icon-chevron-up"></i>\
									</button>\
								</div>\
							</div>\
							<div class="chart-group" id="colViewToggleChart">\
								<div id="colViewChartCont" class="chart_container"></div>\
							</div>\
						</div>'
					);
					lineChartData.renderAt = 'colViewChartCont';
					drawChart(lineChartData);
					
				} else {
					m$.chtCont.empty();

					for(var i in lineChartCaption) {
						var totalCount = 0;
						var codeId = lineChartCaption[i].code_id;
						var codeNm = lineChartCaption[i].code_name;
						var lineChartData = $.extend(true, {}, _lineChart);

						lineChartData.dataSource.data = [];
						lineChartData.renderAt = 'colViewChartCont'+codeId;
						
						for (var i in lineChartDatalist[codeId]) {
							
							var chartList = lineChartDatalist[codeId];
							var tempData = {};
							tempData = {label : chartList[i].label.substring(3,8), value : chartList[i].value};
							totalCount = totalCount + chartList[i].value;
							
							if(i != 0 && chartList[i-1].label.substring(0,2) != chartList[i].label.substring(0,2)){
								var beforeDay = chartList[i-1].label.substring(0,2)+"일";
								var afterDay = chartList[i].label.substring(0,2)+"일";
								
								lineChartData.dataSource.data.push({
									vline : true,
									label : beforeDay,
									dashed : '1', dashLen : '3', dashGap : '2',
									color : '656565',
									labelHAlign : "right"
								});
								
								lineChartData.dataSource.data.push({
									vline : true,
									label : afterDay,
									dashed : '1', dashLen : '3', dashGap : '2',
									color : '656565',
									labelHAlign : "left"
								});
							}
							lineChartData.dataSource.data.push(tempData);
						}
						var chart_tit = codeNm + " - (총 " +  _SL.formatNumber(totalCount) +"건)";

						m$.chtCont.append(
							"<div class='item-board item-board-wide' >\
								<div class='board-head'>"+chart_tit+"\
									<div class='btns-group'>\
										<button type='button' class='btn-toggle' data-toggle-handle='true' data-toggle-target='#colViewToggleChart"+codeId+"' data-toggle-class='hide'>\
											<i class='icon-chevron-up'></i>\
										</button>\
									</div>\
								</div>\
								<div class='chart-group' id='colViewToggleChart"+codeId+"'>\
									<div id='colViewChartCont"+codeId+"' class='chart_container'></div>\
								</div>\
							</div>"
						);

						drawChart(lineChartData);
					}
				}
				var parentClass = m$.chtCont.parents('[class^=page-]').attr('class').split(' ')[0];
				slui.attach.setToggleLayer('.'+parentClass);
			}
		);
	},
	
	drawChart = function(lineChartData) {
		FusionCharts.ready(function () {
			new FusionCharts(lineChartData).render();
		});
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		getMainChart();
	},
	
	_lineChart = {
		type : 'area2d',
		width : "100%",
		height : "135",
		dataFormat : "json",
		dataSource : 
		{
			chart : {
				bgColor : "#fafafa",
				formatnumberscale : "1",
				"plotfillalpha" : "60",
				plotfillcolor : "#00acc6",
				plotfillratio: "10,90",
				showvalues: "0",
				yAxisName : "Count"
			},
			data : []
		}
	}
	
	return {
		init : init
	};
	
}();


$(function(){
	slapp.collectInfo.view.init();
});
