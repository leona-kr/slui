'use strict';

_SL.nmspc("asset").list = function(){

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'system/asset_list.json',
		urlForm : gCONTEXT_PATH + 'system/asset_form.html',
		urlDownload : gCONTEXT_PATH + 'system/asset_export.do',
		urlEqpJson : gCONTEXT_PATH + "system/eqp_codes.json",
		formId : '#searchAssetList',
		gridId : '#gridAssetList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnDownload = m$.form.find('.btn-download');
		
		// 장비 종류 SelectBox Load
		m$.form.find('[name=s_eqp_type_cd]').chosen({search_contains : true});
		
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
				{ name: "asset_id", type: "string"},
				{ name: "open_time", type: "string"},
				{ name: "asset_nm", type: "string"},
				{ name: "add_route", type: "string"},
				{ name: "ip_type", type: "string"},
				{ name: "ip_cnt", type: "string"},
				{ name: "group_cd", type: "string"},
				{ name: "group_nm", type: "string"},
				{ name: "eqp_type_cd", type: "string"},
				{ name: "eqp_type_nm", type: "string"},
				{ name: "sip", type: "string"},
				{ name: "eip", type: "string"},
				{ name: "weight", type: "string"},
				{ name: "weak_score", type: "string"},
				{ name: "os", type: "string"},
				{ name: "manager", type: "string"},
				{ name: "grade", type: "string"},
				{ name: "division", type: "string"},
				{ name: "department", type: "string"},
				{ name: "comments", type: "string"},
				{ name: "proc_id", type: "string"},
				{ name: "proc_ip", type: "string"},
				{ name: "proc_dt", type: "string"},
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
				{ text: '그룹', datafield: 'group_nm', cellsalign:'center', width:'15%'},
				{ text: '자산명', datafield: 'asset_nm', 
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '자산 IP', datafield: 'sip', width:'20%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strVal = rowdata.sip;

						//툴팁 문자열
						var strToolTip = '[시작IP ~ 종료IP]';	
						for(var idx in assetIpList){
							if(rowdata.asset_id == assetIpList[idx].asset_id)
								strToolTip += '<br/>'+assetIpList[idx].sip + ' ~ ' + assetIpList[idx].eip;
						}
						
						//Text 문자열
						if(rowdata.sip != rowdata.eip) 
							strVal = rowdata.sip + ' - ' + rowdata.eip ;
						
						if(rowdata.ip_cnt != 0)
							strVal += '외 ' + rowdata.ip_cnt + ' 건';
						
						return  $(defaulthtml).html('<label class="hasTooltip" data-value="'+ strToolTip +'">'+strVal+'</label>')[0].outerHTML;
					}
				},
				{ text: '종류', datafield: 'eqp_type_nm', cellsalign:'center', width:'20%'},
				{ text: '중요도', datafield: 'weight', width:'10%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strVal = '',
							strAttr = '';
						
						switch(value){
						case 1 : 
							strVal = 'Low';
							strAttr = 'label-success';
							break;
						case 2 : 
							strVal = 'Middle';
							strAttr = 'label-attention';
							break;
						case 3 : 
							strVal = 'High';
							strAttr = 'label-danger';
							break;
						}
						
						return  $(defaulthtml).html('<span class="'+strAttr+'" style="margin-left:4px;">'+strVal+'</span>')[0].outerHTML;
					}
				},
				{ text: '취약점', datafield: 'weak_score', width:'10%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strVal = '',
							strAttr = '';
						
						switch(value){
						case 1 : 
							strVal = 'Low';
							strAttr = 'label-success';
							break;
						case 2 : 
							strVal = 'Middle';
							strAttr = 'label-attention';
							break;
						case 3 : 
							strVal = 'High';
							strAttr = 'label-danger';
							break;
						}
						
						return  $(defaulthtml).html('<span class="'+strAttr+'" style="margin-left:4px;">'+strVal+'</span>')[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'asset_nm'){
				var assetid = event.args.row.bounddata.asset_id;
				viewDetail(mCfg.urlForm +'?asset_id='+assetid);
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
			width:850, height:610,
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
	slapp.asset.list.init();
});