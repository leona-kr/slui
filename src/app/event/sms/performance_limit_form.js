//# sourceURL=performance_limit_form.js
'use strict';
_SL.nmspc("sms").form = function(){

	var
	// Config 정의
	mCfg = {
		formId 		: '#formPerformLimit',
		urlSelect 	: gCONTEXT_PATH + "event/performance_limit_select.json",
		urlDelete 	: gCONTEXT_PATH + "event/performance_limit_delete.do",
		urlExist 	: gCONTEXT_PATH + "event/performance_limit_count.json",
		add : {
			action : gCONTEXT_PATH + "event/performance_limit_add.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event/performance_limit_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		thresholdId : $(mCfg.formId + ' [name=threshold_id]'),
		thresholdNm : $(mCfg.formId + ' [name=threshold_name]'),
		
		cpuLow : $(mCfg.formId + ' [name=cpu_low]'),
		cpuMedium : $(mCfg.formId + ' [name=cpu_medium]'),
		cpuHigh : $(mCfg.formId + ' [name=cpu_high]'),
		
		memLow : $(mCfg.formId + ' [name=mem_low]'),
		memMedium : $(mCfg.formId + ' [name=mem_medium]'),
		memHigh : $(mCfg.formId + ' [name=mem_high]'),
		
		ioMaxLow : $(mCfg.formId + ' [name=io_max_low]'),
		ioMaxMedium : $(mCfg.formId + ' [name=io_max_medium]'),
		ioMaxHigh : $(mCfg.formId + ' [name=io_max_high]'),
		
		ioAvgLow : $(mCfg.formId + ' [name=io_avg_low]'),
		ioAvgMedium : $(mCfg.formId + ' [name=io_avg_medium]'),
		ioAvgHigh : $(mCfg.formId + ' [name=io_avg_high]'),
		
		netMaxLow : $(mCfg.formId + ' [name=net_max_low]'),
		netMaxMedium : $(mCfg.formId + ' [name=net_max_medium]'),
		netMaxHigh : $(mCfg.formId + ' [name=net_max_high]'),
		
		netAvgLow : $(mCfg.formId + ' [name=net_avg_low]'),
		netAvgMedium : $(mCfg.formId + ' [name=net_avg_medium]'),
		netAvgHigh : $(mCfg.formId + ' [name=net_avg_high]')
	},

	// 현재 상태 변수
	mState = {
		isNew : m$.thresholdId.val() == "" ? true : false,
		mode : m$.thresholdId.val() == "" ? mCfg.add : mCfg.update,
		threshold : {}
	},
	
	init = function(){
	
		//이벤트 Binding
		bindEvent();
		
		// DOM 설정 
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		
		// 데이타 조회
		if(!mState.isNew) select();
	},

	getThreshold = function() {
		return mState.threshold;
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onExist);

	},
	
	select = function() {
		var
			thresholdIdVal = m$.thresholdId.val(),
			rqData = {'threshold_id': thresholdIdVal},
			
			callback = function(data){
				_SL.setDataToForm(data.data, m$.form);//기본정보
			};			
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	onSave = function(){
		if (!_SL.validate(m$.form)) return;
		
		if(!limitDataValid(m$.cpuLow.val(), m$.cpuMedium.val(), m$.cpuHigh.val(), 2)) return _alert("알맞지 않는  CPU 값입니다.");
		if(!limitDataValid(m$.memLow.val(), m$.memMedium.val(), m$.memHigh.val(), 3)) return _alert("알맞지 않는  Memory 값입니다.");
		if(!limitDataValid(m$.ioMaxLow.val(), m$.ioMaxMedium.val(), m$.ioMaxHigh.val(), 4)) return _alert("알맞지 않는  Disk Io 최대값입니다.");
		if(!limitDataValid(m$.ioAvgLow.val(), m$.ioAvgMedium.val(), m$.ioAvgHigh.val(), 5)) return _alert("알맞지 않는  Disk Io 평균값입니다.");
		if(!limitDataValid(m$.netMaxLow.val(), m$.netMaxMedium.val(), m$.netMaxHigh.val(), 6)) return _alert("알맞지 않는 Network 최대값입니다.");
		if(!limitDataValid(m$.netAvgLow.val(), m$.netAvgMedium.val(), m$.netAvgHigh.val(), 7)) return _alert("알맞지 않는  Network 평균값입니다.");

		var afterClose = $(this).data('after-close') == true ? true : false;
		$('body').requestData(mState.mode.action, _SL.serializeMap(m$.form), {
			callback : function(rsData, rsCd, rsMsg){
				
				if(rsCd == 'SUC_COM_0001' && rsData){ // 장비관리 성능임계치정보 selectBox에 Id넘겨주기 위해 추가
					mState.threshold.threshold_id = rsData;
					mState.threshold.threshold_name = m$.thresholdNm.val();
				}
				
				_alert(rsMsg, {
					onAgree : function(){
						onClose(afterClose);
					}
				});
			}
		});
	},
	
	limitDataValid = function(rowValue, midValue, highValue, trIdx){
		$("#formPerformLimit tbody tr td input").css("color", "");
		var bTrue = true;
		var rowVal = Number(rowValue);
		var midVal = Number(midValue);
		var highVal = Number(highValue);
		if((rowVal >= midVal) || (midVal >= highVal)){
			$("#formPerformLimit tbody tr:eq("+trIdx+") td input").css( "color", "red" );
			bTrue = false;
		}
		return bTrue;
	},
	
	onExist	= function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		$('body').requestData(mCfg.urlExist, {threshold_id:m$.thresholdId.val()}, {
			callback : function(rsData){
				if(rsData == true){
					onDelete(afterClose);
				}else{					
					_alert("사용중인 장비가 있어 삭제 할 수 없습니다.");
				}
			}
		});
	},
	
	onDelete = function(afterClose){
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){
				$('body').requestData(mCfg.urlDelete, {threshold_id:m$.thresholdId.val()}, {
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
	};
	
	return {
		init: init,
		getThreshold : getThreshold
	};

}();

$(function(){
	slapp.sms.form.init();
});