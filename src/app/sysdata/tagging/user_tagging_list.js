'use strict';

_SL.nmspc("tagging").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'sysdata/user_tagging_list.json',
		urlForm : gCONTEXT_PATH + 'sysdata/user_tagging_form.html',
		urlApply : gCONTEXT_PATH + 'sysdata/user_tagging_apply.do',
		urlExport : gCONTEXT_PATH + 'sysdata/user_tagging_select_export.do',
		formId : '#searchUserTaggingList',
		gridId : '#gridUserTaggingList',
		formSubId : '#formSub'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		formSub : $(mCfg.formSubId)
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnExport = m$.grid.parent().siblings('.grid-bottom').find('.btn-export');
		var $btnApply = m$.grid.parent().siblings('.grid-bottom').find('.btn-apply');

		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			refresh();
		});

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm, false);
		});
		
		$btnExport.off().on('click',function(){
			goExport();
		});
		
		$btnApply.off().on('click',function(){
			applyUserTagging();
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "mng_id", type: "string"},
				{ name: "mng_name", type: "string"},
				{ name: "mng_type", type: "string"},
				{ name: "mng_cate_cd", type: "string"},
				{ name: "mng_cate_nm", type: "string"},
				{ name: "ref_query", type: "string"},
				{ name: "description", type: "string"},
				{ name: "proc_id", type: "string"},
				{ name: "proc_ip", type: "string"},
				{ name: "proc_dt", type: "string"}
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
			sortable: false,
			width: '100%',
			selectionmode: 'checkbox',
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
				{ text: '관리ID', datafield: 'mng_id' ,
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}},
				{ text: '관리명', datafield: 'mng_name' },
				{ text: '분류', datafield: 'mng_cate_nm', cellsalign:'center', width:'15%' },
				{ text: '종류', datafield: 'mng_type' , cellsalign:'center', width:'15%',
					cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties, rowdata) {
						if(value == 1)
							return $(defaulthtml).text('수동')[0].outerHTML;
						else
							return $(defaulthtml).text('SQL')[0].outerHTML;
					}
				},
				{ text: '처리자ID', datafield: 'proc_id', width:'15%', cellsalign:'center'}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'mng_id'){
				var mngid = event.args.row.bounddata.mng_id;
				viewDetail(mCfg.urlForm +'?mng_id='+mngid, true);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},

	viewDetail = function(url, _setScroll){
		var modal = new ModalPopup(url, {
			width:800, height:560,
			setScroll : _setScroll,
			onClose : function(){
				refresh();
			}
		});
	},
	
	goExport = function(){
		var	exportList = [];
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
		
		if(idxs.length > 0){
			for (var i in idxs) {
				var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
				if(!rowData) break;
				exportList.push(rowData.mng_id);
			}
			exportTaggingList(exportList);			
		}else{
			_alert('선택된 목록이 없습니다.');
		}
	},
	
	exportTaggingList = function(exportList){
		m$.formSub.find('[name=chk_export]').val(exportList);
		
		m$.formSub.attr({
			action : mCfg.urlExport,
			method : 'post'
		}).submit();
	},
	
	applyUserTagging = function(){
		_confirm("적용 하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlApply, {}, {
					callback : function(rsData, rsCd, rsMsg){
						if(rsCd == 'SUC_COM_0000'){
							_alert("적용 되었습니다.");
						}else{
							_alert("적용 중 에러가 발생했습니다.<br> 다시 실행하세요.");
						}
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
	slapp.tagging.list.init();
	
	//데이터소스 관리
	$("#btnManageDataSource").togglePage(gCONTEXT_PATH + "sysdata/com_db_list.html");
});