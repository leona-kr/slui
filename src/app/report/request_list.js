'use strict';

_SL.nmspc("report").list = function() {

	var
	mCfg = {
		urlList 	: gCONTEXT_PATH + 'report/request_list.json',
		urlDelete 	: gCONTEXT_PATH + 'report/request_delete.do',
		urlDownload : gCONTEXT_PATH + 'report/report_download.do',
		formId 		: '#searchReportList',
		gridId 		: '#gridReportList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// 이벤트 Binding
		bindEvent();
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "report_nm", type: "string"},
				{ name: "sch_start_time", type: "string"},
				{ name: "sch_end_time", type: "string"},
				{ name: "gen_day", type: "string"},
				{ name: "gen_cycle_nm", type: "string"},
				{ name: "proc_stat_nm", type: "string"},
				{ name: "gen_format_list", type: "string"},
				{ name: "gen_path", type: "string"},
				{ name: "report_file_nm", type: "string"},
				{ name: "gen_req_id", type: "string"},
				{ name: "req_start_time", type: "string"}
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
					rows[i].sch_start_time = _SL.formatDate(rows[i].sch_start_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					rows[i].sch_end_time = _SL.formatDate(rows[i].sch_end_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					rows[i].req_start_time = _SL.formatDate(rows[i].req_start_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					
					rows[i].sch_time = rows[i].sch_start_time + " ~ "+ rows[i].sch_end_time;
					rows[i].gen_cycle = rows[i].gen_cycle_nm + rows[i].gen_day;
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
				alert(error);
			}
		});

		$grid.jqxGrid({
			source: dataadapter,
			sortable: true,
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
				{ text: '보고서명', datafield: 'report_nm', cellsalign:'center' },
				{ text: '검색기간', datafield: 'sch_time', width:"20%", cellsalign:'center' },
				{ text: '생성주기', datafield: 'gen_cycle', width:"10%", cellsalign:'center' },
				{ text: '진행상태', datafield: 'proc_stat_nm', width:"10%", cellsalign:'center' },
				{ text: '생성파일', datafield: 'gen_format_list', width:"12%", cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var genImg = "";
						var fileList = {};
						var fileNm = rowdata.report_file_nm;
						var genReqId = rowdata.gen_req_id;
						var genPath = rowdata.gen_path;
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
							
							genImg += " <button type='button' class='btn-link'><i class='icon-"+fileList[i]+"'></i></button> ";
						}
						
						return $(defaulthtml).html(genImg)[0].outerHTML;
					}
				},
				{ text: '생성(예정)시간', datafield: 'req_start_time', width:"15%", cellsalign:'center' }
			]
		});
		
		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'gen_format_list'){
				var classNm = event.args.originalEvent.toElement.className;
				var fmt = classNm.split("-");
				switch(fmt[1]) {
				case "word" :
					fmt[1] = "docx";
					break;
				case "xls" :
					fmt[1] = "xlsx";
					break;
				case "ppt" :
					fmt[1] = "pptx";
					break;
				}
				
				var rData = event.args.row.bounddata;
				var filePath = rData.gen_path;
				var fileName = rData.report_file_nm+"_"+rData.gen_req_id+"."+fmt[1];
				
				m$.form.find("[name=filePath]").val(filePath);
				m$.form.find("[name=fileName]").val(fileName);
				
				if(fmt[1] != "grid") exportReport();
			}

		});
	},
	
	bindEvent = function() {
		var $btnDel = m$.grid.parent().siblings('.grid-bottom').find('.btn-delete');
		
		// 이벤트 설정 (검색버튼)
		m$.form.find('.form-submit').off().on('click',function(){
			refresh();
		});
		
		// 보고서 삭제
		$btnDel.off().on('click', function(){
			var	listReport = [];
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

			if (idxs.length > 0){
				for (var i in idxs) {
					var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
					if(!rowData) break; //체크박스동작관련 임시 소스( 전체 체크후 해제해도 virtual mode로 생성된 idx는 남아있음..)
					listReport.push(rowData.gen_req_id);
				}
				delReport(listReport);
			}
			else {
				_alert("선택한 보고서가 없습니다.");
			}
			
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},
	
	delReport = function(listReport){
		_confirm("선택한 보고서를 삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {remove_gen_req_id:listReport}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	},

	exportReport = function(){
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	}
	
	return {
		init : init
	};
	

}();

$(function(){
	slapp.report.list.init();

	//보고서 스케쥴 관리
	$("#btnScheduleMng").togglePage(gCONTEXT_PATH + "report/schedule_list.html");
});