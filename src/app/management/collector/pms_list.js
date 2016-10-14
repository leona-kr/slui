'use strict';

_SL.nmspc("pms").list = function() {
	
	var
	appSeqArr = [],
	pctArr = [],
	
	mCfg = {
		gridId     : '#gridPmsList',
		formId     : '#searchPmsList',
		urlList    : gCONTEXT_PATH + 'management/pms_list.json',
		urlForm    : gCONTEXT_PATH + 'management/pms_form.html',
		urlInfo    : gCONTEXT_PATH + 'management/pms_stat_list.html',
		urlStat    : gCONTEXT_PATH + 'management/pms_status.json',
		urlDown    : gCONTEXT_PATH + 'management/download_file.do',
		urlCancel  : gCONTEXT_PATH + 'management/pms_cancel.do',
		urlRestore : gCONTEXT_PATH + 'management/pms_restore.do'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId)
	},

	init = function(){
		var $btnAdd = $(mCfg.gridId).parent().siblings('.grid-bottom').find('.btn-add');
		
		drawGrid( m$.grid );

		$(mCfg.formId+' .form-submit').on('click',function(){
			refresh();
		});

		$btnAdd.on('click',function(){
			var modal = new ModalPopup(mCfg.urlForm, {
				width: 900, height: 560,
				onClose : function(){
					refresh();
				}
			});
		});
		
		setInterval(getStatus, 5*1000);
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "reg_date", type: "string"},
				{ name: "subject", type: "string"},
				{ name: "status", type: "string"},
				{ name: "succ_cnt", type: "string"},
				{ name: "err_cnt", type: "string"},
				{ name: "tot_cnt", type: "string"},
				{ name: "cnt_info", type: "string"},
				{ name: "wait_cnt", type: "string"},
				{ name: "backup_cnt", type: "string"},
				{ name: "func", type: "string"},
				{ name: "func_name", type: "string"},
				{ name: "file_name", type: "string"},
				{ name: "app_seq", type: "string"},
				{ name: "pct", type: "string"}
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
				appSeqArr = [];
				pctArr = [];
				
				for (var i in rows) {
					rows[i].reg_date = _SL.formatDate(rows[i].reg_date, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
					rows[i].cnt_info = '<span>'+rows[i].tot_cnt+'</span> / <span class="text-info">'+rows[i].succ_cnt+'</span> / <span class="text-danger">'+rows[i].err_cnt+'</span>';
					
					if (rows[i].wait_cnt > 0) {
						rows[i].func = 'cancel';
						rows[i].func_name = '<button type="button" class="btn-link">취소</button>';
					} else if (rows[i].backup_cnt > 0) {
						rows[i].func = 'restore';
						rows[i].func_name = '<button type="button" class="btn-link">복원</button>';
					} else {
						rows[i].func = '';
						rows[i].func_name = '-';
					}
					
					appSeqArr.push(rows[i].app_seq);
					pctArr.push(rows[i].pct);
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
				{ text: '패치일', datafield: 'reg_date', cellsalign:'center', width:'12%'},
				{ text: '제목', datafield: 'subject', width:'30%',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '진행률', datafield: 'status', cellalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var appSeq = rowdata.app_seq;
						var pct = rowdata.pct;
						
						var html = 
						'<div id="' + appSeq + '" data-proc_date="' + pct + '" style="position:relative;width:100px;height:16px;margin:5px auto;border:1px solid #000;background:#fff;">'
							+ '<div class="prcsPctB" style="position:absolute;left:0;top:0;bottom:0;width: ' + pct + '%;background-color:#89cf43;"></div>'
							+ '<div class="prcsPctT" style="position:absolute;width:100%;height:100%;text-align:center;color:#000;" >' + pct + '%</div>'
						+ '</div>';
						
						return html;
					}
				},
				{ text: '(전체/완료/오류)', datafield: 'cnt_info', cellalign:'center', width:'20%',
					cellsrenderer: function (row, column, value) {
						return '<div style="margin-top:7px;text-align:center;">( '+ value +' )</div>';
					}
				},
				{ text: '동작', datafield: 'func_name', cellalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<div class="text-func" style="text-align:center;">'+ value +'</div>')[0].outerHTML;
					}
				},
				{ text: '패치파일', datafield: 'file_name', cellalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						if (value.length > 0) return $(defaulthtml).html('<div style="text-align:center;"><button type="button" class="btn-link"><i class="icon-drive"></i> download</button></div>')[0].outerHTML;
					}
				}
			]
		});
		
		$grid.on("cellclick", function (event){
			var appSeq = event.args.row.bounddata.app_seq;
			
			if(event.args.datafield === 'subject'){
				$(this).addModalPage(mCfg.urlInfo +'?s_app_seq='+appSeq);
			}
			
			if(event.args.datafield === 'file_name'){
				if (event.args.row.bounddata.file_name != '') {
					m$.form.find("[name=s_app_seq]").val(appSeq);
					m$.form.attr({
						action : mCfg.urlDown
					}).submit();
				}
			}
			
			if(event.args.datafield === 'func_name'){
				//console.log(event.args.row.bounddata.func_name +' : '+event.args.row.bounddata.func +' : '+ appSeq);
				
				if (event.args.row.bounddata.func == 'restore'){
					$('body').requestData(mCfg.urlRestore, {s_app_seq : appSeq}, {
						callback : function(rsData){
							refresh();
						}
					});	
				}
				else if (event.args.row.bounddata.func == 'cancel'){
					$('body').requestData(mCfg.urlCancel, {s_app_seq : appSeq}, {
						callback : function(rsData){
							refresh();
						}
					});	
				}
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},
	
	getStatus = function() {
		if(appSeqArr.length < 1) return;
		
		for (var i = 0; i < appSeqArr.length; i++) {
			if (pctArr[i] < 100) {
				var 
				rqData = {'app_seq_arr' : appSeqArr},
			
				callback = function(rsMap){
					for(var idx in rsMap){
						var statusParam = rsMap[idx];
						var appSeq = statusParam.app_seq;
						var pct = statusParam.pct;
						var errCnt = statusParam.error_cnt;
						var succCnt = statusParam.succ_cnt;
						var waitCnt = statusParam.wait_cnt;
						var backupCnt = statusParam.backup_cnt;
						pctArr.push(pct);
						
						var $tr = m$.grid.find("#"+ appSeq);
						var bProcDt = $tr.data("proc_date");
						
						if(pct +"%" != $tr.find(".prcsPctT").text()){
							$(".prcsPctB").eq(idx).width(pct +"%");
							$(".prcsPctT").eq(idx).text(pct +"%");
							$(".text-info").eq(idx).text(succCnt);
							$(".text-danger").eq(idx).text(errCnt);
							if(waitCnt == 0){
								$(".text-func").eq(idx).text('-');
								if (pct==100 && backupCnt>0) $(".text-func").eq(idx).html('<button type="button" class="btn-link">복원</button>');
							}
						}
					}
				};
				$('body').requestData(mCfg.urlStat, rqData, {callback : callback});
				
				pctArr = [];
				break;
			}
		}
	}

	return {
		init: init
	};
}();


$(function(){
	slapp.pms.list.init();
});