'use strict';

_SL.nmspc("equipment").list = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/equip_list.json',
		urlForm : gCONTEXT_PATH + 'management/equip_form.html',
		urlEqpJson : gCONTEXT_PATH + "system/eqp_codes.json",
		formId : '#searchEquipList',
		gridId : '#gridEquipList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');

		m$.form.find('[name=s_eqp_type_cd]').chosen({search_contains : true });
		
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
				{ name: "eqp_type_cd", type: "string"},
				{ name: "eqp_type_nm", type: "string"},
				{ name: "eqp_id", type: "string"},
				{ name: "eqp_nm", type: "string"},
				{ name: "eqp_ip", type: "string"},
				{ name: "group_cd", type: "string"},
				{ name: "group_nm", type: "string"},
				{ name: "agent_ip", type: "string"},
				{ name: "stat_chk_port", type: "string"},
				{ name: "stat_chk_msg", type: "string"},
				{ name: "threshold_id", type: "string"},
				{ name: "stat_chk_type", type: "string"},
				{ name: "stat_result", type: "string"},
				{ name: "stat_chk_time", type: "string"},
				{ name: "collect_yn", type: "string"},
				{ name: "psr_nm", type: "string"},
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
					text: 'No', columntype: 'number', width:40, cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml) {
						return $(defaulthtml).text(value + 1)[0].outerHTML;
					}
				},
				{ text: '장비명', datafield: 'eqp_nm', width:'20%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '장비종류', datafield: 'eqp_type_nm', width:'10%', cellsalign:'center'},
				{ text: '장비 IP', datafield: 'eqp_ip', width:'10%', cellsalign:'center'},
				{ text: 'Agent IP', datafield: 'agent_ip', width:'10%', cellsalign:'center'},
				{ text: '파서명', datafield: 'psr_nm', cellsalign:'center'},
				{ text: '로그파서', datafield: 'log_type_psr_info', width:'10%', cellsalign:'center'},
				{ text: '수집상태', datafield: 'collect_yn', width:'10%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value == "Y") 
							return $(defaulthtml).html('<span class="label-success">수집</span>')[0].outerHTML;
						else if(value == "N")
							return $(defaulthtml).html('<span class="label-danger">미수집</span>')[0].outerHTML;
					}
				},
				{ text: '상태', datafield: 'stat_result', cellsalign:'center', width:'10%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						if(rowdata.stat_chk_type == '-'){
							return $(defaulthtml).html('-')[0].outerHTML;
						}else{
							if(value == 'normal')
								return $(defaulthtml).html('<span class="label-success">정상</span>')[0].outerHTML;
							else if(value == 'abnormal')
								return $(defaulthtml).html('<span class="label-danger">비정상</span>')[0].outerHTML;
						}
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'eqp_nm'){
				var eqpId = event.args.row.bounddata.eqp_id;
				viewDetail(mCfg.urlForm +'?eqp_id='+eqpId);
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			height:430,
			width : 700,
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
	slapp.equipment.list.init();
	
	//파서관리
	$("#btnParserManagement").togglePage(gCONTEXT_PATH + "management/parser_list.html");
	
	//로그파서관리
	$("#btnLogParserManagement").togglePage(gCONTEXT_PATH + "management/log_parser_manager_list.html");
});