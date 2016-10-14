'use strict';


_SL.nmspc("bigStats").view = function() {

	var
	big_code = 0,
	stats_nm = "",
	ComponentList = [],
	ComponentContextData = {},
	mCfg = {
		urlView 	: gCONTEXT_PATH + 'analysis/big_stats_view.html',
		urlList		: gCONTEXT_PATH + 'analysis/big_stats_list.html',
		urlLogSearch: gCONTEXT_PATH + 'monitoring/log_search.html',
		
		containerId	: '#searchBigStatsView',
		formId 		: '#searchBigStatsViewForm',
		
		dummy:0	
	},
	
	m$ = {
		container : $(mCfg.containerId),
		form : $(mCfg.formId),
		grid : $(mCfg.gridId),
		bigCode: $(mCfg.formId + ' [name=big_code]'),
		statsNm: $(mCfg.formId + ' [name=stats_nm]'),
		dummy:0	
	},
	
	init = function() {
		big_code = m$.bigCode.val();
		stats_nm = m$.statsNm.val();
		
		// 대시보드 로드
		load();
		
		// 이벤트 Binding
		bindEvent();
	},

	load = function() {
		var self = this;
		var cid, itemSeq;
		
		// Pannel 내부 Component별 객체 생성
		
		$(".component_container").each(function(idx) {
			cid = $(this).attr("id");
			itemSeq = cid.split("_")[1];
			
			// 컴포넌트 객체 생성
			ComponentList[cid] = new BigStatsComponent();
			
			ComponentList[cid].init(gItemsInfo[itemSeq], $(this));
			
		});
		
		//dnd start
		//item
		
		$(".component_pannel", m$.container).sortable({
			opacity : 0.5,
			handle : ".component_handler",
			start : function(){
				$('.page-config-area').hide();
			},
			update : function(event, ui) {
				save();
			}
		});
		
		$(".dnd_field_pannel>ul", m$.container).sortable({
			opacity : 0.5,
			items : "li:not(.ui-state-disabled)",
			connectWith:".dnd_field_pannel>ul"
		});
		
		$(".dnd_field_pannel>ul>li", m$.container).disableSelection();
		
		//dnd end
		
		if(gItemsInfo["1"].config.config_param == "{}") saveConfigAll();
	},
	
	bindEvent = function(){
		var autoCloseConfig = function(event){
			var $target = $(event.target);
			if(!$target.parents().hasClass('page-config-area')
				&& !$target.parents().hasClass('ui-datepicker')
				&& !$target.parents().hasClass('modal-alert') ){
				$(".page-config-area").fadeOut(200,function(){
					$(document).off('mousedown',autoCloseConfig);
				});
			}
		}

		//Go list
		m$.container.find('.btn-list').on('click', function(){
			m$.form.attr({action:mCfg.urlList}).submit();
		});
		
		//Download report
		m$.container.find('.btn-report').on('click', function(){
			var $frm = $("#reportForm");
			var format = $(this).data('format');
			
			if($frm.size() == 0) {
				$frm = $("<form id=reportForm>")
						.attr({
							action : gCONTEXT_PATH + "analysis/big_report.do",
							method : "post" 
						});

				$frm.append( $("<input>").attr({type : "hidden", name : "format"}).val(format) );
				$frm.append( $("<input>").attr({type : "hidden", name : "big_code"}).val(big_code) );
				$frm.append( $("<input>").attr({type : "hidden", name : "stats_nm"}).val(stats_nm) );
			}
			
			$frm.submit(); 	
		});
		
		//검색어 링크
		m$.container.find('.btn-link').on('click', function(){
			var 
				dataSet = gDatasetList[$(this).data("idx")],
				netJoinCd = dataSet.client_group_cd,
				startTime = dataSet.sch_start_time,
				endTime = dataSet.sch_end_time,
				schQuery = dataSet.sch_query;
			
			if(dataSet.set_type != 'S') return;
			
			var $frm = $("#goLogForm");
			var $doc;
			
			if($frm.size() == 0) {
				$frm = $("<form id=goLogForm>")
						.attr({
							action : mCfg.urlLogSearch,
							method : "post" 
						});
				
				$frm.append( $("<input>").attr({type : "hidden", name : "network_join_cd"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "start_time"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "end_time"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "filter_type"}).val("2") );
				$frm.append( $("<input>").attr({type : "hidden", name : "expert_keyword"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "template_id"}).val("popup") );
			}
			if(netJoinCd) {
				//$("[name=network_join_cd]", $frm).val(netJoinCd);
			}
			$("[name=start_time]", $frm).val(startTime);
			$("[name=end_time]", $frm).val(endTime);
			$("[name=expert_keyword]", $frm).val(schQuery);
			
			var winName = "logSearchWin_" + (new Date()).getTime();
			
			$frm.attr({target : winName}).submit();			
		});
			
		m$.container.on("click", ".component_handler .btn-download", function() {
			var $container = $( this ).closest(".component_container");
			var cntnId = $container.attr("id");
			
			exportBisStatsRs(ComponentList[cntnId]);
		});
				
		m$.container.on("click", ".component_handler .btn-setting", function() {
			var $container = $( this ).closest(".component_container");
			var $config = $container.find(".page-config-area");
			var cntnId = $container.attr("id");
			
			var $p = $(this).parents('.board-head'),
			_w = $p.offset().left + $p.outerWidth() - $config.width(),
			_h = $p.position().top + $p.height();

			$config.css({
				'left': _w+'px',
				'top': _h+'px'
			}).fadeIn(200,function(){
				slui.attach.init('#'+cntnId);
				$(document).on('mousedown',autoCloseConfig);
			});
			
			if(!!ComponentList[cntnId].showConfig)
				ComponentList[cntnId].showConfig();
			else
				showConfig(ComponentList[cntnId]);
		});
		
		m$.container.on("click", ".area-bottom", function(e) {
			e.preventDefault();
			
			var $target = $(e.target);
			var $frm = $target.closest(".page-config-area").find("form");
			var cid = $( this ).closest(".component_container").attr("id");
			
			if($target.hasClass("btn-config-ok")) {
				
				if(!!ComponentList[cid].validateConfig) {
					if(!ComponentList[cid].validateConfig()) return;
				}
				else if(!_SL.validate($frm)) return;
				
				if(!!ComponentList[cid].beforeSaveConfig)
					ComponentList[cid].beforeSaveConfig();
				else
					beforeSaveConfig(ComponentList[cid]);
				
				saveConfig(cid);
				
				$( this ).closest(".page-config-area").fadeOut(200,function(){
					$(document).off('mousedown',autoCloseConfig);
				});
				$( this ).closest(".component_contents").find(".ui-widget-overlay,.dummy-size-control").remove();
				
				if(!!ComponentList[cid].afterSaveConfig)
					ComponentList[cid].afterSaveConfig();
				else 
					afterSaveConfig(ComponentList[cid]);
			}
			else if($target.hasClass("btn-config-cancel")) {
				$( this ).closest(".page-config-area").fadeOut(200,function(){
					$(document).off('mousedown',autoCloseConfig);
				});
				
				if(!!ComponentList[cid].cancelConfig)
					ComponentList[cid].cancelConfig();
				else
					cancelConfig(ComponentList[cid]);
			}

			$target = $frm = null;
		});
	},
	
	save = function() {
		var listCid, param = [];
		
		listCid = $(".component_pannel").sortable("toArray");
		
		for(var i = 0; i < listCid.length; i++) {
			param.push({
				big_code : big_code,
				item_seq : listCid[i].split("_")[1],
				view_seq : i + 1
			});
		}
		
		// 아이템 목록 저장
		$('body').requestData(gCONTEXT_PATH + "analysis/big_stats_view_seq_save.json", {list:param}, {callback : function(){console.log("view_seq updated..")}});		
		
	},
	
	showConfig = function(oCntn) {
		var $form = $("#cid_" + oCntn.item_seq + " .page-config-area form");
		var $fld;
		
		if(oCntn.config_param) {
			for(var param in oCntn.config_param) {
				//console.log("config_param : " + param);
				if(oCntn.config_param[param]) {
					$fld = $form.find("[name=" + param + "]");
					
					if($fld.length > 0) {
						if($fld[0].tagName == "INPUT" && ($fld[0].type == "radio" || $fld[0].type == "checkbox"))
							$fld.filter("[value=" + oCntn.config_param[param] + "]").prop("checked",true);
						else
							$fld.val(oCntn.config_param[param]);
					}
				}
			}
		}
		
		$form = $fld = null;
		
		if(oCntn.isOpenConfig) oCntn.isOpenConfig = true;
	},
	
	beforeSaveConfig = function(oCntn) {
		var list = $("#cid_" + oCntn.item_seq + " .config-select-area form").serializeArray();
		
		oCntn.config_param = {};
		
		for(var i = 0; i < list.length; i++) {
			oCntn.config_param[list[i].name] = list[i].value;
		}
	},
	
	saveConfigAll = function(cid) {
		for(var cid in ComponentList) {
			saveConfig(cid);
		}
	},
	
	saveConfig = function(cid) {
		var self = this;
		var cntnIds, seqNo, param = [];
		
		var param = {
				big_code : ComponentList[cid].big_code,
				item_seq : ComponentList[cid].item_seq,
				config_param : ComponentList[cid].config_param ? JSON.stringify(ComponentList[cid].config_param) : "{}"
			}
		
		// 대시보드의 컴포넌트 설정 정보 저장
		$('body').requestData(gCONTEXT_PATH + "analysis/big_stats_item_config_save.json", param, {callback : function(){
			//console.log("config_saved..");
		}});
	},
	
	afterSaveConfig = function(oCntn) {
		if(oCntn.isOpenConfig) oCntn.isOpenConfig = false; 
		oCntn.refresh();
	},
	
	cancelConfig = function(oCntn) {
		if(oCntn.isOpenConfig) oCntn.isOpenConfig = false;
	},
	
	_goLogSearch = function(itemSeq, dataSeq, fldSeq) {
		ComponentList["cid_" + itemSeq]._goLogSearch(dataSeq, fldSeq);
	},
	
	exportBisStatsRs = function(oCntn) {
		_confirm("다운로드 하시겠습니까?",{
			onAgree : function(){
				var $frm = $("#downloadForm");
				
				if($frm.length == 0) {
					$frm = $("<form>").attr({
						id : "downloadForm",
						action : "big_stats_export.do",
						method : "post"
					});
					
					$frm.append('<input type="hidden" name="big_code">');
					$frm.append('<input type="hidden" name="item_seq">');
					
					$("body").append($frm);
				}
				
				$("[name=big_code]", $frm).val(oCntn.big_code);
				$("[name=item_seq]", $frm).val(oCntn.item_seq);
				
				$frm.submit();
			}
		});		
		
	},
	
	lastentry = null;	
	
	
	function BigStatsComponent() {
		this.RChart_Check_Interval = 2000;
	}

	BigStatsComponent.options = {
		wsize : 1,
		order_by : "DESC",
		chart_height:250,
		list_height:125,
		series_rows : 10,
		rows : 10
	};
	
	BigStatsComponent.prototype = {
		init : function(itemInfo, $elm) {
			this.big_code = itemInfo.item.big_code;
			this.item_seq = itemInfo.item.item_seq;
			this.view_type = itemInfo.item.view_type;
			this.fieldList = itemInfo.field;
			
			this.$element = $elm;
			
			this.bMultiGroup = this.fieldList.length > 2;
			
			if(!itemInfo.config) itemInfo.config = {};
			this.config_param = $.extend({}, BigStatsComponent.options, {view_type:this.view_type}, JSON.parse(itemInfo.config.config_param || "{}"));
			
			this._initConfig();
			
			this._time_id = -1;	// RChart Timeout ID
			
			this.load();
		},
		
		_initConfig : function() {
			var fldList = this.fieldList;
			var fldLen = fldList.length;
			var cfgParam = this.config_param;
			
			// Timeline이고 검색 Dataset일 경우 검색조건 설정
			var prefix = ["start", "end"];
			
			if(this.view_type == "T") {
				if(!cfgParam.sub_view_type) cfgParam.sub_view_type = "L";
				
				if(gDatasetList[fldList[0].set_seq - 1].set_type == "S") {
					for(var i = 0; i < prefix.length; i++) {
						if(!cfgParam[prefix[i] + "_time"]) {
							cfgParam[prefix[i] + "_time"] = gDatasetList[fldList[0].set_seq - 1]["sch_" + prefix[i] + "_time"];
						}
					}
				}
			}
			
			// 항목,범례 필드 Index 설정
			if(!cfgParam.category_field_index) {
				cfgParam.category_field_index = [];
				cfgParam.category_field_index.push(0);
			}
			if(!cfgParam.series_field_index) {
				cfgParam.series_field_index = [];
				if(this.view_type != "T" && this.bMultiGroup) cfgParam.series_field_index.push(1);
			}
			
			// Config form 
			var $form = $(".config-select-area form", this.$element);
			
			if(this.view_type == "T") {
				// 테이블 목록 Hide
				//$(".list_container", this.$element).hide();
				
				$("[name=category_rows]", $form).hide();
				$("[name=view_type]", $form).hide();
				$("[name=sub_view_type]", $form).show();
				$("[name=rows]", $form).hide();
			}
			else {
				$("[name=sub_view_type]", $form).hide();
				$("[name=view_type] [value=T]", $form).remove();
			}
			
			// 검색 추가
			var $formTable = $(".search-area", $form);
			for(var i = 0; i < fldLen; i++) {
				$formTable.append(this._getSearchField$DIV(fldList[i]));
			}
			slui.attach.init('.search-area');
		},
		
		_getSearchField$DIV : function(pField) {
			if(this.isFuncField(pField)) return "";
			
			if(pField.field_nm == "eqp_dt") {
				return this._getSearchTime$DIV(pField);	
			}
			else {
				var $div = $("<div class='ranges-group'>");
				$div.append(
					$("<div class='range-2'>")
					.append(
						$("<span class='sp-label'>")
						.text("[" + pField.set_seq + "]" + this.getFieldCaption(pField))
					)
				);
				
				$div.append(
						$("<div class='range-2'>")
							.append( this._getSearchOperator(pField) )
				);
				
				$div.append(
					$("<div class='range-5'>")
						.append(
							$("<input type='text' class='form-input'>")
								.attr("name", "field_value" + pField.field_seq)
						)
				);
				return $div;
			}
		},
		
		_getSearchOperator : function(pField) {
			var $op = $("<select class='form-select' data-size='6' />").attr({
				name : "field_value" + pField.field_seq + "_op",
				title : "연산자"
			});
			
			$op.append( $("<option>").text("=")		.val("=") );
			$op.append( $("<option>").text("!=")	.val("!=") );
			$op.append( $("<option>").text(">")		.val(">") );
			$op.append( $("<option>").text("<")		.val("<") );
			$op.append( $("<option>").text(">=")	.val(">=") );
			$op.append( $("<option>").text("<=")	.val("<=") );
			$op.append( $("<option>").text("starts with")	.val("SW") ); 
			$op.append( $("<option>").text("ends with")	.val("EW") ); 
			$op.append( $("<option>").text("like")	.val("LIKE") );
			$op.append( $("<option>").text("not like")	.val("NOT LIKE") );
			$op.append( $("<option>").text("in")	.val("IN") );
			$op.append( $("<option>").text("not in").val("NOT IN") );
			
			return $op;
		},
		
		_getSearchTime$DIV : function(pField) {
			
			var prefix = ["start", "end"]; 
			var $day = [];
			var $hour = [];
			var $min = [];
			
			var vDay = [];
			var vHour = [];

			var $div = $("<div class='ranges-group'>");
			
			$div.append(
				$("<div class='range-2'>")
				.append(
					$("<span class='sp-label'>")
					.text("[" + pField.set_seq + "]" + this.getFieldCaption(pField))
				)
			);
			
			var str;
			for(var i = 0; i < 2; i++) {
				str = gDatasetList[pField.set_seq - 1]["sch_" + prefix[i] + "_time"];
				
				if(str) {
					vDay[i] = str.substring(0, 8);
					vHour[i] = str.substring(8, 10);
				}
				else {
					vDay[i] = "";
					vHour[i] = "";
				}
				
				$day[i] = $("<input type=text class='form-input align-center' data-datepicker='true' readonly='readonly'>").attr({name : prefix[i] + "Day"});
				$hour[i] = $("<select class='form-select' data-size='6' />").attr({name : prefix[i] + "Hour"});
				
				for(var j = 0; j < 24; j++) {
					str = _SL.toFixedWidth(j, 2, '0');
					$hour[i].append( $("<option/>").val(str).text(str) );
				}
				
				$day[i].val(vDay[i]);
				$hour[i].val(vHour[i]);

				$div
				.append(
					$("<div class='range-2'>").append($day[i])
				)
				.append(
					$("<div class='range-1'>").append($hour[i])
				)
				.append(
					$("<div class='range-1'>").append("시").append(i == 0 ? " ~ " : "")
				)
			}
			
			return $div;
		},
		
		load : function() {
			this.refresh();
		},
		
		_getChartId : function() {
			return "chart_id_" + this.item_seq;
		},
		
		refresh : function(dataList) {
			var cfgParam = this.config_param;
			
			if(cfgParam.wsize === "2"){
				this.$element.addClass("item-board-wide");
			} else {
				this.$element.removeClass("item-board-wide");
			}
			
			var strUrl, nMode;
			
			if(this._bChangeConfig) {
				this._bChangeConfig = false;
				
				if(this._time_id != -1) {
					clearTimeout(this._time_id);
					this._time_id = -1;
				}
				
				if((cfgParam.view_type == "R1" || cfgParam.view_type == "R2") && cfgParam.RChartStatus == 1) {
					var cFldSeq = "" + (this.config_param.category_field_index.length > 0 ? this.config_param.category_field_index[0] + 1 : "");
					var sFldSeq = "" + (this.config_param.series_field_index.length > 0 ? this.config_param.series_field_index[0] + 1 : "");
					
					// R Chart 요청
					$('body').requestData(gCONTEXT_PATH + "analysis/big_stats_rchart_request.do", 
						$.extend({}, 
							this.config_param, 
							{
								big_code : this.big_code,
								item_seq : this.item_seq,
								category_field_seq : cFldSeq,
								series_field_seq : sFldSeq
							}
						),
						{callback :$.proxy(this.refresh, this)}
					);
				
					return;
				}
			}
			
			var categoryFieldList = this._getCategoryFieldList();
			var totalAvgGroupFieldList = [];
			
			if(this.config_param.view_type == "T") {
				totalAvgGroupFieldList = [].concat(categoryFieldList);
				
				if(this.config_param.series_field_index.length > 0 && this.config_param.sub_view_type != "S") {
					totalAvgGroupFieldList = totalAvgGroupFieldList.concat(this._getSeriesFieldList());
				}
							
				strUrl = gCONTEXT_PATH + "analysis/big_stats_rs_timeline.json";
				nMode = 1;
			}
			else if (this.config_param.view_type == "R1" || this.config_param.view_type == "R2") {
				strUrl =  gCONTEXT_PATH + "analysis/big_stats_rs_list.json";
				nMode = 9;
			}
			else {
				if(this.config_param.view_type != "P") {
					totalAvgGroupFieldList = [].concat(categoryFieldList);
					
					if(this.config_param.series_field_index.length > 0 && this.config_param.view_type != "S") {
						totalAvgGroupFieldList = totalAvgGroupFieldList.concat(this._getSeriesFieldList());
					}
				}
				
				strUrl =  gCONTEXT_PATH + "analysis/big_stats_rs_list.json";
				nMode = 2;
			}
			
			var callback = this.output;
			
			$('body').requestData(strUrl, 
				$.extend({}, 
					this.config_param, 
					{
						big_code : this.big_code,
						item_seq : this.item_seq,
						category_field : categoryFieldList,
						series_field : this._isMultiSeries() ? this._getSeriesFieldList() : [],
						category_field_nm : this._getCategoryOrgFieldList(),
						series_field_nm : this._isMultiSeries() ? this._getSeriesOrgFieldList() : [],
						dt_func : this.fieldList[0].func,
						func : this.fieldList[this.fieldList.length-1].func,
						total_group_field : totalAvgGroupFieldList 
					}
				),
				{callback : $.proxy(this.output, this, nMode)}
			);
		},
		
		_getCategoryFieldList : function() {
			var list = [];
			var listIdx = this.config_param.category_field_index;
			
			for(var i = 0; i < listIdx.length; i++) {
				list.push("field_value" + (listIdx[i] + 1));
			}
			
			return list;
		},
		
		_getCategoryOrgFieldList : function() {
			var list = [];
			var listIdx = this.config_param.category_field_index;
			
			for(var i = 0; i < listIdx.length; i++) {
				list.push(this.fieldList[listIdx[i]].field_nm);
			}
			
			return list;
		},
		
		_getSeriesFieldList : function() {
			var list = [];
			var listIdx = this.config_param.series_field_index;
			
			for(var i = 0; i < listIdx.length; i++) {
				list.push("field_value" + (listIdx[i] + 1));
			}
			
			return list;
		},
		
		_getSeriesOrgFieldList : function() {
			var list = [];
			var listIdx = this.config_param.series_field_index;
			
			for(var i = 0; i < listIdx.length; i++) {
				list.push(this.fieldList[listIdx[i]].field_nm);
			}
			
			return list;
		},
		
		_isMultiSeries : function() {
			if(this.config_param.series_field_index.length > 0 && ("P" != this.config_param.view_type))
				return true;
			
			return false;
		},
		
		output : function(pMode,pData) {
			/*
			for(var i=0; i < arguments.length; i++) {
		        console.log(i + "째 인자의 값은 " + arguments[i]);
		    }
			*/
			
			if(pMode == 1) {
				this.dataList = pData.list;
				
				this.outputTimelineChart(pData.list, pData.totalAvg);
				this.outputList(pData.list);
			}
			else if(pMode == 2) {
				this.dataList = pData.list;

				this.outputChart(pData.list, pData.totalAvg);
				this.outputList(pData.list);
			}
			else if(pMode == 9) {
				this.dataList = pData.list;
				
				this.outputRChart(pData.list, pData.totalAvg);
				this.outputList(pData.list);
			}
			
		},
		
		outputTimelineChart : function(dataList, totalAvg) {
			this.outputChart(dataList, totalAvg);
		},

		outputChart : function(dataList, totalAvg) {
			$(".chart_container", this.$element).show();
			$(".r_chart_container", this.$element).hide();
			
			var dataSource = {}, chartType, chartHeight, chartStyle;
			
			chartType = this.view_type == "T" ? this.config_param.sub_view_type : this.config_param.view_type;
			
			if(this._isMultiSeries()) {
				chartType = "M" + chartType;
			}
			
			dataSource = $.extend(this._getChartData(dataList || []), { chart : gChartTypes[chartType].style });
			
			if(totalAvg) {
				$.extend(dataSource, { 
					trendlines : [{
						line : [{
								startvalue: totalAvg,
								endvalue: "",
								color: "fda813",
								displayvalue: " ",
								tooltext : "Average : " + _SL.formatNumber(totalAvg),
								showontop: "1",
								thickness: "1"
						}]
					}]
				})
			}
			
			var timeChart = new FusionCharts({
				type: gChartTypes[chartType].type,
				renderAt: 'chart_container_' + this.item_seq,
				width: '100%',				
				dataFormat: 'json',
				height : this.config_param.chart_height,
				dataSource : dataSource
				}).render();
		},
		
		outputRChart : function() {
			//console.log("outputRChart. this.item_seq : %o!!!", this.item_seq);
			var strUrl;
			var cfgParam = this.config_param;
			var _this = this;
			
			$(".chart_container", this.$element).hide();
			var $cntn = $(".r_chart_container", this.$element).show();
			
			if(this._time_id == -1) {
				$cntn.html('<div class="rchart_text" style="text-align:center;line-height:'+this.config_param.chart_height+'px;">creating rchart...</div>');
			}
			
			var cFldIdxList = this.config_param.category_field_index;
			var sFldIdxList = this._isMultiSeries() ? this.config_param.series_field_index : [];
			
			var cFldSeq = cFldIdxList.length > 0 ? cFldIdxList[0] + 1 : "";
			var sFldSeq = sFldIdxList.length > 0 ? sFldIdxList[0] + 1 : "";
			
			if(cfgParam.RChartStatus == 1) {
				$('body').requestData(gCONTEXT_PATH + "analysis/big_stats_rchart_check.do", 
					$.extend({}, 
						this.config_param, 
						{
							big_code : this.big_code,
							item_seq : this.item_seq,
							view_type : this.config_param.view_type,
							category_field_seq : cFldSeq,
							series_field_seq : sFldSeq
						}
					),
					{callback : function(rsData, rsCd, rsMsg){
						if(rsCd == "SUC_COM_0000") {
							cfgParam.RChartStatus = 2;
							_this._time_id = setTimeout($.proxy(_this.outputRChart, _this), 10);
						}
						else _this._time_id = setTimeout($.proxy(_this.outputRChart, _this), _this.RChart_Check_Interval);
						
						
					}}
				);
			}else{
				//console.log("outputRChart cfgParam.RChartStatus : " + cfgParam.RChartStatus);
				if(this._time_id != -1) this._time_id = -1;
				
				$cntn.empty();
				
				strUrl = "big_stats_rchart_down.do";
				strUrl += "?big_code="+this.big_code+"&item_seq="+this.item_seq+"&view_type="+this.config_param.view_type
							+"&category_field_seq="+cFldSeq+"&series_field_seq="+sFldSeq;
				
				$cntn.append(
					$("<img>").attr({
						src : strUrl,
						width : "100%",
						height : this.config_param.chart_height
					})
				);
			}
			
		},
		
		_getChartData : function (dataList) {
			if(!dataList) dataList = [];
			
			var	cField = [], sField = [], allField;
			
			for(var i = 0; i < this.config_param.category_field_index.length; i++) {
				cField.push(this.fieldList[this.config_param.category_field_index[i]]);
			}
			var chartDataSource = {}, seriesMap = {}, categoryIndex = {}, categoryList = [], nLen;
			
			if(this._isMultiSeries()) {
				for(var i = 0; i < this.config_param.series_field_index.length; i++) {
					sField.push(this.fieldList[this.config_param.series_field_index[i]]);
				}
				
				chartDataSource = {
					categories : [{category:[]}],
					dataset : []
				};
			}
			else {
				chartDataSource = {data : []}
			}
			
			allField = cField.concat(sField);
			
			// Dataset 정의
			//nLen = Math.min(dataList.length, 1440);
			nLen = dataList.length;
			
			var data, tData, values, labels, toolText, oField, fldVal, sFldVal
			;
			for(var i = 0; i < nLen; i++) {
				data = dataList[i];
				
				tData = {};
				values = [];
				labels = [];
				toolText = [];
				
				if(!this._isMultiSeries()) {
					for(var j = 0; j < cField.length; j++) {
						oField = cField[j];
						fldVal = this.getFieldValue(data, oField);
						
						labels.push(this.getFieldFormatValue(fldVal, oField, true));
						toolText.push(this.getFieldFormatValue(fldVal, oField));
					}
					
					tData.label = labels.join("/");
					toolText = [toolText.join("/")];
					toolText.push(data.func_value);
					tData.toolText = toolText.join(", ");
					tData.value = data.func_value;
					tData.link = this._getLinkUrl(i, cField);
					
					chartDataSource.data.push(tData);
				}
				else {
					for(var j = 0; j < cField.length; j++) {
						oField = cField[j];
						fldVal = this.getFieldValue(data, oField);
						
						values.push(fldVal);
						labels.push(this.getFieldFormatValue(fldVal, oField, true));
						toolText.push(this.getFieldFormatValue(fldVal, oField));
					}
					tData.value = values.join("/");
					tData.label = labels.join("/");
					tData.toolText = toolText.join("/");
					
					labels = [], toolText = [];
					for(var j = 0; j < sField.length; j++) {
						oField = sField[j];
						fldVal = this.getFieldValue(data, oField);
						
						labels.push(this.getFieldFormatValue(fldVal, oField, true));
						toolText.push(this.getFieldFormatValue(fldVal, oField));
					}
					sFldVal = labels.join("/");
					
					if(!seriesMap[sFldVal]) {
						seriesMap[sFldVal] = [];
					}
					
					if(typeof categoryIndex[tData.value] == "undefined") {
						categoryIndex[tData.value] = categoryList.length;
						categoryList.push({label : tData.label, toolText : tData.toolText});
					}
					
					seriesMap[sFldVal][categoryIndex[tData.value]] = {value : data.func_value, link : this._getLinkUrl(i, allField)};
				}
			}
			
			if(this._isMultiSeries()) {
				chartDataSource.categories = [ {category : categoryList} ];
				
				for(var oKey in seriesMap) {
					// TODO 0 채우기
					chartDataSource.dataset.push({seriesname : oKey, data : seriesMap[oKey]});
				}
				
				//console.log("chartDataSource : %s", JSON.stringify(chartDataSource));
			}
			
			return chartDataSource;
		},
		
		outputList : function(dataList) {
			if(!dataList) dataList = [];

			var cfgParam = this.config_param;
			var $tbl = this.$element.find(".list_table").empty();
			var viewFldList = this._getViewFieldList();
			var fldLen = viewFldList.length;
			
			// 제목 추가
			var 
				$thead = $("<thead>"), 
				$tbody = $("<tbody>"), 
				$tr = $("<tr>"), 
				data;
			
			for(var i = 0; i < fldLen; i++) {
				$tr.append(
					$("<th>").text(this.getFieldCaption(viewFldList[i]))
				).appendTo($thead);
			}
			$tbl.append($thead);
			
			if(dataList.length == 0) {
				$("<tr>").append(
					$("<td>")
						.attr("colspan", fldLen + 1)
						.text("There is no data.")
				)
				.appendTo($tbody).appendTo($tbl);
			}
			else {
				var data, field, tCapKey, $span, fldVal, maxLen = this.config_param.wsize * 70;
				
				for(var i = 0; i < dataList.length; i++) {
					data = dataList[i];
					
					$tr = $("<tr>");
					 
					for(var j = 0; j < fldLen; j++) {
						field = viewFldList[j];
						fldVal = this.getFieldFormatValue(this.getFieldValue(data, field), field);
						$span = $("<span>").attr("title", fldVal);
						
						if(fldVal && fldVal.length > maxLen) {
							$span.text(fldVal.substring(0, maxLen - 3) + "...");
						} 
						else {
							$span.text(fldVal);
						}
						
						$tr.append(
							$("<td>").append(this._get$Link(i, this.isFuncField(field) ? viewFldList : field, $span))
						);
					}
					
					$tr.appendTo($tbody);
				}
				$tbody.appendTo($tbl);
			}

			$('#table_container_' + this.item_seq).height(cfgParam.list_height+'px');
		},
		
		_getViewFieldList : function() {
			var listIdx = this.config_param.category_field_index;
			var viewFldList = [];
			
			for(var i = 0; i < listIdx.length; i++) {
				viewFldList.push(this.fieldList[listIdx[i]]);
			}
			if(this._isMultiSeries()) {
				listIdx = this.config_param.series_field_index;
				for(var i = 0; i < listIdx.length; i++) {
					viewFldList.push(this.fieldList[listIdx[i]]);
				}
			}
			viewFldList.push(this.fieldList[this.fieldList.length - 1]);	// 집계필드
			
			return viewFldList;
		},
		
		// fldSeq == -1일 경우 통계 필드
		_goLogSearch : function(dataIdx, fldSeq) {

			var dataList = this.dataList, viewFieldList = this._getViewFieldList();
			
			var filterField;
			// isFuncField일 경우 viewFieldList를 조건으로 Search
			if(fldSeq == -1) {
				filterField = viewFieldList.slice(0, viewFieldList.length - 1);
			}
			// isFuncfield 아닌 경우 현재 field의 조건으로 Search
			else {
				for(var i = 0; i < viewFieldList.length; i++) {
					if(viewFieldList[i].field_seq == fldSeq) {
						filterField = [viewFieldList[i]];
						break;
					}
				}
			}
			
			if(!filterField) {
				console.log("Error item_seq : %s, dataIdx : %s, fldSeq : %s", this.item_seq, dataIdx, fldSeq);
				return;
			}
			
			var dataSetInfo = gDatasetList[filterField[0].set_seq - 1];
			var data = this.dataList[dataIdx];
			var schPeriod = null;
			var strQry = "(" + dataSetInfo.sch_query + ")";
			var fldNm, fldVal;
			
			// 검색 Query 설정
			for(var i = 0; i < filterField.length; i++) {
				fldNm = filterField[i].field_nm;
				fldVal = this.getFieldValue(data, filterField[i]);
				
				if(fldNm == "eqp_dt") {
					schPeriod = this._getSearchPeriod(data, filterField[i]);
					continue;
				}
				
				if(fldVal == "-") 
					strQry += " NOT " + fldNm + ":*";
				else
					strQry += " AND " + fldNm + ":" + _SL.luceneValueEscape(fldVal);
			}
			
			// eqp_dt가 없을 경우 dataset에서 start_time, end_time 설정
			if(schPeriod == null) schPeriod = this._getSearchPeriodFromDataset(filterField[0].set_seq);
			
			var 
				netJoinCd = dataSetInfo.client_group_cd, 
				startTime = schPeriod.start_time, 
				endTime = schPeriod.end_time, 
				schQuery = strQry;
			
			var $frm = $("#goLogForm");
			var $doc;
			
			if($frm.size() == 0) {
				$frm = $("<form id=goLogForm>")
						.attr({
							action : gCONTEXT_PATH + "monitoring/log_search.html",
							method : "post" 
						});
				
				$frm.append( $("<input>").attr({type : "hidden", name : "network_join_cd"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "start_time"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "end_time"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "filter_type"}).val("2") );
				$frm.append( $("<input>").attr({type : "hidden", name : "expert_keyword"}) );
				$frm.append( $("<input>").attr({type : "hidden", name : "template_id"}).val("popup") );
			}
			if(netJoinCd) {
				//$("[name=network_join_cd]", $frm).val(netJoinCd);
			}
			$("[name=start_time]", $frm).val(startTime);
			$("[name=end_time]", $frm).val(endTime);
			$("[name=expert_keyword]", $frm).val(schQuery);
			
			var winName = "logSearchWin_" + (new Date()).getTime();
			
			$frm.attr({target : winName}).submit(); 			
			
		},
		
		_getSearchPeriodFromDataset : function(setSeq) {
			var dataSet = gDatasetList[setSeq - 1];
			
			if(dataSet.set_type == 'S') {
				return {start_time : dataSet.sch_start_time, end_time : dataSet.sch_end_time};
			}
			else {
				console.log("Error _getSearchPeriodFromDataset > DataSet Type is %s", dataSet.set_type);
				return null;
			}
		},
		
		_getSearchPeriod : function(data, timeField) {
			//console.log("_getSearchPeriod Data : %o, timeField : %o", data, timeField);
			var timeInfo = {start_time : this.getFieldValue(data, timeField), end_time : ""};
			
			switch(timeField.func) {
			case "8" :
				timeInfo.start_time += "0000";
				timeInfo.end_time = _SL.formatDate.addDay(timeInfo.start_time, 1);
				break;
			case "10" :
				timeInfo.start_time += "00";
				timeInfo.end_time = _SL.formatDate.addHour(timeInfo.start_time, 1);
				break;
			case "11" :
				timeInfo.start_time = timeInfo.start_time + "0";
				timeInfo.end_time = _SL.formatDate.addMin(timeInfo.start_time, 10);
				break;
			case "12" :
				timeInfo.end_time = _SL.formatDate.addMin(timeInfo.start_time, 1);
				break;
			default :
				console.log("Error _getSearchPeriod > field_nm : %s, func : %s", timeField.field_nm, timeField.func);
				return null;
			}
			
			//console.log("timeInfo : %o", timeInfo);
			
			return timeInfo;
		},
		
		_get$Link : function(dataIdx, fields, $txt) {
			var strUrl = this._getLinkUrl(dataIdx, fields);
			
			return strUrl == null ? $txt : $("<a>").attr({href : strUrl}).append($txt);
		},
		
		// fields가 배열일 경우 통계필드 Link
		_getLinkUrl : function(dataIdx, fields) {
			var field, setSeq = 0, fldSeq = 0, bLink = false;
			
			if($.isArray(fields)) {
				fldSeq = -1;	// FuncField
			}
			else {
				fldSeq = fields.field_seq;
				fields = [fields];
			}
			
			for(var i = 0; i < fields.length; i++) {
				if(this.isFuncField(fields[i])) continue;
				
				if(setSeq == 0) {
					setSeq = fields[i].set_seq;
					
					if(gDatasetList[setSeq - 1].set_type == "S") {
						bLink = true;
					}
					else {
						bLink = false;
						break;
					}
				}
				else if(setSeq != fields[i].set_seq) {
					bLink = false;
					break;
				}
			}
			
			return bLink ? "javascript:slapp.bigStats.view._goLogSearch(" + this.item_seq + "," + dataIdx + "," + fldSeq + ")" : null;
		},
		
		validateConfig : function() {
			var $frm = $(".page-config-area form", this.$element);
			
			if(!_SL.validate($frm)) return;
			
			var cList = $(".dnd_category>ul", this.$element).sortable("toArray", {attribute : "field_index"});
			var sList = $(".dnd_series>ul", this.$element).sortable("toArray", {attribute : "field_index"});
			
			if(this.view_type == "T") {
				if($("[name=startDay]", $frm).val() + $("[name=startHour]", $frm).val() >= 
						$("[name=endDay]", $frm).val() + $("[name=endHour]", $frm).val() ) {
					_alert("검색 시작시간보다 종료시간이 커야 됩니다.");
					return false;
				}
			}
			else if(cList.length == 0) {
				_alert("항목필드를 선택하세요.");
				return false;
			}

			var viewType = $("[name=view_type]", $frm).val();
			
			if(viewType == "R1") {
				console.log(0);
				if(cList.length != 1) {
					_alert("R 차트는 항목필드를 하나만 선택하세요.");
					return false;
				}
				if(sList.length != 0) {
					_alert("R Word 차트는 범례필드를 선택할 수 없습니다.");
					return false;
				}
			}
			else if(viewType == "R2") {
				if(cList.length != 1) {
					_alert("R 차트는 항목필드를 하나만 선택하세요.");
					return false;
				}
				
				if(sList.length != 1) {
					_alert("R 방사 차트는 범례필드를 하나 선택하세요.");
					return false;
				}
			}
			
			return true;
		},
		
		showConfig : function() {
			var fldList = this.fieldList;
			var fldLen = fldList.length;
			var cfgParam = this.config_param;

			slapp.bigStats.view.showConfig(this);
			
			var $to, fldCaption, idx, idxKeys = {};
			
			$(".dnd_field_pannel ul", this.$element).empty();
			$to = $(".dnd_category ul", this.$element);
			
			for(var i = 0; i < cfgParam.category_field_index.length; i++) {
				idx = cfgParam.category_field_index[i];
				idxKeys["idx_" + idx] = idx;
				
				this._appendDndFieldTo($to, idx, "[" + fldList[idx].set_seq + "]" + this.getFieldCaption(fldList[idx]));
			}
			
			$to = $(".dnd_series ul", this.$element);
			
			for(var i = 0; i < cfgParam.series_field_index.length; i++) {
				idx = cfgParam.series_field_index[i];
				idxKeys["idx_" + idx] = idx;

				this._appendDndFieldTo($to, idx, "[" + fldList[idx].set_seq + "]" + this.getFieldCaption(fldList[idx]));
			}
			
			$to = $(".dnd_selectable ul", this.$element);
			
			for(var i = 0; i < fldList.length; i++) {
				if(typeof idxKeys["idx_" + i] != "undefined" || this.isFuncField(fldList[i])) continue;
				
				this._appendDndFieldTo($to, i, "[" + fldList[i].set_seq + "]" + this.getFieldCaption(fldList[i]));
			}
		},
		
		_appendDndFieldTo : function($to, idx, cap) {
			$to.append(
				$("<li>")
					.attr({ "field_index" : idx, "title" : cap })
					.addClass("dnd_field ui-state-default" + (idx == 0 && this.view_type == "T" ? " ui-state-disabled" : ""))
					.text(cap)
			);
		},
		
		beforeSaveConfig : function() {
			var oBfCfg = $.extend({}, this.config_param);
			
			slapp.bigStats.view.beforeSaveConfig(this);
			
			// 항목, 범례 필드 Config에 설정
			var fldList = this.fieldList;
			var fldLen = fldList.length;
			var cfgParam = this.config_param;
			
			var cList = $(".dnd_category>ul", this.$element).sortable("toArray", {attribute : "field_index"});
			var sList = $(".dnd_series>ul", this.$element).sortable("toArray", {attribute : "field_index"});
			
			cfgParam.category_field_index = [];
			
			// Timeline일 경우 index:0은 sortable 안돼 무조건 추가
			if(this.view_type == "T") cfgParam.category_field_index.push(0);
			
			for(var i = 0; i < cList.length; i++) {
				cfgParam.category_field_index.push(parseInt(cList[i]));
			}
			
			cfgParam.series_field_index = [];
			for(var i = 0; i < sList.length; i++) {
				cfgParam.series_field_index.push(parseInt(sList[i]));
			}
			
			// 기간 설정(장비발생시간기준의 분석일때)
			var str = $("[name=startDay]", this.$element).val();
			
			if(str && str != "") {
				cfgParam.start_time = $("[name=startDay]", this.$element).val() + $("[name=startHour]", this.$element).val();
				cfgParam.end_time = $("[name=endDay]", this.$element).val() + $("[name=endHour]", this.$element).val();
			}
			
			if(cfgParam.view_type == "R1" || cfgParam.view_type == "R2") {
				if(oBfCfg.view_type != cfgParam.view_type
						|| !this.isSameArrayValue(oBfCfg.category_field_index, cfgParam.category_field_index) 
						|| !this.isSameArrayValue(oBfCfg.series_field_index, cfgParam.series_field_index)) {
					cfgParam.RChartStatus = 1;
				}
			}
			
			this._bChangeConfig = true;
			
		},
		
		isSameArrayValue : function(src, to) {
			if( !src || src.length == 0) {
				return ( !to || to.length == 0 );
			}
			else {
				if(!to || src.length != to.length) return false;
				
				for(var i = 0; i < src.length; i++) {
					if(src[i] != to[i]) return false;
				}
			}
			
			return true;
		},
		
		isFuncField : function(pField) {
			return pField.func && /^\D/.test(pField.func);
		},
		
		getFieldCaption : function(pField) {
			var fldNm = gFieldCaptions[pField.field_nm] || pField.field_nm;
			
			if(this.isFuncField(pField)) {
				fldNm = (gFieldCaptions[pField.func] || pField.func) + (pField.field_nm != "*" ? "[" + fldNm + "]" : "");
			}
			
			return fldNm;
		},
		
		// 날자는 날자형(축약일 경우 시분), 그외는 코드명을 포함한 값
		// 집계함수는 천단위(,) 값
		getFieldFormatValue : function(pValue, pField, bAbbr) {
			var seq = pField.field_seq;
			var strAbbr = bAbbr ? "" : "yyyy-MM-dd";
			var frmValue;
			
			if(pField.func) {
				switch(pField.func) {
				case "8":
					frmValue = _SL.formatDate(pValue, "yyyyMMdd", "yyyy-MM-dd");
					break;
				case "10" :
					frmValue = _SL.formatDate(pValue, "yyyyMMddHH", strAbbr + " HH:mm");
					break;
				case "11" :
					frmValue = _SL.formatDate(pValue +"0", "yyyyMMddHHmm", strAbbr + " HH:mm");
					break;
				case "12" :
					frmValue = _SL.formatDate(pValue, "yyyyMMddHHmm", strAbbr + " HH:mm");
					break;
				default :
					frmValue = _SL.formatNumber(pValue);
				}
			}
			else {
				frmValue = pValue;
				
				if(gFldToCodes[pField.field_nm] && gFldToCodes[pField.field_nm][pValue]) {
					frmValue = "[" + pValue + "]" + gFldToCodes[pField.field_nm][pValue];
				}
			}
		
			return frmValue;
		},
		
		getFieldValue : function(pData, pField) {
			var seq = pField.field_seq;
			
			if(pField.func) {
				switch(pField.func) {
				case "8":
				case "10" :
				case "11" :
				case "12" :
					return pData["field_value" + seq];
				default :
					return pData["func_value"];
				}
			}
			else {
				return pData["field_value" + seq];
			}
		}
	};	
	
	return {
		init : init,
		showConfig : showConfig,
		beforeSaveConfig : beforeSaveConfig,
		_goLogSearch : _goLogSearch
	};

}();

$(function(){
	slapp.bigStats.view.init();
	
	
	
});