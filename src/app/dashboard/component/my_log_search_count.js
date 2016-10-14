//# sourceURL=my_log_search_count.js

'use strict';

_SL.nmspc("slapp.component").my_log_search_count = function(id, configParam, componentTitle) {
	var
	containerId = id,

	urlMyfilterList	= gCONTEXT_PATH + "monitoring/myfilter_list.json",
	urlMyfilter		= gCONTEXT_PATH + "monitoring/myfilter_keywords.json",
	urlLogSearchList= gCONTEXT_PATH + "monitoring/log_search_list.json",
	urlLogSearch	= gCONTEXT_PATH + "monitoring/log_search.html",
	
	riskClass = {
		ok		: "text-success",
		low		: "text-attention",
		middle	: "text-warning",
		high	: "text-danger"
	},
	
	config_param = configParam,
	component_title = config_param.component_nm ? config_param.component_nm : componentTitle,
	
	admin_config = {
		max_period_min : _SL.ifNull(slapp.component.my_log_search_count.admin_config.max_period_min*1, 60)
	},
	
	defaultOptions ={//default_param
		component_nm : componentTitle,
		myfilter_name : "검색조건 : 없음", 
		strQuery : "",
		searchPeriod : 5,
		normal:0,
		low : 0,
		middle : 0,
		high : 0,
		font_size : ""
	},
	
	options = {
		delay:1
	},
	
	m$ = { 
		tit		    : $("#componentheader_" + containerId + " .area-title"),
		body		: $("#componentbody_" + containerId),
		form		: $("#config_" + containerId + " form"),
		chtCntnr	: $("#count-container_" + containerId)
	},
	
	load = function() {
		//this.config_param = config_param = $.extend({}, default_param, config_param);
		
		// DOM 변경
		$("[name=searchPeriod] option", m$.form).each(function() {
			//console.log(this.value + ":" + admin_config.max_period_min);
			if(this.value > admin_config.max_period_min) $(this).remove();
		});		
		
		// Default Option 설정
		$.extend(options, defaultOptions, config_param);		
		
		_getDfdMyfilterInfo(options.myfilter_id, options.myfilter_type, function(data) {
			if(data.myfilter_id) {
				options.strQuery = config_param.strQuery = data.strQuery;
			}
				
			_init();
			
			refresh();
		});
		// Bind Event
		m$.chtCntnr.off("click").on("click", goSearchPopup);
	
	},
	
	refresh = function() {

		if(config_param.component_nm || config_param.component_nm == ""){
			m$.tit.text(config_param.component_nm);
		}
		
		var eTime = options.end_time = _getSchEndDate();
		var sTime = options.start_time = _SL.formatDate.addMin(eTime, -options.searchPeriod);

		var param = {
			start_time 	: sTime,
			end_time 	: eTime,
			query 		: options.strQuery,
			search_type : "onlyCount"
		};
		
		_setSubTitleRows();
		
		if(options.font_size){
			m$.chtCntnr.css('font-size', options.font_size+'px');
		}else{
			m$.chtCntnr.css('font-size', '');
		}
		
		if(options.strQuery != ""){
			$("body").requestData(urlLogSearchList, param, {callback : function(rsData){
				_createChart(rsData)
			}});
		}
	},
	
	showConfig = function() {
		var myfilterId = config_param.myfilter_id;

		//설정초기화
		m$.form.find("[name=component_nm]").val(options.component_nm);
		m$.form.find("[name=searchPeriod]").val(options.searchPeriod);
		m$.form.find("[name=low]").val(options.low);
		m$.form.find("[name=middle]").val(options.middle);
		m$.form.find("[name=high]").val(options.high);
		m$.form.find("[name=font_size]").val(options.font_size);

		// 내 검색조건 가져오기
		$("body").requestData(urlMyfilterList, {}, {callback : function(rsJson, rsCd, rsMsg) {
			var $myfilterInfo = m$.form.find("[name=myfilterInfo]");
			$myfilterInfo.html('<option value="0">[선택하세요]</option>');

			for(var i = 0, l = rsJson.length; i < l; i++) {
				$("<option>")
					.attr(myfilterId == rsJson[i].myfilter_id ? {selected:true} : {})
					.val(JSON.stringify(rsJson[i]))
					.text(rsJson[i].myfilter_name)
					.appendTo($myfilterInfo);
			}
			slui.attach.setTransformSelect("#config_" + containerId + " form");
			$myfilterInfo.trigger("change");
		}});	
		
		if(options.component_nm || options.component_nm == ""){
			$("#config_" + containerId).find("h4").text(options.component_nm);
		}
	},
	
	validateConfig = function(){
		if(!_SL.validate(m$.form)){
			return false;
		}else{
			return true;
		}
	},
	
	beforeSaveConfig = function(){
		var oMyfilterInfo;
		
		var list = m$.form.serializeArray();
		
		var t_config_param = {};
		
		for(var i = 0; i < list.length; i++) {
			t_config_param[list[i].name] = list[i].value;
		}
		
		if(t_config_param.myfilterInfo != "") {
			oMyfilterInfo = $.parseJSON(t_config_param.myfilterInfo);
			t_config_param.myfilter_id = oMyfilterInfo.myfilter_id;
			t_config_param.myfilter_type = oMyfilterInfo.myfilter_type;
			t_config_param.myfilter_name = oMyfilterInfo.myfilter_name;
		}
		else {
			t_config_param.myfilter_id = "";
			t_config_param.myfilter_type = "";
			t_config_param.myfilter_name = defaultOptions.myfilter_name;
		}

		delete t_config_param.myfilterInfo;
		
		this.config_param = config_param = t_config_param;	
	},
	
	afterSaveConfig = function() {
		//내검색조건 관련 설정 초기화
		_getDfdMyfilterInfo(config_param.myfilter_id, config_param.myfilter_type, function(data) {
			config_param.strQuery = data.strQuery;
			
			_init();
			refresh();
		});
	},
	
	_getDfdMyfilterInfo = function(myfilterId, myfilterType, cbFunc) {
		var oMyfilterInfo = {
			myfilter_id		: "",
			myfilter_type	: "",
			strQuery		: ""
		};
		
		if(!myfilterId) {
			cbFunc(oMyfilterInfo);
		}
		else {
			// 내 검색조건 정보 조회
			$('body').requestData(urlMyfilter, { myfilter_id : myfilterId }, {callback : function(rsJson) {
				if(rsJson.view_fields) {
					$.extend(oMyfilterInfo, {
						myfilter_id		: myfilterId,
						myfilter_type	: myfilterType,
						viewFeidls		: rsJson.view_fields.split(",")
					});
				}

				oMyfilterInfo.strQuery = rsJson.keywords;
				
				cbFunc(oMyfilterInfo);
			}} );
		}
	},	
	
	_init = function(){
		
		$.extend(options, config_param);
		
		var eTime = _getSchEndDate();
		var sTime = _SL.formatDate.addMin(eTime, -(options.searchPeriod));
		
		options.start_time = sTime;
		options.end_time = eTime;
		
		_preRefresh();
	},
	
	_getSchEndDate = function() {
		return _SL.formatDate.addMin(gGetServerTime(), -(options.delay));
	},
	
	_preRefresh = function() {
		var $sTitle = m$.body.find(".filter-detail h5");
		var strTitle = options.myfilter_name,
		text = options.strQuery =='' ? "없음" : options.strQuery;

		$sTitle.attr('data-ui','tooltip')
			.data('text',"검색조건 : " + text)
			.html(strTitle);
		
		_setSubTitleRows();

		// tooltip event attach
		slui.attach.tooltip("#componentcontainer_" + containerId);
	},
	
	_setSubTitleRows= function(){
		var sTime = options.start_time;
		var eTime = options.end_time;
		
		if(options.strQuery != "") {
			m$.body.find(".rows-detail").text(
				"[" + _SL.formatDate(sTime, "HH:mm")
				+ "~" + _SL.formatDate(eTime, "HH:mm") +"]"
			);
		}else{
			m$.body.find(".rows-detail").hide();
		}
	},
	
	_createChart = function(data){
		var 
			lowCnt = config_param.low,
			midCnt = config_param.middle,
			highCnt = config_param.high,
			totalCnt = data.total,
			chartClass;
		
		if(totalCnt < lowCnt) 		chartClass = riskClass.ok;
		else if(totalCnt < midCnt) 	chartClass = riskClass.low;
		else if(totalCnt < highCnt)	chartClass = riskClass.middle;
		else 						chartClass = riskClass.high;
			
		m$.chtCntnr.removeClass().addClass(chartClass).html(totalCnt);
	},
	
	goSearchPopup = function(){
		var q = options.strQuery;
		var stime = options.start_time;
		var etime = options.end_time;
		
		var $form = $("<form>").attr({
			target : "logSearchWin_" + (new Date()).getTime(),
			action : urlLogSearch,
			method : "post"
		});

		$form
			.append( $("<input type='hidden' name='start_time'>").val(stime) )
			.append( $("<input type='hidden' name='end_time'>").val(etime) )
			.append( $("<input type='hidden' name='myfilter_id'>").val(config_param.myfilter_id) )
			.append( $("<input type='hidden' name='expert_keyword'>").val(q) )
			.append( $("<input type='hidden' name='template_id'>").val('popup') )
			.appendTo("body")
			.submit()
			.remove();
	}
	
	//dummy = {};
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		beforeSaveConfig : beforeSaveConfig,
		validateConfig  : validateConfig,
		afterSaveConfig : afterSaveConfig,
		showConfig      : showConfig
	};
}