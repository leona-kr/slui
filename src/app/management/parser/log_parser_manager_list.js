'use strict';

_SL.nmspc("parser").logManagerList = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/log_parser_manager_list.json',
		urlEquipList : gCONTEXT_PATH + 'management/equip_partial_list.html',
		urlParserList : gCONTEXT_PATH + 'management/parser_list.html',
		urlForm : gCONTEXT_PATH + 'management/log_parser_manager_form.html',
		urlDownload : gCONTEXT_PATH + 'management/log_parser_manager_export.do',
		urlImport : gCONTEXT_PATH + 'management/log_parser_manager_import_form.html',
		formId : '#searchLogParserManagerList',
		gridId : '#gridLogParserManagerList'
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

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});
		
		$btnDownload.off().on('click',function(){
			downloadExcel();
		});
		
		$btnImport.off().on('click',function(){
			var modal = new ModalPopup(mCfg.urlImport, {
				width:500, height:160,
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
			    { name: "log_psr_id", type: "string"},
				{ name: "log_psr_nm", type: "string"},
				{ name: "log_type_cd", type: "string"},
				{ name: "log_type_nm", type: "string"},
				{ name: "log_cate_cd", type: "string"},
				{ name: "log_cate_nm", type: "string"},
				{ name: "handle_type", type: "string"},
				{ name: "handle_type_nm", type: "string"},
				{ name: "handle_opt", type: "string"},
				{ name: "log_cate_value", type: "string"},
				{ name: "sample", type: "string"},
				{ name: "psr_xml", type: "string"},
				{ name: "description", type: "string"},
				{ name: "cnt_used_eqp", type: "string"},
				{ name: "cnt_used_psr", type: "string"}
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
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '로그파서명', datafield: 'log_psr_nm',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '로그타입', datafield: 'log_type_nm', width:'10%', cellsalign:'center'},
				{ text: '구분방법', datafield: 'handle_type_nm', width:'10%', cellsalign:'center'},
				{ text: '구분Option', datafield: 'handle_opt', width:'10%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strVal = value;
						
						if(rowdata.handle_type == 1){
							strVal = '구분자(';
							strVal += value.split("|")[0].replace("@P@","|") + ') ';
							strVal += (parseInt(value.split("|")[1]) + 1) + '번째';
						}
						
						return  $(defaulthtml).html(strVal)[0].outerHTML;
					}
				},
				{ text: '구분값', datafield: 'log_cate_value', width:'15%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strVal = value.length > 25 ? value.substring(0,24) + '....' : value;
						
						return  $(defaulthtml).html(value)[0].outerHTML;
					}
				},
				{ text: '로그분류', datafield: 'log_cate_nm', width:'20%', cellsalign:'center'},
				{ text: '장비/파서', datafield: 'cnt_used_eqp', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strEqpCnt = rowdata.cnt_used_eqp; 
						var strPsrCnt = rowdata.cnt_used_psr; 
						
						if(strEqpCnt != 0)
							strEqpCnt = '<button type="button" class="btn-link btn-equip">' + strEqpCnt + '</button>';
						
						if(strPsrCnt != 0)
							strPsrCnt = '<button type="button" class="btn-link btn-parser">' + strPsrCnt + '</button>';
						
						return  $(defaulthtml).html(strEqpCnt + ' / ' +strPsrCnt)[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'log_psr_nm'){
				var logPsrId = event.args.row.bounddata.log_psr_id;
				viewDetail(mCfg.urlForm +'?log_psr_id='+logPsrId);
			}
			
			if(event.args.datafield === 'cnt_used_eqp'){
				if(args.originalEvent.target.classList[1] === "btn-equip"){ //장비 Click
					var logPsrId = event.args.row.bounddata.log_psr_id;
					$(this).addModalPage(mCfg.urlEquipList + '?s_log_psr_id='+logPsrId);
				}else if(args.originalEvent.target.classList[1] === "btn-parser"){//파서 Click
					var logPsrId = event.args.row.bounddata.log_psr_id;
					$(this).addModalPage(mCfg.urlParserList + '?s_log_psr_id='+logPsrId);
				}
			}
		});
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:800, height:475,
			onClose : function(){
				refresh();
			}
		});
	},
	
	downloadExcel = function(){
		if(!_SL.validate(m$.form)) 
			return;
		
		m$.form.attr({
			action : mCfg.urlDownload
		}).submit();
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.parser.logManagerList.init();
});