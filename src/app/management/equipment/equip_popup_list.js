'use strict';

_SL.nmspc("parser").eqpPopupList = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'management/equip_popup_list.json',
		formId : '#searchEquipPopupList',
		gridId : '#gridEquipPopupList',
		gridBottomId : '.grid-bottom',
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		gridBottom : $(mCfg.gridBottomId)
	},
	
	param = {
		data : {} 	
	},
	
	getParam = function() {
		return param.data;
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		
		m$.form.find('[name=s_eqp_type_cd]').chosen({search_contains : true});
		
		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
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
				{ text: '장비명', datafield: 'eqp_nm', width:200,
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '장비종류', datafield: 'eqp_type_nm', width:200, cellsalign:'center'},
				{ text: '장비 IP', datafield: 'eqp_ip', width:130, cellsalign:'center'},
				{ text: 'Agent IP', datafield: 'agent_ip', width:130, cellsalign:'center'},
				{ text: '파서명', datafield: 'psr_nm', cellsalign:'center', width:200},
				{ text: '로그파서', datafield: 'log_type_psr_info', width:120, cellsalign:'center'},
				{ text: '수집상태', datafield: 'collect_yn', width:120, cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value == "Y") 
							return $(defaulthtml).html('<span class="label-success">수집</span>')[0].outerHTML;
						else if(value == "N")
							return $(defaulthtml).html('<span class="label-danger">미수집</span>')[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'eqp_nm'){
				param.data = event.args.row.bounddata;
				m$.gridBottom.find("[data-layer-close=true]").click();
			}
		});
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	};
	
	return {
		init : init,
		getParam : getParam
	};

}();

$(function(){
	slapp.parser.eqpPopupList.init();
});