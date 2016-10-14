'use strict';


_SL.nmspc("bigStats").list = function() {

	var
	bigCodeArr = [],
	mCfg = {
		urlView 	: gCONTEXT_PATH + 'analysis/big_stats_view.html',
		urlList		: gCONTEXT_PATH + 'analysis/big_stats_list.json',
		urlProcPct 	: gCONTEXT_PATH + 'analysis/big_stats_prcs_pct.json',

		formId : '#searchBigStatsList',
		gridId : '#gridBigStatsList'
	},
	
	m$ = {
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		bigCode: $(mCfg.formId + ' [name=big_code]')
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
				{ name: "proc_dt", type: "string"},
				{ name: "big_code", type: "string"},
				{ name: "stats_nm", type: "string"},
				{ name: "proc_start_dt", type: "string"},
				{ name: "proc_end_dt", type: "string"},
				{ name: "elapsed_time", type: "string"},
				{ name: "proc_id", type: "string"},
				{ name: "user_nm", type: "string"},
				{ name: "proc_pct", type: "string"},
				{ name: "status", type: "string"},
				{ name: "status_nm", type: "string"}
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
					 rows[i].org_proc_dt = rows[i].proc_dt;
					 rows[i].proc_dt = _SL.formatDate(rows[i].proc_dt, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss');
					 bigCodeArr.push(rows[i].big_code);
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
		
		// tooltip sample
		var tooltiprenderer = function(row, columnfield, value, defaulthtml, columnproperties, rowdata){
			return '<div style="margin-top:7px;text-align:center;" class="hasTooltip">'+'hoho'+'</div>';
		}

		$grid.jqxGrid({
			source: dataadapter,
			sortable: false,
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
				{ text: '등록시간', datafield: 'proc_dt', cellsalign:'center', width:"15%"},
				{ text: '분석명', datafield: 'stats_nm', 
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;
					}
				},
				{ text: '소요시간', datafield: 'elapsed_time', cellsalign:'center', width:"10%",
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var bigCode = rowdata.big_code;
						var html ='<span class="'+bigCode+'_elap_time">' + initElapsedTimeCalc(value) + '</span>';
							
						return $(defaulthtml).html(html)[0].outerHTML;
					}
				},
				{ text: '등록자', datafield: 'proc_id', cellsalign:'center', width:"10%",
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						return $(defaulthtml).html(value + "(" + rowdata.user_nm + ")")[0].outerHTML;
					}					
				
				},
				{ text: '진행상태', datafield: 'proc_pct', cellsalign:'center', width:150,
					cellsrenderer: function (row, column, value, defaulthtml, columnproperties, rowdata) {
						var bigCode = rowdata.big_code;
						var procDt = rowdata.org_proc_dt;
						var html = '<div id="list_' + bigCode + '" data-proc-dt="' + procDt + '" style="position:relative;width:100px;height:16px;margin:5px auto;border:1px solid #000;background:#fff;">'
							+ '<div class="prcsPctB" style="position:absolute;left:0;top:0;bottom:0;width:'+value+'%;background-color:#89cf43;"></div>'
							+ '<div class="prcsPctT" style="position:absolute;width:100%;height:100%;text-align:center;color:#000;">'+value+'%</div>'
							+ '</div>';
						
						return html;
					}
				},
				{ text: '상태', datafield: 'status_nm', cellsalign:'center', width:"10%",
					cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
						var bigCode = rowdata.big_code;
						var html ='<span class="'+bigCode+'_status">' + value + '</span>';
						
						return $(defaulthtml).html(html)[0].outerHTML;
					}
				}
			]
		});
	
		$grid.on("cellclick", function (event){
			if(event.args.datafield === 'stats_nm'){
				var bigCode = event.args.row.bounddata.big_code;
				viewDetail(bigCode);
			}
		});
	},

	bindEvent = function(){
		//Search
		m$.form.find('.form-submit').off().on('click',function(){
			refresh();
		});
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;
			if (setMin == 0) return;
			
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
		
		//설정 리스트 검색시간(endTime) 갱신
		$("body").on("comMng.changeSearchTime", function(event) {
			var endTime = _SL.formatDate.addMin(comGetServerTime(), 2);
			
			setDateUI(m$.form.find("[name=endDay]"),endTime.substring(0,8));
			setDateUI(m$.form.find("[name=endHour]"),endTime.substring(8,10));
			setDateUI(m$.form.find("[name=endMin]"),endTime.substring(10,12));
			
			refresh();
		});
	},
	
	setDateUI = function( $obj, _value ){
		var $select = $obj.siblings('.tform-select');
		$select.find('.tform-select-t').text(_value).end()
			.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
		$obj.val(_value);
	},
	
	initElapsedTimeCalc = function(elpasedTime){
		var timeStr ="";
		var day,hour,minute,second;
		
		day = parseInt(elpasedTime/(24*60*60));		
		hour = parseInt( elpasedTime%(24*60*60) /(3600) );
		minute = parseInt( (elpasedTime%(24*60*60) - hour*3600)/60  );
		second = parseInt(  ( (elpasedTime%(24*60*60) - hour*3600 )  )  %60);
		  
	 	if(day != 0) timeStr += day + "일 ";
		if(day != 0 || hour != 0) timeStr += hour + "시간 ";
		if(day != 0 || hour != 0 || minute != 0) timeStr += minute + "분";
		if(day != 0 || hour != 0 || minute != 0 || second != 0) timeStr += second + "초";
		
		if(timeStr =="") timeStr ="-";
		
		return timeStr;
	},
	
	renewalProcPct = function() {
		if(bigCodeArr.length < 1) return;
		
		var 
		rqData = {big_code_arr : bigCodeArr},
	
		callback = function(rsJson){
			for(var idx in rsJson){
				var bigParam = rsJson[idx];
				var bigCode = bigParam.big_code;
				var pct = bigParam.proc_pct;
				var $div = $("#list_"+bigCode);
				var bProcDt = $div.data('proc-dt');
				var pProcDt = bigParam.proc_dt;
				
				if(bProcDt == pProcDt){
					if(pct +"%" != $div.find(".prcsPctT").text()){
						var stat = bigParam.status;						
						$("."+bigCode+"_status").text(bigParam.status_nm);
						$div.find(".prcsPctB").width(pct +"%");
						$div.find(".prcsPctT").text(pct +"%")
						
						if(pct == "100"){
							var elapsedTime = bigParam.elapsed_time;
							var calElapTime = initElapsedTimeCalc(elapsedTime);
							var procStartDt = bigParam.proc_start_dt;
							var procEndDt = bigParam.proc_end_dt;
							var cvtProcStartDt = _SL.formatDate(procStartDt,"yyyyMMddHHmmss","yyyy-MM-dd HH:mm:ss");
							var cvtprocEndDt = _SL.formatDate(procEndDt,"yyyyMMddHHmmss","yyyy-MM-dd HH:mm:ss");
							
							m$.grid.find("."+bigCode+"_elap_time").text(calElapTime);
							//$("."+bigCode+"_elap_time").text(calElapTime);
						}
					}
				}
			}
		};
	
		$('body').requestData(mCfg.urlProcPct, rqData, {callback : callback});
		
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	},

	viewDetail = function(bigCode){
		m$.form.attr("action",mCfg.urlView);
		m$.bigCode.val(bigCode)
		m$.form.submit();
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.bigStats.list.init();
	
	//배치통계설정
	$("#btnSettingBigStats").togglePage(gCONTEXT_PATH + "analysis/big_stats_manager_list.html");
	//파일데이터관리
	$("#btnSettingBigFile").togglePage(gCONTEXT_PATH + "analysis/big_file_data_list.html");

	
});