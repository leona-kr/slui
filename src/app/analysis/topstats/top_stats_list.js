'use strict';

_SL.nmspc("topstats").list = function() {

	var	
	gRsListByItemNo , gTopMng,
	
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'analysis/top_stats_list.json',
		urlMngUseList : gCONTEXT_PATH + 'analysis/top_stats_manager_use_list.json',
		urlLogSearch : gCONTEXT_PATH + 'monitoring/log_search.html',
		urlMngForm : gCONTEXT_PATH + 'analysis/top_stats_manager_form.html',
		urlDelete 	: gCONTEXT_PATH + 'analysis/top_stats_manager_delete.do',
		urlMngList : gCONTEXT_PATH + 'analysis/top_stats_manager_list.html',
		urlMngCnt : gCONTEXT_PATH + 'analysis/top_stats_manager_count.json',
		formId 	: '#searchTopStatsForm',
		etcFormId: '#topStatsEtcForm',
		letfSectionId :'#topStatsLetfSection',
		totalTimeContId : '#totalTimeContainer',
		btnMngId : '#btnSettingTopStats'
	},
	
	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		etcForm	: $(mCfg.etcFormId),
		leftSection	: $(mCfg.letfSectionId),
		totalTimeCont	: $(mCfg.totalTimeContId),
		btnMng	: $(mCfg.btnMngId),
		areaBody: $(mCfg.totalTimeContId).parent(),
		timeSet : $(mCfg.formId + ' [name=timeSet]'),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		schType	: $(mCfg.formId + ' [name=search_type]'),
		
	},

	init = function() {
		// 초기 화면 구성
		drawStatsInit(0);
		
		// 이벤트 Binding
		bindEvent();
		
		//소수점아래 두자리까지만 표시
		_SL.formatNumber.Options.decimals = 2;
	},
	
	bindEvent = function() {
		//Search
		m$.form.find('.btn-submit').off().on('click',function(){
			
			var sTime = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
			var eTime = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
			
			var diffTime = _SL.formatDate.diff(sTime, eTime) / (60 * 60 * 1000);

			if (diffTime <= 0) {
				_alert("시작일이 종료일보다 큽니다.");
				return;
		    }
			
			var isStatistics = (m$.form.find("[name=search_type]:checked").val() == "statistics");
			
			if (diffTime > 2 && !isStatistics) {
				_alert("실시간 검색범위는 최대 2시간입니다.\n2시간 이상 조회는 '통계' 구분을 선택하세요.");
				return;
			}
			
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
		
		//구분 
		m$.schType.off().on('click',function(){
			var isStatistics = ($(this).val() == "statistics");
			var timeSets =[{val : 0, text : "[User Define]"}, 
			               {val : 5, text : "last 5 min"}, {val : 10, text : "last 10 min"}, {val : 30, text : "last 30 min"},
			               {val : 60, text : "last 1 Hour"}, {val : 360, text : "last 6 Hour"}, {val : 720, text : "last 12 Hour"},
			               {val : 1440, text : "last 1 Day"}, {val : 10080, text : "last 7 Day"}, {val : 43200, text : "last 30 Day"}
			              ];
			
			var cutMax = isStatistics ? 43200 : 120;
			var cutMin = isStatistics ? 60 : 5;
			
			m$.form.find("[name=startMin],[name=endMin]").attr("disabled", isStatistics);
			
			m$.timeSet.empty();
			
			for (var idx in timeSets) {
				if ((cutMax >= timeSets[idx].val && cutMin <= timeSets[idx].val) || timeSets[idx].val == 0 ) {
					$("<option/>").val(timeSets[idx].val).text(timeSets[idx].text)
					.appendTo(m$.timeSet);
				}
			}
			
			var setMin = (isStatistics ? 24 : 1) * 60;
			var startTime  = _SL.formatDate();
			var endTime = startTime;
			endTime   = isStatistics ? _SL.formatDate.addMin(endTime, 60 * -1) : endTime;
			startTime = _SL.formatDate.addMin(endTime, -setMin);
			
			m$.timeSet.val("0");
			
			m$.sDay.val(startTime.substring(0,8));
			m$.sHour.val(startTime.substring(8,10));
			m$.eDay.val(endTime.substring(0,8));
			m$.eHour.val(endTime.substring(8,10));
			
			slui.attach.setTransformSelect(mCfg.formId);
		});
		
		//통계링크 클릭 이벤트
		m$.leftSection.off().on("click",".mngListLink",function(){
			m$.leftSection.find('.selected').removeClass('selected');
			$(this).parent().addClass('selected');
			
			drawStats();
			return false;
		}); 
				
		//row
		m$.etcForm.find("[name=row]").change(refresh);
		
		//추가btn-add
		m$.leftSection.find(".btn-add").off().on('click',function(){
			$('body').requestData(mCfg.urlMngCnt,{},{
				callback : function(count, rsCd, rsMsg){
					if(menuMaxCount <= count){
						_alert("통계의 최대 등록개수는<br>" + menuMaxCount + "개 입니다.");
						return;
					}else{
						viewManagerDetail(mCfg.urlMngForm);
					}
				}
			});
		});
		
		//수정btn-modify
		m$.leftSection.find(".btn-modify").off().on('click',function(){
			var topCode = m$.leftSection.find('.selected').data("top-code");
			viewManagerDetail(mCfg.urlMngForm + '?top_code=' + topCode);
		});
		
		//삭제btn-delete
		m$.leftSection.find(".btn-delete").off().on('click',function(){
			var topCode = m$.leftSection.find('.selected').data("top-code");
			_confirm("삭제하시겠습니까?",{
				onAgree : function(){
					$('body').requestData(mCfg.urlDelete, {top_code:topCode}, {
						callback : function(rsData, rsCd, rsMsg){
							drawStatsInit(0);
							_alert(rsMsg);
						}
					});
				}
			});
		});
		
		m$.btnMng.off().on('click',function(){
			var modal = new ModalPopup(mCfg.urlMngList, {
				width : 450 ,
				height: 450 ,
				onClose : function(){
					//console.log("close!!");
				}
			});
		});
	},	
	
	drawStatsInit = function(topCode){
		$('body').requestData(mCfg.urlMngUseList, {}, {
			callback : function(rsList, rsCd, rsMsg){
				var $ul = m$.leftSection.find('.defined-list');
				$ul.children().remove();
				drawMngList(rsList,topCode);
				drawStats();
			}
		});
	},
	
	drawMngList = function(mngList, topCode){
		var $ul = m$.leftSection.find('.defined-list');
		for(var i in mngList){
			var data = mngList[i];
			var $li = $('<li data-top-code="'+ data.top_code +'">');
			
			$li.append($('<a class="mngListLink" href="#" data-top-code="'+ data.top_code +'" title="'+ data.top_name +'">'+ data.top_name +'</a>'));

			if( topCode == 0){
				if(i == 0) $li.addClass('selected');
			} else {
				if(topCode == data.top_code) $li.addClass('selected');
			}
			$ul.append($li);
		}

		slui.sectionCols.userlist(mCfg.letfSectionId);
	},
	
	drawStats = function(){
		var topCode = m$.leftSection.find('.selected').data("top-code");
		var params = $.extend({}, _SL.serializeMap(m$.form), { top_code : topCode , pageRow : m$.etcForm.find("[name=row]").val()});

		$('body').requestData(mCfg.urlList, params, {
			displayLoader : true,
			callback : function(rsData, rsCd, rsMsg){
				if(rsCd.indexOf('SUC') == -1) return false;

				$(mCfg.totalTimeContId).siblings('.item-board').remove();
				
				if(!rsData) return;
				
				var searchType = rsData.searchType;
				gRsListByItemNo = rsData.rsListByItemNo;
				gTopMng = rsData.topMng;
				
				
				if(searchType =='statistics') drawStatisticsStats(rsData);
				else drawRealtimeStats(rsData);
			}
		});
		
	},

	drawStatisticsStats = function(rsData){
		m$.totalTimeCont.show();
		if(!rsData.calcTimeTotal) return;
		//전체합계 표 시작
		var calcTimeTotal = rsData.calcTimeTotal;
		var totalCount = rsData.totalCount;
		
		//gRsListByItemNo
		//주간,야간 시간표시
		m$.totalTimeCont.find('.sDayTime').text(calcTimeTotal.sDayTime+':00');
		m$.totalTimeCont.find('.eDayTime').text(calcTimeTotal.eDayTime+':00');
		
		m$.totalTimeCont.find('.totCnt').text(		_SL.formatNumber(totalCount));		//<!-- 전체건수 -->
		m$.totalTimeCont.find('.dayAvgCnt').text(	_SL.formatNumber(calcTimeTotal.day_avg_cnt));		//<!-- 하루평균 -->
		m$.totalTimeCont.find('.WDCnt1').text(		_SL.formatNumber(calcTimeTotal.weekday_cnt_1));		//<!-- 주간건수 -->
		m$.totalTimeCont.find('.WDCntRate1').text(	_SL.formatNumber(totalCount == 0 ? 0 : calcTimeTotal.weekday_cnt_1/totalCount*100));	//<!-- 주간비율 -->
		m$.totalTimeCont.find('.WDCnt2').text(		_SL.formatNumber(calcTimeTotal.weekday_cnt_2));		//<!-- 야간건수 -->
		m$.totalTimeCont.find('.WDCntRate2').text(	_SL.formatNumber(totalCount == 0 ? 0 : calcTimeTotal.weekday_cnt_2/totalCount*100));	//<!-- 야간비율 -->
		m$.totalTimeCont.find('.WDTotCnt').text(	_SL.formatNumber(calcTimeTotal.weekday_cnt_1 + calcTimeTotal.weekday_cnt_2));		//<!-- 합계     -->
		m$.totalTimeCont.find('.WDTotRate').text(	_SL.formatNumber(totalCount == 0 ? 0 : (calcTimeTotal.weekday_cnt_1 + calcTimeTotal.weekday_cnt_2)/totalCount*100));		//<!-- 비율     -->
		m$.totalTimeCont.find('.WDTotAvg').text(	_SL.formatNumber(calcTimeTotal.weekday_avg_cnt));		//<!-- 평균     -->
		m$.totalTimeCont.find('.WECnt1').text(		_SL.formatNumber(calcTimeTotal.weekend_cnt_1));		//<!-- 주간건수 -->
		m$.totalTimeCont.find('.WECntRate1').text(	_SL.formatNumber(totalCount == 0 ? 0 : calcTimeTotal.weekend_cnt_1/totalCount*100));	//<!-- 주간비율 -->
		m$.totalTimeCont.find('.WECnt2').text(		_SL.formatNumber(calcTimeTotal.weekend_cnt_2));		//<!-- 야간건수 -->
		m$.totalTimeCont.find('.WECntRate2').text(	_SL.formatNumber(totalCount == 0 ? 0 : calcTimeTotal.weekend_cnt_2/totalCount*100));	//<!-- 야간비율 -->
		m$.totalTimeCont.find('.WETotCnt').text(	_SL.formatNumber(calcTimeTotal.weekend_cnt_1 + calcTimeTotal.weekend_cnt_2));		//<!-- 합계     -->
		m$.totalTimeCont.find('.WETotRate').text(	_SL.formatNumber(totalCount == 0 ? 0 : (calcTimeTotal.weekend_cnt_1 + calcTimeTotal.weekend_cnt_2)/totalCount*100));		//<!-- 비율     -->
		m$.totalTimeCont.find('.WETotAvg').text(	_SL.formatNumber(calcTimeTotal.weekend_avg_cnt));		//<!-- 평균     -->
		//전체합계 표 끝
		
		//m$.areaBody
		//요일별현황 컨테이너생성
		m$.areaBody.append(
		$('<div class="item-board">\
				<div class="board-head">\
					요일별현황\
					<div class="btns-group">\
						<button type="button" class="btn-toggle" data-toggle-handle="true" data-toggle-target="#weekContainer" data-toggle-class="hide"><i class="icon-chevron-up"></i></button>\
					</div>\
				</div>\
				<div class="board-body" id="weekContainer">\
					<div class="area-chart">\
						<div id="weekChartContainer"></div>\
					</div>\
				</div>\
			</div>')
		);

		//시간별현황 컨테이너생성
		m$.areaBody.append(
		$('<div class="item-board">\
				<div class="board-head">\
					시간별현황\
					<div class="btns-group">\
						<button type="button" class="btn-toggle" data-toggle-handle="true" data-toggle-target="#timeContainer" data-toggle-class="hide"><i class="icon-chevron-up"></i></button>\
					</div>\
				</div>\
				<div class="board-body" id="timeContainer">\
					<div class="area-chart">\
						<div id="timeChartContainer"></div>\
					</div>\
				</div>\
			</div>')
		);

		gChartStyle = $.extend({}, slui.chart.chartConfig, gChartStyle);
		gTimeChartStyle = $.extend({}, slui.chart.chartConfig, gTimeChartStyle);

		//요일별현황 차트 생성
	    var weekChart = new FusionCharts({
	        type: 'column2d',
	        renderAt: 'weekChartContainer',
	        width: '100%',
	        height: 200,
	        dataFormat: 'json',
	        dataSource: {
	        	chart : gChartStyle,
	        	data :	[
					{
						label : "Mon",
						toolText : "Mon, " + _SL.formatNumber(calcTimeTotal.week_1),
						value : calcTimeTotal.week_1
					}, 
					{
						label : "Tue",
						toolText : "Tue, " + _SL.formatNumber(calcTimeTotal.week_2),
						value : calcTimeTotal.week_2
					}, 
					{
						label : "Wed",
						toolText : "Wed, " + _SL.formatNumber(calcTimeTotal.week_3),
						value : calcTimeTotal.week_3
					}, 
					{
						label : "Thu",
						toolText : "Thu, " + _SL.formatNumber(calcTimeTotal.week_4),
						value : calcTimeTotal.week_4
					}, 
					{
						label : "Fri",
						toolText : "Fri, " + _SL.formatNumber(calcTimeTotal.week_5),
						value :calcTimeTotal.week_5
					}, 
					{
						label : "Sat",
						toolText : "Sat, " + _SL.formatNumber(calcTimeTotal.week_6),
						value : calcTimeTotal.week_6
					}, 
					{
						label : "Sun",
						toolText : "Sun, " + _SL.formatNumber(calcTimeTotal.week_0),
						value :calcTimeTotal.week_0
					}
				
				]
	        }
	    }).render();
		
	    //시간별현황 차트 생성
	    var datas = [];
		var cTime = _SL.formatNumber(calcTimeTotal.eDayTime);
		var TimeList = gRsListByItemNo.time_list;
		
		for(var i in TimeList){
			var data = TimeList[i];
			var  oData = {}

			oData.label = (data.time).toString();
			oData.toolText = data.time+" , " + _SL.formatNumber(data.total);
			oData.value = data.total;
			datas.push(oData);
			
			if(data.time == cTime){
				datas.push({
					vline : true,
					label : " 주간 ",
					dashed : '1', dashLen : '3', dashGap : '2',
					labelHAlign : "right"
				});

				datas.push({
					vline : true,
					label : " 야간 ",
					dashed : '1', dashLen : '3', dashGap : '2',
					labelHAlign : "left"
			    });
				
			}
		}
		
		var timeChart = new FusionCharts({
			type: 'area2d',
			renderAt: 'timeChartContainer',
			width: '100%',
			height: 200,
			dataFormat: 'json',
			dataSource: {
				chart : gTimeChartStyle,
				data : $.extend([], datas)
			}
		}).render();
		
		//Items
		var itemList = rsData.itemList;
		var itemRsList = rsData.rsListByItemNo;
		drawItems(itemList,itemRsList);
		
		slui.attach.setToggleLayer('.section-content');
	},
	
	drawRealtimeStats = function(rsData){
		m$.totalTimeCont.hide();
		if(!gRsListByItemNo) return;
		
		//시간별현황 컨테이너생성
		m$.areaBody.append(
		$('<div class="item-board item-board-wide">\
				<div class="board-head">\
					시간별현황\
					<div class="btns-group">\
						<button type="button" class="btn-toggle" data-toggle-handle="true" data-toggle-target="#timeContainer" data-toggle-class="hide"><i class="icon-chevron-up"></i></button>\
					</div>\
				</div>\
				<div class="board-body" id="timeContainer">\
					<div class="area-chart">\
						<div id="timeChartContainer"></div>\
					</div>\
				</div>\
			</div>')
		);
		
		//시간별현황 차트 생성
		//type: 'column2d',//gChartStyle,//type: 'area2d',//gTimeChartStyle
		var datas = [];
		var TimeList = gRsListByItemNo.time_list;
		
		for(var i in TimeList){
			var data = TimeList[i];
			var  oData = {}

			oData.label = _SL.formatDate(data.eqp_dt,"yyyyMMddHHmm","HH:mm");
			oData.toolText = _SL.formatDate(data.eqp_dt,"yyyyMMddHHmm","yyyy-MM-dd HH:mm")+" , " + _SL.formatNumber(data.total);
			oData.value = data.total;
			datas.push(oData);
		}

		var timeChart = new FusionCharts({
			type: 'area2d',
			renderAt: 'timeChartContainer',
			width: '100%',
			height: 200,
			dataFormat: 'json',
				dataSource: {
					chart : $.extend({}, gTimeChartStyle),
					data : $.extend([], datas)
				}
			}).render();

		//Items
		var itemList = rsData.itemList;
		var itemRsList = rsData.rsListByItemNo;
		drawItems(itemList,itemRsList);
	},	
	
	drawItems = function(itemList,itemRsList){
		for(var i in itemList){
			var 
				item = itemList[i],
				itemFunc = (item.func).toUpperCase(),
				funcField = item.func_field,
				fieldName = item.group_fields,
				convtFuncFldNm = (item.convtFuncFldNm?item.convtFuncFldNm:''),
				cvtFldName = item.convtFldNm,
				itemSeq = item.item_seq,
				itemSeqListStr = 'item_'+itemSeq+'_list',
				fldArr = item.fieldNmArr;
			
			//아이템별 컨테이너생성
			m$.areaBody.append(
			$('<div class="item-board">\
					<div class="board-head">'
						+cvtFldName+'별 순위'+
						'<div class="btns-group">\
							<button type="button" class="btn-toggle" data-toggle-handle="true" data-toggle-target="#'+i+'ItemContainer" data-toggle-class="hide"><i class="icon-chevron-up"></i></button>\
						</div>\
					</div>\
					<div class="board-body" id="'+i+'ItemContainer">\
						<div class="area-chart">\
							<div id="'+i+'ChartContainer"></div>\
						</div>\
						<div class="area-table">\
							<div id="'+i+'ListContainer"></div>\
						</div>\
					</div>\
				</div>')
			);

			var row = m$.etcForm.find("[name=row]").val();
			var sourceData = [];
			
			//Draw chart start
			var itemListData = itemRsList[itemSeqListStr];
			
			for(var j in itemListData){
				var tData = itemListData[j];

				if(tData[fieldName] !='기타'){
					var cData = {
							label : _SL.javascriptEscape(tData[fieldName]),
							toolText : _SL.javascriptEscape(tData[fieldName]) + ", " + _SL.formatNumber(tData.func_value),
							link : "javascript:slapp.topstats.list.goSearchPopup('" + itemSeq + "', '" + j + "', '"+ fieldName +"')",
							value: tData.func_value
						};
					
					sourceData.push(cData);
				};
			};
		
		    new FusionCharts({
		        type: 'bar2d',
		        renderAt: i+'ChartContainer',
		        width: '100%',
		        height: (row != 10 ? 200 : 250),
		        dataFormat: 'json',
		        dataSource: {
		        	chart : $.extend({}, gChartStyle, {xAxisName : cvtFldName, yAxisName : itemFunc+ (convtFuncFldNm?'('+convtFuncFldNm+')':'') }),
					data : $.extend([], sourceData)
		        }
		    }).render();
		    //Draw chart end
		
						
			////Draw list start
			var $listContainer = $("#" + i + "ListContainer"),
				$curTable = $("<table class='board-table-group'></table>"),
				$thead = $('<thead />').appendTo($curTable),
				$tbody = $('<tbody />').appendTo($curTable),
				$headTr = $("<tr />"),
				noRstColspan = 15,
				convtFldNmArr = item.convtFldNmArr;

			$headTr.append($("<th width=\"10%\">순번</th>"));
			for(var j in convtFldNmArr){
				$headTr.append($("<th>"+ convtFldNmArr[j] +"</th>"));
			}
			$headTr.append($("<th width=\"20%\">"+ itemFunc + (convtFuncFldNm?'('+convtFuncFldNm+')':'') + "</th>"))
				.append($("<th width=\"20%\">"+ "비율" +"</th>"))
				.appendTo($thead);

			if(itemListData.length == 0){
				var $listTr = $("<tr>");
				$listTr.append($("<td class='align-center' colspan='"+ noRstColspan +"'>There is no Search Result</td>"));
				$listTr.appendTo($curTable);
			}else{
				for(var j in itemListData){
					var $listTr = $("<tr>");
					var tData = itemListData[j];

					//순번
					if(tData[fieldName] !='기타'){
						$listTr.append($("<td class='align-center'>"+(parseInt(j)+1)+"</td>"));
					}else{
						$listTr.append($("<td class='align-center'>기타</td>"));
					}
					
					//필드값
					for(var k in fldArr){
						var cateField = fldArr[k];
						
						if(!tData[cateField]) $listTr.append($("<td>"));
						else $listTr.append($("<td><a href='#' onclick='slapp.topstats.list.goSearchPopup(\""+itemSeq+"\",\""+ j+"\",\""+ fieldName +"\")'>"+tData[cateField]+"</a></td>"));
					}
					
					//통계값
					$listTr.append($("<td class='align-right'>"+_SL.formatNumber(tData.func_value)+"</td>"));
					
					//비율
					if(item.totalCount == 0){
						$listTr.append($("<td class='align-right'>"+_SL.formatNumber(item.totalCount)+"%</td>"));
					} 
					else{
						$listTr.append($("<td class='align-right'>"+_SL.formatNumber(tData.func_value/item.totalCount*100)+"%</td>"));
					} 

					$listTr.appendTo($tbody);
				}
			}
			
			$curTable.appendTo($listContainer);	
			//Draw list end
		}

	},
	
	viewManagerDetail = function(url){
		var modal = new ModalPopup(url, {
			width : 850 ,
			height: 400 ,
			onClose : function(){
				//drawStatsInit(0);
			}
		});
	},
	
	goSearchPopup = function(itemSeq, rank, fieldNames){
		var keyStr = "item_" + itemSeq + "_list";
		var fieldNameArr = fieldNames.split(",");
		var start_time = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
		var end_time   = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
		var strQuery = "(" + gTopMng.search_condition + ")";
		var fieldval;
		var fieldInfo = gRsListByItemNo[keyStr][rank];
		var reCodeExtr = /.*\[(\d+)\]$/; 
		
		for(var idx in fieldNameArr){
			fieldval = fieldInfo[fieldNameArr[idx]];
			
			if (strQuery != "") strQuery += " AND ";
			
			if(fieldval == "-"){
				strQuery += "NOT " + fieldNameArr[idx] + ":*";
			}else{
				var rsMatch = fieldval.match(reCodeExtr);
				
				if(rsMatch && rsMatch[1]) fieldval = rsMatch[1];	
				
				strQuery += fieldNameArr[idx] + ":" + _SL.luceneValueEscape(fieldval);
			}
		}
		
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

		$("[name=start_time]", $logSearchForm).val(start_time);
		$("[name=end_time]", $logSearchForm).val(end_time);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(strQuery);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
	},	
	
	refresh = function() {
		drawStats();
	},

	gChartStyle = {
		"paletteColors": "#89cf43,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd,#dddddd",
		"maxLabelWidthPercent" :"20"
	},

	gTimeChartStyle = {
		"paletteColors": "#89cf43",
		"showvalues":"0",
		"plotfillalpha":"70"
	};
	
	return {
		init : init,
		goSearchPopup : goSearchPopup,
		drawStatsInit : drawStatsInit
	};

}();

$(function(){
	slapp.topstats.list.init();
});