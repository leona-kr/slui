//# sourceURL=search_event_duplication_list.js
'use strict';

_SL.nmspc("searchEventDuplication").list = function() {

	var
	// Config 정의
	mCfg = {
		gridId : '#gridSearchEventDuplication',
		formId : '#searchEventDuplication',
		urlList : gCONTEXT_PATH + 'event/search_event_duplication_list.json',
		urlForm : gCONTEXT_PATH + 'event/search_event_duplication_form.html'
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
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');

		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "seq", type: "string"},
				{ name: "duplication_name", type: "string"},
				{ name: "cvt_duplication_query", type: "string"},
				{ name: "start_time", type: "string"},
				{ name: "end_time", type: "string"}
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
					rows[i].start_time = _SL.formatDate(rows[i].start_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					rows[i].end_time = _SL.formatDate(rows[i].end_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
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
				{ 	text: '중복명', datafield: 'duplication_name',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '기준필드', datafield: 'cvt_duplication_query'	},
				{ text: '시작일시', cellsalign:'center', datafield: 'start_time', width:'17%' },
				{ text: '종료일시', cellsalign:'center', datafield: 'end_time', width:'17%' }
			]
		});

		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'duplication_name'){
				var seq = event.args.row.bounddata.seq;
				viewDetail(mCfg.urlForm +'?seq='+seq+'&chk=update');
			}

		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width : 800,
			height: 470,
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
	slapp.searchEventDuplication.list.init();
});