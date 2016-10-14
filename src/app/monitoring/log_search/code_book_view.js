//# sourceURL=code_book.js

'use strict';

_SL.nmspc("logsearch").codeBookView = function(){
	var
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			form			: "#formLogsearchCodeBook",
			
			btnAddKeyword	: ".btn-add-keyword"
		},
		
		URL : {
			codeBookView	: gCONTEXT_PATH + "monitoring/code_book_view.json"
		}
	},
	
	m$ = {
		form				: $(mCfg.DOM.form),
		codeId				: $(mCfg.DOM.form + " [name='code_id']"),
		codeInfo			: $(mCfg.DOM.form + " [name='code_info']"),
		btnAddKeyword		: $(mCfg.DOM.form + " " + mCfg.DOM.btnAddKeyword)
	},
	
	mState = {},
	
	/*** Define Function ***/
	init = function(param) {
		$.extend(mState, param);

		//Bind Event
		m$.codeId.on("change", onChangeCodeId);
		
		m$.btnAddKeyword.on("click", onClickAddKeyword);
		
		// 데이터 요청
		requestData();
	},
	
	requestData = function() {
		$("body").requestData(mCfg.URL.codeBookView, {code_type : mState.code_type}, {
			displayLoader : true,
			callback : function(rsData) {
				m$.codeId.html('<option value="-1">[선택하세요]</option>');
				
				var strTxt, strLen, strRealLen, code, ch; 
				$.each(rsData, function(idx, data) {
					strTxt = data.code_name;
					strLen = 0;
					strRealLen = 0;
					
					for(var i = 0; i < strTxt.length; i++) {
						code = strTxt.charCodeAt(i);
						ch = strTxt.substr(i, 1).toUpperCase();
						code = parseInt(code);
						if((ch < "0" ||ch > "9") && (ch < "A" || ch > "Z") && (code > 255 || code < 0)) strLen = strLen + 2;
						else strLen++;
						
						strRealLen++;
						if(strLen > 100) {
							strTxt = strTxt.substr(0, strRealLen) + "...";
							break;
						}
					}
					
					$("<option/>").attr({
						'value' : data.code_id,
						'title' : data.code_name
					})
					.text(strTxt)
					.data("info", data)
					.appendTo(m$.codeId);
				});
				
				m$.codeId
					//.val(mState.code_id)
					.trigger("change");

				slui.attach.setTransformSelect(mCfg.DOM.form);
			}
		});
	},
	
	onChangeCodeId = function() {
		mState.code_id = m$.codeId.val();
		if(mState.code_id == '-1') return false;
		var data = m$.codeId.find(":selected").data("info");
		
		var cont = "";
		if(data != null) {
			cont = cont + "코드 : " + ((data.code_id != null) ? data.code_id : "")+ "\n";
			cont = cont + "코드명 : " + ((data.code_name != null) ? data.code_name : "") + "\n";
			cont = cont + "부가정보1 : " + ((data.flag1 != null) ? data.flag1 : "") + "\n";
			cont = cont + "부가정보2 : " + ((data.flag2 != null) ? data.flag2 : "") + "\n";
			cont = cont + "코드설명 : " + ((data.code_cont != null) ? data.code_cont : "");
		}
		
		m$.codeInfo.val(cont);
	},
	
	onClickAddKeyword = function() {
		//console.log("addkeyword.logsearch");
		$("body").trigger("addkeyword.logsearch", [mState.field_name, mState.code_id]);
		m$.form.find("[data-layer-close=true]").click();
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();
