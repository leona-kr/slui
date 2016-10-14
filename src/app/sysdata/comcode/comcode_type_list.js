'use strict';

_SL.nmspc("comcode").typelist = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/comcode_type_list.json',
		urlForm : gCONTEXT_PATH + 'sysdata/comcode_type_form.html',
		formId : '#searchComCodeTypeList',
		gridId : '#gridComCodeTypeList'
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
				{ name: "code_id", type: "string"},
				{ name: "code_name", type: "string"},
				{ name: "flag1", type: "string"},
				{ name: "flag2", type: "string"},
				{ name: "code_cont", type: "string"},
				{ name: "user_view", type: "string"},
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
				{ text: '코드종류ID', datafield: 'code_id', width:'15%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '코드종류명', datafield: 'code_name', cellsalign:'center'},
				{ text: '기본설명', datafield: 'code_cont', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<label class="hasTooltip" data-value="'+ value +'">'+ value +'</label>')[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'code_id'){
				var codeId = event.args.row.bounddata.code_id;
				
				viewDetail(mCfg.urlForm +'?code_id='+codeId);
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
			height:310,
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
	slapp.comcode.typelist.init();
});