//# sourceURL=virus_total.js
'use strict';

_SL.nmspc("virus").total = function(){
	var
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			form			: "#virusTotalInfo"
		},
		
		URL : {
			urlVirusTotal	: gCONTEXT_PATH + "common/virusTotal.json"
		}
	},
	
	m$ = {
		form				: $(mCfg.DOM.form),
		searchTxt			: $(mCfg.DOM.form + " [name=search_txt]"),
		urlTab				: $(mCfg.DOM.form + " .urlTab"),
		fileTab				: $(mCfg.DOM.form + " .fileTab"),
		fTab				: $(mCfg.DOM.form + " .tab-file"),
		btnGoSearch			: $(mCfg.DOM.form + " .form-button")
	},
	
	mState = {},
	
	/*** Define Function ***/
	init = function(param) {
		$.extend(mState, param);
		
		// Bind Event
		bindEvent();
		
		// 데이터 요청
		requestData();
	},
	
	bindEvent = function() {
		//검색
		m$.btnGoSearch.off().on('click',function() {
			if(!_SL.validate(m$.form)) return;
			
			requestData();
		});
		
		//탭 Change 이벤트
		m$.form.find(".config_tab li").click(function(){
			changeTab($(this).index());
		});
	},
	
	requestData = function() {
		loading.show();
		
		var param = {
				search_txt : m$.searchTxt.val()
			};
		
		$("body").requestData(mCfg.URL.urlVirusTotal, param, {callback : function(rsData) {
			loading.hide();
			
			var fileScanReport = rsData.fileScanReport,
				fileScanInfoArr = rsData.fileScanInfoArr,
				resultStr = rsData.resultStr,
				urlScanInfoArr = rsData.urlScanInfoArr,
				urlScanReport = rsData.urlScanReport,
				urlScans = rsData.urlScans,
				$urlTab = m$.urlTab,
				$fileTab = m$.fileTab,
				br = "<br>";
			
			// urlTab 부분
			$urlTab.empty();
			if(resultStr == '' || resultStr == null) {
				var $uTbl1 = $("<table>");
				var $uTbl2 = $("<table>");
				
				var positColor = "";
				if(urlScanReport.positives > 0) positColor = "red";
				else positColor = "green";
				
				var $tr1 = $("<tr>");
				$tr1.append('<td style="padding-right: 10px;font-weight: bold;">탐지 비율 :</td>');
				$tr1.append('<td style="color:' + positColor + ';">' + urlScanReport.positives + ' / ' + urlScanReport.total + '</td>');
				var $tr2 = $("<tr>");
				$tr2.append('<td style="padding-right: 10px;font-weight: bold;">분석 날짜 :</td>');
				$tr2.append('<td>' + urlScanReport.scanDate + ' UTC</td>');
				
				$uTbl1.append($tr1, $tr2);
				
				
				var $span1 = $("<span>" + urlScanReport.verboseMessage + "</span>");
				var $span2 = $('<span><a href="' + urlScanReport.permalink + '" />" target="_blank">' + urlScanReport.permalink + '</a></span>');
				
				var $tr3 = $("<tr>");
				$tr3.append('<td style="padding-right: 20px;font-weight: bold;">URL 검사기</td>');
				$tr3.append('<td style="font-weight: bold;">결과</td>');
				
				$uTbl2.append($tr3);
				
				for(var i in urlScanInfoArr) {
					var $tr = $("<tr>");
					var scanName = urlScanInfoArr[i];
					
					if(urlScans[scanName].detected) {
						$tr.append('<td style="padding-right:20px;">' + scanName + '</td>');
						$tr.append('<td style="padding-right:20px; color:red;">' + urlScans[scanName].result + '</td>');
					}
					else {
						$tr.append('<td style="padding-right: 20px;">' + scanName + '</td>');
						$tr.append('<td style="color:green;">' + urlScans[scanName].result + '</td>');
					}
					
					$uTbl2.append($tr);
				}
				
				$urlTab.append($uTbl1, br, $uTbl2, br, $span1, br, $span2);
			}
			else {
				$urlTab.append("There is no Search Result.<br>" + resultStr);
			}
			
			$fileTab.empty();
			if(resultStr == '' || resultStr == null) {
				// fileTab 부분
				if(fileScanReport != null) {
					m$.fTab.css("display", "block");
					
					$fTbl1 = $("<table>");
					$fTbl2 = $("<table>");
					
					var positColor = "";
					if(fileScanReport.positives > 0) positColor = "red";
					else positColor = "green";
					
					var $tr1 = $("<tr>");
					$tr1.append('<td style="padding-right: 10px;font-weight: bold;">MD5 :</td>');
					$tr1.append('<td>' + fileScanReport.md5 + '</td>');
					var $tr2 = $("<tr>");
					$tr2.append('<td style="padding-right: 10px;font-weight: bold;">SHA1 :</td>');
					$tr2.append('<td>' + fileScanReport.sha1 + '</td>');
					var $tr3 = $("<tr>");
					$tr3.append('<td style="padding-right: 10px;font-weight: bold;">SHA256 :</td>');
					$tr3.append('<td>' + fileScanReport.sha256 + '</td>');
					var $tr4 = $("<tr>");
					$tr4.append('<td style="padding-right: 10px;font-weight: bold;">탐지 비율 :</td>');
					$tr4.append('<td style="color:' + positColor + ';">' + fileScanReport.positives + ' / ' + fileScanReport.total + '</td>');
					var $tr5 = $("<tr>");
					$tr5.append('<td style="padding-right: 10px;font-weight: bold;">분석 날짜 :</td>');
					$tr5.append('<td>' + fileScanReport.scanDate + 'UTC</td>');
					
					$fTbl1.append($tr1, $tr2, $tr3, $tr4, $tr5);
					$fileTab.append($fTbl1, $br);
				}
				
				
				if(rsData.fileScans != null) {
					var $span1 = $("<span>" + fileScanReport.verboseMessage + "</span>");
					var $span2 = $('<span><a href="' + fileScanReport.permalink + '" />" target="_blank">' + fileScanReport.permalink + '</a></span>');
					
					var $tr1 = $("<tr>");
					$tr1.append('<td style="padding-right: 20px;font-weight: bold;">안티바이러스</td>');
					$tr1.append('<td style="padding-right: 20px;font-weight: bold;">결과</td>');
					$tr1.append('<td style="font-weight: bold;">업데이트</td>');
					$fTbl2.append($tr1);
					
					for(var i in fileScanInfoArr) {
						var $tr = $("<tr>");
						var scanName = fileScanInfoArr[i];
						
						if(fileScans[scanName].detected) {
							$tr.append('<td style="padding-right: 20px;">' + scanName + '</td>');
							$tr.append('<td style="padding-right: 20px;color: red;">' + fileScans[scanName].result + '</td>');
							$tr.append('<td>' + fileScans[scanName].update + '</td>');
						}
						else {
							$tr.append('<td style="padding-right: 20px;">' + scanName + '</td>');
							$tr.append('<td style="padding-right: 20px;color: green;">File not detected. (v' + fileScans[scanName].version + ')</td>');
							$tr.append('<td>' + fileScans[scanName].update + '</td>');
						}
						
						$fTbl2.append($tr);
					}
					
					$fileTab.append($fTbl2, $br, $span1, $br, $span2);
				}
			}
			else {
				m$.fTab.css("display", "none");
			}
			
			m$.form.parents('.nano').nanoScroller();
		}});
	},
	
	changeTab = function(idx){
		
		m$.form.find(".config_tab li").removeClass("tab-item-active");
		m$.form.find(".config_tab li").eq(idx).addClass("tab-item-active");
		
		switch(idx) {
			case 0 :
				m$.urlTab.css("display", "block"); 
				m$.fileTab.css("display", "none");
				break;
			case 1 :
				m$.urlTab.css("display", "none"); 
				m$.fileTab.css("display", "block");
				break;
		}
	},
	
	DUMMY;
	
	return {
		init : init
	};
}();

$(function(){
	slapp.virus.total.init();
});
