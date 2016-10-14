//# sourceURL=rel_ruleset_form.js
'use strict';

_SL.nmspc("relRuleset").form = function(){

	var
	oRootTreeData = null,
	oTree = null,
	exNode = null,
	gRulesetDtlList,
	
	// Config 정의
	mCfg = {
		formId 		: '#formRelRuleset',
		urlSelect 	: gCONTEXT_PATH + "event2/rel_ruleset.json",
		urlDelete 	: gCONTEXT_PATH + "event2/rel_ruleset_delete.do",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlComConfigForm : gCONTEXT_PATH + 'sysdata/com_group_field_form.html',

		add : {
			action : gCONTEXT_PATH + "event2/rel_ruleset_add.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event2/rel_ruleset_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		rulesetId : $(mCfg.formId + ' [name=ruleset_id]'),
		times : $(mCfg.formId + ' [name=times]'),
		timeType : $(mCfg.formId + ' [name=time_type]'),
		viewFldSel : $(mCfg.formId + ' [name=view_field_sel]'),
		operand : $(mCfg.formId + ' [name=operand]'),
		rulesetType : $(mCfg.formId + ' [name=ruleset_type]'),
		searchQuery : $(mCfg.formId + ' [name=search_query]'),
		fltGrpFld : $(mCfg.formId + ' [name=filter_field]'),
		rstGrpFld : $(mCfg.formId + ' [name=result_field]'),
		limitCount : $(mCfg.formId + ' [name=limit_count]'),
		relTimes : $(mCfg.formId + ' [name=rel_times]'),
		rulesetTreeTd : $(mCfg.formId + ' .relRulesetTreeTd'),
		characterLimit: $(mCfg.formId + ' [name=character_limit]'),
		viewFld : $(mCfg.formId + ' [name=view_field]'),
		eventCateCodeType : $(mCfg.formId + ' .btn-register-event-cate')
		
	},

	// 현재 상태 변수
	mState = {
		isNew : m$.rulesetId.val() == "" ? true : false,
		mode : m$.rulesetId.val() == "" ? mCfg.add : mCfg.update
	},
	
	init = function(){
		//조건필드 결과필드 초기화
		groupFieldInit();

		// 데이타 조회
		if(!mState.isNew){
			select();
		}else{
			TreeManager.init();
			TreeManager.btnInit();
			//표시필드 관련 초기화
			myViewFieldsInit();	
		}
		
		changeEventInit();
		
		//이벤트 Binding
		bindEvent();
		
		// DOM 설정 
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}

		setTimeout(function(){
			slui.attach.setTransformSelect(mCfg.formId);
		},100);
	},
	
	groupFieldInit = function() {
		m$.fltGrpFld.chosen({
			width: "100%",
			search_contains : true,
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 10
		});

		m$.rstGrpFld.chosen({
			width: "100%",
			search_contains : true,
			placeholder_text_multiple :"[선택하세요]",
			max_selected_options : 10
		});
		
		$(".treeForm .chosen-results").css("max-height","100px");
		$(".treeForm .chosen-choices").css("max-height","55px").css("min-height","55px")
			.css("overflow-y","auto").css("cursor","default").css("background-image","none");
	},
	
	
	changeEventInit = function() {
		
		m$.rulesetType.change(function(){

			if( m$.rulesetType.val() == 1  ){
				m$.searchQuery.prop("disabled",false);
				m$.fltGrpFld.prop("disabled",false);
				m$.relTimes.prop("disabled",false);

				m$.searchQuery.val("");
				m$.fltGrpFld.setSelectionOrder([],true);
				m$.rstGrpFld.setSelectionOrder([],true);
				m$.relTimes.val("0");
				
				var $input = $("<input type='text' name='limit_count' class='form-input' value='' style='width:70px;' maxlength='10' data-valid='조건,required,number'>");
				var $span = $("<span> 건 이상</span>");
				var $limitCntParent = m$.form.find("[name=limit_count]").parent('td:eq(0)');
				
				$limitCntParent.empty().append($input).append($span);

			}else{
				m$.searchQuery.prop("disabled",true);
				m$.fltGrpFld.prop("disabled",true);
				m$.rstGrpFld.prop("disabled",true);
				m$.relTimes.prop("disabled",true);

				m$.searchQuery.val("");
				m$.fltGrpFld.setSelectionOrder(["eqp_ip"],true);
				m$.rstGrpFld.setSelectionOrder(["eqp_ip"],true);
				m$.relTimes.val("0");
				
				var $selectWrap = $('<span />').addClass('form-select-outer').css({
					'display':'inline-block',
					'width':'70px',
					'vertical-align':'middle'
				});
				var $select = $("<select name='limit_count' class='form-select' style='width:70px;' data-valid='조건,required'></select>");
				$.each(gEventLevelsJson, function(idx, elm) {
					$select.append($("<option>").append(elm).val(idx));
				});
				var $span = $("<span> 이상</span>");
				var $limitCntParent = m$.form.find("[name=limit_count]").parents('td:eq(0)');
				
				$selectWrap.append($select);
				$limitCntParent.empty().append($selectWrap).append($span);
			}

			var activateNode = oTree.getActiveNode();
			var formData = TreeManager.getData();
			activateNode.setTitle(formData.title);
			slui.attach.setTransformSelect(mCfg.formId);
		});
		
		m$.fltGrpFld.on('change',function(evt, params){
			var activateNode = oTree.getActiveNode();
			if(activateNode != null && activateNode.data.dto.seq_no != 0){
				var filterField = m$.fltGrpFld.val();

				if(params.deselected){//조건필드를 삭제할때 getSelectionOrder와 change이벤트가 제대로 동작 안해서 따로 처리해줌..
					var fldArr = m$.fltGrpFld.getSelectionOrder();
					var idx = fldArr.indexOf(params.deselected)
					fldArr.splice(idx,1);
					m$.fltGrpFld.setSelectionOrder(fldArr,true);
				}
				
				if(!filterField){
					m$.rstGrpFld.prop("disabled",true);
					m$.rstGrpFld.val("");
				}else{
					m$.rstGrpFld.prop("disabled",false);
				}
				m$.rstGrpFld.trigger('chosen:updated');

				var formData = TreeManager.getData();
				activateNode.setTitle(formData.title);
			}
		});
		
		m$.operand.change(function(){
			var activateNode = oTree.getActiveNode();		
			if(activateNode != null && activateNode.data.dto.seq_no != 0){
				if(activateNode.hasChildren()){
					if( m$.operand.val() == "NOT"){
						_alert("하위 룰셋이 있어 수정할 수 없습니다.",{
							onAgree : function(){
								m$.operand.val(activateNode.data.dto.operand);
							}
						});
					}
				}
			}
		});
					
		m$.rstGrpFld.on('change',function(evt, params){
			var activateNode = oTree.getActiveNode();
			if(activateNode != null && activateNode.data.dto.seq_no != 0){

				if(params.deselected){//조건필드를 삭제할때 getSelectionOrder와 change이벤트가 제대로 동작 안해서 따로 처리해줌..
					var fldArr = m$.rstGrpFld.getSelectionOrder();
					var idx = fldArr.indexOf(params.deselected)
					fldArr.splice(idx,1);
					m$.rstGrpFld.setSelectionOrder(fldArr,true);
				}
				
				if(activateNode.hasChildren()){
					if( m$.rstGrpFld.val() == ""){
						_alert("하위 룰셋이 있어 수정할 수 없습니다.",{
							onAgree : function(){
								m$.rstGrpFld.val(activateNode.data.dto.rst_grp_fld);
							}
						});
					}
				}
				var formData = TreeManager.getData();
				activateNode.setTitle(formData.title);
			}
		});
		
		m$.searchQuery.keyup(function(){
			var activateNode = oTree.getActiveNode();
			if(activateNode != null && activateNode.data.dto.seq_no != 0){
				var formData = TreeManager.getData();
				activateNode.setTitle(formData.title);
			}
		});	
		
	},
	
	myViewFieldsInit = function() {
		
		m$.viewFldSel.chosen({
			search_contains : true,
			placeholder_text_multiple :"[선택하세요]"
		});
		
		//표시필드에 필드가 입력된 순서대로 초기값 넣기 
		var sViewFld = m$.viewFld.val();
		if(sViewFld != ""){
			var sViewFldArr = sViewFld.split(',');
			
			for(var idx in sViewFldArr){
				var tField = sViewFldArr[idx];
				if(!gFieldCapsJson[tField]){
					gFieldCapsJson[tField] = "undefined";
					$("#view_field_sel").append("<option value='"+tField+"'>undefined["+tField+"]</option>");
				}
			}
			m$.viewFldSel.setSelectionOrder(sViewFldArr,true);
		}
	},	
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);

		//체크주기이벤트
		setTimes();
		m$.timeType.on("change",setTimes);
		
		//이벤트종류 등록버튼
		m$.form.find('.btn-register-event-cate').exModalPopup(mCfg.urlComCodeForm+'?code_type='+m$.eventCateCodeType.data('value'), {
			width:550,
			height:455,
			onClose: function(){
				_addCode(m$.form.find('[name=event_cate_cd]'));
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
		
		//기준필드 등록버튼
		m$.form.find('.btn-group-fld-add').exModalPopup(mCfg.urlComConfigForm, {
			width:470,
			height:295,
			draggable: true,
			onClose: function(){
				_addGroupField();
			}
		});

	},
	
	select = function() {
		var
			rulesetId = m$.rulesetId.val(),
			rqData = {'ruleset_id': rulesetId},
			
			callback = function(data){
				_SL.setDataToForm(data, m$.form);//기본정보
				gRulesetDtlList = data.rulesetDtlList;

				TreeManager.init();
				TreeManager.btnInit();
				//표시필드 관련 초기화
				myViewFieldsInit();
			};			
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
		
	},
	
	onSave = function(){
		var chkCnt = 0;
		var characterLimit = m$.characterLimit.val();
		var searchQueryLength = m$.searchQuery.val();
		var searchQueryLengthInt = Number(searchQueryLength.length);
		
		if(!_SL.validate(m$.form.find("[name=event_nm]")))	return;	
		
		if(searchQueryLengthInt >= characterLimit){
			_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte<br>입력가능길이는: " +characterLimit+"byte입니다.");
			return;
		}
		
		if(!oTree.getNodeByKey("0").hasChildren()){
			_alert("이벤트 룰셋을 등록해 주세요");
			return;
		}
		
		if(exNode != null && exNode.data.dto.seq_no != 0 ){
			if(!TreeManager.nodeValidate())	return;
			
			var activateNode = oTree.getActiveNode();
			if(activateNode != null){
				var formData = TreeManager.getData();
				$.extend(true, activateNode.data.dto, formData )
				activateNode.setTitle(formData.title);
			}
		}	
			
		var viewFlds =m$.viewFldSel.getSelectionOrder();
		var joinViewFlds = $.map(viewFlds, function(obj) { return obj;}).join();
		//$("#view_field").val();
		
		// 이벤트 룰셋 정보  변환
		var dtlList=[];
		
		oTree.visit(function(node){
			var dto = node.data.dto;
			if(dto.seq_no != 0){
				dtlList.push(dto);
			}
		});
		
		$('body').requestData(mState.mode.action,$.extend({},_SL.serializeMap(m$.form),{ruleset_dtl_json:dtlList,view_field:joinViewFlds}), {
			callback : function(rsData, rsCd, rsMsg){
				_alert(rsMsg, {
					onAgree : function(){
						onClose(true,rsData.top_code);
					}
				});	
			}
		});	
	},
		
	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {ruleset_id:m$.rulesetId.val()}, {
					callback : function(rsData, rsCd, rsMsg){
						_alert(rsMsg, {
							onAgree : function(){
								onClose(afterClose);
							}
						});
					}
				});
			}
		});
	},

	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	},
	
	setTimes = function(){
		var gTimeUnit = {
				"1" : [1,2,3,5,10,15,30],
				"2" : [1,2,3,6,12],
				"3" : [1]
		};

		var $sTimesObj = m$.times;
		var $sTimesTypeObj = m$.timeType;
		var sType = $sTimesTypeObj.val();
		var oTimes = $sTimesObj.empty(); 
		
		if(sType != "") {
			for(var i in gTimeUnit[sType]) {
				oTimes.append('<option value="'+gTimeUnit[sType][i]+'">'+gTimeUnit[sType][i]+'</option>');
			}

			$('[value="1"]', '[name=times]')[0].selected = true;
		}
		
		if(sType == "1" || sType == "2") $sTimesObj.show();
		else $sTimesObj.hide();
	},
	
	TreeManager ={
			
			init : function(){
				var initData = TreeManager.getInitData();
				initData.seq_no = 0;
				initData.dtl_ord_no = 0;
				
				oRootTreeData = {
						title : "START", 
						key : "0", 
						dto :initData ,
						isFolder : true,
						children : []
				};

				m$.rulesetTreeTd.dynatree({
					minExpandLevel : 99,
					autoFocus: true,
					clickFolderMode: 3,
					onActivate: function(node) {
						//event_dtl_validate
						if(exNode != null && exNode.data.dto.seq_no != 0 && exNode != node ){
							if( !TreeManager.nodeValidate() ){
								exNode.activate();
								exNode.focus();
								return;
							}
							
							var formData = TreeManager.getData();
						
							$.extend(true, exNode.data.dto ,formData);
							exNode.setTitle(formData.title);
						}
						
						exNode = node;
						
						TreeManager.rulesetTypechangeEvent(node.data.dto);
						
						m$.rulesetType.val(node.data.dto.ruleset_type);
						m$.operand.val(node.data.dto.operand);				
						m$.searchQuery.val(node.data.dto.search_query);
						
						var fltGrpFldArr = node.data.dto.flt_grp_fld.split(",");
						var rstGrpFldArr = node.data.dto.rst_grp_fld.split(",");

						if(node.data.dto.flt_grp_fld !=""){
							initGrpFld(m$.fltGrpFld,fltGrpFldArr);
						}else{
							m$.fltGrpFld.find("option").prop("selected", false);
							m$.fltGrpFld.trigger('chosen:updated');
						} 
						
						if(node.data.dto.rst_grp_fld !=""){
							initGrpFld(m$.rstGrpFld,rstGrpFldArr);
						}else{
							m$.rstGrpFld.find("option").prop("selected", false);
							m$.rstGrpFld.trigger('chosen:updated');
						}
						
						m$.form.find("[name=limit_count]").val(node.data.dto.limit_count);
						m$.relTimes.val(node.data.dto.rel_times);
						
						if(node != null && node.data.dto.seq_no != 0){
							var formData = TreeManager.getData();			
							node.setTitle(formData.title);
						}
						
						if(node.data.dto.dtl_ord_no == 0) m$.form.find(".treeForm").hide();
						else m$.form.find(".treeForm").show();
					},
					children : [oRootTreeData]
				});
				
			
				oTree = m$.rulesetTreeTd.dynatree("getTree");
				
				var tempNode  = oTree.getNodeByKey("0");
				tempNode.activate();
				
				if(!mState.isNew){//수정일때
					for(var idx in gRulesetDtlList){
						var pKey = gRulesetDtlList[idx].p_seq_no;//dtl_ord_no순으로 불러오기 때문에 parent만 찾아서 appen해주면 끝
					
						var title = "<" ;
						
						title += gRulesetTypes[gRulesetDtlList[idx].ruleset_type];
						if(gRulesetDtlList[idx].ruleset_type == 1){
							if(gRulesetDtlList[idx].flt_grp_fld != "") title += " - " + gRulesetDtlList[idx].flt_grp_fld;
							if(gRulesetDtlList[idx].rst_grp_fld != "") title += " / " + gRulesetDtlList[idx].rst_grp_fld;
							title += ">";
							title += gRulesetDtlList[idx].search_query;
						}else{
							title += ">";
						}
						
						oTree.getNodeByKey(pKey.toString()).addChild({
							title : title, 
							key : gRulesetDtlList[idx].seq_no, 
							dto : gRulesetDtlList[idx],
							icon : false,
							children : []
						});
					
						//가장 첫번째 child에 focus
						if(idx == 0){
							var tempNode  = oTree.getNodeByKey( (gRulesetDtlList[idx].seq_no).toString() );
							tempNode.activate();
						}
					}
				}
			},
			
			btnInit : function(){
				m$.form.find(".btn-plus").click(function(){
					var activateNode = oTree.getActiveNode();
					if(activateNode != null){
										
						//event_dtl_validate
						if(activateNode.data.dto.seq_no != 0){//START에서 추가하지 않을때
							if( !TreeManager.nodeValidate() ) return;
							var formData = TreeManager.getData();	
							
							$.extend(true, exNode.data.dto , formData);
							exNode.setTitle(formData.title);
							
							if(formData.operand == "NOT"){
								_alert("NOT연산에는 하위 룰셋을 설정 할 수 없습니다.");
								return;
							}else if(formData.rst_grp_fld==""){
								_alert("결과필드가 없으면 하위 룰셋을 설정 할 수가 없습니다.");
								return;
							}
						}
						
						var initData = TreeManager.getInitData();
						
						var maxSeqNo = 0, seqNo, maxDtlOrdNo = 0 , dtlOrdNo;
						if(activateNode.hasChildren()){//child가 있다면 자식들 중 가장 마지막 dtl_ord_no를 구한후+1 해서 새로 추가될 node의 dtl_ord_no로 사용
							
							oTree.getActiveNode().visit(function(node){
								if(maxDtlOrdNo < node.data.dto.dtl_ord_no){
									maxDtlOrdNo = node.data.dto.dtl_ord_no;
								}					
							});
							dtlOrdNo = maxDtlOrdNo + 1	
						}else{//child가 없다면 부모의 dtl_ord_no + 1을 새로 추가될 node의 dtl_ord_no로 사용
							
							dtlOrdNo = activateNode.data.dto.dtl_ord_no + 1
						}

						//node들 전부 뒤져서 seq_no중 가장 높은 숫자 구해서 node의 key값으로 사용 & dtl_ord_no를 재설정
						oTree.visit(function(node){
							if(maxSeqNo < node.data.dto.seq_no){
								maxSeqNo = node.data.dto.seq_no;
							}
							
							if(dtlOrdNo <= node.data.dto.dtl_ord_no){//dtl_ord_no를 재설정
								node.data.dto.dtl_ord_no += 1 ;
							}
						});
						seqNo = maxSeqNo + 1;//추가되는 node의 key값!!
						
						initData.p_seq_no = activateNode.data.dto.seq_no;
						initData.seq_no =  seqNo;
						initData.dtl_ord_no = dtlOrdNo;
						initData.dtl_depth = activateNode.getLevel();
						
						var newNode = activateNode.addChild({
							title : "New", 
							key : initData.seq_no, 
							dto : initData,
							focus : true,
							children : []
						});
						exNode = newNode;
						exNode.activate();
					}else{
						console.log("선택된노드없습니다.")
					}
					slui.attach.setTransformSelect(mCfg.formId);
				});
				
				m$.form.find(".btn-minus").click(function(){
					var activateNode = oTree.getActiveNode();
					if(activateNode != null){
						var dto = activateNode.data.dto;
						//1.START는 삭제되면 안돼
						if(dto.seq_no == 0) return;

						//1번 Node를 삭제하면 전체 삭제 된다. 
						if(dto.seq_no == 1){
							_confirm("전체를 삭제하시겠습니까?",{
								onAgree : function(){
									oTree.getNodeByKey("0").removeChildren();
								}
							});
						}else if(activateNode.hasChildren()){//2.자식이 있을 경우와 없을 경우 경고문구 다르고 삭제 후 dtl_ord_no 없데이트
							_confirm("하위 룰셋도 함께 삭제 합니다.",{
								onAgree : function(){
									oTree.visit(function(node){
										if(dto.dtl_ord_no < node.data.dto.dtl_ord_no){
											var delNodeCnt = activateNode.countChildren() + 1;
											node.data.dto.dtl_ord_no -= delNodeCnt ;
										}
									});
									activateNode.remove();
								}
							});
						}else{
							_confirm("삭제하시겠습니까?",{
								onAgree : function(){
									oTree.visit(function(node){
										if(dto.dtl_ord_no < node.data.dto.dtl_ord_no){
											node.data.dto.dtl_ord_no -= 1 ;
										}
									});
									activateNode.remove();
								}
							});
						}
						exNode = null;
					}else{
						console.log("선택된노드없습니다.")
					}	
				});
			},

			nodeValidate : function(){
				if(m$.rulesetType.val() == 2) return true;
				if(!_SL.validate("#formRelRuleset [name=search_query]")) return false;
				
				var characterLimit = m$.characterLimit.val();
				var searchQueryLength = m$.searchQuery.val();
				var searchQueryLengthInt = Number(searchQueryLength.length);
				
				if(searchQueryLengthInt >= characterLimit){
					_alert("검색어의 현재입력길이: " + searchQueryLengthInt + "byte<br>입력가능길이는: " +characterLimit+"byte입니다.");
					return;
				}
				 
				if(exNode.hasChildren()){
					if( m$.rstGrpFld.val() == ""){
						_alert("하위 룰셋이 존재합니다.<br>결과필드를 선택해 주세요");
						return false;
					}
				}
				if(!_SL.validate("#formRelRuleset [name=limit_count]")) return false;

				return true;
			},
			
			getInitData : function(){
				return {
					operand : "AND",
					ruleset_type : "1",
					search_query : "",
					flt_grp_fld : "",
					rst_grp_fld : "",
					rel_times : "0"
				};
			},
			
			getData : function(){

				var data = {
					operand : m$.operand.val(),
					ruleset_type : m$.rulesetType.val(),
					search_query : m$.searchQuery.val(),
					flt_grp_fld : m$.fltGrpFld.getSelectionOrder().join(),
					rst_grp_fld : m$.rstGrpFld.getSelectionOrder().join(),
					limit_count : m$.form.find("[name=limit_count]").val(),
					rel_times : m$.relTimes.val()
				};
					
				var title = "<" ;
				title += gRulesetTypes[data.ruleset_type];
				if(data.ruleset_type == 1){
					if(data.flt_grp_fld != "") title += " - " + data.flt_grp_fld;
					if(data.rst_grp_fld != "") title += " / " + data.rst_grp_fld;
					title += ">";
					title += data.search_query;
				}else{
					title += ">";
				}
					
				data.title = title;
				
				return data;
			},
			
			rulesetTypechangeEvent : function(dto){
				if( dto.ruleset_type == 1  ){
					m$.searchQuery.prop("disabled",false);
					m$.fltGrpFld.prop("disabled",false);
					m$.rstGrpFld.prop("disabled",false);
					m$.relTimes.prop("disabled",false);
					
					m$.relTimes.val("0");
					
					if( dto.flt_grp_fld == "" ){
						m$.rstGrpFld.prop("disabled",true);
						m$.rstGrpFld.val("");
					}else{
						m$.rstGrpFld.prop("disabled",false);
					}
					
					var $input = $("<input type='text' name='limit_count' class='form-input' value='' style='width:70px;' maxlength='10' data-valid='조건,required,number'>");
					var $span = $("<span> 건 이상</span>");
					var $limitCntParent = m$.form.find("[name=limit_count]").parent('td:eq(0)');
					
					$limitCntParent.empty().append($input).append($span);

				}else{
					m$.searchQuery.prop("disabled",true);
					m$.fltGrpFld.prop("disabled",true);
					m$.rstGrpFld.prop("disabled",true);
					m$.relTimes.prop("disabled",true);
					
					m$.searchQuery.val("");
					m$.fltGrpFld.val("eqp_ip");
					m$.rstGrpFld.val("eqp_ip");
					
					m$.relTimes.val("0");
					
					var $selectWrap = $('<span />').addClass('form-select-outer').css({
						'display':'inline-block',
						'width':'70px',
						'vertical-align':'middle'
					});
					var $select = $("<select name='limit_count' class='form-select' data-valid='조건,required'></select>");
					$.each(gEventLevelsJson, function(idx, elm) {
						$select.append($("<option>").append(elm).val(idx));
					});
					var $span = $("<span> 이상</span>");
					var $limitCntParent = m$.form.find("[name=limit_count]").parent('td:eq(0)');

					$selectWrap.append($select);
					$limitCntParent.empty().append($selectWrap).append($span);
				}
				slui.attach.setTransformSelect(mCfg.formId);
			}
		},
		
	 initGrpFld = function($fldSel,fldArr){
		for(var idx in fldArr){
			var tField = fldArr[idx];
			if(!gFieldCapsJson[tField]){
				gFieldCapsJson[tField] = "undefined";
				$fldSel.append("<option value='"+tField+"'>undefined["+tField+"]</option>");
			}else if($.inArray(tField,grpFldArr) < 0){
				$fldSel.append("<option value='"+tField+"'>"+gFieldCapsJson[tField] + "["+tField+"]</option>");
			}
		}
		
		$fldSel.setSelectionOrder(fldArr,true);
	},
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();
		$fld.append('<option value="'+data.code_id+'" selected="selected">'+data.code_name+'</option>');
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	_addGroupField = function(){
		var data = slapp.comGroupField.form.getCode();
		
		var fltFldArr = m$.fltGrpFld.getSelectionOrder();
		var rstFldArr = m$.rstGrpFld.getSelectionOrder();
		
		m$.fltGrpFld.empty();
		m$.rstGrpFld.empty();
		
		for(var i in data){
			m$.fltGrpFld.append($("<option value='"+ data[i] +"'>"+gFieldCapsJson[data[i]]+"("+ data[i] +")</option>"));
			m$.rstGrpFld.append($("<option value='"+ data[i] +"'>"+gFieldCapsJson[data[i]]+"("+ data[i] +")</option>"));
		}
		
		m$.fltGrpFld.setSelectionOrder(fltFldArr,true);
		m$.rstGrpFld.setSelectionOrder(rstFldArr,true);
		
		m$.fltGrpFld.trigger("chosen:updated");
		m$.rstGrpFld.trigger("chosen:updated");
		
		slui.attach.setTransformSelect(mCfg.formId);
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.relRuleset.form.init();
});