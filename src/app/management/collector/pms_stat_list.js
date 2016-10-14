'use strict';

_SL.nmspc("pms").form = function() {

	var
	// Config 정의
	mCfg = {
		gridId   : '#gridPmsStatList',
		formId   : '#searchPmsStatList',
		urlList  : gCONTEXT_PATH + 'management/pms_stat_list.json?s_app_seq=' + appSeq,
		urlForm  : gCONTEXT_PATH + 'management/pms_stat_form.html?s_app_seq=' + appSeq + '&s_evt_type=' + evtType,
		urlRetry : gCONTEXT_PATH + 'management/pms_retry.do'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId)
	},
	
	bindEvent = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnRetry = m$.grid.parent().siblings('.grid-bottom').find('.btn-retry');
		
		m$.form.find('.form-submit').on('click',function(){
			refresh();
		});

		$btnAdd.on('click',function(){
			var modal = new ModalPopup(mCfg.urlForm, {
				width: 900, height: 480,
				draggable : true,
				onClose : function(){
					refresh();
				}
			});
		});
		
		$btnRetry.on('click',function(){
			retry();
		});
		
		// jqxwindow example!!
		$('#windowTest').jqxWindow({
			height: 220, width: 360, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5
		});
	},
	
	init = function(){
		// 초기 화면 구성
		drawGrid( m$.grid );

		// 이벤트 Binding
		bindEvent();
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "key", type: "string"},
				{ name: "server_seq", type: "string"},
				{ name: "status", type: "string"},
				{ name: "del_yn", type: "string"},
				{ name: "server_nm", type: "string"},
				{ name: "server_ip", type: "string"},
				{ name: "status_name", type: "string"},
				{ name: "message", type: "string"},
				{ name: "log", type: "string"},
				{ name: "upd_date_format", type: "string"}
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
					rows[i].upd_date_format = _SL.formatDate(rows[i].upd_date_format, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					
					if(!!rows[i].expire_dt) 
						rows[i].expire_dt = _SL.formatDate(rows[i].expire_dt, 'yyyyMMdd', 'yyyy-MM-dd');
				}
				return rows;
			},
			formatData : function(data) {
				var params = {}, param, flds = m$.form.serializeArray();
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
			selectionmode: 'checkbox',
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
				{ text: '서버명', datafield: 'server_nm', width:'20%'},
				{ text: 'IP', datafield: 'server_ip', cellsalign:'center', width:'12%'},
				{ text: '상태', datafield: 'status_name', cellsalign:'center', width:'10%'},
//				{ text: '메시지', datafield: 'message', cellalign:'center',
//					cellsrenderer: function (row, column, value) {
//						return '<div style="margin-top:7px;text-align:center;"><button type="button" class="btn-link">' + value + '</button></div>';
//					}
//				},
				{ text: '메시지', datafield: 'message'},
				{ text: '패치일', datafield: 'upd_date_format', cellsalign:'center', width:'12%'}
			]
		});
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},
	
	idxs = [],

	retry = function() {
		var process = $(this).data('handle-type');
		var process_text = $(this).text();
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
		
		if(idxs.length < 1){
			_alert("재시도 할 서버를 선택해주세요.");
			return;
		} else {
			_confirm("재시도 하시겠습니까?",{
				onAgree : function(){
					var len = idxs.length;
					var cnt = 0;
					var json = {};
					var datas = [];
					
					for (var i in idxs) {
						var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
						if(!rowData){//체크박스동작관련 임시 소스( 전체 체크후 해제해도 virtual mode로 생성된 idx는 남아있음..)
							refresh();
							break;
						}
						var server_seq = rowData.server_seq;
						datas.push(server_seq);
					}
					
					json = {
						s_app_seq   : appSeq,
						server_seqs : datas.join(",")
					}
					
					$('body').requestData(mCfg.urlRetry, json, {
						callback : function(rsData, rsCd, rsMsg){
							_alert(rsMsg, {
								onAgree : function(){
									refresh();
								}
							});
						}
					});
				}
			});
		}
	}

//	viewDetail = function(seq){
//		var conts = [];
//		var snId = '#sn_' + seq;
//		var siId = '#si_' + seq;
//		var stId = '#st_' + seq;
//		var logId = '#log_' + seq;
//		
//		conts.push("--------------------------------------------<br>");
//		conts.push("서버명 : " + $(snId).html() + "<br>");
//		conts.push("IP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: " + $(siId).html() + "<br>");
//		conts.push("상태&nbsp;&nbsp;&nbsp;: " + $(stId).html() + "<br>");
//		conts.push("--------------------------------------------<br><br>");
//		conts.push($(logId).val());
//		
//		$("#log_dlg #logInfo").html(conts.join(""));
//		$("#log_dlg").dialog("open");
//	}
	
//	viewDetail = function(url){
//		var modal = new ModalPopup(url, {
//			onClose : function(){
//				refresh();
//			}
//		});
//	}

	return {
		init: init
	};
}();


$(function(){
	slapp.pms.form.init();
});