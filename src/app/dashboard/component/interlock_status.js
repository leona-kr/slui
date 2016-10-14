//# sourceURL=interlock_status.js

'use strict';

_SL.nmspc("slapp.component").interlock_status = function(id, configParam, componentTitle) {
	var
	containerId = id,
	
	$body		= $("#componentbody_" + containerId),
	$form		= $("#config_" + containerId + " form"),
	
	$searchForm = $body.find("[name=searchForm]"),
	$groupCd	= $form.find("[name=group_cd]"),
	$groupList	= $form.find("[name=group_list]"),

	urlEquipStatList = gCONTEXT_PATH + "management/equip_stat_list.html",
	/*urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",*/
	urlCodeMap		= gCONTEXT_PATH + "sysdata/comcode_map.json",
	urlCustInfo    = gCONTEXT_PATH + "component/urlCustInfo.json",
	urlSelect		= gCONTEXT_PATH + "component/interlock_status_eqp.json",
	urlEqpSelect		= gCONTEXT_PATH + "management/equip_stat_list.html",
	
	default_param = {group_cd : ""},
	
	config_param = configParam,
	component_title = componentTitle,
	
	load = function() {
		this.title = component_title; 
		this.config_param = config_param = $.extend({}, default_param, config_param);
		
		// DOM 생성
		if(!ComCodes.CS0011) {
			$("body").requestData(urlCodeMap, {code_type : 'CS0011'}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0011 = rsJson;
				/*_setGroupCds();*/
			}});
			
			/*$("body").requestData(urlCustInfo,{}, {callback : function(rsJson, rsCd, rsMsg) {
				ComCodes.CS0011 = rsJson;
				_setGroupCds();
			}});*/
			
		//}else{
			/*_setGroupCds();*/
		}
		
		// Bind Event
		$body
			.on("click", ".eqp-stat,.eqp-col,.eqp-total", function() {
				
				var winName = "equipWin_" + (new Date()).getTime();
				
				$searchForm.attr({
					action : urlEqpSelect,
					target : winName,
					method : "post"
				}).submit();
			});
		
		$form
			.on("click", ".btn-add", function(){			
				var val = $groupCd.find("option:selected").val();
				var text = $groupCd.find("option:selected").text();
			
				if(val == "") {
					_alert("기관을 선택하세요.");
					return;
				}
			
				if( $groupList.find("option").is( function() { return this.value == val; }) 	){
					_alert("동일한 기관이 존재합니다.");
					return;
				}
				
				$groupList.append( $('<option>').val(val).text(text) );
			})
			.on("click", ".btn-del", function(){
				$groupList.find(":selected").remove();
			});
		
		refresh();
	},
	
	refresh = function() {
		$("body").requestData(urlSelect, config_param, {callback : function(rsJson){
			$body.find(".eqp-stat").text(rsJson.result.succ_cnt).hide().fadeIn(1500);
			$body.find(".eqp-col").text(rsJson.result.collect_succ_cnt).hide().fadeIn(1500);
			$body.find(".eqp-total").text(rsJson.result.eqp_cnt).hide().fadeIn(1500);
			
			_setGroupCds(rsJson.group_cd_list.group_cd_list);
		}});
	},
	
	showConfig = function() {
		var sGroupList = config_param ? config_param.group_cd : [];
		
		$groupList.empty();
		var groupCdArr = sGroupList.split(",");
		
		for(var idx in groupCdArr){
			var id = groupCdArr[idx];
			if(id == null || id == "") continue;
			$groupList.append($('<option>').val(id).text(ComCodes.CS0011[id]));
		}
	},
	
	beforeSaveConfig = function() {
		var groupCdArr = [];
		var $groupListOption = $groupList.find("option");

		for(var idx = 0, len = $groupListOption.length; idx < len; idx++){
			groupCdArr.push( $groupListOption.eq(idx).val() );
		}
		config_param.group_cd = groupCdArr.join(",");
	},
	
	afterSaveConfig = function() {
		refresh();
	},
	
	_setGroupCds = function(group_cd_list) {
		$groupCd.html('<option value="">[선택하세요]</option>');
		
		for(var key in group_cd_list){
			$groupCd.append($('<option>').val(key).text(group_cd_list[key]));
			
		}
	}
	
	return {
		config_param	: config_param,
		component_title	: component_title,
		load			: load,
		refresh			: refresh,
		beforeSaveConfig : beforeSaveConfig,
		afterSaveConfig : afterSaveConfig,
		showConfig      : showConfig
	};
}