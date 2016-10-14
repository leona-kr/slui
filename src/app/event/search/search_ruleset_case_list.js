//# sourceURL=search_ruleset_case_list.js
'use strict';

_SL.nmspc("searchRuleset").caseList = function() {
	
	var caseIdArr = [];

	var
	mCfg = {
		urlList 	: gCONTEXT_PATH + 'event/search_ruleset_case_list.json',
		urlForm 	: gCONTEXT_PATH + "event/search_ruleset_case_form.html",
		urlAdd		: gCONTEXT_PATH + 'event/search_ruleset_case_add.do',
		urlDelete 	: gCONTEXT_PATH + 'event/search_ruleset_case_delete.do',
		urlProcPct	: gCONTEXT_PATH + 'event/search_ruleset_case_prcs_pct.json',
		urlResult	: gCONTEXT_PATH + 'event/search_ruleset_case_result.html',
		formId 		: '#searchSearchRulesetCase',
		gridId 		: '#gridRulesetCaseList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId)
	},
	
	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);
		
		// 이벤트 Binding
		bindEvent();
		
		// 진행상태갱신
		setInterval(renewalProcPct, 10*1000);
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "case_id", type: "string"},
				{ name: "case_nm", type: "string"},
				{ name: "case_start_time", type: "string"},
				{ name: "case_check_time", type: "string"},
				{ name: "case_end_time", type: "string"},
				{ name: "search_query", type: "string"},
				{ name: "time_type", type: "string"},
				{ name: "times", type: "string"},
				{ name: "group_field", type: "string"},
				{ name: "group_field_nm", type: "string"},
				{ name: "cvt_group_field", type: "string"},
				{ name: "func", type: "string"},
				{ name: "func_field", type: "string"},
				{ name: "limit_count", type: "string"},
				{ name: "distinct_field", type: "string"},
				{ name: "distinct_count", type: "string"},
				{ name: "status", type: "string"},
				{ name: "proc_pct", type: "string"},
				{ name: "proc_dt", type: "string"},
				{ name: "detect_cnt", type: "string"},
				{ name: "str_stat", type: "string"}
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
					caseIdArr.push(rows[i].case_id);
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
				{ text: '검증명', datafield: 'case_nm', width:'25%',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						return $(defaulthtml).html("<button type='button' class='btn-link'>"+value+"</button>")[0].outerHTML;
					}
				},
				{ text: '기준필드', datafield: 'cvt_group_field', cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						return $(defaulthtml).text(value)[0].outerHTML;
					}
				},
				{ text: '임계치', datafield: 'limit_count', cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var distCnt = rowdata.distinct_count;
						var threshold = value;
						
						if(distCnt != "") threshold += "/" + distCnt;
						
						return $(defaulthtml).text(threshold)[0].outerHTML;
					}
				},
				{ text: '검증대상 기간', datafield: 'case_time', cellsalign:'center', width:'23%',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var caseSTime = _SL.formatDate(rowdata.case_start_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
						var caseETime = _SL.formatDate(rowdata.case_end_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
						
						return $(defaulthtml).text(caseSTime + " ~ " + caseETime)[0].outerHTML;
					}
				},
				{ text: '진행률', datafield: 'proc_pct', width:'12%',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var caseId = rowdata.case_id;
						var procDt = rowdata.proc_dt;
						var pct	   = rowdata.proc_pct;
						
						var html = 
						'<div id="' + caseId + '" data-proc_date="' + procDt + '" style="position:relative;width:100px;height:16px;margin:5px auto;border:1px solid #000;background:#fff;">'
							+ '<div class="prcsPctB" style="position:absolute;left:0;top:0;bottom:0;width:'+pct+'%;background-color:#89cf43;"></div>'
							+ '<div class="prcsPctT" style="position:absolute;width:100%;height:100%;text-align:center;color:#000;" >' + value + '%</div>'
						+ '</div>';
						
						return html;
					}
				},
				{ text: '탐지건수', datafield: 'detect_cnt', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml){
						return $(defaulthtml).html('<button type="button" class="btn-link"><span class="detectCnt">' + value + '건</span></button>')[0].outerHTML;
					}
				},
				{ text: '상태', datafield: 'str_stat', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml){
						return $(defaulthtml).html('<span class="mngStatus">' + value + '</span>')[0].outerHTML;
					}
				}
			]
		});
		
		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'case_nm'){
				var classNm = event.args.originalEvent.toElement.className;
				var rData = event.args.row.bounddata;
				var caseId = rData.case_id;
				var stat = rData.status;
				var pageType;
				
				viewDetail(mCfg.urlForm +'?case_id='+caseId+'&status='+stat);
			}
			else if(event.args.datafield === 'detect_cnt') {
				var rData = event.args.row.bounddata;
				
				var caseId = rData.case_id,
					caseSTime = rData.case_start_time,
					caseETime = rData.case_end_time,
					timeType = rData.time_type,
					times = rData.times;
				var url = mCfg.urlResult +'?case_id='+caseId+'&start_time='+caseSTime+'&end_time='+caseETime+'&time_type='+timeType+'&times='+times;
				
				$(this).addModalPage(url);
			}
		});
	},
	
	bindEvent = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnDel = m$.grid.parent().siblings('.grid-bottom').find('.btn-delete');
		
		// 이벤트 설정 (검색버튼)
		m$.form.find('.form-submit').off().on('click',function(){
			refresh();
		});
		
		$btnAdd.off().on('click', function() {
			// 일반이벤트 검증 추가
			viewDetail(mCfg.urlForm);
		});
		
		// 일반이벤트 검증 삭제
		$btnDel.off().on('click', function(){
			var	listCase = [];
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

			if (idxs.length > 0){
				for (var i in idxs) {
					var rowData = m$.grid.jqxGrid('getrowdata', idxs[i]);
					if(!rowData) break; //체크박스동작관련 임시 소스( 전체 체크후 해제해도 virtual mode로 생성된 idx는 남아있음..)
					listCase.push(rowData.case_id);
				}
				delCase(listCase);
			}
			else {
				_alert("선택한 이벤트가 없습니다.");
			}
			
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width : 800,
			height : 550,
			autoScroll: true,
			onClose : function(){
				refresh();
			}
		});
	},
	
	delCase = function(listCase){
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {del_case_list:listCase}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	},
	
	renewalProcPct = function() {
		if(caseIdArr.length < 1) return;
		
		var 
			rqData = {'case_id_arr' : caseIdArr},
		
			callback = function(rsMap){
				for(var idx in rsMap){
					var caseParam = rsMap[idx];
					var caseId = caseParam.case_id;
					var pct = caseParam.proc_pct;
					
					var $tr = m$.grid.find("#"+ caseId);
					var bProcDt = $tr.data("proc_date");
					var pProcDt = caseParam.proc_dt;
					
					if(bProcDt == pProcDt){
						if(pct +"%" != $tr.find(".prcsPctT").text()){
							$(".mngStatus").eq(idx).text(caseParam.str_stat);
							$(".detectCnt").eq(idx).text(caseParam.detect_cnt + "건");
							$(".prcsPctB").eq(idx).width(pct +"%");
							$(".prcsPctT").eq(idx).text(pct +"%");
						}
					}
				}
			};
		
		$('body').requestData(mCfg.urlProcPct, rqData, {callback : callback});
	}

	return {
		init : init
	};
	
}();

$(function(){
	slapp.searchRuleset.caseList.init();
});