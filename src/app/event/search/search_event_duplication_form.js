//# sourceURL=search_event_duplication_form.js
'use strict';

_SL.nmspc("searchEventDuplication").form = function(){

	var
	// Config 정의
	mCfg = {
		formId : '#formSearchDuplication',
		urlSelect : gCONTEXT_PATH + "event/search_event_duplication.json",
		urlDuplInfo : gCONTEXT_PATH + "event/get_search_event_duplication_info.json",
		urlComCodeForm : gCONTEXT_PATH + 'sysdata/comcode_form.html',
		urlDelete : gCONTEXT_PATH + "event/search_event_duplication_delete.do",
		
		add : {
			action : gCONTEXT_PATH + "event/search_event_duplication_add.do",
			message : "등록 하시겠습니까?"
		},
		update : {
			action : gCONTEXT_PATH + "event/search_event_duplication_update.do",
			message : "수정 하시겠습니까?"
		}
	},
	
	// JQuery 객체 변수
	m$ = {
		form : $(mCfg.formId),
		seq : $(mCfg.formId + ' [name=seq]'),
		chk : $(mCfg.formId + ' [name=chk]'),
		rulesetId : $(mCfg.formId + ' [name=ruleset_id]'),
		
		timeSet : $(mCfg.formId + ' [name=timeSet]'),
		
		schStartDay : $(mCfg.formId + ' [name=schStartDay]'),
		schStartHour : $(mCfg.formId + ' [name=schStartHour]'),
		schStartMin : $(mCfg.formId + ' [name=schStartMin]'),
		
		schEndDay : $(mCfg.formId + ' [name=schEndDay]'),
		schEndHour : $(mCfg.formId + ' [name=schEndHour]'),
		schEndMin : $(mCfg.formId + ' [name=schEndMin]'),
		
		groupFieldSel : $(mCfg.formId + ' [name=group_field_sel]')
	},
	
	// 현재 상태 변수
	mState = {
		isNew : m$.chk.val() == "insert" ? true : false,
		mode : m$.chk.val() == "insert" ? mCfg.add : mCfg.update
	},
	
	
	init = function(){
		
		//이벤트 Binding
		bindEvent();
		
		// DOM 설정 Start
		if(mState.isNew) {
			m$.form.find(".btn-delete").hide();
		}
		// DOM 설정 End

		// 데이타 조회
		if(!mState.isNew) select();
		else getDupInfo();
		
	},
	
	bindEvent = function() {
		// SAVE
		m$.form.find('.btn-save').on('click', onSave);
		
		// DELETE
		m$.form.find('.btn-delete').on("click", onDelete);		
		
		// timeSet change 이벤트 설정
		m$.form.find("[name=timeSet]").change(function(){
			var setMin = this.value;

			if (setMin == 0) return;
					
			var endTime = _SL.formatDate.addMin(_SL.formatDate(), + setMin);
			m$.form.find("[name=schEndDay]").val(endTime.substring(0,8));
			m$.form.find("[name=schEndHour]").val(endTime.substring(8,10));
			m$.form.find("[name=schEndMin]").val(endTime.substring(10,12));
			
		});
		
		// Date,Time change 이벤트 설정
		m$.form.find("[name=schStartDay],[name=schStartHour],[name=schStartMin],[name=schEndDay],[name=schEndHour],[name=schEndMin]").change(function(){
			m$.form.find("[name=timeSet]").val(0);
			
		});
		
	},
	
	select = function() {
		var
			seq = m$.seq.val(),
			rqData = {'seq': seq},
			
			callback = function(data){
				_SL.setDataToForm(data, m$.form);
				if(data.group_field){
					var groupFieldArr = (data.group_field).split(",");
					
					for(var i in groupFieldArr){
						var grpFld = groupFieldArr[i];
						m$.groupFieldSel.append("<option value='" + grpFld + "'>" + gFieldCaptions[grpFld] + "(" + grpFld + ")</option>");
					}
				}
			};			
		
		$('body').requestData(mCfg.urlSelect, rqData, {callback : callback});
	},
	
	getDupInfo = function(){
		var
		seq = m$.seq.val(),
		rqData = {'event_seq': seq},
		
		callback = function(data){
			_SL.setDataToForm(data, m$.form);
			if(data.group_field){
				var groupFieldArr = (data.group_field).split(",");
				
				for(var i in groupFieldArr){
					var grpFld = groupFieldArr[i];
					m$.groupFieldSel.append("<option value='" + grpFld + "'>" + gFieldCaptions[grpFld] + "(" + grpFld + ")</option>");
				}
			}
		};
		
		$('body').requestData(mCfg.urlDuplInfo, rqData, {callback : callback});
	},
	
	onSave = function(){
		if (!_SL.validate(m$.form)) return;
		
		var sTime = m$.schStartDay.val() + m$.schStartHour.val() + m$.schStartMin.val();
		var eTime = m$.schEndDay.val() + m$.schEndHour.val() + m$.schEndMin.val();
			
		var diffTime = _SL.formatDate.diff(sTime, eTime);
			
		if(diffTime <= 0) 
		{
			alert("중복기간 종료시간이 시작시간보다 커야 합니다.");
			return;
		}
		m$.groupFieldSel.find("option").attr("selected", true);

		var afterClose = $(this).data('after-close') == true ? true : false;
		var groupFieldSel = m$.groupFieldSel.val() ? m$.groupFieldSel.val().join(",") : "";
		var rulesetId = m$.rulesetId.val();
		var param = $.extend(_SL.serializeMap(m$.form), {ruleset_id : rulesetId, group_field : groupFieldSel});
		
		var submit = function(){
			$('body').requestData(mState.mode.action, param , {
				callback : function(rsData, rsCd, rsMsg){
					_alert(rsMsg, {
						onAgree : function(){
							onClose(afterClose);
							if(mState.isNew) slapp.searchEvent.manager.refresh();
						}
					});
				}
			});
		};
		
		submit();
	},

	onDelete = function(){
		var afterClose = $(this).data('after-close') == true ? true : false;
		
		_confirm("삭제하시겠습니까?",{
			onAgree : function(){				
				var seq = m$.seq.val();
				
				$('body').requestData(mCfg.urlDelete, {seq:seq}, {
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
	
	_addCode = function($fld) {
		var data = slapp.comcode.form.getCode();
		$fld.append($("<option>").val(data.code_id)
								 .attr("selected", true)
								 .text(data.code_name));
	},
	
	onClose = function(afterClose){
		if(afterClose){
			m$.form.find("[data-layer-close=true]").click();
		}
	};

	return {
		init: init
	};

}();

$(function(){
	slapp.searchEventDuplication.form.init();
});