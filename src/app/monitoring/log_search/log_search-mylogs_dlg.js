'use strict';

_SL.nmspc("logsearch").mylogsDlg = function(){
	var
	// Reference Modules
	refDynPaging,

	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			btnLogsSave		: "#btnLogsSave",
			
			dlg				: "#windowMylogsDlg",
			form			: "[name=mylogsDlgForm]",
			btnCancel		: ".btn-cancel"
		},
		
		URL : {
			groupList		: URL_PATH + "mylogs_group_list.json",
			userList		: gCONTEXT_PATH + "system/comuser_list_to_select.html",
			insert 			: URL_PATH + "mylogs_insert.do",
			saveToFile		: URL_PATH + "mylogs_to_file.do"
		}
	},
	
	m$ = {
		btnLogsSave	: $(mCfg.DOM.btnLogsSave),
		dlg			: $(mCfg.DOM.dlg),
		form		: $(mCfg.DOM.dlg + " " + mCfg.DOM.form)
	},
	
	/*** Define Function ***/
	init = function() {
		refDynPaging	= slapp.logsearch.dynPaging;
		
		//설정 창 만들기
		m$.dlg.jqxWindow({
			width: 640, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5,
			cancelButton : m$.dlg.find(mCfg.DOM.btnCancel),
			initContent:function(){
				slui.attach.setTransformSelect(mCfg.DOM.dlg);
			}
		});
		
		// Form
		m$.form	= $(mCfg.DOM.form, m$.dlg),
		
		/*** Bind Event ***/
		// 저장(로그검색 화면)
		m$.btnLogsSave.on("click", _checkSave);
		
		// 저장(Dialog)
		$(".btn-add", m$.form).on('click', _onClickSave);

		// 공유 추가/삭제
		$("[name=share_yn]", m$.form).on("click", _onChangeShare);
		$(".btn-mini", m$.form).on("click", function() {
			if($("[name=share_yn]:checked", m$.form).val() != "Y") return;
			
			var bPlusBtn = $(this).find("i").hasClass("icon-plus");
			var opt = $(this).closest("[data-opt]").attr("data-opt");
			
			if(bPlusBtn) {
				if(opt == "group")
					_addShareGroup();
				else
					new ModalPopup(mCfg.URL.userList, { width:900, height:600, draggable:true, onClose:_addShareUser });
			}
			else {
				$("[name=share_" + opt + "_list] :selected", m$.form).remove();
			}
		});
	},
	
	_addShareGroup = function() {
		var	val = $("[name=user_group_list]", m$.form).val();
		var txt = $("[name=user_group_list] :selected", m$.form).text();

		if(val == "") {
			_alert("기관을 선택하세요.");
			return;
		}
		
		if( $("[name=share_group_list] option", m$.form).is(
				function() {
					return this.value == val;
				}
		) ) {
			_alert("동일한 기관이 존재합니다.");
			return;
		}
			
		$("[name=share_group_list]", m$.form).append( new Option(txt, val) );	
	},
	
	_addShareUser = function() {
		var userSelList = slapp.user.listSel.getParam().userDataArr;
		var $shareUserList = $("[name=share_user_list]", m$.form);
		
		var curUserIds = {};
		
		$shareUserList.each(function() {
			curUserIds[$(this).val()] = $(this).text();
		});
		
		$.each(userSelList, function() {
			if(!curUserIds[this.user_id]) {
				$shareUserList.append(new Option(this.user_nm + " [" + this.user_id + "]", this.user_id));
			}
		});
	},
	
	_checkSave = function() {
		if($("[name=chk_idx]:checked").length == 0) {
			if(refDynPaging.getTotal() == 0) {
				_alert("저장할 로그가 없습니다.");
			}
			else if (!refDynPaging.isSearched() || refDynPaging.isCancel()) {
				_alert("검색 완료 후 실행하세요.");
			}
			else if(gMaxSaveLogCount > 0 && refDynPaging.getTotal() > gMaxSaveLogCount) {
				_alert("전체 건수 : " + _SL.formatNumber(refDynPaging.getTotal()) + "건\n" + _SL.formatNumber(gMaxSaveLogCount) + "건 이상은 저장하실 수 없습니다.");
			}
			else {
				_confirm("검색결과 전체를 저장하시겠습니까?", {onAgree : open});
			}
		}
		else open();
	},
	
	open = function() {
		var logList = [], vLog;
		
		m$.form[0].reset();
		
		m$.form.find("share_user_list").empty();
		m$.form.find("share_group_list").empty();
		
		$("[name=chk_idx]:checked").each(function(vIdx, vObj) {
			logList.push(refDynPaging.getLog(vObj.value));
		});

		$("[name=mylogs_list_json]", m$.form).val(JSON.stringify(logList));
		
		var initData = {
			mylogs_id		: "",
			mylogs_name		: "",
			mylogs_desc		: "",
			share_yn		: "N",
			search_stime	: refDynPaging.getStartTime(),
			search_etime	: refDynPaging.getEndTime(),
			search_query	: refDynPaging.getQuery(),
			search_count	: refDynPaging.getTotal(),
			save_count		: logList.length == 0 ? refDynPaging.getTotal() : logList.length
		};
		
		_SL.setDataToForm(initData, m$.form);
		
		_createMylogsGroupTree();
		
		_onChangeShare();
		
		m$.dlg.jqxWindow('open');
	},
	
	_createMylogsGroupTree = function() {
		$("body").requestData(mCfg.URL.groupList, {}, {callback : function(rsJsonList) {
			// 필드 트리 데이타 정의
			var oKeyMap = {};
			var oRootTree = null;
			var oCurRow, oParent;
			
			for(var idx in rsJsonList) {
				oCurRow = rsJsonList[idx];
				oKeyMap[oCurRow.group_id] = {title : oCurRow.group_name, isFolder : false, key : oCurRow.group_id, children : []};
				oParent = oKeyMap[oCurRow.parent_group_id];
				
				if(!!oParent) {
					oParent.children.push(oKeyMap[oCurRow.group_id]);
				}
				else {
					// Root
					oRootTree = oKeyMap[oCurRow.group_id];
				}
			}
			
			// 추가 필드 선택 select box에 Field 데이타 추가
			$("[name=group_id]", m$.form).empty();
			$("[name=group_id]", m$.form).append(new Option(oRootTree.title, oRootTree.key));
			
			//console.log("craete slSelectTree");
			
			// slSelectTree 초기화
			$("[name=group_id]", m$.form).slSelectTree({
		 		minExpandLevel : 2,
		 		autoFocus : true,
		 		clickFolderMode : 3,
				children : oRootTree
			});
		}});
	},
	
	_onChangeShare = function() {
		if ( $("[name=share_yn]:checked", m$.form).val() == "N" ){
			$("[name=user_group_list],[name=share_group_list],[name=share_user_list]", m$.form)
				.prop("disabled", true)
				.attr("selected", false);
			$("[name=user_group_list]").siblings('.tform-select').addClass('disabled');
			$(".btn-mini", m$.form).prop('disabled',true);
		}
		else{
			$("[name=user_group_list],[name=share_group_list],[name=share_user_list]", m$.form)
				.prop("disabled", false)
				.attr("selected", true);
			$("[name=user_group_list]").siblings('.tform-select').removeClass('disabled');
			$(".btn-mini", m$.form).prop('disabled',false);
		}
	},
	
	_onClickSave = function() {
		// validation
		if(!_SL.validate(m$.form)) return;
		
		var doSave = function() {
			var rqData = _SL.serializeMap(m$.form);
			
			if(rqData.share_yn != 'Y') {
				rqData.share_group_list = rqData.share_user_list = [];
			}
			
			$('body').requestData(mCfg.URL.insert, rqData, {callback : function(data, rsCd, rsMsg) {
				if(rqData.mylogs_list_json == "[]") {
					// 로그검색결과 파일로 저장 요청
					rqData.mylogs_id = data;
					
					$('body').requestData(mCfg.URL.saveToFile, rqData, {callback : function(rsJson, rsCd, rsMsg) {
						//console.log("rsCd : " + rsCd + ", rsMsg : " + rsMsg);
						
						if(rsCd.indexOf("SUC") != 0) {
							_alert(rsMsg);
						}
					}});
					
					rsMsg = "저장 요청 되었습니다.";
				}
				else rsMsg = "저장 되었습니다.";
				
				_alert(rsMsg, {	onAgree : _close });
			}});
		}
		
		_confirm("저장 하시겠습니까?", {onAgree : doSave});
	},
	
	_close = function() {
		m$.dlg.jqxWindow('close');
	},
	
	DUMMY = "";
	
	return {
		init : init
	};
}();
