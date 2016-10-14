//# sourceURL=schedule_list.js
'use strict';

_SL.nmspc("schedule").list = function() {

	var
	// Config 정의
	mCfg = {
		gridId 	: '#gridReportSchedule',
		formId 	: '#searchReportSchedule',
		urlList : gCONTEXT_PATH + 'report/schedule_list.json',
		urlForm : gCONTEXT_PATH + "report/schedule_form.html"
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId)
	},
	
	init = function(){
		// 스케쥴 추가버튼
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');

		drawGrid( m$.grid );
		//검색
		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});

		// 스케쥴 추가
		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "schedule_id", type: "string"},
				{ name: "report_nm", type: "string"},
				{ name: "gen_cycle", type: "string"},
				{ name: "gen_cycle_nm", type: "string"},
				{ name: "gen_day", type: "string"},
				{ name: "gen_start_time", type: "string"},
				{ name: "schd_stat", type: "string"},
				{ name: "schd_stat_nm", type: "string"},
				{ name: "file_format_list", type: "string"}
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

		//데이터 가공
		dataadapter = new $.jqx.dataAdapter(gridSource, {
			beforeLoadComplete: function(rows) {
				for (var i in rows) {
					if(rows[i].gen_cycle == 0) {
						rows[i].gen_start_time = _SL.formatDate(rows[i].gen_start_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					}
					else {
						rows[i].gen_start_time = _SL.formatDate(rows[i].gen_start_time, 'yyyyMMddHHmm', 'HH:mm');
					}
					
					rows[i].gen_cycle = rows[i].gen_cycle_nm + rows[i].gen_day;
				}
				return rows;
			},
			formatData : function(data) {
				var params = {}, param, flds = m$.form.serializeArray();
				for(param in flds) {
					params[flds[param].name] = flds[param].value;
				};
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
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ 
					text: '보고서명', datafield: 'report_nm', cellsalign:'center', width:"28%", 
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '생성주기', datafield: 'gen_cycle', cellsalign:'center'},
				{ text: '실행시간', datafield: 'gen_start_time', cellsalign:'center'},
				{ text: '상태', datafield: 'schd_stat_nm', cellsalign:'center'},
				{ 
					text: '요청파일', datafield: 'file_format_list', cellsalign:'center', width:"12%",
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var genImg = "";
						var fileList = {};
						fileList = value.split(",");
						
						for(var i=0; i<fileList.length; i++) {
							switch(fileList[i]) {
							case "docx" :
								fileList[i] = "word";
								break;
							case "xlsx" :
								fileList[i] = "xls";
								break;
							case "pptx" :
								fileList[i] = "ppt";
								break;
							}
							
							genImg += " <i class='icon-"+fileList[i]+"'></i> ";
						}
						
						return $(defaulthtml).html(genImg)[0].outerHTML;
					}
				}
				
			]
		});

		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'report_nm'){
				var schedId = event.args.row.bounddata.schedule_id;
				viewDetail(mCfg.urlForm +'?schedule_id='+schedId);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width : 740,
			height : 490,
			onClose : function(){
				refresh();
			}
		});
	};

	return {
		init: init
	};
}();


$(function(){
	slapp.schedule.list.init();
});