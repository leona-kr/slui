'use strict';

_SL.nmspc("blacklistEvent").list = function() {

	var
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'event/blacklist_event_list.json',
		urlChartData : gCONTEXT_PATH + 'event/blacklist_event_main_chart_data.json',
		urlSubChartForm : gCONTEXT_PATH + 'event/blacklist_event_sub_chart_form.html',
		urlSubChartData : gCONTEXT_PATH + 'event/blacklist_event_sub_chart_data.json',
		urlLogSearch	: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlHandlingUdate: gCONTEXT_PATH + 'event/blacklist_event_update.json',
		
		
		formId 			: '#searchBlackListEventList',
		gridId 			: '#gridBlacklistEventList',
		pieChartId 		: 'pieChartContainer',
		areaChartId		: 'areaChartContainer',
		subPieChartId 	: 'subPieChartContainer',
		subAreaChartId	: 'subAreaChartContainer'
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
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		type 	: $(mCfg.formId + ' [name=s_type]'),
		blackIp : $(mCfg.formId + ' [name=s_blacklist_ip]'),
		domain 	: $(mCfg.formId + ' [name=s_domain]'),
		nation 	: $(mCfg.formId + ' [name=s_nation]'),
		hType 	: $(mCfg.formId + ' [name=s_handling_type_cd]')
	},

	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 Binding
		bindEvent();
		
		//차트
		getMainChart();
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "blacklist_ip", type: "string"},
				{ name: "domain", type: "string"},
				{ name: "type_nm", type: "string"},
				{ name: "nation", type: "string"},
				{ name: "ip_type", type: "string"},
				{ name: "cnt", type: "string"},
				{ name: "event_time", type: "string"},
				{ name: "handling_type_nm", type: "string"}
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
					rows[i].start_time = rows[i].event_time;
					rows[i].event_time = _SL.formatDate(rows[i].event_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
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
			width: '100%',
			virtualmode: true,
			selectionmode: 'checkbox',
			enablehover: false,
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
				{ 
					text: '유해IP', datafield: 'blacklist_ip', width:'15%', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '유형', datafield: 'type_nm', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						if(value == '') return $(defaulthtml).text("-")[0].outerHTML;
					}
				},
				{ text: '도메인', datafield: 'domain',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						if(value == '') return $(defaulthtml).text("-")[0].outerHTML;
					}
				},
				{ text: '국가', datafield: 'nation', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						if(value == '') return $(defaulthtml).text("-")[0].outerHTML;
					}
				},
				{ 
					text: '출발지/목적지', datafield: 'ip_type', width:'10%', cellsalign:'center' ,
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var ipTypeStr;
						
						if(value == "1") ipTypeStr ="SRC"
						else ipTypeStr = "DSTN"
	
						return $(defaulthtml).text(ipTypeStr)[0].outerHTML;
					}
					
				},
				{ text: '발생건수', datafield: 'cnt', width:'8%', cellsalign:'center'},
				{ text: '발생시간', datafield: 'event_time', width:'13%', cellsalign:'center' },
				{ text: '상태', datafield: 'handling_type_nm', width:'8%', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						if(!value) return $(defaulthtml).text("-")[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'blacklist_ip'){
				var blacklistIp = event.args.row.bounddata.blacklist_ip;
				var startTime = event.args.row.bounddata.start_time;
				var ipType = event.args.row.bounddata.ip_type;
				
				goLogSearch(blacklistIp,startTime,ipType);
			}
		});
	},
	
	bindEvent = function() {
		//Search
		m$.form.find('.form-submit').off().on('click',function(){
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
		
		//Eventhandling
		var $btnHandling = m$.grid.parent().siblings('.grid-bottom').find('.btn-handling');
		$btnHandling.on("click", goProcess);
		
	},
	
	goLogSearch = function(ip, startTime, ipType){	
		var endTime = _SL.formatDate.addMin(startTime, 1);
		var fldName = ipType == "1" ? "src_ip:" : "dstn_ip:";
		
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">\
				<input type="hidden" name="start_time">\
				<input type="hidden" name="end_time">\
				<input type="hidden" name="filter_type">\
				<input type="hidden" name="expert_keyword">\
				<input type="hidden" name="template_id" value="popup">'
			).appendTo(m$.form);
		}
		
		$("[name=start_time]", $logSearchForm).val(startTime);
		$("[name=end_time]", $logSearchForm).val(endTime);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(fldName + ip);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
		
	},
	
	getMainChart = function(){
		$.getJSON(mCfg.urlChartData,
			{
				start_time 		: m$.sDay.val() + m$.sHour.val() + m$.sMin.val(),
				end_time		: m$.eDay.val() + m$.eHour.val() + m$.eMin.val(),
				s_type			: m$.type.val(),
				s_blacklist_ip	: m$.blackIp.val(),
				s_domain 		: m$.domain.val(),
				s_nation 		: m$.nation.val(),
				s_handling_type_cd 	: m$.hType.val(),
			},
			function(rsJson) {
				
				chartFunction.groupByPeriod = rsJson.groupByPeriod;
				
				var labels            = rsJson.labels;
				var pieChartDataList  = rsJson.pieChartDataList;
				var areaChartDataList = rsJson.areaChartDataList;
				var categorys         = rsJson.categorys;
				
				if (m$.type.val() != "") {
					labels = [m$.type.find("option:selected").text()];
				}

				pieChartCfg.dataSource.chart = $.extend({}, slui.chart.chartConfig, pieChartCfg.dataSource.chart);
				areaChartCfg.dataSource.chart = $.extend({}, slui.chart.chartConfig, areaChartCfg.dataSource.chart);

				var pieChartData  = pieChartCfg;
				var areaChartData = areaChartCfg;
				
				pieChartData.renderAt = mCfg.pieChartId;
				areaChartData.renderAt = mCfg.areaChartId;

				pieChartData.dataSource.data = [];
				areaChartData.dataSource.categories = [];
				areaChartData.dataSource.dataset = [];
				
				areaChartData.dataSource.categories.push({category : categorys});
				
				for (var i in labels) {
					pieChartData.dataSource.data.push(chartFunction.getData(labels[i], pieChartDataList, false));
					
					areaChartData.dataSource.dataset.push({
						seriesname : labels[i],
						data : []
					});
					
					for (var n in categorys) {
						areaChartData.dataSource.dataset[i].data.push(chartFunction.getDataset(labels[i], categorys[n].label, areaChartDataList, false));
					}
				}
				drawChart(pieChartData,areaChartData);
			}
		);		
	},

	chartFunction = {
		top_limit : 10,
		groupByPeriod : 1,
		getDataset : function(label, category, resultList, isSub) {
			var data = {value : 0};
			for (var r in resultList) {
				if ((label == resultList[r].label) && (category == resultList[r].category)) {
					if (isSub) {
						data = {value : resultList[r].value, link : "javascript:slapp.blacklistEvent.list.goSearchPopup('" + resultList[r].label + "', '" + resultList[r].category + "')"}; 
					} else {
						data = {value : resultList[r].value, link : "javascript:slapp.blacklistEvent.list.subChartInit('" + resultList[r].category + "', '" + resultList[r].type + "', '" + _SL.htmlEscape(resultList[r].label) + "')"}; 
					}
					break;
				}
			}
			return data;
		},
		getData : function(label, resultList, isSub) {
			var data = {label : label, value : 0};
			for (var r in resultList) {
				if (label == resultList[r].label) {
					if (isSub) {
						data = {label : resultList[r].label, value : resultList[r].value, link : "javascript:slapp.blacklistEvent.list.goSearchPopup('" + resultList[r].label + "', '')"}; 
					} else {
						data = {label : resultList[r].label, value : resultList[r].value, link : "javascript:slapp.blacklistEvent.list.subChartInit('', '" + resultList[r].type + "', '" +_SL.htmlEscape(resultList[r].label) + "');"}; 
					}
					break;
				}
			}
			return data;
		}
	},
	
	subChartInit = function(date, type, name) {
		var modal = new ModalPopup(mCfg.urlSubChartForm,{
			width:1000,
			height:350,
			onOpen : getSubChart(date, type, name)
		});
	},
	
	getSubChart = function(date, type, name){
		date = date.replace(/\D/gi, "");
		
		chartFunction.ip_type = type;
		
		var pieChartData  = $.extend(true, {}, pieChartCfg);
		var areaChartData = $.extend(true, {}, areaChartCfg);
		
		pieChartData.dataSource.chart.showBorder = "1";
		areaChartData.dataSource.chart.showBorder = "1";

		pieChartData.renderAt = mCfg.subPieChartId;
		areaChartData.renderAt = mCfg.subAreaChartId;
		
		pieChartData.dataSource.chart.caption  = "[" +decodeURIComponent(name) + "]" + "TOP " + chartFunction.top_limit + " 현황";
		areaChartData.dataSource.chart.caption = "[" +decodeURIComponent(name) + "]" + "시간대별 TOP " + chartFunction.top_limit + " 현황";
		
		var start_time = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
		var end_time   = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
		
		if (date != "") {
			end_time = _SL.formatDate.addMin(date, chartFunction.groupByPeriod);
			start_time = date;
		}
		
		$.getJSON(mCfg.urlSubChartData,
			{
				top_limit       : chartFunction.top_limit,
				start_time 		: start_time,
				end_time		: end_time,
				s_type			: type,
				s_blacklist_ip	: m$.blackIp.val(),
				s_domain 		: m$.domain.val(),
				s_nation 		: m$.nation.val(),
				s_handling_type_cd 		: m$.hType.val()
			},
			function(rsJson) {
				
				chartFunction.groupByPeriod = rsJson.groupByPeriod;
				
				var labels            = rsJson.labels;
				var pieChartDataList  = rsJson.pieChartDataList;
				var areaChartDataList = rsJson.areaChartDataList;
				var categorys         = rsJson.categorys;

				pieChartData.dataSource.data = [];
				areaChartData.dataSource.categories = [];
				areaChartData.dataSource.dataset = [];
				
				areaChartData.dataSource.categories.push({category : categorys});
				
				for (var i in labels) {
					pieChartData.dataSource.data.push(chartFunction.getData(labels[i], pieChartDataList, true));
					
					areaChartData.dataSource.dataset.push({
						seriesname : labels[i],
						data : []
					});
					
					for (var n in categorys) {
						areaChartData.dataSource.dataset[i].data.push(chartFunction.getDataset(labels[i], categorys[n].label, areaChartDataList, true));
					}
				}
				
				if($("#subAreaChartContainer").size() == 0){
					setTimeout(function(){
						drawChart(pieChartData,areaChartData)
					},1000);
				}else{
					drawChart(pieChartData,areaChartData)
				}
			}
		);
	},

	drawChart = function(pieChartData,areaChartDart) {
		FusionCharts.ready(function(){
			var pieChar = new FusionCharts(pieChartData).render();
		});
		
		FusionCharts.ready(function () {
		    var areaChar = new FusionCharts(areaChartDart).render();
		})
	},
	
	
	goSearchPopup = function(ip, date){
		date = date.replace(/\D/gi, "");
		
		var start_time = m$.sDay.val() + m$.sHour.val() + m$.sMin.val(),
			end_time   = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();

		if (date != "") {
			end_time = _SL.formatDate.addMin(date, chartFunction.groupByPeriod);
			start_time = date;
		}
		
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">\
				<input type="hidden" name="start_time">\
				<input type="hidden" name="end_time">\
				<input type="hidden" name="filter_type">\
				<input type="hidden" name="expert_keyword">\
				<input type="hidden" name="template_id" value="popup">'
			).appendTo(m$.form);;
		}
		
		$("[name=start_time]", $logSearchForm).val(start_time);
		$("[name=end_time]", $logSearchForm).val(end_time);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val("src_ip:" + ip + " OR dstn_ip:" + ip);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
	},
	
	goProcess = function(){
		var process = $(this).data('handle-type');
		var process_text = $(this).text();
		var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
		var displayobj = m$.grid.jqxGrid('getdisplayrows');
		var idxs = [];

		for( var key in displayobj){
			for(var i=0, len = selectedrowindex.length; i<len; i++){
				if( selectedrowindex[i] == displayobj[key].boundindex){
					idxs.push(displayobj[key].boundindex);
				}
			}
		}
		
		if(idxs.length < 1){
			_alert(process_text + "할 이벤트를 체크해주세요.");
			return;
		}else{
			_confirm("이벤트를 " + process_text + " 하시겠습니까?",{
				onAgree : function(){
					var len = idxs.length,
						cnt = 0,
						json = {};

					for (var i in idxs) {
						var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
						if(!rowData){//체크박스동작관련 임시 소스( 전체 체크후 해제해도 virtual mode로 생성된 idx는 남아있음..)
							refresh();
							break;
						} 
						
						var blacklist_ip = rowData.blacklist_ip;
						var event_time = rowData.event_time;
						var ip_type = rowData.ip_type;
						
						event_time = _SL.formatDate(event_time, 'yyyy-MM-dd HH:mm', 'yyyyMMddHHmm');
						
						json = {
							handling_type_cd  : process,	
							blacklist_ip  	: blacklist_ip,
							event_time 		  : event_time,
							ip_type  		  : ip_type
						}
					
						$('body').requestData(mCfg.urlHandlingUdate, json, {
							callback : function(rsData, rsCd, rsMsg){
								cnt ++;
								if(cnt == len) refresh();
							}
						});
					}
				}
			});
		}
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
				"caption": "유형별 현황",
				"pieRadius":"130",
				"showpercentintooltip":"0",
				"startingangle":"125"
			},
			data : []
		}
	},
	
	areaChartCfg = {
		type: 'msline',
		renderAt: mCfg.areaChartId,
		width : "100%",
		height : "300",
		dataFormat : "json",
		dataSource : 
		{
			chart : {
				"caption": "유형별 시간대별 현황",
				"numvdivlines" : "10",
				"showlabels":"0",
				"showvalues":"0"
			},
			categories : [],
			dataset : []
		}
	},

	refresh = function() {
		if(!_SL.validate(m$.form)) return;
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
		getMainChart();
	};
	
	return {
		init : init,
		subChartInit : subChartInit,
		goSearchPopup: goSearchPopup
	};

}();

$(function(){
	slapp.blacklistEvent.list.init();
	
	//접속자현황
	$("#btnSettingBlacklist").togglePage(gCONTEXT_PATH + "event/blacklist_list.html");
	
});