//# sourceURL=restore_schedule_list.js
'use strict';

_SL.nmspc("resmanager").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'system/restore_schedule_list.json',
		urlForm : gCONTEXT_PATH + 'system/restore_schedule_form.html',
		urlDelete : gCONTEXT_PATH + 'system/restore_schedule_delete.do',
		urlRetry : gCONTEXT_PATH + 'system/restore_schedule_retry.do',
		
		formId : '#searchResManager',
		gridId : '#gridResManager',
		dialogId : '#retry_msg_dlg',
		dialogFormId : '#formRetryDlg'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		dialog : $(mCfg.dialogId),
		dialogForm : $(mCfg.dialogFormId)
	},
	
	init = function() {
		var $btnAdd = m$.grid.parent().siblings('.grid-bottom').find('.btn-add');
		var $btnDelete = m$.grid.parent().siblings('.grid-bottom').find('.btn-delete');
		
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
		
		$btnDelete.off().on('click', function(){
			var	delList = [];
			
			var selectedrowindex = $.map(m$.grid.find("[name=chk_idx]"), function(o) {
				if (o.checked) return o.value;
			});
			
			var displayobj = m$.grid.jqxGrid('getdisplayrows');
			var idxs = [];
			var data;

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
					
					var param = {
							request_id : rowData.request_id,
							restore_dt : _SL.formatDate(rowData.restore_dt, 'yyyy-MM-dd HH:mm', 'yyyyMMddHH')
					};
					
					delList.push(param);
				}
				
				onDelete(delList);
			}
			else {
				_alert("선택 된 데이터가 없습니다.");
			}
		});
		
		m$.dialog.jqxWindow({
			height: 150, width: 400, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5,
			cancelButton : m$.dialog.find('[data-button-cancel=true]')
		});
		
		// 복원 재시도
		m$.dialog.find('.btn-retry').on('click', onRetry);
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "request_id", type: "string"},
				{ name: "restore_dt", type: "string"},
				{ name: "status", type: "string"},
				{ name: "reg_dt", type: "string"},
				{ name: "user_id", type: "string"},
				{ name: "collector_id", type: "string"},
				{ name: "message", type: "string"},
				{ name: "collector_nm", type: "string"},
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
					var del_id = rows[i].request_id;
					if(!!rows[i].restore_dt) {
						del_id += '||'+rows[i].restore_dt;
						rows[i].restore_dt = _SL.formatDate(rows[i].restore_dt, 'yyyyMMddHH', 'yyyy-MM-dd HH:mm');
					}
					if(!!rows[i].reg_dt) {
						rows[i].reg_dt = _SL.formatDate(rows[i].reg_dt, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm');
					}
					
					rows[i].del_id = del_id;
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
				{ text: 'DelId',datafield: 'del_id', hidden:true ,cellsrenderer: 
					function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return rowdata.del_id;
					}
				},
				{ text: 'Collector', datafield: 'collector_nm'},
				{ text: '복원일시', datafield: 'restore_dt', width:'20%', cellsalign:'center'},
				{ text: '등록일', datafield: 'reg_dt', width:'20%', cellsalign:'center'},
				{ text: '상태', datafield: 'status', width:'10%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
					 var strValue;
						switch(value){
						case 0:
							strValue = '<button type="button" class="btn-link">요청</button>';
							break;
						case 1:
							strValue = "진행";
							break;
						case 2:
							strValue = "완료";
							break;
						case -1:
							strValue = '<button type="button" class="btn-link">오류</button>';
							break;
						}
						return $(defaulthtml).html(strValue)[0].outerHTML;  
					}
				},
				{ text: '', sortable: false, width:50, cellsalign:'center',
					renderer: function () {
                        return '<div style="margin-left: 11px; margin-top: 5px;"></div>';
                    },
			        
					rendered: function (element) {
						$(element).jqxCheckBox({ width: 30, height: 16, animationShowDelay: 0, animationHideDelay: 0 });
						
                        $(element).bind('change', function (event) {
			                  m$.grid.find('[name=chk_idx]').prop("checked", event.args.checked);
						});
					},
					
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(rowdata.status == 0 || rowdata.status == -1)
							return $(defaulthtml).html('<input type="checkbox" name="chk_idx" value="'+ rowdata.boundindex +'" class="form-transform"><span class="form-clone"></span>')[0].outerHTML;
					}
				}
			]
		});

		$grid.on("cellclick", function (event){
			var 
				dataField = event.args.datafield,
				val = event.args.value,
				data = event.args.row.bounddata;
			
			if(dataField === 'status'){
				if(val == 0)
					restoreRetry(data.request_id,data.restore_dt,data.collector_id,'');
				else if(val == -1)
					restoreRetry(data.request_id,data.restore_dt,data.collector_id,data.message);
			}
		});
	},

	restoreRetry = function(request_id, restore_dt, collector_id, message){
		
		m$.dialog.find("[name=request_id]").val(request_id);
		m$.dialog.find("[name=restore_dt]").val(restore_dt);
		m$.dialog.find("[name=collector_id]").val(collector_id);		
		m$.dialog.find("[name=retry_message]").val(message);

		m$.dialog.jqxWindow('open');
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
			width:520, height:210,		//모달 사이즈 옵션으로 조절 가능
			onClose : function(){
				refresh();
			}
		});
	},
	
	onDelete = function(delList){

		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {restore_ids:delList}, {
					callback : function(rsData){
						refresh();
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
	slapp.resmanager.list.init();
});