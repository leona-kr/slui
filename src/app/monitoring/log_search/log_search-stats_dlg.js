'use strict';

_SL.nmspc("logsearch").statsDlg = function(){
	var
	// Reference Modules
	refDynPaging,

	URL_PATH = gCONTEXT_PATH + "monitoring/",
	
	mCfg = {
		// DOM ID/NAME
		DOM : {
			dlg					: "#statsDlg",
			statsType			: "[name=stats_type]",
			
			topCnt				: "[name=top_cnt]",
			groupField			: "[name=group_field]",
			statsFunc			: "[name=stats_func]",
			funcField			: "[name=func_field]",
			
			periodMin			: "[name=period_min]",
			timelineStatsFunc	: "[name=timeline_stats_func]",
			timelineFuncField	: "[name=timeline_func_field]",
			timelineSeriesField	: "[name=timeline_series_field]",
			timelineSeriesFldset: "#timeline_series_fldset",
			timelineTInpVal		: "[name=timeline_t_inp_val]",
			timelineSeriesVals	: "[name=timeline_series_vals]",
			timelineSeriesValEtc: "[name=timeline_series_val_etc]",
			
			btnStats			: "btn-stats",
			
			btnSearch			: "btn-search",
			btnCancel			: "btn-cancel",
			btnPlus				: "btn-plus",
			btnMinus			: "btn-minus"
		},
		
		URL : {
			groupStats		: URL_PATH + "group_stats.html",
			timelineStats	: URL_PATH + "time_stats.html"
		}
	},
	
	m$ = {
		dlg					: $(mCfg.DOM.dlg),
		statsType			: $(mCfg.DOM.statsType),
		
		topCnt				: $(mCfg.DOM.topCnt),
		groupField			: $(mCfg.DOM.groupField),
		statsFunc			: $(mCfg.DOM.statsFunc),
		funcField			: $(mCfg.DOM.funcField),
		
		periodMin			: $(mCfg.DOM.periodMin),
		timelineStatsFunc	: $(mCfg.DOM.timelineStatsFunc),
		timelineFuncField	: $(mCfg.DOM.timelineFuncField),
		timelineSeriesField	: $(mCfg.DOM.timelineSeriesField),
		timelineSeriesFldset: $(mCfg.DOM.timelineSeriesFldset),
		timelineTInpVal		: $(mCfg.DOM.timelineTInpVal),
		timelineSeriesVals	: $(mCfg.DOM.timelineSeriesVals),
		timelineSeriesValEtc: $(mCfg.DOM.timelineSeriesValEtc)
	},

	mState = {
	},
	
	/*** Define Function ***/
	init = function() {
		refDynPaging	= slapp.logsearch.dynPaging;
		
		//설정 창 만들기
		m$.dlg.jqxWindow({
			width: 480, height:100, autoOpen: false,
			resizable: false, isModal: true, modalOpacity: 0.5,
			cancelButton : m$.dlg.find('.' + mCfg.DOM.btnCancel)
		}).on('open',function(){
			slui.attach.setTransformSelect(mCfg.DOM.dlg);
		});
		
		m$.groupField.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_multiple :"[선택하세요]"
		});
		m$.groupField.next().find(".chosen-results").css("max-height","100px");

		m$.funcField.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_single :"[선택하세요]"
		});
		m$.funcField.next().find(".chosen-results").css("max-height","100px");
		
		m$.timelineFuncField.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_single :"[선택하세요]"
		});
		m$.timelineFuncField.next().find(".chosen-results").css("max-height","100px");
		
		m$.timelineSeriesField.chosen({
			search_contains : true,
			width:"100%",
			placeholder_text_single :"[미지정]"
		});
		m$.timelineSeriesField.next().find(".chosen-results").css("max-height","100px");
		
		// Bind Event
		$("." + mCfg.DOM.btnStats).on("click", open);
		
		m$.statsType.on("click", function() {
			$(".stats_fieldset").hide();
			$("#" + $(this).val() + "_fieldset").show();
			slui.attach.setTransformSelect(mCfg.DOM.dlg);
		});
		m$.statsFunc.change(onChangeStatsFunc);
		m$.timelineStatsFunc.change(onChangeStatsFunc);
		m$.timelineSeriesField.change(onChangeStatsFunc);
		
		m$.dlg.find("." + mCfg.DOM.btnPlus).click(onClickSeriesValAdd);
		m$.dlg.find("." + mCfg.DOM.btnMinus).click(onClickSeriesValDel);
	},
	
	open = function() {
		var idx, viewFields, fldNm, fldTitle;
		
		if (!refDynPaging.isSearched()  || refDynPaging.isCancel()) {
			_alert("검색 완료 후 실행하세요.");
			return;
		}
		if (refDynPaging.getTotal() > gSearchLimitCount) {
			_alert("전체 건수 : " + _SL.formatNumber(refDynPaging.getTotal()) + "건\n" + _SL.formatNumber(gSearchLimitCount) + "건 이상은 조회 하실수 없습니다.");
			return;
		}
		
		/** 그룹 분석 **/
		// TOP 갯수
		m$.topCnt.val(10);
		
		// 그룹 필드
		m$.groupField.empty();
		viewFields = refDynPaging.getViewFields();
		for(idx = 0; idx < viewFields.length; idx++) {
			fldNm = viewFields[idx];
			
			if(gFieldCaptions[fldNm] == null) fldTitle = fldNm + " [" + fldNm + "]";
			else fldTitle = gFieldCaptions[fldNm] + " [" + fldNm + "]"; 	
			
			$("<option/>").attr({
				'value' : fldNm,
				'title' : fldTitle
			})
			.text(fldTitle)
			.appendTo(m$.groupField);
		}
		m$.groupField.trigger('chosen:updated');
		
		// 통계
		m$.funcField.empty();
		for(idx = 0; idx < viewFields.length; idx++) {
			fldNm = viewFields[idx];

			if(gFieldCaptions[fldNm] == null) fldTitle = fldNm + " [" + fldNm + "]";
			else fldTitle = gFieldCaptions[fldNm] + " [" + fldNm + "]";
			
			$("<option/>").attr({
				'value' : fldNm,
				'title' : fldTitle
			})
			.text(fldTitle)
			.appendTo(m$.funcField);
		}
		
		m$.funcField.val("");
		m$.funcField.trigger('chosen:updated');
		m$.statsFunc.val("count");
		onChangeStatsFunc();
		
		/** Timeline 분석 **/
		// 그룹 시간
		var sTime = refDynPaging.getStartTime();
		var eTime = refDynPaging.getEndTime();
		
		var diffTime = _SL.formatDate.diff(sTime, eTime) / (1000 * 60 * 60);
		
		var timeArray = [1, 10];
		if (diffTime > 30 * 24) {
			timeArray = [60 * 24];
		} else if (diffTime > 7 * 24) { 
			timeArray = [60 * 1, 60 * 24];
		} else if (diffTime > 3 * 24) {
			timeArray = [60 * 1, 60 * 24];
		} else if (diffTime > 12) {
			timeArray = [10, 60];
		} 
		
		m$.periodMin.empty();
		for (var idx in timeArray) {
			var text = (timeArray[idx] >= 60) ? (timeArray[idx]/60) + "시간" : timeArray[idx] + "분";
			$("<option/>")
				.attr({value : timeArray[idx], title : timeArray[idx]})
				.text(text)
				.appendTo(m$.periodMin);	
		}
		
		// 통계
		m$.timelineFuncField.empty();
		
		// 범례 필드
		m$.timelineSeriesField.empty();
		m$.timelineSeriesField.append($("<option/>").attr({'value' : ''}).text("[미지정]"));
		
		for(var idx = 0; idx < viewFields.length; idx++) {
			fldNm = viewFields[idx];
			fldTitle = gFieldCaptions[fldNm] + " [" + fldNm + "]";
			
			$("<option/>")
				.attr({value : fldNm, title : fldTitle})
				.text(fldTitle)
				.appendTo(m$.timelineFuncField)
				.clone()
				.appendTo(m$.timelineSeriesField);
		}
		
		m$.timelineFuncField.val("");
		m$.timelineFuncField.trigger('chosen:updated');
		
		m$.timelineSeriesVals.empty();
		m$.timelineSeriesField.val("");
		m$.timelineSeriesField.trigger('chosen:updated');

		m$.timelineStatsFunc.val("count");
		onChangeStatsFunc();
		
		m$.statsType.eq(0).trigger("click");
		
		m$.timelineSeriesValEtc.filter("[value=N]").prop("checked", true);
		
		m$.dlg.on("click", "." + mCfg.DOM.btnSearch, onClickBtnSearch);
		
		m$.dlg.jqxWindow("open");
		m$.dlg.find(".jqx-window-content").css({height:"initial", overflow:"visible"});
	},
	
	onClickBtnSearch = function () {
		if (m$.statsType.filter(":checked").val() == "group") {
			var grpFlds = m$.groupField.getSelectionOrder();
			
			if (m$.statsFunc.val() != "count" && m$.funcField.val() == null) {
				_alert("분석할 통계필드를 선택하세요.");
				return;
			}
						
			var grpFldsParam = $.map(grpFlds, function(obj) {
				return obj;
			});
			
			var grpFldsTxtParam = $.map(grpFlds, function(obj) {
				if(gFieldCaptions[obj] == null) return obj;
				else return gFieldCaptions[obj];
			});
			
			var params = {
				start_time	: refDynPaging.getStartTime(),
				end_time	: refDynPaging.getEndTime(), 
				query		: refDynPaging.getQuery(),
				group_field : grpFldsParam, //[$("#group_field :selected").val()],
				group_field_txt : grpFldsTxtParam, //gFieldCaptions[$("#group_field :selected").val()],
				top_cnt		: m$.topCnt.val(),
				stats_func	: m$.statsFunc.val(),
				func_field	: m$.funcField.val(),
				funcFieldNm	: gFieldCaptions[m$.funcField.val()] || m$.funcField.val()
			};
			
			new ModalPopup(mCfg.URL.groupStats + "?" + $.param(params, true), {width:800, height:760, setScroll:true});
			
		} else {
			
			if (m$.timelineStatsFunc.val() != "count" && m$.timelineFuncField.val() == null) {
				_alert("분석할 통계필드를 선택하세요.");
				return;
			}
			
			var seriesVals = [];
			if(m$.timelineSeriesField.val() != ""){
				m$.timelineSeriesVals.find("option").attr("selected", true);
				seriesVals = m$.timelineSeriesVals.val();
				if(!seriesVals){
					_alert("범례 항목을 입력하세요");
					return;
				}
			}
			 
			var params = {
				start_time	: refDynPaging.getStartTime(),
				end_time	: refDynPaging.getEndTime(), 
				query		: refDynPaging.getQuery(),
				period_min	: m$.periodMin.val(),
				stats_func	: m$.timelineStatsFunc.val(),
				func_field	: m$.timelineFuncField.val(),
				func_field_nm : gFieldCaptions[m$.timelineFuncField.val()] || m$.timelineFuncField.val(),
				series_field: m$.timelineSeriesField.val(),
				series_vals	: seriesVals,
				series_val_etc: m$.timelineSeriesValEtc.filter(":checked").val()
			};
			
			//console.log("params : %o", params);
			new ModalPopup(mCfg.URL.timelineStats + "?" + $.param(params, true), {width:1000, height:350, draggable:true});
		}
	
	},
	
	onChangeStatsFunc = function(){
		var fn = function($fld1, cmp, $fld2) {
			$fld2[$fld1.val() == cmp ? "hide" : "show"]();
		}

		fn(m$.statsFunc, "count", m$.funcField.next());
		fn(m$.timelineStatsFunc, "count", m$.timelineFuncField.next());
		fn(m$.timelineSeriesField, "", m$.timelineSeriesFldset);
	},
	
	onClickSeriesValAdd = function(){
		var tVal = m$.timelineTInpVal.val();
		var $sValOpt = m$.timelineSeriesVals.find("option");
		
		if(tVal == "") {
			_alert("범례 항목에 추가할 값을 입력하세요.");
			return;
		}
		else {
			for(var i = 0; i < $sValOpt.length; i++) {
				if($sValOpt.eq(i).val() == tVal) {
					_alert("중복된 값이 존재합니다.");
					return;
				}
			}
		}
		
		m$.timelineSeriesVals.append($("<option>").val(tVal).text(tVal));
		m$.timelineTInpVal.val("").focus();
	},
	
	onClickSeriesValDel = function(){
		m$.timelineSeriesVals.find(":selected").remove();
	},
	
	DUMMY = "";
	
	return {
		init : init
	};
}();
