//# sourceURL=big_file_data_view.js
'use strict';

_SL.nmspc("bigFileData").view = function() {

	var
	oFile = null,
	LIMIT_COUNT,
	bigCodeArr = [],
	fieldList = [],
	
	mCfg = {
		urlViewData	: gCONTEXT_PATH + 'analysis/big_file_data_view.json',
		urlNormData	: gCONTEXT_PATH + 'analysis/big_file_data_normalize.json',
		urlDelete 	: gCONTEXT_PATH + 'analysis/big_file_data_delete.do',

		formId : '#formBigFileDataView'
	},
	
	m$ = {
		form 		: $(mCfg.formId),
		
		baseInfoTbl	: $(mCfg.formId + ' #bigFileDataBaseInfo'),
		rsPsrTbl 	: $(mCfg.formId + ' #resultParserInfo'),
		rsPsrCont 	: $(mCfg.formId + ' #rsParserContainer'),
		
		fileId	 	: $(mCfg.formId + ' [name=file_id]')
	},
	
	init = function() {
		// 이벤트 Binding
		bindEvent();
		
		// form 데이터 setting
		viewData();
		
	},
	
	bindEvent = function(){
		var $btnDelete = m$.form.find('.table-bottom').find('.btn-delete');
		
		$btnDelete.off().on('click',function(){
			_confirm("삭제 하시겠습니까?",{
				onAgree : function(){
					var	listFileData = [];
					listFileData.push(m$.fileId.val());
					
					$('body').requestData(mCfg.urlDelete, {chk_file_ids:listFileData}, {
						callback : function(rsData){
							onClose(true);
						}
					});
				}
			});
		});
	},
	
	viewData = function() {
		var
			callback = function(rsMap){
				var $baseTbl = m$.baseInfoTbl;
				var $rsPsrTbl = m$.rsPsrTbl;
				var data = rsMap.data;
				var logList = rsMap.log_list;
				
				var logPsrList = rsMap.logPsrList;
				var fldListCodes = rsMap.fldListCodes;
				var userList = rsMap.userList;
				
				if(data != null) {
					// 기본정보 테이블 그리기
					$baseTbl.empty();
					var normalizeNm,
						recvDt,
						recvNm;
					if(data.normalize_type == 1) normalizeNm = data.normalize_type_nm;
					else normalizeNm = logPsrList[data.normalize_type_nm];
					recvDt = _SL.formatDate(data.proc_dt, 'yyyyMMddHHmmss', 'yyyy-MM-dd HH:mm:ss')
					recvNm = data.proc_id + "(" + userList[data.proc_id] + ")";
					
					var $tr1 = $('<tr><th scope="row">파일데이터명</th><td>'+ data.file_data_name +'</td></tr>');
					var $tr2 = $('<tr><th scope="row">정규화방법</th><td>'+ normalizeNm +'</td></tr>');
					var $tr3 = $('<tr><th scope="row">로그파일</th><td>'+ data.org_file_name +'</td></tr>');
					var $tr4 = $('<tr><th scope="row">등록일</th><td>'+ recvDt +'</td></tr>');
					var $tr5 = $('<tr><th scope="row">등록자</th><td>'+ recvNm +'</td></tr>');
					
					$baseTbl.append($tr1,$tr2,$tr3,$tr4,$tr5);
					
					// 파서 결과 테이블 그리기
					$rsPsrTbl.empty();
					
					var $trTit = $("<tr>");
					
					for(var i in logList) {
						var rsParserList = eval("("+logList[i]+")");
						var $trInfo = $("<tr>");
						
						for(var idx in rsParserList) {
							var thVal = idx;
							var tdVal = rsParserList[idx];
							var $td = $("<td>");
							var $th = $("<th>");
							
							if(thVal == "normalize_result" || thVal == "original_log") {
								if(i==0) {
									$th.append(thVal).attr("title", thVal).addClass("txt-elps");
									$trTit.append($th);
								}
								$td.append(tdVal).attr("title", tdVal).addClass("txt-elps");
								$trInfo.append($td);
							}
							else {
								var fldNm = fldListCodes[thVal] + "[" + thVal + "]";
								
								if(i==0) {
									$th.append(fldNm).attr("title", fldNm).addClass("txt-elps");
									$trTit.append($th);
								}
								$td.append(tdVal).attr("title", tdVal).addClass("txt-elps");
								$trInfo.append($td);
							}
						}
						
						if(i==0) $rsPsrTbl.append($trTit);
						$rsPsrTbl.append($trInfo);
					}
					
					$rsPsrTbl.css({"max-width" : "1050px"}).css("overflow", "auto");
					m$.rsPsrCont.css({"max-width" : "1050px"}).css("overflow", "auto");
				}
				else {
					$baseTbl.empty();
					$baseTbl.append("<tr><td>There is no Data</td></tr>");
					$rsPsrTbl.empty();
					$rsPsrTbl.append("<tr><td>There is no Data</td></tr>");
				}
				
				slui.attach.setTransformSelect(mCfg.formId);
			};
		
		$('body').requestData(mCfg.urlViewData, {file_id : m$.fileId.val()}, {callback : callback});
		
	},
	
	onClose = function(afterClose) {
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	}
	
	return {
		init : init
	};

}();

$(function(){
	slapp.bigFileData.view.init();
});
