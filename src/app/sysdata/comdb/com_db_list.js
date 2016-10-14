'use strict';

_SL.nmspc("comdb").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/com_db_list.json',
		urlForm : gCONTEXT_PATH + 'sysdata/com_db_form.html',
		formId : '#searchComDbList',
		gridId : '#gridComDbList'
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
			viewDetail(mCfg.urlForm);
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "jdbc_id", type: "string"},
				{ name: "jdbc_nm", type: "string"},
				{ name: "jdbc_type", type: "string"},
				{ name: "jdbc_type_nm", type: "string"},
				{ name: "jdbc_prop", type: "string"},
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
				{ text: 'ID', datafield: 'jdbc_id', width:'30%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '이름', datafield: 'jdbc_nm', width:'30%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '종류', datafield: 'jdbc_type_nm', cellsalign:'center'}
			]
		});

		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'jdbc_id' || event.args.datafield === 'jdbc_nm'){
				var jdbcId = event.args.row.bounddata.jdbc_id;
				
				viewDetail(mCfg.urlForm +'?jdbc_id='+jdbcId);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			height:400,
			onClose : function(){
				refresh();
			}
		});
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.comdb.list.init();
});