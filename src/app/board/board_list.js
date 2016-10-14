//# sourceURL=board_list.js
'use strict';

_SL.nmspc("board").list = function() {

	// Config 정의	
	var
	mCfg = {
		
		formId 			: '#searchForm',
		gridId 			: '#gridBoardList',
		urlGetBoardList	: 'board_list.json',
		tableListId 	: '.grid-table-group',
		
		pageRow		: "#pageRow",
		currPage	: "#currPage",
		divPaging	: "#divPaging",
		divTotal	: "#divTotal",
		
		pageRowUnit : [10, 15, 20, 30, 50, 100]
	},
	
	totalPage,

	// JQuery 객체 변수	
	m$ = {
		form 	: $(mCfg.formId),
		grid 	: $(mCfg.gridId),
		sDay 	: $(mCfg.formId + ' [name=startDay]'),
		sHour 	: $(mCfg.formId + ' [name=startHour]'),
		sMin 	: $(mCfg.formId + ' [name=startMin]'),
		eDay 	: $(mCfg.formId + ' [name=endDay]'),
		eHour 	: $(mCfg.formId + ' [name=endHour]'),
		eMin 	: $(mCfg.formId + ' [name=endMin]'),
		tableList 	: $(mCfg.tableListId + ' tbody'),
		
		pageRow		: $(mCfg.pageRow),
		currPage	: $(mCfg.currPage),
		divPaging	: $(mCfg.divPaging),
		divTotal	: $(mCfg.divTotal)
		
	},
	
	mState = {
		// 검색(사용자 선택 변수)
		rows : 0,
		currPage : 1,	
			
	},

	init = function() {
		for(var i in mCfg.pageRowUnit) {
			m$.pageRow.append("<option value='" + mCfg.pageRowUnit[i] + "'>" + mCfg.pageRowUnit[i] + " Per Page</option>");
		}
		m$.pageRow.val("10");
		slui.attach.setTransformSelect(mCfg.formId);

		drawTable();
		bindEvent();
	},
	
	drawTable = function($grid){
		
		var params = $.extend({}, _SL.serializeMap(m$.form));

		$('body').requestData(mCfg.urlGetBoardList, params, {
			callback : function(rsData){
				var $tBody = m$.tableList.empty();

				if(rsData.list.length <= 0 && rsData.importantList.length <= 0){
					var $tr = $('<tr>')
						.append( "<td colspan='4' class='list-empty'>There is no Search Result</td>" )
						.appendTo($tBody);
					return false;
				}

				var index = 0;
				
				$(".sp-total strong").text(""+rsData.totalCount);
				$(".sp-paging span").text(""+rsData.totalPage);
				totalPage = rsData.totalPage;

				if(rsData.importantList != undefined && rsData.importantList.length > 0){
					for(var i in rsData.importantList){
						var $tr = $('<tr>');
						var data = rsData.importantList[i];

						$tr.append( "<td class='align-center'><span class='badge-basic'>공지</span></td>" );

						var sBoardSubjectNm = "<a href='#' class='link-detail' data-godetail='" + "Detail" + "," + data.bbs_seq + "," + data.user_id + "' >"

						if(data.bd_subject != undefined){
							sBoardSubjectNm += data.bd_subject;
						}

						if(data.comm_cnt != undefined && data.comm_cnt !='0'){
							sBoardSubjectNm += "&nbsp;[" + data.comm_cnt + "]";
						}
						sBoardSubjectNm += "</a>"

						if(data.popup_check != undefined && data.popup_check == 'Y'){
							sBoardSubjectNm += "&nbsp;<span class='badge-attention'>Popup!</span>";
						}

						$tr.append( $("<td>" + sBoardSubjectNm + "</td>") );
						$tr.append( $("<td class='align-center'>" + _SL.formatDate(data.reg_dt,"yyyyMMddHHmm","yyyy-MM-dd HH:mm") + "</td>") );
						$tr.append( $("<td class='align-center'>" + data.user_nm + "</td>") );

						$tr.appendTo($tBody);
					}
				}

				if(rsData.list != undefined && rsData.list.length > 0){
					for(var i in rsData.list){
						index += 1;
						var $tr = $('<tr>');
						var data = rsData.list[i];		

						if(data.depth=="0"){
							$tr.append( $("<td class='align-center'>" + ((rsData.totalCount*1) - index - (rsData.recordstartindex*1) + 1)  + "</td>") );
						}else{
							$tr.append( $("<td class='align-center'><span class='badge-basic'>답변</span></td>") );
							
						}
						
						var sBoardSubjectNm = "";

						if( data.depth != undefined && data.depth !='0' ){
							sBoardSubjectNm += "└&nbsp;";
						}

						sBoardSubjectNm += "<a href='#' class='link-detail' data-godetail='" + "Detail" + "," + data.bbs_seq + "," + data.user_id + "' >"
						
						if(data.bd_subject != undefined){
							sBoardSubjectNm += data.bd_subject;
						}

						if(data.comm_cnt != undefined && data.comm_cnt !='0'){
							sBoardSubjectNm += "&nbsp;[" + data.comm_cnt + "]";
						}

						sBoardSubjectNm += "</a>"

						if(data.popup_check != undefined && data.popup_check == 'Y'){
							sBoardSubjectNm += "&nbsp;<span class='badge-attention'>Popup!</span>";
						}

						$tr.append( $("<td >" + sBoardSubjectNm + "</td>") );
						$tr.append( $("<td class='align-center'>" + _SL.formatDate(data.reg_dt,"yyyyMMddHHmm","yyyy-MM-dd HH:mm") + "</td>") );
						$tr.append( $("<td class='align-center'>" + data.user_nm + "</td>") );

						$tr.appendTo($tBody);
					}
				}
			}
		});
	},

	bindEvent = function() {

		m$.currPage.keydown(function(event) {
			if (event.keyCode == 13) {
				if(/[^\d]/.test(m$.currPage.val()) || m$.currPage.val() > mState.totalPage) {
					_alert("Invalid Page Number!");
					return;
				}
				
				setTimeout(function(){
					movePage(m$.currPage.val(), mState.rows);
				}, 1);
			}
		});
		
		$(".btn-next", m$.divPaging).on("click", function(){
			var pNo = mState.currPage + 1;
			if(pNo > totalPage){
				pNo = totalPage;
			}
			$(mCfg.currPage).val( pNo );
			mState.currPage = pNo;
			
			drawTable();
		});
		
		$(".btn-prev", m$.divPaging).on("click", function(){
			var pNo = mState.currPage - 1;
			if(pNo <1){
				pNo = 1;
			}
			$(mCfg.currPage).val( pNo );
			mState.currPage = pNo;

			drawTable();
		});

		$(mCfg.pageRow).change(function() {
			$(mCfg.currPage).val( 1 );
			mState.currPage = 1;
			drawTable();
		});

		$(".grid-table-group").off().on("click",".link-detail",function(){
			var godetailParam = $(this).attr("data-godetail");
			var arrGodetailParam = godetailParam.split(",");
			goDetailAndWrite(arrGodetailParam[0],arrGodetailParam[1],arrGodetailParam[2]);
			
		});
		
		$(".grid-bottom").off().on("click",".link-write",function(){
			goDetailAndWrite("write",'');
		});
		
		$(".btn-search").on("click",function(){
			goSelectSearch();
		});
	},
	
	goSearch = function() {
		$("#search_check").val("Y");
		$("#searchForm")[0].action = "/board/board_view.html";
		$("#searchForm").submit();	
	},
	
	goSelectSearch = function(){
		$("#ChkSelectSearch").val("Y");
		$("#search_check").val("Y");
		$("#searchForm")[0].action = "/board/board_view.html";	
		$("#searchForm").submit();
	},
		
	goDetailAndWrite = function(type, pk, id){
		if(type =="Detail" && pk !=""){
			$("#writeChk").val("N");
			$("#bbs_seq").val(pk);
			$("#user_id").val(id);
			$("#searchForm")[0].action = "/board/goDetailAndWrite.html";
			$("#searchForm").submit();
		} else { 
			$("#StartChk").val("Y");
			$("#writeChk").val("Y");
			$("#searchForm")[0].action = "/board/goDetailAndWrite.html";
			$("#searchForm").submit();
		}
	},
	
	movePage = function(pageNo, rows) {
		pageNo = typeof pageNo == "string" ? parseInt(pageNo,10) : pageNo;
		rows = typeof rows == "string" ? parseInt(rows,10) : rows;

		if(pageNo < 1) pageNo = 1;

		mState.currPage = pageNo;
		mState.rows = rows;

		// 조회할 시간 및 start_index 계산
		var ori_sidx = (pageNo - 1) * mState.rows;
		var bfCnt = 0;
		var curCnt = 0;
		
		for(var i = 0; i < mState.rowsPerTime.length; i++) {
			curCnt += mState.rowsPerTime[i].rows; 
			
			if((ori_sidx+1) <= curCnt) {
				mState.sch_end_time = mState.rowsPerTime[i].sch_end_time;
				mState.sch_start_time = mState.rowsPerTime[i].sch_start_time;
				
				break;
			}
			
			bfCnt += mState.rowsPerTime[i].rows;
		}
		
		mState.sch_start_index = ori_sidx -  bfCnt;
		mState.sch_rows = mState.rows;
		mState.listData = [];
		mState.span_time = 0;
		mState.procIdx++;
		mState.bCancel = false;
		
		_removeDataRows();
		_searchRequest();
	},
	
	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			onClose : function(){
				refresh();
			}
		});
	};

	return {
		init : init,
		movePage : movePage
	};
}();

$(function(){
	slapp.board.list.init();
});