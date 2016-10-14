//# sourceURL=log_psr_form.js
'use strict';

_SL.nmspc("parser").logForm = function(){
	
	var
	// Config 정의
	mCfg = {
		formId : '#formLogParser',
		parserTreeId : '#parserTree',
		
		urlSelect : gCONTEXT_PATH + "management/log_psr_form.json",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlXmlCheck : gCONTEXT_PATH + "management/arr_log_psr_xml_check.json",
		urlLogPsrNameCheck : gCONTEXT_PATH + "management/arr_log_parser_name_exist.json",
		urlParserGenerator : gCONTEXT_PATH + "management/parser_generator.do?menu_idx=1",
		urlChkDelete : gCONTEXT_PATH + "management/log_psr_check_delete.json",
		urlDelete : gCONTEXT_PATH + "management/log_psr_delete.do",
		urlNewForm : gCONTEXT_PATH + 'management/log_parser_manager_form.html',
		urlLoadForm : gCONTEXT_PATH + 'management/log_parser_list.html',
		urlUpdOrder : gCONTEXT_PATH + 'management/log_parser_ord_no_update.do',
		
		save : {
			action : gCONTEXT_PATH + "management/log_psr_save.do",
			message : "저장 하시겠습니까?",
		}
	},
	// JQuery 객체 변수
	m$ = {
		// form
		form : $(mCfg.formId),
		
		// Tree Div
		parserTree : $(mCfg.parserTreeId),
		dynTree : $(mCfg.parserTreeId + ' .dynTree'),

		// 구분Option tr space
		trHandleOpt1 : $(mCfg.formId + ' #handle_opt_1_wrap'),
		trHandleOpt2 : $(mCfg.formId + ' #handle_opt_2_wrap'),
		
		trLogCateValue : $(mCfg.formId + ' #log_cate_value_wrap'),
		comment1 : $(mCfg.formId + ' #comment1'),
		
		// 기본정보
		psrId : $(mCfg.formId + ' [name=psr_id]'),
		logPsrId : $(mCfg.formId + ' [name=log_psr_id]'),
		logPsrNm : $(mCfg.formId + ' #log_psr_nm'),
		logCateCd : $(mCfg.formId + ' [name=log_cate_cd]'),
		logTypeCd : $(mCfg.formId + ' [name=log_type_cd]'),
		
		//구분정보
		handleType : $(mCfg.formId + ' [name=handle_type]'),
		handleOptChar : $(mCfg.formId + ' [name=handle_opt_1_char]'),
		handleOptIndex : $(mCfg.formId + ' [name=handle_opt_1_index]'),
		handleOpt : $(mCfg.formId + ' [name=handle_opt]'),
		logCateValue : $(mCfg.formId + ' [name=log_cate_value]'),
		defaultOpt : $(mCfg.formId + ' [name=default_opt]'),
		
		//파서정보
		sample : $(mCfg.formId + ' #sample'),
		psrXml : $(mCfg.formId + ' #psr_xml'),
		description : $(mCfg.formId + ' #description'),
		
		// 로그분류 등록 값
		categoryCode : $(mCfg.formId + ' .btn-register-category').data('value'),
	},
	
	nodeInfo = {
		exNode : null
	},
	
	init = function(){
		
		// 이벤트 Binding
		bindEvent();

		ParserManager.init();
		ParserManager.load();
		
		m$.parserTree.draggable({
			handle: ".area-head"
		});
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);

		// 로그 분류 등록 버튼
		m$.form.find('.btn-register-category').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.categoryCode, {
			width:550,
			height:455,
			onClose: function(){
				_addCode(m$.logCateCd);
			}
		});

		// 로그파서 구분방법 Change
		m$.handleType.change(ViewManager.changeHandleType);
		
		
		m$.form.find('.btn-new').exModalPopup(mCfg.urlNewForm, {
			width:800,
			height:500,
			onClose : function(){
				
			}
		});
		
		m$.form.find('.btn-register').exModalPopup(mCfg.urlLoadForm, {
			width:1100,
			height:620,
			setScroll : true,
			onClose : function(){
				
			}
		});
		
		m$.defaultOpt.change(function(){
			m$.defaultOpt.is(":checked") ? m$.logCateValue.prop("disabled",true).val("[[@default]]") : m$.logCateValue.prop("disabled",false).val("")
		});
	},
	
	selectLogParser = function(list){
		ViewManager.connectLogParser(list);
	},
	
	addLogParser = function(data){
		ViewManager.addLogParser(data);
	},
	
	onSave = function(){
		ParserManager.save();
	},
	
	onDelete = function(){
		ParserManager.remove();
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},

	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();

		$fld.append('<option value="'+data.code_id+'">'+data.code_name+'</option>');
		$fld.val(data.code_id);

		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	ViewManager = {
			connCtxNode : null,	// 불러오기 팝업 호출때 선택한 로그타입 노드
			winCtx : null,		// 불러오기 팝업 Window객체
			loadTree : function(data) {
				var oTree = m$.dynTree.dynatree("getTree");
				var pNode = oTree.getNodeByKey("log_type_cd_" + data.log_type_cd);
				data.dtoType = "load";//"new" (신규,등록) | "load" (DB load노드) | "change" (DB load노드 값 변경)
				
				pNode.addChild({
					title : data.log_psr_nm,
					key : data.log_type_cd + "_log_psr_id_" + data.log_psr_id,
					dto : data
				});
				
				if(!pNode.data.dto) {
					pNode.data.dto = {
						handle_type	: data.handle_type,
						handle_opt	: data.handle_opt,
						psr_id	: data.psr_id,
						log_type_cd	: data.log_type_cd
					}
				}
			},
			showForm : function(node, bEdit) {
				var data = node.data.dto || {}, vHandleOpt;
				
				// Focused된 트리리스트레벨이 로그파서단이면 폼하위태그 활성화
				if(node.getLevel() === 3){
					m$.form.find(".btn-register-category").show();
					m$.form.find('.btn-save').show();
					m$.form.find('.btn-delete').show();
				}else{
					data.handle_type = -1;
					m$.form.find(".btn-register-category").hide();
					m$.form.find('.btn-save').hide();
					m$.form.find('.btn-delete').hide();
				}
				
				m$.logTypeCd.val(data.log_type_cd || node.data.key.replace(/log_type_cd_/g, ""));
				m$.handleType.val(data.handle_type || "-1");
				m$.handleOpt.val(data.handle_opt || "");	
				m$.defaultOpt.prop("checked", false);
				m$.logCateValue.prop('disabled',false);
				
				var vHandleType = m$.handleType.val();
				
				m$.form.find("#ranges-default_opt").css("display", "none");
				m$.form.find("#ranges-comment1").css("display", "none");

				m$.trHandleOpt2.jqxTooltip('destroy');
				m$.logCateValue.jqxTooltip('destroy');
				
				switch(vHandleType) {// 로그파서구분방법에 따른 툴팁 초기화
				case "2" :// Regular Expression
					m$.trHandleOpt2.jqxTooltip({ content: tooltip1, position: 'mouse'});
					break;
				case "3" :// IndexOf
					m$.logCateValue.jqxTooltip({ content: tooltip2, position: 'mouse'});
					m$.form.find("#ranges-default_opt").css("display", "block");
					m$.form.find("#ranges-comment1").css("display", "block");
					
					if(data.log_cate_value == "[[@default]]"){// Default 체크여부
						m$.logCateValue.prop("disabled",true);
						m$.defaultOpt.prop("checked", true);
					}else{
						m$.defaultOpt.prop("checked", false);
					}
								
					break;
				default :
					break;
				}		
				
				if(vHandleType == "1" || vHandleType == "2") {
					$("#handle_opt_" + vHandleType + "_wrap").show();
					if(vHandleType == "1") {
						vHandleOpt = m$.handleOpt.val();
						if(vHandleOpt != "") {
							var vHandleOptList = vHandleOpt.split("|");
							var vHandleOptIndex = "";
							if(vHandleOptList.length == 2) vHandleOptIndex = parseInt(vHandleOptList[1]) + 1;
							m$.handleOptChar.val(vHandleOptList[0].replace(new RegExp(SEPARATOR_PIPE_STR, "g"), "|"));
							m$.handleOptIndex.val(isNaN(vHandleOptIndex) ? "" : vHandleOptIndex);
						}
						m$.trHandleOpt2.hide();
					}
					else {
						m$.trHandleOpt1.hide();
					}
				}
				else {
					m$.trHandleOpt1.hide();
					m$.trHandleOpt2.hide();
				}
				
				if(vHandleType != "-1") {
					m$.trLogCateValue.show();
				}
				else {
					m$.trLogCateValue.hide();
				}
				
				// LOG PARSER
				m$.logPsrId.val(data.log_psr_id || "");
				m$.logPsrNm.text(data.log_psr_nm || "");
				m$.logCateCd.val(data.log_cate_cd || 0);
				m$.logCateValue.val(data.log_cate_value || "");
				m$.sample.text(data.sample || "");
				m$.psrXml.text(data.psr_xml || "");
				m$.description.text(data.description || "");
				
				m$.form.find("[name=p_log_psr_nm]").val(data.log_psr_nm || "");
				m$.form.find("[name=p_log_cate_cd]").val(data.log_cate_cd || "");
				m$.form.find("[name=p_log_cate_value]").val(data.log_cate_value || "");
				m$.form.find("[name=p_handle_type]").val(data.handle_type || "");
				m$.form.find("[name=p_handle_opt]").val(data.handle_opt || "");
				
			},
			getDataFormPage : function(chkValue) {
				
				if(chkValue && !_SL.validate(":visible")) {
					return null;
				}

				return {
					psr_id : m$.psrId.val(),
					log_psr_id : m$.logPsrId.val(),
					log_type_cd : m$.logTypeCd.val(),
					log_cate_cd : m$.logCateCd.val(),
					p_log_cate_cd : m$.form.find("[name=p_log_cate_cd]").val(),
					handle_type : m$.handleType.val(),
					handle_opt : m$.handleType.val() == 1 ? m$.handleOptChar.val().replace(/\|/g, SEPARATOR_PIPE_STR) + "|" + (parseInt(m$.handleOptIndex.val()) - 1) : m$.handleOpt.val(),
				
					// LOG PARSER
					log_psr_nm : m$.logPsrNm.text(),
					psr_xml : m$.psrXml.text(),
					sample : m$.sample.text(),
					log_cate_value : m$.logCateValue.val(),
					description : m$.description.text(),
					p_log_cate_value : m$.form.find("[name=p_log_cate_value]").val(),
					p_handle_type : m$.form.find("[name=p_handle_type]").val(),
					p_handle_opt : m$.form.find("[name=p_handle_opt]").val(),
					// is_changed : 로그분류와 구분정보값을 변경했을 때 true ,변경하지 않았을 때 false
					is_changed : (m$.form.find("[name=p_log_cate_cd]").val() == m$.logCateCd.val() &&
							      m$.form.find("[name=p_handle_type]").val() == m$.handleType.val() &&
							      m$.form.find("[name=p_handle_opt]").val() ==  (m$.handleType.val() == 1 ? m$.handleOptChar.val().replace(/\|/g, SEPARATOR_PIPE_STR) + "|" 
															+ (parseInt(m$.handleOptIndex.val()) - 1) : m$.handleOpt.val()) &&
								  m$.form.find("[name=p_log_cate_value]").val() == m$.logCateValue.val()) ? false : true ,
				};
			},
			
			addNode : function(node, data, bSilent) {
				node.deactivate();
				
				node.addChild({
					title : data.log_psr_nm,
					key : data.log_type_cd + "_conn_log_psr_id_" + data.log_psr_id,
					dto : data
				});

				node.data.dto = {
					handle_type	: data.handle_type,
					handle_opt	: data.handle_opt,
					psr_id	: data.psr_id,
					log_type_cd	: data.log_type_cd
				}
				if(!bSilent) ViewManager.activate(data.log_type_cd + "_conn_log_psr_id_" + data.log_psr_id);
			},
			
			updateNode : function(node, data) {
				node.setTitle(data.psr_nm);
				node.data.dto = data;
				
				node.getParent().data.dto = {
					handle_type	: data.handle_type,
					handle_opt	: data.handle_opt,
					psr_id	: data.psr_id,
					log_type_cd	: data.log_type_cd
				}
			},
			
			deleteNode : function(node) {
				var pNode = node.getParent();
				node.remove();
				nodeInfo.exNode = null;
				if(!pNode.hasChildren()) {
					pNode.data.dto = null;
					delete pNode.data.dto;
				}
				
				ViewManager.activate(pNode.data.key);
			},
				
			activate : function(key) {
				m$.dynTree.dynatree("getTree").activateKey(key);
			},
			
			// Event Handler
			changeHandleType : function() {
				m$.trHandleOpt1.hide();
				m$.trHandleOpt2.hide();
				
				m$.form.find("#ranges-default_opt").css("display", "none");
				m$.form.find("#ranges-comment1").css("display", "none");
				
				m$.trHandleOpt2.jqxTooltip('destroy');
				m$.logCateValue.jqxTooltip('destroy');
				
				var handleType = m$.handleType.val();
				switch(handleType) {// 로그파서구분방법에 따른 툴팁
				case "-1" :// None
					m$.handleOptChar.val("");
					m$.handleOptIndex.val("");
					m$.handleOpt.val("");
					m$.logCateValue.prop("disabled",false).val("");
					
					m$.trLogCateValue.hide();
					break;
				case "1" :// Separator
					if(m$.form.find('[name=p_handle_type]').val() == 1){
						var vHandleOptList = m$.form.find("[name=p_handle_opt]").val().split("|");
						var vHandleOptIndex = "";
						if(vHandleOptList.length == 2) vHandleOptIndex = parseInt(vHandleOptList[1]) + 1;
						
						m$.handleOptChar.val(vHandleOptList[0].replace(new RegExp(SEPARATOR_PIPE_STR, "g"), "|"));
						m$.handleOptIndex.val(isNaN(vHandleOptIndex) ? "" : vHandleOptIndex);
						m$.handleOpt.val(m$.form.find("[name=p_handle_opt]").val());
						m$.logCateValue.prop("disabled",false).val(m$.form.find("[name=p_log_cate_value]").val());
					}else{
						m$.handleOptChar.val("");
						m$.handleOptIndex.val("");
						m$.handleOpt.val("");
						m$.logCateValue.prop("disabled",false).val("");
					}
					
					m$.trLogCateValue.show();
					m$.form.find("#handle_opt_" + handleType + "_wrap").show();
					break;
				case "2" :// Regular Expression
					if(m$.form.find('[name=p_handle_type]').val() == 2){
						m$.handleOpt.val(m$.form.find("[name=p_handle_opt]").val());
						m$.logCateValue.prop("disabled",false).val(m$.form.find("[name=p_log_cate_value]").val());
					}else{
						m$.handleOptChar.val("");
						m$.handleOptIndex.val("");
						m$.handleOpt.val("");
						m$.logCateValue.prop("disabled",false).val("");
					}
					
					m$.trLogCateValue.show();
					m$.form.find("#handle_opt_" + handleType + "_wrap").show();
					m$.trHandleOpt2.jqxTooltip({ content: tooltip1, position: 'mouse'});
					break;
				case "3" :// IndexOf
					if(m$.form.find('[name=p_handle_type]').val() == 3){
						m$.logCateValue.val(m$.form.find("[name=p_log_cate_value]").val());
						
						if(m$.form.find("[name=p_log_cate_value]").val() == "[[@default]]"){
							m$.logCateValue.prop("disabled",true);
							m$.defaultOpt.prop("checked",true);
						}else{
							m$.logCateValue.prop("disabled",false);
							m$.defaultOpt.prop("checked",false);
						}
					}else{
						m$.handleOptChar.val("");
						m$.handleOptIndex.val("");
						m$.handleOpt.val("");
						m$.logCateValue.prop("disabled",false).val("");
						m$.defaultOpt.prop("checked",false);
					}
					
					m$.trLogCateValue.show();
					m$.logCateValue.jqxTooltip({ content: tooltip2, position: 'mouse'});
					m$.form.find("#ranges-default_opt").css("display", "block");
					m$.form.find("#ranges-comment1").css("display", "block");
					
					break;
				default :
					break;
				}
			},
			
			contextMenuCallback : function(key, opt) {
				
				var node = $.ui.dynatree.getNode(opt.$trigger);
				var tmpDto = ViewManager.getDataFormPage(false); 
				var childNodes, notLogPsrIds, strUrl, idx;
				
				switch(key) {
				case "new" :
					ViewManager.connCtxNode = node;
					ViewManager.winCtx = m$.form.find('.btn-new').trigger('click');
					ViewManager.winCtx.fnCallback = addLogParser;
					break;

				case "conn" :
					var activeNode = m$.dynTree.dynatree("getActiveNode");
					
					if(activeNode.getLevel() === 3 && !ViewManager.getDataFormPage(true)) return;
					
					if(node.hasChildren()) {
						childNodes = node.getChildren();
						notLogPsrIds = new Array();
						
						for(idx in childNodes) {
							notLogPsrIds[notLogPsrIds.length] = childNodes[idx].data.dto.log_psr_id;
						}
						
					};
					
					ViewManager.connCtxNode = node;

					ViewManager.winCtx = m$.form.find('.btn-register').trigger('click');	
					ViewManager.winCtx.fnCallback = selectLogParser;
					break;
				default :
					_alert("잘못된 메뉴 입니다.");
					break;
				}
			},
			connectLogParser : function(list) {
				
				var pNode = ViewManager.connCtxNode;
				var logTypeCd = pNode.data.key.replace(/log_type_cd_/g, "");
				var childLogPsrIds = new Array();
				var connLogPsrIds = new Array();
				var connLogPsrObj = new Array();
				var childNodes, data, bExistSameNode = false;
				var idx;
				
				if(!pNode) {
					_alert("불러올 로그타입이 선택되지 않았습니다.");
					return;
				}
				
				if(list && list.length > 0) {
					childNodes = pNode.getChildren();
			
					if(childNodes) {
						for(idx in childNodes) {
							childLogPsrIds[childNodes[idx].data.dto.log_psr_id] = childNodes[idx].data.dto.log_psr_nm;
						}
					}
					// 로그타입 및 구분방법 체크, 동일 로그파서를 제외한 로그파서 추출
					for(idx in list) {
						data = list[idx];
					
						if(!childLogPsrIds[data.log_psr_id]) {
							connLogPsrIds[connLogPsrIds.length] = data.log_psr_id;					
							connLogPsrObj[connLogPsrObj.length] = $.extend(true, {}, data);
						}else{
							bExistSameNode = true;
						}
					}
					
		 			if(connLogPsrIds.length == 0) {
						_alert((bExistSameNode ? "동일한 로그파서외 " : "") + "불러올 수 있는 로그파서가 없습니다.");
						return;
					}else{
						
						for(var i = 0; i < connLogPsrObj.length; i++) {
							connLogPsrObj[i].psr_id = m$.psrId.val();
							connLogPsrObj[i].log_type_cd = logTypeCd;
							connLogPsrObj[i].dtoType = "new"; //"new" (신규,등록) | "load" (DB load노드) | "change" (DB load노드 값 변경)
							ViewManager.addNode(pNode, connLogPsrObj[i], (i != connLogPsrObj.length -1));									
						}
						
						_alert((bExistSameNode ? "동일한 로그파서외 " : "") + connLogPsrObj.length + "건 처리 되었습니다.");								
								
						if(ViewManager.winCtx) {
							ViewManager.winCtx = null;
						}else{
							_alert("처리중 에러가 발생했습니다.<br> 다시 실행하세요." + textStatus);
						}								
	
					}
				}
			},
			
			addLogParser : function(data){
				var node = ViewManager.connCtxNode;
	 			var newNode = node.addChild({
	 				title : data.log_psr_nm,
	 				key : node.data.key.replace(/log_type_cd_/g, "") + "_new_log_psr_id_" + data.log_psr_id,
	 				dto : data,
	 				focus : true
	 			});	
	 			
	 			newNode.data.dto.log_type_cd = node.data.key.replace(/log_type_cd_/g, "");
	 			newNode.data.dto.dtoType = "new";//"new" (신규,등록) | "load" (DB load노드) | "change" (DB load노드 값 변경)
	 			newNode.activate();
	 			
				if(ViewManager.winCtx) {
					ViewManager.winCtx = null;
				}else{
					_alert("처리중 에러가 발생했습니다.<br> 다시 실행하세요.");
				}
			}
		},
		
		ParserManager = {
			init : function() {
				// Parser 트리 초기화
				m$.dynTree.dynatree({
					minExpandLevel : 2,
					onActivate: function(node) {
						var dtoType = node.data.dto ? node.data.dto.dtoType : null;
						var tmpDto = ViewManager.getDataFormPage(false); 
						var exNode = nodeInfo.exNode;
						
						if(exNode != null && exNode.getLevel() && exNode.getLevel() === 3){
							if(!ViewManager.getDataFormPage(true)){
								$.extend(true, exNode.data.dto ,tmpDto);
								nodeInfo.exNode.focus();	
								nodeInfo.exNode.activate();				
							}else{
								var data = ViewManager.getDataFormPage(true);
								if(exNode.data.dto.dtoType == "load" && data.is_changed){
									data.dtoType = "change"; //"new" (신규,등록) | "load" (DB load노드) | "change" (DB load노드 값 변경)
								}
								$.extend(true, nodeInfo.exNode.data.dto ,data);
								ViewManager.showForm(node, false);
								nodeInfo.exNode = node;								
							}
						}else{
							ViewManager.showForm(node, true);
							nodeInfo.exNode = node;
						}
						
						slui.attach.setTransformSelect(mCfg.formId);
						
					},
					persist: false,
					dnd: {
						onDragStart: function(node) {
							
							if(node.getLevel() < 3 || node.data.dto.log_cate_value == "[[@default]]") {
								return false;
							}
							
							return true;
						},
						preventVoidMoves: true,
						onDragEnter: function(node, sourceNode) {
						
							if(node.parent !== sourceNode.parent || (node.data.dto && node.data.dto.log_cate_value == "[[@default]]")) {
								return false;
							}
							
							return ["before", "after"];
						},
						onDragOver: function(node, sourceNode, hitMode) {
						  // Prevent dropping a parent below it's own child
						  if(node.isDescendantOf(sourceNode)){
						    return false;
						  }
						  // Prohibit creating childs in non-folders (only
							// sorting allowed)
						  if( !node.data.isFolder && hitMode === "over" ){
						    return "after";
						  }
						},
						onDrop: function(node, sourceNode, hitMode, ui, draggable) {
							_confirm("순서를 변경하시겠습니까?",{
								onAgree : function(){
									sourceNode.move(node, hitMode);
									
									var nodeList = node.parent.getChildren();
									// TODO 순서 변경된(nodeList의 index + 1 !=
									// node.data.dto.ord_no) node들 Update 처리
									ParserManager.resetTreeOrdNo(nodeList);
								}
							});
						}
					},
					children: [
						{title : _SL.htmlEscape(psrInfoData.psr_nm), icon : false,
							children : [
								{title : "Security", key : "log_type_cd_1", isFolder : true},
								{title : "Traffic", key : "log_type_cd_2", isFolder : true},
								{title : "System", key : "log_type_cd_3", isFolder : true},
								{title : "SMS", key : "log_type_cd_4", isFolder : true}
							]
						}
					]
				});
				
				// ContextMenu 초기화
				$.contextMenu({
					selector:".dynatree-node",
					events: {show : function(opt) {
						return opt.$trigger.hasClass("dynatree-folder");
					}},
					callback:ViewManager.contextMenuCallback,
					items:{
						"new" :  {name : "신규"},
						"conn" : {name : "등록"}
					}
				});
			},
			
			resetTreeOrdNo : function(nodeList){
				var index;
				if(nodeList != null){
					for(var i = 0 ; i < nodeList.length; i++ ){
						index = i + 1;
						
						if(index != nodeList[i].data.dto.ord_no ){
							if(nodeList[i].data.dto.log_cate_value == "[[@default]]"){
								nodeList[i].data.dto.ord_no = 999;
							}else{
								nodeList[i].data.dto.ord_no = index;
							}

							$('body').requestData(mCfg.urlUpdOrder, {log_psr_id : nodeList[i].data.dto.log_psr_id, psr_id : nodeList[i].data.dto.psr_id, ord_no : nodeList[i].data.dto.ord_no}, {
								callback : function(rsData, rsCd, rsMsg){}
							});
						}
					}
				}	

			},
			
			load : function() {
				var key = "log_type_cd_1";
				
				$('body').requestData(mCfg.urlSelect, {psr_id : m$.psrId.val() }, {
					callback : function(rsData, rsCd, rsMsg){
						
						for(var i = 0; rsData != null && i < rsData.length; i++) {
							ViewManager.loadTree(rsData[i]);

							if(i == 0){
								key =  rsData[0].log_type_cd + "_log_psr_id_"+ rsData[0].log_psr_id 
							}
							
						}

						ViewManager.activate(key);
					}
				});
			},
			
			save : function() {
				
				var node = m$.dynTree.dynatree("getActiveNode");
				var tmpDto = ViewManager.getDataFormPage(false); 

				if(!ViewManager.getDataFormPage(true)) return;
		 		
				if(node.data.dto.dtoType == "load" && tmpDto.is_changed){
					tmpDto.dtoType = "change";
				}
				
		 		$.extend(true, node.data.dto ,tmpDto);
		 		
				var isInvalidate = false; // 유효성 체크 변수
				var strMsg;  // 유효성 체크메세지 변수
				var strKey;  // 유효성 체크 Node Key 변수
				
				var allNode = ParserManager.logPsrToArray();
				// for문 돌며 모든 노드들의 유효성 체크
				/* Outer Foreach Start */
				$.each(allNode, function(outerIdx, outerObj) {
					
					if(isInvalidate) return false;

					$.each(allNode, function(innerIdx, innerObj) {
						/*Inner Foreach Start */
						// 구분방법,구분Option,구분 값 유효성 체크 Start
						if(outerIdx != innerIdx){
							if(outerObj.log_type_cd == innerObj.log_type_cd){
								if(outerObj.handle_type == -1){
									strMsg = "로그파서["+outerObj.log_psr_nm+"]의 구분 방법이 None이므로<br>하나의 로그파서만 사용할 수 있습니다.";
									strKey = outerObj.key;
									isInvalidate = true;
									return false;
								}else if(outerObj.handle_type != innerObj.handle_type){
									strMsg = "같은 로그타입 내 로그파서<br>구분방법이 서로 다릅니다.";
									strKey = innerObj.key;
									isInvalidate = true;
									return false;
								}else if(outerObj.handle_opt != innerObj.handle_opt){
									if(outerObj.handle_type != 3){
										strMsg = "같은 로그타입 내 로그파서<br>구분Option이 서로 다릅니다.";
										strKey = innerObj.key;
										isInvalidate = true;
										return false;
									}
								}else if(outerObj.log_cate_value == innerObj.log_cate_value){
									strMsg = "같은 로그타입 내 로그파서<br>구분값이 서로 중복됩니다.";
									strKey = innerObj.key;
									isInvalidate = true;
									return false;
								}
							}
						}
						// 구분방법,구분Option,구분 값 유효성 체크 End
					});
					/* Inner Foreach End */
				});
				/* Outer Foreach End */
				
				if(isInvalidate){//유효성 체크하여 이상이 있을 시 메세지 처리 후 return
					 _alert(strMsg);
					 ViewManager.activate(strKey);
					 return false;
				 }else{
					_confirm("저장 하시겠습니까?", {
						onAgree : function(){
							$('body').requestData(mCfg.save.action, {logPsrList : JSON.stringify(allNode)}, {
								callback : function(rsData, rsCd, rsMsg){
									_alert(rsMsg, {
										onAgree : function() {
											//파서리스트 reload
											var oTree = m$.dynTree.dynatree("getTree");
											oTree.reload();
											ParserManager.load();
										}
									});
								}
							});
						}
					});			
				 }
			},
			
			logPsrToArray : function() {
				var list = [];
		
				var oTree = m$.dynTree.dynatree("getTree");
		
				oTree.visit(function(node){
					if(node.getLevel() == 3  && node.data.dto){
						node.data.dto.key = node.data.key;
						/*if(node.data.dto.handle_type == 3){
							node.data.dto.
						}*/
						list.push(node.data.dto);
					}
				});
		
				return list;		
			},
			
			remove : function() {
				var node = m$.dynTree.dynatree("getActiveNode");
				var data = ViewManager.getDataFormPage(false);
				var nLogPsrId = nLogPsrId = parseInt(data.log_psr_id,10);
				var strMsg;

				var delNode = function(){
					ViewManager.deleteNode(node, data);
					var nodeList = node.parent.getChildren();
					ParserManager.resetTreeOrdNo(nodeList);
					_alert('삭제 되었습니다.');
				}
				
				if(node.data.dto.dtoType == 'load'){
					
				var submit = function(){
					_confirm(strMsg ? strMsg : "삭제하시겠습니까?", {
						onAgree : function(){
							$('body').requestData(mCfg.urlDelete, data, {
								callback : function(rsData, rsCd, rsMsg){
									delNode();
								}
							});
						}
					});
				}

				$('body').requestData(mCfg.urlChkDelete, data, {
					callback : function(rsData, rsCd, rsMsg){
						if(rsData.CONN_CNT == undefined){
							_alert("연동 여부 체크에 실패했습니다.<br> 다시 시도하세요.");
							return;
						}else if(rsData.CONN_CNT > 1){
							strMsg = "연동중인 파서입니다.<br>삭제 하시겠습니까?";
						}
						
						submit();
					}
				});	
					
				}else{
					_confirm("삭제하시겠습니까?", {
						onAgree : function(){
							delNode();	
						}
					});
				}
			}
		};

	return {
		init: init,
		selectLogParser : selectLogParser,
		addLogParser : addLogParser
	};

}();

$(function(){
	slapp.parser.logForm.init();
});