'use strict';

_SL.nmspc("svar").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/system_var_list.json',
		urlForm : gCONTEXT_PATH + 'sysdata/system_var_form.html',
		urlDownload : gCONTEXT_PATH + 'sysdata/system_var_export.do',
		formId : '#searchSystemVarList',
		gridId : '#gridSystemVarList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},

	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnDownload = m$.form.find('.btn-download');
		
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
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "var_nm", type: "string"},
				{ name: "var_val", type: "string"},
				{ name: "var_type", type: "string"},
				{ name: "var_comments", type: "string"},
				{ name: "open_time", type: "string"},
				{ name: "proc_id", type: "string"},
				{ name: "proc_ip", type: "string"},
				{ name: "proc_dt", type: "string"},
				{ name: "ref_cnt", type: "string"}
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
			virtualmode: true,
			rendergridrows: function(obj){
				return obj.data;
			},
			columns: [
				{
					text: 'No', columntype: 'number', width:'30', cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '시스템변수명', datafield: 'var_nm', width:'20%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strVal = value.substring(0,14) + (value.length > 14 ? '...' : '');
						return  $(defaulthtml).html('<button type="button" class="btn-link hasTooltip" data-value="'+ value +'">' + strVal + '</button>')[0].outerHTML;
					}
				},
				{ text: '시스템변수내용', datafield: 'var_val',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strVal = value.substring(0,28) + (value.length > 28 ? '...' : '');
						return  $(defaulthtml).html('<label class="hasTooltip" data-value="'+ value +'">'+ strVal +'</label>')[0].outerHTML;
					}
				},
				{ text: '참조건수', datafield: 'ref_cnt', width:'10%', cellsalign:'center'},
				{ text: '작성자', datafield: 'proc_id', width:'15%', cellsalign:'center'},
				{ text: '등록일', datafield: 'proc_dt', width:'15%', cellsalign:'center'}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'var_nm'){
				var varNm = event.args.row.bounddata.var_nm;
				viewDetail(mCfg.urlForm +'?var_nm='+varNm);
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
			width:800, height:460,
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
	slapp.svar.list.init();
});