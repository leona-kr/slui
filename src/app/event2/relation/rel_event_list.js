'use strict';

_SL.nmspc("relEvent").list = function() {

	var
	eventInfoList = {},
	
	// Config 정의	
	mCfg = {
		urlList 	: gCONTEXT_PATH + 'event2/rel_event_list.json',
		urlLogSearch: gCONTEXT_PATH + 'monitoring/log_search.html',
		urlSmsEvent	: gCONTEXT_PATH + 'event/sms_event_list.html',
		
		formId 			: '#searchRelEventList',
		tableHeadId 			: '#relEventTableHead',
		tableListId 			: '#relEventTableList',
	},
	
	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		tableHead	: $(mCfg.tableHeadId),
		tableList 	: $(mCfg.tableListId + ' tbody'),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		eventtNm	: $(mCfg.formId + ' [name=s_event_nm]'),
		eventCate	: $(mCfg.formId + ' [name=s_event_cate_cd]'),
		eventLevel	: $(mCfg.formId + ' [name=s_event_level]'),
		currPage	: $(mCfg.tableHeadId + ' [name=currPage]')
	},

	init = function() {
		// 초기 화면 구성
		drawList();

		// 이벤트 Binding
		bindEvent();
		
	},

	drawList = function(){
		var params = $.extend({}, _SL.serializeMap(m$.form),
				{
					pagesize : m$.tableHead.find("[name=pageRow]").val(),
					currPage : m$.tableHead.find("[name=currPage]").val()
				}
		);

		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData, rsCd, rsMsg){
				if(!rsData) return;		

				//검색,페이징관련 값들 맵핑
				_SL.setDataToForm(rsData, m$.form);
				_SL.setDataToForm(rsData, m$.tableHead);
				$('#relTotalCnt').text(_SL.formatNumber(rsData.totalCount));
				$('#relSpanTotalPage').text(_SL.formatNumber(rsData.totalPage));
				m$.currPage.data('total-page',rsData.totalPage);
				
				var list = rsData.eventList;
				eventInfoList = $.extend({}, list);

				var $tBody = m$.tableList; 
				$tBody.children().remove();

				if(list.length > 0){					
					
					for(var i in list){
						var $tr = $('<tr>');
						var data = list[i];
						var levelStrArr = ['Low','Middle','High'];
						var levelClsArr = ['label-success','label-attention','label-danger'];

/*번호*/					$tr.append($('<td class="align-center">'+(parseInt(i)+1+rsData.recordstartindex)+'</td>'));
/*발생시간*/				$tr.append($('<td class="align-center">'+_SL.formatDate(data.event_time,"yyyyMMddHHmm","yyyy-MM-dd HH:mm")+'</td>'));
/*이벤트명*/				$tr.append($('<td>'+ _SL.htmlEscape(data.event_nm) +'</td>'));
/*분류*/					$tr.append($('<td class="align-center">'+ data.event_cate_nm +'</td>'));
/*등급*/					$tr.append($('<td>'+ '<span class="'+levelClsArr[data.event_level-1]+'">'+levelStrArr[data.event_level-1]+'</span>' +'</td>'));
						
/*발생값,건수 Start*/		var eventDtlList = data.event_dtl_list;
						var $dtlTd = $('<td>');
						var $cntTd = $('<td class="align-center">');
						for(var j in eventDtlList){
							var eventDtl = eventDtlList[j];
							var depth = eventDtl.dtl_depth;
							var fltGrpFld = eventDtl.flt_grp_fld;
							var rstGrpFld = eventDtl.rst_grp_fld;
							var fltGrpFldArr = fltGrpFld.split(',');
							var rstGrpFldArr = rstGrpFld.split(',');
							var dtlStr ='';
							
							for(var blank = 0 ; blank < depth ;  blank++){
								dtlStr +='&nbsp;'
							}
							
							dtlStr += "└";
							if(!fltGrpFld){
								dtlStr += '조건필드:미지정';
							}else{
								for(var fIdx in fltGrpFldArr){
									dtlStr += gFieldJson[fltGrpFldArr[fIdx]] + ':' + _SL.htmlEscape(eventDtl.splitFltFldVal[fIdx]) +' ';
								}
							}
							
							dtlStr +=' / ';
							
							if(!rstGrpFld){
								dtlStr += '결과필드:미지정';
							}else{
								for(var rIdx in rstGrpFldArr){
									dtlStr += gFieldJson[rstGrpFldArr[rIdx]] + ':' + _SL.htmlEscape(eventDtl.splitRstFldVal[rIdx] +' ');
								}
							}
							if(eventDtlList.length -1 != j) dtlStr+='<br>';	
							
							$dtlTd.append(dtlStr);
							if(eventDtl.ruleset_type == '1')
								$cntTd.append($('<a href="#" class="btn-link" data-idx="'+i+'" data-dtl-idx="'+j+'">' + eventDtl.cnt + '/' + eventDtl.limit_count + '</a><br>'));
							else 
								$cntTd.append($('<a href="#" class="btn-link" data-idx="'+i+'" data-dtl-idx="'+j+'"><span class="'+levelClsArr[eventDtl.cnt-1]+'">'+levelStrArr[eventDtl.cnt-1]+'</span></a><br>'));
							$cntTd.append();
							
						}
						$tr.append($dtlTd);
/*발생값,건수 End*/			$tr.append($cntTd);
					
						$tr.appendTo($tBody);
					}
				}else{
					$tBody.append( $('<tr><td class="list-empty" colspan="7">There is no Search Result</td></tr>') );
				};
				
			}
		});
	},
	
	bindEvent = function() {
		//Search
		m$.form.find('.form-submit').off().on('click',function(){
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
		
		//Paging start
		m$.tableHead.find('.btn-prev').off().on('click',function(){
			goPrev();
		});
		
		m$.tableHead.find('.btn-next').off().on('click',function(){
			goNext();
		});
		
		m$.currPage.off().on('keydown',function(){
			goPage();
		});
		
		m$.tableHead.find('[name=pageRow]').change(function(){
			refresh();
		});
		//Paging end
		
		//리스트의 검색링크
		m$.tableList.off().on("click",".btn-link",function(){
			goSearchPopup($(this).data('idx'),$(this).data('dtl-idx'));
		});
	},
	//Paging event start
	goPrev = function(){
		var currPage = parseInt(m$.currPage.val());
		if(currPage ==1){
			return;
		}else if(m$.currPage.data('total-page') == 0 ){
			m$.currPage.val(1);
			return;
		}
		
		m$.currPage.val(currPage-1);
		refresh();
	},
	
	goNext = function(){
		var currPage = parseInt(m$.currPage.val());
		
		if(currPage == m$.currPage.data('total-page')){
			return;
		}else if(m$.currPage.data('total-page') == 0){
			m$.currPage.val(1);
			return;
		}
		
		m$.currPage.val(currPage+1);
		refresh();
	},
	
	goPage = function(){
		var num = (event.srcElement || event.target).value;
		var totalPage = parseInt(m$.currPage.data('total-page'));
		
		if (event.keyCode == 13) {
			if(isNaN(num) || parseInt(num) < 1 || parseInt(num) > totalPage) {
				return;
			}else{
				$('#currPage').val(num);
				refresh();
			}
		}
	},
	//Paging event end
	
	goSearchPopup = function(idx, dtlIdx){
		
		var eventInfo = eventInfoList[idx];
		var eventDtlInfo = eventInfo.event_dtl_list[dtlIdx];
		var rulesetType = eventDtlInfo.ruleset_type;
		var eventTime = eventInfo.event_time;
		var sdt = eventDtlInfo.sdt;
		var ddt = eventDtlInfo.ddt;

		var $logSearchForm = m$.form.find("[name='logSearchForm']");

		if($logSearchForm.length == 0){
			$logSearchForm = $('<form name="logSearchForm">');
			$logSearchForm.append('<input type="hidden" name="start_time">');
			$logSearchForm.append('<input type="hidden" name="end_time">');
			$logSearchForm.append('<input type="hidden" name="filter_type"');
			$logSearchForm.append('<input type="hidden" name="expert_keyword">');
			$logSearchForm.append('<input type="hidden" name="template_id" value="popup">');
			$logSearchForm.append('<input type="hidden" name="s_eqp_type_cd"');
			$logSearchForm.append('<input type="hidden" name="s_eqp_ip"');
			$logSearchForm.append('<input type="hidden" name="log_view_fields"');
			
			m$.form.append($logSearchForm);
		}
	
		if(rulesetType == 2){//성능이벤트
			var eqpTypeCd = eventDtlInfo.eqp_type_cd;
			var eqpIp = eventDtlInfo.eqp_ip;
			
			$("[name=start_time]", $logSearchForm).val(sdt);
			$("[name=end_time]", $logSearchForm).val(ddt);
			$("[name=s_eqp_type_cd]", $logSearchForm).val(eqpTypeCd);
			$("[name=s_eqp_ip]", $logSearchForm).val(eqpIp);
			
			var winName = "SmsEventWin_" + (new Date()).getTime();
			
			$logSearchForm.attr({
				target : winName,
				action : mCfg.urlSmsEvent,
				method : "post"
			}).submit();
			
		}else{
			var startTime = sdt.substring(0, 12);
			var endTime = _SL.formatDate.addMin(ddt.substring(0, 12), 1);
			
			var filterList = "";
			var filterType = 2;
			var strQuery = eventDtlInfo.search_query;
			
			strQuery = "(" + strQuery + ")";
			
			if(eventDtlInfo.flt_grp_fld != ""){
				var fltGrpFldValArr = eventDtlInfo.splitFltFldVal;
				var fltGrpFldArr = (eventDtlInfo.flt_grp_fld).split(",");
				
				for(idx in fltGrpFldArr){
					strQuery += " AND " + fltGrpFldArr[idx] + ":" + _SL.luceneValueEscape(fltGrpFldValArr[idx]);
				}
			}
			
			if(eventDtlInfo.rst_grp_fld != ""){
				var rstGrpFldValArr = eventDtlInfo.splitRstFldVal;
				var rstGrpFldArr = (eventDtlInfo.rst_grp_fld).split(",");
				
				for(idx in rstGrpFldArr){
					strQuery += " AND " + rstGrpFldArr[idx] + ":" + _SL.luceneValueEscape(rstGrpFldValArr[idx]);
				}
			}
			
			$("[name=start_time]", $logSearchForm).val(startTime);
			$("[name=end_time]", $logSearchForm).val(endTime);
			$("[name=filter_type]", $logSearchForm).val("2");
			$("[name=expert_keyword]", $logSearchForm).val(strQuery);
			
			if(eventInfoList[idx].view_field){
				$("[name=log_view_fields]", $logSearchForm).val(eventInfoList[idx].view_field);
			}else{
				$("[name=log_view_fields]", $logSearchForm).val("");
			}
			
			var winName = "logSearchWin_" + (new Date()).getTime();
			
			$logSearchForm.attr({
				target : winName,
				action : mCfg.urlLogSearch
			}).submit();
			
		}
	},
	

	refresh = function() {
		drawList();
	};
	
	return {
		init : init
	};

}();

$(function(){
	slapp.relEvent.list.init();
	
	//접속자현황
	$("#btnSettingRelEvent").togglePage(gCONTEXT_PATH + "event2/rel_ruleset_list.html");
	
});