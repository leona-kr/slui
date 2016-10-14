//# sourceURL=index_rebuild_list.js
'use strict';

_SL.nmspc("resmanager").rebuild = function() {

	var
	requestIdArr = [],
	btnStop = '.btn-stop',
	btnRetry = '.btn-retry',
	mCfg = {
		urlList : gCONTEXT_PATH + 'system/index_rebuild_list.json',
		urlForm : gCONTEXT_PATH + 'system/index_rebuild_form.html',
		urlRebuildControl : gCONTEXT_PATH + 'system/index_rebild_control.do',
		urlProcPct 	: gCONTEXT_PATH + 'system/index_rebuild_prcs_pct.json',
			
		formId : '#searchIndexRebuildList',
		gridId : '#gridIndexRebuild',
		dialogFormId : '#formRebuildDlg'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		dialogForm : $(mCfg.dialogFormId)
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
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;
			if (setMin == 0) return;
			
			var setDateUI = function( $obj, _value ){
				var $select = $obj.siblings('.tform-select');
				$select.find('.tform-select-t').text(_value).end()
					.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
				$obj.val(_value);
			}

			var startTime = _SL.formatDate.addMin(m$.form.find("[name=endDay]").val() + m$.form.find("[name=endHour]").val() + m$.form.find("[name=endMin]").val(), -setMin);
			setDateUI(m$.form.find("[name=startDay]"),startTime.substring(0,8));
			setDateUI(m$.form.find("[name=startHour]"),startTime.substring(8,10));
			setDateUI(m$.form.find("[name=startMin]"),startTime.substring(10,12));
		});
		
		// Date,Time change 이벤트 설정
		m$.form.find("[name=startDay],[name=startHour],[name=startMin],[name=endDay],[name=endHour],[name=endMin]").change(function(){
			var $obj = m$.form.find("[name=timeSet]"),
				t = $obj.siblings('.tform-select').find('[data-value=0]').text();
			$obj.val(0)
				.siblings('.tform-select').find('.tform-select-t').text(t);
		});
		
		// 진행상태갱신
		setInterval(renewalProcPct, 10*1000);
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "request_id", type: "string"},
				{ name: "search_keyword", type: "string"},
				{ name: "proc_start_dt", type: "string"},
				{ name: "proc_end_dt", type: "string"},
				{ name: "status", type: "string"},
				{ name: "status_name", type: "string"},		
				{ name: "sleep_ms", type: "string"},
				{ name: "proc_pct", type: "string"},
				{ name: "total_cnt", type: "string"},		
				{ name: "reg_dt", type: "string"},
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
			beforeLoadComplete: function(rows) {
				for (var i in rows) {
					requestIdArr.push(rows[i].request_id);
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
			
			loadComplete : function (a) {
				m$.grid.find('.iconscontainer').remove(); //그리드 헤더의 jqxCheckBox가 클릭이 안되는 상황때문에 sort icon 블럭 제거
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
			selectionmode: 'none',
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
				{ text: '검색어', datafield: 'search_keyword',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '대상기간', datafield: 'proc_start_end_dt', width:'25%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strValue = rowdata.proc_start_dt + " ~ " + rowdata.proc_end_dt
						return $(defaulthtml).html(strValue)[0].outerHTML;  
						}
				},
				{ text: '등록일', datafield: 'reg_dt', width:'18%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var strValue = rowdata.proc_dt
						return $(defaulthtml).html(strValue)[0].outerHTML;  
					}},
				{ text: '진행률', datafield: 'proc_pct', width:'18%', cellsalign:'center',
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var requestId = rowdata.request_id, stopRetry = "", icon = '';
						if(rowdata.status == 0 || rowdata.status == 1){
							stopRetry = "Stop";
							icon = "icon-stop";
						} else if(rowdata.status == 4 || rowdata.status == 9){
							stopRetry = "Retry";
							icon = "icon-spinner";
						}

						var html = '<div id="list_' + requestId + '" style="position:relative;width:100px;height:16px;margin:5px auto;border:1px solid #000;background:#fff;">'
							+ '<div class="prcsPctB" style="position:absolute;left:0;top:0;bottom:0;width:'+value+'%;background-color:#89cf43;"></div>'
							+ '<div class="prcsPctT" style="position:absolute;width:100%;height:100%;text-align:center;color:#000;">'+value+'%</div>'
							if(stopRetry != '') html += '<button type="button" style="left:105px; position:absolute; min-width:auto; vertical-align: top; cursor:pointer; vertical-align:middle;" key='+requestId+' id=buildControl_'+requestId+' class="btn-'+stopRetry+' btn-basic btn-xs" title="'+stopRetry+'"><i class="'+icon+'"></i></button>';
							html += '</div>';
						return html;
					}
				},
				{ text: '상태', datafield: 'status_name', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						var requestId = rowdata.request_id;
						var html ='<span class="'+requestId+'_status">' + value + '</span>';
						
						return $(defaulthtml).html(html)[0].outerHTML;
					}
				}
			]
		});

		$grid.on("cellclick", function (event){
			var requestId = event.args.row.bounddata.request_id;
			var statusNm = $("."+requestId+"_status").text();
			
			if(event.args.datafield === 'search_keyword'){
				if(statusNm == '중지' || statusNm == "오류") viewDetail(mCfg.urlForm+"?request_id="+requestId);
				else if(statusNm == '완료')
					_alert("완료된 상태입니다. 변경할 수 없습니다.");
				else
					_alert("수정은 중지 또는 오류 상태에서 할 수 있습니다.<br>변경 후 다시 시도하세요");
			}
			
			if(event.args.datafield === 'proc_pct'){
				if($(this).find("button").on("click",function(){
					var requestId = event.args.row.bounddata.request_id;
					if(statusNm == "완료") return;
					var actionCode = "";
					($("#buildControl_"+requestId+" i").attr("class") == "icon-stop")? actionCode = "5" : actionCode = "4";
					onStopAndRetry(requestId, actionCode);
				}));
			}
		});
	},

	onStopAndRetry = function(requestId, actionCode){
		if(actionCode == "") return;
		var alertStr = "";
		(actionCode == 4)? alertStr = "재시작을 실행하였습니다." : alertStr = "정지를 실행하였습니다";
		$('body').requestData(mCfg.urlRebuildControl, {request_id : requestId, action_code : actionCode}, {
			callback : function(rsMap, rsCd, rsMsg){
				if(rsMap.RESULT_CODE == "SUCCESS"){
					_alert(alertStr);
				}else if(rsMap.RESULT_CODE == "DUPLICATED"){
					_alert(rsMap.RESULT_MESSAGE);
				}
			},
			displayLoader: true
		});
	},
	
	renewalProcPct = function() {
		if(requestIdArr.length < 1) return;
		
		var 
		rqData = {request_id_arr : requestIdArr},
	
		callback = function(rsJson){
			for(var idx in rsJson){
				var rebuildParam = rsJson[idx];
				var requestId = rebuildParam.request_id;
				var status = rebuildParam.status;
				var pct = rebuildParam.proc_pct;
				var $div = $("#list_"+requestId);
				if(pct +"%" != $div.find(".prcsPctT").text()){
					var stat = rebuildParam.status;						
					$("."+requestId+"_status").text(rebuildParam.status_name);
					$div.find(".prcsPctB").width(pct +"%");
					$div.find(".prcsPctT").text(pct +"%");
				}
				
				var $button = $("#buildControl_"+requestId);
				if(status == '0' || status == '1'){
					$button.attr("title", "Stop").show();
					$("."+requestId+"_status").text(rebuildParam.status_name);
					$button.find("i").removeClass("icon-spinner").addClass("icon-stop");
				}else if(status == '4' || status == '9'){
					$button.attr("title", "Retry").show();
					$("."+requestId+"_status").text(rebuildParam.status_name);
					$button.find("i").removeClass("icon-stop").addClass("icon-spinner");
				}else{
					$("."+requestId+"_status").text(rebuildParam.status_name);
					$button.hide();
				}
			}
		};
	
		$('body').requestData(mCfg.urlProcPct, rqData, {callback : callback});
		
	},
	
	onRetry = function() {
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		$('body').requestData(mCfg.urlRetry, _SL.serializeMap(m$.dialogForm), {
			callback : function(rsData, rsCd, rsMsg){
				var rsCode = rsData.RESULT_CODE;
				switch(rsCode){
					case 'SUCCESS' :
						_alert("데이터 복원을 재시도 하였습니다.", {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					break;
					case 'ERROR' :
						_alert("복원 요청중 오류가 발생하였습니다.<br>다시 시도하세요.");
					break;
					case 'RUNNING' :
						_alert("데이터 복원이 실행 중입니다.");
					break;
					default :
						_alert("복원요청에 실패했습니다.<br>다시 시도하세요.");
					break;
				}
			}
		});		
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:650, height:200,
			onClose : function(){
				refresh();
			}
		});
	}
	
	return {
		init : init
	};

}();

$(function(){
	slapp.resmanager.rebuild.init();
});