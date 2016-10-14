//# sourceURL=ipcheck.js
'use strict';

_SL.nmspc("ip").check = function(){
	var
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			form			: "#searchIpCheckInfo",
			ipChkInfo		: "#IpCheckInfo"
		},
		
		URL : {
			urlIpcheck		: gCONTEXT_PATH + "common/ipcheck.json"
		}
	},
	
	m$ = {
		form				: $(mCfg.DOM.form),
		info				: $(mCfg.DOM.ipChkInfo),
		searchIp			: $(mCfg.DOM.form + " [name=search_ip]"),
		asset				: $(mCfg.DOM.form + " [name=asset]"),
		whois				: $(mCfg.DOM.form + " [name=whois]"),
		whoisServer			: $(mCfg.DOM.form + " [name=whois_server]"),
		ping				: $(mCfg.DOM.form + " [name=ping]"),
		nmap				: $(mCfg.DOM.form + " [name=nmap]"),
		btnGoSearch			: $(mCfg.DOM.form + " .btn-submit")
	},
	
	mState = {},
	
	/*** Define Function ***/
	init = function(param) {
		$.extend(mState, param);
		
		//Bind Event
		m$.btnGoSearch.off().on('click',function() {
			if(!_SL.validate(m$.form)) return;
			
			if (m$.form.find("input:checkbox:checked").length == 0) {
				alert("한개 이상을 선택하셔야 합니다.");
				$("input[name=whois]").focus();
				return;
			}
			
			requestData(false);
		});
		
		// 데이터 요청
		requestData(true);
	},
	
	requestData = function(boo) {
		loading.show();
		
		var searchIp,
			asset,
			whois,
			whoisServer,
			ping,
			nmap;
		
		if(boo) {
			var param = {
					search_ip : m$.searchIp.val(),
					asset : m$.asset.val()
				};
		}
		else {
			searchIp = m$.searchIp.val();
			whoisServer = m$.whoisServer.val();
			if(m$.asset.is(":checked")) asset = m$.asset.val();
			if(m$.whois.is(":checked")) whois = m$.whois.val();
			if(m$.ping.is(":checked")) ping = m$.ping.val();
			if(m$.nmap.is(":checked")) nmap = m$.nmap.val();
			var param = {
					search_ip : searchIp,
					whois_server : whoisServer,
					asset : asset,
					whois : whois,
					ping : ping,
					nmap : nmap
				};
		}
		
		$("body").requestData(mCfg.URL.urlIpcheck, param, {callback : function(rsData) {
			loading.hide();
			
			var assetList = rsData.assetList,
				whoisInfo = rsData.whoisInfo,
				pingInfo = rsData.pingInfo,
				nmapInfo = rsData.nmapInfo;
			m$.info.empty();
			
			if(assetList == "EMPTY") {
				m$.info.empty();
				m$.info.append("<b>[ 자산 ]</b><br>There is no Search Result<br><br>");
			}
			else {
				for(var idx in assetList) {
					var data = assetList[idx];
					var eip = " ~ ";
					if(data.eip != "") eip += data.eip;
					
					m$.info.append("<b>[ 자산 ]</b><br>\
							자산명 : " + data.asset_nm + "<br>\
							자산 IP :" + data.sip + eip + "<br>\
							그룹 : " + data.group_nm + "<br>\
							부서 : " + data.department + "<br>\
							종류 : " + data.eqp_type_nm + "<br>\
							중요도 : " + data.weight_nm + "<br>\
							취약점 : " + data.weak_score_nm + "<br>\
							OS : " + data.os + "<br>\
							설명 : " + data.comments + "<br><br>");
				}
			}
			
			if(whoisInfo != null) {
				m$.info.append("<b>[ whois ]</b><br>" + whoisInfo + "<br><br>");
			}
			
			if(pingInfo != null) {
				m$.info.append("<b>[ ping ]</b><br>" + pingInfo + "<br><br>");
			}

			if(nmapInfo != null) {
				m$.info.append("<b>[ port-scan ]</b><br>" + nmapInfo + "<br>");
			}
			
			m$.form.parents('.nano').nanoScroller();
		}});
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();

$(function(){
	slapp.ip.check.init();
});
