'use strict';
_SL.nmspc("sms").list = function() {
	// Config 정의
	var
	onloadValue = {
			s_eqp_type_cd : '', 
			s_eqp_ip : '' 
	},
	
	mCfg = {
		urlList : gCONTEXT_PATH + 'event/sms_event_list.json',
		urlView : gCONTEXT_PATH + 'monitoring/performance_view.html',
		urlUpdate : gCONTEXT_PATH + 'event/sms_event_update.json',
		urlLoadEqpType : gCONTEXT_PATH + 'common/eqp_type_use_list.json',
		urlLoadEqp : gCONTEXT_PATH + 'common/equipment_list.json',
		gridId : '#gridSmsEventList',
		formId : '#searchSmsEventList',
		progBarId : '#view_dlg_progressBar'
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId),
		progBar : $(mCfg.progBarId)
	},
	
	init = function(){	
		// 초기 화면 구성
		drawGrid(m$.grid);

		m$.form.find('.form-submit').off().on('click',function(){
			
			if(m$.form.find('[name=s_eqp_ip]').val() == '' && m$.form.find('[name=s_eqp_type_cd]').val() != '') return _alert("장비IP를 선택하세요");
			
			if(!_SL.validate(m$.form))
				return;
			
			refresh();
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
		

		// 이벤트 Binding
		bindEvent();
		
		// 장비분류 change 이벤트 설정
		m$.form.find("[name=s_eqp_type_cd]").change(loadEqp);
		
		loadEqpType();
	},
	
	bindEvent = function() {

		var $btnProcess = m$.grid.parent().siblings('.grid-bottom').find('.btn-handling');
		
		$btnProcess.off().on('click', function(){
			var selectedRowIndex = m$.grid.jqxGrid('selectedrowindexes');
			var checkedLen = selectedRowIndex.length;
			var displayobj = m$.grid.jqxGrid('getdisplayrows');
			var dispalyobjLen = displayobj.length;
			var processType = $(this).attr("data-handle-type");
			var processText = $(this).text();
			
			if(checkedLen < 1){
				_alert(processText + "할 이벤트를 체크해주세요.");
				return;
			}
			else
			{
				
				_confirm("이벤트를 " + processText + " 하시겠습니까?",{
					onAgree : function(){
					
						var cnt = 0;
						
						for(var i = 0; i < checkedLen; i++){
							if(i == dispalyobjLen) return refresh();
							var checkedObj = displayobj[selectedRowIndex[i]];	
							var eqpTime = _SL.formatDate(checkedObj.eqp_time, 'yyyy-MM-dd HH-mm', 'yyyyMMddHHmm');
							var key = checkedObj.eqp_dt+","+checkedObj.eqp_ip+","+processType;
							$('body').requestData(mCfg.urlUpdate, {key:key}, {
								callback : function(rsData){
									cnt++;	
									if(cnt == checkedLen)
								    {
										refresh();
									}
								}
							});			
							
						}
					}
				});
			}	
		});
	},
	
	drawGrid = function($grid){
		var gridSource = {
			datatype: "json",
			datafields: [
				{ name: "eqp_time", type: "string"},
				{ name: "eqp_ip", type: "string"},
				{ name: "eqp_type_cd", type: "string"},
				{ name: "eqp_nm", type: "string"},
				{ name: "cpu_status", type: "string"},
				{ name: "cpu_used", type: "string"},
				{ name: "cpu_limit", type: "string"},
				{ name: "cpu_level", type: "string"},
				{ name: "mem_status", type: "string"},
				{ name: "mem_used", type: "string"},
				{ name: "mem_limit", type: "string"},
				{ name: "mem_level", type: "string"},		
				{ name: "io_read_status", type: "string"},
				{ name: "read_bytes", type: "string"},
				{ name: "io_read_limit", type: "string"},
				{ name: "io_read_level", type: "string"},	
				{ name: "io_write_status", type: "string"},
				{ name: "write_bytes", type: "string"},
				{ name: "io_write_limit", type: "string"},
				{ name: "io_write_level", type: "string"},
				{ name: "net_rx_status", type: "string"},
				{ name: "rx_bytes", type: "string"},
				{ name: "net_rx_limit", type: "string"},
				{ name: "net_rx_level", type: "string"},
				{ name: "net_tx_status", type: "string"},
				{ name: "tx_bytes", type: "string"},
				{ name: "net_tx_limit", type: "string"},
				{ name: "net_tx_level", type: "string"},
				{ name: "handling_type_cd", type: "string"}
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
				_SL.formatNumber.Options.decimals = 1;
				
				for (var i in rows) {
					rows[i].eqp_dt = rows[i].eqp_time	
					rows[i].eqp_time = _SL.formatDate(rows[i].eqp_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');	
					rows[i].mem_limit = _SL.formatNumber(rows[i].mem_limit);
					rows[i].mem_used = _SL.formatNumber(rows[i].mem_used);
					rows[i].io_read_limit = _SL.formatNumber(rows[i].io_read_limit);
					rows[i].read_bytes = _SL.formatNumber(rows[i].read_bytes);
					rows[i].io_write_limit = _SL.formatNumber(rows[i].io_write_limit);
					rows[i].write_bytes = _SL.formatNumber(rows[i].write_bytes);
					rows[i].net_rx_limit = _SL.formatNumber(rows[i].net_rx_limit);
					rows[i].rx_bytes = _SL.formatNumber(rows[i].rx_bytes);
					rows[i].net_tx_limit = _SL.formatNumber(rows[i].net_tx_limit);
					rows[i].tx_bytes = _SL.formatNumber(rows[i].tx_bytes);
					
					switch(rows[i].handling_type_cd){
					case '0' : rows[i].handling_type_cd = '미처리'
						break;
					case '1' : rows[i].handling_type_cd = '처리'
						break;
					case '2' : rows[i].handling_type_cd = '참고'
						break;
					case '3' : rows[i].handling_type_cd = '이관'
						break;
					case '4' : rows[i].handling_type_cd = '중복'
						break;
					case '5' : rows[i].handling_type_cd = '예외'
						break;
					default  : rows[i].handling_type_cd = '-'
						break;
					}
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
				_alert(error);
			}
		});

		var icon_normal = '<span class="label-info">정상</span>',
		 	icon_abnormal_low = '<span class="label-attention">비정상 Low</span>',
		 	icon_abnormal_middle = '<span class="label-warning">비정상 Middle</span>',
		 	icon_abnormal_high = '<span class="label-danger">비정상 High</span>';
		$grid.jqxGrid({
			source: dataadapter,
		//	sortable: true,
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
				{ text: '만료일자', datafield: 'eqp_time', cellsalign:'center' },
				{ 	text: '장비명[IP]', datafield: 'eqp_nm', cellsalign:'center',
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link" data-type-cd="'+rowdata.eqp_dt+','+rowdata.eqp_type_cd+','+rowdata.eqp_ip+'">'+value+'['+rowdata.eqp_ip+']</button>')[0].outerHTML;
					}
				},
				{ text:'CPU(%)<br>측정값/임계치', datafield: 'cpu_status', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.cpu_used+' / '+rowdata.cpu_limit+']')[0].outerHTML;
					}
				},
				{ text: 'Memory(%)<br>측정값/임계치', datafield: 'mem_status', cellsalign:'center', width:'12%',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.mem_used+' / '+rowdata.mem_limit+']')[0].outerHTML;
					}
				},
				{ text: 'Read', datafield: 'io_read_status', width:"10%", cellsalign:'center', columngroup: 'disk_mbps',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.read_bytes+' / '+rowdata.io_read_limit+']')[0].outerHTML;
					}
				},
				{ text: 'Write', datafield: 'io_write_status', width:"10%", cellsalign:'center', columngroup: 'disk_mbps',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.write_bytes+' / '+rowdata.io_write_limit+']')[0].outerHTML;
					}
				},
				{ text: 'Inbound', datafield: 'net_rx_status', width:"10%", cellsalign:'center', columngroup: 'netw_mbps',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.rx_bytes+' / '+rowdata.net_rx_limit+']')[0].outerHTML;
					}
				},
				{ text: 'Outbound', datafield: 'net_tx_status', width:"10%", cellsalign:'center', columngroup: 'netw_mbps',
					cellsrenderer: function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
						if(value === "0") var icon = icon_normal;
						else if(value === "1") var icon = icon_abnormal_low;
						else if(value === "2") var icon = icon_abnormal_middle;
						else if(value === "3") var icon = icon_abnormal_high;
						return $(defaulthtml).html(icon + ' [' + rowdata.tx_bytes+' / '+rowdata.net_tx_limit+']')[0].outerHTML;
					}
				},
				{ text: '상태', datafield: 'handling_type_cd', cellsalign:'center'}
			],
			columngroups: [
				{ text: 'Disk(MBps)', align: 'center', name: 'disk_mbps' },
				{ text: 'Network(MBps)', align: 'center', name: 'netw_mbps' }
			]
		});

		$grid.on("cellclick", function (event){
			
			if(event.args.datafield === 'eqp_nm'){
				var eqpIp = event.args.row.bounddata.eqp_ip;
				var eqpType = event.args.row.bounddata.eqp_type_cd;
				var endTime = _SL.formatDate.addMin(event.args.row.bounddata.eqp_dt, 1);
				var startTime = _SL.formatDate.addMin(endTime, -30);
				viewDetail(mCfg.urlView +'?s_eqp_type_cd='+eqpType + '&s_eqp_ip='+eqpIp + '&start_time='+startTime + '&end_time='+endTime);
			}

		});
	},

	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
		m$.grid.jqxGrid("clearselection");
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:1000, height:820,
			setScroll:true,
			onClose : function(){
				refresh();
			}
		});
	},

	loadEqpType = function(){
		$('body').requestData(mCfg.urlLoadEqpType, {}, {
			callback : function(rsData){
				
				var obj = m$.form.find('[name=s_eqp_type_cd]');
				
				$.each(rsData.eqp_type_list, function(){
					obj.append('<option value="'+this.eqp_type_cd+'">'+this.eqp_type_nm+'</option>');
				});

				if(onloadValue.s_eqp_type_cd != ''){
					obj.value = onloadValue.s_eqp_type_cd;
					onloadValue.s_eqp_type_cd = '';
					loadEqp();
				}

				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
	},
	
	loadEqp = function(){
		var selValue = m$.form.find('[name=s_eqp_type_cd]').val();
		m$.form.find('[name=s_eqp_ip]').children().remove();
		m$.form.find('[name=s_eqp_ip]').html("<option value=''>[ 선택하세요 ]</option>");
		if(selValue == null) selValue = "";
		if(selValue == "") return;
		$('body').requestData(mCfg.urlLoadEqp, {s_eqp_type_cd : selValue}, {
			callback : function(rsData){
				var obj = m$.form.find('[name=s_eqp_ip]');
				$.each(rsData.eqp_list, function(){
					obj.append("<option value='"+this.eqp_ip+"'>"+this.eqp_nm + "(" + this.eqp_ip + ")</option>");
				});

				if(onloadValue.s_eqp_ip != ''){
					obj.value = onloadValue.s_eqp_ip;
					onloadValue.s_eqp_ip = '';
				}

				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
		
	}
	
	return {
		init: init
	};
}();


$(function(){
	slapp.sms.list.init();
	
	//성능임계치설정
	$("#btnSettingPerfomLimit").togglePage(gCONTEXT_PATH + "event/performance_limit_list.html");
});