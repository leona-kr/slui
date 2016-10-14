'use strict';

_SL.nmspc("collector").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/collector_list.json',
		urlForm : gCONTEXT_PATH + 'management/collector_form.html',
		urlInfo : gCONTEXT_PATH + 'management/jws_connector.do',
		formId : '#searchCollectorList',
		gridId : '#gridCollectorList'
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
				{ name: "collector_id", type: "string"},
				{ name: "collector_nm", type: "string"},
				{ name: "collector_ip", type: "string"}
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
				{ text: 'Collector ID', datafield: 'collector_id', width:'20%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: 'Collector 이름', datafield: 'collector_nm',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: 'Collector IP', datafield: 'collector_ip'},
				{ text: '파서 정보', datafield: 'parser_info', cellsalign:'center', width:'10%',
					cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link"><i class="icon-drive"></i> 보기</button>')[0].outerHTML;
					}
				},
				{ text: 'Index 정보', datafield: 'idx_info', cellsalign:'center', width:'10%',
					cellsrenderer: function (row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link"><i class="icon-drive"></i> 보기</button>')[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'collector_id' || event.args.datafield === 'collector_nm'){
				var collectorId = event.args.row.bounddata.collector_id;
				viewDetail(mCfg.urlForm +'?collector_id='+collectorId);
			}
			
			if(event.args.datafield === 'parser_info'){
				var collectorIp = event.args.row.bounddata.collector_ip;
				viewParserInfoPopup(collectorIp);
			}
			
			if(event.args.datafield === 'idx_info'){
				var collectorIp = event.args.row.bounddata.collector_ip;
				viewIndexInfoPopup(collectorIp);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:450, height:210,		//모달 사이즈 옵션으로 조절 가능
			//draggable : true,				// draggable 선택 가능(기본 값 : false)
			onClose : function(){
				refresh();
			}
		});
	},

	viewParserInfoPopup = function(cip) {
		var strUrl = gParserInfoUrl.replace(/@{COLLECTOR_IP}/, cip);
		var $viewForm = $("#viewForm");
		
		if($viewForm.length == 0){
			$viewForm = $('<form id="viewForm">');
			$viewForm.append('<input type="hidden" name="str_url">');
			$viewForm.append('<input type="hidden" name="svr_type" value="Collector">');
			$("body").append($viewForm);
		}
		
		$("[name=str_url]", $viewForm).val(strUrl);	
		
		$viewForm.attr({
			action : mCfg.urlInfo
		}).submit();
	},
	
	viewIndexInfoPopup = function(cip) {
		var strUrl = gSearcherUrl.replace(/@{COLLECTOR_IP}/, cip) + "/index_list";
		var $viewForm = $("#viewForm");
		
		if($viewForm.length == 0){
			$viewForm = $('<form id="viewForm">');
			$viewForm.append('<input type="hidden" name="str_url">');
			$viewForm.append('<input type="hidden" name="svr_type" value="Collector">');
			$("body").append($viewForm);
		}
		
		$("[name=str_url]", $viewForm).val(strUrl);
		
		$viewForm.attr({
			action : mCfg.urlInfo
		}).submit();
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.collector.list.init();

	//우측 상단 설정 버튼
	$("#btnPatchManager").togglePage(gCONTEXT_PATH + "management/pms_list.html");
//	$("#btnPatchServerManager").togglePage(gCONTEXT_PATH + "management/pms_server_list.do");
});