//# sourceURL=performance_limit_list.js
'use strict';
_SL.nmspc("sms").performanceList = function() {

	var
	
	onloadValue = {
			s_eqp_type_cd : '', 
			s_eqp_ip : '' 
	},
	
	// Config 정의
	mCfg = {
		gridId : '#gridPerformLimitList',
		formId : '#searchPerformLimitList',
		tableListId : '#performLimitTableList',
		urlList : gCONTEXT_PATH + 'event/performance_limit_list.json',
		urlForm : gCONTEXT_PATH + 'event/performance_limit_form.html',
		urlLoadEqpType : gCONTEXT_PATH + 'common/eqp_type_use_list.json',
		urlLoadEqp : gCONTEXT_PATH + 'common/equipment_list.json',
	//	urlView : gCONTEXT_PATH + 'event/performance_limit_view.html',
		urlAdd : gCONTEXT_PATH + "event/performance_limit_add.do",
		urlUpdate : gCONTEXT_PATH + "event/performance_limit_update.do",
		urlDelete : gCONTEXT_PATH + "event/performance_limit_delete.do"
	},
	
	// JQuery 객체 변수
	m$ = {
		grid : $(mCfg.gridId), 
		form : $(mCfg.formId),
		tableList : $(mCfg.tableListId + ' tbody')
	},
	
	init = function(){
		// 초기 화면 구성
		drawList();

		// 이벤트 Binding
		bindEvent();
		
		// 장비분류 change 이벤트 설정
		m$.form.find("[name=s_eqp_type_cd]").change(loadEqp);
		
		loadEqpType();
		
	},
	
	bindEvent = function() {
		var $btnAdd = m$.tableList.parent().siblings('.grid-bottom').find('.btn-add');
		m$.form.find('.form-submit').on('click',function(){
			if(m$.form.find('[name=s_eqp_ip]').val() == '' && m$.form.find('[name=s_eqp_type_cd]').val() != '') return _alert("장비IP를 선택하세요");
			refresh();
		});

		$btnAdd.off().on('click',function(){
			viewDetail(mCfg.urlForm);
		});
		
		m$.tableList.off().on('click','.btn-link',function(){
			viewDetail(mCfg.urlForm+"?threshold_id="+$(this).attr("data-key"));
			return false;
		});
	},

	drawList = function(){
		var params = $.extend({}, _SL.serializeMap(m$.form));
		$('body').requestData(mCfg.urlList, params, {
			callback : function(rsData, rsCd, rsMsg){
				if(!rsData) return;
				
				var list = rsData.limitList;
				var listLen = list.length;
				var $tBody = m$.tableList;
				$tBody.empty();
				
				if(listLen > 0){
				
					var trArr = [];
					
					for( var i = 0; i < listLen; i++){
						trArr[i] += "<tr><td rowspan='3'><a href='#' class='btn-link' data-key='"+list[i].threshold_id+"'>"+list[i].threshold_name+"</td>";
						trArr[i] += "<td><span class='label-success'>Low</span></td>";
						trArr[i] += "<td>"+list[i].cpu_low+"</td>";
						trArr[i] += "<td>"+list[i].mem_low+"</td>";
						trArr[i] += "<td>"+list[i].io_max_low+"</td>";
						trArr[i] += "<td>"+list[i].io_avg_low+"</td>";
						trArr[i] += "<td>"+list[i].net_max_low+"</td>";
						trArr[i] += "<td>"+list[i].net_avg_low+"</td></tr>";

						trArr[i] += "<tr><td><span class='label-attention'>Middle</span></td>";
						trArr[i] += "<td>"+list[i].cpu_medium+"</td>";
						trArr[i] += "<td>"+list[i].mem_medium+"</td>";
						trArr[i] += "<td>"+list[i].io_max_medium+"</td>";
						trArr[i] += "<td>"+list[i].io_avg_medium+"</td>";
						trArr[i] += "<td>"+list[i].net_max_medium+"</td>";
						trArr[i] += "<td>"+list[i].net_avg_medium+"</td></tr>";
						
						trArr[i] += "<tr><td><span class='label-danger'>High</span></td>";
						trArr[i] += "<td>"+list[i].cpu_high+"</td>";
						trArr[i] += "<td>"+list[i].mem_high+"</td>";
						trArr[i] += "<td>"+list[i].io_max_high+"</td>";
						trArr[i] += "<td>"+list[i].io_avg_high+"</td>";
						trArr[i] += "<td>"+list[i].net_max_high+"</td>";
						trArr[i] += "<td>"+list[i].net_avg_high+"</td></tr>";
					}
					$tBody.append(''+trArr.join(",")+'');
				}else{
					$tBody.append('<tr><td class="list-empty" colspan="8">There is no Search Result</td></tr>');
				}
			}
			
		});
		
	},

	refresh = function() {
		drawList();
	},

	viewDetail = function(url){
		var modal = new ModalPopup(url, {
			height: 420,
			onClose : function(){
				refresh();
			},
			/*onLoad : function(){
				
			},*/
			onUnload : function(){
				refresh();
			}
		});
	},
	
	loadEqpType = function(){
		$('body').requestData(mCfg.urlLoadEqpType, {}, {
			callback : function(rsData){
				console.log(rsData);
				var obj = m$.form.find('[name=s_eqp_type_cd]');
				
				$.each(rsData.eqp_type_list, function(){
					obj.append('<option value="'+this.eqp_type_cd+'">'+this.eqp_type_nm+'</option>');
				});
				
				if(onloadValue.s_eqp_type_cd != ''){
					obj.value = onloadValue.s_eqp_type_cd;
					onloadValue.s_eqp_type_cd = '';
					loadEqp();
				}
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
	},
	
	loadEqp = function(){
		var selValue = m$.form.find('[name=s_eqp_type_cd]').val();
		m$.form.find('[name=s_eqp_ip]').children().remove();
		m$.form.find('[name=s_eqp_ip]').html("<option value=''>[선택하세요]</option>");
		if(selValue == null) selValue = "";
		if(selValue == "") return;
		$('body').requestData(mCfg.urlLoadEqp, {s_eqp_type_cd : selValue}, {
			callback : function(rsData){
				var obj = m$.form.find('[name=s_eqp_ip]');
				$.each(rsData.eqp_list, function(){
					obj.append("<option value='"+this.eqp_ip+"'>"+this.eqp_nm + "(" + this.eqp_ip + ")</option>");
				});
				
				if(onloadValue.s_eqp_ip != ''){
					obj.value = onloadValue.s_eqp_ip;
					onloadValue.s_eqp_ip = '';
				}
				slui.attach.setTransformSelect(mCfg.formId);
			}
		});
		
	}
	
/*	deleteBlacklist = function(delList){
		//step1. 사용자 확인
		_confirm("삭제 하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {del_ip_list:delList}, {
					callback : function(rsData){
						refresh();
					}
				});
			}
		});
	},*/

	return {
		init: init
	};
}();


$(function(){
	slapp.sms.performanceList.init();
});