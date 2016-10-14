'use strict';

_SL.nmspc("comcode").codebook = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/code_book_list.json',
		urlForm : gCONTEXT_PATH + 'sysdata/code_book_form.html',
		formId : '#searchCodeBookList',
		gridId : '#gridCodeBookList'
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
				{ name: "code_type", type: "string"},
				{ name: "code_name", type: "string"},
				{ name: "field_name_list", type: "string"},
				{ name: "convert_field_name_list", type: "string"},
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
			loadComplete : function () {
				setToolTip();
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
				{ text: '코드종류명[코드종류ID]', datafield: 'code_type', width:400, cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + rowdata.code_name +' ['+ value+']' + '</button>')[0].outerHTML;
					}
				},
				{ text: '로그필드', datafield: 'convert_field_name_list',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strVal = value.substring(0,84) + (value.length > 85 ? '...' : '');
						
						return  $(defaulthtml).html('<label class="hasTooltip" data-value="'+ value +'">'+ strVal +'</label>')[0].outerHTML;
					}
				},
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'code_type'){
				var codeId = event.args.row.bounddata.code_type;
				var fieldNameList = event.args.row.bounddata.field_name_list;
				
				viewDetail(mCfg.urlForm +'?code_id='+codeId+'&field_name_list='+fieldNameList);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		setToolTip();
	},
	
	setToolTip = function() {
		setTimeout(function(){
			m$.grid.find('.hasTooltip').each(function(index){
				var text = $(this).data('value');
				$(this).jqxTooltip({position: 'mouse', content: text });
			});
		}, 500);
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			height:260,
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
	slapp.comcode.codebook.init();
});