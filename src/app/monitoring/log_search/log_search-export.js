'use strict';

_SL.nmspc("logsearch").export = function(){
	var
	// Reference Modules
	refMng, refDynPaging,

	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			btnExcel	: "#logBtns .btn-excel",
			
			dlg			: "#windowProgress",
			msg			: ".progress-msg",
			rateTxt		: ".progress-rate-txt",
			rateBox		: ".progress-rate-box",
			hiddenFrame	: "hiddenIFrame"
		},
		
		URL : {
			logExport	: URL_PATH + "log_search_export.do",
			exportStat	: URL_PATH + "log_export_stat.json",
			exportStop	: URL_PATH + "log_export_stop.do"
		}
	},
	
	m$ = {
		dlg				: $(mCfg.DOM.dlg)
	},

	mState = {
		$hFrm	: null,
		procId	: "",
		itvId	: 0
	},
	
	/*** Define Function ***/
	init = function() {
		refDynPaging	= slapp.logsearch.dynPaging;
		refMng			= slapp.logsearch.manager;
		
		//진행상태 Popup 초기화
		m$.dlg.jqxWindow({
			height:90, width:300, autoOpen:false, showCloseButton:true,
			keyboardCloseKey : 1, resizable:false, isModal:true, modalOpacity:0.5,
		});
		
		// Bind Event
		$(mCfg.DOM.btnExcel).on("click", showExportDlg);

		m$.dlg.find(".jqx-window-close-button").off("click").on("click", function() {
			_confirm("중지 하시겠습니까?", {onAgree : function() {stopCheckProcStat(true)} } );
		});
	},
	
	showExportDlg = function() {
		if (refDynPaging.isSearched() == false || refDynPaging.isCancel()) {
			_alert("검색 완료 후 실행하세요.");
			return;
		}
		if (refDynPaging.getTotal() > gMaxSaveLogCount) {
			_alert("전체 건수 : " + _SL.formatNumber(refDynPaging.getTotal()) + "건<br>" + _SL.formatNumber(gMaxSaveLogCount) + "건 이상은 다운로드 할 수 없습니다.");
			return;
		}
		
		_confirm("다운로드 하시겠습니까?", {onAgree : doExport});
	},
	
	doExport = function() {
		mState.procId = _SL.formatDate("yyyyMMddHHmmss");
		
		var param = {
			start_time	: refDynPaging.getStartTime() == gAllPeriodStartTime ? "" : refDynPaging.getStartTime(),
			end_time	: refDynPaging.getStartTime() == gAllPeriodStartTime ? "" : refDynPaging.getEndTime(),
			query		: refDynPaging.getQuery(), 
			mylogs_id	: refDynPaging.getMylogsId(),
			total		: refDynPaging.getTotal(),
			user_fields	: refDynPaging.getViewFields().join(","),
			proc_id		: mState.procId,
			separator	: ",",
			action 		: gLogSearchParam.action
		};
		
		// Export 실행
		refMng.submitToFrame(mCfg.URL.logExport, param);
		
		// 처리상태 체크 시작
		startCheckProcStat();
	},
	
	setMsg = function(msg) {
		m$.dlg.find(mCfg.DOM.msg).html(msg);
			
		if(!m$.dlg.jqxWindow("isOpen")) {
			m$.dlg.jqxWindow("open");
		}
	},
	
	setRate = function(n) {
		m$.dlg.find(mCfg.DOM.rateTxt).text(n + "%");
		m$.dlg.find(mCfg.DOM.rateBox).css("width", n + "%");
	},
	
	closeDlg = function() {
		m$.dlg.jqxWindow("close");
	},

	startCheckProcStat = function() {
		console.log("startCheckProcStat...");
		mState.itvId = setInterval(dispProcStat, 1000);
		setRate(0);
		setMsg("다운로드 파일 생성중입니다...");
	},
	
	stopCheckProcStat = function(bUser) {
		console.log("stopCheckProcStat... bUser : " + bUser);
		if(bUser) {
			setMsg("다운로드 중지중입니다...");
			$("body").requestData(mCfg.URL.exportStop, {proc_id : mState.procId}, {callback:function(){console.log("STOP");}});
		}
		else {
			if(mState.itvId > 0) {
				clearInterval(mState.itvId);
				mState.itvId = 0;
			}
			
			if(!bUser) if(m$.dlg.jqxWindow("isOpen")) closeDlg();
		}
	},
	// 진행 상태 표시
	dispProcStat = function() {
		$("body").requestData(mCfg.URL.exportStat, {proc_id : mState.procId}, {callback : function(rsJson, rsCd, rsMsg) {
			//console.log("export_stat.json result : " + JSON.stringify(rsJson));
			if(!!rsJson.stat) {
				if(rsJson.stat == "SEL" || rsJson.stat == "DWN") {
					var pct = rsJson.read_cnt == 0 ? 0 : Math.round(rsJson.read_cnt*100/rsJson.total_cnt,0);
					setRate(pct);
				}
				
				if(rsJson.stat != "SEL") {
					stopCheckProcStat(false);
				}
			}
			else stopCheckProcStat(false);
		}});
	},
	
	DUMMY = "";
	
	init();
	
}();
