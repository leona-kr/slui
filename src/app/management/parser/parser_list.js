'use strict';

_SL.nmspc("parser").list = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/parser_list.json',
		urlForm : gCONTEXT_PATH + 'management/parser_form.html',
		urlDefailForm : gCONTEXT_PATH + 'management/log_psr_form.html',
		formId : '#searchParserList',
		gridId : '#gridParserList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');

		// 초기 화면 구성
		drawGrid(m$.grid);
		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm, 450, 230);
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "psr_id", type: "string"},
				{ name: "psr_nm", type: "string"},
				{ name: "description", type: "string"},
				{ name: "version", type: "string"},
				{ name: "log_type_psr_info", type: "string"}
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
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{
					text: 'No', columntype: 'number', width:35, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '파서명', datafield: 'psr_nm', width:'30%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: 'Version', datafield: 'version', cellsalign:'center'},
				{ text: '설명', datafield: 'description'},
				{ text: '로그 파서', datafield: 'log_type_psr_info', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'psr_nm'){
				var psrId = event.args.row.bounddata.psr_id;
				viewDetail(mCfg.urlForm +'?psr_id='+psrId, 450, 230);
			}

			if(event.args.datafield === 'log_type_psr_info'){
				var psrId = event.args.row.bounddata.psr_id;
				viewDetail(mCfg.urlDefailForm +'?psr_id='+psrId, 1200, 700, true);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url,wid,hei,isModify){
		if(isModify == true){
			var setScroll = true;
		}else{
			var setScroll = false;
		}
		var modal = new ModalPopup(url, {
			width:wid,
			height:hei,
			setScroll : setScroll,
			onDestroy : function(){
				$.contextMenu('destroy');		// 파서 목록에 contextmenu제거
				refresh();
			}
		});
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.parser.list.init();
});