'use strict';

_SL.nmspc("collectInfo").list = function() {
	
	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'monitoring/collect_info_list.json',
		urlView : gCONTEXT_PATH + 'monitoring/collect_info_view.html',
		urlChartData : gCONTEXT_PATH + 'monitoring/collect_info_chart_data.json',
		urlChartSearch : gCONTEXT_PATH + 'monitoring/collect_info_list.html',
		urlDownload : gCONTEXT_PATH + 'monitoring/collect_info_export.do',
		formId : '#searchCollectInfoList',
		gridId : '#gridCollectInfoList',
		pieChartId 		: 'pieChartContainer',
		lineChartId		: 'lineChartContainer'
	},
	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		eqpTyp 	: $(mCfg.formId + ' [name=s_eqp_type_cd]'),
		eqpNm 	: $(mCfg.formId + ' [name=s_eqp_nm]'),
		eqpIp 	: $(mCfg.formId + ' [name=s_eqp_ip]'),
		grpCd 	: $(mCfg.formId + ' [name=s_group_cd]'),
		colYn 	: $(mCfg.formId + ' [name=s_collect_yn]'),
		logCd 	: $(mCfg.formId + ' [name=s_log_cate_cd]'),
		logCds 	: $(mCfg.formId + ' [name=s_log_cate_cds]'),
		period 	: $(mCfg.formId + ' [name=period]')
	},
	
	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// chosen
		initChosenField();

		// 이벤트 Binding
		bindEvent();
		
		// 차트
		getMainChart();
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "eqp_ip", type: "string"},
				{ name: "eqp_nm", type: "string"},
				{ name: "eqp_type_cd", type: "string"},
				{ name: "eqp_type_nm", type: "string"},
				{ name: "group_cd", type: "string"},
				{ name: "group_nm", type: "string"},
				{ name: "collect_yn", type: "string"},
				{ name: "recv_time", type: "string"},
				{ name: "min_recv_time", type: "string"},
				{ name: "max_recv_time", type: "string"},
				{ name: "last_recv_time", type: "string"},
				{ name: "collect_allow_time", type: "string"},
				
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
				{ text: '장비명[IP]', datafield: 'eqp_ip', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + rowdata.eqp_nm+'['+rowdata.eqp_ip+']</button>')[0].outerHTML;
					}
				},
				{ text: '장비 종류', datafield: 'eqp_type_nm', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html(value)[0].outerHTML;
					}
				},
				{ text: '자산 그룹', datafield: 'group_nm', cellsalign:'center', width:'15%' },
				{ text: '최종 수집시간', datafield: 'last_recv_time', cellsalign:'center', width:'15%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var minTime = "" + rowdata.min_recv_time;
						var maxTime = rowdata.max_recv_time;
						var recvTime = rowdata.recv_time;
						var colYn = rowdata.collect_yn;
						var nowTime = _SL.formatDate();
						var lastTime = "";
						
						if(recvTime != null) {
							if(colYn == "Y") lastTime = minTime;
							else lastTime = maxTime;
							
							var timeDiff = _SL.formatDate.diff(lastTime, nowTime)/ (60 * 1000);
							if(lastTime !=""){
								if(timeDiff < 0) timeDiff = 0 ;
								
								var day = parseInt(timeDiff/(24*60));
								var hour = parseInt((timeDiff%(24*60))/60);
								var minute = parseInt(((timeDiff%(24*60)))%60);
								
								var timeStr ="";
								
								if(day != 0) timeStr += day + "일 ";
								if(day != 0 || hour != 0) timeStr += hour + "시간 ";
								if(day != 0 || hour != 0 || minute != 0) timeStr += minute + "분";
								
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
				{ text: '정상수집 허용시간', datafield: 'collect_allow_time', cellsalign:'center', width:'10%',
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
				{ text: '수집상태', datafield: 'collect_yn', width:'10%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var colYn;
						
						if(value == "Y") colYn = "<span class='label-success'>수집</span>";
						else colYn = "<span class='label-danger'>미수집</span>";
						
						return $(defaulthtml).html('<button type="button" class="btn-link" style="margin-left:4px;">' + colYn + '</button>')[0].outerHTML;
					}
				}
			]
		});
		
		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'eqp_ip' || event.args.datafield === 'collect_yn'){
				var rData = event.args.row.bounddata,
					 eqpTypeCd = rData.eqp_type_cd,
					 eqpIp = rData.eqp_ip,
					 eqpNm = rData.eqp_nm;
				
				viewDetail(mCfg.urlView +'?s_eqp_type_cd='+eqpTypeCd+'&s_eqp_ip='+eqpIp+'&period=120');
			}

		});
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:1050,
			height:800,
			setScroll:true,
			onClose : function(){
				refresh();
			}
		});
	},
	
	initChosenField = function(){
		m$.form.find("[name=s_log_cate_cd]").each(function(index,value){
			$(this).chosen({
				search_contains : true,
				placeholder_text_multiple :"[선택하세요]"
			});
		});
	},
	
	bindEvent = function() {
		var $btnDownload = m$.form.find('.btn-download');
		
		// 이벤트 설정 (검색버튼)
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form)) return;
			refresh();
		});
		
		$btnDownload.off().on('click',function(){
			excelDownLoad();
		});
		
	},
	
	getMainChart = function(){
		$.getJSON(mCfg.urlChartData,
			{
				s_eqp_type_cd	: m$.eqpTyp.val(),
				s_eqp_nm		: m$.eqpNm.val(),
				s_eqp_ip 		: m$.eqpIp.val(),
				s_group_cd 		: m$.grpCd.val(),
				s_collect_yn 	: m$.colYn.val(),
				s_log_cate_cds 	: m$.logCds.val(),
				period 			: m$.period.val()
			},
			function(rsJson) {
				//pie
				var pieChartDataList  = rsJson.pieChartDataList;
				var pieChartData  = pieChartCfg;
				pieChartData.renderAt = mCfg.pieChartId;

				pieChartData.dataSource.chart = $.extend({}, slui.chart.chartConfig, pieChartCfg.dataSource.chart);
				pieChartData.dataSource.data = [];

				for (var i in pieChartDataList) {
					var tempData = {};
					tempData = {label : pieChartDataList[i].label, value : pieChartDataList[i].value};	
					
					if(tempData.label=="수집"){
						//tempData.color = "92d050";
						tempData.link = "javascript:slapp.collectInfo.list.goChartSearch('Y')";
					}else{
						//tempData.color = "ff4a4a";
						tempData.link = "javascript:slapp.collectInfo.list.goChartSearch('N')";
					};
					pieChartData.dataSource.data.push(tempData);
				}
				
				//line
				var lineChartDatalist = rsJson.lineChartDatalist;
				var lineChartData = lineChartCfg;
				var totalCount = 0 ;
				lineChartData.renderAt = mCfg.lineChartId;
				lineChartData.dataSource.chart = $.extend({}, slui.chart.chartConfig, lineChartCfg.dataSource.chart);
				lineChartData.dataSource.data = [];
				
				for (var i in lineChartDatalist) {
					var tempData = {};
					tempData = {label : lineChartDatalist[i].label.substring(3,8), value : lineChartDatalist[i].value};
					totalCount = totalCount + lineChartDatalist[i].value;
					
					if(i != 0 && lineChartDatalist[i-1].label.substring(0,2) != lineChartDatalist[i].label.substring(0,2)){//날짜 경계선 삽입
						var beforeDay = lineChartDatalist[i-1].label.substring(0,2)+"일";
						var afterDay = lineChartDatalist[i].label.substring(0,2)+"일";
						
						lineChartData.dataSource.data.push({
							vline : true,
							label : beforeDay,
							dashed : '1',
							dashLen : '3',
							dashGap : '2',
							//color : '656565',
							labelHAlign : "right"
						});
						
						lineChartData.dataSource.data.push({
							vline : true,
							label : afterDay,
							dashed : '1',
							dashLen : '3',
							dashGap : '2',
							//color : '656565',
							labelHAlign : "left"
						});
						
					}
					lineChartData.dataSource.data.push(tempData);
				}
				
				lineChartData.dataSource.chart.subCaption = "(최근 1일 " +  _SL.formatNumber(totalCount) +"건)";
				
				drawChart(pieChartData, lineChartData);
			}
		);
	},

	drawChart = function(pieChartData, lineChartData) {
		FusionCharts.ready(function(){
			var pieChar = new FusionCharts(pieChartData).render();
		});
		
		FusionCharts.ready(function () {
		    var lineChar = new FusionCharts(lineChartData).render();
		})
	},
	
	goChartSearch = function(colYn){
		m$.form.find("[name=s_collect_yn]").val(colYn);
		slui.attach.setTransformSelect(mCfg.formId);
		refresh();
	},
	
	pieChartCfg = {
			type: 'pie3d',
			renderAt: mCfg.pieChartId,
			width : "100%",
			height : "300",
			dataFormat : "json",
			dataSource : 
			{
				chart : {
					showlegend : "1",
					caption  : "수집 상태별 현황"
				},
				data : []
			}
		},
		
		lineChartCfg = {
			type: 'area2d',
			renderAt: mCfg.lineChartId,
			width : "100%",
			height : "300",
			dataFormat : "json",
			dataSource : 
			{
				chart : {
					plotfillcolor : "#00acc6",
					caption : "시간별 수집 건수",
					showvalues: "0",
					yAxisName : "Count"
				},
				data : []
			}
		},
	
	refresh = function() {
		if(m$.logCd.val() != null) m$.logCds.val(m$.logCd.val());
		else m$.logCds.val("");
		m$.grid.jqxGrid("updatebounddata");
		getMainChart();
	},
	
	excelDownLoad = function(){
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	}
	
	return {
		init : init,
		goChartSearch : goChartSearch
	};
	
}();

$(function(){
	slapp.collectInfo.list.init();
});
