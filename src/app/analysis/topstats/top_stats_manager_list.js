//# sourceURL=top_stats_manager_list.js
'use strict';

_SL.nmspc("topStatsManager").list = function() {

	var
	// Config 정의
	mCfg = {
		gridId : '#gridTopStatsList',		
		urlList : gCONTEXT_PATH + 'analysis/top_stats_manager_list.json',
		urlOnOff: gCONTEXT_PATH + 'analysis/top_stats_manager_onoff.json'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId)
	},
	
	init = function(){
		
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// 이벤트 Binding
		bindEvent();
		
	},
	
	drawGrid = function($grid){
		
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "top_code", type: "string"},
				{ name: "top_name", type: "string"},
				{ name: "search_condition", type: "string"},
				{ name: "use_yn", type: "string"},
				{ name: "order_no", type: "string"},
				{ name: "proc_id", type: "string"},
				{ name: "proc_ip", type: "string"},
				{ name: "proc_dt", type: "string"}
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

			},
			formatData : function(data) {
				var params = {};
				$.extend(data, params);
				
				return data;
			},
			
			loadError: function(xhr, status, error){
				alert(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			sortable: true,
			width: '100%',
			virtualmode: true,
			enablehover: false,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
			    { 
			    	text: '상태', datafield: 'use_yn', width:50, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml,columnproperties, rowdata) {
						var btnStatus = "on";
						var btnVal = "1";
						
						if(value =="N"){
							btnStatus = "off";
							btnVal = "0";
						}  
						return $(defaulthtml).css('margin-top','4px').html('<button type="button" data-top_code="'+rowdata.top_code+'" class="onoff-icon btn-switch-'+ btnStatus +'" value="'+ btnVal +'" data-switch-toggle="true"><span class="text-on">ON</span><span class="text-off">OFF</span></button>')[0].outerHTML;
					}
			    },			          
				{
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ 	text: '분석명', datafield: 'top_name'	}
			]
		});
	},
	
	bindEvent = function() {
		var $btnApply = m$.grid.parent().siblings('.grid-bottom').find('.btn-apply');
				
		//적용
		$btnApply.off().on('click',function(){
			fnOnOff();
		});
	},	
	
	fnOnOff = function(){
		var chkInfo = [];
		
		m$.grid.find("*[class*='btn-switch-']").each(function(){
			chkInfo.push({
				top_code	: $(this).data("top_code"),
				use_yn		: $(this).val() == "1" ? "Y" : "N"
			});
		})
		
		if(chkInfo.length == 0) {
			_alert("On/Off 적용할 건을 선택하세요.");
		}else{
			$('body').requestData(mCfg.urlOnOff,  chkInfo, {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg);
					m$.grid.parent().siblings('.grid-bottom').find("[data-layer-close=true]").click();
					slapp.topstats.list.init();
				}
			});
		}
	},	
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	}

	return {
		init: init
	};
}();


$(function(){
	slapp.topStatsManager.list.init();
});