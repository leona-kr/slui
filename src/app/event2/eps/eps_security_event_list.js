//# sourceURL=eps_security_event_list.js
'use strict';

_SL.nmspc("epsSecurityEvent").list = function() {

	
	var
	// Config 정의	
	mCfg = {
		urlList : gCONTEXT_PATH + 'event2/eps_security_event_list.json',		
		formId 			: '#searchEpsSecurityEventList',
		gridId 			: '#gridEpsSecurityEventList',
		tableList 		: "#epsSecurityEventListTable tbody",
		urlHandlingUdate: gCONTEXT_PATH + 'event2/eps_security_event_update.json',
		urlChkForm : gCONTEXT_PATH + 'event2/eps_security_event_list_form.html',
		urlAllChkForm : gCONTEXT_PATH + 'event2/eps_security_event_list_allcheck_form.html',
		urlLogSearch	: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlUpdate 		: gCONTEXT_PATH + 'event2/eps_security_event_update.json'
		
	},
	
	
	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		
		tableList : $(mCfg.tableList + ' tbody')
	},

	AllPageIpParam = [],
	AllPageEventTimeParam = [],
	AllPageRulesetIdParam = [],
	
	init = function() {

		$("#s_event_cate_cd").val( $("#event_cate_cd").val() );
		
		drawGrid(m$.grid);

		// 이벤트 Binding
		bindInitEvent();
	
	},
	
	getAllPageIpParam = function(){
		return AllPageIpParam;
	},
	getAllPageEventTimeParam = function(){
		return AllPageEventTimeParam;
	},
	getAllPageRulesetIdParam = function(){
		return AllPageRulesetIdParam;
	},

	drawGrid = function($grid){
		
		
		
		var gridSource = {
				datatype: "json",
				datafields: [
					{ name: "cnt", type: "string"},
					{ name: "event_time", type: "string"},
					{ name: "event_nm", type: "string"},
					{ name: "event_cate_name", type: "string"},
					{ name: "tc_type_name", type: "string"},
					{ name: "src_ip", type: "string"},
					{ name: "times", type: "string"},
					{ name: "limit_count", type: "string"},
					{ name: "time_type_name", type: "string"},
					{ name: "handling_type_cd_name", type: "string"},
					{ name: "sdt", type: "string"},
					{ name: "ddt", type: "string"},
					{ name: "ruleset_id", type: "string"},
					{ name:"search_query", type: "string"},
					
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
						rows[i].event_time = _SL.formatDate(rows[i].event_time, 'yyyyMMddHHmm', 'yyyy-MM-dd HH:mm');
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
				enablehover: false,
				selectionmode: 'checkbox',
				rendergridrows: function(obj){
					return obj.data;
				},
				columns: [
					{
						text: '번호', columntype: 'number', width:40, cellsalign:'center',
						cellsrenderer: function (row, column, value, defaulthtml) {
							return $(defaulthtml).text(value + 1)[0].outerHTML;
						}
					},
					{ text: '발생시간', datafield: 'event_time', cellsalign:'center', width:'12%'},
					{ text: '이벤트명', datafield: 'event_nm',
						cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
							return $(defaulthtml).html('<button type="button" class="btn-link">' + value + '</button>')[0].outerHTML;

						}
				    },
					{ text: '이벤트 분류', datafield: 'event_cate_name', cellsalign:'center', width:'12%'},

					{ text: '구분', datafield: 'tc_type_name', cellsalign:'center', width:'8%'},
					{ text: 'HOST', datafield: 'src_ip', cellsalign:'center', width:'10%'},
					{ text: '체크 주기', datafield: 'times', cellsalign:'center', width:'8%',
						 cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
							 return $(defaulthtml).text(value+" "+rowdata.time_type_name)[0].outerHTML;
						  }
					},
					{ text: '발생건수/기준건수', datafield: 'cnt', cellsalign:'center', width:'12%',
						 cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
							 return $(defaulthtml).html(
									 _SL.formatNumber(rowdata.cnt) + " / " + _SL.formatNumber(rowdata.limit_count)
							 		)[0].outerHTML;
						 }
					},
					{ text: '상태', datafield: 'handling_type_cd_name', cellsalign:'center', width:'8%',
						  cellsrenderer: function(row, column, value, defaulthtml, columnproperties, rowdata){
							 	if( value=="" || value==null ){
							 		return $(defaulthtml).text("-")[0].outerHTML;
							 	}else{
							 		return $(defaulthtml).text(value)[0].outerHTML;
							 	}
						  }
					},
					 
						  
				]
			});	
			
			$grid.on("cellclick", function (event){
				if(event.args.datafield === 'event_nm'){
					var sdt = event.args.row.bounddata.sdt;
					var src_ip = event.args.row.bounddata.src_ip;
					var event_nm = event.args.row.bounddata.event_nm;
					var ddt = event.args.row.bounddata.ddt;
					var search_query = event.args.row.bounddata.search_query;
					goLogSearch(sdt,ddt,src_ip,event_nm,search_query);
				}
			});
			
			 $('#gridEpsSecurityEventList').on('rowselect', function (event) {
				
				 var displayobj = m$.grid.jqxGrid('getdisplayrows');
				 var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
				 var idxs = [];

					for( var key in displayobj){
						for(var i=0, len = selectedrowindex.length; i<len; i++){
							if( selectedrowindex[i] == displayobj[key].boundindex){
								idxs.push(displayobj[key].boundindex);
							}
						}
					}
					
				 if(idxs.length == 0){
					 $("#gridEpsSecurityEventList").jqxGrid('clearselection');
				 }
				 
			 });
	},
	
	bindInitEvent = function() {
		
		var $btnEventProcess = m$.grid.parent().siblings('.grid-bottom').find('.btn-event_process');
		var $btnAbout = m$.grid.parent().siblings('.grid-bottom').find('.btn-about');
		var $btnDuplication = m$.grid.parent().siblings('.grid-bottom').find('.btn_duplication');
		var $btnException = m$.grid.parent().siblings('.grid-bottom').find('.btn-exception');

		//Search
		m$.form.find('.form-submit').off().on('click',function(){
			
			if(!_SL.validate(m$.form)) return;
			
			var sTime = m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
			var eTime = m$.eDay.val() + m$.eHour.val() + m$.eMin.val();
			var diffTime = _SL.formatDate.diff(sTime, eTime);
			var s_eqp_ip1 = $("#s_eqp_ip").val();
			
			if(diffTime <= 0) {
				_alert("시작일이 종료일보다 큽니다.");
				return;
		    }
			if(diffTime/60000 > m$.form.find("[name=timeSet] option:last-child").val()) {
				_alert("검색 기간 초과입니다.");
				return;
			}
			
			m$.form.find("[name=currPage]").val(1);
			
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
		
		
		$(".btn-about").click(function(){goProcess(2, $(".btn-about").text());});
		$(".btn_duplication").click(function(){goProcess(4);});
		$(".btn-exception").click(function(){goProcess(5);});
		
		var $btnEventProcess = m$.grid.parent().siblings('.grid-bottom').find('.btn-event_process');
		$btnEventProcess.on("click", fnProc);
		
		/* $("select[name=s_times]").attr("disable",true);*/
		 
		
		
		$("#div_s_time_type").change(function(){
			
			if( $("select[name=s_time_type] option:selected").text() =="[ 선택하세요 ]"){
				
				$("#div_s_times").hide();
				
			}
			else{
				
				$("#div_s_times").show();
			}
			
			slui.attach.setTransformSelect(mCfg.formId);
		})
		
		$("#div_s_times").hide();
		
		

	},
	
	goProcess = function(process,text){
		
		var process_text = text;
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
			_alert(process_text + "할 이벤트를 체크해주세요.");
			return;
		}else{
			
			if( idxs.length > 1 && (process == 5) ){
				_alert(process_text + " 처리는 1개 이벤트만 가능합니다.");
				return;
			}		
					
			if(process == 2){
				if( $("#all_checkbox").is(":checked") ){//전체선택 체크박스가 선택되었을 때

				}else{//이벤트를 개별로 선택했을 때
					_confirm("이벤트를 " + process_text + " 하시겠습니까?",{
						onAgree : function(){
							if(!checkHandlingType(process))return;
							statusUpdate(process);
							return true;
						},
						onDisagree : function(){
							return false;
						}
					});
				}
			}
			else if(process == 5){
				
				var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
				var displayobj = m$.grid.jqxGrid('getdisplayrows');
				
				if(!checkHandlingType(process))return;
				/*var key = $("input[name=checkbox_list]:checked").attr("key");*/
				var idx = selectedrowindex[0];
				var rulesetId = eventInfoList[idx].ruleset_id;
				var extendExceptionQuery  = "src_ip:" + eventInfoList[idx].src_ip;
				
				$.get("/event/event_exception.do", {ruleset_id : rulesetId, event_type_cd : 3},function(rsJson){
					if(rsJson.cnt == 0){
						_alert("룰셋이 삭제되었습니다.");
						return;
					}else{
						
					
					}
				})
			}				
		}
	},
	
	
	checkHandlingType = function(type,bAll){
		var process = $(this).data('handle-type');
		var process_text = $(this).text();
		var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
		var displayobj = m$.grid.jqxGrid('getdisplayrows');
		var idxs = [];

		
		
		var handlingNm = "";
		var check;
		var handlingTypeCd = [];
		var listIndex ;
		if(type != 3){
			
			for( var key in displayobj){
				for(var i=0, len = selectedrowindex.length; i<len; i++){
					if( selectedrowindex[i] == displayobj[key].boundindex){
						
						listIndex = displayobj[key].boundindex;
						handlingTypeCd.push(displayobj[listIndex].handling_type_cd);
					}
				}
			}		
			
		}else{
			listIndex = idx - 1;
			handlingTypeCd.push(displayobj[listIndex].handling_type_cd);
		}
		
		if(handlingTypeCd.length == 1){
			for(var i=0; i < handlingTypeCd.length; i++){
				handlingNm = eventStatusJson[handlingTypeCd[i]];
				if(displayobj[listIndex].handling_type_cd != null){
					if(handlingTypeCd[i] == type){
						_alert("이미 " + handlingNm + " 되었습니다");
						return;
					}else if(handlingTypeCd[i] != null && handlingTypeCd[i] != ""){
						if(handlingTypeCd[i].indexOf(type) == -1){

							_confirm(handlingNm + "인 상태가 있습니다. 상태를 변경하시겠습니까?",{
								onAgree : function(){
									if(bAll){
										viewDetail(mCfg.urlAllChkForm);
									}else{
										viewDetail(mCfg.urlChkForm);
									}
									return true;
								},
								onDisagree : function(){
									return false;
								}
							});
							return;
							

						}
					}
				}
			}
		}else{
			/*$("#duplicateConfirm").dialog("close");
			$("#duplicateConfirm2").dialog("close");*/
			var handlingTypeCds = [];
			var listIndex ;
			
			for( var key in displayobj){
				for(var i=0, len = selectedrowindex.length; i<len; i++){
					if( selectedrowindex[i] == displayobj[key].boundindex){
						
						listIndex = displayobj[key].boundindex;
						if(displayobj[listIndex].handling_type_cd != null){
							handlingTypeCds.push(displayobj[listIndex].handling_type_cd);
						}
					}
				}
			}
			
			
			
			for(var i=0; i < handlingTypeCds.length; i++){
				handlingNm = eventStatusJson[handlingTypeCds[i]];
				if(handlingTypeCds[0] != handlingTypeCds[i]){

					_confirm(handlingNm + "인 상태가 있습니다. 상태를 변경하시겠습니까?",{
						onAgree : function(){
							if(bAll){
								viewDetail(mCfg.urlAllChkForm);
							}else{
								viewDetail(mCfg.urlChkForm);
							}
							return true;
						},
						onDisagree : function(){
							return false;
						}
					});
					return;
					
				}else if(handlingTypeCds[i] != null && handlingTypeCds[i] != ""){
					if(handlingTypeCds[i].indexOf(type) == -1){

						_confirm(handlingNm + "인 상태가 있습니다. 상태를 변경하시겠습니까?",{
							onAgree : function(){
								if(bAll){
									viewDetail(mCfg.urlAllChkForm);
								}else{
									viewDetail(mCfg.urlChkForm);
								}
								return true;
							},
							onDisagree : function(){
								return false;
							}
						});

						return;

					}
				}
			}
		}
		
		if(type == 1){
			if( displayobj.length <= selectedrowindex.length ){ 
				
				viewDetail(mCfg.urlAllChkForm);
			}
			//1개만 체크
			else{
				viewDetail(mCfg.urlChkForm);
				}
			
		}
			
		
		return true;
	},
	
	fnProc = function() {

		var process = $(this).data('handle-type');
		var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
		var displayobj = m$.grid.jqxGrid('getdisplayrows');
		var idxs = [];

		AllPageIpParam = [];
		AllPageEventTimeParam = [];
		AllPageRulesetIdParam = [];
		
		
		for( var key in displayobj){
			for(var i=0, len = selectedrowindex.length; i<len; i++){
				if( selectedrowindex[i] == displayobj[key].boundindex){
					idxs.push(displayobj[key].boundindex);
					
					AllPageIpParam.push(displayobj[selectedrowindex[i]].src_ip);
					AllPageEventTimeParam.push(_SL.formatDate(displayobj[selectedrowindex[i]].event_time, 'yyyy-MM-dd HH:mm','yyyyMMddHHmm'));
					AllPageRulesetIdParam.push(displayobj[selectedrowindex[i]].ruleset_id);
				}
			}
		}
		
		if(idxs.length < 1){
			_alert("처리할 건을 선택하세요");
			return;
		}else{
			//모두 체크되었을때
			if( displayobj.length <= selectedrowindex.length ){ 
				if(!checkHandlingType(1,true))return;
				/*viewDetail(mCfg.urlAllChkForm);*/
			}
			//1개만 체크
			else{
				if(!checkHandlingType(1,false))return;
				for(var i in selectedrowindex){
					displayobj[i]
				}
				
				/*viewDetail(mCfg.urlChkForm);*/
			}
			
			
		}
	
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			width:500, height:170,
			onClose : function(){
				refresh();
			}
		});
	
	},
	
	statusUpdate = function(process){
		
		var selectedrowindex = m$.grid.jqxGrid('selectedrowindexes');
		var displayobj = m$.grid.jqxGrid('getdisplayrows');

		
		var len = selectedrowindex.length;
		
		/*$("#view_dlg_progressBar").dialog("open");
		
		$("#progressBar").progressbar({
			  max : len
		});*/

		var cnt = 0;
		
		var json = {};
		var listIndex ;	
		var list = eventInfoList;

		
			for(var i=0, len = selectedrowindex.length; i<len; i++){
				var key = selectedrowindex[i];
				/*selectedrowindex[i] == displayobj[key].boundindex*/
				listIndex = displayobj[key].boundindex;

				var event_time = _SL.formatDate(displayobj[listIndex].event_time, 'yyyy-MM-dd HH:mm','yyyyMMddHHmm');;
				var src_ip = displayobj[listIndex].src_ip;
				var ruleset_id = displayobj[listIndex].ruleset_id;

				json = {
						handling_type_cd  : process,
						event_time 		  : event_time,
						src_ip  		  : src_ip,
						ruleset_id 		  : ruleset_id
				}
				
				
				var params = $.extend({}, _SL.serializeMap(m$.form));
				
				$('body').requestData(mCfg.urlUpdate, json, {
					callback : function(rsData, rsCd, rsMsg){
						if(rsCd=="SUC_COM_0005"){
							refresh();	
						}else{
							_alert("처리중 에러가 발생했습니다.\n다시 시도해 보세요.");
						}
							
					}
				});
	
			}
		

	},
	
	
	goLogSearch = function(sdt,ddt,src_ip,event_nm,search_query){
		
		
		var startTime = sdt;
		startTime = _SL.formatDate(startTime, "yyyyMMddHHmmss", "yyyyMMddHHmm");
		
		var endTime = ddt;
		endTime = _SL.formatDate(endTime, "yyyyMMddHHmmss", "yyyyMMddHHmm");
		endTime = _SL.formatDate.addMin(ddt, 1);
		/*startTime = _SL.formatDate(event_time, "yyyyMMddHHmmss", "yyyyMMddHHmm");*/
		
		var fldName = "src_ip:";
		var fldName1 = " AND ";
		
		var $logSearchForm = m$.form.find("[name='logSearchForm']");
		
		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type"');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			$logSearchForm.append('<input type="hidden" name="search_query">');
			m$.form.append($logSearchForm);
		}
		
		$("[name=start_time]", $logSearchForm).val(startTime);
		$("[name=end_time]", $logSearchForm).val(endTime);
		$("[name=filter_type]", $logSearchForm).val("2");
		$("[name=expert_keyword]", $logSearchForm).val(fldName + src_ip + fldName1 + search_query );
		$("[name=search_query]", $logSearchForm).val(search_query);
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$logSearchForm.attr({
			target : winName,
			action : mCfg.urlLogSearch
		}).submit();
	},
	
	bindAfterEvent = function() {
		
		m$.grid.find(".td_not_empty").off().on('click',function(){	
			var $target = $(this);

			$("#tc_type").val($target.data("tc_type"));
			$("#event_cate_cd").val($target.data("event_cate_cd"));
			$("#count").val($target.data("count"));
			
			
			$("[name=searchEpsIpEventList]")[0].action = "/event2/eps_security_event_list.html";
			$("[name=searchEpsIpEventList]")[0].submit();

		});
	},
	
	refresh = function() {
		/*drawTable();*/
		drawGrid(m$.grid);
	},
	
	colorCode = [];
	
	return {
		init : init,
		getAllPageIpParam:getAllPageIpParam,
		getAllPageEventTimeParam:getAllPageEventTimeParam,
		getAllPageRulesetIdParam:getAllPageRulesetIdParam
	};

}();

$(function(){
	slapp.epsSecurityEvent.list.init();
	
	$("#btnSettingEpsRulesetList").togglePage(gCONTEXT_PATH + "event2/eps_ruleset_list.html");
	/*$("#btnSettingDuplicationList").togglePage(gCONTEXT_PATH + "event/event_duplication_list.html");*/
	
	$("#btnSettingRiskRuleView").off().on('click',function(){
		new ModalPopup(gCONTEXT_PATH + "event2/eps_event_risk_rule_view.html",{
			width: 820,
			height:250
		});
	});
});