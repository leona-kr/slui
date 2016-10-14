//# sourceURL=big_stats_manager_form.js
'use strict';

_SL.nmspc("bigStatsManager").form = function(){

	var
	oRootTreeData = null,
	oTree = null,
	exNode = null,
	gDatasetlList = null,
	gOrgFileFieldCaptions,
	gOrgDbCaptions,
	datasetList,
	itemList,
	
	// Config 정의
	mCfg = {
		formId : '#formBigStatsManager',
		urlSelect 			: gCONTEXT_PATH + "analysis/big_stats_manager.json",	
			
		urlLoadBigStatsList	: gCONTEXT_PATH + 'analysis/load_big_stats_list_form.html',
		urlLoadBigStats 	: gCONTEXT_PATH + 'analysis/big_stats_manager.json',
		urlLoadFileList		: gCONTEXT_PATH + 'analysis/load_big_file_list_form.html',
		urlLoadBigFileData 	: gCONTEXT_PATH + 'analysis/load_big_file_data.json',
		urlLoadBigDbData	: gCONTEXT_PATH + 'analysis/load_big_db_data.do',
		
		urlChkLastCode 		: gCONTEXT_PATH + 'analysis/check_last_bigcode.do',
		urlStopBigStats 	: gCONTEXT_PATH + 'analysis/big_stats_stop.do',
		urlLoadBigDbData	: gCONTEXT_PATH + 'analysis/load_big_db_data.do',
		urlAutoJoinField	: gCONTEXT_PATH + 'analysis/get_auto_join_field.do',
				
		add : {
			action : gCONTEXT_PATH + "analysis/big_stats_insert.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "analysis/big_stats_retry.do",
			message : "재실행 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {		
		form : $(mCfg.formId),
		bigCode : $(mCfg.formId + ' [name=big_code]'),
		scheduleId : $(mCfg.formId + ' [name=schedule_id]'),
		pageType : $(mCfg.formId + ' [name=page_type]'),
		
		status : $(mCfg.formId + ' [name=status]'),
		procPct : $(mCfg.formId + ' [name=proc_pct]'),
		lastCodeYn : $(mCfg.formId + ' [name=last_code_yn]'),
		
		schStartTime : $(mCfg.formId + ' [name=schStartTime]'),
		schEndTime : $(mCfg.formId + ' [name=schEndTime]'),
		
		datasetTreeTd : $(mCfg.formId + ' .dataset_tree_td'),
		itemListTable : $(mCfg.formId + ' .item_list_table'),	
		
		statsNm : $(mCfg.formId + ' [name=stats_nm]'),

		genCycleType :   $(mCfg.formId + ' [name=mixed_gen_cycle_type]'),
		genSch :   $(mCfg.formId + ' [name=gen_sch]'),
		
		genStartWeek : $(mCfg.formId + ' [name=genStartWeek]'),
		genStartDay2 : $(mCfg.formId + ' [name=genStartDay2]'),
		
		genStartDay :   $(mCfg.formId + ' [name=genStartDay]'),
		genStartHour :   $(mCfg.formId + ' [name=genStartHour]'),
		genStartMin :   $(mCfg.formId + ' [name=genStartMin]'),
		
		shareUser	: $(mCfg.formId + ' [name=share_user]'),
		shareUserList : $(mCfg.formId + ' [name=share_user_list]'),
		
		setType :   $(mCfg.formId + ' [name=set_type]'),		
		clientGroupCd :   $(mCfg.formId + ' [name=client_group_cd]'),		
		
		timeSet :   $(mCfg.formId + ' [name=timeSet]'),		
		schStartDay :   $(mCfg.formId + ' [name=schStartDay]'),
		schStartHour :   $(mCfg.formId + ' [name=schStartHour]'),
		schStartMin :   $(mCfg.formId + ' [name=schStartMin]'),		
		schEndDay :   $(mCfg.formId + ' [name=schEndDay]'),
		schEndHour :   $(mCfg.formId + ' [name=schEndHour]'),
		schEndMin :   $(mCfg.formId + ' [name=schEndMin]'),		
				
		schQuery :   $(mCfg.formId + ' [name=sch_query]'),
		fileId :   $(mCfg.formId + ' [name=file_id]'),
		fileDataName :   $(mCfg.formId + ' [name=file_data_name]'),
		orgFileName :   $(mCfg.formId + ' [name=org_file_name]'),		
		sqlQuery :   $(mCfg.formId + ' [name=sql_query]'),
		
		//span
		genSpan :   $(mCfg.formId + ' .gen_span'),
		genCalDaySpan:   $(mCfg.formId + ' .gen_cal_day_span'),
		genDaySpan :   $(mCfg.formId + ' .gen_day_span'),
		genWeekSpan :   $(mCfg.formId + ' .gen_week_span'),
		genHourSpan :   $(mCfg.formId + ' .gen_hour_span'),
		genMinSpan :   $(mCfg.formId + ' .gen_min_span'),
		
		//tr
		timeSetTr :   $(mCfg.formId + ' .time_set_tr'),
		joinTr :   $(mCfg.formId + ' .join_tr'),
		
		setTypeTr :   $(mCfg.formId + ' .set_type_tr'),
		setTypeS :   $(mCfg.formId + ' .set_type_s'),
		setTypeF :   $(mCfg.formId + ' .set_type_f'),
		setTypeD :   $(mCfg.formId + ' .set_type_d'),
		
		//td
		joinTd :   $(mCfg.formId + ' .join_td'),
		
		//btn
		btnImport	:  $(mCfg.formId + ' .btn-import'),
		btnAddUser	:  $(mCfg.formId + ' .add_user'),
		btnDelUser	:  $(mCfg.formId + ' .del_user'),
		btnAddTree	:  $(mCfg.formId + ' .btn-add-tree'),
		btnDelTree	:  $(mCfg.formId + ' .btn-del-tree'),
		btnFileLoad	:  $(mCfg.formId + ' .btn-file-load'),
		btnFldChk	:  $(mCfg.formId + ' .btn-fld-chk'),
		btnFldJoin	:  $(mCfg.formId + ' .btn-fld-join'),
		
		btnAddItem  :  $(mCfg.formId + ' .btn-add-item'),
		
		dummy : {}
	},
	
	// 현재 상태 변수
	mState = {
		isNew 	: m$.bigCode.val() == "" ? true : false,
		isLoad 	: m$.pageType.val() == "big_stats_mng_load" ? true : false,
		mode 	: m$.bigCode.val() == "" || m$.pageType.val() =="big_stats_mng_load"? mCfg.add : mCfg.update
	},
	
	init = function(){
		
		TreeManager.init();
		
		//처음엔 분석데이터 설정창 모두 가려주기
		if(oTree.getActiveNode().data.dto.set_seq == 0){
			m$.form.find(".set_type_tr").hide();
			m$.form.find(".set_type_s").hide();
			m$.form.find(".set_type_f").hide();
			m$.form.find(".set_type_d").hide();
		}else{
			m$.form.find(".set_type_tr").show();
		}
		
		if(mState.isNew) {
			m$.form.find("[data-type=stop]").hide();
			m$.form.find("[data-type=retry]").hide();
			changeEvents();
		}else{
			// 데이타 조회
			select();
		}
		
		bindEvent();
	},
	
	changeEvents = function(){
		onChangeCycleType();
		setTypeChangeInit();
		
		fieldFuncEvent();
		funcEvent();
		disabledCheck();
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', checkInvalid);
		//m$.fieldSelBox.on("change",addFieldName);
		
		TreeManager.btnInit();//트리 추가 삭제 버튼
		
		//분석주기 및 실행시간 Start
		m$.genCycleType.on("change",onChangeCycleType);
		m$.genSch.on("change",onChangeGenTime);
		m$.genSch.on("change",function(){
			var setMin = m$.genSch.val();
			var schStartTime = _SL.formatDate.addMin(_SL.formatDate(), +setMin);;
			
			if (setMin == 0) {
				schStartTime = _SL.formatDate();
			}
			
			m$.genStartDay.val(schStartTime.substring(0,8));
			m$.genStartHour.val(schStartTime.substring(8,10));
			m$.genStartMin.val(schStartTime.substring(10,12));	
		});
		
		m$.form.find("[name=genStartDay], [name=genStartHour], [name=genStartMin]").change(function(){
			m$.genSch.val(0);
		});
		//분석주기 및 실행시간 End
		
		//검색기간 Start
		m$.timeSet.change(function(){
			var setMin = this.value;
			if (setMin == 0) return;

			var setDateUI = function( $obj, _value ){
				var $select = $obj.siblings('.tform-select');
				$select.find('.tform-select-t').text(_value).end()
					.find('.tform-select-option[data-value='+_value+']').addClass('selected').end();
				$obj.val(_value);
			}

			var startTime = _SL.formatDate.addMin(m$.form.find("[name=schEndDay]").val() + m$.form.find("[name=schEndHour]").val() + m$.form.find("[name=schEndMin]").val(), -setMin);
			setDateUI(m$.form.find("[name=schStartDay]"),startTime.substring(0,8));
			setDateUI(m$.form.find("[name=schStartHour]"),startTime.substring(8,10));
			setDateUI(m$.form.find("[name=schStartMin]"),startTime.substring(10,12));
		});
		
		m$.form.find("[name=schStartDay], [name=schStartHour], [name=schStartMin], [name=schEndDay], [name=schEndHour], [name=schEndMin]").change(function(){
			var $obj = m$.form.find("[name=timeSet]"),
				t = $obj.siblings('.tform-select').find('[data-value=0]').text();
			$obj.val(0)
				.siblings('.tform-select').find('.tform-select-t').text(t);
		});
		//검색기간 End

		btnInit();//분석정보내의 추가 삭제 버튼들
		m$.setType.change(setTypeChange);//데이터종류 관련 이벤트
		
		//검색어 변경시 트리에 바로 반영
		m$.schQuery.keyup(function(){
			var aNode = oTree.getActiveNode();
			if(aNode != null && aNode.data.dto.set_seq != 0){
				var formData = TreeManager.getFormData();
				aNode.setTitle(formData.title);
			}
		});
		
		//Query 변경시 트리에 바로 반영
		m$.sqlQuery.keyup(function(){
			var aNode = oTree.getActiveNode();
			if(aNode != null && aNode.data.dto.set_seq != 0){
				var formData = TreeManager.getFormData();
				aNode.data.dto.checkDb = false;
				$.extend(aNode.data.dto, formData )
				aNode.setTitle(formData.title);
			}
		});	
		
		//joinOperator 변경에 따른 이벤트 Start
		m$.form.on("click","[name=join_operator]",function(){
			var thisObj = $(this);
			thisObj.data('prev',thisObj.val());
		});
		m$.form.on("change","[name=join_operator]", joinOperChangeEvent);
		//joinOperator 변경에 따른 이벤트 End
		
		//기준필드번호변경에 따른 분석필드 변경
		m$.form.on("change","[name=field_set_seq]", fieldSeqChangeEvent);
		
		//통계의 번호변경에 따른 분석필드 변경
		m$.form.on("change","[name=func_field_set_seq]", funcSeqChangeEvent);
		
		//표시형태
		m$.form.on("change","[name=view_type]", viewTypeChangeEvent);
		
		//통계
		m$.form.on("change","[name=func]", funcEvent);
		
		//기준필드
		m$.form.on("change","[name=field_nm]", fieldFuncEvent);
		
		//chosen생성
		$("[name=field_nm]").chosen();
		$("[name=func_field_nm]").chosen();
		
		//필드정보체크
		m$.btnFldChk.on('click', getDbFieldInfo);
		
		//파일불러오기
		m$.btnFileLoad.exModalPopup(mCfg.urlLoadFileList, {
			width : 500,
			height : 131,
			onClose : function(){}
		});
		
		//Autojoin
		m$.btnFldJoin.on('click', autoFieldJoin);

		//다른설정불러오기
		m$.btnImport.exModalPopup(mCfg.urlLoadBigStatsList, {
			width : 500,
			height : 135,
			onClose : function(){
				onClose(true);
			}
		});
		
		//공유사용자 추가
		m$.btnAddUser.click(function(){
			var val = m$.form.find("[name=share_user] option:selected").val();
			var text = m$.form.find("[name=share_user] option:selected").text();

			if(val == "") {
				_alert("사용자를 선택하세요.");
				return;
			}
			
			if( m$.form.find("[name=share_user_list] option").is(	function() {return this.value == val;})){
				_alert("해당 ID가 이미 존재합니다. ( ID : " + val + " )");
				return;
			}
			
			m$.form.find("[name=share_user_list]").append("<option value='"+val+"'>"+text+"</option>");
			
		});
		
		//공유사용자 삭제
		m$.btnDelUser.click(function(){
			m$.form.find("[name=share_user_list] :selected").remove();
		});
	},
	
	
	onChangeCycleType = function(){
		
		var val = m$.genCycleType.val();

		m$.form.find(".gen_span, .gen_cal_day_span, .gen_day_span, .gen_week_span, .gen_hour_span, .gen_min_span").hide();
		
		onChangeGenTime();
		
		if(val.indexOf("1") == 0) m$.form.find(".gen_span").show();
		else if(val.indexOf("d") == 0) m$.form.find(".gen_hour_span, .gen_min_span").show();
		else if(val.indexOf("w") == 0) m$.form.find(".gen_week_span, .gen_hour_span, .gen_min_span").show();
		else if(val.indexOf("M") == 0) m$.form.find(".gen_day_span, .gen_hour_span, .gen_min_span").show();
		
		if(val.indexOf("1") == 0 && m$.setType.val() == "S") m$.timeSetTr.show();
		else m$.timeSetTr.hide();
		
	},
	
	onChangeGenTime = function(){
		if(m$.genCycleType.val() !="1,0") m$.genSch.val(""); 
		
		if(m$.genSch.val() == "") {
			m$.form.find(".gen_cal_day_span, .gen_day_span, .gen_week_span, .gen_hour_span, .gen_min_span").hide();
		}
		else {
			m$.form.find(".gen_cal_day_span, .gen_hour_span, .gen_min_span").show();
		}
	},
	
	
	TreeManager = {
		init : function(){
			
			var initData = TreeManager.getInitData();
			initData.set_seq = 0;
			
			oRootTreeData = {
					title	:	"DATA", 
					key		:	"0", 
					dto		:	initData ,
					isFolder: 	true,
					children: 	[]
			};
			
			m$.datasetTreeTd.dynatree({
				minExpandLevel : 99,
				autoFocus: true,
				clickFolderMode: 3,
				onActivate: function(node) {
					//nodeValidate
					if(exNode != null && exNode.data.dto.set_seq != 0 && exNode != node ){
						
						var formData = TreeManager.getFormData();
						$.extend(exNode.data.dto ,formData);
						exNode.setTitle(formData.title);
						
						if( !TreeManager.nodeValidate() ){
							exNode.activate();
							exNode.focus();
							return;
						}
					}
					exNode = node;
					
					var schStartTime = node.data.dto.sch_start_time;
					var schEndTime = node.data.dto.sch_end_time;
				
					m$.setType.val(node.data.dto.set_type);
					if(gNetworkList.length > 1 && node.data.dto.client_group_cd) {
						m$.clientGroupCd.val(node.data.dto.client_group_cd.split(","));
					}
					m$.schStartDay.val(schStartTime.substring(0,8));
					m$.schStartHour.val(schStartTime.substring(8,10));
					m$.schStartMin.val(schStartTime.substring(10,12));
					
					m$.schEndDay.val(schEndTime.substring(0,8));
					m$.schEndHour.val(schEndTime.substring(8,10));
					m$.schEndMin.val(schEndTime.substring(10,12));
					
					m$.schQuery.val(node.data.dto.sch_query);				
					m$.fileId.val(node.data.dto.file_id);
					m$.fileDataName.val(node.data.dto.file_data_name);
					m$.orgFileName.val(node.data.dto.org_file_name);
					
					m$.sqlQuery.val(node.data.dto.sql_query);

					var nodeSeq = node.data.dto.set_seq;
					if(node != null && nodeSeq != 0){
						var formData = TreeManager.getFormData();			
						node.setTitle(formData.title);
					}
					
					if(nodeSeq == 0 || nodeSeq == 1){
						m$.joinTr.hide();
					}else{
						m$.joinTr.show();
					}
					 
					//join 필드 재설정.. 다 지우고 다시 생성..
					if(nodeSeq != 0){
						m$.form.find(".join_div").remove();
						appendJoinField(node, "*", "*","IN");
					}
					
					var joinFieldList = node.data.dto.join_field_list;				
					for(var idx in joinFieldList){//만약 join 필드 데이터가 있다면.. 다 지우고 다시 데이터를 이용해 생성..
						if(idx == 0) m$.form.find(".join_div").remove();
						appendJoinField(node, joinFieldList[idx].field_nm, joinFieldList[idx].rel_field,joinFieldList[idx].operator);
					}
					
					setTypeChangeInit();
					disabledCheck();
					
					if(nodeSeq == 0){
						m$.setTypeTr.hide();
						m$.setTypeS.hide();
						m$.setTypeF.hide();
						m$.setTypeD.hide();
					}else{
						m$.setTypeTr.show();
					}
					
					onChangeCycleType();
				},
				children : [oRootTreeData]
			});
			
			oTree = m$.datasetTreeTd.dynatree("getTree");
			
			var tempNode  = oTree.getNodeByKey("0");
			tempNode.activate();
		},
		
		btnInit : function(){		
			
			m$.btnAddTree.click(function(){				
				var aNode = oTree.getActiveNode();
				if(aNode != null){
					
					if(aNode.data.dto.set_seq != 0){//DATA에서 추가하지 않을때 
						if(!TreeManager.nodeValidate()) return;
						var formData = TreeManager.getFormData();
						//formData.checkDb = false;//새로 추가된 node는 아직 dbCheck를 안한상태
						$.extend(exNode.data.dto , formData);
						exNode.setTitle(formData.title);
					}else if(aNode.hasChildren()) return;//DATA는 하나의 child만..
					
					var initData = TreeManager.getInitData();
					
					var maxSeqNo = 0, seqNo, maxSetSeq = 0 , setSeq;
					if(aNode.hasChildren()){//child가 있다면 자식들 중 가장 마지막 set_seq를 구한후+1 해서 새로 추가될 node의 set_seq로 사용
						
						oTree.getActiveNode().visit(function(node){
							if(maxSetSeq < node.data.dto.set_seq){
								maxSetSeq = node.data.dto.set_seq;
							}
						});
						setSeq = maxSetSeq + 1;
					}else{//child가 없다면 부모의 set_seq + 1을 새로 추가될 node의 set_seq로 사용					
						setSeq = aNode.data.dto.set_seq + 1;
					}
					
					if(setSeq > 2){
						_alert("더 이상 등록 할 수 없습니다");
						return;
					}
					
					//node들 전부 뒤져서 set_seq를 재설정 key값,title,rel_set_seq도 재설정
					oTree.visit(function(node){
						if(setSeq <= node.data.dto.set_seq){//set_seq를 재설정
							node.data.dto.set_seq += 1 ;
							node.data.key = String((Number(node.data.key) + 1)) ;
							
							var tSetType = node.data.dto.set_type;
							var tTitle ;
							
							switch(tSetType){
								case "S" : 
									tTitle = node.data.key + ".[검색] : " + node.data.dto.sch_query;
									break;
								case "F" :
									tTitle = node.data.key + ".[파일] : " + node.data.dto.file_data_name;
									break;
								case "D" :
									tTitle = node.data.key + ".[DB] : " + node.data.dto.sql_query;
									break;
							}						
							node.data.title = tTitle;
							node.setTitle(tTitle);
						}
						
						if(setSeq <= node.data.dto.rel_set_seq){//rel_set_seq를 재설정
							node.data.dto.rel_set_seq += 1 ;
						}
					});
									
					initData.set_seq = setSeq;
					initData.rel_set_seq = exNode.data.dto.set_seq;
				
					var newNode = aNode.addChild({
						title : "New", 
						key : setSeq, 
						dto : initData,
						focus : true,
						children : []
					});
					
					exNode = newNode;
					exNode.activate();
					
					if( ( oTree.count() == 2) || m$.form.find('[name=join_operator]').val() == "="){//IN, NOT IN일때는 1번 데이터셋만 선택가능
						//분석정보의 번호들 늘리기
						var seqCnt = oTree.count() -1 ;
						var $setSeqSel = m$.itemListTable.find("[name=field_set_seq],[name=func_field_set_seq]");
						$setSeqSel.append($('<option value="'+ seqCnt +'">DATA.'+ seqCnt +'</option>'));
					}
					
					onChangeCycleType();

				}else{				
					_alert("DATA를 선택해주세요.");
				}
				
			});
			
			m$.btnDelTree.click(function(){
				var deletedSeqArr = [];
				var changedSeqArr = [];
				var aNode = oTree.getActiveNode();
				if(aNode != null){
					
					//삭제하려는 node들의 set_seq들..
					deletedSeqArr.push(String(aNode.data.dto.set_seq));
					aNode.visit(function(node){
						deletedSeqArr.push(String(node.data.dto.set_seq))
					});
					
					var dto = aNode.data.dto;
					//1.DATA는 삭제되면 안돼
					if(dto.set_seq == 0) return;
					
					//1번 Node를 삭제하면 전체 삭제 된다. 
					if(dto.set_seq == 1){
						if(confirm("전체를 삭제하시겠습니까?")){
							oTree.getNodeByKey("0").removeChildren();
						}
					}else if(aNode.hasChildren()){//2.자식이 있을 경우와 없을 경우 경고문구 다르고 삭제 후 set_seq 없데이트
						if(!confirm("하위 데이터도 함께 삭제 합니다.")) return;
						oTree.visit(function(node){
							if(dto.set_seq < node.data.dto.set_seq){
								changedSeqArr.push(String(node.data.dto.set_seq));
								var delNodeCnt = aNode.countChildren() + 1;
								node.data.dto.set_seq -= delNodeCnt ;	
								node.setTitle(TreeManager.getTitle(node.data.dto));
							}
						});
						aNode.remove();
					}else{
						if(!confirm("삭제하시겠습니까?")) return;
						oTree.visit(function(node){
							if(dto.set_seq < node.data.dto.set_seq){
								changedSeqArr.push(String(node.data.dto.set_seq));
								node.data.dto.set_seq -= 1 ;
								node.setTitle(TreeManager.getTitle(node.data.dto));
							}
						});
						aNode.remove();
					}			

					//변경된 set_seq에 맞게 rel_set_seq도 변경
					oTree.visit(function(node){
						if(node.data.dto.set_seq != 0 ){
							var pNode = node.getParent();
							node.data.dto.rel_set_seq = pNode.data.dto.set_seq;
						}
					});
					
					//삭제된 데이터를 참조하던 기준필드들의 번호와 필드 초기화
					m$.form.find('[name=field_set_seq]').each(function(){
						if( deletedSeqArr.indexOf($(this).val()) != -1){
							$(this).attr("aria-value","");
							var $select = $(this).closest("td").find("[name=field_nm]");
							var tNode= new Object({data:{dto:{set_type : "del",file_id :""}}});
							appendChosen($select,tNode,"*");
						}
					});
					
					//삭제된 데이터를 참조하던 통계들의 번호와 필드 초기화
					m$.form.find('[name=func_field_set_seq]').each(function(){
						if( deletedSeqArr.indexOf($(this).val()) != -1){
							$(this).attr("aria-value","");
							var $select = $(this).closest("td").find("[name=func_field_nm]");
							var tNode= new Object({data:{dto:{set_type : "del",file_id :""}}});
							appendChosen($select,tNode,"*");
						}
					});
					
					//트리가 삭제되면서 변경된 node의 set_seq를 번호에 적용
					m$.form.find('[name=field_set_seq]').each(function(){
						if( changedSeqArr.indexOf($(this).val()) != -1){
							var cSetSeq ="";
							if(oTree.getNodeByKey($(this).val()) != null){
								cSetSeq =  oTree.getNodeByKey($(this).val()).data.dto.set_seq;
							}			
							$(this).attr("aria-value",cSetSeq);
							
						}
					});
					
					//트리가 삭제되면서 변경된 node의 set_seq를 번호에 적용
					m$.form.find('[name=func_field_set_seq]').each(function(){
						if( changedSeqArr.indexOf($(this).val()) != -1){
							var cSetSeq ="";
							if(oTree.getNodeByKey($(this).val()) != null){
								cSetSeq =  oTree.getNodeByKey($(this).val()).data.dto.set_seq;
								$(this).attr("aria-value",cSetSeq);
							}
							$(this).attr("aria-value",cSetSeq);
						}
					});
					
					//기준필드의 번호들 초기화
					m$.form.find('[name=field_set_seq]').each(function(){
						$(this).find("option").remove();
						var selVal = $(this).attr("aria-value");
						
						$(this).append($("<option value=''>[선택]</option>"));
						for(var i = 1 ; i < oTree.count() ; i++){
							$(this).append($("<option value='"+i+"'>DATA."+i+"</option>"));
						}
						$(this).val(selVal);
					});
					
					//통계의 번호들 초기화
					m$.form.find('[name=func_field_set_seq]').each(function(){
						$(this).find("option").remove();
						var selVal = $(this).attr("aria-value");
						
						$(this).append($("<option value=''>[선택]</option>"));
						for(var i = 1 ; i < oTree.count() ; i++){
							$(this).append($("<option value='"+i+"'>DATA."+i+"</option>"));
						}
						$(this).val(selVal);
					});				
					
					//tree의 key도 set_seq로 변경
					for(var idx in changedSeqArr){
						var treeKey = changedSeqArr[idx];
						var cTree =  oTree.getNodeByKey(treeKey);
						if(cTree != null){
							(oTree.getNodeByKey(changedSeqArr[idx])).data.key = String(cTree.data.dto.set_seq);
						}
					}
					exNode = null;
					
					slui.attach.setTransformSelect(mCfg.formId);
				}else{
					console.log("선택된 노드 없습니다.")
				}
			});
		},
		
		getInitData : function(){
			
			var schStartTime = m$.schStartTime.val();
			var schEndTime = m$.schEndTime.val();
					
			return {
				sch_start_time : schStartTime,
				sch_end_time : schEndTime, 
				set_type : "S",
				field_nm : "*",
				rel_field : "*",
				file_id : ""
			};
		},
		
		getFormData : function(){
			
			var schStartTime = m$.schStartDay.val()+ m$.schStartHour.val() + m$.schStartMin.val();			
			var schEndTime = m$.schEndDay.val()+ m$.schEndHour.val() + m$.schEndMin.val();
			var setSeq = exNode.data.dto.set_seq; 		
			var setType =m$.setType.val();
			var sqlQuery = $.trim(m$.sqlQuery.val());
			sqlQuery = sqlQuery.replace(/;+$/, "");
			
			var data = {
				set_seq : setSeq,
				set_type : setType,
				client_group_cd : gNetworkList.length == 1 ? gNetworkList[0].code_id :
						m$.clientGroupCd.map(function() {
							return $(this).val();
						})
						.get()
						.join(),
				sch_start_time : schStartTime,
				sch_end_time : schEndTime,
				sch_query : $.trim(m$.schQuery.val()),
				file_id : m$.fileId.val(),
				file_data_name : m$.fileDataName.val(),
				org_file_name : m$.orgFileName.val(),
				sql_query : sqlQuery
			};
				
			data.title = TreeManager.getTitle(data);
			
			var count = m$.form.find('.join_div').length;
			
			var joinFieldlist =[];
			for(var i=0; i<count; i++){
				var fieldNm = m$.form.find('[name=join_field_nm]').eq(i).val();
				var relField =  m$.form.find('[name=join_rel_field]').eq(i).val();
				var operator =  m$.form.find('[name=join_operator]').eq(i).val();
				joinFieldlist.push({
					field_nm		: fieldNm,
					rel_field		: relField,
					operator		: operator
				});
			}
			data.join_field_list = joinFieldlist;
			
			return data;
		},
		
		getTitle : function(data){
			var title = "";
			
			switch(data.set_type){
				case "S" : 
					title = data.set_seq + ".[검색] : " + data.sch_query;
					break;
				case "F" :
					title = data.set_seq  + ".[파일] : " + data.file_data_name;
					break;
				case "D" :
					title = data.set_seq  + ".[DB] : " + data.sql_query;
					break;
			}
			
			return title;
		},
		
		nodeValidate : function(){
			var setType=m$.setType.val();
			var validate = true;
			
			//분석데이터  validate
			switch(setType){
				case "S":
					if(gNetworkList.length > 1 && m$.form.find("[name=client_group_cd]:checked").length == 0) {
						_alert("검색할 Network을 체크하세요.");
						return;
					} 
					
					var sTime = m$.schStartDay.val() + m$.schStartHour.val() + m$.schStartMin.val();
					var eTime = m$.schEndDay.val() + m$.schEndHour.val() + m$.schEndMin.val();
					var diffTime = _SL.formatDate.diff(sTime, eTime);
					
					if(sTime > eTime) {
						_alert("검색기간 종료시간이 시작시간보다 커야 합니다.");
						return;
				    }
					if(!_SL.validate(m$.schQuery)) validate = false;
					break;
					
				case "F":
					if(!_SL.validate(m$.fileDataName)) validate =  false;
					break;
					
				case "D":
					if(!_SL.validate(m$.sqlQuery)){
						validate =  false;
						break;
					}
					
					if(!exNode.data.dto.checkDb){
						_alert("필드정보Check를 해주세요.");
						validate =  false;
					}
					break;
				default :
					return validate = false;
					break;
			}
			
			//joinField validate
			if(!validate) return;
			var setSeq = exNode.data.dto.set_seq;
			if( setSeq == 0 || setSeq == 1 ){
				 console.log("join_field_append_pass");
			}else{
				m$.form.find('[name=join_rel_field]').each(function(){
					if( $(this).val() == "*" && validate){
						_alert("데이터관계를 설정해주세요.");
						validate = false;
					}
				});
				m$.form.find('[name=join_field_nm]').each(function(){
					if( $(this).val() == "*" && validate){
						_alert("데이터관계를 설정해주세요.");
						validate = false;
					}
				});
				
				if(!validate) return;
				var joinCount = m$.form.find('.join_div').length;
				var joinFieldCheckArr = [];
				for(var i = 0 ; i < joinCount ; i++){
					
					var combField = m$.form.find('[name=join_rel_field]').eq(i).val() + m$.form.find('[name=join_field_nm]').eq(i).val();
					if(joinFieldCheckArr.indexOf(combField) != -1){
						_alert("데이터 관계정의에 중복된 내용이 있습니다.");
						validate = false;
						break;
					} 
					joinFieldCheckArr.push(combField);
				}
			}
			
			return validate;
		}
	},
	
	setTypeChangeInit = function(){
		var v = m$.setType.val();
		switch(v){
			case "S":
				m$.setTypeS.show();
				m$.setTypeF.hide();
				m$.setTypeD.hide();
				break;
			case "F":
				m$.setTypeS.hide();
				m$.setTypeF.show();
				m$.setTypeD.hide();
				break;
			case "D":
				m$.setTypeS.hide();
				m$.setTypeF.hide();
				m$.setTypeD.show();
				break;
			default:
				break;
		}
	},

	appendJoinField = function(node,iVal,pVal,operator){
		var $joinTd = m$.joinTd;
		var aNode = node;
		var isetSeq = aNode.data.dto.set_seq;
		var iSelVal = iVal;
		
		var pNode = aNode.getParent();
		var psetSeq = pNode.data.dto.set_seq;
		var pSelVal = pVal;
		
		//기준필드
		var $select = $('<select name="join_field_nm" data-ui="false"><option value="*">[선택하세요]</option></select>'),

		$select3Outer = $('<span class="form-select-outer" />'),
		$select3 = $('<select name="join_operator" class="form-select" data-ui="false" />')
			.append('<option value="IN">'+'IN'+'</option>')
			.append('<option value="NOT IN">'+'NOT IN'+'</option>')
			.append('<option value="=">'+'INNER JOIN'+'</option>')
			.append('<option value="=*">'+'OUTER JOIN'+'</option>')
			.appendTo($select3Outer);
		
		if(m$.form.find('.join_div').length >= 1) $select3.prop("disabled",true);

		var $select2 = $('<select name="join_rel_field" data-ui="false"><option value="*">'+'[선택하세요]'+'</option></select>'),
			$image1 = $('<button type="button" class="btn-basic btn-mini btn-plus add_join"><i class="icon-plus"></i></button>'),
			$image2 = $('<button type="button" class="btn-basic btn-mini btn-minus del_join"><i class="icon-minus"></i></button>');
		
		var $div1 = $('<div class="range-4" />').append("DATA&nbsp;",$select2),
			$div2 = $('<div class="range-1" />').append($select3Outer),
			$div3 = $('<div class="range-1" />'),
			$div4 = $('<div class="range-4" />').append("DATA&nbsp;", $select,$image1,$image2),
			$div = $('<div class="ranges-group join_div" />').append($div1,$div2,$div3,$div4);
		$joinTd.append($div);

		$select3.val(operator);
		appendChosen($select,aNode,iSelVal);
		appendChosen($select2,pNode,pSelVal);
	},
	
	appendChosen = function($select ,node ,selVal){
		var setType = node.data.dto.set_type;
		var fileId = node.data.dto.file_id;
		var sqlQuery = node.data.dto.sql_query;
		
		$select.html('<option value="*">[선택하세요]</option>');
		
		switch(setType){
			case "S" :
				gFieldCaptions =  gOrgFieldCaptions;
				$.each(gFieldCaptions, function(i, val) {
					$select.append('<option value="'+ i +'">'+val+' ['+ i +']</option>');
				});
				
				$select.chosen();
				$select.val(selVal);
				$select.trigger("chosen:updated");
				break;
			case "F" :
				if(fileId ==""){
					gFieldCaptions =  gOrgFieldCaptions;
					$.each(gFieldCaptions, function(i, val) {
						$select.append('<option value="'+ i +'">'+val+' ['+ i +']</option>');
					});
					
					$select.chosen();
					$select.val(selVal);
					$select.trigger("chosen:updated");
					break;
				}else{
					$('body').requestData(mCfg.urlLoadBigFileData,{file_id:fileId}, {
						callback : function(rsData, rsCd, rsMsg){
							if(rsCd=="SUC_COM_0000"){	
								gOrgFileFieldCaptions = rsData.fileFieldMap;
								$.each(gOrgFileFieldCaptions, function(i, val) {
									$select.append('<option value="'+ i +'">'+val+' ['+ i +']</option>');	
								});
								
								$select.chosen();
								$select.val(selVal);
								$select.trigger("chosen:updated");
								fieldFuncEvent();
							}else{
								_alert("파일의 필드정보를 불러오는 중 에러가 발생했습니다." );
							}
						}
					});
				}			
				break;
			case "D" :
				if(sqlQuery =="" || !node.data.dto.checkDb){
					gFieldCaptions =  gOrgFieldCaptions;
					$.each(gFieldCaptions, function(i, val) {
						$select.append($('<option value="'+ i +'">'+val+' ['+ i +']</option>'));	
					});
					
					$select.chosen();
					$select.val(selVal);
					$select.trigger("chosen:updated");
					break;
				}
				if(node.data.dto.checkDb){
					$('body').requestData(mCfg.urlLoadBigDbData,{sql_query:sqlQuery}, {
						callback : function(rsData, rsCd, rsMsg){
							if(rsCd=="SUC_COM_0000"){
								gOrgDbCaptions = rsData.fileFieldMap;
								$.each(gOrgDbCaptions, function(i, val) {
									$select.append($('<option value="'+ i +'">'+val+' ['+ i +']</option>'));	
								});
								
								$select.chosen();
								$select.val(selVal);
								$select.trigger("chosen:updated");
								fieldFuncEvent();
							}else{
								_alert("Query의 필드정보를 불러오는 중 에러가 발생했습니다.<br>Query를 확인해주세요.");
							}
						}
					});	
				};
				break;
			case "del":
				$select.val(selVal);
				$select.trigger("chosen:updated");
				break;
			default :
				break;
		}
		
		fieldFuncEvent();		
	},
	
	
	fieldFuncEvent = function(){
		var $listTable = m$.itemListTable;
		var count = $listTable.find("[name=field_nm]").length;
		
		for(var i=0; i<count; i++){
			var tempVal = m$.form.find('[name=field_nm]').eq(i).val();
			var $parent = m$.form.find('[name=field_nm]').eq(i).parents('.field_tree_div');
			if(tempVal != "eqp_dt"){
				$parent.find("[name=field_func]").parents('[class*=range-]').hide();
			}else{
				$parent.find("[name=field_func]").parents('[class*=range-]').show();
			}
		}
	},
	
	funcEvent = function(){
		var $listTable = m$.itemListTable;
		var count = ($listTable.find("[name=func]")).length;
		
		for(var i=0; i<count; i++){
			var tempVal = m$.form.find("[name=func]").eq(i).val();
			var $parent =  m$.form.find("[name=func]").eq(i).parents('td');
			
			if(tempVal == "count"){
				$parent.find("[name=func_field_nm]").val("*");
				$parent.find("[name=func_field_nm]").prop("disabled",true);
				$parent.find("[name=func_field_nm]").trigger("chosen:updated");
			}else{
				$parent.find("[name=func_field_set_seq]").prop("disabled",false);
				$parent.find("[name=func_field_nm]").prop("disabled",false);
				$parent.find("[name=func_field_nm]").trigger("chosen:updated");
			}
		}

		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	
	disabledCheck = function(){
		var pageType = m$.pageType.val();
		
		if(!mState.isNew){
			var status = m$.status.val();
			
			var lastCodeYn = m$.lastCodeYn.val();
			
			if(!status) return;
			
			m$.form.find('[data-type=save]').hide();
			
			if((lastCodeYn == "N" && pageType=="") || (status !="0" && status !="9" && pageType=="")){// 0:중지 2,8-요청 3,4-처리중 5-완료, 9-오류 //disabled 시키는거다..
				m$.btnImport.hide();//불러오기
				m$.form.find('[data-type=retry]').hide();
				
				if("12348".indexOf(status) > -1 && (lastCodeYn == "Y")) {
					m$.form.find('[data-type=stop]').show();
				}
				
				m$.form.find('input,textarea').prop('readonly', true);
				m$.form.find('input,textarea,table button,select').prop('disabled',true);
				
				/*m$.btnAddUser.prop('disabled',true);
				m$.btnDelUser.prop('disabled',true);
				m$.btnAddTree.prop('disabled',true);
				m$.btnDelTree.prop('disabled',true);
				m$.form.find('.add_join').prop('disabled',true);
				m$.form.find('.del_join').prop('disabled',true);
				m$.btnAddItem.prop('disabled',true);

				m$.form.find('.btn-del-item').prop('disabled',true);
				m$.form.find('.btn-add-field').prop('disabled',true);
				m$.form.find('.btn-del-field').prop('disabled',true);
				
				m$.btnFileLoad.prop('disabled',true);
				
				m$.form.find('[name=join_rel_field]').prop("disabled",true);*/
				m$.form.find('[name=join_field_nm]').prop("disabled",true);
				
				m$.form.find('[name=join_rel_field]').trigger("chosen:updated");
				m$.form.find('[name=join_field_nm]').trigger("chosen:updated");
			}
		}
		
		if(pageType =="big_stats_mng_load"){
			m$.form.find('[data-type=retry]').hide();
			m$.form.find('[data-type=save]').show();
			
			m$.bigCode.val("");
			m$.scheduleId.val("");
			m$.status.val("");
			m$.lastCodeYn.val("");
		}else{
			if(status =="0") m$.form.find('[data-type=retry]').show();
		}
		
		autoJoinDisabledCheck();

		//공유사용자 chosen
		m$.shareUser.chosen({width:'100%'});

		setTimeout(function(){
			slui.attach.setTransformSelect(mCfg.formId);
		},10);
	},
	
	
	autoJoinDisabledCheck = function() {
		var joinOpVal = m$.form.find("[name=join_operator]:first").val();
		
		if(joinOpVal == "=" || joinOpVal == "=*"){
			m$.btnFldJoin.css("visibility","visible");
		}else{
			m$.btnFldJoin.css("visibility","hidden");
		}		
	},
	
	
	btnInit = function(){		
		//데이터 관계 추가 버튼
		m$.form.on("click",".add_join",function(e){
			var joinOperator = m$.form.find("[name=join_operator]").first().val();
			if(joinOperator == "NOT IN" || joinOperator == "IN"){
				_alert("더이상 등록 할 수 없습니다.");
				return;
			}
			appendJoinField(oTree.getActiveNode(),"*","*",joinOperator);
		});
		
		//데이터 관계 삭제 버튼
		m$.form.on("click",".del_join",function(e){
			var $parent = $(this).parents('div');//버튼이 담겨있는 <div>
			if( $parent.is(".join_div:first")){
				return;
			}
			
			$parent.remove();
		});
			
		//분석정보 추가 버튼		
		m$.btnAddItem.on("click",function(e){
			var $listTable = m$.itemListTable;
			var $tr = $("<tr class='item_tr' />");
			
			//분석항목명
			var $input = $('<input name="item_nm" class="form-input" type="text" data-valid="분석항목명,required" style="width:100%;">')
				.appendTo( $('<td />').appendTo($tr) );

			//표시형태
			var $selectVTOuter = $('<span class="form-select-outer" />')
					.appendTo( $('<td />').appendTo($tr) ),
			$selectVT = $('<select name="view_type" class="form-select" />')
				.append('<option value="P">'+'Pie'+'</option>')
				.append('<option value="B">'+'Bar'+'</option>')
				.append('<option value="L">'+'Line'+'</option>')
				.append('<option value="T">'+'TimeLine'+'</option>')
				.appendTo( $selectVTOuter );

			//기준필드	
			var $selectSeqOuter = $('<span class="range-2 form-select-outer" />'),
				$selectSeq = $('<select name="field_set_seq" class="form-select" />')
					.append('<option value="">[선택]</option>')
					.appendTo($selectSeqOuter);

			for(var i = 1 ; i < oTree.count() ; i++){
				var tempNode  = oTree.getNodeByKey(String(i));

				if(i > 1){
					var joinOperator;
					if(tempNode.data.dto.join_field_list) joinOperator = tempNode.data.dto.join_field_list[0].operator;
					else joinOperator = m$.form.find('[name=join_operator]').first().val();
					
					if(joinOperator != "=" && joinOperator != "=*") continue;
				}
				$selectSeq.append('<option value="'+i+'">DATA.'+i+'</option>');
			}

			var $selectFNOuter = $('<span class="range-4" />'),
				$selectFN = $('<select name="field_nm" class="form-select" data-ui="false" />')
					.append('<option value="*">'+'[선택하세요]'+'</option>')
					.appendTo($selectFNOuter);

			var $selectFFOuter = $('<span class="range-2 form-select-outer" />'),
				$selectFF = $('<select name="field_func" class="form-select" />')
					.append('<option value="8">'+'일'+'</option>')
					.append('<option value="10">'+'시'+'</option>')
					.append('<option value="11">'+'10분'+'</option>')
					.append('<option value="12">'+'1분'+'</option>')
					.appendTo($selectFFOuter);

			var $imageOuter = $('<span class="range-2" />'),
				$image1 = $('<button type="button" class="btn-basic btn-mini btn-plus btn-add-field"><i class="icon-plus"></i></button>').appendTo($imageOuter),
				$image2 = $('<button type="button" class="btn-basic btn-mini btn-minus btn-del-field"><i class="icon-minus"></i></button>').appendTo($imageOuter);

			$tr.append( $('<td class="field_nm_td">').append( $('<div class="field_tree_div ranges-group">').append( $selectSeqOuter, $selectFNOuter, $selectFFOuter, $imageOuter ) ) );

			//통계
			var $selectFOuter = $('<span class="range-2 form-select-outer" />'),
				$selectF = $('<select name="func" class="form-select" />')
					.append('<option value="count">'+'Count'+'</option>')
					.append('<option value="sum">'+'SUM'+'</option>')
					.append('<option value="avg">'+'AVG'+'</option>')
					.append('<option value="max">'+'MAX'+'</option>')
					.append('<option value="min">'+'MIN'+'</option>')
					.appendTo($selectFOuter);

			//번호
			var $selectFSeqOuter = $('<span class="range-3 func_field_span form-select-outer" />'),
				$selectFSeq = $('<select name="func_field_set_seq" class="form-select" />')
					.append('<option value="">[선택]</option>')
					.appendTo($selectFSeqOuter);

			for(var i = 1 ; i < oTree.count() ; i++){
				var tempNode  = oTree.getNodeByKey(String(i));
				
				if(i > 1){
					var joinOperator;
					if(tempNode.data.dto.join_field_list) joinOperator = tempNode.data.dto.join_field_list[0].operator;
					else joinOperator = m$.form.find("[name=join_operator]").first().val();

					if(joinOperator != "=" && joinOperator != "=*") continue;
				}
				
				$selectFSeq.append("<option value='"+i+"'>DATA."+i+"</option>");
			}
			
			//통계필드	
			var $selectFFNOuter = $('<span class="range-5 form-select-outer" />'),
				$selectFFN = $('<select name="func_field_nm" class="form-select" data-ui="false" />')
					.append('<option value="*">'+'[선택하세요]'+'</option>')
					.appendTo($selectFFNOuter);

			var $divRange = $('<div class="ranges-group" />')
					.append($selectFOuter,$selectFSeqOuter, $selectFFNOuter);
			$tr.append($("<td>").append($divRange));

			//버튼
			var $image1 = $('<button type="button" class="btn-basic btn-mini btn-minus btn-del-item"><i class="icon-minus"></i></button>')
				.appendTo( $('<td class="imgTd">').appendTo( $tr.appendTo($listTable) ) );

			$tr.find('[name=field_nm]').chosen();
			$tr.find('[name=func_field_nm]').chosen();

			fieldFuncEvent();
			funcEvent();
		});

		//분석정보 삭제
		m$.form.on("click",".btn-del-item",function(e){

			var $listTable = m$.itemListTable;
			if(($listTable.find("tr")).length == 1) return;
			
			var $parent = $(this).parents('tr');
			$parent.remove();
		});
		
		//기준필드 추가
		m$.form.on("click",".btn-add-field",function(e){
			var $parent = $(this).parents('.field_tree_div');//버튼이 담겨있는 <div>
			var $tdParent = $(this).parents('td');//버튼이 담겨있는 <td>
			
			var firstFieldNm = $tdParent.find("[name=field_nm]").eq(0).val()

			if( $tdParent.find(".field_tree_div").length >= 5){
				_alert("더이상 등록 할 수 없습니다.");
				return;
			}
			
			var $selectSeqOuter = $('<span class="range-2 form-select-outer" />'),
				$selectSeq = $('<select name="field_set_seq" class="form-select" aria-value="" />')
					.append('<option value="">[선택]</option>')
					.appendTo($selectSeqOuter);
			for(var i = 1 ; i < oTree.count() ; i++){
				var tempNode  = oTree.getNodeByKey(String(i));
				
				if(i > 1){
					var joinOperator;
					if(tempNode.data.dto.join_field_list) joinOperator = tempNode.data.dto.join_field_list[0].operator;
					else joinOperator = m$.form.find('[name=join_operator]').first().val();
					
					if(joinOperator != "=" && joinOperator != "=*") continue;
				}
				$selectSeq.append('<option value="'+i+'">DATA.'+i+'</option>');
			}
			
			var $selectFNOuter = $('<span class="range-4" />'),
				$selectFN = $('<select name="field_nm" class="form-select" aria-value="" data-ui="false" />')
					.append('<option value="*">'+'[선택하세요]'+'</option>')
					.appendTo($selectFNOuter);

			var $selectFFOuter = $('<span class="range-2 form-select-outer" />'),
				$selectFF = $('<select name="field_func" class="form-select" />')
					.append('<option value="8">'+'일'+'</option>')
					.append('<option value="10">'+'시'+'</option>')
					.append('<option value="11">'+'10분'+'</option>')
					.append('<option value="12">'+'1분'+'</option>')
					.appendTo($selectFFOuter);

			var $imageOuter = $('<span class="range-2" />'),
				$image1 = $('<button type="button" class="btn-basic btn-mini btn-plus btn-add-field"><i class="icon-plus"></i></button>').appendTo($imageOuter),
				$image2 = $('<button type="button" class="btn-basic btn-mini btn-minus btn-del-field"><i class="icon-minus"></i></button>').appendTo($imageOuter);

			var $div = $('<div class="field_tree_div ranges-group">').append($selectSeqOuter,$selectFNOuter,$selectFFOuter,$imageOuter);
			//$parent.after($div);
			$tdParent.append($div);

			$div.find('[name=field_nm]').chosen();
			
			fieldFuncEvent();
			funcEvent();
		});
		
		//기준필드 삭제
		m$.form.on("click",".btn-del-field",function(e){
			var $tdParent = $(this).parents('td');//버튼이 담겨있는 <td>
			if( $tdParent.find(".field_tree_div").length == 1){
				return;
			}
			
			//표시형태가 TimeLine일때는 장비발생시간이 첫번째 기준필드여야 하고 삭제되면 안돼
			var $gParent = $(this).parents('tr');
			var $Parent = $(this).parents('td');
			var viewType = $gParent.find("[name=view_type]").val();
			
			var $parent = $(this).parents('.field_tree_div');//버튼이 담겨있는 <div>
			$parent.remove();
		});
	},

	setTypeChange = function(){
		setTypeChangeInit();
		onChangeCycleType();
		
		var aNode = oTree.getActiveNode();
		if(aNode != null && aNode.data.dto.set_seq != 0){
			var formData = TreeManager.getFormData();
			$.extend(aNode.data.dto ,formData);
			aNode.setTitle(formData.title);
		}
	},
	
	joinOperChangeEvent = function(){
		var joinOperator = $(this).val();
		var prevVal = $(this).data("prev");
		
		if(m$.form.find(".join_div").length > 1){
			if(joinOperator == "NOT IN" || joinOperator == "IN" ){
				var _this = $(this);
				var $sJoinDiv = $(this).closest(".join_div").siblings(".join_div");
				_confirm("다른 데이터관계 설정은 삭제됩니다.",{
					onAgree : function(){
						$sJoinDiv.remove();
					},
					onDisagree : function(){
						_this.val(prevVal);
					}
				});
			}else{
				m$.form.find("[name=join_operator]").val(joinOperator);
			}	
		}
		
		autoJoinDisabledCheck();
		
		var aNode = oTree.getActiveNode();
		var dataSeq = aNode.data.dto.set_seq;

		if(joinOperator != "=" && joinOperator !="=*"){

			//삭제된 데이터를 참조하던 기준필드들의 번호와 필드 초기화
			m$.form.find("[name=field_set_seq]").each(function(){
				if( dataSeq == $(this).val()){
					$(this).attr("aria-value","");
					var $select = $(this).closest("td").find("[name=field_nm]");
					var tNode= new Object({data:{dto:{set_type : "del",file_id :""}}});
					appendChosen($select,tNode,"*");
				}
			});
			
			//삭제된 데이터를 참조하던 통계들의 번호와 필드 초기화
			m$.form.find("[name=func_field_set_seq]").each(function(){
				if( dataSeq == $(this).val()){
					$(this).attr("aria-value","");
					var $select = $(this).closest("td").find("[name=func_field_nm]");
					var tNode= new Object({data:{dto:{set_type : "del",file_id :""}}});
					appendChosen($select,tNode,"*");
				}
			});
			
			//기준필드의 번호들 초기화
			m$.form.find("[name=field_set_seq]").each(function(){
				var selVal = $(this).attr("aria-value");
				$(this).html("<option value=''>[선택]</option>");
				for(var i = 1 ; i < oTree.count() ; i++){
					if(i != dataSeq) $(this).append("<option value='"+i+"'>DATA."+i+"</option>");
				}
				$(this).val(selVal);
			});
			
			//통계의 번호들 초기화
			m$.form.find("[name=func_field_set_seq]").each(function(){
				var selVal = $(this).attr("aria-value");
				$(this).html("<option value=''>[선택]</option>");
				for(var i = 1 ; i < oTree.count() ; i++){
					if(i != dataSeq) $(this).append("<option value='"+i+"'>DATA."+i+"</option>");
				}
				$(this).val(selVal);
			});	
			
		}else{
			//기준필드의 번호들 초기화
			m$.form.find("[name=field_set_seq]").each(function(){
				var selVal = $(this).attr("aria-value");
				$(this).html("<option value=''>[선택]</option>");
				for(var i = 1 ; i < oTree.count() ; i++){
					$(this).append("<option value='"+i+"'>DATA."+i+"</option>");
				}
				$(this).val(selVal);
			});
			
			//통계의 번호들 초기화
			m$.form.find("[name=func_field_set_seq]").each(function(){
				var selVal = $(this).attr("aria-value");
				$(this).html("<option value=''>[선택]</option>");
				for(var i = 1 ; i < oTree.count() ; i++){
					$(this).append("<option value='"+i+"'>DATA."+i+"</option>");
				}
				$(this).val(selVal);
			});	
		}
		
		slui.attach.setTransformSelect(mCfg.formId);
	},
	
	autoJoinDisabledCheck = function(){
		var joinOpVal = m$.form.find("[name=join_operator]:first").val();
		if(joinOpVal == "=" || joinOpVal == "=*"){
			m$.btnFldJoin.css("visibility","visible");
		}else{
			m$.btnFldJoin.css("visibility","hidden");
		}
	},	
	
	fieldSeqChangeEvent = function(){
		var treeKey = $(this).val();
		$(this).attr("aria-value",treeKey);

		var viewType = $(this).closest('tr').find("[name=view_type]").val();
		var $select = $(this).closest('div').find("[name=field_nm]");
		
		//표시형태가  time라인이고 기준필드가 eqp_dt일때는 번호를 변경해도 셀렉트가 바뀌지 않게..
		if(viewType=="T" && $select.val() == "eqp_dt") return;

		$select.html("<option value='*'>[선택하세요]</option>");

		if(treeKey!=""){
			var node = oTree.getNodeByKey(treeKey);
			var selVal = "*";
			
			appendChosen($select,node,selVal);
		}else{
			$select.trigger("chosen:updated");
		}		
	},
	
	funcSeqChangeEvent = function(){
		var treeKey = $(this).val();
		var $select = $(this).closest("div").find("[name=func_field_nm]");
		
		$(this).attr("aria-value",treeKey);
		$select.html("<option value='*'>[선택하세요]</option>");
		if(treeKey!=""){
			var node = oTree.getNodeByKey(treeKey);
			var selVal = "*";
			appendChosen($select,node,selVal);
			
		}else{
			$select.trigger("chosen:updated");
		}
	},
	
	viewTypeChangeEvent = function(){
		if( $(this).val() == "T"){//표시형태가 TimeLine
			var $parent = $(this).closest('tr'),
				$treeTd = $parent.find(".field_nm_td"),
				$treeDiv = $parent.find(".field_tree_div").remove();
			
			//기준필드
			var $selectSeqOuter = $('<span class="range-2 form-select-outer"/>'),
				$selectSeq = $('<select name="field_set_seq" class="form-select" aria-value=""/>')
					.append("<option value=''>[선택]</option>")
					.appendTo($selectSeqOuter);
			
			for(var i = 1 ; i < oTree.count() ; i++){
				$selectSeq.append("<option value='"+i+"'>DATA."+i+"</option>");
			}
			
			var $selectFNOuter = $('<span class="range-4"/>'),
				$selectFN = $('<select name="field_nm" class="form-select" aria-value="" data-ui="false" disabled="true"/>')
					.append("<option value='*'>"+"[선택하세요]"+"</option>");

			$.each(gFieldCaptions, function(i, val) {
				if( i =="eqp_dt"){
					$selectFN.append("<option value='"+ i +"' selected>"+val+" ["+ i +"]</option>");
				}else{
					$selectFN.append("<option value='"+ i +"'>"+val+" ["+ i +"]</option>");
				}	
			});
			$selectFN.appendTo($selectFNOuter);
			
			var $selectFFOuter = $('<span class="range-2 form-select-outer" />'),
				$selectFF = $('<select name="field_func" class="form-select">')
					.append("<option value='8'>"+"일"+"</option>")
					.append("<option value='10'>"+"시"+"</option>")
					.append("<option value='11'>"+"10분"+"</option>")
					.append("<option value='12'>"+"1분"+"</option>")
					.appendTo($selectFFOuter);

			//$select2.append("<option value='11'>"+"10분"+"</option>");
		
			var $imageOuter = $('<span class="range-2" />'),
			$image1 = $('<button type="button" class="btn-basic btn-mini btn-plus btn-add-field"><i class="icon-plus"></i></button>').appendTo($imageOuter);
			//$image2 = $('<button type="button" class="btn-basic btn-mini btn-minus btn-del-field"><i class="icon-minus"></i></button>').appendTo($imageOuter),

			var $div = $("<div class='field_tree_div ranges-group' />").append($selectSeqOuter,$selectFNOuter,$selectFFOuter,$imageOuter)
				.appendTo($treeTd);

			$div.find("[name=field_nm]").chosen();

		}else{
			var $parent = $(this).parents('tr');
			$treeDiv = $parent.find(".field_tree_div");
			
			$treeDiv.find("[name=field_nm]").prop("disabled",false);
			$treeDiv.find("[name=field_nm]").trigger("chosen:updated");
		}
		
		fieldFuncEvent();
		funcEvent();
		slui.attach.setTransformSelect(mCfg.formId);
	},
		
	getDbFieldInfo = function(){
		var aNode = exNode;
		var sqlQuery = $.trim(aNode.data.dto.sql_query);
		if( sqlQuery == ""){
			_alert("Query를 입력해 주세요.");
			return;
		}
				
		$('body').requestData(mCfg.urlLoadBigDbData,{sql_query:sqlQuery}, {
			callback : function(rsData, rsCd, rsMsg){
				if(rsCd=="SUC_COM_0000"){
					oTree.getActiveNode().data.dto.checkDb = true ;
					changeJoinField(aNode);
					_alert("필드정보Check 완료");
				}else{
					_alert("Query의 필드정보를 불러오는 중 에러가 발생했습니다.<br>Query를 확인해주세요.");
				}
				

			}
		});
	},
	
	loadFileInfo = function(fileId){
		$('body').requestData(mCfg.urlLoadBigFileData,{file_id:fileId}, {
			callback : function(rsData, rsCd, rsMsg){
				if(rsCd=="SUC_COM_0000"){
					var data = rsData.data;
					m$.fileId.val(data.file_id);
					m$.fileDataName.val(data.file_data_name);
					m$.orgFileName.val(data.org_file_name);
					
					//트리에 불러온 정보 반영
					var aNode = oTree.getActiveNode();
					if(aNode != null && aNode.data.dto.set_seq != 0){
						var formData = TreeManager.getFormData();
						$.extend(aNode.data.dto ,formData);
						aNode.setTitle(formData.title);
						changeJoinField(aNode);
					}
				}else{
					_alert("파일 정보를 불러오는 중 에러가 발생했습니다.");
				}
			}
		});
	},

	autoFieldJoin = function(){
		var joinOpVal = m$.form.find("[name=join_operator]:first").val();
		var joinFieldInfoList =[];
		var aNode = oTree.getActiveNode();
		
		if(joinOpVal == "=" || joinOpVal == "=*"){//INNER JOIN,OUTER JOIN일때만... 
			
			if(oTree.count() > 3) return;//데이터셋이 2개일때만 동작
			
			if(!autoFieldJoinValidate(aNode.data.dto.set_type)){
				return;
			} else{
				if(aNode != null){
					var formData = TreeManager.getFormData();
					$.extend(aNode.data.dto, formData )
					aNode.setTitle(formData.title);
				}
			}
			oTree.visit(function(node){
				var data = node.data.dto;
				if(data.set_seq != 0) joinFieldInfoList.push(data);
			});
						
			$('body').requestData(mCfg.urlAutoJoinField, {join_field_info_list : joinFieldInfoList}, {
				displayLoader:true,
				callback : function(rsData, rsCd, rsMsg){
					
					if(rsCd=="SUC_COM_0000"){
						var dupFldList = rsData.dupFldList;
						
						if(dupFldList.length > 0){
							
							m$.form.find(".join_div").remove();
							for(var idx in dupFldList){
								appendJoinField(aNode,dupFldList[idx],dupFldList[idx],joinOpVal);
							}
						}else{
							_alert("공통 필드가 없습니다.");
						}
					}else{
						_alert("파일의 필드정보를 불러오는 중 에러가 발생했습니다.");	
					}
				}	
			});
		}
	},
	
	autoFieldJoinValidate = function(setType){
		var validate = true;
		switch(setType){
			case "S":
				if(gNetworkList.length > 1 && m$.form.find("[name=client_group_cd]:checked").length == 0) {
					_alert("검색할 Network을 체크하세요.");
					return false;
				}
				
				var sTime = m$.schStartDay.val() + m$.schStartHour.val() + m$.schStartMin.val();
				var eTime = m$.schEndDay.val() + m$.schEndHour.val() + m$.schEndMin.val();
				var diffTime = _SL.formatDate.diff(sTime, eTime);
				
				if(sTime > eTime) {
					_alert("검색기간 종료시간이 시작시간보다 커야 합니다.");
					return false;
			    }
				if(!_SL.validate(m$.schQuery)) validate = false;
				break;
				
			case "F":
				if(!_SL.validate(m$.fileDataName)) validate =  false;
				break;
				
			case "D":
				if(!_SL.validate(m$.sqlQuery)){
					validate =  false;
					break;
				}
				
				if(!exNode.data.dto.checkDb){
					_alert("필드정보Check를 해주세요.");
					validate =  false;
				}
				break;
			default :
				return validate = false;
				break;
		}
		return validate;
	},
	
	changeJoinField = function(node){
		var setSeq = node.data.dto.set_seq;
		
		var $select = m$.form.find("[name=join_field_nm]");
		var $select2 =  m$.form.find("[name=join_rel_field]");
		
		if( setSeq == 0 || setSeq == 1 ){
			$select.val("*");
			$select.trigger("chosen:updated");
		
			$select2.val("*");
			$select2.trigger("chosen:updated");
		}else{
			var pNode = node.getParent();
			var fieldNm = node.data.dto.field_nm;
			var relField = node.data.dto.rel_field;
			
			if(mState.isNew || m$.status.val() =="9"){//처음 등록할때와 상태가 오류일때만 수정가능
				$select.prop("disabled",false);
				$select2.prop("disabled",false);
			}
			
			appendChosen($select,node,fieldNm);
			appendChosen($select2,pNode,relField);
		}		
	},
	
	checkInvalid = function(){
		var type = $(this).data("type");
		if(!_SL.validate(m$.statsNm)) return;
		
		if(oTree.count() <= 1){
			_alert("분석데이터를 등록해 주세요.");
			return;
		}
		
		if(exNode != null && exNode.data.dto.seq_no != 0 ){
			if(!TreeManager.nodeValidate())	return;
			
			var aNode = oTree.getActiveNode();
			if(aNode != null){
				var formData = TreeManager.getFormData();
				$.extend(aNode.data.dto, formData )
				aNode.setTitle(formData.title);
			}
		}
		
		if(!_SL.validate(m$.form.find("[name=item_nm]"))) return;
		if(!itemListToJsonString()) return;
		datasetToJsonString();
		
		onSave(type);		
	},	


	onSave = function(type){
		
		if(type=="save"){
			m$.form.find("[name=share_user_list] option").each(function(){this.selected = true;}); 
			
			if(m$.pageType.val() == "big_stats_mng_load") m$.procPct.val(0);
			
			var afterClose = $(this).data('after-close') == true ? true : false;
			var req = $.extend({},_SL.serializeMap(m$.form),{item_list_json : itemList, dataset_list_json : datasetList});
						
			$('body').requestData(mState.mode.action, req, {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}
		
		else if(type=="retry"){
			m$.form.find("[name=share_user_list] option").each(function(){this.selected = true;}); 
			
			var afterClose = $(this).data('after-close') == true ? true : false;
			var req = $.extend({},_SL.serializeMap(m$.form),{item_list_json : itemList, dataset_list_json : datasetList});
				
			$('body').requestData(mState.mode.action, req, {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(true);
						}
					});
				}
			});
		}else if(type=="stop"){
			var scheduleId = m$.scheduleId.val();
			var bigCode = m$.bigCode.val();
			
			$('body').requestData(mCfg.urlChkLastCode, {schedule_id:scheduleId}, {
				callback : function(rsData, rsCd, rsMsg){
					if(rsData == bigCode) {
						
						$('body').requestData(mCfg.urlStopBigStats, {big_code:bigCode}, {
							callback : function(rsData, rsCd, rsMsg){
								onClose(true);
							}
						});
						
					} else {
						_alert("상태가 변경되어 중지할 수 없습니다.", {
							onAgree : function(){
								onClose(true);
							}
						});
					}
					
				}	
			});	
		}
	},
		
	
	itemListToJsonString = function(){
		var list =[];
		var $listTable = m$.itemListTable;
		var count = ($listTable.find("tr")).length;
		var checkFieldValidate = true;
		
		for(var i=0; i<count; i++){
			
			var groupFieldList =[];
			var checkFieldArr = [];
			var checkEqpDtFieldArr = [];
			//기준필드들 먼저 넣고
			m$.form.find(".field_nm_td").eq(i).find("[name=field_nm]").each(function(idx){
				if(!checkFieldValidate) return;
				
				var fieldSeq = idx+1;
				var fieldNm = $(this).val();
				var fieldAlias = gFieldCaptions[fieldNm] ? gFieldCaptions[fieldNm] : fieldNm;
				var setSeq = $(this).closest("td").find("[name=field_set_seq]").val();
				
				if(fieldNm=="*"){
					_alert("기준필드를 선택해 주세요.");
					checkFieldValidate = false;
					return;
				}
				
				if(checkFieldArr.indexOf(setSeq+fieldNm) != -1){
					_alert("기준필드에 중복된 값이 있습니다.");
					checkFieldValidate = false;
					return;
				}
				
				if(fieldNm=="eqp_dt" && checkEqpDtFieldArr.indexOf(fieldNm) != -1){
					_alert("장비 발생시간은 하나만 선택할 수 있습니다.");
					checkFieldValidate = false;
					return;
				}
				
				if(setSeq==""){
					_alert("기준필드의 DATA번호를 선택해 주세요.");
					checkFieldValidate = false;
					return;
				}
				
				checkFieldArr.push(setSeq+fieldNm);
				checkEqpDtFieldArr.push(fieldNm);
						
				var fieldFuncVal = null;
				if(fieldNm == "eqp_dt") fieldFuncVal = $(this).closest("div").find("[name=field_func]").val();
				
				groupFieldList.push({
					field_seq		: fieldSeq,
					set_seq			: setSeq,
					field_nm 		: fieldNm,
					func			: fieldFuncVal,
					field_alias		: fieldAlias
				});
			});
			
			if(!checkFieldValidate) return;
			
			var funcFieldNm = "*";
			var funcFieldSeq = ((m$.form.find(".field_nm_td").eq(i)).find("[name=field_nm]")).length + 1;
			var setSeq =  m$.form.find("[name=func_field_set_seq]").eq(i).val();
			var funcFieldAlias = gFieldCaptions[funcFieldNm];
			var funcVal = m$.form.find("[name=func]").eq(i).val();
			
			if(funcVal != "count"){
				funcFieldNm = m$.form.find("[name=func_field_nm]").eq(i).val();
				if(funcFieldNm =="*"){
					_alert("통계필드를 선택해 주세요");
					checkFieldValidate = false;
					return checkFieldValidate;
				}
				funcFieldAlias = gFieldCaptions[funcFieldNm] ? gFieldCaptions[funcFieldNm] : funcFieldNm;
			}else{
				if(!setSeq){
					_alert("통계DATA를 선택해 주세요");
					checkFieldValidate = false;
					return checkFieldValidate;
				}
			}
			
			//마지막에 통계필드 넣고
			groupFieldList.push({
				field_seq		: funcFieldSeq,
				set_seq			: setSeq,
				field_nm 		: funcFieldNm,
				func			: funcVal,
				field_alias		: funcFieldAlias
			});
			
			list.push({
				item_seq : i + 1,
				item_nm : $.trim(m$.form.find("[name=item_nm]").eq(i).val()),
				view_type : $.trim(m$.form.find("[name=view_type]").eq(i).val()),
				group_field_list : groupFieldList
			});
		}
		
		itemList = list;
		return checkFieldValidate;
	},
	
	datasetToJsonString = function(){
		var list=[];
		
		oTree.visit(function(node){
			var dto = node.data.dto;
			if(dto.set_seq != 0){
				list.push(dto);
			}
		});
		datasetList = list;		
	},
	
	
	select = function() {
		m$.itemListTable.empty();
		
		var
		bigCode = m$.bigCode.val(),
		rqData = {'big_code': bigCode},
		
		callback = function(rsData){
			var 
				datasetList = rsData.datasetList,
				datasetData = datasetList[0],
				shareUserList = rsData.shareUserList;
			
			m$.scheduleId.val(datasetData.schedule_id);
			m$.status.val(datasetData.status);
			m$.procPct.val(datasetData.proc_pct);
			m$.lastCodeYn.val(datasetData.last_code_yn);
			
			_SL.setDataToForm(datasetData, m$.form);//기본정보
			
			for(var i in shareUserList) {
				var 
					userData = shareUserList[i],
					userId = userData.user_id,
					userInfo = userData.user_nm + " ["+ userData.user_id +"]";
				
				m$.form.find("[name=share_user_list]").append($("<option value='"+userId+"'>"+userInfo+"</option>"));
			}
			
			var curTime, mixedGenCycleType, cycleType, cycleTimes, cyclehhmm;
			
			curTime = datasetData.sch_start_dt;
			cycleType = datasetData.gen_cycle_type;
			cycleTimes = datasetData.gen_cycle_times;
		
			if("1dwM".indexOf(cycleType) > 0) mixedGenCycleType = cycleType + ",0";		
			else mixedGenCycleType = cycleType+","+cycleTimes; 

			if(cycleType =="w") m$.genStartWeek.val(cycleTimes);
			if(cycleType =="M")	m$.genStartDay2.val(cycleTimes < 10 ? "0" + cycleTimes : cycleTimes);
			
			m$.genCycleType.val(mixedGenCycleType);
			m$.genSch.val("0");
			
			if(curTime == "") curTime = _SL.formatDate();
			
			m$.genStartDay.val(curTime.substring(0,8));
			m$.genStartHour.val(curTime.substring(8,10));
			m$.genStartMin.val(curTime.substring(10,12));
			
			onChangeGenTime();
			//Basic information end
			
			//Tree data start
			for(var idx in datasetList){
				var data = datasetList[idx];
				var pKey = data.rel_set_seq;//dtl_ord_no순으로 불러오기 때문에 parent만 찾아서 appen해주면 끝
				data.checkDb = true ;//이미 dbCheck를 하고 저장되어있던 정보이기 때문에 true;
				
				if(pKey == null) pKey = 0; 
				
				var title ;
				switch(data.set_type){
					case "S" : 
						title = data.set_seq + ".[검색] : " + data.sch_query;
						break;
					case "F" :
						title = data.set_seq + ".[파일] : " + data.file_data_name;
						break;
					case "D" :
						title = data.set_seq  + ".[DB] : " + data.sql_query;
						break;
				}	
				
				oTree.getNodeByKey(pKey.toString()).addChild({
					title : title, 
					key : (datasetList[idx].set_seq).toString(), 
					dto : data,
					icon : false,
					children : []
				});
				
				if(idx == 0){
					var tempNode  = oTree.getNodeByKey( (datasetList[idx].set_seq).toString() );
					tempNode.activate();
				}
			}
			//Tree data end
			
			//Item data start
			var itemList = rsData.itemList;
			for(var i in itemList){//분석항목
				addItemTr(itemList[i]);
			}
			disabledCheck();
			//select 후 기준필드의 번호들 초기화
			m$.form.find("[name=field_set_seq]").each(function(){
				var selVal = $(this).attr("aria-value");
				for(var i = 1 ; i < oTree.count() ; i++){
					var tempNode  = oTree.getNodeByKey(String(i));
					
					if(i > 1){
						var joinOperator = tempNode.data.dto.join_field_list[0].operator;
						if(joinOperator != "=" && joinOperator != "=*") continue;
					}
					
					$(this).append("<option value='"+i+"'>DATA."+i+"</option>");
				}
				$(this).val(selVal);
			});
			
			
			//select 후 통계의 번호들 초기화
			m$.form.find("[name=func_field_set_seq]").each(function(){
				var selVal = $(this).attr("aria-value");
				for(var i = 1 ; i < oTree.count() ; i++){
					var tempNode  = oTree.getNodeByKey(String(i));
					
					if(i > 1){
						var joinOperator = tempNode.data.dto.join_field_list[0].operator;
						if(joinOperator != "=" && joinOperator != "=*") continue;
					}
					
					$(this).append("<option value='"+i+"'>DATA."+i+"</option>");
				}
				$(this).val(selVal);
			});
			
			
			changeEvents();
			
			//select 후 DATA번호에 맞는 기준필드 초기화..
			$("[name=field_set_seq]").each(function(){
				var treeKey = $(this).val();
				
				var $gParent = $(this).parents('tr');
				var $Parent = $(this).parents('td');
				var viewType = $gParent.find("[name=view_type]").val();
				var $select = $(this).closest("div").find("[name=field_nm]");

				$select.html("<option value='*'>[선택하세요]</option>");

				if(treeKey!=""){
					var node = oTree.getNodeByKey(treeKey);
					var selVal = $select.attr("aria-value");
					
					appendChosen($select,node,selVal);
				}else{
					$select.trigger("chosen:updated");
				}
			});
			
			//select 후 DATA번호에 맞는 통계필드 초기화
			$("[name=func_field_set_seq]").each(function(){
				var treeKey = $(this).val();
				
				var $select = $(this).closest("td").find("[name=func_field_nm]");
				$select.html("<option value='*'>[선택하세요]</option>");
				if(treeKey!=""){
					var node = oTree.getNodeByKey(treeKey);
					var selVal = $select.attr("aria-value");
					appendChosen($select,node,selVal);
					
				}else{
					$select.trigger("chosen:updated");
				}
			});
		};
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback, displayLoader : true});
	},
	
	addItemTr = function(itemData){

		var $listTable = m$.itemListTable;
		var $tr = $('<tr>');
		
		var
			itemNm = itemData.item_nm,
			viewType = itemData.view_type,
			itemFieldList = itemData.item_field_list,
			dummy = 0;
		//분석명
		$tr.append('<td>\
						<input name="item_nm" class="form-input form-block" type="text" data-valid="분석항목명,required" value="'+ itemNm +'">\
					</td>');
		
		//표시형태
		$tr.append('<td>\
						<span class="form-select-outer"><select name="view_type" class="form-select">\
							<option value="P"' + (viewType == 'P' ? ' selected':'') + '>Pie</option>\
							<option value="B"' + (viewType == 'B' ? ' selected':'') + '>Bar</option>\
							<option value="L"' + (viewType == 'L' ? ' selected':'') + '>Line</option>\
							<option value="T"' + (viewType == 'T' ? ' selected':'') + '>TimeLine</option>\
						</select></span>\
					</td>');
		
		//기준필드
		var $fldTd = $('<td class="field_nm_td">');
		for(var idx in itemFieldList){
			if(idx == itemFieldList.length -1 ) break;//마지막필드는 통계필드

			var 
				fldData = itemFieldList[idx],
				setSeq = fldData.set_seq,
				fldNm = fldData.field_nm,
				func = fldData.func;
			
				$fldTd.append('<div class="field_tree_div ranges-group">\
							<span class="range-2 form-select-outer">\
								<select name="field_set_seq" class="form-select" aria-value="'+ setSeq +'">\
									<option value="">[선택]</option>\
								</select>\
							</span>\
							<span class="range-4">\
								<select name="field_nm" class="form-select" aria-value="'+ fldNm +'" data-ui="false"'+ (viewType == 'T' ? ' disabled="true"':'') + '>\
									<option value="*">[선택하세요]</option>\
								</select>\
							</span>\
							<span class="range-2 form-select-outer">\
								<select name="field_func" class="form-select">\
									<option value="8"' + (func == '8' ? ' selected':'') + '>일</option>\
									<option value="10"' + (func == '10' ? ' selected':'') + '>시</option>\
									<option value="11"' + (func == '11' ? ' selected':'') + '>10분</option>\
									<option value="12"' + (func == '12' ? ' selected':'') + '>1분</option>\
								</select>\
							</span>\
							<span class="range-2">\
								<button type="button" class="btn-basic btn-mini btn-add-field"><i class="icon-plus"></i></button><button type="button" class="btn-basic btn-mini btn-minus btn-del-field" ><i class="icon-minus"></i></button>\
							</div>');
		}
		$tr.append($fldTd);

		//통계
		var funcData = itemFieldList[itemFieldList.length-1];

		//표시형태
		$tr.append('<td>\
					<div class="ranges-group">\
						<span class="range-2 form-select-outer">\
							<select name="func" class="form-select">\
								<option value="count"' + (funcData.func == 'count' ? ' selected':'') + '>Count</option>\
								<option value="sum"' + (funcData.func == 'sum' ? ' selected':'') + '>SUM</option>\
								<option value="avg"' + (funcData.func == 'avg' ? ' selected':'') + '>AVG</option>\
								<option value="max"' + (funcData.func == 'max' ? ' selected':'') + '>MAX</option>\
								<option value="min"' + (funcData.func == 'min' ? ' selected':'') + '>MIN</option>\
							</select>\
						</span>\
						<span class="range-3 form-select-outer func_field_span">\
							<select name="func_field_set_seq" class="form-select" aria-value="'+ funcData.set_seq +'">\
								<option value="">[선택]</option>\
							</select>\
						</span>\
						<span class="range-5 form-select-outer">\
							<select name="func_field_nm" class="form-select" aria-value="'+ funcData.field_nm +'" data-ui="false">\
								<option value="*">[선택하세요]</option>\
							</select>\
						</span>\
					</div>\
				</td>');
		//버튼
		$tr.append('<td class="imgTd">\
						<button type="button" class="btn-basic btn-mini btn-minus btn-del-item"><i class="icon-minus"></i></button>\
					</td>');
		
		
		$tr.appendTo($listTable);

		setTimeout(function(){
			slui.attach.setTransformSelect(mCfg.formId);
			m$.form.parents('.nano').nanoScroller();
		},10);
	},

	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};

	return {
		init: init,
		loadFileInfo:loadFileInfo
	};

}();

$(function(){
	slapp.bigStatsManager.form.init();
});