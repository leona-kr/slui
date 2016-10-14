//# sourceURL=big_file_data_form.js
'use strict';

_SL.nmspc("bigFileData").form = function() {

	var
	oFile = null,
	LIMIT_COUNT,
	bigCodeArr = [],
	fieldList = [],
	separator_tip = {
		"\\|" 		 : " ex> 53018000|80|20150202142523|192.168.1.1",
		"\\s" 		 : " ex> 53018000 80 20150202142523 192.168.1.1",
		"\\t" 		 : " ex> 53018000	80	20150202142523	192.168.1.1",
		"," 		 : " ex> 53018000,80,20150202142523,192.168.1.1",
		"Csv" 		 : " ex> \"53018000\",\"80\",\"20150202142523\",\"192.168.1.1\"",
		"Json" 		 : " ex> {\"inst_cd\":\"53018000\",\"port\":\"80\",\"eqp_dt\":\"20150202142523\",\"eqp_ip\":\"192.168.1.1\"}",
		"Key&Value"  : " ex> inst_cd=\"53018000\" port=\"80\" eqp_dt=\"20150202142523\" eqp_ip=\"192.168.1.1\"",
		"Key&Value2" : " ex> \"inst_cd\":\"53018000\",\"port\":\"80\",\"eqp_dt\":\"20150202142523\",\"eqp_ip\":\"192.168.1.1\""
	},
	
	mCfg = {
		urlFormData	: gCONTEXT_PATH + 'analysis/big_file_data_form.json',
		urlNormData	: gCONTEXT_PATH + 'analysis/big_file_data_normalize.json',
		urlForm 	: gCONTEXT_PATH + 'analysis/big_file_data_form.html',
		urlAdd		: gCONTEXT_PATH + 'analysis/big_file_data_insert.do',
		urlNewForm 	: gCONTEXT_PATH + 'management/log_parser_manager_form.html',

		formId : '#formBigFileData'
	},
	
	m$ = {
		form 		: $(mCfg.formId),
		rsTable 	: $(mCfg.formId + ' #result_table'),
		rsParser 	: $(mCfg.formId + ' #result_parser'),
		fileInfo 	: $(mCfg.formId + ' #file_info'),
		subContner 	: $(mCfg.formId + ' #sub_container'),
		
		fldSeprVw 	: $(mCfg.formId + ' [data-id=field_separator_view]'),
		logPsrVw 	: $(mCfg.formId + ' #log_psr_view'),
		seprTip 	: $(mCfg.formId + ' #separator_tip'),
		
		logPsrId 	: $(mCfg.formId + ' [name=log_psr_id]'),
		fldSepr 	: $(mCfg.formId + ' [name=field_separator]'),
		seprTyp 	: $(mCfg.formId + ' [name=separator_type]'),
		normizeTyp 	: $(mCfg.formId + ' [name=normalize_type]'),
		cutLineCnt 	: $(mCfg.formId + ' [name=cut_line_count]'),
		logFile		: $(mCfg.formId + ' [name=log_file]'),
		
		fldList		: $(mCfg.formId + ' [name=fld_list]'),
		fieldList	: $(mCfg.formId + ' [name=field_list]'),
		logList		: $(mCfg.formId + ' [name=log_list]'),
		fileChrset	: $(mCfg.formId + ' [name=file_charset]'),
		
		
		btnLogPsr: $(mCfg.formId + ' .btn-log-psr-add'),
	},
	
	init = function() {
		// 이벤트 Binding
		bindEvent();
		
		// chosen 초기설정
		initChosen();
		
		// form 데이터 setting
		formData();
		
		// UI 초기 setting
		resetLogFile();
		normalizeTypeDisplay();
		
	},
	
	bindEvent = function(){
		m$.form.find('.btn-save').on('click', onSave);
		m$.form.find('.btn-reset').on('click', onReset);
		
		initChangeEvent();
		
		// 로그파서 등록버튼
		m$.btnLogPsr.exModalPopup(mCfg.urlNewForm, {
			width:800,
			height:500,
			onClose: function(){}
		});
		
		var keyup_timer;
		// 구분자, 제외 라인수
		m$.form.find("[name=field_separator], [name=cut_line_count]").keyup(function(e) {
			var _this = $(this);
			
			if(keyup_timer) clearTimeout(keyup_timer);
			keyup_timer = setTimeout(function() {
			    _this.data("old", _this.data("new") || "");
			    _this.data("new", _this.val());
			    if (_this.data("old") != _this.data("new")) {
			    	selectFile(oFile);
			    }
			    
				keyup_timer = null;
			}, 500);
			
		});
	},
	
	initChangeEvent = function() {
		// 정규화방법 change
		m$.normizeTyp.change(function() {
			resetLogFile();
			normalizeTypeDisplay();
		});
		
		// 구분자 change
		m$.seprTyp.change(function() {
			var val = $(this).val();
			
			m$.fldSepr.val($(this).val());
			m$.seprTip.html(separator_tip[val]);
			selectFile(oFile);
		});
		
		// 로그파일 change
		m$.logFile.change(function(e) {
			oFile = this.files[0];
			selectFile(oFile);
		});
		
		m$.form.find("[name=file_charset], [name=log_psr_id]").change(function(e) {
			selectFile(oFile);
		});
	},
	
	formData = function() {
		var
			callback = function(rsMap){
				var logPsrList = rsMap.logParserList;
				var fldData = rsMap.fldListCodes;
				var limCnt = rsMap.LIMIT_COUNT;
				
				if(limCnt == null) LIMIT_COUNT = 10;
				else LIMIT_COUNT = limCnt;
				
				//로그파서
				for(var idx in logPsrList) {
					var lData = logPsrList[idx];
					m$.logPsrId.append($("<option value='"+ lData.log_psr_id +"'>"+ lData.log_psr_nm +"</option>"));
				}
				m$.logPsrId.trigger("chosen:updated");
				
				// 필드
				for(var i in fldData) {
 					var fData = fldData[i];
					m$.fldList.append($("<option value='"+ i +"'>"+fData+"("+ i +")</option>"));
				}
				slui.attach.setTransformSelect(mCfg.formId);
			};
		
		$('body').requestData(mCfg.urlFormData, {}, {callback : callback});
	},
	
	initChosen = function() {
		// 로그파서
		m$.logPsrId.chosen({
			search_contains : true
		});
	},
	
	normalizeTypeDisplay = function() {
		m$.fldSeprVw.hide();
		m$.logPsrVw.hide();
		switch(m$.normizeTyp.val()) {
		// 구분자
		case "1" :
			m$.fldSeprVw.show();	
			break;
		// 로그파서
		case "2" :
			//m$.fldSeprVw.val("");
			m$.form.find("#separator_tip").html("");
			m$.logPsrVw.show();
			break;
		}
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	resetLogFile = function() {
		loading.hide();
		
		// 미리보기 초기화
		oFile = null;
		m$.form.find("#file_info, #result_table").empty();
		
		// 구분자 초기화
		m$.form.find("[name=separator_type]").val("\\|");
		m$.fldSepr.val("\\|");
		m$.seprTip.html(separator_tip["\\|"]);
		
		// 로그파일 초기화
		m$.cutLineCnt.val("0");
		m$.fileChrset.val("UTF-8");
		m$.logFile.val("");
		
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	// 파일선택
	selectFile = function(readFile) {
		if (!readFile) return;
		
		// (구분자 && 구분자 값 != null)  또는  제외 라인수 != null
		if ( ( m$.normizeTyp.val() == "1" && !_SL.validate("[name=field_separator]") ) || !_SL.validate("[name=cut_line_count]")) {
			resetLogFile(); 
			return;
		}
		
		m$.rsTable.empty();
		m$.fileInfo.empty();
		
		if(readFile) { // readFile.type
			var reader = new FileReader();
			
			reader.onloadstart = function (e) {
				loading.show();
			};
			reader.onerror = function (e) {
				loading.hide();
				_alert(e.target.error.name + "\n" + e.target.error.message);
			};
			reader.onloadend = function(e) {
				var resultLines = reader.result.split("\n");
				var resultLinesCount = resultLines.length; 
				
				// 미리보기 라인 잘라내기 
				var resultList = [];
				var cutLineCount = parseInt( m$.cutLineCnt.val() );
				var cutLineCountMax = cutLineCount + LIMIT_COUNT;
				
				resultList = resultLines.slice(cutLineCount, cutLineCountMax);
				
				if (resultList.length > 0) {
					// 정규화 미리보기
					normalizePreview(resultList);
					
					// 파일 전체 라인 수, 용량
					fileInfoDisplay(resultLines.length, e.total);
				} else {
					loading.hide();
					_alert("미리보기 할 로그가 없습니다.");
				}
			};
			reader.onprogress = function(e) { 
				loading.show();
			};
			reader.readAsText(readFile, m$.form.find("[name=file_charset]").val());
		}
	},
	
	// 로그파서 미리보기
	normalizePreview = function(resultLines) {
		loading.show();
		
		var param = {
			log_list : resultLines,
			normalize_type : m$.normizeTyp.val()
		};

		if (m$.normizeTyp.val() == "1") {
			param["field_separator"] = m$.fldSepr.val();
		} else {
			param["log_psr_id"] = m$.logPsrId.val();
		}
		
		$('body').requestData(mCfg.urlNormData, param, {
			callback : function(rsMap){
				
				switch(rsMap.RESULT_CODE) {
				case "000":
					var $resultTable = m$.form.find("#result_table").empty().show();
					
					var fldList, fldListCount = 0;
					var selWidth = 120, maxWidth = m$.rsParser.width() - 70;
					var isFirst = true;
					
					var normalizeList = rsMap.normalizeList;
					var fieldNameList = rsMap.fieldNameList;
					fldListCount = fieldNameList.length;
					
					selWidth = parseInt((maxWidth>=(selWidth*fldListCount)) ? (maxWidth/fldListCount) : selWidth);
					
					var $curTr = $("<tr></tr>");
					var temp;
					for (var fld in fieldNameList) {
						var $selectBox = m$.fldList.clone().show();
						$selectBox.removeClass("field_list").addClass("fld_list");
						$selectBox.attr("id", "fld_list_" + fld);
						$selectBox.css("width", selWidth-10);
						
						temp = fieldNameList[fld];
						if (temp.match("^field") || $.inArray(temp, fieldList) == -1) {
							temp = "field" + fld;
							$("<option>")
							.val(temp)
							.text(temp)
							.appendTo($selectBox);
						}
						
						var $curTh = $("<th></th>").append($selectBox).css({"width" : selWidth});
						
						$curTr.append($curTh);
						$curTr.appendTo($resultTable);
						
						$selectBox.val(temp);
					}
					
					m$.form.find(".fld_list").chosen({
						search_contains : true
					});
					m$.form.find(".fld_list").trigger("chosen:updated");
					
					var dataMap;
					
					for (var key in normalizeList) {
						dataMap = normalizeList[key];
						
						var $curTr = $("<tr></tr>");
						
						// invalid
						if (dataMap.hasOwnProperty("normalize_result") && dataMap.normalize_result != "000") {
							var $curTd = $("<td></td>").attr("colspan", fieldNameList.length).addClass("align_left").addClass("txt-elps")
							$curTd.append("[Invalid Log Format] ").append(dataMap.original_log);
							$curTr.append($curTd);
							$curTr.appendTo($resultTable);
							
							continue;
						}
						
						var fld, data;
						for (var n in fieldNameList) {
							fld = fieldNameList[n];
							
							//data = _SL.javascriptEscape(dataMap[fld]);
							data = dataMap[fld];
							var $curTd = $("<td></td>").append(data).attr("title", data).addClass("txt-elps");
							$curTr.append($curTd);
						}
						$curTr.appendTo($resultTable);
					}
					
					m$.rsParser.css({"max-width" : m$.subContner.width()}).css("overflow-y", "auto");
					loading.hide();
					
					break;
				case "002":
					_alert("미리보기 할 로그가 없습니다.");
					break;
				}
			}
		});	
	},
	
	fileInfoDisplay = function(count, size) {
		if (size > 0) {
			m$.fileInfo.text("[ Total " + _SL.toComma(count) + " Lines, " + bytesToSize(size) + " ]");
		}
	},
	
	bytesToSize = function(bytes) {
	    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	    if (bytes == 0) return '0 Bytes';
	    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	    if (i == 0) return bytes + ' ' + sizes[i]; 
	    return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
	},
	
	onSave = function() {
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		if (!_SL.validate(m$.form)) return;
				
		m$.fldList.val("");
		
		if (m$.normizeTyp.val() == "1") {
			var field_list = $.map($(".fld_list option:selected"), function(option) {
				return option.value;
			});
			m$.fieldList.val(field_list.join(","));
		}
		
		m$.form.attr({
			method:"POST",
			enctype : "multipart/form-data",
			encoding : "multipart/form-data",
			action : mCfg.urlAdd
		});
		
		m$.form.ajaxSubmit({
			success:function(rsMap, statusText, xhr, $form) {
				if (rsMap == "SUC_COM_0001") {
					_alert("처리 되었습니다.");
					onClose(true);
				} else {
					_alert("처리 중 오류가 발생 하였습니다.");
				}
			}
		});
	},
	
	onReset = function() {
		normalizeTypeDisplay();
		resetLogFile();
	},
	
	onClose = function(afterClose) {
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	refresh = function() {
		m$.grid.jqxGrid("updatebounddata");
	}

	return {
		init : init
	};

}();

$(function(){
	slapp.bigFileData.form.init();
});
