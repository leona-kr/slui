'use strict';

_SL.nmspc("performance").list = function() {
	
	var
	mCfg = {
		urlList 		: gCONTEXT_PATH + 'monitoring/performance_list.json',
		urlLoadEqp 		: gCONTEXT_PATH + 'common/equipment_list.json',
		urlView			: gCONTEXT_PATH + 'monitoring/performance_view.html',
		gridId 			: '#gridPerformInfoList',
		formId			: '#searchPerformList'
	},
	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		eqpIp 	: $(mCfg.formId + ' [name=s_eqp_ip]'),
		eqpIp2 	: $(mCfg.formId + ' [name=s_eqp_ip2]'),
		eqpNm 	: $(mCfg.formId + ' [name=s_eqp_nm]'),
		eqpTyp 	: $(mCfg.formId + ' [name=s_eqp_type_cd]')
	},
	
	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// 이벤트 Binding
		bindEvent();
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
			    { name: "eqp_ip", type: "string"},
	 			{ name: "eqp_type_cd", type: "string"},
	 			{ name: "eqp_nm", type: "string"},
	 			{ name: "eqp_time", type: "string"},
	 			{ name: "cpu_low", type: "string"},
	 			{ name: "mem_low", type: "string"},
	 			{ name: "trs_io_read", type: "string"},
	 			{ name: "trs_io_write", type: "string"},
	 			{ name: "trs_net_tx", type: "string"},
	 			{ name: "trs_net_rx", type: "string"},
	 			{ name: "cpu_status", type: "string"},
	 			{ name: "mem_status", type: "string"},
	 			{ name: "io_read_status", type: "string"},
	 			{ name: "io_write_status", type: "string"},
	 			{ name: "net_rx_status", type: "string"},
	 			{ name: "net_tx_status", type: "string"},
	 			{ name: "cpu_used", type: "string"},
	 			{ name: "mem_used", type: "string"},
	 			{ name: "read_bytes", type: "string"},
	 			{ name: "write_bytes", type: "string"},
	 			{ name: "rx_bytes", type: "string"},
	 			{ name: "tx_bytes", type: "string"}
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
					rows[i].cpu_low = rows[i].cpu_low == null ? "-" : rows[i].cpu_low;
					rows[i].cpu_used = rows[i].cpu_used == null ? "-" : rows[i].cpu_used;
					rows[i].mem_low = rows[i].mem_low == null ? "-" : rows[i].mem_low;
					rows[i].mem_used = rows[i].mem_used == null ? "-" : rows[i].mem_used;
					rows[i].read_bytes = rows[i].read_bytes == null ? "-" : _SL.formatNumber(rows[i].read_bytes/(1024*1024));
					rows[i].write_bytes = rows[i].write_bytes == null ? "-" : _SL.formatNumber(rows[i].write_bytes/(1024*1024));
					rows[i].rx_bytes = rows[i].rx_bytes == null ? "-" : _SL.formatNumber(rows[i].rx_bytes/(1024*1024));
					rows[i].tx_bytes = rows[i].tx_bytes == null ? "-" : _SL.formatNumber(rows[i].tx_bytes/(1024*1024));
					rows[i].trs_io_read = rows[i].trs_io_read == null ? "-" : _SL.formatNumber(rows[i].trs_io_read/(1024*1024));
					rows[i].trs_io_write = rows[i].trs_io_write == null ? "-" : _SL.formatNumber(rows[i].trs_io_write/(1024*1024));
					rows[i].trs_net_rx = rows[i].trs_net_rx == null ? "-" : _SL.formatNumber(rows[i].trs_net_rx/(1024*1024));
					rows[i].trs_net_tx = rows[i].trs_net_tx == null ? "-" : _SL.formatNumber(rows[i].trs_net_tx/(1024*1024));
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
			loadError: function(xhr, status, error){
				_alert(error);
			}
		});
		
		var icon_normal = '<span class="label-info">정상</span>',
	 	icon_abnormal_low = '<span class="label-attention">비정상 Low</span>',
	 	icon_abnormal_middle = '<span class="label-warning">비정상 Middle</span>',
	 	icon_abnormal_high = '<span class="label-danger">비정상 High</span>';
		$grid.jqxGrid({
			source: dataadapter,
//			sortable: false,
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
				{ text: '장비명[IP]', datafield: 'eqp_nm', width:'25%', cellsalign:'center',
					cellsrenderer : function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return '<div class="jqx-grid-cell-middle-align" style="margin-top: 4px;"><button type="button" class="btn-link" data-type-cd="'+rowdata.s_eqp_type_cd+'">'+value+'['+rowdata.eqp_ip+']</button></div>';
					}
				},
				{ text:'CPU(%)<br>측정값/임계치', datafield: 'cpu_status', width:'12%', cellsalign:'center',
					rendered: function(columnHeaderElement) {
						columnHeaderElement.css("margin-top","16px");
					},
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.cpu_used+' / '+rowdata.cpu_low+']')[0].outerHTML;
					}
				},
				{ text: 'Memory(%)<br>측정값/임계치', datafield: 'mem_status', width:'12%', cellsalign:'center',
					rendered: function(columnHeaderElement) {
						columnHeaderElement.css("margin-top","16px");
					},
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.mem_used+' / '+rowdata.mem_low+']')[0].outerHTML;
					}
				},
				{ text: 'Read', datafield: 'io_read_status', columngroup: 'disk_mbps', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.read_bytes+' / '+rowdata.trs_io_read+']')[0].outerHTML;
					}
				},
				{ text: 'Write', datafield: 'io_write_status', columngroup: 'disk_mbps', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.write_bytes+' / '+rowdata.trs_io_write+']')[0].outerHTML;
					}
				},
				{ text: 'Inbound', datafield: 'net_rx_status', columngroup: 'netw_mbps', width:'12%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.rx_bytes+' / '+rowdata.trs_net_rx+']')[0].outerHTML;
					}
				},
				{ text: 'Outbound', datafield: 'net_tx_status', columngroup: 'netw_mbps', cellsalign: 'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.tx_bytes+' / '+rowdata.trs_net_tx+']')[0].outerHTML;
					}
				}
			],
			columngroups: [
				{ text: 'Disk(MBps)', align: 'center', name: 'disk_mbps' },
				{ text: 'Network(MBps)', align: 'center', name: 'netw_mbps' }
			]
		});
		
		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'eqp_nm'){
				var data = event.args.row.bounddata;
				var eqpIp = data.eqp_ip;
				var eqpType = data.eqp_type_cd;
				var eqpTime = data.eqp_time;
				var endTime = _SL.formatDate.addMin(data.eqp_time, 1);
				var startTime = _SL.formatDate.addMin(endTime, -30);
				
				viewDetail(mCfg.urlView +'?s_eqp_type_cd='+eqpType + '&s_eqp_ip='+eqpIp + '&start_time='+startTime + '&end_time='+endTime);
			}

		});
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:1000,
			height:820,
			setScroll : true,
			onClose : function(){
				refresh();
			}
		});
	},
	
	bindEvent = function() {
		// 이벤트 설정 (검색버튼)
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form)) return;
			refresh();
		});
		
		loadEqp();
		// 장비분류 change 이벤트 설정
		$("[name=s_eqp_type_cd]").change(function() {
			loadEqp();
		});
	},
	
	loadEqp = function() {
		var eqpTyp = m$.eqpTyp.val();
		var obj = m$.form.find("[name=s_eqp_ip]").html('<option value="">[선택하세요]</option>');
		
		if(eqpTyp == "") {
			return;
		}
		else {
			var rqData = {'s_eqp_type_cd' : eqpTyp};
			var callbackEqp = function(rsMap){
				var eqpList = rsMap.eqp_list;
				for(var i in eqpList) {
					var eqpIp = eqpList[i].eqp_ip;
					var eqpNm = eqpList[i].eqp_nm;
					m$.eqpIp.append('<option value="'+eqpIp+'">'+eqpNm+'('+eqpIp+')'+'</option>');
				}
				slui.attach.setTransformSelect(mCfg.formId);
			};

			$('body').requestData(mCfg.urlLoadEqp, rqData, {callback : callbackEqp});
		}
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	}
	
	return {
		init : init
	};
	
}();

$(function(){
	slapp.performance.list.init();
});
