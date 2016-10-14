'use strict';

_SL.nmspc("logsearch").dynPaging = function(){
	var
	// Reference Modules
	refQuery, refDnt, refProgressbar, refDlgViewField, refMainTimelineChart, refStatsDlg,

	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID
		DOM : {
			logTable	: "#logTable",
			pageRow		: "#pageRow",
			currPage	: "#currPage",
			divPaging	: "#divPaging",
			divTotal	: "#divTotal",
			
			classBasic	: "btn-basic",
			classMore	: "btn-more",
			classPcap	: "btn-pcap",
			classFieldName : "field-name",
			classFieldValue : "field-value",
		},
		
		URL : {
			list			: URL_PATH + "log_search_list.json",
			groupStats		: URL_PATH + "group_stats.html",
			timelineStats	: URL_PATH + "time_stats.html",
			fieldView		: URL_PATH + "log_field_view.html",
			decrypt			: URL_PATH + "string_decrypt.json",
			pcapDown		: URL_PATH + "pcap_file_download.do",
			auditLogSave	: URL_PATH + "audit_log_save.do"
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
			eqp_dt		: 130,
			src_ip		: 110,
			dstn_ip		: 110,
			eqp_ip		: 110,
			connect_ip	: 110,
			agent_ip	: 110,
			dstn_port	: 80,
			prtc		: 70
		},
		
		//alignCenterFieldRegExp : /.+_(dt|ip|port)$/,
		alignLeftFieldRegExp : /(original_log|extend_field)/,
		
		flagFields : ['src_country_name','src_country_code','dstn_country_name','dstn_country_code'],
		
		cookies : {
			pageRow : "pageRow"			
		}
	},
	
	m$ = {
		query		: $(mCfg.DOM.query),
		logTable	: $(mCfg.DOM.logTable),
		pageRow		: $(mCfg.DOM.pageRow),
		currPage	: $(mCfg.DOM.currPage),
		divPaging	: $(mCfg.DOM.divPaging),
		divTotal	: $(mCfg.DOM.divTotal)
	},

	mState = {
		// 필드 위치
		field_idx_at_TH : 1,
		viewFields : ["eqp_dt","src_ip","dstn_ip","dstn_port","eqp_ip","attack_nm","src_country_name","prtc"],
		
		// 검색조건(검색 전체)
		start_time : 0,
		end_time : 0,
		query : "",
		mylogs_id : "",
		sort_by : {},
		
		// 검색 결과(검색 전체)
		total : 0,
		bfTotal : -1,	// 이전 검색 Total 건수
		rowsPerTime : [],
		
		// 검색(사용자 선택 변수)
		rows : 0,
		currPage : 1,

		// 검색 처리용 내부 변수
		diff_time : 0,
		sch_start_time : 0,
		sch_end_time : 0,
		sch_time_unit : 10 * mCfg.timeUnit.min,
		sch_rows : 10,
		sch_start_index : 0,
		procIdx		: 0,		// 사용자 요청별 처리번호
		listData	: [],		// 화면에 표시되는 데이타
		bCancel		: false,	// 사용자 중지 여부
		bSearched	: false,	// 사용자 요청별 완료 여부 
		span_time	: 0,
		audit_mode	: "START"
	},
	
	/*** Define Function ***/
	init = function() {
		refQuery		= slapp.logsearch.query;
		refDnt			= slapp.logsearch.dnt;
		refProgressbar	= slapp.logsearch.progressbar;
		refDlgViewField	= slapp.logsearch.dlgViewField;
		refMainTimelineChart = slapp.logsearch.mainTimelineChart;
		refStatsDlg		= slapp.logsearch.statsDlg;
		
		if(gLogSearchParam.log_view_fields != "") 
			mState.viewFields = gLogSearchParam.log_view_fields.split(",");
		
		_dispFieldCaption();
		
		// Page Per Rows
		for(var i in mCfg.pageRowUnit) {
			m$.pageRow.append("<option value='" + mCfg.pageRowUnit[i] + "'>" + mCfg.pageRowUnit[i] + "per Page</option>");
		}
		m$.pageRow.val(gLogSearchParam.pageRows);
		
		refMainTimelineChart.init();
		refStatsDlg.init();
		
		/*** Bind Event ***/ 
		_bindSortBy();
		_bindCrypt();
		
		// 상세 로그 보기
		m$.logTable.on("click", ".tr-toggler", function(event, elem) {
			$(event.target).toggleClass("open").closest("tr").next().toggle();
		});
		
		// 검색조건 추가
		m$.logTable.on("click", "." + mCfg.DOM.classFieldValue, function(event, elem) {
			var reOverLenSuffix = new RegExp(gOverLengthSuffix + "$");

			var idx = parseInt($(this).data("rowIndex"));
			var fldNm = $(this).data("fieldName");
			
			event.preventDefault();
			refQuery.addKeyword(fldNm, (mState.listData[idx][fldNm] || "").replace(reOverLenSuffix, ""));
		});
		// 상세 로그 리스트 스타일 토글
		m$.logTable.on("click", ".btn-loglist-toggle", function(event, elem) {
			if($(this).hasClass('active')){
				$(this).removeClass('active');
				$(this).parents('tr').find('.log-lists').addClass('list-inline');
			}else{
				$(this).addClass('active');
				$(this).parents('tr').find('.log-lists').removeClass('list-inline');
			}
		});
		// pcap download
		m$.logTable.on("click", "." + mCfg.DOM.classPcap, _onClickPcap),
		
		// 필드 내용 상세보기
		m$.logTable.on("click", "." + mCfg.DOM.classMore, _onClickMore),

		/*** Navigation Start ***/
		m$.pageRow.change(function(event){
			var rows = m$.pageRow.val();
			gLogSearchParam.pageRows = rows;
			if(gCookieMode) $.cookie(mCfg.cookies.pageRow, rows, {expires:30});
			
			movePage(1, rows);
		});
		
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

			movePage(pNo, mState.rows);
		});
		
		$(".btn-prev", m$.divPaging).on("click", function(){
			var pNo = mState.currPage - 1;

			movePage(pNo, mState.rows);
		});
		/*** Navigation End ***/
		
		// CheckBox
		m$.logTable.on("change", "#chk_all", function() {
			var bChk = this.checked;
			
			$("[name=chk_idx]").each(function(nIdx) {
				this.checked = bChk;
			});
		});
		
		// Quick Statistics analysis 
		m$.logTable
		.on("mouseenter", "th:gt(1):lt(-1)", function() {
			$(this).append("<span class='icon-file icon-stats' style='top:5px; right:0px; position:absolute; padding:1px;border:1px hidden #ddd;' title='Quick Statistics analysis'>");
		})
		.on("mouseleave", "th:gt(1):lt(-1)", function() {
			$(this).find("span.icon-stats").remove();
		})
		.on("mouseover", "th>span.icon-stats", function() {
			$(this).css("border-style", "outset");
		})
		.on("mouseout", "th>span.icon-stats", function() {
			$(this).css("border-style", "hidden");
		})
		.on("click", "th>span.icon-stats", function() {
			if (!mState.bSearched || mState.bCancel) {
				_alert("검색 완료 후 실행하세요.");
				return;
			}
			if (mState.total > gSearchLimitCount) {
				_alert("전체 건수 : " + _SL.formatNumber(mState.total) + "건\n" + _SL.formatNumber(gSearchLimitCount) + "건 이상은 조회 하실수 없습니다.");
				return;
			}
			
			var fldIdx = $(this).closest("th").data("field_index");
			var grpFld = mState.viewFields[fldIdx];

			var params = {
					start_time	: mState.start_time,
					end_time	: mState.end_time, 
					query		: mState.query,
					group_field : [grpFld],
					group_field_txt : [gFieldCaptions[grpFld]],
					top_cnt		: 20,
					stats_func	: "count",
					func_field	: "",
					funcFieldNm	: ""
				};
				
			if(grpFld == "eqp_dt") {
				var diffTime = mState.diff_time / (1000 * 60 * 60);
				
				if (diffTime >= 30 * 24) {
					params.period_min = 24 * mCfg.schTimeUnit.hour;
				}
				else if (diffTime < 2) {
					params.period_min = 1;
				}
				else if (diffTime < 12) {
					params.period_min = 5;
				}
				else if (diffTime < 24) {
					params.period_min = 10;
				}
				else if (diffTime < 3 * 24) {
					params.period_min = 30;
				}
				// 그외 3일당 1시간씩 검색 기간 증가
				else {
					params.period_min = Math.floor(mState.diff_time / (3 * mCfg.timeUnit.day)) * mCfg.schTimeUnit.hour;
				}
				
				new ModalPopup(mCfg.URL.timelineStats + "?" + $.param(params, true), {width:1000, height:350, draggable:true});
			}
			else 
				new ModalPopup(mCfg.URL.groupStats + "?" + $.param(params, true), {width:800, height:760, setScroll:true});
		});
		
		// 표시필드
		m$.logTable.on("click", ".view-field-setter", function() { refDlgViewField.open(mState.viewFields) });
		
		// Table Column Resizer Init
		setTimeout(function() {
			m$.logTable.colResizable({
				liveDrag : true,
				minWidth : 30,
				marginLeft : "3px",
				postbackSafe: !gIsMyLogsMode,
				//getPostbackKey : FilterManager.getPostbackKey,
				isLocalStorage : true
			});
		}, 300);
		
		var idItv = setInterval(function(){
			if(m$.logTable.find("td").size() > 0) {
				$(window).trigger("resize");
				clearInterval(idItv);
			}
		}, 500);
	},
	
	_clearValue = function() {
		mState.total = 0;
		mState.bfTotal = 0;
		mState.currPage = 1;
		mState.sch_rows = mState.rows;
		mState.sch_start_index = 0;
		mState.bSearched = false;
		mState.bCancel = false;
		mState.rowsPerTime = [];
		mState.listData = [];
		mState.span_time = 0;
		mState.audit_mode = "START";
	},
	
	_onClickMore = function(event, elem) {
		var idx = parseInt($(this).data("rowIndex"));
		var fldNm = $(this).data("fieldName");
		var vLog = mState.listData[idx];
		var nEqpDt = parseInt(vLog["eqp_dt"].substring(0,12));
		var query = "eqp_dt:[" + nEqpDt + "00 TO " + nEqpDt + "59] AND (key:" + vLog["key"] + ")";
		
		event.preventDefault();
		
		if(!fldNm) {
			console.log("Invalid data-value!! >> 필드 내용보기[rowIndex:%o, fieldName:%o]", idx, fldNm);
			return;
		}
		
		var params = { query : query, field_name : fldNm };
		new ModalPopup(mCfg.URL.fieldView, {type:"post", data:params, width:800, height:470, draggable:true});
	},
	
	_onClickPcap = function() {
		var fileName = $(this).data("fileName");
		var filePath = $(this).data("filePath");
		
		if(filePath=="undefined"){
			_alert("파일경로를 찾을 수 없습니다.");
			return;
		}
			
		if(fileName=="undefined") {
			_alert("파일명을 찾을 수 없습니다.");
			return;
		}
		
		$('<form>')
			.attr({
				action : mCfg.URL.pcapDown,
				method : "POST"
			})
			.append($('<input type="hidden" name="filePath">').val(filePath))
			.append($('<input type="hidden" name="fileName">').val(fileName))
			.appendTo("body")
			.submit()
			.remove();
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
			//if(strWidth)	strWidth = " width=" + strWidth;
			//else			strWidth = "";
			
			strCaption = gFieldCaptions[mState.viewFields[idx]];
			
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
					.append(
						_get$SortBy(mState.viewFields[idx])
					)
			);
		}
		$tr.append("<th class='slui-droppable' width='30'><span class='view-field-setter icon-cog-full'></span></th>");
		
		m$.logTable
			.append($("<thead>").append($tr))
			.append($("<tbody>"));
		
		_bindFieldCaptionDnd();
		
		$tr = null;
	},
	
	_removeAllRows = function() {
		var $children = m$.logTable.children().detach();
		
		setTimeout(function(){
			$children.remove();
			$children = null;
		}, 1000);
	},
	
	_removeDataRows = function() {
		var $tbody = $("tbody", m$.logTable).detach();
		m$.logTable.append($("<tbody>"));
		
		setTimeout(function(){
			$tbody.remove();
			$tbody = null;
		}, 1000);
	},
	
	search = function() {
		_search(true);
	},
	
	stopSearch = function() {
		mState.bCancel = true;
		
		_searchProcEnd();
	},
	
	_search = function(bInitSort) {
		//var	self = DynPaging,
		
		// 처리번호 설정
		mState.procIdx++;
		
		// Sort 초기화
		if(bInitSort) _removeSortBy();
		
		var bAsc = mState.sort_by.bAsc;
		//console.log("self.sort_by.order : %o, bAsc : %o", self.sort_by.order, bAsc);
		
		var bAllPeriod = false; // TODO 전체 필요할 경우 구현 $("#timeSet").val() == gAllPeriodOptionValue;
		
		// 검색 조건 설정
		mState.start_time = refDnt.getSelectedTime('from');
		mState.end_time = refDnt.getSelectedTime('to');
		mState.query = refQuery.getQuery();
		mState.rows = parseInt(m$.pageRow.val()) || 20;
		mState.mylogs_id = gLogSearchParam.mylogs_id;
		mState.action = gLogSearchParam.action;
		
		//TODO 삭제 if(gCookieMode) $.cookie('filter_type', FilterManager.getCurFilterType(), {expires:30});
		
		// 검색조회중 중복하여 검색 했을 경우 이전 감사로그 저장
		if(mState.mylogs_id == "" && mState.bCancel == false && mState.bSearched == false && mState.procIdx > 1) {
			mState.audit_mode = "STOP";
			_saveAuditLog();
		}
		
		// 페이징 처리 hide
		m$.divPaging.hide();
		
		// 검색 단위 및 첫 요청 기간 설정
		if(bAllPeriod) {
			mState.start_time = gAllPeriodStartTime;
			mState.end_time = (parseInt(gAllPeriodStartTime) + 1) + "";
		}
		
		mState.sch_time_unit = mState.diff_time = _SL.formatDate.diff(mState.start_time, mState.end_time);
		mState.sch_start_time = mState.start_time;
		mState.sch_end_time = mState.end_time;
		
		if(mState.mylogs_id == "" && !bAllPeriod) {
			var tempFirstTime = bAsc ? _SL.formatDate.addHour(mState.start_time.substring(0,10) + "00") : mState.end_time.substring(0,10) + "00"; 
			
			switch(gSearchTimeType) {
			case "AUTO" :
				// 검색 기간이 30일 이상이면 12시간단위 조회
				if(mState.diff_time >= mCfg.timeUnit.month) {
					mState.sch_time_unit = 12 * mCfg.schTimeUnit.hour;
				}
				// 그외 3일당 1시간씩 검색 기간 증가
				else {
					mState.sch_time_unit = Math.floor(mState.diff_time / (3 * mCfg.timeUnit.day) + 1) * mCfg.schTimeUnit.hour;
				}
				
				break;
					
			case "DAY" :
				tempFirstTime = bAsc ? _SL.formatDate.addDay(mState.start_time.substring(0,8) + "0000") : tempFirstTime.substring(0,8) + "0000";
				mState.sch_time_unit = mCfg.timeUnit.day/mCfg.timeUnit.min; //분단위 변환

				break;

			case "HOUR" :
				mState.sch_time_unit = mCfg.schTimeUnit.hour;
				
				break;
			
			default:
				_alert("잘못된 검색 방법입니다.");
				return;
			}
			
			// 첫 요청 검색 기간 설정
			if(bAsc) {
				if(tempFirstTime == mState.start_time) tempFirstTime = _SL.formatDate.addMin(mState.start_time, mState.sch_time_unit);
				mState.sch_end_time = Math.min(tempFirstTime, mState.end_time) + "";
			}
			else {
				if(tempFirstTime == mState.end_time) tempFirstTime = _SL.formatDate.addMin(mState.end_time, -mState.sch_time_unit);
				mState.sch_start_time = Math.max(tempFirstTime, mState.start_time) + "";
			}
			//console.log("self.sch_start_time : %o, self.sch_end_time : %o", self.sch_start_time, self.sch_end_time);
		}
		
		// 처리상태 창 열기
		refProgressbar.show();
		//dlg_progressbar("open", (self.sch_start_time == self.start_time));
		
		// 조회를 위한 값 초기화
		_clearValue();
		
		_outputTotal();
		_removeDataRows();

		if(mState.mylogs_id == "") {
			mState.audit_mode = "START";
			_saveAuditLog();
			
			refMainTimelineChart.show(false);
		}

		_searchRequest();
	},
	
	_searchRequest = function() {
		//console.log("_search > self.procIdx : " + self.procIdx + ", self.sch_start_time : " + self.sch_start_time + ", self.sch_end_time : " + self.sch_end_time);
		$('body').requestData(
			mCfg.URL.list,
			{
				proc_idx		: mState.procIdx,
				start_time		: mState.sch_start_time,
				end_time		: mState.sch_end_time,
				query			: mState.query,
				pageRow			: mState.sch_rows,
				startIndex		: mState.sch_start_index,
				mylogs_id		: mState.mylogs_id,
				sort_by_field_name : mState.sort_by.field_name,
				sort_by_order	: mState.sort_by.order,
				action			: mState.action
			},
			{ callback : _searchCallback }
		);
	},
	
	_searchCallback = function(rsData, rsCd, rsMsg) {
		var bAsc = mState.sort_by.bAsc;
		
		//console.log("mState.procIdx : " + mState.procIdx + ", rsData.procIdx : " + rsData.proc_idx + ", mState.bCancel : " + mState.bCancel);
		if(mState.procIdx != rsData.proc_idx || mState.bCancel) return;
		
		var baseTime, calcTime, sTime, eTime, sign;
		
		if(bAsc) {
			baseTime	= "sch_start_time";
			calcTime	= "sch_end_time";
			sTime		= "start_time";
			eTime		= "end_time";
			sign 		= 1;
		}
		else {
			baseTime	= "sch_end_time";
			calcTime	= "sch_start_time";
			sTime		= "end_time";
			eTime		= "start_time";
			sign 		= -1;
		}
		
		//console.log("bf mState[baseTime] : %o, mState[calcTime] : %o, mState[sTime] : %o, mState[eTime] : %o", mState[baseTime], mState[calcTime], mState[sTime], mState[eTime]);
		
		refProgressbar.show(_SL.formatDate.diff(mState[sTime], mState[calcTime])*sign*100/mState.diff_time);
		//dlg_progressbar("value", _SL.formatDate.diff(self[sTime], self[calcTime])*sign*100/self.diff_time);
		
		// 결과 Data가 있을 경우 데이타 출력
		if(rsData.rsList != null) {
			mState.listData = mState.listData.concat(rsData.rsList);
			_outputListData(rsData.rsList);
		}
		
		// 소요시간 계산
		if(rsData.span_time) mState.span_time += rsData.span_time;
		
		// 조회 완료전일 경우
		if(!mState.bSearched) {
			// Page Navigation에서 빠른 실행을 위해 시간별 rows 저장
			mState.rowsPerTime.push({sch_start_time : mState.sch_start_time, sch_end_time : mState.sch_end_time, rows : rsData.total});
			
			// Total,Pgae 수 변경
			mState.total += rsData.total;
			
			_outputTotal();
		
			// 마지막 호출인 경우
			if(mState[calcTime] == mState[eTime]) {
				_searchProcEnd();
			}
			// Total을 구하기 위해 호출
			else {
				
				mState[baseTime] = mState[calcTime];
				mState[calcTime] = _SL.formatDate.addMin(mState[calcTime], sign * mState.sch_time_unit);
				
				//console.log("on self[baseTime] : %o, self[calcTime] : %o, self[eTime] : %o", self[baseTime], self[calcTime], self[eTime]);
				
				if((mState[calcTime] - mState[eTime]) * sign >= 0) {
					mState[calcTime] = mState[eTime];
					//console.log("af self[baseTime] : %o, self[calcTime] : %o, self[eTime] : %o", self[baseTime], self[calcTime], self[eTime]);
					
					var tHour = mState[calcTime].substring(10) + "00";
					
					if( mState[calcTime] != tHour && mState[baseTime].substring(10) == "00" &&
							_SL.formatDate.diff(tHour, mState[baseTime]) > mCfg.timeUnit.hour ) {
						
						mState[calcTime] = _SL.formatDate.addMin(mState[calcTime].substring(0,10) + "00", mCfg.schTimeUnit.hour);
					}
				}
				
				//console.log("af self[baseTime] : %o, self[calcTime] : %o, self[eTime] : %o", self[baseTime], self[calcTime], self[eTime]);
				/*
				if(self.sch_start_time <= self.start_time) {
					self.sch_start_time = self.start_time;
					
					if( self.start_time.substring(10) != "00" && self.sch_end_time.substring(10) == "00" &&
						_SL.formatDate.diff(self.start_time.substring(0,10) + "00", self.sch_end_time) > TimeUnit.hour ) {
							
						self.sch_start_time = _SL.formatDate.addMin(self.start_time.substring(0,10) + "00", 60);
					}
				}
				*/
				if(mState.total >= mState.rows) mState.sch_rows = 0;
				else mState.sch_rows = mState.rows - mState.total;
				
				setTimeout(_searchRequest, 10);
			}
		}
		else {
			// 동일 검색시간의 건수가 이전과 다를 경우 건수 갱신 및 Total 갱신
			var i;
			
			for(i = 0; i < mState.rowsPerTime.length; i++) {
				if(mState.rowsPerTime[i].sch_start_time == mState.sch_start_time) {
					if(mState.rowsPerTime[i].rows != rsData.total) {
						mState.total += (rsData.total - mState.rowsPerTime[i].rows);
						mState.rowsPerTime[i].rows = rsData.total;
					}
					
					break;
				}
			}
			
			// Page Rows보다 적게 화면에 표시된 경우
			if(mState.rows > mState.listData.length) {
				// 데이타가 있는 다음 시간 요청
				i++;
				for(; i < mState.rowsPerTime.length; i++) {
					if(mState.rowsPerTime[i].rows > 0) {
						mState.sch_start_time = mState.rowsPerTime[i].sch_start_time;
						mState.sch_end_time = mState.rowsPerTime[i].sch_end_time;
						mState.sch_start_index = 0;
						mState.sch_rows = mState.rows - mState.listData.length;
						
						setTimeout(_searchRequest, 10);
						
						return;
					}
				}
			}
			
			_searchProcEnd();
		}
	},

	// 데이타 출력
	_outputListData = function(rsList) {
		// 기존 Row 삭제
		//if(this.rows == this.sch_rows) $("#logTable tr").has("td").remove();
		var curPageLogIdx = 1;
		var startNo = (mState.currPage - 1) * mState.rows;
		var reOverLenSuffix = new RegExp(gOverLengthSuffix + "$");
		var reLogNewLine = new RegExp(gLogNewLineString, "g");
		var fldNmLen = mState.viewFields.length;
		var rsRow, cont, fldName, ariaValue, ctxClass, $curTr, $curTd, allFld, fldNmLen;
		
		// Table에 데이타 표시
		for(var rnum in rsList) {
			rsRow = rsList[rnum];
			curPageLogIdx = mState.rows - mState.sch_rows + parseInt(rnum);
			
			// 사용자가 선택한 항목 표시
			$curTr = $("<tr>");
			
			$curTr.append("<td><input type='checkbox' name='chk_idx' value=" + (curPageLogIdx) + " class='form-transform' tabindex='-1'><span class='form-clone' tabindex='0'></span></td>");
			$curTr.append("<td>" + _SL.formatNumber(startNo + curPageLogIdx + 1) + "</td> ");
			
			for(var idx in mState.viewFields) {
				fldName = mState.viewFields[idx];
				
				$curTd = $("<td>");

				$curTr
					.append(_outputFieldData($curTd, curPageLogIdx, fldName, rsRow[fldName], true));
			}
			
			$("<td>")
				.append("<button type=\"button\" class='tr-toggler btn-toggle'></span>")
				.appendTo($curTr);
			
			$curTr.appendTo(m$.logTable);

			// 전체 항목 표시
			$curTr = $("<tr style='display:none'></tr>")
					.append("<td>");
			$curTr.append("<td>");
			
			$curTd = $("<td class='align-left' colspan=" + mState.viewFields.length + ">");
			$curTd.append(
				$("<div>")
					.addClass("log-lists")
					.addClass("list-inline")
					.append($("<dl>"))
			);
			
			for(fldName in rsRow) {
				if($.inArray(fldName, mState.viewFields) == -1 && fldName != "original_log")
					_outputFieldData($("dl", $curTd), curPageLogIdx, fldName, rsRow[fldName], false);
			}
			
			fldName = "original_log";
			if($.inArray(fldName, mState.viewFields) == -1 && rsRow[fldName]) 
				_outputFieldData($("dl", $curTd), curPageLogIdx, fldName, rsRow[fldName], false);

			$curTr
				.append($curTd)
				.append('<td style="vertical-align:top;"><button type="button" class="btn-loglist-toggle icon-list"></button></td>')
				.appendTo($("tbody", m$.logTable));
		}

		rsRow = null, cont = null, fldName = null, ariaValue =null, $curTr = null, $curTd = null, allFld = null;
	},

	_outputFieldData = function(p$Cur, pLogIdx, pFldName, pFldVal, pIsView) {
		var ctxClass = "context-menu-one";
		var reOverLenSuffix = new RegExp(gOverLengthSuffix + "$");
		var reLogNewLine = new RegExp(gLogNewLineString, "g");
		var cont = pFldVal || "";
		var cont2 = cont;
		var $contContainer;
		var $cont;
		var contCss = {};
		var overLenCont = "";
		var pcapLogCont = "";
		var ariaValue;
		
		if(pIsView && (pFldName == "eqp_dt"|| pFldName == "recv_time")) {
			p$Cur.append(cont == "" ? "" : _SL.formatDate(cont, "yyyyMMddHHmmss", "yyyy-MM-dd HH:mm:ss"));
		}
		else {
			if(pIsView) {
				if(mCfg.alignLeftFieldRegExp.test(pFldName)) p$Cur.addClass("align-left");
				
				$contContainer = p$Cur;
				$cont = $("<button>").addClass("btn-link");
			}
			else {
				var $dt = $('<dt />')
					.appendTo(p$Cur),
				$span = $('<span >')
					.addClass("field-name slui-draggable")
					.data("field_name", pFldName)
					.text(gFieldCaptions[pFldName] || pFldName)
					.appendTo($dt);

				if(pFldName == "original_log"){
					$dt.addClass('item-long');
				}
				$contContainer = $("<dd>").appendTo(p$Cur);
				$cont = $("<a>");
			}

			if(cont == "") return p$Cur;

			if(pFldName == "original_log"){
				ctxClass = "context-menu-two";
				$contContainer.addClass('item-long');
			}
			
			// visible_length_check_fields 에 등록된 필드는 무조건 more가 보이게 수정
			//if(cont.length > gLogVisibleLength && reOverLenSuffix.test(cont)) {
			if(reOverLenSuffix.test(cont)) {
				overLenCont = 
					$("<button>")
						.text("more")
						.addClass(mCfg.DOM.classBasic)
						.addClass(mCfg.DOM.classMore)
						.data("rowIndex", pLogIdx)
						.data("fieldName", pFldName);
				cont = cont.replace(reOverLenSuffix, "");
			}
			
			if(pFldName == "file_name" && mState.listData[pLogIdx].log_type == gPcapFileCode) {
				 	
				var filePath = mState.listData[pLogIdx].upload_path;
				var fileName = mState.listData[pLogIdx].file_name;
				
				pcapLogCont = 
					$("<button>")
						.addClass(mCfg.DOM.classBasic)
						.addClass(mCfg.DOM.classPcap)
						.data("filePath", filePath)
						.data("fileName", fileName);
			}
			
			// \n 치환된 문자 space로 변경
			cont = cont.replace(reLogNewLine, " ");
			
			cont2 = cont;
			
			// 공통코드 표시
			//console.log(pFldName + "[" + cont + "] : " + gFldToCodes[pFldName]);
			if(gFldToCodes[pFldName] && gFldToCodes[pFldName][cont]) {
				cont2 = "[" + cont + "]" + gFldToCodes[pFldName][cont];
				contCss = {"font-weight":"bold"};
			}

			_appendCrypt($contContainer, pFldName);
			_appendFlag($contContainer, pLogIdx, pFldName);

			$contContainer.append(
				$cont
					.text(cont2)
					.css(contCss)
					.addClass(mCfg.DOM.classFieldValue + " " + ctxClass)
					.data("rowIndex", pLogIdx)
					.data("fieldName", pFldName)
			)
			.append(overLenCont)
			.append(pcapLogCont);
		}
		
		return p$Cur;
	},
	
	_appendFlag = function(p$Cur, pLogIdx, pFldName) {
		var flagCode, prefix;
		
		if($.inArray(pFldName, mCfg.flagFields) != -1) {
			prefix = pFldName.match(/^[^_]+_/);
			flagCode = mState.listData[pLogIdx][prefix + "country_code"];
			
			if(flagCode) {
				if(mState.listData[pLogIdx][prefix + "country_code"] =="PRN") flagCode = "PR-N";
				if(mState.listData[pLogIdx][prefix + "country_name"] =="N/A") flagCode = "N-A";
				
				if(flagCode != "PR-N"){
					p$Cur.append("<img src='/resources/images/flag/"+flagCode+".png' alt='"+flagCode+"' width='16' height='11'>");
				} else {
					p$Cur.append("<i class='icon-lock'></i>");
				}
			}
		}
	},
	
	// TODO
	// 암호화 필드 복호화
	_bindCrypt = function() {
		if(gCryptionInfo.auth) {
			m$.logTable.on("click", ".icon-lock2", function(event) {
				console.log("click lock");
				var $tgt = $(event.target),
					$next = $tgt.next();
				
				// unlock이면 원본 text로 원복 & 이미지 원복
				if($tgt.hasClass("icon-unlock2")) {
					$tgt.toggleClass("icon-unlock2");
					$next.text($next.data("org_text"));
				}
				// lock이면 decrypt 처리
				else {
					$("body").requestData(mCfg.URL.decrypt, { org_text : $next.text() }, {callback : function(rsData, rsCd, rsMsg){
						var errMsg = "복호화 처리에 실패하였습니다. 다시 실행해 주세요.";
						
						switch(rsCd) {
						case "SUC_COM_0000" :
							$tgt.toggleClass("icon-unlock2");
							$next
								.data("org_text", $next.text())
								.text(rsData);
							errMsg = "";
							break;
						case "WRN_LOG_0001" :
							errMsg = "암호화 방식이 다르거나 암호화 되지 않아 복호화 할 수 없습니다.";
							break;
						case "ERR_AUTH_0001" :	// 발생 가능성은 없으나 만약을 위해 추가
							errMsg = "처리할 권한이 없습니다.";
							break;
						}
						
						if(errMsg) _alert(errMsg);
					}});
				}
			});
		}
	},
	
	_appendCrypt = function(p$CurTd, pFldName) {
		if($.inArray(pFldName, gCryptionInfo.fields) != -1) {
			p$CurTd.append(
				$("<button>").addClass("icon-lock2" + (gCryptionInfo.auth ? " cursor_pointer" : ""))
			);
		}
	},
	
	// 검색 데이터 처리 후 마무리
	_searchProcEnd = function() {
		mState.bSearched = true;
		
		// 페이지 계산
		mState.totalPage = Math.floor(mState.total/mState.rows);
		
		if(mState.total % mState.rows > 0) mState.totalPage++;
		
		// 진행상태 창 닫기
		refProgressbar.hide();
		
		// 데이타 없는 경우 표시
		if(mState.total == 0) {
			_removeDataRows();
			
			$("<tr height='25'></tr>")
				.append("<td class='list-empty' colspan='" + (mState.field_idx_at_TH + mState.viewFields.length + 1) + "'>검색 결과가 없습니다.</td> ")
				.appendTo(m$.logTable);
		}
		
		if(mState.total != mState.bfTotal) {
			mState.bfTotal = mState.total;
			
			FusionCharts.ready(function() {refMainTimelineChart.update();});
			//console.log("Timeline Chart update!!!")
		}
		
		// 소요시간 표시
		_outputTotal();
		
		// 페이징 표시
		_outputNav();
		
		if(mState.mylogs_id == "" && mState.audit_mode == "START") {
			mState.audit_mode =  mState.bCancel ? "STOP" : "COMP";
			//console.log("audit_mode : %o", mState.audit_mode);
			_saveAuditLog();
		}
		
		_bindViewFieldDnd();
	},
	
	_bindSortBy = function() {
		m$.logTable.on("click", "th>span.slui-draggable", function(event) {
			var idx = parseInt($(event.target).data("field_index")),
				fldNm = mState.viewFields[idx];
			
			event.stopPropagation();

			//TODO eqp_dt 제약 제거
			if(fldNm != "eqp_dt") return;

			if(fldNm) {
				_toggleSortBy(idx, fldNm);
				_search(false);	// SortBy 유지를 위해 false로 호출
			}
		});
	},
	
	_toggleSortBy = function(pIdx, pFldNm) {
		var order = "";
		var bfFldNm = mState.sort_by.field_name;
		var bfOrder = mState.sort_by.order;
		var bfbAsc = mState.sort_by.bAsc;
		
		_removeSortBy();
		
		if(bfFldNm == pFldNm) {
			if(!bfOrder)		_setOrder("desc");
			else if(!bfbAsc)	_setOrder("asc");
		}
		else {
			_setOrder("desc");
		}
		
		if(mState.sort_by.order) {
			mState.sort_by.field_name = pFldNm;
			_update$SortBy(pFldNm);
		}
	},
	
	_setOrder = function(mode) {
		switch(mode) {
		case "asc" :
			mState.sort_by.order = "asc";
			mState.sort_by.bAsc = true;
			break;
		case "desc" :
			mState.sort_by.order = "desc";
			mState.sort_by.bAsc = false;
			break;
		default :
			mState.sort_by.order = "";
			mState.sort_by.bAsc = false;
		}
	},
	
	_removeSortBy = function() {
		var bfFieldName = mState.sort_by.field_name;
		//console.log("_removeSortBy bfFieldName : " + bfFieldName);
		mState.sort_by.field_name = "";
		
		_setOrder("");
		
		if(bfFieldName) {
			_update$SortBy(bfFieldName);
		}
	},
	
	_update$SortBy = function(pFldNm) {
		
		var idx = $.inArray(pFldNm, mState.viewFields);
		
		if(idx == -1) return;
		
		var $th = $("th:eq(" + (mState.field_idx_at_TH + idx) + ")", m$.logTable);
		
		$(".slui-sort-by", $th).remove();
		$th.append(_get$SortBy(pFldNm));
	},
	
	_get$SortBy = function(pFldNm) {
		//TODO eqp_dt 제약 제거 
		if(pFldNm != "eqp_dt") return "";
		
		var $sortBy = $("<span>").addClass("slui-sort-by");
		
		if(pFldNm == mState.sort_by.field_name && mState.sort_by.order) {
			$sortBy.addClass(mState.sort_by.bAsc ? 'sort-asc' : 'sort-desc');
		}
		else {
			//$sortBy.addClass("fa fa-sort");
			$sortBy.removeClass('sort-desc').removeClass('sort-asc');
		}
		
		return $sortBy;
	},
	
	_bindFieldCaptionDnd = function() {
		// View Field 추가
		$("th:gt(1)", m$.logTable).droppable({
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
		$("th .slui-draggable", m$.logTable).draggable({
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
				var $th = m$.logTable.find("th:eq(" + (mState.field_idx_at_TH + idx) + ")");
				// TODO CSS로 변경
				var $dummy = $("<div style='position:absolute;font-size:64px;width:68px;height:68px;padding-top:4px;border:1px solid #666;text-align:center;'>").addClass("slui-layer-trash icon-trash")

				m$.logTable.parents('.area-log-body').append($dummy);

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
		$("tbody .slui-draggable", m$.logTable).draggable({
			scope:"addField",
			opacity: 0.7,
			helper : "clone",
			start: function(event, ui) {
				$(ui.helper).data("field_name", $(this).data("field_name"));
			} 
		});
	},
	
	_saveAuditLog = function() {
		$('body').requestData(
				mCfg.URL.auditLogSave,
				{
					proc_idx	: mState.procIdx,
					start_time	: mState.start_time,
					end_time	: mState.end_time,
					query		: mState.query,
					total		: mState.total,
					span_time	: mState.span_time,
					audit_mode	: mState.audit_mode
				}
		);
	},
	
	_outputTotal = function() {
		m$.divTotal.html(
				"Total <strong class=\"cnt\">" + _SL.formatNumber(mState.total) 
				+ "</strong> Rows [Elapsed Time <strong class=\"sec\">" 
				+ _SL.formatTime(mState.span_time/1000, "</strong> Sec,</strong> Min,</strong> Hour")
				+ "]"
		);
		//$("#divTotal").html("Total <span>" + _SL.formatNumber(this.total) + "</span> Rows [Elapsed Time <span style='color:#1454A4'>" + _SL.formatTime(this.span_time/1000, "<span style='font-weight:normal;color:#666'> Sec</span>,<span style='font-weight:normal;color:#666'> Min</span> ,<span style='font-weight:normal;color:#666'> Hour</span>") + "</span>]");
	},
	
	_outputNav = function() {
		//console.log("_outputNav this.total : " + this.total);
		if(mState.total == 0) {
			m$.divPaging.hide();
		}
		else {
			m$.currPage.val(mState.currPage);
			$("span", m$.divPaging).html(_SL.formatNumber(mState.totalPage));
			
			if(mState.currPage <= 1) $(".btn-prev", m$.divPaging).prop('disabled',true);
			else					$(".btn-prev", m$.divPaging).prop('disabled',false);
			
			if(mState.currPage >= mState.totalPage) $(".btn-next", m$.divPaging).prop('disabled',true);
			else 								$(".btn-next", m$.divPaging).prop('disabled',false);
			
			m$.divPaging.show();
		}
	},
	
	changeFieldCaption = function(newFieldNames, bSkipData) {
		//console.log("changeFieldCaption mState.viewFields : " + JSON.stringify(mState.viewFields));
		if(JSON.stringify(mState.viewFields) != JSON.stringify(newFieldNames)) {
			//console.log("changeFieldCaption newFieldNames : " + JSON.stringify(newFieldNames));

			m$.logTable.colResizable({
				disable:true
			});
			
			mState.viewFields = newFieldNames;
			
			mState.sch_rows = mState.rows;	//새로 표시할 Row수는 전체 Row수
			_removeAllRows();
			_dispFieldCaption();
			if(bSkipData) {
				// Table 크기 유지와 표시 속도를 위해 빈 객체 설정
				for(var i = 0; i < mState.listData.length; i++) {
					mState.listData[i] = {};
				}
			}
			_outputListData(mState.listData);
			_searchProcEnd();
			
			m$.logTable.colResizable({
				liveDrag:true, 
				minWidth : 30,
				marginLeft : "3px",
				postbackSafe: true,
				//getPostbackKey : FilterManager.getPostbackKey,
				isLocalStorage : true
			});
			
			//$.cookie('log_view_fields', newFieldNames.join(","), {expires:30});
			//m$.logViewFields.val(JSON.stringify(mState.viewFields));
		}
	},
	
	// 페이지 이동 또는 Rows 수정
	movePage = function(pageNo, rows) {
		refProgressbar.show();
		
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
		mState.listData = new Array();
		mState.span_time = 0;
		mState.procIdx++;
		mState.bCancel = false;
		
		_removeDataRows();
		_searchRequest();
	},
	
	_openViewField = function() {
		_alert("Open View Field Dialog");
	},
	
	dummy;
	
	return {
		init			: init,
		search			: search,
		stopSearch		: stopSearch,
		movePage		: movePage,
		changeFieldCaption : changeFieldCaption,

		getStartTime	: 	function() {
			return mState.start_time;
		},
		getEndTime	: 	function() {
			return mState.end_time;
		},
		getLog		: 	function(rnum) {
			return mState.listData[rnum];
		},
		getMylogsId : function() {
			return mState.mylogs_id;
		},
		getFieldValue	: 	function(rnum, fldNm) {
			var rowData = mState.listData[rnum];
			
			return rowData ? rowData[fldNm] || "" : "";
		},
		getQuery		: function() {
			return mState.query;
		},
		getRowsPerTime	: function() {
			return mState.rowsPerTime;
		},
		getTotal	: function() {
			return mState.total;
		},
		getViewFields	: function() {
			return mState.viewFields;
		},
		isSearched	: function() {
			return mState.bSearched;
		},
		isCancel	: function() {
			return mState.bCancel;
		},
		isAsc		: function() {
			return mState.sort_by.bAsc;
		}
	};
	
}();