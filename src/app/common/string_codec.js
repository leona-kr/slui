//# sourceURL=string_codec.js

'use strict';

_SL.nmspc("common").stringCodec = function(){
	var
	URL_PATH = gCONTEXT_PATH + "common/",
	
	mCfg = {
		DOM 			: {
			form		: "#formStringCodec"
		},
		URL				: {	
			stringCodec	: URL_PATH + "string_codec.json"
		},
		codecList		: ["BASE64","URL","HEX","MD5","SHA"],
		classTabGroup	: "tab-group",
		classCodecGroup : "stringcodec-group",
	},
	
	m$ = {
		form			: $(mCfg.DOM.form),
		tabs			: $(mCfg.DOM.form + " ." + mCfg.classTabGroup + " li")
	},
	
	mState = {
		codec		: null,
		method		: null,
		org_txt		: "",
		query		: "",
		field_name	: ""
	},
	
	/*** Define Function ***/
	init = function(param) {
		$.extend(mState, param);
	
		if(mState.codec != "") {
			var idx = $.inArray(mState.codec, mCfg.codecList);
			
			if(idx != -1) changeTab(idx);
			
			encode(mState.codec, mState.method);
		}

		m$.form.find("." + mCfg.classTabGroup + " li").click(function(e){
			e.preventDefault();
			changeTab($(this).index());
		});
		
		m$.form.find(".btn-basic").click(function(e){
			encode($(this).closest("." + mCfg.classCodecGroup).attr("data-codec"), "ENC");
		});
		
		m$.form.find(".btn-reverse").click(function(e){
			encode($(this).closest("." + mCfg.classCodecGroup).attr("data-codec"), "DEC");
		});
	},
	
	changeTab = function(idx){
		m$.tabs.removeClass("tab-item-active");
		m$.tabs.eq(idx).addClass("tab-item-active");
		
		m$.form.find("." + mCfg.classCodecGroup).hide();
		m$.form.find("." + m$.tabs.eq(idx).find("a").attr("href")).show();
	},
	
	encode = function(sCodec, sMethod) {
		var fromPrefix = null, toPrefix = null, txt;

		if($.inArray(sCodec, mCfg.codecList) == -1) return;
		
		if (sMethod == "ENC") {
			fromPrefix = "ta1_";
			toPrefix = "ta2_";
		}
		else if (sMethod == "DEC") {
			fromPrefix = "ta2_";
			toPrefix = "ta1_";
		}
		
		txt = m$.form.find("[name=" + fromPrefix + sCodec + "]").val();
		
		if(txt == "") {
			_alert("문자열을 입력하세요.");
			m$.form.find("[name=" + fromPrefix + sCodec + "]").focus();
		}
		
		$("body").requestData(mCfg.URL.stringCodec, {codec : sCodec, method : sMethod, org_text : txt}, {callback : function(rsData, rsCd, rsMsg) {
			if(rsCd.indexOf("SUC") == 0) {
				m$.form.find("[name=" + toPrefix + sCodec + "]").val(rsData);
			}
			else {
				_alert(rsMsg);
			}
		}});
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();
