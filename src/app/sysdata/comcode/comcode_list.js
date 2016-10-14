'use strict';

_SL.nmspc("comcode").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/comcode_list.json',
		urlForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlDownload : gCONTEXT_PATH + 'sysdata/comcode_export.do',
		urlImport : gCONTEXT_PATH + 'sysdata/comcode_import_form.html',
		formId : '#searchComcodeList',
		gridId : '#gridComcodeList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnDownload = m$.form.find('.btn-download');
		var $btnImport = m$.grid.parent().siblings('.grid-bottom').find('.btn-import');
		
		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});

		m$.form.find('[name=s_code_type]').change(refresh);
		
		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm+'?code_type='+m$.form.find('[name=s_code_type]').val());
		});
		
		$btnDownload.off().on('click',function(){
			downloadExcel();
		});
		
		$btnImport.off().on('click',function(){
			var modal = new ModalPopup(mCfg.urlImport+'?s_code_type='+m$.form.find('[name=s_code_type]').val(), {
				width:500, height:215,
				onClose : function(){
					refresh();
				}
			});
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
			width: '100%',
			virtualmode: true,
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
				{ text: '코드', datafield: 'code_id', width:'15%', cellsalign:'center'},
				{ text: '코드명', datafield: 'code_name', width:'40%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link hasTooltip" data-value="'+ value +'">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '설명', datafield: 'code_cont', cellsalign:'center'}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'code_name'){
				var rowData = event.args.row.bounddata;
				
				viewDetail(mCfg.urlForm +'?code_id='+rowData.code_id+'&code_type='+rowData.code_type);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		setToolTip();
	},
	
	setToolTip = function() {
		setTimeout(function(){
            $(".hasTooltip").each(function () {
            	var text = $(this).data('value');
                $(this).jqxTooltip({ position: 'mouse', content: text });
            });
		}, 500);
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			height:455,
			onClose : function(){
				refresh();
			}
		});
	},
	
	downloadExcel = function(){
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.comcode.list.init();
	
	//코드 종류 관리
	$("#btnManageCode").togglePage(gCONTEXT_PATH + "sysdata/comcode_type_list.html");
	
	//코드북 설정
	$("#btnSettingCodeBook").togglePage(gCONTEXT_PATH + "sysdata/code_book_list.html");
});