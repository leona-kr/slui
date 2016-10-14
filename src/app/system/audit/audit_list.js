'use strict';

_SL.nmspc("audit").list = function() {

	var
	mCfg = {
		urlList : gCONTEXT_PATH + 'system/audit_list.json',
		urlForm : gCONTEXT_PATH + 'management/agent_form.html',
		formId : '#searchAudittList',
		gridId : '#gridAuditList',
		dialogId : '#view_dlg'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		dialog : $(mCfg.dialogId)
	},
	
	init = function() {
		// 초기 화면 구성
		drawGrid(m$.grid);

		// 이벤트 설정
		m$.form.find('.form-submit').off().on('click',function(){
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
		});
		
		m$.form.find('[name=timeSet]').change(function(){
			var setMin = this.value;
			
			if (setMin == 0) {
				return;
			}
			
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
		
		m$.dialog.jqxWindow({
			height: 400, width: 700, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5
		});
	},

	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "user_id", type: "string"},
				{ name: "user_nm", type: "string"},
				{ name: "log_dt", type: "string"},
				{ name: "log_cd", type: "string"},
				{ name: "log_nm", type: "string"},
				{ name: "user_ip", type: "string"},
				{ name: "log_title", type: "string"},
				{ name: "remark", type: "string"},
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
					if(!!rows[i].log_dt) {
						rows[i].log_dt = _SL.formatDate(rows[i].log_dt, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss');
					}
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
				{ text: '발생시간', datafield: 'log_dt', width:'15%', cellsalign:'center'},
				{ text: '제목', datafield: 'log_title',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						return  $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '종류', datafield: 'log_nm', width:'15%', cellsalign:'center'},
				{ text: '사용자', datafield: 'user_id', width:'15%', cellsalign:'center',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						
						var strVal = rowdata.user_id == null ? '-' : rowdata.user_nm+'('+rowdata.user_id+')';
						
						return  $(defaulthtml).html(strVal)[0].outerHTML;
					}
				},
				{ text: '사용자 IP', datafield: 'user_ip', width:'15%', cellsalign:'center'}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'log_title'){
				m$.dialog.find("[name=view_cont]").val(event.args.row.bounddata.remark);
				m$.dialog.jqxWindow('open');
			}
		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.audit.list.init();
});