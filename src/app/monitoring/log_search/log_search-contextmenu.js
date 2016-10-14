'use strict';

_SL.nmspc("logsearch").contextmenu = function(){
	var
	// Reference Modules
	refDynPaging, refMng,

	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID
		DOM : {
			logTable			: "#logTable",
		},
		
		URL : {
			stringCodec			: gCONTEXT_PATH + "common/string_codec.html",
			ipCheck				: gCONTEXT_PATH + "common/ipcheck.html",
			netflowList			: gCONTEXT_PATH + "analysis/netflow_list.html",
			codeBookView		: URL_PATH + "code_book_view.html",
			virusTotal			: gCONTEXT_PATH + "common/virusTotal.html",
			parser				: gCONTEXT_PATH + "management/parser_generator.do",
			attackpatternAdvice	: URL_PATH + "attackpattern_advice.html"
		},
	
		idSeperator : ",",
		sameValueFields : ["src_ip","dstn_ip","eqp_ip"]
	},
	
	m$ = {
		
	},

	mState = {
		sameValueMap : {},
		relAnalInfoMap : {}
	},
	
	/*** Define Function ***/
	init = function() {
		refMng			= slapp.logsearch.manager;
		refDynPaging	= slapp.logsearch.dynPaging;
		
		var items, item, idx, strKey;
		
		for(idx in mCfg.sameValueFields) {
			item = mCfg.sameValueFields[idx];
			//console.log("item : " + item);
			strKey = "sv_" + item;
			mState.sameValueMap[strKey] = {field : item, name : gFieldCaptions[item] + " 기준", callback : onCtxSameValue};
		}

		for(idx in gRelationAnalysisList) {
			item = gRelationAnalysisList[idx];
			
			if(item.field) {
				strKey = item.field + "_" + item.value.split(mCfg.idSeperator).join("_");
				mState.relAnalInfoMap[strKey] = item;
			}
		}
		
		items = {
			string_codec: {name: "문자열 변환", callback : onCtxStringCodec},
			check_ip: {name: "IP 상세정보", disabled : checkDisabled, callback : onCtxCheckIp},
			netflow: {name: "NetFlow 분석", disabled : checkDisabled, callback : onCtxNetflow},
			code_book: {name: "코드북 확인", disabled : codeBookCheckDisabled, callback : onCtxCodeBook},
			virus_total : {name: "바이러스 분석", callback : onCtxCheckVirus},
			//attackpattern_advice : {name: "공격패턴 도움말", disabled : onAttackpatterncheckDisabled, callback : onAttackpatternAdvice},
			same_value: {
				name: "동일값 조회",
				items : mState.sameValueMap
			},
			separator1: "-----",
			rel_anal : {
				name : "연관분석",
				disabled : checkDisabled,
				items : mState.relAnalInfoMap
			},
			se_perator2 : "----",
			eps : {
				name : "내부망분석",
				disabled : checkDisabled,
				items : {
					eps_conn_log : {name : "네트워크 통신 로그", callback : function(key, options) { onCtxEps("conn.log", options) } },
					eps_http_log : {name : "HTTP 통신 로그", callback : function(key, options) { onCtxEps("http.log", options) } },
					eps_dns_log : {name : "DNS  통신 로그", callback : function(key, options) { onCtxEps("dns.log", options) } }
				}
			}
		}
		
		$.contextMenu({
			selector: '.context-menu-one',
			zIndex : 1003,					// 페이지 하단 1002
			callback : onCtxLogType,		// Default Callback
			items : items
		});
		
		$.contextMenu({
			selector: '.context-menu-two',
			zIndex : 1003,	// 페이지 하단 1002
			callback: onCtxOpenParser,
			items: {
				string_codec: {name: "문자열 변환", callback : onCtxStringCodec},
				open_parser : {name: "Open XML Parser"}
			}
		});
	},
	
	checkDisabled = function(key, opt) {
		var str = opt.$trigger.text();
		
		return !_SL.ip.check(str);
	},
	
	onCtxStringCopy = function(key, opt) {
		var clipBoard = new ZeroClipboard.Client();

		window.clipboardData.setData("Text", opt.$trigger.text());
	},
	
	onCtxOpenParser = function(key, opt) {
		var reOverLenSuffix = new RegExp(gOverLengthSuffix + "$");
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxOpenParser[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		
		var fldVal = refDynPaging.getFieldValue(rnum, fldNm);
		
		// visible_length_check_fields 에 등록된 필드는 무조건 more가 보이게 수정
		//if(fldVal.length > gLogVisibleLength && reOverLenSuffix.test(fldVal)) {
		var openParser = function(str) {
			$("<form>").attr({
				action : mCfg.URL.parser,	//?dummy=0
				method : "post"
			})
			.append($("<input type='hidden' name='sample'>").val(str))
			.appendTo("body")
			.submit()
			.remove();
		};
		
		if(reOverLenSuffix.test(fldVal)) {
			var nEqpDt = parseInt(refDynPaging.getFieldValue(rnum, "eqp_dt").substring(0,12));
			var query = "eqp_dt:[" + nEqpDt + "00 TO " + nEqpDt + "59] AND key:" + refDynPaging.getFieldValue(rnum, "key");
			
			$("body").requestData("log_field_view.json", {query:query, field_name:fldNm}, {callback : openParser});
		}
		else openParser(fldVal);
	},
	
	onCtxSameValue = function(key, opt) {
		var ctxFldNm = mState.sameValueMap[key].field;
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxSameValue[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		
		var fldVal = refDynPaging.getFieldValue(rnum, fldNm);
		 
		var ctxFldVal = refDynPaging.getFieldValue(rnum, ctxFldNm);

		var param = {
			expert_keyword : fldNm+":"+_SL.luceneValueEscape(fldVal) + " AND " + ctxFldNm + ":" + (ctxFldVal ? ctxFldVal : "")
		};
		refMng.openSearch(param);
	},
	
	onCtxNetflow = function(key, opt) {
		var sTimeRange = 30;
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxNetflow[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		
		var eqpDt = refDynPaging.getFieldValue(rnum, "eqp_dt");
		
		var startTime = _SL.formatDate.addMin(eqpDt,-(sTimeRange/2) + 1);
		var endTime = _SL.formatDate.addMin(startTime,sTimeRange);
		var curTime = _SL.formatDate();
		var diffTime = _SL.formatDate.diff(endTime,curTime);
		
		if(diffTime < 0) {
			startTime = _SL.formatDate.addMin(startTime, diffTime/60000);
			endTime = _SL.formatDate.addMin(endTime, diffTime/60000);
		}
		var param = {
				start_time : startTime,
				end_time : endTime,
				query : "data_type:TRAFFIC_LOG",
				s_field_nm : fldNm,
				s_field_val : refDynPaging.getFieldValue(rnum, fldNm)
			}
		 
		var $netFlowForm = $("#netFlowForm");
		
		if($netFlowForm.length == 0){
			$netFlowForm = $('<form id="netFlowForm">');
			
			 $.each(param, function(key, value){
				 $netFlowForm.append('<input type="hidden" name="'+ key +'">');
			 });
			 
			$("body").append($netFlowForm);
		}
		
		 $.each(param, function(key, value){
			 $('[name="'+ key +'"]', $netFlowForm).val(value);
		 });
		 
		 var winName = "netflow_popup_" + (new Date()).getTime();
		
		$netFlowForm.attr({
			action : mCfg.URL.netflowList,
			target : winName,
			method : 'post'
		}).submit();

	},
	
	onCtxCheckIp = function(key, opt) {
		var strUrl = mCfg.URL.ipCheck + "?asset=asset&search_ip="+opt.$trigger.text();
		new ModalPopup(strUrl, {width:850, height:580, setScroll:true});
	},

	codeBookCheckDisabled = function(key, opt) {
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) return true;
		
		return (gFldToCodes[fldNm] == null);
	},
	
	onCtxCodeBook = function(key, opt) {
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxCodeBook[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		
		var codeType = gFldToCodeTypes[fldNm];
		var codeId = refDynPaging.getFieldValue(rnum, fldNm);
		
		var params = {
			code_type	: codeType,
			field_name	: fldNm,
			code_id		: codeId
		};
		
		new ModalPopup(mCfg.URL.codeBookView + "?" + $.param(params, true), {width:640, height:425});
	},

	onCtxCheckVirus = function(key, opt) {
		var strUrl = mCfg.URL.virusTotal;// + "?search_txt="+opt.$trigger.text();
		var txt = opt.$trigger.text();
		
		new ModalPopup(strUrl, {width:850, height:580, setScroll:true, type:"post", data:{search_txt:txt}});
	},		
	
	onCtxEps = function(key, opt) {
		var relFldNm = "log_type_Name";
		var strId = key;

		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxEps[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}

		var fldVal = refDynPaging.getFieldValue(rnum, fldNm);
		
		var param = {
			expert_keyword : fldNm+":" + fldVal + " AND " + relFldNm + ":" + strId
		};
		
		refMng.openSearch(param);
	},
	
	onCtxLogType = function(key, opt) {
		var relFldNm = mState.relAnalInfoMap[key].field;
		var listId = mState.relAnalInfoMap[key].value.split(mCfg.idSeperator);
		
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxLogType[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		
		var fldVal = refDynPaging.getFieldValue(rnum, fldNm);
		 
		var param = {
			expert_keyword :
				fldNm+":"+fldVal + " AND "
					 + relFldNm + ":" + (listId.length > 1 ? "(" : "") + listId.join(" ") + (listId.length > 1 ? ")" : "")
		};
		refMng.openSearch(param);
	},
	
	onCtxStringCodec = function(key, opt) {
		var sTimeRange = 30;
		var reOverLenSuffix = new RegExp(gOverLengthSuffix + "$");
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onCtxStringCodec[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		var fldVal = refDynPaging.getFieldValue(rnum, fldNm);
		
		var param = {
				codec 	: "BASE64",
				method	: "ENC",
				org_txt : fldVal
		};
		//if(/[^0-9A-Fa-f]/.test(fldVal)) param.codec = 'URL';
		
		if(reOverLenSuffix.test(fldVal)) {
			var nEqpDt = parseInt(refDynPaging.getFieldValue(rnum, "eqp_dt").substring(0,12));
			var query = "eqp_dt:[" + nEqpDt + "00 TO " + nEqpDt + "59] AND key:" + refDynPaging.getFieldValue(rnum, "key");
			
			param.query = query;
			param.field_name = fldNm;
		}
		
		new ModalPopup(mCfg.URL.stringCodec, {type:"post", data:param, width:1000, height:530});
	},
	
	//공격명 도움말
	onAttackpatterncheckDisabled = function(key, opt) {
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) return true;
		
		return (fldNm != "attack_nm" );
	},
	
	onAttackpatternAdvice = function(key, opt) {
		var rnum = opt.$trigger.data("rowIndex");
		var fldNm = opt.$trigger.data("fieldName");

		if(!fldNm) {
			console.log("Invalid data-value!! >> onAttackpatternAdvice[rowIndex:%o, fieldName:%o]", rnum, fldNm);
			return;
		}
		
		var params = {
			attack_nm	: refDynPaging.getFieldValue(rnum, fldNm)
		};
			
		new ModalPopup(mCfg.URL.attackpatternAdvice + "?" + $.param(params, true), {width:640, height:425});
	},
	
	DUMMY = "";
	
	return {
		init : init
	};
}();
