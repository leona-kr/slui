//# sourceURL=blacklist_list.js
'use strict';

_SL.nmspc("blacklist").list = function() {

	var
	// Config 정의
	mCfg = {
		gridId : '#gridBlacklist',
		formId : '#searchBlacklist',
		urlList : gCONTEXT_PATH + 'event/blacklist_list.json',
		urlForm : gCONTEXT_PATH + 'event/blacklist_form.html',
		urlDelete : gCONTEXT_PATH + "event/blacklist_delete.do",
		urlImportForm : gCONTEXT_PATH + 'event/blacklist_import_form.html',
		urlDownload : gCONTEXT_PATH + 'event/blacklist_export.do'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId)
	},
	
	init = function(){
		// 초기 화면 구성
		drawGrid( m$.grid );

		// 이벤트 Binding
		bindEvent();
	},
	
	bindEvent = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add'),
			 $btnDel = m$.grid.parent().siblings('.grid-bottom').find('.btn-delete'),
			 $btnImport = m$.grid.parent().siblings('.grid-bottom').find('.btn-import'),
			 $btnDownload = m$.form.find('.btn-download');
		
		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});
		
		$btnDel.off().on('click', function(){
			var delList = [],
				selectedrowindex = m$.grid.jqxGrid('selectedrowindexes'),
				displayobj = m$.grid.jqxGrid('getdisplayrows'),
				idxs = [];

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
					delList.push(rowData.blacklist_ip);
				}
				deleteBlacklist(delList);
			}
			else {
				_alert("선택한 IP가 없습니다.");
			}
			
		});
		
		$btnImport.off().on('click',function(){
			var modal = new ModalPopup(mCfg.urlImportForm, {
				height: 170,
				onClose : function(){
					refresh();
				}
			});
		});
		
		$btnDownload.off().on('click',function(){
			excelDownLoad();
		});
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "blacklist_ip", type: "string"},
				{ name: "type_nm", type: "string"},
				{ name: "domain", type: "string"},
				{ name: "nation", type: "string"},
				{ name: "expire_dt", type: "string"},
				{ name: "reg_dt", type: "string"}
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
					rows[i].reg_dt = _SL.formatDate(rows[i].reg_dt, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					
					if(!!rows[i].expire_dt) 
						rows[i].expire_dt = _SL.formatDate(rows[i].expire_dt, 'yyyyMMdd', 'yyyy-MM-dd');
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
				{ 	text: '유해IP', datafield: 'blacklist_ip', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '유형', datafield: 'type_nm', cellsalign:'center'},
				{ text: '도메인', datafield: 'domain'},
				{ text: '국가', datafield: 'nation', cellsalign:'center', width:'15%'},
				{ text: '만료일자', datafield: 'expire_dt', cellsalign:'center', width:'12%' },
				{ text: '등록시간', datafield: 'reg_dt', cellsalign:'center', width:'15%' }
			]
		});

		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'blacklist_ip'){
				var blicklistIP = event.args.row.bounddata.blacklist_ip;
				viewDetail(mCfg.urlForm +'?blacklist_ip='+blicklistIP);
			}

		});
	},

	refresh = function() {
		if(!_SL.validate(m$.form)) return;
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			height: 340,
			onClose : function(){
				refresh();
			}
		});
	},
	
	deleteBlacklist = function(delList){
		//step1. 사용자 확인
		_confirm("삭제 하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {del_ip_list:delList}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	},
	
	excelDownLoad = function(){
		if(!_SL.validate(m$.form)) return;
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	}

	return {
		init: init
	};
}();


$(function(){
	slapp.blacklist.list.init();
});