//# sourceURL=search_event-dyn_paging.js
'use strict';

_SL.nmspc("searchEvent").dynPaging = function(){
	var
	// Reference Modules
	refQuery, refDnt, refDlgViewField, 

	URL_PATH = gCONTEXT_PATH + "event/",
	
	mCfg = {
		// DOM ID
		DOM : {
			formId 		: '#searchSearchEventList',
			searchEventListTable	: "#searchEventListTable",
			pageRow		: "#pageRow",
			currPage	: "#currPage",
			divPaging	: "#divPaging",
			divTotal	: "#divTotal",
			
			classMore	: "btn-basic btn-more",
			classPcap	: "btn-basic btn-pcap",
			classFieldName : "field-name",
			classFieldValue : "field-value",
		},
		
		URL : {
			list		: URL_PATH + "search_event_list.json",
			logSearch	: gCONTEXT_PATH + "monitoring/log_search.html"
		},
		
		timeUnit : {
			min : 60 * 1000,
			hour : 60 * 60 * 1000,
			day : 24 * 60 * 60 * 1000,
			week : 7 * 24 * 60 * 60 * 1000,
			month : 30 * 24 * 60 * 60 * 1000
		},
		
		schTimeUnit : {hour : 60},
		
		pageRowUnit : [10, 15, 20, 30, 50, 100],
		
		fixedSizeField : {
			event_time : 130,
			event_option : 180,
			standard_time : 90,
			limit_count : 80,
			limit_distinct_count : 80,
			cnt : 80,
			event_cate_cd : 50,
			event_level : 100,
			handling_type_cd : 50	
		},
		
		alignLeftFieldRegExp : /(event_nm)/
	},
	
	m$ = {
		form		: $(mCfg.DOM.formId),
		searchEventListTable	: $(mCfg.DOM.searchEventListTable),
		pageRow		: $(mCfg.DOM.pageRow),
		currPage	: $(mCfg.DOM.currPage),
		divPaging	: $(mCfg.DOM.divPaging),
		divTotal	: $(mCfg.DOM.divTotal),		
		
		sDay 	: $(mCfg.DOM.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.DOM.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.DOM.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.DOM.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.DOM.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.DOM.formId + ' [name=endMin]'),
		
		groupCd 		: $(mCfg.DOM.formId + ' [name=s_group_cd]'),
		eventCateCd 	: $(mCfg.DOM.formId + ' [name=s_event_cate_cd]'),
		eventNm 		: $(mCfg.DOM.formId + ' [name=s_event_nm]'),
		eventLevel 		: $(mCfg.DOM.formId + ' [name=s_event_level]'),
		fieldVal 		: $(mCfg.DOM.formId + ' [name=s_field_val]'),
		handlingTypeCd 	: $(mCfg.DOM.formId + ' [name=s_handling_type_cd]'),
		dashboardYn 	: $(mCfg.DOM.formId + ' [name=s_dashboard_yn]'),
		eventViewFields 	: $(mCfg.DOM.formId + ' [name=event_view_fields]')
	},

	mState = {
		// 필드 위치
		field_idx_at_TH : 1,
		view_fields : ["eqp_dt","src_ip","dstn_ip","dstn_port","eqp_ip","attack_nm","src_country_name","prtc"],
		
		// 검색조건(검색 전체)
		start_time : 0,
		end_time : 0,
		pageRow : 0,
		currPage : 1,
		startIndex : 0,
		totalPage : 1,
		groupCd : "",
		eventCateCd : "",
		eventNm : "",
		eventLevel : "",
		fiedlVal : "",
		handlingTypeCd : "",
		dashboardYn : "",
		
		// 검색 결과(검색 전체)
		total : 0,
		
		// 검색(사용자 선택 변수)
		rows : 0,

		// 검색 처리용 내부 변수
		listData	: [],	// 화면에 표시되는 데이타
	},
	
	/*** Define Function ***/
	init = function() {
		refDlgViewField	= slapp.searchEvent.dlgViewField;
		
		if(gSearchEventParam.event_view_fields != ""){
			mState.viewFields = gSearchEventParam.event_view_fields;
			initUserFieldNames();
		}
		
		_dispFieldCaption();
		
		// Page Per Rows
		for(var i in mCfg.pageRowUnit) {
			m$.pageRow.append("<option value='" + mCfg.pageRowUnit[i] + "'>" + mCfg.pageRowUnit[i] + "per Page</option>");
		}
		$("option", m$.pageRow).filter("[value=" + mState.pageRow + "]").prop("selected", true);

		
		/*** Bind Event ***/
		
		// 상세 로그 보기
		m$.searchEventListTable.on("click", ".tr-toggler", function(event, elem) {
			$(event.target).toggleClass("open").closest("tr").next().toggle();
		});
		// 상세 로그 리스트 스타일 토글
		m$.searchEventListTable.on("click", ".btn-loglist-toggle", function(event, elem) {
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				$(this).parents('tr').find('.log-lists').addClass('list-inline');
			}else{
				$(this).addClass('active');
				$(this).parents('tr').find('.log-lists').removeClass('list-inline');
			}
		});
		
		// 필드 내용 상세보기
		// Navigation Start 
		m$.pageRow.change(function(event){
			var rows = m$.pageRow.val();
			movePage(1, rows);
		});
		
		m$.currPage.keydown(function(event) {
			if (event.keyCode == 13) {
				if(/[^\d]/.test(m$.currPage.val()) || m$.currPage.val() > mState.totalPage) {
					return;
				}
				
				setTimeout(function(){
					movePage(m$.currPage.val(), mState.pageRow);
				}, 1);
				
			}
		});
		
		$(".btn-next", m$.divPaging).on("click", function(){
			var pNo = mState.currPage + 1;
			movePage(pNo, mState.pageRow);
		});
		
		$(".btn-prev", m$.divPaging).on("click", function(){
			var pNo = mState.currPage - 1;
			movePage(pNo, mState.pageRow);
		});
		//*** Navigation End ***//*
		
		m$.searchEventListTable.on("change", "#chk_all", function() {
			var bChk = this.checked;
			
			$("[name=chk_idx]").each(function(nIdx) {
				this.checked = bChk;
			});
		});
		
		m$.searchEventListTable.on("click", ".view-field-setter", function() { refDlgViewField.open(mState.viewFields) });
		
				
		// Table Column Resizer Init
		setTimeout(function() {
			m$.searchEventListTable.colResizable({
				liveDrag : true,
				minWidth : 30,
				marginLeft : "3px",
				postbackSafe: !true
			});
		}, 1000);
		
		var idItv = setInterval(function(){
			if(m$.searchEventListTable.find("td").size() > 0) {
				$(window).trigger("resize");
				clearInterval(idItv);
			}
		}, 1000);
		
		// Log search
		m$.searchEventListTable.on("click", ".event-nm", function(event, elem) {
			var ariaValue = $(this).data("aria");
			var listVal = ariaValue.split(",");
			var idx = listVal[0];
			
			goSearchPopup(idx);
		});
	},
	
	initUserFieldNames = function() {		
		m$.eventViewFields.val(JSON.stringify(mState.viewFields));
	},
	
	_clearValue = function() {
		mState.total = 0;
		mState.currPage = 1;
		mState.startIndex = 0;
		mState.listData = [];
	},
	
	_dispFieldCaption = function() {
		var width, strCaption, $tr, bSorting;
		
		mState.field_idx_at_TH = 1;
		
		$tr = $("<tr></tr>");
		$tr.append("<th width='30'><input type='checkbox' name='chk_all' id='chk_all' class='form-transform' tabindex='-1'><span class='form-clone' tabindex='0'></span></th>");
		mState.field_idx_at_TH++;

		$tr.append("<th width='35'>번호</th>");
		
		for(var idx in mState.viewFields) {
			width = mCfg.fixedSizeField[mState.viewFields[idx]];

			strCaption = gFieldCaptions[mState.viewFields[idx]];
			
			if(!strCaption){
				strCaption = gFieldJson[mState.viewFields[idx]];
			}
			
			$tr.append(
				$("<th>")
					.css("width", width ? width + "px" : "")
					.addClass('slui-droppable')
					.data("field_index", idx)
					.append(
						$("<span>")
							.addClass("slui-draggable")
							.data("field_index", idx)
							.append(strCaption ? strCaption : mState.viewFields[idx])
					)
			);
		}
		//$tr.append("<th class='slui-droppable' width='30'><span class='view-field-setter icon-cog-full'></span></th>");
		$tr.append("<th class='slui-droppable' width='30'><span class='view-field-setter icon-cog-full'></span></th>");
		
		m$.searchEventListTable
			.append($("<thead>").append($tr))
			.append($("<tbody>"));
		
		_bindFieldCaptionDnd();
		
		$tr = null;
	},
	
	_removeAllRows = function() {
		
		var $children = m$.searchEventListTable.children().detach();
		
		setTimeout(function(){
			$children.remove();
			$children = null;
		}, 1000);
	},
	
	_removeDataRows = function() {
		var $tbody = $("tbody", m$.searchEventListTable).detach();
		m$.searchEventListTable.append($("<tbody>"));
		
		setTimeout(function(){
			$tbody.remove();
			$tbody = null;
		}, 1000);
	},
	
	search = function() {
		_search();
	},
	
	_search = function() {
		// 검색 조건 설정
		mState.start_time 	=	m$.sDay.val() + m$.sHour.val() + m$.sMin.val();
		mState.end_time 	= 	m$.eDay.val() + m$.eHour.val() + 		m$.eMin.val();
		mState.pageRow 		= 	parseInt(m$.pageRow.val()) || 15;
		mState.startIndex 	= 	(mState.currPage - 1) * mState.pageRow;
		mState.groupCd 		= 	m$.groupCd.val();
		mState.eventCateCd 	= 	m$.eventCateCd.val();
		mState.eventNm 		= 	m$.eventNm.val();
		mState.eventLevel	= 	m$.eventLevel.val();
		mState.fiedlVal 	= 	m$.fieldVal.val();
		mState.handlingTypeCd = m$.handlingTypeCd.val();
		mState.dashboardYn = 	m$.dashboardYn.val();		
		
		// 페이징 처리 hide
		m$.divPaging.hide();
	
		// 조회를 위한 값 초기화
		_clearValue();
		_removeDataRows();
		_searchRequest();
	},
	
	_searchRequest = function() {

		$('body').requestData(
			mCfg.URL.list,
			{
				start_time		: mState.start_time,
				end_time 		: mState.end_time,
				pageRow 		: mState.pageRow,
				startIndex 		: mState.startIndex,
				s_group_cd 		: mState.groupCd,
				s_event_cate_cd : mState.eventCateCd,
				s_event_nm		: mState.eventNm,
				s_event_level 	: mState.eventLevel,
				s_field_val 	: mState.fiedlVal,
				s_handling_type_cd : mState.handlingTypeCd,
				s_dashboard_yn 	: mState.dashboardYn
			},
			{ callback : _searchCallback }
		);
	},
	
	_searchCallback = function(rsJson, rsCd, rsMsg) {
		if(rsJson.rsList.length > 0) {
			mState.listData = rsJson.rsList;
			_outputListData(rsJson.rsList);
		}
		
		// Total,Pgae 수 변경
		mState.total = rsJson.total;
		_searchProcEnd();
	},

	// 데이타 출력
	_outputListData = function(rsList) {
		
		var curPageEventIdx = 1;//var curPageLogIdx = 1;
		var rsRow, cont, fldName, ariaValue, ctxClass, $curTr, $curTd, allFld;

		// Table에 데이타 표시
		for(var rnum in rsList) {
			rsRow = rsList[rnum];
			curPageEventIdx = mState.startIndex + parseInt(rnum) + 1;
			
			// 사용자가 선택한 항목 표시
			$curTr = $("<tr></tr>");
			
			$curTr.append("<td><input type='checkbox' name='chk_idx' data-num='"+rnum+"' data-key='"+ rsRow["event_seq"] +"' value=" + (curPageEventIdx) + " class='form-transform'><span class='form-clone'></span></td>");
			$curTr.append("<td>" + _SL.formatNumber(curPageEventIdx) + "</td> ");
			
			for(var idx in mState.viewFields) {
				fldName = mState.viewFields[idx];
				$curTd = $("<td></td>");

				$curTr
					.append(_outputFieldData($curTd, parseInt(rnum), fldName, rsRow[fldName], true));
			}
			
			$("<td></td>")
				.append("<button type=\"button\" class='tr-toggler btn-toggle'></span>")
				.appendTo($curTr);
			
			$curTr.appendTo(m$.searchEventListTable);

			// 전체 항목 표시
			$curTr = $("<tr style='display:none'></tr>")
					.append("<td></td> ");
			
			$curTr.append("<td></td> ");
			
			$curTd = $("<td class='align-left' colspan=" + mState.viewFields.length + ">");
			$curTd.append(
				$("<div>")
					.addClass("log-lists")
					.addClass("list-inline")
					.append($("<dl>"))
			);
			
			for(fldName in rsRow) {
				if($.inArray(fldName, mState.viewFields) == -1){
					_outputFieldData($("dl", $curTd), parseInt(rnum), fldName, rsRow[fldName], false);
				}
			}

			$curTr
				.append($curTd)
				.append('<td style="vertical-align:top;"><button type="button" class="btn-loglist-toggle icon-list"></button></td>')
				.appendTo($("tbody", m$.searchEventListTable));
		}
		
		rsRow = null, cont = null, fldName = null, ariaValue =null, $curTr = null, $curTd = null, allFld = null;
	},

	_outputFieldData = function(p$Cur, pLogIdx, pFldName, pFldVal, pIsView) {
		var ctxClass = "context-menu-one";
		var cont = pFldVal || "";
		var cont2 = cont;
		var $contContainer;
		var $cont;
		var levelStrArr = ['Low','Middle','High'];
		var levelClsArr = ['label-success','label-attention','label-danger'];
		
		if(pIsView) {
			switch(pFldName){
			case "event_time":
				p$Cur.append(_SL.formatDate(cont, "yyyyMMddHHmmss", "yyyy-MM-dd HH:mm:ss"));
				break;
			case "event_nm":
				var ariaValue = pLogIdx + "," + pFldName;
				
				cont2 = cont;
				cont = $("<button>").addClass("event-nm")
				.text(cont2)
				.attr({
  					"data-aria" : ariaValue	
				})
				.addClass(ctxClass)
				p$Cur.append(cont);
				break;
			case "group_field":
				if(cont== ""){
					cont="전체";
				}
				else{
					var grpFldArr = cont.split(",");
					var grpFldStr = "";
					for(var idx in grpFldArr){
						grpFldStr += gFieldJson[grpFldArr[idx]] +"("+grpFldArr[idx]+"), ";
					}
					grpFldStr = grpFldStr.substring(0, grpFldStr.length-2);
					cont = grpFldStr;
				}
					
				p$Cur.append(cont);
				break;
			case "event_cate_cd":
				p$Cur.append(gComCodes.eventCateCd[cont]);
				break;
			case "event_level":
				p$Cur.append('<span class="'+levelClsArr[cont-1]+'" style="float:left;margin-left:10px;">'+levelStrArr[cont-1]+'</span>');
				break;
			case "handling_type_cd":
				p$Cur.append(cont == ""? "-":gComCodes.eventStatus[cont]);
				break;
			case "cnt":
			case "distinct_cnt":
			case "limit_distinct_count":
			case "limit_count":
				cont = _SL.formatNumber(cont);
				p$Cur.append(cont);
				break;
			default:
				if(cont == "") return p$Cur;
				p$Cur.append(cont);
				break;
			}
		}
		else {
			p$Cur.append(
					$("<dt>").append(
							$("<span>")
								.addClass("field-name").addClass("field-name slui-draggable")
								.data("field_name", pFldName)
								.text(gFieldCaptions[pFldName] || pFldName)
						)
			)
			
			$contContainer = $("<dd>").appendTo(p$Cur);
			$contContainer.text(cont);
		}
		return p$Cur;
	},
	
	// 검색 데이터 처리 후 마무리
	_searchProcEnd = function() {
		// 페이지 계산
		mState.totalPage = Math.floor(mState.total/mState.pageRow);
		if(mState.total % mState.pageRow > 0) mState.totalPage++;
		
		// 데이타 없는 경우 표시
		if(mState.total == 0) {
			_removeDataRows();
			
			$("<tr></tr>")
				.append("<td class='list-empty' colspan='" + (mState.field_idx_at_TH + mState.viewFields.length + 1) + "'>검색 결과가 없습니다.</td> ")
				.appendTo(m$.searchEventListTable);
		}
		
		// Total Rows 표시
		_outputTotal();
		
		// 페이징 표시
		_outputNav();
		
		_bindViewFieldDnd();
	},
	
	_bindFieldCaptionDnd = function() {
		// View Field 추가
		$("th:gt(1)", m$.searchEventListTable	).droppable({
			accept : ".slui-draggable",
			scope : "addField",
			activeClass: "ui-state-hover",
			hoverClass: "ui-state-active",
			drop: function( event, ui ) {
				var newFieldNames,
					idx = $(this).data("field_index");
				
				if(idx === undefined) idx = mState.viewFields.length;
				
				newFieldNames = mState.viewFields.slice(0, idx).concat(ui.helper.data("field_name"), mState.viewFields.slice(idx));
				
				setTimeout(function() {
					changeFieldCaption(newFieldNames);
				}, 0);
			}
		});
		
		// View Field 삭제
		$("th .slui-draggable", m$.searchEventListTable	).draggable({
			opacity: 0.8,
			scope : "removeField",
			//revert: true,
			helper: function() {
				return $("<div>")
							.css({
								"padding" : "3px",
								"border" : "1px solid #67687d",
								"background-color" : "#f5f7f9",
								"z-index" : "1",
								"whte-space":"nowrap"
							})
							.data("field_index", $(this).data("field_index"))
							.append($(this).clone());
			},
			start : function( event, ui ) {
				var idx = parseInt(ui.helper.data("field_index"));
				var $th = m$.searchEventListTable.find("th:eq(" + (mState.field_idx_at_TH + idx) + ")");
				// TODO CSS로 변경
				var $dummy = $("<div style='position:absolute;font-size:64px;width:68px;height:68px;padding-top:4px;border:1px solid #666;text-align:center;'>").addClass("slui-layer-trash icon-trash")

				m$.searchEventListTable.parents('.area-log-body').append($dummy);

				$dummy.position({
					my: "center top",
					of: $th,
					at: "center bottom+1"
				});

				$dummy.droppable({
					accept	: ".slui-draggable",
					scope	: "removeField",
					opacity : 0.9,
					activeClass	: "",
					hoverClass	: "icon-trash-full text-gray",
					drop: function( event, ui ) {
						//console.log("drop(%o, %o)", event, ui.helper.data("field_index"));
						var newFieldNames,
							idx = parseInt(ui.helper.data("field_index"));
						
						newFieldNames = mState.viewFields.slice(0, idx).concat(mState.viewFields.slice(idx+1));
						
						setTimeout(function() {
							changeFieldCaption(newFieldNames);
						}, 0);
					}
				});
			},
			stop : function( event, ui ) {
				$(".slui-layer-trash").remove();
			},
		});
	},
	
	_bindViewFieldDnd = function() {
		// View Field 추가
		$("tbody .slui-draggable", m$.searchEventListTable).draggable({
			scope:"addField",
			opacity: 0.7,
			helper : "clone",
			start: function(event, ui) {
				$(ui.helper).data("field_name", $(this).data("field_name"));
			} 
		});
	},
	
	_outputTotal = function() {
		m$.divTotal.html("Total <strong class='cnt'>" + _SL.formatNumber(mState.total) + "</strong> Rows");
		
	},
	
	_outputNav = function() {
		if(mState.total == 0) {
			m$.divPaging.hide();
		}
		else {
			m$.currPage.val(mState.currPage);
			$("span", m$.divPaging).html(_SL.formatNumber(mState.totalPage));
			
			if(mState.currPage <= 1) $(".btn-prev", m$.divPaging).hide();
			else					$(".btn-prev", m$.divPaging).show();
			
			if(mState.currPage >= mState.totalPage) $(".btn-next .spanTotalPage", m$.divPaging).hide();
			else 								$(".btn-next", m$.divPaging).show();
			
			m$.divPaging.show();
		}
	},
	
	changeFieldCaption = function(newFieldNames, bSkipData) {
		if(JSON.stringify(mState.viewFields) != JSON.stringify(newFieldNames)) {

			m$.searchEventListTable.colResizable({
				disable:true
			});
			
			mState.viewFields = newFieldNames;
			
			mState.sch_rows = mState.rows;	//새로 표시할 Row수는 전체 Row수
			_removeAllRows();
			_dispFieldCaption();
			
			if(!bSkipData) {
				_outputListData(mState.listData);
				_searchProcEnd();
			}
			
			m$.searchEventListTable.colResizable({
				liveDrag:true, 
				minWidth : 30,
				marginLeft : "3px",
				postbackSafe: true,
				isLocalStorage : true
			});
			
			initUserFieldNames();
		}
	},
	
	// 페이지 이동 또는 Rows 수정
	movePage = function(pageNo, pageRow) {
		
		pageNo = typeof pageNo == "string" ? parseInt(pageNo,10) : pageNo;
		pageRow = typeof pageRow == "string" ? parseInt(pageRow,10) : pageRow;
		
		if(pageNo < 1) pageNo = 1;
		
		mState.currPage = pageNo;
		mState.pageRow = pageRow;
		mState.startIndex = (pageNo-1) * pageRow;
		mState.listData = new Array();
		
		_removeDataRows();
		_searchRequest();
	},
	
	goSearchPopup = function(rnum){
		var rowData = mState.listData[rnum];
		var startTime = _SL.formatDate(rowData.sdt, "yyyyMMddHHmmss", "yyyyMMddHHmm");
		var endTime = _SL.formatDate.addMin(_SL.formatDate(rowData.ddt, "yyyyMMddHHmmss", "yyyyMMddHHmm"), 1);
		var eventTime = rowData.event_time;
		
		var strQuery = "sim_event_id:" + rowData.sim_event_id;

		var $frm = $("#goLogForm");
		var $doc;
		
		if($frm.size() == 0) {
			$frm = $("<form id=goLogForm>")
					.attr({
						action : mCfg.URL.logSearch,
						method : "post" 
					});
			
			$frm.append( $("<input>").attr({type : "hidden", name : "network_join_cd"}).val("ANALYZER") );
			$frm.append( $("<input>").attr({type : "hidden", name : "action"}).val("event") );
			$frm.append( $("<input>").attr({type : "hidden", name : "start_time"}) );
			$frm.append( $("<input>").attr({type : "hidden", name : "end_time"}) );
			$frm.append( $("<input>").attr({type : "hidden", name : "filter_type"}).val("2") );
			$frm.append( $("<input>").attr({type : "hidden", name : "expert_keyword"}) );
			$frm.append( $("<input>").attr({type : "hidden", name : "template_id"}).val("popup") );
			$frm.append( $("<input>").attr({type : "hidden", name : "log_view_fields"}) );
			
		}
		
		$("[name=start_time]", $frm).val(startTime);
		$("[name=end_time]", $frm).val(endTime);
		$("[name=expert_keyword]", $frm).val(strQuery);
		
		if(rowData.view_field){
			$("[name=log_view_fields]", $frm).val(rowData.view_field);
		}else{
			$("[name=log_view_fields]", $frm).val("");
		}
		
		var winName = "logSearchWin_" + (new Date()).getTime();
		
		$frm.attr({target : winName}).submit();
		
	},
	
	getListData = function(){
		return mState.listData;
	},
	
	dummy;
	
	return {
		init				: init,
		search				: search,		
		movePage			: movePage,
		changeFieldCaption 	: changeFieldCaption,
		goSearchPopup		: goSearchPopup,
		getListData			: getListData
	};
}();