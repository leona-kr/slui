//# sourceURL=attackpattern_advice.js

'use strict';

_SL.nmspc("logsearch").attackpatternAdvice = function(){
	var
	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		DOM : { form		: "#formLogsearchAttackpatternAdvice" },
		URL : {	advice		: URL_PATH + "attackpattern_advice.json" }
	},
	
	m$ = {
		form				: $(mCfg.DOM.form)
	},
	
	mState = {},
	
	/*** Define Function ***/
	init = function(param) {
		$.extend(mState, param);
		
		// 데이터 요청
		requestData();
	},
	
	requestData = function() {
		$("body").requestData(mCfg.URL.advice, {s_bbs_typ_cd : "3", s_attack_nm : mState}, {callback : function(list){
			var cont="";
			if(list != null && list.length > 0){
				for(var idx in list) {
					cont += list[idx].bd_cont + "\n";
				}
				//m$.form.find("[name=attackpattern_name]").text(attackNm);
				m$.form.find("[name=attackpattern_advice_cont]").html(cont);
			}else{
				setTimeout(function() {_alert("해당 공격명으로 등록된 도움말이 없습니다.");}, 15);
			}
		}});
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();
