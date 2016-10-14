//# sourceURL=big_file_data_list.js
'use strict';

_SL.nmspc("bigFileData").list = function() {

	var
	bigCodeArr = [],
	mCfg = {
		urlList 	: gCONTEXT_PATH + 'analysis/big_file_data_list.json',
		urlForm 	: gCONTEXT_PATH + 'analysis/big_file_data_form.html',
		urlView 	: gCONTEXT_PATH + 'analysis/big_file_data_view.html',
		urlDelete 	: gCONTEXT_PATH + 'analysis/big_file_data_delete.do',

		formId : '#searchBigFileDataList',
		gridId : '#gridBigFileDataList'
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
				{ name: "file_id", type: "string"},
				{ name: "normalize_type", type: "string"},
				{ name: "normalize_type_nm", type: "string"},
				{ name: "file_data_name", type: "string"},
				{ name: "org_file_name", type: "string"},
				{ name: "status_nm", type: "string"},
				{ name: "proc_id", type: "string"},
				{ name: "proc_nm", type: "string"},
				{ name: "proc_dt", type: "string"},
				{ name: "log_psr_id", type: "string"},
				{ name: "log_psr_nm", type: "string"}
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
					 rows[i].proc_dt = _SL.formatDate(rows[i].proc_dt, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss');
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
			sortable: false,
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
				{ text: '파일데이터명', datafield:'file_data_name', cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value)[0].outerHTML;
					}
				},
				{ text: '정규화방법', datafield: 'normalize_type_nm', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var val;
						if(rowdata.normalize_type == 2) val = "로그파서(" + value + ")";
						else val = value;
						
						return $(defaulthtml).text(val)[0].outerHTML;
					}
				},
				{ text: '파일명', datafield: 'org_file_name', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).text(value)[0].outerHTML;
					}
				},
				{ text: '등록자', datafield: 'proc_id', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html(value + "(" + rowdata.proc_nm + ")")[0].outerHTML;
					}
				},
				{ text: '등록일', datafield: 'proc_dt', cellsalign:'center', width:'15%',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value)[0].outerHTML;
					}
				},
				{ text: '진행상태', datafield: 'status_nm', cellsalign:'center', width:'10%',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var sttNm;
						if(value == "완료") {
							sttNm = '<button type="button" class="btn-link">' + value + '</button>';
						}
						else {
							sttNm = value;
						}
						
						return $(defaulthtml).html(sttNm)[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield == 'status_nm'){
				var sttNm = event.args.row.bounddata.status_nm;
				var fileId = event.args.row.bounddata.file_id;
				
				if(sttNm == "완료") {
					viewDetail(mCfg.urlView +'?file_id='+fileId);
				}
			}
		});
	},

	bindEvent = function(){
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnDel = m$.grid.parent().siblings('.grid-bottom').find('.btn-delete');
		
		//Search
		m$.form.find('.form-submit').off().on('click',function(){
			refresh();
		});
		
		$btnAdd.off().on('click', function() {
			var modal = new ModalPopup(mCfg.urlForm, {
				width : 1080,
				height : 200,
				onClose : function(){
					refresh();
				}
			});
		});
		
		// 파일데이터 삭제
		$btnDel.off().on('click', function(){
			var	listFileData = [];
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
					listFileData.push(rowData.file_id);
				}
				delFileData(listFileData);
			}
			else {
				_alert("삭제할 데이터를 선택하세요.");
			}
			
		});
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width : 1080,
			height : 500,
			setScroll: true,
			onClose : function(){
				refresh();
			}
		});
	},
	
	delFileData = function(listFileData){
		_confirm("삭제 하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {chk_file_ids:listFileData}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.bigFileData.list.init();
});